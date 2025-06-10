const pool = require('../db');
const crypto = require('crypto');

exports.createCandidate = async (email, testId) => {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const questions = await pool.query(
    'SELECT id FROM question WHERE test_id = $1',
    [testId]
  )

  const questionIds = questions.rows.map(q => q.id);
  const shuffledOrder = [...questionIds].sort(() => Math.random() - 0.5);

  const result = await pool.query(
    `INSERT INTO candidat (email, test_id, token, expires_at, question_order) 
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [email, testId, token, expiresAt, shuffledOrder]
  );
  
  return {
    candidate: result.rows[0],
    invitationLink: `http://localhost:5173/tests/${testId}/start?token=${token}`
  };
};