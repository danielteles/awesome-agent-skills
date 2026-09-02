# Per-Worker and Per-Test Data — why

The rules are in the `e2e-testing` Ruleset (`test-data` group). This file is the reasoning and a
`❌ / ✅` example — it adds no rule the Ruleset does not state.

- **Shared seed data makes tests order-dependent.** If test A edits "Acme Corp" and test B asserts
  on it, they pass in one order and fail in another, and neither can run alone. Each test creating
  its own records through the API removes the coupling and makes failures local.
- **Parallel workers collide on fixed identifiers.** Two workers both creating a user
  `test@example.com` race on a uniqueness constraint. Prefix every identifier with a per-run id or
  UUID so workers never touch the same row.
- **Log in once per worker.** Signing in through the UI in every test is slow and is itself a common
  flake source. Do it once, save the storage state / session, and reuse it — the login flow gets
  its own dedicated test.
- **Account-wide state is not test-local.** Toggling a feature flag or changing an org setting
  leaks to every other test on that account. Scope such changes to the test's own tenant or user,
  or do not make them in e2e.
- **Clean up, or use ephemeral namespaces.** Leftover data slows the environment and eventually
  breaks assertions that count rows. Delete in teardown, or create everything under a namespace the
  environment wipes.

```ts
// ❌ relies on a globally seeded project; logs in through the UI every test
test('archives a project', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('demo@example.com');
  await page.getByLabel('Password').fill('password');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('link', { name: 'Demo Project' }).click(); // whoever ran last may have archived it
  // ...
});

// ✅ per-worker session + data this test created via the API
test.use({ storageState: 'playwright/.auth/worker.json' });

test('archives a project', async ({ page, request }) => {
  const { id, name } = await createProject(request, { name: `proj-${runId}-${test.info().workerIndex}` });
  await page.goto(`/projects/${id}`);
  await page.getByRole('button', { name: 'Archive' }).click();
  await expect(page.getByRole('heading', { name })).toContainText('Archived');
});
```
