# Test Quality — Structure and Naming: why, and examples

The rules are in the `test-quality` Ruleset (`structure-and-naming` group).

## Name the scenario and the outcome

A failing test reports its name and nothing else on the first line of the CI log. `test getTotal`
tells you which method; `returns 0 for an empty cart` tells you what broke. Write the second kind.

```ts
// ❌
it('test add', () => { /* ... */ });
it('total', () => { /* ... */ });

// ✅
it('adds a line item to an empty cart', () => { /* ... */ });
it('subtracts a percentage coupon from the subtotal', () => { /* ... */ });
```

## Arrange, act, assert — visibly

Three blocks, blank lines between them, one call in the act block. If the act step needs several
calls, that is usually a sign the API forces a ritual worth fixing, or the test is covering two
behaviors.

```ts
it('subtracts a percentage coupon from the subtotal', () => {
  // arrange
  const cart = makeCart([makeLineItem({ price: 10, qty: 2 })]);

  // act
  cart.applyCoupon('SAVE10');

  // assert
  expect(cart.total()).toBe(18);
});
```

## No logic in the test body

An `if` or a `for` with arithmetic in a test re-implements the code under test, so both can be wrong
together, and the test no longer reads as a fixed example. List the cases as data instead.

```ts
// ❌ A loop that mirrors the implementation
for (const [input, factor] of cases) {
  expect(convert(input)).toBe(input * factor);
}

// ✅ Fixed cases; a failure names the row
it.each([
  { celsius: 0, fahrenheit: 32 },
  { celsius: 100, fahrenheit: 212 },
  { celsius: -40, fahrenheit: -40 },
])('converts $celsius°C to $fahrenheit°F', ({ celsius, fahrenheit }) => {
  expect(toFahrenheit(celsius)).toBe(fahrenheit);
});
```

## `beforeEach` is for what every test needs

Setup that only some tests need, placed in `beforeEach`, makes those tests read as if by magic and
forces the others to pay for state they do not use. Keep scenario-specific arrange in the test.
Shared setup that every test genuinely needs (a fresh subject, fake timers) is fine there.

## One reason to fail

If a test can fail for three unrelated reasons, a failure does not tell you which. Split it. A run
of `expect`s that all describe one outcome (the shape of one returned object) is still one reason.

## No focused or silently-skipped tests in the repo

`it.only` / `fit` / `fdescribe` disables every *other* test in the file — the run stays green while
almost nothing runs. `it.skip` / `xit` removes a test with no signal that coverage dropped. Neither
belongs in a commit: block `.only` in CI (an ESLint rule or a `--forbid-only` flag), and require a
`.skip` to carry a `// TODO(TICKET-123): ...` so it is visible and time-boxed.
