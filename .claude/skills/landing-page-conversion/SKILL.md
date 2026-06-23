---
name: landing-page-conversion
description: "Review the Maya Nature Resort home page (index.html) for conversion-oriented structure: hero clarity, CTA placement, trust signals, booking visibility. Use when the user asks to improve bookings, conversions, or the effectiveness of the home page or an amenities landing section."
---
# Landing Page Conversion Review

Reviews `index.html` (and amenity pages acting as mini-landing pages) for whether the structure actually drives the desired action — booking a stay or inquiring — not just whether it looks good.

## When to apply
- User asks to improve bookings/conversions/inquiries
- Reviewing `index.html` or an `amenities/*.html` page as an entry point for visitors
- After a redesign, before calling it done

## Checklist

### Hero
- [ ] Within the first screen, a visitor understands: what is this place, where is it, and what can they do here (book / explore)
- [ ] A clear primary call-to-action is visible without scrolling (e.g. "Book Now" / "Check Availability")
- [ ] Hero imagery supports the nature-resort positioning, not generic stock-photo feel

### Structure (use `ui-ux-pro-max`'s `landing` domain for patterns)
- [ ] Logical flow: hero → key amenities/experiences → social proof/trust → secondary CTA → footer with contact/location
- [ ] Amenities are scannable (cards/icons) and link to their dedicated `amenities/*.html` page
- [ ] Trust signals present where relevant: reviews/testimonials, certifications, location/map, contact info

### Calls to action
- [ ] Primary CTA repeated at a sensible second point (not just once at the very top)
- [ ] CTA copy is specific ("Check Availability", "Book Your Stay") rather than generic ("Click Here", "Submit")
- [ ] CTA buttons are visually distinct from secondary links (see [[design-system-guardian]] for consistent styling)

### Friction
- [ ] No dead-end pages — every amenity page links back to booking/contact
- [ ] Menu PDFs (`assets/pdf/*.pdf`) and other resources are easy to find, not buried
- [ ] Mobile flow doesn't require excessive scrolling/zooming to find the CTA

## Output
Identify specific sections that help or hurt conversion, and propose concrete structural changes (ordering, CTA placement/copy) rather than purely cosmetic feedback.
