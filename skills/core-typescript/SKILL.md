---
name: core-typescript
description: >-
  Language-level TypeScript conventions for every project, framework or not:
  compiler strictness, banning unsafe types, inference and `satisfies`,
  discriminated unions and branded ids, narrowing with type guards and assertion
  functions, generics with restraint, utility and type-level tools, nullability,
  async rules, errors as `unknown`, module hygiene, and language hygiene. The
  base skill that `react`, `angular`, and `architecture-and-design` build on.
  Use it when writing, reviewing, or refactoring TypeScript, or setting up
  `tsconfig.json`, or when the user says "TypeScript", "tsconfig", "strict mode",
  "type error", "any", "generics", "type safety", "utility types",
  "discriminated union", or "narrowing".
---

# Core TypeScript Conventions — Base Engineering Skill

The language-level TypeScript rules for every project, framework or not. `react` and `angular`
extend it; `architecture-and-design` composes with it. Every rule assumes the compiler runs in
`strict` mode (`compiler-config`). Examples are plain TypeScript, no framework.

> **Prerequisites.** None — this is the base skill.

This SKILL.md is self-sufficient: the **Ruleset** below is the complete, enforceable list. Each
`references/` file holds the *reasoning* and code for one Ruleset topic (`references/narrowing.md`,
`references/async.md`, …), plus `references/worked-example.md`. Open them for depth if your runtime
allows it — the Ruleset stays authoritative, and nothing here depends on them being read.

---

## How to Use This Skill

Pick the mode that matches the task. Do the steps in order.

| Mode | Steps |
|---|---|
| **Generate** — write new TypeScript | 1. Assume `strict` is on (`compiler-config`). 2. Write the code, applying the Ruleset as you go. 3. Annotate the return type of every exported function (`functions`). 4. Run the Ruleset as a checklist. Fix each fail before you hand off. |
| **Review** — check a diff | 1. Run the Ruleset against the diff. 2. Write one finding per fail, in the Output Format below. 3. Order the findings: `must-fix` first, then `consider`. 4. If nothing fails, say so in one line. Do not invent findings. |
| **Configure** — set up or audit `tsconfig.json` | 1. Start from the `compiler-config` block. 2. Turn on every flag listed. 3. For a flag you cannot turn on yet, add a `// TODO` with the reason. 4. Do not relax a flag to clear an error. Fix the code. |

### Output Format

Write one finding per line:

```
<severity> · <topic> · <file>:<line> — <what is wrong>. <the fix as an action>.
```

- `<severity>` is `must-fix` (breaks a rule in this skill or the build) or `consider` (safe, but a rule prefers another form).
- `<topic>` is a Ruleset topic slug (`unsafe-types`, `narrowing`, `async`, …).

### Rules for Every Mode

- Name the Ruleset topic when you enforce a rule.
- Prefer the simplest type that stays precise. A wider type hides bugs; an over-clever type slows the next reader.
- A type that needs a comment to explain it is a smell. Give it a name, or make it simpler.

---

## Ruleset

The complete rule list. Read it top to bottom when generating; tick each box against a diff when
reviewing. Each group links to its `references/` file for rationale and examples.

### compiler-config → `references/compiler-config.md`

- [ ] `strict` is on, plus `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`, `noFallthroughCasesInSwitch`, `noImplicitReturns`, `noUnusedLocals`, `noUnusedParameters`, and `verbatimModuleSyntax`.
- [ ] A flag is never relaxed to clear an error — the code is fixed instead.

### unsafe-types → `references/unsafe-types.md`

- [ ] No `any`: an unknown input is typed `unknown` and narrowed. No `as any`, no `as unknown as T`.
- [ ] No `as` to force a type, and no `!`, unless the value is proven present on the line above — each such use has a guard or a comment that proves it safe.
- [ ] No `Function`, `Object`, or `{}` as a type (`object` for a non-primitive is fine).
- [ ] No `@ts-ignore` — `@ts-expect-error` with a comment, so it fails the build once fixed.

### inference → `references/inference.md`

- [ ] No annotation that only repeats what the compiler already infers exactly (exception: an exported API boundary — see `functions`).
- [ ] `satisfies` checks a literal against a shape without widening the value's type.

### data-modeling → `references/data-modeling.md`

