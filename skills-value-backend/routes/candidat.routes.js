const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const candidateController = require('../controllers/candidat.controller');

router.post('/invite', authMiddleware, candidateController.inviteCandidate);
router.post('/:testId/verify-token', candidateController.verifyToken);  
router.post('/:testId/questions', candidateController.getTestQuestions);


module.exports = router;
