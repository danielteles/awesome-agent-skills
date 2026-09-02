# What Belongs in an E2E Suite — why

The rules are in the `e2e-testing` Ruleset (`scope` group). This file is the reasoning and a
`❌ / ✅` example — it adds no rule the Ruleset does not state.

- **E2E is the top of the pyramid — keep it thin.** Each test drives a real browser through the
  real stack: it is slow, resource-heavy, and the most flake-prone layer. Reserve it for journeys
  where the *integration* is the risk — sign-up, checkout, the core workflow — and let unit and
  integration tests cover the branches, edge cases, and error strings (`architecture-and-design`,
  testing).
- **Justify each new test.** "What would a cheaper test miss here?" If a component test or an API
  test would catch the same regression, write that instead. An e2e suite that mirrors every unit
  case takes an hour to run and nobody trusts it.
- **One journey, one outcome.** Chaining "log in, edit profile, create a post, delete it, log out"
  into one test to save setup means a failure anywhere gives you no signal about where. Split by
  journey; share setup through fixtures, not by concatenating tests.
- **Test the real build.** Run against production-built assets and real routing, not a dev server
  with source maps and debug shortcuts — that is the artifact that ships.
- **Have a smoke subset.** A handful of the most critical paths run on every pull request; the full
  suite can run on merge or nightly if it is long.

```ts
// ❌ one mega-test covering things unit tests should own; runs on a dev server
test('everything', async ({ page }) => {
  await page.goto('http://localhost:5173');
  // validates every field error message, every empty state, every sort order... (80 assertions)
});

// ✅ one critical journey, one outcome, against the built app
test('a shopper can complete checkout', async ({ page }) => {
  await page.goto('/');
  await addItemToCart(page, 'Wool Runners');
  await page.getByRole('link', { name: 'Checkout' }).click();
  await fillPaymentDetails(page);
  await page.getByRole('button', { name: 'Place order' }).click();
  await expect(page.getByRole('heading', { name: 'Order confirmed' })).toBeVisible();
});
```
