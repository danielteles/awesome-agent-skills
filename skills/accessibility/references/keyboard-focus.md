# Keyboard and Focus — why

The rules are in the `accessibility` Ruleset (`keyboard-focus` group).

- **Everything works by keyboard alone, and no step traps focus.** Many users never use a pointer (WCAG 2.1.1, 2.1.2).
- **Tab order follows reading order.** No positive `tabindex` — it fights the DOM and drifts out of sync; `tabindex="0"` adds an element to the order,
  `tabindex="-1"` marks a programmatic focus target only. Keep **DOM order equal to visual order** — CSS `order`, grid placement, or absolute positioning that
  tab and reading order cannot follow desyncs them (WCAG 2.4.3, 1.3.2).
- **Every path-based gesture and every drag has a single-pointer alternative** — a tap, a button, a menu. A path gesture is impossible for many motor-impaired
  and switch users (WCAG 2.5.1, 2.5.7).
- **Every time limit warns before it expires** and lets the user extend or turn it off (WCAG 2.2.1).
- **A visible focus indicator**, at 3:1 contrast, styled with `:focus-visible` (so a mouse click does not paint a ring but keyboard focus does) — this removes
  the usual reason a developer reaches for `outline: none`, which must otherwise have an equal-or-better replacement. A **sticky header or footer must not cover
  the focused element** (WCAG 2.4.7, 1.4.11, 2.4.11).
- **A "skip to main content" link** is the first focusable element, visually hidden until focused — not `display: none`, which drops it from the tab order (WCAG
  2.4.1).
- **Focus management the router does not do:** on a client-side route change, move focus to the new view (its `<h1>`, or a container with `tabindex="-1"`); on
  opening a dialog, move focus in and trap it; on closing, return focus to the trigger. Without it the user is stranded at the old location.
- **A composite widget** (grid, listbox, toolbar, tab list) uses roving `tabindex` or `aria-activedescendant`: one tab stop, arrow keys within. Tabbing through
  fifty cells is unusable.
- **An interactive target is at least 24×24 CSS px**, or has 24 px of clear spacing — a small target fails motor-impaired and touch users (WCAG 2.5.8).
