/**
 * BOT DISCORD.JS - Configuration Complète
 * Structure de projet pour notifications de commandes
 */

// ============================================
// 1. INSTALLATION ET DÉPENDANCES
// ============================================

/*
npm init -y
npm install discord.js@14.14.1
npm install dotenv express cors
npm install axios node-cron

Structure des dossiers:
project/
├── bot/
│   ├── index.js          (fichier principal du bot)
│   ├── commands/         (commandes Discord)
│   ├── events/          (événements Discord)
│   ├── utils/           (utilitaires)
│   └── embeds/          (templates d'embeds)
├── api/
│   ├── server.js        (serveur API pour webhook)
│   └── routes/          (routes API)
├── web/
│   └── discord-client.js (script côté client)
├── .env                 (variables d'environnement)
└── package.json
*/

// ============================================
// 2. FICHIER PRINCIPAL DU BOT (bot/index.js)
// ============================================

const { Client, GatewayIntentBits, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
require('dotenv').config();

class IncognitoBotMarket {
  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMembers
      ]
    });
    
    this.config = {
      token: process.env.DISCORD_BOT_TOKEN,
      guildId: process.env.DISCORD_GUILD_ID,
      channelId: process.env.DISCORD_CHANNEL_ID,
      adminRoleId: process.env.ADMIN_ROLE_ID,
      logChannelId: process.env.LOG_CHANNEL_ID
    };
    
    this.initializeBot();
  }

  async initializeBot() {
    try {
      // Événement : Bot prêt
      this.client.once('ready', () => {
        console.log(`🤖 Bot ${this.client.user.tag} est connecté !`);
        console.log(`📊 Présent sur ${this.client.guilds.cache.size} serveur(s)`);
        
        // Statut du bot
        this.client.user.setActivity('🛒 Nouvelles commandes', { type: 'WATCHING' });
      });

      // Événement : Erreurs
      this.client.on('error', (error) => {
        console.error('❌ Erreur Discord:', error);
      });

      // Connexion du bot
      await this.client.login(this.config.token);
      
    } catch (error) {
      console.error('❌ Erreur d\'initialisation du bot:', error);
      process.exit(1);
    }
  }

  /**
   * Trouve un utilisateur par son pseudo Discord
   * @param {string} username - Pseudo Discord (avec ou sans @)
   * @returns {Promise<User|null>} - Utilisateur Discord ou null
   */
  async trouverUtilisateurParPseudo(username) {
    try {
      // Nettoyer le pseudo
      const pseudoNettoye = username.replace(/[@#]/g, '').toLowerCase();
      
      // Récupérer la guilde
      const guild = this.client.guilds.cache.get(this.config.guildId);
      if (!guild) {
        console.error('❌ Serveur Discord introuvable');
        return null;
      }

      // Chercher dans le cache des membres
      await guild.members.fetch();
      const membre = guild.members.cache.find(m => 
        m.user.username.toLowerCase() === pseudoNettoye ||
        m.displayName.toLowerCase() === pseudoNettoye ||
        m.user.globalName?.toLowerCase() === pseudoNettoye
      );

      if (membre) {
        console.log(`✅ Utilisateur trouvé: ${membre.user.tag}`);
        return membre.user;
      }

      // Recherche alternative par tag complet (username#discriminator)
      if (pseudoNettoye.includes('#')) {
        const utilisateur = this.client.users.cache.find(u => 
          u.tag.toLowerCase() === pseudoNettoye
        );
        if (utilisateur) return utilisateur;
      }

      console.warn(`⚠️ Utilisateur introuvable: ${username}`);
      return null;
      
    } catch (error) {
      console.error('❌ Erreur recherche utilisateur:', error);
      return null;
    }
  }

  /**
   * Crée un embed de confirmation pour le client
   * @param {Object} donneesCommande - Données de la commande
   * @returns {EmbedBuilder} - Embed de confirmation
   */
  creerEmbedConfirmationClient(donneesCommande) {
    const sousTotal = donneesCommande.articles.reduce((total, article) => 
      total + (article.prix * article.quantite), 0
    );
    const total = sousTotal + (donneesCommande.fraisLivraison || 0);

    return new EmbedBuilder()
      .setTitle('✅ Confirmation de votre commande')
      .setDescription(`Bonjour **${donneesCommande.nom}** !\n\nVotre commande **${donneesCommande.numeroCommande}** a été reçue avec succès.`)
      .setColor(0x00ff00)
      .addFields(
        {
          name: '📦 Articles Commandés',
          value: donneesCommande.articles.map(article => 
            `• **${article.nom}** x${article.quantite} - €${(article.prix * article.quantite).toFixed(2)}`
          ).join('\n') || 'Aucun article',
          inline: false
        },
        {
          name: '🚚 Livraison',
          value: `**${donneesCommande.methodeLivraison}**\nDélai: ${donneesCommande.delaiLivraison}\nCoût: ${donneesCommande.fraisLivraison === 0 ? 'GRATUIT' : '€' + donneesCommande.fraisLivraison.toFixed(2)}`,
          inline: true
        },
        {
          name: '💰 Total',
          value: `**€${total.toFixed(2)}**\nPaiement: ${donneesCommande.methodePaiement}`,
          inline: true
        },
        {
          name: '📞 Support',
          value: 'Si vous avez des questions :\n• Répondez à ce message\n• Contactez @MolarMarket',
          inline: false
        }
      )
      .setFooter({ 
        text: 'IncognitoMarket • Merci pour votre confiance',
        iconURL: this.client.user.displayAvatarURL()
      })
      .setTimestamp();
  }

  /**
   * Crée un embed de notification pour les admins
   * @param {Object} donneesCommande - Données de la commande
   * @returns {EmbedBuilder} - Embed admin
   */
  creerEmbedNotificationAdmin(donneesCommande) {
    const sousTotal = donneesCommande.articles.reduce((total, article) => 
      total + (article.prix * article.quantite), 0
    );
    const total = sousTotal + (donneesCommande.fraisLivraison || 0);

    return new EmbedBuilder()
      .setTitle('🛒 Nouvelle commande reçue')
      .setDescription(`**Commande n°:** ${donneesCommande.numeroCommande}\n**Client:** ${donneesCommande.nom}`)
      .setColor(0x0099ff)
      .addFields(
        {
          name: '👤 Informations Client',
          value: `**Nom:** ${donneesCommande.nom}\n**Email:** ${donneesCommande.email}\n**Discord:** ${donneesCommande.pseudoDiscord}\n**Téléphone:** ${donneesCommande.telephone || 'Non renseigné'}`,
          inline: true
        },
        {
          name: '📍 Adresse de Livraison',
          value: `${donneesCommande.adresse}\n${donneesCommande.ville} ${donneesCommande.codePostal}\n${donneesCommande.pays}`,
          inline: true
        },
        {
          name: '📦 Articles',
          value: donneesCommande.articles.map(article => 
            `• ${article.nom} x${article.quantite} - €${(article.prix * article.quantite).toFixed(2)}`
          ).join('\n'),
          inline: false
        },
        {
          name: '💰 Résumé Financier',
          value: `**Sous-total:** €${sousTotal.toFixed(2)}\n**Livraison:** ${donneesCommande.fraisLivraison === 0 ? 'GRATUIT' : '€' + donneesCommande.fraisLivraison.toFixed(2)}\n**Total:** €${total.toFixed(2)}\n**Paiement:** ${donneesCommande.methodePaiement}`,
          inline: false
        },
        {
          name: '⏰ Informations',
          value: `**Date:** ${new Date().toLocaleString('fr-FR')}\n**Statut:** 🟡 En attente de traitement`,
          inline: true
        }
      )
      .setFooter({ 
        text: 'IncognitoMarket • Système de commandes automatique',
        iconURL: this.client.user.displayAvatarURL()
      })
      .setTimestamp();
  }

  /**
   * Envoie un message privé au client
   * @param {Object} donneesCommande - Données de la commande
   * @returns {Promise<boolean>} - Succès de l'envoi
   */
  async envoyerConfirmationClient(donneesCommande) {
    try {
      const utilisateur = await this.trouverUtilisateurParPseudo(donneesCommande.pseudoDiscord);
      
      if (!utilisateur) {
        console.warn(`⚠️ Impossible d'envoyer la confirmation à ${donneesCommande.pseudoDiscord}`);
        return false;
      }

      const embed = this.creerEmbedConfirmationClient(donneesCommande);
      
      await utilisateur.send({ embeds: [embed] });
      console.log(`✅ Confirmation envoyée à ${utilisateur.tag}`);
      
      return true;
      
    } catch (error) {
      console.error('❌ Erreur envoi confirmation client:', error);
      
      // Log l'erreur dans le canal admin
      await this.logErreur(`Impossible d'envoyer la confirmation à ${donneesCommande.pseudoDiscord}: ${error.message}`);
      
      return false;
    }
  }

  /**
   * Envoie la notification dans le canal admin
   * @param {Object} donneesCommande - Données de la commande
   * @returns {Promise<boolean>} - Succès de l'envoi
   */
  async envoyerNotificationAdmin(donneesCommande) {
    try {
      const canal = this.client.channels.cache.get(this.config.channelId);
      
      if (!canal) {
        console.error('❌ Canal de notification introuvable');
        return false;
      }

      const embed = this.creerEmbedNotificationAdmin(donneesCommande);
      
      // Ajouter des boutons d'action (optionnel)
      const message = await canal.send({ 
        embeds: [embed],
        content: `<@&${this.config.adminRoleId}> Nouvelle commande !` // Ping des admins
      });

      // Réaction rapide pour marquer comme traité
      await message.react('✅');
      await message.react('❌');
      
      console.log(`✅ Notification admin envoyée dans ${canal.name}`);
      
      return true;
      
    } catch (error) {
      console.error('❌ Erreur envoi notification admin:', error);
      return false;
    }
  }

  /**
   * Traite une nouvelle commande (fonction principale)
   * @param {Object} donneesCommande - Données de la commande
   * @returns {Promise<Object>} - Résultats des envois
   */
  async traiterNouvelleCommande(donneesCommande) {
    console.log(`🔄 Traitement de la commande ${donneesCommande.numeroCommande}...`);
    
    try {
      // Envoyer les notifications en parallèle
      const [confirmationClient, notificationAdmin] = await Promise.allSettled([
        this.envoyerConfirmationClient(donneesCommande),
        this.envoyerNotificationAdmin(donneesCommande)
      ]);

      const resultats = {
        confirmationClient: confirmationClient.status === 'fulfilled' ? confirmationClient.value : false,
        notificationAdmin: notificationAdmin.status === 'fulfilled' ? notificationAdmin.value : false,
        numeroCommande: donneesCommande.numeroCommande,
        timestamp: new Date().toISOString()
      };

      // Log du résultat
      const statut = resultats.confirmationClient && resultats.notificationAdmin ? '✅ Succès' : '⚠️ Partiel';
      console.log(`${statut} - Commande ${donneesCommande.numeroCommande}:`, resultats);

      // Log dans le canal de logs
      await this.logActivite(`Commande ${donneesCommande.numeroCommande} traitée - Client: ${resultats.confirmationClient ? '✅' : '❌'} | Admin: ${resultats.notificationAdmin ? '✅' : '❌'}`);

      return resultats;
      
    } catch (error) {
      console.error('❌ Erreur traitement commande:', error);
      
      await this.logErreur(`Erreur traitement commande ${donneesCommande.numeroCommande}: ${error.message}`);
      
      return {
        confirmationClient: false,
        notificationAdmin: false,
        numeroCommande: donneesCommande.numeroCommande,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Log une activité dans le canal de logs
   * @param {string} message - Message à logger
   */
  async logActivite(message) {
    try {
      if (!this.config.logChannelId) return;
      
      const canalLog = this.client.channels.cache.get(this.config.logChannelId);
      if (!canalLog) return;

      const embed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle('📊 Activité Bot')
        .setDescription(message)
        .setTimestamp();

      await canalLog.send({ embeds: [embed] });
      
    } catch (error) {
      console.error('❌ Erreur log activité:', error);
    }
  }

  /**
   * Log une erreur dans le canal de logs
   * @param {string} erreur - Message d'erreur
   */
  async logErreur(erreur) {
    try {
      if (!this.config.logChannelId) return;
      
      const canalLog = this.client.channels.cache.get(this.config.logChannelId);
      if (!canalLog) return;

      const embed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('❌ Erreur Bot')
        .setDescription(erreur)
        .setTimestamp();

      await canalLog.send({ embeds: [embed] });
      
    } catch (error) {
      console.error('❌ Erreur log erreur:', error);
    }
  }

  /**
   * Obtient les statistiques du bot
   * @returns {Object} - Statistiques
   */
  getStats() {
    return {
      uptime: process.uptime(),
      guilds: this.client.guilds.cache.size,
      users: this.client.users.cache.size,
      channels: this.client.channels.cache.size,
      ping: this.client.ws.ping
    };
  }
}

// ============================================
// 3. INITIALISATION ET EXPORT
// ============================================

// Instance du bot
const bot = new IncognitoBotMarket();

// Gestion propre de l'arrêt
process.on('SIGINT', () => {
  console.log('🛑 Arrêt du bot...');
  bot.client.destroy();
  process.exit(0);
});

// Export pour utilisation dans l'API
module.exports = bot;
