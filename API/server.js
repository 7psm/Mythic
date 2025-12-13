// =============================================
//        SERVEUR API + BOT DISCORD
// =============================================

console.log("🚀 Démarrage du serveur et du bot...");

import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import emailService from "../MailSystem/emailService-simple.js";
import { validateConfig } from "../MailSystem/config.js";
import emailRoutes from "../MailSystem/routes.js";
import discordBotService from "../Discord/index.js";

console.log("✅ Chargement des dépendances OK");

const app = express();
const PORT = process.env.PORT || 3001;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =============================================
// 📧 VALIDATION MAIL
// =============================================
console.log("📧 Chargement du système Mail...");

const configValidation = validateConfig();

if (configValidation.isValid) {
  emailService.initializeTransporter().catch((error) => {
    console.error("❌ Erreur initialisation email:", error);
  });
} else {
  console.log("❌ Configuration email manquante – emails désactivés");
}

// =============================================
// 🔥 MIDDLEWARES
// =============================================
app.use(
  cors({
    origin: [
      "http://localhost:3001",
      "http://localhost:3000",
      "http://127.0.0.1:5501",
      "http://127.0.0.1:5500",
      "http://localhost:5501",
      "http://localhost:5500",
      "https://getmythic.netlify.app",
      "https://mythic-api.onrender.com/api/order",
      process.env.CORS_ORIGIN,
    ].filter(Boolean),
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  res.header("Access-Control-Allow-Credentials", "true");
  res.sendStatus(200);
});

// ================================
//       📧 ROUTES EMAIL
// ================================
app.use("/api/email", emailRoutes);

// ========================
//   📝 ROUTES COMMANDES
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

// Créer une nouvelle commande
app.post("/api/order", async (req, res) => {
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
      emailSent: false,
      discordNotified: false,
    };

    orders.push(newOrder);
    await fs.promises.writeFile(ordersPath, JSON.stringify(orders, null, 2));
    console.log("✅ Commande ajoutée:", newOrder.orderNumber);

// 🎉 Notification Discord (un seul envoi)
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

// 📧 Email de confirmation
const customerEmail = newOrder.email || newOrder.customerInfo?.email || null;

if (customerEmail && customerEmail !== "Non renseigné") {
  try {
    console.log(`📧 Envoi email confirmation commande: ${newOrder.orderNumber}`);

    // 🔧 CORRECTION: Extraction correcte des données
    const items = newOrder.orderItems || newOrder.cart || newOrder.items || [];
    const shippingCost = newOrder.shippingMethod?.price || newOrder.shippingCost || 0;
    
    // Calcul du sous-total
    const subtotal = items.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 1;
      return sum + (price * quantity);
    }, 0);
    
    const totalAmount = subtotal + shippingCost;

    // 🎯 CORRECTION: Récupération correcte du code promo
    const appliedDiscount = newOrder.appliedDiscount || null;
    const discountAmount = parseFloat(newOrder.discountAmount) || 0;

    console.log("📊 Données email:", {
      customerEmail,
      orderNumber: newOrder.orderNumber,
      items: items.length,
      subtotal: subtotal.toFixed(2),
      shippingCost: shippingCost.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
      appliedDiscount,
      discountAmount: discountAmount.toFixed(2)
    });

    const emailResult = await emailService.sendOrderConfirmation({
      customerEmail,
      customerName: newOrder.discordname || newOrder.discord || newOrder.name || newOrder.customerInfo?.name || "Client",
      orderNumber: newOrder.orderNumber || newOrder.id,
      totalAmount: newOrder.total || newOrder.totalAmount || totalAmount,
      items,
      shippingMethod: newOrder.shippingMethod?.name || "Livraison Standard",
      shippingCost,
      paymentMethod: newOrder.paymentMethod || "Non spécifié",
      appliedDiscount,      // ✅ Passe l'objet complet du code promo
      discountAmount        // ✅ Passe le montant de la réduction
    });

    if (emailResult.success) {
      // Mise à jour du statut d'envoi
      const updatedOrders = orders.map((order) =>
        order.id === newOrder.id ? { ...order, emailSent: true } : order
      );

      await fs.promises.writeFile(ordersPath, JSON.stringify(updatedOrders, null, 2));
      console.log(`✅ Email envoyé pour ${newOrder.orderNumber}`);

    } else {
      console.warn(`⚠️ Échec envoi email pour ${newOrder.orderNumber}:`, emailResult.error);
    }

  } catch (emailError) {
    console.error("❌ Erreur envoi email:", emailError);
    console.error("Stack trace:", emailError.stack);
  }

} else {
  console.log(`ℹ️ Pas d'email pour ${newOrder.orderNumber} (email manquant ou invalide)`);
}

