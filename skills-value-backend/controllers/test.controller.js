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

exports.getTests = async (req, res) => {
  const adminId = req.adminId;
  try {
    const result = await pool.query(
      `SELECT * FROM test WHERE admin_id = $1 ORDER BY id DESC`,
      [adminId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Erreur récupération des tests :', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des tests.' });
  }
};

exports.getTestById = async (req, res) => {
  const testId = req.params.id;
  const adminId = req.adminId;

  try {
    const result = await pool.query(
      'SELECT * FROM test WHERE id = $1 AND admin_id = $2',
      [testId, adminId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Test introuvable' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Erreur récupération test par ID :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

