const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { saveOrder } = require('../storage');

router.post('/', async (req, res) => {
  const orderData = req.body;

  console.log('=== New Order Received ===');
  console.log(JSON.stringify(orderData, null, 2));
  console.log('=========================');

  const orderId = `LG-${Date.now()}`;

  saveOrder({
    id: orderId,
    firstName: orderData.firstName,
    lastName: orderData.lastName,
    phone: orderData.phone,
    email: orderData.email || '',
    collection: orderData.collection,
    size: orderData.size,
    address: orderData.address,
    notes: orderData.notes || '',
    status: 'new',
    createdAt: new Date().toISOString(),
  });

  // Send email notification if SMTP is configured
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const mailOptions = {
        from: `"La Grande Orders" <${process.env.SMTP_USER}>`,
        to: process.env.NOTIFY_EMAIL || process.env.SMTP_USER,
        subject: `New Order from ${orderData.firstName} ${orderData.lastName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #2C1A0E 0%, #5C3D1E 100%); padding: 30px; text-align: center;">
              <h1 style="color: #C9A84C; margin: 0; font-size: 28px; letter-spacing: 4px;">LA GRANDE</h1>
              <p style="color: #E8C96A; margin: 8px 0 0; font-size: 12px; letter-spacing: 2px;">NEW ORDER NOTIFICATION</p>
            </div>
            <div style="background: #FAF5EC; padding: 30px;">
              <h2 style="color: #2C1A0E; border-bottom: 2px solid #C9A84C; padding-bottom: 10px;">Order Details</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #5C3D1E; font-weight: bold; width: 40%;">Full Name:</td>
                  <td style="padding: 8px 0; color: #2C1A0E;">${orderData.firstName} ${orderData.lastName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #5C3D1E; font-weight: bold;">Phone:</td>
                  <td style="padding: 8px 0; color: #2C1A0E;">${orderData.phone}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #5C3D1E; font-weight: bold;">Email:</td>
                  <td style="padding: 8px 0; color: #2C1A0E;">${orderData.email || 'Not provided'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #5C3D1E; font-weight: bold;">Collection:</td>
                  <td style="padding: 8px 0; color: #2C1A0E;">${orderData.collection}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #5C3D1E; font-weight: bold;">Size:</td>
                  <td style="padding: 8px 0; color: #2C1A0E;">${orderData.size}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #5C3D1E; font-weight: bold;">Address:</td>
                  <td style="padding: 8px 0; color: #2C1A0E;">${orderData.address}</td>
                </tr>
                ${orderData.notes ? `
                <tr>
                  <td style="padding: 8px 0; color: #5C3D1E; font-weight: bold;">Notes:</td>
                  <td style="padding: 8px 0; color: #2C1A0E;">${orderData.notes}</td>
                </tr>` : ''}
              </table>
            </div>
            <div style="background: #2C1A0E; padding: 15px; text-align: center;">
              <p style="color: #9A7830; margin: 0; font-size: 12px;">La Grande — Georgian Tablecloth Brand | lagrande.ge</p>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log('Order notification email sent successfully');
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError.message);
      // Don't fail the request if email fails
    }
  }

  res.json({
    success: true,
    message: 'Order received',
    orderId,
  });
});

module.exports = router;
