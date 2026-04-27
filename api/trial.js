// api/trial.js
// Router gabungan: deactivate | load | save
// Panggil dengan: POST /api/trial?action=<nama>

import { query, cors, jsonOut } from "./_db.js";

// ─── deactivate ───────────────────────────────────────────────────────────────
async function handleDeactivate(req, res) {
  const { device_id } = req.body ?? {};
  if (!device_id) return jsonOut(res, false, "device_id required", 400);

  try {
    await query(
      "UPDATE trials SET is_active = false, updated_at = NOW() WHERE device_id = ?",
      [device_id]
    );
    return jsonOut(res, true, "Trial deactivated.");
  } catch (e) {
    console.error("trial/deactivate:", e.message);
    return jsonOut(res, false, e.message, 500);
  }
}

// ─── load ─────────────────────────────────────────────────────────────────────
async function handleLoad(req, res) {
  const { device_id } = req.body ?? {};
  if (!device_id) return jsonOut(res, false, "device_id required", 400);

  try {
    const rows = await query(
      "SELECT * FROM trials WHERE device_id = ? LIMIT 1",
      [device_id]
    );
    if (!rows.length) return jsonOut(res, false, "Trial not found.", 404);
    return jsonOut(res, true, "OK", 200, { ...rows[0] });
  } catch (e) {
    console.error("trial/load:", e.message);
    return jsonOut(res, false, e.message, 500);
  }
}

// ─── save ─────────────────────────────────────────────────────────────────────
async function handleSave(req, res) {
  const { device_id, email, activated_at, trial_duration_days, is_active } = req.body ?? {};
  if (!device_id) return jsonOut(res, false, "device_id required", 400);

  try {
    await query(
      `INSERT INTO trials (device_id, email, activated_at, trial_duration_days, is_active, updated_at)
       VALUES (?, ?, ?, ?, ?, NOW())
       ON CONFLICT (device_id) DO UPDATE SET
         email               = EXCLUDED.email,
         activated_at        = EXCLUDED.activated_at,
         trial_duration_days = EXCLUDED.trial_duration_days,
         is_active           = EXCLUDED.is_active,
         updated_at          = NOW()`,
      [device_id, email || null, activated_at || new Date().toISOString(), trial_duration_days || 7, is_active ?? true]
    );
    return jsonOut(res, true, "Trial saved.");
  } catch (e) {
    console.error("trial/save:", e.message);
    return jsonOut(res, false, e.message, 500);
  }
}

// ─── Main router ──────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST")    return jsonOut(res, false, "Method not allowed", 405);

  const action = req.query.action || req.body?.action;

  switch (action) {
    case "deactivate": return handleDeactivate(req, res);
    case "load":       return handleLoad(req, res);
    case "save":       return handleSave(req, res);
    default:
      return jsonOut(res, false, `Unknown action: "${action}"`, 400);
  }
}