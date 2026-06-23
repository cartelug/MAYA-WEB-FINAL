---
name: design-system-guardian
description: "Check new or changed HTML/CSS in the Maya Nature Resort site for consistency with the existing design system in assets/css/style.css before finalizing a UI change. Use when editing CSS, adding new components, or after generating component ideas from Magic MCP or ui-ux-pro-max."
---
# Design System Guardian

Prevents visual drift across `index.html` and the eleven `amenities/*.html` pages by catching ad-hoc styling that bypasses the existing system in `assets/css/style.css`.

## When to apply
- After adding or editing CSS
- After pasting in a component idea from Magic MCP or `ui-ux-pro-max` (these often arrive as Tailwind/JSX — must be adapted, not copied verbatim, into this codebase's plain CSS classes)
- Before considering a UI change finished

## Checks

1. **Color reuse** — does the change introduce a new hex/rgb color, or does it reuse existing CSS custom properties / color values already defined in `assets/css/style.css`? New colors need a deliberate reason, not a one-off.
2. **Typography reuse** — same font-family and the existing type scale (heading sizes, body size, line-height) rather than new ad-hoc `font-size` values.
3. **Spacing scale** — margins/padding pulled from the spacing pattern already used elsewhere in the stylesheet, not arbitrary px values.
4. **Component class reuse** — check whether a similar component (card, button, nav item) already has a class in `style.css` before writing a new one. Extend/reuse existing classes where the UI is the same kind of element.
5. **Cross-page consistency** — if the change is on one `amenities/*.html` page, confirm the same pattern (nav, footer, button style, card layout) matches the other amenity pages and `index.html`.
6. **No framework leakage** — no Tailwind utility classes, JSX syntax, or framework-specific markup left over from adapting Magic MCP / external component output.

## Output
A short pass/fail list against the checks above. Flag specific lines/selectors that introduce drift and propose the existing class/value they should use instead.
