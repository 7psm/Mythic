document.addEventListener('DOMContentLoaded', function() {
  // Etat des Variables
  let isModalOpen = false;
  let screenshotTaken = false;
  let isSubmitting = false;
  let showVendors = false;
  let selectedVendor = "";
  let orderData = {};
  
  // Eléments DOM
  const submitButton = document.getElementById('submit-order');
  const screenshotModal = document.getElementById('screenshot-modal');
  const vendorModal = document.getElementById('vendor-modal');
  const notYetBtn = document.getElementById('not-yet-btn');
  const screenshotTakenBtn = document.getElementById('screenshot-taken-btn');
  const continueToVendorBtn = document.getElementById('continue-to-vendor');
 const confirmationModal = document.getElementById('confirmation-modal');
  const confirmationOkBtn = document.getElementById('confirmation-ok-btn');
  
  // Initialisation de la Page
  function initialize() {
    console.log("=== INITIALISATION PAGE CONFIRMATION ===");
    
    // Récupérer les données de commande à partir de différentes sources.
    loadOrderData();
    
    // Vérifier si nous disposons des données de commande -> rediriger si ce n'est pas le cas.
    if (!orderData.orderNumber) {
      console.log("Pas de données de commande, redirection vers l'accueil");
      window.location.href = '/index.html';
      return;
    }
    
    // Remplir la page avec les données de commande.
    populateOrderData();
    
    // Configurer les écouteurs d'événements.
    setupEventListeners();

     setTimeout(() => {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Soumettre la Commande';
      }
    }, 500);
    
    console.log("=== INITIALISATION TERMINÉE ===");
  }
  
  // Charger les données de commande à partir du localStorage et des paramètres URL.
  function loadOrderData() {
    try {
      // Obtenir le numéro de commande à partir de l'URL
      const urlParams = new URLSearchParams(window.location.search);
      const orderNumber = urlParams.get('order');
      
      // Obtenir les données du formulaire cryptées
      const encryptedData = localStorage.getItem("secureCheckoutData");
      let formData = null;
      
      if (encryptedData) {
        formData = decryptData(encryptedData);
      }
      
      // Obtenir les données du panier
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      
      // Obtenir les méthodes sélectionnées
      const selectedShippingMethod = localStorage.getItem("selectedShippingMethod") || "Livraison Standard";
      const selectedPaymentMethod = localStorage.getItem("selectedPaymentMethod") || "PayPal";
      
      // Créer un objet de données de commande
      orderData = {
        orderNumber: orderNumber || generateOrderNumber(),
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
          delivery: selectedShippingMethod.includes('Express') ? '15-20min' : '6-12h'
        },
        paymentMethod: selectedPaymentMethod
      };
      
      console.log("Données de commande chargées:", orderData);
      
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      orderData = { orderNumber: null };
    }
  }
  
  // Décrypter les données du formulaire
  function decryptData(encryptedData) {
    try {
      const decoded = decodeURIComponent(atob(encryptedData));
      const originalData = decoded.replace("checkout_secure_key_2024", '');
      return JSON.parse(originalData);
    } catch (error) {
      console.error("Erreur de déchiffrement:", error);
      return null;
    }
  }
  
  // Générer un numéro de commande
  function generateOrderNumber() {
    const timestamp = Date.now().toString().slice(-8);
    return `PM-${timestamp}`;
  }
  
  // Formater la date pour l'affichage
  function formatDate(dateString) {
    if (!dateString) return new Date().toLocaleDateString('fr-FR');
    
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  // Remplir la page avec les données de la commande
  function populateOrderData() {
    console.log("Population des données sur la page...");
    
    // En-têtes de la Commande
    const orderNumberEl = document.getElementById('order-number');
    const orderDateEl = document.getElementById('order-date');
    const customerNameEl = document.getElementById('customer-name');
    
    if (orderNumberEl) orderNumberEl.textContent = orderData.orderNumber;
    if (orderDateEl) orderDateEl.textContent = formatDate(orderData.orderDate);
    if (customerNameEl) customerNameEl.textContent = orderData.name;
    
    // Informations Client
    document.getElementById('contact-name').textContent = orderData.name;
    document.getElementById('contact-email').textContent = orderData.email;
    document.getElementById('contact-phone').textContent = orderData.phoneNumber;
    document.getElementById('contact-discord').textContent = orderData.discord;
    
    // Informations de livraison
    document.getElementById('shipping-address').textContent = orderData.address;
    document.getElementById('shipping-city').textContent = orderData.city;
    document.getElementById('shipping-country').textContent = orderData.country;
    document.getElementById('shipping-postal').textContent = orderData.postalCode;
    
    // Modes de livraison et de paiement
    document.getElementById('shipping-method').textContent = orderData.shippingMethod.name;
    document.getElementById('shipping-delivery').textContent = orderData.shippingMethod.delivery;
    document.getElementById('payment-method').textContent = orderData.paymentMethod;
    
    // Articles Commandés
    populateOrderItems();
    
    // Récapitulatif de la commande
    calculateAndDisplayTotals();
    
    console.log("Population des données terminée");
  }
  
  // Remplir les articles commandés
  function populateOrderItems() {
    const orderItemsContainer = document.getElementById('order-items');
    if (!orderItemsContainer) return;
    
    orderItemsContainer.innerHTML = '';
    
    orderData.orderItems.forEach(item => {
      const itemTotal = item.price * item.quantity;
      
      const orderItem = document.createElement('div');
      orderItem.className = 'order-item';
      orderItem.innerHTML = `
        <div class="item-name">
          ${item.name}
          <span>x${item.quantity}</span>
        </div>
        <div class="item-price">€${itemTotal.toFixed(2)}</div>
      `;
      orderItemsContainer.appendChild(orderItem);
    });
  }
  
  // Calculer et afficher les totaux
  function calculateAndDisplayTotals() {
    const subtotal = orderData.orderItems.reduce(
      (total, item) => total + (item.price * item.quantity), 
      0
    );
    
    const shippingCost = orderData.shippingMethod.price || 0;
    const total = subtotal + shippingCost;
    
    // Mettre à jour l'affichage
    document.getElementById('subtotal').textContent = `€${subtotal.toFixed(2)}`;
    document.getElementById('shipping-cost').textContent = shippingCost === 0 ? 'Gratuit' : `€${shippingCost.toFixed(2)}`;
    document.getElementById('total-cost').textContent = `€${total.toFixed(2)}`;
    
    console.log("Totaux calculés:", { subtotal, shippingCost, total });
  }
  
  // Configurer les écouteurs d'événements
  function setupEventListeners() {
    // Clic sur le bouton « Soumettre »
    if (submitButton) {
      submitButton.addEventListener('click', handleSubmitClick);
    } else {
      console.error('❌ Bouton submit non trouvé');
    }
    
    // Boutons modaux de capture d'écran
    if (notYetBtn) {
      notYetBtn.addEventListener('click', () => {
        console.log('Clic sur "Pas encore"');
        closeModal(screenshotModal);
      });
    } else {
      console.error('❌ Bouton "Pas encore" non trouvé');
    }
    
    if (screenshotTakenBtn) {
      screenshotTakenBtn.addEventListener('click', confirmScreenshotTaken);
    } else {
      console.error('❌ Bouton "J\'ai pris une capture" non trouvé');
    }
    
    // Bouton modal du fournisseur
    if (continueToVendorBtn) {
      continueToVendorBtn.addEventListener('click', openVendorDiscord);
    } else {
      console.error('❌ Bouton "Continuer vers le Vendeur" non trouvé');
    }

    // Bouton OK du modal de confirmation
    if (confirmationOkBtn) {
      confirmationOkBtn.addEventListener('click', () => {
      window.location.href = '/index.html';
      });
    } else {
      console.error('❌ Bouton "OK Confirmation" non trouvé');
    }
    
    // Fermer les modaux en cliquant en dehors
    [screenshotModal, vendorModal].forEach(modal => {
      if (modal) {
        modal.addEventListener('click', function(e) {
          if (e.target === modal) {
            console.log('Clic à l\'extérieur du modal, fermeture...');
            closeModal(modal);
          }
        });
      }
    });
    
    // Test d'affichage des modales au chargement (pour debug)
    console.log('🔍 Debug - Éléments modales:');
    console.log('Screenshot modal:', screenshotModal ? 'Trouvé' : 'Non trouvé');
    console.log('Vendor modal:', vendorModal ? 'Trouvé' : 'Non trouvé');
    
    console.log("Event listeners configurés");
  }
  
  // Gérer le clic du bouton « Soumettre »
  function handleSubmitClick(e) {
    e.preventDefault();
  if (isSubmitting) {
    console.log("Déjà en cours, clic ignoré.");
    return;
  }

  if (!screenshotTaken) {
    console.log("Demande capture d'écran");
    openModal(screenshotModal);
  } else {
    console.log("Capture OK, envoi commande");
    showVendorModal();
  }
}
  
  // Gérer la confirmation par l'utilisateur qu'il a pris une capture d'écran
  function confirmScreenshotTaken() {
    console.log("Capture d'écran confirmée");
    screenshotTaken = true;
    closeModal(screenshotModal);
    
    // NE PAS afficher le modal vendeur ici
    // Il s'affichera quand l'utilisateur cliquera à nouveau sur "Soumettre la commande"
    console.log('Capture d\'écran confirmée, retour à la page principale');
  }
  
  // Envoyer la commande via Discord
 async function submitOrder() {
  console.log("Soumission de la commande...");
  setSubmitting(true);

  try {
    const success = await DiscordOrderService.sendOrder(orderData);

    if (success) {
      console.log("Commande envoyée avec succès vers Discord");
      return true;
    } else {
      console.error("Échec de l'envoi de la commande vers Discord");
      // Supprime cette ligne : alert("Erreur lors de l'envoi de la commande. Veuillez réessayer.");
      return false;
    }
  } catch (error) {
    console.error("Erreur lors de la soumission:", error);
    // Supprime cette ligne : alert("Une erreur s'est produite. Veuillez réessayer.");
    return false;
  } finally {
    setSubmitting(false); // Toujours réactiver le bouton
  }
}
  
  // Envoyer la commande à Discord 
  async function sendOrderToDiscord(orderData) {
    try {
      console.log("Envoi des données de commande vers Discord...");
      
      // Formatage des données pour Discord
      const discordData = {
        numeroCommande: orderData.orderNumber,
        nom: orderData.name,
        email: orderData.email,
        pseudoDiscord: orderData.discord,
        telephone: orderData.phoneNumber,
        adresse: orderData.address,
        ville: orderData.city,
        codePostal: orderData.postalCode,
        pays: orderData.country,
        articles: orderData.orderItems.map(item => ({
          nom: item.name,
          quantite: item.quantity,
          prix: item.price
        })),
        methodeLivraison: orderData.shippingMethod.name,
        delaiLivraison: orderData.shippingMethod.delivery,
        fraisLivraison: orderData.shippingMethod.price,
        methodePaiement: orderData.paymentMethod,
        dateCommande: orderData.orderDate
      };
      
      // Simuler l'envoi vers Discord (remplacez par votre vraie API Discord)
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log("📨 Données envoyées vers Discord:", discordData);
          
          // Simulation d'un embed Discord
          console.log("🎨 Embed Discord créé:");
          console.log(`Titre: 🛒 Nouvelle commande ${discordData.numeroCommande}`);
          console.log(`Client: ${discordData.nom} (${discordData.pseudoDiscord})`);
          console.log(`Articles: ${discordData.articles.length} article(s)`);
          console.log(`Total: €${(discordData.articles.reduce((t, a) => t + (a.prix * a.quantite), 0) + discordData.fraisLivraison).toFixed(2)}`);
          
          resolve(true); // Simuler le succès
        }, 1500);
      });
      
    } catch (error) {
      console.error("Erreur lors de l'envoi vers Discord:", error);
      return false;
    }
  }
  
  // Afficher la fenêtre modale du fournisseur
  function showVendorModal() {
    selectedVendor = "Incognito Market";
    console.log('Affichage du modal vendeur...');
    
    // Envoyer les données vers Discord avant d'afficher le modal
    submitOrder().then(() => {
      // Afficher le modal vendeur après l'envoi réussi
      openModal(vendorModal);
    });
  }
  
  // Gérer la sélection du fournisseur
  function handleVendorSelect(vendor) {
    selectedVendor = vendor;
    console.log("Vendeur sélectionné:", vendor);
  }
  
  // Ouvrir Discord du vendeur
  function openVendorDiscord() {
  console.log("Redirection vers Discord du vendeur:", selectedVendor);

  // Enregistrer la fin de la commande dans localStorage
  localStorage.setItem('orderCompleted', JSON.stringify({
    orderNumber: orderData.orderNumber,
    completedAt: new Date().toISOString(),
    vendor: selectedVendor
  }));

  // 🛒 RÉINITIALISER LE PANIER
  console.log("Réinitialisation du panier...");
  localStorage.removeItem('cart');
  localStorage.removeItem('propMoneyCart');
  localStorage.removeItem('secureCheckoutData');
  localStorage.removeItem('selectedShippingMethod');
  localStorage.removeItem('selectedPaymentMethod');

  // Réinitialiser le compteur du panier
  const cartCountElement = document.querySelector('.cart-count');
  if (cartCountElement) {
    cartCountElement.textContent = '0';
    cartCountElement.style.display = 'flex';
  }

  console.log("✅ Panier réinitialisé avec succès");

  // Ouvrir le lien Discord
  const discordUrl = 'https://discord.gg/beC8cFZaXH';
  console.log("Ouverture de Discord:", discordUrl);
  window.open(discordUrl, '_blank');

  // Fermer le modal vendeur
  closeModal(vendorModal);

  // ✅ Afficher le message de remerciement après 1 seconde
  setTimeout(() => {
  console.log("🎉 Ouverture du modal de remerciement");
  openModal(confirmationModal);
  }, 1000)};

  // Définir l'état d'envoie
  function setSubmitting(submitting) {
  isSubmitting = submitting;

  if (submitButton) {
    submitButton.disabled = submitting;
    submitButton.textContent = submitting ? 'Envoi en cours...' : 'Soumettre la Commande';
  }
}
  
  // Ouvrir le Modal
  function openModal(modal) {
    if (modal) {
      console.log('Ouverture du modal:', modal.id);
      modal.classList.add('active');
      isModalOpen = true;
    } else {
      console.error('Modal non trouvé pour ouverture');
    }
  }
  
  // Fermer le Modal
  function closeModal(modal) {
    if (modal) {
      console.log('Fermeture du modal:', modal.id);
      modal.classList.remove('active');
      isModalOpen = false;
    } else {
      console.error('Modal non trouvé pour fermeture');
    }
  }
  
  // Public API pour debugger
  window.confirmationPage = {
    orderData,
    initialize,
    handleSubmitClick,
    confirmScreenshotTaken,
    openVendorDiscord,
    loadOrderData,
    sendOrderToDiscord
  };
  
  // Initialiser la page
  initialize();
});