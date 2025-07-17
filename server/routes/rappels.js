const express = require("express");
const router = express.Router();
const db = require("../config/db");
const auth = require("../middleware/auth");

router.use(auth);

router.get("/", async (req, res) => {
  try {
    const [results] = await db.query(
      `SELECT r.id, r.title, r.due_date, r.is_completed, c.name AS clientName
       FROM rappels r
       LEFT JOIN clients c ON r.client_id = c.id
       WHERE r.user_id = ?
       ORDER BY r.due_date ASC, r.is_completed ASC`,
      [req.user.id]
    );
    res.json(results);
  } catch (err) {
    console.error("Erreur GET /api/rappels:", err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  const { title, dueDate, clientId } = req.body;
  const userId = req.user.id;

  if (!title || !dueDate) {
    return res.status(400).json({ message: "Le titre et la date sont requis." });
  }

  try {
    const newRappel = {
      title,
      due_date: dueDate,
      client_id: clientId || null,
      user_id: userId,
    };
    const [result] = await db.query(`INSERT INTO rappels SET ?`, newRappel);

    const [rows] = await db.query(
      `SELECT r.id, r.title, r.due_date, r.is_completed, c.name as clientName
       FROM rappels r
       LEFT JOIN clients c ON r.client_id = c.id
       WHERE r.id = ?`,
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Erreur POST /api/rappels:", err);
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id/toggle", async (req, res) => {
  const rappelId = req.params.id;
  const userId = req.user.id;

  try {
    const [result] = await db.query(
      "UPDATE rappels SET is_completed = NOT is_completed WHERE id = ? AND user_id = ?",
      [rappelId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Rappel non trouvé ou non autorisé." });
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("Erreur PUT /api/rappels/:id/toggle:", err);
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  const rappelId = req.params.id;
  const userId = req.user.id;

  try {
    const [result] = await db.query(
        "DELETE FROM rappels WHERE id = ? AND user_id = ?", 
        [rappelId, userId]
    );

    if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Rappel non trouvé ou non autorisé." });
    }
    
    res.json({ message: "Rappel supprimé avec succès." });

  } catch (err) {
    console.error("Erreur DELETE /api/rappels/:id:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;