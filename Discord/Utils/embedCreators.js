// =============================================
// EMBED CREATORS
// =============================================
// Fonctions de création d'embeds Discord pour les commandes et notifications

import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

/**
 * Crée un embed détaillé pour une commande (utilisé dans /order et tracking)
 * @param {Object} orderData - Données de la commande
 * @param {Object} orderStatusConfig - Configuration des statuts
 * @returns {EmbedBuilder} Embed Discord
 */
export function createDetailedOrderEmbed(orderData, orderStatusConfig) {
  const config = orderStatusConfig[orderData.status || 'CONFIRMED'];
  const subtotal = orderData.orderItems.reduce((s, item) => s + (item.price * item.quantity), 0);
  const shipping = orderData.shippingMethod?.price || 0;
  
  let discount = 0;
  let promoSection = '';
  
  if (orderData.promoCode || orderData.discount) {
    discount = orderData.discount || 0;
    const promoCode = orderData.promoCode || 'PROMO';
    const discountPercent = subtotal > 0 ? Math.round((discount / subtotal) * 100) : 0;
    
    promoSection = 
      `\n🎁 **Code Promo Utilisé**\n` +
      `\`${promoCode}\` → **-${discountPercent}%** (€${discount.toFixed(2)})\n`;
  }
  
  const total = subtotal + shipping - discount;

  const itemsList = orderData.orderItems.map((item, i) => 
    `> **${i + 1}.** ${item.name}\n> \`×${item.quantity}\` → **€${(item.price * item.quantity).toFixed(2)}**`
  ).join('\n\n');

  const embed = new EmbedBuilder()
    .setAuthor({ 
      name: '🔍 MythicMarket - Suivi de Commande', 
      iconURL: 'https://getmythic.netlify.app/public/logo.png' 
    })
    .setTitle(`Commande n°${orderData.orderNumber}`)
    .setColor(config.color)
    .setDescription(
      `╭─────────────────────╮\n` +
      `│ **${config.label}** │\n` +
      `╰─────────────────────╯`
    )
    .setThumbnail('https://getmythic.netlify.app/public/logo.png')
    .addFields(
      {
        name: '👤 ───── Client ─────',
        value: `> 📧 ${orderData.email}\n> 💤 ${orderData.discord || '`Non renseigné`'}`,
        inline: false
      },
      {
        name: '📦 ───── Livraison ─────',
        value: 
          `> **Mode:** ${orderData.shippingMethod?.name || 'Standard'}\n` +
          `> **Délai:** ${orderData.shippingMethod?.delivery || '6-12H'}\n` +
          `> **Prix:** ${shipping.toFixed(2)}€`,
        inline: true
      },
      {
        name: '💳 ───── Paiement ─────',
        value: `> ${orderData.paymentMethod || 'N/A'}`,
        inline: true
      },
      {
        name: '�️ ───── Articles Commandés ─────',
        value: itemsList,
        inline: false
      },
      {
        name: '💰 ───── Récapitulatif ─────',
        value: 
          `\`\`\`md\n` +
          `# Sous-total     €${subtotal.toFixed(2)}\n` +
          `# Livraison      €${shipping.toFixed(2)}\n` +
          (discount > 0 ? `# Réduction     -€${discount.toFixed(2)}\n` : '') +
          `─────────────────────────\n` +
          `# TOTAL          €${total.toFixed(2)}\n` +
          `\`\`\`\n` +
          promoSection,
        inline: false
      }
    )
    .setFooter({ 
      text: `${new Date(orderData.orderDate).toLocaleString('fr-FR')}`,
      iconURL: 'https://getmythic.netlify.app/public/logo.png'
    })
    .setTimestamp();

  return embed;
}

/**
 * Crée un embed de commande pour les notifications (vendeur ou client)
 * @param {Object} orderData - Données de la commande
 * @param {Object} orderStatusConfig - Configuration des statuts
 * @param {boolean} isVendor - Si c'est pour le vendeur
 * @param {boolean} includeButtons - Si on inclut les boutons d'action
 * @returns {Object} { embed, buttons }
 */
