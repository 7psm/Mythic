// =============================================
// COMMAND HANDLERS
// =============================================
// Gestion de l'exécution des commandes slash

import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Gère la commande /status
 */
export async function handleStatusCommand(interaction, orderStatusConfig, notifyStatusChangeFn) {
  const orderNumber = interaction.options.getString('commande');
  const newStatus = interaction.options.getString('statut');

  await interaction.deferReply({ ephemeral: true });

  try {
    const ordersPath = join(__dirname, '..', '..', 'api', 'orders.json');
    const ordersData = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
    
    const orderIndex = ordersData.findIndex(o => o.orderNumber === orderNumber);
    
    if (orderIndex === -1) {
      await interaction.editReply('❌ Commande introuvable.');
      return;
    }

    const order = ordersData[orderIndex];
    const oldStatus = order.status || 'CONFIRMED';
    
    ordersData[orderIndex].status = newStatus;
    ordersData[orderIndex].lastStatusUpdate = new Date().toISOString();
    ordersData[orderIndex].statusUpdatedBy = interaction.user.tag;

    fs.writeFileSync(ordersPath, JSON.stringify(ordersData, null, 2));

    await notifyStatusChangeFn(ordersData[orderIndex], oldStatus, newStatus);

    const config = orderStatusConfig[newStatus];
    await interaction.editReply(
      `✅ **Statut mis à jour !**\n\n` +
      `**Commande:** ${orderNumber}\n` +
      `**Nouveau statut:** ${config.emoji} ${config.label}\n` +
      `**Client notifié:** ${order.discord || order.email}`
    );

  } catch (error) {
    console.error('❌ Erreur:', error);
    await interaction.editReply('❌ Erreur lors de la mise à jour.');
  }
}

/**
 * Gère la commande /order
 */
export async function handleOrderCommand(interaction, createDetailedOrderEmbedFn) {
  const orderNumber = interaction.options.getString('commande');

  await interaction.deferReply({ ephemeral: true });

  try {
    const ordersPath = join(__dirname, '..', '..', 'api', 'orders.json');
    const ordersData = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
    
    const order = ordersData.find(o => o.orderNumber === orderNumber);
    
    if (!order) {
      await interaction.editReply('❌ Commande introuvable.');
      return;
    }

    const embed = createDetailedOrderEmbedFn(order);
    await interaction.editReply({ embeds: [embed] });

  } catch (error) {
    console.error('❌ Erreur:', error);
    await interaction.editReply('❌ Erreur lors de la récupération.');
  }
}

/**
 * Gère la commande /orders
 */
export async function handleOrdersCommand(interaction, orderStatusConfig, calculateOrderTotalFn) {
  const filter = interaction.options.getString('filtre') || 'ALL';

  await interaction.deferReply({ ephemeral: true });

  try {
    const ordersPath = join(__dirname, '..', '..', 'api', 'orders.json');
    const ordersData = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
    
    let filtered = ordersData;
    
    if (filter === 'ACTIVE') {
      filtered = ordersData.filter(o => 
        ['CONFIRMED', 'PREPARING', 'SHIPPED'].includes(o.status || 'CONFIRMED')
      );
    } else if (filter === 'DELIVERED') {
      filtered = ordersData.filter(o => o.status === 'DELIVERED');
    }

    filtered = filtered.slice(-10).reverse();

    if (filtered.length === 0) {
      await interaction.editReply('🔭 Aucune commande trouvée.');
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle('📋 Liste des Commandes')
      .setColor(0xd4af37)
      .setDescription(
        filtered.map(o => {
          const config = orderStatusConfig[o.status || 'CONFIRMED'];
          const total = calculateOrderTotalFn(o);
          return `${config.emoji} **${o.orderNumber}** - €${total.toFixed(2)} - ${o.discord || o.email}`;
        }).join('\n')
      )
      .setFooter({ text: `Total: ${filtered.length} commande(s)` })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });

  } catch (error) {
    console.error('❌ Erreur:', error);
    await interaction.editReply('❌ Erreur lors de la récupération.');
  }
}

/**
 * Gère la commande /clearorders
 */
