// 🔧 Nettoyage immédiat de l'URL
(function immediateURLClean() {
  try {
    const cleanURL = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, cleanURL);
    console.log("🔧 URL nettoyée :", cleanURL);
  } catch (error) {
    console.log("⚠️ Impossible de nettoyer l'URL:", error);
  }
})();

document.addEventListener('DOMContentLoaded', () => {
  let screenshotTaken = false;
  let isSubmitting = false;
  let selectedVendor = ".uwg9";
  let orderData = {};

  const DOM = {
    submitButton: document.getElementById('submit-order'),
    screenshotModal: document.getElementById('screenshot-modal'),
    vendorModal: document.getElementById('vendor-modal'),
    thankYouModal: document.getElementById('confirmation-modal'),
    notYetBtn: document.getElementById('not-yet-btn'),
    screenshotTakenBtn: document.getElementById('screenshot-taken-btn'),
    continueToVendorBtn: document.getElementById('continue-to-vendor'),
    confirmationOkBtn: document.getElementById('confirmation-ok-btn')
  };

  function initialize() {
    console.log("🚀 Initialisation page confirmation");
    loadOrderData();
    populateOrderData();
    setupEventListeners();

    if (DOM.submitButton) DOM.submitButton.disabled = false;
  }

  function loadOrderData() {
    const encryptedData = localStorage.getItem("secureCheckoutData");
    const formData = encryptedData ? decryptData(encryptedData) : null;
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

  function getEstimatedDelivery(methodLabel) {
    const label = (methodLabel || '').toLowerCase();
    if (label.includes('express')) return '2-4H';
    if (label.includes('standard') || label.includes('classique')) return '6-12h';
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
    const container = document.getElementById('order-items');
    if (!container) return;
    container.innerHTML = '';
    orderData.orderItems.forEach(item => {
      const div = document.createElement('div');
      div.className = 'order-item';
      const name = document.createElement('span');
      name.className = 'item-name';
      name.textContent = item.name;
      const quantity = document.createElement('span');
      quantity.textContent = `x${item.quantity || 1}`;
      name.appendChild(quantity);
      const price = document.createElement('span');
      price.className = 'item-price';
      price.textContent = `€${item.price.toFixed(2)}`;
      div.appendChild(name);
      div.appendChild(price);
      container.appendChild(div);
    });
  }

  function calculateAndDisplayTotals() {
    const subtotal = orderData.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingCost = orderData.shippingMethod.price;
    const total = subtotal + shippingCost;
    const subtotalEl = document.getElementById('subtotal');
    const shippingEl = document.getElementById('shipping-cost');
    const totalEl = document.getElementById('total-cost');
    if (subtotalEl) subtotalEl.textContent = `€${subtotal.toFixed(2)}`;
    if (shippingEl) shippingEl.textContent = shippingCost > 0 ? `€${shippingCost.toFixed(2)}` : 'Gratuit';
    if (totalEl) totalEl.textContent = `€${total.toFixed(2)}`;
  }

  function populateOrderData() {
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
    for (let key in elements) {
      if (!elements[key]) continue;
      switch(key) {
        case 'orderNumber': elements[key].textContent = orderData.orderNumber; break;
        case 'orderDate': elements[key].textContent = new Date(orderData.orderDate).toLocaleDateString('fr-FR'); break;
        case 'customerName': case 'contactName': elements[key].textContent = orderData.name; break;
        case 'contactEmail': elements[key].textContent = orderData.email; break;
        case 'contactPhone': elements[key].textContent = orderData.phoneNumber; break;
        case 'contactDiscord': elements[key].textContent = orderData.discord; break;
        case 'shippingAddress': elements[key].textContent = orderData.address; break;
        case 'shippingCity': elements[key].textContent = orderData.city; break;
        case 'shippingCountry': elements[key].textContent = orderData.country; break;
        case 'shippingPostal': elements[key].textContent = orderData.postalCode; break;
        case 'shippingMethod': elements[key].textContent = orderData.shippingMethod.name; break;
        case 'shippingDelivery': elements[key].textContent = orderData.shippingMethod.delivery; break;
        case 'paymentMethod': elements[key].textContent = orderData.paymentMethod; break;
      }
    }
    populateOrderItems();
    calculateAndDisplayTotals();
  }

  function setupEventListeners() {
    if (DOM.submitButton) DOM.submitButton.addEventListener('click', handleSubmitClick);
    if (DOM.notYetBtn) DOM.notYetBtn.addEventListener('click', () => closeModal(DOM.screenshotModal));
    if (DOM.screenshotTakenBtn) DOM.screenshotTakenBtn.addEventListener('click', handleScreenshotTaken);
    if (DOM.continueToVendorBtn) DOM.continueToVendorBtn.addEventListener('click', handleVendorSelection);
    if (DOM.confirmationOkBtn) DOM.confirmationOkBtn.addEventListener('click', handleThankYouBackHome);

    [DOM.screenshotModal, DOM.vendorModal, DOM.thankYouModal].forEach(modal => {
      if (modal) modal.addEventListener('click', e => { if (e.target === modal) closeModal(modal); });
    });
  }

  function handleSubmitClick(e) {
    e.preventDefault();
    if (!screenshotTaken) openModal(DOM.screenshotModal);
    else openVendorModalAfterDelay();
  }

  function handleScreenshotTaken() {
    screenshotTaken = true;
    closeModal(DOM.screenshotModal);
    if (DOM.submitButton) {
      DOM.submitButton.textContent = "Finaliser la commande";
      DOM.submitButton.style.backgroundColor = "#28a745";
    }
  }

  function openVendorModalAfterDelay() {
    openModal(DOM.vendorModal);
    const defaultVendorOption = document.querySelector('.vendor-option[data-vendor=".uwg9"]');
    if (defaultVendorOption) {
      defaultVendorOption.classList.add('selected');
      const radioIndicator = defaultVendorOption.querySelector('.radio-indicator');
      if (radioIndicator) radioIndicator.classList.add('checked');
    }
  }

  function handleVendorSelection() {
    selectedVendor = ".uwg9";
    closeModal(DOM.vendorModal);

    // 🔗 Redirection directe vers Discord
    window.open("https://discord.gg/beC8cFZaXH", "_blank");

    // Affichage modal remerciement
    setTimeout(() => openModal(DOM.thankYouModal), 500);

    // Envoi commande serveur
    submitOrderToServer();
  }

  async function submitOrderToServer() {
    if (isSubmitting) return;
    isSubmitting = true;
    try {
      const dataToSend = { ...orderData, selectedVendor, submittedAt: new Date().toISOString() };
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const response = await fetch('http://localhost:3001/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      console.log(result.success ? '✅ Commande envoyée' : '❌ Erreur serveur', result.message);
    } catch (error) {
      console.error('❌ Erreur envoi serveur:', error.message);
    } finally {
      isSubmitting = false;
    }
  }

  function handleThankYouBackHome() {
    clearStorage();
    window.location.href = '/index.html';
  }

  function clearStorage() {
    localStorage.removeItem('cart');
    localStorage.removeItem('checkoutData');
    localStorage.removeItem('secureCheckoutData');
    sessionStorage.removeItem('checkoutData');
  }

  function openModal(modal) { if (modal) modal.style.display = 'flex'; }
  function closeModal(modal) { if (modal) modal.style.display = 'none'; }

  initialize();
});
