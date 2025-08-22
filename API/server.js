// API/server.js
console.log("🚀 Démarrage du serveur...");

import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';

console.log("✅ Imports réussis");

const app = express();
const PORT = process.env.PORT || 3001; // Render utilise process.env.PORT

// Équivalent de __dirname pour les modules ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(`📁 __dirname: ${__dirname}`);

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ------------------
// API Routes (AVANT la route catch-all)
// ------------------

// Récupérer toutes les commandes
app.get("/api/orders", (req, res) => {
  const ordersPath = path.join(__dirname, "orders.json");
  fs.readFile(ordersPath, "utf8", (err, data) => {
    if (err) {
      console.error("Erreur lecture orders.json:", err);
      return res.status(500).json({ error: "Impossible de lire orders.json" });
    }
    try {
      res.json(JSON.parse(data));
    } catch (parseErr) {
      console.error("Erreur parsing JSON:", parseErr);
      res.status(500).json({ error: "Fichier JSON invalide" });
    }
  });
});

// Ajouter une commande (route alternative pour compatibilité frontend)
app.post("/api/order", (req, res) => {
  const ordersPath = path.join(__dirname, "orders.json");
  fs.readFile(ordersPath, "utf8", (err, data) => {
    if (err) {
      console.error("Erreur lecture orders.json:", err);
      return res.status(500).json({ error: "Impossible de lire orders.json", success: false });
    }
    
    try {
      const orders = JSON.parse(data);
      const newOrder = {
        id: Date.now(),
        ...req.body,
        createdAt: new Date().toISOString()
      };
      
      orders.push(newOrder);
      
      fs.writeFile(ordersPath, JSON.stringify(orders, null, 2), (err) => {
        if (err) {
          console.error("Erreur écriture orders.json:", err);
          return res.status(500).json({ error: "Impossible d'ajouter la commande", success: false });
        }
        console.log("✅ Commande ajoutée:", newOrder);
        res.status(201).json({ message: "Commande ajoutée avec succès", order: newOrder, success: true });
      });
    } catch (parseErr) {
      console.error("Erreur parsing JSON:", parseErr);
      res.status(500).json({ error: "Fichier JSON invalide", success: false });
    }
  });
});

// Ajouter une commande
app.post("/api/orders", (req, res) => {
  const ordersPath = path.join(__dirname, "orders.json");
  fs.readFile(ordersPath, "utf8", (err, data) => {
    if (err) {
      console.error("Erreur lecture orders.json:", err);
      return res.status(500).json({ error: "Impossible de lire orders.json" });
    }
    
    try {
      const orders = JSON.parse(data);
      const newOrder = {
        id: Date.now(), // Ajouter un ID unique
        ...req.body,
        createdAt: new Date().toISOString()
      };
      
      orders.push(newOrder);
      
      fs.writeFile(ordersPath, JSON.stringify(orders, null, 2), (err) => {
        if (err) {
          console.error("Erreur écriture orders.json:", err);
          return res.status(500).json({ error: "Impossible d'ajouter la commande" });
        }
        res.status(201).json({ message: "Commande ajoutée avec succès", order: newOrder });
      });
    } catch (parseErr) {
      console.error("Erreur parsing JSON:", parseErr);
      res.status(500).json({ error: "Fichier JSON invalide" });
    }
  });
});

// ------------------
// Serve Frontend
// ------------------

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, "../")));

// Route catch-all (DOIT être en dernier)
app.get("*", (req, res) => {
  const indexPath = path.join(__dirname, "../index.html");
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error("Erreur envoi index.html:", err);
      res.status(500).send("Erreur serveur");
    }
  });
});

// ------------------
// Start server
// ------------------

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Serving files from: ${path.join(__dirname, "../")}`);
  console.log(`🛠️  API available at: http://localhost:${PORT}/api/orders`);
  console.log(`🌐 Website available at: http://localhost:${PORT}/`);
});

// Gestion des erreurs non capturées
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});