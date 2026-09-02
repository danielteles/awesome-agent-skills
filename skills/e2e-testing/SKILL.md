---
name: e2e-testing
description: >-
  Framework-neutral standards for end-to-end browser tests with Playwright or
  Cypress: role-based user-facing selectors, per-worker and per-test data
  isolation, network interception, web-first retrying assertions instead of
  fixed waits, a retry and sharding policy, flake triage to a root cause, and
  keeping the suite a thin layer of critical journeys. Composes with
  `test-quality` for the quality of each individual test. Use it when the user
  mentions end-to-end tests, E2E, Playwright, Cypress, browser tests, "flaky
  test", getByRole, test-id, network mocking, test retries, sharding, or
  "the e2e suite is slow".
license: CC-BY-4.0
metadata:
  author: danielteles
  version: "1.0"
---

# End-to-End Testing — Engineering Skill

Standards for a browser end-to-end suite: how tests find elements, where their data comes from, what
they mock, how they wait, and how the suite stays fast and trustworthy. Framework-neutral — the
rules hold for Playwright and Cypress; examples use Playwright syntax with the Cypress equivalent
noted where it differs.

> **Builds on.** `test-quality` for whether an individual test is worth keeping (one outcome per
> test, a meaningful assertion, determinism) and `architecture-and-design` for suite strategy — how
> thin the e2e layer should be relative to integration and unit. On a conflict, `test-quality`
> decides the individual test and this skill decides the e2e mechanics. The Ruleset below is
> complete on its own; load a named skill only when the task turns on its layer, not by default. If
> a named sibling skill is not loaded, apply that layer from general knowledge and do not block.

This SKILL.md is self-sufficient — the **Ruleset** below is the complete, enforceable list, and
nothing here depends on a `references/` file being read. Each `references/<topic>.md` holds the
*reasoning* and `❌ / ✅` code for one Ruleset group (`references/selectors.md`,
`references/network.md`, …), plus `references/worked-example.md` for a full review pass. Open them
for depth when your runtime allows.

---

## How to Use This Skill

Pick the mode that matches the task. Do the steps in order.

| Mode | Steps |
|---|---|
| **Write** — add an e2e test for a user journey | 1. Confirm the journey belongs in e2e — critical, cross-system, not coverable at a lower layer (`scope`). 2. Seed this test's own data through the API and sign in with a per-worker stored session (`test-data`). 3. Drive the UI through role-based locators; assert with web-first retrying assertions, never a fixed wait (`selectors`, `waiting`). 4. Stub only third-party and non-deterministic endpoints (`network`). 5. Run the Ruleset as a checklist. Fix each fail before you hand off. |
| **Review** — check an e2e test diff | 1. Run the Ruleset against the diff. 2. Write one finding per fail, in the Output Format below. 3. Order the findings: `must-fix` first, then `consider`. 4. If nothing fails, say so in one line. Do not invent findings. |
| **Triage** — a test is flaky | 1. Reproduce it — run it many times and with a trace (`--repeat-each`, retained trace/video). 2. Name the cause: a fixed timeout, a race with an animation or network, shared data, test-order coupling, a real bug (`flake-triage`). 3. Fix the root cause — a retrying assertion, isolated data, a stubbed clock — not a longer sleep. 4. Quarantine it the first time it flakes; do not leave it retrying green in CI. |

### Output Format

Write one finding per line:

```
<severity> · <topic> · <file>:<line> — <what is wrong>. <the fix as an action>.
```

- `<severity>` is `must-fix` (breaks a rule in this skill, or will flake) or `consider` (safe, but a rule prefers another form).
- `<topic>` is a Ruleset topic slug (`selectors`, `test-data`, `network`, `waiting`, `reliability`, `flake-triage`, `scope`).

### Rules for Every Mode

- Name the Ruleset topic when you enforce a rule.
- State the failure mode, not only the rule — "this passes locally and flakes in CI when the animation runs long", not "avoid waitForTimeout".
- Every e2e test also passes the `test-quality` Ruleset: one outcome, a real assertion on user-visible state, no logic in the test body.
- An e2e test is expensive. Before adding one, ask whether an integration or unit test would catch the same regression faster.

---

## Ruleset

The complete rule list. Read it top to bottom when writing; tick each box against a diff when
reviewing. Each group links to its `references/` file for rationale and examples.

### selectors → `references/selectors.md`

- [ ] Elements are found by user-facing locators — role + accessible name (`getByRole`), label, placeholder, or visible text — in that order of preference.
- [ ] A `data-testid` is used only when no accessible query works, and it is a stable contract, never a scraped class name, tag path, or nth-child.
- [ ] No CSS or XPath selector that encodes DOM structure or styling; no locator that matches more than one element without an explicit index reason.
- [ ] Locators are lazy and auto-waiting — created once, resolved on use; no querying the DOM into a variable and reusing a stale handle.
- [ ] Text locators tolerate insignificant whitespace and case where the framework allows, and do not depend on copy that changes with locale unless the test
      sets the locale.

### test-data → `references/test-data.md`

