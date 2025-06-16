const express = require('express');
const router = express.Router();
const {createAdmin} = require('../controllers/admin.controller');
const pool = require('../db');

router.post('/api/admins', createAdmin);

router.get('/api/admins/suspicions', async (req, res) => {
  const { testId, token } = req.query;

  let query = `
    SELECT s.*, t.titre AS test_titre, u.email AS email
    FROM suspicion s
    LEFT JOIN test t ON t.id = s.test_id
    LEFT JOIN candidat u ON u.token = s.user_token
  `;

  const conditions = [];
  const values = [];

  if (testId) {
    conditions.push(`s.test_id = $${values.length + 1}`);
    values.push(testId);
  }

  if (token) {
    conditions.push(`s.user_token = $${values.length + 1}`);
    values.push(token);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY s.timestamp DESC';

  try {
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur lors de la récupération des suspicions:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});


module.exports = router;
