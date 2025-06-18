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
      .custom((value, { req }) => {
        if (req.body.type === 'choix_multiple') {
          try {
            const options = JSON.parse(value);
            if (!Array.isArray(options) || options.length < 2 || options.length > 5) {
              throw new Error('2 à 5 options requises pour les QCM');
            }
          } catch (e) {
            throw new Error('Options invalides');
          }
        }
        return true;
      }),
      
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