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
          <span class="icon icon-logo"></span>
        </div>
        <span class="brand-name">${appName}</span>
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
            <a href="#" class="navigate-link refer">terms and conditions</a>.
          </p>
        </div>

        <!-- Illustration -->
        <div class="refer-hero-illustration">
          <img src="/assets/images/invite_friend.svg" alt="Invite Friend" />
        </div>
      </div>

      <hr class="refer-divider"/>

      <!-- How it works -->
      <div class="refer-how">
        <h3 class="refer-how-title">How it works</h3>
        <div class="refer-steps">

          <div class="refer-step">
            <div class="refer-step-icon">
              <span class="icon icon-add-friend"></span>
            </div>
            <div class="refer-step-connector" aria-hidden="true"></div>
            <div class="refer-step-body">
              <div class="refer-step-title">Invite your friend to join</div>
              <div class="refer-step-desc">They sign up using the shared link and choose a plan.</div>
            </div>
          </div>

          <div class="refer-step">
            <div class="refer-step-icon">
              <span class="icon icon-time"></span>
            </div>
            <div class="refer-step-connector" aria-hidden="true"></div>
            <div class="refer-step-body">
              <div class="refer-step-title">Wait for the purchase</div>
              <div class="refer-step-desc">Your friend uses your referral link when buying a ${appName} subscription.</div>
            </div>
          </div>

          <div class="refer-step">
            <div class="refer-step-icon">
              <span class="icon icon-gift"></span>
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
           <span class="icon icon-gift"></span>
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
            <span class="icon icon-chevron faq-chevron"></span>
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

  item.closest(".faq-list")?.querySelectorAll(".faq-item.open").forEach(i => i.classList.remove("open"));

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
});