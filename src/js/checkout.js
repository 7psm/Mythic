document.addEventListener("DOMContentLoaded", () => {
  const paymentOptions = document.querySelectorAll(".payment-option");
  const shippingOptions = document.querySelectorAll(".shipping-option");
  const cartCountElem = document.querySelector(".cart-count");
  const form = document.querySelector(".checkout-form");
  const submitButton = document.querySelector(".submit-button");

  const ENCRYPTION_KEY = "checkout_secure_key_2024";

  function calculateOrderTotal() {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const subtotal = cart.reduce((t, item) => t + item.price * item.quantity, 0);

    let shippingCost = 0;
    const selectedShipping = document.querySelector(".shipping-option.selected");
    if (selectedShipping) {
      const match = selectedShipping.querySelector(".shipping-price")?.textContent.match(/(\d+\.?\d*)/);
      shippingCost = match ? parseFloat(match[1]) : 0;
    }
    return subtotal + shippingCost;
  }

  function updateSubmitButtonText() {
    if (!submitButton) return;
    const total = calculateOrderTotal();
    submitButton.textContent = total > 0
      ? `Finaliser la Commande - ${total.toFixed(2)}€`
      : "Finaliser la Commande";
  }

  function encryptData(data) {
    try { return btoa(encodeURIComponent(JSON.stringify(data) + ENCRYPTION_KEY)); }
    catch { return null; }
  }

  function decryptData(encryptedData) {
    try { return JSON.parse(decodeURIComponent(atob(encryptedData)).replace(ENCRYPTION_KEY, "")); }
    catch { return null; }
  }

  function saveFormDataSecurely() {
    if (!form) return;
    const formData = {
      timestamp: new Date().toISOString(),
      customerInfo: {
        name: form.querySelector("#name")?.value || "",
        email: form.querySelector("#email")?.value || "",
        phone: form.querySelector("#phone")?.value || "",
        discord: form.querySelector("#discord")?.value || ""
      },
      shippingInfo: {
        country: form.querySelector("#country")?.value || "",
        address: form.querySelector("#address")?.value || "",
        city: form.querySelector("#city")?.value || "",
        postalCode: form.querySelector("#postalCode")?.value || ""
      },
      preferences: {
        shippingMethod: localStorage.getItem("selectedShippingMethod") || "",
        paymentMethod: localStorage.getItem("selectedPaymentMethod") || ""
      },
      cart: JSON.parse(localStorage.getItem("cart") || "[]"),
      total: calculateOrderTotal()
    };

    const encryptedData = encryptData(formData);
    if (encryptedData) localStorage.setItem("secureCheckoutData", encryptedData);
    return formData;
  }

  function updateCartCount() {
    if (!cartCountElem) return;
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const totalCount = cart.reduce((acc, item) => acc + (item.quantity || 0), 0);
    cartCountElem.textContent = totalCount;
    cartCountElem.style.display = "flex";
    updateSubmitButtonText();
  }

  function setupOptionListeners(options, storageKey) {
    options.forEach(option => {
      option.addEventListener("click", e => {
        e.preventDefault();
        options.forEach(opt => opt.classList.remove("selected"));
        option.classList.add("selected");
        const name = option.querySelector("span, .shipping-name, .payment-method-name")?.textContent.trim() || "";
        localStorage.setItem(storageKey, name);
        saveFormDataSecurely();
        updateSubmitButtonText();
      });
    });
  }

  function initializeSelections() {
    // Aucun moyen de paiement sélectionné
    paymentOptions.forEach(opt => opt.classList.remove("selected"));

    // Livraison gratuite par défaut
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

  function setupFormValidation() {
    if (!form || !submitButton) return;
    submitButton.addEventListener("click", async e => {
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
        }
        else f.style.borderColor = "";
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

      // Sauvegarder les données du formulaire
      const dataToSend = saveFormDataSecurely();
      
      // Afficher un message de confirmation
      submitButton.textContent = "Traitement en cours...";
      submitButton.disabled = true;

      try {
        // ENVOI DES DONNÉES À SERVER.JS
        const response = await fetch("/api/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataToSend)
        });

        if (response.ok) {
          const result = await response.json();
          console.log("✅ Commande traitée avec succès:", result);
          
          // Stocker l'ID de commande pour confirmation.html
          localStorage.setItem("lastOrderId", result.order.id);
          
          // Redirection vers confirmation.html
          submitButton.textContent = "Redirection...";
          setTimeout(() => {
            window.location.href = "/src/pages/Confirmation.html";
          }, 1000);
          
        } else {
          throw new Error(`Erreur serveur: ${response.status}`);
        }
        
      } catch (error) {
        console.error("❌ Erreur lors du traitement:", error);
        alert("Erreur lors du traitement de la commande. Veuillez réessayer.");
        
        // Réactiver le bouton en cas d'erreur
        submitButton.textContent = "Finaliser la Commande";
        submitButton.disabled = false;
      }
    });
  }

  function initialize() {
    updateCartCount();
    initializeSelections();
    setupOptionListeners(paymentOptions, "selectedPaymentMethod");
    setupOptionListeners(shippingOptions, "selectedShippingMethod");
    setupFormValidation();

    if (form) {
      form.querySelectorAll("input").forEach(f => {
        let timeout;
        f.addEventListener("input", () => { clearTimeout(timeout); timeout = setTimeout(saveFormDataSecurely, 500); });
        f.addEventListener("blur", saveFormDataSecurely);
      });
    }

    console.log("=== INITIALISATION TERMINÉE ===");
  }

  initialize();
});
