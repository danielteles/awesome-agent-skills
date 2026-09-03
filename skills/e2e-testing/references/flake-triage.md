# Flake Triage — why

The rules are in the `e2e-testing` Ruleset (`flake-triage` group).

- **Reproduce before fixing.** A flake fixed by guesswork is a flake moved, not removed. Run it in
  a loop (`--repeat-each=20`, or a shell loop) with the trace retained until it fails, then read
  the trace.
- **Name the category — the fix follows from it:**

  | Cause | Fix |
  |---|---|
  | Fixed timeout too short | Retrying assertion on the real condition. |
  | Animation / transition race | Disable animations in the test env. |
  | Network race (response after assertion) | `waitForResponse` / intercept alias before asserting. |
  | Shared or leftover data | Per-test data, unique ids (`test-data`). |
  | Test-order coupling | Remove the cross-test dependency; run isolated. |
  | Clock / timezone / locale | Pin them in config; control the clock for "now". |
  | Real product bug | Fix the product; the flake was telling the truth. |

- **Disable animations.** A CSS transition that usually finishes in 150 ms occasionally takes 400 ms
  under CI load and the click lands on a moving target. Force reduced motion or zero out
  `transition`/`animation` durations globally in the test environment.
- **Pin the environment.** Timezone, locale, and viewport in the config; a frozen clock for any
  test that renders or computes with the current time.
- **The fix is the root cause.** Adding `waitForTimeout` or bumping `retries` makes the symptom
  rarer, not gone.

```ts
// ❌ "fixed" by sleeping past the animation
await page.getByRole('button', { name: 'Open menu' }).click();
await page.waitForTimeout(500); // sometimes the slide-in takes longer
await page.getByRole('menuitem', { name: 'Settings' }).click();

// ✅ animations disabled in config; assertion waits for the item to be actionable
// playwright.config: use: { reducedMotion: 'reduce' }  + a global CSS override of transition-duration
await page.getByRole('button', { name: 'Open menu' }).click();
await page.getByRole('menuitem', { name: 'Settings' }).click(); // auto-waits for stable + visible
```
