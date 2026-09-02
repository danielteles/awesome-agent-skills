---
name: react
description: >-
  Modern React conventions — function components and render purity, the Rules of
  Hooks, "you might not need an Effect", state placement, refs without
  forwardRef, context, data fetching with Suspense, Actions and form state,
  Server and Client Components, the React Compiler, and testing by role. Extends
  core-typescript and architecture-and-design. Use it when writing, reviewing,
  refactoring, or migrating React, or when the user mentions React, hooks,
  useEffect, useState, re-renders, Server Components, "use client", Suspense,
  the React Compiler, useActionState, context, or forwardRef.
---

# React Conventions — Framework Skill

React-specific rules for modern React: function components, hooks, Server Components, Actions, the
React Compiler. It gives the React form of rules that `core-typescript` and `architecture-and-design`
set in general terms.

> **Prerequisites.** Load `core-typescript` and `architecture-and-design` alongside this skill.
> `npx skills add …@react` installs this file alone and does not pull them in.

This SKILL.md is self-sufficient: the **Ruleset** below is the complete, enforceable list. Each
`references/` file holds the *reasoning* and code examples for one Ruleset topic
(`references/effects.md`, `references/state.md`, …), plus `references/worked-example.md` for a full
review pass. Open them for depth if your runtime allows it — the Ruleset stays authoritative, and
nothing here depends on them being read.

---

## How to Use This Skill

Pick the mode that matches the task. Do the steps in order.

| Mode | Steps |
|---|---|
| **Generate** — write a new component or hook | 1. Keep render pure; type the props (`purity`). 2. Before you write a `useEffect`, check `effects` — most do not need one. 3. Derive state during render; reset with `key` (`state`). 4. Run the Ruleset as a checklist. Fix each fail before you hand off. |
| **Review** — check a pull request or a diff | 1. Run the Ruleset against the diff. 2. Write one finding per fail, in the Output Format below. 3. Order the findings: `must-fix` first, then `consider`. 4. If nothing fails, say so in one line. Do not invent findings. |
| **Migrate** — modernize legacy React | 1. Run the codemods: `npx types-react-codemod@latest preset-19` for React 19 types, plus the `forwardRef` and `<Context.Provider>` codemods. 2. Turn on `eslint-plugin-react-hooks` (v5) and fix every warning. 3. Adopt the React Compiler; then delete hand-written `useMemo` / `useCallback` that only guarded referential identity. 4. One change kind per commit. Keep the tests green. |

### Output Format

Write one finding per line:

```
<severity> · <topic> · <file>:<line> — <what is wrong>. <the fix as an action>.
```

- `<severity>` is `must-fix` (breaks a rule in this skill or a lint rule) or `consider` (safe, but a rule prefers another form).
- `<topic>` is a Ruleset topic slug (`effects`, `state`, `data-fetching`, …).

### Rules for Every Mode

- Name the Ruleset topic when you enforce a rule.
- Prefer the current API over its predecessor: `ref` as a prop over `forwardRef`, `<Context>` over `<Context.Provider>`, an Action over a manual submit `useEffect`.
- Before you reach for `useEffect`, ask why the code runs. If the answer is not "because the component is on screen and must sync with an external system", it does not belong in an Effect.

---

## Ruleset

The complete rule list. Read it top to bottom when generating; tick each box against a diff when
reviewing. Each group links to its `references/` file for rationale and examples.

### purity → `references/purity.md`

- [ ] Render is pure: no mutation of props, state, or a prior render's value; no side effect in the render body; the app tree is wrapped in `<StrictMode>`.
- [ ] Same props, state, and context produce the same JSX.
- [ ] Props are a `type` or `interface`, not `React.FC`; children typed as `ReactNode`; event handlers typed with their React event type.
- [ ] `ref` is accepted as a plain prop — no `forwardRef` on a new component.
- [ ] One component per file, file name matching the component; no `import React` just for JSX (`"jsx": "react-jsx"`).
- [ ] A semantic element (`button`, `nav`, `label`) over a `div` with a handler; every control has an accessible name; `useId()` for label / `aria-*` ids, never as a list key.
- [ ] `eslint-plugin-react` and `eslint-plugin-react-hooks` (v5) are on and every warning fixed, not disabled.

