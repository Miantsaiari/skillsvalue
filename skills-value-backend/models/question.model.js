const pool = require('../db');

module.exports = {
  async createQuestion(testId, questionData) {
    const { type, enonce, options, bonne_reponse, points } = questionData;
    
    const result = await pool.query(
      `INSERT INTO question (
        test_id, 
        type, 
        enonce, 
        options, 
        bonne_reponse,
        points
       ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [testId, type, enonce, JSON.stringify(options), bonne_reponse, points || 1]
    );

    return result.rows[0];
  },

  async getQuestionsByTest(testId) {
    const result = await pool.query(
      'SELECT * FROM question WHERE test_id = $1 ORDER BY id',
      [testId]
    );
    return result.rows;
  }
};