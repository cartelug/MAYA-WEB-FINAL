# Maya Nature Resort — Project Rules

## Stack
- This project must remain **vanilla HTML, CSS, and JavaScript**.
- Do **not** convert to React, Next.js, Tailwind, Astro, or any framework without explicit approval.

## Design workflow
- Use the `ui-ux-pro-max` skill for design system direction (styles, palettes, typography, UX rules) before making UI changes.
- Use Magic MCP (`@21st-dev/magic`) for component ideas/inspiration when useful.
- Adapt any Magic MCP or skill output into this existing vanilla HTML/CSS/JS codebase — do not paste in framework-specific (JSX, Vue SFC, Tailwind-only) markup as-is.

### Project skills (`.claude/skills/`)
- `ui-ux-pro-max` — design system database (styles, colors, typography, UX rules)
- `design-brief` — scope a UI task before building
- `design-system-guardian` — check new HTML/CSS against existing conventions in `assets/css/style.css`
- `ui-polish-pass` — final visual QA before calling a UI change done
- `a11y-review` — accessibility audit for static HTML pages
- `landing-page-conversion` — review `index.html`/amenity pages for booking conversion

## Process
- After every build, update the Maya Nature Resort Notion project log if Notion MCP access is available.
- Test changes on GitHub Pages first. Only move final files to DreamHost after explicit approval.
