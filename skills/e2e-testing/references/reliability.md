# Retries, Sharding, and CI Policy — why

The rules are in the `e2e-testing` Ruleset (`reliability` group). This file is the reasoning and a
`❌ / ✅` example — it adds no rule the Ruleset does not state.

- **Retries hide flakes; use them sparingly and only in CI.** One or two CI retries keep an
  unrelated infrastructure blip from failing a merge. More than that, or retries enabled locally,
  and real non-determinism stops being visible — the suite passes while the product is broken for
  some users.
- **A retry pass is not a green.** Playwright and Cypress both report which tests passed only on
  retry. That list is a bug backlog: each one is triaged (`flake-triage`), not celebrated.
- **Parallel + sharded keeps it fast.** A suite that takes 40 minutes does not get run. Full
  parallelism plus sharding across CI machines brings wall-clock time to a few minutes, which is
  what makes it a gate people trust.
- **Capture evidence on failure.** A trace (DOM snapshots, network, console), a screenshot, and a
  video, retained on failure and first retry and uploaded as artifacts, turn "flaky on CI, can't
  reproduce" into a five-minute diagnosis.
- **Quarantine, do not tolerate.** A test that flakes goes to a non-blocking lane with a ticket and
  an owner. Leaving it in the main suite on retries erodes trust in every red build.

```ts
// ❌ retries everywhere (including locally), no artifacts, single worker
export default defineConfig({
  retries: 5,
  workers: 1,
  use: { trace: 'off', video: 'off' },
});

// ✅ CI-only capped retries, parallel, evidence on failure
export default defineConfig({
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  fullyParallel: true,
  use: { trace: 'on-first-retry', screenshot: 'only-on-failure', video: 'retain-on-failure' },
});
```
