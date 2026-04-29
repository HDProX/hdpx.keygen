// api/_db.js  –  shared utilities (DB pool, password hash, email)
import pg from "pg";
import nodemailer from "nodemailer";
import crypto from "crypto";

const { Pool } = pg;

// ── PostgreSQL connection pool (Supabase) ─────────────────────
let pool;
export function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 5,
    });
  }
  return pool;
}

// Helper: jalankan query dengan parameter
// Konversi placeholder ? (MySQL style) → $1 $2 ... (PostgreSQL style)
export async function query(sql, params = []) {
  let i = 0;
  const pgSql = sql.replace(/\?/g, () => `$${++i}`);
  const pool  = getPool();
  const res   = await pool.query(pgSql, params);
  return res.rows;
}

// ── Password hashing (PBKDF2-SHA256, 260 000 iter) ────────────
// Identik dengan PHP: hash_pbkdf2('sha256', password, salt, 260000)
export function hashPassword(password, salt) {
  return crypto
    .pbkdf2Sync(password, salt, 260_000, 32, "sha256")
    .toString("hex");
}

export function randomSalt() {
  return crypto.randomBytes(32).toString("hex");
}

export function randomOtp(len = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let out = "";
  const bytes = crypto.randomBytes(len);
  for (let i = 0; i < len; i++) out += chars[bytes[i] % chars.length];
  return out;
}

