const express = require('express');
const router = express.Router();
const {createCandidat} = require('../controllers/candidat.controller');

router.post('/api/candidats', createCandidat);

module.exports = router;
