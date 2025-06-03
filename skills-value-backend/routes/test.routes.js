const express = require('express');
const router = express.Router();
const { createTest } = require('../controllers/test.controller');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);
router.post('/api/tests',authMiddleware, createTest);

module.exports = router;
