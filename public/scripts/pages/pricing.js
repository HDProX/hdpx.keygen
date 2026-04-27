// ============================================================
// PREFILL — app name
// ============================================================
function initPage() {
  const appName = Navigate.getAppName();
  const email   = Navigate.getEmail();

  if (appName) {
    document.querySelectorAll("[data-placeholder='app_name']").forEach((el) => {
      el.textContent = appName;
    });
    document.querySelectorAll(".pricing-topbar-brand-name, .sidebar-brand-name").forEach((el) => {
      el.textContent = appName;
    });
    document.title = `Available Plans | ${appName} Account`;
  }

  // Sembunyikan "Current customer?" jika sudah login (email tersedia)
  const heroNote = document.getElementById("pricingHeroNote");
  if (heroNote) {
    heroNote.style.display = email ? "none" : "";
  }
}

// ============================================================
// PRICING DATA
// ============================================================
const PRICING_DATA = {
  individual: {
    total: {
      name: "Total",
      tagline: "Device for all and Generate Keys Unlimited",
      features: [
        "Complete key generation for PCs, tablets, and phones",
        "Ultra fast, unlimited key generation"
      ],
      accordionLabel: "What's included in Total?",
      accordionFeatures: ["Everything in Plus", "White Glove Fraud Resolution"],
      devices: {
        "1month": "Limits <strong>5 devices</strong>",
        "1year":  "Unlimited devices",
        "2year":  "Unlimited devices"
      },
      planKey: "total",
      badge: "Most popular",
      featured: true,
      btnClass: "",
      prices: {
        "1month": { monthly: "US$12.99", total: null,        original: null,        save: null       },
        "1year":  { monthly: "US$8.99",  total: "US$107.88", original: "US$179.88", save: "Save 63%" },
        "2year":  { monthly: "US$4.49",  total: "US$107.88", original: "US$215.76", save: "Save 74%" }
      }
    },
    plus: {
      name: "Plus",
      tagline: "Generate unlimited keys",
      features: [
        "Complete key generation for PCs, tablets, and phones",
        "Ultra fast, unlimited key generation"
      ],
      accordionLabel: "What's included in Plus?",
      accordionFeatures: ["Everything in Standard", "Unlimited Key Generation"],
      devices: {
        "1month": "Limits <strong>3 devices</strong>",
        "1year":  "Unlimited devices",
        "2year":  "Unlimited devices"
      },
      planKey: "plus",
      badge: "Best value",
      featured: false,
      btnClass: "btn-buy--outline",
      prices: {
        "1month": { monthly: "US$7.99",  total: null,       original: null,        save: null       },
        "1year":  { monthly: "US$5.99",  total: "US$71.88", original: "US$89.88",  save: "Save 63%" },
        "2year":  { monthly: "US$3.24",  total: "US$77.88", original: "US$155.76", save: "Save 74%" }
      }
    },
    standard: {
      name: "Standard",
      tagline: "Generate keys 100/month",
      features: ["Complete key generation for PCs, tablets, and phones"],
      accordionLabel: "What's included in Standard?",
      accordionFeatures: ["Generate 100 keys/month", "24/7 customer support"],
      devices: {
        "1month": "Limits <strong>1 device</strong>",
        "1year":  "Limits <strong>1 device</strong>",
        "2year":  "Limits <strong>1 device</strong>"
      },
      planKey: "standard",
      badge: null,
      featured: false,
      btnClass: "btn-buy--outline",
      prices: {
        "1month": { monthly: "US$4.99", total: null,       original: null,       save: null },
        "1year":  { monthly: "US$3.74", total: "US$44.99", original: "US$44.99", save: null },
        "2year":  { monthly: "US$1.87", total: "US$44.99", original: "US$89.98", save: null }
      }
    },
  },
};

// ============================================================
// STATE
// ============================================================
let _pricingCurrentPeriod = "1year";