### hooks → `references/hooks.md`

- [ ] Every hook is called at the top level of a component or another hook, before any early `return` — never in a condition, loop, nested function, event handler, `try`/`catch`, or a function passed to `useMemo` / `useReducer` / `useEffect`.
- [ ] Hooks are called only from a function component or a custom hook.
- [ ] Shared stateful logic is a custom hook named `useX` returning a stable, typed value.
- [ ] `useEffect` / `useMemo` / `useCallback` dependency arrays are complete and not suppressed.

### state → `references/state.md`

- [ ] State is colocated in the component that uses it; lifted only when a second component needs the same value.
- [ ] A value derivable from props or other state is computed during render, not copied into state.
- [ ] No prop is mirrored into state; a subtree resets via `key`, not by clearing fields in an Effect.
- [ ] State is never mutated in place — a new value is built and set.
- [ ] The updater form (`setX(x => …)`) is used when the next value depends on the previous.
- [ ] An expensive initial value uses the lazy form `useState(() => build())`.
- [ ] `useReducer` when several fields change together or the next state depends on an event plus current state.
- [ ] An external store is read with `useSyncExternalStore`, not `useState` + a subscribe Effect.

### effects → `references/effects.md`

- [ ] No Effect for: transforming data for render, an expensive calc (`useMemo`), resetting state on a prop change (`key`), a user event, a POST, a chain of state updates, notifying the parent, or one-time app init.
- [ ] An Effect exists only to synchronize with an external system (widget, socket, subscription, document title).
- [ ] Every Effect has a cleanup that undoes its setup; one Effect per synchronization.
- [ ] An Effect that fetches guards against a stale response (`AbortController` / ignore flag) — or, better, uses a cache library (see `data-fetching`).
- [ ] A reusable Effect is extracted into a custom hook.
- [ ] Reading the latest value without re-subscribing uses an Effect Event (`useEffectEvent`), not a dishonest dependency array.

### refs → `references/refs.md`

- [ ] `useRef` only for values that must survive renders without triggering one (DOM node, timer id, previous value).
- [ ] No `ref.current` read or write during render — only in an event handler or an Effect.
- [ ] `ref` is a plain prop; no `forwardRef`.
- [ ] An imperative API is exposed with `useImperativeHandle` and is small and named (`focus`, `scrollIntoView`).
- [ ] A `ref` callback that attaches a listener returns a cleanup function that detaches it.
- [ ] Focus is moved with a ref after navigation, after an async action, and when a dialog opens.
- [ ] The ref is an escape hatch — state or a prop is tried first.

### context → `references/context.md`

- [ ] Context holds only low-frequency, widely-read data (theme, locale, current user, DI container).
- [ ] A fast-changing value is in its own context, or in local state / a store with selectors — not a wide context.
- [ ] The provider is `<Context value={…}>` (React 19), not `<Context.Provider>`.
- [ ] Context is read with `useContext`; `use(Context)` only where the read must be conditional.
- [ ] The context `value` is memoized (or the React Compiler is on) — never an inline object literal.
- [ ] A component extends via `children` and slot props, not a growing list of boolean config props.
- [ ] A modal / tooltip / toast renders through `createPortal`, staying in the React tree.

### data-fetching → `references/data-fetching.md`

- [ ] No bare `useEffect` fetch: a framework loader, a cache library (TanStack Query, SWR), or `use(promise)` with a cache-created promise.
- [ ] Each request has a stable cache key derived from its inputs.
- [ ] An async read is wrapped in `<Suspense>` with a real fallback and an error boundary around each independent region.
- [ ] A render error is caught by a class boundary or `react-error-boundary` — there is no hook.
- [ ] A non-urgent update uses `useTransition` / `useDeferredValue`.
- [ ] A mutation updates the cache from the response; `useOptimistic` only with a rollback path.

