const express = require("express");
const router = express.Router();
const db = require("../config/db");


router.get("/", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM products");
  res.json(rows);
});


router.post("/", async (req, res) => {
  const { name, description, price, quantity } = req.body;
  await db.query(
    "INSERT INTO products (name, description, price, quantity) VALUES (?, ?, ?, ?)",
    [name, description, price, quantity]
  );
  res.status(201).json({ message: "Produit ajouté" });
});


router.put("/:id", async (req, res) => {
  const { name, description, price, quantity } = req.body;
  await db.query(
    "UPDATE products SET name = ?, description = ?, price = ?, quantity = ? WHERE id = ?",
    [name, description, price, quantity, req.params.id]
  );
  res.json({ message: "Produit mis à jour" });
});


router.delete("/:id", async (req, res) => {
  await db.query("DELETE FROM products WHERE id = ?", [req.params.id]);
  res.json({ message: "Produit supprimé" });
});

router.delete("/:id", async (req, res) => {
    try {
      const productId = req.params.id;
      await db.query("DELETE FROM products WHERE id = ?", [productId]);
      res.json({ message: "Produit supprimé avec succès." });
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      res.status(500).json({ message: "Erreur serveur lors de la suppression." });
    }
  });

  router.put("/:id", async (req, res) => {
    try {
      const productId = req.params.id;
      const { name, quantity, price } = req.body;
  
      if (!name || quantity === undefined || price === undefined) {
        return res.status(400).json({ message: "Champs manquants ou invalides." });
      }
  
      await db.query(
        "UPDATE products SET name = ?, quantity = ?, price = ? WHERE id = ?",
        [name, quantity, price, productId]
      );
  
      res.json({ message: "Produit mis à jour avec succès." });
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
      res.status(500).json({ message: "Erreur serveur lors de la mise à jour." });
    }
  });
module.exports = router;
