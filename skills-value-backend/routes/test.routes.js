const express = require('express');
const router = express.Router();
const { createTest, getTests, getTestById, getTestPublic, submitTest, getResultsByToken } = require('../controllers/test.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const Suspicion = require('../models/suspicion.model');
const pool = require('../db');

router.use(authMiddleware);

router.post('/api/tests', createTest);
router.get('/api/tests', getTests);
router.get('/api/tests/:id', getTestById);
router.get('/api/tests/:id/public', getTestPublic);
router.post('/api/tests/:id/submit', submitTest);
router.get('/api/tests/:testId/results/:token', getResultsByToken);
// Dans votre fichier de routes (ex: tests.routes.js)
router.delete('/api/tests/:id', async (req, res) => {
  try {
    // D'abord supprimer les enregistrements liés
    await pool.query('DELETE FROM suspicion WHERE test_id = $1', [req.params.id]);
    
    // Puis supprimer le test
    const result = await pool.query(
      'DELETE FROM test WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Test non trouvé' });
    }
    
    res.json({ success: true });
    
  } catch (err) {
    console.error('Erreur suppression test:', err);
    res.status(500).json({ error: err.message });
  }
});
router.post('/api/tests/:testId/suspicion', async (req, res) => {
  const { testId } = req.params;
  const { token, event } = req.body;

  if (!token || !event) {
    return res.status(400).json({ message: 'token et event requis' });
  }

  try {
    await Suspicion.saveSuspicion(testId, token, event);
    return res.json({ message: 'Signalement enregistré' });
  } catch (err) {
    console.error('Erreur suspicion:', err.message);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});




router.get('/api/tests/:testId/verify-submission', async (req, res) => {
  const { token } = req.query;
  
  const result = await pool.query(
    `SELECT 
       submitted_at,
       EXISTS(SELECT 1 FROM reponse WHERE token = $1) AS has_answers
     FROM candidat 
     WHERE token = $1`,
    [token]
  );

  res.json({ 
    submitted: !!result.rows[0]?.submitted_at,
    hasAnswers: result.rows[0]?.has_answers 
  });
});


module.exports = router;
