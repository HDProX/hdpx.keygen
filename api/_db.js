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
  <head>
    <meta charset="utf-8" />
  </head>
  <body
    style="
      margin: 0;
      padding: 0;
      background: #f4f4f4;
      font-family: &quot;Segoe UI&quot;, Arial, sans-serif;
    "
  >
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding: 40px 20px">
          <table
            width="600"
            cellpadding="0"
            cellspacing="0"
            style="
              background: #ffffff;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
            "
          >
            <!-- Header -->
            <tr>
              <td
                style="
                  background: #ffffff;
                  padding: 30px 30px 10px 30px;
                  text-align: left;
                "
              >
                <h1
                  style="
                    color: #2c7be5;
                    font-size: 30px;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                  "
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="34"
                    height="34"
                  >
                    <g id="brand" data-name="brand">
                      <path
                        fill="#2c7be5"
                        d="M19,5.4c-1.8-1.9-4.2-3-7-3s-5.2,1.1-6.9,2.9l7.1,2.6,6.8-2.5Z"
                      />
                      <path
                        fill="#2c7be5"
                        d="M20.6,7.8 C20.9,7.1 20.8,6.2 20.3,5.8 L12.1,8.8 3.8,5.7 C3.3,6.1 3.2,6.9 3.4,7.6 C2.7,8.9 2.3,10.4 2.3,12 C2.3,17.3 6.6,21.6 11.9,21.6 C17.2,21.6 21.5,17.3 21.5,12 C21.5,9.608 20.6,7.8 20.6,7.8 Z M16,16.2 C14.9,16.2 13.9,15.8 13.1,15.2 L12.1,17.4 11,15.2 C10.2,15.9 9.2,16.3 8.1,16.3 C5.6,16.3 3.5,14.3 3.5,11.7 C3.5,10.417 3.9,9.6 4.5,8.8 L7.4,9.7 C6.8,10 6.3,10.6 6.3,11.4 C6.3,12.2 7.1,13.3 8.2,13.3 C9.3,13.3 10.1,12.5 10.1,11.4 C10.1,10.986 10,10.7 9.8,10.4 L11.9,11 14.2,10.3 C14,10.6 13.9,10.9 13.9,11.2 C13.9,12.2 14.7,13.1 15.8,13.1 C16.9,13.1 17.7,12.3 17.7,11.2 C17.7,10.214 17.106,9.668 16.7,9.5 L19.4,8.7 C20.1,9.5 20.4,10.5 20.4,11.6 C20.4,14.1 18.4,16.2 15.8,16.2 Z"
                      />
                    </g>
                  </svg>

                  ${app}
                </h1>
              </td>
            </tr>
            <!-- Body -->
            <tr>
              <td style="padding: 0 60px 20px">
                <h2
                  style="
                    margin: 15px 0 8px;
                    color: #1a1a2e;
                    font-size: 25px;
                    font-weight: 700;
                  "
                >
                  Your one-time verification code!
                </h2>
                <p
                  style="
                    margin: 15px 0 8px;
                    color: #1a1a2e;
                    font-size: 18px;
                    font-weight: 500;
                  "
                >
                  Please verify your email,
                </p>
                <p
                  style="
                    margin: 0 0 18px;
                    color: #161616;
                    font-size: 14px;
                    line-height: 1.6;
                  "
                >
                  Finish signing up for a ${app} account using the verification
                  code below. This code will expire within
                  <strong>10 minutes</strong>.
                </p>
                <!-- OTP Box -->
                <div style="text-align: left; margin: 0 0 18px">
                  <div>
                    <span
                      style="font-size: 15px; font-weight: 600; color: #1a1a2e"
                    >
                      ${code}
                    </span>
                  </div>
                </div>
                <p
                  style="
                    margin-bottom: 30px;
                    color: #161616;
                    font-size: 14px;
                    text-align: left;
                  "
                >
                  If you didn't request this code, feel free to ignore this
                  message.
                </p>
                <div
                  style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 14px;
                    color: #161616;
                  "
                >
                  <p style="margin: 0">
                    Privacy Policy | Terms of Service | <br />
                    Update your Preferences
                  </p>
                </div>
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="padding: 20px 40px; text-align: center">
                <p style="margin: 0; color: #161616; font-size: 12px">
                  © 2026 ${app}. This email contains important information about
                  your ${app} account and is not for marketing purposes.
                  Marketing opt-out preferences do not apply to this email.
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
  <head>
    <meta charset="utf-8" />
  </head>
  <body
    style="
      margin: 0;
      padding: 0;
      background: #f4f4f4;
      font-family: &quot;Segoe UI&quot;, Arial, sans-serif;
    "
  >
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding: 40px 20px">
          <table
            width="600"
            cellpadding="0"
            cellspacing="0"
            style="
              background: #ffffff;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
            "
          >
            <!-- Header -->
            <tr>
              <td style="background: #ffffff; padding: 30px 30px 30px 30px">
                <table cellpadding="0" cellspacing="0">
                  <tr>
                    <h1
                      style="
                        margin-bottom: 30px;
                        color: #2c7be5;
                        font-size: 30px;
                        font-weight: 700;
                        letter-spacing: 0.5px;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                      "
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="34"
                        height="34"
                      >
                        <g id="brand" data-name="brand">
                          <path
                            fill="#2c7be5"
                            d="M19,5.4c-1.8-1.9-4.2-3-7-3s-5.2,1.1-6.9,2.9l7.1,2.6,6.8-2.5Z"
                          />
                          <path
                            fill="#2c7be5"
                            d="M20.6,7.8 C20.9,7.1 20.8,6.2 20.3,5.8 L12.1,8.8 3.8,5.7 C3.3,6.1 3.2,6.9 3.4,7.6 C2.7,8.9 2.3,10.4 2.3,12 C2.3,17.3 6.6,21.6 11.9,21.6 C17.2,21.6 21.5,17.3 21.5,12 C21.5,9.608 20.6,7.8 20.6,7.8 Z M16,16.2 C14.9,16.2 13.9,15.8 13.1,15.2 L12.1,17.4 11,15.2 C10.2,15.9 9.2,16.3 8.1,16.3 C5.6,16.3 3.5,14.3 3.5,11.7 C3.5,10.417 3.9,9.6 4.5,8.8 L7.4,9.7 C6.8,10 6.3,10.6 6.3,11.4 C6.3,12.2 7.1,13.3 8.2,13.3 C9.3,13.3 10.1,12.5 10.1,11.4 C10.1,10.986 10,10.7 9.8,10.4 L11.9,11 14.2,10.3 C14,10.6 13.9,10.9 13.9,11.2 C13.9,12.2 14.7,13.1 15.8,13.1 C16.9,13.1 17.7,12.3 17.7,11.2 C17.7,10.214 17.106,9.668 16.7,9.5 L19.4,8.7 C20.1,9.5 20.4,10.5 20.4,11.6 C20.4,14.1 18.4,16.2 15.8,16.2 Z"
                          />
                        </g>
                      </svg>

                      ${app}
                    </h1>
                    <td style="vertical-align: middle">
                      <div
                        style="
                          width: 26px;
                          height: 26px;
                          background: #2ecc71;
                          border-radius: 50%;
                          text-align: center;
                          line-height: 26px;
                          margin-left: 30px;
                        "
                      >
                        <span
                          style="color: #fff; font-size: 15px; font-weight: 700"
                          ><svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="26"
                            height="26"
                            viewBox="0 0 24 24"
                          >
                            <g fill="currentColor">
                              <path
                                d="M10.243 16.314L6 12.07l1.414-1.414l2.829 2.828l5.656-5.657l1.415 1.415z"
                              />
                              <path
                                fill-rule="evenodd"
                                d="M1 12C1 5.925 5.925 1 12 1s11 4.925 11 11s-4.925 11-11 11S1 18.075 1 12m11 9a9 9 0 1 1 0-18a9 9 0 0 1 0 18"
                                clip-rule="evenodd"
                              />
                            </g></svg
                        ></span>
                      </div>
                    </td>
                    <td style="width: 16px"></td>
                    <td style="vertical-align: middle">
                      <h1
                        style="
                          margin: 0;
                          color: #2ecc71;
                          font-size: 22px;
                          font-weight: 700;
                        "
                      >
                        Account Created Successfully!
                      </h1>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <!-- Body -->
            <tr>
              <td style="padding: 0px 40px 32px">
                <p
                  style="
                    margin: 0 0 16px;
                    color: #1a1a2e;
                    font-size: 18px;
                    font-weight: 600;
                    margin-left: 25px;
                  "
                >
                  Welcome to ${app}, ${name}!
                </p>
                <p
                  style="
                    margin: 0 0 24px;
                    color: #161616;
                    font-size: 14px;
                    line-height: 1.6;
                    margin-left: 25px;
                  "
                >
                  Your account has been successfully created and verified. Here
                  are your account details:
                </p>
                <table
                  width="90%"
                  cellpadding="0"
                  cellspacing="0"
                  style="
                    background: #f8f8fc;
                    border-radius: 10px;
                    overflow: hidden;
                    margin-left: 25px;
                  "
                >
                  <tr>
                    <td
                      style="padding: 14px 20px; border-bottom: 1px solid #eee"
                    >
                      <span
                        style="
                          color: #161616;
                          font-size: 12px;
                          text-transform: uppercase;
                          letter-spacing: 0.5px;
                        "
                        >Name</span
                      ><br />
                      <span
                        style="
                          color: #1a1a2e;
                          font-size: 14px;
                          font-weight: 600;
                        "
                        >${name}</span
                      >
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 14px 20px">
                      <span
                        style="
                          color: #161616;
                          font-size: 12px;
                          text-transform: uppercase;
                          letter-spacing: 0.5px;
                        "
                        >Email</span
                      ><br />
                      <span
                        style="
                          color: #1a1a2e;
                          font-size: 14px;
                          font-weight: 600;
                        "
                        >${email}</span
                      >
                    </td>
                  </tr>
                </table>
                <p
                  style="
                    margin: 24px 0 0;
                    color: #161616;
                    font-size: 12px;
                    text-align: center;
                  "
                >
                  You can now sign in to your account using your email and
                  password.
                </p>
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="padding: 0 40px 20px 40px; text-align: center">
                <p style="margin: 0; color: #161616; font-size: 11px">
                  © 2026 ${app}. This email contains important information about
                  your ${app} account and is not for marketing purposes.
                  Marketing opt-out preferences do not apply to this email.
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
