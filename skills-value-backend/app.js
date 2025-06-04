const express = require('express');
require('dotenv').config();
const app = express();
const cors = require('cors')

const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const testRoutes = require('./routes/test.routes');
const questionRoutes = require('./routes/question.routes');
const candidatRoutes = require('./routes/candidat.routes');
const reponseRoutes = require('./routes/reponse.routes');


const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(adminRoutes);
app.use('/api/auth',authRoutes);
app.use(testRoutes);
app.use('/api/tests',questionRoutes);
app.use('/api/candidates',candidatRoutes);
app.use(reponseRoutes);


app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
