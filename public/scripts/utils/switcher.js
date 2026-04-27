(function () {
  "use strict";

  // ── Route map ─────────────────────────────────────────────────────────────
  // Hanya dipakai saat dev lokal (Live Server, dll).
  // Di Vercel production, vercel.json yang handle rewrite ini server-side.
  const ROUTES = {
    "/login":           "/scripts/templates/login.html",
    "/password":        "/scripts/templates/password.html",
    "/forgot-password": "/scripts/templates/forgot-password.html",
    "/change-password": "/scripts/templates/change-password.html",
  };

  // ── Deteksi environment ───────────────────────────────────────────────────
  const IS_LOCAL = (
    location.hostname === "localhost" ||
    location.hostname === "127.0.0.1" ||
    location.hostname.endsWith(".local")
  );

  // ── Dev fallback ──────────────────────────────────────────────────────────
  // Saat buka /signup di Live Server → tidak ada rewrite server-side
  // → switcher redirect ke file HTML langsung.
  // Di Vercel: tidak pernah masuk sini karena rewrite sudah di server.
  function _handleDevFallback() {
    if (!IS_LOCAL) return;
    const clean = location.pathname.replace(/\/$/, "") || "/";
    const target = ROUTES[clean];
    if (target) location.replace(target + location.search);
  }

  // ── Internal helpers ──────────────────────────────────────────────────────
  function _saveEmail(email) {
    try { sessionStorage.setItem("app_email", email); } catch (_) {}
  }

  function _buildUrl(path, params) {
    if (!params || !Object.keys(params).length) return path;
    return path + "?" + new URLSearchParams(params).toString();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PUBLIC API
  // ─────────────────────────────────────────────────────────────────────────

  /** Navigasi ke halaman auth, simpan ke history (bisa tombol back). */
  function go(path, params) {
    if (params?.email) _saveEmail(params.email);
    location.href = _buildUrl(path, params);
  }

  /** Sama seperti go(), tapi replace history — user tidak bisa back. */
  function redirect(path, params) {
    if (params?.email) _saveEmail(params.email);
    location.replace(_buildUrl(path, params));
  }

  /**
   * Ambil email yang di-pass dari halaman sebelumnya.
   * Priority: URL param → sessionStorage.
   */
  function getEmail() {
    const fromUrl = new URLSearchParams(location.search).get("email");
    if (fromUrl) return fromUrl;
    try { return sessionStorage.getItem("app_email") || ""; } catch (_) { return ""; }
  }

  /** Bersihkan session auth. Panggil saat logout. */
  function clearSession() {
    try {
      sessionStorage.removeItem("app_email");
      sessionStorage.removeItem("app_name");
    } catch (_) {}
  }

  /** Nama halaman saat ini berdasarkan pathname. */
  function currentPage() {
    const p = location.pathname;
    if (p.includes("login"))    return "login";
    if (p.includes("password")) return "password";
    if (p.includes("forgot"))   return "forgot-password";
    if (p.includes("change"))   return "change-password";
    return null;
  }

  // ── Boot ──────────────────────────────────────────────────────────────────
  _handleDevFallback();

  window.Switcher = { go, redirect, getEmail, clearSession, currentPage };

})();