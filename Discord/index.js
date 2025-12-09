// =============================================
// DISCORD BOT SERVICE - POINT D'ENTRÉE
// =============================================

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

import { Client, GatewayIntentBits, Events } from 'discord.js';


import { registerSlashCommands, refreshSlashCommands } from './Commands/slashCommands.js';
import {
  handleStatusCommand,
  handleOrderCommand,
  handleOrdersCommand,
  handleClearOrdersCommand,
  handleBackupCommand,
  handleCheckAccessCommand
} from './Handlers/commandHandlers.js'; 

import { handleButtonInteraction } from './Handlers/buttonHandlers.js';
import {
  createDetailedOrderEmbed,
  createOrderEmbed
} from './Utils/embedCreators.js';
import {
  sendOrderNotifications,
  notifyStatusChange,
  notifyVendorCancellationRequest,
  notifyVendorDeliveryConfirmed
} from './Utils/notifications.js';
import {
  hasVendorRole,
  handleAccessDenied
} from './Utils/permissions.js';
import {
  ORDER_STATUS,
  getPeriodLabel,
  calculateOrderTotal
} from './Config/constants.js';

class DiscordBotService {
  constructor() {
    // Configuration depuis .env
    this.webhookUrl = process.env.DISCORD_WEBHOOK_URL || '';
    this.botToken = process.env.DISCORD_BOT_TOKEN || '';
    this.guildId = process.env.DISCORD_GUILD_ID || '';
    this.vendorUserId = process.env.DISCORD_VENDOR_USER_ID || '';
    this.ordersChannelId = process.env.DISCORD_ORDERS_CHANNEL_ID || '';
    this.shopRoleId = process.env.DISCORD_VENDOR_ROLE || '1297666005346029578';
    
    this.bot = null;
    this.webhookEnabled = !!this.webhookUrl;
    this.botEnabled = !!this.botToken;
    
    // Configuration des statuts (importée depuis constants)
    this.ORDER_STATUS = ORDER_STATUS;
    
    if (this.botEnabled) {
      this.initializeBot();
    }
  }

  /**
   * Vérifie si l'utilisateur a le rôle vendeur
   */
  hasVendorRole(interaction) {
    return hasVendorRole(interaction, this.shopRoleId);
  }

