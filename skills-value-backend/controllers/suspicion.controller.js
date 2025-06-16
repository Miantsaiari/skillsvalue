const express = require('express');
const router = express.Router();
const Suspicion = require('../models/suspicion.model');

router.post('/tests/:testId/suspicion', async (req, res) => {
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

module.exports = router;
