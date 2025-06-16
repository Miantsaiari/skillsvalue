const pool = require('../db');

module.exports = {
  async saveSuspicion(testId, token, event) {
    await pool.query(
      `INSERT INTO suspicion (test_id, user_token, event) VALUES ($1, $2, $3)`,
      [testId, token, event]
    );
  }
};
