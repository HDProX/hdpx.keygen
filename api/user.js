// api/user.js
// Router gabungan: send-verify | verify | check-email | get-user | logout
//                  forgot-password | verify-reset-code | reset-password
// Panggil dengan: POST /api/user?action=<nama>

import { query, hashPassword, randomSalt, randomOtp, sendEmail, otpHtml, successHtml, cors, jsonOut } from "./_db.js";
import crypto from "crypto";

const OTP_TTL         = Number(process.env.OTP_TTL_SECONDS || 600);
const RESET_OTP_TTL   = 600;  // 10 menit untuk OTP reset
const RESET_TOKEN_TTL = 900;  // 15 menit untuk token setelah OTP verified

// ─── send-verify ──────────────────────────────────────────────────────────────
const NAME_WORDS = [
  "aether","axion","byte","cypher","delta","echo","flux","glitch",
  "helix","ion","krypton","lambda","matrix","neon","omega",
  "pulse","quantum","rift","sigma","tensor","vector","warp","zen",
  "apex","valor","forge","titan","vanguard","summit","onyx","obsidian",
  "ember","blaze","inferno","solstice","eclipse","atlas","zephyr",
  "drift","ridge","crown","noble","prime","crest","aegis","nova",
  "void","hex","shadow","phantom","reaper","crypt","venom","vortex",
  "zero","dark","specter","ghost","fragment","null","chaos","core","shard","night",
];

function getRandomWord(exclude) {
  let word;
  do { word = NAME_WORDS[Math.floor(Math.random() * NAME_WORDS.length)]; }
  while (word === exclude);
  return word;
}

function generateRandomName() {
  const word1 = getRandomWord();
  const word2 = getRandomWord(word1);
  const num   = Math.floor(Math.random() * 900000) + 100000;
  return `user_${word1}${word2}${num}`;
}

function validateEmailPassword(email, password) {
  if (!email)                                          return "Email is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))     return "Invalid email format.";
  if (!password)                                       return "Password is required.";
  if (password.length < 8)                            return "Password must be at least 8 characters long.";
  return null;
}

async function handleSendVerify(req, res) {
  const { email: rawEmail = "", password = "" } = req.body ?? {};
  const email = rawEmail.toLowerCase().trim();
  const err   = validateEmailPassword(email, password.trim());
  if (err) return jsonOut(res, false, err, 400);

  try {
    const existing = await query("SELECT id FROM users WHERE email = ? LIMIT 1", [email]);
    if (existing.length) return jsonOut(res, false, "Email already registered.", 400);

    const pendingRows = await query("SELECT name FROM otp_pending WHERE email = ? LIMIT 1", [email]);

    let name;
    if (pendingRows.length) {
      name = pendingRows[0].name;
    } else {
      name = generateRandomName();
      for (let i = 0; i < 10; i++) {
        const taken = await query("SELECT id FROM users WHERE name = ? LIMIT 1", [name]);
        if (!taken.length) break;
        name = generateRandomName();
      }
    }

    const code    = randomOtp();
    const expires = new Date(Date.now() + OTP_TTL * 1000).toISOString();

    await query(
      `INSERT INTO otp_pending (email, name, password, code, expires_at, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())
       ON CONFLICT (email) DO UPDATE SET
         password = EXCLUDED.password, code = EXCLUDED.code,
         expires_at = EXCLUDED.expires_at, created_at = NOW()`,
      [email, name, password.trim(), code, expires]
    );

    const appName = process.env.APP_NAME || "Keygen";
    await sendEmail(email, name, `${code} - Your ${appName} verification code`, otpHtml(name, code));
    return jsonOut(res, true, "Verification code has been sent.");
  } catch (e) {
    console.error("send-verify:", e.message);
    return jsonOut(res, false, "Failed to send verification email. Please try again.", 500);
  }
}

