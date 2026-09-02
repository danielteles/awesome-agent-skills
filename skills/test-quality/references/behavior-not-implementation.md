# Test Quality — Behavior, Not Implementation: why, and examples

The rules are in the `testing` Ruleset (`behavior-not-implementation` group). This file is the
reasoning and code; if it ever disagrees with the Ruleset, the Ruleset wins.

## Why

A test is a bet that a described behavior will keep working. It pays out when it fails on a real
regression and stays green through refactors. A test coupled to internals loses both ways: it
breaks when someone renames a private method (a false alarm that trains people to ignore failures)
and it can stay green while the observable behavior breaks, because it never checked the observable
behavior.

The question for every assertion: *would a user, a caller, or the next system downstream notice if
this were wrong?* If yes, assert on that. If no, do not assert on it.

## Call-count assertions

Checking that a collaborator was called N times is asserting on the implementation's plumbing, not
its result. It is justified only when the call itself is the contract — an analytics event fired, an
email enqueued, a webhook posted — because then the call *is* the observable behavior.

```ts
// ❌ Tests that the repository was consulted, not that the right answer came back
const repo = { findById: vi.fn().mockResolvedValue(user) };
await service.getProfile('u1');
expect(repo.findById).toHaveBeenCalledTimes(1);
expect(repo.findById).toHaveBeenCalledWith('u1');

// ✅ Tests the result the caller receives
const profile = await service.getProfile('u1');
expect(profile).toEqual({ id: 'u1', name: 'Ada', plan: 'pro' });

// ✅ Call assertion is right here — the email IS the behavior
await service.invite('ada@example.com');
expect(mailer.sent).toContainEqual({ to: 'ada@example.com', template: 'invite' });
```

## Reaching into internals

```ts
// ❌ Private state; breaks when `items` becomes a Map
cart.add(item);
expect((cart as any).items.length).toBe(1);

// ✅ Public surface
cart.add(item);
expect(cart.itemCount).toBe(1);
expect(cart.contains(item.id)).toBe(true);
```

## Do not spy on the system under test

Partially mocking the class you are testing (`vi.spyOn(cart, 'recalculate')`) means the test no
longer exercises the real object. Stub its *collaborators*; let the unit itself run.

## The unit is a unit of behavior, not a class

The common failure mode is one test file per class, every collaborator replaced with a double. It
produces a lot of tests that break on every refactor and catch almost no bugs, because each test
only checks that a class talked to its mocks the way the current implementation happens to.

A unit of behavior can span several classes that collaborate to produce one observable result —
`Cart`, `CartLine`, `PricingRules` together. Test them together, through `Cart`'s public API, with
real objects. Introduce a double only when `test-doubles` gives a reason (slow, non-deterministic,
a side effect, does not exist yet) — never just because a collaborator is defined in another file.

```ts
// ❌ Every collaborator mocked; the test asserts wiring, not the total
const rules = { discountFor: vi.fn().mockReturnValue(0.1) };
const line = { subtotal: vi.fn().mockReturnValue(20) };
const cart = new Cart([line as any], rules as any);
cart.applyCoupon('SAVE10');
expect(rules.discountFor).toHaveBeenCalledWith('SAVE10');

// ✅ Real collaborators; the test asserts the behavior a user sees
const cart = makeCart([makeLineItem({ price: 10, qty: 2 })]);
cart.applyCoupon('SAVE10');
expect(cart.total()).toBe(18);
```

## Private methods

A private method is an implementation detail; test the public method that uses it. If a private
method is complex enough that you want to test it directly, that is the design telling you it is a
separate responsibility — extract it into its own function or class with its own public API and
test that. Reaching in with `(obj as any).privateThing()` couples the test to a name that should be
free to change.

## Do not test code you do not own

A test that only checks that React re-renders on `setState`, that the router matches a path, or
that `Array.prototype.map` maps, verifies someone else's suite. It adds run time and breaks on
their upgrades while catching none of your bugs. Test *your* logic at *your* boundary: given this
input to your reducer, this output; given this response from the (stubbed) API, this domain model.

```ts
// ❌ Asserts that useState works
const { result } = renderHook(() => useState(0));
act(() => result.current[1](5));
expect(result.current[0]).toBe(5);

// ✅ Asserts your hook's behavior
const { result } = renderHook(() => useStepper({ max: 3 }));
act(() => result.current.increment());
act(() => result.current.increment());
act(() => result.current.increment());
act(() => result.current.increment()); // past max
expect(result.current.value).toBe(3);
```
