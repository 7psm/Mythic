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
    "http://127.0.0.1:5501",  // Live Server local
    "http://127.0.0.1:5500",  // Alternative Live Server port
    "http://localhost:5501",  // Alternative localhost
    "http://localhost:5500",  // Alternative localhost
    "https://mythicmarket.netlify.app",
    "https://mythicmarket.netlify.app/",
    process.env.CORS_ORIGIN
  ].filter(Boolean),  // Filtre les valeurs undefined
  credentials: true,  // Permet l'envoi de cookies et d'en-têtes d'authentification
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],  // Méthodes autorisées
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']  // En-têtes autorisés
}));

// Middleware pour parser le JSON des requêtes
app.use(express.json());

// Middleware pour parser les données de formulaire
app.use(express.urlencoded({ extended: true }));

// Middleware pour gérer les requêtes OPTIONS (preflight CORS)
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

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



// ========================================
// SYSTÈME DE MAINTENANCE SÉCURISÉ
// ========================================

// Emplacement du fichier de persistance
const maintenanceDataPath = path.join(__dirname, 'maintenance.json');

// Valeurs par défaut
let maintenanceStatus = { status: 'online', timestamp: new Date().toISOString(), lastUpdatedBy: 'system' };
let maintenanceUpdates = { text: 'Aucune mise à jour pour le moment.', enabled: false, timestamp: new Date().toISOString(), lastUpdatedBy: 'system' };

// Charger les données persistées au démarrage
try {
  if (fs.existsSync(maintenanceDataPath)) {
    const raw = fs.readFileSync(maintenanceDataPath, 'utf8');
    if (raw.trim()) {
      const parsed = JSON.parse(raw);
      if (parsed.status) maintenanceStatus = parsed.status;
      if (parsed.updates) maintenanceUpdates = parsed.updates;
      console.log('💾 Données maintenance chargées depuis le disque');
    }
  }
} catch (e) {
  console.warn('⚠️ Impossible de charger maintenance.json:', e.message);
}

function saveMaintenanceData() {
  try {
    const data = { status: maintenanceStatus, updates: maintenanceUpdates };
    fs.writeFileSync(maintenanceDataPath, JSON.stringify(data, null, 2));
    console.log('💾 Données maintenance sauvegardées');
  } catch (e) {
    console.error('❌ Erreur sauvegarde maintenance.json:', e.message);
  }
}

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
  const { status } = req.body;
  
  // Pour le développement local, on accepte toutes les requêtes
  // En production, vous devriez ajouter une authentification
  
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
    saveMaintenanceData();
    
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
  // Pour le développement local, on accepte toutes les requêtes
  // En production, vous devriez ajouter une authentification
  
  try {
    maintenanceStatus = {
      status: 'online',
      timestamp: new Date().toISOString(),
      lastUpdatedBy: 'admin'
    };
    
    console.log('🔄 Statut de maintenance réinitialisé');
    saveMaintenanceData();
    
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
// MISES À JOUR (CHANGELOG/NOTES)
// ========================================

// Récupérer les mises à jour
app.get('/api/maintenance/updates', (req, res) => {
  res.json({
    success: true,
    updates: maintenanceUpdates
  });
});

// Mettre à jour le texte des mises à jour
app.post('/api/maintenance/updates', (req, res) => {
  const { text, enabled } = req.body || {};
  try {
    maintenanceUpdates = {
      text: typeof text === 'string' && text.trim() ? text : maintenanceUpdates.text,
      enabled: typeof enabled === 'boolean' ? enabled : maintenanceUpdates.enabled,
      timestamp: new Date().toISOString(),
      lastUpdatedBy: 'admin'
    };
    console.log('📝 Notes de mise à jour modifiées');
    saveMaintenanceData();
    res.json({ success: true, updates: maintenanceUpdates });
  } catch (error) {
    console.error('❌ Erreur MAJ notes:', error);
    res.status(500).json({ success: false, error: 'Impossible de mettre à jour les notes' });
  }
});

// Activer/désactiver l'affichage des mises à jour
app.post('/api/maintenance/updates/toggle', (req, res) => {
  const { enabled } = req.body || {};
  try {
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ success: false, error: 'Paramètre enabled invalide' });
    }
    maintenanceUpdates.enabled = enabled;
    maintenanceUpdates.timestamp = new Date().toISOString();
    maintenanceUpdates.lastUpdatedBy = 'admin';
    console.log(`🔔 Affichage mises à jour: ${enabled ? 'activé' : 'désactivé'}`);
    saveMaintenanceData();
    res.json({ success: true, updates: maintenanceUpdates });
  } catch (error) {
    console.error('❌ Erreur toggle updates:', error);
    res.status(500).json({ success: false, error: 'Impossible de changer l\'état des mises à jour' });
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
      // Lorsqu'un client ferme la connexion (rafraîchissement/fermeture d'onglet),
      // Express peut remonter une erreur ECONNABORTED/ECONNRESET. On l'ignore.
      if (err.code === 'ECONNABORTED' || err.code === 'ECONNRESET') {
        console.warn("⚠️  Requête client interrompue pendant l'envoi de index.html (ignorée)");
        return;
      }
      console.error("Erreur envoi index.html:", err);
      if (!res.headersSent) {
        res.status(500).send("Erreur serveur");
      }
    }
  });
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