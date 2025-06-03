const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ status: 'fail', message: 'Format d\'autorisation invalide.' });
  }

  const token = authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ status: 'fail', message: 'Token manquant.' });
  }

  try {
    console.log("Token à vérifier:", token); // Debug
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token décodé:", decoded);
    req.adminId = decoded.id;
    next();
  } catch (err) {
    console.error("Erreur JWT:", err.message);
    res.status(401).json({ status: 'fail', message: 'Token invalide ou expiré.' });
  }
};