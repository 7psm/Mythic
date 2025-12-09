document.addEventListener("DOMContentLoaded", () => {
  console.log("=== INITIALISATION PAGE PANIER ===");
  
  // =============================================
  // SÉLECTION DES ÉLÉMENTS DOM
  // =============================================
  const cartItemsList = document.querySelector(".cart-items-list");
  const subtotalEl = document.querySelector(".summary-subtotal");
  const totalEl = document.querySelector(".summary-total-value");
  const emptyCartMessage = document.querySelector(".empty-cart-message");
  const cartSummarySection = document.querySelector(".cart-summary-section");
  const cartCountElem = document.querySelector(".cart-count");
  const shippingCost = 0;

  console.log("Éléments DOM trouvés:");
  console.log("- cartItemsList:", cartItemsList);
  console.log("- subtotalEl:", subtotalEl);
  console.log("- totalEl:", totalEl);

  // =============================================
  // FONCTIONS DE GESTION DU STOCKAGE LOCAL
  // =============================================
  
  function readCart() {
  try {
    const cartData = localStorage.getItem("cart");
    console.log("Données brutes du panier:", cartData);
    const cart = JSON.parse(cartData || "[]");
    console.log("Panier parsé:", cart);
    return cart;
  } catch (error) {
    console.error("Erreur lors de la lecture du panier depuis localStorage", error);
    return [];
  }
}

// =============================================
// FONCTION CENTRALE - Récupération des codes depuis localStorage
// =============================================
function getDiscountCodes() {
  try {
    const codes = localStorage.getItem('discountCodes');
    return codes ? JSON.parse(codes) : {};
  } catch (error) {
    console.error('Erreur lecture codes promo:', error);
    return {};
  }
}

function writeCart(cart) {
  try {
    localStorage.setItem("cart", JSON.stringify(cart));
    console.log("Panier sauvegardé:", cart);
  } catch (error) {
    console.error("Erreur lors de l'écriture du panier dans localStorage", error);
  }
}

  // =============================================
  // MISE À JOUR DU COMPTEUR D'ARTICLES
  // =============================================
  function updateCartCount() {
    const cart = readCart();
    const totalCount = cart.reduce((acc, item) => acc + (item.quantity || 0), 0);
    
    if (cartCountElem) {
      if (totalCount > 0) {
        cartCountElem.textContent = totalCount;
        cartCountElem.style.display = "flex";
      } else {
        cartCountElem.textContent = "0";
        cartCountElem.style.display = "flex";
      }
    }
  }

  // =============================================
  // CRÉATION DES ÉLÉMENTS D'ARTICLES DU PANIER AVEC SVG
  // =============================================
  function createCartItemElement(item) {
    console.log("Création de l'élément pour:", item);
    
    const li = document.createElement("li");
    li.className = "cart-item";
    li.dataset.id = item.id;
    li.dataset.price = item.price;

    // Créer un conteneur pour le SVG au lieu d'une image
    const iconContainer = document.createElement('div');
    iconContainer.className = 'item-image';
    
    // Déterminer quel SVG afficher selon la catégorie du produit
    let svgIcon = '';
    const productName = item.name.toLowerCase();
    
    if (productName.includes('nitro')) {
      // Icône Nitro (éclair)
      svgIcon = `
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" fill="#5865F2" stroke="#7289DA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;
    } else if (productName.includes('boost')) {
      // Icône Boost (fusée)
      svgIcon = `
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C12 2 6 6 6 12C6 15 7 18 7 18L12 22L17 18C17 18 18 15 18 12C18 6 12 2 12 2Z" fill="#F093FB" stroke="#F5576C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="12" cy="12" r="2" fill="white"/>
        </svg>
      `;
    } else if (productName.includes('avatar') || productName.includes('décoration')) {
      // Icône Décoration (étoile)
      svgIcon = `
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#43E97B" stroke="#38F9D7" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;
    } else if (productName.includes('member')) {
      // Icône Members (groupe)
      svgIcon = `
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="9" cy="7" r="4" fill="#FA709A" stroke="#FEE140" stroke-width="1.5"/>
          <circle cx="15" cy="9" r="3" fill="#FA709A" stroke="#FEE140" stroke-width="1.5"/>
          <path d="M3 18C3 15 5 13 9 13C13 13 15 15 15 18" stroke="#FA709A" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M15 18C15 16 16 14 19 14C21 14 22 15 22 17" stroke="#FEE140" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      `;
    } else {
      // Icône par défaut (paquet)
      svgIcon = `
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" fill="#5865F2" stroke="#7289DA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <polyline points="7.5 4.21 12 6.81 16.5 4.21" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <polyline points="7.5 19.79 7.5 14.6 3 12" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <polyline points="21 12 16.5 14.6 16.5 19.79" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <line x1="12" y1="22.08" x2="12" y2="12" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;
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
    priceDiv.textContent = `€${item.price.toFixed(2)}`;
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
    totalDiv.textContent = `€${(item.price * item.quantity).toFixed(2)}`;
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-button';
    removeBtn.textContent = 'Supprimer';
    actions.appendChild(totalDiv); 
    actions.appendChild(removeBtn);
    li.appendChild(actions);
    
    return li;
  }

  // =============================================
  // CALCUL ET AFFICHAGE DES TOTAUX
  // =============================================
  function updateCartTotals() {
    let subtotal = 0;
    
    if (!subtotalEl || !totalEl) {
      console.error("Éléments de totaux non trouvés");
      return;
    }
    
    const cartItems = cartItemsList.querySelectorAll(".cart-item");
    
    cartItems.forEach(item => {
      const quantityDisplay = item.querySelector(".quantity-display");
      const itemTotalEl = item.querySelector(".item-total");
      
      if (quantityDisplay && itemTotalEl) {
        const quantity = parseInt(quantityDisplay.textContent) || 0;
        const price = parseFloat(item.dataset.price) || 0;
        
        const itemTotal = quantity * price;
        itemTotalEl.textContent = `€${itemTotal.toFixed(2)}`;
        subtotal += itemTotal;
      }
    });

    subtotalEl.textContent = `€${subtotal.toFixed(2)}`;
    totalEl.textContent = `€${(subtotal + shippingCost).toFixed(2)}`;
    
    console.log("Totaux mis à jour - Sous-total:", subtotal, "Total:", subtotal + shippingCost);
  }

  // =============================================
  // GESTION DE L'AFFICHAGE DU PANIER VIDE
  // =============================================
  function checkIfCartEmpty() {
    const cart = readCart();
    console.log("Vérification panier vide - Nombre d'articles:", cart.length);
    
    if (cartSummarySection) {
      cartSummarySection.style.display = "block";
      console.log("Box récapitulatif affichée");
    }
    
    if (emptyCartMessage) {
      if (cart.length === 0) {
        emptyCartMessage.style.display = "block";
        console.log("Message panier vide affiché");
      } else {
        emptyCartMessage.style.display = "none";
        console.log("Message panier vide masqué");
      }
    } else {
      console.error("Élément .empty-cart-message non trouvé dans le DOM");
    }
  }

  // =============================================
  // CHARGEMENT ET AFFICHAGE DU PANIER
  // =============================================
  function loadCart() {
    console.log("=== CHARGEMENT DU PANIER ===");
    
    if (!cartItemsList) {
      console.error("Liste des articles du panier non trouvée (.cart-items-list)");
      return;
    }
    
    const cart = readCart();
    while (cartItemsList.firstChild) cartItemsList.removeChild(cartItemsList.firstChild);
    
    if (cart.length === 0) {
      console.log("Panier vide, affichage du message");
      checkIfCartEmpty();
      updateCartTotals();
      updateCartCount();
      return;
    }
    
    console.log(`Chargement de ${cart.length} articles`);
    
    cart.forEach((item, index) => {
      if (item.id && item.name && item.price !== undefined && item.quantity) {
        const itemElement = createCartItemElement(item);
        cartItemsList.appendChild(itemElement);
        console.log(`Article ${index + 1} ajouté:`, item.name);
      } else {
        console.warn(`Article ${index + 1} incomplet ignoré:`, item);
      }
    });
    
    updateCartTotals();
    checkIfCartEmpty();
    updateCartCount();
    console.log("=== FIN CHARGEMENT PANIER ===");
  }

  // =============================================
  // SUPPRESSION D'ARTICLES DU PANIER
  // =============================================
  function removeItem(itemElement) {
    console.log("=== SUPPRESSION ARTICLE ===");
    
    const itemId = itemElement.dataset.id;
    console.log("ID à supprimer:", itemId);
    
    let cart = readCart();
    console.log("Panier avant suppression:", cart.length, "articles");
    
    cart = cart.filter(item => item.id.toString() !== itemId.toString());
    console.log("Panier après suppression:", cart.length, "articles");
    
    writeCart(cart);
    itemElement.remove();
    
    updateCartTotals();
    checkIfCartEmpty();
    updateCartCount();
    
    console.log("=== FIN SUPPRESSION ===");
  }

  // =============================================
  // SYNCHRONISATION DU PANIER AVEC LE STOCKAGE
  // =============================================
  function syncCartStorage() {
    const cart = [];
    
    cartItemsList.querySelectorAll(".cart-item").forEach(item => {
      const quantityDisplay = item.querySelector(".quantity-display");
      const nameEl = item.querySelector(".item-name");
      
      if (quantityDisplay && nameEl) {
        cart.push({
          id: item.dataset.id,
          name: nameEl.textContent,
          price: parseFloat(item.dataset.price),
          image: '/public/logo.png', // Image par défaut
          quantity: parseInt(quantityDisplay.textContent) || 1,
        });
      }
    });
    
    writeCart(cart);
  }

  // =============================================
  // GESTION DES ÉVÉNEMENTS SUR LES ARTICLES
  // =============================================
  if (cartItemsList) {
    cartItemsList.addEventListener("click", (e) => {
      const target = e.target;

      if (target.classList.contains("quantity-button")) {
        const isIncrement = target.classList.contains("quantity-increase") || target.textContent.trim() === "+";
        const item = target.closest(".cart-item");
        const display = item.querySelector(".quantity-display");
        const decreaseButton = item.querySelector(".quantity-decrease");
        
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

      if (target.classList.contains("remove-button")) {
        const item = target.closest(".cart-item");
        removeItem(item);
      }
    });
  }

  // =============================================
  // FONCTIONS UTILITAIRES
  // =============================================
  
  function clearCart() {
    if (confirm("Êtes-vous sûr de vouloir vider le panier ?")) {
      writeCart([]);
      loadCart();
    }
  }

  // =============================================
  // INITIALISATION DE LA PAGE
  // =============================================
  
  console.log("Initialisation de la page panier...");
  loadCart();
  
  window.cartUtils = {
    clearCart,
    loadCart,
    readCart
  };
});

// =============================================
// GESTION DES CODES DE RÉDUCTION
// =============================================

function getDiscountCodes() {
  try {
    const codes = localStorage.getItem('discountCodes');
    return codes ? JSON.parse(codes) : {};
  } catch (error) {
    console.error('Erreur lecture codes promo:', error);
    return {};
  }
}

let currentDiscount = null;

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
    console.error('Erreur chargement code promo:', error);
  }
}

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
    elements.tva.textContent = `€${tva.toFixed(2)}`;
  }

  if (currentDiscount) {
    const discountAmount = currentDiscount.type === 'percentage' 
      ? totalTTC * (currentDiscount.value / 100)
      : currentDiscount.value;
    
    const finalTotal = Math.max(0, totalTTC - discountAmount);

    if (elements.total) elements.total.classList.add('hidden');
    if (elements.discountedSection) elements.discountedSection.classList.remove('hidden');
    if (elements.originalPrice) elements.originalPrice.textContent = `€${totalTTC.toFixed(2)}`;
    if (elements.newPrice) elements.newPrice.textContent = `€${finalTotal.toFixed(2)}`;
  } else {
    if (elements.total) elements.total.classList.remove('hidden');
    if (elements.discountedSection) elements.discountedSection.classList.add('hidden');
    if (elements.total) elements.total.textContent = `€${totalTTC.toFixed(2)}`;
  }
}

function showMessage(text, isError = false) {
  const messageEl = document.getElementById('discount-message');
  if (messageEl) {
    messageEl.textContent = text;
    messageEl.className = `mt-2 text-sm ${isError ? 'text-red-400' : 'text-green-400'}`;
    messageEl.classList.remove('hidden');
  }
}

function hideMessage() {
  document.getElementById('discount-message')?.classList.add('hidden');
}

function applyDiscount() {
  const input = document.getElementById('discount-code');
  const code = input.value.trim().toUpperCase();

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

    input.value = '';
    input.disabled = true;
    document.getElementById('apply-discount').disabled = true;
    hideMessage();
    updatePrices();
    
    console.log('✅ Code promo appliqué:', code);
  } else {
    showMessage('❌ Code invalide', true);
  }
}

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
  
  console.log('🗑️ Code promo retiré');
}

function saveDiscountToStorage() {
  if (currentDiscount) {
    localStorage.setItem('appliedDiscount', JSON.stringify(currentDiscount));
  } else {
    localStorage.removeItem('appliedDiscount');
  }
}

document.addEventListener('DOMContentLoaded', function() {
  loadAppliedDiscount(); // 👈 NOUVEAU : charge le code au démarrage
  
  document.getElementById('apply-discount')?.addEventListener('click', applyDiscount);
  document.getElementById('remove-discount')?.addEventListener('click', removeDiscount);
  
  document.getElementById('discount-code')?.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      applyDiscount();
    }
  });

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