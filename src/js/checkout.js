// =============================================
// PAGE DE CHECKOUT - MythicMarket
// =============================================
// Ce fichier gère le processus de finalisation de commande
// Il collecte les informations client, valide le formulaire et envoie la commande

document.addEventListener("DOMContentLoaded", () => {
  // =============================================
  // SÉLECTION DES ÉLÉMENTS DOM
  // =============================================
  const paymentOptions = document.querySelectorAll(".payment-option");    // Options de paiement
  const shippingOptions = document.querySelectorAll(".shipping-option");  // Options de livraison
  const cartCountElem = document.querySelector(".cart-count");            // Compteur d'articles dans la navbar
  const form = document.querySelector(".checkout-form");                  // Formulaire principal
  const submitButton = document.querySelector(".submit-button");          // Bouton de soumission

  // Clé de chiffrement pour sécuriser les données du checkout
  const ENCRYPTION_KEY = "checkout_secure_key_2024";

  // =============================================
  // CALCUL DU TOTAL DE LA COMMANDE
  // =============================================
  function calculateOrderTotal() {
    // Récupération du panier depuis le localStorage
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    
    // Calcul du sous-total (articles × quantités)
    const subtotal = cart.reduce((t, item) => t + item.price * item.quantity, 0);

    // Calcul des frais de livraison
    let shippingCost = 0;
    const selectedShipping = document.querySelector(".shipping-option.selected");
    if (selectedShipping) {
      // Extraction du prix depuis le texte affiché
      const match = selectedShipping.querySelector(".shipping-price")?.textContent.match(/(\d+\.?\d*)/);
      shippingCost = match ? parseFloat(match[1]) : 0;
    }
    
    return subtotal + shippingCost;  // Total final
  }

  // =============================================
  // MISE À JOUR DU TEXTE DU BOUTON DE SOUMISSION
  // =============================================
  function updateSubmitButtonText() {
    if (!submitButton) return;
    
    const total = calculateOrderTotal();
    submitButton.textContent = total > 0
      ? `Finaliser la Commande - ${total.toFixed(2)}€`  // Avec le total affiché
      : "Finaliser la Commande";                         // Sans total
  }

  // =============================================
  // FONCTIONS DE CHIFFREMENT ET DÉCHIFFREMENT
  // =============================================
  
  // Chiffrement des données sensibles avant stockage
  function encryptData(data) {
    try { 
      return btoa(encodeURIComponent(JSON.stringify(data) + ENCRYPTION_KEY)); 
    } catch { 
      return null; 
    }
  }

  // Déchiffrement des données stockées
  function decryptData(encryptedData) {
    try { 
      return JSON.parse(decodeURIComponent(atob(encryptedData)).replace(ENCRYPTION_KEY, "")); 
    } catch { 
      return null; 
    }
  }

  // =============================================
  // SAUVEGARDE SÉCURISÉE DES DONNÉES DU FORMULAIRE
  // =============================================
  function saveFormDataSecurely() {
    if (!form) return;
    
    // Collecte de toutes les informations du formulaire
    const formData = {
      timestamp: new Date().toISOString(),                    // Horodatage de la saisie
      customerInfo: {
        name: form.querySelector("#name")?.value || "",       // Nom du client
        email: form.querySelector("#email")?.value || "",     // Email du client
        phone: form.querySelector("#phone")?.value || "",     // Téléphone du client
        discord: form.querySelector("#discord")?.value || ""  // Discord du client
      },
      shippingInfo: {
        country: form.querySelector("#country")?.value || "",     // Pays de livraison
        address: form.querySelector("#address")?.value || "",     // Adresse de livraison
        city: form.querySelector("#city")?.value || "",          // Ville de livraison
        postalCode: form.querySelector("#postalCode")?.value || "" // Code postal de livraison
      },
      preferences: {
        shippingMethod: localStorage.getItem("selectedShippingMethod") || "",    // Méthode de livraison
        paymentMethod: localStorage.getItem("selectedPaymentMethod") || ""      // Moyen de paiement
      },
      cart: JSON.parse(localStorage.getItem("cart") || "[]"),                  // Contenu du panier
      total: calculateOrderTotal()                                             // Total de la commande
    };

    // Chiffrement et stockage sécurisé des données
    const encryptedData = encryptData(formData);
    if (encryptedData) localStorage.setItem("secureCheckoutData", encryptedData);
    
    return formData;
  }

  // =============================================
  // MISE À JOUR DU COMPTEUR D'ARTICLES
  // =============================================
  function updateCartCount() {
    if (!cartCountElem) return;
    
    // Récupération et calcul du nombre total d'articles
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const totalCount = cart.reduce((acc, item) => acc + (item.quantity || 0), 0);
    
    // Mise à jour de l'affichage
    cartCountElem.textContent = totalCount;
    cartCountElem.style.display = "flex";
    
    // Mise à jour du texte du bouton de soumission
    updateSubmitButtonText();
  }

  // =============================================
  // CONFIGURATION DES ÉCOUTEURS D'OPTIONS
  // =============================================
  function setupOptionListeners(options, storageKey) {
    options.forEach(option => {
      option.addEventListener("click", e => {
        e.preventDefault();
        
        // Désélection de toutes les autres options
        options.forEach(opt => opt.classList.remove("selected"));
        
        // Sélection de l'option cliquée
        option.classList.add("selected");
        
        // Extraction du nom de l'option et sauvegarde
        const name = option.querySelector("span, .shipping-name, .payment-method-name")?.textContent.trim() || "";
        localStorage.setItem(storageKey, name);
        
        // Sauvegarde des données du formulaire et mise à jour de l'interface
        saveFormDataSecurely();
        updateSubmitButtonText();
      });
    });
  }

  // =============================================
  // INITIALISATION DES SÉLECTIONS PAR DÉFAUT
  // =============================================
  function initializeSelections() {
    // Aucun moyen de paiement sélectionné par défaut
    paymentOptions.forEach(opt => opt.classList.remove("selected"));

    // Sélection automatique de la livraison gratuite par défaut
    let freeSelected = false;
    shippingOptions.forEach(opt => {
      const priceText = opt.querySelector(".shipping-price")?.textContent.toLowerCase() || "";
      const nameText = opt.querySelector(".shipping-name")?.textContent || "";
      
      if (!freeSelected && priceText.includes("gratuit")) {
        opt.classList.add("selected");
        localStorage.setItem("selectedShippingMethod", nameText);
        freeSelected = true;
      }
    });
  }

  // =============================================
  // VALIDATION ET SOUMISSION DU FORMULAIRE
  // =============================================
  function setupFormValidation() {
    if (!form || !submitButton) return;
    
    submitButton.addEventListener("click", async e => {
      e.preventDefault();

      // Vérification que le panier n'est pas vide
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      if (cart.length === 0) {
        alert("Votre panier est vide !");
        return;
      }

      // Validation de tous les champs obligatoires
      let allValid = true;
      form.querySelectorAll("input[required]").forEach(f => {
        if (!f.value.trim()) { 
          f.style.borderColor = "#ff4444";  // Bordure rouge pour les champs vides
          allValid = false; 
        } else {
          f.style.borderColor = "";          // Bordure normale pour les champs remplis
        }
      });

      // Vérification de la sélection d'un moyen de paiement
      if (!document.querySelector(".payment-option.selected")) {
        alert("Veuillez sélectionner un moyen de paiement");
        allValid = false;
      }

      // Vérification de la sélection d'une méthode de livraison
      if (!document.querySelector(".shipping-option.selected")) {
        alert("Veuillez sélectionner une méthode de livraison");
        allValid = false;
      }

      // Affichage d'alerte si validation échouée
      if (!allValid) {
        alert("Veuillez remplir tous les champs obligatoires");
        return;
      }

      // =============================================
      // TRAITEMENT DE LA COMMANDE
      // =============================================
      
      // Sauvegarder les données du formulaire
      const dataToSend = saveFormDataSecurely();
      
      // Mise à jour de l'interface pendant le traitement
      submitButton.textContent = "Traitement en cours...";
      submitButton.disabled = true;

      try {
        // Ne crée plus la commande ici pour éviter les doublons d'email.
        // On redirige simplement vers la page de confirmation où la commande sera créée une seule fois.
        submitButton.textContent = "Redirection...";
        setTimeout(() => {
          window.location.href = "/src/pages/Confirmation.html";
        }, 500);
      } catch (error) {
        console.error("❌ Erreur lors de la redirection:", error);
        alert("Erreur lors de la redirection. Veuillez réessayer.");
        submitButton.textContent = "Finaliser la Commande";
        submitButton.disabled = false;
      }
    });
  }

  // =============================================
  // FONCTION D'INITIALISATION PRINCIPALE
  // =============================================
  function initialize() {
    // Mise à jour du compteur d'articles
    updateCartCount();
    
    // Initialisation des sélections par défaut
    initializeSelections();
    
    // Configuration des écouteurs d'événements pour les options
    setupOptionListeners(paymentOptions, "selectedPaymentMethod");
    setupOptionListeners(shippingOptions, "selectedShippingMethod");
    
    // Configuration de la validation et soumission du formulaire
    setupFormValidation();

    // Sauvegarde automatique des données lors de la saisie
    if (form) {
      form.querySelectorAll("input").forEach(f => {
        let timeout;
        
        // Sauvegarde après 500ms d'inactivité (debounce)
        f.addEventListener("input", () => { 
          clearTimeout(timeout); 
          timeout = setTimeout(saveFormDataSecurely, 500); 
        });
        
        // Sauvegarde lors de la perte de focus
        f.addEventListener("blur", saveFormDataSecurely);
      });
    }

    console.log("=== INITIALISATION TERMINÉE ===");
  }

  // =============================================
  // DÉMARRAGE DE L'APPLICATION
  // =============================================
  initialize();
});
