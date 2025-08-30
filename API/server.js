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
import emailService from '../MailSystem/emailService.js';  // Service d'envoi d'emails
import { validateConfig } from '../MailSystem/config.js';  // Validation de la configuration

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
if (validateConfig()) {
  console.log("✅ Configuration email valide");
} else {
  console.log("❌ Configuration email manquante - emails désactivés");
}

// =============================================
// CONFIGURATION DES MIDDLEWARES
// =============================================

// Configuration CORS pour permettre les requêtes depuis le frontend
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3001",  // Origine autorisée
  credentials: true  // Permet l'envoi de cookies et d'en-têtes d'authentification
}));

// Middleware pour parser le JSON des requêtes
app.use(express.json());

// Middleware pour parser les données de formulaire
app.use(express.urlencoded({ extended: true }));

// =============================================
// ROUTES DE L'API
// =============================================

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
    
    // Lecture des commandes existantes
    const data = await fs.promises.readFile(ordersPath, "utf8");
    const orders = JSON.parse(data);
    
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
    if (newOrder.email && newOrder.email !== 'Non renseigné') {
      // Utilisation de setImmediate pour l'envoi en arrière-plan
      setImmediate(async () => {
        try {
          // Tentative d'envoi de l'email de confirmation
          const emailSent = await emailService.sendConfirmationEmail(newOrder);
          
          if (emailSent) {
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

// =============================================
// DÉMARRAGE DU SERVEUR
// =============================================

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