# Waiting and Assertions — why

The rules are in the `e2e-testing` Ruleset (`waiting` group).

- **Fixed waits are the number one flake source.** `waitForTimeout(1000)` is too long on a fast
  run (wastes minutes across a suite) and too short on a slow CI machine (fails intermittently).
  There is no duration that is correct on every machine.
- **Web-first assertions retry.** `expect(locator).toHaveText(...)` polls the element until it
  matches or the timeout expires, so the test proceeds the instant the app is ready and only fails
  if it never becomes ready. `cy.get(...).should(...)` does the same. This is the mechanism that
  replaces sleeping.
- **A one-shot read cannot retry.** `expect(await locator.textContent()).toBe(...)` captures a
  single moment; if the update is 5 ms late the test fails. For a value that is not a DOM
  assertion, `expect.poll(() => api.getStatus())` retries the function.
- **`networkidle` is a heuristic, not a signal.** It waits for the network to go quiet, which a
  polling request or analytics beacon can prevent forever, and it does not mean the UI updated.
  Wait for the specific element or response the test depends on.
- **Tune timeouts locally.** One genuinely slow step gets its own longer timeout; raising the
  global timeout to hide a race just makes the eventual failure slower.

```ts
// ❌ sleep, then a non-retrying read
await page.getByRole('button', { name: 'Generate report' }).click();
await page.waitForTimeout(5000);
expect(await page.getByTestId('status').textContent()).toBe('Ready');

// ✅ retrying assertion waits exactly as long as needed
await page.getByRole('button', { name: 'Generate report' }).click();
await expect(page.getByRole('status')).toHaveText('Ready', { timeout: 30_000 });
```
