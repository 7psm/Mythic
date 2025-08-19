// ============================================
// 1. CONFIGURATION ET SÉCURITÉ
// ============================================

// Configuration Discord sécurisée (variables d'environnement)
const DISCORD_CONFIG = {
  BOT_TOKEN: process.env.DISCORD_BOT_TOKEN,
  GUILD_ID: process.env.DISCORD_GUILD_ID, 
  CHANNEL_ID: process.env.DISCORD_CHANNEL_ID,
  API_SECRET: process.env.DISCORD_API_SECRET || 'your-super-secure-secret-key',
  MAX_RETRIES: 3,
  TIMEOUT: 10000
};

// Validation de configuration
const isValidDiscordConfig = () => {
  const required = ['BOT_TOKEN', 'GUILD_ID', 'CHANNEL_ID'];
  const missing = required.filter(key => !DISCORD_CONFIG[key]);
  
  if (missing.length > 0) {
    console.error(`❌ Configuration Discord manquante: ${missing.join(', ')}`);
    return false;
  }
  
  return true;
};

// ============================================
// 2. SÉCURITÉ - PROTECTION CONTRE INJECTIONS
// ============================================

/**
 * Nettoie et sécurise les entrées utilisateur
 * Protège contre XSS, injections, et caractères dangereux
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') {
    return String(input || '').substring(0, 1000); // Limite longueur
  }
  
  return input
    // Supprimer caractères de contrôle dangereux
    .replace(/[\x00-\x1F\x7F]/g, '')
    // Échapper caractères Discord spéciaux qui pourraient casser les embeds
    .replace(/[`*_~|\\]/g, (match) => `\\${match}`)
    // Limiter longueur pour éviter spam
    .substring(0, 1000)
    // Supprimer espaces multiples
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Valide et sécurise les données de commande
 */
const validateOrderData = (orderData) => {
  // Vérifications de sécurité de base
  if (!orderData || typeof orderData !== 'object') {
    throw new Error('SECURITY: Invalid order data structure');
  }

  // Validation des champs obligatoires
  const requiredFields = ['orderNumber', 'name', 'email'];
  const missingFields = requiredFields.filter(field => !orderData[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`SECURITY: Missing required fields: ${missingFields.join(', ')}`);
  }

  // Validation format email (sécurité)
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(orderData.email)) {
    throw new Error('SECURITY: Invalid email format');
  }

  // Validation numéro de commande (format attendu)
  const orderNumberRegex = /^[A-Z0-9-]{5,20}$/;
  if (!orderNumberRegex.test(orderData.orderNumber)) {
    throw new Error('SECURITY: Invalid order number format');
  }

  // Nettoyage sécurisé de tous les champs
  const cleanedData = {
    orderNumber: sanitizeInput(orderData.orderNumber),
    name: sanitizeInput(orderData.name),
    email: sanitizeInput(orderData.email),
    phoneNumber: sanitizeInput(orderData.phoneNumber || ''),
    telegram: sanitizeInput(orderData.telegram || ''), // Pseudo Discord
    address: sanitizeInput(orderData.address || ''),
    city: sanitizeInput(orderData.city || ''),
    postalCode: sanitizeInput(orderData.postalCode || ''),
    country: sanitizeInput(orderData.country || ''),
    orderItems: Array.isArray(orderData.orderItems) ? 
      orderData.orderItems.slice(0, 20).map(item => ({ // Limite 20 articles max
        name: sanitizeInput(item.name || ''),
        quantity: Math.max(0, Math.min(999, parseInt(item.quantity) || 0)),
        price: Math.max(0, Math.min(999999, parseFloat(item.price) || 0))
      })) : [],
    shippingMethod: {
      name: sanitizeInput(orderData.shippingMethod?.name || 'Standard'),
      price: Math.max(0, Math.min(999, parseFloat(orderData.shippingMethod?.price) || 0)),
      delivery: sanitizeInput(orderData.shippingMethod?.delivery || 'Non spécifié')
    },
    paymentMethod: sanitizeInput(orderData.paymentMethod || ''),
    orderDate: orderData.orderDate || new Date().toISOString()
  };

  return cleanedData;
};

// ============================================
// 3. FORMATAGE DES EMBEDS DISCORD
// ============================================

