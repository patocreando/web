(() => {
  const header = document.getElementById("siteHeader");
  const progressBar = document.getElementById("progressBar");
  const mobileBar = document.getElementById("mobileBar");
  const year = document.getElementById("year");

  const hero = document.querySelector(".hero-v3");
  const heroCopy = document.getElementById("heroCopy");
  const heroUi = document.getElementById("heroUi");
  const heroStage = document.getElementById("heroStage");
  const heroCounter = document.getElementById("heroCounter");
  const heroState = document.getElementById("heroState");
  const heroScroll = document.querySelector(".hero-v3-scroll");
  const heroPieces = heroUi ? [...heroUi.querySelectorAll(".v3-piece")] : [];
  const dashboardCards = heroUi ? [...heroUi.querySelectorAll(".dash-card")] : [];
  const dashboardFrame = document.getElementById("heroDashboardFrame");
  const dashboardSiteArt = document.getElementById("dashSiteArt");
  const dashboardSidebarNav = document.getElementById("dashSidebarNav");
  const dashboardSidebarItems = dashboardSidebarNav ? [...dashboardSidebarNav.querySelectorAll("[data-sidebar-tab]")] : [];
  const dashboardSteps = heroUi ? [...heroUi.querySelectorAll(".dash-steps [data-build-step]")] : [];
  const dashboardRouteFill = document.getElementById("dashRouteFill");
  const dashboardTypeCode = document.getElementById("dashTypeCode");
  const dashboardCodeStatus = document.getElementById("dashCodeStatus");
  const dashboardCodeTabs = heroUi ? [...heroUi.querySelectorAll("[data-code-tab]")] : [];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const dashboardCodeSource = [
    '<!doctype html>',
    '<html lang="es">',
    '<head>',
    '  <meta charset="utf-8">',
    '  <meta name="viewport" content="width=device-width,initial-scale=1">',
    '  <title>Pato Creando — Web</title>',
    '</head>',
    '<body>',
    '  <header class="site-nav">',
    '    <a class="brand" href="#inicio">Pato Creando</a>',
    '    <nav>',
    '      <a href="#servicio">Servicio</a>',
    '      <a href="#planes">Planes</a>',
    '      <a href="#contacto">Contacto</a>',
    '    </nav>',
    '  </header>',
    '',
    '  <main>',
    '    <section class="hero" id="inicio">',
    '      <p class="eyebrow">WEB PARA NEGOCIOS</p>',
    '      <h1>Una web clara.</h1>',
    '      <h2>Una acción clara.</h2>',
    '      <a class="cta" href="#planes">Ver planes ↗</a>',
    '    </section>',
    '  </main>',
    '</body>',
    '</html>',
    '',
    '/* ===== CSS ===== */',
    ':root {',
    '  --bg: #08100e;',
    '  --surface: #0e1714;',
    '  --text: #edf2ee;',
    '  --muted: #7f8a84;',
    '  --accent: #9fcf78;',
    '}',
    '',
    '* { box-sizing: border-box; }',
    'body {',
    '  margin: 0;',
    '  background: var(--bg);',
    '  color: var(--text);',
    '  font-family: Inter, sans-serif;',
    '}',
    '.site-nav {',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: space-between;',
    '  padding: 24px 6vw;',
    '}',
    '.site-nav nav { display: flex; gap: 24px; }',
    '.hero {',
    '  min-height: 100vh;',
    '  display: grid;',
    '  align-content: center;',
    '  padding: 8vw;',
    '}',
    '.hero h1, .hero h2 {',
    '  margin: 0;',
    '  font-size: clamp(54px, 8vw, 118px);',
    '  line-height: .92;',
    '}',
    '.hero h2 { color: #b8cca9; }',
    '.cta {',
    '  width: max-content;',
    '  margin-top: 28px;',
    '  padding: 14px 18px;',
    '  border: 1px solid rgba(159,207,120,.25);',
    '  border-radius: 999px;',
    '  color: var(--text);',
    '}',
    '',
    '// ===== JAVASCRIPT =====',
    'const sections = document.querySelectorAll("section");',
    'const navLinks = document.querySelectorAll(".site-nav a");',
    '',
    'const observer = new IntersectionObserver(entries => {',
    '  entries.forEach(entry => {',
    '    if (!entry.isIntersecting) return;',
    '    document.body.dataset.section = entry.target.id;',
    '  });',
    '}, { threshold: .45 });',
    '',
    'sections.forEach(section => observer.observe(section));',
    '',
    'window.addEventListener("scroll", () => {',
    '  const max = document.documentElement.scrollHeight - innerHeight;',
    '  const p = max > 0 ? scrollY / max : 0;',
    '  document.documentElement.style.setProperty("--scroll", p.toFixed(3));',
    '}, { passive: true });',
    '',
    'console.log("Sitio listo para publicar");'
  ].join("\n");

  const htmlMarker = dashboardCodeSource.indexOf('/* ===== CSS ===== */');
  const jsMarker = dashboardCodeSource.indexOf('// ===== JAVASCRIPT =====');

  let sidebarIdleTimer = 0;
  let sidebarCycleTimer = 0;
  let sidebarCycleIndex = 0;
  let sidebarHovering = false;

  const setSidebarActive = (index, fromIdle = false) => {
    if (!dashboardSidebarItems.length) return;
    sidebarCycleIndex = Math.max(0, Math.min(dashboardSidebarItems.length - 1, index));
    dashboardSidebarItems.forEach((item,itemIndex) => {
      const active = itemIndex === sidebarCycleIndex;
      item.classList.toggle("active", active);
      item.classList.toggle("is-idle-cycle", active && fromIdle && !reduceMotion);
    });
  };

  const stopSidebarCycle = () => {
    window.clearTimeout(sidebarIdleTimer);
    window.clearInterval(sidebarCycleTimer);
    sidebarIdleTimer = 0;
    sidebarCycleTimer = 0;
    dashboardSidebarItems.forEach(item => item.classList.remove("is-idle-cycle"));
  };

  const scheduleSidebarCycle = () => {
    if (reduceMotion || !dashboardSidebarItems.length || sidebarHovering) return;
    stopSidebarCycle();

    sidebarIdleTimer = window.setTimeout(() => {
      if (!hero) return;
      const rect = hero.getBoundingClientRect();
      const travel = Math.max(1, hero.offsetHeight - window.innerHeight);
      const raw = clamp(-rect.top / travel);

      // Only auto-play while the dashboard itself is clearly on screen.
      if (raw < .20 || raw > .96) return;

      setSidebarActive((sidebarCycleIndex + 1) % dashboardSidebarItems.length, true);

      sidebarCycleTimer = window.setInterval(() => {
        setSidebarActive((sidebarCycleIndex + 1) % dashboardSidebarItems.length, true);
      }, 1550);
    }, 1700);
  };

  dashboardSidebarItems.forEach((item,index) => {
    item.addEventListener("pointerenter", () => {
      sidebarHovering = true;
      stopSidebarCycle();
      setSidebarActive(index, false);
    });
  });

  if (dashboardSidebarNav) {
    dashboardSidebarNav.addEventListener("pointerleave", () => {
      sidebarHovering = false;
      scheduleSidebarCycle();
    });
  }

  if (year) year.textContent = new Date().getFullYear();

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const easeOut = t => 1 - Math.pow(1 - t, 3);

  const updateHero = () => {
    if (!hero || !heroUi || !heroStage) return;

    const rect = hero.getBoundingClientRect();
    const travel = Math.max(1, hero.offsetHeight - window.innerHeight);
    const raw = clamp(-rect.top / travel);

    const counter = Math.round(raw * 100);
    if (heroCounter) heroCounter.textContent = String(counter).padStart(3, "0");

    // Phase 1: headline owns the screen.
    const copyFade = clamp((raw - .14) / .15);
    if (heroCopy) {
      const copyScale = 1 - copyFade * .045;
      heroCopy.style.opacity = String(1 - copyFade);
      heroCopy.style.transform =
        "translateY(calc(-50% - " + (42 * copyFade) + "px)) scale(" + copyScale + ")";
    }

    if (heroScroll) {
      heroScroll.style.opacity = String(1 - clamp(raw / .16));
    }

    // Phase 2: the interface fades in only after the headline starts leaving.
    const stageIn = easeOut(clamp((raw - .12) / .18));
    const stageScale = .94 + stageIn * .06;
    heroStage.style.opacity = String(.045 + stageIn * .955);
    heroStage.style.filter = "blur(" + ((1 - stageIn) * 5) + "px)";
    heroStage.style.transform = "scale(" + stageScale + ")";

    // Phase 3: assemble from 0 to 100 without colliding with the headline.
    const buildRaw = clamp((raw - .24) / .56);
    const build = ease(buildRaw);

    heroPieces.forEach((piece, index) => {
      const x = Number(piece.dataset.x || 0);
      const y = Number(piece.dataset.y || 0);
      const r = Number(piece.dataset.r || 0);
      const remaining = 1 - build;
      const staggerStart = (index % 6) * .018;
      const pieceProgress = easeOut(clamp((buildRaw - staggerStart) / (1 - staggerStart)));
      const pieceRemaining = 1 - pieceProgress;

      piece.style.transform =
        "translate3d(" + (x * pieceRemaining) + "px," + (y * pieceRemaining) + "px," +
        ((index % 5) * 12 * pieceRemaining) + "px) rotate(" + (r * pieceRemaining) +
        "deg) scale(" + (1 + (index % 4) * .018 * pieceRemaining) + ")";

      piece.style.opacity = String(pieceProgress);
      piece.style.filter = "blur(" + (pieceRemaining * 2.4) + "px)";
    });

    // Phase 4: hold the completed interface before releasing into the page.
    const webBuild = clamp((raw - .24) / .56);
    const webEase = easeOut(webBuild);
    heroUi.style.setProperty("--web-shift-x", ((1 - webEase) * 18).toFixed(2) + "px");
    heroUi.style.setProperty("--web-shift-y", ((1 - webEase) * 7).toFixed(2) + "px");
    heroUi.style.setProperty("--web-back-x", (8 + (1 - webEase) * 22).toFixed(2) + "px");
    heroUi.style.setProperty("--web-back-y", (-4 - (1 - webEase) * 11).toFixed(2) + "px");
    heroUi.style.setProperty("--web-mid-x", (4 + (1 - webEase) * 13).toFixed(2) + "px");
    heroUi.style.setProperty("--web-mid-y", (-2 - (1 - webEase) * 6).toFixed(2) + "px");
    heroUi.style.setProperty("--web-tilt", (-5 + webEase * 3).toFixed(2) + "deg");
    heroUi.style.setProperty("--web-wire", (0.88 - webEase * 0.72).toFixed(3));
    heroUi.style.setProperty("--dash-progress", webEase.toFixed(3));

    dashboardCards.forEach((card,index) => {
      const start = .27 + Math.min(index,7) * .026;
      const cardIn = easeOut(clamp((raw - start) / .27));
      card.style.opacity = String(.16 + cardIn * .84);
      card.style.transform = "translate3d(0," + (15 * (1 - cardIn)).toFixed(2) + "px,0)";
    });

    const routeRaw = clamp((raw - .33) / .43);
    const routeProgress = easeOut(routeRaw);
    const routeStage = raw < .33 ? -1 : Math.min(4, Math.floor(routeRaw * 5));

    if (dashboardRouteFill) {
      const routeTrack = dashboardRouteFill.parentElement;
      if (routeTrack) routeTrack.style.setProperty("--route-p", (routeProgress * 100).toFixed(1) + "%");
    }

    dashboardSteps.forEach((step,index) => {
      step.classList.toggle("is-done", routeStage > index || routeProgress >= 1);
      step.classList.toggle("is-active", routeStage === index && routeProgress < 1);
      if (routeProgress >= 1 && index === 4) step.classList.add("is-active");
    });

    // Code is not timer-driven: the amount typed is mapped 1:1 to hero scroll progress.
    // It starts as soon as the dashboard appears and continues only while the user scrolls.
    const codeProgress = reduceMotion ? 1 : clamp((raw - .20) / .60);
    if (dashboardTypeCode) {
      const typedLength = Math.floor(dashboardCodeSource.length * codeProgress);
      dashboardTypeCode.textContent = dashboardCodeSource.slice(0, typedLength);

      const currentLanguage =
        typedLength < htmlMarker ? "html" :
        typedLength < jsMarker ? "css" : "js";

      dashboardCodeTabs.forEach(tab => {
        tab.classList.toggle("active", tab.dataset.codeTab === currentLanguage);
      });

      if (dashboardCodeStatus) {
        dashboardCodeStatus.textContent =
          currentLanguage.toUpperCase() + " / " +
          String(Math.round(codeProgress * 100)).padStart(3, "0") + "%";
      }
    }

    if (dashboardFrame) {
      const frameIn = easeOut(clamp((raw - .22) / .50));
      dashboardFrame.style.transform =
        "scale(" + (.965 + frameIn * .035).toFixed(4) + ") " +
        "rotateX(" + ((1 - frameIn) * 1.4).toFixed(2) + "deg) " +
        "rotateY(" + ((1 - frameIn) * -2.2).toFixed(2) + "deg)";
    }

    if (dashboardSiteArt) {
      const artP = easeOut(clamp((raw - .18) / .66));
      dashboardSiteArt.style.setProperty("--orb-x", ((artP - .5) * 18).toFixed(1) + "px");
      dashboardSiteArt.style.setProperty("--orb-y", ((.5 - artP) * 12).toFixed(1) + "px");
      dashboardSiteArt.style.setProperty("--orb-scale", (.96 + artP * .08).toFixed(3));
      dashboardSiteArt.style.setProperty("--orb-tilt", ((artP - .5) * 2.2).toFixed(2) + "deg");
    }

    const finalGlow = clamp((raw - .80) / .16);
    heroUi.classList.toggle("built", raw > .78);
    heroUi.style.opacity = String(.82 + finalGlow * .18);

    if (heroState) {
      heroState.textContent =
        raw < .14 ? "INICIO" :
        raw < .28 ? "APARECE" :
        raw < .78 ? "CREANDO" :
        raw < .96 ? "CREADA" : "LISTO";
    }
  };

  const onScroll = () => {
    const y = window.scrollY || document.documentElement.scrollTop;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? Math.min(1, y / max) : 0;

    if (header) header.classList.toggle("scrolled", y > 18);
    if (progressBar) progressBar.style.transform = "scaleX(" + progress + ")";
    if (mobileBar) mobileBar.classList.toggle("visible", y > window.innerHeight * 2.1);

    if (!sidebarHovering) {
      stopSidebarCycle();
      scheduleSidebarCycle();
    }

    updateHero();
    updateOrder();
  };

  if (heroUi && window.matchMedia("(pointer:fine)").matches) {
    heroUi.addEventListener("pointermove", event => {
      const rect = heroUi.getBoundingClientRect();
      const nx = (event.clientX - rect.left) / rect.width - .5;
      const ny = (event.clientY - rect.top) / rect.height - .5;

      heroUi.style.setProperty("--ry", (nx * 2.3).toFixed(2) + "deg");
      heroUi.style.setProperty("--rx", (-ny * 1.7).toFixed(2) + "deg");
    });

    heroUi.addEventListener("pointerleave", () => {
      heroUi.style.setProperty("--ry", "-1.4deg");
      heroUi.style.setProperty("--rx", "1deg");
    });
  }


  const orderSection = document.querySelector(".order-section");
  const orderCopy = document.getElementById("orderCopy");
  const orderSystem = document.getElementById("orderSystem");
  const orderCore = document.getElementById("orderCore");
  const orderResult = document.getElementById("orderResult");
  const orderCounter = document.getElementById("orderCounter");
  const orderProgress = document.querySelector(".order-progress");
  const orderNodes = orderSystem ? [...orderSystem.querySelectorAll(".order-node")] : [];
  const orderLines = orderSystem ? [...orderSystem.querySelectorAll(".order-line")] : [];

  const updateOrder = () => {
    if (!orderSection || !orderSystem || !orderCore) return;

    const rect = orderSection.getBoundingClientRect();
    const travel = Math.max(1, orderSection.offsetHeight - window.innerHeight);
    const raw = clamp(-rect.top / travel);
    const p = easeOut(raw);

    if (orderCounter) orderCounter.textContent = String(Math.round(raw * 100)).padStart(2, "0");
    if (orderProgress) orderProgress.style.setProperty("--order-p", (raw * 100).toFixed(1) + "%");

    const compactOrder = window.innerWidth <= 760;
    const copyFade = clamp((raw - (compactOrder ? .25 : .18)) / (compactOrder ? .26 : .20));
    if (orderCopy) {
      orderCopy.style.opacity = String(1 - copyFade * (compactOrder ? .48 : .68));
      orderCopy.style.transform =
        "translateX(-50%) translateY(" + ((compactOrder ? -8 : -24) * copyFade) + "px) " +
        "scale(" + (1 - (compactOrder ? .012 : .03) * copyFade) + ")";
    }

    const systemIn = easeOut(clamp(raw / .26));
    orderSystem.style.opacity = String(.42 + systemIn * .58);
    orderSystem.style.transform = "translate(-50%,-50%) scale(" + (.92 + .08 * systemIn) + ")";

    const compact = window.innerWidth <= 760;
    const positions = compact
      ? [
          {x: 44, y: 30, r: -2},
          {x:-44, y: 30, r: 2},
          {x: 44, y:-30, r: 2},
          {x:-44, y:-30, r:-2}
        ]
      : [
          {x:105, y: 60, r: -3},
          {x:-105, y: 60, r: 3},
          {x:105, y:-60, r: 3},
          {x:-105, y:-60, r:-3}
        ];

    const spread = ease(clamp((raw - .18) / .50));

    orderNodes.forEach((node, index) => {
      const pos = positions[index] || {x:0,y:0,r:0};
      node.style.opacity = String(.52 + spread * .48);
      node.style.transform =
        "translate(" + (-pos.x * spread) + "px," + (-pos.y * spread) + "px) " +
        "rotate(" + (pos.r * (1 - spread)) + "deg) scale(" + (.98 + spread * .02) + ")";
    });

    const lineProgress = easeOut(clamp((raw - .24) / .44));
    const lengths = compact ? [132,132,126,126] : [235,235,225,225];
    orderLines.forEach((line,index) => {
      line.style.width = (lengths[index] * lineProgress) + "px";
      line.style.opacity = String(lineProgress * .52);
    });

    const coreIn = easeOut(clamp((raw - .38) / .34));
    orderCore.style.opacity = String(.42 + coreIn * .58);
    orderCore.style.transform =
      "translate(-50%,-50%) scale(" + (.72 + coreIn * .28) + ")";
    orderCore.style.boxShadow =
      "inset 0 0 54px rgba(159,207,120," + (.025 + coreIn * .035) + ")," +
      "0 0 " + (80 + coreIn * 85) + "px rgba(159,207,120," + (.025 + coreIn * .045) + ")";

    const resultIn = easeOut(clamp((raw - .72) / .20));
    if (orderResult) {
      orderResult.style.opacity = String(resultIn);
      orderResult.style.transform = "translate(-50%," + (24 * (1 - resultIn)) + "px)";
    }
  };

  onScroll();
  window.addEventListener("scroll", onScroll, { passive:true });
  window.addEventListener("resize", () => {
    updateHero();
    updateOrder();
  }, { passive:true });

  const items = document.querySelectorAll("[data-reveal]");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold:.12, rootMargin:"0px 0px -40px 0px" }
    );

    items.forEach(item => observer.observe(item));
  } else {
    items.forEach(item => item.classList.add("visible"));
  }

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", event => {
      const href = link.getAttribute("href");
      const target = href && document.querySelector(href);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior:"smooth", block:"start" });
    });
  });
})();