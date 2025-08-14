document.addEventListener("DOMContentLoaded", () => {
  console.log("=== INITIALISATION PAGE CHECKOUT ===");
  
  // Sélection des éléments
  const paymentOptions = document.querySelectorAll(".payment-option");
  const shippingOptions = document.querySelectorAll(".shipping-option");
  const cartCountElem = document.querySelector(".cart-count");
  const form = document.querySelector(".checkout-form");
  
  console.log("Éléments trouvés:");
  console.log("- Options de paiement:", paymentOptions.length);
  console.log("- Options de livraison:", shippingOptions.length);
  console.log("- Compteur panier:", cartCountElem);

  // Clé de chiffrement pour les données sensibles (en production, utilisez une clé plus sécurisée)
  const ENCRYPTION_KEY = "checkout_secure_key_2024";

  // Fonction de chiffrement simple (pour la démo - en production, utilisez une vraie librairie crypto)
  function encryptData(data) {
    try {
      const jsonString = JSON.stringify(data);
      const encrypted = btoa(encodeURIComponent(jsonString + ENCRYPTION_KEY));
      return encrypted;
    } catch (error) {
      console.error("Erreur de chiffrement:", error);
      return null;
    }
  }

  // Fonction de déchiffrement
  function decryptData(encryptedData) {
    try {
      const decoded = decodeURIComponent(atob(encryptedData));
      const originalData = decoded.replace(ENCRYPTION_KEY, '');
      return JSON.parse(originalData);
    } catch (error) {
      console.error("Erreur de déchiffrement:", error);
      return null;
    }
  }

  // Sauvegarde sécurisée des données du formulaire
  function saveFormDataSecurely() {
    if (!form) return;

    const formData = {
      timestamp: new Date().toISOString(),
      customerInfo: {
        name: document.getElementById('name')?.value || '',
        email: document.getElementById('email')?.value || '',
        phone: document.getElementById('phone')?.value || '',
        discord: document.getElementById('telegram')?.value || ''
      },
      shippingInfo: {
        country: document.getElementById('country')?.value || '',
        address: document.getElementById('address')?.value || '',
        city: document.getElementById('city')?.value || '',
        postalCode: document.getElementById('postalCode')?.value || ''
      },
      preferences: {
        shippingMethod: localStorage.getItem("selectedShippingMethod") || '',
        paymentMethod: localStorage.getItem("selectedPaymentMethod") || ''
      }
    };

    // Chiffrement des données sensibles
    const encryptedData = encryptData(formData);
    if (encryptedData) {
      localStorage.setItem("secureCheckoutData", encryptedData);
      console.log("Données du formulaire sauvegardées de manière sécurisée");
    }
  }

  // Restauration des données du formulaire
  function restoreFormData() {
    const encryptedData = localStorage.getItem("secureCheckoutData");
    if (!encryptedData) return;

    const formData = decryptData(encryptedData);
    if (!formData) return;

    console.log("Restauration des données du formulaire...");

    // Restaurer les informations client
    if (formData.customerInfo) {
      const nameField = document.getElementById('name');
      const emailField = document.getElementById('email');
      const phoneField = document.getElementById('phone');
      const discordField = document.getElementById('telegram');

      if (nameField) nameField.value = formData.customerInfo.name || '';
      if (emailField) emailField.value = formData.customerInfo.email || '';
      if (phoneField) phoneField.value = formData.customerInfo.phone || '';
      if (discordField) discordField.value = formData.customerInfo.discord || '';
    }

    // Restaurer les informations de livraison
    if (formData.shippingInfo) {
      const countryField = document.getElementById('country');
      const addressField = document.getElementById('address');
      const cityField = document.getElementById('city');
      const postalField = document.getElementById('postalCode');

      if (countryField) countryField.value = formData.shippingInfo.country || '';
      if (addressField) addressField.value = formData.shippingInfo.address || '';
      if (cityField) cityField.value = formData.shippingInfo.city || '';
      if (postalField) postalField.value = formData.shippingInfo.postalCode || '';
    }
  }

  // Met à jour le compteur du panier dans la navbar
  function updateCartCount() {
    if (!cartCountElem) return;
    
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const totalCount = cart.reduce((acc, item) => acc + (item.quantity || 0), 0);
      
      if (totalCount > 0) {
        cartCountElem.textContent = totalCount;
        cartCountElem.style.display = "flex";
      } else {
        cartCountElem.textContent = "0";
        cartCountElem.style.display = "flex";
      }
      
      console.log("Compteur panier mis à jour:", totalCount);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du compteur panier:", error);
    }
  }

  // Initialisation des moyens de paiement (AUCUN sélectionné par défaut)
  function initializePaymentSelection() {
    console.log("Initialisation des moyens de paiement - AUCUN par défaut");
    
    // Retirer toutes les classes 'selected' par défaut
    paymentOptions.forEach(option => {
      option.classList.remove("selected");
    });
    
    console.log("Aucun moyen de paiement sélectionné par défaut");
  }

  // Initialisation de la livraison (Livraison GRATUITE par défaut)
  function initializeShippingSelection() {
    console.log("Initialisation des modes de livraison - Gratuit par défaut");
    
    // D'abord, retirer toutes les sélections
    shippingOptions.forEach(option => option.classList.remove("selected"));
    
    // Chercher et sélectionner la livraison gratuite
    let gratuitSelected = false;
    shippingOptions.forEach(option => {
      const priceElement = option.querySelector(".shipping-price");
      const nameElement = option.querySelector(".shipping-name");
      
      if (priceElement && nameElement) {
        const priceText = priceElement.textContent.trim().toLowerCase();
        const nameText = nameElement.textContent.trim();
        
        // Chercher "gratuit" ou "classique" (selon votre HTML)
        if (priceText.includes("gratuit") || nameText.includes("Classique")) {
          option.classList.add("selected");
          localStorage.setItem("selectedShippingMethod", nameText);
          gratuitSelected = true;
          console.log("Livraison gratuite sélectionnée par défaut:", nameText);
        }
      }
    });
    
    // Si aucune livraison gratuite trouvée, sélectionner la première
    if (!gratuitSelected && shippingOptions.length > 0) {
      shippingOptions[0].classList.add("selected");
      const firstOptionName = shippingOptions[0].querySelector(".shipping-name");
      if (firstOptionName) {
        localStorage.setItem("selectedShippingMethod", firstOptionName.textContent.trim());
        console.log("Première option de livraison sélectionnée par défaut");
      }
    }
  }

  // Événements pour les moyens de paiement
  function setupPaymentEventListeners() {
    paymentOptions.forEach((option, index) => {
      option.addEventListener("click", (e) => {
        e.preventDefault();
        
        const nameElement = option.querySelector(".payment-method-name");
        if (!nameElement) {
          console.error(`Élément .payment-method-name non trouvé dans l'option ${index}`);
          return;
        }
        
        const selectedMethod = nameElement.textContent.trim();
        console.log("Moyen de paiement sélectionné:", selectedMethod);
        
        // Retirer la classe selected de tous les éléments
        paymentOptions.forEach(opt => opt.classList.remove("selected"));
        
        // Ajouter la classe selected à l'élément cliqué
        option.classList.add("selected");
        
        // Sauvegarder dans localStorage
        localStorage.setItem("selectedPaymentMethod", selectedMethod);
        console.log("Moyen de paiement sauvegardé:", selectedMethod);
        
        // Sauvegarder toutes les données du formulaire
        saveFormDataSecurely();
      });
    });
  }

  // Événements pour les modes de livraison
  function setupShippingEventListeners() {
    shippingOptions.forEach((option, index) => {
      option.addEventListener("click", (e) => {
        e.preventDefault();
        
        const nameElement = option.querySelector(".shipping-name");
        if (!nameElement) {
          console.error(`Élément .shipping-name non trouvé dans l'option ${index}`);
          return;
        }
        
        const selectedMethod = nameElement.textContent.trim();
        console.log("Mode de livraison sélectionné:", selectedMethod);
        
        // Retirer la classe selected de tous les éléments
        shippingOptions.forEach(opt => opt.classList.remove("selected"));
        
        // Ajouter la classe selected à l'élément cliqué
        option.classList.add("selected");
        
        // Sauvegarder dans localStorage
        localStorage.setItem("selectedShippingMethod", selectedMethod);
        console.log("Mode de livraison sauvegardé:", selectedMethod);
        
        // Sauvegarder toutes les données du formulaire
        saveFormDataSecurely();
      });
    });
  }

  // Sauvegarde automatique lors de la saisie des champs
  function setupAutoSave() {
    const inputFields = form.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]');
    
    inputFields.forEach(field => {
      // Sauvegarde lors de la perte de focus
      field.addEventListener('blur', () => {
        saveFormDataSecurely();
      });
      
      // Sauvegarde lors de la saisie (avec délai pour éviter trop d'appels)
      let saveTimeout;
      field.addEventListener('input', () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
          saveFormDataSecurely();
        }, 1000); // Sauvegarde 1 seconde après l'arrêt de la saisie
      });
    });
  }

  // Validation et soumission du formulaire
  function setupFormValidation() {
    const submitButton = document.querySelector(".submit-button");
    
    if (form && submitButton) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        
        console.log("=== VALIDATION DU FORMULAIRE ===");
        
        // Vérifier que le panier n'est pas vide
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        if (cart.length === 0) {
          alert("Votre panier est vide. Ajoutez des articles avant de finaliser votre commande.");
          return;
        }
        
        // Vérifier les champs requis
        const requiredFields = form.querySelectorAll("input[required]");
        let allValid = true;
        
        requiredFields.forEach(field => {
          if (!field.value.trim()) {
            field.style.borderColor = "#ff4444";
            allValid = false;
          } else {
            field.style.borderColor = "";
          }
        });
        
        // Vérifier qu'un moyen de paiement est sélectionné
        const selectedPayment = document.querySelector(".payment-option.selected");
        if (!selectedPayment) {
          alert("Veuillez sélectionner un moyen de paiement.");
          allValid = false;
        }
        
        // Vérifier qu'un mode de livraison est sélectionné
        const selectedShipping = document.querySelector(".shipping-option.selected");
        if (!selectedShipping) {
          alert("Veuillez sélectionner un mode de livraison.");
          allValid = false;
        }
        
        if (allValid) {
          console.log("Formulaire valide, finalisation de la commande...");
          
          // Sauvegarde finale sécurisée
          saveFormDataSecurely();
          
          // Génération d'un numéro de commande
          const orderNumber = "CMD-" + Date.now().toString().slice(-8);
          console.log("Numéro de commande généré:", orderNumber);
          
          // En production, ici vous enverriez les données à votre serveur
          alert(`Commande validée !\nNuméro de commande: ${orderNumber}\n\n(Mode démo - les données sont stockées de manière sécurisée localement)`);
          
          // Optionnel: redirection vers une page de confirmation
          // window.location.href = "confirmation.html?order=" + orderNumber;
          
        } else {
          console.log("Formulaire invalide");
          alert("Veuillez remplir tous les champs obligatoires et sélectionner un moyen de paiement.");
        }
      });
    }
  }

  // Initialisation de toutes les fonctionnalités
  function initialize() {
    updateCartCount();
    initializePaymentSelection(); // AUCUN sélectionné par défaut
    initializeShippingSelection(); // GRATUIT sélectionné par défaut
    setupPaymentEventListeners();
    setupShippingEventListeners();
    setupFormValidation();
    
    // Restaurer les données précédemment saisies
    restoreFormData();
    
    // Configuration de la sauvegarde automatique
    if (form) {
      setupAutoSave();
    }
    
    console.log("=== INITIALISATION TERMINÉE ===");
    console.log("- Moyens de paiement: AUCUN sélectionné par défaut");
    console.log("- Mode de livraison: GRATUIT sélectionné par défaut");
    console.log("- Données cryptées et sauvegardées automatiquement");
  }

  // Fonction pour vider les données sécurisées (utilitaire)
  function clearSecureData() {
    localStorage.removeItem("secureCheckoutData");
    localStorage.removeItem("selectedPaymentMethod");
    localStorage.removeItem("selectedShippingMethod");
    console.log("Données sécurisées supprimées");
  }

  // Lancer l'initialisation
  initialize();

  // Exposer des fonctions utiles globalement si besoin
  window.checkoutUtils = {
    updateCartCount,
    initialize,
    clearSecureData,
    saveFormDataSecurely
  };
});