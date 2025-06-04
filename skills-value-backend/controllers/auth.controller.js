const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('../db');
const crypto = require('crypto');

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const admin = await pool.query('SELECT * FROM admin WHERE email = $1', [email]);
        if (!admin.rows[0]) {
            return res.status(401).json({ error: 'Identifiants invalides' });
        }

        const validPassword = await bcrypt.compare(password, admin.rows[0].password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Identifiants invalides' });
        }


        const accessToken = generateAccessToken(admin.rows[0].id);
        const refreshToken = crypto.randomBytes(64).toString('hex');
        const refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours

        await pool.query(
            'UPDATE admin SET refresh_token = $1, refresh_token_expires = $2 WHERE id = $3',
            [refreshToken, refreshTokenExpires, admin.rows[0].id]
        );

        res.json({
            accessToken,
            refreshToken,
            expiresIn: process.env.JWT_EXPIRES_IN || '1h'
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        // Vérification du refresh token
        const admin = await pool.query(
            'SELECT id FROM admin WHERE refresh_token = $1 AND refresh_token_expires > NOW()',
            [refreshToken]
        );

        if (!admin.rows[0]) {
            return res.status(403).json({ error: 'Refresh token invalide ou expiré' });
        }

        // Génération d'un nouveau access token
        const newAccessToken = generateAccessToken(admin.rows[0].id);
        
        res.json({
            accessToken: newAccessToken,
            expiresIn: process.env.JWT_EXPIRES_IN || '1h'
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

exports.logout = async (req, res) => {
    try {
        await pool.query(
            'UPDATE admin SET refresh_token = NULL, refresh_token_expires = NULL WHERE id = $1',
            [req.adminId]
        );
        
        res.json({ message: 'Déconnexion réussie' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

function generateAccessToken(adminId) {
    return jwt.sign(
        { id: adminId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );
}