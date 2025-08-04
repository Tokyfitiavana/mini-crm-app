const express = require("express");
const router = express.Router();
const db = require("../config/db");
const auth = require("../middleware/auth");
const checkPermission = require("../middleware/permission");

router.use(auth);

router.get("/", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM products");
  res.json(rows);
});

router.post("/", checkPermission("admin"), async (req, res) => {
  const { name, description, price, quantity } = req.body;
  await db.query(
    "INSERT INTO products (name, description, price, quantity) VALUES (?, ?, ?, ?)",
    [name, description, price, quantity]
  );
  res.status(201).json({ message: "Produit ajouté" });
});

router.put("/:id", checkPermission("admin"), async (req, res) => {
  const { name, description, price, quantity } = req.body;
  await db.query(
    "UPDATE products SET name = ?, description = ?, price = ?, quantity = ? WHERE id = ?",
    [name, description, price, quantity, req.params.id]
  );
  res.json({ message: "Produit mis à jour" });
});

router.delete("/:id", checkPermission("admin"), async (req, res) => {
  await db.query("DELETE FROM products WHERE id = ?", [req.params.id]);
  res.json({ message: "Produit supprimé" });
});

module.exports = router;
