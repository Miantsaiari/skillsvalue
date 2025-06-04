const CandidateModel = require('../models/candidat.model');
const nodemailer = require('nodemailer');
const pool = require('../db');

exports.inviteCandidate = async (req, res) => {
  const { test_id, email } = req.body;
  
  try {
    const { candidate, invitationLink } = await CandidateModel.createCandidate(email, test_id);
    
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    await transporter.sendMail({
      from: '"Plateforme" <contact@plateforme.com>',
      to: email,
      subject: 'Invitation à un test',
      html: `<p>Cliquez <a href="${invitationLink}">ici</a> pour accéder au test.</p>`
    });

    res.status(201).json({ 
      message: 'Invitation envoyée',
      candidateId: candidate.id
    });

  } catch (err) {
    console.error('Erreur envoi invitation:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.verifyToken = async (req, res) => {
  const { testId } = req.params;
  const { token } = req.body;

  try {
    const result = await pool.query(
      `SELECT * FROM candidat 
       WHERE test_id = $1 AND token = $2 AND expires_at > NOW()`,
      [testId, token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Lien invalide ou expiré' });
    }

    const test = await pool.query(`SELECT titre FROM test WHERE id = $1`, [testId]);

    res.json({ 
      testTitle: test.rows[0]?.titre || "Test inconnu", 
      candidateId: result.rows[0].id 
    });

  } catch (err) {
    console.error("Erreur vérification token:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

exports.getTestQuestions = async (req, res) => {
  const { testId } = req.params;
  const { token } = req.body;

  try {
    const result = await pool.query(
      `SELECT * FROM candidat 
       WHERE test_id = $1 AND token = $2 AND expires_at > NOW()`,
      [testId, token]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'Lien invalide ou expiré' });
    }

    const questions = await pool.query(
      `SELECT id, enonce FROM question WHERE test_id = $1`,
      [testId]
    );

    res.json({ questions: questions.rows });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
