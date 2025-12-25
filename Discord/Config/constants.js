// =============================================
// DISCORD BOT CONSTANTS
// =============================================
// Configuration et constantes

export const prefix = '&'; 

/**
 * Configuration des statuts de commande
 * Chaque statut a un label, une couleur et un emoji associé
 */
export const ORDER_STATUS = {
  PENDING: { 
    label: 'En attente', 
    color: 0xFFA500, 
    emoji: '⏳',
    description: 'Commande en attente de confirmation'
  },
  CONFIRMED: { 
    label: 'Confirmée', 
    color: 0x43e97b, 
    emoji: '✅',
    description: 'Commande confirmée et en cours de traitement'
  },
  PREPARING: { 
    label: 'En préparation', 
    color: 0x3498db, 
    emoji: '📦',
    description: 'Commande en cours de préparation'
  },
  SHIPPED: { 
    label: 'Expédiée', 
    color: 0x9b59b6, 
    emoji: '🚚',
    description: 'Commande expédiée et en cours de livraison'
  },
  DELIVERED: { 
    label: 'Livrée', 
    color: 0x2ecc71, 
    emoji: '🎉',
    description: 'Commande livrée au client'
  },
  CANCELLED: { 
    label: 'Annulée', 
    color: 0xe74c3c, 
    emoji: '❌',
    description: 'Commande annulée'
  },
  REFUNDED: { 
    label: 'Remboursée', 
    color: 0x95a5a6, 
    emoji: '💰',
    description: 'Commande remboursée'
  }
};

/**
 * Labels pour les périodes de suppression (commande /clearorders)
 */
export const PERIOD_LABELS = {
  '24h': '🕐 Moins de 24 heures',
  '1week': '📅 Plus d\'une semaine',
  '1month': '📆 Plus d\'un mois',
  'all': '🗑️ Toutes les commandes'
};

/**
 * Obtient le label d'une période
 * @param {string} period - Période (24h, 1week, 1month, all)
 * @returns {string} Label formaté
 */
export function getPeriodLabel(period) {
  return PERIOD_LABELS[period] || period;
}

/**
 * Messages d'aide pour les commandes
 */
export const HELP_MESSAGES = {
  status: 'Permet de changer le statut d\'une commande. Le client sera automatiquement notifié.',
  order: 'Affiche les détails complets d\'une commande spécifique.',
  orders: 'Liste les 10 dernières commandes avec filtres optionnels.',
  clearorders: 'Supprime les commandes selon une période et/ou un statut (nécessite les droits admin).',
  backup: 'Crée une sauvegarde JSON de toutes les commandes actuelles.',
  checkaccess: 'Vérifie vos permissions et rôles pour utiliser les commandes du bot.'
};

/**
 * Configuration des couleurs Discord
 */
export const COLORS = {
  SUCCESS: 0x2ecc71,
  ERROR: 0xe74c3c,
  WARNING: 0xe67e22,
  INFO: 0x3498db,
  PRIMARY: 0xd4af37, // Or/Doré
  SECONDARY: 0x95a5a6
};

/**
 * Emojis utilisés dans le bot
 */
export const EMOJIS = {
  SUCCESS: '✅',
  ERROR: '❌',
  WARNING: '⚠️',
  INFO: 'ℹ️',
  LOADING: '⏳',
  PACKAGE: '📦',
  TRUCK: '🚚',
  CELEBRATION: '🎉',
  MONEY: '💰',
  LOCK: '🔒',
  UNLOCK: '🔓',
  TRASH: '🗑️',
  BACKUP: '💾',
  SEARCH: '🔍',
  CANCEL: '🚫'
};

/**
 * Limites et contraintes
 */
export const LIMITS = {
  MAX_ORDERS_DISPLAY: 10, // Nombre max de commandes affichées dans /orders
  MAX_ITEMS_PER_ORDER: 50, // Nombre max d'articles par commande
  BUTTON_TIMEOUT: 300000, // 5 minutes pour les interactions boutons
  COMMAND_COOLDOWN: 3000 // 3 secondes de cooldown entre commandes
};

/**
 * Messages d'erreur standardisés
 */
export const ERROR_MESSAGES = {
  ORDER_NOT_FOUND: '❌ Commande introuvable.',
  NO_ORDERS: '🔭 Aucune commande trouvée.',
  PERMISSION_DENIED: '🔒 Vous n\'avez pas la permission d\'utiliser cette commande.',
  BOT_NOT_READY: '⚠️ Le bot n\'est pas encore prêt. Veuillez réessayer dans quelques secondes.',
  INVALID_STATUS: '❌ Statut invalide.',
  MISSING_DATA: '❌ Données manquantes.',
  GENERIC_ERROR: '❌ Une erreur est survenue.',
  TIMEOUT: '⏱️ Temps écoulé. Action annulée.',
  USER_NOT_FOUND: '❌ Utilisateur Discord introuvable.',
  DM_DISABLED: '❌ L\'utilisateur a désactivé les messages privés.'
};