/**
 * Crée l'embed Discord pour le client (MP)
 */
const createClientEmbed = (orderData) => {
  const subtotal = orderData.orderItems.reduce(
    (total, item) => total + (item.price * item.quantity), 
    0
  );
  const total = subtotal + orderData.shippingMethod.price;

  return {
    title: '✅ Confirmation de Votre Commande',
    description: `Bonjour **${orderData.name}** !\n\nVotre commande **${orderData.orderNumber}** a été reçue avec succès.`,
    color: 0x00ff00, // Vert pour confirmation
    timestamp: new Date(orderData.orderDate).toISOString(),
    footer: {
      text: 'IncognitoMarket • Merci pour votre confiance',
      icon_url: '/public/logo.png' // Remplacez par votre logo
    },
    fields: [
      {
        name: '📦 Articles Commandés',
        value: orderData.orderItems.length > 0 ? 
          orderData.orderItems.map(item => 
            `• **${item.name}** x${item.quantity} - €${(item.price * item.quantity).toFixed(2)}`
          ).join('\n').substring(0, 1024) : 'Aucun article',
        inline: false
      },
      {
        name: '🚚 Informations de Livraison',
        value: `**Méthode:** ${orderData.shippingMethod.name}\n**Délai:** ${orderData.shippingMethod.delivery}\n**Coût:** ${orderData.shippingMethod.price === 0 ? 'GRATUIT' : '€' + orderData.shippingMethod.price.toFixed(2)}`,
        inline: true
      },
      {
        name: '💰 Résumé Financier',
        value: `**Sous-total:** €${subtotal.toFixed(2)}\n**Livraison:** ${orderData.shippingMethod.price === 0 ? 'GRATUIT' : '€' + orderData.shippingMethod.price.toFixed(2)}\n**Total:** €${total.toFixed(2)}\n**Paiement:** ${orderData.paymentMethod}`,
        inline: true
      },
      {
        name: '📍 Adresse de Livraison',
        value: `${orderData.address}\n${orderData.city} ${orderData.postalCode}\n${orderData.country}`,
        inline: false
      },
      {
        name: '📞 Support Client',
        value: 'Si vous avez des questions :\n• Répondez à ce message\n• Rejoignez notre serveur Discord\n• Contactez notre équipe',
        inline: false
      }
    ]
  };
};

/**
 * Crée l'embed Discord pour les admins (salon)
 */
const createAdminEmbed = (orderData) => {
  const subtotal = orderData.orderItems.reduce(
    (total, item) => total + (item.price * item.quantity), 
    0
  );
  const total = subtotal + orderData.shippingMethod.price;

  return {
    title: '🛒 Nouvelle Commande Reçue',
    description: `**Commande n°:** ${orderData.orderNumber}\n**Client:** ${orderData.name}`,
    color: 0x0099ff, // Bleu pour notification admin
    timestamp: new Date(orderData.orderDate).toISOString(),
    footer: {
      text: 'IncognitoMarket • Système de Commandes Automatique',
      icon_url: '/public/logo.png'
    },
    fields: [
      {
        name: '👤 Informations Client',
        value: `**Nom:** ${orderData.name}\n**Email:** ${orderData.email}\n**Discord:** ${orderData.telegram}\n**Téléphone:** ${orderData.phoneNumber || 'Non renseigné'}`,
        inline: true
      },
      {
        name: '📍 Adresse de Livraison',
        value: `${orderData.address}\n${orderData.city} ${orderData.postalCode}\n${orderData.country}`,
        inline: true
      },
      {
        name: '📦 Articles Commandés',
        value: orderData.orderItems.length > 0 ? 
          orderData.orderItems.map(item => 
            `• ${item.name} x${item.quantity} - €${(item.price * item.quantity).toFixed(2)}`
          ).join('\n').substring(0, 1024) : 'Aucun article',
        inline: false
      },
      {
        name: '🚚 Livraison & Paiement',
        value: `**Méthode de livraison:** ${orderData.shippingMethod.name}\n**Délai:** ${orderData.shippingMethod.delivery}\n**Paiement:** ${orderData.paymentMethod}`,
        inline: true
      },
      {
        name: '💰 Résumé Financier',
        value: `**Sous-total:** €${subtotal.toFixed(2)}\n**Livraison:** ${orderData.shippingMethod.price === 0 ? 'GRATUIT' : '€' + orderData.shippingMethod.price.toFixed(2)}\n**Total:** €${total.toFixed(2)}`,
        inline: true
      },
      {
        name: '⏰ Informations de Traitement',
        value: `**Date:** ${formatDate(orderData.orderDate)}\n**Statut:** 🟡 En attente de traitement\n**Priorité:** Normale`,
        inline: false
      }
    ]
  };
};

