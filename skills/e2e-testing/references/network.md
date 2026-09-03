# Network Interception — why

The rules are in the `e2e-testing` Ruleset (`network` group).

- **Mock what you do not own or cannot control.** Payment providers, maps, analytics, email,
  weather, "trending now" feeds — these are slow, cost money, rate-limit, or return different data
  every call. Intercept them at the network layer and return a fixed response so the test is
  deterministic.
- **Keep your own backend real in a true e2e.** The point of end-to-end is that the whole stack
  works together. Stubbing your own API turns it into an integration test — a valid choice, but
  label it, because it no longer catches a broken endpoint or a serialization bug.
- **Fixtures drift.** A hand-written stub of a third-party response silently diverges from reality.
  Guard it with a contract test that runs the fixture against the real schema, or generate it from
  the provider's OpenAPI spec.
- **Wait on the request, not the clock.** When a test needs a call to finish, await that specific
  response (`waitForResponse`, a `cy.intercept` alias) — a `waitForTimeout(2000)` is both slower
  and flakier.
- **Scope and reset.** An interception registered in one test must not still be rewriting responses
  in the next; register per test or clear it in teardown.

```ts
// ❌ blind wait, and the whole app API is mocked so a real 500 would pass
await page.route('**/api/**', (r) => r.fulfill({ body: JSON.stringify(fixtures.everything) }));
await page.getByRole('button', { name: 'Pay' }).click();
await page.waitForTimeout(3000);

// ✅ only the third party is stubbed; the test waits on the real checkout call
await page.route('https://api.stripe.com/**', (r) =>
  r.fulfill({ status: 200, body: JSON.stringify({ id: 'pi_test', status: 'succeeded' }) }),
);
const done = page.waitForResponse((r) => r.url().includes('/api/checkout') && r.ok());
await page.getByRole('button', { name: 'Pay' }).click();
await done;
await expect(page.getByRole('heading', { name: 'Order confirmed' })).toBeVisible();
```
