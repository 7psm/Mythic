// =============================================
// PAGE DE CONFIRMATION DE COMMANDE - MythicMarket
// =============================================

const API_URL = "https://mythic-api.onrender.com/api/order";

// =============================================
// FONCTION CENTRALE - Récupération des codes depuis localStorage
// =============================================
function getDiscountCodes() {
  try {
    const codes = localStorage.getItem('discountCodes');
    return codes ? JSON.parse(codes) : {};
  } catch (error) {
    console.error('Erreur lecture codes promo:', error);
    return {};
  }
}

// Nettoyage de l'URL
(function() {
  try {
    const cleanURL = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, cleanURL);
  } catch (error) {
    console.log("⚠️ Impossible de nettoyer l'URL:", error);
  }
})();

// Variables globales
let screenshotTaken = false;
let isSubmitting = false;
let selectedVendor = ".uwg9";
let orderData = {};

// =============================================
// FONCTIONS D'ANIMATION
// =============================================

function addPageAnimations() {
  console.log("🎨 Ajout des animations...");
  const header = document.querySelector('main > div:first-child');
  if (header) header.classList.add('animate-fadeInUp');
  
  const mainCard = document.querySelector('main > div:nth-child(2)');
  if (mainCard) {
    mainCard.classList.add('animate-scaleIn', 'delay-200', 'shine-effect', 'glow-on-hover');
  }
  
  const columns = document.querySelectorAll('.grid.grid-cols-1.md\\:grid-cols-2 > div');
  if (columns[0]) columns[0].classList.add('animate-slideInLeft', 'delay-300');
  if (columns[1]) columns[1].classList.add('animate-slideInRight', 'delay-300');
  
  const sections = document.querySelectorAll('h3');
  sections.forEach((section, index) => {
    section.classList.add('animate-fadeInUp', `delay-${(index + 4) * 100}`);
  });
  
  const submitBtn = document.getElementById('submit-order');
  if (submitBtn) {
    submitBtn.classList.add('animate-fadeInUp', 'delay-400');
  }
  
  const screenshotSection = document.querySelector('main > div:nth-last-child(2)');
  if (screenshotSection) {
    screenshotSection.classList.add('animate-fadeInUp', 'delay-300', 'shine-effect');
    const icon = screenshotSection.querySelector('h3');
    if (icon) icon.classList.add('animate-float');
  }
  
  console.log("✅ Animations ajoutées");
}

function animateOrderItems() {
  const container = document.getElementById('order-items');
  if (!container) return;
  
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1 && node.classList) {
            node.classList.add('order-item');
            console.log("✨ Animation ajoutée à l'article");
          }
        });
      }
    });
  });
  
  observer.observe(container, {
    childList: true,
    subtree: false
  });
  
  console.log("👀 Observer activé pour les articles");
}

function animatePromoSection() {
  const promoSection = document.getElementById('promo-section');
  if (!promoSection) return;
  
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        if (!promoSection.classList.contains('hidden')) {
          console.log("🎉 Code promo affiché avec animation");
        }
      }
    });
  });
  
  observer.observe(promoSection, {
    attributes: true,
    attributeFilter: ['class']
  });
}

function initializeAnimations() {
  console.log("🎬 Initialisation des animations...");
  
  setTimeout(() => {
    addPageAnimations();
    animateOrderItems();
    animatePromoSection();
  }, 100);
}

// =============================================
// FONCTIONS PRINCIPALES
// =============================================

function decryptData(encrypted) {
  try {
    const decoded = decodeURIComponent(atob(encrypted));
    const originalData = decoded.replace("checkout_secure_key_2024", '');
    return JSON.parse(originalData);
  } catch (error) {
    console.error("Erreur déchiffrement:", error);
    return null;
  }
}

function generateOrderNumber() {
  const randomSix = Math.floor(100000 + Math.random() * 900000);
  const randomFour = Math.floor(1000 + Math.random() * 9000);
  return `PM-${randomSix}-${randomFour}`;
}

function getEstimatedDelivery(method) {
  const label = (method || '').toLowerCase();
  if (label.includes('express')) return '2-4H';
  if (label.includes('standard') || label.includes('classique')) return '6-12H';
  return '6-12H';
}

