# Maya Nature Resort — session handoff

> Carry-over notes so a new chat can continue seamlessly. Branch from the tip of
> `claude/friendly-gates-fx05kl`.

## Branch / push rules
- Develop on **`claude/friendly-gates-fx05kl`**.
- Push every change to **both** `claude/friendly-gates-fx05kl` **and** `main`.
- Stack is **vanilla HTML/CSS/JS only** (no frameworks) — see `CLAUDE.md`.

## ⏳ OPEN TASK (do this next)
**Mobile room cards are still not liked — needs a redesign.** The user dislikes
the current mobile setup; get specifics on *what* (proportions? glass panel?
chips? photo size? overall layout?) before rebuilding.

Where it lives:
- Markup: `rooms.html` — the room grid uses the flagship component
  `<article class="rcard">` … `.rc-ph/.rc-img/.rc-grade/.rc-grain/.rc-vig/.rc-frame/.rc-idx/.rc-seal/.rc-dots/.rc-glass/.rc-kick/.rc-tl/.rc-chips/.rc-chip/.rc-act/.rc-reserve/.rc-round`.
- Styles: `assets/css/style.css` — search `ROOMS — flagship cinematic room cards`.
  Mobile rules are in `@media (max-width: 560px)` (compact glass, taller 3/4 card,
  1-line tagline, chips one row + 3rd hidden, dots hidden) and the
  `@media (max-width: 760px)` perf block (backdrop-filter off, Ken-Burns idle).
- Already tried on mobile and STILL disliked: taller 3/4 card, compacted glass
  (~183px), tagline clamp to 1 line, chips to one row. So consider a different
  mobile layout direction (e.g. horizontal photo + info, or a cleaner stacked
  card), not just tweaks.

## Done this session (all pushed, HEAD ~4c1f198)
- Nav → Montserrat + gilded 3D "Book Now" CTA; active word gold-foil.
- Preloader uses the **real logo** with a layered sunrise reveal (glow bloom,
  rise-into-focus, masked gold sheen).
- Home amenity cards → cinematic animated scenes (`.amenity-card .am-scene`,
  pool caustics, gym curl, sauna heat/embers, breakfast steam, fountain jets,
  zip rider) + glass caption; fixed earlier white-on-white bug.
- "A day at Maya" day-card title no longer truncates.
- **Flagship room cards** (`.rcard`) on `rooms.html` — cinematic photo, gold
  frame, editorial index, gilded seal, glass panel, "Reserve" (Syne) + round
  call button. Added Marcellus + Cormorant fonts.
- **Performance pass**: hero parallax loop idles at rest; Ken-Burns is now a
  composited transform (no `background-position` repaint); preloader 2400→1400ms;
  pool/sauna `feTurbulence` made static (no per-frame raster); room cards pause
  off-screen; mobile drops `backdrop-filter` glass + idles Ken-Burns.
- Reveal **safety net** so `data-reveal` elements never stay hidden under load
  (this fixed the blank "wild lives here" wildlife image).

## Still optional / not done
- Fonts: move `@import` (Syne/Montserrat/Marcellus/Cormorant) → `preload` and
  maybe drop Cormorant (used only for room-card taglines). Skipped to avoid
  editing all ~20 page heads.
- Rooms page remaining polish from the plan: stat-ribbon redesign (retire the
  Knockout numerals), featured Executive room showcase, sticky "Reserve on
  WhatsApp" bar.

## Dev / verify tips
- Headless render: Playwright is global at `/opt/node22/lib/node_modules/playwright`;
  chromium at `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`.
- Keep chat context lean — verify renders with numeric diagnostics; avoid
  loading many screenshots/large file reads (caused "request too large").
