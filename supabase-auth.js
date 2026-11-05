// ==========================================================================
// Digital Gramam CSC — Supabase Authentication & Citizen Member Portal
// ==========================================================================
//
// എങ്ങനെ നിങ്ങളുടെ സ്വന്തം Supabase അക്കൗണ്ട് ഇതിലേക്ക് കണക്ട് ചെയ്യാം:
// 1. https://supabase.com തുറന്ന് സൗജന്യ അക്കൗണ്ട് ഉണ്ടാക്കി "New Project" ക്ലിക്ക് ചെയ്യുക.
// 2. Project Settings -> API എടുക്കുക.
// 3. അവിടെയുള്ള "Project URL"-ഉം "anon public key"-യും താഴെ നൽകിയിരിക്കുന്ന
//    DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY എന്നിവയിൽ പേസ്റ്റ് ചെയ്യുക
//    (അല്ലെങ്കിൽ വെബ്സൈറ്റിലെ ലോഗിൻ വിൻഡോയിലെ "Supabase സെറ്റപ്പ്" ടാബിൽ നേരിട്ട് പേസ്റ്റ് ചെയ്യാം!).
// ==========================================================================

const DEFAULT_SUPABASE_URL = ""; // ഉദാ: "https://xyzcompany.supabase.co"
const DEFAULT_SUPABASE_ANON_KEY = ""; // ഉദാ: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