function loadOrderData() {
  console.log("📦 Chargement des données de commande...");
  
  const encryptedData = localStorage.getItem("secureCheckoutData");
  const formData = encryptedData ? decryptData(encryptedData) : null;
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const shippingMethod = localStorage.getItem("selectedShippingMethod") || "Livraison Standard";
  const paymentMethod = localStorage.getItem("selectedPaymentMethod") || "PayPal";

  console.log("📋 Données récupérées:", {
    formData: formData ? "✅" : "❌",
    cart: cart.length + " articles",
    shippingMethod,
    paymentMethod
  });

  orderData = {
    orderNumber: generateOrderNumber(),
    orderDate: new Date().toISOString(),
    discordname: formData?.customerInfo?.discord || formData?.customerInfo?.discordname || 'Non renseigné',
    email: formData?.customerInfo?.email || 'Non renseigné',
    discord: formData?.customerInfo?.discord || formData?.customerInfo?.discordname || 'Non renseigné',
    orderItems: cart,
    shippingMethod: {
      name: shippingMethod,
      price: shippingMethod.toLowerCase().includes('express') ? 2.50 : 0,
      delivery: getEstimatedDelivery(shippingMethod)
    },
    paymentMethod: paymentMethod,
    status: 'CONFIRMED' // ✨ AJOUT du statut initial
  };

  console.log("✅ OrderData créé:", orderData);
}

function populateOrderData() {
  console.log("🔍 Remplissage des informations client...");
  
  const fields = {
    'order-number': orderData.orderNumber,
    'order-date': new Date(orderData.orderDate).toLocaleDateString('fr-FR'),
    'contact-name': orderData.discord || orderData.discordname || 'Non renseigné',
    'contact-email': orderData.email,
    'contact-discord': orderData.discord,
    'shipping-method': orderData.shippingMethod.name,
    'shipping-delivery': orderData.shippingMethod.delivery,
    'payment-method': orderData.paymentMethod
  };

  Object.entries(fields).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = value;
      console.log(`✅ ${id} = ${value}`);
    } else {
      console.warn(`⚠️ Element ${id} non trouvé`);
    }
  });

  console.log("✅ Informations client remplies");
}

function populateOrderItems() {
  console.log("🛒 Affichage des articles commandés...");
  
  const container = document.getElementById('order-items');
  if (!container) {
    console.error("❌ Container order-items non trouvé");
    return;
  }
  
  container.innerHTML = '';
  console.log("📦 Affichage de", orderData.orderItems.length, "articles");
  
  orderData.orderItems.forEach((item, index) => {
    const itemEl = document.createElement('div');
    itemEl.className = 'flex justify-between items-center py-3 border-b border-[rgba(212,175,55,0.15)] last:border-b-0 transition-all duration-200';

    const itemName = document.createElement('div');
    itemName.className = 'text-text-white text-sm font-semibold';
    itemName.textContent = item.name;

    const quantity = document.createElement('span');
    quantity.className = 'bg-gradient-to-br from-gold-light to-gold-primary text-background-dark text-xs px-2 py-1 rounded-xl ml-2 font-bold shadow-[0_2px_6px_rgba(212,175,55,0.3)]';
    quantity.textContent = `x${item.quantity || 1}`;
    itemName.appendChild(quantity);

    const price = document.createElement('div');
    price.className = 'text-gold-primary font-bold text-sm drop-shadow-[0_1px_3px_rgba(212,175,55,0.3)] item-price';
    price.textContent = `€${(item.price * item.quantity).toFixed(2)}`;

    itemEl.appendChild(itemName);
    itemEl.appendChild(price);
    container.appendChild(itemEl);
    
    console.log(`  ${index + 1}. ${item.name} x${item.quantity} = €${(item.price * item.quantity).toFixed(2)}`);
  });
}

