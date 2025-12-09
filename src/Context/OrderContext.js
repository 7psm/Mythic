// =============================================
// CONFIGURATION
// =============================================

const CART_STORAGE_KEY = 'cart'; // Clé unifiée pour tout le site

// Méthodes de Livraison
const shippingMethods = [
  {
    id: 1,
    name: "Livraison Express",
    price: 10,
    delivery: "1 - 3 DAYS",
  },
  {
    id: 2,
    name: "Livraison Classique",
    price: 0,
    delivery: "3 - 6 DAYS",
  },  
];

// Méthodes de Paiement
const paymentMethods = [
  "Bank Transfer",
  "Card",
  "PayPal"
];

// Codes de réduction
const DISCOUNT_CODES = {
  'PROMO15': { type: 'percentage', value: 15, description: '-15%' },
  'PROMO25': { type: 'percentage', value: 25, description: '-25%' },
  'WELCOME5': { type: 'fixed', value: 5, description: '-5€' },
};

// =============================================
// GESTION DU PANIER
// =============================================

/**
 * Récupère le panier depuis localStorage
 * @returns {Array} Le panier sous forme de tableau
 */
function getCart() {
  try {
    const cartData = localStorage.getItem(CART_STORAGE_KEY);
    return JSON.parse(cartData || '[]');
  } catch (error) {
    console.error('❌ Erreur lecture panier:', error);
    return [];
  }
}

/**
 * Sauvegarde le panier dans localStorage
 * @param {Array} cart - Le panier à sauvegarder
 */
function saveCart(cart) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    updateCartCount();
  } catch (error) {
    console.error('❌ Erreur sauvegarde panier:', error);
  }
}

/**
 * Ajoute un produit au panier
 * @param {Object} product - Le produit à ajouter
 * @param {Object} option - L'option sélectionnée (optionnel)
 * @returns {Array} Le panier mis à jour
 */
function addToCart(product, option = null) {
  const cart = getCart();
  
  const cartItem = {
    id: Date.now().toString(),
    name: option?.name || product.name,
    price: option?.price || product.price,
    quantity: 1,
    image: product.image || defaultImages[product.category] || '/public/logo.png',
    category: product.category
  };

  // Vérifier si le produit existe déjà
  const existingIndex = cart.findIndex(item => 
    item.name === cartItem.name && 
    Math.abs(item.price - cartItem.price) < 0.01
  );

  if (existingIndex !== -1) {
    cart[existingIndex].quantity += 1;
  } else {
    cart.push(cartItem);
  }

  saveCart(cart);
  console.log('✅ Produit ajouté:', cartItem.name);
  return cart;
}

/**
 * Supprime un produit du panier
 * @param {string} id - L'ID du produit à supprimer
 * @returns {Array} Le panier mis à jour
 */
function removeFromCart(id) {
  const cart = getCart();
  const filtered = cart.filter(item => item.id !== id);
  saveCart(filtered);
  return filtered;
}

/**
 * Met à jour la quantité d'un produit
 * @param {string} id - L'ID du produit
 * @param {number} quantity - La nouvelle quantité
 * @returns {Array} Le panier mis à jour
 */
function updateQuantity(id, quantity) {
  if (quantity < 1) return getCart();
  
  const cart = getCart();
  const updated = cart.map(item => 
    item.id === id ? { ...item, quantity } : item
  );
  
  saveCart(updated);
  return updated;
}

/**
 * Vide complètement le panier
 */
function clearCart() {
  localStorage.removeItem(CART_STORAGE_KEY);
  updateCartCount();
}

/**
 * Compte le nombre total d'articles dans le panier
 * @returns {number} Le nombre total d'articles
 */
function getCartCount() {
  const cart = getCart();
  return cart.reduce((acc, item) => acc + (item.quantity || 0), 0);
}

/**
 * Calcule le sous-total du panier
 * @returns {number} Le sous-total
 */
function calculateSubtotal() {
  const cart = getCart();
  return cart.reduce((total, item) => 
    total + (item.price * item.quantity), 0
  );
}

/**
 * Calcule le total avec livraison
 * @param {Object} shippingMethod - Méthode de livraison choisie
 * @returns {number} Le total
 */
function calculateTotal(shippingMethod = shippingMethods[1]) {
  const subtotal = calculateSubtotal();
  return subtotal + shippingMethod.price;
}

// =============================================
// GESTION DU COMPTEUR PANIER (NAVBAR)
// =============================================

/**
 * Met à jour le compteur du panier dans la navbar
 */
function updateCartCount() {
  const cartCountElements = document.querySelectorAll('.cart-count');
  const count = getCartCount();
  
  cartCountElements.forEach(el => {
    if (el) {
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    }
  });
}

// =============================================
// GESTION DES CODES DE RÉDUCTION
// =============================================

/**
 * Applique un code de réduction
 * @param {string} code - Le code à appliquer
 * @returns {Object|null} Les informations du code ou null si invalide
 */
function applyDiscountCode(code) {
  const upperCode = code.trim().toUpperCase();
  const discount = DISCOUNT_CODES[upperCode];
  
  if (discount) {
    localStorage.setItem('appliedDiscount', JSON.stringify({
      code: upperCode,
      ...discount
    }));
    return discount;
  }
  
  return null;
}

/**
 * Récupère le code de réduction actuel
 * @returns {Object|null}
 */
function getActiveDiscount() {
  try {
    const saved = localStorage.getItem('appliedDiscount');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

/**
 * Supprime le code de réduction
 */
function removeDiscount() {
  localStorage.removeItem('appliedDiscount');
}

/**
 * Calcule le total final avec réduction
 * @param {number} total - Le total avant réduction
 * @returns {Object} { original, final, discount, saved }
 */
function calculateFinalTotal(total) {
  const discount = getActiveDiscount();
  
  if (!discount) {
    return { original: total, final: total, discount: null, saved: 0 };
  }
  
  const discountAmount = discount.type === 'percentage' 
    ? total * (discount.value / 100)
    : discount.value;
    
  const final = Math.max(0, total - discountAmount);
  
  return {
    original: total,
    final: final,
    discount: discount,
    saved: discountAmount
  };
}

// =============================================
// GÉNÉRATION DE NUMÉRO DE COMMANDE
// =============================================

/**
 * Génère un numéro de commande unique
 * @returns {string} Le numéro de commande
 */
function generateOrderNumber() {
  const timestamp = new Date().getTime().toString().slice(-6);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `MM-${timestamp}-${random}`;
}

// =============================================
// INITIALISATION
// =============================================

// Mettre à jour le compteur au chargement
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', updateCartCount);
} else {
  updateCartCount();
}

// Écouter les changements de localStorage entre onglets
window.addEventListener('storage', (e) => {
  if (e.key === CART_STORAGE_KEY) {
    updateCartCount();
  }
});

// =============================================
// EXPORT GLOBAL
// =============================================

window.MythicMarket = {
  // Configuration
  DISCOUNT_CODES,
  
  // Gestion du panier
  getCart,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  getCartCount,
  updateCartCount,
  
  // Calculs
  calculateSubtotal,
  calculateTotal,
  calculateFinalTotal,
  
  // Réductions
  applyDiscountCode,
  getActiveDiscount,
  removeDiscount,
  
  // Utilitaires
  generateOrderNumber
};

console.log('✅ MythicMarket OrderContext initialisé');