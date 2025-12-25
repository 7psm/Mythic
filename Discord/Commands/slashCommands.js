// =============================================
// SLASH COMMANDS - SYSTÈME MODULAIRE
// =============================================
// Enregistrement des commandes slash depuis les modules

import { loadCommands, getCommandData } from './commandLoader.js';

/**
 * Enregistre les commandes slash sur le serveur Discord
 * @param {Client} bot - Instance du bot Discord
 * @param {string} guildId - ID du serveur Discord
 * @returns {Promise<Map>} Map des commandes chargées
 */
export async function registerSlashCommands(bot, guildId) {
  if (!bot || !guildId) {
    console.error('❌ Bot ou guildId manquant pour enregistrer les commandes');
    return null;
  }

  try {
    console.log('📦 Chargement des commandes...');
    
    // Charge toutes les commandes depuis les dossiers
    const commands = await loadCommands();
    
    // Récupère les définitions pour Discord
    const commandData = getCommandData(commands);
    
    // Enregistre sur le serveur
    const guild = await bot.guilds.fetch(guildId);
    await guild.commands.set(commandData);
    
    return commands;
  } catch (error) {
    console.error('❌ Erreur enregistrement commandes:', error);
    return null;
  }
}

/**
 * Rafraîchit les commandes slash (supprime puis réenregistre)
 * @param {Client} bot - Instance du bot Discord
 * @param {string} guildId - ID du serveur Discord
 * @returns {Promise<Map>} Map des commandes chargées
 */
export async function refreshSlashCommands(bot, guildId) {
  if (!bot || !guildId) {
    console.error('❌ Bot ou guildId manquant pour rafraîchir les commandes');
    return null;
  }
  
  try {
    const commands = await registerSlashCommands(bot, guildId);
    console.log('✅ Commandes rafraîchies !');
    return commands;
  } catch (error) {
    console.error('❌ Erreur refresh:', error);
    return null;
  }
}