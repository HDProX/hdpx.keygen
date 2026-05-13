// =============================================================================
// ACCOUNT SETTINGS
// Handles account state, UI updates, event binding, tab switching, and FAQ.
// Dependencies: navigate.js (Navigate), ChangePassword
// =============================================================================


// -----------------------------------------------------------------------------
// State
// -----------------------------------------------------------------------------

let isGoogleConnected   = false;
let googleEmail         = "";
let isFacebookConnected = false;
let facebookEmail       = "";
let currentEmail        = "";


// -----------------------------------------------------------------------------
// Email & Avatar Sync
// -----------------------------------------------------------------------------

/**
 * Syncs a new email address across all UI elements (display, chip, menu, avatars).
 * Also refreshes the Google connection UI. Skips unresolved template placeholders.
 *
 * @param {string} email - The email address to apply.
 */
function updateEmailFromData(email) {
  if (!email || email === "{userEmail}") return;

  currentEmail = email;
  googleEmail  = email;

  _setTextContent("displayEmail", email);
  _setTextContent("menuEmail",    email);
  _setTextContent("chipEmail",    email);

  const initial = email.charAt(0).toUpperCase();
  _setTextContent("menuAvatar", initial);
  _setTextContent("chipAvatar", initial);

  updateGoogleUI();

  console.log("[account-settings] Email synced:", email);
}

/**
 * Applies new email state to all relevant DOM elements after an in-page change.
 * Mirrors updateEmailFromData but does not re-assign googleEmail.
 *
 * @param {string} email - The updated email address.
 */
function _applyEmailToDOM(email) {
  _setTextContent("displayEmail", email);
  _setTextContent("menuEmail",    email);
  _setTextContent("chipEmail",    email);

  const initial = email.charAt(0).toUpperCase();
  _setTextContent("menuAvatar", initial);
  _setTextContent("chipAvatar", initial);
}


// -----------------------------------------------------------------------------
// Provider UI Updates
// -----------------------------------------------------------------------------

/** Refreshes the Google connection button and status label. */
function updateGoogleUI() {
  const btn    = document.getElementById("disconnectGoogleBtn");
  const status = document.getElementById("googleStatus");

  if (isGoogleConnected) {
    _setTextContent(status,  `Connected to ${googleEmail}`);
    _setHTML(btn, "<span>Disconnect</span>");
    _setClass(btn, "btn disconnect");
  } else {
    _setTextContent(status, "Not connected");
    _setHTML(btn, "<span class=\"icon icon-plus\"></span><span>Connect</span>");
    _setClass(btn, "btn connect");
  }
}

/** Refreshes the Facebook connection button and status label. */
function updateFacebookUI() {
  const btn    = document.getElementById("connectFacebookBtn");
  const status = document.getElementById("facebookStatus");

  if (isFacebookConnected) {
    _setTextContent(status, `Connected to ${facebookEmail || "facebook@example.com"}`);
    _setHTML(btn, "<span>Disconnect</span>");
    _setClass(btn, "btn disconnect");
  } else {
    _setTextContent(status, "Not connected");
    _setHTML(btn, "<span class=\"icon icon-plus\"></span><span>Connect</span>");
    _setClass(btn, "btn connect");
  }
}


// -----------------------------------------------------------------------------
// HTML Template
// -----------------------------------------------------------------------------

