# Theming and Dark Mode — why

The rules are in the `styling-and-design-tokens` Ruleset (`theming` group). This file is the
reasoning and `❌ / ✅` examples — it adds no rule the Ruleset does not state.

- **A theme is a set of token values.** If component rules carry `[data-theme="dark"] &` branches,
  every new component has to remember to add them and every theme multiplies the CSS. Redefine the
  semantic tokens on a theme scope and every component that reads them is themed for free.
- **`color-scheme`.** It tells the browser to render form controls, scrollbars, the caret, and the
  default canvas in light or dark. Without it, a dark page still has white `<select>` menus and a
  white scrollbar gutter.
- **Auto plus override.** `prefers-color-scheme` is the default; users also need an explicit toggle
  that sticks. An attribute on `<html>` that a small script sets from storage, with matching
  `:root[data-theme="dark"]` / `[data-theme="light"]` blocks, lets the choice win over the OS in
  both directions.
- **No flash.** If the theme is applied by React after hydration, the first paint is the wrong
  theme and it visibly flips. Set the attribute in a blocking inline script in `<head>`, or from the
  server.
- **Forced colors.** Windows High Contrast / `forced-colors: active` replaces your palette with the
  user's. Meaning carried only by a `background-image` or a custom shadow disappears; test it and
  use `forced-color-adjust` only where you must opt out. The thresholds and required behavior are in
  `accessibility`, perceivable.

```css
/* ❌ component branches on the theme; controls stay light; palette hard-coded */
.card { background: #fff; color: #111; }
[data-theme="dark"] .card { background: #111; color: #fff; }

/* ✅ tokens redefined on the scope; component rule is theme-agnostic */
:root { color-scheme: light; --color-surface: var(--white); --color-text: var(--gray-900); }
:root[data-theme="dark"] { color-scheme: dark; --color-surface: var(--gray-900); --color-text: var(--gray-50); }
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) { color-scheme: dark; --color-surface: var(--gray-900); --color-text: var(--gray-50); }
}

.card { background: var(--color-surface); color: var(--color-text); }
```
