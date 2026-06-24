# Maya Nature Resort — V5 Master Plan

> **Status:** Week 1 — Planning locked. Build-ready.
> **Branch:** `claude/friendly-gates-fx05kl`
> **Stack:** Vanilla HTML / CSS / JS (no frameworks — per project rule)
> **Goal:** A premium, fully responsive resort site that is *equally* polished on
> mobile and desktop, fast on slow networks, and consistent across every page.

---

## 0. Non-negotiable rules (apply to every component, every page)

1. **Mobile = Desktop.** Both are first-class. Every component is written
   mobile-first (`min-width` up), and the mobile layout is *designed*, never
   just collapsed.
2. **`clamp()` everything** — type, spacing, radii. No abrupt breakpoint jumps.
3. **Animations use `transform` + `opacity` only** (GPU-composited). Never
   animate `height`, `margin`, `top`, or `filter` on scroll.
4. **Touch parity** — every hover state has a tap equivalent. Tap targets ≥ 48px.
5. **`prefers-reduced-motion`** fully respected — content snaps visible, no motion.
6. **Performance budget:** LCP < 2.5s on 3G, zero layout shift (every image has
   an explicit `aspect-ratio`/dimensions).
7. Test mentally + in devtools at: **375 · 390 · 414 · 768 · 1024 · 1280 · 1440**.

---

## 1. Locked design decisions

| Decision | Choice |
|---|---|
| Typography | **Serif-display headings** (Cormorant) for H1/H2 + Montserrat for UI/body. Gold italic `<em>` accents. |
| Hero headline | Keep **"Stay where nature welcomes you."** + script line "Where the sun rises and sets" |
| Favicons | Color icon on a **brand-green rounded tile** (intentional on iOS + tabs) |
| Color zones | A = Dark Forest `#071a11→#0f3d25` · B = Warm Cream `#fff8e8→#faf2dd` · C = Clean White |
| Primary CTA | **Gold-gradient pill**, two-line ("Reserve Your Stay / We reply within minutes") |
| Removed | The day→night sun-scroll "journey" section (replaced with photo-driven sections) |

---

## 2. Logo & favicon assets (Phase 0)

The 6 new logos are 2000×2000 squares with large transparent padding around
horizontal art — they must be **trimmed + resized** before web use.

**Source → web derivatives:**

| Source file | Trimmed web file | Used for |
|---|---|---|
| `main logo.png` | `logo-full.png` (~400w) | Light backgrounds, preloader |
| `main logo white.png` | `logo-full-white.png` (~400w) | **Nav + footer (dark)** |
| `main logo black.png` | `logo-full-black.png` | Print / docs |
| `main logo icon.png` | `logo-icon.png` (~96w) | Favicon source, compact |
| `main logo icon white.png` | `logo-icon-white.png` | Dark compact spots |
| `main logo icon black.png` | `logo-icon-black.png` | Mono spots |

**Regenerate (these were deleted in the logo commit — every page is currently
broken):** `favicon.ico` (16/32/48), `favicon-32.png`, `favicon-512.png`,
`apple-touch-icon.png` (180×180 on green tile), `site.webmanifest`.

**Repoint references** across all **20 HTML files** (nav, footer, preloader,
favicon links).

---

## 3. Foundation (Phase 1 — `style.css` + `main.js`)

**CSS:**
- Add clamp-based spacing scale (`--sp-1…7`) and type scale (`--text-xs…hero`).
- Convert to mobile-first breakpoints: `480 / 768 / 1024 / 1280`.
- Serif-display heading styles.

**JS — animation architecture:**
- **Preloader:** full colored logo, gold glow pulse, **curtain-wipe exit**
  (`clip-path`). Timing = `Promise.all([1800ms, DOMContentLoaded])` — shows a
  graceful minimum on fast networks, **never hangs** on slow ones. 5s failsafe.
