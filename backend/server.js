require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const formulaireRoutes = require("./routes/formulaireRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

// ==============================
// Configuration
// ==============================
const PORT = process.env.PORT || 5000;

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/formulaire_db";

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

// ==============================
// Middlewares
// ==============================
app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Dossier des images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ==============================
// Routes
// ==============================
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API Formulaire (Node.js + Express + MongoDB) is running.",
  });
});

app.use("/api/formulaire", formulaireRoutes);
app.use("/api/auth", authRoutes);

// ==============================
// Route inexistante
// ==============================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route introuvable.",
  });
});

// ==============================
// Connexion MongoDB
// ==============================
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ Connexion à MongoDB réussie.");

    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Erreur de connexion MongoDB :", err.message);
    process.exit(1);
  });

// ==============================
// Gestion des erreurs MongoDB
// ==============================
mongoose.connection.on("error", (err) => {
  console.error("❌ Erreur MongoDB :", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("⚠️ MongoDB déconnecté.");
});

// ==============================
// Arrêt propre du serveur
// ==============================
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("🔴 Connexion MongoDB fermée.");
  process.exit(0);
});