export function createOrderEmbed(orderData, orderStatusConfig, isVendor = false, includeButtons = false) {
  const subtotal = orderData.orderItems.reduce((sum, item) => 
    sum + (item.price * item.quantity), 0
  );
  const shipping = orderData.shippingMethod?.price || 0;
  
  let discount = 0;
  let promoSection = '';
  
  if (orderData.promoCode || orderData.discount) {
    discount = orderData.discount || 0;
    const promoCode = orderData.promoCode || 'PROMO';
    const discountPercent = subtotal > 0 ? Math.round((discount / subtotal) * 100) : 0;
    
    promoSection = 
      `\n🎁 **Code Promo Appliqué**\n` +
      `\`${promoCode}\` → **-${discountPercent}%** (€${discount.toFixed(2)})\n`;
  }
  
  const total = subtotal + shipping - discount;

  const itemsList = orderData.orderItems.map((item, index) => {
    const itemTotal = item.price * item.quantity;
    return `> **${index + 1}.** ${item.name}\n> \`×${item.quantity}\` → **€${itemTotal.toFixed(2)}**`;
  }).join('\n\n');

  const config = orderStatusConfig[orderData.status || 'CONFIRMED'];
  
  const embed = new EmbedBuilder()
    .setAuthor({ 
      name: '🧙 MythicMarket - The World Of Shop', 
      iconURL: 'https://getmythic.netlify.app/public/logo.png' 
    })
    .setTitle(isVendor ? 'Nouvelle Commande Reçue 🛒' : 'Commande Confirmée !')
    .setDescription(
      `╭─────────────────╮\n` +
      `│ **N° ${orderData.orderNumber}** │\n` +
      `╰─────────────────╯\n\n` +
      `**Statut Actuel:** ${config.emoji} **${config.label}**`
    )
    .setColor(config.color)
    .setThumbnail('https://getmythic.netlify.app/public/logo.png')
    .setTimestamp();

  if (isVendor) {
    embed.addFields(
      {
        name: '👤 ───── Informations Client ─────',
        value: 
          `> 📧 **Email:** ${orderData.email}\n` +
          `> 💬 **Discord:** ${orderData.discord || '`Non renseigné`'}`,
        inline: false
      },
      {
        name: '📦 ───── Détails Livraison ─────',
        value: 
          `> **Mode:** ${orderData.shippingMethod?.name || 'Standard'}\n` +
          `> **Délai:** ${orderData.shippingMethod?.delivery || '6-12H'}\n` +
          `> **Prix:** ${shipping.toFixed(2)}€`,
        inline: true
      },
      {
        name: '💳 ───── Paiement ─────',
        value: `> ${orderData.paymentMethod || 'Non spécifié'}`,
        inline: true
      },
      {
        name: '�️ ───── Articles Commandés ─────',
        value: itemsList || '`Aucun article`',
        inline: false
      },
      {
        name: '💰 ───── Montant à Payé ─────',
        value: 
          `\`\`\`md\n` +
          `# Sous-total     €${subtotal.toFixed(2)}\n` +
          `# Livraison      €${shipping.toFixed(2)}\n` +
          (discount > 0 ? `# Réduction     -€${discount.toFixed(2)}\n` : '') +
          `─────────────────────────\n` +
          `# TOTAL          €${total.toFixed(2)}\n` +
          `\`\`\`\n` +
          promoSection,
        inline: false
      }
    );
  } else {
    embed.addFields(
      {
        name: '📦 ───── Livraison ─────',
        value: 
          `> **Mode:** ${orderData.shippingMethod?.name || 'Standard'}\n` +
          `> **Délai:** ${orderData.shippingMethod?.delivery || '6-12H'}\n` +
          `> **Prix:** ${shipping.toFixed(2)}€`,
        inline: true
      },
      {
        name: '💳 ───── Paiement ─────',
        value: `> ${orderData.paymentMethod || 'Non spécifié'}`,
        inline: true
      },
      {
        name: '�️ ───── Vos Articles ─────',
        value: itemsList || '`Aucun article`',
        inline: false
      },
      {
        name: '💰 ───── Montant à Payer ─────',
        value: 
          `\`\`\`md\n` +
          `# Sous-total     €${subtotal.toFixed(2)}\n` +
          `# Livraison      €${shipping.toFixed(2)}\n` +
          (discount > 0 ? `# Réduction     -€${discount.toFixed(2)}\n` : '') +
          `─────────────────────────\n` +
          `# TOTAL          €${total.toFixed(2)}\n` +
          `\`\`\`\n` +
          promoSection,
        inline: false
      }
    );

    if (!includeButtons) {
      embed.addFields({
        name: '📞 ───── Besoin d\'Aide ? ─────',
        value: '> Contactez-nous sur **Discord** ou par **email** !\n> Nous sommes là pour vous aider 24/7 💬',
        inline: false
      });
    }
  }

  embed.setFooter({ 
    text: `MythicMarket © ${new Date(orderData.createdAt || orderData.orderDate).toLocaleString('fr-FR')}`,
    iconURL: 'https://getmythic.netlify.app/public/logo.png'
  });

  let buttons = null;
  if (includeButtons && !isVendor) {
    buttons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`track_${orderData.orderNumber}`)
          .setLabel('📦 Suivre ma commande')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(`cancel_${orderData.orderNumber}`)
          .setLabel('Annuler ma commande')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('❌'),
        new ButtonBuilder()
          .setCustomId(`delivered_${orderData.orderNumber}`)
          .setLabel('Confirmer ma commande')
          .setStyle(ButtonStyle.Success)
          .setEmoji('✅')
      );
  }

  return { embed, buttons };
}

