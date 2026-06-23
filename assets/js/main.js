/* =========================================================================
   Maya Nature Resort — v4 interactions
   Vanilla JS, progressive enhancement, respects prefers-reduced-motion.
   ========================================================================= */
(function () {
  "use strict";

  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduceMotion) root.classList.add("reveal-ready");

  /* ---------- Preloader ---------- */
  const preloader = document.querySelector(".preloader");
  if (preloader) {
    const minShow = 900;
    const start = performance.now();
    const hide = () => {
      const elapsed = performance.now() - start;
      const wait = Math.max(0, minShow - elapsed);
      setTimeout(() => preloader.classList.add("is-loaded"), wait);
    };
    if (document.readyState === "complete") hide();
    else window.addEventListener("load", hide, { once: true });
    // Failsafe: never block visibility longer than 4s
    setTimeout(() => preloader.classList.add("is-loaded"), 4000);
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
    // focus first link for keyboard users
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
    menuToggle.addEventListener("click", () => {
      if (mobileMenu.classList.contains("is-open")) closeMenu();
      else openMenu();
    });
    mobileMenu.querySelectorAll(".mm-link, .mm-cta").forEach((a) =>
      a.addEventListener("click", closeMenu)
    );
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && mobileMenu.classList.contains("is-open")) {
        closeMenu();
        menuToggle.focus();
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

  /* ---------- Word-by-word reveal (hero headings) ---------- */
  document.querySelectorAll("[data-text-reveal]").forEach((el) => {
    // skip if already split (e.g. re-runs)
    if (el.dataset.split === "1") return;
    el.dataset.split = "1";
    // Walk children, splitting text nodes into word spans while preserving inline tags (e.g. <em>)
    const walk = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        const parts = node.textContent.split(/(\s+)/);
        parts.forEach((p) => {
          if (/^\s+$/.test(p)) {
            frag.appendChild(document.createTextNode(p));
          } else if (p.length) {
            const w = document.createElement("span");
            w.className = "word";
            w.textContent = p;
            frag.appendChild(w);
          }
        });
        node.parentNode.replaceChild(frag, node);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // recurse but skip already-split words
        if (!node.classList.contains("word")) {
          Array.from(node.childNodes).forEach(walk);
        }
      }
    };
    Array.from(el.childNodes).forEach(walk);
    // stagger
    el.querySelectorAll(".word").forEach((w, i) => {
      w.style.transitionDelay = Math.min(i * 60, 540) + "ms";
    });
  });

  /* ---------- Scroll reveal ([data-reveal], [data-text-reveal]) ---------- */
  const revealEls = Array.from(document.querySelectorAll("[data-reveal], [data-text-reveal]"));
  if (revealEls.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealEls.forEach((el) => el.classList.add("is-visible"));
    } else {
      // Stagger siblings inside the same parent that are [data-reveal] (skip text-reveal heading)
      const groups = new Map();
      revealEls.forEach((el) => {
        if (!el.hasAttribute("data-reveal")) return;
        const sibs = groups.get(el.parentElement) || [];
        sibs.push(el);
        groups.set(el.parentElement, sibs);
      });
      groups.forEach((sibs) => {
        sibs.forEach((el, i) => {
          if (i > 0) el.style.transitionDelay = Math.min(i * 90, 540) + "ms";
        });
      });
      const io = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
      );
      revealEls.forEach((el) => io.observe(el));
    }
  }

  /* ---------- Count-up stats ---------- */
  const counters = Array.from(document.querySelectorAll("[data-count]"));
  function runCount(el) {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    if (reduceMotion) { el.textContent = target + suffix; return; }
    const dur = 1600;
    const start = performance.now();
    (function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target + suffix;
    })(start);
  }
  if (counters.length) {
    if (!("IntersectionObserver" in window)) {
      counters.forEach(runCount);
    } else {
      const co = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) { runCount(entry.target); obs.unobserve(entry.target); }
          });
        },
        { threshold: 0.6 }
      );
      counters.forEach((el) => co.observe(el));
    }
  }

  /* ---------- Hero parallax (background image) ---------- */
  const scene = document.querySelector("[data-parallax]");
  if (scene && !reduceMotion) {
    const speed = parseFloat(scene.dataset.parallax) || 0.18;
    let ticking = false;
    const update = () => {
      const y = window.scrollY;
      if (y < window.innerHeight * 1.3) {
        scene.style.transform = `translateY(${y * speed}px) scale(1.04)`;
      }
      ticking = false;
    };
    window.addEventListener(
      "scroll",
      () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } },
      { passive: true }
    );
  }

  /* ---------- Magnetic buttons / nav-cta ---------- */
  if (!reduceMotion && window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".magnet, .nav-cta, .btn-primary").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate(${x * 0.18}px, ${y * 0.18 - 3}px)`;
      });
      el.addEventListener("mouseleave", () => {
        el.style.transform = "";
      });
    });
  }
})();
