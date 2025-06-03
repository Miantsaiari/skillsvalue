const pool = require('../db');

exports.createCandidat = async (req, res) => {
  const { name, email, test_id, token } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO candidat (name, email, test_id, token)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, email, test_id, token]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erreur création candidat :', err);
    res.status(500).json({ error: 'Erreur lors de la création du candidat.' });
  }
};
