const express = require('express');
const router = express.Router();
const questionController = require('../controllers/question.controller');
const { questionValidationRules } = require('../middlewares/questionValidator');
const authMiddleware = require('../middlewares/authMiddleware');
const Question = require('../models/question.model')
const axios = require('axios');

router.post(
  '/:testId/questions',
  authMiddleware,
  questionValidationRules,
  questionController.addQuestion
);

router.get(
  '/:testId/questions',
  authMiddleware,
  questionController.getQuestions
);

router.get(
  '/:testId/questions/candidate',
  questionController.getQuestionsForCandidate
);

async function traduireEspagnolVersFrancais(texte) {
  try {
    const response = await axios.post('https://libretranslate.com/translate', {
      q: texte,
      source: 'es',
      target: 'fr',
      format: 'text'
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    return response.data.translatedText;
  } catch (error) {
    console.error("Erreur traduction :", error.message);
    return texte; // fallback si erreur
  }
}

router.post('/import-questions/:testId', async (req, res) => {
  const { testId } = req.params;
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ message: 'URL is required' });
  }

  try {
    // 1. Récupération du contenu brut
    const response = await axios.get(url);
    const content = response.data;

    // 2. Parsing des questions
    const questions = await Question.parseQuestions(content);
    let count = 0;

    for (const q of questions) {
      // 3. Traduire l’énoncé et les options
      const enonceTraduit = await traduireEspagnolVersFrancais(q.enonce);

      const optionsTraduites = await Promise.all(
        q.options.map(opt => traduireEspagnolVersFrancais(opt))
      );

      // 4. Retrouver l’index de la bonne réponse (même index après traduction)
      const bonneReponseIndex = q.options.findIndex((opt, i) => i === q.bonne_reponse);
      const bonneReponseTrad = optionsTraduites[bonneReponseIndex];

      // 5. Sauvegarde
      await Question.createQuestion(testId, {
        type: 'choix_multiple',
        enonce: enonceTraduit,
        options: optionsTraduites,
        bonne_reponse: bonneReponseTrad,
        points: 1,
      });

      count++;
    }

    return res.json({ message: `✅ ${count} questions importées avec succès.`, count });

  } catch (error) {
    console.error('Erreur import questions:', error.message);
    return res.status(500).json({ message: 'Erreur lors de l\'import des questions' });
  }
});


module.exports = router;