// =============================================
// COMMAND HANDLERS - SYSTÈME MODULAIRE
// =============================================
// Gestionnaire d'exécution des commandes modulaires

/**
 * Exécute une commande depuis les modules
 * @param {Interaction} interaction - Interaction Discord
 * @param {Map} commands - Map des commandes chargées
 * @param {Object} context - Contexte à passer aux commandes
 * @returns {Promise<boolean>} True si la commande a été exécutée
 */
export async function executeCommand(interaction, commands, context) {
  const { commandName } = interaction;
  
  // Récupère la commande
  const command = commands.get(commandName);
  
  if (!command) {
    console.warn(`⚠️ Commande inconnue: ${commandName}`);
    await interaction.reply({
      content: '❌ Commande non reconnue.',
      ephemeral: true
    });
    return false;
  }

  try {
    // Vérifie si la commande nécessite le rôle vendeur
    if (command.requiresVendorRole && !context.hasVendorRole(interaction)) {
      await context.handleAccessDenied(
        interaction,
        context.shopRoleId,
        context.ordersChannelId,
        context.bot
      );
      return false;
    }

    // Exécute la commande avec le contexte
    await command.execute(interaction, context);
    return true;

  } catch (error) {
    console.error(`❌ Erreur exécution commande ${commandName}:`, error);
    
    const errorMessage = '❌ Une erreur est survenue lors de l\'exécution de la commande.';
    
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ 
        content: errorMessage, 
        ephemeral: true 
      }).catch(() => {});
    } else {
      await interaction.editReply(errorMessage).catch(() => {});
    }
    
    return false;
  }
}

/**
 * Liste toutes les commandes disponibles
 * @param {Map} commands - Map des commandes chargées
 * @returns {Array} Liste des noms de commandes
 */
export function listCommands(commands) {
  return Array.from(commands.keys());
}

/**
 * Obtient les informations d'une commande
 * @param {Map} commands - Map des commandes chargées
 * @param {string} commandName - Nom de la commande
 * @returns {Object|null} Informations de la commande
 */
export function getCommandInfo(commands, commandName) {
  const command = commands.get(commandName);
  
  if (!command) return null;
  
  return {
    name: command.data.name,
    description: command.data.description,
    requiresVendorRole: command.requiresVendorRole || false,
    options: command.data.options || []
  };
}