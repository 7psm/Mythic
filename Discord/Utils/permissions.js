// =============================================
// PERMISSIONS SYSTEM
// =============================================
// Gestion des permissions et vérifications d'accès

import { PermissionFlagsBits } from 'discord.js';
import { createAccessDeniedEmbed } from './embedCreators.js';

/**
 * Vérifie si un utilisateur a le rôle vendeur ou est administrateur
 * @param {Interaction} interaction - Interaction Discord
 * @param {string} shopRoleId - ID du rôle vendeur requis
 * @returns {boolean} True si l'utilisateur a accès
 */
export function hasVendorRole(interaction, shopRoleId) {
  const member = interaction.member;
  
  if (!member) {
    return false;
  }

  // Vérifier si l'utilisateur est administrateur (bypass)
  if (member.permissions.has(PermissionFlagsBits.Administrator)) {
    return true;
  }

  // Vérifier si l'utilisateur a le rôle spécifique
  return member.roles.cache.has(shopRoleId);
}

/**
 * Gère le refus d'accès à une commande
 * @param {Interaction} interaction - Interaction Discord
 * @param {string} shopRoleId - ID du rôle requis
 * @param {string} ordersChannelId - ID du salon pour logger les tentatives
 * @param {Client} bot - Instance du bot (optionnel pour le log)
 * @returns {Promise<void>}
 */
export async function handleAccessDenied(interaction, shopRoleId, ordersChannelId = null, bot = null) {
  const { commandName } = interaction;
  
  const deniedEmbed = createAccessDeniedEmbed(interaction, shopRoleId);

  await interaction.reply({ 
    embeds: [deniedEmbed],
    ephemeral: true 
  });

  // Log de la tentative
  console.log(`🔒 Tentative d'accès refusée: ${interaction.user.tag} (${interaction.user.id}) - Commande: /${commandName}`);
  
  // Optionnel : Notifier dans le salon #orders
  if (ordersChannelId && bot) {
    try {
      const channel = await bot.channels.fetch(ordersChannelId);
      const { EmbedBuilder } = await import('discord.js');
      
      const logEmbed = new EmbedBuilder()
        .setTitle('⚠️ Tentative d\'Accès Non Autorisée')
        .setDescription(
          `**Utilisateur:** ${interaction.user.tag} (${interaction.user})\n` +
          `**Commande:** \`/${commandName}\`\n` +
          `**Salon:** ${interaction.channel}\n` +
          `**Date:** <t:${Math.floor(Date.now() / 1000)}:F>`
        )
        .setColor(0xff9900)
        .setThumbnail(interaction.user.displayAvatarURL())
        .setTimestamp();

      await channel.send({ embeds: [logEmbed] });
    } catch (error) {
      console.error('❌ Erreur log sécurité:', error);
    }
  }
}

/**
 * Middleware pour vérifier les permissions avant d'exécuter une commande
 * @param {Interaction} interaction - Interaction Discord
 * @param {string} shopRoleId - ID du rôle requis
 * @param {Function} commandHandler - Fonction à exécuter si autorisé
 * @param {string} ordersChannelId - ID du salon pour logger
 * @param {Client} bot - Instance du bot
 * @returns {Promise<boolean>} True si autorisé et commande exécutée
 */
export async function checkPermissionsAndExecute(interaction, shopRoleId, commandHandler, ordersChannelId = null, bot = null) {
  if (!hasVendorRole(interaction, shopRoleId)) {
    await handleAccessDenied(interaction, shopRoleId, ordersChannelId, bot);
    return false;
  }

  try {
    await commandHandler(interaction);
    return true;
  } catch (error) {
    console.error('❌ Erreur exécution commande:', error);
    
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ 
        content: '❌ Une erreur est survenue lors de l\'exécution de la commande.', 
        ephemeral: true 
      }).catch(() => {});
    } else {
      await interaction.editReply('❌ Une erreur est survenue.').catch(() => {});
    }
    
    return false;
  }
}

/**
 * Vérifie si un utilisateur a une permission spécifique
 * @param {Interaction} interaction - Interaction Discord
 * @param {bigint} permission - Permission à vérifier (ex: PermissionFlagsBits.Administrator)
 * @returns {boolean} True si l'utilisateur a la permission
 */
export function hasPermission(interaction, permission) {
  const member = interaction.member;
  
  if (!member) {
    return false;
  }

  return member.permissions.has(permission);
}

/**
 * Obtient la liste des rôles d'un utilisateur (formatée pour Discord)
 * @param {Interaction} interaction - Interaction Discord
 * @returns {string} Liste des rôles formatée
 */
export function getUserRoles(interaction) {
  const member = interaction.member;
  
  if (!member) {
    return 'Aucun rôle';
  }

  const roles = member.roles.cache
    .filter(role => role.id !== interaction.guild.id) // Exclure @everyone
    .map(role => `<@&${role.id}>`)
    .join(', ');

  return roles || 'Aucun rôle';
}

/**
 * Vérifie si un utilisateur peut gérer les commandes (admin ou rôle vendeur)
 * @param {Interaction} interaction - Interaction Discord
 * @param {string} shopRoleId - ID du rôle vendeur
 * @returns {Object} { canManage, reason }
 */
export function canManageOrders(interaction, shopRoleId) {
  const member = interaction.member;
  
  if (!member) {
    return {
      canManage: false,
      reason: 'Membre introuvable'
    };
  }

  // Administrateur = accès total
  if (member.permissions.has(PermissionFlagsBits.Administrator)) {
    return {
      canManage: true,
      reason: 'Administrateur'
    };
  }

  // Rôle vendeur = accès commandes
  if (member.roles.cache.has(shopRoleId)) {
    return {
      canManage: true,
      reason: 'Rôle vendeur'
    };
  }

  return {
    canManage: false,
    reason: 'Permissions insuffisantes'
  };
}

/**
 * Log une action sensible dans le salon approprié
 * @param {Client} bot - Instance du bot
 * @param {string} channelId - ID du salon de log
 * @param {Object} logData - Données à logger
 * @returns {Promise<void>}
 */
export async function logSensitiveAction(bot, channelId, logData) {
  if (!bot || !channelId) return;

  const { action, user, details, color = 0x3498db } = logData;

  try {
    const channel = await bot.channels.fetch(channelId);
    const { EmbedBuilder } = await import('discord.js');
    
    const logEmbed = new EmbedBuilder()
      .setTitle(`📝 ${action}`)
      .setDescription(details)
      .setColor(color)
      .setFooter({ 
        text: `Par ${user.tag}`,
        iconURL: user.displayAvatarURL()
      })
      .setTimestamp();

    await channel.send({ embeds: [logEmbed] });
  } catch (error) {
    console.error('❌ Erreur log action:', error);
  }
}