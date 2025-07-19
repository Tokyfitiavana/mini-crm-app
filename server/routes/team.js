const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Accès refusé. Action réservée aux administrateurs.' });
  }
};

router.use(auth);

router.get('/', adminOnly, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name FROM users');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.patch('/:id/role', adminOnly, async (req, res) => {
  const userId = req.params.id;
  const { role } = req.body;

  if (!['admin', 'user'].includes(role)) {
    return res.status(400).json({ message: 'Rôle invalide' });
  }
  try {
    const [result] = await db.query('UPDATE users SET role = ? WHERE id = ?', [role, userId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.json({ message: 'Rôle mis à jour avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;