const express = require('express');
const router = express.Router();
const {createAdmin} = require('../controllers/admin.controller');

router.post('/api/admins', createAdmin);

module.exports = router;