/**
 * Crée un embed pour la notification de changement de statut
 * @param {Object} orderData - Données de la commande
 * @param {string} oldStatus - Ancien statut
 * @param {string} newStatus - Nouveau statut
 * @param {Object} orderStatusConfig - Configuration des statuts
 * @returns {Object} { embed, content, additionalInfo }
 */
export function createStatusChangeEmbed(orderData, oldStatus, newStatus, orderStatusConfig) {
  const statusInfo = orderStatusConfig[newStatus];
  const oldStatusInfo = orderStatusConfig[oldStatus];
  
  const embed = new EmbedBuilder()
    .setAuthor({ 
      name: 'MythicMarket - Mise à Jour', 
      iconURL: 'https://getmythic.netlify.app/public/logo.png' 
    })
    .setTitle('📦 Mise à Jour de Votre Commande')
    .setDescription(
      `╭─────────────────────╮\n` +
      `│ **${orderData.orderNumber}** │\n` +
      `╰─────────────────────╯`
    )
    .setColor(statusInfo?.color || 0xd4af37)
    .setThumbnail('https://getmythic.netlify.app/public/logo.png')
    .addFields(
      { 
        name: '🔄 ───── Changement de Statut ─────', 
        value: 
          `> **Ancien:** ${oldStatusInfo?.emoji || '⏳'} ${oldStatusInfo?.label || 'En attente'}\n` +
          `> **Nouveau:** ${statusInfo.emoji} **${statusInfo.label}**`, 
        inline: false 
      }
    )
    .setFooter({ 
      text: `MythicMarket © ${new Date().getFullYear()}`,
      iconURL: 'https://getmythic.netlify.app/public/logo.png'
    })
    .setTimestamp();

  let content = '';
  let additionalInfo = '';

  switch(newStatus) {
    case 'PREPARING':
      content = '📦 **Votre commande est en préparation !**';
      additionalInfo = '> Nos équipes préparent vos articles avec soin.\n> Vous serez notifié dès l\'expédition.';
      break;
    case 'SHIPPED':
      content = '🚚 **Votre commande a été expédiée !**';
      additionalInfo = `> Délai de livraison: **${orderData.shippingMethod?.delivery || '6-12H'}**\n> Suivez votre colis ci-dessous.`;
      embed.addFields({
        name: '⏰ ───── Livraison Estimée ─────',
        value: `> ${orderData.shippingMethod?.delivery || '6-12H'}`,
        inline: true
      });
      break;
    case 'DELIVERED':
      content = '🎉 **Votre commande est livrée !**';
      additionalInfo = '> Nous espérons que tout est parfait !\n> Merci de votre confiance ❤';
      break;
    case 'CANCELLED':
      content = '❌ **Votre commande a été annulée**';
      additionalInfo = '> Si vous avez des questions, contactez notre support.\n> Nous restons à votre disposition.';
      break;
    case 'REFUNDED':
      content = '💰 **Votre commande a été remboursée**';
      additionalInfo = '> Le remboursement sera effectué sous **3-5 jours ouvrés**.\n> Vous recevrez une confirmation par email.';
      break;
    case 'CONFIRMED':
      content = '✅ **Votre commande est confirmée !**';
      additionalInfo = '> Nous allons bientôt la préparer.\n> Vous serez notifié à chaque étape.';
      break;
    default:
      content = '📦 **Mise à jour de votre commande**';
      additionalInfo = '> Statut mis à jour avec succès.';
  }

  if (additionalInfo) {
    embed.addFields({
      name: '📝 ───── Informations ─────',
      value: additionalInfo,
      inline: false
    });
  }

  return { embed, content };
}

