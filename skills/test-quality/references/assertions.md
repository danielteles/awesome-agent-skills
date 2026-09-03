# Test Quality — Assertions: why, and examples

The rules are in the `test-quality` Ruleset (`assertions` group). This file is the reasoning and code.

## Why a test needs a real assertion

A test with no assertion passes as long as the code does not throw. That is a smoke test, and it
should say so — `expect(() => render()).not.toThrow()` — so the next reader knows the coverage it
buys is shallow. An implicit "it ran" is a test that will never catch a wrong result.

## Specific matchers

A loose matcher passes for a large set of wrong values. `toBeTruthy()` on a length passes for `1`
when the answer is `3`; `toThrow()` passes for a `TypeError` from a null deref when you meant to
assert a `ValidationError`.

```ts
// ❌ Passes for any non-empty array, any non-zero number
expect(result).toBeTruthy();
expect(items.length).toBeTruthy();
expect(() => parse(bad)).toThrow();

// ✅ Pins the value and the failure mode
expect(result).toEqual({ status: 'ok', count: 3 });
expect(items).toEqual([itemA, itemB, itemC]);
expect(() => parse(bad)).toThrow(ValidationError);
```

## Collections: order is a claim

`toEqual([a, b, c])` asserts *these values, in this order*. If the code's order is incidental — a
DB query with no `ORDER BY`, `Promise.all` results, `Object.keys`, a `Set` iteration — the test is
green today and flaky tomorrow. Assert order only when order is part of the contract; otherwise
sort both sides first, compare as a `Set`, or use `expect.arrayContaining`.

```ts
// ❌ Passes until the query planner reorders rows
expect(await repo.findActive()).toEqual([ada, grace, lin]);

// ✅ Order is not the contract
expect(await repo.findActive()).toEqual(expect.arrayContaining([ada, grace, lin]));
expect(new Set(await repo.findActive())).toEqual(new Set([ada, grace, lin]));

// ✅ Order IS the contract — sorted output — so assert it
expect(sortByName(users).map((u) => u.name)).toEqual(['Ada', 'Grace', 'Lin']);
```

## Do not recompute the expected value

If the test derives the expected result with the same formula as the code, a bug in that formula is
in both places and the test stays green. Work the expected value out by hand and write the literal.

```ts
// ❌ Same logic as the implementation — a wrong discount rule passes
let expected = 0;
for (const i of items) expected += i.price * i.qty;
expected *= 0.9;
expect(cart.total()).toBe(expected);

// ✅ A number you computed yourself: 2 × 10, less 10%
expect(cart.total()).toBe(18);
```

## Assert an error, do not catch it

A `try/catch` that asserts inside the `catch` also passes when the call *does not* throw — the
`catch` block simply never runs, and the test is green for the wrong reason.

```ts
// ❌ Green whether or not applyCoupon throws
try {
  cart.applyCoupon('NOPE');
} catch (e) {
  expect(e).toBeInstanceOf(UnknownCouponError);
}

// ✅ Fails if nothing is thrown, and pins the type
expect(() => cart.applyCoupon('NOPE')).toThrow(UnknownCouponError);
await expect(cart.checkout()).rejects.toThrow(EmptyCartError);
```

## Snapshots

An inline snapshot of a short, meaningful value (`toMatchInlineSnapshot('"12.34"')`) is a readable
assertion. A serialized component tree or a multi-kilobyte object written to a `.snap` file is not:
nobody reads the diff, `--update` is reflexive, and it breaks on every unrelated change. Reserve
snapshots for small output a human will actually review, and assert on the specific fields
everywhere else.

## Async: assert after it settles

An assertion inside an un-awaited `.then` (or after a floating promise) can run after the test has
already passed, or not at all.

```ts
// ❌ Test passes even if total() rejects or the callback never fires
it('applies the discount', () => {
  cart.total().then((t) => expect(t).toBe(18));
});

// ✅
it('applies the discount', async () => {
  expect(await cart.total()).toBe(18);
});

// ✅ Rejection
await expect(cart.total()).rejects.toThrow(EmptyCartError);
```

Consider `expect.assertions(n)` in a test with conditional or callback-based assertions, so a
skipped assertion fails the test instead of passing silently.
