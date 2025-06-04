const express = require('express');
const router = express.Router();
const questionController = require('../controllers/question.controller');
const { questionValidationRules } = require('../middlewares/questionValidator');
const authMiddleware = require('../middlewares/authMiddleware');

router.post(
  '/:testId/questions',
  authMiddleware,
  questionValidationRules,
  questionController.addQuestion
);

router.get(
  '/:testId/questions',
  authMiddleware,
  questionController.getQuestions
);

module.exports = router;