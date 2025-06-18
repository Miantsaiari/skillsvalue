const express = require('express');
const router = express.Router();
const questionController = require('../controllers/question.controller');
const { questionValidationRules } = require('../middlewares/questionValidator');
const authMiddleware = require('../middlewares/authMiddleware');
const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5 // Max 5 files
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées'), false);
    }
  }
});

router.post(
  '/:testId/questions',
  authMiddleware,
  upload.array('images', 5),
  (req, res, next) => {
    // Middleware pour gérer les erreurs multer
    if (req.fileValidationError) {
      return res.status(400).json({ error: req.fileValidationError });
    }
    next();
  },
  questionValidationRules,
  questionController.addQuestion
);

router.get(
  '/:testId/questions',
  authMiddleware,
  questionController.getQuestions
);

router.get(
  '/:testId/questions/candidate',
  questionController.getQuestionsForCandidate
);

module.exports = router;