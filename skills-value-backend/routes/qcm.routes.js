// routes/qcm.routes.js

const express = require('express');
const router = express.Router();
const { getInterviewLink, scrapeQuestionsWithAnswers } = require('../models/generator.model');
const { OpenAI } = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// 🔮 Génère un QCM avec l’IA d’OpenAI
async function generateQCM(question, answer) {
  const prompt = `
Génère un QCM à partir de la question suivante. Fournis 4 options (1 correcte, 3 incorrectes).
Formate la réponse en JSON strict.

Question : ${question}
Réponse correcte : ${answer}

Format :
{
  "question": "...",
  "options": ["...","...","...","..."],
  "correctAnswer": "..."
}
`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    const content = completion.choices[0].message.content;
    const jsonStr = content.match(/{[\s\S]*}/)?.[0];
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("❌ Erreur IA :", e.message);
    return null;
  }
}

// 🧠 Pipeline complet
async function generateQCMs(tech) {
  const { url } = await getInterviewLink(tech);
  const { questions } = await scrapeQuestionsWithAnswers(url);
  const qcms = [];

  for (const pair of questions) {
    const qcm = await generateQCM(pair.question, pair.answer);
    if (qcm) {
      qcms.push(qcm);
    }
    await new Promise((res) => setTimeout(res, 1000)); // pause 1s pour éviter les limites
  }

  return qcms;
}

// 📡 Route GET : /api/qcm?tech=React
router.get('/', async (req, res) => {
  const tech = req.query.tech;

  if (!tech) {
    return res.status(400).json({ message: 'Veuillez fournir une technologie (ex: ?tech=React)' });
  }

  try {
    const qcms = await generateQCMs(tech);
    if (!qcms.length) {
      return res.status(500).json({ message: "Aucune réponse IA reçue" });
    }
    res.json(qcms);
  } catch (err) {
    console.error("Erreur serveur :", err.message);
    res.status(500).json({ message: 'Erreur lors de la génération des QCM' });
  }
});

module.exports = router;
