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

## 7. GAP ANALYSIS — what was missing (found in deep code audit)

These are real defects/omissions found by reading the actual codebase. All are now
in scope.

### 7.1 Architecture / maintainability
- **No shared components.** The header, mobile menu, footer, preloader and floating
  WhatsApp are **copy-pasted into all 20 HTML files** (verified: `maya-mark.png`
  appears 3× in each). One nav change = 20 edits = drift + bugs.
  → **Fix:** extract `header`, `footer`, `preloader`, `mobile-menu`, `floating-cta`
  into partials injected by a tiny vanilla JS loader (`data-include="partials/header.html"`)
  with a no-JS `<noscript>` fallback. Single source of truth, still static-hostable.
- **Inline styles** leaking into markup (e.g. `rooms.html` contact lines, `style=`
  on SVGs). → Move to design-system classes.

### 7.2 SEO / discoverability (big wins, currently absent)
- **No structured data anywhere** (verified — zero JSON-LD). A resort *needs*
  `LodgingBusiness`/`Resort` schema: name, geo coordinates, address, priceRange,
  amenities, telephone, sameAs (socials), aggregateRating, and `Room` items.
  → Enables Google rich results / map presence. Add per-page JSON-LD.
- **Open Graph / Twitter / canonical only on `index.html`.** 19 pages have **no
  social preview image and no canonical**. → Add OG + Twitter + canonical to every page.
- **`sitemap.xml`**: missing `404` is correct, but `lastmod` is stale and priorities
  are flat. → Regenerate with build; add `<image:image>` entries.
- **No `theme-color` per scheme**, no `robots`/`googlebot` meta granularity.

### 7.3 Conversion / trust
- **Pricing is "On request" everywhere.** Even indicative "from UGX —" ranges lift
  bookings. → Owner decision: provide ranges or keep on-request (flagged).
- **Testimonials appear invented** ("Aisha & Daniel" etc.). Using fabricated reviews
  is a trust + ethics risk. → Replace with **real guest quotes** (Google/Facebook),
  or relabel honestly. Wire `Review`/`aggregateRating` schema only to real ones.
- **Map is a literal placeholder** ("Insert the final Google Maps embed here") on
  `contact.html` (and `directions.html`). → Embed real Google Map (lazy-loaded iframe)
  + a static map fallback image for slow networks.
- **No analytics** (verified — no GA4/Pixel). Owner can't measure traffic or bookings.
  → Add privacy-light analytics (GA4 or Plausible) + WhatsApp-click event tracking.

### 7.4 Content depth
- Rooms lack **occupancy, bed type, size, photo count, per-room gallery**.
- **Menu PDFs are 682 bytes** (placeholder/empty). → Need real menu content/photos.
- No **FAQ** section (check-in/out times, pets, payment, parking) — strong for SEO
  (`FAQPage` schema) and reduces repetitive WhatsApp questions.

### 7.5 Technical hygiene
- **Images have no `width`/`height`** → cumulative layout shift. Add intrinsic
  dimensions + `aspect-ratio` everywhere.
- **No PWA service worker.** → Add one: cache shell + logos + CSS/JS for instant
  repeat visits on poor Ugandan mobile networks. (Manifest already planned.)
- **No legal pages** (privacy, terms). → Add minimal, on-brand pages (also needed
  for analytics consent).
- **Forms** lack inline validation feedback + honeypot anti-spam.

---

## 8. ELEVATED DESIGN LANGUAGE — "Level 100"

Beyond layout: a coherent, ownable design system so the site feels designed by a
studio, not assembled.

### 8.1 Signature brand motif — the "sunburst dot-ray"
The logo's gold dotted sun-rays are a unique, ownable graphic. Extract them as a
**reusable SVG device** used as connective tissue site-wide:
- Faint oversized sunburst behind the hero headline and section eyebrows.
- As the **preloader** animation (rays draw on in sequence, then logo settles).
- Section dividers = a thin gold dotted arc instead of a plain line.
- Hover bursts on primary CTAs (a few dots scatter outward, once).
This single motif, repeated with restraint, is what reads as "premium brand."

### 8.2 Depth & material system (tokens)
- **Elevation scale** `--e0…e4`: formalized layered shadows (ambient + key light)
  for cards, popovers, nav, modals — consistent light source (top, slightly right).
- **Glass tiers**: `--glass-1` (nav), `--glass-2` (trust rail / strip), `--glass-3`
  (overlays) with defined blur/saturation/border-tint per tier.
- **Surface textures**: subtle film grain on dark zones, faint paper tooth on cream
  zones — kills flat-gradient banding, adds tactility.

### 8.3 Art direction for photography
- Unified grade: gentle green-gold warmth, lifted shadows, consistent contrast.
- Consistent **scrim system**: every photo-over-text uses the same gradient tokens
  so legibility + mood are identical everywhere.
