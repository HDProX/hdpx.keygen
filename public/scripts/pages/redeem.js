// ============================================================
// PREFILL — email input, app name placeholder
// ============================================================
function initPage() {
  const email   = Navigate.getEmail();
  const appName = Navigate.getAppName();

  const emailDisplay = document.getElementById("emailDisplay");
  if (emailDisplay && email) emailDisplay.value = email;

  if (appName) document.title = `Activate your code | ${appName} Account`;

  setTimeout(() => {
    const input = document.getElementById("activationCode");
    if (input) input.focus();
  }, 100);
}

// ============================================================
// CAPTCHA MOCK
// ============================================================
let captchaVerified = false;

function redeemCheckTurnstile() {
  const cb = document.getElementById("turnstileCheckbox");
  captchaVerified = cb ? cb.checked : false;
  checkFormReady();
}

function checkFormReady() {
  const input = document.getElementById("activationCode");
  const btn = document.getElementById("btnContinueStep1");
  const ready = (input ? input.value.trim().length > 0 : false) && captchaVerified;
  if (btn) {
    btn.disabled = !ready;
    btn.classList.toggle("ready", ready);
  }
}

// ============================================================
// ERROR HANDLING
// ============================================================
let errorTimer;

function clearError() {
  const row = document.getElementById("codeErrorRow");
  const input = document.getElementById("activationCode");
  if (row) row.classList.remove("show");
  if (input) input.classList.remove("error");
  clearTimeout(errorTimer);
}

function showError(msg) {
  const msgEl = document.getElementById("codeErrorMsg");
  const input = document.getElementById("activationCode");
  const row = document.getElementById("codeErrorRow");
  if (msgEl) msgEl.textContent = msg || "Invalid activation code";
  if (input) input.classList.add("error");
  if (row) row.classList.add("show");
  clearTimeout(errorTimer);
  errorTimer = setTimeout(clearError, 10000);
}

// ============================================================
// SUBMIT
// ============================================================
async function handleSubmit() {
  const input = document.getElementById("activationCode");
  const code = input ? input.value.trim() : "";

  if (!code) { showError("Please enter your activation code"); return; }
  if (!captchaVerified) { showToast("Please verify you are human", true); return; }

  const btn = document.getElementById("btnContinueStep1");
  const original = btn.innerHTML;
  btn.classList.add("loading");
  btn.disabled = true;
  btn.innerHTML = '<span class="btn-spinner"></span> Verifying...';

  try {
    await new Promise((r) => setTimeout(r, 1400));
    // TODO: Change this to real API call and handle response

    showToast("Code verified! Proceeding...");
    setTimeout(() => console.log("Redirect to next step"), 500);
  } catch (err) {
    btn.classList.remove("loading");
    btn.disabled = false;
    btn.innerHTML = original;
    showError(err.message || "Invalid activation code. Please try again.");
  }
}

// ============================================================
// EXPOSE GLOBALS
// ============================================================
window.redeemCheckTurnstile = redeemCheckTurnstile;

// ============================================================
// INIT ON DOM READY
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  // Guard: hanya jalankan jika berada di halaman redeem/activate
  const path = location.pathname;
  if (!path.startsWith("/activate") && !path.startsWith("/redeem")) return;

  console.log("[redeem] initialized");

  initPage();

  // Input events
  const codeInput = document.getElementById("activationCode");
  if (codeInput) {
    codeInput.addEventListener("input", () => { clearError(); checkFormReady(); });
    codeInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); handleSubmit(); }
    });
  }

  // Submit button
  const submitBtn = document.getElementById("btnContinueStep1");
  if (submitBtn) submitBtn.addEventListener("click", handleSubmit);
});