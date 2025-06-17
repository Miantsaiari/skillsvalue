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

module.exports = {
  getInterviewLink,
  scrapeQuestions
};
