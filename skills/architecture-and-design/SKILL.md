---
name: architecture-and-design
description: >-
  Framework-neutral architecture and design standards for frontend engineering in
  TypeScript (React, Angular, Vue, or any component framework): SOLID and clean
  code, clean architecture and layer boundaries, feature-first structure, the
  adapter/repository pattern, state tiers and data fetching, security, testing
  strategy, DDD tactical patterns, micro-frontends, forms. Use it when generating
  a component or module, refactoring frontend code, reviewing a pull request, or
  making an architecture decision, or when the user says "code review", "clean
  architecture", "SOLID", "design pattern", "DDD", "bounded context",
  "micro-frontend", "data fetching", "form validation", or "how should I
  structure this".
license: CC-BY-4.0
metadata:
  author: danielteles
  version: "1.0"
---

# Architecture and Design — Base Engineering Skill

Framework-neutral architecture standards, design principles, and structure patterns for web
applications in TypeScript. The principles hold for React, Angular, Vue, and any component-based
framework. Code examples use React/TSX for one concrete syntax; each principle has an equivalent in
an Angular template or a Vue SFC.

> **Builds on.** `core-typescript` (language syntax). On a shared topic this skill decides the
> design and `core-typescript` decides the syntax. `react`, `angular`, or `vue` gives the framework
> form and `accessibility` the UI lens. The Ruleset below is complete on its own; load a companion
> skill when the task turns on its layer, not by default. If a named skill is not loaded, apply that
> layer from general knowledge and do not block.

This SKILL.md is self-sufficient — the **Ruleset** below is the complete, enforceable list, and
nothing here depends on a `references/` file being read. Each `references/<topic>.md` holds the
*reasoning*, diagrams, and code for one Ruleset group (`references/state-and-data.md`,
`references/security.md`, …), plus `references/worked-example.md`. Open them for depth when your
runtime allows.

---

## How to Use This Skill

Pick the mode that matches the task. Do the steps in order.

| Mode | Steps |
|---|---|
| **Generate** — write a new component, hook, or module | 1. Apply `solid`, `clean-code`, `expressive-logic`, `type-safety`, and `state-and-data` as you write. 2. Model async state as a discriminated union (`patterns`). 3. Validate external data at the boundary (`type-safety`). 4. Run the Ruleset as a checklist. Fix each fail before you hand off. |
| **Review** — check a pull request or a diff | 1. Run the Ruleset against the diff. 2. Write one finding per fail, in the Output Format below. 3. Order the findings: `must-fix` first, then `consider`. 4. If nothing fails, say so in one line. Do not invent findings. |
| **Refactor** — restructure existing code | 1. Change the structure, keep the behavior. 2. Lean on `clean-code`, `expressive-logic`, and `state-and-data`. 3. One kind of change per commit. 4. Keep the tests green (`testing`). |

### Output Format

Write one finding per line:

```
<severity> · <topic> · <file>:<line> — <what is wrong>. <the fix as an action>.
```

- `<severity>` is `must-fix` (breaks a rule in this skill) or `consider` (safe, but a rule prefers another form).
- `<topic>` is a Ruleset topic slug (`state-and-data`, `type-safety`, `security`, …).

### Rules for Every Mode

- Name the Ruleset topic when you enforce a rule.
- State the reason, not only the rule. "This re-renders the whole tree" beats "move state down".
- Name the rule and the change; do not rewrite the author's code in silence.
- A principle serves the code. When two principles conflict, pick the one that makes the code simpler to read and change, and say why.
- When the task is a decision, not a diff, weigh the options against `solid`, `clean-architecture`, `structure`, `state-and-data`, and `micro-frontends`, and
  record the choice as an ADR in the repo using `assets/adr-template.md` (context, options, decision, consequences).

---

## Ruleset

The complete rule list. Read it top to bottom when generating; tick each box against a diff when
reviewing. Each group links to its `references/` file for rationale and examples. On a shared topic
such as discriminated unions or branded ids, this skill decides the design and `core-typescript`
decides the syntax.

### solid → `references/solid.md`

- [ ] **SRP:** rendering is separated from data fetching, state transitions, and domain math (into components, hooks, services, pure functions).
- [ ] **OCP:** component variability comes from `children`, slots, or render props — never a boolean flag per variant.
- [ ] **LSP:** a custom primitive or a mock honors the full interface its consumers expect.
- [ ] **ISP:** a component receives the exact props it reads, not a whole domain entity.
- [ ] **DIP:** business logic and UI depend on an injected interface, token, or context — not a concrete client, SDK, or `localStorage`.

