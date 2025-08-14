document.addEventListener("DOMContentLoaded", () => {
  const paymentOptions = document.querySelectorAll(".payment-option");
  const shippingOptions = document.querySelectorAll(".shipping-option");

  // Gestion de la sélection du moyen de paiement au chargement
  const savedPayment = localStorage.getItem("selectedPaymentMethod");
  if (savedPayment) {
    paymentOptions.forEach(option => {
      const name = option.querySelector(".payment-method-name").textContent.trim();
      if (name === savedPayment) {
        option.classList.add("selected");
      } else {
        option.classList.remove("selected");
      }
    });
  } else {
    // Ne rien sélectionner par défaut
    paymentOptions.forEach(option => option.classList.remove("selected"));
  }

  // Gestion de la sélection du mode de livraison au chargement
  const savedShipping = localStorage.getItem("selectedShippingMethod");
  if (savedShipping) {
    shippingOptions.forEach(option => {
      const name = option.querySelector(".shipping-name").textContent.trim();
      if (name === savedShipping) {
        option.classList.add("selected");
      } else {
        option.classList.remove("selected");
      }
    });
  } else {
    // Sélectionner "Livraison Classique" par défaut (si elle existe)
    shippingOptions.forEach(option => {
      const name = option.querySelector(".shipping-name").textContent.trim();
      if (name === "Livraison Classique") {
        option.classList.add("selected");
      } else {
        option.classList.remove("selected");
      }
    });
  }

  // Événements pour changer la sélection et sauvegarder au clic - Paiement
  paymentOptions.forEach(option => {
    option.addEventListener("click", () => {
      paymentOptions.forEach(opt => opt.classList.remove("selected"));
      option.classList.add("selected");
      localStorage.setItem("selectedPaymentMethod", option.querySelector(".payment-method-name").textContent.trim());
    });
  });

  // Événements pour changer la sélection et sauvegarder au clic - Livraison
  shippingOptions.forEach(option => {
    option.addEventListener("click", () => {
      shippingOptions.forEach(opt => opt.classList.remove("selected"));
      option.classList.add("selected");
      localStorage.setItem("selectedShippingMethod", option.querySelector(".shipping-name").textContent.trim());
    });
  });
});
