# Styling and Design Tokens — Worked Example: A Review Pass

A full pass in the skill's Output Format. Findings cite the Ruleset topic they fail.

Input diff:

```css
/* price-card.module.css — proposed in a pull request */
1   .card {
2     background: #ffffff;
3     color: #1f2933;
4     padding: 20px;
5     border-radius: 8px;
6     width: 360px;
7     box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
8     z-index: 9999;
9   }
10
11  [data-theme="dark"] .card { background: #1f2933; color: #ffffff; }
12
13  .card .title { font-size: 22px; line-height: 28px; margin-left: 12px; }
14
15  @media (min-width: 768px) {
16    .card { width: 480px; }
17  }
```

Output:

```
must-fix · architecture · price-card.module.css:1 — component rules are unlayered. Wrap them in `@layer components` with the layer order declared once at the top of the CSS entry.
must-fix · architecture · price-card.module.css:7 — `!important` on the shadow with no override reason. Remove it and let layer order decide.
must-fix · architecture · price-card.module.css:13 — `.card .title` is a descendant chain. Use a single scoped class, `.title` or `.card__title`.
must-fix · tokens · price-card.module.css:2 — raw `#ffffff` for the surface. Read a semantic token: `background: var(--color-surface)`.
must-fix · tokens · price-card.module.css:4 — raw `20px` padding. Use a spacing-scale token: `padding: var(--space-5)`.
must-fix · tokens · price-card.module.css:8 — `z-index: 9999` is ad-hoc. Add `--z-card` to the z-index scale and use `z-index: var(--z-card)`.
must-fix · theming · price-card.module.css:11 — the component branches on `[data-theme="dark"]`. Redefine `--color-surface` / `--color-text` on the theme scope and keep `.card` theme-agnostic.
must-fix · responsive-layout · price-card.module.css:6 — fixed `width: 360px`. Use `max-inline-size: 22rem` with `width: 100%`.
must-fix · container-queries · price-card.module.css:15 — the card resizes on a viewport media query, so it is wrong in a narrow column on a wide screen. Give the slot `container-type: inline-size` and switch to `@container`.
must-fix · fluid-type · price-card.module.css:13 — `font-size: 22px` with `line-height: 28px`. Use a `rem`-based `clamp()` token and a unitless `line-height`.
consider · responsive-layout · price-card.module.css:13 — `margin-left` is physical. Use `margin-inline-start`, or `gap` on the parent.
```