- [ ] Each test creates the data it needs through the application's API or a factory, and tears it down or uses a unique namespace — no reliance on a shared
      seeded record.
- [ ] Identifiers are unique per test run (a run id or UUID prefix) so parallel workers do not collide.
- [ ] Authentication is done once per worker and reused via a stored session (`storageState` / `cy.session`), not by logging in through the UI in every test.
- [ ] Tests pass when run in isolation, in any order, and fully parallel; none depends on a previous test's side effect.
- [ ] No test mutates global or account-wide state (feature flags, settings) that another test reads, unless that state is scoped to the test's own tenant or
      user.

### network → `references/network.md`

- [ ] Third-party, paid, rate-limited, and non-deterministic endpoints (payments, maps, analytics, email, time-based feeds) are stubbed at the network layer.
- [ ] Your own backend runs for real in a true end-to-end test; stubbing it is a deliberate choice that downgrades the test to integration and is labelled as
      such.
- [ ] A stubbed response matches the real contract's shape; a contract test or type guards the fixture against drift.
- [ ] The test waits on a specific request or response (`waitForResponse`, `cy.intercept` alias) when it needs one, not a blind delay.
- [ ] Interception is scoped and cleaned up so a stub from one test does not leak into the next.

### waiting → `references/waiting.md`

- [ ] Every assertion is a web-first retrying assertion (`expect(locator).toHaveText(...)`, `cy.get(...).should(...)`) that polls until it passes or times out.
- [ ] No `page.waitForTimeout(ms)` / `cy.wait(ms)` / `sleep` — waiting is on a condition (a locator state, a response, a URL), never a duration.
- [ ] No assertion reads a value once and compares it; a non-DOM condition uses `expect.poll` or an explicit polling helper.
- [ ] `networkidle` and "wait for the page to settle" heuristics are avoided; the test waits for the specific element or response it depends on.
- [ ] Timeouts are set intentionally per project and per slow step, not raised globally to paper over a race.

### reliability → `references/reliability.md`

- [ ] Retries are enabled only in CI and capped at one or two; local runs do not retry, so flakes surface in development.
- [ ] A test that passes only on retry is recorded as a flake and triaged — it is not treated as green.
- [ ] The suite runs fully parallel and is sharded across CI machines; wall-clock time is kept to a few minutes.
- [ ] A trace, screenshot, and video are captured on failure (and on first retry) and published as CI artifacts.
- [ ] A known-flaky test goes to a quarantine lane that does not gate merges, with a tracked ticket and an owner — not left in the main suite retrying.

### flake-triage → `references/flake-triage.md`

- [ ] A flake is reproduced before it is fixed — `--repeat-each` / a loop, with the trace retained — not fixed by guesswork.
- [ ] The cause is named: fixed timeout, animation/transition race, network race, shared or leftover data, test-order coupling, non-deterministic
      clock/locale/timezone, or a real product bug.
- [ ] Animations and transitions are disabled in the test environment (reduced motion, or a CSS override) so they cannot race the assertions.
- [ ] Time, timezone, locale, and viewport are pinned in the config; a test that needs "now" controls the clock.
- [ ] The fix removes the root cause; adding a wait or a retry to make it pass is not a fix.

### scope → `references/scope.md`

- [ ] The e2e suite is a thin layer of critical, cross-system journeys (sign-up, checkout, the core task) — not a mirror of every unit and integration case.
- [ ] A new e2e test is justified against what a cheaper integration or unit test could not catch (`architecture-and-design`, testing).
- [ ] Each test covers one journey with one primary outcome; it does not chain five unrelated features to save setup.
- [ ] Tests run against a production-like build (built assets, real routing), not a dev server with debug behaviour.
- [ ] The suite has a fast smoke subset that runs on every pull request; the full set can run less often if it is long.

---

## Limits

This skill is the design of a browser end-to-end suite. It does not cover:

- The quality of an individual test in the abstract — assertion strength, naming, one-outcome-per-test, test doubles. That is `test-quality`, and it applies to
  every e2e test too.
- The test pyramid and how much to test at each layer — `architecture-and-design`, testing.
- Component and integration testing frameworks (Testing Library, `@playwright/experimental-ct`, Cypress component testing) — the selector and network rules
  carry over, the runner setup does not.
- Unit test runners (Vitest, Jest) and their mocking APIs.
- Visual regression, performance, load, and security testing.
- CI platform configuration beyond the retry, sharding, and artifact policy here.
- Accessibility auditing — role-based selectors are an a11y signal, but the full lens is `accessibility`.

This skill states how an e2e suite is built. It is not a substitute for reading the trace of the failing run.

---

## References

This skill composes with:

- **`test-quality`** — judges each e2e test as a test: one outcome, a meaningful assertion on observable behaviour, determinism. On a conflict it decides the
  individual test and this skill decides the e2e mechanics.
- **`architecture-and-design`** — its `testing` group decides the suite shape; this skill assumes the e2e layer is thin and defers "how thin" to it.
- **`accessibility`** — querying by role and accessible name is both a robust e2e locator and an accessibility signal; the full lens lives there.