function calculateAndDisplayTotals() {
  console.log("💰 Calcul des totaux...");

  const appliedDiscount = JSON.parse(localStorage.getItem('appliedDiscount') || 'null');
  console.log("🎁 Code promo:", appliedDiscount ? appliedDiscount.code : "Aucun");

  const subtotalHT = orderData.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tvaAmount = subtotalHT * 0.20;
  const totalBeforeDiscount = subtotalHT + tvaAmount;

  let discountAmount = 0;
  let totalAfterDiscount = totalBeforeDiscount;

  if (appliedDiscount) {
    if (appliedDiscount.type === 'percentage') {
      discountAmount = totalBeforeDiscount * (appliedDiscount.value / 100);
    } else {
      discountAmount = appliedDiscount.value; // Pour le type 'fixed'
    }
    totalAfterDiscount = Math.max(0, totalBeforeDiscount - discountAmount);
  }

  const shippingCost = orderData.shippingMethod.price;
  const finalTotal = totalAfterDiscount + shippingCost;
  
  // ===============================================
  // Ajout des données de rabais à orderData
  // ===============================================
  orderData.appliedDiscount = appliedDiscount;
  orderData.discountAmount = discountAmount;


  console.log("📊 Détails:", {
    subtotalHT: subtotalHT.toFixed(2),
    tva: tvaAmount.toFixed(2),
    promo: discountAmount.toFixed(2),
    shipping: shippingCost.toFixed(2),
    total: finalTotal.toFixed(2)
  });

  const updateElement = (id, value) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = value;
      console.log(`  ✅ ${id}: ${value}`);
    } else {
      console.error(`  ❌ ${id} non trouvé`);
    }
  };

  updateElement('subtotal-ht', `€${subtotalHT.toFixed(2)}`);
  updateElement('tva-amount', `€${tvaAmount.toFixed(2)}`);
  updateElement('shipping-type', orderData.shippingMethod.name);
  updateElement('shipping-cost', shippingCost > 0 ? `€${shippingCost.toFixed(2)}` : 'Gratuit');

  const promoSection = document.getElementById('promo-section');
  if (appliedDiscount && discountAmount > 0) {
    if (promoSection) {
      promoSection.classList.remove('hidden');
      updateElement('promo-code-name', appliedDiscount.code);
      updateElement('promo-discount', `-€${discountAmount.toFixed(2)}`);
      console.log("  🎉 Section promo affichée");
    }
  } else {
    if (promoSection) {
      promoSection.classList.add('hidden');
      console.log("  ⚪ Pas de promo");
    }
  }

  const totalOriginalEl = document.getElementById('total-original');
  const totalCostEl = document.getElementById('total-cost');

  if (appliedDiscount && discountAmount > 0) {
    if (totalOriginalEl) {
      totalOriginalEl.textContent = `€${(totalBeforeDiscount + shippingCost).toFixed(2)}`;
      totalOriginalEl.classList.remove('hidden');
    }
    if (totalCostEl) {
      totalCostEl.textContent = `€${finalTotal.toFixed(2)}`;
      totalCostEl.classList.add('text-green-400');
    }
    console.log("  💚 Prix barré activé");
  } else {
    if (totalOriginalEl) totalOriginalEl.classList.add('hidden');
    if (totalCostEl) {
      totalCostEl.textContent = `€${finalTotal.toFixed(2)}`;
      totalCostEl.classList.remove('text-green-400');
    }
    console.log("  💛 Prix normal");
  }
}

// =============================================
// ✨ NOUVELLE FONCTION - Envoi au serveur avec Discord
// =============================================
async function submitOrderToServer() {
  if (isSubmitting) return false;
  isSubmitting = true;
  
  console.log("📤 Envoi de la commande au serveur...");
  console.log("🤖 Les notifications Discord seront envoyées automatiquement !");
  
  try {
    const dataToSend = { 
      ...orderData, 
      selectedVendor, 
      submittedAt: new Date().toISOString() 
    };
    
    console.log("📦 Données envoyées:", {
      orderNumber: dataToSend.orderNumber,
      email: dataToSend.email,
      discord: dataToSend.discord,
      items: dataToSend.orderItems.length,
      status: dataToSend.status
    });
    
    const response = await fetch(`${API_URL}/api/order`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Accept': 'application/json' 
      },
      body: JSON.stringify(dataToSend)
    });
    
    if (!response.ok) {
      console.error(`❌ Erreur HTTP: ${response.status}`);
      return false;
    }
    
    const result = await response.json();
    
    if (result.success) {
      console.log("✅ Commande envoyée:", result.order?.orderNumber);
      console.log("🤖 Statut Discord:", result.discordStatus || 'en cours d\'envoi');
      console.log("📧 Statut Email:", result.emailStatus || 'en cours d\'envoi');
      
      // ✨ Afficher un message de confirmation Discord
      if (orderData.discord && orderData.discord !== 'Non renseigné') {
        console.log("💬 Notification Discord envoyée à:", orderData.discord);
      }
      
      return true;
    } else {
      console.error("❌ Échec:", result.error);
      return false;
    }
    
  } catch (error) {
    console.error("❌ Erreur:", error);
    return false;
  } finally { 
    isSubmitting = false;
  }
}

function clearStorage() {
  console.log("🧹 Nettoyage du localStorage...");
  localStorage.removeItem('cart');
  localStorage.removeItem('checkoutData');
  localStorage.removeItem('secureCheckoutData');
  localStorage.removeItem('appliedDiscount');
  localStorage.removeItem('selectedShippingMethod');
  localStorage.removeItem('selectedPaymentMethod');
  sessionStorage.removeItem('checkoutData');
  console.log("✅ Nettoyage terminé");
}

function openModal(modal) {
  if (!modal) return;
  modal.classList.remove("hidden");
  modal.style.removeProperty("display");
  modal.style.setProperty("display", "flex", "important");
}

function closeModal(modal) {
  if (!modal) return;
  modal.style.removeProperty("display");
  modal.classList.add("hidden");
}

