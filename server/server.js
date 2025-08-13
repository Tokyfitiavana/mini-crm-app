const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require("path");
require('dotenv').config();

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
const productRoutes = require("./routes/products");
const salesRoutes = require('./routes/sales');
const notificationsRoutes = require('./routes/notifications');
const uploadRoutes = require("./routes/upload")

const app = express();
const server = http.createServer(app);

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
app.use("/api/chat", chatRoutes);
app.use("/api/products", productRoutes);
app.use('/api/sales', salesRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/upload", uploadRoutes);


app.get('/', (req, res) => {
  res.send('🚀 Serveur CRM + WebSocket prêt.');
});

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", 
    methods: ["GET", "POST"],
    credentials: true,
  }
});

const socketHandler = require('./sockets/chat');
socketHandler(io);

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Serveur API + WebSocket actif sur http://localhost:${PORT}`);
});
