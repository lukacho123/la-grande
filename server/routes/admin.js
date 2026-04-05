const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const {
  getOrders,
  updateOrderStatus,
  getMessages,
  markMessageRead,
} = require('../storage');

const JWT_SECRET = process.env.JWT_SECRET || 'lg-secret-key';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'lagrande2025';

// POST /api/admin/login
router.post('/login', (req, res) => {
  const { password } = req.body;
  if (!password || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid password' });
  }
  const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token });
});

// Auth middleware
function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing token' });
  }
  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// GET /api/admin/orders
router.get('/orders', requireAuth, (req, res) => {
  const orders = getOrders();
  orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(orders);
});

// PATCH /api/admin/orders/:id
router.patch('/orders/:id', requireAuth, (req, res) => {
  const { status } = req.body;
  const updated = updateOrderStatus(req.params.id, status);
  if (!updated) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json(updated);
});

// GET /api/admin/messages
router.get('/messages', requireAuth, (req, res) => {
  const messages = getMessages();
  messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(messages);
});

// PATCH /api/admin/messages/:id/read
router.patch('/messages/:id/read', requireAuth, (req, res) => {
  const updated = markMessageRead(req.params.id);
  if (!updated) {
    return res.status(404).json({ error: 'Message not found' });
  }
  res.json(updated);
});

// GET /api/admin/stats
router.get('/stats', requireAuth, (req, res) => {
  const orders = getOrders();
  const messages = getMessages();
  res.json({
    totalOrders: orders.length,
    newOrders: orders.filter((o) => o.status === 'new').length,
    totalMessages: messages.length,
    unreadMessages: messages.filter((m) => !m.read).length,
  });
});

module.exports = router;