/**
 * Formate une date pour affichage
 */
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// ============================================
// 4. FONCTIONS D'ENVOI DISCORD
// ============================================

/**
 * Trouve un utilisateur Discord par son pseudo
 */
const findDiscordUser = async (username) => {
  if (!username || typeof username !== 'string') {
    return null;
  }

  try {
    // Cette fonction nécessite l'intégration avec discord.js côté serveur
    // Pour le moment, on simule la recherche
    
    // En production, vous feriez un appel à votre API Discord :
    const response = await fetch('/api/discord/find-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DISCORD_CONFIG.API_SECRET}`
      },
      body: JSON.stringify({
        username: sanitizeInput(username),
        guildId: DISCORD_CONFIG.GUILD_ID
      })
    });

    if (response.ok) {
      const userData = await response.json();
      return userData.user || null;
    }

    return null;
  } catch (error) {
    console.error('Erreur recherche utilisateur Discord:', error);
    return null;
  }
};

/**
 * Envoie un MP Discord au client
 */
const sendDiscordDM = async (orderData) => {
  try {
    if (!orderData.telegram) {
      console.warn('Pas de pseudo Discord fourni pour le MP');
      return false;
    }

    const user = await findDiscordUser(orderData.telegram);
    if (!user) {
      console.error(`Utilisateur Discord introuvable: ${orderData.telegram}`);
      return false;
    }

    const embed = createClientEmbed(orderData);

    // Appel API pour envoyer le MP via votre bot Discord
    const response = await fetch('/api/discord/send-dm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DISCORD_CONFIG.API_SECRET}`
      },
      body: JSON.stringify({
        userId: user.id,
        embed: embed
      })
    });

    if (response.ok) {
      console.log(`✅ MP Discord envoyé à ${user.username}`);
      return true;
    } else {
      const error = await response.text();
      console.error('Erreur envoi MP Discord:', error);
      return false;
    }

  } catch (error) {
    console.error('Erreur sendDiscordDM:', error);
    return false;
  }
};

/**
 * Envoie un message dans le salon Discord
 */
const sendDiscordChannelMessage = async (orderData) => {
  try {
    const embed = createAdminEmbed(orderData);

    // Appel API pour envoyer le message dans le salon
    const response = await fetch('/api/discord/send-channel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DISCORD_CONFIG.API_SECRET}`
      },
      body: JSON.stringify({
        channelId: DISCORD_CONFIG.CHANNEL_ID,
        embed: embed,
        content: `@everyone Nouvelle commande !` // Ping optionnel
      })
    });

    if (response.ok) {
      console.log('✅ Message salon Discord envoyé');
      return true;
    } else {
      const error = await response.text();
      console.error('Erreur envoi salon Discord:', error);
      return false;
    }

  } catch (error) {
    console.error('Erreur sendDiscordChannelMessage:', error);
    return false;
  }
};

// ============================================
// 5. FONCTION PRINCIPALE SÉCURISÉE
// ============================================

/**
 * Envoie la commande vers Discord (remplace sendOrderToTelegram)
 * Fonction principale sécurisée avec retry et validation
 */