// ============================================================
// BUILD HELPERS
// ============================================================
function _buildSparkSVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 16 16">
    <path d="M 7.187 13.528 L 7.153 13.584 C 7.073 13.679 6.927 13.679 6.847 13.584 L 6.813 13.528 L 6.744 13.353 L 7 13.454 L 7.255 13.354 L 7.187 13.528 Z M 6.813 2.472 C 6.868 2.328 7.058 2.297 7.155 2.416 C 7.169 2.433 7.179 2.452 7.187 2.472 L 8.219 5.09 C 8.524 5.863 9.136 6.475 9.909 6.78 L 12.353 7.743 L 12.454 7.999 L 12.354 8.254 L 9.909 9.218 L 9.766 9.278 C 9.059 9.6 8.504 10.185 8.219 10.908 L 7.255 13.352 L 7 13.453 L 6.744 13.353 L 5.781 10.908 C 5.496 10.185 4.941 9.6 4.234 9.278 L 4.091 9.218 L 1.471 8.186 C 1.327 8.131 1.296 7.941 1.415 7.844 C 1.432 7.83 1.451 7.82 1.471 7.812 L 1.646 7.743 L 4.091 6.78 C 4.814 6.495 5.399 5.94 5.721 5.233 L 5.781 5.09 L 6.813 2.472 Z M 12.528 7.813 C 12.672 7.868 12.703 8.058 12.584 8.155 C 12.567 8.169 12.548 8.179 12.528 8.187 L 12.353 8.255 L 12.454 8 L 12.354 7.744 L 12.528 7.813 Z M 12.363 2.866 C 12.587 3.267 12.942 3.582 13.374 3.753 L 13.764 3.907 C 13.836 3.935 13.85 4.03 13.789 4.078 C 13.782 4.084 13.773 4.089 13.764 4.093 L 13.677 4.127 L 13.374 4.247 L 13.186 4.333 C 12.758 4.555 12.424 4.925 12.247 5.374 L 12.127 5.677 L 12.093 5.764 L 12.077 5.792 C 12.037 5.84 11.963 5.84 11.923 5.792 L 11.907 5.764 L 11.872 5.677 L 11.752 5.374 C 11.575 4.925 11.243 4.556 10.815 4.333 L 10.626 4.247 L 10.236 4.093 C 10.164 4.065 10.15 3.97 10.211 3.922 C 10.218 3.916 10.227 3.911 10.236 3.907 L 10.322 3.872 L 10.626 3.752 C 11.058 3.582 11.412 3.267 11.636 2.866 L 12 2.723 L 12.363 2.866 Z M 11.907 2.236 C 11.935 2.164 12.03 2.15 12.078 2.211 C 12.084 2.218 12.089 2.227 12.093 2.236 L 12.247 2.626 C 12.28 2.709 12.319 2.789 12.363 2.866 L 12 2.723 L 11.636 2.866 L 11.667 2.814 L 11.753 2.626 L 11.907 2.236 Z M 12.426 9.187 C 12.449 9.13 12.526 9.12 12.563 9.169 C 12.568 9.174 12.571 9.18 12.574 9.187 C 12.978 10.212 13.788 11.022 14.813 11.426 C 14.87 11.449 14.88 11.526 14.831 11.563 C 14.826 11.568 14.82 11.571 14.813 11.574 L 14.743 11.604 C 13.751 12.016 12.968 12.813 12.574 13.813 L 12.562 13.835 C 12.53 13.873 12.471 13.873 12.439 13.835 L 12.426 13.812 C 12.049 12.854 11.314 12.08 10.377 11.654 L 10.187 11.574 C 10.13 11.551 10.12 11.474 10.169 11.437 C 10.174 11.432 10.18 11.429 10.187 11.426 C 11.212 11.022 12.022 10.212 12.426 9.187" style="fill: currentColor;"/>
  </svg>`;
}

function _buildCheckSVG() {
  return `<span class="feat-icon"><svg viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3"/></svg></span>`;
}

function _buildCardHTML(plan, period, maxFeatures) {
  const p = plan.prices[period];
  const hasSave     = !!p.save;
  const hasTotal    = !!p.total;
  const hasOriginal = !!p.original;

  let billingHTML = "";
  if (hasTotal) {
    if (hasOriginal) {
      billingHTML = `<span class="plan-billing-original">${p.original}</span>${p.total} for the first ${period === "2year" ? "24" : "12"} months`;
    } else {
      billingHTML = `${p.total} billed ${period === "1year" ? "yearly" : "every 2 years"}`;
    }
  }

  const featuredClass = plan.featured ? " featured" : "";
  const isRecommended = plan.featured && period === "1year";
  const badgeClass = plan.featured
    ? `plan-badge plan-badge--popular${isRecommended ? " plan-badge--recommended" : ""}`
    : "plan-badge plan-badge--value";
  const badgeHTML = plan.badge
    ? `<div class="${badgeClass}">${_buildSparkSVG()}${plan.badge}</div>`
    : "";

  const paddedFeatures = [
    ...plan.features,
    ...Array(maxFeatures - plan.features.length).fill(null)
  ];

  const featuresHTML = paddedFeatures
    .map(f => f
      ? `<li>${_buildCheckSVG()}${f}</li>`
      : `<li style="visibility:hidden">${_buildCheckSVG()}placeholder</li>`)
    .join("");

  const accordionFeaturesHTML = plan.accordionFeatures
    .map(f => `<li>${_buildCheckSVG()}${f}</li>`)
    .join("");

  const btnClass = plan.btnClass ? `btn-buy ${plan.btnClass}` : "btn-buy";

  return `
<div class="plan-card${featuredClass}">
  ${badgeHTML}
  <div class="plan-body">
    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:4px;">
      <div class="plan-name">${plan.name}</div>
      <span class="plan-save-badge${hasSave ? "" : " hidden"}" data-save>${hasSave ? p.save : ""}</span>
    </div>
    <div class="plan-tagline">${plan.tagline}</div>
    <div class="plan-pricing">
      <div class="plan-from">Starts from</div>
      <div class="plan-price-row">
        <span class="plan-price" data-price>${p.monthly}</span>
        <span class="plan-period">/mo</span>
      </div>
      <div class="plan-billing-total" data-billing>${billingHTML}</div>
    </div>
    <div class="plan-devices">${plan.devices[period]}</div>
    <a href="#" class="${btnClass}" onclick="pricingHandleBuy('${plan.planKey}', event)">Buy now</a>
    <div class="plan-divider"></div>
    <ul class="plan-features">${featuresHTML}</ul>
  </div>
  <div class="plan-accordion">
    <button class="accordion-toggle" onclick="pricingToggleAccordion(this)">
      ${plan.accordionLabel}
      <svg class="accordion-chevron" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
    </button>
    <div class="accordion-content">
      <ul class="accordion-features">${accordionFeaturesHTML}</ul>
    </div>
  </div>
</div>`;
}

