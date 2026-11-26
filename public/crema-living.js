/* CREMA Living Editorial Design System — Proiectum Studio */
(function () {
  "use strict";
  if (window.__cremaLivingBooted) return;
  window.__cremaLivingBooted = true;

  var CREMA_SVG_PATH =
    "M30.28 24.20Q30.28 26.34 29.04 27.58Q27.80 28.82 25.66 28.82Q23.50 28.82 22.36 27.56Q21.22 26.31 21.22 24.15V22.39Q21.22 20.92 20.59 20.15Q19.96 19.39 18.83 19.39Q17.71 19.39 16.81 20.23Q15.92 21.06 15.43 22.69Q14.94 24.32 14.94 26.68Q14.94 29.97 15.93 32.22Q16.93 34.47 18.64 35.59Q20.36 36.72 22.52 36.72Q24.74 36.72 26.26 35.98Q27.77 35.25 28.55 33.66Q28.92 33.29 29.15 33.17Q29.38 33.06 29.61 33.06Q29.87 33.09 30.05 33.32Q30.22 33.55 30.22 34.04Q29.96 36.78 28.46 38.89Q26.96 41.01 24.44 42.23Q21.92 43.44 18.57 43.44Q14.97 43.44 12.13 41.91Q9.29 40.38 7.64 37.48Q6.00 34.58 6.00 30.49Q6.00 26.48 7.70 23.35Q9.40 20.23 12.47 18.39Q15.54 16.56 19.61 16.56Q23.04 16.56 25.40 17.59Q27.77 18.61 29.02 20.34Q30.28 22.07 30.28 24.20Z M42.04 28.21Q42.04 24.26 43.09 21.68Q44.15 19.10 45.88 17.85Q47.61 16.59 49.62 16.59Q52.05 16.59 53.34 18.18Q54.64 19.76 54.64 22.94Q54.64 25.96 53.36 27.42Q52.08 28.88 50.06 28.88Q48.10 28.88 47.14 27.87Q46.19 26.86 46.14 25.04L46.11 23.95Q46.08 23.22 45.82 22.83Q45.56 22.45 44.98 22.45Q44.38 22.45 43.87 23.05Q43.37 23.66 43.09 24.88Q42.82 26.11 42.82 28.01ZM42.50 18.21 42.82 25.36V38.25Q42.82 39.02 43.08 39.49Q43.34 39.95 43.89 40.03L46.11 40.44Q46.65 40.55 46.90 40.87Q47.14 41.19 47.14 41.68Q47.14 42.20 46.81 42.53Q46.48 42.86 45.82 42.86H32.04Q31.43 42.86 31.08 42.54Q30.74 42.23 30.74 41.68Q30.74 41.24 30.95 40.96Q31.17 40.67 31.55 40.41L32.32 40.18Q32.73 40.01 32.89 39.64Q33.05 39.28 33.05 38.45V23.28Q33.05 22.62 32.89 22.32Q32.73 22.01 32.35 21.90L31.40 21.81Q31.00 21.61 30.83 21.35Q30.65 21.09 30.65 20.72Q30.65 20.28 30.93 19.95Q31.20 19.62 31.83 19.39L39.56 17.17Q40.25 16.91 40.71 16.79Q41.18 16.68 41.49 16.68Q41.95 16.68 42.19 17.01Q42.42 17.34 42.50 18.21Z M79.18 27.38Q79.18 28.64 78.50 29.37Q77.82 30.09 76.53 30.09H60.44V27.98H68.31Q69.40 27.98 69.40 26.80Q69.40 22.88 68.42 21.12Q67.44 19.36 66.17 19.36Q65.22 19.36 64.44 20.10Q63.67 20.83 63.19 22.50Q62.71 24.18 62.71 26.91Q62.71 32.19 64.92 34.70Q67.13 37.21 70.79 37.21Q73.18 37.21 74.98 36.08Q76.79 34.96 77.39 33.06Q77.71 32.71 77.95 32.58Q78.20 32.45 78.40 32.45Q78.69 32.45 78.88 32.67Q79.06 32.88 79.06 33.40Q79.03 36.14 77.51 38.42Q75.98 40.70 73.28 42.07Q70.59 43.44 67.04 43.44Q63.09 43.44 60.11 41.79Q57.12 40.15 55.45 37.19Q53.78 34.24 53.78 30.32Q53.78 26.25 55.39 23.15Q57.01 20.05 60.08 18.31Q63.15 16.56 67.47 16.56Q71.08 16.56 73.71 18.01Q76.35 19.45 77.77 21.90Q79.18 24.35 79.18 27.38Z M91.72 17.92V38.39Q91.72 39.28 91.88 39.72Q92.04 40.15 92.41 40.32L93.25 40.61Q93.85 41.01 93.85 41.68Q93.85 42.86 92.70 42.86H80.94Q80.33 42.86 79.99 42.54Q79.64 42.23 79.64 41.68Q79.64 41.24 79.86 40.96Q80.07 40.67 80.45 40.44L81.23 40.18Q81.63 40.01 81.79 39.64Q81.95 39.28 81.95 38.45V23.40Q81.95 22.76 81.79 22.46Q81.63 22.16 81.25 22.01L80.30 21.93Q79.90 21.72 79.73 21.48Q79.55 21.23 79.55 20.86Q79.55 20.43 79.83 20.10Q80.10 19.76 80.76 19.53L88.35 17.11Q89.18 16.77 89.64 16.66Q90.11 16.56 90.51 16.56Q91.12 16.56 91.42 16.94Q91.72 17.31 91.72 17.92ZM90.91 24.75 89.82 23.48 90.91 22.39Q94.08 19.16 96.71 17.88Q99.33 16.59 101.52 16.59Q104.49 16.59 106.25 18.51Q108.01 20.43 108.01 24.26V38.53Q108.01 39.43 108.16 39.79Q108.30 40.15 108.65 40.35L109.28 40.58Q109.89 41.01 109.89 41.68Q109.89 42.86 108.67 42.86H97.37Q96.28 42.86 96.28 41.68Q96.28 41.01 96.85 40.61L97.54 40.35Q98.01 40.15 98.16 39.69Q98.32 39.23 98.32 38.25V26.05Q98.32 24.29 97.53 23.31Q96.74 22.33 95.38 22.33Q94.40 22.33 93.52 22.71Q92.64 23.08 91.84 23.86ZM107.20 24.72 106.11 23.45 107.15 22.30Q109.80 19.27 112.11 17.93Q114.41 16.59 116.78 16.59Q119.63 16.59 121.27 18.34Q122.92 20.08 123.26 23.54L124.94 38.48Q125.05 39.34 125.20 39.70Q125.34 40.06 125.66 40.24L126.23 40.44Q126.58 40.70 126.78 40.97Q126.98 41.24 126.98 41.68Q126.98 42.23 126.65 42.54Q126.32 42.86 125.71 42.86H114.04Q112.94 42.86 112.94 41.68Q112.94 41.01 113.55 40.61L114.24 40.35Q114.70 40.15 114.90 39.69Q115.10 39.23 114.99 38.33L113.72 26.08Q113.52 24.29 112.84 23.31Q112.16 22.33 110.84 22.33Q110.12 22.33 109.44 22.69Q108.76 23.05 108.07 23.77Z M141.63 39.31V38.74L140.94 38.91V21.32Q140.94 20.08 140.36 19.38Q139.79 18.67 138.80 18.67Q137.82 18.67 137.23 19.20Q136.64 19.74 136.64 20.60V22.71Q136.64 24.72 135.32 25.96Q133.99 27.20 131.68 27.20Q129.81 27.20 128.80 26.28Q127.79 25.36 127.79 23.63Q127.79 21.90 129.19 20.28Q130.59 18.67 133.38 17.62Q136.18 16.56 140.33 16.56Q145.67 16.56 148.20 18.64Q150.74 20.72 150.74 24.46V37.50Q150.74 38.10 151.00 38.46Q151.26 38.82 151.78 38.82Q152.13 38.82 152.44 38.61Q152.76 38.39 152.90 37.90Q152.99 37.78 153.09 37.73Q153.19 37.67 153.34 37.67Q153.65 37.67 153.83 37.93Q154.00 38.19 154.00 38.59Q154.00 39.54 153.29 40.68Q152.59 41.82 151.13 42.63Q149.68 43.44 147.43 43.44Q144.66 43.44 143.14 42.25Q141.63 41.07 141.63 39.31ZM126.55 37.04Q126.55 33.40 129.52 31.34Q132.49 29.28 138.49 29.28Q139.81 29.28 140.78 29.51Q141.75 29.74 142.47 30.14L141.83 31.79Q141.17 31.41 140.58 31.25Q139.99 31.10 139.21 31.10Q137.82 31.10 137.03 32.19Q136.24 33.29 136.24 35.36Q136.24 37.32 137.03 38.32Q137.82 39.31 139.12 39.31Q139.96 39.31 140.71 38.88Q141.46 38.45 141.89 37.78L142.38 39.37Q141.26 41.33 138.99 42.38Q136.73 43.44 134.11 43.44Q130.70 43.44 128.63 41.63Q126.55 39.83 126.55 37.04Z";

  var SWATCHES = [
    {
      cls: "framer-18rxgoe",
      id: "warm-timber",
      name: "Warm Timber",
      hex: "#8C4E29",
      rgb: "rgb(140, 78, 41)",
      hsl: "hsl(22, 55%, 35%)",
      cssVar: "var(--crema-color-warm-timber, #8C4E29)",
      dark: true,
    },
    {
      cls: "framer-fqarjz",
      id: "steamed-milk",
      name: "Steamed Milk",
      hex: "#EBE4D7",
      rgb: "rgb(235, 228, 215)",
      hsl: "hsl(39, 32%, 88%)",
      cssVar: "var(--crema-color-steamed-milk, #EBE4D7)",
      dark: false,
    },
    {
      cls: "framer-2vdnuu",
      id: "caramel-crema",
      name: "Caramel Crema",
      hex: "#DDA04B",
      rgb: "rgb(221, 160, 75)",
      hsl: "hsl(35, 68%, 58%)",
      cssVar: "var(--crema-color-caramel-crema, #DDA04B)",
      dark: false,
    },
    {
      cls: "framer-uio7rx",
      id: "roasted-espresso",
      name: "Roasted Espresso",
      hex: "#24110C",
      rgb: "rgb(36, 17, 12)",
      hsl: "hsl(12, 50%, 9%)",
      cssVar: "var(--crema-color-roasted-espresso, #24110C)",
      dark: true,
    },
  ];

  var GRADIENTS = [
    {
      cls: "framer-1rnuwvn",
      name: "Amber Dusk",
      css: "linear-gradient(180deg, #C86A1E 0%, rgb(228, 168, 118) 100%)",
      from: "#C86A1E",
    },
    {
      cls: "framer-1suy5d6",
      name: "Cedar Smoke",
      css: "linear-gradient(180deg, #24110C 0%, rgb(140, 78, 41) 100%)",
      from: "#24110C",
    },
    {
      cls: "framer-mq4rn6",
      name: "Cappuccino Pour",
      css: "linear-gradient(180deg, #EFE7DA 0%, rgb(139, 83, 43) 100%)",
      from: "#8B532B",
    },
    {
      cls: "framer-1hbm13w",
      name: "Velvet Ristretto",
      css: "linear-gradient(180deg, #2E120D 0%, rgb(201, 122, 91) 100%)",
      from: "#2E120D",
    },
  ];

  var SECTIONS = [
    { num: "1", id: "cover", label: "Cover", tag: "Intro" },
    { num: "2", id: "contents", label: "Contents", tag: "Index" },
    { num: "3", id: "who-we-are", label: "Who we are", tag: "Position" },
    { num: "4", id: "logo", label: "Logo", tag: "Identity" },
    { num: "5", id: "colour", label: "Colour", tag: "Palette" },
    { num: "6", id: "typography", label: "Typography", tag: "Voice" },
    { num: "7", id: "photography", label: "Photography", tag: "Image" },
    { num: "8", id: "in-use", label: "Brand in use", tag: "Applied" },
    { num: "9", id: "resources", label: "Resources", tag: "Files" },
  ];

  var RESOURCES = [
    {
      match: "Logo package",
      kind: "logo",
      href: "/downloads/crema-logo-kit.zip",
      filename: "crema-logo-kit.zip",
      pills: ["4x VECTOR SVG", "2x 2400W PNG", "117 KB"],
    },
    {
      match: "Design tokens pack",
      kind: "tokens",
      href: "/downloads/crema-design-tokens.zip",
      filename: "crema-design-tokens.zip",
      pills: ["CSS VARS", "JSON + TAILWIND", "2.1 KB"],
    },
    {
      match: "Print production colour sheet",
      kind: "sheet",
      href: "/downloads/crema-colour-production-sheet.pdf",
      filename: "crema-colour-production-sheet.pdf",
      pills: ["A4 PRINT PDF", "CMYK + PANTONE", "112 KB"],
    },
  ];

  var toastEl = null;
  var toastTimer = null;
  var cmdBackdrop = null;
  var cmdSelectedIdx = 0;
  var cmdResults = [];
  var isCmdOpen = false;
  var sandboxState = { surface: "orig", clearspace: false };
  var lightboxEl = null;
  var lightboxImgs = [];
  var lightboxIdx = 0;
  var isLightboxOpen = false;

  function makeSvg(fillColor) {
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 60" overflow="visible" class="crema-logo-stage-svg">' +
      '<path d="' + CREMA_SVG_PATH + '" fill="' + fillColor + '" fill-rule="nonzero"></path></svg>'
    );
  }

  function hexToRgbTuple(hex) {
    var h = hex.replace("#", "");
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }

  function relLuminance(hex) {
    var rgb = hexToRgbTuple(hex).map(function (v) {
      var c = v / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  }

  function contrastRatio(hexA, hexB) {
    var l1 = relLuminance(hexA);
    var l2 = relLuminance(hexB);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  }

  function showToast(msg) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "crema-toast";
      toastEl.setAttribute("role", "status");
      toastEl.setAttribute("aria-live", "polite");
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      if (toastEl) toastEl.classList.remove("is-visible");
    }, 2200);
  }

  function copyText(text, label) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () {
          showToast(label || "COPIED · " + text);
        },
        function () {
          fallbackCopy(text, label);
        }
      );
    } else {
      fallbackCopy(text, label);
    }
  }

  function fallbackCopy(text, label) {
    try {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      showToast(label || "COPIED · " + text);
    } catch (e) {
      showToast("COPY UNAVAILABLE");
    }
  }

  function scrollToSection(id) {
    var target = document.getElementById(id);
    if (!target) return;
    var prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "start" });
  }

  /* 1. Scrollspy + Reading Progress Hairline + Sidebar Dock */
  var mobileProgressFill = null;
  function setupScrollspyAndNav() {
    var navs = document.querySelectorAll('[data-framer-name="Section Index"]');
    navs.forEach(function (nav) {
      if (nav.getAttribute("data-crema-enhanced") === "1") return;
      nav.setAttribute("data-crema-enhanced", "1");

      var rail = document.createElement("div");
      rail.className = "crema-progress-rail";
      var fill = document.createElement("div");
      fill.className = "crema-progress-fill";
      rail.appendChild(fill);
      nav.appendChild(rail);

      var dock = document.createElement("div");
      dock.className = "crema-sidebar-dock";
      dock.innerHTML =
        '<div class="crema-dock-row">' +
        '  <button type="button" class="crema-mono-btn" data-crema-action="cmd">⌘K INDEX</button>' +
        '  <button type="button" class="crema-mono-btn" data-crema-action="print">PRINT</button>' +
        "</div>" +
        '<a class="crema-studio-credit" href="https://proiectum.studio" target="_blank" rel="noopener noreferrer">BY PROIECTUM STUDIO ↗</a>';

      dock.querySelector('[data-crema-action="cmd"]').addEventListener("click", openCmdPalette);
      dock.querySelector('[data-crema-action="print"]').addEventListener("click", function () {
        window.print();
      });
      nav.appendChild(dock);
    });

    if (!mobileProgressFill) {
      var mBar = document.createElement("div");
      mBar.className = "crema-mobile-progress";
      mobileProgressFill = document.createElement("div");
      mobileProgressFill.className = "crema-mobile-progress-fill";
      mBar.appendChild(mobileProgressFill);
      document.body.appendChild(mBar);

      var mBtn = document.createElement("button");
      mBtn.type = "button";
      mBtn.className = "crema-mobile-cmd-btn";
      mBtn.textContent = "⌘K INDEX";
      mBtn.addEventListener("click", openCmdPalette);
      document.body.appendChild(mBtn);
    }
  }

  var scrollTicking = false;
  function updateScrollspy() {
    scrollTicking = false;
    var scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
    var maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    var pct = Math.min(100, Math.max(0, (scrollTop / maxScroll) * 100));

    document.querySelectorAll(".crema-progress-fill").forEach(function (el) {
      el.style.height = pct.toFixed(1) + "%";
    });
    if (mobileProgressFill) {
      mobileProgressFill.style.width = pct.toFixed(1) + "%";
    }

    var activeId = SECTIONS[0].id;
    var probeY = scrollTop + window.innerHeight * 0.28;
    for (var i = 0; i < SECTIONS.length; i++) {
      var sec = document.getElementById(SECTIONS[i].id);
      if (sec) {
        var top = sec.getBoundingClientRect().top + scrollTop;
        if (top <= probeY) activeId = SECTIONS[i].id;
      }
    }

    document.querySelectorAll('[data-framer-name="Section Index"] a[href*="#"]').forEach(function (a) {
      var href = a.getAttribute("href") || "";
      var hash = href.slice(href.indexOf("#") + 1);
      if (hash === activeId) {
        a.classList.add("crema-nav-active");
      } else {
        a.classList.remove("crema-nav-active");
      }
    });
  }

  function onScroll() {
    if (!scrollTicking) {
      scrollTicking = true;
      requestAnimationFrame(updateScrollspy);
    }
  }

  /* 2. Interactive Swatches & Gradients (Section 5) */
  function setupPaletteCards() {
    var formats = ["HEX", "RGB", "HSL", "CSS"];

    SWATCHES.forEach(function (sw) {
      document.querySelectorAll("." + sw.cls).forEach(function (card) {
        if (card.getAttribute("data-crema-enhanced") === "1") return;
        card.setAttribute("data-crema-enhanced", "1");
        card.classList.add("crema-swatch-card");

        var fmtIdx = 0;
        var textHex = sw.dark ? "#FFFFFF" : "#11110F";
        var ratio = contrastRatio(sw.hex, textHex);
        var grade = ratio >= 7 ? "AAA" : ratio >= 4.5 ? "AA" : "AA+";

        var meta = document.createElement("div");
        meta.className = "crema-swatch-meta";
        meta.style.color = textHex;

        var wcag = document.createElement("span");
        wcag.className = "crema-wcag-badge";
        wcag.textContent = grade + " " + ratio.toFixed(1) + ":1";
        wcag.title = "WCAG contrast against card text (" + textHex + ")";

        var fmtBtn = document.createElement("button");
        fmtBtn.type = "button";
        fmtBtn.className = "crema-fmt-btn";
        fmtBtn.textContent = formats[fmtIdx] + " ↻";
        fmtBtn.title = "Switch copy format";

        fmtBtn.addEventListener("click", function (ev) {
          ev.stopPropagation();
          fmtIdx = (fmtIdx + 1) % formats.length;
          fmtBtn.textContent = formats[fmtIdx] + " ↻";
        });

        meta.appendChild(wcag);
        meta.appendChild(fmtBtn);
        card.appendChild(meta);

        card.addEventListener("click", function () {
          var mode = formats[fmtIdx];
          var val =
            mode === "HEX"
              ? sw.hex
              : mode === "RGB"
              ? sw.rgb
              : mode === "HSL"
              ? sw.hsl
              : sw.cssVar;
          copyText(val, "COPIED · " + val + " (" + sw.name.toUpperCase() + ")");
        });
      });
    });

    GRADIENTS.forEach(function (gr) {
      document.querySelectorAll("." + gr.cls).forEach(function (card) {
        if (card.getAttribute("data-crema-enhanced") === "1") return;
        card.setAttribute("data-crema-enhanced", "1");
        card.classList.add("crema-gradient-card");

        var cue = document.createElement("span");
        cue.className = "crema-grad-cue";
        cue.style.color = gr.name === "Cedar Smoke" || gr.name === "Velvet Ristretto" ? "#FFFFFF" : "#1B120E";
        cue.textContent = "COPY CSS";
        card.appendChild(cue);

        card.addEventListener("click", function () {
          copyText(gr.css, "COPIED · " + gr.name.toUpperCase() + " GRADIENT");
        });
      });
    });
  }

  /* 3. Interactive Logo Sandbox (Section 4) */
  function syncAllLogoSandboxes() {
    var surfColors = {
      orig: null,
      milk: { bg: "#EBE4D7", fg: "#24110C", dark: false },
      espresso: { bg: "#24110C", fg: "#F4EFE6", dark: true },
      amber: { bg: "#DDA04B", fg: "#24110C", dark: false },
      timber: { bg: "#8C4E29", fg: "#F4EFE6", dark: true },
    };
    var sInfo = surfColors[sandboxState.surface] || null;

    document.querySelectorAll('[data-framer-name="Logo Asset Placeholder"]').forEach(function (box) {
      if (!box.closest || !box.closest("#logo")) return;
      var stage = box.querySelector(".crema-logo-stage");
      var grid = box.querySelector(".crema-clearspace-overlay");
      if (stage) {
        if (sInfo) {
          stage.style.backgroundColor = sInfo.bg;
          stage.innerHTML = makeSvg(sInfo.fg);
          stage.classList.add("is-surface-active");
        } else {
          stage.classList.remove("is-surface-active");
        }
      }
      if (grid) {
        grid.classList.toggle("is-visible", sandboxState.clearspace);
        grid.classList.toggle("is-dark", Boolean(sInfo && sInfo.dark));
      }
      box.querySelectorAll("[data-crema-surface]").forEach(function (btn) {
        btn.classList.toggle("is-active", btn.getAttribute("data-crema-surface") === sandboxState.surface);
      });
      box.querySelectorAll("[data-crema-grid]").forEach(function (btn) {
        btn.classList.toggle("is-active", sandboxState.clearspace);
      });
    });
  }

  function setupLogoSandbox() {
    document.querySelectorAll('[data-framer-name="Logo Asset Placeholder"]').forEach(function (box) {
      if (!box.closest || !box.closest("#logo")) return;
      if (box.getAttribute("data-crema-enhanced") === "1") return;
      box.setAttribute("data-crema-enhanced", "1");

      var stage = document.createElement("div");
      stage.className = "crema-logo-stage";
      box.appendChild(stage);

      var clearOverlay = document.createElement("div");
      clearOverlay.className = "crema-clearspace-overlay";
      clearOverlay.innerHTML =
        '<div class="crema-clearspace-box">' +
        '  <span class="crema-clearspace-tag">1x CLEARSPACE · SAFE BOUNDARY</span>' +
        '  <div class="crema-clearspace-inner"></div>' +
        "</div>";
      box.appendChild(clearOverlay);

      var bar = document.createElement("div");
      bar.className = "crema-sandbox-bar";
      bar.innerHTML =
        '<div class="crema-sandbox-group">' +
        '  <button type="button" class="crema-mono-btn" data-crema-grid="1">GRID</button>' +
        '  <button type="button" class="crema-surface-btn is-active" data-crema-surface="orig">ORIG</button>' +
        '  <button type="button" class="crema-surface-btn" data-crema-surface="milk"><span class="crema-swatch-dot" style="background:#EBE4D7"></span>MILK</button>' +
        '  <button type="button" class="crema-surface-btn" data-crema-surface="espresso"><span class="crema-swatch-dot" style="background:#24110C"></span>ESPRESSO</button>' +
        '  <button type="button" class="crema-surface-btn" data-crema-surface="amber"><span class="crema-swatch-dot" style="background:#DDA04B"></span>AMBER</button>' +
        '  <button type="button" class="crema-surface-btn" data-crema-surface="timber"><span class="crema-swatch-dot" style="background:#8C4E29"></span>TIMBER</button>' +
        "</div>" +
        '<button type="button" class="crema-mono-btn" data-crema-copy-svg="1">COPY SVG</button>';

      bar.querySelector("[data-crema-grid]").addEventListener("click", function () {
        sandboxState.clearspace = !sandboxState.clearspace;
        syncAllLogoSandboxes();
      });
      bar.querySelectorAll("[data-crema-surface]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          sandboxState.surface = btn.getAttribute("data-crema-surface") || "orig";
          syncAllLogoSandboxes();
        });
      });
      bar.querySelector("[data-crema-copy-svg]").addEventListener("click", function () {
        var fill = sandboxState.surface === "espresso" || sandboxState.surface === "timber" ? "#F4EFE6" : "#24110C";
        var svg =
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 60" overflow="visible">' +
          '<path d="' + CREMA_SVG_PATH + '" fill="' + fill + '" fill-rule="nonzero"/></svg>';
        copyText(svg, "COPIED · CREMA VECTOR SVG (" + fill + ")");
      });

      box.appendChild(bar);
    });
    syncAllLogoSandboxes();
  }

  /* 4. Live Type Specimen (Section 6) */
  function setupLiveTypography() {
    var typoSec = document.getElementById("typography");
    if (!typoSec) return;

    var scaleLabelContainers = Array.from(typoSec.querySelectorAll("p")).filter(function (p) {
      return p.textContent && p.textContent.trim().toUpperCase() === "TYPE SCALE";
    });

    scaleLabelContainers.forEach(function (lbl) {
      var host = lbl.parentElement;
      if (!host || host.getAttribute("data-crema-enhanced") === "1") return;
      host.setAttribute("data-crema-enhanced", "1");

      var hint = document.createElement("div");
      hint.className = "crema-type-hint-row";
      hint.innerHTML =
        '<span>LIVE SPECIMEN · CLICK ANY LINE BELOW TO TYPE</span>' +
        '<button type="button" class="crema-mono-btn" data-crema-type-reset="1">RESET</button>';
      hint.querySelector("[data-crema-type-reset]").addEventListener("click", function () {
        typoSec.querySelectorAll(".crema-type-editable").forEach(function (node) {
          if (node.dataset.cremaOrig !== undefined) {
            node.textContent = node.dataset.cremaOrig;
          }
        });
        showToast("RESET · TYPE SPECIMENS RESTORED");
      });
      host.appendChild(hint);
    });

    typoSec
      .querySelectorAll(".framer-1b7wekf p, .framer-hc5lqy p, .framer-qo13cd p, .framer-qtzybo p")
      .forEach(function (p) {
        if (p.getAttribute("data-crema-editable") === "1") return;
        p.setAttribute("data-crema-editable", "1");
        p.dataset.cremaOrig = p.textContent;
        p.contentEditable = "true";
        p.spellcheck = false;
        p.classList.add("crema-type-editable");
        p.title = "Click to type custom specimen text";
      });
  }

  /* 5. Real Working Resource Downloads & Footer Studio Link */
  function triggerFileDownload(href, filename) {
    var link = document.createElement("a");
    link.href = href;
    link.download = filename || "";
    link.dataset.cremaBypass = "1";
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("DOWNLOADING · " + (filename || href));
  }

  function buildResourceThumbHtml(kind) {
    if (kind === "logo") {
      return (
        '<div class="crema-thumb-logo">' +
        '  <div class="crema-thumb-half is-dark">' +
        makeSvg("#F4EFE6") +
        '    <span class="crema-thumb-micro">ESPRESSO</span>' +
        "  </div>" +
        '  <div class="crema-thumb-half is-light">' +
        makeSvg("#24110C") +
        '    <span class="crema-thumb-micro">MILK · SVG</span>' +
        "  </div>" +
        "</div>"
      );
    }
    if (kind === "tokens") {
      return (
        '<div class="crema-thumb-tokens">' +
        '  <div class="crema-token-swatches">' +
        '    <span class="crema-token-dot" style="background:#8C4E29"></span>' +
        '    <span class="crema-token-dot" style="background:#EBE4D7"></span>' +
        '    <span class="crema-token-dot" style="background:#DDA04B"></span>' +
        '    <span class="crema-token-dot" style="background:#24110C"></span>' +
        "  </div>" +
        '  <div class="crema-token-lines">' +
        "    <span>--timber:</span> #8C4E29;<br>" +
        "    <span>--display:</span> Rubik;<br>" +
        "    <span>--mono:</span> Geist Mono;" +
        "  </div>" +
        "</div>"
      );
    }
    return (
      '<div class="crema-thumb-sheet">' +
      '  <div class="crema-sheet-mini">' +
      '    <div class="crema-sheet-head">A4 · CMYK / PMS</div>' +
      '    <div class="crema-sheet-bars">' +
      '      <span style="background:#8C4E29"></span>' +
      '      <span style="background:#EBE4D7;border:1px solid rgba(36,17,12,0.15)"></span>' +
      '      <span style="background:#DDA04B"></span>' +
      '      <span style="background:#24110C"></span>' +
      "    </div>" +
      '    <div class="crema-sheet-grads">' +
      '      <span style="background:linear-gradient(180deg,#C86A1E,#E4A876)"></span>' +
      '      <span style="background:linear-gradient(180deg,#24110C,#8C4E29)"></span>' +
      "    </div>" +
      "  </div>" +
      "</div>"
    );
  }

  function setupResourcesAndFooter() {
    document.querySelectorAll('[data-framer-name="Base"]').forEach(function (card) {
      var infoEl = card.querySelector('[data-framer-name="Asset Info"]');
      var labelEl = card.querySelector('[data-framer-name="Label"] p');
      var fileEl = card.querySelector('[data-framer-name="File"] p');
      var btn = card.querySelector('[data-framer-name="Download Button"]');
      if (!labelEl || !btn) return;

      var title = labelEl.textContent.trim();
      var res = RESOURCES.find(function (r) {
        return title.toLowerCase().indexOf(r.match.toLowerCase()) !== -1;
      });
      if (!res) return;

      if (btn.getAttribute("data-crema-enhanced") !== "1") {
        btn.setAttribute("data-crema-enhanced", "1");
        btn.setAttribute("href", res.href);
        btn.setAttribute("download", res.filename);
        if (fileEl && fileEl.textContent.indexOf("drip") !== -1) {
          fileEl.textContent =
            res.filename === "crema-design-tokens.zip"
              ? "crema-design-tokens.zip — CSS / JSON / Tailwind"
              : res.filename === "crema-colour-production-sheet.pdf"
              ? "crema-colour-production-sheet.pdf — A4 Print Spec"
              : "crema-logo-kit.zip — SVG / PNG / Outline";
        }
      }

      if (card.getAttribute("data-crema-kit-v3") !== "1") {
        card.setAttribute("data-crema-kit-v3", "1");
        card.classList.add("crema-resource-card");

        if (!card.querySelector(".crema-resource-thumb")) {
          var thumb = document.createElement("div");
          thumb.className = "crema-resource-thumb";
          thumb.setAttribute("aria-hidden", "true");
          thumb.innerHTML = buildResourceThumbHtml(res.kind);
          card.insertBefore(thumb, card.firstChild);
        }

        if (infoEl && res.pills && !infoEl.querySelector(".crema-resource-pills")) {
          var pillsEl = document.createElement("div");
          pillsEl.className = "crema-resource-pills";
          pillsEl.innerHTML = res.pills
            .map(function (pTxt) {
              return '<span class="crema-res-pill">' + pTxt + "</span>";
            })
            .join("");
          infoEl.appendChild(pillsEl);
        }
      }
    });

    document.querySelectorAll('[data-framer-name="Copyright"] p').forEach(function (p) {
      if (p.getAttribute("data-crema-enhanced") === "1") return;
      if (p.textContent.indexOf("Proiectum Studio") === -1) return;
      p.setAttribute("data-crema-enhanced", "1");
      p.innerHTML =
        '© 2026 CREMA · Brand System by <a href="https://proiectum.studio" target="_blank" rel="noopener noreferrer" style="color:inherit;text-decoration:underline;text-underline-offset:3px;">Proiectum Studio</a>';
    });
  }

  /* 5b. Editorial Click-to-Zoom Lightbox */
  function isEditorialZoomable(img) {
    if (!img || !img.getBoundingClientRect) return false;
    if (
      img.closest(
        '[data-framer-name="Section Index"], [data-framer-name="Responsive Navigation"], .crema-resource-thumb, .crema-lightbox'
      )
    ) {
      return false;
    }
    var r = img.getBoundingClientRect();
    return r.width >= 150 && r.height >= 90;
  }

  function getLightboxMeta(img) {
    var sec = img.closest ? img.closest("[id]") : null;
    var secId = sec && sec.id ? sec.id : "cover";
    var secNames = {
      cover: "01 COVER",
      contents: "02 MOODBOARD",
      "who-we-are": "03 WHO WE ARE",
      logo: "04 LOGO IDENTITY",
      colour: "05 COLOUR ATMOSPHERE",
      photography: "07 PHOTOGRAPHY",
      "in-use": "08 BRAND IN USE",
    };
    var tag = secNames[secId] || "CREMA · PLATE";
    var caption = (img.getAttribute("alt") || "").trim();
    var node = img.parentElement;
    for (var depth = 0; depth < 3 && node; depth++) {
      var sibP = node.parentElement ? node.parentElement.querySelectorAll("p") : null;
      if (sibP && sibP.length === 1) {
        var txt = (sibP[0].textContent || "").trim();
        if (txt.length > 18 && txt.length < 220) {
          caption = txt;
          break;
        }
      }
      node = node.parentElement;
    }
    return {
      src: img.currentSrc || img.src || "",
      tag: tag,
      caption: caption || "CREMA Brand System Artwork",
    };
  }

  function ensureLightbox() {
    if (lightboxEl) return;
    lightboxEl = document.createElement("div");
    lightboxEl.className = "crema-lightbox";
    lightboxEl.setAttribute("role", "dialog");
    lightboxEl.setAttribute("aria-modal", "true");
    lightboxEl.setAttribute("aria-label", "Artwork Inspector");
    lightboxEl.innerHTML =
      '<div class="crema-lb-topbar">' +
      '  <span class="crema-lb-tag">CREMA · PLATE</span>' +
      '  <div class="crema-lb-controls">' +
      '    <button type="button" class="crema-lb-btn" data-crema-lb-prev="1" aria-label="Previous image">← PREV</button>' +
      '    <button type="button" class="crema-lb-btn" data-crema-lb-next="1" aria-label="Next image">NEXT →</button>' +
      '    <button type="button" class="crema-lb-btn" data-crema-lb-close="1" aria-label="Close lightbox">ESC ✕</button>' +
      "  </div>" +
      "</div>" +
      '<div class="crema-lb-stage">' +
      '  <img class="crema-lb-img" alt="" />' +
      "</div>" +
      '<div class="crema-lb-bottom">' +
      '  <div class="crema-lb-caption"></div>' +
      '  <div class="crema-lb-count">01 / 01</div>' +
      "</div>";
    document.body.appendChild(lightboxEl);

    lightboxEl.querySelector("[data-crema-lb-prev]").addEventListener("click", function () {
      stepLightbox(-1);
    });
    lightboxEl.querySelector("[data-crema-lb-next]").addEventListener("click", function () {
      stepLightbox(1);
    });
    lightboxEl.querySelector("[data-crema-lb-close]").addEventListener("click", closeLightbox);
    lightboxEl.addEventListener("click", function (ev) {
      if (ev.target === lightboxEl || ev.target.classList.contains("crema-lb-stage")) {
        closeLightbox();
      }
    });
  }

  function renderLightboxSlide() {
    if (!lightboxEl || !lightboxImgs.length) return;
    var img = lightboxImgs[lightboxIdx];
    var meta = getLightboxMeta(img);
    lightboxEl.querySelector(".crema-lb-tag").textContent = meta.tag + " · PROIECTUM STUDIO";
    var lbImg = lightboxEl.querySelector(".crema-lb-img");
    lbImg.src = meta.src;
    lbImg.alt = meta.caption;
    lightboxEl.querySelector(".crema-lb-caption").textContent = meta.caption;
    var numStr = (lightboxIdx + 1 < 10 ? "0" : "") + (lightboxIdx + 1);
    var totStr = (lightboxImgs.length < 10 ? "0" : "") + lightboxImgs.length;
    lightboxEl.querySelector(".crema-lb-count").textContent = numStr + " / " + totStr;
  }

  function stepLightbox(delta) {
    if (!lightboxImgs.length) return;
    lightboxIdx = (lightboxIdx + delta + lightboxImgs.length) % lightboxImgs.length;
    renderLightboxSlide();
  }

  function openLightbox(targetImg) {
    ensureLightbox();
    var allImgs = Array.from(document.querySelectorAll("#main img")).filter(isEditorialZoomable);
    if (!allImgs.length) return;
    lightboxImgs = allImgs;
    var found = allImgs.indexOf(targetImg);
    lightboxIdx = found !== -1 ? found : 0;
    isLightboxOpen = true;
    renderLightboxSlide();
    lightboxEl.classList.add("is-open");
  }

  function closeLightbox() {
    if (!lightboxEl) return;
    isLightboxOpen = false;
    lightboxEl.classList.remove("is-open");
  }

  function setupGalleryLightbox() {
    document.querySelectorAll("#main img").forEach(function (img) {
      if (!isEditorialZoomable(img)) return;
      var wrap = img.parentElement;
      if (!wrap || wrap.getAttribute("data-crema-zoom") === "1") return;
      wrap.setAttribute("data-crema-zoom", "1");
      wrap.classList.add("crema-zoom-frame");
      wrap.addEventListener("click", function (ev) {
        if (ev.target && ev.target.closest && ev.target.closest("button, a, .crema-sandbox-bar")) return;
        if (wrap.closest('[data-framer-name="Logo Asset Placeholder"]') && sandboxState.surface !== "orig") {
          return;
        }
        ev.stopPropagation();
        openLightbox(img);
      });
    });
  }

  /* 6. Command Palette (Cmd+K) */
  function getCommandItems(query) {
    var q = (query || "").trim().toLowerCase();
    var items = [];

    SECTIONS.forEach(function (s) {
      items.push({
        group: "Sections",
        title: s.num + "  " + s.label,
        hint: "#" + s.id + " · " + s.tag,
        chip: null,
        run: function () {
          scrollToSection(s.id);
        },
      });
    });

    SWATCHES.forEach(function (sw) {
      items.push({
        group: "Brand Swatches",
        title: sw.name,
        hint: sw.hex + " · Copy HEX",
        chip: sw.hex,
        run: function () {
          copyText(sw.hex, "COPIED · " + sw.hex + " (" + sw.name.toUpperCase() + ")");
        },
      });
    });

    GRADIENTS.forEach(function (gr) {
      items.push({
        group: "Gradients",
        title: gr.name,
        hint: "Copy CSS gradient",
        chip: gr.css,
        run: function () {
          copyText(gr.css, "COPIED · " + gr.name.toUpperCase() + " GRADIENT");
        },
      });
    });

    items.push(
      {
        group: "Actions",
        title: "Toggle Logo Clearspace Grid",
        hint: "Section 4",
        chip: null,
        run: function () {
          sandboxState.clearspace = !sandboxState.clearspace;
          syncAllLogoSandboxes();
          scrollToSection("logo");
          showToast(sandboxState.clearspace ? "CLEARSPACE GRID · ON" : "CLEARSPACE GRID · OFF");
        },
      },
      {
        group: "Actions",
        title: "Copy Master Vector SVG",
        hint: "crema-logo.svg",
        chip: "#24110C",
        run: function () {
          copyText(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 60" overflow="visible"><path d="' +
              CREMA_SVG_PATH +
              '" fill="#24110C" fill-rule="nonzero"/></svg>',
            "COPIED · CREMA VECTOR SVG"
          );
        },
      },
      {
        group: "Actions",
        title: "Download Logo Kit (ZIP)",
        hint: "SVG / PNG / Outline",
        chip: null,
        run: function () {
          triggerFileDownload("/downloads/crema-logo-kit.zip", "crema-logo-kit.zip");
        },
      },
      {
        group: "Actions",
        title: "Download Design Tokens (ZIP)",
        hint: "CSS / JSON / Tailwind",
        chip: null,
        run: function () {
          triggerFileDownload("/downloads/crema-design-tokens.zip", "crema-design-tokens.zip");
        },
      },
      {
        group: "Actions",
        title: "Download Colour Spec Sheet (PDF)",
        hint: "A4 Print Spec",
        chip: null,
        run: function () {
          triggerFileDownload("/downloads/crema-colour-production-sheet.pdf", "crema-colour-production-sheet.pdf");
        },
      },
      {
        group: "Actions",
        title: "Print / Save Brandbook PDF",
        hint: "A4 Layout",
        chip: null,
        run: function () {
          window.print();
        },
      }
    );

    if (!q) return items;
    return items.filter(function (it) {
      return (it.title + " " + it.hint + " " + it.group).toLowerCase().indexOf(q) !== -1;
    });
  }

  function renderCmdResults(query) {
    if (!cmdBackdrop) return;
    var listEl = cmdBackdrop.querySelector(".crema-cmd-list");
    cmdResults = getCommandItems(query);
    if (cmdSelectedIdx >= cmdResults.length) cmdSelectedIdx = Math.max(0, cmdResults.length - 1);

    if (!cmdResults.length) {
      listEl.innerHTML = '<div class="crema-cmd-group">No matching sections, colours, or actions.</div>';
      return;
    }

    var html = "";
    var lastGroup = "";
    cmdResults.forEach(function (it, idx) {
      if (it.group !== lastGroup) {
        lastGroup = it.group;
        html += '<div class="crema-cmd-group">' + it.group + "</div>";
      }
      var chipHtml = it.chip
        ? '<span class="crema-cmd-chip" style="background:' + it.chip + '"></span>'
        : "";
      html +=
        '<button type="button" class="crema-cmd-item' +
        (idx === cmdSelectedIdx ? " is-selected" : "") +
        '" data-cmd-idx="' +
        idx +
        '">' +
        '<span class="crema-cmd-item-left">' +
        chipHtml +
        "<span>" +
        it.title +
        "</span></span>" +
        '<span class="crema-cmd-hint">' +
        it.hint +
        "</span></button>";
    });
    listEl.innerHTML = html;

    listEl.querySelectorAll(".crema-cmd-item").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var idx = parseInt(btn.getAttribute("data-cmd-idx"), 10);
        if (cmdResults[idx]) {
          closeCmdPalette();
          cmdResults[idx].run();
        }
      });
    });
  }

  function ensureCmdPalette() {
    if (cmdBackdrop) return;
    cmdBackdrop = document.createElement("div");
    cmdBackdrop.className = "crema-cmd-backdrop";
    cmdBackdrop.setAttribute("role", "dialog");
    cmdBackdrop.setAttribute("aria-modal", "true");
    cmdBackdrop.setAttribute("aria-label", "CREMA Brand Manual Quick Index");
    cmdBackdrop.innerHTML =
      '<div class="crema-cmd-dialog">' +
      '  <div class="crema-cmd-header">' +
      '    <span style="font-size:11px;color:#4A4740;">⌘K</span>' +
      '    <input type="text" class="crema-cmd-input" placeholder="Jump to section, copy colour, export tokens..." aria-label="Search manual" />' +
      '    <button type="button" class="crema-cmd-esc">ESC</button>' +
      "  </div>" +
      '  <div class="crema-cmd-list"></div>' +
      '  <div class="crema-cmd-footer"><span>↑↓ NAVIGATE · ↵ SELECT</span><span>CREMA · PROIECTUM STUDIO</span></div>' +
      "</div>";

    document.body.appendChild(cmdBackdrop);

    var input = cmdBackdrop.querySelector(".crema-cmd-input");
    input.addEventListener("input", function () {
      cmdSelectedIdx = 0;
      renderCmdResults(input.value);
    });
    cmdBackdrop.querySelector(".crema-cmd-esc").addEventListener("click", closeCmdPalette);
    cmdBackdrop.addEventListener("click", function (ev) {
      if (ev.target === cmdBackdrop) closeCmdPalette();
    });
  }

  function openCmdPalette() {
    ensureCmdPalette();
    isCmdOpen = true;
    cmdSelectedIdx = 0;
    cmdBackdrop.classList.add("is-open");
    var input = cmdBackdrop.querySelector(".crema-cmd-input");
    input.value = "";
    renderCmdResults("");
    setTimeout(function () {
      input.focus();
    }, 10);
  }

  function closeCmdPalette() {
    if (!cmdBackdrop) return;
    isCmdOpen = false;
    cmdBackdrop.classList.remove("is-open");
  }

  function enhanceAll() {
    setupScrollspyAndNav();
    setupPaletteCards();
    setupLogoSandbox();
    setupLiveTypography();
    setupResourcesAndFooter();
    setupGalleryLightbox();
    updateScrollspy();
  }

  /* Capture-phase click handling: smooth section anchors + real file downloads ahead of Framer router */
  document.addEventListener(
    "click",
    function (ev) {
      var target = ev.target && ev.target.closest ? ev.target.closest("a[href]") : null;
      if (!target) return;
      if (target.dataset && target.dataset.cremaBypass === "1") {
        ev.stopPropagation();
        if (ev.stopImmediatePropagation) ev.stopImmediatePropagation();
        return;
      }
      var href = target.getAttribute("href") || "";

      if (href.indexOf("/downloads/") === 0 || target.hasAttribute("download")) {
        ev.stopPropagation();
        if (ev.stopImmediatePropagation) ev.stopImmediatePropagation();
        var fname = target.getAttribute("download") || href.split("/").pop();
        showToast("DOWNLOADING · " + fname);
        return;
      }

      if (href.indexOf("#") !== -1 && (href.charAt(0) === "#" || href.indexOf("./#") === 0)) {
        var id = href.slice(href.indexOf("#") + 1);
        if (document.getElementById(id)) {
          ev.preventDefault();
          ev.stopPropagation();
          scrollToSection(id);
          if (history.replaceState) {
            history.replaceState(null, "", "#" + id);
          }
        }
      }
    },
    true
  );

  /* Global keyboard shortcuts for Cmd+K / Ctrl+K and Lightbox */
  document.addEventListener("keydown", function (ev) {
    if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === "k") {
      ev.preventDefault();
      if (isLightboxOpen) closeLightbox();
      if (isCmdOpen) closeCmdPalette();
      else openCmdPalette();
      return;
    }
    if (isLightboxOpen) {
      if (ev.key === "Escape") {
        ev.preventDefault();
        closeLightbox();
      } else if (ev.key === "ArrowRight") {
        ev.preventDefault();
        stepLightbox(1);
      } else if (ev.key === "ArrowLeft") {
        ev.preventDefault();
        stepLightbox(-1);
      }
      return;
    }
    if (!isCmdOpen) return;

    if (ev.key === "Escape") {
      ev.preventDefault();
      closeCmdPalette();
    } else if (ev.key === "ArrowDown") {
      ev.preventDefault();
      if (cmdResults.length) {
        cmdSelectedIdx = (cmdSelectedIdx + 1) % cmdResults.length;
        renderCmdResults(cmdBackdrop.querySelector(".crema-cmd-input").value);
      }
    } else if (ev.key === "ArrowUp") {
      ev.preventDefault();
      if (cmdResults.length) {
        cmdSelectedIdx = (cmdSelectedIdx - 1 + cmdResults.length) % cmdResults.length;
        renderCmdResults(cmdBackdrop.querySelector(".crema-cmd-input").value);
      }
    } else if (ev.key === "Enter") {
      ev.preventDefault();
      if (cmdResults[cmdSelectedIdx]) {
        var picked = cmdResults[cmdSelectedIdx];
        closeCmdPalette();
        picked.run();
      }
    }
  });

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });

  function bootAfterHydration() {
    setTimeout(function () {
      requestAnimationFrame(function () {
        enhanceAll();
        var mainEl = document.getElementById("main");
        if (mainEl && typeof MutationObserver !== "undefined") {
          var debounceTimer = null;
          var obs = new MutationObserver(function () {
            if (debounceTimer) clearTimeout(debounceTimer);
            debounceTimer = setTimeout(enhanceAll, 120);
          });
          obs.observe(mainEl, { childList: true, subtree: true });
        }
      });
    }, 220);
  }

  if (document.readyState === "complete") {
    bootAfterHydration();
  } else {
    window.addEventListener("load", bootAfterHydration, { once: true });
  }
})();
