const jwt = require('jsonwebtoken');
const pool = require('../db');
const bcrypt = require('bcrypt');
require('dotenv').config();

const { validationResult } = require('express-validator');

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const admin = await pool.query('SELECT * FROM admin WHERE email = $1', [email]);
    if (admin.rows.length === 0) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
    }

    const validPassword = await bcrypt.compare(password, admin.rows[0].password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
    }

    const token = jwt.sign(
      { id: admin.rows[0].id }, 
      process.env.JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // 4. Renvoyer le token (sans le mot de passe)
    const { password: _, ...adminWithoutPassword } = admin.rows[0];
    res.json({ 
      status: 'success',
      token,
      data: { admin: adminWithoutPassword }
    });

  } catch (err) {
    console.error('Erreur login:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};