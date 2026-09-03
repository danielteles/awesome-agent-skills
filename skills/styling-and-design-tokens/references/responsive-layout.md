# Responsive Layout — why

The rules are in the `styling-and-design-tokens` Ruleset (`responsive-layout` group).

- **Intrinsic over breakpoint-driven.** A grid of `repeat(auto-fit, minmax(16rem, 1fr))` re-columns
  itself at every width with no media query. Breakpoints chosen from a device list (`768px`,
  `1024px`) are wrong the moment the component is placed in a narrower column or the user zooms;
  breakpoints chosen from where *this layout* actually breaks are stable.
- **No fixed pixel containers.** `width: 320px` cannot shrink on a small screen and cannot grow with
  the user's font size. `max-width` in `rem` or `ch` plus `width: 100%` adapts both ways.
- **`gap`, not child margins.** Margins collapse, leak past the first and last child, and need
  `:last-child` resets. `gap` spaces only *between* items and is one declaration on the container.
- **Logical properties.** `margin-inline-start` is "start" in every writing direction;
  `margin-left` is always the physical left, so an RTL locale needs a mirrored override for every
  physical property.
- **Few, em-based min-width queries.** `min-width` in `em` scales the breakpoint with the root font
  size; a handful of them, named for the layout, beats one per device.

```css
/* ❌ fixed widths, device breakpoints, physical margins, child margin for spacing */
.grid { display: flex; }
.grid > * { width: 300px; margin-left: 16px; }
@media (max-width: 768px) { .grid > * { width: 100%; } }

/* ✅ intrinsic grid, gap, logical + token values */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
  gap: var(--space-4);
  padding-inline: var(--space-4);
}
```
