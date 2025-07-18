const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');


router.use(auth);


router.get('/', async (req, res) => {
  const { id, role } = req.user;

  try {
    let query = 'SELECT * FROM clients';
    const params = [];

    if (role !== 'admin') {
      query += ' WHERE assigned_to_user_id = ?';
      params.push(id);
    }
    
    query += ' ORDER BY name ASC';
    
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur serveur');
  }
});

router.get('/:id', async (req, res) => {
  const { id: userId, role } = req.user;
  const clientId = req.params.id;

  try {
    let query = 'SELECT * FROM clients WHERE id = ?';
    const params = [clientId];

    if (role !== 'admin') {
      query += ' AND assigned_to_user_id = ?';
      params.push(userId);
    }

    const [rows] = await db.query(query, params);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Client non trouvé ou accès non autorisé.' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur serveur');
  }
});

router.post('/', async (req, res) => {
  const { name, email, phone, company, status, assigned_to_user_id } = req.body;
  const { id: userId, role } = req.user;

  if (!name || !email) {
    return res.status(400).json({ message: 'Le nom et l\'email sont requis.' });
  }

  try {
    const newClient = {
      name,
      email,
      phone,
      company,
      status,
      assigned_to_user_id: (role === 'admin' && assigned_to_user_id) ? assigned_to_user_id : userId
    };
    const [result] = await db.query('INSERT INTO clients SET ?', newClient);
    res.status(201).json({ id: result.insertId, ...newClient });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur serveur');
  }
});


router.put('/:id', async (req, res) => {
  const { name, email, phone, company, status, assigned_to_user_id } = req.body;
  const { role } = req.user;
  const clientId = req.params.id;

  if (role !== 'admin') {
      return res.status(403).json({ message: 'Action non autorisée.' });
  }

  try {
    const [result] = await db.query(
      'UPDATE clients SET name = ?, email = ?, phone = ?, company = ?, status = ?, assigned_to_user_id = ? WHERE id = ?',
      [name, email, phone, company, status, assigned_to_user_id, clientId]
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
  const { role } = req.user;
  const clientId = req.params.id;

  if (role !== 'admin') {
      return res.status(403).json({ message: 'Action non autorisée.' });
  }

  try {
    const [result] = await db.query('DELETE FROM clients WHERE id = ?', [clientId]);

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