// =============================================
// BUTTON INTERACTION HANDLERS
// =============================================
// Gestion des interactions avec les boutons

import { EmbedBuilder } from 'discord.js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Gère les interactions avec les boutons
 */
export async function handleButtonInteraction(interaction, handlers) {
  const customId = interaction.customId;
  
  try {
    // Boutons de suppression (clearorders)
    if (customId.startsWith('confirm_delete_')) {
      await handleDeleteConfirmation(interaction, handlers.orderStatusConfig, handlers.getPeriodLabelFn);
      return;
    }
    
    if (customId === 'cancel_delete') {
      await interaction.update({
        content: '❌ **Suppression annulée.**',
        embeds: [],
        components: []
      });
      return;
    }
    
    // Boutons de commande client (track, cancel, delivered)
    const [action] = customId.split('_', 1);
    const fullOrderId = customId.substring(action.length + 1);
    
    await interaction.deferReply({ ephemeral: true });

    switch(action) {
      case 'track':
        await handleTrackOrder(interaction, fullOrderId, handlers.createDetailedOrderEmbedFn);
        break;
      case 'cancel':
        await handleCancelRequest(interaction, fullOrderId, handlers.notifyVendorCancellationRequestFn);
        break;
      case 'delivered':
        await handleDeliveryConfirmation(interaction, fullOrderId, handlers.notifyVendorDeliveryConfirmedFn);
        break;
      default:
        await interaction.editReply('❌ Action non reconnue.');
    }
  } catch (error) {
    console.error('❌ Erreur interaction bouton:', error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ 
        content: '❌ Une erreur est survenue.', 
        ephemeral: true 
      }).catch(() => {});
    } else {
      await interaction.editReply('❌ Une erreur est survenue.').catch(() => {});
    }
  }
}

/**
 * Gère la confirmation de suppression des commandes
 */
async function handleDeleteConfirmation(interaction, orderStatusConfig, getPeriodLabelFn) {
  const customId = interaction.customId;
  const parts = customId.replace('confirm_delete_', '').split('_');
  const period = parts[0];
  const statusFilter = parts[1];

  try {
    const ordersPath = join(__dirname, '..', 'orders.json');
    const ordersData = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
    const now = new Date();
    let ordersToKeep = [];

    ordersData.forEach(orderData => {
      const orderDate = new Date(orderData.createdAt || orderData.orderDate);
      const diffMs = now - orderDate;
      const diffHours = diffMs / (1000 * 60 * 60);
      const diffDays = diffHours / 24;
      
      let shouldDelete = false;

      switch(period) {
        case '24h':
          shouldDelete = diffHours < 24;
          break;
        case '1week':
          shouldDelete = diffDays > 7;
          break;
        case '1month':
          shouldDelete = diffDays > 30;
          break;
        case 'all':
          shouldDelete = true;
          break;
      }

      if (shouldDelete && statusFilter !== 'ALL') {
        shouldDelete = (orderData.status || 'CONFIRMED') === statusFilter;
      }

      if (!shouldDelete) {
        ordersToKeep.push(orderData);
      }
    });

    const deletedCount = ordersData.length - ordersToKeep.length;

    fs.writeFileSync(ordersPath, JSON.stringify(ordersToKeep, null, 2));

    const successEmbed = new EmbedBuilder()
      .setTitle('✅ Suppression Effectuée')
      .setDescription(
        `**${deletedCount} commande(s)** supprimée(s) avec succès !\n\n` +
        `**Commandes restantes:** ${ordersToKeep.length}`
      )
      .setColor(0x2ecc71)
      .addFields({
        name: '📋 Détails',
        value: 
          `**Période:** ${getPeriodLabelFn(period)}\n` +
          `**Statut filtré:** ${statusFilter === 'ALL' ? 'Tous' : orderStatusConfig[statusFilter]?.label}\n` +
          `**Par:** ${interaction.user.tag}`,
        inline: false
      })
      .setTimestamp();

    await interaction.update({
      embeds: [successEmbed],
      components: []
    });

    console.log(`🗑️ ${deletedCount} commande(s) supprimée(s) par ${interaction.user.tag}`);

  } catch (error) {
    console.error('❌ Erreur suppression:', error);
    await interaction.update({
      content: '❌ Erreur lors de la suppression.',
      embeds: [],
      components: []
    });
  }
}

