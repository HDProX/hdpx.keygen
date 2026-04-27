// api/login.js
import { query, hashPassword, cors, jsonOut } from "./_db.js";

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST")    return jsonOut(res, false, "Method not allowed", 405);

  const { email: rawEmail = "", password = "" } = req.body ?? {};
  const email = rawEmail.toLowerCase().trim();

  if (!email || !password.trim()) {
    return jsonOut(res, false, "Email and password are required.", 400);
  }

  try {
    const rows = await query(
      `SELECT id, name, email, password_hash, salt, is_google,
              avatar_url, created_at, is_logged_in
       FROM   users
       WHERE  email = ?
       LIMIT  1`,
      [email]
    );

    if (!rows.length) return jsonOut(res, false, "Email or password is incorrect.", 400);

    const row = rows[0];

    // Akun Google tanpa password
    if (row.is_google && !row.password_hash) {
      return jsonOut(
        res, false,
        "This account is registered via Google. Please use the 'Continue with Google' button.",
        400
      );
    }

    // Verifikasi password
    const expected = hashPassword(password.trim(), row.salt);
    if (expected !== row.password_hash) {
      return jsonOut(res, false, "Email or password is incorrect.", 400);
    }

    // Update last_login & is_logged_in
    await query(
      "UPDATE users SET last_login = NOW(), is_logged_in = true, updated_at = NOW() WHERE id = ?",
      [row.id]
    );

    // Hitung active_until (created_at + 1 bulan)
    let activeUntil = null;
    if (row.created_at) {
      const d = new Date(row.created_at);
      d.setMonth(d.getMonth() + 1);
      activeUntil = `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`;
    }

    return jsonOut(res, true, "Login successful!", 200, {
      user_id:      row.id,
      name:         row.name,
      email:        row.email,
      avatar_url:   row.avatar_url ?? "",
      is_google:    Boolean(row.is_google),
      is_logged_in: true,
      created_at:   row.created_at,
      active_until: activeUntil,
    });

  } catch (e) {
    console.error("login:", e.message);
    return jsonOut(res, false, "Something went wrong. Please try again.", 500);
  }
}