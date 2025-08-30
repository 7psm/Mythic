// API/server.js
console.log("🚀 Démarrage du serveur...");

import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';
import emailService from '../MailSystem/emailService.js';
import { validateConfig } from '../MailSystem/config.js';

console.log("✅ Imports réussis");

const app = express();
const PORT = process.env.PORT || 3001;

// Équivalent de __dirname pour les modules ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(`📁 __dirname: ${__dirname}`);

// Validation de la configuration email au démarrage
console.log("🔧 Validation de la configuration email...");
if (validateConfig()) {
  console.log("✅ Configuration email valide");
} else {
  console.log("❌ Configuration email manquante - emails désactivés");
}

// Middlewares
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3001",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ------------------
// API Routes
// ------------------

// Récupérer toutes les commandes
app.get("/api/orders", async (req, res) => {
  try {
    const ordersPath = path.join(__dirname, "orders.json");
    const data = await fs.promises.readFile(ordersPath, "utf8");
    const orders = JSON.parse(data);
    res.json(orders);
  } catch (error) {
    console.error("❌ Erreur lecture orders.json:", error);
    res.status(500).json({ error: "Impossible de lire orders.json" });
  }
});

// Ajouter une commande avec envoi d'email
app.post("/api/order", async (req, res) => {
  try {
    const ordersPath = path.join(__dirname, "orders.json");
    const data = await fs.promises.readFile(ordersPath, "utf8");
    const orders = JSON.parse(data);
    
    const newOrder = {
      id: Date.now(),
      ...req.body,
      createdAt: new Date().toISOString(),
      emailSent: false
    };
    
    orders.push(newOrder);
    
    await fs.promises.writeFile(ordersPath, JSON.stringify(orders, null, 2));
    console.log("✅ Commande ajoutée:", newOrder);
    
    // Envoi d'email en arrière-plan (non-bloquant)
    if (newOrder.email && newOrder.email !== 'Non renseigné') {
      setImmediate(async () => {
        try {
          const emailSent = await emailService.sendConfirmationEmail(newOrder);
          if (emailSent) {
            newOrder.emailSent = true;
            const updatedOrders = orders.map(order => 
              order.id === newOrder.id ? { ...order, emailSent: true } : order
            );
            await fs.promises.writeFile(ordersPath, JSON.stringify(updatedOrders, null, 2));
            console.log(`✅ Email envoyé et statut mis à jour pour la commande ${newOrder.orderNumber}`);
          }
        } catch (emailError) {
          console.error("❌ Erreur envoi email:", emailError);
        }
      });
    } else {
      console.log("⚠️ Pas d'email valide pour l'envoi de confirmation");
    }
    
    res.status(201).json({ 
      message: "Commande ajoutée avec succès", 
      order: newOrder, 
      success: true,
      emailStatus: newOrder.email && newOrder.email !== 'Non renseigné' ? 'en cours d\'envoi' : 'pas d\'email'
    });
    
  } catch (error) {
    console.error("❌ Erreur traitement commande:", error);
    res.status(500).json({ 
      error: "Erreur lors du traitement de la commande", 
      success: false 
    });
  }
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