# Design Tokens — why

The rules are in the `styling-and-design-tokens` Ruleset (`tokens` group).

| Tier | Example | Who reads it |
|---|---|---|
| Primitive | `--blue-600: #2563eb;` `--space-4: 1rem;` | Semantic tokens only. |
| Semantic | `--color-action: var(--blue-600);` `--space-inline-sm: var(--space-2);` | Components, and component tokens. |
| Component | `--button-bg: var(--color-action);` | That component's rules. |

- **Why three tiers.** A component that reads `--blue-600` is coupled to a value; changing the brand
  means a find-and-replace across the codebase. Reading `--color-action` means the brand changes in
  one primitive. The component tier lets one component re-skin without touching the semantic layer.
- **No raw literals.** A `#3b82f6` or `14px` in a component is a value that exists nowhere else and
  will drift from its siblings. Every visual value traces to a scale. `0`, `1px`, `100%`, and `50%`
  are structural, not design decisions, so they stay.
- **Custom properties as the carrier.** They cascade, they theme by scope, and they are readable at
  runtime — a Sass variable is none of those. A token *build* source (Style Dictionary) can still be
  the origin; it generates the custom properties.
- **Name by role.** `--color-red` cannot become blue; `--color-danger` can. The name says what the
  token is *for*, so a theme or rebrand stays coherent.
- **Scales, including z-index.** Spacing, type, radius, and stacking each come from a short named
  scale. An ad-hoc `z-index: 9999` has no relation to the modal at `999` or the toast at `10000` and
  the stack becomes guesswork.

```css
/* ❌ raw values, primitive read in a component, magic z-index */
.toast { background: #22c55e; padding: 12px 16px; border-radius: 6px; z-index: 9999; }

/* ✅ semantic + component tokens from scales */
.toast {
  background: var(--color-success-surface);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  z-index: var(--z-toast);
}
```
