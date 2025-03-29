// src/lib/email.js
import nodemailer from 'nodemailer';

export async function sendEmail({ to, subject, html }) {
  try {
    // Create a transporter for Microsoft 365/Outlook
    const transporter = nodemailer.createTransport({
      host: 'smtp.office365.com',
      port: 587,
      secure: false, // true for 465, false for 587
      auth: {
        user: process.env.EMAIL_SERVER_USER,    // your-email@happylife.services
        pass: process.env.EMAIL_SERVER_PASSWORD, // your Microsoft 365 email password
      },
      tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: true
      }
    });

    // Send email
    const info = await transporter.sendMail({
      from: `"happylife.services" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
    });

    console.log(`Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send email');
  }
}