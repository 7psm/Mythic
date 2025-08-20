const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Exemple : Suppression des données d’un client
app.post('/api/delete-user-data', (req, res) => {
  const { userId } = req.body;
  // Ici, tu supprimerais les données du client dans ta base ou ton stockage
  // Exemple fictif :
  console.log(`Suppression des données pour l'utilisateur ${userId}`);
  // ... suppression réelle à coder ...
  res.json({ success: true, message: 'Données supprimées.' });
});

// Démarrer le serveur
app.listen(3001, () => {
  console.log('API Express démarrée sur http://localhost:3001');
});

// Stocker les données de commande côté serveur
app.post('/api/order', (req, res) => {
  const orderData = req.body;
  // Ici tu stockeras la commande (dans un fichier ou une base)
  console.log('Nouvelle commande reçue:', orderData);

  // Exemple : stocker dans un fichier JSON
  const fs = require('fs');
  fs.appendFile('orders.json', JSON.stringify(orderData) + '\n', (err) => {
    if (err) {
      console.error('Erreur de stockage:', err);
      return res.status(500).json({ success: false, message: 'Erreur de stockage.' });
    }
    res.json({ success: true, message: 'Commande enregistrée.' });
  });
});