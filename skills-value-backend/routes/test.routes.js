const express = require('express');
const router = express.Router();
const { createTest } = require('../controllers/test.controller');

router.post('/api/tests', createTest);

module.exports = router;
