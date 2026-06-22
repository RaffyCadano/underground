import nodemailer from 'nodemailer';
import { SITE_NAME } from '@/lib/site';

type SendResult = { delivered: true } | { delivered: false; loggedToConsole: true };

function smtpConfigured() {
  return Boolean(process.env.SMTP_HOST);
}

function createTransporter() {
  const port = Number(process.env.SMTP_PORT ?? 587);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
  });
}

function emailFrom() {
  return process.env.EMAIL_FROM ?? `${SITE_NAME} <noreply@underground.local>`;
}

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<SendResult> {
  const subject = `Reset your ${SITE_NAME} password`;
  const text = [
    `You requested a password reset for your ${SITE_NAME} account.`,
    '',
    `Reset your password: ${resetUrl}`,
    '',
    'This link expires in 1 hour. If you did not request this, you can ignore this email.',
  ].join('\n');

  const html = `
    <div style="font-family:system-ui,sans-serif;line-height:1.5;color:#e2e8f0;max-width:480px;margin:0 auto;padding:24px;background:#0f172a;border-radius:12px;border:1px solid #1e293b">
      <p style="margin:0 0 8px;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#4ade80">${SITE_NAME}</p>
      <h1 style="margin:0 0 16px;font-size:20px;color:#fff">Reset your password</h1>
      <p style="margin:0 0 20px;color:#94a3b8">You requested a password reset for your ${SITE_NAME} account. Click the button below to choose a new password.</p>
      <a href="${resetUrl}" style="display:inline-block;padding:12px 20px;border-radius:8px;background:#22c55e;color:#052e16;font-weight:600;text-decoration:none">Reset password</a>
      <p style="margin:24px 0 0;font-size:13px;color:#64748b">This link expires in 1 hour. If you did not request this, you can ignore this email.</p>
      <p style="margin:16px 0 0;font-size:12px;color:#475569;word-break:break-all">${resetUrl}</p>
    </div>
  `.trim();

  if (!smtpConfigured()) {
    console.info('[password-reset] SMTP not configured — reset link for development:');
    console.info(`  To: ${to}`);
    console.info(`  URL: ${resetUrl}`);
    return { delivered: false, loggedToConsole: true };
  }

  const transporter = createTransporter();
  await transporter.sendMail({ from: emailFrom(), to, subject, text, html });
  return { delivered: true };
}
