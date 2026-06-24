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

function isDevelopmentEmailFallbackEnabled() {
  return process.env.NODE_ENV !== 'production';
}

function isResendRecipientRestricted(err: unknown) {
  const parts: string[] = [];
  if (err instanceof Error) {
    parts.push(err.message);
  }
  if (err && typeof err === 'object') {
    const record = err as { response?: string; responseCode?: number };
    if (record.response) parts.push(record.response);
    if (record.responseCode === 550) parts.push('550');
  }
  const combined = parts.join(' ');
  return (
    combined.includes('only send testing emails') ||
    combined.includes('verify a domain at resend.com')
  );
}

function logEmailLink(label: string, to: string, actionUrl: string) {
  console.info(`[${label}] Email link for development:`);
  console.info(`  To: ${to}`);
  console.info(`  URL: ${actionUrl}`);
}

async function sendTransactionalEmail({
  label,
  to,
  subject,
  text,
  html,
  actionUrl,
}: {
  label: string;
  to: string;
  subject: string;
  text: string;
  html: string;
  actionUrl: string;
}): Promise<SendResult> {
  if (!smtpConfigured()) {
    logEmailLink(label, to, actionUrl);
    return { delivered: false, loggedToConsole: true };
  }

  const transporter = createTransporter();

  try {
    await transporter.sendMail({ from: emailFrom(), to, subject, text, html });
    return { delivered: true };
  } catch (err) {
    if (isDevelopmentEmailFallbackEnabled() && isResendRecipientRestricted(err)) {
      console.warn(
        `[${label}] Resend sandbox blocked delivery to ${to}. Logging the link for local development.`,
      );
      logEmailLink(label, to, actionUrl);
      return { delivered: false, loggedToConsole: true };
    }
    throw err;
  }
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

  return sendTransactionalEmail({ label: 'password-reset', to, subject, text, html, actionUrl: resetUrl });
}

export async function sendVerificationEmail(to: string, verifyUrl: string): Promise<SendResult> {
  const subject = `Verify your ${SITE_NAME} email`;
  const text = [
    `Verify your email address for your ${SITE_NAME} account.`,
    '',
    `Confirm your email: ${verifyUrl}`,
    '',
    'This link expires in 24 hours. If you did not request this, you can ignore this email.',
  ].join('\n');

  const html = `
    <div style="font-family:system-ui,sans-serif;line-height:1.5;color:#e2e8f0;max-width:480px;margin:0 auto;padding:24px;background:#0f172a;border-radius:12px;border:1px solid #1e293b">
      <p style="margin:0 0 8px;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#4ade80">${SITE_NAME}</p>
      <h1 style="margin:0 0 16px;font-size:20px;color:#fff">Verify your email</h1>
      <p style="margin:0 0 20px;color:#94a3b8">Confirm this address to secure your ${SITE_NAME} account.</p>
      <a href="${verifyUrl}" style="display:inline-block;padding:12px 20px;border-radius:8px;background:#22c55e;color:#052e16;font-weight:600;text-decoration:none">Verify email</a>
      <p style="margin:24px 0 0;font-size:13px;color:#64748b">This link expires in 24 hours. If you did not request this, you can ignore this email.</p>
      <p style="margin:16px 0 0;font-size:12px;color:#475569;word-break:break-all">${verifyUrl}</p>
    </div>
  `.trim();

  return sendTransactionalEmail({
    label: 'email-verification',
    to,
    subject,
    text,
    html,
    actionUrl: verifyUrl,
  });
}

export function emailDeliveryErrorMessage(err: unknown) {
  if (isResendRecipientRestricted(err)) {
    return 'Email could not be sent. Verify your domain in Resend and set EMAIL_FROM to an address on that domain.';
  }
  return 'Could not send email. Try again later.';
}
