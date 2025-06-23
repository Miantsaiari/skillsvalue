const { getInterviewLink, scrapeQuestionsWithAnswers } = require('../models/generator.model');
const db= require("../db");

async function getInterviewQuestions(req, res) {
  const tech = req.query.tech;
  if (!tech) {
    return res.status(400).json({ error: 'Le paramètre "tech" est requis.' });
  }

  try {
    // 1. Récupérer le lien GeeksforGeeks
    const linkData = await getInterviewLink(tech);
    
    // 2. Scraper les questions
    const scrapedData = await scrapeQuestionsWithAnswers(linkData.url);

    // 3. Commencer une transaction
    await db.query('BEGIN');

    // 4. Insérer l'interview
    const interviewInsert = await db.query(
      `INSERT INTO interviews (technology, title, source_url)
       VALUES ($1, $2, $3) RETURNING interview_id`,
      [tech, scrapedData.title, scrapedData.url]
    );

    const interviewId = interviewInsert.rows[0].interview_id;

    // 5. Insérer les questions une par une
    for (const qa of scrapedData.questions) {
      await pool.query(
      `INSERT INTO questions (interview_id, question_text, answer)
       VALUES ($1, $2, $3)`,
      [interviewId, qa.question, qa.answer]
    );
    }

    // 6. Valider la transaction
    await db.query('COMMIT');

    // 7. Récupérer les données insérées pour la réponse
    const result = await db.query(
      `SELECT i.*, json_agg(q.question_text) as questions
       FROM interviews i
       LEFT JOIN questions q ON i.interview_id = q.interview_id
       WHERE i.interview_id = $1
       GROUP BY i.interview_id`,
      [interviewId]
    );

    res.json(result.rows[0]);

  } catch (error) {
    // En cas d'erreur, annuler la transaction
    await db.query('ROLLBACK');
    console.error('Erreur:', error);
    res.status(500).json({ error: error.message || 'Erreur interne du serveur' });
  }
}

module.exports = {
  getInterviewQuestions
};
