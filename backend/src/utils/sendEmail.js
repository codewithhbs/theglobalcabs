const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

const baseTemplate = (title, bodyHtml) => `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
    <div style="background:#0f172a;padding:24px;text-align:center">
      <h1 style="color:#fbbf24;margin:0;font-size:22px">${process.env.COMPANY_NAME || 'The Global Cabs'}</h1>
    </div>
    <div style="padding:28px;color:#1f2937;line-height:1.6">
      <h2 style="margin-top:0;font-size:18px">${title}</h2>
      ${bodyHtml}
    </div>
    <div style="background:#f8fafc;padding:16px;text-align:center;color:#64748b;font-size:12px">
      ${process.env.COMPANY_ADDRESS || ''} · ${process.env.COMPANY_PHONE || ''}<br/>
      © ${new Date().getFullYear()} ${process.env.COMPANY_NAME || 'The Global Cabs'}. All rights reserved.
    </div>
  </div>`;

const sendEmail = async ({ to, subject, title, html }) => {
  if (!process.env.SMTP_PASS) {
    console.log(`[email skipped - SMTP not configured] to=${to} subject=${subject}`);
    return;
  }
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html: baseTemplate(title || subject, html),
    });
  } catch (err) {
    console.error('Email send failed:', err.message);
  }
};

const bookingEmailBody = (booking) => `
  <p>Your booking <strong>#${booking.bookingId}</strong> is <strong>${booking.status.toUpperCase()}</strong>.</p>
  <table style="width:100%;border-collapse:collapse;font-size:14px">
    <tr><td style="padding:6px 0;color:#64748b">Pickup</td><td style="text-align:right">${booking.pickupLocation}</td></tr>
    <tr><td style="padding:6px 0;color:#64748b">Drop</td><td style="text-align:right">${booking.dropLocation}</td></tr>
    <tr><td style="padding:6px 0;color:#64748b">Date & Time</td><td style="text-align:right">${new Date(booking.pickupDate).toDateString()} ${booking.pickupTime}</td></tr>
    <tr><td style="padding:6px 0;color:#64748b">Trip Type</td><td style="text-align:right">${booking.tripType}</td></tr>
    <tr><td style="padding:6px 0;color:#64748b;border-top:1px solid #e5e7eb"><strong>Total Fare</strong></td><td style="text-align:right;border-top:1px solid #e5e7eb"><strong>₹${booking.fare.total}</strong></td></tr>
  </table>
  <p style="margin-top:18px">Need help? Call us at <a href="tel:${process.env.COMPANY_PHONE}">${process.env.COMPANY_PHONE}</a>.</p>`;

module.exports = { sendEmail, bookingEmailBody };
