/* =========================================================
   AKSHAT NETWORK – SMART NAV + BREADCRUMB + PROMO CARDS
   Single JS | innerHTML + CSS | Non-intrusive
   ========================================================= */
(function () {
  "use strict";

  if (!document.body) return;

  const BASE = "https://akshat-881236.github.io/";
  const STORE_KEY = "akshat_auto_nav_pref";

  /* ---------- USER PREF ---------- */
  const pref = JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
  if (pref.disabledUntil && Date.now() < pref.disabledUntil) return;

  /* ---------- PROJECT CARDS DATA ---------- */
  const PROJECTS = [
    {
      title: "Akshat Network Hub",
      desc: "Central hub of all Akshat projects. Explore now!",
      url: BASE + "AkshatNetworkHub/"
    },
    {
      title: "Portfolio",
      desc: "Projects, skills & work showcase. Explore my professional journey",
      url: BASE + "Portfolio-881236/"
    },
    {
      title: "Profile Dashboard",
      desc: "Personal learning & activity dashboard. Visit it now!",
      url: BASE + "LocalRepo/"
    },
    {
      title: "Key of Success - Academic Record Management System",
      desc: "Manage academic records efficiently",
      url: BASE + "Key-of-Success/"
    },
    {
      title: "Akshat Journal",
      desc: "A personal Akshat Journal , Skills and Achievements Blogs",
      url: BASE + "sitemapjs/"
    },
    {
      title: "Quizzone",
      desc: "Interactive quizzes and learning platform",
      url: BASE + "Quizzone/"
    },
    {
      title: "QuizzoneAI",
      desc: "Simple Javascript db based low scale AI chatbot",
      url: BASE + "Quizzone/Home/QuizzoneAI.htm"
    },
    {
      title: "Feedback Site",
      desc: "Collect user feedback easily . Support us to improve more projects by giving feedback.",
      url: BASE + "Portfolio-881236/feedback.htm/"
    },
    {
      title: "Sitemap Generator",
      desc: "Generate sitemaps for your websites easily",
      url: BASE + "SitemapGeneratorXml/"
    },
    {
      title: "WebDevelopment",
      desc: "Resources for learning web development",
      url: BASE + "WebDevelopment/"
    },
    {
      title: "Learning Club - Power By KOS",
      desc: "A dedicated learning platform for students to enhance their skills and knowledge.",
      url: BASE + "LearningClub-Key-of-Success-Learning-Point/"
    }
  ];

  /* ---------- CREATE CONTAINER ---------- */
  const wrap = document.createElement("div");
  wrap.id = "akshat-smart-ui";

  wrap.innerHTML = `
    <style>
      #akshat-smart-ui{position:fixed;inset:0;pointer-events:none;z-index:9999}
      .akshat-card{
        position:fixed;
        right:20px;
        bottom:20px;
        width:280px;
        background:#fff;
        border-radius:14px;
        box-shadow:0 10px 40px rgba(0,0,0,.18);
        padding:14px 16px;
        font-family:system-ui,sans-serif;
        animation:slideIn .5s ease;
        pointer-events:auto
      }
      .akshat-card h4{margin:0 0 6px;font-size:15px}
      .akshat-card p{margin:0 0 10px;font-size:13px;color:#555}
      .akshat-actions{display:flex;gap:8px}
      .akshat-actions a,
      .akshat-actions button{
        flex:1;
        font-size:12px;
        padding:6px;
        border-radius:8px;
        border:none;
        cursor:pointer
      }
      .akshat-actions a{
        background:#0066cc;
        color:#fff;
        text-align:center;
        text-decoration:none
      }
      .akshat-actions button{
        background:#eee
      }
      .akshat-close{
        position:absolute;
        top:6px;
        right:8px;
        font-size:14px;
        cursor:pointer;
        color:#999
      }
      @keyframes slideIn{
        from{transform:translateY(40px);opacity:0}
        to{transform:none;opacity:1}
      }

      /* Breadcrumb (hidden by default) */
      #akshat-breadcrumb{
        position:fixed;
        top:8px;
        left:50%;
        transform:translateX(-50%);
        background:rgba(0,0,0,.75);
        color:#fff;
        padding:6px 12px;
        border-radius:20px;
        font-size:12px;
        opacity:0;
        transition:.4s;
        pointer-events:none
      }
        /* Akshat Logo in Breadcrumb must be in center position*/
        .akshat-logo{
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
        }
      #akshat-breadcrumb.show{opacity:1}
    </style>

    <div id="akshat-breadcrumb"></div>
  `;

  document.body.appendChild(wrap);

  /* ---------- BREADCRUMB LOGIC ---------- */
  const path = location.pathname.replace(/^\/+|\/+$/g,"");
  const parts = path ? path.split("/") : [];
  const bc = document.getElementById("akshat-breadcrumb");

  let bcText = "Home";
  parts.forEach(p=>{
    bcText += " › " + p.replace(/[-_]/g," ").replace(/\..*/,"");
  });
  bc.textContent = bcText;

  /* Show breadcrumb on scroll */
  let shown=false;
  window.addEventListener("scroll",()=>{
    if(!shown){
      bc.classList.add("show");
      setTimeout(()=>bc.classList.remove("show"),4000);
      shown=true;
    }
  });

  /* ---------- PROMO CARD SEQUENCE ---------- */
  let index = 0;

  function showCard(project){
    const card = document.createElement("div");
    card.className="akshat-card";
    card.innerHTML=`
      <span class="akshat-close">✕</span>
      <img src="https://akshat-881236.github.io/TrackerJS/Assets/AKNH/icon-96.png" alt="Akshat Logo" style="width:40px;height:40px;float:right;margin-left:10px;border-radius:8px;" class="akshat-logo"/>
      <h1 style="margin-top:0;">Akshat Network Hub</h1>
      <p>We noticed you're exploring. Here’s a project you might find interesting:</p>
      <h4>${project.title}</h4>
      <p>${project.desc}</p>
      <div class="akshat-actions">
        <a href="${project.url}" target="_blank">Visit</a>
        <button>Later</button>
      </div>
    `;

    card.querySelector(".akshat-close").onclick =
    card.querySelector("button").onclick = ()=>{
      card.remove();
      index++;
      scheduleNext();
    };

    document.body.appendChild(card);
  }

  function scheduleNext(){
    if(index < PROJECTS.length){
      setTimeout(()=>showCard(PROJECTS[index]), 90000); // 1.5 min
    } else {
      askDisable();
    }
  }

  function askDisable(){
    const card = document.createElement("div");
    card.className="akshat-card";
    card.innerHTML=`
      <span class="akshat-close">✕</span>
      <img src="https://akshat-881236.github.io/TrackerJS/Assets/AKNH/icon-96.png" alt="Akshat Logo" style="width:40px;height:40px;float:right;margin-left:10px;border-radius:8px;" class="akshat-logo"/>
      <h1 style="margin-top:0;">Akshat Network Hub</h1>
      <p>We hope you found our project suggestions useful!</p>
      <h4>Auto Visit Suggestions</h4>
      <p>Do you want to turn off navigation suggestions for some time?</p>
      <div class="akshat-actions">
        <button id="off1">1 Hour</button>
        <button id="off2">Today</button>
      </div>
    `;
    card.querySelector("#off1").onclick=()=>{
      disableFor(3600000);
      card.remove();
    };
    card.querySelector("#off2").onclick=()=>{
      disableFor(86400000);
      card.remove();
    };
    document.body.appendChild(card);
  }

  function disableFor(ms){
    localStorage.setItem(STORE_KEY,JSON.stringify({
      disabledUntil:Date.now()+ms
    }));
  }

  /* ---------- START ---------- */
  setTimeout(()=>showCard(PROJECTS[index]),120000); // first after 2 min

})();