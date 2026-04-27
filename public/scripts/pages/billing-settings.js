const BILLING_TEMPLATE_HTML = `
<h1 class="page-title" id="billingPageTitle">My Subscriptions</h1>
<div class="tabs">
  <button class="tab-btn active" onclick="switchBillingTab('subscriptions')">Subscriptions</button>
  <button class="tab-btn" onclick="switchBillingTab('history')">Billing history</button>
</div>

<!-- ===== TAB: SUBSCRIPTIONS ===== -->
<div id="billing-tab-subscriptions">
  <div class="billing-layout">
    <div class="billing-main">
      <div class="sub-card">
        <div class="sub-card-header">
          <span class="sub-included-label">Included in your plan</span>
          <span class="sub-badge sub-badge--active">Active</span>
        </div>
        <div class="sub-products">
          <div class="sub-product-chip sub-product-chip--blue">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><defs><style>.cls-1{fill:currentColor;}</style></defs><g id="brand"><path class="cls-1" d="M19,5.4c-1.8-1.9-4.2-3-7-3s-5.2,1.1-6.9,2.9l7.1,2.6,6.8-2.5Z"/><path class="cls-1" d="M20.6,7.8C20.9,7.1 20.8,6.2 20.3,5.8L12.1,8.8 3.8,5.7C3.3,6.1 3.2,6.9 3.4,7.6C2.7,8.9 2.3,10.4 2.3,12C2.3,17.3 6.6,21.6 11.9,21.6C17.2,21.6 21.5,17.3 21.5,12C21.5,9.608 20.6,7.8 20.6,7.8 ZM16,16.2C14.9,16.2 13.9,15.8 13.1,15.2L12.1,17.4 11,15.2C10.2,15.9 9.2,16.3 8.1,16.3C5.6,16.3 3.5,14.3 3.5,11.7C3.5,10.417 3.9,9.6 4.5,8.8L7.4,9.7C6.8,10 6.3,10.6 6.3,11.4C6.3,12.2 7.1,13.3 8.2,13.3C9.3,13.3 10.1,12.5 10.1,11.4C10.1,10.986 10,10.7 9.8,10.4L11.9,11 14.2,10.3C14,10.6 13.9,10.9 13.9,11.2C13.9,12.2 14.7,13.1 15.8,13.1C16.9,13.1 17.7,12.3 17.7,11.2C17.7,10.214 17.106,9.668 16.7,9.5L19.4,8.7C20.1,9.5 20.4,10.5 20.4,11.6C20.4,14.1 18.4,16.2 15.8,16.2Z"/></g></svg>
            Unlimited Keys Generated
          </div>
          <div class="sub-product-chip sub-product-chip--teal">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><defs><style>.cls-1{fill:currentColor;}</style></defs><g id="brand"><path class="cls-1" d="M19,5.4c-1.8-1.9-4.2-3-7-3s-5.2,1.1-6.9,2.9l7.1,2.6,6.8-2.5Z"/><path class="cls-1" d="M20.6,7.8C20.9,7.1 20.8,6.2 20.3,5.8L12.1,8.8 3.8,5.7C3.3,6.1 3.2,6.9 3.4,7.6C2.7,8.9 2.3,10.4 2.3,12C2.3,17.3 6.6,21.6 11.9,21.6C17.2,21.6 21.5,17.3 21.5,12C21.5,9.608 20.6,7.8 20.6,7.8 ZM16,16.2C14.9,16.2 13.9,15.8 13.1,15.2L12.1,17.4 11,15.2C10.2,15.9 9.2,16.3 8.1,16.3C5.6,16.3 3.5,14.3 3.5,11.7C3.5,10.417 3.9,9.6 4.5,8.8L7.4,9.7C6.8,10 6.3,10.6 6.3,11.4C6.3,12.2 7.1,13.3 8.2,13.3C9.3,13.3 10.1,12.5 10.1,11.4C10.1,10.986 10,10.7 9.8,10.4L11.9,11 14.2,10.3C14,10.6 13.9,10.9 13.9,11.2C13.9,12.2 14.7,13.1 15.8,13.1C16.9,13.1 17.7,12.3 17.7,11.2C17.7,10.214 17.106,9.668 16.7,9.5L19.4,8.7C20.1,9.5 20.4,10.5 20.4,11.6C20.4,14.1 18.4,16.2 15.8,16.2Z"/></g></svg>
            {appName} Premium Plus
          </div>
        </div>
        <div class="sub-details">
          <div class="sub-detail-row">
            <span class="sub-detail-label">Auto-renewal</span>
            <span class="sub-detail-value">ON 
              <button class="btn-link-blue" onclick="showToast('Auto-renewal cancellation coming soon')">
                <span>Cancel</span>
              </button>
            </span>
          </div>
          <div class="sub-detail-row">
            <span class="sub-detail-label">Renews on</span>
            <span class="sub-detail-value">February 21, 2028 <span class="info-icon" title="Your subscription will automatically renew on this date"><svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><path fill="currentColor" d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m0 192a88 88 0 1 1 88-88a88.1 88.1 0 0 1-88 88m16-40a8 8 0 0 1-8 8a16 16 0 0 1-16-16v-40a8 8 0 0 1 0-16a16 16 0 0 1 16 16v40a8 8 0 0 1 8 8m-32-92a12 12 0 1 1 12 12a12 12 0 0 1-12-12"/></svg></span></span>
          </div>
          <div class="sub-detail-row">
            <span class="sub-detail-label">Next charge</span>
            <span class="sub-detail-value">February 6, 2028 <span class="info-icon" title="You will be charged on this date"><svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><path fill="currentColor" d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m0 192a88 88 0 1 1 88-88a88.1 88.1 0 0 1-88 88m16-40a8 8 0 0 1-8 8a16 16 0 0 1-16-16v-40a8 8 0 0 1 0-16a16 16 0 0 1 16 16v40a8 8 0 0 1 8 8m-32-92a12 12 0 1 1 12 12a12 12 0 0 1-12-12"/></svg></span></span>
          </div>
          <div class="sub-detail-row">
            <span class="sub-detail-label">Renewal price</span>
            <span class="sub-detail-value">\$179.88/year <span class="info-icon" title="Price may vary based on taxes"><svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><path fill="currentColor" d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m0 192a88 88 0 1 1 88-88a88.1 88.1 0 0 1-88 88m16-40a8 8 0 0 1-8 8a16 16 0 0 1-16-16v-40a8 8 0 0 1 0-16a16 16 0 0 1 16 16v40a8 8 0 0 1 8 8m-32-92a12 12 0 1 1 12 12a12 12 0 0 1-12-12"/></svg></span></span>
          </div>
          <div class="sub-detail-row">
            <span class="sub-detail-label">Payment method</span>
            <span class="sub-detail-value">
              Mastercard ****1840 &nbsp; Exp 12/28 &nbsp;
              <button class="btn-link-blue" onclick="showToast('Update payment method coming soon')">
                <span>Update</span>
              </button>
            </span>
          </div>
        </div>
      </div>
      <div class="sub-upgrade-banner">
        <div class="sub-upgrade-left">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path fill="currentColor" d="m7.187 13.528l-.034.056a.2.2 0 0 1-.306 0l-.034-.056l-.069-.175l.256.101l.255-.1zM6.813 2.472a.2.2 0 0 1 .374 0L8.219 5.09a3 3 0 0 0 1.69 1.69l2.444.963l.101.256l-.1.255l-2.445.964l-.143.06a3 3 0 0 0-1.547 1.63l-.964 2.444l-.255.101l-.256-.1l-.963-2.445a3 3 0 0 0-1.547-1.63l-.143-.06l-2.62-1.032a.2.2 0 0 1 0-.374l.175-.069l2.445-.963a3 3 0 0 0 1.63-1.547l.06-.143zm-.102 2.986A4 4 0 0 1 4.648 7.63l-.19.08l-.733.29l.733.289a4 4 0 0 1 2.253 2.253l.289.732l.29-.732a4 4 0 0 1 2.252-2.253L10.274 8l-.732-.29A4 4 0 0 1 7.37 5.649l-.08-.19L7 4.725zm5.817 2.355a.2.2 0 0 1 0 .374l-.175.068l.101-.255l-.1-.256zm-.165-4.947c.224.401.579.716 1.011.887l.39.154a.1.1 0 0 1 0 .186l-.087.034l-.303.12l-.188.086a2 2 0 0 0-.939 1.041l-.12.303l-.034.087l-.016.028a.1.1 0 0 1-.154 0l-.016-.028l-.035-.087l-.12-.303a2 2 0 0 0-.937-1.041l-.189-.086l-.39-.154a.1.1 0 0 1 0-.186l.086-.035l.304-.12c.432-.17.786-.485 1.01-.886L12 2.723zm-.456-.63a.1.1 0 0 1 .186 0l.154.39q.05.124.116.24L12 2.723l-.364.143l.031-.052l.086-.188zm.519 6.951a.08.08 0 0 1 .148 0a3.97 3.97 0 0 0 2.239 2.239a.08.08 0 0 1 0 .148l-.07.03a3.97 3.97 0 0 0-2.169 2.209l-.012.022a.08.08 0 0 1-.123 0l-.013-.023a3.97 3.97 0 0 0-2.049-2.158l-.19-.08a.08.08 0 0 1 0-.148a3.97 3.97 0 0 0 2.239-2.239m.074 1.784q-.245.285-.53.529q.285.245.53.528q.245-.284.528-.528a5 5 0 0 1-.528-.53"/></svg>
          Considering a security upgrade?
        </div>
        <button class="btn-primary-blue" onclick="showToast('Available plans coming soon')">See available plans</button>
      </div>
    </div>
    <div class="billing-sidebar">
      <div class="billing-side-card billing-side-card--deals">
        <div class="deals-illustration">
          <svg viewBox="0 0 80 80" width="64" height="64" fill="none"><circle cx="40" cy="40" r="38" fill="#e8eaf6"/><circle cx="40" cy="30" r="12" fill="#7986cb"/><path d="M20 58c0-11 9-18 20-18s20 7 20 18" fill="#5c6bc0"/><rect x="52" y="18" width="14" height="14" rx="3" fill="#ff8a65"/><path d="M55 25l3 3 6-6" stroke="white" stroke-width="1.5" stroke-linecap="round"/></svg>
        </div>
        <p class="billing-side-deals-text">We've selected some special offers for you. Curious?</p>
        <button class="btn-outline-full" onclick="showToast('Your deals coming soon')">See your deals</button>
      </div>
      <div class="billing-faq-section">
        <p class="section-label">FAQ</p>
        <div class="faq-list">
          <div class="faq-item">
            <div class="faq-question" onclick="toggleBillingFaq(this)">
              <span>What happens if I enable auto-renewal?</span>
              <svg class="faq-chevron" viewBox="0 0 24 24"><path fill="currentColor" d="M18.53 9.53a.75.75 0 0 0 0-1.06H5.47a.75.75 0 0 0 0 1.06l6 6a.75.75 0 0 0 1.06 0z"/></svg>
            </div>
            <div class="faq-answer">Your subscription will automatically renew at the end of the current period. You won't lose access to your services.</div>
          </div>
          <div class="faq-item">
            <div class="faq-question" onclick="toggleBillingFaq(this)">
              <span>When will I be charged for auto-renewal?</span>
              <svg class="faq-chevron" viewBox="0 0 24 24"><path fill="currentColor" d="M18.53 9.53a.75.75 0 0 0 0-1.06H5.47a.75.75 0 0 0 0 1.06l6 6a.75.75 0 0 0 1.06 0z"/></svg>
            </div>
            <div class="faq-answer">You'll be charged on the "Next charge" date shown in your subscription details, which is typically a few days before the renewal date.</div>
          </div>
          <div class="faq-item">
            <div class="faq-question" onclick="toggleBillingFaq(this)">
              <span>What happens if my auto-renewal is off?</span>
              <svg class="faq-chevron" viewBox="0 0 24 24"><path fill="currentColor" d="M18.53 9.53a.75.75 0 0 0 0-1.06H5.47a.75.75 0 0 0 0 1.06l6 6a.75.75 0 0 0 1.06 0z"/></svg>
            </div>
            <div class="faq-answer">Your subscription will expire at the end of the current billing period and will not be renewed automatically. You can re-enable it at any time.</div>
          </div>
          <div class="faq-item">
            <div class="faq-question" onclick="toggleBillingFaq(this)">
              <span>What if I buy a new plan before my current one ends?</span>
              <svg class="faq-chevron" viewBox="0 0 24 24"><path fill="currentColor" d="M18.53 9.53a.75.75 0 0 0 0-1.06H5.47a.75.75 0 0 0 0 1.06l6 6a.75.75 0 0 0 1.06 0z"/></svg>
            </div>
            <div class="faq-answer">The new plan will start immediately and your remaining days from the current plan may be added as a credit to your account.</div>
          </div>
        </div>
      </div>
      <div class="home-side-card">
        <h3 class="home-side-title">Downloads center</h3>
        <p class="home-side-desc">Get the tools you need to protect your files, passwords, and privacy.</p>
        <a href="#" class="home-side-link" onclick="showToast('Downloads coming soon'); return false;"> <span>Download apps</span> <span class="arrow-right-icon"></span></a>
      </div>
    </div>
  </div>
</div>

<!-- ===== TAB: BILLING HISTORY ===== -->
<div id="billing-tab-history" style="display:none">
  <div class="billing-history-wrap">
    <div class="billing-history-table">
      <div class="bh-table-header">
        <span>Date</span><span>Subscription</span><span>Payment method</span><span>Amount</span><span>Status</span>
      </div>
      <div class="bh-table-row">
        <span class="bh-cell bh-date">March 13, 2026</span>
        <span class="bh-cell bh-sub">2-year Plus plan<br><a href="#" class="bh-sub-link" onclick="showToast('Plan details coming soon'); return false;">See what's included</a></span>
        <span class="bh-cell">Credit card</span>
        <span class="bh-cell">\$193.86</span>
        <span class="bh-cell"><span class="bh-badge bh-badge--failed">Payment failed</span></span>
      </div>
      <div class="bh-table-row">
        <span class="bh-cell bh-date">March 11, 2026</span>
        <span class="bh-cell bh-sub">1-year Dedicated IP plan<br><a href="#" class="bh-sub-link" onclick="showToast('Plan details coming soon'); return false;">See what's included</a></span>
        <span class="bh-cell">Credit card</span>
        <span class="bh-cell">\$55.08</span>
        <span class="bh-cell bh-cell--actions"><span class="bh-badge bh-badge--paid">Paid</span><button class="btn-link-blue" onclick="showToast('Invoice downloaded')">Get invoice</button></span>
      </div>
      <div class="bh-table-row">
        <span class="bh-cell bh-date">November 21, 2025</span>
        <span class="bh-cell bh-sub">2-year Plus plan<br><a href="#" class="bh-sub-link" onclick="showToast('Plan details coming soon'); return false;">See what's included</a></span>
        <span class="bh-cell">Credit card</span>
        <span class="bh-cell">\$105.03</span>
        <span class="bh-cell bh-cell--actions"><span class="bh-badge bh-badge--paid">Paid</span><button class="btn-link-blue" onclick="showToast('Invoice downloaded')">Get invoice</button></span>
      </div>
      <div class="bh-table-row">
        <span class="bh-cell bh-date">November 21, 2025</span>
        <span class="bh-cell bh-sub">2-year Plus plan<br><a href="#" class="bh-sub-link" onclick="showToast('Plan details coming soon'); return false;">See what's included</a></span>
        <span class="bh-cell">Credit card</span>
        <span class="bh-cell">\$105.03</span>
        <span class="bh-cell"><span class="bh-badge bh-badge--failed">Payment failed</span></span>
      </div>
      <div class="bh-table-row">
        <span class="bh-cell bh-date">November 21, 2025</span>
        <span class="bh-cell bh-sub">2-year Plus plan<br><a href="#" class="bh-sub-link" onclick="showToast('Plan details coming soon'); return false;">See what's included</a></span>
        <span class="bh-cell">Credit card</span>
        <span class="bh-cell">\$105.03</span>
        <span class="bh-cell"><span class="bh-badge bh-badge--failed">Payment failed</span></span>
      </div>
      <div class="bh-table-row">
        <span class="bh-cell bh-date">November 21, 2025</span>
        <span class="bh-cell bh-sub">2-year Plus plan<br><a href="#" class="bh-sub-link" onclick="showToast('Plan details coming soon'); return false;">See what's included</a></span>
        <span class="bh-cell">Credit card</span>
        <span class="bh-cell">\$105.03</span>
        <span class="bh-cell"><span class="bh-badge bh-badge--failed">Payment failed</span></span>
      </div>
    </div>
    <div class="bh-mobile-cards">
      <div class="bh-mobile-card">
        <div class="bh-mobile-card-header">
          <span class="bh-mobile-date">March 13, 2026</span>
          <span class="bh-badge bh-badge--failed">Payment failed</span>
        </div>
        <div class="bh-mobile-body">
          <div class="bh-mobile-row"><span class="bh-mobile-label">Subscription</span><span class="bh-mobile-val">2-year Plus plan<br><a href="#" class="bh-sub-link" onclick="showToast('Plan details'); return false;">See what's included</a></span></div>
          <div class="bh-mobile-row"><span class="bh-mobile-label">Payment</span><span class="bh-mobile-val">Credit card</span></div>
        </div>
        <div class="bh-mobile-card-footer">
          <span class="bh-mobile-label">Amount</span>
          <span class="bh-mobile-amount">\$193.86</span>
        </div>
      </div>
      <div class="bh-mobile-card">
        <div class="bh-mobile-card-header">
          <span class="bh-mobile-date">March 11, 2026</span>
          <span class="bh-badge bh-badge--paid">Paid</span>
        </div>
        <div class="bh-mobile-body">
          <div class="bh-mobile-row"><span class="bh-mobile-label">Subscription</span><span class="bh-mobile-val">1-year Dedicated IP plan<br><a href="#" class="bh-sub-link" onclick="showToast('Plan details'); return false;">See what's included</a></span></div>
          <div class="bh-mobile-row"><span class="bh-mobile-label">Payment</span><span class="bh-mobile-val">Credit card</span></div>
        </div>
        <div class="bh-mobile-card-footer">
          <span class="bh-mobile-label">Amount</span>
          <span class="bh-mobile-amount">\$55.08</span>
          <button class="btn-link-blue" onclick="showToast('Invoice downloaded')"><span>Get invoice</span></button>
        </div>
      </div>
      <div class="bh-mobile-card">
        <div class="bh-mobile-card-header">
          <span class="bh-mobile-date">November 21, 2025</span>
          <span class="bh-badge bh-badge--paid">Paid</span>
        </div>
        <div class="bh-mobile-body">
          <div class="bh-mobile-row"><span class="bh-mobile-label">Subscription</span><span class="bh-mobile-val">2-year Plus plan<br><a href="#" class="bh-sub-link" onclick="showToast('Plan details'); return false;">See what's included</a></span></div>
          <div class="bh-mobile-row"><span class="bh-mobile-label">Payment</span><span class="bh-mobile-val">Credit card</span></div>
        </div>
        <div class="bh-mobile-card-footer">
          <span class="bh-mobile-label">Amount</span>
          <span class="bh-mobile-amount">\$105.03</span>
          <button class="btn-link-blue" onclick="showToast('Invoice downloaded')"><span>Get invoice</span></button>
        </div>
      </div>
      <div class="bh-mobile-card">
        <div class="bh-mobile-card-header">
          <span class="bh-mobile-date">November 21, 2025</span>
          <span class="bh-badge bh-badge--failed">Payment failed</span>
        </div>
        <div class="bh-mobile-body">
          <div class="bh-mobile-row"><span class="bh-mobile-label">Subscription</span><span class="bh-mobile-val">2-year Plus plan</span></div>
          <div class="bh-mobile-row"><span class="bh-mobile-label">Payment</span><span class="bh-mobile-val">Credit card</span></div>
        </div>
        <div class="bh-mobile-card-footer">
          <span class="bh-mobile-label">Amount</span>
          <span class="bh-mobile-amount">\$105.03</span>
        </div>
      </div>
      <div class="bh-mobile-card">
        <div class="bh-mobile-card-header">
          <span class="bh-mobile-date">November 21, 2025</span>
          <span class="bh-badge bh-badge--failed">Payment failed</span>
        </div>
        <div class="bh-mobile-body">
          <div class="bh-mobile-row"><span class="bh-mobile-label">Subscription</span><span class="bh-mobile-val">2-year Plus plan</span></div>
          <div class="bh-mobile-row"><span class="bh-mobile-label">Payment</span><span class="bh-mobile-val">Credit card</span></div>
        </div>
        <div class="bh-mobile-card-footer">
          <span class="bh-mobile-label">Amount</span>
          <span class="bh-mobile-amount">\$105.03</span>
        </div>
      </div>
      <div class="bh-mobile-card">
        <div class="bh-mobile-card-header">
          <span class="bh-mobile-date">November 21, 2025</span>
          <span class="bh-badge bh-badge--failed">Payment failed</span>
        </div>
        <div class="bh-mobile-body">
          <div class="bh-mobile-row"><span class="bh-mobile-label">Subscription</span><span class="bh-mobile-val">2-year Plus plan</span></div>
          <div class="bh-mobile-row"><span class="bh-mobile-label">Payment</span><span class="bh-mobile-val">Credit card</span></div>
        </div>
        <div class="bh-mobile-card-footer">
          <span class="bh-mobile-label">Amount</span>
          <span class="bh-mobile-amount">\$105.03</span>
        </div>
      </div>
    </div>
  </div>
</div>
`;

