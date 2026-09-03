# Container Queries — why

The rules are in the `styling-and-design-tokens` Ruleset (`container-queries` group).

- **A component does not know the viewport.** The same card sits in a full-width hero, a
  three-column grid, and a narrow sidebar. A `@media (min-width: 700px)` rule switches it to its
  wide layout based on the *window*, so it goes wide in the sidebar on a large screen and stays
  narrow in the hero on a small one. `@container` asks about the space the card was actually given.
- **The wrapper opts in.** `container-type: inline-size` on the parent makes it a query container
  for its width. `container-type: size` also needs an explicit height or the child collapses;
  `inline-size` is the common, safe choice.
- **Name the container.** With nested containers, an unnamed `@container` queries the nearest
  ancestor — which can change when someone adds `container-type` higher up. `container-name` plus
  `@container card (...)` pins the query.
- **Container units.** `cqi` is 1% of the container's inline size — use it where a value should
  track the container (padding that grows with the card), not `vw` which tracks the window.
- **Containment has side effects.** Declaring a container establishes layout containment; check the
  component still lays out as expected before shipping it.

```css
/* ❌ component adapts to the window, so it is wrong in a narrow column on a wide screen */
@media (min-width: 45rem) {
  .media-card { grid-template-columns: 12rem 1fr; }
}

/* ✅ wrapper is a named container; the card responds to its own width */
.card-slot { container: card / inline-size; }

.media-card { display: grid; gap: var(--space-3); }
@container card (min-width: 30rem) {
  .media-card { grid-template-columns: 12rem 1fr; }
}
```
