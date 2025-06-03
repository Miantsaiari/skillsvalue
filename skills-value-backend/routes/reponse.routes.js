const express = require('express');
const router = express.Router();
const {createReponse} = require('../controllers/reponse.controller');

router.post('/api/reponses', createReponse);

module.exports = router;
