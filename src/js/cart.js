// =============================================
// GESTIONNAIRE DE PANIER - MythicMarket
// =============================================
// Ce fichier gère l'affichage, la modification et la synchronisation du panier
// Il utilise le localStorage pour persister les données entre les sessions

document.addEventListener("DOMContentLoaded", () => {
  console.log("=== INITIALISATION PAGE PANIER ===");
  
  // =============================================
  // SÉLECTION DES ÉLÉMENTS DOM
  // =============================================
  // Sélection des éléments DOM avec la classe correcte
  const cartItemsList = document.querySelector(".cart-items-list");           // Liste des articles du panier
  const subtotalEl = document.querySelector(".summary-subtotal");             // Affichage du sous-total
  const totalEl = document.querySelector(".summary-total-value");             // Affichage du total (corrigé selon votre HTML)
  const emptyCartMessage = document.querySelector(".empty-cart-message");     // Message "panier vide" (classe correcte)
  const cartSummarySection = document.querySelector(".cart-summary-section"); // Section récapitulatif du panier
  const cartCountElem = document.querySelector(".cart-count");               // Compteur d'articles dans la navbar
  const shippingCost = 0;                                                   // Frais de livraison (gratuit)

  // Debug: vérifier les éléments trouvés
  console.log("Éléments DOM trouvés:");
  console.log("- cartItemsList:", cartItemsList);
  console.log("- subtotalEl:", subtotalEl);
  console.log("- totalEl:", totalEl);
  console.log("- emptyCartMessage:", emptyCartMessage);
  console.log("- cartSummarySection:", cartSummarySection);

  // =============================================
  // FONCTIONS DE GESTION DU STOCKAGE LOCAL
  // =============================================
  
  // Fonction pour lire le panier depuis localStorage
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

  // Fonction pour écrire dans localStorage
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
  // Met à jour le nombre d'articles dans le panier (navbar)
  function updateCartCount() {
    const cart = readCart();
    const totalCount = cart.reduce((acc, item) => acc + (item.quantity || 0), 0);
    
    if (cartCountElem) {
      if (totalCount > 0) {
        cartCountElem.textContent = totalCount;
        cartCountElem.style.display = "flex";
      } else {
        cartCountElem.textContent = "0";
        cartCountElem.style.display = "flex"; // Toujours afficher, même à 0
      }
    }
  }

  // =============================================
  // CRÉATION DES ÉLÉMENTS D'ARTICLES DU PANIER
  // =============================================
  // Créer un élément pour un article du panier
  function createCartItemElement(item) {
    console.log("Création de l'élément pour:", item);
    
    const li = document.createElement("li");
    li.className = "cart-item";
    li.dataset.id = item.id;           // Stockage de l'ID pour la suppression
    li.dataset.price = item.price;     // Stockage du prix pour les calculs

    // Construction DOM sécurisée (sans innerHTML)
    const img = document.createElement('img');
    img.className = 'item-image';
    img.src = item.image || '/public/50euro.png';
    img.alt = item.name;
    li.appendChild(img);

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
    qtyBtns.appendChild(btnDec); qtyBtns.appendChild(qtyDisplay); qtyBtns.appendChild(btnInc);
    qtyCtrl.appendChild(qtyLabel); qtyCtrl.appendChild(qtyBtns);
    details.appendChild(nameDiv); details.appendChild(priceDiv); details.appendChild(qtyCtrl);
    li.appendChild(details);

    const actions = document.createElement('div');
    actions.className = 'item-actions';
    const totalDiv = document.createElement('div');
    totalDiv.className = 'item-total';
    totalDiv.textContent = `€${(item.price * item.quantity).toFixed(2)}`;
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-button';
    removeBtn.textContent = 'Supprimer';
    actions.appendChild(totalDiv); actions.appendChild(removeBtn);
    li.appendChild(actions);
    return li;
  }

  // =============================================
  // CALCUL ET AFFICHAGE DES TOTAUX
  // =============================================
  // Mise à jour des totaux du panier
  function updateCartTotals() {
    let subtotal = 0;
    
    if (!subtotalEl || !totalEl) {
      console.error("Éléments de totaux non trouvés");
      return;
    }
    
    // Parcours de tous les articles du panier pour calculer le total
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

    // Mise à jour des affichages de totaux
    subtotalEl.textContent = `€${subtotal.toFixed(2)}`;
    totalEl.textContent = `€${(subtotal + shippingCost).toFixed(2)}`;
    
    console.log("Totaux mis à jour - Sous-total:", subtotal, "Total:", subtotal + shippingCost);
  }

  // =============================================
  // GESTION DE L'AFFICHAGE DU PANIER VIDE
  // =============================================
  // Vérifier si le panier est vide et gérer l'affichage
  function checkIfCartEmpty() {
    const cart = readCart();
    console.log("Vérification panier vide - Nombre d'articles:", cart.length);
    
    // La box récapitulatif reste TOUJOURS visible
    if (cartSummarySection) {
      cartSummarySection.style.display = "block";
      console.log("Box récapitulatif affichée");
    }
    
    // Gestion du message panier vide
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
  // Charger le panier et afficher les éléments
  function loadCart() {
    console.log("=== CHARGEMENT DU PANIER ===");
    
    if (!cartItemsList) {
      console.error("Liste des articles du panier non trouvée (.cart-items-list)");
      return;
    }
    
    const cart = readCart();
    // Vider la liste en supprimant chaque enfant (évite innerHTML)
    while (cartItemsList.firstChild) cartItemsList.removeChild(cartItemsList.firstChild);
    
    if (cart.length === 0) {
      console.log("Panier vide, affichage du message");
      checkIfCartEmpty();
      updateCartTotals(); // Mettre les totaux à 0
      updateCartCount();
      return;
    }
    
    console.log(`Chargement de ${cart.length} articles`);
    
    // Création et affichage de chaque article
    cart.forEach((item, index) => {
      if (item.id && item.name && item.price !== undefined && item.quantity) {
        const itemElement = createCartItemElement(item);
        cartItemsList.appendChild(itemElement);
        console.log(`Article ${index + 1} ajouté:`, item.name);
      } else {
        console.warn(`Article ${index + 1} incomplet ignoré:`, item);
      }
    });
    
    // Mise à jour de l'affichage
    updateCartTotals();
    checkIfCartEmpty();
    updateCartCount();
    console.log("=== FIN CHARGEMENT PANIER ===");
  }

  // =============================================
  // SUPPRESSION D'ARTICLES DU PANIER
  // =============================================
  // Supprimer un article du panier
  function removeItem(itemElement) {
    console.log("=== SUPPRESSION ARTICLE ===");
    
    const itemId = itemElement.dataset.id;
    console.log("ID à supprimer:", itemId);
    
    let cart = readCart();
    console.log("Panier avant suppression:", cart.length, "articles");
    
    // Supprimer l'article du tableau
    cart = cart.filter(item => item.id.toString() !== itemId.toString());
    console.log("Panier après suppression:", cart.length, "articles");
    
    // Sauvegarder et retirer du DOM
    writeCart(cart);
    itemElement.remove();
    
    // Mettre à jour l'affichage
    updateCartTotals();
    checkIfCartEmpty();
    updateCartCount();
    
    console.log("=== FIN SUPPRESSION ===");
  }

  // =============================================
  // SYNCHRONISATION DU PANIER AVEC LE STOCKAGE
  // =============================================
  // Synchroniser le panier avec le localStorage
  function syncCartStorage() {
    const cart = [];
    
    // Parcours de tous les articles affichés pour reconstruire le panier
    cartItemsList.querySelectorAll(".cart-item").forEach(item => {
      const quantityDisplay = item.querySelector(".quantity-display");
      const nameEl = item.querySelector(".item-name");
      const imageEl = item.querySelector(".item-image");
      
      if (quantityDisplay && nameEl && imageEl) {
        cart.push({
          id: item.dataset.id,
          name: nameEl.textContent,
          price: parseFloat(item.dataset.price),
          image: imageEl.src,
          quantity: parseInt(quantityDisplay.textContent) || 1,
        });
      }
    });
    
    writeCart(cart);
  }

  // =============================================
  // GESTION DES ÉVÉNEMENTS SUR LES ARTICLES
  // =============================================
  // Gestion des événements sur les articles du panier
  if (cartItemsList) {
    cartItemsList.addEventListener("click", (e) => {
      const target = e.target;

      // =============================================
      // GESTION DES BOUTONS DE QUANTITÉ
      // =============================================
      if (target.classList.contains("quantity-button")) {
        const isIncrement = target.classList.contains("quantity-increase") || target.textContent.trim() === "+";
        const item = target.closest(".cart-item");
        const display = item.querySelector(".quantity-display");
        const decreaseButton = item.querySelector(".quantity-decrease");
        
        if (!display) return;
        
        let quantity = parseInt(display.textContent) || 1;

        // Empêcher la quantité de descendre en dessous de 1
        if (!isIncrement && quantity <= 1) return;

        // Mise à jour de la quantité
        quantity = isIncrement ? quantity + 1 : quantity - 1;
        display.textContent = quantity;

        // Gestion de l'état du bouton de diminution
        if (decreaseButton) {
          decreaseButton.disabled = quantity <= 1;
        }
        
        // Mise à jour des totaux et synchronisation
        updateCartTotals();
        syncCartStorage();
        updateCartCount();
      }

      // =============================================
      // GESTION DU BOUTON SUPPRIMER
      // =============================================
      if (target.classList.contains("remove-button")) {
        const item = target.closest(".cart-item");
        removeItem(item);
      }
    });
  }

  // =============================================
  // FONCTIONS UTILITAIRES
  // =============================================
  
  // Fonction pour vider complètement le panier (utilitaire)
  function clearCart() {
    if (confirm("Êtes-vous sûr de vouloir vider le panier ?")) {
      writeCart([]);
      loadCart();
    }
  }

  // =============================================
  // INITIALISATION DE LA PAGE
  // =============================================
  
  // Initialisation de la page
  console.log("Initialisation de la page panier...");
  loadCart();
  
  // Exposer des fonctions utiles globalement si besoin
  window.cartUtils = {
    clearCart,      // Fonction pour vider le panier
    loadCart,       // Fonction pour recharger le panier
    readCart        // Fonction pour lire le panier
  };
});