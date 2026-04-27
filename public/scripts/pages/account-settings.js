// --- ACCOUNT STATE ---
let isGoogleConnected = false, googleEmail = "";
let isFacebookConnected = false, facebookEmail = "";
let currentEmail = "";

function updateEmailFromData(email) {
  if (email && email !== '{userEmail}') {
    currentEmail = email;
    googleEmail = email;

    const displayEmail = document.getElementById("displayEmail");
    if (displayEmail) displayEmail.textContent = currentEmail;

    const menuEmail = document.getElementById("menuEmail");
    if (menuEmail) menuEmail.textContent = currentEmail;

    const chipEmail = document.getElementById("chipEmail");
    if (chipEmail) chipEmail.textContent = currentEmail;

    const initial = currentEmail.charAt(0).toUpperCase();
    const menuAvatar = document.getElementById("menuAvatar");
    if (menuAvatar) menuAvatar.textContent = initial;

    const chipAvatar = document.getElementById("chipAvatar");
    if (chipAvatar) chipAvatar.textContent = initial;

    updateGoogleUI();

    console.log('Email synced from backend:', currentEmail);
  }
}

function updateGoogleUI() {
  const btn = document.getElementById("disconnectGoogleBtn");
  const status = document.getElementById("googleStatus");
  if (isGoogleConnected) {
    if (status) status.textContent = "Connected to " + googleEmail;
    if (btn) {
      btn.innerHTML = "<span>Disconnect</span>";
      btn.className = "btn-disconnect";
    }
  } else {
    if (status) status.textContent = "Not connected";
    if (btn) {
      btn.textContent = "+ Connect";
      btn.className = "btn-connect";
    }
  }
}

function updateFacebookUI() {
  const btn = document.getElementById("connectFacebookBtn");
  const status = document.getElementById("facebookStatus");
  if (isFacebookConnected) {
    if (status) status.textContent = "Connected to " + (facebookEmail || "facebook@example.com");
    if (btn) {
      btn.innerHTML = "<span>Disconnect</span>";
      btn.className = "btn-disconnect";
    }
  } else {
    if (status) status.textContent = "Not connected";
    if (btn) {
      btn.textContent = "+ Connect";
      btn.className = "btn-connect";
    }
  }
}

