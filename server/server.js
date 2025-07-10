const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const clientRoutes = require('./routes/Clients');
const teamRoutes = require('./routes/team');
const rolesRoutes = require("./routes/Roles");

const app = express();

app.use(cors());
app.use(express.json());

// ✅ Assure-toi que ceci existe :
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/team', teamRoutes);
app.use("/api/roles", rolesRoutes);

app.get('/', (req, res) => {
  res.send('Serveur CRM est en ligne !');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Serveur écoute sur le port ${PORT}`);
});
