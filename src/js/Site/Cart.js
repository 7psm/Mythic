// =============================================
//        PAGE PANIER - MythicMarket
// =============================================
import { getDiscountCodes, updateCartCount, formatPrice, calculateCartTotal } from '../utils.js';

document.addEventListener("DOMContentLoaded", () => {
  // =============================================
  //        SÉLECTION DES ÉLÉMENTS DOM
  // =============================================
  const cartItemsList = document.querySelector(".cart-items-list");
  const subtotalEl = document.querySelector(".summary-subtotal");
  const totalEl = document.querySelector(".summary-total-value");
  const emptyCartMessage = document.querySelector(".empty-cart-message");
  const cartSummarySection = document.querySelector(".cart-summary-section");
  const cartCountElem = document.querySelector(".cart-count");
  const shippingCost = 0;

  // =============================================
  //        GESTION DU STOCKAGE LOCAL
  // =============================================
  
  /**
   * Lit le panier depuis le localStorage
   * @returns {Array} Tableau des articles du panier
   */
  function readCart() {
    try {
      const cartData = localStorage.getItem("cart");
      return JSON.parse(cartData || "[]");
    } catch (error) {
      console.error("❌ Erreur lecture panier:", error);
      return [];
    }
  }

  /**
   * Écrit le panier dans le localStorage
   * @param {Array} cart - Tableau des articles du panier
   */
  function writeCart(cart) {
    try {
      localStorage.setItem("cart", JSON.stringify(cart));
    } catch (error) {
      console.error("❌ Erreur écriture panier:", error);
    }
  }

  // =============================================
  //        CRÉATION DES ÉLÉMENTS D'ARTICLES
  // =============================================
  
  /**
   * Crée un élément DOM pour un article du panier
   * @param {Object} item - Article du panier
   * @returns {HTMLElement} Élément DOM de l'article
   */
  function createCartItemElement(item) {
    const li = document.createElement("li");
    li.className = "cart-item";
    li.dataset.id = item.id;
    li.dataset.price = item.price;

    // Icône SVG selon la catégorie
    const iconContainer = document.createElement('div');
    iconContainer.className = 'item-image';
    
    let svgIcon = '';
    const productName = item.name.toLowerCase();
    
    if (productName.includes('nitro')) {
      svgIcon = `<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" fill="#5865F2" stroke="#7289DA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    } else if (productName.includes('boost')) {
      svgIcon = `<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C12 2 6 6 6 12C6 15 7 18 7 18L12 22L17 18C17 18 18 15 18 12C18 6 12 2 12 2Z" fill="#F093FB" stroke="#F5576C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="2" fill="white"/></svg>`;
    } else if (productName.includes('avatar') || productName.includes('décoration')) {
      svgIcon = `<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#43E97B" stroke="#38F9D7" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    } else if (productName.includes('member')) {
      svgIcon = `<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="9" cy="7" r="4" fill="#FA709A" stroke="#FEE140" stroke-width="1.5"/><circle cx="15" cy="9" r="3" fill="#FA709A" stroke="#FEE140" stroke-width="1.5"/><path d="M3 18C3 15 5 13 9 13C13 13 15 15 15 18" stroke="#FA709A" stroke-width="1.5" stroke-linecap="round"/><path d="M15 18C15 16 16 14 19 14C21 14 22 15 22 17" stroke="#FEE140" stroke-width="1.5" stroke-linecap="round"/></svg>`;
    } else {
      svgIcon = `<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" fill="#5865F2" stroke="#7289DA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><polyline points="7.5 4.21 12 6.81 16.5 4.21" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><polyline points="7.5 19.79 7.5 14.6 3 12" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><polyline points="21 12 16.5 14.6 16.5 19.79" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><polyline points="3.27 6.96 12 12.01 20.73 6.96" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><line x1="12" y1="22.08" x2="12" y2="12" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    }
    
    iconContainer.innerHTML = svgIcon;
    li.appendChild(iconContainer);

    // Détails du produit
    const details = document.createElement('div');
    details.className = 'item-details';
    
    const nameDiv = document.createElement('div');
    nameDiv.className = 'item-name';
    nameDiv.textContent = item.name;
    
    const priceDiv = document.createElement('div');
    priceDiv.className = 'item-price';
    priceDiv.textContent = formatPrice(item.price);
    
    const qtyCtrl = document.createElement('div');
    qtyCtrl.className = 'quantity-control';
    
    const qtyLabel = document.createElement('span');
    qtyLabel.className = 'quantity-label';
    qtyLabel.textContent = 'Quantité :';
    
    const qtyBtns = document.createElement('div');
    qtyBtns.className = 'quantity-buttons';
    
    const btnDec = document.createElement('button');
    btnDec.className = 'quantity-button quantity-decrease';
    if (item.quantity <= 1) btnDec.disabled = true;
    btnDec.textContent = '-';
    
    const qtyDisplay = document.createElement('span');
    qtyDisplay.className = 'quantity-display';
    qtyDisplay.textContent = String(item.quantity);
    
    const btnInc = document.createElement('button');
    btnInc.className = 'quantity-button quantity-increase';
    btnInc.textContent = '+';
    
    qtyBtns.appendChild(btnDec);
    qtyBtns.appendChild(qtyDisplay);
    qtyBtns.appendChild(btnInc);
    qtyCtrl.appendChild(qtyLabel);
    qtyCtrl.appendChild(qtyBtns);
    details.appendChild(nameDiv);
    details.appendChild(priceDiv);
    details.appendChild(qtyCtrl);
    li.appendChild(details);

    // Actions
    const actions = document.createElement('div');
    actions.className = 'item-actions';
    
    const totalDiv = document.createElement('div');
    totalDiv.className = 'item-total';
    totalDiv.textContent = formatPrice(item.price * item.quantity);
    
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-button';
    removeBtn.textContent = 'Supprimer';
    
    actions.appendChild(totalDiv);
    actions.appendChild(removeBtn);
    li.appendChild(actions);
    
    return li;
  }

  // =============================================
  //        CALCUL ET AFFICHAGE DES TOTAUX
  // =============================================
  
  /**
   * Met à jour les totaux du panier
   */
  function updateCartTotals() {
    if (!subtotalEl || !totalEl) return;
    
    const cartItems = cartItemsList?.querySelectorAll(".cart-item") || [];
    let subtotal = 0;
    
    cartItems.forEach(item => {
      const quantityDisplay = item.querySelector(".quantity-display");
      const itemTotalEl = item.querySelector(".item-total");
      
      if (quantityDisplay && itemTotalEl) {
        const quantity = parseInt(quantityDisplay.textContent) || 0;
        const price = parseFloat(item.dataset.price) || 0;
        const itemTotal = quantity * price;
        
        itemTotalEl.textContent = formatPrice(itemTotal);
        subtotal += itemTotal;
      }
    });

    subtotalEl.textContent = formatPrice(subtotal);
    totalEl.textContent = formatPrice(subtotal + shippingCost);
  }

  // =============================================
  //        GESTION DU PANIER VIDE
  // =============================================
  
  /**
   * Vérifie si le panier est vide et met à jour l'affichage
   */
  function checkIfCartEmpty() {
    const cart = readCart();
    
    if (cartSummarySection) {
      cartSummarySection.style.display = "block";
    }
    
    if (emptyCartMessage) {
      emptyCartMessage.style.display = cart.length === 0 ? "block" : "none";
    }
  }

  // =============================================
  //        CHARGEMENT DU PANIER
  // =============================================
  
  /**
   * Charge et affiche le panier
   */
  function loadCart() {
    if (!cartItemsList) return;
    
    const cart = readCart();
    while (cartItemsList.firstChild) {
      cartItemsList.removeChild(cartItemsList.firstChild);
    }
    
    if (cart.length === 0) {
      checkIfCartEmpty();
      updateCartTotals();
      updateCartCount();
      return;
    }
    
    cart.forEach((item) => {
      if (item.id && item.name && item.price !== undefined && item.quantity) {
        const itemElement = createCartItemElement(item);
        cartItemsList.appendChild(itemElement);
      }
    });
    
    updateCartTotals();
    checkIfCartEmpty();
    updateCartCount();
  }

  // =============================================
  //        SUPPRESSION D'ARTICLES
  // =============================================
  
  /**
   * Supprime un article du panier
   * @param {HTMLElement} itemElement - Élément DOM de l'article à supprimer
   */
  function removeItem(itemElement) {
    const itemId = itemElement.dataset.id;
    let cart = readCart();
    cart = cart.filter(item => item.id.toString() !== itemId.toString());
    
    writeCart(cart);
    itemElement.remove();
    
    updateCartTotals();
    checkIfCartEmpty();
    updateCartCount();
  }

  // =============================================
  //        SYNCHRONISATION DU STOCKAGE
  // =============================================
  
  /**
   * Synchronise le panier avec le localStorage
   */
  function syncCartStorage() {
    if (!cartItemsList) return;
    
    const cart = [];
    cartItemsList.querySelectorAll(".cart-item").forEach(item => {
      const quantityDisplay = item.querySelector(".quantity-display");
      const nameEl = item.querySelector(".item-name");
      
      if (quantityDisplay && nameEl) {
        cart.push({
          id: item.dataset.id,
          name: nameEl.textContent,
          price: parseFloat(item.dataset.price),
          image: '/public/logo.png',
          quantity: parseInt(quantityDisplay.textContent) || 1,
        });
      }
    });
    
    writeCart(cart);
  }

  // =============================================
  //        GESTION DES ÉVÉNEMENTS
  // =============================================
  
  if (cartItemsList) {
    cartItemsList.addEventListener("click", (e) => {
      const target = e.target;

      // Gestion des boutons de quantité
      if (target.classList.contains("quantity-button")) {
        const isIncrement = target.classList.contains("quantity-increase") || target.textContent.trim() === "+";
        const item = target.closest(".cart-item");
        const display = item?.querySelector(".quantity-display");
        const decreaseButton = item?.querySelector(".quantity-decrease");
        
        if (!display) return;
        
        let quantity = parseInt(display.textContent) || 1;
        if (!isIncrement && quantity <= 1) return;

        quantity = isIncrement ? quantity + 1 : quantity - 1;
        display.textContent = quantity;

        if (decreaseButton) {
          decreaseButton.disabled = quantity <= 1;
        }
        
        updateCartTotals();
        syncCartStorage();
        updateCartCount();
      }

      // Gestion du bouton de suppression
      if (target.classList.contains("remove-button")) {
        const item = target.closest(".cart-item");
        if (item) removeItem(item);
      }
    });
  }

  // =============================================
  //        FONCTIONS UTILITAIRES
  // =============================================
  
  /**
   * Vide le panier
   */
  function clearCart() {
    if (confirm("Êtes-vous sûr de vouloir vider le panier ?")) {
      writeCart([]);
      loadCart();
    }
  }

  // =============================================
  //        INITIALISATION
  // =============================================
  
  loadCart();
  
  // Exposer les fonctions utilitaires globalement
  window.cartUtils = {
    clearCart,
    loadCart,
    readCart
  };
});

// =============================================
//        GESTION DES CODES DE RÉDUCTION
// =============================================

let currentDiscount = null;

/**
 * Charge le code promo appliqué depuis le localStorage
 */
function loadAppliedDiscount() {
  try {
    const saved = localStorage.getItem('appliedDiscount');
    if (saved) {
      const discountData = JSON.parse(saved);
      currentDiscount = discountData;
      
      const input = document.getElementById('discount-code');
      const applyBtn = document.getElementById('apply-discount');
      const appliedSection = document.getElementById('discount-applied');
      const infoEl = document.getElementById('discount-info');
      
      if (input) input.disabled = true;
      if (applyBtn) applyBtn.disabled = true;
      if (appliedSection) appliedSection.classList.remove('hidden');
      if (infoEl) infoEl.textContent = `✓ Code "${discountData.code}" appliqué (${discountData.description})`;
      
      updatePrices();
    }
  } catch (error) {
    console.error('❌ Erreur chargement code promo:', error);
  }
}

/**
 * Met à jour les prix avec la réduction appliquée
 */
function updatePrices() {
  const elements = {
    subtotal: document.querySelector('.summary-subtotal'),
    tva: document.querySelector('.summary-tva'),
    total: document.querySelector('.summary-total-value'),
    discountedSection: document.querySelector('.summary-total-discounted'),
    originalPrice: document.querySelector('.summary-total-original'),
    newPrice: document.querySelector('.summary-total-new')
  };

  if (!elements.subtotal) return;

  const subtotalText = (elements.subtotal.textContent || elements.subtotal.innerText).replace(/[€\s]/g, '').replace(',', '.');
  const subtotalHT = parseFloat(subtotalText) || 0;
  const tva = subtotalHT * 0.20;
  const totalTTC = subtotalHT + tva;

  if (elements.tva) {
    elements.tva.textContent = formatPrice(tva);
  }

  if (currentDiscount) {
    const discountAmount = currentDiscount.type === 'percentage' 
      ? totalTTC * (currentDiscount.value / 100)
      : currentDiscount.value;
    
    const finalTotal = Math.max(0, totalTTC - discountAmount);

    if (elements.total) elements.total.classList.add('hidden');
    if (elements.discountedSection) elements.discountedSection.classList.remove('hidden');
    if (elements.originalPrice) elements.originalPrice.textContent = formatPrice(totalTTC);
    if (elements.newPrice) elements.newPrice.textContent = formatPrice(finalTotal);
  } else {
    if (elements.total) elements.total.classList.remove('hidden');
    if (elements.discountedSection) elements.discountedSection.classList.add('hidden');
    if (elements.total) elements.total.textContent = formatPrice(totalTTC);
  }
}

/**
 * Affiche un message de notification
 * @param {string} text - Texte du message
 * @param {boolean} isError - Si c'est une erreur
 */
function showMessage(text, isError = false) {
  const messageEl = document.getElementById('discount-message');
  if (messageEl) {
    messageEl.textContent = text;
    messageEl.className = `mt-2 text-sm ${isError ? 'text-red-400' : 'text-green-400'}`;
    messageEl.classList.remove('hidden');
  }
}

/**
 * Cache le message de notification
 */
function hideMessage() {
  document.getElementById('discount-message')?.classList.add('hidden');
}

/**
 * Applique un code de réduction
 */
function applyDiscount() {
  const input = document.getElementById('discount-code');
  const code = input?.value.trim().toUpperCase();

  if (!code) {
    showMessage('⚠️ Veuillez entrer un code', true);
    return;
  }

  const DISCOUNT_CODES = getDiscountCodes();

  if (DISCOUNT_CODES[code]) {
    currentDiscount = {
      code: code,
      ...DISCOUNT_CODES[code]
    };
    saveDiscountToStorage();

    const infoEl = document.getElementById('discount-info');
    const appliedSection = document.getElementById('discount-applied');
    
    if (infoEl) {
      infoEl.textContent = `✓ Code "${code}" appliqué (${currentDiscount.description})`;
    }
    if (appliedSection) {
      appliedSection.classList.remove('hidden');
    }

    if (input) {
      input.value = '';
      input.disabled = true;
    }
    const applyBtn = document.getElementById('apply-discount');
    if (applyBtn) applyBtn.disabled = true;
    
    hideMessage();
    updatePrices();
    showMessage(`✓ Code "${code}" appliqué avec succès!`, false);
  } else {
    showMessage('❌ Code invalide', true);
  }
}

/**
 * Retire le code de réduction appliqué
 */
function removeDiscount() {
  currentDiscount = null;
  localStorage.removeItem('appliedDiscount');
  
  const input = document.getElementById('discount-code');
  if (input) {
    input.disabled = false;
    input.value = '';
  }
  
  const applyBtn = document.getElementById('apply-discount');
  if (applyBtn) applyBtn.disabled = false;
  
  const appliedSection = document.getElementById('discount-applied');
  if (appliedSection) appliedSection.classList.add('hidden');
  
  hideMessage();
  updatePrices();
}

/**
 * Sauvegarde le code promo dans le localStorage
 */
function saveDiscountToStorage() {
  if (currentDiscount) {
    localStorage.setItem('appliedDiscount', JSON.stringify(currentDiscount));
  } else {
    localStorage.removeItem('appliedDiscount');
  }
}

// Initialisation du système de codes promo
document.addEventListener('DOMContentLoaded', function() {
  // Synchronisation entre onglets
  window.addEventListener('storage', function(e) {
    if (e.key === 'discountCodes') {
      const updatedCodes = getDiscountCodes();
      const oldCodes = e.oldValue ? JSON.parse(e.oldValue) : {};
      const newCodes = e.newValue ? JSON.parse(e.newValue) : {};
      const addedCodes = Object.keys(newCodes).filter(k => !oldCodes[k]);
      
      if (addedCodes.length > 0) {
        showMessage(`✨ Nouveau code disponible : ${addedCodes.join(', ')}`, false);
        setTimeout(hideMessage, 5000);
      }
    }
    
    if (e.key === 'appliedDiscount') {
      loadAppliedDiscount();
    }
  });
  
  loadAppliedDiscount();
  
  document.getElementById('apply-discount')?.addEventListener('click', applyDiscount);
  document.getElementById('remove-discount')?.addEventListener('click', removeDiscount);
  
  document.getElementById('discount-code')?.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      applyDiscount();
    }
  });

  // Observer pour mettre à jour les prix automatiquement
  const subtotalEl = document.querySelector('.summary-subtotal');
  if (subtotalEl) {
    const observer = new MutationObserver(updatePrices);
    observer.observe(subtotalEl, { 
      childList: true, 
      characterData: true, 
      subtree: true 
    });
  }

  const cartList = document.querySelector('.cart-items-list');
  if (cartList) {
    const observer = new MutationObserver(updatePrices);
    observer.observe(cartList, { childList: true, subtree: true });
  }

  setTimeout(updatePrices, 300);
});
