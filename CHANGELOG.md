# Changelog

All notable changes to this repository are recorded here, following
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

This project has not cut a tagged release yet, so everything built so far sits
under **Unreleased**. On the first release its entries move under a
`## [x.y.z] - DATE` heading (see [CONTRIBUTING.md](CONTRIBUTING.md#releasing)).

Per-skill versions live in each `SKILL.md` frontmatter (`metadata.version`) and
move independently; this file tracks the repository as a whole.

## [Unreleased]

### Skills

- `core-typescript` and `architecture-and-design` — the base skills: language-level
  TypeScript rules, and framework-neutral design and architecture.
- `react`, `angular`, `vue` — framework skills built on the two base skills.
- `accessibility`, `styling-and-design-tokens`, `web-performance`,
  `i18n-and-localization` — cross-cutting review lenses over UI work.
- `test-quality` and `e2e-testing` — the individual test, and end-to-end suite
  design.
- `component-api-design` — the public API of a reusable component, sitting
  between design and the framework skills.
- `frontend-code-review` — a meta skill that routes a diff to the other skills
  and merges their findings.
- Review pass over the new skills: Vue 3 `v-if` / `v-for` precedence and the
  Pinia write-path rule corrected; `frontend-code-review` now routes to
  `i18n-and-localization` and `component-api-design`, and its `merging` order
  rule matches its reference (file, then severity, then line); invented findings
  removed from worked examples; the original skills' Limits name the lens that
  owns each concern they defer.

### Structure and docs

- Every skill is a lean `SKILL.md` plus on-demand `references/<topic>.md`, each
  reference opening with reasoning and, where code clarifies, `❌ / ✅` examples,
  and a `worked-example.md` per skill.
- `CONTRIBUTING.md` documents the full contract; `templates/` (`SKILL.md`,
  `reference.md`, `worked-example.md`) scaffold a new skill.
- Frontmatter carries `license: CC-BY-4.0` and `metadata` (`author`, `version`).
- Builds-on notes are tool-neutral and state a fallback when a sibling skill is
  not loaded.
- README reworked for discoverability — tagline, badges, quick start, a
  "which skills for which task" matrix — with the Skills table and structure
  tree generated from frontmatter.
- Assets: `architecture-and-design/assets/adr-template.md`,
  `core-typescript/assets/tsconfig.base.json` and `eslint.config.js`,
  `test-quality/assets/builder.template.ts`.

### Tooling

- `bin/validate-skills.mjs` — one validator: frontmatter keys, name regex,
  description length, the 500-line body cap, every `references/` pointer, topic
  slugs, sibling-skill names, the reference-file header, the worked example, and
  the per-file token budgets.
- `bin/sync-readme.mjs` — regenerates the README Skills table and structure tree;
  `--check` runs in `npm test`.
- `bin/bump-version.mjs` — bump a skill's `metadata.version`.
- `npm test` runs the validator, the README check, and `markdownlint-cli2`
  (a 160-character ceiling on prose and list-item lines).
- CI (`pull_request` only): Node 22, action commit SHAs pinned with Dependabot
  for GitHub Actions, plus a second step running `skills-ref validate` on every
  skill.
