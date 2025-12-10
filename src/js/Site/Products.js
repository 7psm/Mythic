// =============================================
//        PRODUCTS  - MYTHIC MARKET
// =============================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Initialisation de la page Products Test');

// =============================
//        PRODUCTS DATA
// =============================
  const products = [
    {
      id: 1,
      name: 'Nitro Boost 1 mois',
      category: 'nitro',
      description: 'Discord Nitro Boost pour 1 mois. Accès à toutes les fonctionnalités premium de discord.',
      price: 6.00,
      originalPrice: null,
      image: '',
      badge: 'LEGAL PAID',
      options: [
        { name: 'Nitro Boost 1 mois', price: 6.00 }
      ]
    },
    {
      id: 2,
      name: 'Nitro Basic 1 mois',
      category: 'nitro',
      description: 'Discord Nitro Basic pour 1 mois. Accès aux fonctionnalités de base de discord nitro.',
      price: 1.50,
      originalPrice: null,
      image: '',
      badge: 'LEGAL PAID',
      options: [
        { name: 'Nitro Basic 1 mois', price: 1.50 }
      ]
    },
    {
      id: 3,
      name: 'Server Boost 1 mois x14',
      category: 'boost',
      description: '14 Server Boosts pour votre serveur Discord pendant 1 mois.',
      price: 15.00,
      originalPrice: null,
      image: '',
      badge: 'LEGAL PAID',
      options: [
        { name: 'Server Boost 1 mois x14', price: 15.00 },
      ]
    },
    { 
      id: 4,
      name: 'Server Boost 1 mois x17',
      category: 'boost',
      description: '17 Server Boosts pour votre serveur Discord pendant 1 mois.',
      price: 19.00,
      originalPrice: null,
      image: '',
      badge: 'LEGAL PAID',
      options: [
        { name: 'Server Boost 1 mois x17', price: 19.00 }
      ]
    },
    {
      id: 5,
      name: 'Server Boost 1 mois x20',
      category: 'boost',
      description: '20 Server Boosts pour votre serveur Discord pendant 1 mois.',
      price: 24.00,
      originalPrice: null,
      image: '/public/normal/20euro.png',
      badge: 'LEGAL PAID',
      options: [
        { name: 'Server Boost 1 mois x20', price: 24.00 }
      ]
    },
    {
      id: 6,
      name: 'Server Boost 3 mois x14',
      category: 'boost',
      description: '14 Server Boosts pour votre serveur Discord pendant 3 mois.',
      price: 30.00,
      originalPrice: null,
      image: '',
      badge: 'LEGAL PAID',
      options: [
        { name: 'Server Boost 3 mois x14', price: 30.00 }
      ]
    },
    {
      id: 7,
      name: 'Server Boost 3 mois x17',
      category: 'boost',
      description: '17 Server Boosts pour votre serveur Discord pendant 3 mois.',
      price: 34.00,
      originalPrice: null,
      image: '',
      badge: 'LEGAL PAID',
      options: [
        { name: 'Server Boost 3 mois x17', price: 34.00 }
      ]
    },
    {
      id: 8,
      name: 'Server Boost 3 mois x20',
      category: 'boost',
      description: '20 Server Boosts pour votre serveur Discord pendant 3 mois.',
      price: 38.00,
      originalPrice: null,  
      image: '',
      badge: 'LEGAL PAID',
      options: [
        { name: 'Server Boost 3 mois x20', price: 38.00 }
      ]
    },
    {
      id: 9,
      name: 'Avatar Décoration',
      category: 'decoration',
      description: 'Décoration d\'avatar Discord. Prix réduit par rapport au prix officiel.',
      price: 2.50,
      originalPrice: 2.99,
      image: '',
      badge: 'PROMO',
      discount: '-22%',
      options: [
        { name: 'Avatar Décoration 2.99€', price: 2.50, originalPrice: 2.99 },
        { name: 'Avatar Décoration 3.99€', price: 3.20, originalPrice: 3.99 },
        { name: 'Avatar Décoration 4.99€', price: 4.00, originalPrice: 4.99 },
        { name: 'Avatar Décoration 5.49€', price: 4.25, originalPrice: 5.49 },
        { name: 'Avatar Décoration 6.99€', price: 5.50, originalPrice: 6.99 },
        { name: 'Avatar Décoration 8.99€', price: 6.75, originalPrice: 8.99 },
        { name: 'Avatar Décoration 9.99€', price: 8.00, originalPrice: 9.99 },
        { name: 'Avatar Décoration 11.99€', price: 9.00, originalPrice: 11.99 }
      ]
    },
    {
      id: 10,
      name: 'Online Members Discord x1000',
      category: 'members',
      description: '1000 membres en ligne pour votre serveur Discord. Profils réalistes avec avatars, pseudo, HypeSquad, bio.',
      price: 8.00,
      originalPrice: null,
      image: '',
      badge: 'LEGAL PAID',
      options: [
        { name: 'Offline Members Discord x1000', price: 8.00 },
        { name: 'Online Members Discord x1000', price: 7.00 }
      ]
    },
    {
      id: 11,
      name: 'Offline Members Discord x1000',
      category: 'members',
      description: '1000 membres en ligne pour votre serveur Discord. Profils réalistes avec avatars, pseudo, HypeSquad, bio.',
      price: 7.00,
      originalPrice: null,
      image: '',
      badge: 'LEGAL PAID',
      options: [
        { name: 'Offline Members Discord x1000', price: 7.00 },
        { name: 'Online Members Discord x1000', price: 8.00 }
      ]
    },
    {
      id: 12,
      name : 'Spotify Premium (Compte perso)',
      category: 'accounts',
      description: 'Spotify Premium est un abonnement payant qui offre une écoute sans publicité, une meilleure qualité audio, la lecture hors-ligne et la possibilité de choisir n’importe quel titre à tout moment.',
      price: 25.00,
      originalPrice: 72.84,
      image: '',
      badge: 'LEGAL PAID',
      options: [
        { name: 'Spotify Premium (Compte perso) 6 mois', price: 25.00, originalPrice: 72.84 },
        { name: 'Spotify Premium (Compte perso) 12 mois', price: 40.00, originalPrice: 145.58 }
      ]
    },
    {
      id: 13,
      name : 'Spotify Premium (Nouveau Compte)',
      category: 'accounts',
      description: 'Spotify Premium est un abonnement payant qui offre une écoute sans publicité, une meilleure qualité audio, la lecture hors-ligne et la possibilité de choisir n’importe quel titre à tout moment.',
      price: 7.00,
      originalPrice: 12.14,
      image: '',
      badge: 'LEGAL PAID',
      options: [
        { name: 'Spotify Premium (Nouveau Compte) 1 mois', price: 5.00, originalPrice: 12.14 },
        { name: 'Spotify Premium (Nouveau Compte) 3 mois', price: 12.00, originalPrice: 36.42 },
        { name: 'Spotify Premium (Nouveau Compte) 6 mois', price: 20.00, originalPrice: 72.84 },
        { name: 'Spotify Premium (Nouveau Compte) 12 mois', price: 30.00, originalPrice: 145.58 }
      ]
    },
    {
      id: 14,
      name : 'Youtube Premium (Compte perso) 6 mois',
      category: 'accounts',
      description: 'YouTube Premium est un service d’abonnement payant qui offre une expérience YouTube sans publicité, la lecture en arrière-plan, le téléchargement de vidéos pour une visualisation hors ligne et l’accès à YouTube Music Premium.',
      price: 40.00,
      originalPrice: 143.88,
      image: '',
      badge: 'LEGAL PAID',
      options: [
        { name: 'Youtube Premium (Compte perso) 6 mois', price: 40.00, originalPrice: 143.88 },
      ]
    },
    {
      id: 15,
      name : 'Youtube Premium (Nouveau Compte)',
      category: 'accounts',
      description: 'YouTube Premium est un service d’abonnement payant qui offre une expérience YouTube sans publicité, la lecture en arrière-plan, le téléchargement de vidéos pour une visualisation hors ligne et l’accès à YouTube Music Premium.',
      price: 5.00,
      originalPrice: 12.99,
      image: '',
      badge: 'LEGAL PAID',
      options: [
        { name: 'Youtube Premium 1 mois', price: 5.00, originalPrice: 12.99 },
        { name: 'Youtube Premium 3 mois', price: 15.00, originalPrice: 38.97 },
        { name: 'Youtube Premium 6 mois', price: 25.00, originalPrice: 77.94 },
        { name: 'Youtube Premium 12 mois', price: 40.00, originalPrice: 155.88 },
      ]
    },
    {
      id: 16,
      name : 'Crunchyroll (Nouveau Compte)',
      category: 'accounts',
      description: 'Crunchyroll est un service de streaming spécialisé dans les anime, offrant une vaste bibliothèque de séries et de films japonais avec des sous-titres dans plusieurs langues.',
      price: 5.00,
      originalPrice: 7.99,
      image: '',
      badge: 'LEGAL PAID',
      options: [
        { name: 'Crunchyroll (Nouveau Compte) 1 mois', price: 5.00, originalPrice: 7.99 },
        { name: 'Crunchyroll (Nouveau Compte) 3 mois', price: 12.00, originalPrice: 17.99 },
        { name: 'Crunchyroll (Nouveau Compte) 6 mois', price: 22.00, originalPrice: 35.94 },
        { name: 'Crunchyroll (Nouveau Compte) 12 mois', price: 40.00, originalPrice: 55.99 },
      ]
    },
    {
      id: 17,
      name : 'NordVPN (Nouveau Compte) 12 mois',
      category: 'accounts',
      description: 'NordVPN est un service de réseau privé virtuel (VPN) qui offre une connexion sécurisée et privée à Internet en chiffrant les données des utilisateurs et en masquant leur adresse IP.',
      price: 29.00,
      originalPrice: 59.88,
      image: '',
      badge: 'LEGAL PAID',
      options: [
        { name: 'NordVPN (Nouveau Compte) 12 mois', price: 29.00, originalPrice: 59.88 },
      ]
    },
  ];

