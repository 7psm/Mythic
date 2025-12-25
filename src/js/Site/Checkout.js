// =============================================
//      PAGE DE CHECKOUT - MythicMarket
// =============================================
import { getDiscountCodes, encryptData, decryptData, updateCartCount, formatPrice } from '../utils.js';

document.addEventListener("DOMContentLoaded", () => {
  // =============================================
  //        SÉLECTION DES ÉLÉMENTS DOM
  // =============================================
  const paymentOptions = document.querySelectorAll(".payment-option");
  const shippingOptions = document.querySelectorAll(".shipping-option");
  const form = document.querySelector("form");
  const submitButtonDesktop = document.getElementById("checkout-button-desktop");
  const submitButtonMobile = document.getElementById("checkout-button");
  const buttonPrice = document.getElementById("button-price");
  const buttonPriceMobile = document.getElementById("button-price-mobile");
  const itemsContainer = document.getElementById('recap-items');
  
  // Cache des éléments DOM pour éviter les requêtes répétitives
  const summaryElements = {
    subtotalHT: document.getElementById('summary-subtotal-ht'),
    tva: document.getElementById('summary-tva'),
    totalTTC: document.getElementById('summary-total-ttc'),
    discountSection: document.getElementById('discount-section'),
    discountCodeName: document.getElementById('discount-code-name'),
    discountAmount: document.getElementById('discount-amount'),
    shipping: document.getElementById('summary-shipping'),
    totalWithoutDiscount: document.getElementById('total-without-discount'),
    totalWithDiscount: document.getElementById('total-with-discount'),
    totalOriginal: document.getElementById('summary-total-original'),
    totalCrossed: document.getElementById('summary-total-crossed'),
    totalDiscounted: document.getElementById('summary-total-discounted')
  };

  // =============================================
  //          SAUVEGARDE DES DONNÉES
  // =============================================
  function saveFormDataSecurely() {
    if (!form) return null;
    
    const discordInput = form.querySelector("#discord");
    const nameInput = form.querySelector("#client-name");
    
    const formData = {
      timestamp: new Date().toISOString(),
      customerInfo: {
        discord: discordInput?.value || "",
        discordname: discordInput?.value || "",
        name: nameInput?.value || ""
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
    }
    
    return formData;
  }

  // =============================================
  //                  CALCULS
  // =============================================
  function calculateOrderTotal() {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const subtotal = cart.reduce((t, item) => t + item.price * item.quantity, 0);
    
    const selectedShipping = document.querySelector(".shipping-option.selected");
    const shippingCost = selectedShipping ? (parseFloat(selectedShipping.dataset.price) || 0) : 0;
    
    return subtotal + shippingCost;
  }

  function displayCartItems() {
    if (!itemsContainer) return;
    
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    
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
        <span class="text-gold-primary font-semibold">${formatPrice(item.price * item.quantity)}</span>
      </div>
    `).join('');
  }

  function updateCheckoutSummary() {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const appliedDiscount = JSON.parse(localStorage.getItem('appliedDiscount') || 'null');
    
    // Calculs
    const subtotalHT = cart.reduce((t, item) => t + item.price * item.quantity, 0);
    const tva = subtotalHT * 0.20;
    const totalTTC = subtotalHT + tva;
    
    // Réduction
    let discountAmount = 0;
    if (appliedDiscount) {
      discountAmount = appliedDiscount.type === 'percentage' 
        ? totalTTC * (appliedDiscount.value / 100)
        : appliedDiscount.value;
    }
    const totalAfterDiscount = Math.max(0, totalTTC - discountAmount);
    
    // Frais de livraison
    const selectedShipping = document.querySelector(".shipping-option.selected");
    const shippingCost = selectedShipping ? (parseFloat(selectedShipping.dataset.price) || 0) : 0;
    const finalTotal = totalAfterDiscount + shippingCost;

    // Mise à jour de l'affichage
    if (summaryElements.subtotalHT) summaryElements.subtotalHT.textContent = formatPrice(subtotalHT);
    if (summaryElements.tva) summaryElements.tva.textContent = formatPrice(tva);
    if (summaryElements.totalTTC) summaryElements.totalTTC.textContent = formatPrice(totalTTC);

    // Section réduction
    if (appliedDiscount && discountAmount > 0) {
      if (summaryElements.discountSection) {
        summaryElements.discountSection.classList.remove('hidden');
        if (summaryElements.discountCodeName) summaryElements.discountCodeName.textContent = appliedDiscount.code || 'Code promo';
        if (summaryElements.discountAmount) summaryElements.discountAmount.textContent = `-${formatPrice(discountAmount)}`;
      }
    } else {
      if (summaryElements.discountSection) summaryElements.discountSection.classList.add('hidden');
    }

    // Frais de livraison
    if (summaryElements.shipping) {
      summaryElements.shipping.textContent = shippingCost > 0 ? formatPrice(shippingCost) : 'Gratuit';
    }

    // Total final
    if (appliedDiscount && discountAmount > 0) {
      if (summaryElements.totalWithoutDiscount) summaryElements.totalWithoutDiscount.classList.add('hidden');
      if (summaryElements.totalWithDiscount) {
        summaryElements.totalWithDiscount.classList.remove('hidden');
        if (summaryElements.totalCrossed) summaryElements.totalCrossed.textContent = formatPrice(totalTTC + shippingCost);
        if (summaryElements.totalDiscounted) summaryElements.totalDiscounted.textContent = formatPrice(finalTotal);
      }
    } else {
      if (summaryElements.totalWithoutDiscount) {
        summaryElements.totalWithoutDiscount.classList.remove('hidden');
        if (summaryElements.totalOriginal) summaryElements.totalOriginal.textContent = formatPrice(finalTotal);
      }
      if (summaryElements.totalWithDiscount) summaryElements.totalWithDiscount.classList.add('hidden');
    }

    // Mise à jour du texte des boutons
    const buttonText = cart.length > 0 ? `- ${formatPrice(finalTotal)}` : '';
    if (buttonPrice) buttonPrice.textContent = buttonText;
    if (buttonPriceMobile) buttonPriceMobile.textContent = buttonText;
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
      console.error("❌ Formulaire non trouvé");
      return;
    }
    
    const handleSubmit = async (e) => {
      e.preventDefault();

      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      if (cart.length === 0) {
        alert("Votre panier est vide !");
        return;
      }

      // Validation des champs requis
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

      saveFormDataSecurely();
      
      // Désactiver les boutons pendant le traitement
      if (submitButtonDesktop) {
        submitButtonDesktop.textContent = "Traitement en cours...";
        submitButtonDesktop.disabled = true;
      }
      if (submitButtonMobile) {
        submitButtonMobile.textContent = "Traitement en cours...";
        submitButtonMobile.disabled = true;
      }

      // Redirection vers la page de confirmation
      setTimeout(() => {
        window.location.href = "/src/pages/Confirmation.html";
      }, 500);
    };
    
    // Attacher les événements
    form.addEventListener('submit', handleSubmit);
    if (submitButtonDesktop) submitButtonDesktop.addEventListener("click", handleSubmit);
    if (submitButtonMobile) submitButtonMobile.addEventListener("click", handleSubmit);
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

    // Sauvegarde automatique lors de la saisie
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
  }

  initialize();
});
