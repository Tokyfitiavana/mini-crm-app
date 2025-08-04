const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

router.use(auth);

// Récupération des opportunités
router.get('/', async (req, res) => {
  const { id, role } = req.user;

  try {
    let query = `
      SELECT o.id, o.title, o.value, o.status, o.pipeline_order, c.name as clientName 
      FROM opportunities o
      LEFT JOIN clients c ON o.client_id = c.id
    `;
    const params = [];

    if (role !== 'admin') {
      query += ' WHERE c.assigned_to_user_id = ?';
      params.push(id);
    }

    query += ' ORDER BY o.pipeline_order ASC';

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error("Erreur [GET /api/opportunities]:", err.message);
    res.status(500).send('Erreur serveur');
  }
});

// Création d'une opportunité
router.post('/', async (req, res) => {
  const { title, value, status, client_id } = req.body;
  const { id: userId, role } = req.user;

  if (!title || value === undefined || !status) {
    return res.status(400).json({ message: 'Le titre, la valeur et le statut sont requis.' });
  }

  try {
    if (role !== 'admin' && client_id) {
      const [clientRows] = await db.query('SELECT assigned_to_user_id FROM clients WHERE id = ?', [client_id]);
      if (clientRows.length === 0 || clientRows[0].assigned_to_user_id !== userId) {
        return res.status(403).json({ message: "Vous n'êtes pas autorisé à créer une opportunité pour ce client." });
      }
    }

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

// Déplacement d'une opportunité (Drag & Drop)
router.put('/:id/move', async (req, res) => {
  const { status, order } = req.body;
  const { id: oppId } = req.params;
  const { id: userId, role } = req.user;

  // Debug temporaire
  console.log('Payload reçu pour déplacement :', req.body);

  if (typeof status !== 'string' || typeof order !== 'number') {
    return res.status(400).json({ message: "Le nouveau statut et l'ordre sont requis et doivent être valides." });
  }

  try {
    if (role !== 'admin') {
      const [oppRows] = await db.query(`
        SELECT c.assigned_to_user_id 
        FROM opportunities o 
        LEFT JOIN clients c ON o.client_id = c.id 
        WHERE o.id = ?
      `, [oppId]);

      if (oppRows.length === 0 || oppRows[0].assigned_to_user_id !== userId) {
        return res.status(403).json({ message: "Vous n'êtes pas autorisé à modifier cette opportunité." });
      }
    }

    await db.query(
      'UPDATE opportunities SET status = ?, pipeline_order = ? WHERE id = ?',
      [status, order, oppId]
    );

    res.json({ message: 'Opportunité déplacée avec succès.' });

  } catch (err) {
    console.error(`Erreur [PUT /api/opportunities/${oppId}/move]:`, err.message);
    res.status(500).send('Erreur serveur');
  }
});

module.exports = router;
