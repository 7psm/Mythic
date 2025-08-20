// Validation et nettoyage des données
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return String(input);
  return input
    .replace(/[`*_~|\\]/g, '\\$&')
    .replace(/@/g, '@\u200b') // Empêcher les mentions
    .trim()
    .substring(0, 1000); // Limiter la longueur
};

const sanitizeOrderData = (orderData) => {
  if (!orderData || typeof orderData !== 'object') {
    throw new Error('Invalid order data provided');
  }

  return {
    ...orderData,
    name: sanitizeInput(orderData.name || ''),
    email: sanitizeInput(orderData.email || ''),
    phoneNumber: sanitizeInput(orderData.phoneNumber || ''),
    discord: sanitizeInput(orderData.discord || ''),
    address: sanitizeInput(orderData.address || ''),
    city: sanitizeInput(orderData.city || ''),
    postalCode: sanitizeInput(orderData.postalCode || ''),
    country: sanitizeInput(orderData.country || ''),
    shippingTo: sanitizeInput(orderData.shippingTo || ''),
    paymentMethod: sanitizeInput(orderData.paymentMethod || ''),
    orderItems: (orderData.orderItems || []).map(item => ({
      ...item,
      name: sanitizeInput(item.name || ''),
      price: parseFloat(item.price) || 0,
      quantity: parseInt(item.quantity) || 0
    }))
  };
};

/**
 * Crée un embed Discord pour la commande
 */
const createOrderEmbed = (orderData) => {
  const sanitizedData = sanitizeOrderData(orderData);
  
  // Calculs sécurisés
  const subtotal = sanitizedData.orderItems.reduce(
    (total, item) => {
      return total + (item.price * item.quantity);
    }, 
    0
  );
  
  const shippingPrice = parseFloat(sanitizedData.shippingMethod?.price) || 0;
  const total = subtotal + shippingPrice;

  // Format de date sécurisé
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  // Format du coût d'expédition
  const formatShippingCost = (cost) => {
    return cost === 0 ? "GRATUIT" : `€${cost.toFixed(2)}`;
  };

  // Création des champs d'items (limité pour éviter les embeds trop longs)
  const itemsField = sanitizedData.orderItems
    .slice(0, 10) // Limiter à 10 items max
    .map(item => {
      return `• **${item.name}** x${item.quantity} - €${(item.price * item.quantity).toFixed(2)}`;
    })
    .join('\n');

  const embed = {
    title: "🛒 NOUVELLE COMMANDE REÇUE",
    color: 0x00ff00, // Vert
    timestamp: new Date().toISOString(),
    fields: [
      {
        name: "📋 Informations de commande",
        value: `**Numéro:** ${sanitizedData.orderNumber || 'N/A'}\n**Date:** ${formatDate(sanitizedData.orderDate)}`,
        inline: false
      },
      {
        name: "👤 Informations client",
        value: [
          `**Nom:** ${sanitizedData.name}`,
          `**Email:** ${sanitizedData.email}`,
          sanitizedData.phoneNumber ? `**Téléphone:** ${sanitizedData.phoneNumber}` : null,
          sanitizedData.discord ? `**Discord:** ${sanitizedData.discord}` : null
        ].filter(Boolean).join('\n'),
        inline: true
      },
      {
        name: "📍 Adresse de livraison",
        value: [
          `**Adresse:** ${sanitizedData.address}`,
          `**Ville:** ${sanitizedData.city}`,
          `**Code postal:** ${sanitizedData.postalCode}`,
          `**Pays:** ${sanitizedData.country}`,
          `**Type:** ${sanitizedData.shippingTo}`
        ].join('\n'),
        inline: true
      },
      {
        name: "🚚 Méthode d'expédition",
        value: [
          `**Transporteur:** ${sanitizedData.shippingMethod?.name || 'N/A'}`,
          `**Délai:** ${sanitizedData.shippingMethod?.delivery || 'N/A'}`,
          `**Coût:** ${formatShippingCost(shippingPrice)}`
        ].join('\n'),
        inline: false
      },
      {
        name: "🛍️ Articles commandés",
        value: itemsField || 'Aucun article',
        inline: false
      },
      {
        name: "💰 Récapitulatif",
        value: [
          `**Sous-total:** €${subtotal.toFixed(2)}`,
          `**Expédition:** ${formatShippingCost(shippingPrice)} (${sanitizedData.shippingMethod?.name || 'N/A'})`,
          `**Total:** €${total.toFixed(2)}`,
          sanitizedData.paymentMethod ? `**Paiement:** ${sanitizedData.paymentMethod}` : null
        ].filter(Boolean).join('\n'),
        inline: false
      }
    ],
    footer: {
      text: "Système de notification automatique",
      icon_url: "/public/logo.png"
    }
  };

  return embed;
};

/**
 * Envoie une notification Discord via Netlify Function
 */
export const sendOrderToDiscord = async (orderData) => {
  try {
    // Validation des données d'entrée
    if (!orderData || typeof orderData !== 'object') {
      console.error('Données de commande invalides');
      return false;
    }

    console.log('Preparing Discord notification...');

    const embed = createOrderEmbed(orderData);
    
    // URL de la fonction Netlify (sera automatiquement définie par Netlify)
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:8888' 
      : window.location.origin;
    
    const response = await fetch(`${baseUrl}/netlify/functions/discord-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        embed: embed,
        userId: process.env.REACT_APP_DISCORD_USER_ID,
        channelId: process.env.REACT_APP_DISCORD_CHANNEL_ID
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`HTTP ${response.status}: ${errorData.error || 'Unknown error'}`);
    }

    const data = await response.json();
    
    if (data.success) {
      console.log('Discord notification sent successfully:', data);
      return true;
    } else {
      console.error('Discord notification failed:', data);
      return false;
    }
    
  } catch (error) {
    console.error('Error sending Discord notification:', error.message);
    return false;
  }
};