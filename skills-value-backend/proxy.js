// proxy.js (dans ton dossier backend)
const express = require('express');
const router = express.Router();
const axios = require('axios');
const { SummarizerManager } = require("node-summarizer");


// 👉 Remplace par TA vraie clé (jamais visible côté frontend !)
const OPENROUTER_API_KEY = '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';

router.post('/generate-qcm', async (req, res) => {
  const { question, answer } = req.body;

  const summarizer = new SummarizerManager(answer, 1); // 1 phrase
  const summaryResult = await summarizer.getSummaryByRank();
  const shortAnswer = summaryResult.summary || answer;

  const prompt = `Generate a multiple-choice quiz with 5 answers (1 correct + 4 false but plausible) for the following question.
Use the provided answer to formulate a short, clear, and correct answer (summary sentence).
Make sure all answers are consistent with the technical context:

Question: ${question}

Answer: ${shortAnswer}`;

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: "meta-llama/llama-4-scout:free",
        messages: [{ role: 'user', content: prompt }]
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://www.skllvl.com',
          'X-Title': 'SiteName'
        }
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error('Erreur API OpenRouter :', err?.response?.data || err.message);
    res.status(500).json({ error: 'Erreur génération QCM' });
  }
});

module.exports = router;
