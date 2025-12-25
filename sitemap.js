/* ==========================================================
   ADVANCED GLOBAL SEO SITEMAP ENGINE (JS-ONLY)
   Works for static sites / GitHub Pages
   ========================================================== */

(function () {
  "use strict";

  /* ---------------- CONFIG ---------------- */
  const CONFIG = {
    brand: "Akshat Web Network",
    author: "Akshat Prasad",
    defaultLang: "en-IN",
    crawlDelayMs: 50,
    autoDiscover: true,
    includeExternalLinks: false,
    prefetchLinks: true,
    injectCanonical: true,
    injectRobotsMeta: true,
    injectBreadcrumbSchema: true,
    injectSitemapSchema: true,
    injectSiteSearchSchema: true,
    hiddenNav: true
  };

  /* ---------------- UTILITIES ---------------- */
  const $ = (q, c = document) => c.querySelector(q);
  const $$ = (q, c = document) => Array.from(c.querySelectorAll(q));
  const uniq = arr => [...new Set(arr)];
  const abs = url => new URL(url, location.href).href;
  const nowISO = () => new Date().toISOString();

  /* ---------------- PAGE INFO ---------------- */
  const PAGE = {
    url: abs(location.pathname),
    title: document.title || location.pathname,
    lang: document.documentElement.lang || CONFIG.defaultLang,
    description:
      $('meta[name="description"]')?.content ||
      document.querySelector("h1")?.innerText ||
      CONFIG.brand
  };

  /* ---------------- LINK DISCOVERY ---------------- */
  function discoverLinks() {
    let links = $$("a[href]")
      .map(a => abs(a.getAttribute("href")))
      .filter(href =>
        CONFIG.includeExternalLinks
          ? true
          : href.startsWith(location.origin)
      );

    return uniq(links);
  }

  /* ---------------- CANONICAL ---------------- */
  function injectCanonical() {
    if (!CONFIG.injectCanonical) return;
    if ($('link[rel="canonical"]')) return;

    const link = document.createElement("link");
    link.rel = "canonical";
    link.href = PAGE.url;
    document.head.appendChild(link);
  }

  /* ---------------- ROBOTS META ---------------- */
  function injectRobots() {
    if (!CONFIG.injectRobotsMeta) return;
    if ($('meta[name="robots"]')) return;

    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "index, follow, max-image-preview:large";
    document.head.appendChild(meta);
  }

  /* ---------------- PREFETCH ---------------- */
  function prefetchLinks(links) {
    if (!CONFIG.prefetchLinks) return;

    links.forEach((url, i) => {
      setTimeout(() => {
        const l = document.createElement("link");
        l.rel = "prefetch";
        l.href = url;
        document.head.appendChild(l);
      }, CONFIG.crawlDelayMs * i);
    });
  }

  /* ---------------- HIDDEN NAV SITEMAP ---------------- */
  function injectHiddenNav(links) {
    if (!CONFIG.hiddenNav) return;

    const nav = document.createElement("nav");
    nav.setAttribute("aria-label", "SEO Sitemap");
    nav.style.cssText =
      "position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden";

    let html = `<h1>${CONFIG.brand}</h1><ul>`;
    links.forEach(url => {
      html += `<li><a href="${url}">${url}</a></li>`;
    });
    html += `</ul>`;

    nav.innerHTML = html;
    document.body.appendChild(nav);
  }

  /* ---------------- JSON-LD: SITE + PAGE ---------------- */
  function injectSitemapSchema(links) {
    if (!CONFIG.injectSitemapSchema) return;

    const schema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: CONFIG.brand,
      url: location.origin,
      inLanguage: PAGE.lang,
      author: {
        "@type": "Person",
        name: CONFIG.author
      },
      potentialAction: {
        "@type": "SearchAction",
        target: `${location.origin}/?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      },
      hasPart: links.map(url => ({
        "@type": "WebPage",
        url,
        name: url.split("/").pop() || "Home",
        dateModified: nowISO()
      }))
    };

    injectJSONLD(schema);
  }

  /* ---------------- JSON-LD: BREADCRUMB ---------------- */
  function injectBreadcrumbs() {
    if (!CONFIG.injectBreadcrumbSchema) return;

    const parts = location.pathname.split("/").filter(Boolean);
    let path = location.origin + "/";

    const itemList = parts.map((p, i) => {
      path += p + "/";
      return {
        "@type": "ListItem",
        position: i + 1,
        name: p,
        item: path
      };
    });

    if (!itemList.length) return;

    injectJSONLD({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: itemList
    });
  }

  /* ---------------- JSON-LD INJECTOR ---------------- */
  function injectJSONLD(obj) {
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.textContent = JSON.stringify(obj, null, 2);
    document.head.appendChild(s);
  }

  /* ---------------- OBSERVER (CRAWL SIGNAL) ---------------- */
  function intersectionBoost() {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.setAttribute("data-seo-seen", "true");
        }
      });
    });

    $$("a[href]").forEach(a => io.observe(a));
  }

  /* ---------------- INIT ---------------- */
  function init() {
    injectCanonical();
    injectRobots();

    const links = CONFIG.autoDiscover ? discoverLinks() : [];
    injectHiddenNav(links);
    injectSitemapSchema(links);
    injectBreadcrumbs();
    prefetchLinks(links);
    intersectionBoost();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();