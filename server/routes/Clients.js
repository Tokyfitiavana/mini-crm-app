const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM clients ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur serveur');
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM clients WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Client non trouvé.' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur serveur');
  }
});

router.post('/', async (req, res) => {
  const { name, email, phone, company, status, assigned_to_user_id } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: 'Le nom et l\'email sont requis.' });
  }

  try {
    const newClient = { name, email, phone, company, status, assigned_to_user_id };
    const [result] = await db.query('INSERT INTO clients SET ?', newClient);
    res.status(201).json({ id: result.insertId, ...newClient });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur serveur');
  }
});

router.put('/:id', async (req, res) => {
  const { name, email, phone, company, status, assigned_to_user_id } = req.body;

  try {
    const [result] = await db.query(
      'UPDATE clients SET name = ?, email = ?, phone = ?, company = ?, status = ?, assigned_to_user_id = ? WHERE id = ?',
      [name, email, phone, company, status, assigned_to_user_id, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Client non trouvé.' });
    }
    res.json({ message: 'Client mis à jour avec succès.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur serveur');
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM clients WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Client non trouvé.' });
    }
    res.json({ message: 'Client supprimé avec succès.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur serveur');
  }
});

module.exports = router;
