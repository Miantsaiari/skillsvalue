const CandidateModel = require('../models/candidat.model');
const nodemailer = require('nodemailer');

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