# Generics with Restraint — why, and examples

The rules are in the `core-typescript` Ruleset (`generics` group).

- **Add a generic only when two types move together** — an input type and a return type, say. A type parameter used once is just `unknown` with extra syntax and
  no added safety.
- **Constrain it with `extends`** so the body can use its shape.
- **Give a common type parameter a default** so most callers skip the explicit argument.
- **A `const` type parameter** (`<const T>`) keeps the caller's literal type without an `as const` at every call site.

```ts
// ❌ T is used once; it adds nothing
function first<T>(list: T[]): unknown {
  return list[0];
}

// ✅ T links the parameter and the return type
function first<T>(list: readonly T[]): T | undefined {
  return list[0];
}

// ✅ Constrained and with a default
function pluck<T, K extends keyof T = keyof T>(item: T, key: K): T[K] {
  return item[key];
}
```