- **Scroll reveals:** CSS `animation-timeline: view()` where supported,
  IntersectionObserver fallback everywhere else. Stagger siblings 60–80ms (cap 400).
- **Parallax / magnetic CTAs:** desktop + fine-pointer only; skipped on touch.
- Post-preloader hero reveal: 6 staggered beats (bg → script → H1 words → body →
  CTAs → trust/strip).

---

## 4. Homepage structure (`index.html`)

| # | Section | Zone | Mobile | Desktop | Cross-section image |
|---|---|---|---|---|---|
| 01 | Hero | Dark | Bottom-anchored, full-width gold pill, glass quick-jump strip scrolls | Left-aligned, inline pills, parallax, 4-up strip | — |
| — | Trust rail | Dark | 2 rows (stars + scrolling stats) | Single glass row, count-up | — |
| 02 | Atmosphere | Cream | Image 4:3 top, text below | 52% image (bleeds up into hero) + text | garden-hilltop |
| 03 | Rooms | White | Swipe carousel 1.3 cards | 3-up grid | — |
| — | Bridge | — | Full-bleed photo + italic quote, fades both sides | + parallax | grounds-sports-field |
| 04 | Experiences | Dark | 2-col bento squares | Asymmetric 3-col bento | (real photos needed) |
| 05 | Events | Cream | Image 16:9 top, text below | Image bleeds above/below + text | wedding-rose-arch |
| 06 | Social proof | White | 1-col serif quote, faint bg | 2-col + side quotes | dining-terrace (7% bg) |
| 07 | Nature | Dark | Image top, text below | 50/50, image bleeds into CTA | wildlife-monkeys |
| 08 | Final CTA | Cream | 3 stacked contact pills | 3 inline pills + glow | — |

**Hero CTA spec:** gold-gradient pill, inner highlight + outer glow, WhatsApp
icon in translucent circle, `scale(.97)` press, one-pass shimmer on load.
Secondary = glass ghost pill with nudging arrow.

**Trust rail spec:** glass rail, gold twinkle-in stars, icon+label stats with
gold-dot separators, count-up on view.

---

## 5. Performance (every page)

- **Responsive images:** `srcset` at 480/768/1280/1920 + `sizes`; WebP + JPg
  fallback. Resize the heavy source jpgs.
- **Hero image preloaded** (`<link rel=preload as=image>`); everything else
  `loading="lazy"` + `decoding="async"`.
- **Logos resized** from 2000px to nav/icon sizes (saves ~300KB/page).
- Explicit `aspect-ratio` on all media → no layout shift.

---

## 6. Roadmap — complete site (post-homepage)

Same component system + scroll animations rolled to every page:

| Page | Key work |
|---|---|
| `rooms.html` | Room detail cards, per-room gallery, price, amenities, badges |
| `events.html` | Hall gallery, capacity table, inquiry form |
| `experiences.html` | Full bento of all 11, detail links |
| `menu.html` | Menu sections + food photography |
| `gallery.html` | Improved masonry lightbox |
| `contact.html` | Redesigned WhatsApp form + map embed |
| `directions.html` | Map + illustrated step-by-step |
| `amenities/*.html` (11) | Shared template: hero, detail, related |
| `404.html` | On-brand, consistent nav/footer |

---

## 7. Build order

- **Phase 0** — Asset prep + fix the site-wide broken logos/favicons.
- **Phase 1** — Foundation (CSS scales, mobile-first breakpoints, preloader, motion).
- **Phase 2** — Homepage sections 01–08 (placeholders for experience photos).
- **Phase 3** — Drop in real experience photos (pool, sauna, gym, zip-line, fountain).
- **Phase 4** — Roll the system to all inner pages.

---

## 8. Outstanding inputs from owner

1. **Experience photos** — pool, sauna, gym, zip-line, dancing fountain (for bento).
2. Approval to begin Phase 0–2 build.

---

*Week 1 complete: discovery, asset audit, full information architecture, design
system direction, responsive + performance strategy, and a locked build order.*
