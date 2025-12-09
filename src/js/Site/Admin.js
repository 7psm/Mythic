// =============================================
// PAGE ADMIN - MythicMarket - PARTIE 1/2
// =============================================

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
    updateStatsDisplay();
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

  if(tab === 'codes'){
    document.querySelector('[onclick="switchTab(\'codes\')"]').classList.add('active');
    document.getElementById('tab-codes').classList.remove('hidden');
  } else if(tab === 'versions'){
    document.querySelector('[onclick="switchTab(\'versions\')"]').classList.add('active');
    document.getElementById('tab-versions').classList.remove('hidden');
  } else if(tab === 'stats'){
    document.querySelector('[onclick="switchTab(\'stats\')"]').classList.add('active');
    document.getElementById('tab-stats').classList.remove('hidden');
    updateStatsDisplay();
    loadOrdersList();
  }
}

// =============================================
// GESTION DES CODES DE RÉDUCTION
// =============================================

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

// =============================================
// GESTION DES VERSIONS
// =============================================

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

  if(history.some(v => v.version === versionNumber)){
    showVersionMessage('Cette version existe déjà dans l\'historique', 'error');
    return;
  }

  const comparison = compareVersions(versionNumber, currentVersion);
  if(comparison < 0){
    if(!confirm(`⚠️ Downgrade détecté (${versionNumber} < ${currentVersion}).\n\nVoulez-vous forcer le downgrade ?`)){
      return;
    }
  }

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

  history.push(newEntry);
  saveVersionHistory(history);
  localStorage.setItem('currentAppVersion', versionNumber);
  
  loadVersionHistory();
  updateCurrentVersionDisplay();

  document.getElementById('version-number').value = '';
  document.getElementById('version-notes').value = '';
  document.getElementById('version-date').value = '';
  document.getElementById('version-time').value = '';
  
  showVersionMessage(`✅ Version ${versionNumber} activée avec succès !`, 'success');
  console.log('✅ Nouvelle version appliquée:', newEntry);
}

function rollbackVersion(targetVersion){
  if(!confirm(`Voulez-vous vraiment restaurer la version ${targetVersion} ?\n\nCela remplacera la version actuelle.`)){
    return;
  }

  const history = getVersionHistory();
  const currentVersion = getCurrentVersion();
  const targetEntry = history.find(v => v.version === targetVersion);
  
  if(!targetEntry){
    showVersionMessage('Version introuvable', 'error');
    return;
  }

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
}

function deleteVersion(targetVersion){
  const currentVersion = getCurrentVersion();
  if(targetVersion === currentVersion){
    showVersionMessage('Impossible de supprimer la version actuelle', 'error');
    return;
  }

  if(!confirm(`Voulez-vous vraiment supprimer la version ${targetVersion} ?\n\nCette action est irréversible.`)){
    return;
  }

  const history = getVersionHistory();
  const updatedHistory = history.filter(v => v.version !== targetVersion);

  if(updatedHistory.length === history.length){
    showVersionMessage('Version introuvable', 'error');
    return;
  }

  saveVersionHistory(updatedHistory);
  loadVersionHistory();
  showVersionMessage(`✅ Version ${targetVersion} supprimée !`, 'success');
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

// =============================================
// PAGE ADMIN - MythicMarket - PARTIE 2/2
// =============================================
// GESTION DES STATISTIQUES (LOCALSTORAGE)
// =============================================

function getOrders(){
  try {
    return JSON.parse(localStorage.getItem('orders') || '[]');
  } catch {
    return [];
  }
}

function saveOrders(orders){
  localStorage.setItem('orders', JSON.stringify(orders));
}

function calculateStats(){
  const orders = getOrders();
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  let monthlyRevenue = 0;
  let monthlyOrders = 0;
  let yearlyRevenue = 0;
  let yearlyOrders = 0;
  let totalRevenue = 0;
  
  orders.forEach(order => {
    const orderDate = new Date(order.date);
    const amount = parseFloat(order.amount) || 0;
    
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

function updateStatsDisplay(){
  const stats = calculateStats();
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

function loadOrdersList(){
  const orders = getOrders();
  const list = document.getElementById('orders-list');
  list.innerHTML = '';
  
  if(orders.length === 0){
    list.innerHTML = '<p class="text-gray-500 text-center py-8">Aucune commande enregistrée</p>';
    return;
  }
  
  orders.slice().reverse().forEach((order, idx) => {
    const div = document.createElement('div');
    div.className = 'glass-input p-3 rounded-lg flex justify-between items-center';
    const date = new Date(order.date).toLocaleDateString('fr-FR', {day:'2-digit', month:'short', year:'numeric'});
    
    div.innerHTML = `
      <div class="flex-1">
        <div class="flex items-center gap-2">
          <span class="font-bold text-green-400">€${parseFloat(order.amount).toFixed(2)}</span>
          <span class="text-xs text-gray-500">${date}</span>
        </div>
        ${order.description ? `<p class="text-xs text-gray-400 mt-1">${order.description}</p>` : ''}
      </div>
      <button onclick="deleteOrder(${orders.length - 1 - idx})" class="glass px-3 py-1 rounded text-xs text-red-400 hover:bg-red-400/20 transition">
        Supprimer
      </button>
    `;
    list.appendChild(div);
  });
}

function addOrder(){
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
  
  const orders = getOrders();
  orders.push({
    id: Date.now(),
    amount: parseFloat(amount),
    date: date,
    description: description,
    createdAt: new Date().toISOString()
  });
  
  saveOrders(orders);
  
  document.getElementById('order-amount').value = '';
  document.getElementById('order-date').value = '';
  document.getElementById('order-description').value = '';
  
  updateStatsDisplay();
  loadOrdersList();
  showOrderMessage('Commande ajoutée avec succès !', 'success');
}

function deleteOrder(index){
  if(!confirm('Supprimer cette commande ?')) return;
  
  const orders = getOrders();
  orders.splice(index, 1);
  saveOrders(orders);
  
  updateStatsDisplay();
  loadOrdersList();
  showOrderMessage('Commande supprimée', 'success');
}

function clearAllOrders(){
  if(!confirm('Voulez-vous vraiment supprimer TOUTES les commandes ?\n\nCette action est irréversible.')) return;
  
  localStorage.removeItem('orders');
  updateStatsDisplay();
  loadOrdersList();
  showOrderMessage('Toutes les commandes ont été supprimées', 'success');
}

function showOrderMessage(msg, type){
  const el = document.getElementById('order-message');
  el.textContent = msg;
  el.className = `mt-4 p-3 rounded-lg ${type === 'success' ? 'success-msg' : 'error-msg'}`;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 3000);
}

// =============================================
// INITIALISATION
// =============================================
loadCodes();
loadVersionHistory();
updateCurrentVersionDisplay();
updateStatsDisplay();