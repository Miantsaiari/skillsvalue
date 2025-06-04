const express = require('express');
const router = express.Router();
const { createTest, getTests, getTestById } = require('../controllers/test.controller');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.post('/api/tests', createTest);
router.get('/api/tests', getTests);
router.get('/api/tests/:id', getTestById);

module.exports = router;
