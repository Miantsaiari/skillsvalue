const pool = require('../db');

exports.createQuestion = async (req, res) => {
  const { test_id, type, enonce, options, bonne_reponse } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO question (test_id, type, enonce, options, bonne_reponse)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [test_id, type, enonce, options, bonne_reponse]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erreur création question :', err);
    res.status(500).json({ error: 'Erreur lors de la création de la question.' });
  }
};