document.addEventListener("DOMContentLoaded", () => {
  const openAuthBtn = document.getElementById("open-auth-btn");
  const authBtnText = document.getElementById("auth-btn-text");
  const authBtnIcon = document.getElementById("auth-btn-icon");
  const authModal = document.getElementById("auth-modal-overlay");
  const authCloseBtn = document.getElementById("auth-modal-close");
  const authTabs = document.querySelectorAll(".auth-tab");
  const alertBox = document.getElementById("auth-alert-box");

  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const setupPanel = document.getElementById("supabase-setup-panel");
  const sbConfigForm = document.getElementById("supabase-config-form");
  const sbUrlInput = document.getElementById("sb-url-input");
  const sbKeyInput = document.getElementById("sb-key-input");

  const memberDashboard = document.getElementById("member-dashboard");
  const welcomeTitle = document.getElementById("md-welcome-title");
  const userMeta = document.getElementById("md-user-meta");
  const logoutBtn = document.getElementById("logout-btn");
  const openSbGuideBtn = document.getElementById("open-supabase-guide-btn");
  const memberServiceForm = document.getElementById("member-service-form");
  const applicationsList = document.getElementById("md-applications-list");

  let supabaseClient = null;
  let currentUser = null;

  // Load saved Supabase credentials or defaults
  function getSupabaseCreds() {
    const url = localStorage.getItem("dg_supabase_url") || DEFAULT_SUPABASE_URL;
    const key = localStorage.getItem("dg_supabase_key") || DEFAULT_SUPABASE_ANON_KEY;
    return { url: url.trim(), key: key.trim() };
  }

  function initSupabaseClient() {
    const { url, key } = getSupabaseCreds();
    if (sbUrlInput) sbUrlInput.value = url;
    if (sbKeyInput) sbKeyInput.value = key;

    if (url && key && window.supabase && typeof window.supabase.createClient === "function") {
      try {
        supabaseClient = window.supabase.createClient(url, key);
        checkActiveSession();
        return true;
      } catch (err) {
        console.warn("Supabase initialization error:", err);
      }
    }
    // Check fallback local session if Supabase keys are not yet entered
    checkLocalFallbackSession();
    return false;
  }

  async function checkActiveSession() {
    if (!supabaseClient) return;
    const { data } = await supabaseClient.auth.getSession();
    if (data && data.session && data.session.user) {
      setLoggedInUser({
        id: data.session.user.id,
        email: data.session.user.email,
        name: data.session.user.user_metadata?.full_name || data.session.user.email.split("@")[0],
        phone: data.session.user.user_metadata?.phone || "",
        mode: "Supabase Cloud"
      });
    } else {
      checkLocalFallbackSession();
    }
  }

  function checkLocalFallbackSession() {
    const saved = localStorage.getItem("dg_active_user");
    if (saved) {
      try {
        const userObj = JSON.parse(saved);
        setLoggedInUser(userObj);
      } catch (_) {}
    }
  }

  function showAlert(msg, type = "success") {
    if (!alertBox) return;
    alertBox.textContent = msg;
    alertBox.className = `auth-alert ${type}`;
    alertBox.classList.remove("hidden");
  }

  function hideAlert() {
    if (alertBox) alertBox.classList.add("hidden");
  }

  function switchAuthTab(tabName) {
    hideAlert();
    authTabs.forEach((t) => {
      t.classList.toggle("active", t.getAttribute("data-tab") === tabName);
    });
    if (loginForm) loginForm.classList.toggle("hidden", tabName !== "login");
    if (registerForm) registerForm.classList.toggle("hidden", tabName !== "register");
    if (setupPanel) setupPanel.classList.toggle("hidden", tabName !== "setup");
  }

  authTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      switchAuthTab(tab.getAttribute("data-tab"));
    });
  });

  if (openAuthBtn) {
    openAuthBtn.addEventListener("click", () => {
      if (currentUser) {
        // Scroll to unlocked Member Dashboard
        if (memberDashboard) {
          memberDashboard.classList.remove("hidden");
          memberDashboard.scrollIntoView({ behavior: "smooth" });
        }
      } else if (authModal) {
        hideAlert();
        authModal.classList.remove("hidden");
      }
    });
  }

  if (openSbGuideBtn) {
    openSbGuideBtn.addEventListener("click", () => {
      if (authModal) {
        authModal.classList.remove("hidden");
        switchAuthTab("setup");
      }
    });
  }

  if (authCloseBtn && authModal) {
    authCloseBtn.addEventListener("click", () => authModal.classList.add("hidden"));
    authModal.addEventListener("click", (e) => {
      if (e.target === authModal) authModal.classList.add("hidden");
    });
  }

  // Save Supabase URL & Key from Setup Tab
  if (sbConfigForm) {
    sbConfigForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const url = sbUrlInput.value.trim();
      const key = sbKeyInput.value.trim();
      localStorage.setItem("dg_supabase_url", url);
      localStorage.setItem("dg_supabase_key", key);
      initSupabaseClient();
      showAlert("✅ Supabase Project URL & Anon Key വിജയകരമായി സേവ് ചെയ്തു! ഇനി ലോഗിൻ/രജിസ്റ്റർ ചെയ്യാം.", "success");
    });
  }

  // Handle User Registration (Supabase Auth + Instant Local Fallback)
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      hideAlert();
      const name = document.getElementById("reg-name").value.trim();
      const phone = document.getElementById("reg-phone").value.trim();
      const email = document.getElementById("reg-email").value.trim().toLowerCase();
      const password = document.getElementById("reg-password").value;

      if (supabaseClient) {
        const { data, error } = await supabaseClient.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name, phone }
          }
        });
        if (error) {
          showAlert(`പിശക്: ${error.message}`, "error");
          return;
        }
        const userObj = {
          id: data.user?.id || Date.now().toString(),
          name,
          phone,
          email,
          mode: "Supabase Cloud"
        };
        localStorage.setItem("dg_active_user", JSON.stringify(userObj));
        setLoggedInUser(userObj);
        showAlert("🎉 രജിസ്ട്രേഷൻ വിജയകരം! നിങ്ങളുടെ മെമ്പർ ഡാഷ്‌ബോർഡ് തുറന്നിരിക്കുന്നു.", "success");
        setTimeout(() => authModal.classList.add("hidden"), 900);
      } else {
        // Local storage instant registration when Supabase keys aren't configured yet
        const users = JSON.parse(localStorage.getItem("dg_local_users") || "[]");
        if (users.some((u) => u.email === email)) {
          showAlert("ഈ ഇമെയിൽ ഉപയോഗിച്ച് നേരത്തെ അക്കൗണ്ട് എടുത്തിട്ടുണ്ട്. ദയവായി ലോഗിൻ ചെയ്യുക.", "error");
          return;
        }
        const newUser = {
          id: "DG-" + Math.floor(1000 + Math.random() * 9000),
          name,
          phone,
          email,
          password,
          mode: "Instant Portal Mode"
        };
        users.push(newUser);
        localStorage.setItem("dg_local_users", JSON.stringify(users));
        localStorage.setItem("dg_active_user", JSON.stringify(newUser));
        setLoggedInUser(newUser);
        showAlert("🎉 രജിസ്ട്രേഷൻ വിജയകരം! മെമ്പർ ഫീച്ചറുകൾ അൺലോക്ക് ചെയ്തു.", "success");
        setTimeout(() => authModal.classList.add("hidden"), 900);
      }
    });
  }

  // Handle User Login (Supabase Auth + Instant Local Fallback)
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      hideAlert();
      const email = document.getElementById("login-email").value.trim().toLowerCase();
      const password = document.getElementById("login-password").value;

      if (supabaseClient) {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email,
          password
        });
        if (error) {
          showAlert(`ലോഗിൻ പിശക്: ${error.message}`, "error");
          return;
        }
        const userObj = {
          id: data.user.id,
          name: data.user.user_metadata?.full_name || data.user.email.split("@")[0],
          phone: data.user.user_metadata?.phone || "",
          email: data.user.email,
          mode: "Supabase Cloud"
        };
        localStorage.setItem("dg_active_user", JSON.stringify(userObj));
        setLoggedInUser(userObj);
        authModal.classList.add("hidden");
      } else {
        const users = JSON.parse(localStorage.getItem("dg_local_users") || "[]");
        const found = users.find((u) => u.email === email && u.password === password);
        if (!found) {
          showAlert("ഇമെയിലോ പാസ്‌വേഡോ തെറ്റാണ്! പുതിയ ആളാണെങ്കിൽ 'പുതിയ രജിസ്ട്രേഷൻ' ടാബ് തിരഞ്ഞെടുക്കുക.", "error");
          return;
        }
        localStorage.setItem("dg_active_user", JSON.stringify(found));
        setLoggedInUser(found);
        authModal.classList.add("hidden");
      }
    });
  }

  function setLoggedInUser(user) {
    currentUser = user;
    if (openAuthBtn) openAuthBtn.classList.add("logged-in");
    if (authBtnIcon) authBtnIcon.className = "fa-solid fa-user-check";
    if (authBtnText) authBtnText.textContent = `${user.name} (മെമ്പർ)`;

    if (memberDashboard) {
      memberDashboard.classList.remove("hidden");
      if (welcomeTitle) welcomeTitle.textContent = `സ്വാഗതം, ${user.name}! 👋`;
      if (userMeta) {
        userMeta.textContent = `ഇമെയിൽ: ${user.email} ${user.phone ? "| ഫോൺ: " + user.phone : ""} • (${user.mode || "Verified Member"})`;
      }
      renderMemberApplications();
    }
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      if (supabaseClient) {
        await supabaseClient.auth.signOut();
      }
      localStorage.removeItem("dg_active_user");
      currentUser = null;
      if (openAuthBtn) openAuthBtn.classList.remove("logged-in");
      if (authBtnIcon) authBtnIcon.className = "fa-solid fa-user-lock";
      if (authBtnText) authBtnText.textContent = "ലോഗിൻ / രജിസ്റ്റർ";
      if (memberDashboard) memberDashboard.classList.add("hidden");
    });
  }

  // Handle Member Online Service Request Submission
  if (memberServiceForm) {
    memberServiceForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!currentUser) return;
      const serviceName = document.getElementById("md-service-name").value;
      const note = document.getElementById("md-service-note").value.trim();
      if (!serviceName) return;

      const tokenId = "DG-" + Math.floor(10000 + Math.random() * 90000);
      const newApp = {
        token: tokenId,
        userEmail: currentUser.email,
        service: serviceName,
        note,
        status: "പരിശോധനയിൽ (Processing)",
        date: new Date().toLocaleDateString("ml-IN")
      };

      // Save to Supabase table 'service_requests' if configured, and always sync locally
      if (supabaseClient) {
        try {
          await supabaseClient.from("service_requests").insert([
            {
              token_id: tokenId,
              user_email: currentUser.email,
              user_name: currentUser.name,
              service_name: serviceName,
              notes: note,
              status: "Processing"
            }
          ]);
        } catch (_) {}
      }

      const allApps = JSON.parse(localStorage.getItem("dg_member_apps") || "[]");
      allApps.unshift(newApp);
      localStorage.setItem("dg_member_apps", JSON.stringify(allApps));

      memberServiceForm.reset();
      renderMemberApplications();
    });
  }

  function renderMemberApplications() {
    if (!applicationsList || !currentUser) return;
    const allApps = JSON.parse(localStorage.getItem("dg_member_apps") || "[]");
    const myApps = allApps.filter((a) => a.userEmail === currentUser.email);

    if (myApps.length === 0) {
      applicationsList.innerHTML = `
        <div class="md-app-item">
          <div>
            <strong>സ്വാഗത ബോണസ് ടോക്കൺ (#DG-VIP01)</strong>
            <div style="font-size:0.75rem;color:#64748b;">ഡിജിറ്റൽ ഗ്രാമം സിഎസ്ഇ മെമ്പർഷിപ്പ് ആക്റ്റീവ് ആണ്</div>
          </div>
          <span class="md-status-pill">ആക്റ്റീവ് (Active)</span>
        </div>
      `;
      return;
    }

    applicationsList.innerHTML = myApps
      .map(
        (app) => `
        <div class="md-app-item">
          <div>
            <strong>${app.service}</strong> <small style="color:#003da5;">(${app.token})</small>
            <div style="font-size:0.75rem;color:#64748b;">${app.note} • ${app.date}</div>
          </div>
          <span class="md-status-pill">${app.status}</span>
        </div>
      `
      )
      .join("");
  }

  // Initialize on page load
  initSupabaseClient();
});