// ─── verify ───────────────────────────────────────────────────────────────────
async function handleVerify(req, res) {
  const { email: rawEmail = "", code: rawCode = "" } = req.body ?? {};
  const email = rawEmail.toLowerCase().trim();
  const code  = rawCode.toUpperCase().trim();

  if (!email || !code) return jsonOut(res, false, "Email and code are required.", 400);

  try {
    const rows = await query(
      "SELECT name, password, code, expires_at FROM otp_pending WHERE email = ? LIMIT 1",
      [email]
    );
    if (!rows.length) return jsonOut(res, false, "No pending verification found. Please sign up again.", 400);

    const row = rows[0];

    if (new Date(row.expires_at) < new Date()) {
      await query("DELETE FROM otp_pending WHERE email = ?", [email]);
      return jsonOut(res, false, "Code has expired. Please request a new one.", 400);
    }

    const expected = Buffer.from(row.code);
    const received = Buffer.from(code);
    const valid = expected.length === received.length && crypto.timingSafeEqual(expected, received);
    if (!valid) return jsonOut(res, false, "Invalid or expired code.", 400);

    await query("DELETE FROM otp_pending WHERE email = ?", [email]);

    const dup = await query("SELECT id FROM users WHERE email = ? LIMIT 1", [email]);
    if (dup.length) return jsonOut(res, false, "Email already registered.", 400);

    const salt         = randomSalt();
    const passwordHash = hashPassword(row.password, salt);
    const name         = row.name.trim();

    await query(
      `INSERT INTO users (name, email, password_hash, salt, is_google, phone, bio, avatar_url, is_logged_in, created_at, updated_at)
       VALUES (?, ?, ?, ?, false, '', '', '', true, NOW(), NOW())`,
      [name, email, passwordHash, salt]
    );

    const app = process.env.APP_NAME || "Keygen";
    try {
      await sendEmail(email, name, `Welcome to ${app}! Your account is ready`, successHtml(name, email));
    } catch (mailErr) {
      console.error("success email error:", mailErr.message);
    }

    return jsonOut(res, true, "Account created successfully!", 200, { name });
  } catch (e) {
    console.error("verify:", e.message);
    return jsonOut(res, false, "An error occurred, please try again.", 500);
  }
}

// ─── check-email ──────────────────────────────────────────────────────────────
async function handleCheckEmail(req, res) {
  const { email: rawEmail = "" } = req.body ?? {};
  const email = rawEmail.toLowerCase().trim();
  if (!email) return jsonOut(res, false, "Email is required.", 400);

  try {
    const rows = await query("SELECT id FROM users WHERE email = ? LIMIT 1", [email]);
    return jsonOut(res, true, "OK", 200, { exists: rows.length > 0 });
  } catch (e) {
    console.error("check-email:", e.message);
    return jsonOut(res, false, "Something went wrong. Please try again.", 500);
  }
}

// ─── get-user ─────────────────────────────────────────────────────────────────
async function handleGetUser(req, res) {
  const { email: rawEmail = "" } = req.body ?? {};
  const email = rawEmail.toLowerCase().trim();
  if (!email) return jsonOut(res, false, "Email wajib diisi.", 400);

  try {
    const rows = await query(
      `SELECT id, name, email, is_google, avatar_url, created_at, is_logged_in
       FROM users WHERE email = ? LIMIT 1`,
      [email]
    );
    if (!rows.length) return jsonOut(res, false, "User not found.", 404);

    const row = rows[0];
    let activeUntil = null;
    if (row.created_at) {
      const d = new Date(row.created_at);
      d.setMonth(d.getMonth() + 1);
      activeUntil = `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`;
    }

    return jsonOut(res, true, "OK", 200, {
      user_id:      row.id,
      name:         row.name,
      email:        row.email,
      avatar_url:   row.avatar_url ?? "",
      is_google:    Boolean(row.is_google),
      is_logged_in: Boolean(row.is_logged_in),
      created_at:   row.created_at,
      active_until: activeUntil,
    });
  } catch (e) {
    console.error("get-user:", e.message);
    return jsonOut(res, false, "Terjadi kesalahan.", 500);
  }
}

// ─── logout ───────────────────────────────────────────────────────────────────
async function handleLogout(req, res) {
  const { email: rawEmail = "" } = req.body ?? {};
  const email = rawEmail.toLowerCase().trim();
  if (!email) return jsonOut(res, false, "Email wajib diisi.", 400);

  try {
    await query(
      "UPDATE users SET is_logged_in = false, updated_at = NOW() WHERE email = ?",
      [email]
    );
    return jsonOut(res, true, "Logout successful.");
  } catch (e) {
    console.error("logout:", e.message);
    return jsonOut(res, false, "Something went wrong.", 500);
  }
}

