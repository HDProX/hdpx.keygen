(async function () {
  "use strict";

  const API_URL = "/api/config";

  // ── Sembunyikan body sampai data siap ────────────────────────
  document.documentElement.style.visibility = "hidden";

  // ── Apply ke DOM setelah data tersedia ───────────────────────
  function applyToDOM(name, ver) {
    // 1. Simpan ke storage (session + local)
    sessionStorage.setItem("app_name", name);
    sessionStorage.setItem("app_ver",  ver);
    localStorage.setItem("app_name",   name);
    localStorage.setItem("app_ver",    ver);

    // 2. Elemen data-app="app_name" / data-app="app_ver"
    document.querySelectorAll("[data-app='app_name']")
      .forEach(el => el.textContent = name);
    document.querySelectorAll("[data-app='app_ver']")
      .forEach(el => el.textContent = ver);

    // 3. Elemen data-placeholder="app_name" / "app_ver"
    document.querySelectorAll("[data-placeholder='app_name']")
      .forEach(el => el.textContent = name);
    document.querySelectorAll("[data-placeholder='app_ver']")
      .forEach(el => el.textContent = ver);

    // 4. Ganti {appName} dan {appVersion} di seluruh text node
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    let n;
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(n => {
      let t = n.textContent;
      t = t.replace(/\{appName\}/g,    name);
      t = t.replace(/\{appVersion\}/g, ver);
      if (t !== n.textContent) n.textContent = t;
    });

    // 5. Update <title>
    document.title = document.title
      .replace(/\{appName\}/g,    name)
      .replace(/\{appVersion\}/g, ver);

    // 6. Sync ke window.AppPrefill jika sudah ada (prefill_from_app.js)
    if (window.AppPrefill) {
      window.AppPrefill.appName = name;
      window.AppPrefill.appVer  = ver;
    }

    // 7. Expose global (untuk data.js dan script lain)
    window.AppSettings = { app_name: name, app_version: ver };

    console.log("[app_settings] applied:", { app_name: name, app_version: ver });

    // 8. Tampilkan halaman
    document.documentElement.style.visibility = "visible";
  }

  // ── Error: tampilkan indikator di elemen terkait ─────────────
  function showError(err) {
    console.error("[app_settings] Gagal fetch /api/config:", err.message);
    document.querySelectorAll("[data-app='app_name'], [data-placeholder='app_name']")
      .forEach(el => el.textContent = "⚠ Unavailable");

    // Tetap tampilkan walau gagal
    document.documentElement.style.visibility = "visible";
  }

  // ── Fetch dari /api/config ────────────────────────────────────
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const { app_name, app_version } = await res.json();
    if (!app_name) throw new Error("app_name kosong");

    const ready = () => applyToDOM(app_name, app_version || "");
    document.readyState === "loading"
      ? document.addEventListener("DOMContentLoaded", ready)
      : ready();

  } catch (err) {
    showError(err);
  }
})();