/**
 * Messages de succès standardisés
 */
export const SUCCESS_MESSAGES = {
  ORDER_UPDATED: '✅ Commande mise à jour avec succès !',
  BACKUP_CREATED: '💾 Sauvegarde créée avec succès !',
  ORDERS_DELETED: '🗑️ Commandes supprimées avec succès !',
  NOTIFICATION_SENT: '📧 Notification envoyée avec succès !',
  STATUS_CHANGED: '✅ Statut mis à jour avec succès !'
};

/**
 * Configuration des intents Discord requis
 */
export const REQUIRED_INTENTS = [
  'Guilds',
  'GuildMembers',
  'DirectMessages',
  'MessageContent',
  'GuildMessages'
];

/**
 * URLs et liens utiles
 */
export const LINKS = {
  LOGO: 'https://getmythic.netlify.app/public/logo.png',
  WEBSITE: 'https://getmythic.netlify.app'
};

/**
 * Calcule le total d'une commande
 * @param {Object} orderData - Données de la commande
 * @returns {number} Total de la commande
 */
export function calculateOrderTotal(orderData) {
  const subtotal = orderData.orderItems.reduce((s, item) => 
    s + (item.price * item.quantity), 0
  );
  const shipping = orderData.shippingMethod?.price || 0;
  const discount = orderData.discount || 0;
  return subtotal + shipping - discount;
}

/**
 * Formate un montant en euros
 * @param {number} amount - Montant à formater
 * @returns {string} Montant formaté (ex: "12.50€")
 */
export function formatPrice(amount) {
  return `${Number(amount || 0).toFixed(2)}€`;
}

/**
 * Formate une date pour Discord (timestamp)
 * @param {Date|string} date - Date à formater
 * @param {string} format - Format ('F' = complet, 'R' = relatif, 't' = heure)
 * @returns {string} Timestamp Discord formaté
 */
export function formatDiscordTimestamp(date, format = 'F') {
  const timestamp = Math.floor(new Date(date).getTime() / 1000);
  return `<t:${timestamp}:${format}>`;
}

/**
 * Tronque un texte avec ellipsis
 * @param {string} text - Texte à tronquer
 * @param {number} maxLength - Longueur maximale
 * @returns {string} Texte tronqué
 */
export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Valide un numéro de commande
 * @param {string} orderNumber - Numéro de commande
 * @returns {boolean} True si valide
 */
export function isValidOrderNumber(orderNumber) {
  // Format attendu: PM-XXXXXX-XXXX
  const pattern = /^PM-\d{6}-\d{4}$/;
  return pattern.test(orderNumber);
}

/**
 * Obtient la couleur selon le statut
 * @param {string} status - Statut de la commande
 * @returns {number} Couleur hexadécimale
 */
export function getStatusColor(status) {
  return ORDER_STATUS[status]?.color || COLORS.INFO;
}

/**
 * Obtient l'emoji selon le statut
 * @param {string} status - Statut de la commande
 * @returns {string} Emoji
 */
export function getStatusEmoji(status) {
  return ORDER_STATUS[status]?.emoji || '📦';
}

/**
 * Configuration par défaut du bot
 */
export const BOT_CONFIG = {
  name: 'MythicMarket Bot',
  version: '2.0.0',
  author: 'MythicMarket Team',
  description: 'Bot de gestion des commandes MythicMarket',
  prefix: '/', // Slash commands uniquement
  defaultColor: COLORS.PRIMARY
};

/**
 * Messages de bienvenue et d'aide
 */
export const WELCOME_MESSAGE = `
**Bienvenue sur le bot MythicMarket ! 🧙**

Ce bot vous permet de gérer facilement vos commandes.

**Commandes disponibles :**
• \`/status\` - Changer le statut d'une commande
• \`/order\` - Voir les détails d'une commande
• \`/orders\` - Liste des commandes récentes
• \`/clearorders\` - Supprimer l'historique (admin)
• \`/backup\` - Sauvegarder les commandes (admin)
• \`/checkaccess\` - Vérifier vos permissions

**Besoin d'aide ?**
Contactez un administrateur ou consultez la documentation.
`;

/**
 * Vérifie si un statut existe
 * @param {string} status - Statut à vérifier
 * @returns {boolean} True si le statut existe
 */
export function isValidStatus(status) {
  return Object.keys(ORDER_STATUS).includes(status);
}

/**
 * Obtient tous les statuts disponibles
 * @returns {Array<string>} Liste des statuts
 */
export function getAllStatuses() {
  return Object.keys(ORDER_STATUS);
}

/**
 * Obtient les statuts actifs (non terminés)
 * @returns {Array<string>} Liste des statuts actifs
 */
export function getActiveStatuses() {
  return ['PENDING', 'CONFIRMED', 'PREPARING', 'SHIPPED'];
}

/**
 * Obtient les statuts terminés
 * @returns {Array<string>} Liste des statuts terminés
 */
export function getCompletedStatuses() {
  return ['DELIVERED', 'CANCELLED', 'REFUNDED'];
}