const pool = require('../db');
exports.getAllNotifications = async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM notifications ORDER BY timestamp DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur récupération notifications:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    client.release();
  }
};

exports.markAllAsRead = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('UPDATE notifications SET is_read = true');
    res.json({ message: 'Notifications marquées comme lues' });
  } catch (err) {
    console.error('Erreur marquage notifications:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    client.release();
  }
};
