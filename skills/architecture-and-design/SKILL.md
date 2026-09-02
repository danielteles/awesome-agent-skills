---
name: architecture-and-design
description: >-
  Framework-neutral architecture and design standards for frontend engineering in
  TypeScript (React, Angular, Vue, or any component framework): SOLID, clean
  code, expressive logic, type safety as design, clean architecture and layer
  boundaries, feature-first structure, the adapter/repository pattern,
  discriminated async state, state tiers and data fetching, security, testing
  strategy, DDD tactical patterns, micro-frontends, and forms. Use it when
  generating a component or module, refactoring frontend code, reviewing a pull
  request, or making an architecture decision, or when the user says "code
  review", "clean architecture", "SOLID", "design pattern", "DDD", "bounded
  context", "micro-frontend", "data fetching", "form validation", or "how should
  I structure this".
---

# Architecture and Design — Frontend Engineering Skill

Framework-neutral architecture standards, design principles, and structure patterns for web
applications in TypeScript. The principles hold for React, Angular, Vue, and any component-based
framework. Code examples use React/TSX for one concrete syntax; each principle has an equivalent in
an Angular template or a Vue SFC.

> **Prerequisites.** Load `core-typescript` alongside this skill. In a React or Angular codebase,
> also load `react` or `angular`, and `accessibility` for any UI work. `npx skills add …@architecture-and-design`
> installs this file alone.

This SKILL.md is self-sufficient: the **Ruleset** below is the complete, enforceable list. Each
`references/` file holds the *reasoning*, diagrams, and code for one Ruleset topic
(`references/state-and-data.md`, `references/security.md`, …), plus `references/worked-example.md`.
Open them for depth if your runtime allows it — the Ruleset stays authoritative, and nothing here
depends on them being read.

---

## How to Use This Skill

Pick the mode that matches the task. Do the steps in order.

| Mode | Steps |
|---|---|
| **Generate** — write a new component, hook, or module | 1. Apply `solid`, `clean-code`, `expressive-logic`, `type-safety`, and `state-and-data` as you write. 2. Model async state as a discriminated union (`patterns`). 3. Validate external data at the boundary (`type-safety`). 4. Run the Ruleset as a checklist. Fix each fail before you hand off. |
| **Review** — check a pull request or a diff | 1. Run the Ruleset against the diff. 2. Write one finding per fail, in the Output Format below. 3. Order the findings: `must-fix` first, then `consider`. 4. If nothing fails, say so in one line. Do not invent findings. 5. Flag the problem and suggest the fix — do not rewrite the author's code in silence. |
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
- A principle serves the code. When two principles conflict, pick the one that makes the code simpler to read and change, and say why.
- When the task is a decision, not a diff, weigh the options against `solid`, `clean-architecture`, `structure`, `state-and-data`, and `micro-frontends`, and record the choice as an ADR in the repo (context, options, decision, consequences).

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
- [ ] Functions short enough to read without scrolling; an options object past three parameters.
- [ ] No boolean flag parameter that switches behavior — two functions instead.
- [ ] Comments say *why*, not *what*; no dead code (commented blocks, unused exports, unreachable branches).
- [ ] No mutation of a parameter, prop, or state in place — a new value is built and returned.
- [ ] Every error is handled or rethrown — never an empty `catch`.

### expressive-logic → `references/expressive-logic.md`

- [ ] No `x ? true : false`, no `if (c) return true; else return false`, no comparison against a boolean literal.
- [ ] Guard clauses over nested conditionals; every condition stated in the positive.
- [ ] A long boolean chain is given a name (a variable or a predicate function).
- [ ] `?.` / `??` over a manual `&&` null chain; `??` (not `||`) where `0` or `''` is valid.
- [ ] Magic numbers and strings have named constants.
- [ ] An `if/else if` ladder on one value is a typed lookup or an exhaustive `switch` with an `assertNever` default.

### type-safety → `references/type-safety.md`

