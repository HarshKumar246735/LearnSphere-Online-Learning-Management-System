import nodemailer from 'nodemailer';
import env from '../config/env.js';

let transporter;
export const sentMail = []; // populated only when NODE_ENV === 'test', so tests can read the reset link

export const mailConfigured = () => Boolean(env.SMTP_HOST);

export async function sendMail({ to, subject, text }) {
  if (env.NODE_ENV === 'test') { sentMail.push({ to, subject, text }); return; }
  if (!mailConfigured()) throw new Error('SMTP is not configured');
  transporter ||= nodemailer.createTransport({
    host: env.SMTP_HOST, port: env.SMTP_PORT, secure: env.SMTP_PORT === 465,
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
  });
  await transporter.sendMail({ from: env.MAIL_FROM, to, subject, text });
}
