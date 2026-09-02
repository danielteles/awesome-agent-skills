# awesome-agent-skills

A collection of composable AI agent **skills / rules** for tools such as
**Claude Code**, **Cursor**, **Windsurf**, and **MCP servers**.

The goal is a single source of truth for reusable coding guidance: composable
skills that build on one another instead of repeating the same baseline rules.

---

## Skills

| Skill | Role |
| --- | --- |
| [`rules/core-typescript.md`](rules/core-typescript.md) | **Base.** Language-level TypeScript rules: compiler strictness, safe typing, inference and `satisfies`, discriminated unions, narrowing, generics, utility types, nullability, async, error handling, module hygiene, lint. |
| [`rules/architecture-and-design.md`](rules/architecture-and-design.md) | **Base.** Framework-neutral design and architecture: SOLID, clean code, expressive logic, type safety as design, clean architecture, feature boundaries, design patterns, state management and data fetching, security, testing strategy, DDD tactical patterns, micro-frontends, forms and validation. |
| [`rules/react.md`](rules/react.md) | React, on the two base skills: components and purity, the Rules of Hooks, effects, state, refs, context, data fetching and Suspense, forms and Actions, Server and Client Components, the React Compiler. |
| [`rules/angular.md`](rules/angular.md) | Angular, on the two base skills: standalone components, signals, block control flow, `inject()`, functional providers, typed reactive forms, zoneless-ready change detection. |
| [`rules/accessibility.md`](rules/accessibility.md) | **Lens.** A cross-cutting accessibility review, grounded in W3C WAI: WCAG 2.2 AA, WAI-ARIA, and the ARIA Authoring Practices Guide. Semantic HTML, accessible names, keyboard and focus, forms, contrast and motion, live regions, a11y testing. |

Each skill is a single Markdown file with YAML frontmatter (`name`,
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

## Usage

Copy or reference the files under [`rules/`](rules/) into wherever your agent
loads skills or rules — a Claude Code skills directory, a Cursor rules folder,
an MCP server's context. Load a framework skill together with the two base
skills it builds on.

---

## Project structure

```
awesome-agent-skills/
├── rules/
│   ├── core-typescript.md         # Base: TypeScript language rules
│   ├── architecture-and-design.md # Base: framework-neutral design & architecture
│   ├── react.md                   # React, on the two base skills
│   ├── angular.md                 # Angular, on the two base skills
│   └── accessibility.md           # Lens: WCAG 2.2 AA review, across all UI work
├── LICENSE
└── README.md
```

---

## Licensing

The skill content in this repository (`rules/**` and all Markdown) is licensed
under the **Creative Commons Attribution 4.0 International (CC BY 4.0)** license.
You may share and adapt it for any purpose, including commercially, as long as
you give appropriate credit, link to the license, and indicate any changes.

See [`LICENSE`](./LICENSE) for the full text. CC BY 4.0 reference:
<https://creativecommons.org/licenses/by/4.0/>.
