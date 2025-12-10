// =============================================
//      PAGE DE CHECKOUT - MythicMarket
// =============================================
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Initialisation Checkout");
  
// =============================================
//        SÉLECTION DES ÉLÉMENTS DOM
// =============================================
  const paymentOptions = document.querySelectorAll(".payment-option");
  const shippingOptions = document.querySelectorAll(".shipping-option");
  const cartCountElem = document.querySelector(".cart-count");
  const form = document.querySelector("form");
  const submitButtonDesktop = document.getElementById("checkout-button-desktop");
  const submitButtonMobile = document.getElementById("checkout-button");
  const buttonPrice = document.getElementById("button-price");
  const buttonPriceMobile = document.getElementById("button-price-mobile");

  // Clé de chiffrement
  const ENCRYPTION_KEY = "checkout_secure_key_2024";

  // ✅ CORRECTION : Supprimer la ligne problématique
  // ❌ ANCIEN CODE (qui causait l'erreur) :
  // if (form) {
  //   form.addEventListener('submit', finalizeOrder);
  // }

// ===================================================================
//   FONCTION CENTRALE - Récupération des codes depuis localStorage
// ===================================================================
function getDiscountCodes() {
  try {
    const codes = localStorage.getItem('discountCodes');
    return codes ? JSON.parse(codes) : {};
  } catch (error) {
    console.error('Erreur lecture codes promo:', error);
    return {};
  }
}

// =============================================
//            FONCTIONS UTILITAIRES
// =============================================
  
  function encryptData(data) {
    try { 
      return btoa(encodeURIComponent(JSON.stringify(data) + ENCRYPTION_KEY)); 
    } catch { 
      return null; 
    }
  }

  function decryptData(encryptedData) {
    try { 
      return JSON.parse(decodeURIComponent(atob(encryptedData)).replace(ENCRYPTION_KEY, "")); 
    } catch { 
      return null; 
    }
  }

  // =============================================
  //          SAUVEGARDE DES DONNÉES
  // =============================================
  function saveFormDataSecurely() {
    if (!form) return;
    
    console.log("💾 Sauvegarde des données du formulaire");
    console.log("Discord:", form.querySelector("#discord")?.value);
    console.log("Email:", form.querySelector("#email")?.value);
    
    const formData = {
      timestamp: new Date().toISOString(),
      customerInfo: {
        email: form.querySelector("#email")?.value || "",
        discord: form.querySelector("#discord")?.value || "",
        discordname: form.querySelector("#discord")?.value || ""
      },
      preferences: {
        shippingMethod: localStorage.getItem("selectedShippingMethod") || "",
        paymentMethod: localStorage.getItem("selectedPaymentMethod") || ""
      },
      cart: JSON.parse(localStorage.getItem("cart") || "[]"),
      total: calculateOrderTotal()
    };

    const encryptedData = encryptData(formData);
    if (encryptedData) {
      localStorage.setItem("secureCheckoutData", encryptedData);
      console.log("✅ Données sauvegardées");
    }
    
    return formData;
  }