// =============================================
// STATE MANAGEMENT
// =============================================
  let currentCategory = 'all';
  let currentSort = 'recent';
  let filteredProducts = [...products];

// =============================================
//              DOM ELEMENTS
// =============================================
  const productsGrid = document.getElementById('products-grid');
  const sortSelect = document.querySelector('.sort-select');
  const productModal = document.getElementById('product-modal');
  const modalBody = document.getElementById('modal-body');

// =============================================
//             RENDER PRODUCTS
// =============================================
  function renderProducts() {
    productsGrid.innerHTML = '';

    if (filteredProducts.length === 0) {
      productsGrid.innerHTML = `
        <div class="col-span-full text-center py-10 text-discord-text-muted">
          <i class="fas fa-search text-5xl mb-5 opacity-50"></i>
          <p>Aucun produit trouvé</p>
        </div>
      `;
      return;
    }

    // Group products by category
    const categories = {
      nitro: { name: 'Discord Nitro', icon: '⚡', gradient: 'from-[#5865f2] to-[#7289da]', products: [] },
      boost: { name: 'Server Boost', icon: '🚀', gradient: 'from-[#f093fb] to-[#f5576c]', products: [] },
      decoration: { name: 'Avatar Decorations', icon: '✨', gradient: 'from-[#43e97b] to-[#38f9d7]', products: [] },
      members: { name: 'Discord Members', icon: '👥', gradient: 'from-[#fa709a] to-[#fee140]', products: [] },
      accounts: { name: 'Accounts', icon: '🎵', gradient: 'from-[#30cfd0] to-[#330867]', products: [] },
    };

    // Group products by category
    filteredProducts.forEach(product => {
      if (categories[product.category]) {
        categories[product.category].products.push(product);
      }
    });

    // Render each category with banner
    Object.keys(categories).forEach(categoryKey => {
      const category = categories[categoryKey];
      if (category.products.length === 0) return;

      // Create category banner
      const banner = document.createElement('div');
      banner.className = 'col-span-full mb-4 mt-8 first:mt-0';
      banner.innerHTML = `
        <div class="relative bg-gradient-to-r ${category.gradient} rounded-xl p-6 overflow-hidden group hover:scale-[1.01] transition-transform duration-300">
          <!-- Background pattern -->
          <div class="absolute inset-0 opacity-20">
            <div class="absolute inset-0" style="background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px);"></div>
          </div>
          
          <!-- Glowing orb effect -->
          <div class="absolute top-1/2 right-8 -translate-y-1/2 w-32 h-32 bg-white/20 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500"></div>
          
          <!-- Content -->
          <div class="relative z-10 flex items-center gap-4">
            <div class="text-4xl transform group-hover:scale-110 transition-transform duration-300">${category.icon}</div>
            <div>
              <h3 class="text-2xl font-black text-white tracking-tight">${category.name}</h3>
              <p class="text-white/80 text-sm font-medium">${category.products.length} produit${category.products.length > 1 ? 's' : ''} disponible${category.products.length > 1 ? 's' : ''}</p>
            </div>
          </div>
          
          <!-- Decorative corner -->
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full transform translate-x-16 -translate-y-16"></div>
        </div>
      `;
      productsGrid.appendChild(banner);

      // Render products in this category
      category.products.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
      });
    });
  }

