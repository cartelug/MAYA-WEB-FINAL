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
    const minShow = reduceMotion ? 400 : 1400; // snappier open; logo reveal still completes
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
    let status = form.querySelector(".form-status");
    if (!status) {
      status = document.createElement("p");
      status.className = "form-status";
      status.setAttribute("role", "status");
      status.setAttribute("aria-live", "polite");
      form.appendChild(status);
    }
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = form.querySelector("[name='name']")?.value.trim() || "";
      const interest = form.querySelector("[name='interest']")?.value.trim() || "reservation";
      const date = form.querySelector("[name='date']")?.value.trim() || "";
      const message = `Hello Maya Nature Resort, my name is ${name}. I would like to inquire about ${interest}${date ? " for " + date : ""}.`;
      status.textContent = "Opening WhatsApp with your message…";
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

      /* Safety net — if the main thread is busy the observer can miss an
         element (it left it clipped/hidden). Backstop: reveal anything that
         is actually within the viewport. Runs on load + as a debounced
         scroll fallback, never undoing the normal staggered reveals. */
      const revealInView = () => {
        for (let i = 0; i < revealEls.length; i++) {
          const el = revealEls[i];
          if (el.classList.contains("is-visible")) continue;
          const r = el.getBoundingClientRect();
          if (r.top < window.innerHeight * 0.94 && r.bottom > 0) {
            el.classList.add("is-visible");
            if (io) io.unobserve(el);
          }
        }
      };
      window.addEventListener("load", () => setTimeout(revealInView, 200));
      let revealTick;
      window.addEventListener("scroll", () => {
        clearTimeout(revealTick); revealTick = setTimeout(revealInView, 120);
      }, { passive: true });
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

  /* ---------- Gallery lightbox (v11) ----------
     Filter-aware: the navigable list is rebuilt from currently-VISIBLE
     [data-lightbox] items at open() time, so prev/next never step through
     hidden plates and the NN/total counter is correct after filtering.
     Caption + counter are non-focusable text, so the focus trap below is
     unchanged. Neighbour images preload; touch swipe navigates. */
  const galleryItems = Array.from(document.querySelectorAll("[data-lightbox]"));
  if (galleryItems.length) {
    let list = [];   // [{src, title}] rebuilt on open from visible items
    let idx = 0;
    const box = document.createElement("div");
    box.className = "lightbox"; box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true"); box.setAttribute("aria-label", "Photo viewer");
    box.innerHTML =
      '<button class="lightbox-close" aria-label="Close gallery"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button>' +
      '<button class="lightbox-nav lightbox-prev" aria-label="Previous"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg></button>' +
      '<img alt="" />' +
      '<button class="lightbox-nav lightbox-next" aria-label="Next"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></button>' +
      '<div class="lightbox-figcap" aria-hidden="true"><span class="lightbox-count"></span><span class="lightbox-title"></span></div>';
    document.body.appendChild(box);
    const imgEl = box.querySelector("img");
    const capCount = box.querySelector(".lightbox-count");
    const capTitle = box.querySelector(".lightbox-title");
    const pad2 = (n) => (n < 10 ? "0" + n : "" + n);
    const preload = (i) => { const it = list[i]; if (it) { const im = new Image(); im.src = it.src; } };
    const show = (i) => {
      const n = list.length; if (!n) return;
      idx = (i + n) % n;
      const it = list[idx];
      imgEl.classList.add("is-loading");
      imgEl.onload = () => imgEl.classList.remove("is-loading");
      imgEl.src = it.src; imgEl.alt = it.title;
      capCount.textContent = pad2(idx + 1) + " / " + pad2(n);
      capTitle.textContent = it.title;
      preload(idx + 1); preload((idx - 1 + n) % n);
    };
    const visible = () => galleryItems.filter((el) => !el.hasAttribute("data-hidden") && el.offsetParent !== null);
    let lastFocused = null;
    const open = (el) => {
      const vis = visible();
      list = vis.map((v) => ({ src: v.getAttribute("data-lightbox"), title: v.getAttribute("data-caption") || "" }));
      let start = vis.indexOf(el); if (start < 0) start = 0;
      lastFocused = document.activeElement;
      show(start);
      box.classList.add("is-open"); document.body.style.overflow = "hidden";
      requestAnimationFrame(() => box.querySelector(".lightbox-close").focus());
    };
    const close = () => { box.classList.remove("is-open"); document.body.style.overflow = ""; if (lastFocused && lastFocused.focus) lastFocused.focus(); };
    galleryItems.forEach((el) => {
      el.setAttribute("tabindex", "0"); el.setAttribute("role", "button");
      el.addEventListener("click", () => open(el));
      el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(el); } });
    });
    box.querySelector(".lightbox-close").addEventListener("click", close);
    box.querySelector(".lightbox-prev").addEventListener("click", () => show(idx - 1));
    box.querySelector(".lightbox-next").addEventListener("click", () => show(idx + 1));
    box.addEventListener("click", (e) => { if (e.target === box) close(); });
    // touch swipe (horizontal)
    let sx = 0, sy = 0;
    box.addEventListener("touchstart", (e) => { const t = e.changedTouches[0]; sx = t.clientX; sy = t.clientY; }, { passive: true });
    box.addEventListener("touchend", (e) => {
      const t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) show(idx + (dx < 0 ? 1 : -1));
    }, { passive: true });
    document.addEventListener("keydown", (e) => {
      if (!box.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(idx - 1);
      if (e.key === "ArrowRight") show(idx + 1);
      if (e.key === "Tab") {
        const f = [".lightbox-close", ".lightbox-prev", ".lightbox-next"].map((s) => box.querySelector(s));
        const i = f.indexOf(document.activeElement);
        e.preventDefault();
        f[e.shiftKey ? (i <= 0 ? f.length - 1 : i - 1) : (i >= f.length - 1 ? 0 : i + 1)].focus();
      }
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
          const vh = window.innerHeight;
          const p = clamp(y / (vh * 0.85), 0, 1);
          // blur is delayed: holds at 0 until ~40% of the hero is scrolled,
          // then eases in (smoothstep) so focus only drops as Section 2 nears.
          const pb = clamp((y - vh * 0.40) / (vh * 0.50), 0, 1);
          const pbEased = pb * pb * (3 - 2 * pb);
          heroContent.style.setProperty("--ho", (1 - p).toFixed(3));
          heroContent.style.setProperty("--hy", (y * 0.14).toFixed(1) + "px");
          heroContent.style.setProperty("--hb", (pbEased * 7).toFixed(1) + "px");
        }
      });
      let mx = 0, my = 0, tmx = 0, tmy = 0, heroRaf = null, heroSf = 15;
      const apply = () => {
        mx = lerp(mx, tmx, 0.08); my = lerp(my, tmy, 0.08);
        heroBg.style.setProperty("--mx", (mx * heroSf).toFixed(2) + "px");
        heroBg.style.setProperty("--my", (my * heroSf).toFixed(2) + "px");
        // idle the loop once movement has settled — no per-frame work at rest
        if (Math.abs(mx - tmx) > 0.04 || Math.abs(my - tmy) > 0.04) {
          heroRaf = requestAnimationFrame(apply);
        } else {
          heroRaf = null;
        }
      };
      const kickHero = () => { if (heroRaf == null) heroRaf = requestAnimationFrame(apply); };
      if (finePointer) {
        window.addEventListener("mousemove", (e) => {
          tmx = (e.clientX / window.innerWidth - 0.5) * 2;
          tmy = (e.clientY / window.innerHeight - 0.5) * 2;
          kickHero();
        }, { passive: true });
      } else if (coarse && window.DeviceOrientationEvent) {
        heroSf = 11;
        const onOrient = (e) => {
          tmx = clamp((e.gamma || 0) / 28, -1, 1);
          tmy = clamp(((e.beta || 0) - 45) / 28, -1, 1);
          kickHero();
        };
        const startGyro = () => { window.addEventListener("deviceorientation", onOrient); };
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
      let err = document.getElementById("cartErr");
      if (!err) {
        err = document.createElement("p"); err.id = "cartErr"; err.className = "cart-error";
        err.setAttribute("role", "alert"); err.setAttribute("aria-live", "assertive");
        form.appendChild(err);
      }
      if (!name) {
        form.name.setAttribute("aria-invalid", "true"); form.name.style.borderColor = "#c0392b";
        err.textContent = "Please enter your name to send your order."; form.name.focus(); return;
      }
      form.name.removeAttribute("aria-invalid"); form.name.style.borderColor = ""; err.textContent = "";
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

/* =========================================================================
   v10 "Artistic Identity" — JS enhancements
   A: Preloader uses the real logo (animated in CSS) — no swap here
   B: Nav micro-icons removed  ★: Star→leaf sitewide
   ========================================================================= */
(function () {
  "use strict";

  /* ── A · Preloader keeps the EXACT logo image; the premium reveal
     (sunrise glow bloom, rise-into-focus, masked gold sheen sweep) is
     done entirely in CSS so it stays crisp and works on every page. ── */

  /* ── B · (removed) Per-word nav micro-icons — nav is now clean
     editorial Marcellus type, no stacked glyphs. Clear any that a
     cached build may have injected. ── */
  document.querySelectorAll(".nav-menu .nav-ic").forEach(function (el) { el.remove(); });

  /* ── ★ Sitewide: replace ★★★★★ text with brand-leaf SVG marks ── */
  const LEAF_SVG = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C7 7 3 11 3 15a9 9 0 0 0 18 0C21 11 17 7 12 2Z"/></svg>';
  const FIVE_LEAVES = '<span class="leaf-stars">' + Array(5).fill(LEAF_SVG).join("") + '</span>';

  document.querySelectorAll(".stars").forEach(function (el) {
    if (el.textContent.trim().match(/^★+$/)) {
      el.innerHTML = FIVE_LEAVES;
    }
  });

})();

/* perf: pause room-card animations (Ken-Burns, frame, shimmers) while off-screen */
(function () {
  "use strict";
  const cards = document.querySelectorAll(".rcard");
  if (!cards.length || !("IntersectionObserver" in window)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { e.target.classList.toggle("is-paused", !e.isIntersecting); });
  }, { rootMargin: "160px 0px", threshold: 0.02 });
  cards.forEach(function (c) { c.classList.add("is-paused"); io.observe(c); });
})();

