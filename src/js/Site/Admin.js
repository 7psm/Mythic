// =============================================
// PAGE ADMIN - MythicMarket
// =============================================

const API_URL = "http://localhost:3001";

 // GÉNÉRATION D'ÉTOILES
    const starsContainer = document.getElementById('stars');
    for(let i=0;i<50;i++){
      const star = document.createElement('div');
      star.className = 'star';
      star.style.width = Math.random()*3+'px';
      star.style.height = star.style.width;
      star.style.left = Math.random()*100+'%';
      star.style.top = Math.random()*100+'%';
      star.style.animationDelay = Math.random()*2+'s';
      starsContainer.appendChild(star);
    }

    // RACCOURCI CLAVIER CTRL+SHIFT+F
    document.addEventListener('keydown', (e) => {
      if(e.ctrlKey && e.shiftKey && e.key === 'F'){
        e.preventDefault();
        document.getElementById('password-modal').classList.remove('hidden');
        document.getElementById('password-input').focus();
      }
    });
    
    // VALIDATION MOT DE PASSE
    document.getElementById('password-input')?.addEventListener('keypress', (e) => {
      if(e.key === 'Enter') checkPassword();
    });

    function checkPassword(){
      const pwd = document.getElementById('password-input').value;
      if(pwd === 'evannn'){
        document.getElementById('password-modal').classList.add('hidden');
        document.getElementById('error-page').classList.add('hidden');
        document.getElementById('admin-panel').style.display = 'block';
        loadCodes();
        loadVersionHistory();
      } else {
        document.getElementById('password-error').classList.remove('hidden');
        document.getElementById('password-input').value = '';
      }
    }

    function logout(){
      document.getElementById('admin-panel').style.display = 'none';
      document.getElementById('error-page').classList.remove('hidden');
      document.getElementById('password-input').value = '';
      document.getElementById('password-error').classList.add('hidden');
    }

    // GESTION DES TABS
    function switchTab(tab){
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.add('hidden'));

        if (tab === 'codes') {
          document.querySelector('[onclick="switchTab(\'codes\')"]').classList.add('active');
          document.getElementById('tab-codes').classList.remove('hidden');
        
        } else if (tab === 'versions') {
          document.querySelector('[onclick="switchTab(\'versions\')"]').classList.add('active');
          document.getElementById('tab-versions').classList.remove('hidden');
        
        } else if(tab === 'stats') {
            document.querySelector('[onclick="switchTab(\'stats\')"]').classList.add('active');
            document.getElementById('tab-stats').classList.remove('hidden');
            updateStatsDisplay();
            loadOrdersList();
          }
    }


    // GESTION DES CODES DE RÉDUCTION
    function getCodes(){
      try {
        return JSON.parse(localStorage.getItem('discountCodes') || '{}');
      } catch {
        return {};
      }
    }

    function saveCodes(codes){
      localStorage.setItem('discountCodes', JSON.stringify(codes));
    }

    function loadCodes(){
      const codes = getCodes();
      const list = document.getElementById('codes-list');
      list.innerHTML = '';
      
      if(Object.keys(codes).length === 0){
        list.innerHTML = '<p class="text-gray-500 text-center py-8">Aucun code créé</p>';
        return;
      }

      Object.entries(codes).forEach(([code, data]) => {
        const div = document.createElement('div');
        div.className = 'glass-input p-4 rounded-lg';
        div.innerHTML = `
          <div class="flex justify-between items-start mb-2">
            <div>
              <p class="font-bold text-lg text-purple-400">${code}</p>
              <p class="text-sm text-gray-400">${data.description}</p>
            </div>
            <button onclick="deleteCode('${code}')" class="delete-btn glass px-3 py-1 rounded-lg text-red-400 hover:text-red-300 transition text-sm">
              Supprimer
            </button>
          </div>
          <div class="flex gap-4 text-sm">
            <span class="text-gray-400">Type: <span class="text-white">${data.type === 'percentage' ? 'Pourcentage' : 'Fixe'}</span></span>
            <span class="text-gray-400">Valeur: <span class="text-white">${data.value}${data.type === 'percentage' ? '%' : '€'}</span></span>
          </div>
        `;
        list.appendChild(div);
      });
    }

    function addCode(){
      const name = document.getElementById('code-name').value.trim().toUpperCase();
      const type = document.getElementById('code-type').value;
      const value = parseFloat(document.getElementById('code-value').value);
      const desc = document.getElementById('code-desc').value.trim();

      if(!name || !value || value <= 0 || !desc){
        showCodeMessage('Veuillez remplir tous les champs', 'error');
        return;
      }

      const codes = getCodes();
      
      if(codes[name]){
        showCodeMessage('Ce code existe déjà', 'error');
        return;
      }

      codes[name] = {type, value, description: desc};
      saveCodes(codes);
      
      document.getElementById('code-name').value = '';
      document.getElementById('code-value').value = '';
      document.getElementById('code-desc').value = '';
      
      loadCodes();
      showCodeMessage('Code créé avec succès !', 'success');
    }

    function deleteCode(code){
      if(!confirm(`Supprimer le code "${code}" ?`)) return;
      
      const codes = getCodes();
      delete codes[code];
      saveCodes(codes);
      loadCodes();
      showCodeMessage('Code supprimé', 'success');
    }

    function showCodeMessage(msg, type){
      const el = document.getElementById('code-message');
      el.textContent = msg;
      el.className = `mt-4 p-3 rounded-lg ${type === 'success' ? 'success-msg' : 'error-msg'}`;
      el.classList.remove('hidden');
      setTimeout(() => el.classList.add('hidden'), 3000);
    }

    // GESTION DES VERSIONS
    function getCurrentVersion(){
      try {
        const history = JSON.parse(localStorage.getItem('versionHistory') || '[]');
        return history.length > 0 ? history[history.length - 1].version : '1.0.0';
      } catch {
        return '1.0.0';
      }
    }

    function getVersionHistory(){
      try {
        return JSON.parse(localStorage.getItem('versionHistory') || '[]');
      } catch {
        return [];
      }
    }

    function saveVersionHistory(history){
      localStorage.setItem('versionHistory', JSON.stringify(history));
    }

    function loadVersionHistory(){
      const history = getVersionHistory();
      const list = document.getElementById('version-history');
      list.innerHTML = '';
      
      if(history.length === 0){
        list.innerHTML = '<p class="text-gray-500 text-center py-8">Aucune version enregistrée</p>';
        return;
      }

      history.slice().reverse().forEach((v, idx) => {
        const div = document.createElement('div');
        div.className = 'glass-input p-4 rounded-lg relative';
        const date = new Date(v.date).toLocaleDateString('fr-FR', {day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit'});
        const isLatest = idx === 0;
        
        div.innerHTML = `
          <div class="flex justify-between items-start mb-2">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <p class="font-bold text-lg text-purple-400">v${v.version}</p>
                ${isLatest ? '<span class="glass px-2 py-1 rounded text-xs text-green-400">● Actuelle</span>' : ''}
              </div>
              <p class="text-xs text-gray-500">${date}</p>
            </div>
            <div class="flex gap-2">
              ${!isLatest ? `<button onclick="rollbackVersion('${v.version}')" class="glass px-3 py-1 rounded-lg text-xs text-yellow-400 hover:bg-yellow-400/20 transition">Restaurer</button>` : ''}
              <button onclick="deleteVersion('${v.version}')" class="delete-btn glass px-3 py-1 rounded-lg text-xs text-red-400 hover:bg-red-400/20 transition border border-red-400/30">Supprimer</button>
            </div>
          </div>
          ${v.previous ? `<p class="text-sm text-gray-400 mb-2">← Depuis v${v.previous}</p>` : ''}
          ${v.notes ? `<p class="text-sm text-gray-300 whitespace-pre-line mt-2 pt-2 border-t border-white/10">${v.notes}</p>` : ''}
        `;
        list.appendChild(div);
      });
    }

    function validateVersion(version){
      if(!version || version.length > 10) return false;
      if(!/^[0-9a-zA-Z\.]+$/.test(version)) return false;
      return true;
    }

    function compareVersions(v1, v2){
      const p1 = v1.split('.').map(n => parseInt(n) || 0);
      const p2 = v2.split('.').map(n => parseInt(n) || 0);
      const len = Math.max(p1.length, p2.length);
      
      for(let i = 0; i < len; i++){
        const n1 = p1[i] || 0;
        const n2 = p2[i] || 0;
        if(n1 < n2) return -1;
        if(n1 > n2) return 1;
      }
      return 0;
    }

    function prepareVersion(){
      const versionNumber = document.getElementById('version-number').value.trim();
      const notes = document.getElementById('version-notes').value.trim();

      if(!versionNumber){
        showVersionMessage('Veuillez entrer un numéro de version', 'error');
        return;
      }

      if(!validateVersion(versionNumber)){
        showVersionMessage('Format invalide (max 10 caractères: lettres, chiffres, points)', 'error');
        return;
      }

      const history = getVersionHistory();
      const currentVersion = getCurrentVersion();

      // Vérifier si la version existe déjà
      if(history.some(v => v.version === versionNumber)){
        showVersionMessage('Cette version existe déjà dans l\'historique', 'error');
        return;
      }

      // Vérifier si c'est un downgrade
      const comparison = compareVersions(versionNumber, currentVersion);
      if(comparison < 0){
        if(!confirm(`⚠️ Downgrade détecté (${versionNumber} < ${currentVersion}).\n\nVoulez-vous forcer le downgrade ?`)){
          return;
        }
      }

      // Créer la nouvelle entrée
      const newEntry = {
        version: versionNumber,
        previous: currentVersion,
        date: (() => {
          const dateInput = document.getElementById('version-date').value;
          const timeInput = document.getElementById('version-time').value;

          if(dateInput && timeInput){
            return new Date(`${dateInput}T${timeInput}`).toISOString();
          } else if(dateInput){
            return new Date(dateInput).toISOString();
          } else {
            return new Date().toISOString();
          }
        })(),
        notes: notes,
        appliedAt: new Date().toISOString()
      };

      // Sauvegarder
      history.push(newEntry);
      saveVersionHistory(history);
      
      // Mettre à jour la version actuelle dans le système
      localStorage.setItem('currentAppVersion', versionNumber);
      
      // Recharger l'affichage
      loadVersionHistory();
      updateCurrentVersionDisplay();

      // Réinitialiser le formulaire
      document.getElementById('version-number').value = '';
      document.getElementById('version-notes').value = '';
      document.getElementById('version-date').value = '';
      document.getElementById('version-time').value = '';
      
      // Message de succès
      showVersionMessage(`✅ Version ${versionNumber} activée avec succès !`, 'success');
      
      // Log pour debug
      console.log('✅ Nouvelle version appliquée:', newEntry);
      console.log('📋 Historique complet:', history);
    }

    function rollbackVersion(targetVersion){
      if(!confirm(`Voulez-vous vraiment restaurer la version ${targetVersion} ?\n\nCela remplacera la version actuelle.`)){
        return;
      }

      const history = getVersionHistory();
      const currentVersion = getCurrentVersion();
      
      // Trouver la version cible
      const targetEntry = history.find(v => v.version === targetVersion);
      if(!targetEntry){
        showVersionMessage('Version introuvable', 'error');
        return;
      }

      // Créer une nouvelle entrée de rollback
      const rollbackEntry = {
        version: targetVersion,
        previous: currentVersion,
        date: new Date().toISOString(),
        notes: `🔄 Rollback depuis v${currentVersion}\n\n${targetEntry.notes || ''}`,
        appliedAt: new Date().toISOString(),
        isRollback: true
      };

      history.push(rollbackEntry);
      saveVersionHistory(history);
      localStorage.setItem('currentAppVersion', targetVersion);
      
      loadVersionHistory();
      updateCurrentVersionDisplay();
      
      showVersionMessage(`✅ Rollback vers v${targetVersion} effectué !`, 'success');
      console.log('🔄 Rollback effectué:', rollbackEntry);
    }

    function deleteVersion(targetVersion){
    // Empêcher la suppression de la version actuelle
     const currentVersion = getCurrentVersion();
     if(targetVersion === currentVersion){
       showVersionMessage('Impossible de supprimer la version actuelle', 'error');
       return;
     }
   
     if(!confirm(`Voulez-vous vraiment supprimer la version ${targetVersion} ?\n\nCette action est irréversible.`)){
       return;
     }
   
     const history = getVersionHistory();

     // Supprimer la version de l'historique
     const updatedHistory = history.filter(v => v.version !== targetVersion);

     if(updatedHistory.length === history.length){
       showVersionMessage('Version introuvable', 'error');
       return;
     }
   
     saveVersionHistory(updatedHistory);
     loadVersionHistory();

     showVersionMessage(`✅ Version ${targetVersion} supprimée !`, 'success');
     console.log('🗑️ Version supprimée:', targetVersion);
    }

    function updateCurrentVersionDisplay(){
      const current = getCurrentVersion();
      const versionBadge = document.getElementById('current-version-badge');
      if(versionBadge){
        versionBadge.textContent = `v${current}`;
      }
    }

    function showVersionMessage(msg, type){
      const el = document.getElementById('version-message');
      el.textContent = msg;
      el.className = `mt-4 p-3 rounded-lg ${type === 'success' ? 'success-msg' : 'error-msg'}`;
      el.classList.remove('hidden');
      setTimeout(() => el.classList.add('hidden'), 3000);
    }

 // GESTION DES STATISTIQUES
// ⚠️ ASSUME que le front-end et le back-end sont sur le même domaine/port ou que l'URL est bien configurée.
const API_ORDERS_URL = '/api/orders'; // Route GET pour tout l'historique
const API_ORDER_URL = '/api/order';   // Route POST (ajout) et DELETE (suppression)

// 1. REMPLACEMENT de getOrders (Lecture)
async function getOrders(){
  try {
    const response = await fetch(API_ORDERS_URL);
    
    if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const orders = await response.json();
    return Array.isArray(orders) ? orders : [];
  } catch (error) {
    console.error("❌ Erreur de récupération des commandes:", error);
    // En cas d'échec de l'API, on retourne un tableau vide
    return []; 
  }
}

// 2. SUPPRESSION de saveOrders

// 3. MISE À JOUR de calculateStats (doit être async)
async function calculateStats(){
  const orders = await getOrders(); // ⬅️ Attente des données du serveur
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  let monthlyRevenue = 0;
  let monthlyOrders = 0;
  let yearlyRevenue = 0;
  let yearlyOrders = 0;
  let totalRevenue = 0;
  
  orders.forEach(order => {
    // Utiliser la propriété 'createdAt' ou 'date' de l'objet de commande
    // J'utilise order.date si c'est pour l'ajout manuel, sinon order.createdAt (serveur)
    const dateSource = order.date || order.createdAt; 
    const orderDate = new Date(dateSource);
    const amount = parseFloat(order.amount || order.totalAmount) || 0; // Utiliser amount ou totalAmount
    
    totalRevenue += amount;
    
    if(orderDate.getFullYear() === currentYear){
      yearlyRevenue += amount;
      yearlyOrders++;
      
      if(orderDate.getMonth() === currentMonth){
        monthlyRevenue += amount;
        monthlyOrders++;
      }
    }
  });
  
  const averageOrder = orders.length > 0 ? totalRevenue / orders.length : 0;
  
  return {
    monthlyRevenue,
    monthlyOrders,
    yearlyRevenue,
    yearlyOrders,
    averageOrder
  };
}

// 4. MISE À JOUR de updateStatsDisplay (doit être async)
async function updateStatsDisplay(){
  const stats = await calculateStats(); // ⬅️ Appel asynchrone
  const now = new Date();
  
  document.getElementById('revenue-monthly').textContent = `€${stats.monthlyRevenue.toFixed(2)}`;
  document.getElementById('orders-monthly').textContent = stats.monthlyOrders;
  
  document.getElementById('revenue-yearly').textContent = `€${stats.yearlyRevenue.toFixed(2)}`;
  document.getElementById('orders-yearly').textContent = stats.yearlyOrders;
  
  document.getElementById('average-order').textContent = `€${stats.averageOrder.toFixed(2)}`;
  
  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  document.getElementById('current-month-label').textContent = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
  document.getElementById('current-year-label').textContent = now.getFullYear();
}

// 5. MISE À JOUR de loadOrdersList (doit être async)
async function loadOrdersList(){
  const orders = await getOrders(); // ⬅️ Attente des données du serveur
  const list = document.getElementById('orders-list');
  list.innerHTML = '';
  
  if(orders.length === 0){
    list.innerHTML = '<p class="text-gray-500 text-center py-8">Aucune commande enregistrée</p>';
    return;
  }
  
  orders.slice().reverse().forEach((order) => {
    const div = document.createElement('div');
    div.className = 'glass-input p-3 rounded-lg flex justify-between items-center';
    
    // Utilisation de l'ID unique du serveur (order.id) pour la suppression
    const date = new Date(order.date || order.createdAt).toLocaleDateString('fr-FR', {day:'2-digit', month:'short', year:'numeric'});
    const amount = parseFloat(order.amount || order.totalAmount).toFixed(2);
    const description = order.description || order.orderNumber || ''; // Utilise la description ou le numéro de commande
    
    div.innerHTML = `
      <div class="flex-1">
        <div class="flex items-center gap-2">
          <span class="font-bold text-green-400">€${amount}</span>
          <span class="text-xs text-gray-500">${date}</span>
        </div>
        ${description ? `<p class="text-xs text-gray-400 mt-1">${description}</p>` : ''}
      </div>
      <button onclick="deleteOrder('${order.id}')" class="glass px-3 py-1 rounded text-xs text-red-400 hover:bg-red-400/20 transition">
        Supprimer
      </button>
    `;
    list.appendChild(div);
  });
}

// 6. MISE À JOUR de addOrder (doit être async et POST à l'API)
async function addOrder(){
  const amount = document.getElementById('order-amount').value.trim();
  const date = document.getElementById('order-date').value;
  const description = document.getElementById('order-description').value.trim();
  
  if(!amount || parseFloat(amount) <= 0){
    showOrderMessage('Veuillez entrer un montant valide', 'error');
    return;
  }
  
  if(!date){
    showOrderMessage('Veuillez sélectionner une date', 'error');
    return;
  }

  // Le corps de la requête doit correspondre à ce que l'API attend
  const newOrderData = {
    amount: parseFloat(amount),
    date: date,
    description: description,
    // Ajouter des champs pour que le serveur l'identifie comme une commande manuelle
    orderNumber: 'MANUAL-' + Date.now(), 
    name: 'Admin Manual Order'
  };
  
  try {
    const response = await fetch(API_ORDER_URL, { // ⬅️ POST /api/order (singulier)
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newOrderData)
    });

    if (!response.ok) throw new Error('Échec de l\'ajout sur le serveur.');
    
    // Nettoyage du formulaire
    document.getElementById('order-amount').value = '';
    document.getElementById('order-date').value = '';
    document.getElementById('order-description').value = '';
    
    // Recharger la liste et les statistiques
    await updateStatsDisplay();
    await loadOrdersList();
    
    showOrderMessage('Commande ajoutée avec succès !', 'success');

  } catch (error) {
    console.error("❌ Erreur d'ajout de commande:", error);
    showOrderMessage(`Erreur serveur: ${error.message}`, 'error');
  }
}

// 7. MISE À JOUR de deleteOrder (doit être async et DELETE à l'API)
// ⚠️ Cette fonction nécessite une nouvelle route DELETE sur le serveur
async function deleteOrder(orderId){
  if(!confirm(`Supprimer la commande ID ${orderId} ?`)) return;
  
  try {
    const response = await fetch(`${API_ORDER_URL}/${orderId}`, { // ⬅️ DELETE /api/order/:id
      method: 'DELETE',
    });
    
    // Gérer le cas où la commande n'existe pas (404) ou autre erreur
    if (!response.ok && response.status !== 404) throw new Error('Échec de la suppression sur le serveur.');
    
    // Mise à jour de l'affichage
    await updateStatsDisplay();
    await loadOrdersList();
    showOrderMessage('Commande supprimée', 'success');
    
  } catch (error) {
    console.error("❌ Erreur de suppression:", error);
    showOrderMessage(`Erreur serveur: ${error.message}`, 'error');
  }
}

// 8. MISE À JOUR de clearAllOrders (doit être async)
// ⚠️ Cette fonction nécessite une nouvelle route DELETE ALL sur le serveur, 
// ou vous pouvez la faire en boucle pour l'instant
async function clearAllOrders(){
  if(!confirm('Voulez-vous vraiment supprimer TOUTES les commandes ?\n\nCette action est irréversible.')) return;
  
  // Solution simple: créer une nouvelle route DELETE pour tout effacer, ex: DELETE /api/orders
  try {
    const response = await fetch(API_ORDERS_URL, { 
      method: 'DELETE',
    });
    
    if (!response.ok) throw new Error('Échec de la suppression massive sur le serveur.');

    // Mise à jour de l'affichage
    await updateStatsDisplay();
    await loadOrdersList();
    showOrderMessage('Toutes les commandes ont été supprimées', 'success');

  } catch (error) {
    console.error("❌ Erreur de suppression massive:", error);
    showOrderMessage(`Erreur serveur: ${error.message}`, 'error');
  }
}

function showOrderMessage(msg, type){
  const el = document.getElementById('order-message');
  el.textContent = msg;
  el.className = `mt-4 p-3 rounded-lg ${type === 'success' ? 'success-msg' : 'error-msg'}`;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 3000);
}

    // INITIALISATION
    loadCodes();
    loadVersionHistory();
    updateCurrentVersionDisplay();
    updateStatsDisplay();