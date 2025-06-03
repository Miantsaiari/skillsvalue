const pool = require('../db');

exports.createTest = async (req, res) => {
  const { titre, description } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO test (titre, description) VALUES ($1, $2) RETURNING *`,
      [titre, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erreur création test :', err);
    res.status(500).json({ error: 'Erreur lors de la création du test.' });
  }
};
