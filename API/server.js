// =============================================
//        SERVEUR API + BOT DISCORD
// =============================================

console.log("🚀 Démarrage du serveur et du bot...");

import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
// import discordBotService from "../Discord/index.js";
import { promises as fsPromises } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

console.log("✅ Chargement des dépendances OK");

const execPromise = promisify(exec);
const app = express();
const PORT = process.env.PORT || 3001;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// =============================================
// 🔥 MIDDLEWARES - CORS AMÉLIORÉ
// =============================================

// 1. Configuration CORS AVANT express.json()
app.use(cors({
  origin: function(origin, callback) {
    // Autoriser les requêtes sans origin (comme curl ou Postman)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      "http://localhost:3001",
      "http://localhost:3000",
      "http://127.0.0.1:5501",
      "http://127.0.0.1:5500",
      "http://localhost:5501",
      "http://localhost:5500",
      "https://getmythic.netlify.app",
      "https://mythic-api.onrender.com"
    ];
    
    // Autoriser tous les localhost en développement
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      // Log désactivé - seules les erreurs sont loggées
      callback(null, true); // En dev, on autorise quand même
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  exposedHeaders: ["Content-Length", "Content-Type"],
  maxAge: 86400 // 24 heures
}));

// 2. Middleware de logging - DÉSACTIVÉ (seules les erreurs sont loggées)
// Les logs de requêtes normales sont désactivés pour réduire le bruit dans la console
app.use((req, res, next) => {
  next();
});

// 3. Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. Headers manuels pour compatibilité maximale
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept");
  res.header("Access-Control-Allow-Credentials", "true");
  
  // Gérer les requêtes OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    // Log désactivé - seules les erreurs sont loggées
    return res.sendStatus(200);
  }
  
  next();
});


// ========================
//   📋 ROUTES COMMANDES
// ========================

// Lire toutes les commandes
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

