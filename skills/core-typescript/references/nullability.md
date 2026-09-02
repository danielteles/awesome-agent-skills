# Nullability — why, and an example

The rules are in the `core-typescript` Ruleset (`nullability` group). This file is the reasoning and
an example.

- **One empty value: `undefined`.** Reserve `null` for an external contract that actually sends it. One convention removes the "which empty is this" branch everywhere.
- **`array[i]` and `record[key]` can be `undefined`** at runtime — `noUncheckedIndexedAccess` makes the type say so, and the read has to handle it.
- **`?.` and `??`** for access and defaults. Do not use `||` for a default when `0`, `''`, or `false` is a valid value — `||` replaces all of them.

```ts
// ❌ `||` replaces a valid 0
const pageSize = input.pageSize || 20;

// ✅ `??` replaces only null or undefined
const pageSize = input.pageSize ?? 20;
```