// =============================================
// INITIALISATION
// =============================================
document.addEventListener('DOMContentLoaded', function() {
  console.log("🚀 =================================");
  console.log("🚀 INITIALISATION CONFIRMATION PAGE");
  console.log("🚀 =================================");
  
  const DOM = {
    submitButton: document.getElementById('submit-order'),
    screenshotModal: document.getElementById('screenshot-modal'),
    vendorModal: document.getElementById('vendor-modal'),
    confirmationModal: document.getElementById('confirmation-modal'),
    notYetBtn: document.getElementById('not-yet-btn'),
    screenshotTakenBtn: document.getElementById('screenshot-taken-btn'),
    continueToVendorBtn: document.getElementById('continue-to-vendor'),
    confirmationOkBtn: document.getElementById('confirmation-ok-btn')
  };

  console.log("🔍 Vérification des éléments DOM:");
  console.log("  Submit button:", DOM.submitButton ? "✅" : "❌");
  console.log("  Screenshot modal:", DOM.screenshotModal ? "✅" : "❌");
  console.log("  Vendor modal:", DOM.vendorModal ? "✅" : "❌");
  console.log("  Confirmation modal:", DOM.confirmationModal ? "✅" : "❌");

  loadOrderData();
  populateOrderData();
  populateOrderItems();
  calculateAndDisplayTotals();

  if (DOM.submitButton) {
    DOM.submitButton.disabled = false;
    console.log("✅ Bouton de soumission activé");
    
    DOM.submitButton.addEventListener('click', async function(e) {
      e.preventDefault();
      console.log("🖱️ Clic sur le bouton de soumission");
      
      if (!screenshotTaken) {
        console.log("📸 Ouverture modal de capture d'écran");
        openModal(DOM.screenshotModal);
        return;
      }
      
      console.log("👤 Ouverture modal de sélection vendeur");
      openModal(DOM.vendorModal);
    });
  } else {
    console.error("❌ Bouton submit-order non trouvé !");
  }

  if (DOM.notYetBtn) {
    DOM.notYetBtn.addEventListener('click', function() {
      console.log("❌ Utilisateur n'a pas pris la capture");
      closeModal(DOM.screenshotModal);
    });
  }

  if (DOM.screenshotTakenBtn) {
    DOM.screenshotTakenBtn.addEventListener('click', function() {
      console.log("✅ Capture d'écran confirmée");
      screenshotTaken = true;
      closeModal(DOM.screenshotModal);
      
      if (DOM.submitButton) {
        DOM.submitButton.textContent = "Finaliser la commande";
      }
      
      setTimeout(() => {
        openModal(DOM.vendorModal);
      }, 300);
    });
  }

  if (DOM.continueToVendorBtn) {
    DOM.continueToVendorBtn.addEventListener('click', async function() {
      console.log("🚀 Finalisation de la commande");
      console.log("🤖 Le bot Discord va envoyer les notifications...");
      closeModal(DOM.vendorModal);
      
      if (DOM.submitButton) {
        DOM.submitButton.textContent = "⏳ Envoi en cours...";
        DOM.submitButton.disabled = true;
      }
      
      setTimeout(async () => {
        const success = await submitOrderToServer();
        
        if (success) {
          console.log("✅ Commande validée !");
          console.log("🤖 Notifications Discord envoyées !");
          console.log("📧 Email de confirmation envoyé !");
          
          try { 
            window.open("https://discord.gg/beC8cFZaXH", "_blank");
            console.log("📱 Discord ouvert");
          } catch (error) {
            console.log("⚠️ Impossible d'ouvrir Discord:", error);
          }
          
          setTimeout(() => {
            openModal(DOM.confirmationModal);
            console.log("🎉 Modal de confirmation affichée");
          }, 500);
          
        } else {
          if (DOM.submitButton) {
            DOM.submitButton.textContent = "Réessayer";
            DOM.submitButton.disabled = false;
          }
          alert("❌ Erreur lors de l'envoi. Veuillez réessayer.");
        }
      }, 2000);
    });
  }

  if (DOM.confirmationOkBtn) {
    DOM.confirmationOkBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log("✅ Retour à l'accueil");
      clearStorage();
      window.location.href = '/index.html';
    });
  }

  [DOM.screenshotModal, DOM.vendorModal, DOM.confirmationModal].forEach(modal => {
    if (modal) {
      modal.addEventListener('click', function(e) {
        if (e.target === modal) {
          closeModal(modal);
        }
      });
    }
  });

  initializeAnimations();

  console.log("🚀 =================================");
  console.log("🚀 INITIALISATION TERMINÉE");
  console.log("🚀 🤖 Bot Discord prêt à envoyer !");
  console.log("🚀 =================================");
});