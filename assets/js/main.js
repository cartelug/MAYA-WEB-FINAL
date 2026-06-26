/* =========================================================================
   Maya Nature Resort — v7 interactions
   Vanilla JS, progressive enhancement, respects prefers-reduced-motion.
   Modules: preloader · mobile menu · header · text/scroll reveal · counters ·
            hero parallax · magnetic CTAs · cursor glow · gallery lightbox ·
            day→night cinematic journey.
   ========================================================================= */
(function () {
  "use strict";

  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  if (!reduceMotion) root.classList.add("reveal-ready");

  /* ---------- Preloader → orchestrated hero entrance ---------- */
  // Hero stays hidden behind the preloader; once it lifts we add `intro-ready`
  // so the logo animates in first and the wording follows, on open.
  const startIntro = () => { if (!reduceMotion) root.classList.add("intro-ready"); };
  const preloader = document.querySelector(".preloader");
  if (preloader) {
    const minShow = reduceMotion ? 500 : 2400; // let the logo + fill bar finish
    const start = performance.now();
    const reveal = () => { preloader.classList.add("is-loaded"); startIntro(); };
    const hide = () => {
      const wait = Math.max(0, minShow - (performance.now() - start));
      setTimeout(reveal, wait);
    };
    if (document.readyState === "complete") hide();
    else window.addEventListener("load", hide, { once: true });
    setTimeout(reveal, 5200); // failsafe
  } else {
    startIntro(); // no preloader on this page — play the entrance straight away
  }

  /* ---------- Mobile menu (overlay) ---------- */
  const menuToggle = document.getElementById("menuToggle");
  const mobileMenu = document.getElementById("mobileMenu");
  function openMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.add("is-open");
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Close menu");
    document.body.style.overflow = "hidden";
    const first = mobileMenu.querySelector(".mm-link");
    if (first) setTimeout(() => first.focus(), 250);
  }
  function closeMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
    document.body.style.overflow = "";
  }
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () =>
      mobileMenu.classList.contains("is-open") ? closeMenu() : openMenu()
    );
    mobileMenu.querySelectorAll(".mm-link, .mm-cta").forEach((a) =>
      a.addEventListener("click", closeMenu)
    );
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && mobileMenu.classList.contains("is-open")) {
        closeMenu(); menuToggle.focus();
      }
    });
  }

  /* ---------- WhatsApp inquiry form ---------- */
  document.querySelectorAll("[data-whatsapp-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = form.querySelector("[name='name']")?.value.trim() || "";
      const interest = form.querySelector("[name='interest']")?.value.trim() || "reservation";
      const date = form.querySelector("[name='date']")?.value.trim() || "";
      const message = `Hello Maya Nature Resort, my name is ${name}. I would like to inquire about ${interest}${date ? " for " + date : ""}.`;
      window.open(`https://wa.me/256773883760?text=${encodeURIComponent(message)}`, "_blank", "noopener");
    });
  });

  /* ---------- Header scrolled state ---------- */
  const header = document.querySelector("[data-header]");
  if (header) {
    const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Word-by-word reveal (headings) ---------- */
  document.querySelectorAll("[data-text-reveal]").forEach((el) => {
    if (el.dataset.split === "1") return;
    el.dataset.split = "1";
    const walk = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach((p) => {
          if (/^\s+$/.test(p)) frag.appendChild(document.createTextNode(p));
          else if (p.length) {
            const w = document.createElement("span");
            w.className = "word"; w.textContent = p;
            frag.appendChild(w);
          }
        });
        node.parentNode.replaceChild(frag, node);
      } else if (node.nodeType === Node.ELEMENT_NODE && !node.classList.contains("word")) {
        Array.from(node.childNodes).forEach(walk);
      }
    };
    Array.from(el.childNodes).forEach(walk);
    el.querySelectorAll(".word").forEach((w, i) => {
      w.style.transitionDelay = Math.min(i * 60, 540) + "ms";
    });
  });

  /* ---------- Scroll reveal ---------- */
  const revealEls = Array.from(document.querySelectorAll("[data-reveal], [data-text-reveal]"));
  if (revealEls.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealEls.forEach((el) => el.classList.add("is-visible"));
    } else {
      const groups = new Map();
      revealEls.forEach((el) => {
        if (!el.hasAttribute("data-reveal")) return;
        const sibs = groups.get(el.parentElement) || [];
        sibs.push(el); groups.set(el.parentElement, sibs);
      });
      groups.forEach((sibs) => sibs.forEach((el, i) => {
        if (i > 0) el.style.transitionDelay = Math.min(i * 90, 540) + "ms";
      }));
      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) { entry.target.classList.add("is-visible"); obs.unobserve(entry.target); }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
      revealEls.forEach((el) => io.observe(el));
    }
  }

  /* ---------- Count-up stats ---------- */
  const counters = Array.from(document.querySelectorAll("[data-count]"));
  const fmtNum = (n) => n.toLocaleString("en-US");
  function runCount(el) {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    if (reduceMotion) { el.textContent = fmtNum(target) + suffix; return; }
    const dur = 1600, start = performance.now();
    (function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = fmtNum(Math.round(target * (1 - Math.pow(1 - p, 3)))) + suffix;
      if (p < 1) requestAnimationFrame(tick); else el.textContent = fmtNum(target) + suffix;
    })(start);
  }
  if (counters.length) {
    if (!("IntersectionObserver" in window)) counters.forEach(runCount);
    else {
      const co = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) { runCount(entry.target); obs.unobserve(entry.target); }
        });
      }, { threshold: 0.6 });
      counters.forEach((el) => co.observe(el));
    }
  }

  /* ---------- Generic hero parallax ([data-parallax]) ---------- */
  const parallaxEls = Array.from(document.querySelectorAll("[data-parallax]"));
  if (parallaxEls.length && !reduceMotion) {
    let ticking = false;
    const update = () => {
      const y = window.scrollY;
      parallaxEls.forEach((el) => {
        const speed = parseFloat(el.dataset.parallax) || 0.15;
        if (y < window.innerHeight * 1.4) el.style.transform = `translateY(${y * speed}px) scale(1.04)`;
      });
      ticking = false;
    };
    window.addEventListener("scroll", () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ---------- Magnetic buttons ---------- */
  if (!reduceMotion && finePointer) {
    document.querySelectorAll(".magnet, .nav-cta, .btn-primary").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.18}px, ${y * 0.18 - 3}px)`;
      });
      el.addEventListener("mouseleave", () => { el.style.transform = ""; });
    });
  }

  /* ---------- Cursor glow ---------- */
  if (!reduceMotion && finePointer) {
    const glow = document.createElement("div");
    glow.className = "cursor-glow";
    document.body.appendChild(glow);
    let gx = 0, gy = 0, cx = 0, cy = 0, active = false;
    window.addEventListener("mousemove", (e) => {
      gx = e.clientX; gy = e.clientY;
      if (!active) { active = true; glow.classList.add("is-active"); }
    });
    document.addEventListener("mouseover", (e) => {
      const hot = e.target.closest("a, button, .card, .gallery-item, .quote-card");
      glow.classList.toggle("is-hot", !!hot);
    });
    (function loop() {
      cx = lerp(cx, gx, 0.18); cy = lerp(cy, gy, 0.18);
      glow.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- Gallery lightbox ---------- */
  const galleryItems = Array.from(document.querySelectorAll("[data-lightbox]"));
  if (galleryItems.length) {
    const sources = galleryItems.map((el) => el.getAttribute("data-lightbox"));
    const labels = galleryItems.map((el) => el.getAttribute("data-caption") || "");
    let idx = 0;
    const box = document.createElement("div");
    box.className = "lightbox"; box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true");
    box.innerHTML =
      '<button class="lightbox-close" aria-label="Close gallery"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button>' +
      '<button class="lightbox-nav lightbox-prev" aria-label="Previous"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg></button>' +
      '<img alt="" />' +
      '<button class="lightbox-nav lightbox-next" aria-label="Next"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></button>';
    document.body.appendChild(box);
    const imgEl = box.querySelector("img");
    const show = (i) => { idx = (i + sources.length) % sources.length; imgEl.src = sources[idx]; imgEl.alt = labels[idx]; };
    const open = (i) => { show(i); box.classList.add("is-open"); document.body.style.overflow = "hidden"; };
    const close = () => { box.classList.remove("is-open"); document.body.style.overflow = ""; };
    galleryItems.forEach((el, i) => {
      el.setAttribute("tabindex", "0"); el.setAttribute("role", "button");
      el.addEventListener("click", () => open(i));
      el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(i); } });
    });
    box.querySelector(".lightbox-close").addEventListener("click", close);
    box.querySelector(".lightbox-prev").addEventListener("click", () => show(idx - 1));
    box.querySelector(".lightbox-next").addEventListener("click", () => show(idx + 1));
    box.addEventListener("click", (e) => { if (e.target === box) close(); });
    document.addEventListener("keydown", (e) => {
      if (!box.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(idx - 1);
      if (e.key === "ArrowRight") show(idx + 1);
    });
  }

  /* ---------- Day → Night cinematic journey ---------- */
  const journey = document.querySelector(".journey");
  if (journey) {
    const stage = journey.querySelector(".journey-stage");
    const sky = journey.querySelector(".journey-sky");
    const chapters = Array.from(journey.querySelectorAll(".chapter"));
    const dots = Array.from(journey.querySelectorAll(".journey-progress button"));
    const hills = Array.from(journey.querySelectorAll(".journey-hill"));

    // Sky keyframe palettes from dawn → night (top, mid, bottom)
    const skies = [
      { t: "#163a6b", m: "#4d6a8f", b: "#f3b65a", land: "#13361f", star: 0 }, // dawn
      { t: "#3d7fc4", m: "#8fc0e8", b: "#dbeefc", land: "#16451f", star: 0 }, // midday
      { t: "#1f5fa8", m: "#e89a4e", b: "#f7d27a", land: "#123a1d", star: 0 }, // golden hour
      { t: "#3a2a5e", m: "#9c4f74", b: "#e88a52", land: "#0e2a17", star: .15 }, // dusk
      { t: "#050a1f", m: "#0e1f3a", b: "#243a54", land: "#06180e", star: 1 }, // night
    ];
    const mix = (c1, c2, t) => {
      const h2r = (h) => [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)];
      const a = h2r(c1), b = h2r(c2);
      return `rgb(${Math.round(lerp(a[0],b[0],t))},${Math.round(lerp(a[1],b[1],t))},${Math.round(lerp(a[2],b[2],t))})`;
    };

    const setStatic = () => {
      journey.classList.add("is-static");
      // apply golden-hour palette as the static backdrop
      const s = skies[2];
      stage.style.setProperty("--sky-top", s.t);
      stage.style.setProperty("--sky-mid", s.m);
      stage.style.setProperty("--sky-bot", s.b);
      stage.style.setProperty("--land", s.land);
      chapters.forEach((c) => c.classList.add("is-active"));
    };

    if (reduceMotion || !("IntersectionObserver" in window) || window.innerWidth < 760) {
      setStatic();
    } else {
      let ticking = false, activeChapter = -1;
      const render = () => {
        const rect = journey.getBoundingClientRect();
        const total = journey.offsetHeight - window.innerHeight;
        const p = clamp(-rect.top / total, 0, 1); // 0..1 progress through journey
        // segment between palettes
        const seg = p * (skies.length - 1);
        const i = Math.min(skies.length - 2, Math.floor(seg));
        const f = seg - i;
        const a = skies[i], b = skies[i + 1];
        stage.style.setProperty("--sky-top", mix(a.t, b.t, f));
        stage.style.setProperty("--sky-mid", mix(a.m, b.m, f));
        stage.style.setProperty("--sky-bot", mix(a.b, b.b, f));
        stage.style.setProperty("--land", mix(a.land, b.land, f));
        stage.style.setProperty("--star-op", lerp(a.star, b.star, f).toFixed(3));
        // sun arc: rises from left-low, peaks centre, sets right-low (parametric semicircle)
        const ang = Math.PI * p;                 // 0..π
        const sunX = 8 + 84 * p;                 // 8%..92%
        const sunY = 80 - Math.sin(ang) * 64;    // dips to ~16% at peak
        stage.style.setProperty("--sun-x", sunX.toFixed(1) + "%");
        stage.style.setProperty("--sun-y", sunY.toFixed(1) + "%");
        // sun fades out as it sets into night
        stage.style.setProperty("--sun-op", (p > 0.9 ? lerp(1, 0.1, (p - 0.9) / 0.1) : 1).toFixed(2));
        // hills parallax
        hills.forEach((h, k) => {
          const speed = (k + 1) * 14;
          h.style.transform = `translateY(${(1 - Math.sin(ang)) * speed}px)`;
        });
        // chapter cross-fade (5 chapters across progress)
        const ci = clamp(Math.round(p * (chapters.length - 1)), 0, chapters.length - 1);
        if (ci !== activeChapter) {
          activeChapter = ci;
          chapters.forEach((c, k) => c.classList.toggle("is-active", k === ci));
          dots.forEach((d, k) => d.classList.toggle("is-active", k === ci));
        }
        ticking = false;
      };
      window.addEventListener("scroll", () => {
        if (!ticking) { ticking = true; requestAnimationFrame(render); }
      }, { passive: true });
      window.addEventListener("resize", () => {
        if (window.innerWidth < 760) { location.reload(); }
      }, { passive: true });
      // dot navigation
      dots.forEach((d, k) => d.addEventListener("click", () => {
        const total = journey.offsetHeight - window.innerHeight;
        const target = journey.offsetTop + (k / (chapters.length - 1)) * total;
        window.scrollTo({ top: target, behavior: "smooth" });
      }));
      render();
    }
  }

  /* =======================================================================
     Maya Motion System (v9 "next level") — one rAF scroll bus drives:
       · scroll progress bar
       · hero multi-layer depth parallax (scroll + mouse + gyroscope)
       · "A day at Maya" sky-scrub (time-of-day colour journey + travelling sun)
       · 3D card tilt with specular gloss (mouse) / press-tilt (touch)
     All composited (transform/opacity/clip-path only), capability-gated,
     and fully disabled under prefers-reduced-motion.
     ======================================================================= */
  (function motionSystem() {
    const coarse = window.matchMedia("(pointer: coarse)").matches;

    /* --- single rAF scroll bus (all scroll-linked effects share it) --- */
    const subs = [];
    let lastY = window.scrollY, queued = false;
    const pump = () => {
      const y = window.scrollY, v = y - lastY; lastY = y;
      for (let i = 0; i < subs.length; i++) subs[i](y, v);
      queued = false;
    };
    const kick = () => { if (!queued) { queued = true; requestAnimationFrame(pump); } };
    const sub = (fn) => { subs.push(fn); fn(window.scrollY, 0); };
    if (!reduceMotion) {
      window.addEventListener("scroll", kick, { passive: true });
      window.addEventListener("resize", kick, { passive: true });
    }

    /* ---- 1 · Scroll progress bar ---- */
    if (!reduceMotion) {
      const bar = document.createElement("div");
      bar.className = "scroll-progress"; bar.setAttribute("aria-hidden", "true");
      document.body.appendChild(bar);
      sub(() => {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.transform = "scaleX(" + (h > 0 ? clamp(window.scrollY / h, 0, 1) : 0).toFixed(4) + ")";
      });
    }

    /* ---- 2 · Hero depth parallax (scroll + pointer/gyro) + scroll hand-off ---- */
    const heroBg = document.querySelector(".hero-home .hero-bg");
    const heroContent = document.querySelector(".hero-home .hero-content");
    if (heroBg && !reduceMotion) {
      sub((y) => {
        if (y > window.innerHeight * 1.3) return;
        heroBg.style.setProperty("--py", (y * 0.18).toFixed(1) + "px");
        if (heroContent) {
          const p = clamp(y / (window.innerHeight * 0.85), 0, 1);
          heroContent.style.setProperty("--ho", (1 - p).toFixed(3));
          heroContent.style.setProperty("--hy", (y * 0.14).toFixed(1) + "px");
          heroContent.style.setProperty("--hb", (p * 6).toFixed(1) + "px");
        }
      });
      let mx = 0, my = 0, tmx = 0, tmy = 0;
      const apply = (sf) => {
        mx = lerp(mx, tmx, 0.06); my = lerp(my, tmy, 0.06);
        heroBg.style.setProperty("--mx", (mx * sf).toFixed(2) + "px");
        heroBg.style.setProperty("--my", (my * sf).toFixed(2) + "px");
        requestAnimationFrame(() => apply(sf));
      };
      if (finePointer) {
        window.addEventListener("mousemove", (e) => {
          tmx = (e.clientX / window.innerWidth - 0.5) * 2;
          tmy = (e.clientY / window.innerHeight - 0.5) * 2;
        }, { passive: true });
        apply(15);
      } else if (coarse && window.DeviceOrientationEvent) {
        const onOrient = (e) => {
          tmx = clamp((e.gamma || 0) / 28, -1, 1);
          tmy = clamp(((e.beta || 0) - 45) / 28, -1, 1);
        };
        const startGyro = () => { window.addEventListener("deviceorientation", onOrient); apply(11); };
        if (typeof DeviceOrientationEvent.requestPermission === "function") {
          const ask = () => {
            DeviceOrientationEvent.requestPermission()
              .then((s) => { if (s === "granted") startGyro(); }).catch(() => {});
          };
          window.addEventListener("touchend", ask, { once: true });
        } else startGyro();
      }
    }

    /* ---- 3 · "A day at Maya" sky-scrub (dawn → midday → golden → dusk → night) ---- */
    const day = document.querySelector(".hp-day");
    if (day) {
      const sky = document.createElement("div");
      sky.className = "day-sky"; sky.setAttribute("aria-hidden", "true");
      day.prepend(sky);
      // rgb keyframes: dawn, midday, golden, dusk, night
      const top = [[26,58,107],[61,127,196],[31,95,168],[58,42,94],[8,16,40]];
      const bot = [[243,182,90],[219,238,252],[247,210,122],[232,138,82],[36,58,84]];
      const mc = (a, b, t) => "rgb(" + Math.round(lerp(a[0],b[0],t)) + "," + Math.round(lerp(a[1],b[1],t)) + "," + Math.round(lerp(a[2],b[2],t)) + ")";
      const paint = (p) => {
        const seg = p * (top.length - 1);
        const i = Math.min(top.length - 2, Math.floor(seg));
        const f = seg - i;
        sky.style.background = "linear-gradient(165deg, " + mc(top[i], top[i+1], f) + " 0%, " + mc(bot[i], bot[i+1], f) + " 100%)";
        day.style.setProperty("--sun-x", (10 + 80 * p).toFixed(1) + "%");
        day.style.setProperty("--sun-y", (80 - Math.sin(Math.PI * p) * 62).toFixed(1) + "%");
        day.style.setProperty("--sun-op", (p > 0.86 ? lerp(0.85, 0.1, (p - 0.86) / 0.14) : 0.85).toFixed(2));
      };
      if (reduceMotion) paint(0.5);
      else sub(() => {
        const r = day.getBoundingClientRect(), vh = window.innerHeight;
        paint(clamp((vh - r.top) / (vh + r.height), 0, 1));
      });
    }

    /* ---- 4 · 3D card tilt + specular gloss (mouse) / press (touch) ---- */
    if (!reduceMotion) {
      document.querySelectorAll(".card, .amenity-card, .hp-pillar").forEach((el) => {
        el.classList.add("tilt3d");
        if (finePointer) {
          el.addEventListener("mousemove", (e) => {
            const r = el.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width - 0.5;
            const py = (e.clientY - r.top) / r.height - 0.5;
            el.style.setProperty("--rx", (py * -5).toFixed(2) + "deg");
            el.style.setProperty("--ry", (px * 7).toFixed(2) + "deg");
            el.style.setProperty("--gx", (px * 100 + 50).toFixed(1) + "%");
            el.style.setProperty("--gy", (py * 100 + 50).toFixed(1) + "%");
            el.classList.add("is-tilting");
          });
          el.addEventListener("mouseleave", () => {
            el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg");
            el.classList.remove("is-tilting");
          });
        } else if (coarse) {
          el.addEventListener("touchstart", () => el.classList.add("is-press"), { passive: true });
          const up = () => el.classList.remove("is-press");
          el.addEventListener("touchend", up); el.addEventListener("touchcancel", up);
        }
      });
    }
  })();

  /* ---------- Menu ordering cart ---------- */
  if (document.body.classList.contains("menu-page")) {
    const WA_NUMBER = "256773883760";
    const cart = []; // { name, price, qty }

    const parsePrice = (txt) => {
      const digits = (txt || "").replace(/[^0-9]/g, "");
      return digits ? parseInt(digits, 10) : 0;
    };
    const fmtPrice = (n) => n.toLocaleString("en-US") + "/=";

    // Inject an add button into every single-price menu row
    document.querySelectorAll(".menu-panel .m-row").forEach((row) => {
      const nameEl = row.querySelector(".m-name");
      const priceEl = row.querySelector(".m-price");
      if (!nameEl || !priceEl) return;                 // skip dual-price / headers
      if (priceEl.classList.contains("m-price-dual")) return;
      const price = parsePrice(priceEl.textContent);
      if (!price) return;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "menu-add";
      btn.setAttribute("aria-label", "Add " + nameEl.textContent.trim() + " to order");
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>';
      btn.addEventListener("click", () => {
        addItem(nameEl.textContent.trim(), price);
        btn.classList.remove("added"); void btn.offsetWidth; btn.classList.add("added");
      });
      row.appendChild(btn);
    });

    // Build cart UI
    const fab = document.createElement("button");
    fab.type = "button"; fab.className = "cart-fab";
    fab.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6h15l-1.5 9h-12zM6 6 5 3H2M9 20a1 1 0 1 0 0 .01M18 20a1 1 0 1 0 0 .01"/></svg> My Order <span class="cart-count">0</span>';

    const overlay = document.createElement("div"); overlay.className = "cart-overlay";
    const drawer = document.createElement("aside");
    drawer.className = "cart-drawer"; drawer.setAttribute("aria-label", "Your order");
    drawer.innerHTML =
      '<div class="cart-head"><h3>Your Order</h3><button class="cart-close" aria-label="Close order">&times;</button></div>' +
      '<div class="cart-body"></div>' +
      '<div class="cart-foot"></div>';
    document.body.append(fab, overlay, drawer);

    const countEl = fab.querySelector(".cart-count");
    const bodyEl = drawer.querySelector(".cart-body");
    const footEl = drawer.querySelector(".cart-foot");
    let checkout = false;

    const total = () => cart.reduce((s, i) => s + i.price * i.qty, 0);
    const count = () => cart.reduce((s, i) => s + i.qty, 0);

    function addItem(name, price) {
      const ex = cart.find((i) => i.name === name);
      if (ex) ex.qty++; else cart.push({ name, price, qty: 1 });
      sync();
      fab.classList.add("show");
    }
    function setQty(name, d) {
      const it = cart.find((i) => i.name === name); if (!it) return;
      it.qty += d;
      if (it.qty <= 0) cart.splice(cart.indexOf(it), 1);
      if (!cart.length) { checkout = false; closeDrawer(); fab.classList.remove("show"); }
      sync();
    }
    function sync() {
      countEl.textContent = count();
      checkout ? renderCheckout() : renderCart();
    }
    function renderCart() {
      if (!cart.length) { bodyEl.innerHTML = '<p class="cart-empty">Your order is empty. Tap + on any dish to add it.</p>'; footEl.innerHTML = ""; return; }
      bodyEl.innerHTML = cart.map((i) =>
        '<div class="cart-line"><div class="cart-line-info"><div class="cart-line-name">' + i.name + '</div>' +
        '<div class="cart-line-price">' + fmtPrice(i.price) + ' each</div></div>' +
        '<div class="cart-qty"><button data-dec="' + esc(i.name) + '" aria-label="Reduce">&minus;</button>' +
        '<span>' + i.qty + '</span>' +
        '<button data-inc="' + esc(i.name) + '" aria-label="Add">+</button></div></div>'
      ).join("");
      footEl.innerHTML =
        '<div class="cart-total"><span>Total</span><b>' + fmtPrice(total()) + '</b></div>' +
        '<button class="cart-send" data-checkout><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>Continue to Details</button>';
    }
    function renderCheckout() {
      bodyEl.innerHTML =
        '<button class="cart-back" data-back>&larr; Back to items</button>' +
        '<form class="order-form" id="orderForm">' +
        '<div><label>Your name</label><input type="text" name="name" required placeholder="e.g. Sarah M." /></div>' +
        '<div><label>Order type</label><div class="order-type">' +
        '<input type="radio" id="ot-dine" name="otype" value="Dine-in" checked><label for="ot-dine">Dine-in</label>' +
        '<input type="radio" id="ot-take" name="otype" value="Takeaway"><label for="ot-take">Takeaway</label></div></div>' +
        '<div><label id="timeLabel">Expected arrival time</label><input type="time" name="time" /></div>' +
        '<div><label>Special requests (optional)</label><textarea name="notes" placeholder="Allergies, no onions, table preference…"></textarea></div>' +
        '</form>';
      footEl.innerHTML =
        '<div class="cart-total"><span>' + count() + ' item' + (count() > 1 ? 's' : '') + '</span><b>' + fmtPrice(total()) + '</b></div>' +
        '<button class="cart-send" data-send><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm5.3 14c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.6-.6-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8s.7-2 .9-2.2c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .5l-.4.6c-.1.2-.3.3-.1.6.1.3.6 1 1.3 1.7.9.8 1.6 1 1.9 1.2.2.1.4.1.5-.1l.7-.8c.2-.2.3-.2.6-.1l1.8.9c.3.1.5.2.5.3.1.2.1.6 0 .9Z"/></svg>Send Order on WhatsApp</button>';
      const take = bodyEl.querySelector("#ot-take"), dine = bodyEl.querySelector("#ot-dine");
      const tl = bodyEl.querySelector("#timeLabel");
      const updLabel = () => { tl.textContent = take.checked ? "Preferred pickup time" : "Expected arrival time"; };
      take.addEventListener("change", updLabel); dine.addEventListener("change", updLabel);
    }
    function esc(s) { return s.replace(/"/g, "&quot;"); }

    function sendOrder() {
      const form = document.getElementById("orderForm"); if (!form) return;
      const name = form.name.value.trim();
      if (!name) { form.name.focus(); form.name.style.borderColor = "#c0392b"; return; }
      const otype = form.otype.value;
      const time = form.time.value;
      const notes = form.notes.value.trim();
      let msg = "Hi Maya Nature Resort! 🍽️ I'd like to place an order:\n\n";
      cart.forEach((i) => { msg += "• " + i.name + " × " + i.qty + " — " + fmtPrice(i.price * i.qty) + "\n"; });
      msg += "\nTotal: " + fmtPrice(total());
      msg += "\nType: " + otype;
      if (time) msg += "\n" + (otype === "Takeaway" ? "Pickup" : "Arrival") + ": " + time;
      msg += "\nName: " + name;
      if (notes) msg += "\nSpecial: " + notes;
      msg += "\n\nThank you!";
      window.open("https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(msg), "_blank", "noopener");
    }

    function openDrawer() { overlay.classList.add("open"); drawer.classList.add("open"); document.body.style.overflow = "hidden"; }
    function closeDrawer() { overlay.classList.remove("open"); drawer.classList.remove("open"); document.body.style.overflow = ""; }

    fab.addEventListener("click", () => { checkout = false; sync(); openDrawer(); });
    overlay.addEventListener("click", closeDrawer);
    drawer.querySelector(".cart-close").addEventListener("click", closeDrawer);
    drawer.addEventListener("click", (e) => {
      const t = e.target.closest("button"); if (!t) return;
      if (t.dataset.inc !== undefined) setQty(t.dataset.inc, 1);
      else if (t.dataset.dec !== undefined) setQty(t.dataset.dec, -1);
      else if (t.hasAttribute("data-checkout")) { checkout = true; sync(); }
      else if (t.hasAttribute("data-back")) { checkout = false; sync(); }
      else if (t.hasAttribute("data-send")) sendOrder();
    });
    sync();
  }
})();
