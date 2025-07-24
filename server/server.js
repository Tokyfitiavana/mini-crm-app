const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
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
const chatRoutes = require("./routes/chat");

// ✅ Express app
const app = express();
const server = http.createServer(app);

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Routes API REST
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/interactions', interactionRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/rappels', rappelRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/dashboard-stats', dashboardRoutes);
app.use("/api/chat", chatRoutes);

// ✅ Route simple test
app.get('/', (req, res) => {
  res.send('🚀 Serveur CRM + WebSocket prêt.');
});

// ✅ Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // frontend React
    methods: ["GET", "POST"],
    credentials: true,
  }
});

// ✅ Lier les événements sockets
const socketHandler = require('./sockets/chat');
socketHandler(io);

// ✅ Lancer le serveur
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`✅ Serveur API + WebSocket actif sur http://localhost:${PORT}`);
});
