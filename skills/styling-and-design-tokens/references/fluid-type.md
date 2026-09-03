# Fluid Type and Spacing — why

The rules are in the `styling-and-design-tokens` Ruleset (`fluid-type` group).

- **`clamp()` over stepped breakpoints.** Setting `font-size` at three breakpoints gives three jumps
  and three rules to maintain. `clamp(min, preferred, max)` scales smoothly between a floor and a
  ceiling with one declaration, driven off the viewport or a container.
- **`rem`, never `px`, for type.** A `px` font size ignores the reader who set their browser to
  20px. `rem` respects it. Spacing can be `rem` (fixed to root) or `em` (scales with local text).
- **Unitless `line-height`.** `line-height: 1.5` inherits as a ratio, so a child with a larger font
  gets proportional leading. `line-height: 24px` inherits the fixed value and crowds larger text.
- **Floor at ~16px, measure near 66ch.** The `clamp()` minimum must not resolve below about 16px
  for body text, or small screens get unreadable text. Capping line length with `max-width` in `ch`
  keeps lines in the comfortable 45–75 character range.
- **Keep a `rem` term in the expression.** Browser zoom and the user's font-size setting scale
  `rem`; they do not change `vw`. A preferred value that is pure `vw` therefore ignores both, and
  the text never reaches 200% (WCAG 1.4.4, resize text). A `rem` addend keeps the user's setting in
  the sum — the requirement itself is in `accessibility`, perceivable.

```css
/* ❌ px font size, stepped at breakpoints, fixed line-height, no measure cap */
.prose { font-size: 16px; line-height: 24px; }
@media (min-width: 60rem) { .prose { font-size: 20px; } }

/* ✅ fluid rem-based scale, unitless leading, capped measure */
:root { --font-size-body: clamp(1rem, 0.92rem + 0.4vw, 1.25rem); }
.prose {
  font-size: var(--font-size-body);
  line-height: 1.6;
  max-inline-size: 66ch;
}
```
