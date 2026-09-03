# CSS Architecture — why

The rules are in the `styling-and-design-tokens` Ruleset (`architecture` group).

- **Cascade layers.** `@layer` makes the winning rule a function of *layer order*, not selector
  specificity or source order. Declaring the order once at the top means a later, more specific
  selector in `components` can never accidentally beat a `utilities` class, and third-party CSS
  imported into its own layer cannot outrank yours. Unlayered styles beat every layer, so keep them
  for the rare deliberate final override.
- **Flat specificity.** Every jump in specificity is a future override war. One class per rule keeps
  every rule at the same weight, so order and layers decide the winner and any rule can be
  overridden by one more class.
- **`!important` is a smell.** It escapes the cascade entirely; the next person needs a second
  `!important` to win. The only defensible uses are a single-purpose utility (`.sr-only`) and
  neutralising a library that ships `!important` itself — both commented.
- **Scoping.** A bare `h2` or `.title` selector in a component file leaks into every other
  component. Module scoping, `@scope`, shadow DOM, or framework scoped styles keep a component's
  rules to that component.
- **One reset, colocated styles.** Multiple resets fight; a global "misc" stylesheet becomes a
  dumping ground no one dares delete. The reset lives once in the `reset` layer; component styles
  live with the component.

```css
/* ❌ id + descendant chain + !important — unoverridable without escalating */
#sidebar .card .title h3 { color: #1a1a1a !important; }

/* ✅ layered, single class, token value */
@layer reset, base, tokens, components, utilities;

@layer components {
  .card__title { color: var(--color-text); }
}
```
