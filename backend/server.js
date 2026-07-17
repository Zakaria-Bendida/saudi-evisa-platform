require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const formulaireRoutes = require("./routes/formulaireRoutes");

const app = express();

// ---- Middlewares ----
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sert les images uploadees (equivalent de servir "back.png", "ihm2.jpg", etc.)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ---- Routes ----
app.use("/api/formulaire", formulaireRoutes);

app.get("/", (req, res) => {
  res.send("API Formulaire (Node.js + Express + MongoDB) is running.");
});

// ---- Connexion MongoDB puis demarrage du serveur ----
// Equivalent de : $conn = new mysqli(...); if ($conn->connect_error) { die(...); }
const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/formulaire_db";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connexion a MongoDB reussie.");
    app.listen(PORT, () =>
      console.log(`Serveur demarre sur http://localhost:${PORT}`),
    );
  })
  .catch((err) => {
    console.error("Connection failed:", err.message);
    process.exit(1);
  });
