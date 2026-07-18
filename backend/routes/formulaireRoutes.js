const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  createFormulaire,
  getAllFormulaires,
  getFormulaireById,
} = require("../controllers/formulaireController");

const router = express.Router();

// Configuration du stockage de l'image (equivalent du <input type="file"> "insert image")
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "uploads"));
  },
  filename: (req, file, cb) => {
    const suffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, suffix + path.extname(file.originalname));
  },
});

const requireAuth = require("../middleware/authMiddleware");

router.post("/", requireAuth, createFormulaire);
router.get("/", requireAuth, getAllFormulaires);
router.get("/:id", requireAuth, getFormulaireById);

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Seules les images sont autorisees"));
  },
});

router.post("/", upload.single("photo"), createFormulaire);
router.get("/", getAllFormulaires);
router.get("/:id", getFormulaireById);

module.exports = router;
