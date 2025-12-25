// =============================================
//        UTILITAIRES PARTAGÉS - MythicMarket
// =============================================
// Fonctions communes utilisées dans plusieurs fichiers

/**
 * Récupère les codes de réduction depuis le localStorage
 * @returns {Object} Objet contenant les codes de réduction
 */
export function getDiscountCodes() {
  try {
    const codes = localStorage.getItem('discountCodes');
    return codes ? JSON.parse(codes) : {};
  } catch (error) {
    console.error('❌ Erreur lecture codes promo:', error);
    return {};
  }
}

/**
 * Chiffre des données avec une clé de sécurité
 * @param {Object} data - Données à chiffrer
 * @param {string} encryptionKey - Clé de chiffrement
 * @returns {string|null} Données chiffrées en base64 ou null en cas d'erreur
 */
export function encryptData(data, encryptionKey = "checkout_secure_key_2024") {
  try {
    return btoa(encodeURIComponent(JSON.stringify(data) + encryptionKey));
  } catch (error) {
    console.error('❌ Erreur chiffrement:', error);
    return null;
  }
}

/**
 * Déchiffre des données avec une clé de sécurité
 * @param {string} encryptedData - Données chiffrées en base64
 * @param {string} encryptionKey - Clé de chiffrement
 * @returns {Object|null} Données déchiffrées ou null en cas d'erreur
 */
export function decryptData(encryptedData, encryptionKey = "checkout_secure_key_2024") {
  try {
    const decoded = decodeURIComponent(atob(encryptedData));
    return JSON.parse(decoded.replace(encryptionKey, ""));
  } catch (error) {
    console.error('❌ Erreur déchiffrement:', error);
    return null;
  }
}

/**
 * Met à jour le compteur du panier dans la navbar
 * @returns {void}
 */
export function updateCartCount() {
  try {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalCount = cart.reduce((acc, item) => acc + (item.quantity || 0), 0);
    const cartCountEl = document.querySelector('.cart-count');
    
    if (cartCountEl) {
      cartCountEl.textContent = totalCount;
      cartCountEl.style.display = totalCount > 0 ? 'flex' : 'none';
    }
  } catch (error) {
    console.error('❌ Erreur mise à jour compteur panier:', error);
  }
}

/**
 * Formate un prix en euros
 * @param {number} price - Prix à formater
 * @returns {string} Prix formaté (ex: "12.50€")
 */
export function formatPrice(price) {
  return `€${Number(price || 0).toFixed(2)}`;
}

/**
 * Calcule le total d'un panier
 * @param {Array} cart - Tableau des articles du panier
 * @returns {number} Total du panier
 */
export function calculateCartTotal(cart) {
  return cart.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);
}

/**
 * Vérifie si un élément DOM existe avant de l'utiliser
 * @param {string} selector - Sélecteur CSS
 * @param {HTMLElement} parent - Élément parent (optionnel, défaut: document)
 * @returns {HTMLElement|null} Élément trouvé ou null
 */
export function safeQuerySelector(selector, parent = document) {
  try {
    return parent.querySelector(selector);
  } catch (error) {
    console.error(`❌ Erreur sélection DOM: ${selector}`, error);
    return null;
  }
}

/**
 * Vérifie si plusieurs éléments DOM existent
 * @param {Array<string>} selectors - Tableau de sélecteurs CSS
 * @param {HTMLElement} parent - Élément parent (optionnel)
 * @returns {Object} Objet avec les éléments trouvés
 */
export function safeQuerySelectors(selectors, parent = document) {
  const elements = {};
  selectors.forEach(selector => {
    const key = selector.replace(/[#.]/g, '').replace(/-/g, '_');
    elements[key] = safeQuerySelector(selector, parent);
  });
  return elements;
}

