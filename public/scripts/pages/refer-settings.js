function getReferralLink() {
  return (
    window.AppPrefill?.referralLink ||
    sessionStorage.getItem("referral_link") ||
    localStorage.getItem("referral_link") ||
    "https://refer-example.com/xxxxxxxx"
  );
}

function getReferTotalMonths() {
  return (
    window.AppPrefill?.referMonths ||
    sessionStorage.getItem("refer_months") ||
    localStorage.getItem("refer_months") ||
    "0"
  );
}

function getReferActiveUntil() {
  return (
    window.AppPrefill?.activeUntil ||
    sessionStorage.getItem("active_until") ||
    localStorage.getItem("active_until") ||
    ""
  );
}

function injectReferStyles() {
  if (document.getElementById("refer-inapp-styles")) return;
  const link = document.createElement("link");
  link.id   = "refer-inapp-styles";
  link.rel  = "stylesheet";
  link.href = "/css/refer.css";
  document.head.appendChild(link);
}

// ============================================================
// FAQ DATA
// ============================================================

const REFER_FAQ_ITEMS = [
  {
    q: "How does the referral program work?",
    a: "Share your unique referral link with a friend. When they sign up and purchase a plan using your link, you both get free months added to your subscription."
  },
  {
    q: "Can I refer friends who've used the app before?",
    a: "The referral program is intended for new users only. Friends who already have or previously had a subscription are not eligible."
  },
  {
    q: "Is there a limit to how many referrals I can make?",
    a: "There is no limit! You can refer as many friends as you like and earn free months for each successful referral."
  },
  {
    q: "How will I know my referral's been successful?",
    a: "You'll receive an email confirmation once your friend completes their purchase. Your free months will be added automatically."
  }
];

// ============================================================
// HTML TEMPLATE
// ============================================================

