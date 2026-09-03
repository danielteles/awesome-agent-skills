# Test Quality — Worked Example: A Review Pass

A full pass in the skill's Output Format. Each finding cites the Ruleset topic it fails.

Input diff:

```ts
// cart.test.ts — proposed in a pull request
1  import { Cart } from './cart';
2
3  describe('Cart', () => {
4    let cart: any;
5    beforeEach(() => { cart = new Cart(); });
6
7    it('test add', () => {
8      cart.add({ id: 1, price: 1, qty: 1 });
9      expect((cart as any).items.length).toBeTruthy();
10   });
11
12   it('total', () => {
13     cart.add({ id: 1, price: 10, qty: 2 });
14     cart.applyCoupon('SAVE10');
15     let expected = 0;
16     for (const i of (cart as any).items) expected += i.price * i.qty;
17     expected = expected * 0.9;
18     cart.total().then((t: number) => expect(t).toBe(expected));
19   });
20
21   it('handles errors', () => {
22     try {
23       cart.applyCoupon('NOPE');
24     } catch (e) {
25       expect(e).toBeDefined();
26     }
27   });
28 });
```

Output:

```
must-fix · behavior-not-implementation · cart.test.ts:9 — asserts on the private `items` array. Assert a public value: `expect(cart.itemCount).toBe(1)` or `expect(await cart.total()).toBe(1)`.
must-fix · assertions · cart.test.ts:9 — `toBeTruthy()` on a length passes for any non-zero count. Pin it: `expect(cart.itemCount).toBe(1)`.
must-fix · assertions · cart.test.ts:16 — the test recomputes the total with the implementation's own formula, so a wrong discount rule passes in both places. Assert a hand-worked literal: `expect(await cart.total()).toBe(18)`.
must-fix · assertions · cart.test.ts:18 — the assertion is inside an un-awaited `.then`; the test passes even if `total()` rejects or the callback never runs. Make the test `async` and write `expect(await cart.total()).toBe(18)`.
must-fix · assertions · cart.test.ts:22 — the `try/catch` asserts only that something was thrown and passes silently when nothing is. Use `expect(() => cart.applyCoupon('NOPE')).toThrow(UnknownCouponError)`.
must-fix · structure-and-naming · cart.test.ts:7 — "test add" restates the method. Name the outcome: "adds a line item to an empty cart".
must-fix · structure-and-naming · cart.test.ts:12 — "total" plus the `for` loop mixes two concerns and re-implements the code. Name it "subtracts a percentage coupon from the subtotal" and drop the loop.
consider · test-data · cart.test.ts:8 — `id`, `price`, and `qty` are all `1`, so a swapped argument still passes. Use distinct values via a `makeLineItem({ price: 10, qty: 2 })` builder.
consider · unsafe-types · cart.test.ts:4 — `cart: any` drops type checking on the subject and forces the `as any` casts below. Type it `Cart`. (core-typescript)
```

The same behaviors, tested well:

```ts
import { Cart } from './cart';
import { makeLineItem } from './test/factories';
import { UnknownCouponError } from './errors';

describe('Cart', () => {
  let cart: Cart;
  beforeEach(() => {
    cart = new Cart();
  });

  it('adds a line item to an empty cart', () => {
    cart.add(makeLineItem({ id: 'li_1' }));

    expect(cart.itemCount).toBe(1);
    expect(cart.contains('li_1')).toBe(true);
  });

  it('subtracts a percentage coupon from the subtotal', async () => {
    cart.add(makeLineItem({ price: 10, qty: 2 })); // subtotal 20

    cart.applyCoupon('SAVE10'); // 10% off

    expect(await cart.total()).toBe(18);
  });

  it('rejects an unknown coupon code', () => {
    expect(() => cart.applyCoupon('NOPE')).toThrow(UnknownCouponError);
  });
});
```
