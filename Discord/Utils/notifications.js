// =============================================
// NOTIFICATION SYSTEM
// =============================================
// Gestion des notifications Discord (vendeur et client)

import fetch from 'node-fetch';
import {
  createOrderEmbed,
  createStatusChangeEmbed,
  createCancellationRequestEmbed,
  createDeliveryConfirmationEmbed
} from './embedCreators.js';

/**
 * Trouve un utilisateur Discord par son identifiant ou username
 * @param {Client} bot - Instance du bot Discord
 * @param {string} identifier - ID ou username de l'utilisateur
 * @param {string} guildId - ID du serveur Discord
 * @returns {Promise<User|null>} Utilisateur trouvé ou null
 */
export async function findUser(bot, identifier, guildId) {
  if (!bot) return null;

  try {
    // Si c'est un ID Discord (chiffres uniquement)
    if (/^\d+$/.test(identifier)) {
      return await bot.users.fetch(identifier);
    }

    // Sinon chercher par username/tag
    const guild = await bot.guilds.fetch(guildId);
    const members = await guild.members.fetch();
    
    const member = members.find(m => 
      m.user.username.toLowerCase() === identifier.toLowerCase() ||
      m.user.tag.toLowerCase() === identifier.toLowerCase()
    );

    return member ? member.user : null;
    
  } catch (error) {
    console.error('❌ Erreur recherche utilisateur:', error);
    return null;
  }
}

/**
 * Notifie le vendeur d'une nouvelle commande
 * @param {Object} params - Paramètres de notification
 * @returns {Promise<Object>} Résultat de l'envoi
 */
export async function notifyVendor(params) {
  const {
    bot,
    orderData,
    ordersChannelId,
    shopRoleId,
    webhookUrl,
    orderStatusConfig
  } = params;

  const results = {
    channel: { success: false }
  };

  // Envoi dans le salon #orders
  if (bot && ordersChannelId) {
    try {
      const channel = await bot.channels.fetch(ordersChannelId);
      
      if (channel) {
        const { embed } = createOrderEmbed(orderData, orderStatusConfig, true, false);
        
        await channel.send({
          content: `<@&${shopRoleId}> **Nouvelle commande de ${orderData.discord || 'Non renseigné'} !**`,
          embeds: [embed]
        });

        console.log('✅ Notification salon #orders envoyée');
        results.channel = { success: true };
      }
    } catch (error) {
      console.error('❌ Erreur notification salon:', error);
      results.channel = { success: false, error: error.message };
    }
  }

  // Fallback webhook si le salon a échoué
  if (!results.channel.success && webhookUrl) {
    try {
      const { embed } = createOrderEmbed(orderData, orderStatusConfig, true, false);
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'MythicMarket Bot',
          avatar_url: 'https://getmythic.netlify.app/public/logo.png',
          content: `<@&${shopRoleId}> 🎉 **Nouvelle commande !**`,
          embeds: [embed.toJSON()]
        })
      });

      if (response.ok) {
        console.log('✅ Notification webhook envoyée');
        results.channel = { success: true };
      }
    } catch (error) {
      console.error('❌ Erreur webhook:', error);
    }
  }

  return results;
}

/**
 * Notifie le client de sa commande
 * @param {Object} params - Paramètres de notification
 * @returns {Promise<Object>} Résultat de l'envoi
 */
