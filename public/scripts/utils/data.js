async function loadAppData() {
    // ── Prioritas 1: Baca user data dari URL / storage ───────────
    //    app_name & app_version TIDAK dari URL — ditangani app_settings.js
    const params = new URLSearchParams(window.location.search);

    const emailFromUrl = params.get("email") || sessionStorage.getItem("app_email") || "";
    const nameFromUrl  = params.get("name")  || sessionStorage.getItem("app_name_user") || "";

    // app_name & app_version dari window.AppSettings (diset oleh app_settings.js)
    // fallback ke storage jika app_settings.js belum selesai fetch
    const appName = window.AppSettings?.app_name    || sessionStorage.getItem("app_name") || "";
    const appVer  = window.AppSettings?.app_version || sessionStorage.getItem("app_ver")  || "";

    // Simpan user data ke sessionStorage
    if (emailFromUrl) sessionStorage.setItem("app_email",     emailFromUrl);
    if (nameFromUrl)  sessionStorage.setItem("app_name_user", nameFromUrl);

    if (emailFromUrl) {
        appConfig = {
            app_name:    appName || "App",
            app_version: appVer  || "",
        };
        userData = {
            email:        emailFromUrl,
            name:         nameFromUrl,
            is_logged_in: true,
        };
        replacePlaceholders();
        return;
    }

    // ── Prioritas 2: Fetch user dari API (/api/get-user) ─────────
    try {
        const userRes = await fetch("/api/user?action=get-user", { method: "POST" });
        if (!userRes.ok) throw new Error("get-user not available");

        userData = await userRes.json();
        appConfig = {
            app_name:    appName || "App",
            app_version: appVer  || "",
        };
        replacePlaceholders();
    } catch {
        // ── Prioritas 3: Mock data (last resort) ──────────────────
        useMockData();
    }
}