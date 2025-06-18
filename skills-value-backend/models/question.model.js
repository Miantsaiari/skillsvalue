const pool = require('../db');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async createQuestion(testId, questionData) {
  const { type, enonce, options, bonne_reponse, points, images } = questionData;
  
  // Traitement des images inchangé
  let imagePaths = [];
  if (images && images.length > 0) {
    const uploadDir = path.join(__dirname, '../uploads/questions');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    
    for (const image of images) {
      const ext = path.extname(image.originalname);
      const filename = `${uuidv4()}${ext}`;
      const filePath = path.join(uploadDir, filename);
      await fs.promises.writeFile(filePath, image.buffer);
      imagePaths.push(`/uploads/questions/${filename}`);
    }
  }

  // Conversion sécurisée en JSON
  const imagesForDb = imagePaths.length > 0 
    ? JSON.stringify(imagePaths)
    : null;

  const result = await pool.query(
    `INSERT INTO question (
      test_id, type, enonce, options, bonne_reponse, points, images
     ) VALUES ($1, $2, $3, $4, $5, $6, $7) 
     RETURNING *`,
    [
      testId,
      type,
      enonce,
      options ? JSON.stringify(options) : null,
      bonne_reponse,
      points || 1,
      imagesForDb
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