/* =========================================================================
   v9 — Reservation step: "confirm details -> WhatsApp" modal
   Intercepts primary Reserve/Book CTAs so guests confirm dates / guests /
   intent before WhatsApp opens with a composed message. Progressive
   enhancement: the CTA keeps its wa.me href, so it still works with JS off.
   ========================================================================= */
(function () {
  "use strict";
  var WA = "256773883760";
  var triggers = document.querySelectorAll(
    'a.btn-primary[href*="wa.me"], a.nav-cta[href*="wa.me"], a.mm-cta[href*="wa.me"], .footer-bottom a[href*="wa.me"], a.rc-reserve[href*="wa.me"]'
  );
  if (!triggers.length) return;
  var activeRoom = null;

  var lastFocused = null;
  var overlay = document.createElement("div");
  overlay.className = "reserve-modal";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-labelledby", "rm-title");
  overlay.hidden = true;

  var options = ["Room", "Wedding", "Event", "Day visit"];
  var chipsHTML = options.map(function (o, i) {
    return '<button type="button" class="rm-chip' + (i === 0 ? " is-on" : "") +
      '" role="radio" aria-checked="' + (i === 0 ? "true" : "false") +
      '" data-val="' + o + '">' + o + "</button>";
  }).join("");

  overlay.innerHTML =
    '<div class="rm-panel">' +
      '<button type="button" class="rm-close" aria-label="Close">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>' +
      "</button>" +
      '<p class="rm-eyebrow">Reservation</p>' +
      '<h2 id="rm-title">Tell us a little more</h2>' +
      '<p class="rm-sub">We\'ll open WhatsApp with your details ready to send.</p>' +
      '<p class="rm-room" id="rm-room" hidden></p>' +
      '<form class="rm-form" novalidate>' +
        '<div class="rm-field"><label for="rm-dates">Dates / nights</label>' +
          '<input id="rm-dates" name="dates" type="text" autocomplete="off" placeholder="e.g. 12-14 Aug, or this weekend"></div>' +
        '<div class="rm-field"><label for="rm-guests">Guests</label>' +
          '<input id="rm-guests" name="guests" type="number" min="1" inputmode="numeric" placeholder="2"></div>' +
        '<div class="rm-field"><span class="rm-legend" id="rm-forlabel">What for?</span>' +
          '<div class="rm-chips" role="radiogroup" aria-labelledby="rm-forlabel">' + chipsHTML + "</div></div>" +
        '<div class="rm-field"><label for="rm-note">Anything else <span class="rm-opt">(optional)</span></label>' +
          '<textarea id="rm-note" name="note" rows="2" placeholder="Special requests, questions..."></textarea></div>' +
        '<button type="submit" class="btn btn-primary rm-go">Continue on WhatsApp' +
          '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm5.3 14c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.6-.6-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8s.7-2 .9-2.2c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .5l-.4.6c-.1.2-.3.3-.1.6.1.3.6 1 1.3 1.7.9.8 1.6 1 1.9 1.2.2.1.4.1.5-.1l.7-.8c.2-.2.3-.2.6-.1l1.8.9c.3.1.5.2.5.3.1.2.1.6 0 .9Z"/></svg>' +
        "</button>" +
        '<p class="rm-fallback">or <a href="https://wa.me/' + WA + '" target="_blank" rel="noopener">just message us</a></p>' +
      "</form>" +
    "</div>";
  document.body.appendChild(overlay);

  var form = overlay.querySelector(".rm-form");
  var chips = Array.prototype.slice.call(overlay.querySelectorAll(".rm-chip"));

  function focusables() {
    return Array.prototype.slice.call(
      overlay.querySelectorAll('button, [href], input, textarea, [tabindex]:not([tabindex="-1"])')
    ).filter(function (el) { return !el.disabled && el.offsetParent !== null; });
  }
  var roomEl = overlay.querySelector("#rm-room");
  function open(e) {
    if (e && e.preventDefault) e.preventDefault();
    lastFocused = document.activeElement;
    var trigger = e && e.currentTarget;
    activeRoom = (trigger && trigger.getAttribute && trigger.getAttribute("data-room")) || null;
    if (activeRoom && roomEl) {
      roomEl.textContent = "For the " + activeRoom + ".";
      roomEl.hidden = false;
      var roomChip = overlay.querySelector('.rm-chip[data-val="Room"]');
      if (roomChip) {
        chips.forEach(function (c) { c.classList.remove("is-on"); c.setAttribute("aria-checked", "false"); });
        roomChip.classList.add("is-on"); roomChip.setAttribute("aria-checked", "true");
      }
    } else if (roomEl) {
      roomEl.hidden = true; roomEl.textContent = "";
    }
    overlay.hidden = false;
    overlay.offsetWidth; // reflow so the transition runs
    overlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
    var first = overlay.querySelector("#rm-dates");
    setTimeout(function () { if (first) first.focus(); }, 60);
  }
  function close() {
    overlay.classList.remove("is-open");
    document.body.style.overflow = "";
    setTimeout(function () { overlay.hidden = true; activeRoom = null; }, 280);
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) { c.classList.remove("is-on"); c.setAttribute("aria-checked", "false"); });
      chip.classList.add("is-on"); chip.setAttribute("aria-checked", "true");
    });
  });
  overlay.querySelector(".rm-close").addEventListener("click", close);
  overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });
  document.addEventListener("keydown", function (e) {
    if (overlay.hidden) return;
    if (e.key === "Escape") { close(); return; }
    if (e.key === "Tab") {
      var f = focusables(); if (!f.length) return;
      var i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    }
  });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var dates = (form.dates.value || "").trim();
    var guests = (form.guests.value || "").trim();
    var on = overlay.querySelector(".rm-chip.is-on");
    var forWhat = on ? on.getAttribute("data-val") : "Room";
    var note = (form.note.value || "").trim();
    var msg = "Hello Maya Nature Resort, I'd like to reserve.";
    msg += "\n- For: " + forWhat;
    if (activeRoom) msg += "\n- Room: " + activeRoom;
    if (guests) msg += "\n- Guests: " + guests;
    if (dates) msg += "\n- Dates: " + dates;
    if (note) msg += "\n- Note: " + note;
    window.open("https://wa.me/" + WA + "?text=" + encodeURIComponent(msg), "_blank", "noopener");
    close();
  });
  Array.prototype.forEach.call(triggers, function (t) { t.addEventListener("click", open); });
})();