- Focal-point discipline (`object-position` per image) so faces/subjects never crop.
- Duotone (green/gold) treatment for background/secondary imagery to unify mismatched
  source photos until pro photography arrives.

### 8.4 Editorial layout
- Fluid **12-column grid** with intentional asymmetry, overlapping elements, and
  generous negative space (luxury = whitespace).
- One **drop-cap editorial moment** (Atmosphere section) in the display serif.
- Numbered section index (01 — 08) as a quiet luxury wayfinding cue.

### 8.5 Motion choreography (a language, not random effects)
- **Entrance direction follows reading flow**: left content from left, right media
  from right, stacked content rises.
- **Depth parallax**: 3 speed layers (bg / mid / fg) on hero + bridge (desktop).
- **Signature heading reveal**: a soft gold "sunrise" sweep wipes across key H2s as
  they enter (masked gradient, transform-only).
- **Microinteractions**: CTA shimmer (one pass), link underline grow from left,
  desktop card tilt (≤4°, pointer-based), image hover zoom + caption rise, magnetic
  primary CTAs. All have **touch-friendly equivalents** and obey reduced-motion.

### 8.6 Accessibility *as* design
- On-brand visible focus rings (gold, offset) — designed, not default.
- Reduced-motion variants are *designed* (instant, dignified), not just disabled.
- Contrast verified AA+ on every text-over-image (scrim tokens guarantee it).
- Full keyboard paths for menu, lightbox, carousels; ARIA on all interactive widgets.

---

## 8A. THE MAXED PRELOADER — "best first second"

A short, deliberate brand moment that never feels like waiting and never hangs.

**Build sequence (≈1.6–2.0s on fast networks):**
1. `t0` — Dark forest field fades in (1 frame). Faint oversized sunburst centered.
2. `t+0` — **Sun-ray dots scale-in radially**, clockwise, 18–24 dots, 18ms apart
   (`transform: scale()` from 0, `--ease-spring`). This *is* the brand mark drawing itself.
3. `t+350` — **Leaf marks stroke-draw** via `stroke-dashoffset` (the green M/leaf).
4. `t+650` — **Wordmark** "MAYA NATURE RESORT" fades + rises (line-mask).
5. `t+850` — **Tagline** "Where the sun rises and sets" wipes in (gold gradient mask).
6. Under it: a **thin gold progress arc** (0→100) bound to real load (see timing).

**Timing logic (never hangs, always graceful):**
```
progress = loadedAssets / trackedAssets        // real, from <img> onload + load event
shown    = ease(min(progress, elapsed/MIN))    // can't outrun the animation
MIN = 1600ms   HARD_CAP = 5000ms (failsafe → force-complete + remove)
```
Fast connection → smooth 0–100 in ~1.6s. Slow connection → arc advances with real
load but the brand animation still reads as intentional, not stalled.

**Exit — the signature move (FLIP):**
- Curtain wipes up (`clip-path: inset(0 0 100% 0)`, 0.7s `--ease-premium`).
- Simultaneously the preloader logo **morphs to the nav logo position** using a FLIP
  transform (measure first/last rect, animate the delta) so the brand "flies into"
  the header. Preloader then removed from DOM.
- **Reduced motion / no-JS:** simple 200ms fade, no rays, no FLIP. Always dignified.

**Mobile = desktop:** identical sequence; ray count and sizes via `clamp()`, FLIP
target is the mobile nav logo. No layout shift, no scroll lock jank.

---

## 8B. THE OPEN EXPERIENCE — first-paint choreography (PC + mobile)

The moment the curtain lifts, a single coordinated timeline plays. Same beats on
both viewports; distances/durations scale with `clamp()` and viewport.

| Beat | Element | Motion |
|---|---|---|
| 0ms | Hero image | Ken-Burns **bloom**: `scale(1.08)→1`, `opacity 0→1`, scrim deepens (1.2s) |
| 150ms | Sunburst behind headline | Rays draw on faintly (gold, low opacity) |
| 300ms | Script line | Line-mask rise + gold gradient sweep |
| 450ms | **H1 (per line, then per word)** | Lines rise from behind a mask, words stagger 55ms, blur→sharp |
| 800ms | Body paragraph | Per-line fade + rise |
| 1000ms | CTA pills | `scale(.92)→1` pop + one-pass shimmer |
| 1200ms | Trust rail | Stars twinkle-in (scale 0→1, 70ms apart), stats count up |
| 1350ms | Bottom quick-jump strip | Slides up from below, settles |

Driven by one class toggle (`body.is-ready`) + CSS `transition-delay` chain — no
JS animation loop, so it's frame-perfect on low-end phones. Honors reduced-motion
(all visible instantly).

---

## 8C. UNIVERSAL TEXT ANIMATION SYSTEM — every word, every page