// ============================================================
// RENDER GRID
// ============================================================
function _renderGrid(tabKey, period) {
  const gridEl = document.getElementById("plansGrid");
  if (!gridEl) return;
  const plans = PRICING_DATA[tabKey];
  const orderedKeys = ["total", "plus", "standard"];
  const allPlans = orderedKeys.map(k => plans[k]).filter(Boolean);
  const maxFeatures = Math.max(...allPlans.map(p => p.features.length));
  gridEl.innerHTML = allPlans.map(plan => _buildCardHTML(plan, period, maxFeatures)).join("");
}

// ============================================================
// PERIOD CHANGE
// ============================================================
function pricingChangePeriod(period) {
  _pricingCurrentPeriod = period;
  _renderGrid("individual", period);
}

// ============================================================
// ACCORDION
// ============================================================
function pricingToggleAccordion(btn) {
  const content = btn.nextElementSibling;
  const isOpen  = content.classList.contains("open");
  const grid    = btn.closest(".plans-grid");
  if (grid) {
    grid.querySelectorAll(".accordion-content.open").forEach(c => c.classList.remove("open"));
    grid.querySelectorAll(".accordion-toggle").forEach(b => b.classList.remove("accordion-open"));
  }
  if (!isOpen) {
    content.classList.add("open");
    btn.classList.add("accordion-open");
  }
}

// ============================================================
// BUY HANDLER
// ============================================================
function pricingHandleBuy(plan, e) {
  e.preventDefault();
  const email  = Navigate.getEmail();
  const appVer = Navigate.getAppVer();
  const base   = "https://hdpx-keygen.vercel.app/checkout";
  const qs     = new URLSearchParams({
    plan,
    period: _pricingCurrentPeriod,
    ...(email  && { email }),
    ...(appVer && { ver: appVer })
  });
  window.open(`${base}?${qs}`, "_blank");
}

// ============================================================
// DROPDOWN
// ============================================================
function pricingToggleDropdown() {
  const dropdown = document.getElementById("pricingPeriodDropdown");
  const chevron  = document.getElementById("pricingPeriodChevron");
  if (!dropdown || !chevron) return;
  const isOpen = dropdown.classList.contains("open");
  dropdown.classList.toggle("open", !isOpen);
  chevron.style.transform = isOpen ? "" : "rotate(180deg)";
}

function pricingSelectOption(el) {
  const value = el.dataset.value;
  const label = el.dataset.label;

  const periodLabel = document.getElementById("pricingPeriodLabel");
  if (periodLabel) periodLabel.textContent = label;

  document.querySelectorAll(".pricing-option-check svg").forEach(svg => {
    svg.style.visibility = "hidden";
  });

  const check = document.getElementById("check-" + value);
  if (check) check.querySelector("svg").style.visibility = "visible";

  const dropdown = document.getElementById("pricingPeriodDropdown");
  const chevron  = document.getElementById("pricingPeriodChevron");
  if (dropdown) dropdown.classList.remove("open");
  if (chevron)  chevron.style.transform = "";

  pricingChangePeriod(value);
}

// Tutup dropdown saat klik di luar
document.addEventListener("click", (e) => {
  const wrapper = document.querySelector(".pricing-period-wrapper");
  if (wrapper && !wrapper.contains(e.target)) {
    const dropdown = document.getElementById("pricingPeriodDropdown");
    const chevron  = document.getElementById("pricingPeriodChevron");
    if (dropdown) dropdown.classList.remove("open");
    if (chevron)  chevron.style.transform = "";
  }
});


// ============================================================
// EXPOSE GLOBALS
// ============================================================
window.pricingChangePeriod    = pricingChangePeriod;
window.pricingToggleAccordion = pricingToggleAccordion;
window.pricingHandleBuy       = pricingHandleBuy;
window.pricingToggleDropdown  = pricingToggleDropdown;
window.pricingSelectOption    = pricingSelectOption;

// ============================================================
// INIT ON DOM READY
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  console.log("[pricing] initialized");

  initPage();

  // Render grid dengan period default (1year)
  _renderGrid("individual", _pricingCurrentPeriod);

  // Set checkmark default visible
  const defaultCheck = document.getElementById("check-" + _pricingCurrentPeriod);
  if (defaultCheck) {
    const svg = defaultCheck.querySelector("svg");
    if (svg) svg.style.visibility = "visible";
  }
});