const pool = require('../db');
const crypto = require('crypto');

exports.createCandidate = async (email, testId) => {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // Expire dans 24h

  const result = await pool.query(
    `INSERT INTO candidat (email, test_id, token, expires_at) 
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [email, testId, token, expiresAt]
  );
  
  return {
    candidate: result.rows[0],
    invitationLink: `http://localhost:3000/tests/${testId}/start?token=${token}`
  };
};