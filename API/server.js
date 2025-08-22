// API/server.js
console.log("🚀 Démarrage du serveur...");

import 'dotenv/config'; // Charger les variables d'environnement
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';
import emailService from '../MailSender/emailService.js';

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
app.use(cors({origin: "https://mythicmarket.netlify.app"}));

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

// Validation des données de commande
function validateOrderData(orderData) {
  const required = ['customerInfo', 'orderItems'];
  const missing = required.filter(field => !orderData[field]);
  
  if (missing.length > 0) {
    throw new Error(`Champs requis manquants: ${missing.join(', ')}`);
  }
  
  if (!orderData.customerInfo.email) {
    throw new Error('Email client requis');
  }
  
  if (!Array.isArray(orderData.orderItems) || orderData.orderItems.length === 0) {
    throw new Error('Aucun article dans la commande');
  }
  
  return true;
}

// Ajouter une commande (route alternative pour compatibilité frontend)
app.post("/api/order", async (req, res) => {
  const ordersPath = path.join(__dirname, "orders.json");
  
  try {
    // 1. Validation des données
    validateOrderData(req.body);
    
    // 2. Lire les commandes existantes
    const data = fs.readFileSync(ordersPath, "utf8");
    const orders = JSON.parse(data);
    
    // 3. Créer la nouvelle commande
    const newOrder = {
      id: Date.now(),
      ...req.body,
      createdAt: new Date().toISOString(),
      emailSent: false // Flag pour tracking
    };
    
    // 4. Sauvegarder la commande
    orders.push(newOrder);
    fs.writeFileSync(ordersPath, JSON.stringify(orders, null, 2));
    
    // 5. Envoyer l'email EN ARRIÈRE-PLAN (non-bloquant)
    setImmediate(async () => {
      try {
        const emailResult = await emailService.sendConfirmationEmail(newOrder);
        
        if (emailResult.success) {
          // Mettre à jour le flag emailSent
          newOrder.emailSent = true;
          newOrder.emailMessageId = emailResult.messageId;
          newOrder.emailTimestamp = emailResult.timestamp;
          
          // Re-sauvegarder avec les infos email
          const updatedOrders = JSON.parse(fs.readFileSync(ordersPath, "utf8"));
          const orderIndex = updatedOrders.findIndex(o => o.id === newOrder.id);
          if (orderIndex !== -1) {
            updatedOrders[orderIndex] = newOrder;
            fs.writeFileSync(ordersPath, JSON.stringify(updatedOrders, null, 2));
          }
          
          console.log(`✅ Email envoyé pour commande ${newOrder.orderNumber}`);
          
          // Optionnel: Log de succès
          console.log(`📧 Email confirmé pour ${newOrder.orderNumber}`);
        }
      } catch (emailError) {
        console.error(`❌ Erreur email pour commande ${newOrder.orderNumber}:`, emailError);
        // La commande reste valide même si l'email échoue
      }
    });
    
    // 6. Réponse immédiate au frontend (sans attendre l'email)
    console.log("✅ Commande ajoutée:", newOrder.orderNumber);
    res.status(201).json({ 
      message: "Commande ajoutée avec succès", 
      order: { 
        id: newOrder.id, 
        orderNumber: newOrder.orderNumber 
      }, 
      success: true 
    });
    
  } catch (error) {
    console.error("❌ Erreur création commande:", error);
    res.status(500).json({ 
      error: error.message || "Impossible d'ajouter la commande", 
      success: false 
    });
  }
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

// Route de test email (à supprimer en production)
app.post("/api/test-email", async (req, res) => {
  try {
    const testResult = await emailService.testEmail();
    res.json({ success: testResult, message: testResult ? "Email test envoyé" : "Échec test email" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Serving files from: ${path.join(__dirname, "../")}`);
  console.log(`🛠️  API available at: http://localhost:${PORT}/api/orders`);
  console.log(`🌐 Website available at: http://localhost:${PORT}/`);
  console.log(`📧 Email service: ${process.env.EMAIL_FROM ? '✅ Configuré' : '❌ Non configuré'}`);
});

// Gestion des erreurs non capturées
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});