const ACCOUNT_SETTINGS_HTML = `
<h1 class="page-title" id="pageTitle">Account Management</h1>
<div class="tabs">
  <button class="tab-btn active" onclick="switchTab('account')">Account details</button>
  <button class="tab-btn" onclick="switchTab('mfa')">Multi-factor authentication (MFA)</button>
</div>
<div id="tab-account">
  <div class="card">
    <div class="detail-row">
      <div class="detail-left">
        <div class="detail-label">Email address</div>
        <div class="detail-value" id="displayEmail">{userEmail}</div>
      </div>
      <button class="btn-outline" id="changeEmailBtn">Change email</button>
    </div>
    <div class="detail-row">
      <div class="detail-left">
        <div class="detail-label">Password</div>
        <div class="detail-hint">Never share your password with anyone.</div>
      </div>
      <button class="btn-outline" id="changePasswordBtn">Change password</button>
    </div>
  </div>
  <p class="section-label">Connected accounts</p>
  <div class="card">
    <div class="connected-item">
      <div class="provider-row">
        <div class="provider-icon"><img src="/assets/images/google.svg" alt="Google" /></div>
        <div class="provider-name">Google</div>
        <div class="provider-status" id="googleStatus">Connected to {userEmail}</div>
      </div>
      <button class="btn-disconnect" id="disconnectGoogleBtn"><span>Disconnect</span></button>
    </div>
    <div class="connected-item">
      <div class="provider-row">
        <div class="provider-icon"><img src="/assets/images/facebook.svg" alt="Facebook" /></div>
        <div class="provider-name">Facebook</div>
        <div class="provider-status" id="facebookStatus">Not connected</div>
      </div>
      <button class="btn-connect" id="connectFacebookBtn">+ Connect</button>
    </div>
  </div>
  <p class="section-label">Account deletion</p>
  <div class="card">
    <div class="delete-row">
      <div class="detail-left">
        <div class="detail-label">Delete your account</div>
        <div class="detail-hint">Before deleting your account, you will need to verify your email address and agree to the account termination.</div>
      </div>
      <button class="btn-delete" id="deleteAccountBtn">Delete account</button>
    </div>
  </div>
</div>
<div id="tab-mfa" style="display: none">
  <div class="mfa-warning">
    <div class="warning-icon">
    </div>
    <span>Multi-factor authentication (MFA) is not enabled. Enable it now to protect your account.</span>
  </div>
  <div class="mfa-layout">
    <div class="mfa-main">
      <div class="card">
        <div class="detail-row">
          <div class="detail-left">
            <div class="detail-label">Multi-factor authentication (MFA)</div>
            <div class="mfa-status-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="14" height="14">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              OFF
            </div>
          </div>
          <button class="btn-outline" onclick="showToast('Manage MFA')">Manage MFA</button>
        </div>
      </div>
    </div>
    <div class="mfa-faq-sidebar">
      <p class="section-label">FAQ</p>
        <div class="faq-list">
          <div class="faq-item">
            <div class="faq-question" onclick="toggleFaq(this)">
              <span>What is multi-factor authentication (MFA)?</span>
              <svg class="faq-chevron" viewBox="0 0 24 24"><path fill="currentColor"
                  d="M18.53 9.53a.75.75 0 0 0 0-1.06H5.47a.75.75 0 0 0 0 1.06l6 6a.75.75 0 0 0 1.06 0z"/>
              </svg>
            </div>
            <div class="faq-answer">
              MFA adds an extra layer of security. In addition to your password, you'll provide a one-time code from an authenticator app each time you sign in.
            </div>
          </div>
          <div class="faq-item">
            <div class="faq-question" onclick="toggleFaq(this)">
              <span>What apps can I use for multi-factor authentication (MFA)?</span>
              <svg class="faq-chevron" viewBox="0 0 24 24"><path fill="currentColor"
                  d="M18.53 9.53a.75.75 0 0 0 0-1.06H5.47a.75.75 0 0 0 0 1.06l6 6a.75.75 0 0 0 1.06 0z"/>
              </svg>
            </div>
            <div class="faq-answer">
              Any TOTP-compatible app works: Google Authenticator, Microsoft Authenticator, Authy, or 1Password — available on iOS and Android.
            </div>
          </div>
          <div class="faq-item">
            <div class="faq-question" onclick="toggleFaq(this)">
              <span>How do I disable MFA?</span>
              <svg class="faq-chevron" viewBox="0 0 24 24"><path fill="currentColor"
                  d="M18.53 9.53a.75.75 0 0 0 0-1.06H5.47a.75.75 0 0 0 0 1.06l6 6a.75.75 0 0 0 1.06 0z"/>
              </svg>
            </div>
            <div class="faq-answer">
              Click "Manage MFA" and follow the steps to remove your authenticator. You'll be asked to verify your identity first.
            </div>
          </div>
          <div class="faq-item">
            <div class="faq-question" onclick="toggleFaq(this)">
              <span>What if I lose my MFA device?</span>
              <svg class="faq-chevron" viewBox="0 0 24 24"><path fill="currentColor"
                  d="M18.53 9.53a.75.75 0 0 0 0-1.06H5.47a.75.75 0 0 0 0 1.06l6 6a.75.75 0 0 0 1.06 0z"/>
              </svg>
            </div>
            <div class="faq-answer">
              Use one of your backup codes to sign in, then set up MFA on your new device from the Manage MFA section.
            </div>
          </div>
          <div class="faq-item">
            <div class="faq-question" onclick="toggleFaq(this)">
              <span>What if I lose my MFA device and can't access my backup codes?</span>
              <svg class="faq-chevron" viewBox="0 0 24 24"><path fill="currentColor"
                  d="M18.53 9.53a.75.75 0 0 0 0-1.06H5.47a.75.75 0 0 0 0 1.06l6 6a.75.75 0 0 0 1.06 0z"/>
              </svg>
            </div>
            <div class="faq-answer">
              Contact our support team. They'll verify your identity and help you regain access to your account.
            </div>
          </div>
          <div class="faq-item">
            <div class="faq-question" onclick="toggleFaq(this)">
              <span>Will I be informed when an MFA method is added or removed?</span>
              <svg class="faq-chevron" viewBox="0 0 24 24"><path fill="currentColor"
                  d="M18.53 9.53a.75.75 0 0 0 0-1.06H5.47a.75.75 0 0 0 0 1.06l6 6a.75.75 0 0 0 1.06 0z"/>
              </svg>
            </div>
            <div class="faq-answer">
              Yes. We'll send an email notification to your account address whenever an MFA method is added or removed.
            </div>
          </div>
          <div class="faq-item">
            <div class="faq-question" onclick="toggleFaq(this)">
              <span>I am running out of backup codes. What should I do?</span>
              <svg class="faq-chevron" viewBox="0 0 24 24"><path fill="currentColor"
                  d="M18.53 9.53a.75.75 0 0 0 0-1.06H5.47a.75.75 0 0 0 0 1.06l6 6a.75.75 0 0 0 1.06 0z"/>
              </svg>
            </div>
            <div class="faq-answer">
              Generate a new set from the "Manage MFA" section. Note: new codes will invalidate all previously issued backup codes.
            </div>
          </div>
        </div>
    </div>
  </div>
</div>
`;

