// ============================================================
// PREFILL — email chip, app name
// ============================================================
function initPage() {
  const appName = Navigate.getAppName();

  if (appName) {
    // App name di berbagai elemen
    document.querySelectorAll("[data-placeholder='app_name']").forEach((el) => {
      el.textContent = appName;
    });
    document.querySelectorAll(".support-topbar-brand-name").forEach((el) => {
      el.textContent = appName;
    });
    document.querySelectorAll(".support-footer-links span").forEach((el) => {
      el.textContent = el.textContent.replace("{appName}", appName);
    });
    document.title = `Support Center | ${appName} Account`;
  }
}

// ============================================================
// SUPPORT CATEGORY
// ============================================================
function openSupportCategory(category) {
  const labels = {
    troubleshooting:   "Troubleshooting and VPN issues",
    "getting-started": "Getting started, installation, and features set up",
    account:           "Account management and logging in",
    "billing-support": "Billing and subscriptions",
    "other-products":  "Explore other products",
  };
  showToast("Opening: " + (labels[category] || category));
}

// ============================================================
// CHAT BUBBLE
// ============================================================
function toggleChatBubble() {
  const bubble = document.getElementById("supportChatBubble");
  if (!bubble) return;
  bubble.classList.toggle("is-open");
  const tooltip = bubble.querySelector(".chat-bubble-tooltip");
  if (tooltip) tooltip.classList.remove("visible");
  if (bubble.classList.contains("is-open")) {
    setTimeout(() => {
      const input = document.getElementById("chatInput");
      if (input) input.focus();
    }, 250);
  }
}

function handleChatInput(e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendChatMsg();
  }
}

function sendChatMsg() {
  const input = document.getElementById("chatInput");
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;
  input.value = "";

  const container = document.getElementById("chatMessages");
  if (!container) return;

  // User bubble
  const row = document.createElement("div");
  row.className = "chat-msg-row user";
  row.innerHTML = `<div class="chat-msg-bubble">${escapeHtml(text)}</div>`;
  container.appendChild(row);

  const timeEl = document.createElement("div");
  timeEl.className = "chat-msg-time";
  timeEl.style.textAlign = "right";
  timeEl.textContent = "Just now";
  container.appendChild(timeEl);

  container.scrollTop = container.scrollHeight;
}

function escapeHtml(str) {
  return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

function initChatBubble() {
  const btn = document.querySelector("#supportChatBubble .chat-bubble-btn");
  const tooltip = document.querySelector("#supportChatBubble .chat-bubble-tooltip");
  const bubble = document.getElementById("supportChatBubble");
  if (btn && tooltip && bubble) {
    btn.addEventListener("mouseenter", () => {
      if (!bubble.classList.contains("is-open")) tooltip.classList.add("visible");
    });
    btn.addEventListener("mouseleave", () => tooltip.classList.remove("visible"));
  }
}

// ============================================================
// EXPOSE GLOBALS
// ============================================================
window.openSupportCategory = openSupportCategory;
window.toggleChatBubble    = toggleChatBubble;
window.handleChatInput     = handleChatInput;
window.sendChatMsg         = sendChatMsg;

// ============================================================
// INIT ON DOM READY
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  // Guard: hanya jalankan jika berada di halaman support
  const path = location.pathname;
  if (!path.startsWith("/support")) return;

  console.log("[support] initialized");

  initPage();
  initChatBubble();
});