// ─── forgot-password ──────────────────────────────────────────────────────────
// Step 1: Kirim OTP reset ke email user.
async function handleForgotPassword(req, res) {
  const { email: rawEmail = "" } = req.body ?? {};
  const email = rawEmail.toLowerCase().trim();
  if (!email) return jsonOut(res, false, "Email is required.", 400);

  try {
    const rows = await query(
      "SELECT name FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    // Selalu balas sukses — jangan bocorkan apakah email terdaftar atau tidak
    if (!rows.length) {
      return jsonOut(res, true, "If this email is registered, a reset code has been sent.");
    }

    const name    = rows[0].name;
    const code    = randomOtp();
    const expires = new Date(Date.now() + RESET_OTP_TTL * 1000).toISOString();

    await query(
      `INSERT INTO password_resets (email, code, reset_token, expires_at, created_at)
       VALUES (?, ?, NULL, ?, NOW())
       ON CONFLICT (email) DO UPDATE SET
         code        = EXCLUDED.code,
         reset_token = NULL,
         expires_at  = EXCLUDED.expires_at,
         created_at  = NOW()`,
      [email, code, expires]
    );

    const appName = process.env.APP_NAME || "Keygen";
    await sendEmail(
      email,
      name,
      `${code} - Your ${appName} password reset code`,
      resetOtpHtml(name, code, appName)
    );

    return jsonOut(res, true, "If this email is registered, a reset code has been sent.");
  } catch (e) {
    console.error("forgot-password:", e.message);
    return jsonOut(res, false, "Failed to send reset code. Please try again.", 500);
  }
}

// ─── verify-reset-code ────────────────────────────────────────────────────────
// Step 2: Validasi OTP, kembalikan reset token single-use.
async function handleVerifyResetCode(req, res) {
  const { email: rawEmail = "", code: rawCode = "" } = req.body ?? {};
  const email = rawEmail.toLowerCase().trim();
  const code  = rawCode.toUpperCase().trim();

  if (!email || !code) return jsonOut(res, false, "Email and code are required.", 400);

  try {
    const rows = await query(
      "SELECT code, expires_at FROM password_resets WHERE email = ? LIMIT 1",
      [email]
    );
    if (!rows.length) return jsonOut(res, false, "Invalid or expired code.", 400);

    const row = rows[0];

    if (new Date(row.expires_at) < new Date()) {
      await query("DELETE FROM password_resets WHERE email = ?", [email]);
      return jsonOut(res, false, "Code has expired. Please request a new one.", 400);
    }

    const expected = Buffer.from(row.code);
    const received = Buffer.from(code);
    const valid = expected.length === received.length && crypto.timingSafeEqual(expected, received);
    if (!valid) return jsonOut(res, false, "Invalid or expired code.", 400);

    // OTP valid → generate reset token (berlaku 15 menit), hapus OTP dari row
    const resetToken   = crypto.randomBytes(32).toString("hex");
    const tokenExpires = new Date(Date.now() + RESET_TOKEN_TTL * 1000).toISOString();

    await query(
      `UPDATE password_resets
         SET code = '', reset_token = ?, expires_at = ?
       WHERE email = ?`,
      [resetToken, tokenExpires, email]
    );

    return jsonOut(res, true, "Code verified.", 200, { token: resetToken });
  } catch (e) {
    console.error("verify-reset-code:", e.message);
    return jsonOut(res, false, "An error occurred. Please try again.", 500);
  }
}

// ─── reset-password ───────────────────────────────────────────────────────────
// Step 3: Validasi reset token, update password user.
async function handleResetPassword(req, res) {
  const { email: rawEmail = "", token = "", password = "" } = req.body ?? {};
  const email = rawEmail.toLowerCase().trim();

  if (!email || !token || !password) {
    return jsonOut(res, false, "Email, token, and password are required.", 400);
  }
  if (password.length < 8) {
    return jsonOut(res, false, "Password must be at least 8 characters long.", 400);
  }

  try {
    const rows = await query(
      "SELECT reset_token, expires_at FROM password_resets WHERE email = ? LIMIT 1",
      [email]
    );
    if (!rows.length || !rows[0].reset_token) {
      return jsonOut(res, false, "Invalid or expired reset token.", 400);
    }

    const row = rows[0];

    if (new Date(row.expires_at) < new Date()) {
      await query("DELETE FROM password_resets WHERE email = ?", [email]);
      return jsonOut(res, false, "Reset token has expired. Please start over.", 400);
    }

    const expected = Buffer.from(row.reset_token);
    const received = Buffer.from(token);
    const valid = expected.length === received.length && crypto.timingSafeEqual(expected, received);
    if (!valid) return jsonOut(res, false, "Invalid or expired reset token.", 400);

    // Token valid → hash & update password
    const salt         = randomSalt();
    const passwordHash = hashPassword(password, salt);

    await query(
      "UPDATE users SET password_hash = ?, salt = ?, updated_at = NOW() WHERE email = ?",
      [passwordHash, salt, email]
    );

    // Hapus row agar token tidak bisa dipakai lagi (single-use)
    await query("DELETE FROM password_resets WHERE email = ?", [email]);

    return jsonOut(res, true, "Password has been reset successfully.");
  } catch (e) {
    console.error("reset-password:", e.message);
    return jsonOut(res, false, "An error occurred. Please try again.", 500);
  }
}

// ─── Email template khusus reset password ────────────────────────────────────
function resetOtpHtml(name, code, appName) {
  return `<!doctype html>
<html>
  <head><meta charset="utf-8" /></head>
  <body style="margin:0;padding:0;background:#f4f4f4;font-family:&quot;Segoe UI&quot;,Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:40px 20px">
          <table width="520" cellpadding="0" cellspacing="0"
            style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
            <tr>
              <td style="background:#ffffff;padding:50px 30px 0px 30px;text-align:left;">
                <h1 style="margin:0;color:#191919;font-size:30px;font-weight:700;letter-spacing:0.5px;">
                  ${appName}
                </h1>
              </td>
            </tr>
            <tr>
              <td style="padding:40px 60px 32px">
                <h2 style="margin:0 0 8px;color:#1a1a2e;font-size:25px;font-weight:700;">
                  Password reset code
                </h2>
                <p style="margin:0 0 8px;color:#1a1a2e;font-size:18px;font-weight:500;">
                  Hi ${name},
                </p>
                <p style="margin:0 0 28px;color:#555;font-size:14px;line-height:1.6;">
                  We received a request to reset your password. Enter the code below to continue.
                  This code will expire within <strong>10 minutes</strong>.
                </p>
                <div style="text-align:center;margin:0 0 28px">
                  <div style="display:inline-block;background:#fff4f0;border:2px dashed #e8623a;border-radius:12px;padding:10px 40px;">
                    <span style="font-size:36px;font-weight:800;letter-spacing:10px;color:#e8623a;font-family:&quot;Courier New&quot;,monospace;">
                      ${code}
                    </span>
                  </div>
                </div>
                <p style="margin:0;color:#888;font-size:12px;text-align:center;">
                  If you didn't request a password reset, you can safely ignore this email.
                </p>
              </td>
            </tr>
            <tr>
              <td style="background:#f8f8fc;padding:20px 40px;text-align:center;border-top:1px solid #eee;">
                <p style="margin:0;color:#aaa;font-size:11px;">
                  © ${appName}. This is an automated message, please do not reply.
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

// ─── Main router ──────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST")    return jsonOut(res, false, "Method not allowed", 405);

  const action = req.query.action || req.body?.action;

  switch (action) {
    case "send-verify":       return handleSendVerify(req, res);
    case "verify":            return handleVerify(req, res);
    case "check-email":       return handleCheckEmail(req, res);
    case "get-user":          return handleGetUser(req, res);
    case "logout":            return handleLogout(req, res);
    case "forgot-password":   return handleForgotPassword(req, res);
    case "verify-reset-code": return handleVerifyResetCode(req, res);
    case "reset-password":    return handleResetPassword(req, res);
    default:
      return jsonOut(res, false, `Unknown action: "${action}"`, 400);
  }
}