/* =========================================================================
   v11 — Directions "The Approach"
   Hydrates every geo-dependent element from window.MAYA_PLACE, wires the
   transport tabs (roving tabindex), copy-to-clipboard (with fallbacks that
   never fake success), and injects LodgingBusiness JSON-LD (geo OMITTED until
   coordinates are confirmed). Fully usable with JS off: static strings + real
   tel/mailto/wa.me links + a text-query map remain.
   ========================================================================= */
(function () {
  "use strict";
  var P = window.MAYA_PLACE;
  if (!P) return;
  var $ = function (s) { return document.querySelector(s); };
  var enc = encodeURIComponent;
  var hasGeo = !!(P.confirmed && P.lat != null && P.lng != null);
  var ll = hasGeo ? P.lat + "," + P.lng : null;
  var q = P.mapQuery || P.name;

  /* --- deep links (precise when confirmed, else text-query fallback) --- */
  var links = hasGeo ? {
    navigate: "https://www.google.com/maps/dir/?api=1&destination=" + enc(ll),
    google:   "https://www.google.com/maps/dir/?api=1&destination=" + enc(ll),
    apple:    "https://maps.apple.com/?ll=" + enc(ll) + "&q=" + enc(P.name),
    waze:     "https://waze.com/ul?ll=" + enc(ll) + "&navigate=yes",
    geo:      "geo:" + ll + "?q=" + enc(ll + "(" + P.name + ")"),
    embed:    "https://www.google.com/maps?q=" + enc(ll) + "&z=16&output=embed"
  } : {
    navigate: "https://www.google.com/maps/dir/?api=1&destination=" + enc(q),
    google:   "https://www.google.com/maps/dir/?api=1&destination=" + enc(q),
    apple:    "https://maps.apple.com/?q=" + enc(q),
    waze:     "https://waze.com/ul?q=" + enc(q) + "&navigate=yes",
    geo:      "https://www.google.com/maps/search/?api=1&query=" + enc(q),
    embed:    null
  };
  var setHref = function (sel, url) { var el = $(sel); if (el && url) el.setAttribute("href", url); };
  setHref("[data-place-navigate]", links.navigate);
  setHref("[data-place-google]", links.google);
  setHref("[data-place-apple]", links.apple);
  setHref("[data-place-waze]", links.waze);
  setHref("[data-place-geo]", links.geo);

  /* --- text strings --- */
  var tellEl = $("[data-place-tell]"); if (tellEl && P.tellDriver) tellEl.textContent = P.tellDriver;
  var addrEl = $("[data-place-address]"); if (addrEl && P.address) addrEl.textContent = P.address;

  /* --- confirmed vs provisional map state --- */
  if (hasGeo) {
    var frame = $("[data-place-mapframe]"); if (frame) frame.classList.add("is-confirmed");
    var ribbon = $("[data-place-ribbon]"); if (ribbon) ribbon.hidden = true;
    var map = $("[data-place-map]"); if (map && links.embed) map.setAttribute("src", links.embed);
    var gps = $("[data-place-gps]"); if (gps) { gps.textContent = ll; gps.classList.remove("is-pending"); }
    document.querySelectorAll('.dir-copy[data-copy="gps"]').forEach(function (b) { b.hidden = false; });
    if (P.plusCode) {
      var plus = $("[data-place-plus]"); if (plus) { plus.textContent = P.plusCode; plus.classList.remove("is-pending"); }
      document.querySelectorAll('.dir-copy[data-copy="plus"]').forEach(function (b) { b.hidden = false; });
    }
  }

  /* --- copy to clipboard: clipboard API → execCommand → select-text.
         Never flips the check or announces "Copied" on failure. --- */
  var liveRegion = document.createElement("p");
  liveRegion.className = "sr-only"; liveRegion.setAttribute("role", "status"); liveRegion.setAttribute("aria-live", "polite");
  document.body.appendChild(liveRegion);
  var valueFor = function (key) {
    if (key === "tell") return P.tellDriver || "";
    if (key === "address") return P.address || "";
    if (key === "gps") return hasGeo ? ll : "";
    if (key === "plus") return P.plusCode || "";
    return "";
  };
  var displaySel = { tell: "[data-place-tell]", address: "[data-place-address]", gps: "[data-place-gps]", plus: "[data-place-plus]" };
  var flash = function (btn) {
    btn.classList.add("is-copied");
    var t = btn.querySelector(".dir-copy-txt"); var prev = t ? t.textContent : "";
    if (t) t.textContent = "Copied";
    liveRegion.textContent = "Copied to clipboard";
    setTimeout(function () { btn.classList.remove("is-copied"); if (t) t.textContent = prev; }, 2000);
  };
  var legacyCopy = function (text) {
    try {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", "");
      ta.style.position = "absolute"; ta.style.left = "-9999px";
      document.body.appendChild(ta); ta.select();
      var ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch (e) { return false; }
  };
  var fallbackSelect = function (key) {
    var el = document.querySelector(displaySel[key]); if (!el) return;
    try {
      var r = document.createRange(); r.selectNodeContents(el);
      var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
      liveRegion.textContent = "Highlighted — press Ctrl or Cmd + C to copy";
    } catch (e) {}
  };
  document.querySelectorAll(".dir-copy").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var key = btn.getAttribute("data-copy");
      var text = valueFor(key);
      if (!text) return;
      var succeed = function () { flash(btn); };
      var fail = function () { if (legacyCopy(text)) succeed(); else fallbackSelect(key); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(succeed).catch(fail);
      } else { fail(); }
    });
  });

  /* --- transport tabs --- */
  var tablist = document.querySelector('.dir-modetabs[role="tablist"]');
  if (tablist) {
    var tabs = Array.prototype.slice.call(tablist.querySelectorAll('[role="tab"]'));
    var select = function (tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute("aria-controls"));
        if (panel) panel.hidden = !on;
      });
      if (focus) tab.focus();
    };
    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { select(tab, false); });
      tab.addEventListener("keydown", function (e) {
        var j = -1;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") j = (i + 1) % tabs.length;
        else if (e.key === "ArrowLeft" || e.key === "ArrowUp") j = (i - 1 + tabs.length) % tabs.length;
        else if (e.key === "Home") j = 0;
        else if (e.key === "End") j = tabs.length - 1;
        if (j >= 0) { e.preventDefault(); select(tabs[j], true); }
      });
    });
  }

  /* --- JSON-LD (geo omitted until confirmed; never emit placeholder coords) --- */
  try {
    var data = {
      "@context": "https://schema.org",
      "@type": "LodgingBusiness",
      "name": P.name,
      "description": "A peaceful nature resort atop Sun Hill, off the Kampala–Masaka Road in Maya, Uganda — stays, weddings, events, dining and garden experiences.",
      "url": "https://mayanatureresort.com/",
      "telephone": P.phone || "+256773883760",
      "image": "https://mayanatureresort.com/assets/images/resort/wedding-rose-arch.jpg",
      "address": { "@type": "PostalAddress", "addressLocality": "Maya, Kyengera", "addressRegion": "Wakiso District", "addressCountry": "UG" }
    };
    if (hasGeo) {
      data.geo = { "@type": "GeoCoordinates", "latitude": P.lat, "longitude": P.lng };
      data.hasMap = "https://www.google.com/maps/search/?api=1&query=" + enc(ll);
    }
    var s = document.createElement("script");
    s.type = "application/ld+json";
    s.textContent = JSON.stringify(data);
    document.head.appendChild(s);
  } catch (e) {}
})();

