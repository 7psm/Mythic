/**
 * SERVEUR API POUR DISCORD BOT (api/server.js)
 * Interface entre votre site web et le bot Discord
 */

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import du bot Discord
const discordBot = require('../bot/index.js');

class DiscordAPIServer {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.apiSecret = process.env.API_SECRET || 'default_secret_change_me';
    
    this.initializeMiddleware();
    this.initializeRoutes();
    this.startServer();
  }

  initializeMiddleware() {
    // CORS pour votre site web
    this.app.use(cors({
      origin: [
        'http://localhost:3000',
        'https://votre-site.com',
        'https://votre-domaine.netlify.app'
      ],
      methods: ['GET', 'POST'],
      credentials: true
    }));

    // Parse JSON
    this.app.use(express.json({ limit: '10mb' }));

    // Rate limiting pour éviter le spam
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Max 100 requêtes par IP
      message: {
        error: 'Trop de requêtes, réessayez plus tard'
      }
    });
    this.app.use('/api/', limiter);

    // Middleware d'authentification
    this.app.use('/api/discord', (req, res, next) => {
      const token = req.headers['authorization'];
      const expectedToken = `Bearer ${this.apiSecret}`;
      
      if (!token || token !== expectedToken) {
        return res.status(401).json({ 
          error: 'Token d\'authentification requis' 
        });
      }
      
      next();
    });

    // Logging des requêtes
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  initializeRoutes() {
    
    // ============================================
    // ROUTES PUBLIQUES
    // ============================================

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        bot: {
          online: discordBot.client?.isReady() || false,
          ping: discordBot.client?.ws?.ping || 0
        }
      });
    });

    // Informations sur l'API
    this.app.get('/api/info', (req, res) => {
      res.json({
        name: 'IncognitoMarket Discord API',
        version: '1.0.0',
        endpoints: [
          'POST /api/discord/send-notification',
          'GET /api/discord/stats',
          'POST /api/discord/test'
        ]
      });
    });

    // ============================================
    // ROUTES DISCORD (PROTÉGÉES)
    // ============================================

    // Route principale : Envoyer une notification de commande
    this.app.post('/api/discord/send-notification', async (req, res) => {
      try {
        console.log('📨 Nouvelle requête de notification Discord...');
        
        // Validation des données
        const donneesCommande = this.validerDonneesCommande(req.body);
        if (!donneesCommande.valid) {
          return res.status(400).json({
            success: false,
            error: 'Données de commande invalides',
            details: donneesCommande.errors
          });
        }

        // Vérifier que le bot est en ligne
        if (!discordBot.client?.isReady()) {
          return res.status(503).json({
            success: false,
            error: 'Bot Discord hors ligne'
          });
        }

        // Traiter la commande via le bot
        const resultats = await discordBot.traiterNouvelleCommande(donneesCommande.data);
        
        // Réponse selon les résultats
        const statusCode = (resultats.confirmationClient && resultats.notificationAdmin) ? 200 : 206;
        
        res.status(statusCode).json({
          success: statusCode === 200,
          data: {
            numeroCommande: resultats.numeroCommande,
            confirmationClientEnvoyee: resultats.confirmationClient,
            notificationAdminEnvoyee: resultats.notificationAdmin,
            timestamp: resultats.timestamp
          },
          message: statusCode === 200 
            ? 'Notifications Discord envoyées avec succès' 
            : 'Notifications partiellement envoyées'
        });

      } catch (error) {
        console.error('❌ Erreur API send-notification:', error);
        
        res.status(500).json({
          success: false,
          error: 'Erreur serveur lors de l\'envoi',
          message: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
        });
      }
    });

    // Statistiques du bot
    this.app.get('/api/discord/stats', (req, res) => {
      try {
        const stats = discordBot.getStats();
        
        res.json({
          success: true,
          data: {
            ...stats,
            server: {
              uptime: process.uptime(),
              memory: process.memoryUsage(),
              platform: process.platform
            },
            timestamp: new Date().toISOString()
          }
        });
        
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'Impossible de récupérer les statistiques'
        });
      }
    });

    // Test de connexion Discord
    this.app.post('/api/discord/test', async (req, res) => {
      try {
        const { pseudoDiscord } = req.body;
        
        if (!pseudoDiscord) {
          return res.status(400).json({
            success: false,
            error: 'Pseudo Discord requis pour le test'
          });
        }

        // Tester la recherche d'utilisateur
        const utilisateur = await discordBot.trouverUtilisateurParPseudo(pseudoDiscord);
        
        res.json({
          success: true,
          data: {
            utilisateurTrouve: !!utilisateur,
            utilisateur: utilisateur ? {
              tag: utilisateur.tag,
              id: utilisateur.id,
              avatar: utilisateur.displayAvatarURL()
            } : null,
            bot: {
              online: discordBot.client.isReady(),
              guilds: discordBot.client.guilds.cache.size,
              ping: discordBot.client.ws.ping
            }
          },
          message: utilisateur 
            ? `Utilisateur ${utilisateur.tag} trouvé avec succès`
            : 'Utilisateur introuvable'
        });

      } catch (error) {
        console.error('❌ Erreur test Discord:', error);
        
        res.status(500).json({
          success: false,
          error: 'Erreur lors du test',
          message: error.message
        });
      }
    });

    // ============================================
    // ROUTES D'ERREUR
    // ============================================

    // 404 pour les routes non trouvées
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Route non trouvée',
        path: req.originalUrl,
        method: req.method
      });
    });

    // Gestionnaire d'erreur global
    this.app.use((error, req, res, next) => {
      console.error('❌ Erreur serveur:', error);
      
      res.status(500).json({
        error: 'Erreur serveur interne',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Une erreur s\'est produite'
      });
    });
  }

  /**
   * Valide les données de commande reçues
   * @param {Object} data - Données à valider
   * @returns {Object} - Résultat de validation
   */
  validerDonneesCommande(data) {
    const errors = [];
    
    // Champs requis
    const champsRequis = [
      'numeroCommande',
      'nom',
      'email',
      'pseudoDiscord',
      'articles',
      'methodePaiement'
    ];

    champsRequis.forEach(champ => {
      if (!data[champ]) {
        errors.push(`Champ requis manquant: ${champ}`);
      }
    });

    // Validation email
    if (data.email && !this.validerEmail(data.email)) {
      errors.push('Format email invalide');
    }

    // Validation articles
    if (data.articles && !Array.isArray(data.articles)) {
      errors.push('Les articles doivent être un tableau');
    } else if (data.articles && data.articles.length === 0) {
      errors.push('Au moins un article requis');
    }

    // Validation pseudo Discord
    if (data.pseudoDiscord && typeof data.pseudoDiscord !== 'string') {
      errors.push('Pseudo Discord doit être une chaîne');
    }

    return {
      valid: errors.length === 0,
      errors: errors,
      data: errors.length === 0 ? this.formaterDonneesCommande(data) : null
    };
  }

  /**
   * Formate les données de commande pour le bot
   * @param {Object} data - Données brutes
   * @returns {Object} - Données formatées
   */
  formaterDonneesCommande(data) {
    return {
      numeroCommande: data.numeroCommande,
      nom: data.nom,
      email: data.email,
      pseudoDiscord: data.pseudoDiscord,
      telephone: data.telephone || null,
      adresse: data.adresse || 'Non renseigné',
      ville: data.ville || 'Non renseigné',
      codePostal: data.codePostal || 'Non renseigné',
      pays: data.pays || 'Non renseigné',
      articles: data.articles.map(article => ({
        nom: article.nom || article.name,
        quantite: parseInt(article.quantite || article.quantity) || 1,
        prix: parseFloat(article.prix || article.price) || 0
      })),
      methodeLivraison: data.methodeLivraison || 'Standard',
      delaiLivraison: data.delaiLivraison || 'Non spécifié',
      fraisLivraison: parseFloat(data.fraisLivraison || 0),
      methodePaiement: data.methodePaiement,
      dateCommande: data.dateCommande || new Date().toISOString()
    };
  }

  /**
   * Valide un format email
   * @param {string} email - Email à valider
   * @returns {boolean} - Validité
   */
  validerEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  /**
   * Démarre le serveur
   */
  startServer() {
    this.app.listen(this.port, () => {
      console.log(`🚀 Serveur Discord API démarré sur le port ${this.port}`);
      console.log(`📡 Health check: http://localhost:${this.port}/health`);
      console.log(`📋 API Info: http://localhost:${this.port}/api/info`);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔧 Mode développement activé');
        console.log(`🔑 Token API: ${this.apiSecret}`);
      }
    });

    // Gestion propre de l'arrêt
    process.on('SIGINT', () => {
      console.log('🛑 Arrêt du serveur API...');
      process.exit(0);
    });
  }
}

// ============================================
// INITIALISATION DU SERVEUR
// ============================================

// Créer et démarrer le serveur
const server = new DiscordAPIServer();

// Export pour tests ou utilisation externe
module.exports = server;