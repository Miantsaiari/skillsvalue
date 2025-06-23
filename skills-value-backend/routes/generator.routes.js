const express = require('express');
const router = express.Router();
const { getInterviewQuestions } = require('../controllers/generator.controller');
const { getInterviewLink, scrapeQuestions } = require('../models/generator.model');

router.get('/api/interview', getInterviewQuestions);

// Nouvelle route pour générer et stocker les questions
router.post('/api/generate-interview', async (req, res) => {
  const { tech } = req.body;
  try {
    // 1. Scraper et stocker dans PostgreSQL (votre code existant)
    const linkData = await getInterviewLink(tech);
    const scrapedData = await scrapeQuestions(linkData.url);
    
    // 2. Insérer dans la base de données
    const interviewInsert = await db.query(
      `INSERT INTO interviews (technology, title, source_url)
       VALUES ($1, $2, $3) RETURNING interview_id`,
      [tech, scrapedData.title, scrapedData.url]
    );

    const interviewId = interviewInsert.rows[0].interview_id;

    // 3. Insérer les questions
    for (const question of scrapedData.questions) {
      await db.query(
        `INSERT INTO questions (interview_id, question_text)
         VALUES ($1, $2)`,
        [interviewId, question]
      );
    }

    res.json({ success: true, interview_id: interviewId });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Route pour récupérer les questions depuis la base
router.get('/api/interview-questions', async (req, res) => {
  const { tech } = req.query;
  try {
    const result = await db.query(
      `SELECT i.interview_id, i.title, 
              json_agg(q.question_text) as questions
       FROM interviews i
       JOIN questions q ON i.interview_id = q.interview_id
       WHERE i.technology = $1
       GROUP BY i.interview_id
       ORDER BY i.created_at DESC
       LIMIT 1`,
      [tech]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Aucune question trouvée' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/api/scrape-interview-questions', async (req, res) => {
  const { tech } = req.body;
  
  try {
    // 1. Trouver le lien (votre fonction existante)
    const linkData = await getInterviewLink(tech);
    
    // 2. Scraper les questions (votre fonction existante)
    const scrapedData = await scrapeQuestions(linkData.url);
    
    // 3. Formater la réponse
    res.json({
      questions: scrapedData.questions,
      title: scrapedData.title,
      url: scrapedData.url
    });
    
  } catch (error) {
    res.status(500).json({ 
      error: `Échec du scraping: ${error.message}` 
    });
  }
});


module.exports = router;