/**
 * Gère le suivi de commande
 */
async function handleTrackOrder(interaction, orderId, createDetailedOrderEmbedFn) {
  try {
    const ordersPath = join(__dirname, '..', 'orders.json');
    
    if (!fs.existsSync(ordersPath)) {
      await interaction.editReply({
        content: '❌ **Aucune commande trouvée**\n\nLa base de données est vide.',
        ephemeral: true
      });
      return;
    }

    const ordersData = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
    
    const order = ordersData.find(o => {
      const orderNum = o.orderNumber?.toString() || '';
      const searchId = orderId.toString();
      
      return (
        orderNum === searchId ||
        orderNum.includes(searchId) ||
        searchId.includes(orderNum) ||
        o.id?.toString() === searchId
      );
    });
    
    if (order) {
      const embed = createDetailedOrderEmbedFn(order);
      await interaction.editReply({ 
        embeds: [embed],
        ephemeral: true 
      });
    } else {
      const availableOrders = ordersData
        .slice(-5)
        .map(o => `• \`${o.orderNumber}\``)
        .join('\n');

      await interaction.editReply({
        content: 
          `❌ **Commande introuvable**\n\n` +
          `Numéro recherché: \`${orderId}\`\n\n` +
          `**Dernières commandes disponibles:**\n${availableOrders}\n\n` +
          `💡 Contactez le support si le problème persiste.`,
        ephemeral: true
      });
    }
  } catch (error) {
    console.error('❌ Erreur track:', error);
    await interaction.editReply({
      content: '❌ **Erreur technique**\n\nImpossible de récupérer la commande.',
      ephemeral: true
    });
  }
}

/**
 * Gère la demande d'annulation
 */
async function handleCancelRequest(interaction, orderId, notifyVendorCancellationRequestFn) {
  try {
    const ordersPath = join(__dirname, '..', 'orders.json');
    const ordersData = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
    
    const order = ordersData.find(o => 
      o.orderNumber === orderId || 
      o.id?.toString() === orderId
    );
    
    if (order) {
      await notifyVendorCancellationRequestFn(orderId, interaction.user.tag);
      
      await interaction.editReply(
        '✅ **Demande d\'annulation envoyée**\n\n' +
        'Votre demande a été transmise à notre équipe.\n' +
        'Nous vous contacterons rapidement.'
      );
    } else {
      await interaction.editReply('❌ Commande introuvable.');
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
    await interaction.editReply('❌ Erreur.');
  }
}

/**
 * Gère la confirmation de livraison
 */
async function handleDeliveryConfirmation(interaction, orderId, notifyVendorDeliveryConfirmedFn) {
  try {
    const ordersPath = join(__dirname, '..', 'orders.json');
    const ordersData = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
    
    const orderIndex = ordersData.findIndex(o => 
      o.orderNumber === orderId || 
      o.id?.toString() === orderId
    );
    
    if (orderIndex !== -1) {
      ordersData[orderIndex].status = 'DELIVERED';
      ordersData[orderIndex].deliveredAt = new Date().toISOString();
      ordersData[orderIndex].deliveryConfirmedBy = interaction.user.tag;
      
      fs.writeFileSync(ordersPath, JSON.stringify(ordersData, null, 2));
      
      await interaction.editReply(
        '✅ **Merci d\'avoir confirmé votre commande !**\n' +
        'Nous espérons que tout est parfait !'
      );
      
      await notifyVendorDeliveryConfirmedFn(ordersData[orderIndex].orderNumber);
    } else {
      await interaction.editReply('❌ Commande introuvable.');
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
    await interaction.editReply('❌ Erreur.');
  }
}