/* =========================================================================
   v11 — Gallery "The Maya Folio"
   Progressive enhancement over static <figure> plates: derives the Contents
   counts, filters by category (deep-linkable via #category), re-numbers the
   visible plates live, and blurs images up from their token LQIP. Works fully
   with JS off (plates + chapters are real, crawlable markup).
   ========================================================================= */
(function () {
  "use strict";
  var folio = document.querySelector("[data-folio]");
  var contents = document.querySelector("[data-folio-contents]");
  if (!folio || !contents) return;
  var rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var plates = Array.prototype.slice.call(folio.querySelectorAll(".plate"));
  var photoPlates = plates.filter(function (p) { return p.hasAttribute("data-lightbox"); });
  var interleaf = folio.querySelector("[data-folio-interleaf]");
  var chips = Array.prototype.slice.call(contents.querySelectorAll(".fc-item"));
  var live = document.querySelector("[data-folio-live]");

  /* blur-up (JS-only, so images stay visible with JS off) */
  if (!rm) {
    folio.querySelectorAll(".plate-media img").forEach(function (img) {
      if (img.complete && img.naturalWidth) return;
      img.classList.add("pre");
      var done = function () { img.classList.remove("pre"); img.classList.add("is-loaded"); };
      img.addEventListener("load", done);
      img.addEventListener("error", done);
    });
  }

  /* Contents counts from the DOM */
  var counts = {};
  plates.forEach(function (p) { var c = p.getAttribute("data-category"); counts[c] = (counts[c] || 0) + 1; });
  chips.forEach(function (chip) {
    var f = chip.getAttribute("data-filter");
    var el = chip.querySelector(".fc-count");
    if (!el) return;
    var n = f === "all" ? photoPlates.length : (counts[f] || 0);
    if (n > 0) { el.textContent = n; el.classList.remove("is-soon"); }
    else { el.textContent = "Soon"; el.classList.add("is-soon"); }
  });

  var pad2 = function (n) { return n < 10 ? "0" + n : "" + n; };
  var renumber = function () {
    var n = 0;
    photoPlates.forEach(function (p) {
      if (p.hasAttribute("data-hidden")) return;
      n++;
      var num = p.querySelector(".plate-num");
      if (num) num.textContent = pad2(n);
    });
  };

  var apply = function (filter, announce) {
    plates.forEach(function (p) {
      var show = filter === "all" || p.getAttribute("data-category") === filter;
      if (show) p.removeAttribute("data-hidden"); else p.setAttribute("data-hidden", "");
    });
    if (interleaf) { if (filter === "all") interleaf.removeAttribute("data-hidden"); else interleaf.setAttribute("data-hidden", ""); }
    chips.forEach(function (chip) {
      chip.setAttribute("aria-pressed", chip.getAttribute("data-filter") === filter ? "true" : "false");
    });
    renumber();
    if (announce && live) {
      var shown = photoPlates.filter(function (p) { return !p.hasAttribute("data-hidden"); }).length;
      live.textContent = filter === "all" ? "Showing all photos"
        : (filter === "rooms" ? "Rooms photography coming soon"
        : "Showing " + shown + " photo" + (shown === 1 ? "" : "s"));
    }
    try {
      if (filter === "all") history.replaceState(null, "", location.pathname + location.search);
      else history.replaceState(null, "", "#" + filter);
    } catch (e) {}
  };

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () { apply(chip.getAttribute("data-filter"), true); });
  });

  var initial = (location.hash || "").replace("#", "");
  var known = chips.some(function (c) { return c.getAttribute("data-filter") === initial; });
  apply(known ? initial : "all", false);
})();

