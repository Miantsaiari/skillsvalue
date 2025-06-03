const pool = require('../db');

exports.createReponse = async (req, res) => {
  const { candidat_id, question_id, reponse } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO reponse (candidat_id, question_id, reponse)
       VALUES ($1, $2, $3) RETURNING *`,
      [candidat_id, question_id, reponse]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erreur création réponse :', err);
    res.status(500).json({ error: 'Erreur lors de la création de la réponse.' });
  }
};