### clean-code → `references/clean-code.md`

- [ ] Booleans named `is` / `has` / `should` / `can`; functions named with a verb; one term per concept, no unclear abbreviations.
- [ ] Functions short enough to read without scrolling; the parameter-list shape is `core-typescript`, functions.
- [ ] No boolean flag parameter that switches behavior — two functions instead.
- [ ] Comments say *why*, not *what*; no dead code (commented blocks, unused exports, unreachable branches).
- [ ] No mutation of a parameter, prop, or state in place — a new value is built and returned.
- [ ] Every error is handled or rethrown — never an empty `catch`.

### expressive-logic → `references/expressive-logic.md`

- [ ] No `x ? true : false`, no `if (c) return true; else return false`, no comparison against a boolean literal.
- [ ] Guard clauses over nested conditionals; every condition stated in the positive.
- [ ] A long boolean chain is given a name (a variable or a predicate function).
- [ ] `?.` / `??` over a manual `&&` null chain (when `??` beats `||` is `core-typescript`, nullability).
- [ ] Magic numbers and strings have named constants.
- [ ] An `if/else if` ladder on one value is a typed lookup or an exhaustive `switch` with an `assertNever` default.

### type-safety → `references/type-safety.md`

- [ ] External input enters as `unknown` and is narrowed at the boundary; the `any` and cast syntax rules are `core-typescript`, unsafe-types.
- [ ] Mutually exclusive states are a discriminated union, not an object of optional fields.
- [ ] Illegal values are unrepresentable: `readonly`, `as const`, branded id types.
- [ ] Network data is parsed against a schema at the adapter, then mapped to the domain model.
- [ ] API types are generated from the contract (OpenAPI, GraphQL codegen, tRPC), not hand-written.
- [ ] Environment and runtime config are validated against a schema at startup.

### clean-architecture → `references/clean-architecture.md`

- [ ] The domain core has zero framework, DOM, or network imports.
- [ ] Dependencies point inward: UI → use cases → domain; infrastructure implements the domain's interfaces (dependency inverted).

### structure → `references/structure.md`

- [ ] Code is organized by business feature, not by technical role (no `components/` / `services/` / `utils/` dumping grounds).
- [ ] `features` import `shared`; `shared` never imports `features`.
- [ ] A feature never imports another feature's internal files — only its `index.ts`, shared state, or routing.
- [ ] The boundary is enforced by a linter (`eslint-plugin-boundaries`, Nx module boundaries).

### patterns → `references/patterns.md`

- [ ] A third-party library, SDK, or raw API response is hidden behind an adapter / repository that returns a domain model.
- [ ] Async state is a discriminated union with a `status` discriminant — not loose `isLoading` / `isError` / `hasData` booleans.

### state-and-data → `references/state-and-data.md`

- [ ] State is colocated in the component that uses it; lifted only when a second component needs it.
- [ ] A value that can be computed from props or other state is derived, not stored.
- [ ] A server collection held in a client store is normalized — each entity once, keyed by id; data in a query cache stays as fetched.
- [ ] Each state kind sits in its tier: server-cache library / URL params / a small store or context / the component.
- [ ] Context holds only low-frequency values; a fast-changing value goes in a store with selectors, not a wide context.
- [ ] Server data goes through a cache library keyed by its inputs — not fetched in an effect into local state.
- [ ] Server data is fetched at the point of use, not prop-drilled from a far ancestor.
- [ ] Independent requests load in parallel, not as a parent → child waterfall.
- [ ] A mutation updates the cache from its response; an optimistic update has a rollback path.
- [ ] An explicit stale time and retry policy per query type.

### frontend-practices → `references/frontend-practices.md`

- [ ] Filters, maps, and chains are computed before the return, out of the template.
- [ ] Every async state is modeled: loading, empty, error, success.
- [ ] List keys are stable ids, never the array index for a list that can reorder.
- [ ] A derived value or an event handler over a lifecycle side effect; a side effect that remains has one concern and a cleanup.
- [ ] Each independent region has its own error boundary and fallback, not only the app root.
- [ ] A stale async result is cancelled or ignored (`AbortController` or an ignore flag).
- [ ] A caught error is sent to a tracker with the source map, the release tag, and session context.
- [ ] No `console.log` ships; logging goes through one structured logger.
- [ ] A semantic element over a `div` with a handler; every input and icon-only control labelled. Full lens: `accessibility`.

### security → `references/security.md`

