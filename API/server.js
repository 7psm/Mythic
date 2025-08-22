// API/server.js
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ------------------
// API Routes
// ------------------

// Récupérer toutes les commandes
app.get("/api/orders", (req, res) => {
  const ordersPath = path.join(__dirname, "orders.json");
  fs.readFile(ordersPath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Impossible de lire orders.json" });
    res.json(JSON.parse(data));
  });
});

// Ajouter une commande
app.post("/api/orders", (req, res) => {
  const ordersPath = path.join(__dirname, "orders.json");
  fs.readFile(ordersPath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Impossible de lire orders.json" });

    const orders = JSON.parse(data);
    const newOrder = req.body;

    orders.push(newOrder);

    fs.writeFile(ordersPath, JSON.stringify(orders, null, 2), (err) => {
      if (err) return res.status(500).json({ error: "Impossible d'ajouter la commande" });
      res.status(201).json({ message: "Commande ajoutée avec succès", order: newOrder });
    });
  });
});

// ------------------
// Serve Frontend
// ------------------
const __dirname = path.resolve(); // Pour pouvoir utiliser path.join avec ES modules
app.use(express.static(path.join(__dirname, "../"))); // Racine du projet contenant index.html

// Toutes les autres routes redirigent vers index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../index.html"));
});

// ------------------
// Start server
// ------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
