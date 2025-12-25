// ====================================================
//       PAGE DE CONFIRMATION - MythicMarket
// ====================================================
import { decryptData, formatPrice } from '../utils.js';

const API_URL = window.location.hostname.includes("localhost")
  ? "http://localhost:3001"
  : "https://mythic-api.onrender.com";

// Nettoyage de l'URL (suppression des paramètres)
(function() {
  try {
    const cleanURL = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, cleanURL);
  } catch (error) {
    // Erreur silencieuse si le nettoyage échoue
  }
})();

// Variables globales
let screenshotTaken = false;
let isSubmitting = false;
let selectedVendor = ".uwg9";
let orderData = {};

// =============================================
//        FONCTIONS UTILITAIRES
// =============================================

/**
 * Génère un numéro de commande unique
 * @returns {string} Numéro de commande au format PM-XXXXXX-XXXX
 */
function generateOrderNumber() {
  const randomSix = Math.floor(100000 + Math.random() * 900000);
  const randomFour = Math.floor(1000 + Math.random() * 9000);
  return `PM-${randomSix}-${randomFour}`;
}

/**
 * Estime le délai de livraison selon la méthode
 * @param {string} method - Méthode de livraison
 * @returns {string} Délai estimé
 */
function getEstimatedDelivery(method) {
  const label = (method || '').toLowerCase();
  if (label.includes('express')) return '2-4H';
  if (label.includes('standard') || label.includes('classique')) return '6-12H';
  return '6-12H';
}

/**
 * Charge les données de commande depuis le localStorage
 */
function loadOrderData() {
  const encryptedData = localStorage.getItem("secureCheckoutData");
  const formData = encryptedData ? decryptData(encryptedData) : null;
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const shippingMethod = localStorage.getItem("selectedShippingMethod") || "Livraison Standard";
  const paymentMethod = localStorage.getItem("selectedPaymentMethod") || "PayPal";

  orderData = {
    orderNumber: generateOrderNumber(),
    orderDate: new Date().toISOString(),
    discordname: formData?.customerInfo?.discord || formData?.customerInfo?.discordname || 'Non renseigne',
    discord: formData?.customerInfo?.discord || formData?.customerInfo?.discordname || 'Non renseigne',
    clientName: formData?.customerInfo?.name || '',
    orderItems: cart,
    shippingMethod: {
      name: shippingMethod,
      price: shippingMethod.toLowerCase().includes('express') ? 2.50 : 0,
      delivery: getEstimatedDelivery(shippingMethod)
    },
    paymentMethod: paymentMethod,
    status: 'CONFIRMED'
  };
}

/**
 * Remplit les informations client dans le DOM
 */
function populateOrderData() {
  const fields = {
    'order-number': orderData.orderNumber,
    'order-date': new Date(orderData.orderDate).toLocaleDateString('fr-FR'),
    'contact-name': orderData.clientName || orderData.discord || orderData.discordname || 'Non renseigne',
    'contact-discord': orderData.discord,
    'shipping-method': orderData.shippingMethod.name,
    'shipping-delivery': orderData.shippingMethod.delivery,
    'payment-method': orderData.paymentMethod
  };

  Object.entries(fields).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  });
}

/**
 * Affiche les articles de la commande
 */
function populateOrderItems() {
  const container = document.getElementById('order-items');
  if (!container) return;
  
  container.innerHTML = '';
  
  orderData.orderItems.forEach((item) => {
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
    price.textContent = formatPrice(item.price * item.quantity);

    itemEl.appendChild(itemName);
    itemEl.appendChild(price);
    container.appendChild(itemEl);
  });
}

/**
 * Calcule et affiche les totaux de la commande
 */
