const { getInterviewLink, scrapeQuestions } = require('../models/generator.model');

async function getInterviewQuestions(req, res) {
  const tech = req.query.tech;
  if (!tech) {
    return res.status(400).json({ error: 'Le paramètre "tech" est requis.' });
  }

  try {
    const linkData = await getInterviewLink(tech);
    const data = await scrapeQuestions(linkData.url);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Erreur interne du serveur' });
  }
}

module.exports = {
  getInterviewQuestions
};
