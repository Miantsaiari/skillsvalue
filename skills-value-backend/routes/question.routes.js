const express = require('express');
const router = express.Router();
const {createQuestion} = require('../controllers/question.controller');

router.post('/api/questions', createQuestion);

module.exports = router;
