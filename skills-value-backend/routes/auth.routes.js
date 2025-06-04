const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/login', 
  [
    body('email').isEmail().withMessage('Email invalide'),
    body('password').notEmpty().withMessage('Mot de passe requis')
  ],
  authController.login
);

router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;