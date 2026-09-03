# Merging into One Review — why

The rules are in the `frontend-code-review` Ruleset (`merging` group).

- **One list, one order.** An author fixes a file top to bottom. Grouping by file and sorting by
  line number lets them walk the diff once. Sorting `must-fix` above `consider` within that means
  the blocking items are read first.
- **Every finding keeps its source.** `must-fix · effects · …` tells the author which skill's rule
  to open. A merged review that drops the topic is just opinions.
- **Lead with a summary.** "6 files · 3 must-fix · 4 consider · blocks merge" lets a reviewer triage
  before reading a line. Any `must-fix` blocks; zero `must-fix` does not.
- **No findings is a valid review.** If nothing broke a rule, say "No findings — 6 files reviewed
  against core-typescript, react, accessibility." Do not pad with style nits the skills did not
  raise.
- **Report, do not rewrite.** The output names the rule and the change. Rewriting the author's
  patch for them removes their authorship and hides which rule drove which edit.

```text
# ✅ merged review
6 files · 2 must-fix · 3 consider · blocks merge

CartSummary.tsx
  must-fix · effects · CartSummary.tsx:12 — derived state set in an Effect. Compute it in render. (react)
  consider · purity · CartSummary.tsx:3 — React.FC. Type the props directly. (react)

cart-summary.module.css
  must-fix · tokens · cart-summary.module.css:8 — raw #2b8a3e. Use var(--color-success). (styling-and-design-tokens)

CartSummary.test.tsx
  consider · assertions · CartSummary.test.tsx:20 — toBeTruthy() on the total. Assert the value. (test-quality)
```
