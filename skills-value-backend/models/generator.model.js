const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv').config();

const API_KEY = process.env.SERPAPI_KEY;

async function getInterviewLink(tech) {
  const query = `site:geeksforgeeks.org ${tech} interview questions`;
  const params = {
    engine: 'google',
    q: query,
    api_key: API_KEY,
    num: 1
  };

  const response = await axios.get('https://serpapi.com/search', { params });
  const results = response.data.organic_results;
  if (!results || results.length === 0) throw new Error('Aucun résultat trouvé');
  const top = results[0];
  return { title: top.title, url: top.link };
}

async function scrapeQuestions(url) {
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);
  const title = $('h1').first().text().trim() || $('title').text().trim();

  const questions = new Set();

  $('h2, h3, li, p').each((_, el) => {
    const text = $(el).text().trim();
    if (text.includes('?') && text.length > 10) {
      questions.add(text);
    }
  });

  return {
    title,
    url,
    questions: Array.from(questions)
  };
}

async function scrapeQuestionsWithAnswers(url) {
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);
  const title = $('h1').first().text().trim() || $('title').text().trim();

  const qaPairs = [];
  
  $('article').each((_, article) => {
    const $article = $(article);
    const question = $article.find('h2, h3').first().text().trim();
    
    if (question && question.includes('?')) {
      const answer = $article.find('p, ul, ol').map((_, el) => $(el).text().trim()).get().join('\n\n');
      qaPairs.push({
        question,
        answer: answer || 'Réponse non trouvée'
      });
    }
  });

  // Fallback si pas de questions trouvées
  if (qaPairs.length === 0) {
    let currentQuestion = null;
    
    $('h2, h3, p, li').each((_, el) => {
      const text = $(el).text().trim();
      const $el = $(el);
      
      if (text.includes('?') && text.length > 10) {
        currentQuestion = text;
        qaPairs.push({
          question: currentQuestion,
          answer: ''
        });
      } else if (currentQuestion && text.length > 20) {
        const lastQA = qaPairs[qaPairs.length - 1];
        lastQA.answer += (lastQA.answer ? '\n\n' : '') + text;
      }
    });
  }

  return {
    title,
    url,
    questions: qaPairs.length > 0 
      ? qaPairs 
      : [{ question: 'Impossible de parser les questions', answer: '' }]
  };
}

module.exports = {
  getInterviewLink,
  scrapeQuestions,
  scrapeQuestionsWithAnswers
};
