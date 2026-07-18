# Maya Nature Resort — website content update (v46, 18 July 2026)

Implemented from the **Maya-Nature-Resort-Update-Package** (18 July 2026) against the
current 2026 static build (`style.css?v=20260712a` baseline, now `?v=20260718a`).
Owner-confirmed facts follow `SOURCE-OF-TRUTH-AND-PENDING-DATA.md`; nothing was guessed —
open questions are in `UNRESOLVED.md`.

## New page

- **`conference-hall.html`** — standalone top-level Conference Hall page.
  Venue name **Bulangiti Hall** retained inside the page; capacity **up to 2,000 guests**
  (current-website figure; the external 3,000 figure was not imported). Own hero, stat
  strip, feature block (moved from Events), six "what we host" cards (conferences,
  seminars/trainings, AGMs, corporate functions, graduations, indoor receptions), a
  secondary cross-link to Events, dedicated WhatsApp enquiry actions, unique
  title/description/canonical/OG and EventVenue JSON-LD.

## Navigation & structure (all 22 pages)

- "Conference Hall" added to desktop nav (after Rooms), mobile menu (new gold
  `assets/images/nav/conference.png/.webp` tile drawn in the site's Knockout face),
  and the footer Explore column. 404.html patched with absolute-path variants.
- Home: highlights grid expanded to six cards — Rooms, **Conference Hall**, Events
  (open-grounds photo), Experiences (real pool-terrace photo), Dining, **Directions**
  (real road photo). Pillar copy updated so hall enquiries route to the hall page.
- Home gallery strip: hall tile relabelled **Conference Hall** (was "Weddings").
- CSS/JS version bumped to `?v=20260718a`.

## Events page

- Bulangiti Hall hero mention, feature section, hall stat and Conferences card
  **moved out** (not duplicated). Events now focuses on Oasis Gardens — weddings,
  introductions/kwanjula, graduations, birthdays/showers, retreats — keeping the
  current "up to 10,000 guests across multiple zones" wording. One secondary
  "View the Conference Hall" cross-link card remains. Meta/OG/JSON-LD updated to the
  garden venue (image now the swan-pond garden photo, capacity 10,000).

## Rooms & accommodation

- Six existing room cards, image pairings and UGX rates **unchanged** (approved baseline).
- New "**The buildings you'll see**" section with the owner-confirmed labels:
  **Mitala Cottages** (red cottages exterior), **Mitala Apartments** (flats exterior),
  **Pool View Hotel** (construction photo, explicitly labelled in progress — never used
  as a marketing hero). No room types/rates were attached to buildings (unconfirmed).
- New "**A look inside**" supplementary gallery with the four unmapped interiors and
  neutral captions only (`.interior-grid` CSS added).
- Schema `Msizi Family Cottages` aligned to the visible label `Family Cottages`.
- Owner-supplied Luxury/Premium/Mitala rates were **not published** (no confirmed mapping).

## Directions

- Hero now the real approach road (`road-valley-curve`), replacing the sports-field photo.
- New "**The drive in**" photo sequence: Maya sign at the turn → forest climb → scenic
  descent (near-duplicate frames excluded).
- The provisional coordinate `0.266389,32.435833` **removed everywhere** — map embed,
  Google/Apple/Waze/geo links now use a destination-name search; `MAYA_PLACE` set to
  `confirmed:false, lat/lng:null` (main.js then keeps GPS/Plus-Code chips as
  "WhatsApp us for the exact pin" with copy buttons hidden). Also removed the
  unverified `geo` block from the home-page JSON-LD. og:image now the real road.
- Driver text retained: "Maya Nature Resort, Sun Hill, off Kampala–Masaka Road, Maya".

## Menu

- Licensed replacements (Pexels, credits in `docs/photo-originals-2026-07-18/…/SOURCES.md`),
  new filenames so caches can't serve stale art; alt text per SOURCES.md and **without**
  "at Maya Nature Resort" claims: Full English Breakfast, Buffet Packages, Burgers
  (real burger replaces the sandwich shot), Indian Corner, Pizza Corner.
- **Chinese Wok — UGX 40,000** moved from Burgers to Main Course, name/description/price
  untouched.
- Old stock files (`breakfast.jpg`, `buffet-rice.jpg`, `burgers.jpg`, `indian-corner.jpg`,
  `pizza.jpg`) deleted; no stale references remain.
- Questionable menu wording left as-is and logged in `UNRESOLVED.md`.

## Facilities & experiences

- **Gym**: both real gym photos in use (hero + feature on the gym page, home amenity card).
- **Sauna**: real timber-sauna interior on the sauna page + home card.
- **Pool**: `pool-terrace-valley` (completed look) as the pool page hero/feature and
  the home Experiences card; construction-visible pool views excluded from primary spots.
- **Zip-lining**: sports-field image removed from the page (high-ropes photo only).
- **Nature walks**: real trail photo as hero + feature.
- **BBQ**: charcoal-grill photo (licensed) replaces the breakfast-terrace image.
- Directions og:image no longer the sports field.
- No new operational claims (schedules, limits, certifications) were added.

## Gallery

- Curated **99 → 78** entries: exact duplicate g006 (=g004) removed; near-duplicate
  bouncy-castle/fountain/flower/pool/room/building frames trimmed; mislabelled
  "approach road" (g099, actually parking) and "grounds from above" (g098) removed.
- New honest categories: Rooms & Accommodation · **Conference Hall** · Events & Weddings ·
  Gardens & Grounds · Dining & Bar · Pool & Amenities · Nature & Experiences ·
  **Directions & Arrival** (Conference Hall and Events are separate filters).
- Animal sculptures moved out of Wildlife into Gardens & Grounds with honest captions.
- 16 strongest new photos added (Mitala exteriors, two interiors, open event grounds,
  Maya meal table, pool terrace, butterfly seat, gym, sauna, trail, flowers, road/sign set).
- Removed entries' image files retained on disk for future reuse.

## SEO, redirects & privacy

- Canonical host unified to **`https://www.mayanatureresort.com`** across canonicals,
  OG URLs/images, JSON-LD, sitemap and robots (96 replacements).
- **`.htaccess`** (Apache/DreamHost — the active mechanism for this host):
  one-hop 301s for legacy WordPress routes (`/accommodation/`, `/contacts/`,
  `/reservation/`, `/gallery/`, `/about-us/`, `/our-services/`, `/play-ground/`,
  `/the-ropes-bar-and-restaurant/`, `/project/*`) with absolute `www` targets, a
  single-hop HTTP/bare-domain → `https://www` canonical redirect, custom 404,
  directory-listing off, and a guard that 404s `/docs` and `/.claude` if ever uploaded.
- Sitemap: `conference-hall.html` added, all `lastmod` set to 2026-07-18 (21 URLs).
- Hard-coded TripAdvisor "4.0 / 5 … ranked among Kampala's traveller favourites"
  replaced with a neutral "Read current guest reviews on TripAdvisor" link.
- Privacy page: accurate third-party disclosure (Google Maps embed, WhatsApp,
  navigation apps, social links) — no absolute "no cookies" guarantee retained.

## Image engineering

- 31 supplied originals archived unchanged in `docs/photo-originals-2026-07-18/`.
- Web derivatives (JPEG, progressive, quality 80–82, ~675–1400 px per placement,
  lowercase-hyphenated names) in `assets/images/{accommodation,directions,rooms,resort,menu}`.
- Manual `object-position` set where crops matter (signs, buildings, roads).
