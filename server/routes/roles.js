const express = require("express");
const router = express.Router();
const db = require("../config/db");

// GET tous les rôles
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM roles");
    res.json(rows);
  } catch (err) {
    console.error("Erreur récupération rôles:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// POST créer un rôle
router.post("/", async (req, res) => {
  const { name, description } = req.body;
  try {
    await db.query("INSERT INTO roles (name, description) VALUES (?, ?)", [name, description]);
    res.status(201).json({ message: "Rôle créé" });
  } catch (err) {
    console.error("Erreur création rôle:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// DELETE un rôle
router.delete("/:id", async (req, res) => {
  const roleId = req.params.id;
  try {
    await db.query("DELETE FROM roles WHERE id = ?", [roleId]);
    res.json({ message: "Rôle supprimé" });
  } catch (err) {
    console.error("Erreur suppression rôle:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
