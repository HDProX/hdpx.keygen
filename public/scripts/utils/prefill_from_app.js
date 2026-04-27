(function () {
  "use strict";

  // ── 1. Ambil params dari URL ──────────────────────────────────
  const params = new URLSearchParams(window.location.search);

  const email    = params.get("email")     || "";
  const name     = params.get("name")      || "";
  const isGoogle = params.get("is_google") === "1";

  // ── 2. Simpan ke sessionStorage ───────────────
  if (email) {
    sessionStorage.setItem("app_email", email);
    sessionStorage.setItem("app_email_exp", Date.now() + 2 * 60 * 1000);
  }
  
  if (name)   sessionStorage.setItem("app_name_user", name);
  if (isGoogle) sessionStorage.setItem("is_google", "1");
  else if (params.has("is_google")) sessionStorage.removeItem("is_google");

  // ── Resolve nilai final (URL → session → local) ──────────────
  const resolvedEmail = email || sessionStorage.getItem("app_email") || "";
  const resolvedName  = name  || sessionStorage.getItem("app_name_user") || "";
  const resolvedIsGoogle = isGoogle
    || sessionStorage.getItem("is_google") === "1"
    || localStorage.getItem("is_google")   === "1";

  // ── 3. Apply ke DOM ──────────────────────────────────────────
  function applyData() {

    // A) Pre-fill input[type=email] yang kosong
    document.querySelectorAll('input[type="email"]').forEach(el => {
      if (!el.value && resolvedEmail) {
        el.value = resolvedEmail;
        el.dispatchEvent(new Event("input", { bubbles: true }));
      }
    });

    // B) Pre-fill input[name/id/placeholder="email"]
    document.querySelectorAll('input[name="email"], input[id="email"], input[placeholder*="email" i]')
      .forEach(el => {
        if (!el.value && resolvedEmail) {
          el.value = resolvedEmail;
          el.dispatchEvent(new Event("input", { bubbles: true }));
        }
      });

    // C) Elemen data-app="email" / "name"
    document.querySelectorAll("[data-app='email']").forEach(el => {
      if (resolvedEmail) el.textContent = resolvedEmail;
    });
    document.querySelectorAll("[data-app='name']").forEach(el => {
      if (resolvedName) el.textContent = resolvedName;
    });

    // D) Avatar / chip inisial (huruf pertama nama atau email)
    const initial =
      resolvedName  ? resolvedName.charAt(0).toUpperCase()  :
      resolvedEmail ? resolvedEmail.charAt(0).toUpperCase() : "";

    ["chipAvatar", "menuAvatar"].forEach(id => {
      const el = document.getElementById(id);
      if (el && initial) el.textContent = initial;
    });

    ["chipEmail", "menuEmail"].forEach(id => {
      const el = document.getElementById(id);
      if (el && resolvedEmail) el.textContent = resolvedEmail;
    });

    // E) Google connection status
    const status = document.getElementById("googleStatus");
    if (status) {
      status.textContent = resolvedIsGoogle && resolvedEmail
        ? "Connected to " + resolvedEmail
        : "Not connected";
    }
    document.querySelectorAll("[data-app='google_status']").forEach(el => {
      el.textContent = resolvedIsGoogle && resolvedEmail
        ? "Connected to " + resolvedEmail
        : "Not connected";
    });

    // F) Ganti placeholder {userEmail} & {userName} di seluruh teks
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    let node;
    while ((node = walker.nextNode())) nodes.push(node);
    nodes.forEach(n => {
      let t = n.textContent;
      t = t.replace(/\{userEmail\}/g, resolvedEmail);
      t = t.replace(/\{userName\}/g,  resolvedName);
      if (t !== n.textContent) n.textContent = t;
    });

    // G) Elemen data-placeholder="email" / "name"
    document.querySelectorAll("[data-placeholder]").forEach(el => {
      const map = {
        email: resolvedEmail,
        name:  resolvedName,
      };
      const key = el.dataset.placeholder;
      if (key in map) el.textContent = map[key];
    });

    // H) Update <title> — hanya placeholder user
    document.title = document.title
      .replace(/\{userEmail\}/g, resolvedEmail)
      .replace(/\{userName\}/g,  resolvedName)

    console.log("[prefill_from_app] applied:", {
      email: resolvedEmail,
      name:  resolvedName,
      isGoogle: resolvedIsGoogle,
    });
  }

  // Jalankan segera atau tunggu DOM
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyData);
  } else {
    applyData();
  }

  // Expose global
  window.AppPrefill = {
    email:    resolvedEmail,
    name:     resolvedName,
    isGoogle: resolvedIsGoogle,
    // appName & appVer diisi oleh app_settings.js setelah fetch selesai
    appName: "",
    appVer:  "",
  };
})();