// =============================================
//           CREATE PRODUCT CARD
// =============================================
  function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'bg-discord-bg rounded-lg overflow-hidden cursor-pointer transition-all duration-200 border border-white/10 hover:-translate-y-1 hover:shadow-2xl hover:border-white/20 relative';
    card.dataset.productId = product.id;
    card.dataset.category = product.category;

    const discountBadge = product.discount ? 
      `<span class="absolute top-3 right-3 bg-red-500/95 text-white px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider z-10 backdrop-blur-sm shadow-lg">${product.discount}</span>` : '';
    
    const originalPrice = product.originalPrice ? 
      `<span class="text-sm text-discord-text-muted line-through ml-1">€${product.originalPrice.toFixed(2)}</span>` : '';
    
    const discountText = product.discount ? 
      ` <span class="text-xs text-discord-text-muted font-medium">(${product.discount})</span>` : '';

    // Generate unique gradient based on product ID for variety
    const gradientColors = [
      'linear-gradient(135deg, #5865f2 0%, #ff6b6b 100%)',
      'linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%)',
      'linear-gradient(135deg, #5865f2 0%, #4ecdc4 100%)',
      'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
      'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
      'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
      'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      'linear-gradient(135deg, #ec4899 0%, #f59e0b 100%)',
      'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
      'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
      'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
      'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)'
    ];
    
    const bgGradient = gradientColors[product.id % gradientColors.length];

    card.innerHTML = `
      <div class="w-full h-[300px] flex items-center justify-center relative overflow-hidden bg-cover bg-center" style="background: ${bgGradient};">
        <div class="absolute inset-0 opacity-60 z-[1]" style="background: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255, 255, 255, 0.03) 10px, rgba(255, 255, 255, 0.03) 20px), repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(0, 0, 0, 0.05) 10px, rgba(0, 0, 0, 0.05) 20px);"></div>
        ${discountBadge}
      </div>
      <div class="p-4 bg-discord-bg">
        <h3 class="text-base font-semibold text-discord-text mb-2 leading-tight">${product.name}</h3>
        <div class="flex justify-between items-center mt-0 pt-0">
          <div class="flex flex-row items-baseline gap-1.5">
            <span class="text-lg font-bold text-discord-text">€${product.price.toFixed(2)}${discountText}</span>
            ${originalPrice}
          </div>
        </div>
      </div>
    `;

    // Add click event to open modal
    card.addEventListener('click', () => {
      openProductModal(product);
      let optionsHTML = '';
    });

    return card;
  }

