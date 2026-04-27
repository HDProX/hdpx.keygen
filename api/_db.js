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
export function otpHtml(name, code) {
  const app = process.env.APP_NAME || "Keygen";
  return `<!doctype html>
<html>
  <head><meta charset="utf-8" /></head>
  <body style="margin:0;padding:0;background:#f4f4f4;font-family:&quot;Segoe UI&quot;,Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:40px 20px">
          <table width="520" cellpadding="0" cellspacing="0"
            style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
            <!-- Header -->
            <tr>
              <td style="background:#ffffff;padding:50px 30px 0px 30px;text-align:left;">
                <h1 style="margin:0;color:#191919;font-size:30px;font-weight:700;letter-spacing:0.5px;">
                  ${app}
                </h1>
              </td>
            </tr>
            <!-- Body -->
            <tr>
              <td style="padding:40px 60px 32px">
                <h2 style="margin:0 0 8px;color:#1a1a2e;font-size:25px;font-weight:700;">
                  Your one-time verification code!
                </h2>
                <p style="margin:0 0 8px;color:#1a1a2e;font-size:18px;font-weight:500;">
                  Please verify your email,
                </p>
                <p style="margin:0 0 28px;color:#555;font-size:14px;line-height:1.6;">
                  Finish signing up for a ${app} account using the verification code below.
                  This code will expire within <strong>10 minutes</strong>.
                </p>
                <!-- OTP Box -->
                <div style="text-align:center;margin:0 0 28px">
                  <div style="display:inline-block;background:#f0f2ff;border:2px dashed #667eea;border-radius:12px;padding:10px 40px;">
                    <span style="font-size:36px;font-weight:800;letter-spacing:10px;color:#667eea;font-family:&quot;Courier New&quot;,monospace;">
                      ${code}
                    </span>
                  </div>
                </div>
                <p style="margin:0;color:#888;font-size:12px;text-align:center;">
                  If you didn't request this code, feel free to ignore this message.
                </p>
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="background:#f8f8fc;padding:20px 40px;text-align:center;border-top:1px solid #eee;">
                <p style="margin:0;color:#aaa;font-size:11px;">
                  © ${app}. This is an automated message, please do not reply.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

// ── Success email template ────────────────────────────────────
export function successHtml(name, email) {
  const app = process.env.APP_NAME || "Keygen";
  return `<!doctype html>
<html>
  <head><meta charset="utf-8" /></head>
  <body style="margin:0;padding:0;background:#f4f4f4;font-family:&quot;Segoe UI&quot;,Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:40px 20px">
          <table width="520" cellpadding="0" cellspacing="0"
            style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
            <!-- Header -->
            <tr>
              <td style="background:#ffffff;padding:36px 35px">
                <table cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="vertical-align:middle;">
                      <div style="width:35px;height:35px;background:#2ecc71;border-radius:50%;text-align:center;line-height:35px;">
                        <span style="color:#fff;font-size:22px;font-weight:700;">✓</span>
                      </div>
                    </td>
                    <td style="width:16px;"></td>
                    <td style="vertical-align:middle;">
                      <h1 style="margin:0;color:#2ecc71;font-size:22px;font-weight:700;">
                        Account Created Successfully!
                      </h1>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <!-- Body -->
            <tr>
              <td style="padding:0px 40px 32px">
                <p style="margin:0 0 16px;color:#1a1a2e;font-size:18px;font-weight:600;">
                  Welcome to ${app}, ${name}!
                </p>
                <p style="margin:0 0 24px;color:#555;font-size:14px;line-height:1.6;">
                  Your account has been successfully created and verified. Here are your account details:
                </p>
                <table width="100%" cellpadding="0" cellspacing="0"
                  style="background:#f8f8fc;border-radius:10px;overflow:hidden;">
                  <tr>
                    <td style="padding:14px 20px;border-bottom:1px solid #eee">
                      <span style="color:#888;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Name</span><br/>
                      <span style="color:#1a1a2e;font-size:14px;font-weight:600;">${name}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:14px 20px">
                      <span style="color:#888;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Email</span><br/>
                      <span style="color:#1a1a2e;font-size:14px;font-weight:600;">${email}</span>
                    </td>
                  </tr>
                </table>
                <p style="margin:24px 0 0;color:#888;font-size:12px;text-align:center;">
                  You can now sign in to your account using your email and password.
                </p>
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="background:#f8f8fc;padding:20px 40px;text-align:center;border-top:1px solid #eee;">
                <p style="margin:0;color:#aaa;font-size:11px;">
                  © ${app}. This is an automated message, please do not reply.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
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
