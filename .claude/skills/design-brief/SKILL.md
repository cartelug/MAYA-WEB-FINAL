---
name: design-brief
description: "Produce a short design brief before starting UI/UX work on the Maya Nature Resort site (vanilla HTML/CSS/JS). Use when the user asks to design, redesign, build, or add a new page or section, before writing any markup or CSS."
---
# Design Brief

A quick scoping pass to run **before** any UI implementation, so design decisions are made deliberately instead of improvised mid-build.

## When to apply
- New page or section (e.g. a new `amenities/*.html` page)
- Redesign of an existing section
- Any task where the user hasn't already specified exact visual direction

## Steps

1. **State the goal in one sentence** — what is this page/section for, and what should a visitor do on it (book a room, learn about an amenity, contact the resort)?
2. **Identify the audience** — prospective guests browsing on mobile vs. desktop, likely arriving from search or social media.
3. **Pull design direction from `ui-ux-pro-max`** — run its design-system search (style/color/typography/landing domains) using keywords like "nature resort", "eco lodge", "wellness", "outdoor hospitality" so new work stays visually consistent with a nature-resort brand, not generic SaaS defaults.
4. **Check existing conventions** — read `assets/css/style.css` for the colors, font stack, spacing scale, and component classes already in use. New work should reuse these, not invent parallel ones (see [[design-system-guardian]]).
5. **List constraints** — vanilla HTML/CSS/JS only (no framework), must work as a static file on GitHub Pages, must match the existing nav/footer pattern used across `index.html` and `amenities/*.html`.
6. **Write a 3-5 line brief** covering: purpose, audience, key content blocks, visual direction (style/colors/type from step 3), and any constraints — then proceed to implementation.

## Output
A short brief (not a long document) shared with the user before or alongside the first implementation pass — enough to sanity-check direction, not a deliverable in itself.
