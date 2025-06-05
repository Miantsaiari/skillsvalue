const pool = require('../db');

exports.createTest = async (req, res) => {
  const { titre, description, duree } = req.body;
   const adminId = req.adminId; 
  try {
    const result = await pool.query(
      `INSERT INTO test (titre, description, duree, admin_id) VALUES ($1, $2, $3, $4) RETURNING *`,
      [titre, description, duree, adminId]
    );
    res.status(201).json(result.rows[0]);
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
  const { token, answers } = req.body;

  if (!token || !answers || typeof answers !== 'object') {
    return res.status(400).json({ error: 'Paramètres invalides' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Optionnel : supprimer les anciennes réponses de ce token pour ce test
    await client.query(
      'DELETE FROM reponse WHERE test_id = $1 AND token = $2',
      [testId, token]
    );

    // Insérer les nouvelles réponses
    for (const [questionId, reponse] of Object.entries(answers)) {
      await client.query(
        'INSERT INTO reponse (test_id, token, question_id, reponse) VALUES ($1, $2, $3, $4)',
        [testId, token, questionId, JSON.stringify(reponse)]
      );
    }

    await client.query('COMMIT');
    res.status(200).json({ message: 'Réponses enregistrées avec succès' });
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
    const result = await pool.query(
      `SELECT q.enonce, q.type, r.reponse, c.email
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

    console.log(result.rows);
    
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur récupération des réponses :', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