- [ ] No `any`; an unknown input is typed `unknown` and narrowed; every `as` cast has a clear reason.
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
- [ ] A server collection is normalized: each entity stored once, keyed by id.
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
- [ ] One effect per concern with every dependency listed; a derived value or an event handler preferred.
- [ ] Each independent region has its own error boundary and fallback, not only the app root.
- [ ] A stale async result is cancelled or ignored (`AbortController` or an ignore flag).
- [ ] A caught error is sent to a tracker with the source map, the release tag, and session context.
- [ ] Core Web Vitals (LCP, INP, CLS) are measured in the field with RUM, not only Lighthouse.
- [ ] No `console.log` ships; logging goes through one structured logger.
- [ ] A semantic element over a `div` with a handler; every input and icon-only control labelled. Full lens: `accessibility`.

### security → `references/security.md`

- [ ] No HTML built from untrusted input; sanitize with DOMPurify; avoid `dangerouslySetInnerHTML` / `[innerHTML]` / `v-html`.
- [ ] No secrets in the bundle — a third-party key lives on a server.
- [ ] `rel="noopener noreferrer"` on every `target="_blank"` link.
- [ ] A redirect URL from a query param is checked against an allowlist; a `javascript:` or `data:` URL from user data is rejected.
- [ ] Token storage is chosen on purpose and the trade-off is written down.
- [ ] CSP in enforcing mode, nonce-based for scripts; Trusted Types where the browser supports it.
- [ ] With cookie auth, an anti-CSRF token on every state-changing request, and `SameSite` set.
- [ ] A third-party `<iframe>` has a `sandbox` with only the capabilities it needs.
- [ ] A new dependency is reviewed before adding it (maintenance, transitive weight, provenance).

### testing → `references/testing.md`

- [ ] The suite is weighted toward integration: a static-analysis base, unit tests for pure logic, a thick layer of component-plus-collaborator tests with the network mocked at the edge, a thin top of end-to-end tests for critical paths.
- [ ] Domain and use cases: fast unit tests on plain functions, no DOM or network.
- [ ] Components: queried by role and label, asserted on what the user sees.
- [ ] The network is mocked at the boundary (MSW), not by replacing modules.
- [ ] Coverage is enforced on the lines a change touches, not a global percentage.
- [ ] Every bug fix ships with a test that fails before the fix.
- [ ] The API boundary is contract-tested, or types are generated from the contract and the payload validated.
- [ ] A flaky test is quarantined on the first flake and fixed within the sprint.
- [ ] A snapshot is used only for small, stable output.

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
- [ ] Uncontrolled inputs with a form library for a large form; a controlled input only when its value drives other UI.
- [ ] A server validation error is mapped back onto its field.
- [ ] Submit is disabled while a submit is in flight; entered values survive a failed submit.

---

## Limits

This skill covers frontend architecture and design. It does not cover:

- Backend, database, or infrastructure design.
- Distributed system architecture: microservices, service decomposition, event-driven backends, message brokers, sagas, distributed consistency. `ddd` covers DDD tactical patterns inside one app; strategic and cross-service concerns belong in a system-architecture skill. `micro-frontends` covers the frontend split only.
- Styling systems, design tokens, and CSS architecture beyond the note in `frontend-practices`.
- Accessibility beyond "use a semantic element and a label". Focus management, ARIA, live regions, keyboard operability, and a11y testing live in `accessibility`.
- Deep performance profiling and bundle analysis. `frontend-practices` covers only the field-monitoring habit.
- CI pipeline configuration, dependency-update bots, release tooling, and monorepo setup.
- Framework-specific rules: Rules of Hooks, `useMemo` / `useCallback` policy, Angular change detection and signals, Vue reactivity caveats. These live in the framework skills.

This skill states principles. It is not a substitute for reading the code and understanding the domain.

---

## References

This skill is the framework-neutral architecture layer. It composes with:

- **`core-typescript`** — the base skill. Language-level TypeScript: compiler strictness, safe typing, narrowing, utility types, `assertNever`, branded ids. On a shared topic this skill decides the design and `core-typescript` decides the syntax.
- **`react`** — the React form of these rules: Rules of Hooks, effect dependencies, memoization policy, `Suspense` and error boundaries, TSX conventions.
- **`angular`** — the Angular form: standalone components, signals, `OnPush`, dependency injection, RxJS patterns.
- **`accessibility`** — the accessibility review lens: semantic HTML, ARIA discipline, keyboard and focus, forms, live regions, SPA route announcements, a11y testing.

When you work in a React or Angular codebase, apply this skill together with the matching framework skill. The framework skill wins on a direct conflict.
