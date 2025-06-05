const express = require('express');
const router = express.Router();
const { createTest, getTests, getTestById, getTestPublic, submitTest,getResultsByToken } = require('../controllers/test.controller');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.post('/api/tests', createTest);
router.get('/api/tests', getTests);
router.get('/api/tests/:id', getTestById);
router.get('/api/tests/:id/public', getTestPublic);
router.post('/api/tests/:id/submit', submitTest);
router.get('/api/tests/:testId/results/:token', getResultsByToken);


module.exports = router;