// =============================================
//            FILTER PRODUCTS
// =============================================
  function filterProducts() {
    let filtered = [...products];

    // Filter by category
    if (currentCategory !== 'all') {
      filtered = filtered.filter(p => p.category === currentCategory);
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (currentSort) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'recent':
        default:
          return b.id - a.id;
      }
    });

    filteredProducts = filtered;
    renderProducts();
  }

// =============================================
//               SORT SELECT
// =============================================
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      filterProducts();
    });
  }

// =============================================
// PRODUCT MODAL - Discord Shop Style
// =============================================
  function openProductModal(product) {
  // Calculate Nitro price (20% discount) - based on first option or base price
  const basePrice = product.options && product.options.length > 0 ? product.options[0].price : product.price;
  const nitroPrice = (basePrice * 0.8).toFixed(2);

  // Generate gradient based on product ID
  const gradientColors = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)',
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    'linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)',
    'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
    'linear-gradient(135deg, #f77062 0%, #fe5196 100%)'
  ];
  
  const bgGradient = gradientColors[product.id % gradientColors.length];

  // Generate options HTML if product has multiple options
  let optionsHTML = '';
  if (product.options && product.options.length > 1) {
    optionsHTML = `
      <div class="mb-6">
        <label class="block text-white text-sm font-semibold mb-3">Choisir une option :</label>
        <select id="product-option-select" class="w-full bg-[#1a1a1a] border border-white/20 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#667eea] focus:ring-2 focus:ring-[#667eea]/50 transition-all cursor-pointer hover:border-white/30 appearance-none" style="background-image: url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27white%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e'); background-repeat: no-repeat; background-position: right 0.7rem center; background-size: 1.2em; padding-right: 2.5rem;">
          ${product.options.map((option, index) => `
            <option value="${index}" data-price="${option.price}" style="background-color: #1a1a1a; color: white; padding: 10px;">${option.name} - €${option.price.toFixed(2)}</option>
          `).join('')}
        </select>
      </div>
    `;
  }

  modalBody.innerHTML = `
    <div class="relative w-full min-h-[600px] flex flex-col lg:flex-row overflow-hidden bg-[#0f0f0f]">
      
      <!-- LEFT PANEL: Content -->
      <div class="relative lg:w-2/5 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] p-8 lg:p-10 flex flex-col justify-between order-2 lg:order-1">
        <div class="flex-1">
          <div class="mb-6">
            <div class="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-white/90 text-xs font-semibold mb-3 shadow-lg">
              Premium Product
            </div>
            <h2 class="text-white text-4xl font-black leading-tight tracking-tight">${product.name}</h2>
          </div>
          
          <div class="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 mb-6 shadow-xl">
            <p class="text-[#c4c4c4] text-sm leading-relaxed">${product.description}</p>
          </div>

          <!-- Options selector (if multiple options) -->
          ${optionsHTML}
          
          <div class="flex flex-wrap gap-2 mb-6">
            <span class="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs font-semibold">✓ livraison 2 à 6h max</span>
            <span class="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 text-xs font-semibold">✓ 24/7 Support</span>
            <span class="px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-400 text-xs font-semibold">✓ Paiment sécurisé</span>
            <span class="px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-400 text-xs font-semibold">✓ Produit authentique</span>
          </div>
        </div>

        <div>
          <div class="relative mb-6 p-[2px] rounded-2xl bg-gradient-to-r from-[#667eea] via-[#764ba2] to-[#667eea] animate-gradient-xy">
            <div class="bg-[#1a1a1a] rounded-2xl p-5">
              <div class="flex items-baseline gap-3 mb-3">
                <span id="modal-price-display" class="text-white text-5xl font-black tracking-tight">€${basePrice.toFixed(2)}</span>
                ${product.originalPrice ? `<span class="text-gray-500 text-xl line-through">€${product.originalPrice.toFixed(2)}</span>` : ''}
              </div>
              
              <div class="nitro-price-container relative group cursor-help">
                <div class="flex items-center gap-2 text-sm">
                  <div class="w-6 h-6 flex items-center justify-center flex-shrink-0">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id="nitroGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#5865F2;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#7289DA;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="url(#nitroGradient)" stroke="url(#nitroGradient)" stroke-width="0.5"/>
                      <path d="M12 7L13.5 10.5L17 12L13.5 13.5L12 17L10.5 13.5L7 12L10.5 10.5L12 7Z" fill="white" opacity="0.9"/>
                    </svg>
                  </div>
                  <span class="text-gray-400 font-medium">€<span id="modal-nitro-price">${nitroPrice}</span> <span class="text-[#5865F2] font-semibold">with ClientCare+</span></span>
                </div>
                
                <div class="absolute bottom-full left-0 mb-3 hidden group-hover:block w-56 z-50">
                  <div class="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/10 text-white text-xs rounded-xl p-4 shadow-2xl backdrop-blur-xl">
                    <div class="font-semibold mb-1">💎 ClientCare & ClientCare+</div>
                    <div class="text-gray-400">Les abonnés bénéficient d'une réduction sur ce produit.</div>
                    <div class="absolute -bottom-1.5 left-6 w-3 h-3 bg-[#1a1a1a] border-r border-b border-white/10 rotate-45"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button class="modal-buy-button group relative w-full bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:from-[#764ba2] hover:to-[#667eea] text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 overflow-hidden shadow-2xl hover:shadow-[0_0_40px_rgba(102,126,234,0.6)] hover:scale-[1.02] active:scale-[0.98]" data-product-id="${product.id}">
            <span class="relative z-10 flex items-center justify-center gap-3">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
              <span id="modal-buy-text">Purchase for €${basePrice.toFixed(2)}</span>
            </span>
            
            <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
            </div>
            
            <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity blur-xl bg-gradient-to-r from-[#667eea] to-[#764ba2]"></div>
          </button>
          
          <div class="flex items-center justify-center gap-4 mt-5 text-xs text-gray-500">
            <div class="flex items-center gap-1.5">
              <i class="fas fa-shield-alt text-emerald-500"></i>
              <span>Paiment Sécurisé</span>
            </div>
            <div class="flex items-center gap-1.5">
              <i class="fas fa-lock text-blue-500"></i>
              <span>Crypté</span>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT PANEL: Background -->
      <div class="relative lg:w-3/5 h-[320px] lg:h-auto overflow-hidden order-1 lg:order-2">
        <div class="absolute inset-0 z-0" style="background: ${bgGradient};">
          <div class="absolute inset-0 opacity-60 animate-gradient"></div>
          <div class="absolute top-[10%] left-[15%] w-40 h-40 bg-white/10 rounded-full blur-3xl animate-float"></div>
          <div class="absolute bottom-[20%] right-[20%] w-56 h-56 bg-white/15 rounded-full blur-3xl animate-float-delayed"></div>
          <div class="absolute inset-0 opacity-[0.03] mix-blend-overlay" style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 /%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E');"></div>
        </div>
        
        <div class="absolute top-5 right-5 z-40">
          <button class="modal-close-btn group w-11 h-11 rounded-xl bg-black/40 hover:bg-black/60 backdrop-blur-xl border border-white/10 hover:border-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all duration-300 shadow-2xl hover:scale-110">
            <i class="fas fa-times text-lg"></i>
          </button>
        </div>
        
        <div class="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10"></div>
      </div>
    </div>
  `;

  // Handle option change
  const optionSelect = modalBody.querySelector('#product-option-select');
  if (optionSelect) {
    optionSelect.addEventListener('change', (e) => {
      const selectedIndex = e.target.value;
      const selectedOption = product.options[selectedIndex];
      const newPrice = selectedOption.price;
      const newNitroPrice = (newPrice * 0.8).toFixed(2);
      
      // Update displayed prices
      document.getElementById('modal-price-display').textContent = `€${newPrice.toFixed(2)}`;
      document.getElementById('modal-nitro-price').textContent = newNitroPrice;
      document.getElementById('modal-buy-text').textContent = `Purchase for €${newPrice.toFixed(2)}`;
    });
  }

  // Add to cart button
  const buyButton = modalBody.querySelector('.modal-buy-button');
  buyButton.addEventListener('click', () => {
    let selectedOption;
    if (optionSelect) {
      const selectedIndex = optionSelect.value;
      selectedOption = product.options[selectedIndex];
    } else {
      selectedOption = product.options[0];
    }
    addToCart(product, selectedOption);
    closeProductModal();
  });

  // Close button in modal
  const closeBtn = modalBody.querySelector('.modal-close-btn');
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeProductModal();
  });

  productModal.classList.add('active');
}

  function closeProductModal() {
    productModal.classList.remove('active');
  }

  productModal.addEventListener('click', (e) => {
    if (e.target === productModal) {
      closeProductModal();
    }
  });