// ── Nodemailer SMTP ───────────────────────────────────────────
function getTransport() {
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   Number(process.env.SMTP_PORT || 465),
    secure: Number(process.env.SMTP_PORT || 465) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendEmail(to, toName, subject, html) {
  const transport = getTransport();
  await transport.sendMail({
    from:    `"${process.env.APP_NAME || "Keygen"}" <${process.env.SMTP_FROM}>`,
    to:      `"${toName}" <${to}>`,
    subject,
    html,
  });
}

// ── OTP email template ────────────────────────────────────────
export function otpHtml(name, code, {
  title = "Your one-time verification code!",
  subtitle = "Please verify your email,",
  bodyText = null,
} = {}) {
  const app = process.env.APP_NAME || "Keygen";
  const _defaultBody = `Finish signing up for a ${app} account using the verification code below. This code will expire within <strong>10 minutes</strong>.`;
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light dark" />
    <meta name="supported-color-schemes" content="light dark" />
    <title>${title}</title>
    <style>
      :root { --bg-outer: #f1f3f4; --bg-card: #ffffff; --border-color: #dadce0; --divider-color: #e8eaed; --text-primary: #202124; --text-secondary: #5f6368; --text-footer: #70757a; --accent: #2c7be5; --link-color: #2c7be5; }
      @media (prefers-color-scheme: dark) { :root { --bg-outer: #1a1a1a; --bg-card: #2a2a2a; --border-color: #3c3c3c; --divider-color: #3c3c3c; --text-primary: #e8eaed; --text-secondary: #9aa0a6; --text-footer: #9aa0a6; --accent: #2c7be5; --link-color: #6aadff; } }
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { background-color: var(--bg-outer); font-family: "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; -webkit-font-smoothing: antialiased; padding: 40px 16px; color: var(--text-primary); }
      .email-wrapper { max-width: 600px; margin: 0 auto; }
      .card { background-color: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; }
      .header { padding: 32px 40px 28px; text-align: center; }
      .brand { display: inline-flex; align-items: center; justify-content: center; gap: 10px; }
      .brand-name { font-size: 24px; font-weight: 700; color: var(--accent); letter-spacing: 0.5px; line-height: 1; }
      @media (prefers-color-scheme: dark) { .brand-logo path { fill: #2c7be5; } }
      .divider { height: 1px; background-color: var(--divider-color); }
      .body { padding: 10px 40px 32px; text-align: center; }
      .headline { font-size: 20px; font-weight: 500; color: var(--text-primary); margin: 28px 0 16px; line-height: 1.4; }
      .user-row { display: inline-flex; align-items: center; gap: 8px; margin-bottom: 28px; padding: 6px 14px 6px 8px; border-radius: 100px; }
      .avatar { width: 18px; height: 18px; border-radius: 50%; background-color: var(--accent); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
      .user-email { font-size: 15px; color: var(--text-primary); font-weight: 400; }
      .message { font-size: 14px; color: var(--text-primary); line-height: 1.7; text-align: left; margin-top: 24px; }
      .message p { margin-bottom: 14px; }
      .message p:last-child { margin-bottom: 0; }
      .message a { color: var(--link-color); text-decoration: none; }
      .message a:hover { text-decoration: underline; }
      .otp-box { margin: 24px 0; padding: 16px 20px; background-color: var(--bg-outer); border: 1px solid var(--border-color); border-radius: 8px; text-align: left; }
      .otp-label { font-size: 11px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px; }
      .otp-code { font-size: 28px; font-weight: 700; color: var(--accent); letter-spacing: 6px; }
      .message-center { margin-top: 24px; font-size: 13px; color: var(--text-secondary); text-align: center; line-height: 1.6; }
      .footer { padding: 20px 40px 28px; text-align: center; }
      .footer p { font-size: 11px; color: var(--text-footer); line-height: 1.7; }
      @media (max-width: 620px) { .header, .body, .footer { padding-left: 24px; padding-right: 24px; } }
    </style>
  </head>
  <body>
    <div class="email-wrapper">
      <div class="card">
        <!-- Header -->
        <div class="header">
          <div class="brand">
            <svg class="brand-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30">
              <g id="brand" data-name="brand">
                <path fill="#2c7be5" d="M19,5.4c-1.8-1.9-4.2-3-7-3s-5.2,1.1-6.9,2.9l7.1,2.6,6.8-2.5Z"/>
                <path fill="#2c7be5" d="M20.6,7.8 C20.9,7.1 20.8,6.2 20.3,5.8 L12.1,8.8 3.8,5.7 C3.3,6.1 3.2,6.9 3.4,7.6 C2.7,8.9 2.3,10.4 2.3,12 C2.3,17.3 6.6,21.6 11.9,21.6 C17.2,21.6 21.5,17.3 21.5,12 C21.5,9.608 20.6,7.8 20.6,7.8 Z M16,16.2 C14.9,16.2 13.9,15.8 13.1,15.2 L12.1,17.4 11,15.2 C10.2,15.9 9.2,16.3 8.1,16.3 C5.6,16.3 3.5,14.3 3.5,11.7 C3.5,10.417 3.9,9.6 4.5,8.8 L7.4,9.7 C6.8,10 6.3,10.6 6.3,11.4 C6.3,12.2 7.1,13.3 8.2,13.3 C9.3,13.3 10.1,12.5 10.1,11.4 C10.1,10.986 10,10.7 9.8,10.4 L11.9,11 14.2,10.3 C14,10.6 13.9,10.9 13.9,11.2 C13.9,12.2 14.7,13.1 15.8,13.1 C16.9,13.1 17.7,12.3 17.7,11.2 C17.7,10.214 17.106,9.668 16.7,9.5 L19.4,8.7 C20.1,9.5 20.4,10.5 20.4,11.6 C20.4,14.1 18.4,16.2 15.8,16.2 Z"/>
              </g>
            </svg>
            <span class="brand-name">\${app}</span>
          </div>
        </div>
        <!-- Body -->
        <div class="body">
          <p class="headline">${title}</p>
          <div class="user-row">
            <div class="avatar">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="white">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
              </svg>
            </div>
            <span class="user-email">${name}</span>
          </div>
          <div class="divider"></div>
          <div class="message">
            <p>${subtitle}</p>
            <p>${bodyText ?? _defaultBody}</p>
            <!-- OTP Box -->
            <div class="otp-box">
              <div class="otp-label">Verification Code</div>
              <div class="otp-code">${code}</div>
            </div>
            <p>If you didn't request this code, feel free to ignore this message.</p>
          </div>
          <div class="message-center">
            Privacy Policy | Terms of Service | Update your Preferences
          </div>
        </div>
        <!-- Footer -->
        <div class="footer">
          <p>
            You received this email to let you know about important changes to your \${app} account and services.<br />
            © 2026 \${app}. This email contains important information about your \${app} account and is not for marketing purposes. Marketing opt-out preferences do not apply to this email.
          </p>
        </div>
      </div>
    </div>
  </body>
</html>`;
}

// ── Success email template ────────────────────────────────────

// ── Password reset OTP email ──────────────────────────────────
export function resetOtpHtml(name, code, appName) {
  return otpHtml(name, code, {
    title: "Password reset code",
    subtitle: `Hi ${name},`,
    bodyText: `We received a request to reset your password. Enter the code below to continue. This code will expire within <strong>10 minutes</strong>.`,
  });
}

// ── Password changed confirmation email ───────────────────────
export function passwordChangedHtml(name, email, { resetUrl, appName } = {}) {
  const app = appName || process.env.APP_NAME || "Keygen";
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light dark" />
    <meta name="supported-color-schemes" content="light dark" />
    <title>Password Changed</title>
    <style>
      :root {
        --bg-outer: #f1f3f4;
        --bg-card: #ffffff;
        --border-color: #dadce0;
        --divider-color: #e8eaed;
        --text-primary: #202124;
        --text-secondary: #5f6368;
        --text-footer: #70757a;
        --accent: #2c7be5;
        --link-color: #2c7be5;
      }
      @media (prefers-color-scheme: dark) {
        :root {
          --bg-outer: #1a1a1a;
          --bg-card: #2a2a2a;
          --border-color: #3c3c3c;
          --divider-color: #3c3c3c;
          --text-primary: #e8eaed;
          --text-secondary: #9aa0a6;
          --text-footer: #9aa0a6;
          --accent: #2c7be5;
          --link-color: #6aadff;
        }
      }
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { background-color: var(--bg-outer); font-family: "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; -webkit-font-smoothing: antialiased; padding: 40px 16px; color: var(--text-primary); }
      .email-wrapper { max-width: 600px; margin: 0 auto; }
      .card { background-color: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; }
      .header { padding: 32px 40px 28px; text-align: center; }
      .brand { display: inline-flex; align-items: center; justify-content: center; gap: 10px; }
      .brand-name { font-size: 24px; font-weight: 700; color: var(--accent); letter-spacing: 0.5px; line-height: 1; }
      @media (prefers-color-scheme: dark) { .brand-logo path { fill: #2c7be5; } }
      .divider { height: 1px; background-color: var(--divider-color); }
      .body { padding: 10px 40px 32px; text-align: center; }
      .headline { font-size: 22px; font-weight: 500; color: var(--text-primary); margin: 28px 0 16px; line-height: 1.4; }
      .user-row { display: inline-flex; align-items: center; gap: 8px; margin-bottom: 28px; padding: 6px 14px 6px 8px; border-radius: 100px; }
      .avatar { width: 18px; height: 18px; border-radius: 50%; background-color: var(--accent); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
      .user-email { font-size: 15px; color: var(--text-primary); font-weight: 400; }
      .message { font-size: 14px; color: var(--text-primary); line-height: 1.7; text-align: left; margin-top: 24px; }
      .message p { margin-bottom: 14px; }
      .message p:last-child { margin-bottom: 0; }
      .message a { color: var(--link-color); text-decoration: none; }
      .message a:hover { text-decoration: underline; }
      .message-center { margin-top: 24px; font-size: 13px; color: var(--text-secondary); text-align: center; line-height: 1.6; }
      .message-center a { color: var(--link-color); text-decoration: none; display: block; margin-top: 2px; }
      .message-center a:hover { text-decoration: underline; }
      .footer { padding: 20px 40px 28px; text-align: center; }
      .footer p { font-size: 11px; color: var(--text-footer); line-height: 1.7; }
      @media (max-width: 620px) { .header, .body, .footer { padding-left: 24px; padding-right: 24px; } }
    </style>
  </head>
  <body>
    <div class="email-wrapper">
      <div class="card">
        <!-- Header -->
        <div class="header">
          <div class="brand">
            <svg class="brand-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30">
              <g id="brand" data-name="brand">
                <path fill="#2c7be5" d="M19,5.4c-1.8-1.9-4.2-3-7-3s-5.2,1.1-6.9,2.9l7.1,2.6,6.8-2.5Z"/>
                <path fill="#2c7be5" d="M20.6,7.8 C20.9,7.1 20.8,6.2 20.3,5.8 L12.1,8.8 3.8,5.7 C3.3,6.1 3.2,6.9 3.4,7.6 C2.7,8.9 2.3,10.4 2.3,12 C2.3,17.3 6.6,21.6 11.9,21.6 C17.2,21.6 21.5,17.3 21.5,12 C21.5,9.608 20.6,7.8 20.6,7.8 Z M16,16.2 C14.9,16.2 13.9,15.8 13.1,15.2 L12.1,17.4 11,15.2 C10.2,15.9 9.2,16.3 8.1,16.3 C5.6,16.3 3.5,14.3 3.5,11.7 C3.5,10.417 3.9,9.6 4.5,8.8 L7.4,9.7 C6.8,10 6.3,10.6 6.3,11.4 C6.3,12.2 7.1,13.3 8.2,13.3 C9.3,13.3 10.1,12.5 10.1,11.4 C10.1,10.986 10,10.7 9.8,10.4 L11.9,11 14.2,10.3 C14,10.6 13.9,10.9 13.9,11.2 C13.9,12.2 14.7,13.1 15.8,13.1 C16.9,13.1 17.7,12.3 17.7,11.2 C17.7,10.214 17.106,9.668 16.7,9.5 L19.4,8.7 C20.1,9.5 20.4,10.5 20.4,11.6 C20.4,14.1 18.4,16.2 15.8,16.2 Z"/>
              </g>
            </svg>
            <span class="brand-name">\${app}</span>
          </div>
        </div>
        <!-- Body -->
        <div class="body">
          <p class="headline">Your password was changed</p>
          <div class="user-row">
            <div class="avatar">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="white">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
              </svg>
            </div>
            <span class="user-email">\${email}</span>
          </div>
          <div class="divider"></div>
          <div class="message">
            <p>
              The password for your <strong>\${app}</strong> account
              <a href="#">\${email}</a> was changed.
              If you didn't change it, you should
              <a href="\${resetUrl || '#'}">recover your account</a>.
            </p>
          </div>
          <div class="message-center">
            You can also see security activity at<br />
            <a href="#">https://\${app}/account/notifications</a>
          </div>
        </div>
        <!-- Footer -->
        <div class="footer">
          <p>
            You received this email to let you know about important changes to your \${app} account and services.<br />
            © 2026 \${app}. This email contains important information about your \${app} account and is not for marketing purposes. Marketing opt-out preferences do not apply to this email.
          </p>
        </div>
      </div>
    </div>
  </body>
</html>`;
}

export function successHtml(name, email) {
  const app = process.env.APP_NAME || "Keygen";
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light dark" />
    <meta name="supported-color-schemes" content="light dark" />
    <title>Account Created Successfully</title>
    <style>
      :root { --bg-outer: #f1f3f4; --bg-card: #ffffff; --border-color: #dadce0; --divider-color: #e8eaed; --text-primary: #202124; --text-secondary: #5f6368; --text-footer: #70757a; --accent: #2c7be5; --link-color: #2c7be5; }
      @media (prefers-color-scheme: dark) { :root { --bg-outer: #1a1a1a; --bg-card: #2a2a2a; --border-color: #3c3c3c; --divider-color: #3c3c3c; --text-primary: #e8eaed; --text-secondary: #9aa0a6; --text-footer: #9aa0a6; --accent: #2c7be5; --link-color: #2c7be5; } }
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { background-color: var(--bg-outer); font-family: "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; -webkit-font-smoothing: antialiased; padding: 40px 16px; color: var(--text-primary); }
      .email-wrapper { max-width: 600px; margin: 0 auto; }
      .card { background-color: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; }
      .header { padding: 32px 40px 28px; text-align: center; }
      .brand { display: inline-flex; align-items: center; justify-content: center; gap: 10px; }
      .brand-name { font-size: 24px; font-weight: 700; color: var(--accent); letter-spacing: 0.5px; line-height: 1; }
      @media (prefers-color-scheme: dark) { .brand-logo path { fill: #2c7be5; } }
      .divider { height: 1px; background-color: var(--divider-color); }
      .body { padding: 10px 40px; text-align: center; }
      .headline { font-size: 20px; font-weight: 500; color: var(--text-primary); margin-bottom: 16px; line-height: 1.4; }
      .user-row { display: inline-flex; align-items: center; gap: 8px; margin-bottom: 24px; padding: 6px 14px 6px 8px; border-radius: 100px; }
      .avatar { width: 18px; height: 18px; border-radius: 50%; background-color: var(--accent); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
      .user-email { font-size: 16px; color: var(--text-primary); font-weight: 500; }
      .message { font-size: 14px; color: var(--text-primary); line-height: 1.7; text-align: left; margin-top: 24px; }
      .message p { margin-bottom: 14px; }
      .message p:last-child { margin-bottom: 0; }
      .message a { color: var(--link-color); text-decoration: none; }
      .message a:hover { text-decoration: underline; }
      .message-center { margin-top: 24px; font-size: 13px; color: var(--text-secondary); text-align: center; line-height: 1.6; }
      .message-center a { color: var(--link-color); text-decoration: none; display: block; margin-top: 2px; }
      .message-center a:hover { text-decoration: underline; }
      .footer { padding: 20px 40px 28px; text-align: center; }
      .footer p { font-size: 11px; color: var(--text-footer); line-height: 1.7; }
      @media (max-width: 620px) { .header, .body, .footer { padding-left: 24px; padding-right: 24px; } }
    </style>
  </head>
  <body>
    <div class="email-wrapper">
      <div class="card">
        <!-- Header -->
        <div class="header">
          <div class="brand">
            <svg class="brand-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30">
              <g id="brand" data-name="brand">
                <path fill="#2c7be5" d="M19,5.4c-1.8-1.9-4.2-3-7-3s-5.2,1.1-6.9,2.9l7.1,2.6,6.8-2.5Z"/>
                <path fill="#2c7be5" d="M20.6,7.8 C20.9,7.1 20.8,6.2 20.3,5.8 L12.1,8.8 3.8,5.7 C3.3,6.1 3.2,6.9 3.4,7.6 C2.7,8.9 2.3,10.4 2.3,12 C2.3,17.3 6.6,21.6 11.9,21.6 C17.2,21.6 21.5,17.3 21.5,12 C21.5,9.608 20.6,7.8 20.6,7.8 Z M16,16.2 C14.9,16.2 13.9,15.8 13.1,15.2 L12.1,17.4 11,15.2 C10.2,15.9 9.2,16.3 8.1,16.3 C5.6,16.3 3.5,14.3 3.5,11.7 C3.5,10.417 3.9,9.6 4.5,8.8 L7.4,9.7 C6.8,10 6.3,10.6 6.3,11.4 C6.3,12.2 7.1,13.3 8.2,13.3 C9.3,13.3 10.1,12.5 10.1,11.4 C10.1,10.986 10,10.7 9.8,10.4 L11.9,11 14.2,10.3 C14,10.6 13.9,10.9 13.9,11.2 C13.9,12.2 14.7,13.1 15.8,13.1 C16.9,13.1 17.7,12.3 17.7,11.2 C17.7,10.214 17.106,9.668 16.7,9.5 L19.4,8.7 C20.1,9.5 20.4,10.5 20.4,11.6 C20.4,14.1 18.4,16.2 15.8,16.2 Z"/>
              </g>
            </svg>
            <span class="brand-name">\${app}</span>
          </div>
        </div>
        <!-- Body -->
        <div class="body">
          <p class="headline">Account Created Successfully!</p>
          <div class="user-row">
            <div class="avatar">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="white">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
              </svg>
            </div>
            <span class="user-email">\${email}</span>
          </div>
          <div class="divider"></div>
          <div class="message">
            <p>
              Welcome to <strong>\${app}</strong>, \${name}! Your account has been
              successfully created and verified.
            </p>
            <p>
              You can now sign in to your account using your email and password.
              If you didn't create this account, you should
              <a href="#">secure your account</a>.
            </p>
          </div>
          <div class="message-center">
            You can also see your account activity at<br />
            <a href="#">https://\${app}/account/notifications</a>
          </div>
        </div>
        <!-- Footer -->
        <div class="footer">
          <p>
            You received this email to let you know about important changes to your \${app} account and services.<br />
            © 2026 \${app}. This email contains important information about your \${app} account and is not for marketing purposes. Marketing opt-out preferences do not apply to this email.
          </p>
        </div>
      </div>
    </div>
  </body>
</html>`;
}

// ── CORS headers ──────────────────────────────────────────────
export function cors(res) {
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

// ── JSON response helper ──────────────────────────────────────
export function jsonOut(res, success, message, status = 200, extra = {}) {
  res.status(status).json({ success, message, ...extra });
}