A single reusable vanilla utility (`splitText`) powers all word/line motion on
open **and** on scroll, identically on mobile and PC.

**Splitting:**
- Wraps each line in a `.line` with `overflow: hidden` (mask) and each word in a
  `.word` span. Optional char split for short accent words.
- Re-splits on resize (debounced) so line masks stay correct at every width.
- Preserves the existing `<em>` gold serif accents.

**Reveal types (data attribute on any text element):**
- `data-anim="lines"` — lines rise from behind the mask (premium default for H1/H2).
- `data-anim="words"` — word-by-word stagger (eyebrows, short headings).
- `data-anim="fade-lines"` — body copy: per-line fade + 12px rise.
- `data-anim="sweep"` — gold "sunrise" gradient wipes across the heading as it enters.

**Triggering:**
- **On open:** hero text fires via the §8B timeline.
- **On scroll:** one `IntersectionObserver` (threshold 0, `rootMargin -10%`) adds
  `.is-in`; CSS handles the rest. `unobserve` after firing. `will-change` toggled on
  just before, removed after — no permanent compositing cost.

**Engineering guarantees:**
- Transform + opacity only. Stagger capped (≤400ms) so long headings don't crawl.
- Mobile rise distance smaller (`clamp(8px,2vw,24px)`) → elegant, never nauseating.
- `prefers-reduced-motion` → no split, no motion, full text visible and selectable.
- Text stays **real text** (accessible, selectable, SEO-readable) — spans only.

---

## 8D. 21st-CENTURY RESPONSIVE ENGINEERING

Modern, clean, component-true responsiveness — not just viewport breakpoints.

- **Container queries** (`@container`) so cards/sections respond to *their own* width,
  not the screen — a room card looks right in a 1-up mobile list, a 2-up tablet
  carousel, or a 3-up desktop grid with zero special-casing.
- **Fluid everything**: `clamp()` type + space, `min()/max()` widths, no magic numbers.
- **Modern CSS**: `:has()` for stateful layout, `color-mix()` for tonal variants from
  brand tokens, logical properties (`inline/block`) for robustness, `text-wrap:
  balance` (headings) + `pretty` (body), `aspect-ratio` on all media (zero CLS).
- **Scroll-driven animation** via `animation-timeline: view()/scroll()` where
  supported (parallax, progress, reveals) with IntersectionObserver fallback —
  buttery, main-thread-free where the browser allows.
- **`content-visibility: auto`** on below-the-fold sections → faster first render on
  low-end devices.
- **View Transitions API** for smooth cross-page navigation (progressive enhancement).
- **`dvh`/`svh`/`lvh`** units so 100vh never breaks under mobile browser chrome.
- **Safe-area insets** (`env(safe-area-inset-*)`) for notched phones.
- **Clean-web aesthetic**: large fluid display type, generous whitespace, restrained
  glassmorphism, bento grids, soft elevation, dark/light section rhythm, micro-typography.

---

## 9. Build order (updated)

- **Phase 0** — Asset prep + fix site-wide broken logos/favicons. Extract sunburst
  motif SVG (used by preloader + dividers + accents).
- **Phase 1** — Foundation: shared-partial loader, CSS scales + tokens (elevation,
  glass, scrim), **container-query + modern-CSS base (§8D)**, mobile-first
  breakpoints, **maxed preloader with FLIP exit (§8A)**, **universal text-animation
  utility (§8C)**, motion-choreography system.
- **Phase 2** — Homepage sections 01–08 with full design language + **the open
  experience timeline (§8B)** + every-word animation on open and scroll (placeholders
  for experience photos).
- **Phase 3** — SEO/infra layer: JSON-LD per page, OG/Twitter/canonical everywhere,
  analytics + WhatsApp event tracking, real map embeds, regenerated sitemap, PWA SW.
- **Phase 4** — Real experience photos into the bento; photography grade pass.
- **Phase 5** — Roll system to all inner pages (rooms detail, events, experiences,
  menu, gallery, contact, directions, 11 amenities, 404) + add FAQ + legal pages.

---

## 10. Outstanding inputs from owner

1. **Experience photos** — pool, sauna, gym, zip-line, dancing fountain (bento).
2. **Real testimonials** — 3–6 genuine guest quotes (and permission), or approve
   relabeling current copy as illustrative.
3. **Pricing** — provide indicative ranges, or confirm "on request" stays.
4. **Google Maps** — exact pin / embed link for the resort.
5. **Analytics** — GA4 ID or approve Plausible; confirm consent approach.
6. **Real menu** — food/drink items (the current PDFs are empty placeholders).
7. Approval to begin Phase 0–2 build.

---

*Week 1 complete: discovery, asset audit, deep gap analysis, full information
architecture, an elevated/ownable design language, responsive + performance +
SEO strategy, and a locked multi-phase build order.*
