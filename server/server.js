const express = require('express');
const cors = require('cors');
require('dotenv').config();

// --- Imports des routes ---
const authRoutes = require('./routes/auth');
const clientRoutes = require('./routes/clients');
const opportunityRoutes = require('./routes/opportunities');
const interactionRoutes = require('./routes/interactions');
const transactionRoutes = require('./routes/transactions');
const rappelRoutes = require('./routes/rappels');
const teamRoutes = require('./routes/team');
const rolesRoutes = require('./routes/Roles');
const dashboardRoutes = require('./routes/dashboard'); 
const app = express();


app.use(cors());
app.use(express.json());


app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/interactions', interactionRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/rappels', rappelRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/dashboard-stats', dashboardRoutes); 


app.get('/', (req, res) => {
  res.send('Serveur CRM est en ligne !');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Serveur écoute sur le port ${PORT}`);
});