// --- ACCOUNT SETTINGS HTML CONTENT (Template) ---
function fetchAccountSettingsHTML() {
  return Promise.resolve(ACCOUNT_SETTINGS_HTML);
}

// --- INIT ACCOUNT SETTINGS EVENTS ---
function initAccountSettingsEvents() {
  const resolvedEmail    = Navigate.getEmail();
  const resolvedIsGoogle = (window.AppPrefill?.isGoogle) ||
    sessionStorage.getItem("is_google") === "1";

  if (resolvedEmail) {
    currentEmail = resolvedEmail;
    googleEmail  = resolvedEmail;
    isGoogleConnected = resolvedIsGoogle;

    const displayEmail = document.getElementById("displayEmail");
    if (displayEmail) displayEmail.textContent = resolvedEmail;

    const chipEmail = document.getElementById("chipEmail");
    if (chipEmail) chipEmail.textContent = resolvedEmail;

    const menuEmail = document.getElementById("menuEmail");
    if (menuEmail) menuEmail.textContent = resolvedEmail;

    const initial = resolvedEmail.charAt(0).toUpperCase();
    const chipAvatar = document.getElementById("chipAvatar");
    if (chipAvatar) chipAvatar.textContent = initial;
    const menuAvatar = document.getElementById("menuAvatar");
    if (menuAvatar) menuAvatar.textContent = initial;
  }

  const disconnectBtn = document.getElementById("disconnectGoogleBtn");
  const connectFbBtn = document.getElementById("connectFacebookBtn");
  const changeEmailBtn = document.getElementById("changeEmailBtn");
  const changePasswordBtn = document.getElementById("changePasswordBtn");
  const deleteAccountBtn = document.getElementById("deleteAccountBtn");

  if (disconnectBtn) {
    const newBtn = disconnectBtn.cloneNode(true);
    disconnectBtn.parentNode.replaceChild(newBtn, disconnectBtn);
    newBtn.addEventListener("click", function () {
      if (isGoogleConnected) {
        isGoogleConnected = false;
        googleEmail = "";
        updateGoogleUI();
        showToast("Akun Google diputuskan.");
      } else {
        let email = prompt("Hubungkan akun Google\nMasukkan email:", "user@gmail.com");
        if (email && email.trim()) {
          isGoogleConnected = true;
          googleEmail = email.trim();
          updateGoogleUI();
          showToast("Google terhubung sebagai " + googleEmail);
        } else showToast("Dibatalkan", true);
      }
    });
  }

  if (connectFbBtn) {
    const newBtn = connectFbBtn.cloneNode(true);
    connectFbBtn.parentNode.replaceChild(newBtn, connectFbBtn);
    newBtn.addEventListener("click", function () {
      if (isFacebookConnected) {
        isFacebookConnected = false;
        facebookEmail = "";
        updateFacebookUI();
        showToast("Facebook diputuskan.");
      } else {
        let email = prompt("Hubungkan Facebook\nEmail:", "user@facebook.com");
        if (email && email.trim()) {
          isFacebookConnected = true;
          facebookEmail = email.trim();
          updateFacebookUI();
          showToast("Facebook terhubung (" + facebookEmail + ")");
        } else showToast("Dibatalkan", true);
      }
    });
  }

  if (changeEmailBtn) {
    const newBtn = changeEmailBtn.cloneNode(true);
    changeEmailBtn.parentNode.replaceChild(newBtn, changeEmailBtn);
    newBtn.addEventListener("click", function () {
      let newEmail = prompt("Ubah email", currentEmail);
      if (newEmail && newEmail.includes("@") && confirm("Verifikasi ke " + newEmail + "?")) {
        currentEmail = newEmail.trim();
        const displayEmail = document.getElementById("displayEmail");
        if (displayEmail) displayEmail.textContent = currentEmail;
        const menuEmail = document.getElementById("menuEmail");
        if (menuEmail) menuEmail.textContent = currentEmail;
        const menuAvatar = document.getElementById("menuAvatar");
        if (menuAvatar) menuAvatar.textContent = currentEmail[0].toUpperCase();
        const chipEmail = document.getElementById("chipEmail");
        if (chipEmail) chipEmail.textContent = currentEmail;
        const chipAvatar = document.getElementById("chipAvatar");
        if (chipAvatar) chipAvatar.textContent = currentEmail[0].toUpperCase();
        showToast("Email diperbarui menjadi " + currentEmail);
      } else if (newEmail && !newEmail.includes("@")) showToast("Email tidak valid", true);
    });
  }

  if (changePasswordBtn) {
    const newBtn = changePasswordBtn.cloneNode(true);
    changePasswordBtn.parentNode.replaceChild(newBtn, changePasswordBtn);
    newBtn.addEventListener("click", () => ChangePassword.open());
  }

  if (deleteAccountBtn) {
    const newBtn = deleteAccountBtn.cloneNode(true);
    deleteAccountBtn.parentNode.replaceChild(newBtn, deleteAccountBtn);
    newBtn.addEventListener("click", function () {
      let v = prompt("Verifikasi email:", currentEmail);
      if (v === currentEmail && confirm("Hapus akun secara permanen?"))
        showToast("Permintaan penghapusan akun dikirimkan.");
      else showToast("Dibatalkan", true);
    });
  }

  updateGoogleUI();
  updateFacebookUI();

  if (typeof window.showLoadingPlaceholders === 'function') {
    window.showLoadingPlaceholders();
  }
}