// Récupérer une commande par ID
app.get("/api/order/:id", async (req, res) => {
  try {
    const ordersPath = path.join(__dirname, "orders.json");
    const data = await fs.promises.readFile(ordersPath, "utf8");
    const orders = JSON.parse(data);
    const order = orders.find(
      (o) => o.id === parseInt(req.params.id) || o.orderNumber === req.params.id
    );
    if (order) res.json(order);
    else res.status(404).json({ error: "Commande introuvable" });
  } catch (error) {
    console.error("❌ Erreur récupération commande:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// =============================================
//   📋 ROUTES VERSIONS (RELEASE NOTES)
// =============================================

// Récupérer toutes les versions
app.get("/api/versions", async (req, res) => {
  try {
    const versionsPath = path.join(__dirname, "versions.json");
    
    // Vérifier si le fichier existe
    if (!fs.existsSync(versionsPath)) {
      console.log("📄 Création du fichier versions.json");
      await fs.promises.writeFile(versionsPath, JSON.stringify([], null, 2));
      return res.json([]);
    }
    
    const data = await fs.promises.readFile(versionsPath, "utf8");
    const versions = JSON.parse(data || "[]");
    
    // Retourner uniquement les numéros de version pour le modal
    const versionList = versions.map(v => ({
      number: v.version,
      date: v.date
    }));
    
    res.json(versionList);
  } catch (error) {
    console.error("❌ Erreur lecture versions:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Récupérer le contenu complet des versions
app.get("/api/versions/content", async (req, res) => {
  try {
    const versionsPath = path.join(__dirname, "versions.json");
    
    if (!fs.existsSync(versionsPath)) {
      return res.json([]);
    }
    
    const data = await fs.promises.readFile(versionsPath, "utf8");
    const versions = JSON.parse(data || "[]");
    
    res.json(versions);
  } catch (error) {
    console.error("❌ Erreur lecture contenu versions:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.post("/api/versions", async (req, res) => {
  console.log("📝 Nouvelle version reçue:", req.body);
  
  try {
    const versionsPath = path.join(__dirname, "versions.json");
    let versions = [];
    
    // Lire les versions existantes
    if (fs.existsSync(versionsPath)) {
      const data = await fs.promises.readFile(versionsPath, "utf8");
      versions = JSON.parse(data || "[]");
    }
    
    // Ajouter la nouvelle version avec structure complète
    const newVersion = {
      version: req.body.version,
      date: req.body.date || new Date().toISOString(),
      title: req.body.title || "",
      description: req.body.description || "",
      notes: req.body.notes || "",
      features: req.body.features || [],      // ⬅️ IMPORTANT
      improvements: req.body.improvements || [], // ⬅️ IMPORTANT
      fixes: req.body.fixes || [],             // ⬅️ IMPORTANT
      previous: req.body.previous || null,
      createdAt: new Date().toISOString()
    };
    
    versions.push(newVersion);
    
    // Sauvegarder
    await fs.promises.writeFile(versionsPath, JSON.stringify(versions, null, 2));
    
    console.log("✅ Version ajoutée:", newVersion.version);
    res.status(201).json({
      success: true,
      message: "Version ajoutée avec succès",
      version: newVersion
    });
    
  } catch (error) {
    console.error("❌ Erreur création version:", error);
    res.status(500).json({ 
      success: false,
      error: "Erreur lors de la création de la version" 
    });
  }
});

// Supprimer une version
app.delete("/api/versions/:version", async (req, res) => {
  try {
    const versionsPath = path.join(__dirname, "versions.json");
    const versionToDelete = req.params.version;
    
    const data = await fs.promises.readFile(versionsPath, "utf8");
    let versions = JSON.parse(data || "[]");
    
    // Filtrer la version à supprimer
    const updatedVersions = versions.filter(v => v.version !== versionToDelete);
    
    if (updatedVersions.length === versions.length) {
      return res.status(404).json({ 
        success: false,
        error: "Version introuvable" 
      });
    }
    
    await fs.promises.writeFile(versionsPath, JSON.stringify(updatedVersions, null, 2));
    
    console.log("✅ Version supprimée:", versionToDelete);
    res.json({
      success: true,
      message: "Version supprimée avec succès"
    });
    
  } catch (error) {
    console.error("❌ Erreur suppression version:", error);
    res.status(500).json({ 
      success: false,
      error: "Erreur lors de la suppression" 
    });
  }
});

// =============================================
//   📸 SNAPSHOTS & VERSIONING
// =============================================

// Créer un snapshot de la version actuelle
app.post("/api/versions/snapshot", async (req, res) => {
  console.log("📸 Création snapshot version:", req.body.version);
  
  try {
    const { version } = req.body;
    
    if (!version) {
      return res.status(400).json({ 
        success: false, 
        error: "Version non spécifiée" 
      });
    }
    
    const snapshotDir = path.join(__dirname, "../snapshots", `v${version}`);
    
    // Créer le dossier snapshot
    await fsPromises.mkdir(snapshotDir, { recursive: true });
    
    // Liste des fichiers/dossiers à sauvegarder (exclusions)
    const excludes = [
      'node_modules',
      'snapshots',
      'Server/orders.json',
      'Server/versions.json',
      '.git',
      '.env',
      'package-lock.json'
    ];
    
    // Fonction récursive pour copier les fichiers
    async function copyDir(src, dest) {
      await fsPromises.mkdir(dest, { recursive: true });
      const entries = await fsPromises.readdir(src, { withFileTypes: true });
      
      for (let entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        // Vérifier si le chemin est dans les exclusions
        const shouldExclude = excludes.some(exclude => 
          srcPath.includes(exclude) || entry.name === exclude
        );
        
        if (shouldExclude) {
          console.log(`⏭️  Ignoré: ${entry.name}`);
          continue;
        }
        
        if (entry.isDirectory()) {
          await copyDir(srcPath, destPath);
        } else {
          await fsPromises.copyFile(srcPath, destPath);
          console.log(`✅ Copié: ${entry.name}`);
        }
      }
    }
    
    // Copier depuis la racine du projet
    const rootDir = path.join(__dirname, "../");
    await copyDir(rootDir, snapshotDir);
    
    // Créer un fichier de métadonnées
    const metadata = {
      version: version,
      createdAt: new Date().toISOString(),
      files: await getFileList(snapshotDir)
    };
    
    await fsPromises.writeFile(
      path.join(snapshotDir, 'snapshot-metadata.json'),
      JSON.stringify(metadata, null, 2)
    );
    
    console.log(`✅ Snapshot créé pour v${version}`);
    
    res.json({
      success: true,
      message: `Snapshot créé pour v${version}`,
      path: snapshotDir,
      filesCount: metadata.files.length
    });
    
  } catch (error) {
    console.error("❌ Erreur création snapshot:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Restaurer une version depuis un snapshot
app.post("/api/versions/restore", async (req, res) => {
  console.log("🔄 Restauration version:", req.body.version);
  
  try {
    const { version } = req.body;
    
    if (!version) {
      return res.status(400).json({ 
        success: false, 
        error: "Version non spécifiée" 
      });
    }
    
    const snapshotDir = path.join(__dirname, "../snapshots", `v${version}`);
    
    // Vérifier si le snapshot existe
    if (!fs.existsSync(snapshotDir)) {
      return res.status(404).json({
        success: false,
        error: `Snapshot de la version ${version} introuvable`
      });
    }
    
    // Créer une sauvegarde de sécurité avant restauration
    const backupDir = path.join(__dirname, "../snapshots", `backup-${Date.now()}`);
    const rootDir = path.join(__dirname, "../");
    
    console.log("💾 Création backup de sécurité...");
    await copyDirWithExclusions(rootDir, backupDir);
    
    // Restaurer les fichiers
    console.log("🔄 Restauration des fichiers...");
    await restoreSnapshot(snapshotDir, rootDir);
    
    // Mettre à jour current-version.json
    const currentVersionPath = path.join(__dirname, "current-version.json");
    await fsPromises.writeFile(
      currentVersionPath,
      JSON.stringify({ version, restoredAt: new Date().toISOString() }, null, 2)
    );
    
    console.log(`✅ Version ${version} restaurée avec succès`);
    
    res.json({
      success: true,
      message: `Version ${version} restaurée`,
      backup: backupDir
    });
    
  } catch (error) {
    console.error("❌ Erreur restauration:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Lister les snapshots disponibles
app.get("/api/versions/snapshots", async (req, res) => {
  try {
    const snapshotsDir = path.join(__dirname, "../snapshots");
    
    if (!fs.existsSync(snapshotsDir)) {
      return res.json({ snapshots: [] });
    }
    
    const dirs = await fsPromises.readdir(snapshotsDir, { withFileTypes: true });
    const snapshots = [];
    
    for (let dir of dirs) {
      if (dir.isDirectory() && dir.name.startsWith('v')) {
        const metadataPath = path.join(snapshotsDir, dir.name, 'snapshot-metadata.json');
        
        if (fs.existsSync(metadataPath)) {
          const metadata = JSON.parse(await fsPromises.readFile(metadataPath, 'utf8'));
          
          // Calculer la taille
          const stats = await getDirectorySize(path.join(snapshotsDir, dir.name));
          
          snapshots.push({
            version: dir.name.replace('v', ''),
            createdAt: metadata.createdAt,
            filesCount: metadata.files.length,
            size: formatBytes(stats.size)
          });
        }
      }
    }
    
    res.json({ snapshots: snapshots.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    )});
    
  } catch (error) {
    console.error("❌ Erreur liste snapshots:", error);
    res.status(500).json({ error: error.message });
  }
});

// =============================================
// FONCTIONS UTILITAIRES
// =============================================

async function copyDirWithExclusions(src, dest) {
  const excludes = [
    'node_modules', 'snapshots', 'Server/orders.json', 
    'Server/versions.json', '.git', '.env'
  ];
  
  await fsPromises.mkdir(dest, { recursive: true });
  const entries = await fsPromises.readdir(src, { withFileTypes: true });
  
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    const shouldExclude = excludes.some(exclude => 
      srcPath.includes(exclude) || entry.name === exclude
    );
    
    if (shouldExclude) continue;
    
    if (entry.isDirectory()) {
      await copyDirWithExclusions(srcPath, destPath);
    } else {
      await fsPromises.copyFile(srcPath, destPath);
    }
  }
}

async function restoreSnapshot(snapshotDir, targetDir) {
  const entries = await fsPromises.readdir(snapshotDir, { withFileTypes: true });
  
  for (let entry of entries) {
    if (entry.name === 'snapshot-metadata.json') continue;
    
    const srcPath = path.join(snapshotDir, entry.name);
    const destPath = path.join(targetDir, entry.name);
    
    if (entry.isDirectory()) {
      await fsPromises.mkdir(destPath, { recursive: true });
      await restoreSnapshot(srcPath, destPath);
    } else {
      await fsPromises.copyFile(srcPath, destPath);
    }
  }
}

async function getFileList(dir, fileList = []) {
  const files = await fsPromises.readdir(dir, { withFileTypes: true });
  
  for (const file of files) {
    const filePath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      await getFileList(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  }
  
  return fileList;
}

async function getDirectorySize(dir) {
  let size = 0;
  const files = await fsPromises.readdir(dir, { withFileTypes: true });
  
  for (const file of files) {
    const filePath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      const subDirSize = await getDirectorySize(filePath);
      size += subDirSize.size;
    } else {
      const stats = await fsPromises.stat(filePath);
      size += stats.size;
    }
  }
  
  return { size };
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// ===================================
//    🎁 CREATION NOUVELLE COMMANDE
// ===================================
app.post("/api/order", async (req, res) => {
  console.log("========================================");
  console.log("📦 NOUVELLE COMMANDE REÇUE");
  console.log("========================================");
  console.log("Body:", JSON.stringify(req.body, null, 2));
  
  try {
    const ordersPath = path.join(__dirname, "orders.json");
    let orders = [];
    
    try {
      const data = await fs.promises.readFile(ordersPath, "utf8");
      if (data.trim()) orders = JSON.parse(data);
    } catch {
      console.log("📝 Initialisation du fichier orders.json");
      orders = [];
    }

    const newOrder = {
      id: Date.now(),
      ...req.body,
      status: "CONFIRMED",
      createdAt: new Date().toISOString(),
      discordNotified: false,
    };

    orders.push(newOrder);
    await fs.promises.writeFile(ordersPath, JSON.stringify(orders, null, 2));
    console.log("✅ Commande ajoutée:", newOrder.orderNumber);

    // =============================
    //    🎉 DISCORD NOTIFICATION
    // =============================
    try {
      const discordResult = await discordBotService.sendOrderNotifications(newOrder);

      const vendorSuccess = discordResult?.vendor?.channel?.success || false;
      const clientSuccess = discordResult?.client?.success || false;

      if (vendorSuccess || clientSuccess) {
        const updatedOrders = orders.map((order) =>
          order.id === newOrder.id ? { ...order, discordNotified: true } : order
        );

        await fs.promises.writeFile(ordersPath, JSON.stringify(updatedOrders, null, 2));
        console.log(`✅ Notifications Discord envoyées pour ${newOrder.orderNumber}`);
      } else {
        console.warn(`⚠️ Échec notifications Discord pour ${newOrder.orderNumber}`);
      }
    } catch (discordError) {
      console.error("❌ Erreur notifications Discord:", discordError);
    }

  

    // =============================
    //      📥 REPONSE API
    // =============================
    console.log("========================================");
    console.log("✅ COMMANDE TRAITÉE AVEC SUCCÈS");
    console.log("========================================");
    
    res.status(201).json({
      message: "Commande ajoutée avec succès",
      order: newOrder,
      success: true,
      discordStatus: newOrder.discordNotified ? "envoyé" : "en cours",
    });

  } catch (error) {
    console.error("========================================");
    console.error("❌ ERREUR TRAITEMENT COMMANDE");
    console.error("========================================");
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
    
    res.status(500).json({ 
      error: "Erreur lors du traitement de la commande", 
      success: false,
      details: error.message 
    });
  }
});

// =============================================
//        🧪 ROUTES STATUS DISCORD
// =============================================
app.get("/api/discord/status", (req, res) => {
  const status = discordBotService.getStatus();
  res.json({
    success: true,
    status: {
      webhook: status.webhook,
      bot: status.bot,
      botReady: status.connected,
      guilds: status.guilds
    },
    message: status.bot && status.connected 
      ? "✅ Service Discord opérationnel" 
      : "⚠️ Service Discord partiellement configuré",
  });
});

// =============================================
//        🧪 ROUTE DE TEST
// =============================================
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Serveur opérationnel !",
    timestamp: new Date().toISOString(),
    cors: "enabled"
  });
});

// =============================
//          🌐 FRONTEND
// =============================
app.use(express.static(path.join(__dirname, "../")));
app.use(express.static("public"));

app.get("*", (req, res) => {
  // Ne pas envoyer index.html pour les routes API
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: "Route API non trouvée" });
  }
  
  const indexPath = path.join(__dirname, "../index.html");
  res.sendFile(indexPath, (err) => {
    if (err) {
      if (err.code === "ECONNABORTED" || err.code === "ECONNRESET") {
        return console.warn("⚠️ Requête client interrompue");
      }
      console.error("Erreur envoi index.html:", err);
      if (!res.headersSent) res.status(500).send("Erreur serveur");
    }
  });
});

// =============================================
//    🤖 BOT DISCORD - ATTENTE CONNEXION
// =============================================
const waitForBot = async () => {
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const status = discordBotService.getStatus();
    if (status.connected) {
      console.log("\n📊 ===== STATUT DU SERVICE DISCORD =====");
      console.log("Bot activé :", status.bot ? "✅" : "❌");
      console.log("Webhook activé :", status.webhook ? "✅" : "❌");
      console.log("Bot connecté :", status.connected ? "✅" : "❌");
      console.log("Serveurs :", status.guilds);
      console.log("========================================\n");
      
      try {
        console.log("🔄 Rafraîchissement des commandes slash...");
        await discordBotService.refreshCommands();
      } catch (error) {
        console.warn("⚠️ Erreur rafraîchissement commandes:", error.message);
      }
      
      return;
    }
    attempts++;
    console.log(`⏳ Tentative connexion bot... (${attempts}/${maxAttempts})`);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  const status = discordBotService.getStatus();
  console.log("\n⚠️ Bot Discord NON CONNECTÉ !");
  console.log("Bot activé :", status.bot ? "✅" : "❌");
  console.log("Webhook activé :", status.webhook ? "✅" : "❌");
};

waitForBot().catch((err) => console.error("❌ Erreur démarrage bot:", err));

// =============================================
//     🛑 GESTION SIGNAUX / ERREURS
// =============================================
const shutdownBot = async () => {
  try {
    console.log("🔻 Fermeture du bot Discord...");
    if (discordBotService.bot) {
      await discordBotService.bot.destroy();
      console.log("✅ Bot Discord déconnecté");
    }
  } catch (e) {
    console.error("⚠️ Erreur arrêt bot:", e.message);
  }
};

process.on("SIGINT", async () => {
  console.log("\n🛑 Arrêt du serveur...");
  await shutdownBot();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n🛑 Signal SIGTERM reçu");
  await shutdownBot();
  process.exit(0);
});

process.on("unhandledRejection", (err) => {
  console.error("❌ Rejet non géré:", err);
});

process.on("uncaughtException", async (err) => {
  console.error("🔥 Exception critique:", err);
  await shutdownBot();
  process.exit(1);
});

// =============================================
//          🚀 LANCEMENT SERVEUR
// =============================================
app.listen(PORT, () => {
  
  console.log("\n" + "=".repeat(50));
  console.log(`🚀 Serveur API lancé sur le port ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`📂 Racine : ${path.join(__dirname, "../")}`);
  console.log(`🤖 Discord Bot :  ${discordBotService.botEnabled ? "✅ Actif" : "❌ Inactif"}`);
  console.log("=".repeat(50) + "\n");
});