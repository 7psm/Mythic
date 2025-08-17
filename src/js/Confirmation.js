document.addEventListener('DOMContentLoaded', function() {
  // State variables
  let isModalOpen = false;
  let screenshotTaken = false;
  let isSubmitting = false;
  let showVendors = false;
  let selectedVendor = "";
  let orderData = {};
  
  // DOM Elements
  const submitButton = document.getElementById('submit-order');
  const screenshotModal = document.getElementById('screenshot-modal');
  const vendorModal = document.getElementById('vendor-modal');
  const notYetBtn = document.getElementById('not-yet-btn');
  const screenshotTakenBtn = document.getElementById('screenshot-taken-btn');
  const continueToVendorBtn = document.getElementById('continue-to-vendor');
  
  // Initialize the page
  function initialize() {
    console.log("=== INITIALISATION PAGE CONFIRMATION ===");
    
    // Get order data from various sources
    loadOrderData();
    
    // Check if we have order data, redirect if not
    if (!orderData.orderNumber) {
      console.log("Pas de données de commande, redirection vers l'accueil");
      window.location.href = './HomePage.html';
      return;
    }
    
    // Populate the page with order data
    populateOrderData();
    
    // Setup event listeners
    setupEventListeners();
    
    // Enable submit button after 3 seconds
    setTimeout(() => {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Soumettre la Commande';
      }
    }, 3000);
    
    console.log("=== INITIALISATION TERMINÉE ===");
  }
  
  // Load order data from localStorage and URL params
  function loadOrderData() {
    try {
      // Get order number from URL
      const urlParams = new URLSearchParams(window.location.search);
      const orderNumber = urlParams.get('order');
      
      // Get encrypted form data
      const encryptedData = localStorage.getItem("secureCheckoutData");
      let formData = null;
      
      if (encryptedData) {
        formData = decryptData(encryptedData);
      }
      
      // Get cart data
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      
      // Get selected methods
      const selectedShippingMethod = localStorage.getItem("selectedShippingMethod") || "Livraison Standard";
      const selectedPaymentMethod = localStorage.getItem("selectedPaymentMethod") || "PayPal";
      
      // Build order data object
      orderData = {
        orderNumber: orderNumber || generateOrderNumber(),
        orderDate: new Date().toISOString(),
        name: formData?.customerInfo?.name || 'Client',
        email: formData?.customerInfo?.email || 'Non renseigné',
        phoneNumber: formData?.customerInfo?.phone || 'Non renseigné',
        telegram: formData?.customerInfo?.discord || 'Non renseigné',
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
  
  // Decrypt form data
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
  
  // Generate order number
  function generateOrderNumber() {
    const timestamp = Date.now().toString().slice(-8);
    return `PM-${timestamp}`;
  }
  
  // Format date for display
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
  
  // Populate the page with order data
  function populateOrderData() {
    console.log("Population des données sur la page...");
    
    // Order header
    const orderNumberEl = document.getElementById('order-number');
    const orderDateEl = document.getElementById('order-date');
    const customerNameEl = document.getElementById('customer-name');
    
    if (orderNumberEl) orderNumberEl.textContent = orderData.orderNumber;
    if (orderDateEl) orderDateEl.textContent = formatDate(orderData.orderDate);
    if (customerNameEl) customerNameEl.textContent = orderData.name;
    
    // Customer information
    document.getElementById('contact-name').textContent = orderData.name;
    document.getElementById('contact-email').textContent = orderData.email;
    document.getElementById('contact-phone').textContent = orderData.phoneNumber;
    document.getElementById('contact-telegram').textContent = orderData.telegram;
    
    // Shipping information
    document.getElementById('shipping-address').textContent = orderData.address;
    document.getElementById('shipping-city').textContent = orderData.city;
    document.getElementById('shipping-country').textContent = orderData.country;
    document.getElementById('shipping-postal').textContent = orderData.postalCode;
    
    // Shipping and payment methods
    document.getElementById('shipping-method').textContent = orderData.shippingMethod.name;
    document.getElementById('shipping-delivery').textContent = orderData.shippingMethod.delivery;
    document.getElementById('payment-method').textContent = orderData.paymentMethod;
    
    // Order items
    populateOrderItems();
    
    // Order summary
    calculateAndDisplayTotals();
    
    console.log("Population des données terminée");
  }
  
  // Populate order items
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
  
  // Calculate and display totals
  function calculateAndDisplayTotals() {
    const subtotal = orderData.orderItems.reduce(
      (total, item) => total + (item.price * item.quantity), 
      0
    );
    
    const shippingCost = orderData.shippingMethod.price || 0;
    const total = subtotal + shippingCost;
    
    // Update display
    document.getElementById('subtotal').textContent = `€${subtotal.toFixed(2)}`;
    document.getElementById('shipping-cost').textContent = shippingCost === 0 ? 'Gratuit' : `€${shippingCost.toFixed(2)}`;
    document.getElementById('total-cost').textContent = `€${total.toFixed(2)}`;
    
    console.log("Totaux calculés:", { subtotal, shippingCost, total });
  }
  
  // Setup event listeners
  function setupEventListeners() {
    // Submit button click
    if (submitButton) {
      submitButton.addEventListener('click', handleSubmitClick);
    } else {
      console.error('❌ Bouton submit non trouvé');
    }
    
    // Screenshot modal buttons
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
    
    // Vendor modal button
    if (continueToVendorBtn) {
      continueToVendorBtn.addEventListener('click', openVendorDiscord);
    } else {
      console.error('❌ Bouton "Continuer vers le Vendeur" non trouvé');
    }
    
    // Close modals when clicking outside
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
  
  // Handle submit button click
  function handleSubmitClick() {
    console.log("Clic sur le bouton de soumission");
    
    if (!screenshotTaken) {
      // Première fois : demander capture d'écran
      console.log("Première soumission : demande de capture d'écran");
      openModal(screenshotModal);
    } else {
      // Deuxième fois (après capture confirmée) : afficher modal vendeur directement
      console.log("Deuxième soumission : affichage du modal vendeur");
      showVendorModal();
    }
  }
  
  // Handle user confirming they took a screenshot
  function confirmScreenshotTaken() {
    console.log("Capture d'écran confirmée");
    screenshotTaken = true;
    closeModal(screenshotModal);
    
    // NE PAS afficher le modal vendeur ici
    // Il s'affichera quand l'utilisateur cliquera à nouveau sur "Soumettre la commande"
    console.log('Capture d\'écran confirmée, retour à la page principale');
  }
  
  // Submit order via Discord
  async function submitOrder() {
    console.log("Soumission de la commande...");
    setSubmitting(true);
    
    try {
      // Send order data to Discord instead of Telegram
      const success = await sendOrderToDiscord(orderData);
      
      if (success) {
        console.log("Commande envoyée avec succès vers Discord");
        return true; // Retourner le succès
      } else {
        console.error("Échec de l'envoi de la commande vers Discord");
        alert("Erreur lors de l'envoi de la commande. Veuillez réessayer.");
        return false;
      }
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
      alert("Une erreur s'est produite. Veuillez réessayer.");
      return false;
    } finally {
      setSubmitting(false);
    }
  }
  
  // Send order to Discord (remplace l'ancienne fonction Telegram)
  async function sendOrderToDiscord(orderData) {
    try {
      console.log("Envoi des données de commande vers Discord...");
      
      // Formatage des données pour Discord
      const discordData = {
        numeroCommande: orderData.orderNumber,
        nom: orderData.name,
        email: orderData.email,
        pseudoDiscord: orderData.telegram, // Le champ telegram contient maintenant le pseudo Discord
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
  
  // Show vendor modal
  function showVendorModal() {
    selectedVendor = ".uwg9";
    console.log('Affichage du modal vendeur...');
    
    // Envoyer les données vers Discord avant d'afficher le modal
    submitOrder().then(() => {
      // Afficher le modal vendeur après l'envoi réussi
      openModal(vendorModal);
    });
  }
  
  // Handle vendor selection
  function handleVendorSelect(vendor) {
    selectedVendor = vendor;
    console.log("Vendeur sélectionné:", vendor);
  }
  
  // Open vendor Discord (remplace l'ancienne fonction Telegram)
  function openVendorDiscord() {
    console.log("Redirection vers Discord du vendeur:", selectedVendor);
    
    // Save order completion to localStorage
    localStorage.setItem('orderCompleted', JSON.stringify({
      orderNumber: orderData.orderNumber,
      completedAt: new Date().toISOString(),
      vendor: selectedVendor
    }));
    
    // Open Discord server
    const discordUrl = 'https://discord.gg/beC8cFZaXH';
    console.log("Ouverture de Discord:", discordUrl);
    window.open(discordUrl, '_blank');
    
    // Close modal
    closeModal(vendorModal);
    
    // Afficher un message de confirmation
    setTimeout(() => {
      alert("✅ Commande finalisée !\n\nVous allez être redirigé vers Discord pour contacter le vendeur.\n\nMerci pour votre commande !");
    }, 500);
  }
  
  // Set submitting state
  function setSubmitting(submitting) {
    isSubmitting = submitting;
    
    if (submitButton) {
      if (submitting) {
        submitButton.disabled = true;
        submitButton.textContent = 'Envoi en cours...';
      } else {
        submitButton.disabled = false;
        submitButton.textContent = 'Soumettre la Commande';
      }
    }
  }
  
  // Open modal
  function openModal(modal) {
    if (modal) {
      console.log('Ouverture du modal:', modal.id);
      modal.classList.add('active');
      isModalOpen = true;
    } else {
      console.error('Modal non trouvé pour ouverture');
    }
  }
  
  // Close modal
  function closeModal(modal) {
    if (modal) {
      console.log('Fermeture du modal:', modal.id);
      modal.classList.remove('active');
      isModalOpen = false;
    } else {
      console.error('Modal non trouvé pour fermeture');
    }
  }
  
  // Public API for debugging
  window.confirmationPage = {
    orderData,
    initialize,
    handleSubmitClick,
    confirmScreenshotTaken,
    openVendorDiscord,
    loadOrderData,
    sendOrderToDiscord
  };
  
  // Initialize the page
  initialize();
});