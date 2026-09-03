# De-duplicating Findings — why

The rules are in the `frontend-code-review` Ruleset (`dedup` group). This file is the reasoning and
an example — it adds no rule the Ruleset does not state.

- **The same line, the same issue, one finding.** A `<div onClick>` will be flagged by
  `accessibility` (no role, not focusable) and by the framework skill (use a `<button>`). Reporting
  both makes the review look twice as long and buries the signal. Collapse to one line.
- **Keep the owner's version.** Each skill owns a slice of the decision:

  | Issue on the line | Owner |
  |---|---|
  | Accessibility requirement (role, name, focus, contrast) | `accessibility` |
  | Framework API (which hook, which directive, `ref` as prop) | the framework skill |
  | A CSS value, token, layer, or query | `styling-and-design-tokens` |
  | A performance budget or loading strategy | `web-performance` |
  | A translatable string or a locale-sensitive format | `i18n-and-localization` |
  | A component's props, slots, or controlled contract | `component-api-design` |
  | A design or layering decision | `architecture-and-design` |
  | A type, `any`, narrowing, or syntax point | `core-typescript` |
  | What a test asserts or fakes | `test-quality` |
  | A locator, a wait, or suite isolation in an e2e spec | `e2e-testing` |

- **Credit the other skill.** The kept finding says "…also flagged by `react`" so the author sees
  it fails on two axes and is not tempted to fix only one.
- **Different issues stay separate.** Two findings on line 12 — one about the `key`, one about a
  raw hex colour — are unrelated and both stay.
- **Surface real conflicts.** If `web-performance` says "inline this critical CSS" and
  `styling-and-design-tokens` says "keep it in the layered stylesheet", do not pick silently — show
  both and recommend one.

```text
# ❌ two lines, same problem
must-fix · accessibility · Toolbar.tsx:14 — <div onClick> is not focusable and has no role. [WCAG 4.1.2]
must-fix · purity · Toolbar.tsx:14 — a <div> with a handler. Use <button>.

# ✅ one line, owner kept, other skill credited
must-fix · accessibility · Toolbar.tsx:14 — <div onClick> has no role, name, or keyboard behaviour. Use <button type="button"> with an accessible name. Also flagged by `react` (purity). [WCAG 4.1.2, 2.1.1]
```