// 📤 Réponse API
res.status(201).json({
  message: "Commande ajoutée avec succès",
  order: newOrder,
  success: true,
  emailStatus: customerEmail ? (newOrder.emailSent ? "envoyé" : "en cours") : "pas d'email",
  discordStatus: newOrder.discordNotified ? "envoyé" : "en cours",
});

  } catch (error) {
    console.error("❌ Erreur traitement commande:", error);
    console.error("Stack trace:", error.stack);
    res.status(500).json({ error: "Erreur lors du traitement de la commande", success: false });
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

// ===========================
//       🛠️ MAINTENANCE
// ===========================
const maintenanceDataPath = path.join(__dirname, "maintenance.json");
let maintenanceStatus = { 
  status: "online", 
  timestamp: new Date().toISOString(), 
  lastUpdatedBy: "system" 
};
let maintenanceUpdates = { 
  text: "Aucune mise à jour pour le moment.", 
  enabled: false, 
  timestamp: new Date().toISOString(), 
  lastUpdatedBy: "system" 
};

try {
  if (fs.existsSync(maintenanceDataPath)) {
    const raw = fs.readFileSync(maintenanceDataPath, "utf8");
    if (raw.trim()) {
      const parsed = JSON.parse(raw);
      if (parsed.status) maintenanceStatus = parsed.status;
      if (parsed.updates) maintenanceUpdates = parsed.updates;
      console.log("💾 Données maintenance chargées");
    }
  }
} catch (e) {
  console.warn("⚠️ Impossible de charger maintenance.json:", e.message);
}

function saveMaintenanceData() {
  try {
    const data = { status: maintenanceStatus, updates: maintenanceUpdates };
    fs.writeFileSync(maintenanceDataPath, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("❌ Erreur sauvegarde maintenance.json:", e.message);
  }
}

app.get("/api/maintenance/status", (req, res) => res.json(maintenanceStatus));

app.post("/api/maintenance/update", (req, res) => {
  const { status } = req.body;
  const validStatuses = ["online", "maintenance", "offline", "critical"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ 
      error: "Statut invalide", 
      validStatuses 
    });
  }
  maintenanceStatus = { 
    status, 
    timestamp: new Date().toISOString(), 
    lastUpdatedBy: "admin" 
  };
  saveMaintenanceData();
  res.json({ success: true, data: maintenanceStatus });
});

app.get("/api/maintenance/updates", (req, res) => {
  res.json({ success: true, updates: maintenanceUpdates });
});

app.post("/api/maintenance/updates", (req, res) => {
  const { text, enabled } = req.body || {};
  maintenanceUpdates = {
    text: typeof text === "string" && text.trim() ? text : maintenanceUpdates.text,
    enabled: typeof enabled === "boolean" ? enabled : maintenanceUpdates.enabled,
    timestamp: new Date().toISOString(),
    lastUpdatedBy: "admin",
  };
  saveMaintenanceData();
  res.json({ success: true, updates: maintenanceUpdates });
});

// =============================
//          🌐 FRONTEND
// =============================
app.use(express.static(path.join(__dirname, "../")));
app.use(express.static("public"));

app.get("*", (req, res) => {
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
      console.log("🎉 Le bot Discord est opérationnel !");
      
      // ✅ AJOUT: Rafraîchir les commandes après connexion
      try {
        console.log("🔄 Rafraîchissement des commandes slash...");
        await discordBotService.refreshCommands();
        console.log("✅ Commandes slash rafraîchies\n");
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
  console.log("\n💡 Vérifie ton .env :");
  console.log("   - DISCORD_BOT_TOKEN");
  console.log("   - DISCORD_GUILD_ID");
  console.log("   - DISCORD_ORDERS_CHANNEL_ID");
  console.log("   - DISCORD_VENDOR_ROLE\n");
};

waitForBot().catch((err) => console.error("❌ Erreur démarrage bot:", err));

// =============================================
//     🛑 GESTION SIGNAUX / ERREURS
// =============================================
const shutdownBot = async () => {
  try {
    console.log("📻 Fermeture du bot Discord...");
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
  console.log(`📂 Racine : ${path.join(__dirname, "../")}`);
  console.log(`🤖 Discord Bot : ${discordBotService.botEnabled ? "✅ Actif" : "❌ Inactif"}`);
  console.log(`📧 Email Service : ${configValidation.isValid ? "✅ Actif" : "❌ Inactif"}`);
  console.log("=".repeat(50) + "\n");
});