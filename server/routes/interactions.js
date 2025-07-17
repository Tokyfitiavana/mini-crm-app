const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/client/:clientId', async (req, res) => {
  try {
    const [interactions] = await db.query(
      `SELECT i.*, u.name as userName 
       FROM interactions i
       LEFT JOIN users u ON i.user_id = u.id
       WHERE i.client_id = ? 
       ORDER BY i.date DESC`,
      [req.params.clientId]
    );
    res.json(interactions);
  } catch (err) {
    console.error("Erreur [GET /api/interactions/client/:clientId]:", err.message);
    res.status(500).send('Erreur serveur');
  }
});

router.post('/', async (req, res) => {
  const { clientId, content, type = 'note' } = req.body;
  const userId = req.user.id;

  if (!clientId || !content) {
    return res.status(400).json({ message: 'L\'ID du client et le contenu sont requis.' });
  }

  try {
    const newInteraction = {
      client_id: clientId,
      user_id: userId,
      content,
      type
    };

    const [result] = await db.query('INSERT INTO interactions SET ?', newInteraction);
    
    const [rows] = await db.query(
      `SELECT i.*, u.name as userName 
       FROM interactions i
       LEFT JOIN users u ON i.user_id = u.id
       WHERE i.id = ?`,
      [result.insertId]
    );

    res.status(201).json(rows[0]);

  } catch (err) {
    console.error("Erreur [POST /api/interactions]:", err.message);
    res.status(500).send('Erreur serveur');
  }
});

module.exports = router;