  /**
   * Initialise le bot Discord
   */
  async initializeBot() {
    try {
      this.bot = new Client({
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMembers,
          GatewayIntentBits.DirectMessages,
          GatewayIntentBits.MessageContent,
          GatewayIntentBits.GuildMessages
        ]
      });

      // Event: Bot prêt
      this.bot.once(Events.ClientReady, async (client) => {
        console.log(`✅ Bot Discord connecté: ${client.user.tag}`);
        await this.registerCommands();
      });

      // Event: Interaction (commandes et boutons)
      this.bot.on(Events.InteractionCreate, async (interaction) => {
        if (interaction.isCommand()) {
          await this.handleSlashCommand(interaction);
        } else if (interaction.isButton()) {
          await this.handleButtonInteraction(interaction);
        }
      });

      // Event: Erreurs
      this.bot.on(Events.Error, (error) => {
        console.error('❌ Erreur Bot Discord:', error);
      });

      await this.bot.login(this.botToken);
      
    } catch (error) {
      console.error('❌ Erreur initialisation bot:', error);
      this.botEnabled = false;
    }
  }

  /**
   * Enregistre les commandes slash
   */
  async registerCommands() {
    await registerSlashCommands(this.bot, this.guildId);
  }

  /**
   * Rafraîchit les commandes slash
   */
  async refreshCommands() {
    await refreshSlashCommands(this.bot, this.guildId);
  }

  /**
   * Gère les commandes slash
   */
  async handleSlashCommand(interaction) {
    const { commandName } = interaction;

    // Vérification des permissions
    if (!this.hasVendorRole(interaction)) {
      await handleAccessDenied(
        interaction, 
        this.shopRoleId, 
        this.ordersChannelId, 
        this.bot
      );
      return;
    }

    // Exécution des commandes
    try {
      switch (commandName) {
        case 'status':
          await handleStatusCommand(
            interaction,
            this.ORDER_STATUS,
            this.notifyStatusChange.bind(this)
          );
          break;

        case 'order':
          await handleOrderCommand(
            interaction,
            this.createDetailedOrderEmbed.bind(this)
          );
          break;

        case 'orders':
          await handleOrdersCommand(
            interaction,
            this.ORDER_STATUS,
            calculateOrderTotal
          );
          break;

        case 'clearorders':
          await handleClearOrdersCommand(
            interaction,
            this.ORDER_STATUS,
            getPeriodLabel
          );
          break;

        case 'backup':
          await handleBackupCommand(interaction);
          break;

        case 'checkaccess':
          await handleCheckAccessCommand(
            interaction,
            this.shopRoleId,
            this.hasVendorRole.bind(this)
          );
          break;

        default:
          await interaction.reply({
            content: '❌ Commande non reconnue.',
            ephemeral: true
          });
      }
    } catch (error) {
      console.error('❌ Erreur commande:', error);
      
      const errorMessage = '❌ Une erreur est survenue lors de l\'exécution de la commande.';
      
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ 
          content: errorMessage, 
          ephemeral: true 
        }).catch(() => {});
      } else {
        await interaction.editReply(errorMessage).catch(() => {});
      }
    }
  }

  /**
   * Gère les interactions avec les boutons
   */
  async handleButtonInteraction(interaction) {
    const handlers = {
      orderStatusConfig: this.ORDER_STATUS,
      getPeriodLabelFn: getPeriodLabel,
      createDetailedOrderEmbedFn: this.createDetailedOrderEmbed.bind(this),
      notifyVendorCancellationRequestFn: this.notifyVendorCancellationRequest.bind(this),
      notifyVendorDeliveryConfirmedFn: this.notifyVendorDeliveryConfirmed.bind(this)
    };

    await handleButtonInteraction(interaction, handlers);
  }

  /**
   * Crée un embed détaillé pour une commande
   */
  createDetailedOrderEmbed(orderData) {
    return createDetailedOrderEmbed(orderData, this.ORDER_STATUS);
  }

  /**
   * Crée un embed de commande
   */
  createOrderEmbed(orderData, isVendor = false, includeButtons = false) {
    return createOrderEmbed(orderData, this.ORDER_STATUS, isVendor, includeButtons);
  }

  /**
   * Envoie les notifications de commande
   */
  async sendOrderNotifications(orderData) {
    return await sendOrderNotifications({
      bot: this.bot,
      orderData,
      ordersChannelId: this.ordersChannelId,
      shopRoleId: this.shopRoleId,
      webhookUrl: this.webhookUrl,
      guildId: this.guildId,
      orderStatusConfig: this.ORDER_STATUS
    });
  }

  /**
   * Notifie un changement de statut
   */
  async notifyStatusChange(orderData, oldStatus, newStatus) {
    return await notifyStatusChange({
      bot: this.bot,
      orderData,
      oldStatus,
      newStatus,
      guildId: this.guildId,
      orderStatusConfig: this.ORDER_STATUS
    });
  }

  /**
   * Notifie le vendeur d'une demande d'annulation
   */
  async notifyVendorCancellationRequest(orderId, requestedBy) {
    return await notifyVendorCancellationRequest({
      bot: this.bot,
      orderId,
      requestedBy,
      ordersChannelId: this.ordersChannelId,
      shopRoleId: this.shopRoleId
    });
  }

  /**
   * Notifie le vendeur d'une confirmation de livraison
   */
  async notifyVendorDeliveryConfirmed(orderId) {
    return await notifyVendorDeliveryConfirmed({
      bot: this.bot,
      orderId,
      ordersChannelId: this.ordersChannelId
    });
  }

  /**
   * Vérifie si le service est configuré
   */
  isConfigured() {
    return this.botEnabled || this.webhookEnabled;
  }

  /**
   * Obtient le statut du service
   */
  getStatus() {
    return {
      bot: this.botEnabled,
      webhook: this.webhookEnabled,
      connected: this.bot?.isReady() || false,
      guilds: this.bot?.guilds.cache.size || 0
    };
  }

  /**
   * Calcule le total d'une commande
   */
  calculateOrderTotal(orderData) {
    return calculateOrderTotal(orderData);
  }
}

// Instance unique du service
const discordService = new DiscordBotService();

export default discordService;

// Export pour utilisation en tant que point d'entrée
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🚀 Démarrage du bot Discord...');
  console.log('📊 Statut:', discordService.getStatus());
}

// Fonction d'arrêt propre
export async function shutdown() {
  console.log('🤖 Arrêt du bot Discord...');
  if (discordService.bot) {
    await discordService.bot.destroy();
    console.log('✅ Bot Discord arrêté');
  }
}