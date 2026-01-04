/* =========================================================
   AKSHAT NETWORK – SMART NAV + BREADCRUMB + POLISHED NOTIFICATIONS
   Updated: 2026-01-04
   - Shows polished visit/notice/alert cards at timed intervals:
     30s, 2.5min (150s), 4min (240s), then every 4min afterward.
   - Uses page links to Akshat projects when available, otherwise
     shows network notices or cross-site alert (red) for external pages.
   - Stops after 2 consecutive dismissals in the same page load.
   - Settings card allows disabling notifications until a chosen time.
   - Small localStorage "DB" (AKSHAT_DB_v1) for quotes/messages is created
     without affecting other storage.
   - Color-coded cards: yellow = Visit, blue = Notice, red = Alert.
   - Non-intrusive UI and safe fallbacks.
   ========================================================= */
(function () {
  "use strict";

  if (!document.body) return;

  /* CONFIG */
  const BASE = "https://akshat-881236.github.io/"; // predefined prefix
  const STORE_KEY = "akshat_auto_nav_pref"; // user disable prefs
  const DB_KEY = "AKSHAT_DB_v1"; // internal small DB for messages/quotes
  const SESSION_IGNORE_KEY = "akshat_ignore_session"; // session flag
  const TIMINGS = [30000, 150000, 240000, 240000, 240000, 30000, 50000]; // 30s, 2.5min, 4min, then every 4min

  /* ---------- UTIL: storage pref check ---------- */
  const pref = JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
  if (pref.disabledUntil && Date.now() < pref.disabledUntil) {
    // explicitly disabled until time in prefs -> stop
    return;
  }

  /* ---------- Initialize small DB (quotes/messages) ---------- */
  function initDB() {
    const seed = {
      quotes: [
        "Keep building. Small steps every day lead to big results.",
        "Ship early, learn fast — the Akshat way.",
        "Curiosity fuels growth. Explore a project today."
      ],
      services: [
        "Akshat Network Hub — central index of projects & resources.",
        "Feedback Site — help us improve by sharing your thoughts.",
        "Learning Club — resources and guided lessons for students."
      ],
      dailyThoughts: [
        "Today: Learn one new thing and try to teach it to someone.",
        "Daily tip: Break big tasks into 25-minute focused sessions."
      ]
    };

    try {
      const curr = JSON.parse(localStorage.getItem(DB_KEY) || "null");
      if (!curr) {
        localStorage.setItem(DB_KEY, JSON.stringify(seed));
        return seed;
      }
      return curr;
    } catch (e) {
      // if parsing fails, reset safely
      localStorage.setItem(DB_KEY, JSON.stringify(seed));
      return seed;
    }
  }
  const AKDB = initDB();

  function getRandom(list) {
    if (!list || !list.length) return "";
    return list[Math.floor(Math.random() * list.length)];
  }

  /* ---------- PROJECTS DATA ---------- */
  const PROJECTS = [
    { title: "Akshat Network Hub", desc: "Central hub of all Akshat projects. Explore now!", url: BASE + "AkshatNetworkHub/" },
    { title: "Portfolio", desc: "Projects, skills & work showcase. Explore my professional journey", url: BASE + "Portfolio-881236/" },
    { title: "Profile Dashboard", desc: "Personal learning & activity dashboard. Visit it now!", url: BASE + "LocalRepo/" },
    { title: "Key of Success - Academic Record Management System", desc: "Manage academic records efficiently", url: BASE + "Key-of-Success/" },
    { title: "Akshat Journal", desc: "A personal Akshat Journal , Skills and Achievements Blogs", url: BASE + "sitemapjs/" },
    { title: "Quizzone", desc: "Interactive quizzes and learning platform", url: BASE + "Quizzone/" },
    { title: "QuizzoneAI", desc: "Simple Javascript db based low scale AI chatbot", url: BASE + "Quizzone/Home/QuizzoneAI.htm" },
    { title: "Feedback Site", desc: "Collect user feedback easily . Support us to improve more projects by giving feedback.", url: BASE + "Portfolio-881236/feedback.htm/" },
    { title: "Sitemap Generator", desc: "Generate sitemaps for your websites easily", url: BASE + "SitemapGeneratorXml/" },
    { title: "WebDevelopment", desc: "Resources for learning web development", url: BASE + "WebDevelopment/" },
    { title: "Learning Club - Power By KOS", desc: "A dedicated learning platform for students to enhance their skills and knowledge.", url: BASE + "LearningClub-Key-of-Success-Learning-Point/" }
  ];

  /* ---------- CONTAINER + STYLES ---------- */
  const wrap = document.createElement("div");
  wrap.id = "akshat-smart-ui";
  wrap.innerHTML = `
    <style>
      #akshat-smart-ui{position:fixed;inset:0;pointer-events:none;z-index:9999;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial}
      .akshat-card{
        position:fixed;
        right:20px;
        bottom:20px;
        width:320px;
        background:#fff;
        border-radius:14px;
        box-shadow:0 12px 48px rgba(0,0,0,.22);
        padding:14px 16px;
        pointer-events:auto;
        color:#111;
        overflow:hidden;
        animation:akFadeIn .36s ease;
      }
      .akshat-card h3{margin:0 0 6px;font-size:16px}
      .akshat-card p{margin:0 0 10px;font-size:13px;color:#333;line-height:1.3}
      .akshat-actions{display:flex;gap:8px;margin-top:8px}
      .akshat-actions a,
      .akshat-actions button{
        flex:1;
        font-size:13px;
        padding:8px;
        border-radius:10px;
        border:none;
        cursor:pointer;
      }
      .ak-visit{background: #f7d86b; color:#2b2b2b;} /* yellow */
      .ak-alert{background:#ff6b6b;color:#fff;} /* red */
      .ak-notice{background:#3b82f6;color:#fff;} /* blue */
      .akshat-close{
        position:absolute;top:8px;right:10px;font-size:14px;cursor:pointer;color:#666
      }
      .akshat-logo{width:44px;height:44px;border-radius:8px;float:right;margin-left:10px}
      @keyframes akFadeIn{from{transform:translateY(14px);opacity:0}to{transform:none;opacity:1}}
      /* Breadcrumb */
      #akshat-breadcrumb{
        position:fixed;top:8px;left:50%;transform:translateX(-50%);
        background:rgba(0,0,0,.75);color:#fff;padding:6px 12px;border-radius:20px;font-size:12px;
        opacity:0;transition:.4s;pointer-events:none;
      }
      #akshat-breadcrumb.show{opacity:1}
      /* Settings modal card override */
      .akshat-settings input[type="number"]{width:72px;padding:6px;border-radius:6px;border:1px solid #ddd}
      .akshat-settings .row{display:flex;gap:8px;align-items:center;margin-top:8px}
    </style>
    <div id="akshat-breadcrumb" aria-hidden="true"></div>
  `;
  document.body.appendChild(wrap);

  /* ---------- BREADCRUMB (kept) ---------- */
  const path = location.pathname.replace(/^\/+|\/+$/g,"");
  const parts = path ? path.split("/") : [];
  const bc = document.getElementById("akshat-breadcrumb");
  let bcText = "Home";
  parts.forEach(p => bcText += " › " + p.replace(/[-_]/g," ").replace(/\..*/,""));
  bc.textContent = bcText;
  let shown = false;
  window.addEventListener("scroll", () => {
    if (!shown) {
      bc.classList.add("show");
      setTimeout(() => bc.classList.remove("show"), 4000);
      shown = true;
    }
  });

  /* ---------- Helpers ---------- */
  function disableFor(ms) {
    localStorage.setItem(STORE_KEY, JSON.stringify({ disabledUntil: Date.now() + ms }));
  }

  function sessionStop() {
    try { sessionStorage.setItem(SESSION_IGNORE_KEY, "1"); } catch (e) {}
  }
  function sessionShouldStop() {
    try { return sessionStorage.getItem(SESSION_IGNORE_KEY) === "1"; } catch (e) { return false; }
  }

  /* ---------- Detect linked projects on current page ---------- */
  const anchors = Array.from(document.querySelectorAll("a[href]"));
  const linkedProjects = PROJECTS.filter(p => {
    // avoid suggesting the project user is already on
    if (location.href.startsWith(p.url)) return false;
    return anchors.some(a => {
      try {
        const ah = a.href;
        if (!ah) return false;
        if (ah === p.url) return true;
        if (ah.startsWith(p.url)) return true;
        // pathname match for relative links
        const pjPath = new URL(p.url).pathname.replace(/\/+$/,"");
        return ah.indexOf(pjPath) !== -1;
      } catch (e) {
        return a.getAttribute("href") && a.getAttribute("href").indexOf(p.url) !== -1;
      }
    });
  });

  const belongsToNetwork = location.href.startsWith(BASE);

  /* ---------- Determine sequence list depending on context ---------- */
  let SEQUENCE = [];
  if (linkedProjects.length) {
    SEQUENCE = linkedProjects.slice(); // show only linked projects
  } else if (belongsToNetwork) {
    // same network page but no explicit links: show general projects (but not current) as suggestions
    SEQUENCE = PROJECTS.filter(p => !location.href.startsWith(p.url)).slice(0, 6);
  } else {
    // external prefix: still show a red alert each load, and then show a visit suggestion to network hub
    SEQUENCE = [{ type: "external-alert" }, { ...PROJECTS[0] }]; // first alert then hub visit
  }

  /* ---------- Notification logic ---------- */
  let index = 0;
  let dismissStreak = 0; // consecutive dismissals
  let shownCount = 0;

  function scheduleNextAt(delay) {
    if (sessionShouldStop()) return;
    setTimeout(() => {
      // if user disabled in prefs while waiting, stop
      const p = JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
      if (p.disabledUntil && Date.now() < p.disabledUntil) return;
      if (sessionShouldStop()) return;
      showNext();
    }, delay);
  }

  function showNext() {
    if (sessionShouldStop()) return;
    if (index >= SEQUENCE.length) {
      // if we've exhausted initial list and are on external page, optionally repeat hub messages
      // continue repeating last behavior every 4 minutes
      index = SEQUENCE.length - 1;
    }
    const item = SEQUENCE[index];
    if (item && item.type === "external-alert") {
      showCard("alert", {
        title: "Akshat Network — External Page",
        msg: "This page does not belong to our network, but you can still use our global navigation system.",
        note: getRandom(AKDB.services)
      });
    } else if (item && item.url) {
      // Visit card: yellow
      showCard("visit", {
        title: item.title,
        url: item.url,
        desc: item.desc
      });
    } else {
      // fallback: blue notice
      showCard("notice", {
        title: "Aspiring Akshat Message",
        msg: getRandom(AKDB.quotes)
      });
    }

    shownCount++;
    // advance index for next scheduled show; once we advance past last, keep showing every 4min
    index = Math.min(index + 1, SEQUENCE.length);
    // schedule next: if shownCount < TIMINGS.length use corresponding delay else use last (4min)
    const nextDelay = TIMINGS[Math.min(shownCount, TIMINGS.length - 1)];
    scheduleNextAt(nextDelay);
  }

  /* ---------- Card renderer (polished) ---------- */
  function showCard(kind, payload) {
    // kind: "visit" | "notice" | "alert" | "settings"
    if (sessionShouldStop()) return;

    const card = document.createElement("div");
    card.className = "akshat-card";

    // base HTML pieces
    const closeHtml = `<span class="akshat-close" title="Dismiss">✕</span>`;
    const logoUrl = "https://akshat-881236.github.io/TrackerJS/Assets/AKNH/icon-96.png";
    let inner = "";

    if (kind === "visit") {
      card.style.background = "#fff";
      inner = `
        ${closeHtml}
        <img src="${logoUrl}" alt="Akshat Logo" class="akshat-logo"/>
        <h3><a href="${payload.url}" target="_blank" rel="noopener" style="color:inherit;text-decoration:none">${payload.title}</a></h3>
        <p>${payload.desc}</p>
        <div class="akshat-actions">
          <a class="ak-visit" href="${payload.url}" target="_blank" rel="noopener">Visit</a>
          <button type="button" class="akshat-later">Later</button>
        </div>
      `;
    } else if (kind === "notice") {
      inner = `
        ${closeHtml}
        <img src="${logoUrl}" alt="Akshat Logo" class="akshat-logo"/>
        <h3>${payload.title}</h3>
        <p>${payload.msg}</p>
        <div class="akshat-actions">
          <a class="ak-notice" href="${BASE}AkshatNetworkHub/" target="_blank" rel="noopener">Learn more</a>
          <button type="button" class="akshat-later">Later</button>
        </div>
      `;
    } else if (kind === "alert") {
      inner = `
        ${closeHtml}
        <img src="${logoUrl}" alt="Akshat Logo" class="akshat-logo"/>
        <h3 style="color:#b91c1c">${payload.title}</h3>
        <p style="color:#6b1a1a">${payload.msg}</p>
        <p style="font-size:12px;color:#444">${payload.note || ""}</p>
        <div class="akshat-actions">
          <button class="ak-alert" type="button">Ok</button>
          <button type="button" class="akshat-settings-btn">Settings</button>
        </div>
      `;
    } else if (kind === "settings") {
      inner = `
        ${closeHtml}
        <img src="${logoUrl}" alt="Akshat Logo" class="akshat-logo"/>
        <h3>Notification Settings</h3>
        <p>Turn off Akshat project notifications until:</p>
        <div class="akshat-settings">
          <div class="row">
            <button id="ak-disable-1h">1 Hour</button>
            <button id="ak-disable-today">Today</button>
            <button id="ak-disable-week">1 Week</button>
          </div>
          <div class="row" style="margin-top:10px">
            <label style="font-size:13px">Custom (minutes):</label>
            <input id="ak-disable-min" type="number" min="1" placeholder="Minutes" />
            <button id="ak-disable-set">Set</button>
          </div>
        </div>
      `;
    }

    card.innerHTML = inner;
    // apply kind-specific color border or box shadow
    if (kind === "visit") {
      card.style.borderLeft = "6px solid #f2c94c";
    } else if (kind === "notice") {
      card.style.borderLeft = "6px solid #3b82f6";
    } else if (kind === "alert") {
      card.style.borderLeft = "6px solid #ef4444";
    } else {
      card.style.borderLeft = "6px solid #777";
    }

    // attach close/dismiss handlers
    const closeEl = card.querySelector(".akshat-close");
    const laterBtn = card.querySelector(".akshat-later");
    const settingsBtn = card.querySelector(".akshat-settings-btn");

    function onDismiss() {
      try { card.remove(); } catch (e) {}
      dismissStreak++;
      if (dismissStreak >= 2) {
        // after 2 consecutive dismissals we stop further notifications this session
        sessionStop();
      }
      // advance index to next (handled by scheduleNext)
    }
    function onInteractThatResetsStreak() {
      dismissStreak = 0; // user engaged (clicked Visit, Ok), reset the streak
    }

    if (closeEl) closeEl.onclick = onDismiss;
    if (laterBtn) laterBtn.onclick = onDismiss;
    // Visit link resets streak
    const visitLink = card.querySelector("a.ak-visit");
    if (visitLink) visitLink.onclick = onInteractThatResetsStreak;

    // alert Ok button resets streak
    const okBtn = card.querySelector("button.ak-alert");
    if (okBtn) okBtn.onclick = function () { onInteractThatResetsStreak(); try { card.remove(); } catch (e) {} };

    // settings button opens settings card
    if (settingsBtn) {
      settingsBtn.onclick = function () {
        try { card.remove(); } catch (e) {}
        showCard("settings", {});
      };
    }

    // settings actions
    if (kind === "settings") {
      setTimeout(() => { // allow element to be attached
        const b1 = card.querySelector("#ak-disable-1h");
        const bt = card.querySelector("#ak-disable-today");
        const bw = card.querySelector("#ak-disable-week");
        const minInput = card.querySelector("#ak-disable-min");
        const setBtn = card.querySelector("#ak-disable-set");

        if (b1) b1.onclick = () => { disableFor(3600000); try { card.remove(); } catch (e) {} };
        if (bt) bt.onclick = () => { disableFor(86400000); try { card.remove(); } catch (e) {} };
        if (bw) bw.onclick = () => { disableFor(7 * 24 * 3600000); try { card.remove(); } catch (e) {} };
        if (setBtn) setBtn.onclick = () => {
          const m = parseInt(minInput.value, 10);
          if (!isNaN(m) && m > 0) {
            disableFor(m * 60000);
            try { card.remove(); } catch (e) {}
          } else {
            // small feedback change text
            setBtn.textContent = "Set (enter minutes)";
            setTimeout(()=>setBtn.textContent = "Set", 1400);
          }
        };
      }, 60);
    }

    // append card to body
    document.body.appendChild(card);

    // small auto-focus for accessibility: make close clickable via keyboard
    card.tabIndex = -1;

    // keep visit/notice/alert behavior: if user interacts (visit) reset dismiss streak otherwise a close increments it
    // No automatic removal unless dismissed.

    // If user disabled prefs while card active, reflect it via border or message (non-blocking)
    const currentPref = JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
    if (currentPref.disabledUntil && Date.now() < currentPref.disabledUntil) {
      // show a small disable indicator
      const note = document.createElement("div");
      note.style.fontSize = "12px";
      note.style.marginTop = "8px";
      note.style.color = "#666";
      note.textContent = "Notifications are currently disabled.";
      card.appendChild(note);
    }
  }

  /* ---------- Start sequence scheduling ----------
     First show after 30s, then 150s, then 240s, then every 240s.
     If there are no items in SEQUENCE (shouldn't happen), show a single notice.
  ---------- */
  if (!SEQUENCE.length) {
    // fallback: show a notice once
    setTimeout(() => {
      showCard("notice", { title: "Akshat Network", msg: getRandom(AKDB.dailyThoughts) });
    }, 30000);
  } else {
    // schedule first show after 30s
    setTimeout(() => {
      // if disabled by prefs while waiting, stop
      const p = JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
      if (p.disabledUntil && Date.now() < p.disabledUntil) return;
      showNext();
    }, TIMINGS[0]);
  }

})();