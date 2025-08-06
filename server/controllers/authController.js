const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../config/db");
const sendEmail = require("../utils/sendEmail");

const JWT_SECRET = process.env.JWT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL;

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    const user = rows[0];

    if (!user) {
      return res.status(404).json({ message: "Aucun utilisateur avec cet email." });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "15m" });
    const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;
    const message = `Bonjour ${user.name},\n\nCliquez ici pour réinitialiser votre mot de passe :\n${resetUrl}\n\nCe lien expirera dans 15 minutes.`;

    await sendEmail({
      to: user.email,
      subject: "Réinitialisation de mot de passe",
      text: message,
    });

    res.json({ message: "Lien de réinitialisation envoyé." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query("UPDATE users SET password = ? WHERE id = ?", [
      hashedPassword,
      userId,
    ]);

    res.json({ message: "Mot de passe mis à jour avec succès." });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Lien invalide ou expiré." });
  }
};
