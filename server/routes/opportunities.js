const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT o.id, o.title, o.value, o.status, o.pipeline_order, c.name as clientName 
      FROM opportunities o
      LEFT JOIN clients c ON o.client_id = c.id
      ORDER BY o.pipeline_order ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error("Erreur [GET /api/opportunities]:", err.message);
    res.status(500).send('Erreur serveur');
  }
});

router.post('/', async (req, res) => {
  const { title, value, status, client_id } = req.body;

  if (!title || value === undefined || !status) {
    return res.status(400).json({ message: 'Le titre, la valeur et le statut sont requis.' });
  }

  try {
    const [countResult] = await db.query('SELECT COUNT(*) as count FROM opportunities WHERE status = ?', [status]);
    const pipeline_order = countResult[0].count;

    const newOpportunity = {
      title,
      value,
      status,
      client_id: client_id || null,
      pipeline_order
    };
    
    const [result] = await db.query('INSERT INTO opportunities SET ?', newOpportunity);
    
    const [newOppRows] = await db.query(`
        SELECT o.id, o.title, o.value, o.status, o.pipeline_order, c.name as clientName 
        FROM opportunities o
        LEFT JOIN clients c ON o.client_id = c.id
        WHERE o.id = ?
    `, [result.insertId]);

    res.status(201).json(newOppRows[0]);

  } catch (err) {
    console.error("Erreur [POST /api/opportunities]:", err.message);
    res.status(500).send('Erreur serveur');
  }
});

router.put('/:id/move', async (req, res) => {
  const { status, order } = req.body;
  const { id } = req.params;

  if (!status || order === undefined) {
    return res.status(400).json({ message: "Le nouveau statut et l'ordre sont requis." });
  }

  try {
    await db.query(
      'UPDATE opportunities SET status = ?, pipeline_order = ? WHERE id = ?',
      [status, order, id]
    );
    res.json({ message: 'Opportunité déplacée avec succès.' });
  } catch (err) {
    console.error(`Erreur [PUT /api/opportunities/${id}/move]:`, err.message);
    res.status(500).send('Erreur serveur');
  }
});

module.exports = router;