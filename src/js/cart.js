document.addEventListener("DOMContentLoaded", () => {
  const cartItemsList = document.querySelector(".cart-items-list");
  const subtotalEl = document.querySelector(".summary-subtotal");
  const totalEl = document.querySelector(".summary-total");
  const emptyCartMessage = document.querySelector(".empty-cart-message");
  const cartSummarySection = document.querySelector(".cart-summary-section");
  const shippingCost = 0;  // Si la livraison est gratuite, laisser à 0

  // Fonction pour lire le panier depuis localStorage
  function readCart() {
    try {
      return JSON.parse(localStorage.getItem("cart")) || [];
    } catch (error) {
      console.error("Erreur lors de la lecture du panier depuis localStorage", error);
      return [];
    }
  }



  // Fonction pour écrire dans localStorage
  function writeCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  // Créer un élément pour un article du panier
  function createCartItemElement(item) {
    const li = document.createElement("li");
    li.className = "cart-item";
    li.dataset.id = item.id;
    li.dataset.price = item.price;

    li.innerHTML = `
      <img class="item-image" src="${item.image || '/public/50euro.png'}" alt="${item.name}" />
      <div class="item-details">
        <div class="item-name">Nitro Booost 1 mois</div>
        <div class="item-price">€${item.price.toFixed(2)}</div>
        <div class="quantity-control">
          <span class="quantity-label">Quantité :</span>
          <div class="quantity-buttons">
            <button class="quantity-button" ${item.quantity <= 1 ? "disabled" : ""}>-</button>
            <span class="quantity-display">${item.quantity}</span>
            <button class="quantity-button">+</button>
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
    
    // Sélectionner tous les articles du panier
    const cartItems = cartItemsList.querySelectorAll(".cart-item");
    
    // Calcul du sous-total en fonction des quantités et prix des articles
    cartItems.forEach(item => {
      const quantity = parseInt(item.querySelector(".quantity-display").textContent);
      const price = parseFloat(item.dataset.price);
      
      // Calcul du total pour chaque article
      const itemTotal = quantity * price;
      item.querySelector(".item-total").textContent = `€${itemTotal.toFixed(2)}`;
      
      // Ajout au sous-total global
      subtotal += itemTotal;
    });

    // Mise à jour du sous-total et du total
    subtotalEl.textContent = `€${subtotal.toFixed(2)}`;
    totalEl.textContent = `€${(subtotal + shippingCost).toFixed(2)}`;
  }

  // Vérifier si le panier est vide et afficher ou masquer les sections
  function checkIfCartEmpty() {
    const cart = readCart();
    if (cart.length === 0) {
      emptyCartMessage.style.display = "block";
      cartSummarySection.style.display = "none";
    } else {
      emptyCartMessage.style.display = "none";
      cartSummarySection.style.display = "block";
    }
  }

  // Charger le panier et afficher les éléments
  function loadCart() {
  const cart = readCart();
  cartItemsList.innerHTML = "";  // Vider la liste avant de la remplir
  if (cart.length === 0) {
    checkIfCartEmpty();
    return;
  }
  cart.forEach(item => {
    cartItemsList.appendChild(createCartItemElement(item));
  });
  updateCartTotals();
  checkIfCartEmpty();
}

// Supprimer un article du DOM et synchroniser le panier
function removeItem(itemElement) {
  // Récupérer l'ID de l'article
  const itemId = itemElement.dataset.id;
  
  // Retirer l'article du DOM
  itemElement.remove();
  
  // Récupérer le panier actuel depuis le localStorage
  let cart = readCart();
  
  // Supprimer l'article du tableau en fonction de son ID
  cart = cart.filter(item => item.id !== itemId);

  // Sauvegarder le panier mis à jour dans localStorage
  writeCart(cart);

  // Mise à jour des totaux après suppression
  updateCartTotals();

  // Vérifier si le panier est vide après la suppression
  checkIfCartEmpty();
}

function syncCartStorage() {
  const cart = [];

  // Remplir le panier avec les articles actuels
  cartItemsList.querySelectorAll(".cart-item").forEach(item => {
    const quantity = parseInt(item.querySelector(".quantity-display").textContent);
    const price = parseFloat(item.dataset.price);
    const name = item.querySelector(".item-name").textContent;
    const image = item.querySelector(".item-image").src;

    // Ajouter l'article au panier
    cart.push({
      id: item.dataset.id, // Assurez-vous d'inclure l'ID unique de chaque article
      name,
      price,
      image,
      quantity,
    });
  });

  // Sauvegarder le panier mis à jour dans le localStorage
  localStorage.setItem("cart", JSON.stringify(cart));
}


  // Gestion des clics pour les boutons quantité et suppression
  cartItemsList.addEventListener("click", (e) => {
    const target = e.target;

    // Gérer l'augmentation ou la diminution de la quantité
    if (target.classList.contains("quantity-button")) {
      const isIncrement = target.textContent.trim() === "+";
      const item = target.closest(".cart-item");
      const display = item.querySelector(".quantity-display");
      let quantity = parseInt(display.textContent);

      if (!isIncrement && quantity === 1) return;

      quantity = isIncrement ? quantity + 1 : quantity - 1;
      display.textContent = quantity;

      item.querySelectorAll(".quantity-button")[0].disabled = quantity <= 1;
      updateCartTotals();
      syncCartStorage();
    }

    // Gérer la suppression d'un article
    if (target.classList.contains("remove-button")) {
      const item = target.closest(".cart-item");
      removeItem(item);
    }
  });

  // Ajouter un article au panier
  document.querySelectorAll(".add-to-cart-button").forEach(button => {
    button.addEventListener("click", () => {
      const product = products[selectedBill]; // Le produit actuellement sélectionné
      const selectedOption = product.options[selectedOptionIndex];

      if (!product.name || !product.mobileImage) {
        alert("Produit incomplet, nom ou image manquants.");
        return;
      }

      const cart = readCart();
      const existingItem = cart.find(item => item.name === `${product.name} - ${selectedOption.label}`);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({
          id: Date.now(),
          name: `${product.name} - ${selectedOption.label}`,
          image: product.mobileImage || "https://via.placeholder.com/80",
          price: selectedOption.price,
          quantity: 1
        });
      }

      writeCart(cart);
      loadCart();
    });
  });

  loadCart();  // Initialiser le panier à l'ouverture de la page

});