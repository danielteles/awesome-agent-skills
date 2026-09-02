# Let Inference Work; Use `satisfies` — why, and an example

The rules are in the `core-typescript` Ruleset (`inference` group). This file is the reasoning and
an example.

- **Do not re-annotate what the compiler already infers exactly.** A repeated annotation is noise, and a wider annotation than the inferred type throws away
  precision (`Record<string, string>` on a literal loses the exact keys and values). The exception is an exported API boundary, where the annotation is the
  contract (see `functions`).
- **`satisfies`** validates a value against a shape *without* widening it — you get the shape check and keep the literal types.

```ts
// ❌ The annotation widens: routes.home is string, not '/'
const routes: Record<string, string> = { home: '/', about: '/about' };

// ✅ satisfies checks the shape and keeps the literal types
const routes = {
  home: '/',
  about: '/about',
} satisfies Record<string, `/${string}`>;

routes.home; // type is '/'
```
