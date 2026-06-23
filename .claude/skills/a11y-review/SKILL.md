---
name: a11y-review
description: "Accessibility audit for Maya Nature Resort static HTML pages (alt text, labels, contrast, focus states, heading order, keyboard nav). Use when reviewing or finishing changes to index.html or amenities/*.html, or when the user asks for an accessibility check."
---
# Accessibility Review

A static-HTML-specific accessibility pass for `index.html` and the `amenities/*.html` pages. No build tooling/JS framework available here, so checks are manual against the markup and `assets/css/style.css`.

## When to apply
- After adding/editing markup on any page
- When the user explicitly asks for an accessibility check
- As part of finishing a larger UI change (alongside [[ui-polish-pass]])

## Checklist

### Structure
- [ ] One `<h1>` per page; heading levels don't skip (h2 → h3, not h2 → h4)
- [ ] Landmarks used appropriately (`<nav>`, `<main>`, `<footer>`)
- [ ] Page `<title>` and `lang="en"` (or correct locale) set

### Images & media
- [ ] Every meaningful `<img>` has descriptive `alt` text; decorative images use `alt=""`
- [ ] SVG icons used as buttons/links have an accessible name (`aria-label` or visually-hidden text)

### Forms (e.g. contact/booking inputs)
- [ ] Every input has an associated `<label for="...">`
- [ ] Error/validation feedback is programmatically associated with its field, not color-only

### Interaction & keyboard
- [ ] All interactive elements reachable via Tab in a logical order matching visual layout
- [ ] Visible focus ring on links/buttons (not suppressed via `outline: none` without a replacement)
- [ ] Icon-only buttons/links have `aria-label`

### Color & contrast
- [ ] Body text meets 4.5:1 contrast against its background
- [ ] Color is never the only signal (e.g. a "selected" amenity state also has a non-color indicator)

### Motion
- [ ] Animations/transitions respect `prefers-reduced-motion`

## Output
List concrete violations with file/line, not a general impression. Where `ui-ux-pro-max`'s accessibility data (contrast ratios, ARIA patterns) is useful, cross-check against it.
