const jwt = require('jsonwebtoken');
const { saveMessage } = require('./storage');

// clientId (persistent) → { name, phone, clientId, socketId }
const activeSessions = new Map();
// clientId → current socket.id (changes on each reconnect)
const clientToSocket = new Map();

module.exports = function setupSockets(io) {
  io.on('connection', (socket) => {

    // Customer joins — clientId is persistent (from localStorage)
    socket.on('customer:join', ({ name, phone, clientId }) => {
      socket.data = { name, phone, role: 'customer', clientId };
      clientToSocket.set(clientId, socket.id);
      activeSessions.set(clientId, { name, phone, clientId, socketId: socket.id });
      io.to('admin_room').emit('session:update', {
        sessions: Array.from(activeSessions.values()),
      });
    });

    // Customer sends a message
    socket.on('customer:message', ({ message }) => {
      if (socket.data?.role !== 'customer') return;
      const { name, phone, clientId } = socket.data;
      const msg = {
        id: `MSG-${Date.now()}`,
        sessionId: clientId,
        name,
        phone,
        message,
        read: false,
        createdAt: new Date().toISOString(),
      };
      saveMessage(msg);
      io.to('admin_room').emit('customer:message', msg);
    });

    // Admin joins
    socket.on('admin:join', ({ token }) => {
      try {
        jwt.verify(token, process.env.JWT_SECRET || 'lg-secret-key');
        socket.data = { role: 'admin' };
        socket.join('admin_room');
        socket.emit('session:update', {
          sessions: Array.from(activeSessions.values()),
        });
      } catch (_) {
        socket.emit('admin:auth_error');
      }
    });

    // Admin sends reply — sessionId here is clientId
    socket.on('admin:reply', ({ sessionId, message }) => {
      if (socket.data?.role !== 'admin') return;
      const reply = { message, createdAt: new Date().toISOString() };
      // Route to current socket for this clientId
      const targetSocketId = clientToSocket.get(sessionId);
      if (targetSocketId) {
        io.to(targetSocketId).emit('admin:reply', reply);
      }
      io.to('admin_room').emit('admin:reply:echo', { sessionId, ...reply });
    });

    // Cleanup on disconnect
    socket.on('disconnect', () => {
      if (socket.data?.role === 'customer') {
        const { clientId } = socket.data;
        clientToSocket.delete(clientId);
        activeSessions.delete(clientId);
        io.to('admin_room').emit('session:update', {
          sessions: Array.from(activeSessions.values()),
        });
        io.to('admin_room').emit('customer:left', { sessionId: clientId });
      }
    });
  });
};
