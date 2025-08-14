document.addEventListener("DOMContentLoaded", () => {
  console.log("=== INITIALISATION PAGE PANIER ===");
  
  // Sélection des éléments DOM avec la classe correcte
  const cartItemsList = document.querySelector(".cart-items-list");
  const subtotalEl = document.querySelector(".summary-subtotal");
  const totalEl = document.querySelector(".summary-total-value"); // Corrigé selon votre HTML
  const emptyCartMessage = document.querySelector(".empty-cart-message"); // Classe correcte
  const cartSummarySection = document.querySelector(".cart-summary-section");
  const cartCountElem = document.querySelector(".cart-count");
  const shippingCost = 0; // Livraison gratuite

  // Debug: vérifier les éléments trouvés
  console.log("Éléments DOM trouvés:");
  console.log("- cartItemsList:", cartItemsList);
  console.log("- subtotalEl:", subtotalEl);
  console.log("- totalEl:", totalEl);
  console.log("- emptyCartMessage:", emptyCartMessage);
  console.log("- cartSummarySection:", cartSummarySection);

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

  // Créer un élément pour un article du panier
  function createCartItemElement(item) {
    console.log("Création de l'élément pour:", item);
    
    const li = document.createElement("li");
    li.className = "cart-item";
    li.dataset.id = item.id;
    li.dataset.price = item.price;

    li.innerHTML = `
      <img class="item-image" src="${item.image || '/public/50euro.png'}" alt="${item.name}" />
      <div class="item-details">
        <div class="item-name">${item.name}</div>
        <div class="item-price">€${item.price.toFixed(2)}</div>
        <div class="quantity-control">
          <span class="quantity-label">Quantité :</span>
          <div class="quantity-buttons">
            <button class="quantity-button quantity-decrease" ${item.quantity <= 1 ? "disabled" : ""}>-</button>
            <span class="quantity-display">${item.quantity}</span>
            <button class="quantity-button quantity-increase">+</button>
          </div>
        </div>
      </div>
      <div class="item-actions">
        <div class="item-total">€${(item.price * item.quantity).toFixed(2)}</div>
        <button class="remove-button">Supprimer</button>
      </div>
    `;
    return li;
  }

  // Mise à jour des totaux du panier
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

    // Mise à jour des affichages
    subtotalEl.textContent = `€${subtotal.toFixed(2)}`;
    totalEl.textContent = `€${(subtotal + shippingCost).toFixed(2)}`;
    
    console.log("Totaux mis à jour - Sous-total:", subtotal, "Total:", subtotal + shippingCost);
  }

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

  // Charger le panier et afficher les éléments
  function loadCart() {
    console.log("=== CHARGEMENT DU PANIER ===");
    
    if (!cartItemsList) {
      console.error("Liste des articles du panier non trouvée (.cart-items-list)");
      return;
    }
    
    const cart = readCart();
    cartItemsList.innerHTML = ""; // Vider la liste
    
    if (cart.length === 0) {
      console.log("Panier vide, affichage du message");
      checkIfCartEmpty();
      updateCartTotals(); // Mettre les totaux à 0
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

  // Synchroniser le panier avec le localStorage
  function syncCartStorage() {
    const cart = [];
    
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

  // Gestion des événements sur les articles du panier
  if (cartItemsList) {
    cartItemsList.addEventListener("click", (e) => {
      const target = e.target;

      // Gestion des boutons de quantité
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

      // Gestion du bouton supprimer
      if (target.classList.contains("remove-button")) {
        const item = target.closest(".cart-item");
        removeItem(item);
      }
    });
  }

  // Fonction pour vider complètement le panier (utilitaire)
  function clearCart() {
    if (confirm("Êtes-vous sûr de vouloir vider le panier ?")) {
      writeCart([]);
      loadCart();
    }
  }

  // Initialisation de la page
  console.log("Initialisation de la page panier...");
  loadCart();
  
  // Exposer des fonctions utiles globalement si besoin
  window.cartUtils = {
    clearCart,
    loadCart,
    readCart
  };
});