function calculateAndDisplayTotals() {
  const appliedDiscount = JSON.parse(localStorage.getItem('appliedDiscount') || 'null');
  const subtotalHT = orderData.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tvaAmount = subtotalHT * 0.20;
  const totalBeforeDiscount = subtotalHT + tvaAmount;

  // Calcul de la réduction
  let discountAmount = 0;
  if (appliedDiscount) {
    discountAmount = appliedDiscount.type === 'percentage'
      ? totalBeforeDiscount * (appliedDiscount.value / 100)
      : appliedDiscount.value;
  }
  const totalAfterDiscount = Math.max(0, totalBeforeDiscount - discountAmount);
  const shippingCost = orderData.shippingMethod.price;
  const finalTotal = totalAfterDiscount + shippingCost;
  
  orderData.appliedDiscount = appliedDiscount;
  orderData.discountAmount = discountAmount;

  // Mise à jour des éléments DOM
  const updateElement = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  updateElement('subtotal-ht', formatPrice(subtotalHT));
  updateElement('tva-amount', formatPrice(tvaAmount));
  updateElement('shipping-type', orderData.shippingMethod.name);
  updateElement('shipping-cost', shippingCost > 0 ? formatPrice(shippingCost) : 'Gratuit');

  // Section code promo
  const promoSection = document.getElementById('promo-section');
  if (appliedDiscount && discountAmount > 0) {
    if (promoSection) {
      promoSection.classList.remove('hidden');
      updateElement('promo-code-name', appliedDiscount.code);
      updateElement('promo-discount', `-${formatPrice(discountAmount)}`);
    }
  } else {
    if (promoSection) promoSection.classList.add('hidden');
  }

  // Affichage du total
  const totalOriginalEl = document.getElementById('total-original');
  const totalCostEl = document.getElementById('total-cost');

  if (appliedDiscount && discountAmount > 0) {
    if (totalOriginalEl) {
      totalOriginalEl.textContent = formatPrice(totalBeforeDiscount + shippingCost);
      totalOriginalEl.classList.remove('hidden');
    }
    if (totalCostEl) {
      totalCostEl.textContent = formatPrice(finalTotal);
      totalCostEl.classList.add('text-green-400');
    }
  } else {
    if (totalOriginalEl) totalOriginalEl.classList.add('hidden');
    if (totalCostEl) {
      totalCostEl.textContent = formatPrice(finalTotal);
      totalCostEl.classList.remove('text-green-400');
    }
  }
}

/**
 * Envoie la commande au serveur
 * @returns {Promise<boolean>} Succès de l'envoi
 */
async function submitOrderToServer() {
  if (isSubmitting) return false;
  isSubmitting = true;
  
  try {
    const dataToSend = { 
      ...orderData, 
      selectedVendor, 
      submittedAt: new Date().toISOString() 
    };
    
    const response = await fetch(`${API_URL}/api/order`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Accept': 'application/json' 
      },
      body: JSON.stringify(dataToSend)
    });
    
    if (!response.ok) {
      const errorDetails = await response.text().catch(() => '');
      console.error(`❌ Erreur HTTP ${response.status}:`, errorDetails);
      return false;
    }
    
    const result = await response.json();
    
    if (result.success) {
      return true;
    } else {
      console.error("❌ Échec de la commande:", result.error);
      return false;
    }
    
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi:", error.message);
    return false;
  } finally { 
    isSubmitting = false;
  }
}

/**
 * Nettoie le localStorage après la commande
 */
function clearStorage() {
  localStorage.removeItem('cart');
  localStorage.removeItem('checkoutData');
  localStorage.removeItem('secureCheckoutData');
  localStorage.removeItem('appliedDiscount');
  localStorage.removeItem('selectedShippingMethod');
  localStorage.removeItem('selectedPaymentMethod');
  sessionStorage.removeItem('checkoutData');
}

/**
 * Ouvre une modal
 * @param {HTMLElement} modal - Élément modal à ouvrir
 */
function openModal(modal) {
  if (!modal) return;
  modal.classList.remove("hidden");
  modal.style.removeProperty("display");
  modal.style.setProperty("display", "flex", "important");
}

/**
 * Ferme une modal
 * @param {HTMLElement} modal - Élément modal à fermer
 */
function closeModal(modal) {
  if (!modal) return;
  modal.style.removeProperty("display");
  modal.classList.add("hidden");
}

