const pool = require('../db');

exports.createTest = async (req, res) => {
  const { titre, description, duree, questions } = req.body;
  const adminId = req.adminId;

  try {
    const result = await pool.query(
      `INSERT INTO test 
       (titre, description, duree, admin_id, questions, is_generated) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [
        titre, 
        description, 
        duree, 
        adminId,
        questions, // Stocké en tant que JSON stringifié
        !!questions // is_generated = true si questions existent
      ]
    );

    // Transforme le JSON string en tableau pour le frontend
    const testData = {
      ...result.rows[0],
      questions: result.rows[0].questions 
        ? JSON.parse(result.rows[0].questions).items 
        : []
    };

    res.status(201).json(testData);

  } catch (err) {
    console.error('Erreur création test :', err);
    res.status(500).json({ error: 'Erreur lors de la création du test.' });
  }
};

exports.getTests = async (req, res) => {
  const adminId = req.adminId;
  try {
    const result = await pool.query(
      `SELECT * FROM test WHERE admin_id = $1 ORDER BY id DESC`,
      [adminId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Erreur récupération des tests :', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des tests.' });
  }
};

exports.getTestPublic = async (req, res) => {
  const testId = req.params.id;
  try {
    const result = await pool.query(
      'SELECT * FROM test WHERE id = $1',
      [testId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Test introuvable' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Erreur récupération test public :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

exports.getTestById = async (req, res) => {
  const testId = req.params.id;
  const adminId = req.adminId;

  try {
    const result = await pool.query(
      'SELECT * FROM test WHERE id = $1 AND admin_id = $2',
      [testId, adminId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Test introuvable' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Erreur récupération test par ID :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};


exports.submitTest = async (req, res) => {
  const testId = req.params.id;
  const { token, answers, is_generated } = req.body;

  if (!token || !answers || typeof answers !== 'object') {
    return res.status(400).json({ error: 'Paramètres invalides' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Vérifier le type de test et récupérer les infos
    const testResult = await client.query(
      'SELECT titre, is_generated FROM test WHERE id = $1',
      [testId]
    );
    
    if (testResult.rows.length === 0) {
      return res.status(404).json({ error: 'Test non trouvé' });
    }

    const { titre: titreTest, is_generated: dbIsGenerated } = testResult.rows[0];
    const isGenerated = is_generated || dbIsGenerated;

    // 2. Pour TOUS les tests, enregistrer dans generated_test_results
    await client.query(
      `INSERT INTO generated_test_results 
       (test_id, token, answers, submitted_at, is_manual)
       VALUES ($1, $2, $3, NOW(), $4)`,
      [testId, token, JSON.stringify(answers), !isGenerated]
    );

    // 3. Pour les tests MANUELS uniquement, garder l'ancien système
    if (!isGenerated) {
      // Supprimer les anciennes réponses
      await client.query(
        'DELETE FROM reponse WHERE test_id = $1 AND token = $2',
        [testId, token]
      );

      // Insérer les nouvelles réponses
      for (const [questionId, reponse] of Object.entries(answers)) {
        await client.query(
          'INSERT INTO reponse (test_id, token, question_id, reponse) VALUES ($1, $2, $3, $4)',
          [testId, token, questionId, reponse]
        );
      }
    }

    // 4. Récupérer l'email du candidat
    const candidatResult = await client.query(
      'SELECT email FROM candidat WHERE token = $1',
      [token]
    );
    const email = candidatResult.rows[0]?.email || 'Inconnu';

    // 5. Créer la notification
    await client.query(
      'INSERT INTO notifications (email, test, test_id, token, is_generated) VALUES ($1, $2, $3, $4, $5)',
      [email, titreTest, testId, token, isGenerated]
    );

    // 6. Émission de l'événement temps réel
    const io = req.app.get('io');
    io.emit('new_submission', {
      email,
      testId,
      token,
      test: titreTest,
      is_generated: isGenerated,
      timestamp: new Date(),
    });

    await client.query('COMMIT');
    res.status(200).json({ 
      message: 'Réponses enregistrées avec succès',
      is_generated: isGenerated
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erreur soumission test :', err);
    res.status(500).json({ error: 'Erreur lors de la soumission du test.' });
  } finally {
    client.release();
  }
};


exports.getResultsByToken = async (req, res) => {
  const { testId, token } = req.params;

  try {
    // Récupérer les réponses du candidat avec les infos nécessaires
    const result = await pool.query(
      `SELECT 
          q.id AS question_id,
          q.enonce,
          q.type,
          q.bonne_reponse,
          q.points,
          r.reponse,
          c.email
       FROM reponse r
       JOIN candidat c ON c.token = r.token
       JOIN question q ON q.id = r.question_id
       WHERE r.test_id = $1 AND r.token = $2
       ORDER BY q.id`,
      [testId, token]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Aucune réponse trouvée pour ce candidat.' });
    }

    let totalPoints = 0;
    let pointsObtenus = 0;
    const details = [];

    for (const row of result.rows) {
      const bonneReponse = row.bonne_reponse;
      const reponseCandidat = row.reponse;
      const points = row.points || 1;

      totalPoints += points;

      let estCorrect = false;

      // Comparaison adaptée pour les types différents (texte_libre,vrai ou faux, choix multiples, etc.)
      if (typeof bonneReponse === 'string' && typeof reponseCandidat === 'string') {
        estCorrect = bonneReponse.trim() === reponseCandidat.trim();
      } else if (Array.isArray(bonneReponse) && Array.isArray(reponseCandidat)) {
        estCorrect = JSON.stringify(bonneReponse.sort()) === JSON.stringify(reponseCandidat.sort());
      }

      if (estCorrect) {
        pointsObtenus += points;
      }

      details.push({
        enonce: row.enonce,
        reponseCandidat,
        bonneReponse,
        points,
        estCorrect
      });
    }

    res.json({
      email: result.rows[0].email,
      testId,
      token,
      totalPoints,
      pointsObtenus,
      scorePourcentage: Math.round((pointsObtenus / totalPoints) * 100),
      reponses: details
    });
  } catch (err) {
    console.error('Erreur récupération des résultats :', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};


