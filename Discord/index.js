// =============================================
// DISCORD BOT SERVICE - POINT D'ENTRÉE
// =============================================

import dotenv from 'dotenv';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });
dotenv.config({ path: '/home/container/.env' });

import { Client, GatewayIntentBits, Events, Partials } from 'discord.js';
import { registerSlashCommands, refreshSlashCommands } from './Commands/slashCommands.js';
import { executeCommand } from './Handlers/commandHandlers.js';
import { handleButtonInteraction } from './Handlers/buttonHandlers.js';
import { handlePrefixCommand } from './Handlers/prefixHandlers.js';
import { handleMessageDelete } from './Handlers/eventHandlers.js';
import * as infoCommand from './Commands/Info/info.js';

import { createDetailedOrderEmbed,  createOrderEmbed } from './Utils/embedCreators.js';
import { sendOrderNotifications, notifyStatusChange, notifyVendorCancellationRequest, notifyVendorDeliveryConfirmed } from './Utils/notifications.js';
import { hasVendorRole, hasStaffRole, handleAccessDenied } from './Utils/permissions.js';
import { ORDER_STATUS, getPeriodLabel, calculateOrderTotal } from './Config/constants.js';

class DiscordBotService {
  constructor() {
  // Configuration depuis .env
  this.webhookUrl = process.env.DISCORD_WEBHOOK_URL || '';
  this.botToken = process.env.DISCORD_BOT_TOKEN || '';
  this.guildId = process.env.DISCORD_GUILD_ID || '';
  this.vendorUserId = process.env.DISCORD_VENDOR_USER_ID || '';
  this.ordersChannelId = process.env.DISCORD_ORDERS_CHANNEL_ID || '';
  this.shopRoleId = process.env.DISCORD_VENDOR_ROLE || '1297666005346029578';
  this.staffRoleId = process.env.DISCORD_STAFF_ROLE || '';
  
  this.bot = null;
  this.commands = null;
  this.deletedMessages = new Map();
  this.webhookEnabled = !!this.webhookUrl;
  this.botEnabled = !!this.botToken;
  
  this.ORDER_STATUS = ORDER_STATUS;
  
  // LOGS SIMPLIFIÉS
  console.log('🔧 Initialisation des services...');
  
  if (!this.botEnabled) {
    console.error('❌ DISCORD_BOT_TOKEN manquant !');
    return;
  }
  
  if (!this.guildId) {
    console.error('❌ DISCORD_GUILD_ID manquant !');
    return;
  }
  
  this.initializeBot();
}


/**
 * Vérifie si l'utilisateur a le rôle vendeur
 */
  hasVendorRole(interaction) {
    return hasVendorRole(interaction, this.shopRoleId);
  }

/**
 * Vérifie si l'utilisateur a le rôle staff
 */
  hasStaffRole(interaction) {
    return hasStaffRole(interaction, this.staffRoleId);
  }

/**
 * Initialise le bot Discord
 */
  async initializeBot() {
  try {
    console.log('🤖 Création du client Discord...');
    
    this.bot = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages
      ],
      partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction
      ]
    });


  // # ========================
  // # === EVENT : BOT PRÊT ===
  // # ========================
    this.bot.once(Events.ClientReady, async () => {
      console.log(`✅ Bot connecté : ${this.bot.user.tag}`);
      console.log(`📊 Serveurs : ${this.bot.guilds.cache.size}`);
      console.log('📦 Chargement des modules...');
      
      // Enregistrer les commandes slash
      this.commands = await this.registerCommands();
    });

  // # ====================================
  // # === EVENT : Intéract° /cmd & btn ===
  // # ====================================
      this.bot.on(Events.InteractionCreate, async (interaction) => {
        if (interaction.isCommand()) {
          await this.handleSlashCommand(interaction);
        } else if (interaction.isButton()) {
          await this.handleButtonInteraction(interaction);
        }
      });

  // # ================================
  // # === EVENT : Message prefix & ===
  // # ================================
      this.bot.on(Events.MessageCreate, async (message) => {
        if (message.author.bot) return;
        
        // Gestion des mentions du bot
        await infoCommand.handleMention(this.bot, message);
        
        // Gestion des commandes prefix
        if (message.content.startsWith('&')) {
          const args = message.content.slice(1).trim().split(/ +/);
          const commandName = args.shift().toLowerCase();
          await handlePrefixCommand(message, commandName, args);
        }
      });

  // # ===============================
  // # === EVENT : Message Delete  ===
  // # ===============================
      this.bot.on(Events.MessageDelete, async (message) => {
        await handleMessageDelete(message, this.deletedMessages);
      });

  // # =======================
  // # === EVENT : ERREURS ===
  // # =======================
      this.bot.on(Events.Error, (error) => {
        console.error('❌ Erreur Bot Discord:', error);
      });

      console.log('🔐 Connexion au bot...');
      await this.bot.login(this.botToken);
      
    } catch (error) {
      console.error('❌ Erreur initialisation bot:', error);
      this.botEnabled = false;
      throw error;
    }
  }