// =============================================
//               ADD TO CART
// =============================================
  function addToCart(product, option) {
  try {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Définir une image par défaut basée sur la catégorie
    const defaultImages = {
      nitro: '/public/products/banners/Nitro.png',
      boost: '/public/products/banners/discord.png',
      decoration: '/public/products/banners/Discord_Avatar.png',
      members: '/public/products/banners/Discord_Members.png',
      accounts: '/public/products/banners/Crunchyroll.png'
    };
    
    const cartItem = {
      id: Date.now().toString(),
      name: option?.name || product.name,
      price: option?.price || product.price,
      quantity: 1,
      image: product.image || defaultImages[product.category] || '/public/logo.png',
      category: product.category
    };

    // Vérifier si l'article existe déjà
    const existingIndex = cart.findIndex(item => 
      item.name === cartItem.name && 
      Math.abs(item.price - cartItem.price) < 0.01
    );

    if (existingIndex !== -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push(cartItem);
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showToast(cartItem.name, cartItem.quantity, cartItem.price);
    
    console.log('✅ Produit ajouté au panier:', cartItem);
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout au panier:', error);
    alert('Erreur lors de l\'ajout au panier. Veuillez réessayer.');
  }
}

// =============================================
//          SHOW TOAST
// =============================================
  function showToast(name, quantity, price) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  
  toast.className = 'relative bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-xl shadow-2xl overflow-hidden transform translate-x-full opacity-0 mb-3';
  toast.style.animation = 'slideInRight 0.4s ease-out forwards';
  
  toast.innerHTML = `
    <div class="relative p-4 flex items-center gap-4">
      <!-- Icon -->
      <div class="flex-shrink-0 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
      </div>
      
      <!-- Content -->
      <div class="flex-1 min-w-0">
        <div class="font-bold text-sm mb-0.5">Ajouté au panier !</div>
        <div class="text-white/80 text-xs truncate">${name}</div>
        <div class="text-white/90 text-sm font-semibold mt-1">${quantity}x €${price.toFixed(2)}</div>
      </div>
      
      <!-- Close button -->
      <button onclick="this.closest('.relative').remove()" class="flex-shrink-0 w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
        <i class="fas fa-times text-sm"></i>
      </button>
      
      <!-- Progress bar -->
      <div class="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
        <div class="h-full bg-white/50 animate-shrink"></div>
      </div>
    </div>
  `;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOutRight 0.4s ease-out forwards';
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

// =============================================
//            UPDATE CART COUNT
// =============================================
  function updateCartCount() {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const totalCount = cart.reduce((acc, item) => acc + (item.quantity || 0), 0);
      const cartCountEl = document.querySelector('.cart-count');
      if (cartCountEl) {
        cartCountEl.textContent = totalCount;
        if (totalCount > 0) {
          cartCountEl.style.display = 'flex';
        } else {
          cartCountEl.style.display = 'none';
        }
      }
    } catch (error) {
      console.error('Erreur mise à jour compteur panier:', error);
    }
  }

// =====================
//      INITIALIZE
// =====================
  updateCartCount();
  filterProducts();
  renderProducts();
  
  console.log('✅ Page Products Test initialisée');
});