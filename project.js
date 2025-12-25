/* =========================================================
   PROJECT.JS — GLOBAL PROJECT INDEX & SEO HUB
   Deploy this page & submit to Google Search Console
   ========================================================= */

(function () {
  "use strict";

  /* ---------------- CONFIG ---------------- */
  const PROJECTS = [
    { name: "Portfolio-881236", title: "Personal Portfolio" },
    { name: "Key-of-Success", title: "Key of Success" },
    { name: "Quizzone", title: "Quizzone - Learning Platform" }
  ];

  const BASE_PREFIX = "https://akshat-881236.github.io/";
  const AUTHOR = "Akshat Prasad";
  const BRAND = "Akshat Projects Hub";

  /* ---------------- UTIL ---------------- */
  const abs = p => BASE_PREFIX + p + "/";
  const nowISO = () => new Date().toISOString();

  /* ---------------- HTML INJECTION ---------------- */
  function injectProjectIndex() {
    const container = document.createElement("main");
    container.id = "project-index";

    container.innerHTML = `
      <section>
        <h1>${BRAND}</h1>
        <p>Official index of all verified projects by ${AUTHOR}</p>

        <ul>
          ${PROJECTS.map(p => `
            <li>
              <a href="${abs(p.name)}" rel="noopener">
                ${p.title}
              </a>
            </li>
          `).join("")}
        </ul>
      </section>
      <footer>
© Akshat Prasad · SitemapJS Authority Hub
</footer>
    `;

    document.body.appendChild(container);
  }

  /* ---------------- CANONICAL CLUSTERING ---------------- */
  function injectCanonical() {
    const link = document.createElement("link");
    link.rel = "canonical";
    link.href = location.href;
    document.head.appendChild(link);
  }

  /* ---------------- ROBOTS ---------------- */
  function injectRobots() {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "index, follow";
    document.head.appendChild(meta);
  }

  /* ---------------- JSON-LD PROJECT GRAPH ---------------- */
  function injectProjectSchema() {
    const schema = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: BRAND,
      url: location.href,
      author: {
        "@type": "Person",
        name: AUTHOR
      },
      hasPart: PROJECTS.map(p => ({
        "@type": "WebSite",
        name: p.title,
        url: abs(p.name),
        sameAs: abs(p.name),
        dateModified: nowISO()
      }))
    };

    injectJSONLD(schema);
  }

  /* ---------------- SITE NETWORK SIGNAL ---------------- */
  function injectNetworkSchema() {
    const schema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: BRAND,
      url: BASE_PREFIX,
      publisher: {
        "@type": "Person",
        name: AUTHOR
      },
      sameAs: PROJECTS.map(p => abs(p.name))
    };

    injectJSONLD(schema);
  }

  /* ---------------- JSON-LD HELPER ---------------- */
  function injectJSONLD(obj) {
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.textContent = JSON.stringify(obj, null, 2);
    document.head.appendChild(s);
  }

  /* ---------------- PREFETCH HOMES ---------------- */
  function prefetchHomes() {
    PROJECTS.forEach(p => {
      const l = document.createElement("link");
      l.rel = "prefetch";
      l.href = abs(p.name);
      document.head.appendChild(l);
    });
  }

  /* ---------------- HIDDEN SEO NAV ---------------- */
  function injectHiddenNav() {
    const nav = document.createElement("nav");
    nav.setAttribute("aria-label", "Projects Sitemap");
    nav.style.cssText =
      "position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden";

    nav.innerHTML = `
      <ul>
        ${PROJECTS.map(p =>
          `<li><a href="${abs(p.name)}">${p.name}</a></li>`
        ).join("")}
      </ul>
    `;

    document.body.appendChild(nav);
  }

  /* ---------------- INIT ---------------- */
  function init() {
    injectCanonical();
    injectRobots();
    injectProjectIndex();
    injectHiddenNav();
    injectProjectSchema();
    injectNetworkSchema();
    prefetchHomes();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();