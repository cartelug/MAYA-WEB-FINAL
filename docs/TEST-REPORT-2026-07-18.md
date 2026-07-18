# Test report — content update v46 (18 July 2026)

## Automated page audit

**76 page-views — 0 issues.** No broken images, no 4xx/5xx asset requests, no JavaScript
errors, no horizontal overflow in any run.

- Key pages (Home, Rooms, Conference Hall, Events, Experiences, Menu, Gallery, Directions)
  tested at **360, 390, 430, 768, 1024 and 1440 px**.
- All remaining pages (Contact, Privacy, 404 and the 11 amenity pages) tested at 390 and 1440 px.
- Lazy images force-loaded and full pages scrolled on every run.

## Interaction tests (headless Chromium)

| Check | Result |
|---|---|
| Gallery filters (8 categories) | ✅ correct counts, category isolation (rooms 18 · hall 1 · events 3 · grounds 23 · dining 10 · pool 13 · nature 6 · arrival 4) |
| Gallery lightbox | ✅ opens with image, caption and navigation |
| Menu search | ✅ "Chinese Wok" found — single result |
| Chinese Wok location | ✅ inside Main Course (`#food-main`), no longer in Burgers |
| Mobile menu | ✅ new Conference Hall wordmark tile loads and animates (9th stagger delay added) |
| Navigation model | ✅ wordmark overlay is the nav at all breakpoints by design; text nav (with Conference Hall) retained in DOM for crawlers |
| Rooms interiors / directions road tiles | ✅ lightbox-enabled tiles render at all widths |
| WhatsApp actions | ✅ all use +256 773 883 760 with contextual messages (hall enquiries name the Conference Hall) |

## Content-accuracy checks

- `0.266389,32.435833` and any Plus-Code/exact-pin copy actions: **0 occurrences** in the
  shipped site (name-search map links + "WhatsApp us for the exact pin" everywhere).
- Hard-coded "4.0 / 5" TripAdvisor rating/ranking: removed; neutral live-reviews link in place.
- `https://mayanatureresort.com` (bare host) in canonicals/OG/JSON-LD/sitemap/robots:
  **0 occurrences** — all unified on `https://www.mayanatureresort.com`.
- Gallery exact duplicate g004/g006: resolved (g006 removed).
- Stock menu images carry licensed-accurate alt text with no "at Maya" claims.
- Construction-visible photos appear only as labelled progress imagery (Pool View Hotel card).
- Sculptures no longer categorised as Wildlife; "approach road" mislabel removed.
- Schema aligned to visible labels (Family Cottages); events schema now garden-focused.

## Redirects (implemented, needs one live confirmation after upload)

`.htaccess` ships with one-hop 301s (absolute `https://www` targets) for:
`/accommodation/`, `/contacts/`, `/reservation/`, `/gallery/`, `/about-us/`,
`/our-services/`, `/play-ground/`, `/the-ropes-bar-and-restaurant/`, `/project/*`,
plus a single-hop HTTP/bare-domain → `https://www` canonical redirect.
Apache `mod_rewrite` syntax (DreamHost's active mechanism). **After uploading, spot-check
in a browser** that `mayanatureresort.com/accommodation/` lands on
`https://www.mayanatureresort.com/rooms.html` in one step — this environment cannot
reach the live server to verify externally.

## Before/after screenshots

Desktop (1440) and mobile (390) captures of Home, Rooms, Conference Hall (after only —
new page), Events, Experiences, Menu, Gallery and Directions, before (v45) vs after (v46),
are delivered alongside this report.

## Delivery

- Updated source pushed to the repository (branch + main).
- Tested production ZIP: `maya-website-update-v46.zip` (web files + `.htaccess`, no
  internal docs).
- `docs/CHANGELOG.md` — full change list; `docs/UNRESOLVED.md` — pending owner facts.
- Nothing was deployed to the live server; upload remains owner-controlled.
