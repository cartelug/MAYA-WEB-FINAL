/* =========================================================================
   Maya Nature Resort — Menu page interactions
   Tab switch (Food / Drinks) · category scrollspy chips · live search.
   Vanilla, progressive-enhancement: page is fully usable with JS disabled.
   ========================================================================= */
(function () {
  "use strict";

  var bar = document.querySelector("[data-menu-bar]");
  if (!bar) return;

  var tabsWrap   = document.querySelector("[data-tabs]");
  var tabBtns    = Array.prototype.slice.call(document.querySelectorAll(".menu-tab"));
  var indicator  = document.querySelector(".menu-tab-ind");
  var panels     = Array.prototype.slice.call(document.querySelectorAll(".menu-panel"));
  var chipsWrap  = document.querySelector("[data-chips]");
  var searchBox  = document.querySelector("[data-search]");
  var searchIn   = document.querySelector("[data-search-input]");
  var searchClr  = document.querySelector("[data-search-clear]");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var activeTab = "food";
  var spy = null; // current IntersectionObserver

  /* ---------- helpers ---------- */
  function currentPanel() {
    return document.querySelector('.menu-panel[data-panel="' + activeTab + '"]');
  }
  function slug(s) {
    return s.toLowerCase().replace(/&amp;|&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  /* ---------- build category chips for the active panel ---------- */
  function buildChips() {
    var panel = currentPanel();
    var cats = Array.prototype.slice.call(panel.querySelectorAll(".menu-cat"));
    chipsWrap.innerHTML = "";
    cats.forEach(function (cat, i) {
      var label = cat.getAttribute("data-cat") || "";
      // decode &amp; for display
      var tmp = document.createElement("textarea");
      tmp.innerHTML = label;
      var text = tmp.value;

      var chip = document.createElement("button");
      chip.type = "button";
      chip.className = "menu-chip" + (i === 0 ? " is-active" : "");
      chip.textContent = text;
      chip.setAttribute("data-target", cat.id);
      chip.addEventListener("click", function () {
        var top = cat.getBoundingClientRect().top + window.pageYOffset - barOffset() - 8;
        window.scrollTo({ top: top, behavior: reduceMotion ? "auto" : "smooth" });
      });
      chipsWrap.appendChild(chip);
    });
    observeCats(cats);
  }

  function barOffset() {
    // fixed site header + sticky menu bar, so the scroll target clears both
    var headerH = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue("--header-h"),
      10
    ) || 84;
    return headerH + bar.getBoundingClientRect().height;
  }

  /* ---------- scrollspy: highlight chip for the section in view ---------- */
  function observeCats(cats) {
    if (spy) spy.disconnect();
    if (!("IntersectionObserver" in window)) return;

    var visible = {};
    spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        visible[e.target.id] = e.isIntersecting ? e.intersectionRatio : 0;
      });
      // pick the most-visible category
      var bestId = null, best = 0;
      cats.forEach(function (c) {
        var v = visible[c.id] || 0;
        if (v > best) { best = v; bestId = c.id; }
      });
      if (bestId) setActiveChip(bestId);
    }, {
      rootMargin: "-45% 0px -45% 0px",
      threshold: [0, 0.25, 0.5, 1]
    });
    cats.forEach(function (c) { spy.observe(c); });
  }

  function setActiveChip(catId) {
    var chips = chipsWrap.querySelectorAll(".menu-chip");
    chips.forEach(function (chip) {
      var on = chip.getAttribute("data-target") === catId;
      chip.classList.toggle("is-active", on);
      if (on && typeof chip.scrollIntoView === "function") {
        // keep the active chip in view within the scroll strip
        var wrapRect = chipsWrap.getBoundingClientRect();
        var chipRect = chip.getBoundingClientRect();
        if (chipRect.left < wrapRect.left || chipRect.right > wrapRect.right) {
          chipsWrap.scrollTo({
            left: chip.offsetLeft - 16,
            behavior: reduceMotion ? "auto" : "smooth"
          });
        }
      }
    });
  }

  /* ---------- tab switching ---------- */
  function moveIndicator() {
    var idx = activeTab === "drinks" ? 1 : 0;
    if (indicator) indicator.style.setProperty("--tab", idx);
  }

  function switchTab(name) {
    if (name === activeTab) return;
    activeTab = name;

    tabBtns.forEach(function (b) {
      b.setAttribute("aria-selected", b.getAttribute("data-tab") === name ? "true" : "false");
    });
    panels.forEach(function (p) {
      var on = p.getAttribute("data-panel") === name;
      p.classList.toggle("is-active", on);
      if (on) { p.hidden = false; } else { p.hidden = true; }
    });
    moveIndicator();
    clearSearch();        // reset filter when switching menus
    buildChips();
    // re-run shared reveal animations for the freshly shown panel
    triggerReveals(currentPanel());
  }

  // Nudge the shared reveal observer by toggling visibility classes if needed.
  function triggerReveals(panel) {
    if (reduceMotion) return;
    var els = panel.querySelectorAll("[data-reveal], [data-text-reveal]");
    els.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) {
        el.classList.add("is-visible");
      }
    });
  }

  tabBtns.forEach(function (btn) {
    btn.addEventListener("click", function () { switchTab(btn.getAttribute("data-tab")); });
  });
  // keyboard arrows on the tablist
  if (tabsWrap) {
    tabsWrap.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      switchTab(activeTab === "food" ? "drinks" : "food");
      var sel = document.querySelector('.menu-tab[aria-selected="true"]');
      if (sel) sel.focus();
    });
  }

  /* ---------- live search (filters items in the active panel) ---------- */
  function clearSearch() {
    if (!searchIn) return;
    searchIn.value = "";
    searchBox.classList.remove("has-value");
    applyFilter("");
  }

  function applyFilter(termRaw) {
    var panel = currentPanel();
    var term = termRaw.trim().toLowerCase();
    var cats = Array.prototype.slice.call(panel.querySelectorAll(".menu-cat"));
    var anyVisible = false;

    cats.forEach(function (cat) {
      var items = Array.prototype.slice.call(cat.querySelectorAll(".m-item"));
      var catHasMatch = false;
      items.forEach(function (item) {
        var match = term === "" || item.textContent.toLowerCase().indexOf(term) !== -1;
        item.style.display = match ? "" : "none";
        if (match) catHasMatch = true;
      });
      // packs (buffet) — match by their text too
      var packs = Array.prototype.slice.call(cat.querySelectorAll(".pack"));
      packs.forEach(function (pack) {
        var match = term === "" || pack.textContent.toLowerCase().indexOf(term) !== -1;
        pack.style.display = match ? "" : "none";
        if (match) catHasMatch = true;
      });
      var hasPacks = packs.length > 0;
      var hasItems = items.length > 0;
      var show = term === "" ? true : catHasMatch && (hasItems || hasPacks);
      cat.style.display = show ? "" : "none";
      if (show && (catHasMatch || term === "")) anyVisible = true;
    });

    var empty = panel.querySelector("[data-empty]");
    if (empty) {
      var showEmpty = term !== "" && !anyVisible;
      empty.classList.toggle("show", showEmpty);
      var termEl = empty.querySelector("[data-empty-term]");
      if (termEl) termEl.textContent = termRaw.trim();
    }
    // hide the chip strip while actively filtering (categories are reordered/hidden)
    chipsWrap.parentElement.style.opacity = term === "" ? "" : ".4";
    chipsWrap.parentElement.style.pointerEvents = term === "" ? "" : "none";
  }

  if (searchIn) {
    var t;
    searchIn.addEventListener("input", function () {
      searchBox.classList.toggle("has-value", searchIn.value !== "");
      clearTimeout(t);
      t = setTimeout(function () { applyFilter(searchIn.value); }, 110);
    });
  }
  if (searchClr) {
    searchClr.addEventListener("click", function () {
      clearSearch();
      searchIn.focus();
    });
  }
  // "clear the search" link inside empty states
  document.querySelectorAll("[data-empty-reset]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      clearSearch();
      if (searchIn) searchIn.focus();
    });
  });

  /* ---------- init ---------- */
  moveIndicator();
  buildChips();
  window.addEventListener("resize", function () {
    // keep indicator + scroll math correct on rotate/resize
    moveIndicator();
  }, { passive: true });
})();