const ACCOUNT_SETTINGS_HTML = `
<h1 class="page-title" id="pageTitle">Account Management</h1>

<div class="tabs">
  <button class="tab-btn active" onclick="switchTab('account')">Account details</button>
  <button class="tab-btn"        onclick="switchTab('mfa')">Multi-factor authentication (MFA)</button>
</div>

<!-- Account Tab -->
<div id="tab-account">

  <div class="card">
    <div class="detail-row">
      <div class="detail-left">
        <div class="detail-label">Email address</div>
        <div class="detail-value" id="displayEmail">{userEmail}</div>
      </div>
      <button class="btn outline" id="changeEmailBtn">Change email</button>
    </div>
    <div class="detail-row">
      <div class="detail-left">
        <div class="detail-label">Password</div>
        <div class="detail-hint">Never share your password with anyone.</div>
      </div>
      <button class="btn outline" id="changePasswordBtn">Change password</button>
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
      <button class="btn disconnect" id="disconnectGoogleBtn"><span>Disconnect</span></button>
    </div>
    <div class="connected-item">
      <div class="provider-row">
        <div class="provider-icon"><img src="/assets/images/facebook.svg" alt="Facebook" /></div>
        <div class="provider-name">Facebook</div>
        <div class="provider-status" id="facebookStatus">Not connected</div>
      </div>
      <button class="btn connect" id="connectFacebookBtn">
      <span class="icon icon-plus"></span>
      <span>Connect</span>
      </button>
    </div>
  </div>

  <p class="section-label">Account deletion</p>

  <div class="card">
    <div class="delete-row">
      <div class="detail-left">
        <div class="detail-label">Delete your account</div>
        <div class="detail-hint">
          Before deleting your account, you will need to verify your email address
          and agree to the account termination.
        </div>
      </div>
      <button class="btn delete" id="deleteAccountBtn">Delete account</button>
    </div>
  </div>

</div>

<!-- MFA Tab -->
<div id="tab-mfa" style="display:none">

  <div class="mfa-warning">
    <div class="icon icon-warning"></div>
    <span>Multi-factor authentication (MFA) is not enabled. Enable it now to protect your account.</span>
  </div>

  <div class="mfa-layout">

    <div class="mfa-main">
      <div class="card">
        <div class="detail-row">
          <div class="detail-left">
            <div class="detail-label">Multi-factor authentication (MFA)</div>
            <div class="mfa-status-badge">
              <span class="icon icon-close"></span>
              OFF
            </div>
          </div>
          <button class="btn outline" id="manageMfaBtn">Manage MFA</button>
        </div>
      </div>
    </div>

    <div class="mfa-faq-sidebar">
      <p class="section-label">FAQ</p>
      <div class="faq-list">

        <div class="faq-item">
          <div class="faq-question" onclick="toggleFaq(this)">
            <span>What is multi-factor authentication (MFA)?</span>
            <span class="icon icon-chevron faq-chevron"></span>
          </div>
          <div class="faq-answer">
            MFA adds an extra layer of security. In addition to your password, you'll provide
            a one-time code from an authenticator app each time you sign in.
          </div>
        </div>

        <div class="faq-item">
          <div class="faq-question" onclick="toggleFaq(this)">
            <span>What apps can I use for multi-factor authentication (MFA)?</span>
            <span class="icon icon-chevron faq-chevron"></span>
          </div>
          <div class="faq-answer">
            Any TOTP-compatible app works: Google Authenticator, Microsoft Authenticator,
            Authy, or 1Password — available on iOS and Android.
          </div>
        </div>

        <div class="faq-item">
          <div class="faq-question" onclick="toggleFaq(this)">
            <span>How do I disable MFA?</span>
            <span class="icon icon-chevron faq-chevron"></span>
          </div>
          <div class="faq-answer">
            Click "Manage MFA" and follow the steps to remove your authenticator.
            You'll be asked to verify your identity first.
          </div>
        </div>

        <div class="faq-item">
          <div class="faq-question" onclick="toggleFaq(this)">
            <span>What if I lose my MFA device?</span>
            <span class="icon icon-chevron faq-chevron"></span>
          </div>
          <div class="faq-answer">
            Use one of your backup codes to sign in, then set up MFA on your new device
            from the Manage MFA section.
          </div>
        </div>

        <div class="faq-item">
          <div class="faq-question" onclick="toggleFaq(this)">
            <span>What if I lose my MFA device and can't access my backup codes?</span>
            <span class="icon icon-chevron faq-chevron"></span>
          </div>
          <div class="faq-answer">
            Contact our support team. They'll verify your identity and help you regain access.
          </div>
        </div>

        <div class="faq-item">
          <div class="faq-question" onclick="toggleFaq(this)">
            <span>Will I be notified when an MFA method is added or removed?</span>
            <span class="icon icon-chevron faq-chevron"></span>
          </div>
          <div class="faq-answer">
            Yes. We'll send an email notification to your account address whenever
            an MFA method is added or removed.
          </div>
        </div>

        <div class="faq-item">
          <div class="faq-question" onclick="toggleFaq(this)">
            <span>I am running out of backup codes. What should I do?</span>
            <span class="icon icon-chevron faq-chevron"></span>
          </div>
          <div class="faq-answer">
            Generate a new set from the "Manage MFA" section. Note: new codes will
            invalidate all previously issued backup codes.
          </div>
        </div>

      </div>
    </div>

  </div>
</div>
`;


