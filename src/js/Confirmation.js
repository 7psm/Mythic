// =============================================
// PAGE DE CONFIRMATION DE COMMANDE - MythicMarket
// =============================================
// Ce fichier gère l'affichage et la soumission finale des commandes
// Il récupère les données du checkout et envoie la commande au serveur

// 🔧 URL de l'API (à remplacer par l'URL publique de ton serveur)
const API_URL = "http://localhost:3001"; // Local development (unifié)

// =============================================
// NETTOYAGE IMMÉDIAT DE L'URL
// =============================================
// Supprime les paramètres d'URL pour une navigation propre
(function immediateURLClean() {
  try {
    const cleanURL = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, cleanURL);
    console.log("🔧 URL nettoyée immédiatement:", cleanURL);
  } catch (error) {
    console.log("⚠️ Impossible de nettoyer l'URL:", error);
  }
})();

// =============================================
// INITIALISATION AU CHARGEMENT DE LA PAGE
// =============================================
document.addEventListener('DOMContentLoaded', function() {
  // Variables d'état de la page
  let screenshotTaken = false;           // Indique si la capture d'écran a été prise
  let isSubmitting = false;              // Évite la double soumission
  let selectedVendor = ".uwg9";          // Vendeur sélectionné par défaut
  let orderData = {};                    // Données complètes de la commande

  // =============================================
  // SÉLECTION DES ÉLÉMENTS DOM
  // =============================================
  const DOM = {
    submitButton: document.getElementById('submit-order'),           // Bouton de soumission principal
    screenshotModal: document.getElementById('screenshot-modal'),     // Modal pour la capture d'écran
    vendorModal: document.getElementById('vendor-modal'),            // Modal de sélection du vendeur
    thankYouModal: document.getElementById('confirmation-modal'),    // Modal de remerciement
    notYetBtn: document.getElementById('not-yet-btn'),               // Bouton "Pas encore" pour la capture
    screenshotTakenBtn: document.getElementById('screenshot-taken-btn'), // Bouton "Capture prise"
    continueToVendorBtn: document.getElementById('continue-to-vendor'),  // Bouton continuer vers vendeur
    confirmationOkBtn: document.getElementById('confirmation-ok-btn')    // Bouton OK de confirmation
  };

  // =============================================
  // FONCTION D'INITIALISATION PRINCIPALE
  // =============================================
  function initialize() {
    console.log("🚀 Initialisation de la page confirmation");
    loadOrderData();        // Charge les données de commande depuis le localStorage
    populateOrderData();    // Remplit l'interface avec les données
    setupEventListeners();  // Configure les écouteurs d'événements
    
    // Active le bouton de soumission
    if (DOM.submitButton) DOM.submitButton.disabled = false;
  }

  // =============================================
  // CHARGEMENT DES DONNÉES DE COMMANDE
  // =============================================
  function loadOrderData() {
    // Récupération des données chiffrées du checkout
    const encryptedData = localStorage.getItem("secureCheckoutData");
    const formData = encryptedData ? decryptData(encryptedData) : null;
    
    // Récupération du panier et des préférences
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const shippingMethod = localStorage.getItem("selectedShippingMethod") || "Livraison Standard";
    const paymentMethod = localStorage.getItem("selectedPaymentMethod") || "PayPal";

    // Construction de l'objet de données de commande complet
    orderData = {
      orderNumber: generateOrderNumber(),                    // Numéro de commande unique
      orderDate: new Date().toISOString(),                  // Date de la commande
      name: formData?.customerInfo?.name || 'Client',       // Nom du client
      email: formData?.customerInfo?.email || 'Non renseigné', // Email du client
      phoneNumber: formData?.customerInfo?.phone || 'Non renseigné', // Téléphone
      discord: formData?.customerInfo?.discord || 'Non renseigné',   // Discord
      address: formData?.shippingInfo?.address || 'Non renseigné',   // Adresse de livraison
      city: formData?.shippingInfo?.city || 'Non renseigné',        // Ville
      country: formData?.shippingInfo?.country || 'Non renseigné',  // Pays
      postalCode: formData?.shippingInfo?.postalCode || 'Non renseigné', // Code postal
      orderItems: cart,                                     // Articles de la commande
      shippingMethod: {
        name: shippingMethod,                               // Méthode de livraison
        price: shippingMethod.includes('Express') ? 2.50 : 0, // Prix de livraison
        delivery: getEstimatedDelivery(shippingMethod)      // Délai estimé
      },
      paymentMethod: paymentMethod                          // Moyen de paiement
    };
  }

  // =============================================
  // CALCUL DES DÉLAIS DE LIVRAISON
  // =============================================
  function getEstimatedDelivery(method) {
    const label = (method || '').toLowerCase();
    if (label.includes('express')) return '2-4H';           // Livraison express
    if (label.includes('standard') || label.includes('classique')) return '6-12H'; // Livraison standard
    return '6-12H';                                        // Délai par défaut
  }

  // =============================================
  // DÉCHIFFREMENT DES DONNÉES SÉCURISÉES
  // =============================================
  function decryptData(encrypted) {
    try {
      // Décode l'URL et déchiffre les données
      const decoded = decodeURIComponent(atob(encrypted));
      const originalData = decoded.replace("checkout_secure_key_2024", '');
      return JSON.parse(originalData);
    } catch {
      return null;  // Retourne null en cas d'erreur de déchiffrement
    }
  }

  // =============================================
  // GÉNÉRATION DU NUMÉRO DE COMMANDE
  // =============================================
  function generateOrderNumber() {
    const randomSix = Math.floor(100000 + Math.random() * 900000);   // 6 chiffres aléatoires
    const randomFour = Math.floor(1000 + Math.random() * 9000);     // 4 chiffres aléatoires
    return `PM-${randomSix}-${randomFour}`;                         // Format: PM-XXXXXX-XXXX
  }

  // =============================================
  // AFFICHAGE DES ARTICLES DE LA COMMANDE
  // =============================================
  function populateOrderItems() {
    const container = document.getElementById('order-items');
    if (!container) return;
    
    container.innerHTML = '';  // Vide le conteneur
    
    // Création d'un élément pour chaque article
    orderData.orderItems.forEach(item => {
      const itemEl = document.createElement('div');
      itemEl.className = 'order-item';

      // Nom de l'article avec quantité
      const itemName = document.createElement('span');
      itemName.className = 'item-name';
      itemName.textContent = item.name;

      const quantity = document.createElement('span');
      quantity.textContent = ` x${item.quantity || 1}`;
      itemName.appendChild(quantity);

      // Prix de l'article
      const price = document.createElement('span');
      price.className = 'item-price';
      price.textContent = `€${item.price.toFixed(2)}`;

      // Assemblage de l'élément
      itemEl.appendChild(itemName);
      itemEl.appendChild(price);
      container.appendChild(itemEl);
    });
  }

  // =============================================
  // CALCUL ET AFFICHAGE DES TOTAUX
  // =============================================
  function calculateAndDisplayTotals() {
    // Calcul du sous-total (articles + quantités)
    const subtotal = orderData.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = orderData.shippingMethod.price;  // Frais de livraison
    const total = subtotal + shipping;                // Total final

    // Mise à jour des éléments d'affichage
    const subtotalEl = document.getElementById('subtotal');
    const shippingEl = document.getElementById('shipping-cost');
    const totalEl = document.getElementById('total-cost');

    if (subtotalEl) subtotalEl.textContent = `€${subtotal.toFixed(2)}`;
    if (shippingEl) shippingEl.textContent = shipping > 0 ? `€${shipping.toFixed(2)}` : 'Gratuit';
    if (totalEl) totalEl.textContent = `€${total.toFixed(2)}`;
  }

  // =============================================
  // REMPLISSAGE DE L'INTERFACE AVEC LES DONNÉES
  // =============================================
  function populateOrderData() {
    // Sélection de tous les éléments à remplir
    const elems = {
      orderNumber: document.getElementById('order-number'),           // Numéro de commande
      orderDate: document.getElementById('order-date'),               // Date de commande
      customerName: document.getElementById('customer-name'),         // Nom du client
      contactName: document.getElementById('contact-name'),           // Nom de contact
      contactEmail: document.getElementById('contact-email'),         // Email de contact
      contactPhone: document.getElementById('contact-phone'),         // Téléphone de contact
      contactDiscord: document.getElementById('contact-discord'),     // Discord de contact
      shippingAddress: document.getElementById('shipping-address'),   // Adresse de livraison
      shippingCity: document.getElementById('shipping-city'),         // Ville de livraison
      shippingCountry: document.getElementById('shipping-country'),   // Pays de livraison
      shippingPostal: document.getElementById('shipping-postal'),     // Code postal de livraison
      shippingMethod: document.getElementById('shipping-method'),     // Méthode de livraison
      shippingDelivery: document.getElementById('shipping-delivery'), // Délai de livraison
      paymentMethod: document.getElementById('payment-method')        // Moyen de paiement
    };

    // Remplissage de tous les champs avec les données
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

    // Affichage des articles et calcul des totaux
    populateOrderItems();
    calculateAndDisplayTotals();
  }

  // =============================================
  // CONFIGURATION DES ÉCOUTEURS D'ÉVÉNEMENTS
  // =============================================
  function setupEventListeners() {
    // Bouton de soumission principal
    if (DOM.submitButton) DOM.submitButton.addEventListener('click', handleSubmitClick);
    
    // Boutons des modals
    if (DOM.notYetBtn) DOM.notYetBtn.addEventListener('click', () => closeModal(DOM.screenshotModal));
    if (DOM.screenshotTakenBtn) DOM.screenshotTakenBtn.addEventListener('click', handleScreenshotTaken);
    if (DOM.continueToVendorBtn) DOM.continueToVendorBtn.addEventListener('click', handleVendorSelection);
    if (DOM.confirmationOkBtn) DOM.confirmationOkBtn.addEventListener('click', () => {
      clearStorage();  // Nettoie le stockage local
      window.location.href = '/index.html';  // Retour à l'accueil
    });

    // Fermeture des modals en cliquant à l'extérieur
    [DOM.screenshotModal, DOM.vendorModal, DOM.thankYouModal].forEach(modal => {
      if (modal) modal.addEventListener('click', e => { 
        if (e.target === modal) closeModal(modal); 
      });
    });
  }

  // =============================================
  // GESTION DU CLIC SUR LE BOUTON DE SOUMISSION
  // =============================================
  function handleSubmitClick(e) {
    e.preventDefault();
    
    // Vérification de la capture d'écran
    if (!screenshotTaken) {
      openModal(DOM.screenshotModal);  // Ouvre la modal de capture d'écran
    } else {
      openVendorModalAfterDelay();     // Ouvre la modal de sélection du vendeur
    }
  }

  // =============================================
  // GESTION DE LA CAPTURE D'ÉCRAN PRISE
  // =============================================
  function handleScreenshotTaken() {
    screenshotTaken = true;
    closeModal(DOM.screenshotModal);
    
    // Mise à jour du bouton de soumission
    if (DOM.submitButton) {
      DOM.submitButton.textContent = "Finaliser la commande";
      DOM.submitButton.style.backgroundColor = "#28a745";  // Couleur verte
    }
  }

  // =============================================
  // OUVERTURE DE LA MODAL DE SÉLECTION DU VENDEUR
  // =============================================
  function openVendorModalAfterDelay() {
    openModal(DOM.vendorModal);
    
    // Sélection par défaut du vendeur .uwg9
    const defaultVendor = document.querySelector('.vendor-option[data-vendor=".uwg9"]');
    if (defaultVendor) defaultVendor.classList.add('selected');
  }

  // =============================================
  // GESTION DE LA SÉLECTION DU VENDEUR
  // =============================================
  function handleVendorSelection() {
    selectedVendor = ".uwg9";  // Vendeur par défaut
    closeModal(DOM.vendorModal);
    
    // Mise à jour du bouton de soumission
    if (DOM.submitButton) {
      DOM.submitButton.textContent = "Traitement en cours...";
      DOM.submitButton.disabled = true;
      DOM.submitButton.style.backgroundColor = "#ffc107";  // Couleur jaune
    }

    // Séquence de traitement de la commande
    setTimeout(async () => {
      await submitOrderToServer();  // Envoi de la commande au serveur
      
      // Ouverture du Discord en arrière-plan
      try { 
        window.open("https://discord.gg/beC8cFZaXH", "_blank"); 
      } catch {}
      
      // Affichage de la modal de remerciement après 500ms
      setTimeout(() => openModal(DOM.thankYouModal), 500);
    }, 2000);  // Délai de 2 secondes pour l'effet visuel
  }

  // =============================================
  // ENVOI DE LA COMMANDE AU SERVEUR
  // =============================================
  async function submitOrderToServer() {
    if (isSubmitting) return false;  // Évite la double soumission
    isSubmitting = true;
    
    try {
      // Préparation des données à envoyer
      const dataToSend = { 
        ...orderData, 
        selectedVendor, 
        submittedAt: new Date().toISOString() 
      };
      
      // Envoi de la requête POST à l'API
      const response = await fetch(`${API_URL}/api/order`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Accept': 'application/json' 
        },
        body: JSON.stringify(dataToSend)
      });
      
      const result = await response.json();
      
      // Si la commande est créée avec succès, le serveur enverra l'email.
      // On ne déclenche plus d'envoi côté client pour éviter les doublons.
      
      return result.success;  // Retourne le statut de succès
      
    } catch (error) {
      console.error("Erreur serveur:", error);
      return false;
    } finally { 
      isSubmitting = false;  // Réinitialise le flag de soumission
    }
  }

  // =============================================
  // ENVOI DE L'EMAIL DE CONFIRMATION
  // =============================================
  async function sendOrderConfirmationEmail(orderData) {
    try {
      // Préparation des données pour l'email
      const emailData = {
        customerEmail: orderData.email,
        customerName: orderData.name,
        orderNumber: orderData.orderNumber,
        totalAmount: calculateOrderTotal(orderData.orderItems, orderData.shippingMethod.price),
        items: orderData.orderItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        shippingMethod: orderData.shippingMethod.name,
        shippingCost: orderData.shippingMethod.price,
        paymentMethod: orderData.paymentMethod
      };

      // Envoi de l'email via l'API
      const emailResponse = await fetch(`${API_URL}/api/send-order-email`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(emailData)
      });

      const emailResult = await emailResponse.json();
      
      if (emailResult.success) {
        console.log("✅ Email de confirmation envoyé avec succès !");
        console.log("📧 Message ID:", emailResult.messageId);
      } else {
        console.error("❌ Échec de l'envoi de l'email:", emailResult.error);
      }
      
    } catch (error) {
      console.error("❌ Erreur lors de l'envoi de l'email:", error);
    }
  }

  // =============================================
  // CALCUL DU TOTAL DE LA COMMANDE
  // =============================================
  function calculateOrderTotal(items, shippingCost = 0) {
    const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
    return (subtotal + shippingCost).toFixed(2);
  }

  // =============================================
  // NETTOYAGE DU STOCKAGE LOCAL
  // =============================================
  function clearStorage() {
    // Suppression de toutes les données de commande
    localStorage.removeItem('cart');
    localStorage.removeItem('checkoutData');
    localStorage.removeItem('secureCheckoutData');
    sessionStorage.removeItem('checkoutData');
  }

  // =============================================
  // UTILITAIRES POUR LES MODALS
  // =============================================
  function openModal(modal) { 
    if (modal) { 
      modal.style.display = 'flex'; 
      modal.classList.add('active'); 
    } 
  }
  
  function closeModal(modal) { 
    if (modal) { 
      modal.style.display = 'none'; 
      modal.classList.remove('active'); 
    } 
  }

  // =============================================
  // DÉMARRAGE DE L'APPLICATION
  // =============================================
  initialize();
});
