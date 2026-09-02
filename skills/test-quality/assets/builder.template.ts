/**
 * Test-data builder template for the `test-quality` skill.
 * Referenced from SKILL.md (`test-data` group). Copy this file next to the tests
 * that need it, rename `Thing` / `makeThing` to the real type, set real defaults,
 * and delete this comment.
 *
 * Why a builder (see references/test-data.md):
 *  - the test sets only the fields the assertion depends on; the rest are sane defaults;
 *  - distinct roles get distinct values, so a test fails if two arguments are swapped;
 *  - no shared mutable fixture that many tests lean on in conflicting ways.
 */

// Replace with the real type (import it; do not redefine the production type here).
type Thing = {
  id: string;
  name: string;
  quantity: number;
  price: number; // minor units
  active: boolean;
};

/**
 * Build one `Thing`. Defaults are fixed, meaningful literals — never all `1`, so
 * `fn(id, qty)` vs `fn(qty, id)` cannot both pass.
 */
export function makeThing(overrides: Partial<Thing> = {}): Thing {
  return {
    id: 'thing_1',
    name: 'Test Thing',
    quantity: 3,
    price: 500,
    active: true,
    ...overrides,
  };
}

/**
 * Build `count` distinct `Things`. Each gets a unique id (and name), so a list
 * assertion cannot pass by matching the wrong element. Pass `overrides` as an
 * object to apply to every item, or a function for per-index values.
 */
export function makeThings(
  count: number,
  overrides: Partial<Thing> | ((index: number) => Partial<Thing>) = {},
): Thing[] {
  return Array.from({ length: count }, (_unused, i) =>
    makeThing({
      id: `thing_${i + 1}`,
      name: `Test Thing ${i + 1}`,
      ...(typeof overrides === 'function' ? overrides(i) : overrides),
    }),
  );
}

/**
 * Randomized data is opt-in and reproducible: seed the generator and print the
 * seed on failure, or prefer `makeThing` with fixed literals. Example with a
 * seeded PRNG (swap in your generator of choice):
 *
 *   const seed = Number(process.env.TEST_SEED ?? Date.now());
 *   afterEach((ctx) => { if (ctx.task.result?.state === 'fail') console.log('TEST_SEED=%d', seed); });
 *   const thing = makeThing({ price: randomInt(seed, 1, 10_000) });
 */
