# awesome-agent-skills

> Composable, model-agnostic AI agent skills for frontend engineering —
> TypeScript, React, Angular, architecture, accessibility, and test quality.

[![check-skills](https://github.com/danielteles/awesome-agent-skills/actions/workflows/check-skills.yml/badge.svg)](https://github.com/danielteles/awesome-agent-skills/actions/workflows/check-skills.yml)
[![License: CC BY 4.0](https://img.shields.io/badge/license-CC%20BY%204.0-blue.svg)](https://creativecommons.org/licenses/by/4.0/)

Drop-in **skills / rules** for Claude Code, Cursor, Windsurf, Codex, and any
MCP-capable agent. Six skills that compose — each builds on the others instead of
repeating the same baseline rules.

## Quick start

```bash
npx skills add danielteles/awesome-agent-skills --all                       # all six
npx skills add danielteles/awesome-agent-skills                             # pick interactively
npx skills add danielteles/awesome-agent-skills --skill react --skill core-typescript --skill architecture-and-design
```

## Which skills for which task

| Working on… | Install |
| --- | --- |
| Any TypeScript | `core-typescript` |
| Architecture decision, code review, module design | `core-typescript` + `architecture-and-design` |
| A React component or hook | `core-typescript` + `architecture-and-design` + `react` |
| An Angular component | `core-typescript` + `architecture-and-design` + `angular` |
| Any UI — markup, components, styling | the row above **+ `accessibility`** |
| Writing or reviewing tests | the row above **+ `test-quality`** |

Dependencies are not auto-resolved — install every skill a row names. Full
options are under [Install](#install).

---

## Skills

| Skill | Role |
| --- | --- |
| [`skills/core-typescript/SKILL.md`](skills/core-typescript/SKILL.md) | **Base.** Language-level TypeScript rules: compiler strictness, safe typing, inference and `satisfies`, discriminated unions, narrowing, generics, utility types, nullability, async, error handling, module hygiene, lint. |
| [`skills/architecture-and-design/SKILL.md`](skills/architecture-and-design/SKILL.md) | **Base.** Framework-neutral design and architecture: SOLID, clean code, expressive logic, type safety as design, clean architecture, feature boundaries, design patterns, state management and data fetching, security, testing strategy, DDD tactical patterns, micro-frontends, forms and validation. |
| [`skills/react/SKILL.md`](skills/react/SKILL.md) | React, on the two base skills: components and purity, the Rules of Hooks, effects, state, refs, context, data fetching and Suspense, forms and Actions, Server and Client Components, the React Compiler. |
| [`skills/angular/SKILL.md`](skills/angular/SKILL.md) | Angular, on the two base skills: standalone components, signals, block control flow, `inject()`, functional providers, typed reactive forms, zoneless-ready change detection. |
| [`skills/accessibility/SKILL.md`](skills/accessibility/SKILL.md) | **Lens.** A cross-cutting accessibility review, grounded in W3C WAI: WCAG 2.2 AA, WAI-ARIA, and the ARIA Authoring Practices Guide. Semantic HTML, accessible names, keyboard and focus, forms, contrast and motion, live regions, a11y testing. |
| [`skills/test-quality/SKILL.md`](skills/test-quality/SKILL.md) | **Lens.** Framework-neutral quality of an individual automated test: assert on behavior not implementation, meaningful assertions, one outcome-named scenario per test, builders over fixtures, test doubles that earn their place, deterministic and order-independent tests, coverage read as a map of the unverified. |

### How a skill is structured

Each skill is a directory: a lean `SKILL.md` plus a `references/` folder.

- **`SKILL.md`** — YAML frontmatter (`name`, `description`, `license: CC-BY-4.0`,
  and `metadata` with `author` and `version`), a mode-based **How to Use**
  section, and a **Ruleset**: the complete, enforceable rule list as grouped
  checkboxes, read top-to-bottom to generate and ticked against a diff to review.
  `SKILL.md` is self-sufficient — an agent can enforce every rule from it alone.
- **`references/<topic>.md`** — one file per Ruleset group, holding the
  *reasoning*, the finer detail, and `❌ / ✅` code for that topic. An agent with
  file access reads only the one or two that the current diff touches; the rule
  text lives in the Ruleset, so nothing is duplicated.

This keeps the always-loaded cost of a skill small while a review pulls in depth
only where it is needed. A skill's **Builds on** note names the skills it
composes with but does not tell the agent to load them up front — a base skill is
pulled in when the task actually turns on its layer, so a focused React task
costs one `SKILL.md`, not three.

One validator guards this — `node bin/validate-skills.mjs` (aliased as
`npm test`), run on every PR by
[`.github/workflows/check-skills.yml`](.github/workflows/check-skills.yml). It
checks the frontmatter (`name`, `description` length, `license`, `metadata`),
the 500-line body cap, every `references/` pointer, the topic slugs and
sibling-skill names named in prose, the reference-file header, the worked
example, and the per-file token budgets.

---

## How the skills compose

Two base skills, extended by the framework skills, with two cross-cutting lenses — accessibility over UI work, test-quality over test code:

```
   ┌─────────────────────┐   ┌───────────────────────────┐
   │   core-typescript   │   │  architecture-and-design  │
   │   language rules    │   │   design & architecture   │
   └──────────┬──────────┘   └─────────────┬─────────────┘
              │                            │
              └─────────────┬──────────────┘
                            │   extend / compose
               ┌────────────┴────────────┐
               ▼                         ▼
         ┌───────────┐             ┌───────────┐
         │   react   │             │  angular  │
         └───────────┘             └───────────┘

   ┌───────────────────────────────────────────────────┐
   │  accessibility  —  review lens over all UI work   │
   ├───────────────────────────────────────────────────┤
   │  test-quality   —  review lens over all test code │
   └───────────────────────────────────────────────────┘
```

- **`core-typescript`** holds the language rules every TypeScript project should
  follow, framework or not.
- **`architecture-and-design`** holds framework-neutral design and architecture
  rules. It composes with `core-typescript`: on a shared topic it decides the
  design, and `core-typescript` decides the syntax.
- **`react`** and **`angular`** extend `core-typescript` and compose with
  `architecture-and-design`, adding their framework's specifics on top. On a
  conflict, `architecture-and-design` decides the design and the framework skill
  decides the framework API.
- **`accessibility`** is a cross-cutting review lens grounded in WCAG 2.2. It
  composes with `architecture-and-design`, which defers focus management, ARIA,
  and a11y testing to it, and with the framework skills, which supply the API
  that satisfies each rule.
- **`test-quality`** is a cross-cutting lens over test code. It judges the
  individual test — what it asserts, how it is named, what it fakes, whether it
  is deterministic. Suite strategy (the pyramid, unit vs integration) stays in
  `architecture-and-design`; framework test mechanics (RTL queries, `TestBed`)
  stay in `react` / `angular`; this skill applies on top of both.

A change to a base skill propagates to every skill that builds on it.

---

## Install

Each skill is a standard `skills/<name>/SKILL.md`, so the
[`skills` CLI](https://github.com/vercel-labs/skills) can install it into Claude
Code, Cursor, Windsurf, Codex, and ~70 other assistants — straight from GitHub,
no clone needed.

```bash
# Pick from the list interactively (all six skills offered)
npx skills add danielteles/awesome-agent-skills

# Everything, no prompts
npx skills add danielteles/awesome-agent-skills --all

# Specific skills (repeat --skill, or pass several after one flag)
npx skills add danielteles/awesome-agent-skills --skill react --skill core-typescript --skill architecture-and-design

# Into one assistant, user-wide instead of the current project
npx skills add danielteles/awesome-agent-skills --skill react -a claude-code -g

# List what the repo offers without installing
npx skills add danielteles/awesome-agent-skills --list

# Try one without installing
npx skills use danielteles/awesome-agent-skills@react | claude
```

Project scope (default) writes to `./.claude/skills/`; `-g` writes to
`~/.claude/skills/`. Manage installs with `npx skills list`,
`npx skills update`, and `npx skills remove <name>`.

**Dependencies are not resolved automatically.** The `skills` CLI installs only
what you name, so when you add `react` or `angular`, also add `core-typescript`
and `architecture-and-design`; add `accessibility` for any UI work, and
`test-quality` when writing or reviewing tests.

Prefer to wire it up by hand? Copy or reference the `SKILL.md` files under
[`skills/`](skills/) into wherever your agent loads skills or rules.

**On a rule-injection runtime** (`.cursorrules`, `.windsurfrules`, a raw system
prompt — anything with no file-read step), point it at the `SKILL.md` files
**only**. Each one is a complete ruleset on its own; concatenating the whole
`skills/` tree would pull in every `references/` file and undo the size saving.

---

## Project structure

```
awesome-agent-skills/
├── skills/
│   ├── core-typescript/
│   │   ├── SKILL.md                     # Base: TypeScript language rules + Ruleset
│   │   └── references/                  # one <topic>.md per Ruleset group
│   ├── architecture-and-design/         # Base: framework-neutral design & architecture
│   │   ├── SKILL.md
│   │   └── references/
│   ├── react/                           # React, on the two base skills
│   │   ├── SKILL.md
│   │   └── references/
│   ├── angular/                         # Angular, on the two base skills
│   │   ├── SKILL.md
│   │   └── references/
│   ├── accessibility/                   # Lens: WCAG 2.2 AA review, across all UI work
│   │   ├── SKILL.md
│   │   └── references/
│   └── test-quality/                    # Lens: quality of an individual automated test
│       ├── SKILL.md
│       └── references/
├── templates/                          # scaffolds for a new skill (see CONTRIBUTING.md)
│   ├── SKILL.md
│   ├── reference.md
│   └── worked-example.md
├── bin/
│   └── validate-skills.mjs              # one validator: frontmatter, contract, and token budgets
├── CONTRIBUTING.md
├── LICENSE
└── README.md
```

---

## Contributing

New skills and fixes are welcome. [`CONTRIBUTING.md`](CONTRIBUTING.md) is the
full contract — frontmatter, body sections, the Output Format, reference-file
rules, token budgets, and the review process. Copy [`templates/`](templates/)
(`SKILL.md`, `reference.md`, `worked-example.md`) to start a skill without
reading an existing one, fill every `<placeholder>`, and run `npm test`
(`node bin/validate-skills.mjs`) before opening a pull request.

---

## Licensing

The skill content in this repository (`skills/**` and all Markdown) is licensed
under the **Creative Commons Attribution 4.0 International (CC BY 4.0)** license.
You may share and adapt it for any purpose, including commercially, as long as
you give appropriate credit, link to the license, and indicate any changes.

See [`LICENSE`](./LICENSE) for the full text. CC BY 4.0 reference:
<https://creativecommons.org/licenses/by/4.0/>.
