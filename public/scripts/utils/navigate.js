(function (global) {
  "use strict";

  // ── Cek apakah session sudah expired ─────────────────────────
  function isSessionExpired() {
    const exp = sessionStorage.getItem("app_email_exp");
    if (!exp) return true; // tidak ada timestamp = expired
    return Date.now() > parseInt(exp, 10);
  }

  function clearExpiredSession() {
    sessionStorage.removeItem("app_email");
    sessionStorage.removeItem("app_email_exp");
    sessionStorage.removeItem("app_name_user");
    sessionStorage.removeItem("app_avatar");
    sessionStorage.removeItem("is_google");
  }

  // ── getEmail() dengan expiry check ───────────────────────────
  function getEmail() {
    if (isSessionExpired()) {
      clearExpiredSession();
      return "";
    }
    return (
      (global.AppPrefill && global.AppPrefill.email) ||
      sessionStorage.getItem("app_email") ||
      ""
    );
  }

  function getAvatar() {
    return (
      (global.AppPrefill && global.AppPrefill.avatar) ||
      sessionStorage.getItem("app_avatar") ||
      ""
    );
  }

  // ──────────────────────────────────────────────
  // HELPER — ambil app version dari berbagai sumber
  // ──────────────────────────────────────────────
  function getAppVer() {
    return (
      (global.AppPrefill && global.AppPrefill.appVer) ||
      sessionStorage.getItem("app_ver") ||
      localStorage.getItem("app_ver") ||
      ""
    );
  }

  // ──────────────────────────────────────────────
  // HELPER — ambil app name dari berbagai sumber
  // ──────────────────────────────────────────────
  function getAppName() {
    return (
      (global.AppPrefill && global.AppPrefill.appName) ||
      sessionStorage.getItem("app_name") ||
      localStorage.getItem("app_name") ||
      ""
    );
  }

  // ──────────────────────────────────────────────
  // TOAST NOTIFICATION
  // ──────────────────────────────────────────────
  var toastTimeout;

  function showToast(msg, isError) {
    isError = isError || false;
    var toast = document.getElementById("toastMsg");
    if (!toast) {
      console.log("Toast:", msg);
      return;
    }
    toast.textContent = msg;
    toast.style.background = isError ? "var(--accent-red)" : "var(--bg-card)";
    toast.style.color = isError ? "white" : "var(--text-primary)";
    toast.classList.add("show");
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(function () {
      toast.classList.remove("show");
    }, 2800);
  }

  // ──────────────────────────────────────────────
  // LOGOUT
  // ──────────────────────────────────────────────
  var STORAGE_KEYS = [
    "app_email",
    "app_name_user",
    "app_name",
    "app_ver",
    "app_user_email",
    "app_user_email_confirmed",
  ];

  function clearStorage() {
    STORAGE_KEYS.forEach(function (k) {
      localStorage.removeItem(k);
      sessionStorage.removeItem(k);
    });
  }

  async function logoutUser() {
    var email = getEmail();

    // 1. Panggil API logout
    if (email) {
      try {
        await fetch("/api/user?action=logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email }),
        });
      } catch (_) {
        // Tetap lanjut meski API gagal
      }
    }

    // 2. Bersihkan storage
    clearStorage();

    // 3. Toast lalu redirect ke login
    showToast("Logout Complete!");
    setTimeout(function () {
      if (global.Switcher) {
        global.Switcher.redirect("/login");
      } else {
        location.href = "/login";
      }
    }, 1500);
  }

  // ──────────────────────────────────────────────
  // USER CHIP POPUP
  // ──────────────────────────────────────────────
  function closeChipPopup() {
    var chipPopup = document.getElementById("chipPopup");
    if (chipPopup) chipPopup.classList.remove("open");
  }

  function initChipState() {
    var email = getEmail();

    var userChip  = document.getElementById("userChip");
    var chipEmail = document.getElementById("chipEmail");
    var chipAvatar = document.getElementById("chipAvatar");
    // Beberapa halaman pakai id, beberapa pakai class
    var chipCaret =
      document.getElementById("chipCaret") ||
      document.querySelector(".user-chip-caret");
    var chipPopup = document.getElementById("chipPopup");

    if (!email) {
      // ── BELUM LOGIN ──
      if (chipPopup) chipPopup.style.display = "none";
      if (chipEmail) {
        chipEmail.textContent = "Sign in";
        chipEmail.style.padding = "0 10px";
      }
      if (chipCaret) chipCaret.style.display = "none";
      if (chipAvatar) chipAvatar.style.display = "none";
      if (userChip) {
        userChip.style.cursor = "pointer";
        userChip.addEventListener("click", function (e) {
          e.stopPropagation();
          setTimeout(function () {
            if (global.Switcher) {
              global.Switcher.redirect("/login");
            } else {
              location.href = "/login";
            }
          }, 400);
        });
      }
      if (typeof attachRipples === "function") {
        attachRipples("#userChip");
      }
    } else {
      // ── SUDAH LOGIN ──
      if (chipEmail) chipEmail.textContent = email;

      // setTimeout agar jalan setelah prefill_from_app.js selesai overwrite textContent
      setTimeout(function () {
        var avatarUrl = getAvatar();
        var av = document.getElementById("chipAvatar");
        if (av) {
          if (avatarUrl) {
            var img = document.createElement("img");
            img.src = avatarUrl;
            img.alt = "";
            img.style.cssText = "width:100%;height:100%;border-radius:50%;object-fit:cover;display:block;";
            img.onerror = function () {
              av.innerHTML = "";
              av.textContent = email.charAt(0).toUpperCase();
              av.style.color = "#ffffff";
            };
            av.innerHTML = "";
            av.appendChild(img);
            av.style.background = "transparent";
            av.style.color = "";
          } else {
            av.textContent = email.charAt(0).toUpperCase();
            av.style.color = "#ffffff";
          }
        }
      }, 0);

      // Toggle popup
      if (userChip && chipPopup) {
        userChip.addEventListener("click", function (e) {
          e.stopPropagation();
          chipPopup.classList.toggle("open");
        });
      }

      // Tutup saat klik di luar
      document.addEventListener("click", function (e) {
        if (
          chipPopup &&
          !chipPopup.contains(e.target) &&
          !userChip.contains(e.target)
        ) {
          closeChipPopup();
        }
      });

      // Tutup saat Escape
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeChipPopup();
      });

      // Logout button di dalam chip popup
      var chipLogoutBtn = document.getElementById("chipLogoutBtn");
      if (chipLogoutBtn) {
        // Clone untuk buang event listener lama (jika ada)
        var newBtn = chipLogoutBtn.cloneNode(true);
        chipLogoutBtn.parentNode.replaceChild(newBtn, chipLogoutBtn);
        newBtn.addEventListener("click", function (e) {
          e.stopPropagation();
          closeChipPopup();
          logoutUser();
        });
      }
    }
  }

  // ──────────────────────────────────────────────
  // APP NAME PLACEHOLDERS
  // Isi semua elemen [data-placeholder="app_name"]
  // dan elemen dengan class tertentu sekaligus
  // ──────────────────────────────────────────────
  function initAppNamePlaceholders() {
    var appName = getAppName();
    if (!appName) return;

    document.querySelectorAll("[data-placeholder='app_name']").forEach(function (el) {
      el.textContent = appName;
    });

    // Class khusus per halaman
    [
      ".pricing-topbar-brand-name",
      ".support-topbar-brand-name",
      ".sidebar-brand-name",
    ].forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (el) {
        el.textContent = appName;
      });
    });

    // Ganti {_APP_NAME} di text node biasa (mis. footer)
    document.querySelectorAll(".support-footer-links span").forEach(function (el) {
      el.textContent = el.textContent.replace("{_APP_NAME}", appName);
    });
  }

  // ──────────────────────────────────────────────
  // BURGER / OVERLAY MENU
  // ──────────────────────────────────────────────
  function openMenu() {
    var overlay   = document.getElementById("menuOverlay");
    var burgerBtn = document.getElementById("burgerMenuBtn");
    var closeBtn  = document.getElementById("closeMenuBtn");
    if (!overlay) return;
    overlay.classList.add("open");
    document.body.classList.add("menu-open");
    if (burgerBtn) burgerBtn.setAttribute("aria-expanded", "true");
    if (closeBtn) closeBtn.focus();
  }

  function closeMenu() {
    var overlay   = document.getElementById("menuOverlay");
    var burgerBtn = document.getElementById("burgerMenuBtn");
    if (!overlay) return;
    overlay.classList.remove("open");
    overlay.classList.add("closing");
    document.body.classList.remove("menu-open");
    if (burgerBtn) burgerBtn.setAttribute("aria-expanded", "false");
    if (burgerBtn) burgerBtn.focus();
    setTimeout(function () { overlay.classList.remove("closing"); }, 280);
  }

  function initBurgerMenu() {
    var overlay   = document.getElementById("menuOverlay");
    var burgerBtn = document.getElementById("burgerMenuBtn");
    var closeBtn  = document.getElementById("closeMenuBtn");

    if (burgerBtn) burgerBtn.addEventListener("click", openMenu);
    if (closeBtn)  closeBtn.addEventListener("click", closeMenu);
    if (overlay) {
      overlay.addEventListener("click", function (e) {
        if (e.target === overlay) closeMenu();
      });
    }
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && overlay && overlay.classList.contains("open")) closeMenu();
    });
  }

  // ──────────────────────────────────────────────
  // ACTIVE MENU — satu fungsi untuk semua page
  // ──────────────────────────────────────────────
  var PAGE_TO_ACTION = {
    "home":             "Home",
    "account-settings": "Account settings",
    "billing":          "Billing",
    "pricing":          "Available plans",
    "redeem":           "Redeem",
    "refer":            "Refer a friend",
    "support":          "Support",
  };

  function updateActiveMenu(currentPage) {
    // Sidebar
    document.querySelectorAll(".sidebar-nav .nav-item").forEach(function (item) {
      item.classList.toggle("active", item.dataset.page === currentPage);
    });
    // Burger menu nav items
    var activeAction = PAGE_TO_ACTION[currentPage] || "";
    document.querySelectorAll(".menu-nav .nav-item").forEach(function (item) {
      item.classList.toggle("active", item.dataset.action === activeAction);
    });
  }

  // ──────────────────────────────────────────────
  // SPINNER & PANEL HELPERS
  // ──────────────────────────────────────────────
  function showSpinner() {
    var el = document.getElementById("pageSpinner");
    if (el) el.classList.add("visible");
  }

  function hideSpinner() {
    var el = document.getElementById("pageSpinner");
    if (el) el.classList.remove("visible");
    showFooter();
  }

  function showFooter() {
    var el = document.querySelector(".page-footer");
    if (el) el.style.display = "";
  }

  function hideAllPanels() {
    [
      "panel-home", "panel-account-settings", "panel-billing",
      "panel-pricing", "panel-refer", "panel-redeem", "panel-support",
    ].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.style.display = "none";
    });
    var pageFooter = document.querySelector(".page-footer");
    if (pageFooter) pageFooter.style.display = "none";
  }

  // ──────────────────────────────────────────────
  // SIDEBAR NAV WIRING
  // ──────────────────────────────────────────────
  var ROUTABLE_PAGES = [
    "home", "account-settings", "billing", "billing-history",
    "pricing", "redeem", "refer", "support",
  ];

  function initSidebarNav() {
    document.querySelectorAll(".sidebar-nav-item").forEach(function (item) {
      var page = item.dataset.page;
      if (!page) return;
      var newItem = item.cloneNode(true);
      newItem.removeAttribute("onclick"); // ← hapus onclick attribute dari HTML
      item.parentNode.replaceChild(newItem, item);
      newItem.addEventListener("click", function () {
        if (ROUTABLE_PAGES.indexOf(page) !== -1) {
          navigateTo(page);
        } else {
          showToast(newItem.textContent.trim() + " clicked");
        }
      });
    });
  }

  // ──────────────────────────────────────────────
  // BURGER MENU NAV ITEM WIRING
  // ──────────────────────────────────────────────
  var ACTION_TO_PAGE = {
    "Home":             "home",
    "Account settings": "account-settings",
    "Billing":          "billing",
    "Available plans":  "pricing",
    "Redeem":           "redeem",
    "Refer a friend":   "refer",
    "Support":          "support",
  };

  function initBurgerMenuNavItems() {
    document.querySelectorAll(".menu-nav .nav-item").forEach(function (item) {
      var action = item.dataset.action;
      if (!action) return;
      var newItem = item.cloneNode(true);
      newItem.removeAttribute("onclick");
      item.parentNode.replaceChild(newItem, item);
      newItem.addEventListener("click", function () {
        var page = ACTION_TO_PAGE[action];
        if (page) navigateTo(page);
        else showToast(action + " clicked");
        closeMenu();
      });
      newItem.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); newItem.click(); }
      });
    });
  }

  // ──────────────────────────────────────────────
  // MENU BUTTONS (Account Settings, Logout, Login)
  // ──────────────────────────────────────────────
  function initMenuButtons() {
    var menuAccountBtn = document.getElementById("menuAccountSettingsBtn");
    if (menuAccountBtn) {
      var newBtn = menuAccountBtn.cloneNode(true);
      menuAccountBtn.parentNode.replaceChild(newBtn, menuAccountBtn);
      newBtn.addEventListener("click", function () {
        navigateTo("account-settings");
        closeMenu();
      });
    }

    var menuLogoutBtn = document.getElementById("menuLogoutBtn");
    if (menuLogoutBtn) {
      var newLogoutBtn = menuLogoutBtn.cloneNode(true);
      menuLogoutBtn.parentNode.replaceChild(newLogoutBtn, menuLogoutBtn);
      newLogoutBtn.addEventListener("click", function () {
        closeMenu();
        logoutUser();
      });
    }

    // Login state di drawer
    setTimeout(function () {
      var email      = getEmail();
      var accountBtn = document.getElementById("menuAccountSettingsBtn");
      var logoutBtn  = document.getElementById("menuLogoutBtn");
      var loginBtn   = document.getElementById("menuLoginBtn");
      var menuEmail  = document.getElementById("menuEmail");
      var menuAvatar = document.getElementById("menuAvatar");
      var logoutDiv = document.getElementById("menuLogoutDivider");
      var userRow = document.getElementById("menuUserRow");

      if (!email) {
        if (userRow)    userRow.style.display     = "none";
        if (accountBtn) accountBtn.style.display  = "none";
        if (logoutBtn)  logoutBtn.style.display   = "none";
        if (logoutDiv)  logoutDiv.style.display   = "none";
        if (loginBtn) {
          loginBtn.style.display = "";
          loginBtn.style.marginTop = "20px";
          loginBtn.onclick = function () {
            closeMenu();
            if (global.Switcher) global.Switcher.redirect("/login");
            else location.href = "/login";
          };
        }
      } else {
        if (menuEmail)  menuEmail.textContent  = email;
        if (menuAvatar) {
          menuAvatar.style.display = "";
          var avatarUrl = getAvatar();
          if (avatarUrl) {
            var img = document.createElement("img");
            img.src = avatarUrl;
            img.alt = "";
            img.style.cssText = "width:100%;height:100%;border-radius:50%;object-fit:cover;display:block;";
            img.onerror = function () {
              menuAvatar.innerHTML = "";
              menuAvatar.textContent = email.charAt(0).toUpperCase();
            };
            menuAvatar.innerHTML = "";
            menuAvatar.appendChild(img);
          } else {
            menuAvatar.textContent = email.charAt(0).toUpperCase();
          }
        }
        if (accountBtn) accountBtn.style.display = "";
        if (accountBtn) accountBtn.style.marginTop = "";
        if (logoutBtn)  logoutBtn.style.display  = "";
        if (logoutDiv)  logoutDiv.style.display   = "";
        if (loginBtn)   loginBtn.style.display   = "none";
      }
    }, 0);
  }

  // ──────────────────────────────────────────────
  // SCROLLBAR HOVER (main-content)
  // ──────────────────────────────────────────────
  function initScrollbarHover() {
    document.querySelectorAll(".main-content").forEach(function (el) {
      el.addEventListener("mouseenter", function () { el.classList.add("scrollbar-visible"); });
      el.addEventListener("mouseleave", function () { el.classList.remove("scrollbar-visible"); });
    });
  }

  // ──────────────────────────────────────────────
  // NAVIGATION — navigateTo (SPA router)
  // ──────────────────────────────────────────────
  async function navigateTo(page) {
    // Tab Standalone
    var STANDALONE_PAGES = {
      "pricing" : "/pricing/",
      "redeem"  : "/activate/",
      "support" : "/support-center/",
    };

    if (STANDALONE_PAGES[page]) {
      global.open(STANDALONE_PAGES[page], "_blank");
      return;
    }

    showSpinner();
    hideAllPanels();
    await new Promise(function (r) { setTimeout(r, 200); });

    var appName     = getAppName();
    var topbarTitle = document.querySelector(".topbar-title");
    var mainContent = document.querySelector(".main-content");

    function _scrollTop() { if (mainContent) mainContent.scrollTop = 0; }

    // ── HOME ────────────────────────────────────
    if (page === "home") {
      var panel = document.getElementById("panel-home");
      if (panel) panel.style.display = "block";
      if (topbarTitle) topbarTitle.textContent = "Home";
      document.title = "Account Overview | " + appName + " Account";
      history.pushState({ page: page }, "", "/");
      updateActiveMenu("home");
      _scrollTop(); hideSpinner(); return;
    }

    // ── ACCOUNT SETTINGS ────────────────────────
    if (page === "account-settings") {
      var settingsPanel = document.getElementById("panel-account-settings");
      if (settingsPanel) {
        if (!settingsPanel.dataset.loaded) {
          var resolvedEmail    = getEmail();
          var resolvedIsGoogle = (global.AppPrefill && global.AppPrefill.isGoogle) ||
            sessionStorage.getItem("is_google") === "1" ||
            localStorage.getItem("is_google") === "1";
          try {
            var html = await fetchAccountSettingsHTML();
            if (resolvedEmail) {
              html = html.replace(/\{userEmail\}/g, resolvedEmail);
              if (!resolvedIsGoogle)
                html = html.replace("Connected to " + resolvedEmail, "Not connected");
            }
            settingsPanel.innerHTML = html;
            settingsPanel.dataset.loaded = "true";
          } catch (err) {
            console.error("[navigate] Gagal load account-settings:", err);
          }
        }
        if (typeof global.initAccountSettingsEvents === "function")
          global.initAccountSettingsEvents();
        settingsPanel.style.display = "block";
      }
      if (topbarTitle) topbarTitle.textContent = "Account settings";
      document.title = "Account Management | " + appName + " Account";
      history.pushState({ page: page }, "", "/account-settings/account-management");
      updateActiveMenu("account-settings");
      _scrollTop(); hideSpinner(); return;
    }

    // ── BILLING ─────────────────────────────────
    if (page === "billing" || page === "billing-history") {
      var billingPanel = document.getElementById("panel-billing");
      if (!billingPanel) {
        console.warn("[navigate] #panel-billing tidak ditemukan");
        hideSpinner(); return;
      }
      var activeTab = page === "billing-history" ? "history" : "subscriptions";
      if (!billingPanel.dataset.loaded) {
        if (typeof global.getBillingPageHTML === "function")
          billingPanel.innerHTML = global.getBillingPageHTML();
        billingPanel.dataset.loaded = "true";
        if (typeof global.initBillingTab === "function") global.initBillingTab(activeTab);
      } else {
        if (typeof global.switchBillingTab === "function") global.switchBillingTab(activeTab);
      }
      billingPanel.style.display = "block";
      if (topbarTitle) topbarTitle.textContent = "Billing";
      if (activeTab === "history") {
        document.title = "Billing History | " + appName + " Account";
        history.pushState({ page: page }, "", "/billing/billing-history/");
      } else {
        document.title = "My Subscriptions | " + appName + " Account";
        history.pushState({ page: page }, "", "/billing/my-subscriptions/");
      }
      updateActiveMenu("billing");
      _scrollTop(); hideSpinner(); return;
    }

    // ── REFER ────────────────────────────────────
    if (page === "refer") {
      var referPanel = document.getElementById("panel-refer");
      if (referPanel) {
        if (typeof global.injectReferStyles === "function") global.injectReferStyles();
        if (typeof global.initReferPanel   === "function") global.initReferPanel();
        referPanel.style.display = "block";
      }
      showFooter();
      if (topbarTitle) topbarTitle.textContent = "Refer a friend";
      document.title = "Refer a Friend | " + appName + " Account";
      history.pushState({ page: page }, "", "/referral/");
      updateActiveMenu("refer");
      _scrollTop(); hideSpinner(); return;
    }

    // ── Fallback ke home ─────────────────────────
    console.warn("[navigate] Unknown page:", page);
    var hp = document.getElementById("panel-home");
    if (hp) hp.style.display = "block";
    hideSpinner();
  }

  // ──────────────────────────────────────────────
  // ROUTER — initial route & popstate
  // ──────────────────────────────────────────────
  function checkInitialRoute() {
    var path = location.pathname;

    // Halaman-halaman ini punya script sendiri (pricing.js, redeem.js, support.js)
    // dan TIDAK dirender sebagai SPA panel — cukup skip routing di sini.
    if (
      path.startsWith("/pricing") ||
      path.startsWith("/activate") ||
      path.startsWith("/redeem") ||
      path.startsWith("/support")
    ) {
      hideSpinner();
      return;
    }

    if (path.includes("/billing-history"))                              { navigateTo("billing-history");   return; }
    if (path.startsWith("/billing"))                                    { navigateTo("billing");           return; }
    if (path.startsWith("/refer")  || path.startsWith("/referral"))    { navigateTo("refer");             return; }

    if (path.startsWith("/account-settings") || path === "/account") {
      navigateTo("account-settings").then(function () {
        if (path.includes("/account-security") && typeof global.switchTab === "function")
          global.switchTab("mfa");
      });
      return;
    }

    navigateTo("home");
  }

  global.addEventListener("popstate", function () {
    var path = location.pathname;
    if (path.includes("/billing-history"))                           { navigateTo("billing-history");   return; }
    if (path.startsWith("/billing"))                                 { navigateTo("billing");           return; }
    if (path.startsWith("/refer") || path.startsWith("/referral"))  { navigateTo("refer");             return; }
    if (path.startsWith("/account-settings") || path === "/account") {
      navigateTo("account-settings").then(function () {
        if (typeof global.switchTab === "function")
          global.switchTab(path.includes("/account-security") ? "mfa" : "account");
      });
      return;
    }
    navigateTo("home");
  });

  // ──────────────────────────────────────────────
  // AUTO-INIT saat DOM siap
  // ──────────────────────────────────────────────
  function initNavigate() {

    // // Cek expired saat halaman dibuka
    // if (isSessionExpired() && sessionStorage.getItem("app_email")) {
    //   clearExpiredSession();
    //   showToast("Session expired. Please login again.");
    //   setTimeout(() => {
    //     if (global.Switcher) global.Switcher.redirect("/login");
    //     else location.href = "/login";
    //   }, 1500);
    //   return; // stop init
    // }

    initBurgerMenu();
    initBurgerMenuNavItems();
    initMenuButtons();
    initSidebarNav();
    initChipState();
    initScrollbarHover();
    initAppNamePlaceholders();
    checkInitialRoute();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initNavigate);
  } else {
    initNavigate();
  }

  // ──────────────────────────────────────────────
  // EXPOSE ke global agar script halaman bisa pakai
  // ──────────────────────────────────────────────
  global.Navigate = {
    getEmail                : getEmail,
    getAppName              : getAppName,
    getAppVer               : getAppVer,
    showToast               : showToast,
    logoutUser              : logoutUser,
    closeChipPopup          : closeChipPopup,
    initChipState           : initChipState,
    initAppNamePlaceholders : initAppNamePlaceholders,
    updateActiveMenu        : updateActiveMenu,
    hideAllPanels           : hideAllPanels,
    showSpinner             : showSpinner,
    hideSpinner             : hideSpinner,
    showFooter              : showFooter,
    openMenu                : openMenu,
    closeMenu               : closeMenu,
    navigateTo              : navigateTo,
    checkInitialRoute       : checkInitialRoute,
  };

  // Backward-compat: fungsi lama masih bisa dipanggil langsung
  global.showToast        = showToast;
  global.logoutUser       = logoutUser;
  global.closeChipPopup   = closeChipPopup;
  global.navigateTo       = navigateTo;
  global.updateActiveMenu = updateActiveMenu;
  global.hideAllPanels    = hideAllPanels;
  global.showSpinner      = showSpinner;
  global.hideSpinner      = hideSpinner;
  global.openMenu         = openMenu;
  global.closeMenu        = closeMenu;

})(window);