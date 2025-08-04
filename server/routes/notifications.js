const express = require("express");
const router = express.Router();
const db = require("../config/db");
const auth = require("../middleware/auth");

// ✅ GET /api/notifications : liste des 10 dernières notifications
router.get("/", auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, content, is_read, created_at
       FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 10`,
      [req.user.id]
    );

    res.json(rows);
  } catch (err) {
    console.error("Erreur notifications:", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// ✅ GET /api/notifications/unread-count : nombre de notifications non lues
router.get("/unread-count", auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = false",
      [req.user.id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error("Erreur unread-count :", err);
    res.status(500).send("Erreur serveur");
  }
});

// ✅ POST /api/notifications/mark-all-read : marquer toutes les notifications comme lues
router.post("/mark-all-read", auth, async (req, res) => {
  try {
    await db.query(
      "UPDATE notifications SET is_read = true WHERE user_id = ?",
      [req.user.id]
    );
    res.json({ message: "Notifications mises à jour." });
  } catch (err) {
    console.error("Erreur mark-all-read :", err);
    res.status(500).send("Erreur serveur");
  }
});

module.exports = router;
