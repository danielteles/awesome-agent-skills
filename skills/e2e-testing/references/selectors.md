# Role-Based Selectors — why

The rules are in the `e2e-testing` Ruleset (`selectors` group).

| Preference | Locator | Why |
|---|---|---|
| 1 | `getByRole('button', { name: 'Save' })` | Matches what a user and assistive tech perceive; breaks only on a real UX change. |
| 2 | `getByLabel` / `getByPlaceholder` / `getByText` | Still user-facing; fine when there is no meaningful role. |
| 3 | `getByTestId('checkout-submit')` | Last resort. A deliberate, stable contract added for the test. |
| never | `.locator('.btn-primary > span:nth-child(2)')` | Encodes styling and DOM shape; every refactor breaks it. |

- **User-facing locators survive refactors.** A CSS or XPath selector couples the test to the
  markup; renaming a class or wrapping an element in a `<div>` breaks a test that the user would
  never notice changed. A role + name locator only breaks when the button stops being a button or
  changes its label — which is a change worth a test failing on.
- **`data-testid` is a contract, not a crutch.** It is acceptable when nothing accessible
  identifies the element, but it must be added on purpose and kept stable, not a scraped class.
- **Locators are lazy.** In Playwright a `Locator` re-queries every time it is used and auto-waits;
  storing `await page.$(...)` gives a stale `ElementHandle` that throws after a re-render.
- **Text is fragile across locales.** `getByText('Submit')` fails when the test runs in French
  unless the test pins the locale.

```ts
// ❌ structural CSS selector + stale handle + brittle exact text
const btn = await page.$('form .actions button.primary');
await btn.click();
expect(await page.textContent('.toast')).toBe('Saved successfully.');

// ✅ role + name, lazy locator, retrying assertion
await page.getByRole('button', { name: 'Save' }).click();
await expect(page.getByRole('status')).toHaveText(/saved/i);
```
