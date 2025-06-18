const pool = require('../db');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async createQuestion(testId, questionData) {
  const { type, enonce, options, bonne_reponse, points, images } = questionData;
  
  // Traitement des images
  let imagePaths = [];
  if (images && images.length > 0) {
    imagePaths = await Promise.all(images.map(async (image) => {
      const uploadDir = path.join(__dirname, '..', 'uploads', 'questions');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const ext = path.extname(image.originalname);
      const filename = `${uuidv4()}${ext}`;
      const filepath = path.join(uploadDir, filename);
      
      await fs.promises.writeFile(filepath, image.buffer);
      return `/uploads/questions/${filename}`;
    }));
  }

  // Conversion du tableau d'images en format PostgreSQL
  const pgArray = imagePaths.length > 0 
    ? `{${imagePaths.map(path => `"${path}"`).join(',')}}` 
    : null;

  const result = await pool.query(
    `INSERT INTO question (
      test_id, 
      type, 
      enonce, 
      options, 
      bonne_reponse,
      points,
      images
     ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [
      testId, 
      type, 
      enonce, 
      JSON.stringify(options), 
      bonne_reponse, 
      points || 1,
      pgArray // Utilisation du format PostgreSQL pour les tableaux
    ]
  );

  return result.rows[0];
},

  async getQuestionsByTest(testId) {
  const result = await pool.query(
    'SELECT *, images::text[] as images_array FROM question WHERE test_id = $1 ORDER BY id',
    [testId]
  );
  return result.rows.map(row => ({
    ...row,
    images: row.images_array || [] // Utilisez le champ converti
  }));
}
};