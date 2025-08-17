/**
 * CLIENT WEB DISCORD (web/discord-client.js)
 * Interface côté navigateur pour communiquer avec l'API Discord
 */

class DiscordNotificationClient {
  constructor(config = {}) {
    this.config = {
      apiUrl: config.apiUrl || 'http://localhost:3000/api',
      apiSecret: config.apiSecret || 'default_secret_change_me',
      timeout: config.timeout || 15000,
      retryAttempts: config.retryAttempts || 3,
      retryDelay: config.retryDelay || 2000
    };

    this.isInitialized = false;
    this.lastRequestTime = 0;
    this.requestCount = 0;

    this.initialize();
  }

  /**
   * Initialise le client Discord
   */
  async initialize() {
    try {
      console.log('🔄 Initialisation du client Discord...');
      
      // Test de connexion avec l'API
      const healthCheck = await this.verifierConnexionAPI();
      
      if (healthCheck.success) {
        this.isInitialized = true;
        console.log('✅ Client Discord initialisé avec succès');
        console.log(`📡 API: ${this.config.apiUrl}`);
        console.log(`🤖 Bot Discord: ${healthCheck.data.bot.online ? 'En ligne' : 'Hors ligne'}`);
      } else {
        console.warn('⚠️ API Discord non disponible, mode dégradé activé');
        this.isInitialized = false;
      }

    } catch (error) {
      console.error('❌ Erreur initialisation client Discord:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Vérifie la connexion avec l'API Discord
   * @returns {Promise<Object>} - Statut de la connexion
   */
  async verifierConnexionAPI() {
    try {
      const response = await fetch(`${this.config.apiUrl.replace('/api', '')}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          data: data
        };
      } else {
        return {
          success: false,
          error: `HTTP ${response.status}`
        };
      }

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Teste la recherche d'un utilisateur Discord
   * @param {string} pseudoDiscord - Pseudo Discord à tester
   * @returns {Promise<Object>} - Résultat du test
   */
  async testerUtilisateurDiscord(pseudoDiscord) {
    try {
      if (!this.isInitialized) {
        return {
          success: false,
          error: 'Client Discord non initialisé'
        };
      }

      const response = await fetch(`${this.config.apiUrl}/discord/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiSecret}`
        },
        body: JSON.stringify({
          pseudoDiscord: pseudoDiscord
        }),
        signal: AbortSignal.timeout(this.config.timeout)
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          utilisateurTrouve: data.data.utilisateurTrouve,
          utilisateur: data.data.utilisateur,
          message: data.message
        };
      } else {
        return {
          success: false,
          error: data.error || 'Erreur test utilisateur'
        };
      }

    } catch (error) {
      console.error('❌ Erreur test utilisateur Discord:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Envoie les notifications Discord pour une commande
   * @param {Object} donneesCommande - Données de la commande
   * @returns {Promise<Object>} - Résultat de l'envoi
   */
  async envoyerNotificationsCommande(donneesCommande) {
    try {
      console.log('📨 Envoi des notifications Discord...', donneesCommande.numeroCommande);

      // Vérifier l'initialisation
      if (!this.isInitialized) {
        console.warn('⚠️ Client Discord non initialisé, tentative de réinitialisation...');
        await this.initialize();
        
        if (!this.isInitialized) {
          return {
            success: false,
            error: 'Service Discord indisponible'
          };
        }
      }

      // Rate limiting simple
      const now = Date.now();
      if (now - this.lastRequestTime < 1000) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      this.lastRequestTime = now;

      // Préparer les données
      const donneesFormatees = this.formaterDonneesCommande(donneesCommande);
      
      // Validation des données
      const validation = this.validerDonneesCommande(donneesFormatees);
      if (!validation.valid) {
        return {
          success: false,
          error: 'Données de commande invalides',
          details: validation.errors
        };
      }

      // Envoi avec retry
      const resultat = await this.envoyerAvecRetry(donneesFormatees);
      
      return resultat;

    } catch (error) {
      console.error('❌ Erreur envoi notifications Discord:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Envoie les données avec système de retry
   * @param {Object} donnees - Données à envoyer
   * @returns {Promise<Object>} - Résultat
   */
  async envoyerAvecRetry(donnees) {
    let lastError = null;

    for (let tentative = 1; tentative <= this.config.retryAttempts; tentative++) {
      try {
        console.log(`📤 Tentative ${tentative}/${this.config.retryAttempts}...`);

        const response = await fetch(`${this.config.apiUrl}/discord/send-notification`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiSecret}`,
            'X-Request-ID': `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          },
          body: JSON.stringify(donnees),
          signal: AbortSignal.timeout(this.config.timeout)
        });

        const data = await response.json();

        if (response.ok) {
          console.log('✅ Notifications Discord envoyées avec succès');
          return {
            success: true,
            data: data.data,
            message: data.message,
            tentative: tentative
          };
        } else if (response.status === 503) {
          // Service temporairement indisponible
          lastError = new Error(`Service indisponible: ${data.error}`);
          console.warn(`⚠️ Tentative ${tentative} échouée: ${data.error}`);
        } else if (response.status === 400) {
          // Erreur de données, pas la peine de retry
          return {
            success: false,
            error: data.error,
            details: data.details
          };
        } else {
          lastError = new Error(`Erreur HTTP ${response.status}: ${data.error}`);
          console.warn(`⚠️ Tentative ${tentative} échouée: ${lastError.message}`);
        }

      } catch (error) {
        lastError = error;
        console.warn(`⚠️ Tentative ${tentative} échouée: ${error.message}`);
      }

      // Attendre avant la prochaine tentative (sauf dernière)
      if (tentative < this.config.retryAttempts) {
        const delai = this.config.retryDelay * tentative; // Délai croissant
        console.log(`⏳ Attente ${delai}ms avant nouvelle tentative...`);
        await new Promise(resolve => setTimeout(resolve, delai));
      }
    }

    // Toutes les tentatives ont échoué
    return {
      success: false,
      error: `Échec après ${this.config.retryAttempts} tentatives`,
      lastError: lastError?.message
    };
  }

  /**
   * Formate les données de commande pour l'API
   * @param {Object} donneesOriginales - Données depuis le checkout
   * @returns {Object} - Données formatées
   */
  formaterDonneesCommande(donneesOriginales) {
    // Mapper les données depuis le contexte OrderData ou checkout
    return {
      numeroCommande: donneesOriginales.orderNumber || donneesOriginales.numeroCommande || this.genererNumeroCommande(),
      nom: donneesOriginales.name || donneesOriginales.nom,
      email: donneesOriginales.email,
      pseudoDiscord: donneesOriginales.telegram || donneesOriginales.pseudoDiscord,
      telephone: donneesOriginales.phoneNumber || donneesOriginales.telephone,
      adresse: donneesOriginales.address || donneesOriginales.adresse,
      ville: donneesOriginales.city || donneesOriginales.ville,
      codePostal: donneesOriginales.postalCode || donneesOriginales.codePostal,
      pays: donneesOriginales.country || donneesOriginales.pays,
      articles: this.formaterArticles(donneesOriginales.orderItems || donneesOriginales.articles || []),
      methodeLivraison: donneesOriginales.shippingMethod?.name || donneesOriginales.methodeLivraison || 'Standard',
      delaiLivraison: donneesOriginales.shippingMethod?.delivery || donneesOriginales.delaiLivraison || 'Non spécifié',
      fraisLivraison: donneesOriginales.shippingMethod?.price || donneesOriginales.fraisLivraison || 0,
      methodePaiement: donneesOriginales.paymentMethod || donneesOriginales.methodePaiement,
      dateCommande: donneesOriginales.orderDate || donneesOriginales.dateCommande || new Date().toISOString()
    };
  }

  /**
   * Formate les articles de commande
   * @param {Array} articles - Articles bruts
   * @returns {Array} - Articles formatés
   */
  formaterArticles(articles) {
    if (!Array.isArray(articles)) return [];

    return articles.map(article => ({
      nom: article.name || article.nom,
      quantite: parseInt(article.quantity || article.quantite) || 1,
      prix: parseFloat(article.price || article.prix) || 0
    }));
  }

  /**
   * Valide les données de commande côté client
   * @param {Object} donnees - Données à valider
   * @returns {Object} - Résultat de validation
   */
  validerDonneesCommande(donnees) {
    const errors = [];

    // Validations essentielles
    if (!donnees.numeroCommande) errors.push('Numéro de commande manquant');
    if (!donnees.nom) errors.push('Nom client manquant');
    if (!donnees.email) errors.push('Email manquant');
    if (!donnees.pseudoDiscord) errors.push('Pseudo Discord manquant');
    if (!donnees.articles || donnees.articles.length === 0) errors.push('Aucun article dans la commande');

    // Validation email
    if (donnees.email && !this.validerFormatEmail(donnees.email)) {
      errors.push('Format email invalide');
    }

    // Validation articles
    if (donnees.articles) {
      donnees.articles.forEach((article, index) => {
        if (!article.nom) errors.push(`Article ${index + 1}: nom manquant`);
        if (!article.quantite || article.quantite < 1) errors.push(`Article ${index + 1}: quantité invalide`);
        if (typeof article.prix !== 'number' || article.prix < 0) errors.push(`Article ${index + 1}: prix invalide`);
      });
    }

    return {
      valid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Valide le format d'un email
   * @param {string} email - Email à valider
   * @returns {boolean} - Validité
   */
  validerFormatEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  /**
   * Génère un numéro de commande unique
   * @returns {string} - Numéro de commande
   */
  genererNumeroCommande() {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `CMD-${timestamp}-${random}`;
  }

  /**
   * Obtient les statistiques du service Discord
   * @returns {Promise<Object>} - Statistiques
   */
  async obtenirStatistiques() {
    try {
      if (!this.isInitialized) {
        return { error: 'Client non initialisé' };
      }

      const response = await fetch(`${this.config.apiUrl}/discord/stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiSecret}`
        },
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          stats: data.data
        };
      } else {
        return {
          success: false,
          error: 'Impossible de récupérer les statistiques'
        };
      }

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Réinitialise le client Discord
   * @returns {Promise<boolean>} - Succès de la réinitialisation
   */
  async reinitialiser() {
    console.log('🔄 Réinitialisation du client Discord...');
    this.isInitialized = false;
    this.requestCount = 0;
    this.lastRequestTime = 0;

    await this.initialize();
    return this.isInitialized;
  }

  /**
   * Obtient le statut actuel du client
   * @returns {Object} - Informations de statut
   */
  obtenirStatut() {
    return {
      initialise: this.isInitialized,
      apiUrl: this.config.apiUrl,
      nombreRequetes: this.requestCount,
      derniereRequete: this.lastRequestTime,
      configuration: {
        timeout: this.config.timeout,
        maxTentatives: this.config.retryAttempts,
        delaiRetry: this.config.retryDelay
      }
    };
  }
}

// ============================================
// INITIALISATION ET EXPORT
// ============================================

// Configuration depuis les variables globales ou par défaut
const configDiscord = window.CONFIG_DISCORD_CLIENT || {
  apiUrl: 'http://localhost:3000/api',
  apiSecret: 'default_secret_change_me'
};

// Instance globale du client Discord
const clientDiscord = new DiscordNotificationClient(configDiscord);

// Export pour utilisation dans d'autres scripts
window.DiscordClient = clientDiscord;

// API simplifiée pour utilisation dans le checkout
window.envoyerNotificationDiscord = async (donneesCommande) => {
  return await clientDiscord.envoyerNotificationsCommande(donneesCommande);
};

window.testerPseudoDiscord = async (pseudo) => {
  return await clientDiscord.testerUtilisateurDiscord(pseudo);
};

// Log d'initialisation
console.log('🎮 Client Discord chargé et initialisé');

// ============================================
// INTÉGRATION AVEC LE CHECKOUT EXISTANT
// ============================================

/**
 * Fonction d'intégration avec votre confirmation.js existant
 * Remplace la fonction sendOrderToTelegram existante
 */
window.sendOrderToTelegram = async (orderData) => {
  console.log('📞 Redirection sendOrderToTelegram vers Discord...');
  
  const resultat = await window.envoyerNotificationDiscord(orderData);
  
  // Retourner format compatible avec l'ancien système Telegram
  return resultat.success;
};

console.log('🔗 Intégration avec le système de checkout terminée');