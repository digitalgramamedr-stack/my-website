// ==========================================================================
// Digital Gramam CSC & DigiPrint — Main Application Script
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  // Set current year in footer
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Flatten all services for quick lookup & chatbot
  const allServicesFlat = [];
  SERVICES_CATEGORIES.forEach((cat) => {
    cat.subcategories.forEach((sub) => {
      sub.items.forEach((item) => {
        allServicesFlat.push({
          ...item,
          categoryId: cat.id,
          categoryTitle: cat.title,
          subcategoryName: sub.name
        });
      });
    });
  });

  // 1. Initialize Logo-themed Floating Digital Pixels
  initPixelParticles();

  // 2. Populate Hero Quick Dropdown Selector (Category -> Service -> Required Documents)
  initQuickDropdownFinder(allServicesFlat);

  // 3. Render Category Filter Tabs & Main Services Accordion Grid
  let activeCategory = "all";
  let searchQuery = "";
  renderCategoryTabs();
  renderServicesAccordion();

  // 4. Render DigiPrint Inline Grid & Popup Modal
  renderDigiPrintShowcases();
  initDigiPrintModalTriggers();

  // 5. Initialize Expand/Collapse & Search Listeners
  initFilterControls();

  // 6. Initialize Live Chatbot ("ഡിജിറ്റൽ ഗ്രാമം സഹായി")
  initLiveChatbot(allServicesFlat);

  // 7. Mobile Navbar Menu Toggle
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const navLinks = document.getElementById("nav-links");
  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener("click", () => {
      navLinks.classList.toggle("mobile-open");
    });
    navLinks.querySelectorAll("a, button").forEach((el) => {
      el.addEventListener("click", () => navLinks.classList.remove("mobile-open"));
    });
  }

  // ========================================================================
  // Function Definitions
  // ========================================================================

  function initPixelParticles() {
    const container = document.getElementById("pixel-particles");
    if (!container) return;
    const colors = ["#009e49", "#003da5", "#10b981", "#0ea5e9", "#fbbf24"];
    for (let i = 0; i < 22; i++) {
      const sq = document.createElement("div");
      sq.className = "pixel-square";
      const size = Math.floor(Math.random() * 14) + 8;
      sq.style.width = `${size}px`;
      sq.style.height = `${size}px`;
      sq.style.left = `${Math.random() * 100}%`;
      sq.style.backgroundColor = colors[i % colors.length];
      sq.style.animationDuration = `${Math.random() * 14 + 12}s`;
      sq.style.animationDelay = `${Math.random() * 10}s`;
      container.appendChild(sq);
    }
  }

  function initQuickDropdownFinder(flatList) {
    const catSelect = document.getElementById("category-select");
    const srvSelect = document.getElementById("service-select");
    const resultPanel = document.getElementById("quick-result-panel");
    if (!catSelect || !srvSelect || !resultPanel) return;

    // Populate Category Select
    SERVICES_CATEGORIES.forEach((cat) => {
      const opt = document.createElement("option");
      opt.value = cat.id;
      opt.textContent = `${cat.title}`;
      catSelect.appendChild(opt);
    });

    // Add DigiPrint option in Category Select
    const dpOpt = document.createElement("option");
    dpOpt.value = "digiprint";
    dpOpt.textContent = "ഡിജി പ്രിന്റ് (DigiPrint Custom Printing & Gifting)";
    catSelect.appendChild(dpOpt);

    function populateServiceDropdown(selectedCatId) {
      srvSelect.innerHTML = `<option value="">-- ഒരു സേവനം തിരഞ്ഞെടുക്കുക (Select Service) --</option>`;

      if (selectedCatId === "digiprint") {
        DIGIPRINT_ITEMS.forEach((dp) => {
          const opt = document.createElement("option");
          opt.value = dp.id;
          opt.textContent = `${dp.title} (${dp.en})`;
          srvSelect.appendChild(opt);
        });
        return;
      }

      const filtered =
        selectedCatId === "all"
          ? flatList
          : flatList.filter((s) => s.categoryId === selectedCatId);

      filtered.forEach((srv) => {
        const opt = document.createElement("option");
        opt.value = srv.id;
        opt.textContent = `${srv.ml} (${srv.en})`;
        srvSelect.appendChild(opt);
      });

      if (selectedCatId === "all") {
        DIGIPRINT_ITEMS.forEach((dp) => {
          const opt = document.createElement("option");
          opt.value = dp.id;
          opt.textContent = `[DigiPrint] ${dp.title} (${dp.en})`;
          srvSelect.appendChild(opt);
        });
      }
    }

    populateServiceDropdown("all");

    catSelect.addEventListener("change", (e) => {
      populateServiceDropdown(e.target.value);
      resultPanel.classList.add("hidden");
    });

    srvSelect.addEventListener("change", (e) => {
      const val = e.target.value;
      if (!val) {
        resultPanel.classList.add("hidden");
        return;
      }

      // Check if DigiPrint item
      const dpItem = DIGIPRINT_ITEMS.find((d) => d.id === val);
      if (dpItem) {
        const waText = encodeURIComponent(
          `നമസ്കാരം ഡിജിറ്റൽ ഗ്രാമം CSC, എനിക്ക് DigiPrint-ൽ "${dpItem.title} (${dpItem.en})" ഓർഡർ ചെയ്യാൻ താല്പര്യമുണ്ട്.`
        );
        resultPanel.innerHTML = `
          <div class="qr-top">
            <div>
              <div class="qr-title">${dpItem.title}</div>
              <div class="qr-en">${dpItem.en}</div>
            </div>
            <div class="qr-badges">
              <span class="qr-badge"><i class="fa-solid fa-print"></i> DigiPrint Studio</span>
              <span class="qr-badge"><i class="fa-solid fa-tag"></i> ${dpItem.tag}</span>
            </div>
          </div>
          <p style="font-size:0.88rem;color:#475569;">${dpItem.desc}</p>
          <ul class="qr-docs-list">
            ${dpItem.reqs.map((r) => `<li><i class="fa-solid fa-circle-check"></i> <span>${r}</span></li>`).join("")}
          </ul>
          <div class="qr-actions">
            <a href="https://wa.me/917356437712?text=${waText}" target="_blank" rel="noopener" class="btn-wa-apply">
              <i class="fa-brands fa-whatsapp"></i> വാട്സാപ്പിൽ ഫോട്ടോ/വിവരങ്ങൾ അയക്കുക (7356437712)
            </a>
            <a href="tel:04872083582" class="btn-call-small">
              <i class="fa-solid fa-phone"></i> 0487 2083582
            </a>
          </div>
        `;
        resultPanel.classList.remove("hidden");
        return;
      }

      // Standard CSC Service
      const srv = flatList.find((s) => s.id === val);
      if (!srv) return;

      const waText = encodeURIComponent(
        `നമസ്കാരം ഡിജിറ്റൽ ഗ്രാമം CSC, എനിക്ക് "${srv.ml} (${srv.en})" സേവനത്തിനായി അപേക്ഷിക്കാൻ താല്പര്യമുണ്ട്.`
      );

      resultPanel.innerHTML = `
        <div class="qr-top">
          <div>
            <div class="qr-title">${srv.ml}</div>
            <div class="qr-en">${srv.en}</div>
          </div>
          <div class="qr-badges">
            <span class="qr-badge"><i class="fa-solid fa-globe"></i> ${srv.portal}</span>
            <span class="qr-badge"><i class="fa-regular fa-clock"></i> ${srv.time}</span>
          </div>
        </div>
        <p style="font-size:0.88rem;color:#475569;">${srv.desc}</p>
        <div style="font-size:0.85rem;font-weight:800;color:#001f5c;margin-top:10px;">
          <i class="fa-solid fa-file-shield" style="color:#009e49;"></i> ആവശ്യമായ ഡോക്യുമെന്റുകൾ (Required Documents):
        </div>
        <ul class="qr-docs-list">
          ${srv.docs.map((d) => `<li><i class="fa-solid fa-circle-check"></i> <span>${d}</span></li>`).join("")}
        </ul>
        <div class="qr-actions">
          <a href="https://wa.me/917356437712?text=${waText}" target="_blank" rel="noopener" class="btn-wa-apply">
            <i class="fa-brands fa-whatsapp"></i> വാട്സാപ്പ് വഴി ഡോക്യുമെന്റ്സ് അയച്ച് അപേക്ഷിക്കുക
          </a>
          <a href="tel:04872083582" class="btn-call-small">
            <i class="fa-solid fa-phone"></i> വിളിക്കുക: 0487 2083582
          </a>
        </div>
      `;
      resultPanel.classList.remove("hidden");
    });
  }

  function renderCategoryTabs() {
    const tabsContainer = document.getElementById("category-tabs");
    if (!tabsContainer) return;

    let html = `
      <button type="button" class="cat-tab ${activeCategory === "all" ? "active" : ""}" data-cat="all">
        <i class="fa-solid fa-border-all"></i> എല്ലാ സേവനങ്ങളും
      </button>
    `;

    SERVICES_CATEGORIES.forEach((cat) => {
      html += `
        <button type="button" class="cat-tab ${activeCategory === cat.id ? "active" : ""}" data-cat="${cat.id}">
          <i class="fa-solid ${cat.icon}"></i> ${cat.title}
        </button>
      `;
    });

    // Special DigiPrint Tab with transparent logo icon
    html += `
      <button type="button" class="cat-tab digiprint-tab" id="tab-open-digiprint">
        <img src="assets/digiprint-logo.png" alt="DigiPrint" />
        <span>ഡിജി പ്രിന്റ് (DigiPrint)</span>
      </button>
    `;

    tabsContainer.innerHTML = html;

    tabsContainer.querySelectorAll(".cat-tab[data-cat]").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeCategory = btn.getAttribute("data-cat");
        renderCategoryTabs();
        renderServicesAccordion();
      });
    });

    const dpTabBtn = document.getElementById("tab-open-digiprint");
    if (dpTabBtn) {
      dpTabBtn.addEventListener("click", () => {
        const dpSec = document.getElementById("digiprint-section");
        if (dpSec) dpSec.scrollIntoView({ behavior: "smooth" });
        openDigiPrintModal();
      });
    }
  }

  function renderServicesAccordion() {
    const container = document.getElementById("services-container");
    const countBadge = document.getElementById("service-count-badge");
    if (!container) return;

    const q = searchQuery.trim().toLowerCase();
    let totalMatched = 0;
    let html = "";

    SERVICES_CATEGORIES.forEach((cat) => {
      if (activeCategory !== "all" && activeCategory !== cat.id) return;

      let catHasMatch = false;
      let subHtml = "";

      cat.subcategories.forEach((sub) => {
        const matchedItems = sub.items.filter((item) => {
          if (!q) return true;
          const inMl = item.ml.toLowerCase().includes(q);
          const inEn = item.en.toLowerCase().includes(q);
          const inDesc = item.desc.toLowerCase().includes(q);
          const inDocs = item.docs.some((d) => d.toLowerCase().includes(q));
          return inMl || inEn || inDesc || inDocs;
        });

        if (matchedItems.length > 0) {
          catHasMatch = true;
          totalMatched += matchedItems.length;

          subHtml += `
            <div class="subcategory-wrapper">
              <h4 class="subcategory-heading">${sub.name}</h4>
              <div class="services-grid">
                ${matchedItems
                  .map((srv) => {
                    const waLink = `https://wa.me/917356437712?text=${encodeURIComponent(
                      `നമസ്കാരം ഡിജിറ്റൽ ഗ്രാമം CSC, "${srv.ml} (${srv.en})" സേവനത്തിനായി അപേക്ഷിക്കാൻ ആഗ്രഹിക്കുന്നു.`
                    )}`;
                    const autoOpenClass = q.length > 1 ? "open" : "";
                    return `
                      <div class="service-card ${autoOpenClass}" data-service-id="${srv.id}">
                        <button type="button" class="service-trigger" aria-expanded="${q.length > 1 ? "true" : "false"}">
                          <div class="st-left">
                            <div class="st-title-ml">${srv.ml}</div>
                            <span class="st-title-en">${srv.en}</span>
                            <p class="st-desc">${srv.desc}</p>
                          </div>
                          <div class="st-right">
                            <span class="st-doc-pill"><i class="fa-solid fa-file-lines"></i> ${srv.docs.length} രേഖകൾ</span>
                            <span class="st-arrow"><i class="fa-solid fa-chevron-down"></i></span>
                          </div>
                        </button>
                        <div class="service-dropdown-body">
                          <div class="sdb-meta">
                            <span class="sdb-meta-tag"><i class="fa-solid fa-Laptop-file"></i> പോർട്ടൽ: ${srv.portal}</span>
                            <span class="sdb-meta-tag"><i class="fa-regular fa-clock"></i> സമയം: ${srv.time}</span>
                          </div>
                          <div class="sdb-heading">
                            <i class="fa-solid fa-clipboard-check"></i> ആവശ്യമായ ഡോക്യുമെന്റുകൾ (Required Documents):
                          </div>
                          <ul class="sdb-doc-list">
                            ${srv.docs
                              .map(
                                (doc) => `<li><i class="fa-solid fa-check-circle"></i> <span>${doc}</span></li>`
                              )
                              .join("")}
                          </ul>
                          <div class="sdb-actions">
                            <a href="${waLink}" target="_blank" rel="noopener" class="btn-wa-apply">
                              <i class="fa-brands fa-whatsapp"></i> വാട്സാപ്പ് വഴി അപേക്ഷിക്കുക
                            </a>
                            <a href="tel:04872083582" class="btn-call-small">
                              <i class="fa-solid fa-phone"></i> 0487 2083582
                            </a>
                          </div>
                        </div>
                      </div>
                    `;
                  })
                  .join("")}
              </div>
            </div>
          `;
        }
      });

      if (catHasMatch) {
        html += `
          <div class="category-block" id="cat-${cat.id}">
            <div class="category-block-header">
              <div class="cb-title-group">
                <div class="cb-icon-circle" style="background: ${cat.color};">
                  <i class="fa-solid ${cat.icon}"></i>
                </div>
                <div>
                  <h3>${cat.title}</h3>
                  <p>${cat.subtitle}</p>
                </div>
              </div>
              <span class="cb-count-pill">${cat.badge}</span>
            </div>
            ${subHtml}
          </div>
        `;
      }
    });

    if (!html) {
      html = `
        <div style="text-align:center;padding:50px 20px;background:#fff;border-radius:20px;">
          <i class="fa-solid fa-magnifying-glass" style="font-size:2.5rem;color:#009e49;margin-bottom:12px;"></i>
          <h3>തിരഞ്ഞ സേവനം കണ്ടെത്താനായില്ല</h3>
          <p style="color:#64748b;margin:8px 0 16px;">നിങ്ങൾക്ക് ആവശ്യമുള്ള ഏത് ഓൺലൈൻ സേവനത്തിനും നേരിട്ട് ഞങ്ങളെ വിളിക്കുകയോ വാട്സാപ്പ് ചെയ്യുകയോ ചെയ്യാം.</p>
          <a href="https://wa.me/917356437712" target="_blank" rel="noopener" class="btn-primary-glow">
            <i class="fa-brands fa-whatsapp"></i> വാട്സാപ്പിൽ ചോദിക്കുക (7356437712)
          </a>
        </div>
      `;
    }

    container.innerHTML = html;

    if (countBadge) {
      countBadge.innerHTML = `തിരഞ്ഞെടുത്ത വിഭാഗത്തിൽ <strong>${totalMatched}</strong> പ്രധാന സേവന ഗ്രൂപ്പുകൾ (150+ ഉപസേവനങ്ങൾ) കാണിക്കുന്നു`;
    }

    // Attach click toggle for each service dropdown card
    container.querySelectorAll(".service-card").forEach((card) => {
      const trigger = card.querySelector(".service-trigger");
      if (trigger) {
        trigger.addEventListener("click", () => {
          const isOpen = card.classList.toggle("open");
          trigger.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });
      }
    });
  }

  function renderDigiPrintShowcases() {
    const inlineGrid = document.getElementById("digiprint-inline-grid");
    const modalGrid = document.getElementById("dp-modal-grid");

    const cardsHtml = DIGIPRINT_ITEMS.map((item) => {
      const waLink = `https://wa.me/917356437712?text=${encodeURIComponent(
        `നമസ്കാരം ഡിജിറ്റൽ ഗ്രാമം DigiPrint, എനിക്ക് "${item.title} (${item.en})" ഓർഡർ ചെയ്യാൻ താല്പര്യമുണ്ട്.`
      )}`;

      return `
        <div class="dp-item-card open" data-dp-id="${item.id}">
          <div>
            <div class="dp-item-top">
              <div class="dp-item-icon"><i class="fa-solid ${item.icon}"></i></div>
              <span class="dp-item-tag">${item.tag}</span>
            </div>
            <h4>${item.title}</h4>
            <span class="dp-item-en">${item.en}</span>
            <p class="dp-item-desc">${item.desc}</p>
          </div>
          <div class="dp-item-reqs">
            <ul>
              ${item.reqs.map((r) => `<li><i class="fa-solid fa-check"></i> <span>${r}</span></li>`).join("")}
            </ul>
            <a href="${waLink}" target="_blank" rel="noopener" class="btn-wa-apply" style="width:100%;">
              <i class="fa-brands fa-whatsapp"></i> ഓർഡർ ചെയ്യുക
            </a>
          </div>
        </div>
      `;
    }).join("");

    if (inlineGrid) {
      inlineGrid.innerHTML = cardsHtml;
      inlineGrid.querySelectorAll(".dp-item-card").forEach((card) => {
        card.addEventListener("click", (e) => {
          if (e.target.closest("a")) return;
          card.classList.toggle("open");
        });
      });
    }

    if (modalGrid) {
      modalGrid.innerHTML = cardsHtml;
    }
  }

  function openDigiPrintModal() {
    const modal = document.getElementById("dp-modal-overlay");
    if (modal) {
      modal.classList.remove("hidden");
      document.body.style.overflow = "hidden";
    }
  }

  function closeDigiPrintModal() {
    const modal = document.getElementById("dp-modal-overlay");
    if (modal) {
      modal.classList.add("hidden");
      document.body.style.overflow = "";
    }
  }

  function initDigiPrintModalTriggers() {
    const triggerIds = [
      "open-digiprint-nav",
      "open-digiprint-hero",
      "open-digiprint-card",
      "open-digiprint-main",
      "open-digiprint-btn"
    ];

    triggerIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener("click", openDigiPrintModal);
      }
    });

    const closeBtn = document.getElementById("dp-modal-close");
    const overlay = document.getElementById("dp-modal-overlay");
    if (closeBtn) closeBtn.addEventListener("click", closeDigiPrintModal);
    if (overlay) {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) closeDigiPrintModal();
      });
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeDigiPrintModal();
    });
  }

  function initFilterControls() {
    const searchInput = document.getElementById("service-search");
    const clearBtn = document.getElementById("clear-search");
    const expandAllBtn = document.getElementById("expand-all-btn");
    const collapseAllBtn = document.getElementById("collapse-all-btn");

    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        searchQuery = e.target.value;
        if (clearBtn) {
          clearBtn.classList.toggle("hidden", !searchQuery);
        }
        renderServicesAccordion();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        searchQuery = "";
        if (searchInput) searchInput.value = "";
        clearBtn.classList.add("hidden");
        renderServicesAccordion();
      });
    }

    if (expandAllBtn) {
      expandAllBtn.addEventListener("click", () => {
        document.querySelectorAll(".service-card").forEach((c) => c.classList.add("open"));
      });
    }

    if (collapseAllBtn) {
      collapseAllBtn.addEventListener("click", () => {
        document.querySelectorAll(".service-card").forEach((c) => c.classList.remove("open"));
      });
    }
  }

  // ========================================================================
  // Live Interactive Chatbot with Animated 3D AI Model ("ഡിജിറ്റൽ ഗ്രാമം AI സഹായി")
  // ========================================================================
  function initLiveChatbot(flatServices) {
    const toggleBtn = document.getElementById("chatbot-toggle-btn");
    const closeBtn = document.getElementById("chat-close-btn");
    const chatWin = document.getElementById("chatbot-window");
    const messagesBox = document.getElementById("chat-messages");
    const chatForm = document.getElementById("chat-form");
    const chatInput = document.getElementById("chat-input");
    const mascotSpeech = document.getElementById("ai-mascot-speech");
    const speechClose = document.getElementById("speech-close");
    const heroStage = document.getElementById("ai-chat-hero-stage");
    const statusText = document.getElementById("ai-status-text");
    const voiceBtn = document.getElementById("chat-voice-btn");

    if (!toggleBtn || !chatWin || !messagesBox) return;

    let voiceEnabled = false;

    if (speechClose && mascotSpeech) {
      speechClose.addEventListener("click", (e) => {
        e.stopPropagation();
        mascotSpeech.classList.add("hidden");
      });
    }

    if (voiceBtn) {
      voiceBtn.classList.add("muted");
      voiceBtn.addEventListener("click", () => {
        voiceEnabled = !voiceEnabled;
        voiceBtn.classList.toggle("muted", !voiceEnabled);
        if (!voiceEnabled && "speechSynthesis" in window) {
          window.speechSynthesis.cancel();
        }
      });
    }

    function triggerAISpeakingAnimation(durationMs = 2400, customStatus = "AI മറുപടി നൽകുന്നു...") {
      if (!heroStage) return;
      heroStage.classList.add("speaking");
      if (statusText) statusText.textContent = customStatus;
      setTimeout(() => {
        heroStage.classList.remove("speaking");
        if (statusText) statusText.textContent = "നിങ്ങളെ സഹായിക്കാൻ തയ്യാറാണ്!";
      }, durationMs);
    }

    function speakTextIfEnabled(plainText) {
      if (!voiceEnabled || !("speechSynthesis" in window)) return;
      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(plainText);
        utter.lang = "ml-IN";
        utter.rate = 1.0;
        window.speechSynthesis.speak(utter);
      } catch (_) {
        // Ignore speech synthesis errors on unsupported browsers
      }
    }

    function toggleChat() {
      const isHidden = chatWin.classList.toggle("hidden");
      if (!isHidden) {
        if (mascotSpeech) mascotSpeech.classList.add("hidden");
        triggerAISpeakingAnimation(2000, "നമസ്കാരം! എങ്ങനെ സഹായിക്കാം?");
        if (chatInput) chatInput.focus();
      }
    }

    toggleBtn.addEventListener("click", toggleChat);
    if (closeBtn) closeBtn.addEventListener("click", toggleChat);

    function appendMessage(html, sender = "bot") {
      const row = document.createElement("div");
      row.className = `chat-msg-row ${sender === "user" ? "user-row" : "bot-row"}`;

      if (sender === "bot") {
        const avatarImg = document.createElement("img");
        avatarImg.src = "assets/ai-avatar-head.png";
        avatarImg.alt = "AI Avatar";
        avatarImg.className = "msg-mini-avatar";
        row.appendChild(avatarImg);
      }

      const div = document.createElement("div");
      div.className = `chat-msg ${sender}`;
      div.innerHTML = html;
      row.appendChild(div);

      messagesBox.appendChild(row);
      messagesBox.scrollTop = messagesBox.scrollHeight;

      if (sender === "bot") {
        triggerAISpeakingAnimation(2500);
        const stripped = div.textContent || "";
        speakTextIfEnabled(stripped.slice(0, 180));
      }
    }

    // Initial Greeting
    appendMessage(`
      <strong>നമസ്കാരം! 🙏 ഡിജിറ്റൽ ഗ്രാമം സിഎസ്ഇ (Digital Gramam CSC)</strong> ലൈവ് ചാറ്റിലേക്ക് സ്വാഗതം.<br/><br/>
      നിങ്ങൾക്ക് ആവശ്യമുള്ള <strong>ഏത് സർട്ടിഫിക്കറ്റിന്റെയും സേവനത്തിന്റെയും പേര്</strong> ഇവിടെ ടൈപ്പ് ചെയ്താൽ അതിന് വേണ്ട ഡോക്യുമെന്റുകൾ ഉടൻ അറിയാം!<br/><br/>
      👤 <strong>ഓണർ:</strong> മിഥുൻ ലാൽ വി ബി<br/>
      📍 <strong>വിലാസം:</strong> എടക്കളത്തൂർ, പി.ഒ എടക്കളത്തൂർ, തൃശൂർ - 680552<br/>
      📞 <strong>കോൾ:</strong> <a href="tel:04872083582">0487 2083582</a><br/>
      💬 <strong>വാട്സാപ്പ്:</strong> <a href="https://wa.me/917356437712" target="_blank">7356437712</a>
    `);

    function handleUserQuery(rawText) {
      const query = rawText.trim();
      if (!query) return;
      appendMessage(query, "user");

      const q = query.toLowerCase();

      // Check for owner / contact / phone / address queries
      if (
        q.includes("ഫോൺ") ||
        q.includes("നമ്പർ") ||
        q.includes("phone") ||
        q.includes("contact") ||
        q.includes("owner") ||
        q.includes("ഓണർ") ||
        q.includes("മിഥുൻ") ||
        q.includes("midhun") ||
        q.includes("whatsapp") ||
        q.includes("വാട്സാപ്പ്") ||
        q.includes("mail") ||
        q.includes("ഇമെയിൽ") ||
        q.includes("address") ||
        q.includes("അഡ്രസ്") ||
        q.includes("വിലാസം") ||
        q.includes("സ്ഥലം") ||
        q.includes("എവിടെ") ||
        q.includes("location") ||
        q.includes("എടക്കളത്തൂർ") ||
        q.includes("edakalathur") ||
        q.includes("680552")
      ) {
        setTimeout(() => {
          appendMessage(`
            <strong>ഡിജിറ്റൽ ഗ്രാമം സിഎസ്ഇ (Digital Gramam CSC)</strong><br/>
            👤 <strong>ഓണർ:</strong> മിഥുൻ ലാൽ വി ബി (Midhun Lal V B)<br/>
            📍 <strong>വിലാസം:</strong> ഡിജിറ്റൽ ഗ്രാമം സിഎസ്ഇ, എടക്കളത്തൂർ, പി.ഒ എടക്കളത്തൂർ, തൃശൂർ, കേരള, പിൻകോഡ്: 680552<br/>
            📞 <strong>കോൾ നമ്പർ:</strong> <a href="tel:04872083582">0487 2083582</a><br/>
            💬 <strong>വാട്സാപ്പ്:</strong> <a href="https://wa.me/917356437712" target="_blank">+91 7356437712</a><br/>
            📧 <strong>ഇമെയിൽ:</strong> <a href="mailto:digitalgramamcsc@gmail.com">digitalgramamcsc@gmail.com</a>
          `);
        }, 250);
        return;
      }

      // Check for DigiPrint queries
      if (
        q.includes("digiprint") ||
        q.includes("ഡിജി പ്രിന്റ്") ||
        q.includes("ഡിജിപ്രിന്റ്") ||
        q.includes("frame") ||
        q.includes("ഫ്രെയിം") ||
        q.includes("polaroid") ||
        q.includes("പോളറോയിഡ്") ||
        q.includes("keychain") ||
        q.includes("കീചെയിൻ") ||
        q.includes("wallet") ||
        q.includes("വാലറ്റ്")
      ) {
        setTimeout(() => {
          appendMessage(`
            <strong>🎨 DIGI PRINT (ഡിജി പ്രിന്റ്) സേവനങ്ങൾ:</strong>
            <ul>
              <li>A4 ഫോട്ടോ ഫ്രെയിം &amp; മിനി ഫ്രെയിം</li>
              <li>പോളറോയിഡ്സ് &amp; ഫോട്ടോ ഹാംഗേഴ്സ്</li>
              <li>കസ്റ്റമൈസ്ഡ് കീ ചെയിൻ &amp; വാലറ്റ്സ്</li>
              <li>മിനി ആൽബം, ഫോട്ടോ മാഗസിൻ &amp; ബൊക്കെയ്സ്/ബുക്ക് കേസ്</li>
              <li>സ്കൂൾ &amp; ഫെസ്റ്റിവൽ ഐഡി കാർഡ്സ്, ഫ്ലാഗ്സ്</li>
              <li>എല്ലാത്തരം കസ്റ്റമൈസേഷനും ലഭ്യമാണ്!</li>
            </ul>
            വാട്സാപ്പിൽ ഫോട്ടോ അയക്കാൻ: <a href="https://wa.me/917356437712" target="_blank"><strong>7356437712</strong></a>
          `);
        }, 250);
        return;
      }

      // Search matching services from database
      const matches = flatServices.filter(
        (s) =>
          s.ml.toLowerCase().includes(q) ||
          s.en.toLowerCase().includes(q) ||
          s.desc.toLowerCase().includes(q)
      );

      setTimeout(() => {
        if (matches.length > 0) {
          const top = matches[0];
          const docsHtml = top.docs.map((d) => `<li>${d}</li>`).join("");
          appendMessage(`
            <strong>✅ ${top.ml} (${top.en})</strong><br/>
            <span style="font-size:0.78rem;color:#009e49;">പോർട്ടൽ: ${top.portal} | സമയം: ${top.time}</span><br/>
            <strong>ആവശ്യമായ രേഖകൾ:</strong>
            <ul>${docsHtml}</ul>
            <a href="https://wa.me/917356437712?text=${encodeURIComponent(
              "നമസ്കാരം, " + top.ml + " അപേക്ഷിക്കാൻ ആഗ്രഹിക്കുന്നു"
            )}" target="_blank" style="color:#16a34a;font-weight:700;">👉 വാട്സാപ്പ് വഴി അപേക്ഷിക്കുക (7356437712)</a>
          `);
        } else {
          appendMessage(`
            <strong>"${query}"</strong> എന്ന സേവനത്തെക്കുറിച്ചുള്ള കൂടുതൽ വിവരങ്ങൾക്കായി ഞങ്ങളെ നേരിട്ട് ബന്ധപ്പെടാവുന്നതാണ്:<br/>
            📞 കോൾ: <a href="tel:04872083582"><strong>0487 2083582</strong></a><br/>
            💬 വാട്സാപ്പ്: <a href="https://wa.me/917356437712" target="_blank"><strong>7356437712</strong></a>
          `);
        }
      }, 250);
    }

    if (chatForm) {
      chatForm.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!chatInput) return;
        const text = chatInput.value;
        chatInput.value = "";
        handleUserQuery(text);
      });
    }

    document.querySelectorAll(".chat-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        const q = chip.getAttribute("data-query");
        if (q) handleUserQuery(q);
      });
    });
  }
});
