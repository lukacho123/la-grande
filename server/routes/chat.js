const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { saveMessage } = require('../storage');

router.post('/', async (req, res) => {
  const { name, phone, message } = req.body;

  console.log('=== New Chat Message ===');
  console.log(`From: ${name} (${phone})`);
  console.log(`Message: ${message}`);
  console.log('=======================');

  saveMessage({
    id: `MSG-${Date.now()}`,
    name,
    phone,
    message,
    read: false,
    createdAt: new Date().toISOString(),
  });

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });

      await transporter.sendMail({
        from: `"La Grande Chat" <${process.env.SMTP_USER}>`,
        to: process.env.NOTIFY_EMAIL || process.env.SMTP_USER,
        subject: `Chat: ${name} (${phone})`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;">
            <div style="background:linear-gradient(135deg,#2C1A0E,#5C3D1E);padding:24px;text-align:center;">
              <h2 style="color:#C9A84C;margin:0;letter-spacing:3px;">LA GRANDE</h2>
              <p style="color:#E8C96A;margin:6px 0 0;font-size:11px;letter-spacing:2px;">CHAT MESSAGE</p>
            </div>
            <div style="background:#FAF5EC;padding:24px;">
              <p><strong style="color:#9A7830;">Name:</strong> ${name}</p>
              <p><strong style="color:#9A7830;">Phone:</strong> ${phone}</p>
              <p><strong style="color:#9A7830;">Message:</strong></p>
              <div style="background:white;border-left:3px solid #C9A84C;padding:12px 16px;border-radius:0 8px 8px 0;">
                ${message}
              </div>
            </div>
          </div>
        `,
      });
    } catch (err) {
      console.error('Chat email error:', err.message);
    }
  }

  res.json({ success: true });
});

module.exports = router;
