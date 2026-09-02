# Testing — why

The rules are in the `accessibility` Ruleset (`testing` group). This file is the reasoning.

- **Automated checks in CI** — `axe-core` (Playwright or Jest integration), `eslint-plugin-jsx-a11y` for React, the `angular-eslint` template accessibility rules for Angular. They are cheap and catch roughly a third of issues before review, but no more than a third.
- **A keyboard pass on every critical path** — Tab, Shift+Tab, Enter, Space, arrows, Esc. A linter cannot fully verify keyboard operability or focus order.
- **A screen-reader pass on the critical flows** — NVDA or JAWS with Chrome, and VoiceOver with Safari; these are the pairings real users run (WebAIM Screen Reader Survey). Test a widget in *both* browse mode and forms/focus mode — it can work in one and fail in the other.
- **Test at 400% browser zoom and with the OS text size increased**, not only at 200% — 400% at a 1280 px viewport is the reflow target, and OS scaling exposes different breakage (WCAG 1.4.10).
- **In unit tests, query by role and accessible name** — `getByRole('button', { name: 'Save' })`. A test that cannot is often flagging the bug; it then depends on the same tree the screen reader uses.
- **Check color contrast once in the design system**, not per feature — fixing the tokens fixes every screen at once.
- **Build a custom widget on an accessible primitive** — Radix, React Aria, or the Angular CDK — rather than deriving combobox or dialog semantics from scratch; those libraries implement the APG patterns and their edge cases.