export async function notifyClient(params) {
  const {
    bot,
    orderData,
    guildId,
    orderStatusConfig
  } = params;

  if (!bot) {
    return { success: false, error: 'Bot non configuré' };
  }

  if (!orderData.discord) {
    return { success: false, error: 'Pas de Discord client fourni' };
  }

  try {
    const client = await findUser(bot, orderData.discord, guildId);
    
    if (!client) {
      console.warn('⚠️ Utilisateur Discord introuvable:', orderData.discord);
      return { success: false, error: 'Utilisateur non trouvé sur le serveur' };
    }

    const { embed, buttons } = createOrderEmbed(orderData, orderStatusConfig, false, true);

    const messageOptions = {
      content: '✅ **Merci pour votre commande !**',
      embeds: [embed]
    };

    if (buttons) {
      messageOptions.components = [buttons];
    }

    await client.send(messageOptions);

    console.log('✅ Confirmation client envoyée à:', client.tag);
    return { success: true, sentTo: client.tag };
    
  } catch (error) {
    console.error('❌ Erreur notification client:', error);
    
    if (error.code === 50007) {
      return { 
        success: false, 
        error: 'Le client a désactivé les messages privés' 
      };
    }
    
    return { success: false, error: error.message };
  }
}

/**
 * Envoie toutes les notifications pour une commande
 * @param {Object} params - Paramètres de notification
 * @returns {Promise<Object>} Résultats des notifications
 */
export async function sendOrderNotifications(params) {
  const { orderData } = params;
  
  console.log('📤 Envoi des notifications pour commande:', orderData.orderNumber);

  if (!orderData.status) {
    orderData.status = 'CONFIRMED';
  }

  const results = {
    vendor: await notifyVendor(params),
    client: await notifyClient(params),
    timestamp: new Date().toISOString()
  };

  console.log('📊 Résumé des notifications:');
  console.log('  - Salon #orders:', results.vendor?.channel?.success ? '✅' : '❌');
  console.log('  - DM client:', results.client?.success ? '✅' : '❌');

  return results;
}

/**
 * Notifie le client d'un changement de statut
 * @param {Object} params - Paramètres de notification
 * @returns {Promise<Object>} Résultat de l'envoi
 */
export async function notifyStatusChange(params) {
  const {
    bot,
    orderData,
    oldStatus,
    newStatus,
    guildId,
    orderStatusConfig
  } = params;

  if (!bot || !orderData.discord) {
    return { success: false, error: 'Bot non configuré ou pas de Discord' };
  }

  try {
    const client = await findUser(bot, orderData.discord, guildId);
    if (!client) {
      return { success: false, error: 'Client introuvable' };
    }

    const { embed, content } = createStatusChangeEmbed(orderData, oldStatus, newStatus, orderStatusConfig);

    await client.send({
      content,
      embeds: [embed]
    });

    console.log('✅ Notification de changement de statut envoyée à:', client.tag);
    return { success: true, sentTo: client.tag };

  } catch (error) {
    console.error('❌ Erreur notification changement statut:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Notifie le vendeur d'une demande d'annulation
 * @param {Object} params - Paramètres de notification
 * @returns {Promise<void>}
 */
export async function notifyVendorCancellationRequest(params) {
  const {
    bot,
    orderId,
    requestedBy,
    ordersChannelId,
    shopRoleId
  } = params;

  if (!bot || !ordersChannelId) return;

  try {
    const channel = await bot.channels.fetch(ordersChannelId);
    const embed = createCancellationRequestEmbed(orderId, requestedBy);

    await channel.send({
      content: `<@&${shopRoleId}> ⚠️ Demande d'annulation`,
      embeds: [embed]
    });

    console.log('✅ Notification annulation envoyée au vendeur');
  } catch (error) {
    console.error('❌ Erreur notification annulation:', error);
  }
}

/**
 * Notifie le vendeur d'une confirmation de livraison
 * @param {Object} params - Paramètres de notification
 * @returns {Promise<void>}
 */
export async function notifyVendorDeliveryConfirmed(params) {
  const {
    bot,
    orderId,
    ordersChannelId
  } = params;

  if (!bot || !ordersChannelId) return;

  try {
    const channel = await bot.channels.fetch(ordersChannelId);
    const embed = createDeliveryConfirmationEmbed(orderId);

    await channel.send({ embeds: [embed] });

    console.log('✅ Confirmation de livraison envoyée au vendeur');
  } catch (error) {
    console.error('❌ Erreur notification livraison:', error);
  }
}