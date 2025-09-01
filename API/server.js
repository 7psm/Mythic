// =============================================
// SERVEUR API PRINCIPAL - MythicMarket
// =============================================
// Ce fichier gère l'API backend pour l'e-commerce MythicMarket
// Il traite les commandes et envoie des emails de confirmation

console.log("🚀 Démarrage du serveur...");

// Import des modules nécessaires
import express from "express";           // Framework web pour Node.js
import cors from "cors";                 // Middleware pour gérer les requêtes cross-origin
import path from "path";                 // Utilitaire pour manipuler les chemins de fichiers
import fs from "fs";                     // Module système de fichiers
import { fileURLToPath } from 'url';     // Utilitaire pour obtenir __dirname en modules ES
import emailService from '../MailSystem/emailService-simple.js';  // Service d'envoi d'emails
import { validateConfig } from '../MailSystem/config.js';  // Validation de la configuration
import emailRoutes from '../MailSystem/routes.js';         // Routes dédiées au système d'email

console.log("✅ Imports réussis");

// Initialisation de l'application Express
const app = express();
const PORT = process.env.PORT || 3001;  // Port depuis les variables d'environnement ou 3001 par défaut

// Équivalent de __dirname pour les modules ES (nécessaire pour les imports)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(`📁 __dirname: ${__dirname}`);

// Validation de la configuration email au démarrage du serveur
console.log("🔧 Validation de la configuration email...");
const configValidation = validateConfig();
if (configValidation.isValid) {
  console.log("✅ Configuration email valide");
  // Initialisation du service email
  console.log("🔧 Initialisation du service email...");
  emailService.initializeTransporter().then(() => {
    console.log("✅ Service email initialisé avec succès");
  }).catch((error) => {
    console.error("❌ Erreur initialisation service email:", error);
  });
} else {
  console.log("❌ Configuration email manquante - emails désactivés");
}

// =============================================
// CONFIGURATION DES MIDDLEWARES
// =============================================

// Configuration CORS pour permettre les requêtes depuis le frontend
app.use(cors({
  origin: [
    "http://localhost:3001",
    "http://localhost:3000", 
    "https://mythicmarket.netlify.app",
    "https://mythicmarket.netlify.app/",
    process.env.CORS_ORIGIN
  ].filter(Boolean),  // Filtre les valeurs undefined
  credentials: true  // Permet l'envoi de cookies et d'en-têtes d'authentification
}));

// Middleware pour parser le JSON des requêtes
app.use(express.json());

// Middleware pour parser les données de formulaire
app.use(express.urlencoded({ extended: true }));

// =============================================
// ROUTES DE L'API
// =============================================

// Routes dédiées au système d'email
app.use('/api/email', emailRoutes);

// Route GET pour récupérer toutes les commandes
app.get("/api/orders", async (req, res) => {
  try {
    // Chemin vers le fichier JSON des commandes
  const ordersPath = path.join(__dirname, "orders.json");
    
    // Lecture asynchrone du fichier des commandes
    const data = await fs.promises.readFile(ordersPath, "utf8");
    const orders = JSON.parse(data);
    
    // Envoi de la réponse avec toutes les commandes
    res.json(orders);
  } catch (error) {
    console.error("❌ Erreur lecture orders.json:", error);
    res.status(500).json({ error: "Impossible de lire orders.json" });
  }
});

