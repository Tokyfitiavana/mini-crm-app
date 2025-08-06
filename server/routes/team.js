const express = require("express");
const router = express.Router();
const db = require("../config/db");
const auth = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Accès refusé. Action réservée aux administrateurs." });
  }
};


router.use(auth);


router.get("/", adminOnly, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, name, email, role FROM users");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});


router.patch("/:id/role", adminOnly, async (req, res) => {
  const userId = req.params.id;
  const { role } = req.body;

  if (!["admin", "user"].includes(role)) {
    return res.status(400).json({ message: "Rôle invalide" });
  }

  try {
    const [result] = await db.query("UPDATE users SET role = ? WHERE id = ?", [role, userId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    res.json({ message: "Rôle mis à jour avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});


router.post("/invite", adminOnly, async (req, res) => {
  const { name, email, role } = req.body;

  if (!["admin", "user"].includes(role)) {
    return res.status(400).json({ message: "Rôle invalide" });
  }

  try {
    const token = jwt.sign({ name, email, role }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    const confirmUrl = `${process.env.FRONTEND_URL}/confirm-admin?token=${token}`;
    const subject = "Invitation à rejoindre l'équipe";
    const text = `Bonjour ${name},\n\nVous avez été invité à devenir ${role === "admin" ? "administrateur" : "utilisateur"} sur MiniCRM.\n\nCliquez ici pour confirmer votre rôle :\n${confirmUrl}\n\nCe lien expirera dans 24 heures.`;

    await sendEmail({ to: email, subject, text });

    res.status(200).json({ message: "Invitation envoyée avec succès" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de l'envoi de l'email" });
  }
});


router.post("/promote-admin", async (req, res) => {
  const { token } = req.body;
  try {
    const { email, role } = jwt.verify(token, process.env.JWT_SECRET);

    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    await db.query("UPDATE users SET role = ? WHERE email = ?", [role, email]);
    res.status(200).json({ message: "Rôle mis à jour avec succès" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Lien invalide ou expiré" });
  }
});
router.put('/demote/:id', adminOnly, async (req, res) => {
  const userId = req.params.id;

  try {
    await db.query('UPDATE users SET role = ? WHERE id = ?', ['user', userId]);
    res.json({ message: 'Utilisateur rétrogradé avec succès.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la rétrogradation.' });
  }
});


module.exports = router;
