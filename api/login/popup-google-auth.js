export default function handler(req, res) {
    const {
        email  = "",
        name   = "",
        avatar = "",
        error  = "",
        state  = "",
    } = req.query;

    return sendPage(res, { email, name, avatar, error, state });
}

// ─── HTML page with theme support ────────────────────────────────────────────
function sendPage(res, { email = "", name = "", avatar = "", error = "", state = "" }) {
    const appName = process.env.APP_NAME || "Keygen";
    const isError = Boolean(error);

    const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(appName)}</title>
    <link rel="icon" href="/images/Favicon.svg" type="image/svg+xml" />

    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />

    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      :root {
        --bg-body: #f5f7fc;
        --bg-card: #ffffff;
        --text-primary: #1a2c3e;
        --text-secondary: #475569;
        --text-muted: #64748b;
        --brand-name-light: #1a2c3e;
        --brand-name-dark: #f1f5f9;
        --logo-color: #3b82f6;
        --shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      }

      body.dark {
        --bg-body: #1a1a1a;
        --bg-card: #242424;
        --text-primary: #e2e8f0;
        --text-secondary: #94a3b8;
        --text-muted: #64748b;
        --shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
      }

      body {
        font-family: "Inter", sans-serif;
        background: var(--bg-body);
        color: var(--text-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        padding: 20px;
        transition: background 0.3s ease, color 0.3s ease;
        position: relative;
      }

      .theme-toggle {
        position: fixed;
        top: 20px;
        right: 20px;
        width: 42px;
        height: 42px;
        border-radius: 50%;
        background: var(--bg-card);
        border: 1px solid var(--bg-card);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        z-index: 100;
      }

      .theme-toggle:hover {
        transform: scale(1.05);
      }

      .darkmode-icon {
        width: 22px;
        height: 22px;
        display: inline-block;
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
      }

      body:not(.dark) .darkmode-icon {
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23475569' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z' /%3E%3C/svg%3E");
      }

      body.dark .darkmode-icon {
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z' /%3E%3C/svg%3E");
      }

      .card {
        border-radius: 20px;
        padding: 48px 40px;
        width: 100%;
        max-width: 440px;
        text-align: center;
        animation: fadeInUp 0.5s ease-out;
        transition: background 0.3s ease, border-color 0.3s ease;
        position: relative;
        z-index: 1;
      }

      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(30px); }
        to   { opacity: 1; transform: translateY(0); }
      }

      .app-brand {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 5px;
        margin-bottom: 32px;
      }

      .app-brand svg {
        width: 30px;
        height: 30px;
        color: var(--logo-color);
      }

      .app-brand .app-name {
        font-size: 1.4rem;
        font-weight: 600;
        color: var(--brand-name-light);
      }

      body.dark .app-brand .app-name {
        color: var(--brand-name-dark);
      }

      .status-text {
        font-size: 1.8rem;
        font-weight: 600;
        margin: 16px 0 8px 0;
      }

      .status-text.success { color: #22c55e; }
      .status-text.error   { color: #ef4444; }

      .subtitle {
        font-size: 14px;
        color: var(--text-muted);
        margin-bottom: 24px;
      }

      .footer {
        font-size: 14px;
        color: var(--text-muted);
        margin-top: 5px;
        padding-top: 5px;
      }

      .btn-close {
        background: #3b82f6;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        margin-top: 20px;
        width: 100%;
        transition: all 0.3s ease;
      }

      .btn-close:hover {
        opacity: 0.9;
        transform: translateY(-2px);
      }
    </style>
  </head>

  <body>
    <button class="theme-toggle" id="themeToggle" aria-label="Toggle theme">
      <span class="darkmode-icon"></span>
    </button>

    <div class="card">
      <div class="app-brand">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <defs><style>.cls-1 { fill: currentColor; }</style></defs>
          <g id="brand" data-name="brand">
            <path class="cls-1" d="M19,5.4c-1.8-1.9-4.2-3-7-3s-5.2,1.1-6.9,2.9l7.1,2.6,6.8-2.5Z"/>
            <path class="cls-1" d="
              M20.6,7.8 C20.9,7.1 20.8,6.2 20.3,5.8
              L12.1,8.8 3.8,5.7
              C3.3,6.1 3.2,6.9 3.4,7.6
              C2.7,8.9 2.3,10.4 2.3,12
              C2.3,17.3 6.6,21.6 11.9,21.6
              C17.2,21.6 21.5,17.3 21.5,12
              C21.5,9.608 20.6,7.8 20.6,7.8 Z
              M16,16.2 C14.9,16.2 13.9,15.8 13.1,15.2
              L12.1,17.4 11,15.2
              C10.2,15.9 9.2,16.3 8.1,16.3
              C5.6,16.3 3.5,14.3 3.5,11.7
              C3.5,10.417 3.9,9.6 4.5,8.8
              L7.4,9.7 C6.8,10 6.3,10.6 6.3,11.4
              C6.3,12.2 7.1,13.3 8.2,13.3
              C9.3,13.3 10.1,12.5 10.1,11.4
              C10.1,10.986 10,10.7 9.8,10.4
              L11.9,11 14.2,10.3
              C14,10.6 13.9,10.9 13.9,11.2
              C13.9,12.2 14.7,13.1 15.8,13.1
              C16.9,13.1 17.7,12.3 17.7,11.2
              C17.7,10.214 17.106,9.668 16.7,9.5
              L19.4,8.7 C20.1,9.5 20.4,10.5 20.4,11.6
              C20.4,14.1 18.4,16.2 15.8,16.2 Z
            "/>
          </g>
        </svg>
        <span class="app-name">${escapeHtml(appName)}</span>
      </div>

      ${isError ? `
      <div class="status-text error">Sign in Failed!</div>
      <div class="subtitle">Something went wrong. Please try again.</div>
      <div class="footer">You can now close this window.</div>
      ` : `
      <div class="status-text success">Sign in complete!</div>
      <div class="footer">You can now close this window.</div>
      `}
    </div>

    <script>
      // ── Theme ──────────────────────────────────────────────────────────────
      let currentTheme = "system";

      function getSystemTheme() {
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      }

      function setTheme(theme) {
        const applyDark  = () => { document.body.classList.add("dark");    updateAutofill(true);  };
        const applyLight = () => { document.body.classList.remove("dark"); updateAutofill(false); };

        if (theme === "dark")       { currentTheme = "dark";   applyDark();  }
        else if (theme === "light") { currentTheme = "light";  applyLight(); }
        else { currentTheme = "system"; getSystemTheme() === "dark" ? applyDark() : applyLight(); }
      }

      function updateAutofill(isDark) {
        let el = document.getElementById("autofillStyle");
        if (!el) { el = document.createElement("style"); el.id = "autofillStyle"; document.head.appendChild(el); }
        const bg   = isDark ? "#0f1724" : "#ffffff";
        const text = isDark ? "#e2e8f0" : "#1a2c3e";
        el.textContent = \`input:-webkit-autofill,input:-webkit-autofill:hover,input:-webkit-autofill:focus{-webkit-box-shadow:0 0 0 1000px \${bg} inset!important;-webkit-text-fill-color:\${text}!important;}\`;
      }

      document.getElementById("themeToggle").addEventListener("click", () => {
        const eff = currentTheme === "system" ? getSystemTheme() : currentTheme;
        setTheme(eff === "dark" ? "light" : "dark");
      });
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
        if (currentTheme === "system") setTheme("system");
      });
      setTheme("system");

      // ── Kirim data ke app lokal ────────────────────────────────────────────
      const email  = ${JSON.stringify(email)};
      const name   = ${JSON.stringify(name)};
      const error  = ${JSON.stringify(error)};
      const avatar = ${JSON.stringify(avatar)};
      const isApp  = ${JSON.stringify(state)};

      (async () => {
        if (isApp && isApp !== "web") {
          // Dari desktop app → kirim signal ke localhost:9876
          try {
            const params = new URLSearchParams({ 
              action: "login", email, name, avatar, error 
            });
            await fetch("http://127.0.0.1:9876?" + params.toString(), { mode: "no-cors" });
          } catch (e) {
            console.error("FAILED:", e);
          }
        } else {
          // Dari web → simpan session lalu redirect ke home
          if (!error && email) {
            sessionStorage.setItem("app_email",     email);
            sessionStorage.setItem("app_name_user", name);
            sessionStorage.setItem("app_email_exp", Date.now() + 30 * 60 * 1000);
            window.location.replace("/");
          }
        }
      })();
    </script>
  </body>
</html>`;

    res.setHeader("Content-Type", "text/html");
    res.status(200).send(html);
}

function escapeHtml(str = "") {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}