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
  const heroPieces = heroUi ? [...heroUi.querySelectorAll(".v3-piece")] : [];

  if (year) year.textContent = new Date().getFullYear();

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const easeOut = t => 1 - Math.pow(1 - t, 3);

  const updateHero = () => {
    if (!hero || !heroUi) return;

    const rect = hero.getBoundingClientRect();
    const travel = Math.max(1, hero.offsetHeight - window.innerHeight);
    const raw = clamp(-rect.top / travel);
    const p = easeOut(raw);

    const value = Math.round(raw * 100);
    if (heroCounter) heroCounter.textContent = String(value).padStart(3, "0");

    heroPieces.forEach((piece, index) => {
      const x = Number(piece.dataset.x || 0);
      const y = Number(piece.dataset.y || 0);
      const r = Number(piece.dataset.r || 0);
      const remaining = 1 - p;
      const depth = 1 + ((index % 4) * .022 * remaining);

      piece.style.transform =
        "translate3d(" + (x * remaining) + "px," + (y * remaining) + "px," + ((index % 5) * 10 * remaining) + "px) " +
        "rotate(" + (r * remaining) + "deg) scale(" + depth + ")";
      piece.style.opacity = String(.24 + p * .76);
      piece.style.filter = "blur(" + (remaining * 2.2) + "px)";
    });

    heroUi.classList.toggle("built", raw > .76);

    if (heroCopy) {
      const fade = clamp((raw - .28) / .42);
      const intro = clamp(raw / .16);
      heroCopy.style.opacity = String((.88 + intro * .12) * (1 - fade * .82));
      heroCopy.style.transform =
        "translateY(calc(-50% - " + (34 * fade) + "px)) scale(" + (1 - fade * .035) + ")";
    }

    if (heroStage) {
      const stageScale = .965 + p * .035;
      heroStage.style.transform = "scale(" + stageScale + ")";
    }

    if (heroState) {
      heroState.textContent =
        raw < .28 ? "FRAGMENTS" :
        raw < .70 ? "ALIGNING" :
        raw < .96 ? "BUILT" : "READY";
    }
  };

  const onScroll = () => {
    const y = window.scrollY || document.documentElement.scrollTop;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? Math.min(1, y / max) : 0;

    if (header) header.classList.toggle("scrolled", y > 18);
    if (progressBar) progressBar.style.transform = "scaleX(" + progress + ")";
    if (mobileBar) mobileBar.classList.toggle("visible", y > window.innerHeight * 1.35);

    updateHero();
  };

  onScroll();
  window.addEventListener("scroll", onScroll, { passive:true });
  window.addEventListener("resize", updateHero, { passive:true });

  if (heroUi && window.matchMedia("(pointer:fine)").matches) {
    heroUi.addEventListener("pointermove", event => {
      const rect = heroUi.getBoundingClientRect();
      const nx = (event.clientX - rect.left) / rect.width - .5;
      const ny = (event.clientY - rect.top) / rect.height - .5;

      heroUi.style.setProperty("--ry", (nx * 2.8).toFixed(2) + "deg");
      heroUi.style.setProperty("--rx", (-ny * 2.0).toFixed(2) + "deg");
    });

    heroUi.addEventListener("pointerleave", () => {
      heroUi.style.setProperty("--ry", "-1.4deg");
      heroUi.style.setProperty("--rx", "1deg");
    });
  }

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