// -----------------------------------------------------------------------------
// HTML Loader
// -----------------------------------------------------------------------------

/** Returns the account settings HTML template as a resolved Promise. */
function fetchAccountSettingsHTML() {
  return Promise.resolve(ACCOUNT_SETTINGS_HTML);
}


// -----------------------------------------------------------------------------
// Event Initialisation
// -----------------------------------------------------------------------------

/**
 * Resolves the current user's email and Google status, populates the UI,
 * and attaches all button event listeners.
 *
 * Call this after the account settings HTML has been injected into the DOM.
 */
function initAccountSettingsEvents() {
  const resolvedEmail    = Navigate.getEmail();
  const resolvedIsGoogle = window.AppPrefill?.isGoogle ||
                           sessionStorage.getItem("is_google") === "1";

  // Populate email & avatar fields if a real email is available
  if (resolvedEmail) {
    currentEmail      = resolvedEmail;
    googleEmail       = resolvedEmail;
    isGoogleConnected = resolvedIsGoogle;
    _applyEmailToDOM(resolvedEmail);
  }

  // Bind each button, cloning to remove any stale listeners
  _bindButton("disconnectGoogleBtn",  _onGoogleToggle);
  _bindButton("connectFacebookBtn",   _onFacebookToggle);
  _bindButton("changeEmailBtn",       _onChangeEmail);
  _bindButton("changePasswordBtn",    _onChangePassword);
  _bindButton("deleteAccountBtn",     _onDeleteAccount);
  _bindButton("manageMfaBtn",         _onManageMfa, /* skipClone */ true);

  updateGoogleUI();
  updateFacebookUI();

  if (typeof window.showLoadingPlaceholders === "function") {
    window.showLoadingPlaceholders();
  }
}


// -----------------------------------------------------------------------------
// Button Handlers
// -----------------------------------------------------------------------------

function _onGoogleToggle(e) {
  if (!isGoogleConnected) {
    const email = prompt("Connect Google Account\nEnter your email:", "user@gmail.com");
    if (email?.trim()) {
      isGoogleConnected = true;
      googleEmail       = email.trim();
      updateGoogleUI();
      showToast(`Google connected as ${googleEmail}`);
    } else {
      showToast("Cancelled", true);
    }
  } else {
    isGoogleConnected = false;
    googleEmail       = "";
    updateGoogleUI();
    showToast("Google account disconnected.");
  }
}

function _onFacebookToggle(e) {
  if (isFacebookConnected) {
    isFacebookConnected = false;
    facebookEmail       = "";
    updateFacebookUI();
    showToast("Facebook account disconnected.");
  } else {
    const email = prompt("Connect Facebook Account\nEnter your email:", "user@facebook.com");
    if (email?.trim()) {
      isFacebookConnected = true;
      facebookEmail       = email.trim();
      updateFacebookUI();
      showToast(`Facebook connected as ${facebookEmail}`);
    } else {
      showToast("Cancelled", true);
    }
  }
}

function _onChangeEmail(e) {
  const newEmail = prompt("Change Email", currentEmail);
  if (!newEmail) return;

  if (!newEmail.includes("@")) {
    showToast("Invalid email address.", true);
    return;
  }

  if (confirm(`Send verification to ${newEmail}?`)) {
    currentEmail = newEmail.trim();
    _applyEmailToDOM(currentEmail);
    showToast(`Email updated to ${currentEmail}`);
  }
}

