const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');

function ensureFiles() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, '[]', 'utf8');
  }
  if (!fs.existsSync(MESSAGES_FILE)) {
    fs.writeFileSync(MESSAGES_FILE, '[]', 'utf8');
  }
}

function readJSON(filePath) {
  ensureFiles();
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeJSON(filePath, data) {
  ensureFiles();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function saveOrder(order) {
  const orders = readJSON(ORDERS_FILE);
  orders.push(order);
  writeJSON(ORDERS_FILE, orders);
  return order;
}

function getOrders() {
  return readJSON(ORDERS_FILE);
}

function updateOrderStatus(id, status) {
  const orders = readJSON(ORDERS_FILE);
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) return null;
  orders[idx].status = status;
  writeJSON(ORDERS_FILE, orders);
  return orders[idx];
}

function saveMessage(msg) {
  const messages = readJSON(MESSAGES_FILE);
  messages.push(msg);
  writeJSON(MESSAGES_FILE, messages);
  return msg;
}

function getMessages(sessionId) {
  const messages = readJSON(MESSAGES_FILE);
  if (sessionId) {
    return messages.filter((m) => m.sessionId === sessionId);
  }
  return messages;
}

function markMessageRead(id) {
  const messages = readJSON(MESSAGES_FILE);
  const idx = messages.findIndex((m) => m.id === id);
  if (idx === -1) return null;
  messages[idx].read = true;
  writeJSON(MESSAGES_FILE, messages);
  return messages[idx];
}

module.exports = {
  saveOrder,
  getOrders,
  updateOrderStatus,
  saveMessage,
  getMessages,
  markMessageRead,
};