// --- TAB SWITCHING ---
function switchTab(tab) {
  const tabAccount = document.getElementById("tab-account");
  const tabMfa = document.getElementById("tab-mfa");
  const settingsPanel = document.getElementById("panel-account-settings");
  const tabBtns = (settingsPanel || document).querySelectorAll(".tab-btn");

  if (tabAccount) tabAccount.style.display = tab === "account" ? "block" : "none";
  if (tabMfa) tabMfa.style.display = tab === "mfa" ? "block" : "none";

  tabBtns.forEach((btn, i) => {
    btn.classList.toggle(
      "active",
      (tab === "account" && i === 0) || (tab === "mfa" && i === 1)
    );
  });

  const appName = window.AppSettings?.app_name || sessionStorage.getItem("app_name") || "App";
  const pageTitle = document.getElementById("pageTitle");

  if (tab === "mfa") {
    document.title = `Account Security | ${appName} Account`;
    window.history.replaceState({ tab: "mfa" }, "", "/account-settings/account-security/mfa");
    if (pageTitle) pageTitle.textContent = "Account Security";
  } else {
    document.title = `Account Management | ${appName} Account`;
    window.history.replaceState({ tab: "account" }, "", "/account-settings/account-management");
    if (pageTitle) pageTitle.textContent = "Account Management";
  }
}

// --- FAQ TOGGLING ---
function toggleFaq(element) {
  const faqItem = element.closest(".faq-item");
  if (faqItem) faqItem.classList.toggle("open");
}

// --- EXPOSE GLOBAL FUNCTIONS ---
// initChipState, updateActiveMenu, navigateTo dll. sudah ada di navigate.js
window.updateEmailFromData       = updateEmailFromData;
window.fetchAccountSettingsHTML  = fetchAccountSettingsHTML;
window.initAccountSettingsEvents = initAccountSettingsEvents;
window.switchTab                 = switchTab;
window.toggleFaq                 = toggleFaq;

// --- INITIALIZE ON DOM READY ---
document.addEventListener("DOMContentLoaded", () => {
  console.log("[account-settings] initialized");
  // Burger menu, sidebar nav, chip popup, routing — ditangani navigate.js
});