function getReferPageHTML() {
  const appName     = Navigate.getAppName();
  const refLink     = getReferralLink();
  const months      = getReferTotalMonths();
  const activeUntil = getReferActiveUntil();

  const activeUntilHTML = activeUntil
    ? `<p class="refer-side-active">Your ${appName} is now active until <strong>${activeUntil}</strong></p>`
    : "";

  return `
<h1 class="page-title">Refer a friend</h1>

<div class="refer-layout">

  <!-- ── MAIN CARD ── -->
  <div class="refer-main">
    <div class="card refer-card">

      <!-- Brand row -->
      <div class="refer-brand-row">
        <div class="refer-brand-logo">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <defs><style>.cls-1{fill:currentColor;}</style></defs>
            <g id="brand">
              <path class="cls-1" d="M19,5.4c-1.8-1.9-4.2-3-7-3s-5.2,1.1-6.9,2.9l7.1,2.6,6.8-2.5Z"/>
              <path class="cls-1" d="M20.6,7.8C20.9,7.1 20.8,6.2 20.3,5.8L12.1,8.8 3.8,5.7C3.3,6.1 3.2,6.9 3.4,7.6C2.7,8.9 2.3,10.4 2.3,12C2.3,17.3 6.6,21.6 11.9,21.6C17.2,21.6 21.5,17.3 21.5,12C21.5,9.608 20.6,7.8 20.6,7.8 ZM16,16.2C14.9,16.2 13.9,15.8 13.1,15.2L12.1,17.4 11,15.2C10.2,15.9 9.2,16.3 8.1,16.3C5.6,16.3 3.5,14.3 3.5,11.7C3.5,10.417 3.9,9.6 4.5,8.8L7.4,9.7C6.8,10 6.3,10.6 6.3,11.4C6.3,12.2 7.1,13.3 8.2,13.3C9.3,13.3 10.1,12.5 10.1,11.4C10.1,10.986 10,10.7 9.8,10.4L11.9,11 14.2,10.3C14,10.6 13.9,10.9 13.9,11.2C13.9,12.2 14.7,13.1 15.8,13.1C16.9,13.1 17.7,12.3 17.7,11.2C17.7,10.214 17.106,9.668 16.7,9.5L19.4,8.7C20.1,9.5 20.4,10.5 20.4,11.6C20.4,14.1 18.4,16.2 15.8,16.2Z"/>
            </g>
          </svg>
        </div>
        <span class="refer-brand-name">${appName}</span>
      </div>

      <!-- Hero -->
      <div class="refer-hero">
        <div class="refer-hero-text">
          <h2 class="refer-hero-title">Get 3 months free instantly for a successful referral</h2>
          <p class="refer-hero-sub">Share the link with a friend</p>

          <!-- Referral link input -->
          <div class="refer-link-row">
            <div class="refer-link-input" id="referLinkDisplay">${refLink}</div>
            <button class="btn-primary-blue refer-copy-btn" id="referCopyBtn" onclick="referCopyLink()">
              Copy link
            </button>
          </div>

          <p class="refer-terms">
            By sharing the referral link, you agree to our Refer a Friend program's
            <a href="#" class="refer-terms-link">terms and conditions</a>.
          </p>
        </div>

        <!-- Illustration -->
        <div class="refer-hero-illustration" aria-hidden="true">
          <svg viewBox="0 0 160 140" width="160" height="140" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="80" cy="70" r="65" fill="var(--refer-illus-bg, #dde3f7)"/>
            <circle cx="52" cy="50" r="16" fill="#7986cb"/>
            <path d="M28 105c0-13 11-21 24-21s24 8 24 21" fill="#5c6bc0"/>
            <circle cx="108" cy="50" r="16" fill="#a5b4c8"/>
            <path d="M84 105c0-13 11-21 24-21s24 8 24 21" fill="#8fa0b4"/>
            <circle cx="80" cy="44" r="19" fill="#fff" stroke="var(--refer-illus-bg, #dde3f7)" stroke-width="3"/>
            <circle cx="80" cy="44" r="16" fill="#9fa8da"/>
            <path d="M54 108c0-14 12-23 26-23s26 9 26 23" fill="#7986cb"/>
            <rect x="62" y="78" width="36" height="28" rx="3" fill="#ffd54f"/>
            <rect x="62" y="75" width="36" height="9" rx="2" fill="#ffb300"/>
            <line x1="80" y1="75" x2="80" y2="106" stroke="#ff8f00" stroke-width="2.5"/>
            <path d="M80 75 C76 70 70 72 72 76 C74 80 80 75 80 75Z" fill="#ef9a9a"/>
            <path d="M80 75 C84 70 90 72 88 76 C86 80 80 75 80 75Z" fill="#ef9a9a"/>
          </svg>
        </div>
      </div>

      <hr class="refer-divider"/>

      <!-- How it works -->
      <div class="refer-how">
        <h3 class="refer-how-title">How it works</h3>
        <div class="refer-steps">

          <div class="refer-step">
            <div class="refer-step-icon refer-step-icon--blue">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <line x1="19" y1="8" x2="19" y2="14"/>
                <line x1="22" y1="11" x2="16" y2="11"/>
              </svg>
            </div>
            <div class="refer-step-connector" aria-hidden="true"></div>
            <div class="refer-step-body">
              <div class="refer-step-title">Invite your friend to join</div>
              <div class="refer-step-desc">They sign up using the shared link and choose a plan.</div>
            </div>
          </div>

          <div class="refer-step">
            <div class="refer-step-icon refer-step-icon--blue">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div class="refer-step-connector" aria-hidden="true"></div>
            <div class="refer-step-body">
              <div class="refer-step-title">Wait for the purchase</div>
              <div class="refer-step-desc">Your friend uses your referral link when buying a ${appName} subscription.</div>
            </div>
          </div>

          <div class="refer-step">
            <div class="refer-step-icon refer-step-icon--blue">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 12 20 22 4 22 4 12"/>
                <rect x="2" y="7" width="20" height="5"/>
                <line x1="12" y1="22" x2="12" y2="7"/>
                <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
                <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
              </svg>
            </div>
            <div class="refer-step-body">
              <div class="refer-step-title">Get your 3 months free right away</div>
              <div class="refer-step-desc">Your friend instantly gets their 1 or 3 months depending on the purchased plan.</div>
            </div>
          </div>

        </div>
      </div>

    </div><!-- /.refer-card -->
  </div><!-- /.refer-main -->

  <!-- ── SIDEBAR ── -->
  <div class="refer-sidebar">

    <!-- Your rewards card -->
    <div class="refer-rewards-card">
      <div class="refer-rewards-header">Your rewards</div>
      <div class="refer-rewards-body">
        <div class="refer-rewards-row">
          <div class="refer-rewards-icon">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 12 20 22 4 22 4 12"/>
              <rect x="2" y="7" width="20" height="5"/>
              <line x1="12" y1="22" x2="12" y2="7"/>
              <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
              <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
            </svg>
          </div>
          <div>
            <div class="refer-rewards-label">Total months rewarded</div>
            <div class="refer-rewards-value">${months} months</div>
          </div>
        </div>
        ${activeUntilHTML}
      </div>
    </div>

    <!-- FAQ card -->
    <div class="refer-faq-card">
      <p class="section-label">FAQ</p>
      <div class="faq-list">
        ${REFER_FAQ_ITEMS.map(item => `
        <div class="faq-item">
          <div class="faq-question" onclick="referToggleFaq(this)">
            <span>${item.q}</span>
            <svg class="faq-chevron" viewBox="0 0 24 24"><path fill="currentColor"
                d="M18.53 9.53a.75.75 0 0 0 0-1.06H5.47a.75.75 0 0 0 0 1.06l6 6a.75.75 0 0 0 1.06 0z"/>
            </svg>
          </div>
          <div class="faq-answer">${item.a}</div>
        </div>`).join("")}
      </div>
    </div>

  </div><!-- /.refer-sidebar -->

</div><!-- /.refer-layout -->
`;
}

// ============================================================
// EVENTS & INTERACTIONS
// ============================================================

function referCopyLink() {
  const link = getReferralLink();
  navigator.clipboard.writeText(link).then(() => {
    const btn = document.getElementById("referCopyBtn");
    if (btn) {
      btn.textContent = "Copied!";
      btn.classList.add("refer-copy-btn--copied");
      setTimeout(() => {
        btn.textContent = "Copy link";
        btn.classList.remove("refer-copy-btn--copied");
      }, 2000);
    }
    if (typeof showToast === "function") showToast("Referral link copied!");
  }).catch(() => {
    if (typeof showToast === "function") showToast("Failed to copy link");
  });
}

function referToggleFaq(el) {
  const item = el.closest(".faq-item");
  if (!item) return;
  const isOpen = item.classList.contains("open");

  // Close all first
  item.closest(".faq-list")?.querySelectorAll(".faq-item.open").forEach(i => i.classList.remove("open"));

  // Toggle clicked
  if (!isOpen) item.classList.add("open");
}

function initReferPanel() {
  const panel = document.getElementById("panel-refer");
  if (!panel) return;

  if (!panel.dataset.loaded) {
    panel.innerHTML = getReferPageHTML();
    panel.dataset.loaded = "true";
  }
}

// ============================================================
// INIT on DOMContentLoaded
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  console.log("[refer-settings] initialized");
  // Routing + nav wiring ditangani oleh navigate.js
});