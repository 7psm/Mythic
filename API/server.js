const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Pour gros objets JSON
app.use(express.static(path.join(__dirname, '../src')));

// ========================================
// Servir les fichiers statiques
// ========================================
app.use(express.static(path.join(__dirname, '..')));        // racine (index.html)
app.use('/src', express.static(path.join(__dirname, '../src'))); // src accessible
app.use('/js', express.static(path.join(__dirname, '../src/js')));
app.use('/OBF', express.static(path.join(__dirname, '../src/OBF')));

app.listen(3001, () => console.log('Server running on port 3001'));

// ========================================
// Gestion du fichier orders.json
// ========================================
const ordersPath = path.join(__dirname, 'orders.json');

// S'assurer que le fichier existe
function ensureOrdersFileExists() {
  if (!fs.existsSync(ordersPath)) {
    fs.writeFileSync(ordersPath, '[]', 'utf8');
    console.log('📁 Fichier orders.json créé');
  }
}

// Lire toutes les commandes
function readOrders() {
  try {
    const data = fs.readFileSync(ordersPath, 'utf8');
    return data.trim() ? JSON.parse(data) : [];
  } catch (err) {
    console.error('❌ Erreur lecture orders.json:', err);
    return [];
  }
}

// Écrire les commandes
function writeOrders(orders) {
  try {
    fs.writeFileSync(ordersPath, JSON.stringify(orders, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('❌ Erreur écriture orders.json:', err);
    return false;
  }
}

// ========================================
// Routes
// ========================================

app.post('/api/order', (req, res) => {
    console.log('Commande reçue:', req.body);
    res.json({ success: true, message: 'Commande reçue sur Railway !' });
});

// Page de test
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'API Express fonctionne', timestamp: new Date().toISOString() });
});

// Récupérer toutes les commandes
app.get('/api/orders', (req, res) => {
  res.json({ success: true, orders: readOrders(), count: readOrders().length });
});

// Stocker une commande
app.post('/api/order', (req, res) => {
  const orderData = req.body;
  if (!orderData.customerInfo || !orderData.cart) {
    return res.status(400).json({ success: false, message: 'Données client ou panier manquantes' });
  }

  const enrichedOrder = { ...orderData, receivedAt: new Date().toISOString(), status: 'pending' };
  const orders = readOrders();
  orders.push(enrichedOrder);

  if (writeOrders(orders)) {
    console.log('✅ Commande sauvegardée');
    return res.json({ success: true, message: 'Commande enregistrée', orderData: enrichedOrder });
  }

  res.status(500).json({ success: false, message: 'Erreur sauvegarde commande' });
});

// Redirection vers confirmation.html
app.get('/confirmation', (req, res) => {
  res.sendFile(path.join(__dirname, '../src/pages/Confirmation.html'));
});

// Suppression de données utilisateur
app.post('/api/delete-user-data', (req, res) => {
  console.log('🗑️ Suppression des données utilisateur');
  res.json({ success: true, message: 'Données supprimées.' });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error('❌ Erreur serveur:', err);
  res.status(500).json({ success: false, message: 'Erreur interne serveur' });
});

// ========================================
// Démarrage du serveur
// ========================================
ensureOrdersFileExists();
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`));
