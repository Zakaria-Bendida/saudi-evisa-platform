const jwt = require("jsonwebtoken");

// Verifie le token JWT envoye dans l'en-tete "Authorization: Bearer <token>"
// Bloque la requete (401) si absent ou invalide.
function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Non authentifie." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: "Session invalide ou expiree." });
  }
}

module.exports = requireAuth;
