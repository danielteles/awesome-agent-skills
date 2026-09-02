# Testing Strategy by Layer — why, and an example

The rules are in the `architecture-and-design` Ruleset (`testing` group). This file is the
reasoning and an example.

Weight the suite toward integration: a thick layer of component-plus-collaborator tests with the
network mocked at the edge, a base of static analysis (types and lint), unit tests for pure logic,
and a thin top of end-to-end tests for critical paths.

| Layer | Test it by | Why |
|---|---|---|
| Domain and use cases | Fast unit tests on plain functions, no DOM or network. | This is where edge-case coverage pays off most. |
| Components | Querying by role and label; asserting on what the user sees. | A behavior test survives a refactor. |
| Network | Mocking HTTP at the boundary (MSW), not by replacing modules. | The test then exercises the real adapter and mapping code. |
| Critical paths | A few end-to-end tests (Playwright or Cypress) against a production build, isolated data per worker. | It proves the whole path once; it is too slow to carry broad coverage. |

- **Query by role and label first.** Fall back to a `data-testid` only when no accessible name fits — a last resort for a unit test (it often flags a real a11y gap), a stability choice for an E2E one (a selector that breaks on a copy edit is its own cost).
- **Enforce coverage on changed lines**, not a global percentage — a global number rewards testing the easy code and hides the gap in the change.
- **Every bug fix ships with a test that fails before the fix** — it proves the fix and stops the regression returning.
- **Contract-test the API boundary**, or generate types from the contract and validate the payload — it catches front/back drift before production.
- **Quarantine a flaky test on the first flake** and fix it within the sprint. A CI retry is a stopgap while it is quarantined, not a permanent setting.
- **Snapshots only for small, stable output** — a large snapshot breaks on every change and no one reads the diff.

```ts
// ❌ Couples the test to the implementation
expect(wrapper.state('isOpen')).toBe(true);

// ✅ Asserts on observable behavior
expect(screen.getByRole('dialog', { name: 'Edit profile' })).toBeVisible();
```
