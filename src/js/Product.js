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

  // =============================================
  // 2. État initial de l'application
  // =============================================
  // Billet sélectionné par défaut (50€)
  let selectedBill = "50";
  // Option de prix sélectionnée par défaut (première option)
  let selectedPriceOption = pricingOptions.length > 0 ? pricingOptions[0] : null;
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
    const totalCount = cart.reduce((acc, item) => acc + (item.quantity || 0), 0);
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
      toastContainer.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
        pointer-events: none;
      `;
      document.body.appendChild(toastContainer);
    }

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.style.cssText = `
      background-color: #111015;
      color: white;
      padding: 12px 16px;
      margin-bottom: 12px;
      border-left: 3px solid #d4af37;
      border-radius: 6px;
      max-width: 320px;
      opacity: 0;
      transition: opacity 0.3s ease;
      font-family: Arial, sans-serif;
      pointer-events: auto;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;

    toast.innerHTML = `
      <div style="display: flex; align-items: flex-start; gap: 12px;">
        <!-- ✅ Check icon à gauche -->
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
          stroke="#d4af37" style="width: 16px; height: 16px; margin-top: 15px; flex-shrink: 0;">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>

        <!-- ✅ Texte + lien décalés vers la droite -->
        <div style="flex: 1; margin-left: 4px;">
          <div style="line-height: 1.4; margin-bottom: 8px;">
            <span style="color: #d4af37; font-weight: 600;">${productName}</span>
            <span style="color: #d1d1d1;"> Ajouté au Panier</span>
          </div>

          <a href="Cart.html" style="color: #d4af37; font-weight: 600; text-decoration: none; display: inline-block; font-size: 14px;">
            Voir le Panier &rsaquo;
          </a>
        </div>
      </div>
    `;
    
    toastContainer.appendChild(toast);

    // Animation d'apparition
    requestAnimationFrame(() => {
      toast.style.opacity = "1";
    });

    // Suppression automatique après 4 secondes
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => {
        if (toast.parentNode) {
          toast.remove();
        }
      }, 300);
    }, 4000);
  };

  // Gère l'ajout d'un produit au panier
  const handleAddToCart = (quantity = 1) => {
    if (!selectedPriceOption) {
      console.error("Aucune option de prix sélectionnée");
      return;
    }

    try {
      // Récupère le panier depuis le localStorage ou initialise un tableau vide
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      // Récupère le prix de l'option sélectionnée
      const price = parseFloat(selectedPriceOption.dataset.price);
      
      if (isNaN(price)) {
        console.error("Prix invalide:", selectedPriceOption.dataset.price);
        return;
      }

      const totalPrice = (price * quantity).toFixed(2);
      // Récupère la description (nom) du produit sélectionné
      const productName = selectedPriceOption.querySelector(".amount")?.textContent || "Produit";

      // Vérifie si le produit est déjà dans le panier
      const existingItemIndex = cart.findIndex(item => 
        item.name === productName && 
        Math.abs(item.price - price) < 0.01 // Comparaison de flottants
      );

      if (existingItemIndex !== -1) {
        // Si le produit est déjà dans le panier, incrémente la quantité
        cart[existingItemIndex].quantity += quantity;
      } else {
        // Sinon, ajoute le produit au panier avec un ID unique
        cart.push({
          id: Date.now().toString(), // ID unique en string
          name: productName, // Nom du produit
          price: price, // Prix unitaire
          quantity: quantity, // Quantité
          image: "/public/50euro.png" // Image par défaut
        });
      }
      
      // Sauvegarde le panier dans le localStorage
      localStorage.setItem("cart", JSON.stringify(cart));
      updateCartCount();
      
      // Affiche une notification/toast avec le nom, la quantité et le prix total
      showToast(productName, quantity, totalPrice);
      
      console.log("Produit ajouté au panier:", { productName, quantity, price, totalPrice });
      
    } catch (error) {
      console.error("Erreur lors de l'ajout au panier:", error);
    }
  };

  // Gère le clic sur les conteneurs de billets (version desktop)
  floatingContainers.forEach(container => {
    container.addEventListener("click", () => {
      // Met à jour le billet sélectionné
      selectedBill = container.dataset.bill;

      // Met à jour les classes "active" pour les conteneurs de billets
      toggleActiveClass(floatingContainers, container, "active");

      // Affichage conditionnel des sections produits selon billet
      document.querySelectorAll('.product-display').forEach(section => {
        if (section.dataset.bill === selectedBill) {
          section.style.display = 'block';
        } else {
          section.style.display = 'none';
        }
      });

      // Met à jour la selectedPriceOption pour le nouveau billet
      const visibleOptions = document.querySelectorAll(`.product-display[data-bill="${selectedBill}"] .pricing-option`);
      if (visibleOptions.length > 0) {
        selectedPriceOption = visibleOptions[0];
        toggleActiveClass(document.querySelectorAll('.pricing-option'), selectedPriceOption, "selected");
      }
    });
  });

  // Gère le clic sur les options de prix
  pricingOptions.forEach(option => {
    option.addEventListener("click", () => {
      // Vérifier que cette option appartient au billet sélectionné
      const productDiv = option.closest('.product-display');
      if (productDiv && productDiv.dataset.bill === selectedBill) {
        // Met à jour l'option de prix sélectionnée
        selectedPriceOption = option;
        // Met à jour les classes "selected" pour les options de prix du produit actuel
        const currentProductOptions = productDiv.querySelectorAll('.pricing-option');
        toggleActiveClass(currentProductOptions, option, "selected");
      }
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
      } else {
        console.warn("Le bouton ne correspond pas au billet sélectionné");
      }
    });
  });

  // =============================================
  // 5. Initialisation au chargement de la page
  // =============================================
  
  // Initialiser les options sélectionnées pour chaque produit
  const initializeProductOptions = () => {
    const produits = document.querySelectorAll('.product-display');

    produits.forEach(produit => {
      const options = produit.querySelectorAll('.pricing-option');
      
      options.forEach((option, index) => {
        if (index === 0) {
          option.classList.add('selected');
          // Si c'est le produit du billet sélectionné, définir comme selectedPriceOption
          if (produit.dataset.bill === selectedBill) {
            selectedPriceOption = option;
          }
        } else {
          option.classList.remove('selected');
        }
      });
    });
  };

  // Initialiser l'affichage des produits selon le billet sélectionné
  const initializeProductDisplay = () => {
    document.querySelectorAll('.product-display').forEach(section => {
      if (section.dataset.bill === selectedBill) {
        section.style.display = 'block';
      } else {
        section.style.display = 'none';
      }
    });
  };

  // Initialiser le billet actif
  const initializeActiveBill = () => {
    const defaultContainer = document.querySelector(`[data-bill="${selectedBill}"]`);
    if (defaultContainer) {
      defaultContainer.classList.add('active');
    }
  };

  // Lancer toutes les initialisations
  initializeActiveBill();
  initializeProductDisplay();
  initializeProductOptions();
  updateCartCount();

  console.log("Application initialisée avec le billet:", selectedBill);
});