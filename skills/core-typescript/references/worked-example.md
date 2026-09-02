# Core TypeScript — Worked Example: A Review Pass

A full pass in the skill's Output Format. Findings cite the Ruleset topic they fail.

Input diff:

```ts
// money.ts — proposed in a pull request
1  enum Currency { USD = 'USD', EUR = 'EUR' }
2
3  export function format(amount, currency: Currency) {
4    const symbol = currency == Currency.USD ? '$' : '€';
5    return symbol + (amount / 100).toFixed(2);
6  }
7
8  export async function loadRate(from: string, to: string) {
9    fetch(`/api/rate?from=${from}&to=${to}`)
10     .then((res) => res.json())
11     .then((data) => cache.set(`${from}:${to}`, data as Rate));
12 }
```

Output:

```
must-fix · unsafe-types · money.ts:3 — `amount` has an implicit `any`. Annotate it `number`.
must-fix · async · money.ts:9 — the `fetch` chain floats and swallows errors. Return `await fetch(...)` and its parsed value.
must-fix · unsafe-types · money.ts:11 — `data as Rate` asserts an unproven shape. Parse it with a schema (`architecture-and-design`, type-safety).
must-fix · language-hygiene · money.ts:4 — `==` used. Change to `===`.
consider · data-modeling · money.ts:1 — `enum Currency` adds runtime code. Use `type Currency = 'USD' | 'EUR'`.
consider · functions · money.ts:3 — `format` has no return type. Add `: string`.
consider · data-modeling · money.ts:4 — the `'$' : '€'` branch does not scale. Map currency to symbol in a frozen `const` object.
```
