const Formulaire = require("../models/FormulaireModel");

// Equivalent de la partie "if ($_SERVER['REQUEST_METHOD'] == 'POST')" du PHP
// POST /api/formulaire
exports.createFormulaire = async (req, res) => {
  try {
    const body = { ...req.body };

    // multer place le fichier uploade dans req.file (champ "photo")
    if (req.file) {
      body.photo = `/uploads/${req.file.filename}`;
    }

    // Les champs envoyes en multipart/form-data arrivent en chaines de
    // caracteres : on reconstruit les tableaux/objets JSON envoyes par React
    if (body.purpose_of_travel && typeof body.purpose_of_travel === "string") {
      body.purpose_of_travel = JSON.parse(body.purpose_of_travel);
    }
    if (body.family_members && typeof body.family_members === "string") {
      body.family_members = JSON.parse(body.family_members);
    }

    const nouveauFormulaire = new Formulaire(body);
    const saved = await nouveauFormulaire.save();

    // Equivalent de "echo 'User registered successfully!'"
    return res.status(201).json({
      success: true,
      message: "Formulaire enregistre avec succes !",
      data: saved,
    });
  } catch (error) {
    // Equivalent de "echo 'Error: ' . $sql . $conn->error"
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Erreur de validation",
        errors: Object.values(error.errors).map((e) => e.message),
      });
    }
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de l'enregistrement du formulaire",
    });
  }
};

// GET /api/formulaire  (liste, utile pour un futur tableau d'administration)
exports.getAllFormulaires = async (req, res) => {
  try {
    const formulaires = await Formulaire.find().sort({ createdAt: -1 });
    return res.json({ success: true, count: formulaires.length, data: formulaires });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// GET /api/formulaire/:id
exports.getFormulaireById = async (req, res) => {
  try {
    const formulaire = await Formulaire.findById(req.params.id);
    if (!formulaire) {
      return res.status(404).json({ success: false, message: "Formulaire introuvable" });
    }
    return res.json({ success: true, data: formulaire });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};