function _onChangePassword(e) {
  if (typeof ChangePassword?.open === "function") {
    ChangePassword.open();
  }
}

function _onDeleteAccount(e) {
  const btn = e.currentTarget;
  btn.disabled = true;

  setTimeout(() => {
    btn.disabled = false;
    const verification = prompt("To confirm, enter your email address:", currentEmail);
    if (verification === currentEmail && confirm("Permanently delete your account? This cannot be undone.")) {
      showToast("Account deletion request submitted.");
    } else {
      showToast("Cancelled", true);
    }
  }, 1000);
}

function _onManageMfa(e) {
  switchTab("mfa");
}


// -----------------------------------------------------------------------------
// Tab Switching
// -----------------------------------------------------------------------------

/**
 * Shows the requested tab panel, updates tab button states,
 * and syncs the document title and browser history.
 *
 * @param {"account"|"mfa"} tab
 */
function switchTab(tab) {
  const tabAccount    = document.getElementById("tab-account");
  const tabMfa        = document.getElementById("tab-mfa");
  const settingsPanel = document.getElementById("panel-account-settings");
  const tabBtns       = (settingsPanel || document).querySelectorAll(".tab-btn");
  const appName       = window.AppSettings?.app_name ||
                        sessionStorage.getItem("app_name") ||
                        "App";

  if (tabAccount) tabAccount.style.display = tab === "account" ? "block" : "none";
  if (tabMfa)     tabMfa.style.display     = tab === "mfa"     ? "block" : "none";

  tabBtns.forEach((btn, i) => {
    btn.classList.toggle("active",
      (tab === "account" && i === 0) || (tab === "mfa" && i === 1)
    );
  });

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


// -----------------------------------------------------------------------------
// FAQ Toggle
// -----------------------------------------------------------------------------

/**
 * Opens or closes the FAQ item that contains the clicked question header.
 *
 * @param {HTMLElement} element - The `.faq-question` element that was clicked.
 */
function toggleFaq(element) {
  element.closest(".faq-item")?.classList.toggle("open");
}


// -----------------------------------------------------------------------------
// Private Helpers
// -----------------------------------------------------------------------------

/**
 * Clones a button (removing stale listeners), then attaches a new click handler.
 *
 * @param {string}   id         - Element ID.
 * @param {Function} handler    - Click handler to attach.
 * @param {boolean}  skipClone  - If true, attaches directly without cloning.
 */
function _bindButton(id, handler, skipClone = false) {
  const el = document.getElementById(id);
  if (!el) return;

  if (skipClone) {
    el.addEventListener("click", handler);
    return;
  }

  const fresh = el.cloneNode(true);
  el.parentNode.replaceChild(fresh, el);
  fresh.addEventListener("click", handler);
}


/**
 * Sets textContent on a DOM element referenced by ID or direct reference.
 *
 * @param {string|HTMLElement} target
 * @param {string}             text
 */
function _setTextContent(target, text) {
  const el = typeof target === "string" ? document.getElementById(target) : target;
  if (el) el.textContent = text;
}

/**
 * Sets innerHTML on a DOM element.
 *
 * @param {HTMLElement} el
 * @param {string}      html
 */
function _setHTML(el, html) {
  if (el) el.innerHTML = html;
}

/**
 * Replaces all className on a DOM element.
 *
 * @param {HTMLElement} el
 * @param {string}      className
 */
function _setClass(el, className) {
  if (el) el.className = className;
}


// -----------------------------------------------------------------------------
// Public API
// -----------------------------------------------------------------------------

// initChipState, updateActiveMenu, navigateTo, etc. are handled by navigate.js

window.updateEmailFromData       = updateEmailFromData;
window.fetchAccountSettingsHTML  = fetchAccountSettingsHTML;
window.initAccountSettingsEvents = initAccountSettingsEvents;
window.switchTab                 = switchTab;
window.toggleFaq                 = toggleFaq;


// -----------------------------------------------------------------------------
// DOM Ready
// -----------------------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  console.log("[account-settings] Module loaded — awaiting initAccountSettingsEvents().");
});