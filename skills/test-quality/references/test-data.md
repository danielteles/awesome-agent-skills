# Test Quality — Test Data: why, and examples

The rules are in the `test-quality` Ruleset (`test-data` group).

## Builders over literals and shared fixtures

A test should show the reader exactly which input fields drive the result and hide the rest. A raw
literal with fifteen fields buries the one that matters; a shared `fixtures/user.json` that forty
tests import means no test can change it and every test depends on values it never states.

A builder fills sane defaults and takes named overrides:

```ts
export function makeLineItem(overrides: Partial<LineItem> = {}): LineItem {
  return { id: 'li_1', sku: 'SKU-1', price: 5, qty: 1, ...overrides };
}

// The test states only what matters to the assertion
const item = makeLineItem({ price: 10, qty: 2 });
```

```ts
// ❌ Which of these fields does the total depend on?
const item = {
  id: 1, sku: 'SKU-1', name: 'Widget', price: 10, qty: 2, weight: 3,
  category: 'tools', taxCode: 'A', addedAt: '2024-01-01', discountable: true,
};

// ✅
const item = makeLineItem({ price: 10, qty: 2 });
```

## Distinct values for distinct roles

When an id, a quantity, and a price are all `1`, a test passes even if the code swaps two of them.
Give each role a value that could only be that role.

```ts
// ❌ add(id, qty) vs add(qty, id) — both pass
cart.add(1, 1);

// ✅
cart.add({ id: 'li_1', qty: 3 });
expect(cart.quantityOf('li_1')).toBe(3);
```

## Randomized data

Property-based tests and `faker` data find edge cases, but only if a failure is reproducible. Seed
the generator and print the seed on failure; otherwise prefer fixed, meaningful literals so a green
run means the same thing every time.
