const express = require('express');
const router = express.Router();
const { getInterviewQuestions } = require('../controllers/generator.controller');

router.get('/api/interview', getInterviewQuestions);

module.exports = router;
