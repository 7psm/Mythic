// Écouteur d'événement pour charger le code une fois que le DOM est prêt
document.addEventListener("DOMContentLoaded", () => {
  // =============================================
  // 1. Sélection des éléments du DOM
  // =============================================
  // Sélectionne tous les conteneurs de billets flottants (version desktop)
  const floatingContainers = document.querySelectorAll(".floating-container");
  // Sélectionne toutes les options de prix disponibles
  const pricingOptions = document.querySelectorAll(".pricing-option");
  // Sélectionne le bouton "Ajouter au panier" (version desktop)
  const addToCartBtn = document.querySelector(".add-to-cart-button");
  // Sélectionne l'élément affichant le nombre d'articles dans le panier
  const cartCountElem = document.querySelector(".cart-count");
  // Sélectionne les options de billets (version mobile)
  const mobileBillOptions = document.querySelectorAll(".bill-option");
  // Sélectionne l'image du produit (version mobile)
  const mobileProductImage = document.querySelector(".mobile-product-image");
  // Sélectionne le titre du produit (version mobile)
  const mobileProductTitle = document.querySelector(".product-title");
  // Sélectionne l'élément affichant le prix (version mobile)
  const mobilePriceElem = document.querySelector(".mobile-price");
  // Sélectionne l'élément affichant la quantité sélectionnée (version mobile)
  const mobileQuantityDisplay = document.querySelector(".mobile-quantity-display");
  // Sélectionne les boutons de gestion de la quantité (version mobile)
  const mobileQuantityButtons = document.querySelectorAll(".mobile-quantity-button");
  // Sélectionne le bouton "Ajouter au panier" (version mobile)
  const mobileAddToCartBtn = document.querySelector(".mobile-add-to-cart-button");

  // =============================================
  // 2. État initial de l'application
  // =============================================
  // Billet sélectionné par défaut (50€)
  let selectedBill = "50";
  // Option de prix sélectionnée par défaut (première option)
  let selectedPriceOption = pricingOptions.length > 0 ? pricingOptions[0] : null;
  // Quantité sélectionnée par défaut (version mobile)
  let mobileQuantity = 1;
  // Conteneur pour les notifications/toasts
  let toastContainer = null;

  // =============================================
  // 3. Fonctions utilitaires (helpers)
  // =============================================
  // Met à jour le nombre d'articles dans le panier (affiché dans la navbar)
  const updateCartCount = () => {
    // Récupère le panier depuis le localStorage ou initialise un tableau vide
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    // Calcule le nombre total d'articles dans le panier
      const totalCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    // Met à jour l'affichage du nombre d'articles
      if (cartCountElem) {
        if (totalCount > 0) {
          cartCountElem.textContent = totalCount;
          cartCountElem.style.display = "flex";  // ou "inline-block" selon ton CSS
        } else {
          cartCountElem.textContent = "";        // vide le texte
          cartCountElem.style.display = "none"; // cache l'élément
        }
  }
};
  // Met à jour l'affichage mobile en fonction du billet et de la quantité sélectionnés
  const updateMobileView = () => {
    if (mobileProductTitle && mobileProductImage && mobilePriceElem && selectedPriceOption) {
      // Met à jour le titre du produit (ex: "50€")
      mobileProductTitle.textContent = `${selectedBill}€`;
      // Met à jour l'image du produit en fonction du billet sélectionné
      mobileProductImage.src = selectedBill === "50" ? "img/euro50.png" : "img/euro20.png";
      mobileProductImage.alt = selectedBill === "50" ? "50€ Prop Bill" : "20€ Prop Bill";
      // Calcule et met à jour le prix total (quantité * prix unitaire)
      const totalMobilePrice = (parseFloat(selectedPriceOption.dataset.price) * mobileQuantity).toFixed(2);
      mobilePriceElem.textContent = `€${totalMobilePrice}`;
      // Met à jour l'affichage de la quantité sélectionnée (ex: "2 x 50€")
      if (mobileQuantityDisplay) mobileQuantityDisplay.textContent = `${mobileQuantity} x ${selectedBill}€`;
    }
  };

  // Active/désactive la classe "active" ou "selected" sur un ensemble d'éléments
  const toggleActiveClass = (elements, activeElement, className) => {
    // Désactive la classe pour tous les éléments
    elements.forEach(el => el.classList.remove(className));
    // Active la classe pour l'élément sélectionné
    if (activeElement) activeElement.classList.add(className);
  };

// Affiche la notification
const showToast = (productName, quantity, totalPrice) => {
  if (!toastContainer) {
    toastContainer = document.getElementById("toast-container") || document.createElement("div");
    toastContainer.id = "toast-container";
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.style = `
    background-color: #111015;
    color: white;
    padding: 12px 16px;
    margin-bottom: 12px;
    border-left: 3px solid #d4af37;
    border-radius: 6px;
    max-width: 320px;
    opacity: 0;
    transition: opacity 0.3s ease;
    font-family: 'Arial', sans-serif;
  `;

toast.innerHTML = `
  <div style="display: flex; align-items: flex-start; gap: 12px;">
    <!-- ✅ Check icon à gauche -->
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
      stroke="#d4af37" style="width: 16px; height: 16px; margin-top: 15px;">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
    </svg>

    <!-- ✅ Texte + lien décalés vers la droite -->
    <div style="flex: 1; margin-left: 4px;">
      <div style="line-height: 1.4; margin-bottom: 8px;">
        <span style="color: #d4af37; font-weight: 600;">${productName}</span>
        <span style="color: #d1d1d1;"> Ajouté au Panier</span>
      </div>

      <a href="Cart.html" style="color: #d4af37; font-weight: 600; text-decoration: none; display: inline-block;">
        View Cart &rsaquo;
      </a>
    </div>
  </div>
`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "1";
  }, 10);

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};

// Gère l'ajout d'un produit au panier
const handleAddToCart = (quantity = 1) => {
  if (!selectedPriceOption) return;

  // Récupère le panier depuis le localStorage ou initialise un tableau vide
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  // Récupère le prix de l'option sélectionnée
  const price = parseFloat(selectedPriceOption.dataset.price);
  const totalPrice = (price * quantity).toFixed(2);
  // Récupère la description (nom) du produit sélectionné
  const productName = selectedPriceOption.querySelector(".amount")?.textContent || "Produit";

  // Vérifie si le produit est déjà dans le panier
  const existingItemIndex = cart.findIndex(item => item.bill === selectedBill && item.price === price);

  if (existingItemIndex !== -1) {
    // Si le produit est déjà dans le panier, incrémente la quantité
    cart[existingItemIndex].quantity += quantity;
  } else {
    // Sinon, ajoute le produit au panier
    cart.push({
      bill: selectedBill,
      price: price,
      quantity: quantity,
      description: productName,
    });
  }
  // Sauvegarde le panier dans le localStorage
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  // Affiche une notification/toast avec le nom, la quantité et le prix total
  showToast(productName, quantity, totalPrice);
};


  // =============================================
  // 4. Écouteurs d'événements
  // =============================================
  // Gère les boutons d'incrémentation/décrémentation de la quantité (version mobile)
  mobileQuantityButtons.forEach(button => {
    button.addEventListener("click", () => {
      if (button.dataset.action === "increment") {
        // Incrémente la quantité
        mobileQuantity++;
      } else if (button.dataset.action === "decrement" && mobileQuantity > 1) {
        // Décrémente la quantité (minimum 1)
        mobileQuantity--;
      }
      // Met à jour l'affichage mobile
      updateMobileView();
    });
  });

  // Gère le clic sur les conteneurs de billets (version desktop)
floatingContainers.forEach(container => {
  container.addEventListener("click", () => {
    // Met à jour le billet sélectionné
    selectedBill = container.dataset.bill;

    // Met à jour les classes "active" pour les conteneurs de billets
    toggleActiveClass(floatingContainers, container, "active");

    // Affichage conditionnel des sections produits selon billet
    document.querySelectorAll('.product-display').forEach(section => {
      if(section.dataset.bill === selectedBill) {
        section.style.display = 'block';
      } else {
        section.style.display = 'none';
      }
    });

    // Met à jour les classes "selected" pour les options de billets (version mobile)
    toggleActiveClass(
      mobileBillOptions,
      [...mobileBillOptions].find(opt => opt.dataset.bill === selectedBill),
      "selected"
    );

    // Met à jour l'affichage mobile
    updateMobileView();
  });
});

  // Gère le clic sur les options de billets (version mobile)
  mobileBillOptions.forEach(opt => {
    opt.addEventListener("click", () => {
      // Met à jour le billet sélectionné
      selectedBill = opt.dataset.bill;
      // Met à jour les classes "selected" pour les options de billets
      toggleActiveClass(mobileBillOptions, opt, "selected");
      // Met à jour les classes "active" pour les conteneurs de billets (version desktop)
      toggleActiveClass(
        floatingContainers,
        [...floatingContainers].find(c => c.dataset.bill === selectedBill),
        "active"
      );
      // Met à jour l'affichage mobile
      updateMobileView();
    });
  });

  // Gère le clic sur les options de prix
  pricingOptions.forEach(option => {
    option.addEventListener("click", () => {
      // Met à jour l'option de prix sélectionnée
      selectedPriceOption = option;
      // Met à jour les classes "selected" pour les options de prix
      toggleActiveClass(pricingOptions, option, "selected");
      // Met à jour l'affichage mobile
      updateMobileView();
    });
  });

  // Gère le clic sur le bouton "Ajouter au panier" (version desktop)
const addToCartBtns = document.querySelectorAll(".add-to-cart-button");

addToCartBtns.forEach((btn) => {
  btn.addEventListener("click", (event) => {
    event.preventDefault();
    const productDiv = btn.closest(".product-display");
    const billOfBtn = productDiv ? productDiv.dataset.bill : null;
    if (billOfBtn === selectedBill) {
      handleAddToCart(1);
    }
  });
});

  // Gère le clic sur le bouton "Ajouter au panier" (version mobile)
  if (mobileAddToCartBtn) {
    mobileAddToCartBtn.addEventListener("click", (event) => {
      event.preventDefault(); // Empêche le comportement par défaut
      handleAddToCart(mobileQuantity);
    });
  }

  // =============================================
  // 5. Initialisation au chargement de la page
  // =============================================
  // Met à jour le nombre d'articles dans le panier
  updateCartCount();
  // Met à jour l'affichage mobile
  updateMobileView();
});

window.addEventListener('DOMContentLoaded', () => {
  // Sélectionner tous les blocs produits
  const produits = document.querySelectorAll('.product-display');

  produits.forEach(produit => {
    // Sélectionner toutes les options de prix dans ce produit
    const options = produit.querySelectorAll('.pricing-option');

    options.forEach((option, index) => {
      if (index === 0) {
        option.classList.add('selected');   // Premier => selected
      } else {
        option.classList.remove('selected'); // Les autres => pas selected
      }
    });
  });
});