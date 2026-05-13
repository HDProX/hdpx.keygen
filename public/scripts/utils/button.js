(function () {
  /* ─────────────────────────────────────────
     THEME TOGGLE  (system → light → dark)
  ───────────────────────────────────────── */
  function getSystemDark() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function getSavedTheme() {
    return localStorage.getItem('theme');
  }

  function applyTheme(theme) {
    const isDark = theme === 'dark' || (theme === null && getSystemDark());
    document.body.classList.toggle('dark', isDark);
    if (theme !== null) localStorage.setItem('theme', theme);
    syncThemeButtons(isDark);
  }

  function syncThemeButtons(isDark) {
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      const icon = btn.querySelector('.icon-theme-icon');
      if (icon) {
        icon.className = 'icon icon-theme-icon';
        icon.classList.add(isDark ? 'icon-theme-light' : 'icon-theme-dark');
      }
      const label = btn.querySelector('.theme-label');
      btn.setAttribute('title', isDark ? 'Switch to Light' : 'Switch to Dark');
    });
  }

  function toggleTheme() {
    const isDark = document.body.classList.contains('dark');
    const next = isDark ? 'light' : 'dark';
    applyTheme(next);
  }

  function initTheme() {
    const saved = getSavedTheme();
    applyTheme(saved); // null → ikut system, 'light'/'dark' → pakai yang tersimpan
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.addEventListener('click', toggleTheme);
    });
    // Jika belum ada preferensi tersimpan, ikut perubahan OS secara real-time
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (getSavedTheme() === null) applyTheme(null);
    });
  }

  /* ─────────────────────────────────────────
     LANGUAGE WIDGET
  ───────────────────────────────────────── */
  const LANGUAGES = [
    { lang: 'en', label: 'English' },
    { lang: 'id', label: 'Bahasa Indonesia' },
    { lang: 'zh', label: '中文' },
    { lang: 'ja', label: '日本語' },
    { lang: 'kr', label: '한국어' },
    { lang: 'ru', label: 'Русский' },
  ];

  let currentLang = LANGUAGES[0];

  function buildLanguageWidget(wrapper) {
    wrapper.innerHTML = `
      <button class="language-btn" aria-haspopup="listbox" aria-expanded="false">
        <span class="icon icon-lang"></span>
        <span class="lang-label">${currentLang.label}</span>
        <span class="icon icon-chevron"></span>
      </button>
      <div class="language-dropdown" role="listbox">
        ${LANGUAGES.map(l => `
          <button class="lang-option ${l.lang === currentLang.lang ? 'active' : ''}"
            role="option" data-lang="${l.lang}" data-label="${l.label}">
            ${l.label}
          </button>
        `).join('')}
      </div>
    `;

    const btn      = wrapper.querySelector('.language-btn');
    const dropdown = wrapper.querySelector('.language-dropdown');

    btn.addEventListener('click', e => {
      e.stopPropagation();
      const isOpen = dropdown.classList.contains('open');
      closeAllDropdowns();
      if (!isOpen) {
        dropdown.classList.add('open');
        btn.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });

    wrapper.querySelectorAll('.lang-option').forEach(option => {
      option.addEventListener('click', () => {
        currentLang = { lang: option.dataset.lang, label: option.dataset.label };
        syncAllLanguageWidgets();
        closeAllDropdowns();
      });
    });
  }

  function closeAllDropdowns() {
    document.querySelectorAll('.language-dropdown.open').forEach(d => d.classList.remove('open'));
    document.querySelectorAll('.language-btn.open').forEach(b => {
      b.classList.remove('open');
      b.setAttribute('aria-expanded', 'false');
    });
  }

  function syncAllLanguageWidgets() {
    document.querySelectorAll('.language-wrapper').forEach(wrapper => {
      const label = wrapper.querySelector('.lang-label');
      if (label) label.textContent = currentLang.label;
      wrapper.querySelectorAll('.lang-option').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.lang === currentLang.lang);
      });
    });
  }

  function initLanguageWidgets() {
    document.querySelectorAll('.language-wrapper').forEach(w => buildLanguageWidget(w));
  }

  document.addEventListener('click', closeAllDropdowns);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAllDropdowns(); });

  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initLanguageWidgets();
  });

  window.LanguageWidget = { init: initLanguageWidgets };
  window.ThemeManager   = { apply: applyTheme };

  /* ─────────────────────────────────────────
     RIPPLE EFFECT
  ───────────────────────────────────────── */
  function createRipple(e) {
    const btn    = e.currentTarget;
    const circle = document.createElement("span");
    const rect   = btn.getBoundingClientRect();
    const size   = Math.max(rect.width, rect.height);
    circle.classList.add("ripple");
    circle.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${e.clientX - rect.left - size / 2}px;
      top: ${e.clientY - rect.top - size / 2}px;
    `;
    btn.appendChild(circle);
    circle.addEventListener("animationend", () => circle.remove());
  }

  function attachRipples(selector = ".btn-ripple") {
    document.querySelectorAll(selector).forEach(btn => {
      btn.addEventListener("click", createRipple);
    });
  }

  window.createRipple  = createRipple;
  window.attachRipples = attachRipples;
})();