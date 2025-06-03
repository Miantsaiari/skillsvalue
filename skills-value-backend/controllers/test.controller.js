const pool = require('../db');

exports.createTest = async (req, res) => {
  const { titre, description, duree } = req.body;
   const adminId = req.adminId; 
  try {
    const result = await pool.query(
      `INSERT INTO test (titre, description, duree, admin_id) VALUES ($1, $2, $3, $4) RETURNING *`,
      [titre, description, duree, adminId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erreur création test :', err);
    res.status(500).json({ error: 'Erreur lors de la création du test.' });
  }
};
