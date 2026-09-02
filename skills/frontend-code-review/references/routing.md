# Routing a Diff to Skills — why

The rules are in the `frontend-code-review` Ruleset (`routing` group). This file is the reasoning
and an example — it adds no rule the Ruleset does not state.

- **Classify by file, then by change.** The file extension picks the baseline (`.ts` → language,
  `.vue`/`.tsx` → a component); what the change *does* adds lenses — a new `<img>` or CSS pulls in
  `styling-and-design-tokens` and `web-performance`, a new interactive element pulls in
  `accessibility`, a new user-facing string or formatted value pulls in `i18n-and-localization`, a
  change to a library component's props pulls in `component-api-design`, a new `*.spec.ts` pulls in
  `test-quality` or `e2e-testing`.
- **Base first.** A framework finding often rests on a language or design point
  (`architecture-and-design` says "extract a repository", `react` then says "call it from a
  loader"). Running base skills first means the framework and lens passes build on settled ground.
- **One framework skill.** Applying `react` and `vue` to the same file produces noise and
  contradictions. Detect the framework once from the codebase and run only that skill.
- **Name the gaps.** If the diff adds a `.module.css` file and no styling review is in scope, that
  absence is a `routing` finding — the review is incomplete, and the author should know.

| Changed file / change | Skills, in order |
|---|---|
| `*.ts` (no framework) | `core-typescript` → `architecture-and-design` |
| React/Vue/Angular component | `core-typescript` → `architecture-and-design` → framework skill → `accessibility` |
| + touches CSS / tokens | … + `styling-and-design-tokens` |
| + touches loading / bundle / rendering | … + `web-performance` |
| + adds user-facing text or a formatted value | … + `i18n-and-localization` |
| shared / library component's props or slots | … + `component-api-design` |
| `*.test.ts(x)` | `test-quality` (+ framework `testing` group) |
| `*.spec.ts` e2e | `e2e-testing` → `test-quality` |
| structural / cross-cutting | `architecture-and-design` (leading) |

```text
# ❌ ran react on every file, skipped the new stylesheet
files: Button.tsx, Button.module.css, Button.test.tsx
review: react findings only

# ✅ routed each file, base-first, gaps named
Button.tsx        → core-typescript, architecture-and-design, react, accessibility
Button.module.css → styling-and-design-tokens  (+ web-performance: font-display)
Button.test.tsx   → test-quality, react/testing
```
