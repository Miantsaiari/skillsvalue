const { body } = require('express-validator');

module.exports = {
  questionValidationRules: [
    body('type')
      .isIn(['choix_multiple', 'vrai_faux', 'texte_libre'])
      .withMessage('Type de question invalide'),
    
    body('enonce')
      .isString()
      .notEmpty()
      .withMessage('L\'énoncé est requis')
      .isLength({ max: 1000 })
      .withMessage('L\'énoncé ne doit pas dépasser 1000 caractères'),
      
    body('options')
      .if(body('type').equals('choix_multiple'))
      .isArray({ min: 2, max: 5 })
      .withMessage('2 à 5 options requises pour les QCM'),
      
    body('bonne_reponse')
      .if(body('type').not().equals('texte_libre'))
      .notEmpty()
      .withMessage('La bonne réponse est requise'),
      
    body('points')
      .optional()
      .isInt({ min: 1, max: 10 })
      .withMessage('Les points doivent être entre 1 et 10')
  ]
};