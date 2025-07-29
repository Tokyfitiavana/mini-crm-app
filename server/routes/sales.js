const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/", async (req, res) => {
  try {
    const [results] = await db.query(
      `SELECT sales.*, products.name AS product_name 
       FROM sales 
       JOIN products ON sales.product_id = products.id 
       ORDER BY sale_date DESC`
    );
    res.json(results);
  } catch (err) {
    console.error("Erreur dans GET /sales :", err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  const { product_id, quantity, total_price } = req.body;

  if (!product_id || !quantity || !total_price) {
    return res.status(400).json({ error: "Champs requis manquants" });
  }

  try {

    await db.query(
      `INSERT INTO sales (product_id, quantity, total_price)
       VALUES (?, ?, ?)`,
      [product_id, quantity, total_price]
    );


    await db.query(
      `UPDATE products SET quantity = quantity - ? WHERE id = ?`,
      [quantity, product_id]
    );

    res.status(201).json({ message: "Vente enregistrée avec succès" });
  } catch (err) {
    console.error("Erreur dans POST /sales :", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