// =============================================
//                  CALCULS
// =============================================
  function calculateOrderTotal() {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const subtotal = cart.reduce((t, item) => t + item.price * item.quantity, 0);

    let shippingCost = 0;
    const selectedShipping = document.querySelector(".shipping-option.selected");
    if (selectedShipping) {
      shippingCost = parseFloat(selectedShipping.dataset.price) || 0;
    }
    
    return subtotal + shippingCost;
  }

  function updateCartCount() {
    if (!cartCountElem) return;
    
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const totalCount = cart.reduce((acc, item) => acc + (item.quantity || 0), 0);
    
    cartCountElem.textContent = totalCount;
    cartCountElem.style.display = "flex";
  }

  function displayCartItems() {
    console.log("🛒 Affichage des articles du panier");
    
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const itemsContainer = document.getElementById('recap-items');
    
    if (itemsContainer) {
      if (cart.length === 0) {
        itemsContainer.innerHTML = '<p class="text-text-gray text-sm text-center py-4">Votre panier est vide</p>';
        return;
      }
      
      itemsContainer.innerHTML = cart.map(item => `
        <div class="flex justify-between items-center text-sm mb-2 pb-2 border-b border-[rgba(255,255,255,0.05)]">
          <div class="flex-1">
            <span class="text-text-white">${item.name}</span>
            <span class="text-text-gray ml-2">x${item.quantity}</span>
          </div>
          <span class="text-gold-primary font-semibold">€${(item.price * item.quantity).toFixed(2)}</span>
        </div>
      `).join('');
      
      console.log("✅ Articles affichés");
    }
  }

  function updateCheckoutSummary() {
  console.log("💰 Mise à jour du récapitulatif");
  
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const appliedDiscount = JSON.parse(localStorage.getItem('appliedDiscount') || 'null');
  
  // 1. Sous-total HT
  const subtotalHT = cart.reduce((t, item) => t + item.price * item.quantity, 0);
  
  // 2. TVA (20%)
  const tva = subtotalHT * 0.20;
  
  // 3. Total TTC AVANT réduction et livraison
  const totalTTC = subtotalHT + tva;

  // 4. Réduction (si code promo)
  let discountAmount = 0;
  let totalAfterDiscount = totalTTC;
  
  if (appliedDiscount) {
    if (appliedDiscount.type === 'percentage') {
      discountAmount = totalTTC * (appliedDiscount.value / 100);
    } else {
      discountAmount = appliedDiscount.value;
    }
    totalAfterDiscount = Math.max(0, totalTTC - discountAmount);
  }

  // 5. Frais de livraison (ajoutés APRÈS la réduction)
  let shippingCost = 0;
  const selectedShipping = document.querySelector(".shipping-option.selected");
  if (selectedShipping) {
    shippingCost = parseFloat(selectedShipping.dataset.price) || 0;
  }

  // 6. TOTAL FINAL
  const finalTotal = totalAfterDiscount + shippingCost;

  console.log("📊 Détails:", {
    subtotalHT: subtotalHT.toFixed(2),
    tva: tva.toFixed(2),
    totalTTC: totalTTC.toFixed(2),
    discount: discountAmount.toFixed(2),
    shipping: shippingCost.toFixed(2),
    final: finalTotal.toFixed(2)
  });

// =============================================
//         MISE À JOUR DE L'AFFICHAGE
// =============================================
  
  // Sous-total HT
  const subtotalEl = document.getElementById('summary-subtotal-ht');
  if (subtotalEl) subtotalEl.textContent = `€${subtotalHT.toFixed(2)}`;
  
  // TVA
  const tvaEl = document.getElementById('summary-tva');
  if (tvaEl) tvaEl.textContent = `€${tva.toFixed(2)}`;
  
  // Total TTC avant réduction
  const totalTTCEl = document.getElementById('summary-total-ttc');
  if (totalTTCEl) totalTTCEl.textContent = `€${totalTTC.toFixed(2)}`;

  // Section réduction
  const discountSection = document.getElementById('discount-section');
  if (appliedDiscount && discountAmount > 0) {
    if (discountSection) {
      discountSection.classList.remove('hidden');
      const codeNameEl = document.getElementById('discount-code-name');
      const amountEl = document.getElementById('discount-amount');
      if (codeNameEl) codeNameEl.textContent = appliedDiscount.code || 'Code promo';
      if (amountEl) amountEl.textContent = `-€${discountAmount.toFixed(2)}`;
    }
  } else {
    if (discountSection) discountSection.classList.add('hidden');
  }

  // Frais de livraison
  const shippingEl = document.getElementById('summary-shipping');
  if (shippingEl) {
    shippingEl.textContent = shippingCost > 0 ? `€${shippingCost.toFixed(2)}` : 'Gratuit';
  }

  // Affichage du total final
  const totalWithoutDiscount = document.getElementById('total-without-discount');
  const totalWithDiscount = document.getElementById('total-with-discount');
  
  if (appliedDiscount && discountAmount > 0) {
    // Avec réduction : afficher prix barré + nouveau prix
    if (totalWithoutDiscount) totalWithoutDiscount.classList.add('hidden');
    if (totalWithDiscount) {
      totalWithDiscount.classList.remove('hidden');
      const crossedEl = document.getElementById('summary-total-crossed');
      const discountedEl = document.getElementById('summary-total-discounted');
      if (crossedEl) crossedEl.textContent = `€${(totalTTC + shippingCost).toFixed(2)}`;
      if (discountedEl) discountedEl.textContent = `€${finalTotal.toFixed(2)}`;
    }
  } else {
    // Sans réduction : afficher prix normal
    if (totalWithoutDiscount) {
      totalWithoutDiscount.classList.remove('hidden');
      const originalEl = document.getElementById('summary-total-original');
      if (originalEl) originalEl.textContent = `€${finalTotal.toFixed(2)}`;
    }
    if (totalWithDiscount) totalWithDiscount.classList.add('hidden');
  }

  // Mise à jour du texte des boutons
  if (cart.length > 0) {
    const buttonText = `- €${finalTotal.toFixed(2)}`;
    if (buttonPrice) buttonPrice.textContent = buttonText;
    if (buttonPriceMobile) buttonPriceMobile.textContent = buttonText;
  } else {
    if (buttonPrice) buttonPrice.textContent = '';
    if (buttonPriceMobile) buttonPriceMobile.textContent = '';
  }
}