/**
 * Crée un embed pour refus d'accès aux commandes
 * @param {Object} interaction - Interaction Discord
 * @param {string} shopRoleId - ID du rôle requis
 * @returns {EmbedBuilder} Embed Discord
 */
export function createAccessDeniedEmbed(interaction, shopRoleId) {
  return new EmbedBuilder()
    .setTitle('🔒 Accès Refusé')
    .setDescription(
      '**Vous n\'avez pas la permission d\'utiliser cette commande.**\n\n' +
      '⚠️ Cette commande est réservée aux membres du staff.\n' +
      `🎯 Rôle requis : <@&${shopRoleId}>`
    )
    .setColor(0xe74c3c)
    .addFields({
      name: '💡 Besoin d\'aide ?',
      value: 'Contactez un administrateur si vous pensez avoir besoin de cet accès.',
      inline: false
    })
    .setFooter({ 
      text: `Tentative de ${interaction.user.tag}`,
      iconURL: interaction.user.displayAvatarURL()
    })
    .setTimestamp();
}

/**
 * Crée un embed pour notification de demande d'annulation (vendeur)
 * @param {string} orderId - Numéro de commande
 * @param {string} requestedBy - Utilisateur qui demande l'annulation
 * @returns {EmbedBuilder} Embed Discord
 */
export function createCancellationRequestEmbed(orderId, requestedBy) {
  return new EmbedBuilder()
    .setTitle('⚠️ Demande d\'Annulation')
    .setDescription(`**Commande:** \`${orderId}\`\n**Demandée par:** ${requestedBy}`)
    .setColor(0xe74c3c)
    .addFields({
      name: '📋 Action Requise',
      value: `Utilisez \`/status ${orderId} CANCELLED\` pour annuler la commande.`,
      inline: false
    })
    .setTimestamp();
}

/**
 * Crée un embed pour confirmation de livraison (vendeur)
 * @param {string} orderId - Numéro de commande
 * @returns {EmbedBuilder} Embed Discord
 */
export function createDeliveryConfirmationEmbed(orderId) {
  return new EmbedBuilder()
    .setTitle('✅ Livraison Confirmée')
    .setDescription(`**Commande:** \`${orderId}\``)
    .setColor(0x2ecc71)
    .addFields({
      name: '🎉 Statut',
      value: 'Le client a confirmé la réception de sa commande.',
      inline: false
    })
    .setTimestamp();
}