const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/client/:clientId', async (req, res) => {
  try {
    const [transactions] = await db.query(
      'SELECT * FROM transactions WHERE client_id = ? ORDER BY date DESC',
      [req.params.clientId]
    );
    res.json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur serveur');
  }
});

module.exports = router;