// =============================================
//         CONFIGURATION DES OPTIONS
// =============================================
  function setupOptionListeners(options, storageKey) {
    options.forEach(option => {
      option.addEventListener("click", e => {
        e.preventDefault();
        options.forEach(opt => opt.classList.remove("selected"));
        option.classList.add("selected");
        
        const name = option.querySelector("span, .shipping-name, .payment-method-name")?.textContent.trim() || "";
        localStorage.setItem(storageKey, name);
        
        saveFormDataSecurely();
        updateCheckoutSummary();
      });
    });
  }

  function initializeSelections() {
    paymentOptions.forEach(opt => opt.classList.remove("selected"));
    shippingOptions.forEach(opt => opt.classList.remove("selected"));
  }

// =============================================
//         VALIDATION DU FORMULAIRE
// =============================================
  function setupFormValidation() {
    if (!form) {
      console.error("Formulaire non trouvé");
      return;
    }
    
    const handleSubmit = async (e) => {
      e.preventDefault();

      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      if (cart.length === 0) {
        alert("Votre panier est vide !");
        return;
      }

      let allValid = true;
      form.querySelectorAll("input[required]").forEach(f => {
        if (!f.value.trim()) { 
          f.style.borderColor = "#ff4444";
          allValid = false; 
        } else {
          f.style.borderColor = "";
        }
      });

      if (!document.querySelector(".payment-option.selected")) {
        alert("Veuillez sélectionner un moyen de paiement");
        allValid = false;
      }

      if (!document.querySelector(".shipping-option.selected")) {
        alert("Veuillez sélectionner une méthode de livraison");
        allValid = false;
      }

      if (!allValid) {
        alert("Veuillez remplir tous les champs obligatoires");
        return;
      }

      const dataToSend = saveFormDataSecurely();
      console.log("📤 Données à envoyer:", dataToSend);
      
      if (submitButtonDesktop) {
        submitButtonDesktop.textContent = "Traitement en cours...";
        submitButtonDesktop.disabled = true;
      }
      if (submitButtonMobile) {
        submitButtonMobile.textContent = "Traitement en cours...";
        submitButtonMobile.disabled = true;
      }

      try {
        setTimeout(() => {
          window.location.href = "/src/pages/Confirmation.html";
        }, 500);
      } catch (error) {
        console.error("❌ Erreur:", error);
        alert("Erreur lors de la redirection.");
        if (submitButtonDesktop) {
          submitButtonDesktop.textContent = "Finaliser la Commande";
          submitButtonDesktop.disabled = false;
        }
        if (submitButtonMobile) {
          submitButtonMobile.textContent = "Finaliser la Commande";
          submitButtonMobile.disabled = false;
        }
      }
    };
    
    // ✅ CORRECTION : Attacher l'événement submit au formulaire
    if (form) {
      form.addEventListener('submit', handleSubmit);
    }
    
    // Aussi attacher aux boutons si nécessaire
    if (submitButtonDesktop) {
      submitButtonDesktop.addEventListener("click", handleSubmit);
    }
    if (submitButtonMobile) {
      submitButtonMobile.addEventListener("click", handleSubmit);
    }
  }

// =============================================
//        SÉLECTION SHIPPING & PAYMENT
// =============================================
  shippingOptions.forEach(option => {
    option.addEventListener('click', () => {
      shippingOptions.forEach(o => {
        o.classList.remove('selected', 'bg-[rgba(212,175,55,0.1)]', 'border-[#d4af37]');
      });
      option.classList.add('selected', 'bg-[rgba(212,175,55,0.1)]', 'border-[#d4af37]');
      updateCheckoutSummary();
    });
  });

  paymentOptions.forEach(option => {
    option.addEventListener('click', () => {
      paymentOptions.forEach(o => {
        o.classList.remove('selected', 'bg-[rgba(212,175,55,0.1)]', 'border-[#d4af37]');
      });
      option.classList.add('selected', 'bg-[rgba(212,175,55,0.1)]', 'border-[#d4af37]');
    });
  });

// =============================================
//              INITIALISATION
// =============================================
  function initialize() {
    updateCartCount();
    displayCartItems();
    initializeSelections();
    setupOptionListeners(paymentOptions, "selectedPaymentMethod");
    setupOptionListeners(shippingOptions, "selectedShippingMethod");
    setupFormValidation();

    if (form) {
      form.querySelectorAll("input").forEach(f => {
        let timeout;
        f.addEventListener("input", () => { 
          clearTimeout(timeout); 
          timeout = setTimeout(saveFormDataSecurely, 500); 
        });
        f.addEventListener("blur", saveFormDataSecurely);
      });
    }

    updateCheckoutSummary();
    console.log("✅ Initialisation terminée");
  }

  initialize();
});