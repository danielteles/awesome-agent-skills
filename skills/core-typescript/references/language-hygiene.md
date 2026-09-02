# Language Hygiene — why

The rules are in the `core-typescript` Ruleset (`language-hygiene` group). This file is the
reasoning.

- **`===` / `!==` only.** `==` runs type coercion with results few people can predict (`'' == 0`, `[] == false`). The one carve-out is `x == null`, an idiom that tests `null` and `undefined` together.
- **`Number.isNaN` / `Number.isFinite`**, not the global `isNaN` / `isFinite`, which coerce their argument first (`isNaN('foo')` is `true`).
- **`const` by default; `let` only for a variable that is reassigned; never `var`** — `var` ignores block scope and hoists.
- **Do not reassign a function parameter.** A reassigned parameter hides the original input from everything after it; make a new local instead.
- **Real bit flags** (values you OR together) need a `const` object of powers of two plus a derived type — a string-literal union cannot represent `A | B`.
