document.addEventListener('DOMContentLoaded', function() {
  // =======================
  // Variables globales
  // =======================
  let screenshotTaken = false;
  let isSubmitting = false;
  let selectedVendor = ".uwg9";
  let orderData = {};

  // =======================
  // Éléments DOM - Cache des références
  // =======================
  const DOM = {
    submitButton: document.getElementById('submit-order'),
    screenshotModal: document.getElementById('screenshot-modal'),
    vendorModal: document.getElementById('vendor-modal'),
    thankYouModal: document.getElementById('confirmation-modal'),
    screenshotTakenBtn: document.getElementById('screenshot-taken-btn'),
    continueToVendorBtn: document.getElementById('continue-to-vendor'),
    confirmationOkBtn: document.getElementById('confirmation-ok-btn')
  };

  // =======================
  // INITIALISATION
  // =======================
  function initialize() {
    cleanURL();
    loadOrderData();
    populateOrderData();
    setupEventListeners();
    
    if (DOM.submitButton) {
      DOM.submitButton.disabled = false;
    }
  }

  // =======================
  // Nettoyage de l'URL
  // =======================
  function cleanURL() {
    if (window.history.replaceState) {
      const cleanURL = window.location.pathname;
      window.history.replaceState({}, document.title, cleanURL);
    }
  }

  // =======================
  // Chargement des données sensibles
  // =======================
  function loadOrderData() {
    const encryptedData = localStorage.getItem("secureCheckoutData");
    let formData = encryptedData ? decryptData(encryptedData) : null;

    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const selectedShippingMethod = localStorage.getItem("selectedShippingMethod") || "Livraison Standard";
    const selectedPaymentMethod = localStorage.getItem("selectedPaymentMethod") || "PayPal";

    orderData = {
      orderNumber: generateOrderNumber(),
      orderDate: new Date().toISOString(),
      name: formData?.customerInfo?.name || 'Client',
      email: formData?.customerInfo?.email || 'Non renseigné',
      phoneNumber: formData?.customerInfo?.phone || 'Non renseigné',
      discord: formData?.customerInfo?.discord || 'Non renseigné',
      address: formData?.shippingInfo?.address || 'Non renseigné',
      city: formData?.shippingInfo?.city || 'Non renseigné',
      country: formData?.shippingInfo?.country || 'Non renseigné',
      postalCode: formData?.shippingInfo?.postalCode || 'Non renseigné',
      orderItems: cart,
      shippingMethod: {
        name: selectedShippingMethod,
        price: selectedShippingMethod.includes('Express') ? 2.50 : 0,
        delivery: getEstimatedDelivery(selectedShippingMethod)
      },
      paymentMethod: selectedPaymentMethod
    };
  }

  // Normalise et calcule le délai estimé en fonction du libellé choisi
  function getEstimatedDelivery(methodLabel) {
    const label = (methodLabel || '').toLowerCase();
    if (label.includes('express')) return '2-4H';
    if (label.includes('standard') || label.includes('classique')) return '6-12h';
    // Valeur par défaut prudente
    return '6-12h';
  }

  function decryptData(encryptedData) {
    try {
      const decoded = decodeURIComponent(atob(encryptedData));
      const originalData = decoded.replace("checkout_secure_key_2024", '');
      return JSON.parse(originalData);
    } catch {
      return null;
    }
  }

  function generateOrderNumber() {
    const randomSix = Math.floor(100000 + Math.random() * 900000);
    const randomFour = Math.floor(1000 + Math.random() * 9000);
    return `PM-${randomSix}-${randomFour}`;
  }

  function populateOrderItems() {
    const orderItemsContainer = document.getElementById('order-items');
    if (!orderItemsContainer) return;

    orderItemsContainer.innerHTML = '';
    
    orderData.orderItems.forEach(item => {
      const itemElement = document.createElement('div');
      itemElement.className = 'order-item';
      
      const itemName = document.createElement('span');
      itemName.className = 'item-name';
      itemName.textContent = item.name;
      
      // Ajouter le badge quantité comme span à l'intérieur de item-name (conforme au CSS .item-name span)
      const quantityBadge = document.createElement('span');
      quantityBadge.textContent = `x${item.quantity || 1}`;
      itemName.appendChild(quantityBadge);
      
      const itemPrice = document.createElement('span');
      itemPrice.className = 'item-price';
      itemPrice.textContent = `€${item.price.toFixed(2)}`;
      
      itemElement.appendChild(itemName);
      itemElement.appendChild(itemPrice);
      
      orderItemsContainer.appendChild(itemElement);
    });
  }

  function calculateAndDisplayTotals() {
    const subtotal = orderData.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingCost = orderData.shippingMethod.price;
    const total = subtotal + shippingCost;

    // Cache des éléments de totaux
    const totalElements = {
      subtotal: document.getElementById('subtotal'),
      shippingCost: document.getElementById('shipping-cost'),
      totalCost: document.getElementById('total-cost')
    };

    if (totalElements.subtotal) totalElements.subtotal.textContent = `€${subtotal.toFixed(2)}`;
    if (totalElements.shippingCost) totalElements.shippingCost.textContent = shippingCost > 0 ? `€${shippingCost.toFixed(2)}` : 'Gratuit';
    if (totalElements.totalCost) totalElements.totalCost.textContent = `€${total.toFixed(2)}`;
  }



  function populateOrderData() {
    // Cache des éléments DOM pour éviter les recherches répétées
    const elements = {
      orderNumber: document.getElementById('order-number'),
      orderDate: document.getElementById('order-date'),
      customerName: document.getElementById('customer-name'),
      contactName: document.getElementById('contact-name'),
      contactEmail: document.getElementById('contact-email'),
      contactPhone: document.getElementById('contact-phone'),
      contactDiscord: document.getElementById('contact-discord'),
      shippingAddress: document.getElementById('shipping-address'),
      shippingCity: document.getElementById('shipping-city'),
      shippingCountry: document.getElementById('shipping-country'),
      shippingPostal: document.getElementById('shipping-postal'),
      shippingMethod: document.getElementById('shipping-method'),
      shippingDelivery: document.getElementById('shipping-delivery'),
      paymentMethod: document.getElementById('payment-method')
    };

    // Remplir les informations de base
    if (elements.orderNumber) elements.orderNumber.textContent = orderData.orderNumber;
    if (elements.orderDate) elements.orderDate.textContent = new Date(orderData.orderDate).toLocaleDateString('fr-FR');
    if (elements.customerName) elements.customerName.textContent = orderData.name;
    if (elements.contactName) elements.contactName.textContent = orderData.name;
    if (elements.contactEmail) elements.contactEmail.textContent = orderData.email;
    if (elements.contactPhone) elements.contactPhone.textContent = orderData.phoneNumber;
    if (elements.contactDiscord) elements.contactDiscord.textContent = orderData.discord;
    
    // Remplir les informations de livraison
    if (elements.shippingAddress) elements.shippingAddress.textContent = orderData.address;
    if (elements.shippingCity) elements.shippingCity.textContent = orderData.city;
    if (elements.shippingCountry) elements.shippingCountry.textContent = orderData.country;
    if (elements.shippingPostal) elements.shippingPostal.textContent = orderData.postalCode;
    
    // Remplir la méthode de livraison
    if (elements.shippingMethod) elements.shippingMethod.textContent = orderData.shippingMethod.name;
    if (elements.shippingDelivery) elements.shippingDelivery.textContent = orderData.shippingMethod.delivery;
    
    // Remplir la méthode de paiement
    if (elements.paymentMethod) elements.paymentMethod.textContent = orderData.paymentMethod;
    
    // Remplir les articles et totaux
    populateOrderItems();
    calculateAndDisplayTotals();
  }

  // =======================
  // Événements
  // =======================
  function setupEventListeners() {
    if (DOM.submitButton) DOM.submitButton.addEventListener('click', handleSubmitClick);
    if (DOM.screenshotTakenBtn) DOM.screenshotTakenBtn.addEventListener('click', handleScreenshotTaken);
    if (DOM.continueToVendorBtn) DOM.continueToVendorBtn.addEventListener('click', handleVendorSelection);
    if (DOM.confirmationOkBtn) DOM.confirmationOkBtn.addEventListener('click', handleThankYouBackHome);
  }

  // Redirection vers l'accueil et reset du panier depuis le modal de remerciement
  function handleThankYouBackHome() {
    clearStorage();
    window.location.href = '/index.html';
  }

  // =======================
  // Gestion du screenshot
  // =======================
  function handleSubmitClick() {
    if (!screenshotTaken) {
      openModal(DOM.screenshotModal);
    } else {
      openVendorModalAfterDelay();
    }
  }

  function handleScreenshotTaken() {
    screenshotTaken = true;
    closeModal(DOM.screenshotModal);
    openVendorModalAfterDelay();
  }

  function openVendorModalAfterDelay() {
    setTimeout(() => {
      openModal(DOM.vendorModal);
      
      // Sélection automatique du vendeur par défaut
      const defaultVendorOption = document.querySelector('.vendor-option[data-vendor="MolarMarket"]');
      if (defaultVendorOption) {
        defaultVendorOption.classList.add('selected');
        const radioIndicator = defaultVendorOption.querySelector('.radio-indicator');
        if (radioIndicator) {
          radioIndicator.classList.add('checked');
        }
      }
    }, 3000);
  }

  // =======================
  // Gestion du modal Vendor
  // =======================
  function handleVendorSelection() {
    selectedVendor = "MolarMarket";
    
    closeModal(DOM.vendorModal);
    submitOrderToServer();
    
    // Ouvrir Discord dans un nouvel onglet
    window.open("https://discord.gg/beC8cFZaXH", "_blank");
    
    // Ouvrir le modal de remerciement immédiatement
    openModal(DOM.thankYouModal);
  }

  // =======================
  // Envoi des données sensibles à ton API Express
  // =======================
  async function submitOrderToServer() {
    if (isSubmitting) return;
    isSubmitting = true;
    try {
      const response = await fetch('http://localhost:3001/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...orderData, selectedVendor })
      });
      const result = await response.json();
    } catch (error) {
      // Gérer l'erreur silencieusement
    } finally {
      isSubmitting = false;
      clearStorage();
    }
  }

  // =======================
  // Nettoyage du stockage local
  // =======================
  function clearStorage() {
    localStorage.removeItem('cart');
    localStorage.removeItem('checkoutData');
    localStorage.removeItem('secureCheckoutData');
    sessionStorage.removeItem('checkoutData');
  }

  // =======================
  // Utilitaires modals
  // =======================
  function openModal(modal) { 
    if (modal) modal.style.display = 'flex'; 
  }
  
  function closeModal(modal) { 
    if (modal) modal.style.display = 'none'; 
  }

  // =======================
  // Initialisation
  // =======================
  initialize();
});
