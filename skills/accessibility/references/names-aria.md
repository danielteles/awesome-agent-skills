# Accessible Names, Roles, and ARIA — why

The rules are in the `accessibility` Ruleset (`names-aria` group). This file is the reasoning and
the finer criteria.

- **Every interactive element has an accessible name** — visible text, `aria-label`, or `aria-labelledby`. Without one, an icon-only button is announced as just "button" (WCAG 4.1.2). When the visible label is text, the accessible name must *contain* that text, because voice-control users speak the visible word (WCAG 2.5.3).
- **Link and button text makes sense out of context.** A screen-reader user pulls up a list of links with no surrounding prose, so "click here" / "read more" / "learn more" is useless (WCAG 2.4.4).
- **Do not override a native role, or add a role an element already has.** `<button role="button">` is noise; `<div role="button">` still owes you every keyboard handler `<button>` gives for free.
- **Keep ARIA state in sync with the UI** — `aria-expanded`, `aria-selected`, `aria-checked`, `aria-pressed`, `aria-disabled`. A stale state attribute lies to the screen reader.
- **A custom widget follows its ARIA APG pattern** — menu, combobox, tabs, disclosure, slider — its roles *and* its keyboard interaction. Half a pattern is worse than none; it sets an expectation it then breaks.
- **A modal dialog** is `role="dialog"` (or the native `<dialog>` with `showModal()`), `aria-modal="true"`, and `aria-labelledby` its heading; Esc closes it; everything behind it is `inert`. Without `aria-modal` or `inert`, a screen reader still reads the page behind it.
- **Hiding, precisely:** `hidden` / `display: none` remove an element from everyone; `aria-hidden="true"` hides it from assistive technology only; `inert` removes focus, interaction, and AT for a whole subtree. **Never put a focusable element inside an `aria-hidden` subtree** — it stays keyboard-reachable but invisible to the screen reader. Use `inert` for the background behind a modal or an off-screen drawer.