// Route POST pour ajouter une nouvelle commande avec envoi d'email automatique
app.post("/api/order", async (req, res) => {
  try {
    // Chemin vers le fichier JSON des commandes
    const ordersPath = path.join(__dirname, "orders.json");
    
    // Lecture des commandes existantes avec gestion d'erreur
    let orders = [];
    try {
      const data = await fs.promises.readFile(ordersPath, "utf8");
      if (data.trim()) { // Vérifier que le fichier n'est pas vide
        orders = JSON.parse(data);
      }
    } catch (readError) {
      console.log("📝 Initialisation du fichier orders.json");
      orders = []; // Initialiser avec un tableau vide si erreur
    }
    
    // Création d'une nouvelle commande avec métadonnées
      const newOrder = {
      id: Date.now(),                    // ID unique basé sur le timestamp
      ...req.body,                       // Toutes les données de la commande
      createdAt: new Date().toISOString(), // Date de création
      emailSent: false                   // Statut d'envoi d'email initial
    };
    
    // Ajout de la commande à la liste
      orders.push(newOrder);
      
    // Sauvegarde asynchrone dans le fichier JSON
    await fs.promises.writeFile(ordersPath, JSON.stringify(orders, null, 2));
        console.log("✅ Commande ajoutée:", newOrder);
    
    // =============================================
    // ENVOI D'EMAIL DE CONFIRMATION (NON-BLOQUANT)
    // =============================================
    
    // Vérification de la présence d'un email valide
    const customerEmail = newOrder.email || (newOrder.customerInfo && newOrder.customerInfo.email);
    if (customerEmail && customerEmail !== 'Non renseigné') {
      // Utilisation de setImmediate pour l'envoi en arrière-plan
      setImmediate(async () => {
        try {
          // Tentative d'envoi de l'email de confirmation
          const emailResult = await emailService.sendOrderConfirmation({
            customerEmail: customerEmail,
            customerName: newOrder.customerInfo?.name || newOrder.customerName || 'Client',
            orderNumber: newOrder.orderNumber || newOrder.id,
            totalAmount: newOrder.total || newOrder.totalAmount || 0,
            items: newOrder.cart || newOrder.items || [],
            shippingMethod: newOrder.preferences?.shippingMethod || newOrder.shippingMethod,
            shippingCost: newOrder.shippingCost || 0,
            paymentMethod: newOrder.preferences?.paymentMethod || newOrder.paymentMethod
          });
          
          if (emailResult.success) {
            // Mise à jour du statut d'envoi si réussi
            newOrder.emailSent = true;
            
            // Mise à jour du fichier JSON avec le nouveau statut
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
    
    // Réponse immédiate au client (sans attendre l'envoi d'email)
    res.status(201).json({ 
      message: "Commande ajoutée avec succès", 
      order: newOrder, 
      success: true,
      emailStatus: customerEmail && customerEmail !== 'Non renseigné' ? 'en cours d\'envoi' : 'pas d\'email'
    });
    
  } catch (error) {
    console.error("❌ Erreur traitement commande:", error);
    res.status(500).json({ 
      error: "Erreur lors du traitement de la commande", 
      success: false 
    });
  }
});

// =============================================
// ENDPOINT POUR ENVOYER UN EMAIL DE CONFIRMATION
// =============================================
app.post('/api/send-order-email', async (req, res) => {
  try {
    const { customerEmail, customerName, orderNumber, totalAmount, items, shippingMethod, shippingCost, paymentMethod } = req.body;

    // Validation des données requises
    if (!customerEmail || !customerName || !orderNumber || !totalAmount) {
      return res.status(400).json({
        success: false,
        error: "Données manquantes pour l'envoi d'email"
      });
    }

    console.log("📧 Demande d'envoi d'email pour la commande:", orderNumber);
    console.log("👤 Client:", customerName, `(${customerEmail})`);

    // Préparation des données pour l'email
    const orderData = {
      customerEmail,
      customerName,
      orderNumber,
      totalAmount,
      items: items || [],
      shippingMethod: shippingMethod || "Livraison Standard",
      shippingCost: shippingCost || 0,
      paymentMethod: paymentMethod || "Non spécifié"
    };

    // Envoi de l'email via le service
    const emailResult = await emailService.sendOrderConfirmation(orderData);

    if (emailResult.success) {
      console.log("✅ Email envoyé avec succès pour la commande:", orderNumber);
      res.json({
        success: true,
        message: "Email de confirmation envoyé avec succès",
        messageId: emailResult.messageId,
        orderNumber
      });
    } else {
      console.error("❌ Échec de l'envoi d'email:", emailResult.error);
      res.status(500).json({
        success: false,
        error: "Échec de l'envoi de l'email",
        details: emailResult.error
      });
    }

  } catch (error) {
    console.error("❌ Erreur lors de l'envoi d'email:", error);
    res.status(500).json({
      success: false,
      error: "Erreur interne du serveur lors de l'envoi d'email"
    });
  }
});



// =============================================
// SERVIR LE FRONTEND
// =============================================

// Configuration pour servir les fichiers statiques (HTML, CSS, JS, images)
app.use(express.static(path.join(__dirname, "../")));

// Route catch-all pour le routage côté client (DOIT être en dernier)
app.get("*", (req, res) => {
  const indexPath = path.join(__dirname, "../index.html");
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error("Erreur envoi index.html:", err);
      res.status(500).send("Erreur serveur");
    }
  });
});

// ========================================
// SYSTÈME DE MAINTENANCE SÉCURISÉ
// ========================================

// Variable globale pour le statut de maintenance
let maintenanceStatus = {
  status: 'online',
  timestamp: new Date().toISOString(),
  lastUpdatedBy: 'system'
};

// Endpoint pour récupérer le statut de maintenance (public)
app.get('/api/maintenance/status', (req, res) => {
  res.json({
    status: maintenanceStatus.status,
    timestamp: maintenanceStatus.timestamp,
    lastUpdatedBy: maintenanceStatus.lastUpdatedBy
  });
});

// Endpoint pour mettre à jour le statut de maintenance (sécurisé)
app.post('/api/maintenance/update', (req, res) => {
  const { status, adminKey } = req.body;
  
  // Vérification de la clé d'administration
  if (adminKey !== process.env.MAINTENANCE_ADMIN_KEY) {
    return res.status(401).json({ 
      error: 'Clé d\'administration invalide',
      message: 'Accès refusé au système de maintenance'
    });
  }
  
  // Validation du statut
  const validStatuses = ['online', 'maintenance', 'offline', 'critical'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ 
      error: 'Statut invalide',
      message: 'Les statuts valides sont: online, maintenance, offline, critical'
    });
  }
  
  try {
    // Mise à jour du statut
    maintenanceStatus = {
      status: status,
      timestamp: new Date().toISOString(),
      lastUpdatedBy: 'admin'
    };
    
    console.log(`🔧 Statut de maintenance mis à jour: ${status}`);
    
    res.json({
      success: true,
      message: `Statut mis à jour: ${status}`,
      data: maintenanceStatus
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du statut:', error);
    res.status(500).json({ 
      error: 'Erreur serveur',
      message: 'Impossible de mettre à jour le statut'
    });
  }
});

// Endpoint pour réinitialiser le statut (sécurisé)
app.post('/api/maintenance/reset', (req, res) => {
  const { adminKey } = req.body;
  
  if (adminKey !== process.env.MAINTENANCE_ADMIN_KEY) {
    return res.status(401).json({ 
      error: 'Clé d\'administration invalide',
      message: 'Accès refusé au système de maintenance'
    });
  }
  
  try {
    maintenanceStatus = {
      status: 'online',
      timestamp: new Date().toISOString(),
      lastUpdatedBy: 'admin'
    };
    
    console.log('🔄 Statut de maintenance réinitialisé');
    
    res.json({
      success: true,
      message: 'Statut réinitialisé à "online"',
      data: maintenanceStatus
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation:', error);
    res.status(500).json({ 
      error: 'Erreur serveur',
      message: 'Impossible de réinitialiser le statut'
    });
  }
});

// ========================================
// DÉMARRAGE DU SERVEUR
// ========================================

// Démarrage du serveur sur le port configuré
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Serving files from: ${path.join(__dirname, "../")}`);
  console.log(`🛠️  API available at: http://localhost:${PORT}/api/orders`);
  console.log(`🌐 Website available at: http://localhost:${PORT}/`);
});

// =============================================
// GESTION DES ERREURS NON CAPTURÉES
// =============================================

// Gestion des promesses rejetées non gérées
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Gestion des exceptions non capturées
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);  // Arrêt du processus en cas d'erreur critique
});