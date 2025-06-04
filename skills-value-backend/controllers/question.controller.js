const Question = require('../models/question.model');
const { validationResult } = require('express-validator');
const pool = require('../db');

exports.addQuestion = async (req, res) => {
  // Validation des données
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Vérifier que le test appartient à l'admin
    const testOwnership = await pool.query(
      'SELECT id FROM test WHERE id = $1 AND admin_id = $2',
      [req.params.testId, req.adminId]
    );

    if (testOwnership.rows.length === 0) {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    const question = await Question.createQuestion(
      req.params.testId,
      req.body
    );

    res.status(201).json(question);
  } catch (err) {
    console.error('Erreur ajout question:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

exports.getQuestions = async (req, res) => {
  try {
    // Vérification des permissions
    const testOwnership = await pool.query(
      `SELECT t.id 
       FROM test t
       JOIN admin a ON t.admin_id = a.id
       WHERE t.id = $1 AND a.id = $2`,
      [req.params.testId, req.adminId]
    );

    if (testOwnership.rows.length === 0) {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    const questions = await Question.getQuestionsByTest(req.params.testId);
    res.json(questions);
  } catch (err) {
    console.error('Erreur récupération questions:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};