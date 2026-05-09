(function () {
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
      <button class="language-btn">
        <span class="icon icon-lang"></span>
        <span class="lang-label">${currentLang.label}</span>
        <span class="icon icon-chevron-down btn-chev"></span>
      </button>
      <div class="language-dropdown">
        ${LANGUAGES.map(l => `
          <button class="lang-option ${l.lang === currentLang.lang ? 'active' : ''}"
            data-lang="${l.lang}" data-label="${l.label}">
            ${l.label}
          </button>
        `).join('')}
      </div>
    `;

    const btn = wrapper.querySelector('.language-btn');
    const dropdown = wrapper.querySelector('.language-dropdown');

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelectorAll('.language-dropdown.open').forEach(d => {
        if (d !== dropdown) d.classList.remove('open');
      });
      dropdown.classList.toggle('open');
      btn.classList.toggle('open');
    });

    wrapper.querySelectorAll('.lang-option').forEach(option => {
      option.addEventListener('click', () => {
        currentLang = { lang: option.dataset.lang, label: option.dataset.label };
        syncAllLanguageWidgets();
        dropdown.classList.remove('open');
        btn.classList.remove('open');
      });
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

  document.addEventListener('click', () => {
    document.querySelectorAll('.language-dropdown.open').forEach(d => d.classList.remove('open'));
    document.querySelectorAll('.language-btn.open').forEach(b => b.classList.remove('open'));
  });

  document.addEventListener('DOMContentLoaded', initLanguageWidgets);
  window.LanguageWidget = { init: initLanguageWidgets };
})();