// =============================================
//        FONCTIONS D'ANIMATION
// =============================================

/**
 * Ajoute les animations à la page
 */
function addPageAnimations() {
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
  if (submitBtn) submitBtn.classList.add('animate-fadeInUp', 'delay-400');
  
  const screenshotSection = document.querySelector('main > div:nth-last-child(2)');
  if (screenshotSection) {
    screenshotSection.classList.add('animate-fadeInUp', 'delay-300', 'shine-effect');
    const icon = screenshotSection.querySelector('h3');
    if (icon) icon.classList.add('animate-float');
  }
}

/**
 * Anime les articles de commande lors de leur ajout
 */
function animateOrderItems() {
  const container = document.getElementById('order-items');
  if (!container) return;
  
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1 && node.classList) {
            node.classList.add('order-item');
          }
        });
      }
    });
  });
  
  observer.observe(container, {
    childList: true,
    subtree: false
  });
}

/**
 * Initialise toutes les animations
 */
function initializeAnimations() {
  setTimeout(() => {
    addPageAnimations();
    animateOrderItems();
  }, 100);
}

// =============================================
//              INITIALISATION
// =============================================
document.addEventListener('DOMContentLoaded', function() {
  // Cache des éléments DOM
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

  // Chargement et affichage des données
  loadOrderData();
  populateOrderData();
  populateOrderItems();
  calculateAndDisplayTotals();

  // Gestion du bouton de soumission
  if (DOM.submitButton) {
    DOM.submitButton.disabled = false;
    
    DOM.submitButton.addEventListener('click', async function(e) {
      e.preventDefault();
      
      if (!screenshotTaken) {
        openModal(DOM.screenshotModal);
        return;
      }
      
      openModal(DOM.vendorModal);
    });
  }

  // Bouton "Pas encore" (capture d'écran)
  if (DOM.notYetBtn) {
    DOM.notYetBtn.addEventListener('click', () => {
      closeModal(DOM.screenshotModal);
    });
  }

  // Bouton "C'est fait" (capture d'écran)
  if (DOM.screenshotTakenBtn) {
    DOM.screenshotTakenBtn.addEventListener('click', () => {
      screenshotTaken = true;
      closeModal(DOM.screenshotModal);
      
      if (DOM.submitButton) {
        DOM.submitButton.textContent = "Finaliser la commande";
      }
      
      setTimeout(() => openModal(DOM.vendorModal), 300);
    });
  }

  // Bouton "Continuer" (vendeur)
  if (DOM.continueToVendorBtn) {
    DOM.continueToVendorBtn.addEventListener('click', async () => {
      closeModal(DOM.vendorModal);
      
      if (DOM.submitButton) {
        DOM.submitButton.textContent = "Envoi en cours...";
        DOM.submitButton.disabled = true;
      }
      
      setTimeout(async () => {
        const success = await submitOrderToServer();
        
        if (success) {
          try { 
            window.open("https://discord.gg/beC8cFZaXH", "_blank");
          } catch (error) {
            // Erreur silencieuse si l'ouverture échoue
          }
          
          setTimeout(() => {
            openModal(DOM.confirmationModal);
          }, 500);
          
        } else {
          if (DOM.submitButton) {
            DOM.submitButton.textContent = "Réessayer";
            DOM.submitButton.disabled = false;
          }
          alert("Erreur lors de l'envoi. Veuillez réessayer.");
        }
      }, 2000);
    });
  }

  // Bouton "Retour à l'accueil"
  if (DOM.confirmationOkBtn) {
    DOM.confirmationOkBtn.addEventListener('click', (e) => {
      e.preventDefault();
      clearStorage();
      window.location.href = '/index.html';
    });
  }

  // Fermeture des modals en cliquant à l'extérieur
  [DOM.screenshotModal, DOM.vendorModal, DOM.confirmationModal].forEach(modal => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModal(modal);
        }
      });
    }
  });

  // Initialisation des animations
  initializeAnimations();
});
