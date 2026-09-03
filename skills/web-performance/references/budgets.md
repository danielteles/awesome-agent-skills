# Performance Budgets — why

The rules are in the `web-performance` Ruleset (`budgets` group).

- **A budget makes performance a check, not a vibe.** Without a written number, "is this fast
  enough?" is re-litigated in every review and regressions land unnoticed. A budget per route —
  LCP, INP, CLS, plus a JS transfer ceiling and request count — turns it into a pass/fail gate.
- **Enforce it in CI.** A bundle-size assertion and Lighthouse CI on every pull request catch the
  regression on the branch that caused it, where it is cheap to fix. Catching it a month later in
  the field means a bisect across dozens of merges.
- **Third parties get their own budget.** Tag managers, chat widgets, and analytics are the most
  common cause of a blown main-thread budget and the easiest to add without review. Each one is
  justified against a byte and blocking-time allowance, loaded `async`/`defer`, and gated on consent
  where the law requires.
- **Derive the number from reality.** The CWV "good" thresholds are the floor. Set the route budget
  from current p75 field data and what the competition ships, then ratchet it down.
- **Verify in the field.** A green Lighthouse run is a prediction. Confirm the change moved p75 in
  CrUX/RUM after release.

```jsonc
// ❌ no budget — bundle grows one PR at a time until the page is slow
// (nothing in CI checks size or Lighthouse)

// ✅ a size budget enforced on every PR (e.g. size-limit)
// .size-limit.json
[
  { "path": "dist/assets/entry-*.js", "limit": "160 kB" },
  { "path": "dist/assets/route-checkout-*.js", "limit": "90 kB" }
]
```
