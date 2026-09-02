# awesome-agent-skills

A collection of composable AI agent **skills / rules** for tools such as
**Claude Code**, **Cursor**, **Windsurf**, and **MCP servers**.

The goal is a single source of truth for reusable coding guidance: composable
skills that build on one another instead of repeating the same baseline rules.

---

## Skills

| Skill | Role |
| --- | --- |
| [`skills/core-typescript/SKILL.md`](skills/core-typescript/SKILL.md) | **Base.** Language-level TypeScript rules: compiler strictness, safe typing, inference and `satisfies`, discriminated unions, narrowing, generics, utility types, nullability, async, error handling, module hygiene, lint. |
| [`skills/architecture-and-design/SKILL.md`](skills/architecture-and-design/SKILL.md) | **Base.** Framework-neutral design and architecture: SOLID, clean code, expressive logic, type safety as design, clean architecture, feature boundaries, design patterns, state management and data fetching, security, testing strategy, DDD tactical patterns, micro-frontends, forms and validation. |
| [`skills/react/SKILL.md`](skills/react/SKILL.md) | React, on the two base skills: components and purity, the Rules of Hooks, effects, state, refs, context, data fetching and Suspense, forms and Actions, Server and Client Components, the React Compiler. |
| [`skills/angular/SKILL.md`](skills/angular/SKILL.md) | Angular, on the two base skills: standalone components, signals, block control flow, `inject()`, functional providers, typed reactive forms, zoneless-ready change detection. |
| [`skills/accessibility/SKILL.md`](skills/accessibility/SKILL.md) | **Lens.** A cross-cutting accessibility review, grounded in W3C WAI: WCAG 2.2 AA, WAI-ARIA, and the ARIA Authoring Practices Guide. Semantic HTML, accessible names, keyboard and focus, forms, contrast and motion, live regions, a11y testing. |

Each skill is a `skills/<name>/SKILL.md` file with YAML frontmatter (`name`,
`description`) and a fixed layout: a mode-based **How to Use** section, a
**Rules at a Glance** index, a rule catalog as `rule → why` tables with
`❌ / ✅` examples, a **Code Review Checklist**, and a **Worked Example**.

---

## How the skills compose

Two base skills, extended by the framework skills, with accessibility as a lens across all UI work:

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
   │  accessibility  —  review lens across all UI work │
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

A change to a base skill propagates to every skill that builds on it.

---

## Install

Each skill is a standard `skills/<name>/SKILL.md`, so the
[`skills` CLI](https://github.com/vercel-labs/skills) can install it into Claude
Code, Cursor, Windsurf, Codex, and ~70 other assistants — straight from GitHub,
no clone needed.

```bash
# Pick from the list interactively (all five skills offered)
npx skills add danieelteles/awesome-agent-skills

# Everything, no prompts
npx skills add danieelteles/awesome-agent-skills --all

# Specific skills (repeat --skill, or pass several after one flag)
npx skills add danieelteles/awesome-agent-skills --skill react --skill core-typescript --skill architecture-and-design

# Into one assistant, user-wide instead of the current project
npx skills add danieelteles/awesome-agent-skills --skill react -a claude-code -g

# List what the repo offers without installing
npx skills add danieelteles/awesome-agent-skills --list

# Try one without installing
npx skills use danieelteles/awesome-agent-skills@react | claude
```

Project scope (default) writes to `./.claude/skills/`; `-g` writes to
`~/.claude/skills/`. Manage installs with `npx skills list`,
`npx skills update`, and `npx skills remove <name>`.

**Dependencies are not resolved automatically.** The `skills` CLI installs only
what you name, so when you add `react` or `angular`, also add `core-typescript`
and `architecture-and-design`; add `accessibility` for any UI work.

Prefer to wire it up by hand? Copy or reference the `SKILL.md` files under
[`skills/`](skills/) into wherever your agent loads skills or rules.

---

## Project structure

```
awesome-agent-skills/
├── skills/
│   ├── core-typescript/SKILL.md         # Base: TypeScript language rules
│   ├── architecture-and-design/SKILL.md # Base: framework-neutral design & architecture
│   ├── react/SKILL.md                   # React, on the two base skills
│   ├── angular/SKILL.md                 # Angular, on the two base skills
│   └── accessibility/SKILL.md           # Lens: WCAG 2.2 AA review, across all UI work
├── LICENSE
└── README.md
```

---

## Licensing

The skill content in this repository (`skills/**` and all Markdown) is licensed
under the **Creative Commons Attribution 4.0 International (CC BY 4.0)** license.
You may share and adapt it for any purpose, including commercially, as long as
you give appropriate credit, link to the license, and indicate any changes.

See [`LICENSE`](./LICENSE) for the full text. CC BY 4.0 reference:
<https://creativecommons.org/licenses/by/4.0/>.
