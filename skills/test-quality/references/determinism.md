# Test Quality — Determinism: why, and examples

The rules are in the `test-quality` Ruleset (`determinism` group). This file is the reasoning and code.

## Why

A test that passes or fails depending on the machine's clock, the run order, the timezone, or a
race loses its meaning. People re-run CI until it goes green, and a real regression hidden in the
noise ships. A deterministic test gives the same answer every time, so a red is always worth
stopping for.

## A unit test does no real I/O

Fast is a correctness property, not just a nicety: a test that opens a socket, hits a database, or
reads the disk is slow *and* non-deterministic — it fails on a flaky network, a dirty row, a
missing file. If the behavior genuinely needs one of those, that is an integration test and lives
in that layer with its own setup; do not smuggle it into the unit suite behind a real client.
Inject the boundary (a repository interface, a `Clock`, a `FileStore`) and pass a fake in the test.

## No real waiting

`await sleep(500)` is a guess: too short and the test is flaky, too long and the suite crawls.
Drive time explicitly or await the actual condition.

```ts
// ❌
await sleep(500);
expect(onDone).toHaveBeenCalled();

// ✅ Fake timers
vi.useFakeTimers();
startJob();
await vi.advanceTimersByTimeAsync(500);
expect(onDone).toHaveBeenCalled();

// ✅ Await the condition, not a duration (query API here is framework-specific, shown for illustration)
await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Done'));
```

## Control the clock and randomness

```ts
// ❌ Fails one day a year, or in another timezone
expect(formatDate(order.createdAt)).toBe('Jan 1, 2024');

// ✅
vi.setSystemTime(new Date('2024-01-01T12:00:00Z'));
```

Inject `now()` and the RNG, or fake them. A seeded RNG makes a "random" path reproducible.

Pin the timezone where the process starts, not in a test file — `TZ=UTC` in the CI env or
`NODE_OPTIONS`, or the runner's `env` config. Setting `process.env.TZ` inside a test is unreliable:
`Date` may have been read already, and platforms cache the zone.

## Order independence

Tests must pass when run alone, in any order, and in parallel. The usual culprit is shared mutable
state: a module-level variable, a real database row, a temp file with a fixed name, `localStorage`.
Give each test its own subject and its own scratch space; clean up in `afterEach` so a failing test
does not poison the next.

```ts
// ❌ Second test depends on the first having run
let cart: Cart;
beforeAll(() => { cart = new Cart(); });

// ✅ Fresh per test
let cart: Cart;
beforeEach(() => { cart = new Cart(); });
```

## Flakes

Quarantine a flaky test on the first flake (skip it, tracked with a ticket) and fix it inside the
sprint. A blanket `retries: 2` in CI is a way to stop noticing flakes, and a flake is often a real
race in the product code.
