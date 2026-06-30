# Maya Nature Resort — session handoff

> Carry-over notes so a new chat can continue seamlessly. Branch from the tip of
> `claude/friendly-gates-fx05kl`.

## Branch / push rules
- Develop on **`claude/friendly-gates-fx05kl`**.
- Push every change to **both** `claude/friendly-gates-fx05kl` **and** `main`.
- Stack is **vanilla HTML/CSS/JS only** (no frameworks) — see `CLAUDE.md`.

## ✅ DONE LAST — mobile room cards redesigned (neat stacked card)
User feedback: the mobile cards were "disorganized" — make them neat, match the
PC version's polish. Fixed (pure CSS, scoped to mobile; **desktop untouched**).

**Root cause of the mess:** a legacy `@media (max-width:680px)` block forced
`.room-grid` to **2 columns with `!important`** all the way down to 420px, so the
tall cinematic cards were crammed two-up on phones (and the ≤560px card tweaks
were fighting that). Removed it → the room grid now follows the global `.grid-3`
rule (**single column ≤680px**). Its dead `.card-media/.room-card/.room-spec`
child rules were removed too (only `.btn-wa-card` rules kept in that block).

**New mobile card** — in `assets/css/style.css`, the `ROOMS — flagship…` block,
now `@media (max-width: 680px)` (was 560px). Same `.rcard` markup re-flows into a
**stacked** layout: cinematic photo on top (`.rc-ph` → `position:relative;
aspect-ratio:16/10`, keeps `.rc-idx` + `.rc-seal` + a soft grade; grain/vignette/
frame hidden on mobile), then a **solid** info panel (`.rcard .rc-glass`,
`#0c1712`, in-flow) below: kicker, Marcellus title + static gold underline, 16px
Cormorant italic tagline (no clamp), all 3 spec chips wrapping, gold Reserve
(≥50px) + round call (50px) buttons, 10px gap.
Verified headless 360–768px: 1 column, no horizontal scroll, panel sits below the
photo, 3 chips visible, touch targets ≥44px. Tablet/desktop overlay (≥681px) and
the ≤760px perf block are unchanged.

## 🔎 COMPLETION AUDIT (done) — site is ~89% build-ready
Full 20-page audit run (multi-agent). Headline **89%** build-readiness; launch
acceptance checklist ~75%. Strengths: all pages real content, zero broken links,
correct contact details, working WhatsApp deep-link "form", full inline menu,
mature JS, solid SEO/a11y base, no horizontal overflow anywhere.

### ✅ Fixed this batch (no-input items — pushed)
- **P0 inclusion line**: exact "Includes access to swimming pool, gym, sauna and
  breakfast" now on rooms (×2), index, and all 11 amenity pages (new
  `.stay-includes` callout before `</main>`).
- **P0 WCAG contrast**: added `--gold-ink #806011`; heading `<em>` accents +
  `.menu-cat-kicker` now use it on light bgs (bright `--gold-2` kept on dark
  heroes). Verified headless: 50 accent els checked, 0 failures.
- **SEO**: index now has canonical + Resort JSON-LD; menu has canonical +
  absolute og:image + og:url + twitter:card; all 11 amenity pages → absolute
  og:image + og:url.
- **a11y**: removed the stray `aria-current="page"` (wrongly on Experiences) from
  all 11 amenity pages.
- **copy**: menu.html "tradition"→"traditional" typo.

### ⏳ STILL LEFT (next)
- **Needs client input**: GA4 measurement ID (analytics absent); real
  Instagram/Facebook/TikTok URLs (currently bare-domain placeholders); exact map
  lat/lng or Place ID (directions + contact use a name-query); real menu PDFs
  (current food/drink PDFs are ~680-byte stubs); confirm/soften the rooms
  "Five-star guest rating" claim + verify pool "lifeguard on duty".
- **No-input P2/P3 not yet done**: compress heavy menu JPEGs (indian-corner
  639KB, shakes 660KB, salads 487KB, cocktails 493KB) + add webp; contact-form
  a11y (aria-invalid/inline errors/aria-live); gallery lightbox focus trap;
  amenity footer consistency (+directions/contact links, ?text= prefill); web
  app manifest; verify index JSON-LD address/geo once coords arrive.
- **Photography** (deferred): rooms/*.jpg are ~20KB placeholders; amenity heroes
  reuse 3 stand-ins (pool page shows a garden hill, etc.). Shot list in chat.

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
