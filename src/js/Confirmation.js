// 🔧 URL de l'API (à remplacer par l'URL publique de ton serveur)
const API_URL = "http://localhost:3001"; // Local development

(function immediateURLClean() {
  try {
    const cleanURL = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, cleanURL);
    console.log("🔧 URL nettoyée immédiatement:", cleanURL);
  } catch (error) {
    console.log("⚠️ Impossible de nettoyer l'URL:", error);
  }
})();

document.addEventListener('DOMContentLoaded', function() {
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
    console.log("🚀 Initialisation de la page confirmation");
    loadOrderData();
    populateOrderData();
    setupEventListeners();
    
    if (DOM.submitButton) DOM.submitButton.disabled = false;
  }

  function loadOrderData() {
    const encryptedData = localStorage.getItem("secureCheckoutData");
    const formData = encryptedData ? decryptData(encryptedData) : null;
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const shippingMethod = localStorage.getItem("selectedShippingMethod") || "Livraison Standard";
    const paymentMethod = localStorage.getItem("selectedPaymentMethod") || "PayPal";

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
        name: shippingMethod,
        price: shippingMethod.includes('Express') ? 2.50 : 0,
        delivery: getEstimatedDelivery(shippingMethod)
      },
      paymentMethod: paymentMethod
    };
  }

  function getEstimatedDelivery(method) {
    const label = (method || '').toLowerCase();
    if (label.includes('express')) return '2-4H';
    if (label.includes('standard') || label.includes('classique')) return '6-12H';
    return '6-12H';
  }

  function decryptData(encrypted) {
    try {
      const decoded = decodeURIComponent(atob(encrypted));
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
      const itemEl = document.createElement('div');
      itemEl.className = 'order-item';

      const itemName = document.createElement('span');
      itemName.className = 'item-name';
      itemName.textContent = item.name;

      const quantity = document.createElement('span');
      quantity.textContent = ` x${item.quantity || 1}`;
      itemName.appendChild(quantity);

      const price = document.createElement('span');
      price.className = 'item-price';
      price.textContent = `€${item.price.toFixed(2)}`;

      itemEl.appendChild(itemName);
      itemEl.appendChild(price);
      container.appendChild(itemEl);
    });
  }

  function calculateAndDisplayTotals() {
    const subtotal = orderData.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = orderData.shippingMethod.price;
    const total = subtotal + shipping;

    const subtotalEl = document.getElementById('subtotal');
    const shippingEl = document.getElementById('shipping-cost');
    const totalEl = document.getElementById('total-cost');

    if (subtotalEl) subtotalEl.textContent = `€${subtotal.toFixed(2)}`;
    if (shippingEl) shippingEl.textContent = shipping > 0 ? `€${shipping.toFixed(2)}` : 'Gratuit';
    if (totalEl) totalEl.textContent = `€${total.toFixed(2)}`;
  }

  function populateOrderData() {
    const elems = {
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

    if (elems.orderNumber) elems.orderNumber.textContent = orderData.orderNumber;
    if (elems.orderDate) elems.orderDate.textContent = new Date(orderData.orderDate).toLocaleDateString('fr-FR');
    if (elems.customerName) elems.customerName.textContent = orderData.name;
    if (elems.contactName) elems.contactName.textContent = orderData.name;
    if (elems.contactEmail) elems.contactEmail.textContent = orderData.email;
    if (elems.contactPhone) elems.contactPhone.textContent = orderData.phoneNumber;
    if (elems.contactDiscord) elems.contactDiscord.textContent = orderData.discord;
    if (elems.shippingAddress) elems.shippingAddress.textContent = orderData.address;
    if (elems.shippingCity) elems.shippingCity.textContent = orderData.city;
    if (elems.shippingCountry) elems.shippingCountry.textContent = orderData.country;
    if (elems.shippingPostal) elems.shippingPostal.textContent = orderData.postalCode;
    if (elems.shippingMethod) elems.shippingMethod.textContent = orderData.shippingMethod.name;
    if (elems.shippingDelivery) elems.shippingDelivery.textContent = orderData.shippingMethod.delivery;
    if (elems.paymentMethod) elems.paymentMethod.textContent = orderData.paymentMethod;

    populateOrderItems();
    calculateAndDisplayTotals();
  }

  function setupEventListeners() {
    if (DOM.submitButton) DOM.submitButton.addEventListener('click', handleSubmitClick);
    if (DOM.notYetBtn) DOM.notYetBtn.addEventListener('click', () => closeModal(DOM.screenshotModal));
    if (DOM.screenshotTakenBtn) DOM.screenshotTakenBtn.addEventListener('click', handleScreenshotTaken);
    if (DOM.continueToVendorBtn) DOM.continueToVendorBtn.addEventListener('click', handleVendorSelection);
    if (DOM.confirmationOkBtn) DOM.confirmationOkBtn.addEventListener('click', () => {
      clearStorage();
      window.location.href = '/index.html';
    });

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
    const defaultVendor = document.querySelector('.vendor-option[data-vendor=".uwg9"]');
    if (defaultVendor) defaultVendor.classList.add('selected');
  }

  function handleVendorSelection() {
    selectedVendor = ".uwg9";
    closeModal(DOM.vendorModal);
    if (DOM.submitButton) {
      DOM.submitButton.textContent = "Traitement en cours...";
      DOM.submitButton.disabled = true;
      DOM.submitButton.style.backgroundColor = "#ffc107";
    }

    setTimeout(async () => {
      await submitOrderToServer();
      try { window.open("https://discord.gg/beC8cFZaXH", "_blank"); } catch {}
      setTimeout(() => openModal(DOM.thankYouModal), 500);
    }, 2000);
  }

  async function submitOrderToServer() {
    if (isSubmitting) return false;
    isSubmitting = true;
    try {
      const dataToSend = { ...orderData, selectedVendor, submittedAt: new Date().toISOString() };
      const response = await fetch(`${API_URL}/api/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(dataToSend)
      });
      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error("Erreur serveur:", error);
      return false;
    } finally { isSubmitting = false; }
  }

  function clearStorage() {
    localStorage.removeItem('cart');
    localStorage.removeItem('checkoutData');
    localStorage.removeItem('secureCheckoutData');
    sessionStorage.removeItem('checkoutData');
  }

  function openModal(modal) { if (modal) { modal.style.display = 'flex'; modal.classList.add('active'); } }
  function closeModal(modal) { if (modal) { modal.style.display = 'none'; modal.classList.remove('active'); } }

  initialize();
});
