const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const setupSockets = require('./sockets');
require('dotenv').config();

const app = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: { origin: '*' },
});

setupSockets(io);

app.use(cors());
app.use(express.json());

app.use('/api/orders', require('./routes/orders'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/admin', require('./routes/admin'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = { io };