/* =========================================================================
   v12 — Wordmark nav hydration
   The overlay's wordmark images ship with data-src/data-srcset so their
   ~620KB never loads on first paint. They hydrate the first time the user
   reaches for the menu (hover, focus, or tap on the toggle).
   ========================================================================= */
(function () {
  "use strict";
  var toggle = document.getElementById("menuToggle");
  var menu = document.getElementById("mobileMenu");
  if (!toggle || !menu) return;
  if (!menu.querySelector("img[data-src], source[data-srcset]")) return;
  var done = false;
  var hydrate = function () {
    if (done) return; done = true;
    menu.querySelectorAll("source[data-srcset]").forEach(function (s) {
      s.setAttribute("srcset", s.getAttribute("data-srcset"));
      s.removeAttribute("data-srcset");
    });
    menu.querySelectorAll("img[data-src]").forEach(function (img) {
      img.setAttribute("src", img.getAttribute("data-src"));
      img.removeAttribute("data-src");
    });
  };
  ["pointerenter", "focus", "touchstart", "click"].forEach(function (ev) {
    toggle.addEventListener(ev, hydrate, { once: false, passive: true });
  });
})();
/* =========================================================================
   BOOKING SHEET (v18) — "fill in details" prompt before the WhatsApp handoff.
   Progressive enhancement over every [data-book] CTA: the original wa.me href
   is kept as a no-JS fallback; with JS we intercept the click, collect stay /
   activity / event / table details, and open WhatsApp with a structured
   message. Vanilla JS; focus-trapped dialog; respects reduced motion.
   ========================================================================= */