- [ ] No HTML is built from untrusted input; what must render as HTML is sanitized (DOMPurify) first.
- [ ] `dangerouslySetInnerHTML` / `[innerHTML]` / `v-html` and every `bypassSecurityTrust*` are avoided; each remaining use is reviewed.
- [ ] No secrets in the bundle — a third-party key lives on a server.
- [ ] `rel="noopener noreferrer"` on every `target="_blank"` link.
- [ ] A redirect URL from a query param is checked against an allowlist; a `javascript:` or `data:` URL from user data is rejected.
- [ ] Token storage is chosen on purpose and the trade-off is written down.
- [ ] CSP in enforcing mode, nonce-based for scripts; Trusted Types where the browser supports it.
- [ ] With cookie auth, an anti-CSRF token on every state-changing request, and `SameSite` set.
- [ ] A third-party `<iframe>` has a `sandbox` with only the capabilities it needs.
- [ ] A new dependency is reviewed before adding it (maintenance, transitive weight, provenance).

### testing → `references/testing.md`

- [ ] The suite is weighted toward integration: a static-analysis base, unit tests for pure logic, a thick layer of component-plus-collaborator tests with the
      network mocked at the edge, a thin top of end-to-end tests for critical paths.
- [ ] Domain and use cases: fast unit tests on plain functions, no DOM or network.
- [ ] Components: queried by role and label, asserted on what the user sees; a `data-testid` only when no accessible name fits.
- [ ] Coverage is enforced on the lines a change touches, not a global percentage.
- [ ] Every bug fix ships with a test that fails before the fix.
- [ ] The API boundary is contract-tested, or types are generated from the contract and the payload validated.
- [ ] A flaky test is quarantined on the first flake and fixed within the sprint.
- [ ] A snapshot is used only for small, stable output.
- [ ] Each test also passes the `test-quality` Ruleset — asserts on behavior not implementation, has a meaningful assertion, is deterministic and
      order-independent. This group decides the suite *shape*; `test-quality` judges the individual test.

### ddd → `references/ddd.md`

- [ ] One ubiquitous name per concept across code, tests, UI, and API (`Cart` everywhere, not `Basket` / `Order`).
- [ ] Entities and value objects live in the feature's `model/`, free of framework and network code.
- [ ] A value object is immutable — a new instance to change it.
- [ ] An aggregate's inner parts are reached only through its root.
- [ ] A domain event is named in the past tense and treated as a fact, not a command.
- [ ] One model per bounded context; translate at the edge.

### micro-frontends → `references/micro-frontends.md`

- [ ] The default is a modular monolith; a split happens only when an independent per-team deploy is the actual bottleneck.
- [ ] The shell and each remote share a versioned contract: a mount function, props in, events out.
- [ ] The framework and the design system are shared as pinned singletons.
- [ ] A remote that fails to load or throws does not blank the shell.
- [ ] Routing and auth stay in the shell; identity passes down.

### forms → `references/forms.md`

- [ ] Draft state is local to the form or a form library — never lifted into global state.
- [ ] One validation schema, next to the domain model, reused on client and server.
- [ ] `isValid` / `isDirty` / per-field errors are derived from form state, not stored.
- [ ] Uncontrolled inputs with a form library for a large form; a field component's controlled / uncontrolled contract is `component-api-design`.
- [ ] A server validation error is mapped back onto its field.
- [ ] Submit is disabled while a submit is in flight; entered values survive a failed submit.

---

## Limits

This skill covers frontend architecture and design. It does not cover:

- Backend, database, or infrastructure design.
- Distributed systems — microservices, event-driven backends, sagas. `ddd` covers tactical patterns inside one app; `micro-frontends` the frontend split
  only.
- Styling, tokens, and CSS architecture — `styling-and-design-tokens`.
- Accessibility beyond "a semantic element and a label" — `accessibility`.
- Performance budgets, Core Web Vitals, and bundle analysis — `web-performance`.
- A reusable component's public API (`component-api-design`) and internationalization (`i18n-and-localization`).
- CI configuration, dependency bots, release tooling, and monorepo setup.
- Framework-specific rules (hooks, memoization, change detection, reactivity) — `react` / `angular` / `vue`.

This skill states principles. It is not a substitute for reading the code and understanding the domain.

---

## References

This skill composes with:

- **`core-typescript`** — the language base. On a shared topic this skill decides the design and `core-typescript` decides the syntax.
- **`react`** / **`angular`** / **`vue`** — the framework form of these rules. Apply the matching one in a React, Angular, or Vue codebase; it wins on a direct
  conflict.
- **`accessibility`** — the review lens for UI: ARIA, keyboard and focus, live regions, a11y testing.
- **`test-quality`** — this skill's `testing` group sets the suite shape; `test-quality` judges each individual test.