/**
 * Enregistre les commandes slash
 */
  async registerCommands() {
    if (!this.bot || !this.bot.isReady()) {
      console.error('❌ Le bot n\'est pas prêt');
      return null;
    }
    
    return await registerSlashCommands(this.bot, this.guildId);
  }

/**
 * Rafraîchit les commandes slash
 */
  async refreshCommands() {
    this.commands = await refreshSlashCommands(this.bot, this.guildId);
  }

/**
 * Gère les commandes slash
 */
  async handleSlashCommand(interaction) {
    if (!this.commands) {
      await interaction.reply({
        content: '⚠️ Le bot n\'est pas encore prêt. Veuillez réessayer.',
        ephemeral: true
      });
      return;
    }

    // Contexte à passer aux commandes
    const context = {
      bot: this.bot,
      ORDER_STATUS: this.ORDER_STATUS,
      shopRoleId: this.shopRoleId,
      staffRoleId: this.staffRoleId,
      ordersChannelId: this.ordersChannelId,
      guildId: this.guildId,
      deletedMessages: this.deletedMessages,
      
      // Fonctions utilitaires
      hasVendorRole: this.hasVendorRole.bind(this),
      hasStaffRole: this.hasStaffRole.bind(this),
      handleAccessDenied,
      createDetailedOrderEmbed: this.createDetailedOrderEmbed.bind(this),
      calculateOrderTotal,
      getPeriodLabel,
      notifyStatusChange: this.notifyStatusChange.bind(this),
      notifyVendorCancellationRequest: this.notifyVendorCancellationRequest.bind(this),
      notifyVendorDeliveryConfirmed: this.notifyVendorDeliveryConfirmed.bind(this)
    };

    await executeCommand(interaction, this.commands, context);
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

  // Méthodes utilitaires (embeds, notifications, etc.)
  createDetailedOrderEmbed(orderData) {
    return createDetailedOrderEmbed(orderData, this.ORDER_STATUS);
  }

  createOrderEmbed(orderData, isVendor = false, includeButtons = false) {
    return createOrderEmbed(orderData, this.ORDER_STATUS, isVendor, includeButtons);
  }

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

  async notifyVendorCancellationRequest(orderId, requestedBy) {
    return await notifyVendorCancellationRequest({
      bot: this.bot,
      orderId,
      requestedBy,
      ordersChannelId: this.ordersChannelId,
      shopRoleId: this.shopRoleId
    });
  }

  async notifyVendorDeliveryConfirmed(orderId) {
    return await notifyVendorDeliveryConfirmed({
      bot: this.bot,
      orderId,
      ordersChannelId: this.ordersChannelId
    });
  }

  isConfigured() {
    return this.botEnabled || this.webhookEnabled;
  }

  getStatus() {
    return {
      bot: this.botEnabled,
      webhook: this.webhookEnabled,
      connected: this.bot?.isReady() || false,
      guilds: this.bot?.guilds.cache.size || 0,
      commands: this.commands?.size || 0
    };
  }

  calculateOrderTotal(orderData) {
    return calculateOrderTotal(orderData);
  }
}

// # =============================
// # === GESTION DES ERREURS ===
// # ===========================
  process.on('uncaughtException', (error) => {
    console.error('❌❌❌ ERREUR NON CATCHÉE:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌❌❌ PROMESSE REJETÉE:', reason);
    console.error('Promise:', promise);
    process.exit(1);
  });

// # ===========================
// # === INSTANCE DU SERVICE ===
// # ===========================
  console.log('🚀 Démarrage du bot Discord...');
  const discordService = new DiscordBotService();

  export default discordService;

// # ========================
// # === FONCTION D'ARRÊT ===
// # ========================
  export async function shutdown() {
    console.log('🤖 Arrêt du bot Discord...');
    if (discordService.bot) {
      await discordService.bot.destroy();
      console.log('✅ Bot Discord arrêté');
    }
  }