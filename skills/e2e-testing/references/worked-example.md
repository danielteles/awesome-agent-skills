# End-to-End Testing — Worked Example: A Review Pass

A full pass in the skill's Output Format. Findings cite the Ruleset topic they fail.

Input diff:

```ts
// checkout.spec.ts — proposed in a pull request
1   test('checkout', async ({ page }) => {
2     await page.goto('http://localhost:5173');
3     await page.locator('.product-card:nth-child(1) .add-btn').click();
4     await page.waitForTimeout(1500);
5     await page.locator('#cart-link').click();
6     await page.route('**/api/**', (r) => r.fulfill({ body: JSON.stringify(fixtures.all) }));
7     await page.getByPlaceholder('Card number').fill('4242424242424242');
8     await page.getByText('Pay').click();
9     await page.waitForTimeout(3000);
10    expect(await page.locator('.confirmation h1').textContent()).toBe('Order confirmed');
11    await page.getByRole('link', { name: 'Account' }).click();
12    await expect(page.getByText('demo@example.com')).toBeVisible();
13  });
```

Output:

```
must-fix · selectors · checkout.spec.ts:3 — `.product-card:nth-child(1) .add-btn` is a structural CSS selector. Use `getByRole('button', { name: 'Add to cart' })` scoped to the product.
must-fix · selectors · checkout.spec.ts:10 — `.confirmation h1` plus a non-retrying `textContent()` read. Use `expect(page.getByRole('heading', { name: 'Order confirmed' })).toBeVisible()`.
must-fix · waiting · checkout.spec.ts:4 — `waitForTimeout(1500)` is a fixed wait. Assert the cart badge shows 1, or wait for the add-to-cart response.
must-fix · waiting · checkout.spec.ts:9 — `waitForTimeout(3000)` after Pay. `await page.waitForResponse(r => r.url().includes('/api/checkout'))`, then assert on the confirmation.
must-fix · network · checkout.spec.ts:6 — `**/api/**` stubs your own backend, so this no longer tests the real checkout endpoint. Stub only the payment provider; let `/api/checkout` run for real.
must-fix · test-data · checkout.spec.ts:2 — hard-coded `localhost:5173` and no data setup; the test depends on whatever catalog is seeded. Use `baseURL` and create the product via the API.
must-fix · test-data · checkout.spec.ts:12 — asserts on a shared `demo@example.com` account. Sign in per worker with a stored session for a test-created user.
consider · scope · checkout.spec.ts:11 — the account-page check is a second journey bolted on. Split it into its own test so a failure points at one flow.
consider · selectors · checkout.spec.ts:8 — `getByText('Pay')` can match other elements. Use `getByRole('button', { name: 'Pay' })`.
```