export async function handleClearOrdersCommand(interaction, orderStatusConfig, getPeriodLabelFn) {
  const period = interaction.options.getString('periode');
  const statusFilter = interaction.options.getString('statut') || 'ALL';

  await interaction.deferReply({ ephemeral: true });

  try {
    const ordersPath = join(__dirname, '..', '..', 'api', 'orders.json');
    
    if (!fs.existsSync(ordersPath)) {
      await interaction.editReply('🔭 Aucune commande à supprimer.');
      return;
    }

    const ordersData = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
    const now = new Date();
    let ordersToDelete = [];
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

      if (shouldDelete) {
        ordersToDelete.push(orderData);
      } else {
        ordersToKeep.push(orderData);
      }
    });

    if (ordersToDelete.length === 0) {
      await interaction.editReply('🔭 Aucune commande correspondante trouvée.');
      return;
    }

    const confirmEmbed = new EmbedBuilder()
      .setTitle('⚠️ Confirmation de Suppression')
      .setDescription(
        `Vous êtes sur le point de supprimer **${ordersToDelete.length} commande(s)**.\n\n` +
        `**Période:** ${getPeriodLabelFn(period)}\n` +
        `**Statut:** ${statusFilter === 'ALL' ? 'Tous' : orderStatusConfig[statusFilter]?.label || statusFilter}\n\n` +
        `⚠️ **Cette action est irréversible !**\n` +
        `💡 Utilisez \`/backup\` pour sauvegarder avant de supprimer.`
      )
      .setColor(0xe74c3c)
      .addFields({
        name: '📊 Statistiques',
        value: 
          `**À supprimer:** ${ordersToDelete.length}\n` +
          `**À conserver:** ${ordersToKeep.length}\n` +
          `**Total actuel:** ${ordersData.length}`,
        inline: false
      })
      .setTimestamp();

    const confirmButtons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`confirm_delete_${period}_${statusFilter}`)
          .setLabel('✅ Confirmer la suppression')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('cancel_delete')
          .setLabel('❌ Annuler')
          .setStyle(ButtonStyle.Secondary)
      );

    await interaction.editReply({
      embeds: [confirmEmbed],
      components: [confirmButtons]
    });

  } catch (error) {
    console.error('❌ Erreur suppression:', error);
    await interaction.editReply('❌ Erreur lors de la suppression.');
  }
}

/**
 * Gère la commande /backup
 */
export async function handleBackupCommand(interaction) {
  await interaction.deferReply({ ephemeral: true });

  try {
    const ordersPath = join(__dirname, '..', '..', 'api', 'orders.json');
    
    if (!fs.existsSync(ordersPath)) {
      await interaction.editReply('🔭 Aucune commande à sauvegarder.');
      return;
    }

    const ordersData = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = join(__dirname, '..', '..', 'api', `orders_backup_${timestamp}.json`);
    
    fs.writeFileSync(backupPath, JSON.stringify(ordersData, null, 2));

    const embed = new EmbedBuilder()
      .setTitle('💾 Sauvegarde Créée')
      .setDescription(
        `**${ordersData.length} commande(s)** sauvegardée(s) !\n\n` +
        `**Fichier:** \`orders_backup_${timestamp}.json\``
      )
      .setColor(0x3498db)
      .addFields({
        name: '📁 Emplacement',
        value: `\`${backupPath}\``,
        inline: false
      })
      .setFooter({ text: `Sauvegarde par ${interaction.user.tag}` })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });

    console.log(`💾 Sauvegarde créée par ${interaction.user.tag}: ${backupPath}`);

  } catch (error) {
    console.error('❌ Erreur backup:', error);
    await interaction.editReply('❌ Erreur lors de la sauvegarde.');
  }
}

/**
 * Gère la commande /checkaccess
 */
export async function handleCheckAccessCommand(interaction, shopRoleId, hasVendorRoleFn) {
  const hasAccess = hasVendorRoleFn(interaction);
  const member = interaction.member;
  
  const roles = member.roles.cache
    .filter(role => role.id !== interaction.guild.id)
    .map(role => `<@&${role.id}>`)
    .join(', ') || 'Aucun rôle';

  const embed = new EmbedBuilder()
    .setTitle('🔍 Vérification des Permissions')
    .setDescription(
      hasAccess 
        ? '✅ **Vous avez accès aux commandes du bot !**'
        : '❌ **Vous n\'avez pas accès aux commandes du bot.**'
    )
    .setColor(hasAccess ? 0x2ecc71 : 0xe74c3c)
    .setThumbnail(interaction.user.displayAvatarURL())
    .addFields(
      {
        name: '👤 Utilisateur',
        value: `${interaction.user.tag}\n\`${interaction.user.id}\``,
        inline: true
      },
      {
        name: '🎭 Rôles',
        value: roles,
        inline: false
      },
      {
        name: '🎯 Rôle Requis',
        value: `<@&${shopRoleId}>`,
        inline: true
      },
      {
        name: '🔓 Statut',
        value: hasAccess ? '✅ Autorisé' : '❌ Non autorisé',
        inline: true
      }
    )
    .setFooter({ 
      text: `MythicMarket`,
      iconURL: 'https://getmythic.netlify.app/public/logo.png'
    })
    .setTimestamp();

  if (!hasAccess) {
    embed.addFields({
      name: '💡 Comment obtenir l\'accès ?',
      value: 'Contactez un administrateur pour obtenir le rôle requis.',
      inline: false
    });
  }

  await interaction.reply({ embeds: [embed], ephemeral: true });
}