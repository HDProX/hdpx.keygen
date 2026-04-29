(function () {
  "use strict";

  // ── Route map ─────────────────────────────────────────────────────────────
  const ROUTES = {
    "/login":                    "/scripts/templates/login.html",
    "/signin":                   "/scripts/templates/login.html",
    "/signin/password":          "/scripts/templates/password.html",
    "/create-account/password":  "/scripts/templates/password.html",
    "/password":                 "/scripts/templates/password.html",
    "/email-verification":       "/scripts/templates/password.html",
    "/forgot-password":          "/scripts/templates/password.html",
    "/reset-password":           "/scripts/templates/password.html",
    "/change-password":          "/scripts/templates/password.html",
  };

  // ── Deteksi environment ───────────────────────────────────────────────────
  const IS_LOCAL = (
    location.hostname === "localhost" ||
    location.hostname === "127.0.0.1" ||
    location.hostname.endsWith(".local")
  );

  // ── Dev fallback ──────────────────────────────────────────────────────────
  // Saat buka /login, /password, /forgot-password di Live Server → tidak ada
  // rewrite server-side → switcher redirect ke file HTML langsung.
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

  /**
   * Nama halaman saat ini berdasarkan pathname.
   */
  function currentPage() {
    const p = location.pathname;
    if (p.includes("reset-password") || p.includes("forgot-password")) return "forgot-password";
    if (p.includes("change-password"))         return "change-password";
    if (p.includes("email-verification"))      return "email-verification";
    if (p.includes("create-account/password")) return "create-account-password";
    if (p.includes("signin/password"))         return "password";
    if (p.includes("signin") || p.includes("login")) return "login";
    if (p.includes("password"))                return "password";
    return null;
  }

  // ── Shorthand navigators ──────────────────────────────────────────────────

  /** Navigasi ke halaman enter-password (existing user login). */
  function goPassword(params) {
    go("/signin/password", params);
  }

  /** Navigasi ke halaman create-account password (new user register). */
  function goCreateAccountPassword(params) {
    // Strip isNew dari params karena path sudah mewakili state new user
    const { isNew, ...rest } = params || {};
    go("/create-account/password", rest);
  }

  /** Navigasi ke forgot/reset-password flow. */
  function goForgotPassword(params) {
    go("/reset-password", params);
  }

  /** Navigasi ke change-password flow (user sudah login). */
  function goChangePassword(params) {
    go("/change-password", params);
  }

  /** Navigasi ke login page. */
  function goLogin(params) {
    go("/signin", params);
  }

  // ── Boot ──────────────────────────────────────────────────────────────────
  _handleDevFallback();

  window.Switcher = {
    go,
    redirect,
    getEmail,
    clearSession,
    currentPage,
    goLogin,
    goPassword,
    goCreateAccountPassword,
    goForgotPassword,
    goChangePassword,
  };

})();