---
name: ui-polish-pass
description: "Final visual QA pass on Maya Nature Resort pages (hover states, spacing, icon consistency, responsiveness) before calling a UI change done. Use after implementing a UI change and before reporting it complete."
---
# UI Polish Pass

A final-mile check applied right before a UI change is reported as finished — catches the small things that make a page look unfinished even when the layout is functionally correct.

## When to apply
After implementing any visible change to `index.html`, `amenities/*.html`, or `assets/css/style.css` — run this before telling the user the work is done.

## Checklist

### Interaction
- [ ] All clickable elements (cards, buttons, nav links) have `cursor: pointer`
- [ ] Hover states give clear visual feedback (color/shadow/border change) without shifting layout (avoid hover `scale` that reflows neighbors)
- [ ] Transitions are smooth: 150-300ms, not instant and not sluggish

### Icons & imagery
- [ ] Icons are SVG (matches existing `assets/images/*.svg`), not emoji
- [ ] Consistent icon sizing/viewBox across the page
- [ ] Images have sensible `alt` text and don't distort aspect ratio

### Spacing & layout
- [ ] Consistent spacing rhythm with the rest of the site (compare against an existing `amenities/*.html` page)
- [ ] No content hidden behind the fixed/floating nav
- [ ] No horizontal scroll at 375px width

### Responsiveness
- [ ] Check at 375px, 768px, 1024px, 1440px
- [ ] Text remains at least 16px on mobile body copy
- [ ] Touch targets at least 44x44px on mobile

### Cross-page consistency
- [ ] New/changed page matches the nav, footer, and button styling used elsewhere in the site (see [[design-system-guardian]])

## Output
Report which checklist items were verified and any that still need a fix, rather than a blanket "looks good."