const sendOrderToDiscord = async (orderData) => {
  console.log('📨 Début envoi commande vers Discord...');
  
  try {
    // 1. Validation configuration
    if (!isValidDiscordConfig()) {
      throw new Error('SECURITY: Invalid Discord configuration');
    }

    // 2. Validation et nettoyage des données
    let cleanOrderData;
    try {
      cleanOrderData = validateOrderData(orderData);
    } catch (validationError) {
      console.error('❌ Validation échouée:', validationError.message);
      return false;
    }

    // 3. Logs sécurisés (sans données sensibles)
    console.log(`📦 Traitement commande ${cleanOrderData.orderNumber} pour ${cleanOrderData.name.substring(0, 3)}***`);

    // 4. Envoi avec retry automatique
    const maxRetries = DISCORD_CONFIG.MAX_RETRIES;
    let attempts = 0;
    let dmSuccess = false;
    let channelSuccess = false;

    while (attempts < maxRetries) {
      attempts++;
      console.log(`🔄 Tentative ${attempts}/${maxRetries}...`);

      try {
        // Envoyer en parallèle pour optimiser
        const [dmResult, channelResult] = await Promise.allSettled([
          sendDiscordDM(cleanOrderData),
          sendDiscordChannelMessage(cleanOrderData)
        ]);

        dmSuccess = dmResult.status === 'fulfilled' && dmResult.value;
        channelSuccess = channelResult.status === 'fulfilled' && channelResult.value;

        // Si au moins un des deux fonctionne, c'est un succès partiel
        if (dmSuccess || channelSuccess) {
          break;
        }

      } catch (sendError) {
        console.error(`❌ Tentative ${attempts} échouée:`, sendError.message);
      }

      // Attendre avant retry (backoff exponentiel)
      if (attempts < maxRetries) {
        const delay = Math.pow(2, attempts) * 1000; // 2s, 4s, 8s
        console.log(`⏳ Attente ${delay}ms avant retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // 5. Résultat final
    const success = dmSuccess || channelSuccess;
    
    console.log(`📊 Résultat final: MP=${dmSuccess ? '✅' : '❌'} | Salon=${channelSuccess ? '✅' : '❌'}`);
    
    if (success) {
      console.log(`✅ Commande ${cleanOrderData.orderNumber} traitée avec succès`);
    } else {
      console.error(`❌ Échec complet pour commande ${cleanOrderData.orderNumber}`);
    }

    return success;

  } catch (error) {
    console.error('❌ Erreur critique sendOrderToDiscord:', error.message);
    return false;
  }
};

// ============================================
// 6. EXPORT ET INTÉGRATION
// ============================================

/**
 * Interface publique pour remplacer le système Telegram
 */
const DiscordOrderService = {
  // Fonction principale (remplace sendOrderToTelegram)
  sendOrder: sendOrderToDiscord,
  
  // Fonctions utilitaires
  validateConfig: isValidDiscordConfig,
  sanitize: sanitizeInput,
  
  // Configuration
  config: {
    setTimeout: (timeout) => { DISCORD_CONFIG.TIMEOUT = timeout; },
    setRetries: (retries) => { DISCORD_CONFIG.MAX_RETRIES = retries; }
  }
};

// Export pour utilisation
if (typeof module !== 'undefined' && module.exports) {
  // Node.js
  module.exports = DiscordOrderService;
} else {
  // Navigateur
  window.DiscordOrderService = DiscordOrderService;
}

// ============================================
// 7. FONCTION DE TEST SÉCURISÉE
// ============================================

/**
 * Teste le service Discord de manière sécurisée
 */
const testDiscordService = async () => {
  const testOrder = {
    orderNumber: 'TEST-' + Date.now().toString().slice(-6),
    name: 'Client Test',
    email: 'test@incognitomarket.com',
    telegram: 'votrepseudo', // Remplacez par un pseudo Discord réel
    phoneNumber: '+33123456789',
    address: '123 Rue Test',
    city: 'Paris',
    postalCode: '75001',
    country: 'France',
    orderItems: [
      { name: '20 Euro Prop Bills', quantity: 1, price: 100 },
      { name: '50 Euro Prop Bills', quantity: 2, price: 150 }
    ],
    shippingMethod: {
      name: 'Livraison Express',
      price: 2.50,
      delivery: '15-20min'
    },
    paymentMethod: 'PayPal',
    orderDate: new Date().toISOString()
  };

  console.log('🧪 Test du service Discord...');
  const result = await sendOrderToDiscord(testOrder);
  console.log('📊 Résultat du test:', result ? '✅ Succès' : '❌ Échec');
  
  return result;
};

// Export de la fonction de test
if (typeof module !== 'undefined' && module.exports) {
  module.exports.testDiscordService = testDiscordService;
} else {
  window.testDiscordService = testDiscordService;
}

console.log('✅ Service Discord chargé et sécurisé');