### forms → `references/forms.md`

- [ ] Submit is `<form action={submitAction}>` driven by `useActionState`; child pending state via `useFormStatus`.
- [ ] An optimistic row uses `useOptimistic` (which reverts on failure), not hand-rolled optimistic state.
- [ ] Inputs are uncontrolled by default; controlled only when the value drives other UI; never switched between the two.
- [ ] Validators are built from the same schema the server uses, and the server re-validates.
- [ ] Entered values survive a failed submit; each field error maps back to its field.

### server-client → `references/server-client.md`

- [ ] Components are Server Components by default (no directive); no state, Effects, browser APIs, or handlers in them.
- [ ] A Server Component that needs data is `async` and `await`s it in render (reads the database or a file directly) — no client round-trip built for its own data.
- [ ] `'use client'` sits on the smallest interactive leaf, not a page or layout.
- [ ] A server function is marked `'use server'` and called as an Action; props across the boundary are serializable (no functions except Server Actions, no class instances).
- [ ] No server-only module (db client, secret, `fs`) is reachable from a `'use client'` file; `server-only` enforces it.
- [ ] Data fetching happens in the Server Component or loader, and the result is passed down.

### rendering → `references/performance.md`

- [ ] The React Compiler is on; where it is not, `memo` / `useMemo` / `useCallback` appear only on a path measured with the Profiler.
- [ ] No fresh object / array / function built in render and passed to a memoized child.
- [ ] List keys are stable ids, never the array index for a list that can reorder, grow, or shrink.
- [ ] Routes are code-split with `lazy()` + `<Suspense>`; a list beyond a few hundred rows is virtualized.
- [ ] `<title>` / `<meta>` / `<link rel>` are rendered in the component that owns them (React 19 hoists them).

### testing → `references/testing.md`

- [ ] Rendered with React Testing Library; queried by role and accessible name.
- [ ] Interaction driven by `@testing-library/user-event` (awaited), not `fireEvent`.
- [ ] Network mocked with MSW — not a mocked module or hook.
- [ ] Assertions are on rendered output, not state, props, or call counts; async via `findBy*` / `waitFor`.
- [ ] A custom hook is tested through a component that uses it; `renderHook` only when there is none.
- [ ] `createPortal` content is queried through `screen` (document-wide), not the `render()` return value.
- [ ] No shallow rendering, no Enzyme, no broad snapshot.

---

## Limits

This skill is React framework rules. It does not cover:

- Language rules (see `core-typescript`) or framework-neutral architecture (see `architecture-and-design`).
- A specific framework's router, loaders, or metadata API (Next.js, React Router, TanStack Start) — the RSC and data-fetching rules here apply, the framework's own conventions do not.
- Store libraries (Redux Toolkit, Zustand, Jotai) — use the state tiers in `architecture-and-design` and reach for a store only when they call for one.
- Accessibility depth — `useId` and focus management are noted where they fit; the full lens lives in `accessibility`.
- React Native, styling systems, animation libraries, and i18n.

The React Compiler is on a release track. The rules here assume you adopt it; where you have not, the `rendering` rules on manual memoization apply.

---

## References

This skill extends the base skills. It composes with:

- **`core-typescript`** — the language base: `strict`, safe typing, narrowing, `unknown`, utility types. JSX and hooks do not exempt code from these.
- **`architecture-and-design`** — layering, feature boundaries, the adapter / repository pattern, state tiers, forms validation, security. This skill gives the React form of those rules; architecture-and-design decides the design.
- **`accessibility`** — the accessibility review lens. React's tools for it are `useId`, ref-based focus management, and accessible primitive libraries (Radix, React Aria).
- **`angular`** — the sibling framework skill.

On a conflict between this skill and `architecture-and-design`, architecture-and-design decides the design and this skill decides the React API.
