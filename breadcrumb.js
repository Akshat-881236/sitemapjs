/* =========================================================
   AKSHAT NETWORK – GLOBAL BREADCRUMB (SINGLE FILE)
   Injects HTML + CSS using innerHTML
   Prefix: https://akshat-881236.github.io/
   ========================================================= */

(function () {
  "use strict";

  if (!document.body) return;

  const BASE = "https://akshat-881236.github.io/";
  const path = location.pathname.replace(/^\/+|\/+$/g, "");
  const parts = path ? path.split("/") : [];

  /* --------- Create container --------- */
  const container = document.createElement("div");
  container.id = "akshat-breadcrumb-wrap";

  /* --------- Build breadcrumb HTML --------- */
  let html = `
    <nav id="akshat-breadcrumb" aria-label="breadcrumb">
      <a href="${BASE}">Home</a>
  `;

  let currentPath = BASE;

  parts.forEach((part, i) => {
    currentPath += part + "/";
    const label = decodeURIComponent(part)
      .replace(/[-_]/g, " ")
      .replace(/\.(html?|php)$/i, "")
      .replace(/\b\w/g, c => c.toUpperCase());

    if (i === parts.length - 1) {
      html += `<span aria-current="page">› ${label}</span>`;
    } else {
      html += `<a href="${currentPath}">› ${label}</a>`;
    }
  });

  html += `</nav>`;

  /* --------- Inject CSS --------- */
  html += `
    <style>
      #akshat-breadcrumb-wrap{
        width:100%;
        box-sizing:border-box;
        background:#f8f9fa;
        border-bottom:1px solid #ddd;
        font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
      }
      #akshat-breadcrumb{
        max-width:1200px;
        margin:auto;
        padding:10px 16px;
        font-size:13px;
        line-height:1.4;
        white-space:nowrap;
        overflow-x:auto;
      }
      #akshat-breadcrumb a{
        color:#0066cc;
        text-decoration:none;
        font-weight:500;
      }
      #akshat-breadcrumb a:hover{
        text-decoration:underline;
      }
      #akshat-breadcrumb span{
        color:#555;
        font-weight:600;
      }
      #akshat-breadcrumb::-webkit-scrollbar{
        height:4px;
      }
      #akshat-breadcrumb::-webkit-scrollbar-thumb{
        background:#ccc;
        border-radius:4px;
      }
      @media (max-width:600px){
        #akshat-breadcrumb{
          font-size:12px;
        }
      }
    </style>
  `;

  container.innerHTML = html;

  /* --------- Insert at top of page --------- */
  document.body.prepend(container);

})();