function getBillingPageHTML() {
  const appName = Navigate.getAppName();
  return BILLING_TEMPLATE_HTML.replace(/\{appName\}/g, appName);
}

// ============================================================
// TAB SWITCHING
// ============================================================

function switchBillingTab(tab) {
  const subPanel = document.getElementById("billing-tab-subscriptions");
  const histPanel = document.getElementById("billing-tab-history");
  const tabBtns = document.querySelectorAll("#panel-billing .tab-btn");

  if (subPanel) subPanel.style.display = tab === "subscriptions" ? "block" : "none";
  if (histPanel) histPanel.style.display = tab === "history" ? "block" : "none";

  tabBtns.forEach((btn, i) => {
    btn.classList.toggle("active", (tab === "subscriptions" && i === 0) || (tab === "history" && i === 1));
  });

  const appName = Navigate.getAppName();
  const topbarTitle = document.querySelector(".topbar-title");
  const pageTitle = document.getElementById("billingPageTitle");

  if (tab === "history") {
    document.title = `Billing History | ${appName} Account`;
    window.history.replaceState({ page: "billing-history", tab: "history" }, "", "/billing/billing-history/");
    if (topbarTitle) topbarTitle.textContent = "Billing";
    if (pageTitle) pageTitle.textContent = "Billing History";
  } else {
    document.title = `My Subscriptions | ${appName} Account`;
    window.history.replaceState({ page: "billing", tab: "subscriptions" }, "", "/billing/my-subscriptions/");
    if (topbarTitle) topbarTitle.textContent = "Billing";
    if (pageTitle) pageTitle.textContent = "My Subscriptions";
  }
}

// Panggil switchBillingTab setelah template di-load untuk set tab aktif yang benar
function initBillingTab(activeTab) {
  switchBillingTab(activeTab);
}

// ============================================================
// FAQ TOGGLE
// ============================================================

function toggleBillingFaq(element) {
  const faqItem = element.closest(".faq-item");
  if (faqItem) faqItem.classList.toggle("open");
}
window.toggleBillingFaq = toggleBillingFaq;

// ============================================================
// EXPOSE GLOBALS (billing-specific saja)
// navigateTo, updateActiveMenu, dll. sudah ada di navigate.js
// ============================================================

window.switchBillingTab = switchBillingTab;
window.getBillingPageHTML = getBillingPageHTML;

// ============================================================
// INIT on DOMContentLoaded
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  console.log("[billing-settings] initialized");
  // Routing + nav wiring ditangani oleh navigate.js
});