- [ ] A string set is a union of string literals or a frozen `as const` object — never a TypeScript `enum` or `const enum`.
- [ ] Unchanging data is `readonly` (`readonly T[]` for a list).
- [ ] Mutually exclusive states are a discriminated union with a shared discriminant field. Design rationale: `architecture-and-design`, patterns.
- [ ] A domain id has its own branded type, minted with one sanctioned cast at the boundary. Design rationale: `architecture-and-design`, type-safety.

### narrowing → `references/narrowing.md`

- [ ] `unknown` and unions are narrowed with a type guard (`v is T`) or an assertion function (`asserts v is T`), not a cast.
- [ ] Every `switch` on a union ends with an `assertNever` default, so a new member fails to compile.

### generics → `references/generics.md`

- [ ] A type parameter is added only when two types move together (an input and a return type); no single-use type parameter.
- [ ] A type parameter is constrained with `extends`; a common one has a default; a `const` type parameter where the caller passes a literal.

### utility-types → `references/utility-types.md`

- [ ] A related type is derived with `Pick` / `Omit` / `Partial` / `Required` / `Record` / `ReturnType` / `Parameters` / `Awaited` / `NonNullable` / `keyof` / `typeof` / indexed access / a template literal type — not hand-copied.

### nullability → `references/nullability.md`

- [ ] `undefined` is the one empty value; `null` only for an external contract that sends it.
- [ ] `array[i]` and `record[key]` are read as possibly `undefined` (needs `noUncheckedIndexedAccess`).
- [ ] `?.` and `??` for a default — `||` only where `0`, `''`, and `false` are not valid values.

### functions → `references/functions.md`

- [ ] Every exported function annotates its return type; a local, non-exported function infers it.
- [ ] One options object past a few parameters — no long list of order-dependent, especially boolean, arguments.
- [ ] A union parameter over an overload set when the bodies match.

### async → `references/async.md`

- [ ] No floating promise — every promise is awaited or explicitly marked `void`.
- [ ] Independent async work runs with `Promise.all`; serial `await` only for a step that needs the previous result.
- [ ] A disposable resource (a timer, subscription, lock, or handle) is released with `using` / `await using` where the target supports explicit resource management.

### errors → `references/errors.md`

- [ ] A `catch` binding is `unknown` (from `useUnknownInCatchVariables`) and is narrowed before any field read.
- [ ] A thrown value is always an `Error` — a custom type extends `Error` and sets `name`; never a string or a plain object.

### modules → `references/modules.md`

- [ ] A type reference uses `import type` / `export type` or an inline `type` on the name.
- [ ] Named exports over a default export; no circular import between two modules; no project-wide barrel (a feature `index.ts` is fine).

### language-hygiene → `references/language-hygiene.md`

- [ ] `===` / `!==` only — the one exception is `x == null`, which tests `null` and `undefined` together.
- [ ] `Number.isNaN` / `Number.isFinite`, not the coercing globals.
- [ ] `const` by default, `let` only when reassigned, never `var`; a function parameter is not reassigned.
- [ ] Real bit flags are a `const` object of powers of two plus a derived type, not a string-literal union.

### lint → `references/lint.md`

- [ ] `typescript-eslint` runs with `strict-type-checked` (or at least `recommended-type-checked`), with `no-floating-promises`, `no-explicit-any`, `consistent-type-imports`, and `switch-exhaustiveness-check` on.
- [ ] Prettier formats, so style is not a review topic.

---

## Limits

This skill is language-level TypeScript. It does not cover:

- Architecture, layering, state management, and component design — see `architecture-and-design`.
- Framework APIs and patterns — see `react` and `angular`.
- Build tooling, bundlers, and monorepo setup beyond the `tsconfig` baseline in `compiler-config`.
- Runtime schema libraries (Zod, Valibot) — named where relevant, not taught here.

This skill decides the syntax. It does not replace reading the code and understanding the domain.

---

## References

This skill is the language base. It composes with:

- **`architecture-and-design`** — the design layer: SOLID, clean architecture, feature boundaries, state management, security, testing. On a shared topic such as discriminated unions or branded ids, `architecture-and-design` decides the design and this skill decides the syntax.
- **`react`** — extends this skill with React: hooks, effects, memoization, TSX conventions.
- **`angular`** — extends this skill with Angular: standalone components, signals, `OnPush`, dependency injection, RxJS.

When a framework skill and this skill conflict on a language point, this skill wins.
