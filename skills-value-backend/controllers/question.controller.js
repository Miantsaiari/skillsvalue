const Question = require('../models/question.model');
const { validationResult } = require('express-validator');
const pool = require('../db');

exports.addQuestion = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
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

exports.getQuestionsForCandidate = async (req, res) => {
  try {
    // 1. Vérifier le token du candidat
    const candidate = await pool.query(
      'SELECT test_id, question_order FROM candidat WHERE token = $1',
      [req.query.token]
    );
    
    if (candidate.rows.length === 0) {
      return res.status(403).json({ error: 'Token invalide' });
    }
    
    // 2. Récupérer les questions dans l'ordre spécifique
    const testId = candidate.rows[0].test_id;
    const questionOrder = candidate.rows[0].question_order;
    
    const questions = await pool.query(
      `SELECT q.* 
       FROM question q
       JOIN unnest($1::int[]) WITH ORDINALITY AS o(id, ord) 
       ON q.id = o.id
       WHERE q.test_id = $2
       ORDER BY o.ord`,
      [questionOrder, testId]
    );
    
    res.json(questions.rows);
  } catch (err) {
    console.error('Erreur récupération questions:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};