(() => {
  const header = document.getElementById("siteHeader");
  const progressBar = document.getElementById("progressBar");
  const mobileBar = document.getElementById("mobileBar");
  const year = document.getElementById("year");

  const hero = document.querySelector(".hero-v2");
  const heroCopy = document.getElementById("heroV2Copy");
  const assembly = document.getElementById("heroAssembly");
  const canvas = document.getElementById("assemblyCanvas");
  const state = document.getElementById("assemblyState");
  const pieces = canvas ? [...canvas.querySelectorAll(".ui-piece")] : [];

  if (year) year.textContent = new Date().getFullYear();

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const easeOut = t => 1 - Math.pow(1 - t, 3);

  const updateHeroAssembly = () => {
    if (!hero || !canvas || window.innerWidth <= 1020) return;

    const rect = hero.getBoundingClientRect();
    const travel = Math.max(1, hero.offsetHeight - window.innerHeight);
    const raw = clamp(-rect.top / travel);
    const p = easeOut(raw);

    pieces.forEach((piece, index) => {
      const x = Number(piece.dataset.x || 0);
      const y = Number(piece.dataset.y || 0);
      const r = Number(piece.dataset.r || 0);
      const remaining = 1 - p;
      const depth = 1 + (index % 3) * .018 * remaining;

      piece.style.transform =
        "translate3d(" + (x * remaining) + "px," + (y * remaining) + "px," + ((index % 4) * 8 * remaining) + "px) " +
        "rotate(" + (r * remaining) + "deg) scale(" + depth + ")";

      piece.style.opacity = String(.38 + p * .62);
      piece.style.filter = "blur(" + (remaining * 1.7) + "px)";
    });

    canvas.classList.toggle("is-built", p > .78);

    if (heroCopy) {
      const fade = clamp((raw - .58) / .42);
      heroCopy.style.opacity = String(1 - fade * .44);
      heroCopy.style.transform = "translate3d(0," + (-18 * fade) + "px,0)";
    }

    if (assembly) {
      const drift = (1 - p) * 10;
      assembly.style.transform = "translate3d(0," + drift + "px,0)";
    }

    if (state) {
      state.textContent = p < .36 ? "FRAGMENTS" : p < .78 ? "ALIGNING" : "BUILT";
    }
  };

  const onScroll = () => {
    const y = window.scrollY || document.documentElement.scrollTop;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? Math.min(1, y / max) : 0;

    if (header) header.classList.toggle("scrolled", y > 18);
    if (progressBar) progressBar.style.transform = "scaleX(" + progress + ")";
    if (mobileBar) mobileBar.classList.toggle("visible", y > 420);

    updateHeroAssembly();
  };

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", updateHeroAssembly, { passive: true });

  if (canvas && window.matchMedia("(pointer:fine)").matches) {
    canvas.addEventListener("pointermove", event => {
      const rect = canvas.getBoundingClientRect();
      const nx = (event.clientX - rect.left) / rect.width - .5;
      const ny = (event.clientY - rect.top) / rect.height - .5;

      canvas.style.setProperty("--ry", (nx * 3.2).toFixed(2) + "deg");
      canvas.style.setProperty("--rx", (-ny * 2.4).toFixed(2) + "deg");
    });

    canvas.addEventListener("pointerleave", () => {
      canvas.style.setProperty("--ry", "-2deg");
      canvas.style.setProperty("--rx", "1.2deg");
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
      { threshold: .12, rootMargin: "0px 0px -40px 0px" }
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
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
})();