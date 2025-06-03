const pool = require('../db');
const bcrypt = require('bcrypt');

exports.createAdmin = async (req, res) => {
  const { nom, email, password } = req.body;
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const result = await pool.query(
      `INSERT INTO admin (nom, email, password) VALUES ($1, $2, $3) RETURNING *`,
      [nom, email, hashedPassword]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erreur création admin :', err);
    res.status(500).json({ error: 'Erreur lors de la création de l’admin.' });
  }
};
