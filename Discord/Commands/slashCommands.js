// =============================================
//        SLASH COMMANDS DEFINITIONS
// =============================================
// Définitions de toutes les commandes slash

import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

/**
 * Définit toutes les commandes slash disponibles
 * @returns {Array} Tableau des commandes slash
 */
export function getSlashCommands() {
  return [
    // Commande /status - Changer le statut d'une commande
    new SlashCommandBuilder()
      .setName('status')
      .setDescription('Changer le statut d\'une commande')
      .addStringOption(option =>
        option.setName('commande')
          .setDescription('Numéro de commande (ex: PM-123456-7890)')
          .setRequired(true))
      .addStringOption(option =>
        option.setName('statut')
          .setDescription('Nouveau statut')
          .setRequired(true)
          .addChoices(
            { name: '✅ Confirmée', value: 'CONFIRMED' },
            { name: '📦 En préparation', value: 'PREPARING' },
            { name: '🚚 Expédiée', value: 'SHIPPED' },
            { name: '🎉 Livrée', value: 'DELIVERED' },
            { name: '❌ Annulée', value: 'CANCELLED' }
          ))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
      .setDMPermission(false),

    // Commande /order - Voir les détails d'une commande
    new SlashCommandBuilder()
      .setName('order')
      .setDescription('Voir les détails d\'une commande')
      .addStringOption(option =>
        option.setName('commande')
          .setDescription('Numéro de commande')
          .setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
      .setDMPermission(false),

    // Commande /orders - Liste des commandes récentes
    new SlashCommandBuilder()
      .setName('orders')
      .setDescription('Liste des commandes récentes')
      .addStringOption(option =>
        option.setName('filtre')
          .setDescription('Filtrer par statut')
          .addChoices(
            { name: 'Toutes', value: 'ALL' },
            { name: 'En cours', value: 'ACTIVE' },
            { name: 'Livrées', value: 'DELIVERED' }
          ))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
      .setDMPermission(false),

    // Commande /clearorders - Supprimer l'historique des commandes
    new SlashCommandBuilder()
      .setName('clearorders')
      .setDescription('Supprimer l\'historique des commandes')
      .addStringOption(option =>
        option.setName('periode')
          .setDescription('Période à supprimer')
          .setRequired(true)
          .addChoices(
            { name: '🕐 Moins de 24h', value: '24h' },
            { name: '📅 Plus d\'une semaine', value: '1week' },
            { name: '📆 Plus d\'un mois', value: '1month' },
            { name: '🗑️ Toutes les commandes', value: 'all' }
          ))
      .addStringOption(option =>
        option.setName('statut')
          .setDescription('Filtrer par statut (optionnel)')
          .setRequired(false)
          .addChoices(
            { name: 'Tous les statuts', value: 'ALL' },
            { name: '✅ Confirmées', value: 'CONFIRMED' },
            { name: '📦 En préparation', value: 'PREPARING' },
            { name: '🚚 Expédiées', value: 'SHIPPED' },
            { name: '🎉 Livrées', value: 'DELIVERED' },
            { name: '❌ Annulées', value: 'CANCELLED' }
          ))
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
      .setDMPermission(false),

    // Commande /backup - Sauvegarder l'historique des commandes
    new SlashCommandBuilder()
      .setName('backup')
      .setDescription('Sauvegarder l\'historique des commandes')
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
      .setDMPermission(false),

    // Commande /checkaccess - Vérifier ses permissions
    new SlashCommandBuilder()
      .setName('checkaccess')
      .setDescription('Vérifier ses permissions')
      .setDMPermission(false)
  ];
}

/**
 * Enregistre les commandes slash sur le serveur Discord
 * @param {Client} bot - Instance du bot Discord
 * @param {string} guildId - ID du serveur Discord
 */
export async function registerSlashCommands(bot, guildId) {
  if (!bot || !guildId) {
    console.error('❌ Bot ou guildId manquant pour enregistrer les commandes');
    return;
  }

  try {
    const commands = getSlashCommands();
    const guild = await bot.guilds.fetch(guildId);
    await guild.commands.set(commands);
    console.log('✅ Commandes slash enregistrées avec sécurité');
  } catch (error) {
    console.error('❌ Erreur enregistrement commandes:', error);
  }
}

/**
 * Rafraîchit les commandes slash (supprime puis réenregistre)
 * @param {Client} bot - Instance du bot Discord
 * @param {string} guildId - ID du serveur Discord
 */
export async function refreshSlashCommands(bot, guildId) {
  if (!bot || !guildId) {
    console.error('❌ Bot ou guildId manquant pour rafraîchir les commandes');
    return;
  }
  
  try {
    console.log('🔄 Suppression des anciennes commandes...');
    const guild = await bot.guilds.fetch(guildId);
    await guild.commands.set([]);
    
    console.log('🔄 Enregistrement des nouvelles commandes...');
    await registerSlashCommands(bot, guildId);
    console.log('✅ Commandes rafraîchies !');
  } catch (error) {
    console.error('❌ Erreur refresh:', error);
  }
}