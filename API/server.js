// server.js
import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// ========================
// MIDDLEWARES
// ========================
app.use(cors()); // Autoriser toutes les origines, tu peux restreindre si besoin
app.use(express.json()); // Parse les requêtes JSON

// Servir les fichiers statiques (frontend)
app.use(express.static(path.join(__dirname, '../src')));

// ========================
// API Routes
// ========================
const ordersFilePath = path.join(__dirname, 'orders.json');

// POST /api/order -> ajoute une commande
app.post('/api/order', (req, res) => {
  const order = req.body;

  if (!order || Object.keys(order).length === 0) {
    return res.status(400).json({ success: false, message: 'Données de commande manquantes' });
  }

  // Lire les commandes existantes
  let orders = [];
  if (fs.existsSync(ordersFilePath)) {
    const data = fs.readFileSync(ordersFilePath, 'utf-8');
    try {
      orders = JSON.parse(data);
    } catch (err) {
      console.error('Erreur lecture orders.json:', err);
      orders = [];
    }
  }

  // Ajouter la nouvelle commande
  orders.push(order);

  // Écrire dans le fichier
  try {
    fs.writeFileSync(ordersFilePath, JSON.stringify(orders, null, 2));
    console.log('✅ Commande ajoutée:', order.orderNumber);
    return res.json({ success: true, message: 'Commande enregistrée' });
  } catch (err) {
    console.error('Erreur écriture orders.json:', err);
    return res.status(500).json({ success: false, message: 'Impossible d\'enregistrer la commande' });
  }
});

// ========================
// Catch-all pour frontend
// ========================
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../src/index.html'));
});

// ========================
// Lancement du serveur
// ========================
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});