(function () {
  "use strict";
  var triggers = document.querySelectorAll("[data-book]");
  if (!triggers.length) return;

  var WA = "https://wa.me/256773883760?text=";
  var ROOMS = ["Executive Cottage", "Deluxe Room", "Twin Room", "Family Room",
               "Standard Room", "Garden Cottage", "Group / Long Stay", "Not sure yet"];
  var TIMES = ["Morning (8–11am)", "Midday (11am–2pm)", "Afternoon (2–5pm)", "Evening (5–8pm)"];
  var TABLE_TIMES = ["Lunch (12–2pm)", "Afternoon (2–5pm)", "Dinner (5–9pm)"];
  var OCCASIONS = ["Wedding", "Introduction Ceremony", "Graduation Party", "Conference",
                   "Party", "Corporate Retreat", "Other celebration"];
  var VENUES = ["Bulangiti Hall", "Oasis Gardens", "Not sure yet"];

  var sheet = document.createElement("div");
  sheet.className = "booksheet";
  sheet.setAttribute("role", "dialog");
  sheet.setAttribute("aria-modal", "true");
  sheet.setAttribute("aria-labelledby", "bsTitle");
  sheet.innerHTML =
    '<div class="bs-backdrop" data-bs-close></div>' +
    '<div class="bs-panel">' +
    '  <button class="bs-close" type="button" aria-label="Close booking form" data-bs-close>' +
    '    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
    '  </button>' +
    '  <p class="bs-eyebrow">Maya Nature Resort</p>' +
    '  <h3 class="bs-title" id="bsTitle"></h3>' +
    '  <p class="bs-sub"></p>' +
    '  <form class="bs-form" novalidate>' +
    '    <div class="bs-fields"></div>' +
    '    <p class="form-status" role="status" aria-live="polite"></p>' +
    '    <button class="btn btn-primary bs-submit" type="submit">Continue on WhatsApp' +
    '      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style="width:18px;height:18px"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Z"/></svg>' +
    '    </button>' +
    '    <p class="bs-note">No payment now — availability is confirmed in the chat.</p>' +
    '  </form>' +
    '</div>';
  document.body.appendChild(sheet);

  var panel = sheet.querySelector(".bs-panel");
  var titleEl = sheet.querySelector(".bs-title");
  var subEl = sheet.querySelector(".bs-sub");
  var fieldsEl = sheet.querySelector(".bs-fields");
  var form = sheet.querySelector(".bs-form");
  var statusEl = sheet.querySelector(".form-status");

  var fid = 0;
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function field(label, inner, optional) {
    return '<div class="bs-field"><label for="bsf' + fid + '">' + label +
      (optional ? ' <span>(optional)</span>' : '') + '</label>' +
      inner.replace("%ID%", "bsf" + (fid++)) + '</div>';
  }
  function dateInput(name, required) {
    return '<input class="input" id="%ID%" type="date" name="' + name + '"' + (required ? " required" : "") + ' />';
  }
  function numInput(name, val, min, max) {
    return '<input class="input" id="%ID%" type="number" inputmode="numeric" name="' + name +
      '" value="' + val + '" min="' + min + '" max="' + max + '" required />';
  }
  function selectInput(name, options, chosen) {
    return '<select class="input" id="%ID%" name="' + name + '">' +
      options.map(function (o) {
        return '<option' + (o === chosen ? " selected" : "") + '>' + esc(o) + '</option>';
      }).join("") + '</select>';
  }
  function textInput(name, placeholder) {
    return '<input class="input" id="%ID%" type="text" name="' + name + '" placeholder="' + esc(placeholder) + '" autocomplete="name" />';
  }
  function row(a, b) { return '<div class="bs-row">' + a + b + '</div>'; }

  function render(d) {
    fid = 0;
    var book = d.book, html = "";
    if (book === "stay") {
      titleEl.textContent = "Reserve your stay";
      subEl.textContent = d.room ? d.room + " — takes 20 seconds, confirmed in chat."
                                 : "Takes 20 seconds — we confirm availability on WhatsApp.";
      var room = d.room || "Not sure yet";
      if (room.indexOf("Group") === 0 || room.indexOf("group") > -1) room = "Group / Long Stay";
      html += field("Room type", selectInput("room", ROOMS, ROOMS.indexOf(room) > -1 ? room : "Not sure yet"));
      html += row(field("Check-in", dateInput("checkin", true)), field("Check-out", dateInput("checkout", true)));
      html += row(field("Adults", numInput("adults", 2, 1, 30)), field("Children", numInput("children", 0, 0, 20)));
      html += field("Your name", textInput("name", "e.g. Sarah N."), true);
    } else if (book === "activity") {
      titleEl.textContent = d.activity || "Book an experience";
      subEl.textContent = "Tell us when — we confirm details on WhatsApp.";
      html += field("Date", dateInput("date", true));
      if (d.time) html += field("Preferred time", selectInput("time", TIMES, TIMES[2]));
      if (d.kids) html += row(field("Adults", numInput("adults", 2, 1, 50)), field("Children", numInput("children", 0, 0, 30)));
      else html += field("Number of people", numInput("people", 2, 1, 100));
      html += field("Your name", textInput("name", "e.g. Sarah N."), true);
    } else if (book === "event") {
      titleEl.textContent = "Plan your event";
      subEl.textContent = "A few details and our events team takes it from there.";
      html += field("Occasion", selectInput("occasion", OCCASIONS, d.occasion || "Wedding"));
      html += field("Venue", selectInput("venue", VENUES, d.venue || "Not sure yet"));
      html += row(field("Preferred date", dateInput("date", true)), field("Approx. guests", numInput("guests", 50, 1, 2000)));
      html += field("Your name", textInput("name", "e.g. Sarah N."), true);
    } else {
      titleEl.textContent = "Book a table";
      subEl.textContent = "Restaurant & bar — we hold your table on WhatsApp.";
      html += row(field("Date", dateInput("date", true)), field("Time", selectInput("time", TABLE_TIMES, TABLE_TIMES[2])));
      html += field("Number of people", numInput("people", 2, 1, 60));
      html += field("Your name", textInput("name", "e.g. Sarah N."), true);
    }
    fieldsEl.innerHTML = html;

    var today = new Date(); today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    var iso = today.toISOString().slice(0, 10);
    fieldsEl.querySelectorAll("input[type=date]").forEach(function (el) { el.min = iso; });
    var ci = form.querySelector("[name=checkin]"), co = form.querySelector("[name=checkout]");
    if (ci && co) ci.addEventListener("change", function () {
      if (!ci.value) return;
      var next = new Date(ci.value); next.setDate(next.getDate() + 1);
      var nIso = next.toISOString().slice(0, 10);
      co.min = nIso;
      if (!co.value || co.value <= ci.value) co.value = nIso;
    });
  }

  function fmtDate(v) {
    var d = new Date(v + "T12:00:00");
    return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  }
  function guestsLine(a, c) {
    var s = a + " adult" + (a === "1" ? "" : "s");
    if (c && c !== "0") s += ", " + c + " " + (c === "1" ? "child" : "children");
    return s;
  }
  function compose(d, v) {
    var L = [];
    if (d.book === "stay") {
      L.push("Hello Maya Nature Resort! I'd like to reserve a stay. 🌿");
      L.push("🛏 Room: *" + v.room + "*");
      L.push("📅 Check-in: " + fmtDate(v.checkin));
      var nights = Math.round((new Date(v.checkout) - new Date(v.checkin)) / 864e5);
      L.push("📅 Check-out: " + fmtDate(v.checkout) + " (" + nights + " night" + (nights === 1 ? "" : "s") + ")");
      L.push("👥 Guests: " + guestsLine(v.adults, v.children));
    } else if (d.book === "activity") {
      L.push("Hello Maya Nature Resort! I'd like to book: *" + (d.activity || "an experience") + "* 🌿");
      L.push("📅 Date: " + fmtDate(v.date));
      if (v.time) L.push("⏰ Time: " + v.time);
      L.push("👥 " + (v.people ? v.people + " people" : guestsLine(v.adults, v.children)));
    } else if (d.book === "event") {
      L.push("Hello Maya Nature Resort! I'd like to plan an event. 🎉");
      L.push("🎪 Occasion: *" + v.occasion + "*");
      if (v.venue !== "Not sure yet") L.push("📍 Venue: " + v.venue);
      L.push("📅 Preferred date: " + fmtDate(v.date));
      L.push("👥 Approx. guests: " + v.guests);
    } else {
      L.push("Hello Maya Nature Resort! I'd like to book a table at the restaurant. 🍽");
      L.push("📅 Date: " + fmtDate(v.date));
      L.push("⏰ Time: " + v.time);
      L.push("👥 People: " + v.people);
    }
    if (v.name) L.push("— " + v.name);
    return L.join("\n");
  }

  var lastFocused = null, current = null;
  function open(trigger) {
    current = {
      book: trigger.getAttribute("data-book"),
      room: trigger.getAttribute("data-room") || "",
      activity: trigger.getAttribute("data-activity") || "",
      time: trigger.hasAttribute("data-time"),
      kids: trigger.hasAttribute("data-kids"),
      occasion: trigger.getAttribute("data-occasion") || "",
      venue: trigger.getAttribute("data-venue") || ""
    };
    render(current);
    statusEl.textContent = "";
    lastFocused = trigger;
    sheet.classList.add("is-open");
    document.body.style.overflow = "hidden";
    setTimeout(function () {
      var f = panel.querySelector("select, input");
      if (f) f.focus({ preventScroll: true });
    }, 80);
  }
  function close() {
    sheet.classList.remove("is-open");
    document.body.style.overflow = "";
    current = null;
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  document.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target.closest("[data-book]") : null;
    if (t) { e.preventDefault(); open(t); return; }
    if (e.target.closest && e.target.closest("[data-bs-close]")) close();
  });
  document.addEventListener("keydown", function (e) {
    if (!sheet.classList.contains("is-open")) return;
    if (e.key === "Escape") { close(); return; }
    if (e.key !== "Tab") return;
    var f = panel.querySelectorAll("button, select, input, [href]");
    if (!f.length) return;
    var list = Array.prototype.slice.call(f);
    var i = list.indexOf(document.activeElement);
    e.preventDefault();
    list[e.shiftKey ? (i <= 0 ? list.length - 1 : i - 1) : (i >= list.length - 1 ? 0 : i + 1)].focus();
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!current) return;
    var bad = null;
    form.querySelectorAll("[required]").forEach(function (el) {
      el.classList.remove("bs-invalid");
      if (!el.value) { el.classList.add("bs-invalid"); if (!bad) bad = el; }
    });
    if (bad) {
      statusEl.textContent = "Please fill in the highlighted field" + (form.querySelectorAll(".bs-invalid").length > 1 ? "s" : "") + ".";
      bad.focus();
      return;
    }
    var v = {};
    new FormData(form).forEach(function (val, key) { v[key] = String(val).trim(); });
    statusEl.textContent = "Opening WhatsApp with your details…";
    window.open(WA + encodeURIComponent(compose(current, v)), "_blank", "noopener");
    setTimeout(close, 900);
  });
})();
