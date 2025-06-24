const express = require('express');
require('dotenv').config();
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io'); // socket.io ajouté ici
const fs = require('fs');

const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const testRoutes = require('./routes/test.routes');
const questionRoutes = require('./routes/question.routes');
const candidatRoutes = require('./routes/candidat.routes');
const reponseRoutes = require('./routes/reponse.routes');
const notifRoutes = require('./routes/notification.routes');
const generatorRoutes = require('./routes/generator.routes');
const path=require('path');
const qcmRouter = require('./routes/qcm.routes')
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
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filePath) => {
    // Désactive le cache pour le débogage
    res.set('Cache-Control', 'no-store');
    
    // Force les headers CORS si nécessaire
    res.set('Access-Control-Allow-Origin', '*');
  }
}));

app.use('/api/qcm', qcmRouter);

// Routes
app.use(adminRoutes);
app.use('/api/auth', authRoutes);
app.use(testRoutes);
app.use('/api/tests', questionRoutes);
app.use('/api/candidates', candidatRoutes);
app.use(reponseRoutes);
app.use('/api/notifications',notifRoutes);
app.use(generatorRoutes);

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
