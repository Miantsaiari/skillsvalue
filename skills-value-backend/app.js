const express = require('express');
require('dotenv').config();
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io'); // socket.io ajouté ici

const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const testRoutes = require('./routes/test.routes');
const questionRoutes = require('./routes/question.routes');
const candidatRoutes = require('./routes/candidat.routes');
const reponseRoutes = require('./routes/reponse.routes');
const notifRoutes = require('./routes/notification.routes');

const app = express();
const server = http.createServer(app); // important pour socket.io
const io = new Server(server, {
  cors: {
    origin: "*", // autorise tous les domaines pour les tests
  }
});

// Stockage global de io pour l’utiliser ailleurs (optionnel)
app.set('io', io);

// CORS et JSON
app.use(cors());
app.use(express.json());

// Routes
app.use(adminRoutes);
app.use('/api/auth', authRoutes);
app.use(testRoutes);
app.use('/api/tests', questionRoutes);
app.use('/api/candidates', candidatRoutes);
app.use(reponseRoutes);
app.use('/api/notifications',notifRoutes);

// Connexion Socket.IO
io.on('connection', (socket) => {
  console.log('🟢 Nouveau client connecté');

  socket.on('disconnect', () => {
    console.log('🔴 Client déconnecté');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur http://localhost:${PORT}`);
});
