---
name: react
description: >-
  React conventions for modern React: function components, the Rules of Hooks,
  render purity, "you might not need an Effect", Server and Client Components,
  Actions and form state, Suspense, and the React Compiler. Extends
  core-typescript (language rules) and architecture-and-design (layering,
  boundaries, state tiers, forms validation, security). Use it when writing,
  reviewing, refactoring, or migrating React code. Also use when the user says
  "React", "hook", "useEffect", "useState", "useMemo", "useCallback", "re-render",
  "Server Component", "RSC", "use client", "Suspense", "React Compiler",
  "useActionState", "context", or "forwardRef".
---

# React Conventions — Framework Skill

This skill holds React-specific rules for modern React (function components, hooks, Server Components, Actions, the React Compiler). It extends **core-typescript** for language rules and **architecture-and-design** for layering, feature boundaries, state tiers, forms validation, and security.

Where those skills and this one cover the same ground, this skill gives the React form of the rule.

---

## How to Use This Skill

Pick the mode that matches the task. Do the steps in order.

| Mode | Steps |
|---|---|
| **Generate** — write a new component or hook | 1. Keep render pure; type the props (Section 1). 2. Before you write a `useEffect`, check Section 4. 3. Derive state during render; use `key` to reset (Section 3). 4. Run the Section 12 checklist. Fix each fail before you hand off. |
| **Review** — check a pull request or a diff | 1. Run the Section 12 checklist against the diff. 2. Write one finding per fail, in the Output Format below. 3. Order the findings: `must-fix` first, then `consider`. 4. If nothing fails, say so in one line. Do not invent findings. |
| **Migrate** — modernize legacy React | 1. Run the codemods: `npx types-react-codemod` for React 19 types, the `forwardRef` codemod, the `<Context.Provider>` codemod. 2. Turn on `eslint-plugin-react-hooks` (v5) and fix every warning. 3. Adopt the React Compiler; then delete hand-written `useMemo` / `useCallback` that only guarded referential identity. 4. One change kind per commit. Keep the tests green. |

### Output Format

Write one finding per line:

```
<severity> · Section <n> · <file>:<line> — <what is wrong>. <the fix as an action>.
```

- `<severity>` is `must-fix` (breaks a rule in this skill or a lint rule) or `consider` (safe, but a rule prefers another form).
- `<n>` is a section number from this skill. Cite only numbers that exist here.

### Rules for Every Mode

- Cite a section number when you enforce a rule.
- Prefer the current API over its predecessor: `ref` as a prop over `forwardRef`, `<Context>` over `<Context.Provider>`, an Action over a manual submit `useEffect`.
- Before you reach for `useEffect`, ask why the code runs. If the answer is not "because the component is on screen and must sync with an external system", it does not belong in an Effect (Section 4).

---

## Rules at a Glance

| Section | Rule |
|---|---|
| 1 | A component is a pure function of props, state, and context. No side effect or mutation in render. |
| 2 | Call hooks at the top level of a component or another hook. Nowhere else. |
| 3 | Derive state during render. Use `key` to reset. Never mirror a prop, never mutate state. |
| 4 | An Effect only synchronizes with an external system. It is not for events, derived state, or a POST. |
| 5 | `useRef` for a value that is not rendered. `ref` is a plain prop — no `forwardRef`. |
| 6 | Context for low-frequency wide data, with a memoized `value`. Compose with `children` and slots. |
| 7 | Do not fetch in a bare `useEffect`. Use a loader, a cache library, or `use(promise)`. |
| 8 | Forms use `<form action>`, `useActionState`, `useFormStatus`, `useOptimistic`. |
| 9 | Server Component by default. `'use client'` at the smallest interactive leaf. |
| 10 | React Compiler first. Hand-written `memo` / `useMemo` only on a measured hot path. |
| 11 | Test through the DOM by role, with `user-event`, mocking at the network. |

---

## 1. Components and Purity

| Rule | Why |
|---|---|
| A component returns the same JSX for the same props, state, and context. | React may call it many times and in any order. |
| Do not mutate props, state, or a value from a previous render. Do not run a side effect in the render body. | Strict Mode double-invokes render to surface exactly this. |
| Type props with a `type` or `interface`. Do not use `React.FC`. | `React.FC` adds an implicit `children` and blocks generics. |
| Type children as `ReactNode`. Type an event handler with its React event type. | The precise type catches a wrong call site. |
| One component per file. The file name matches the component. | One concept per file (core-typescript Section 12). |
| Accept `ref` as a normal prop. Do not wrap a new component in `forwardRef`. | React 19 passes `ref` like any prop. `forwardRef` is legacy. |
| With the automatic JSX runtime (`"jsx": "react-jsx"`), do not `import React` just for JSX. | The runtime injects it. |
| Wrap the app tree in `<StrictMode>`. | It double-invokes render and Effects in development to surface impurity and missing cleanup. |
| Reach for a semantic element (`button`, `nav`, `label`) before a `div` with a handler. Give every control an accessible name (architecture-and-design Section 9). | The keyboard and a screen reader depend on the element, not the styling. |
| Generate an id for a label or an `aria-*` reference with `useId()`. Never use it as a list key. | `useId` is stable across server and client render; a hand-made id is not. |

```tsx
type UserCardProps = {
  user: User;
  onRemove: (id: UserId) => void;
  ref?: React.Ref<HTMLDivElement>;
};

export function UserCard({ user, onRemove, ref }: UserCardProps) {
  return (
    <div ref={ref}>
      <span>{user.fullName}</span>
      <button onClick={() => onRemove(user.id)}>Remove</button>
    </div>
  );
}
```

### Lint and the React Compiler

| Rule | Why |
|---|---|
| Run `eslint-plugin-react` and `eslint-plugin-react-hooks` (v5). Fix every `react-hooks` warning; do not disable the rule. | The hooks rules catch broken dependency arrays and conditional hooks that no type checker sees. |
| Adopt the React Compiler. Where it is on, stop writing `useMemo`, `useCallback`, and `memo` for referential identity alone. | The compiler memoizes correctly and automatically. Hand memoization is then noise and can drift. |
| Set `"jsx": "react-jsx"` in `tsconfig.json`. | The modern JSX transform, no `React` import. |

---

## 2. Rules of Hooks

| Rule | Why |
|---|---|
| Call a hook only at the top level of a component or another hook, before any early `return`. Never in a condition, loop, nested function, event handler, `try`/`catch`, or a function passed to `useMemo` / `useReducer` / `useEffect`. | React tracks hooks by call order. A skipped call corrupts every hook after it. |
| Call a hook only from a React function component or a custom hook. Never from a plain function or a class component. | Outside one there is no render to attach state to. |
| A custom hook is the unit of shared stateful logic. Name it `useX`. Return a stable, typed value. | A shared hook beats a shared base component or a render prop for logic reuse. |
| Give `useEffect`, `useMemo`, and `useCallback` a complete dependency array. Do not lie to the linter. | A missing dependency is a stale-closure bug that appears later, far away. |

---

## 3. State

| Rule | Why |
|---|---|
| Keep state in the component that uses it. Lift it up only when a second component needs the same value (architecture-and-design Section 8). | State that lives too high re-renders a large tree. |
| Compute a value from props or other state during render. Do not copy it into state. | A stored copy goes stale. See Section 4 for the Effect version of this mistake. |
| Reset a subtree's state by changing its `key`, not by clearing fields in an Effect. | `<Profile key={userId} />` gives each id a fresh component. |
| Never store a prop in state "to have a local copy". Read the prop, or lift the state. | The copy stops tracking the prop. |
| Use `useReducer` when several state fields change together or the next state depends on an event plus current state. | One reducer call keeps the updates consistent. |
| Never mutate a state object or array. Build a new value and set that. | A mutation does not re-render, and it breaks `memo` and the React Compiler. |
| When the next state depends on the previous, pass an updater: `setCount(c => c + 1)`. | A stale closure otherwise loses updates that happen in the same tick. |
| Pass a function to `useState` for an expensive initial value: `useState(() => build())`. | A bare call runs `build()` on every render and throws the result away. |
| Subscribe to an external store with `useSyncExternalStore`, not a `useState` plus a subscribe Effect. | It is tear-free and works with concurrent rendering. |

```tsx
// ❌ Derived state in an Effect
const [sorted, setSorted] = useState<User[]>([]);
useEffect(() => setSorted([...users].sort(byName)), [users]);

// ✅ Derived during render (memoize only if the list is large)
const sorted = useMemo(() => [...users].sort(byName), [users]);
```

---

## 4. Effects

An Effect synchronizes the component with an external system: a non-React widget, a socket, an event subscription, the document title. Nothing else.

| This does not need an Effect | Do instead |
|---|---|
| Transforming data for the render | Compute it during render. |
| An expensive calculation | `useMemo`. |
| Resetting state when a prop changes | Pass a `key`. |
| Adjusting state when a prop changes | Compute it during render, or set state during render on the same component. |
| Anything in response to a user event | Put it in the event handler. |
| A POST on submit or on a click | Put it in the event handler. |
| A chain of state updates that trigger each other | Compute the whole next state in one event handler. |
| One-time app init | Run it at module scope, guarded for the browser. |
| Notifying the parent of a change | Call the parent callback in the same event handler that set the state. |
| Subscribing to an external store | `useSyncExternalStore` (Section 3). |

| Rule | Why |
|---|---|
| Give every Effect a cleanup function that undoes what it set up. | An Effect re-runs and unmounts; without cleanup it leaks a listener or a timer. |
| Write one Effect per synchronization. Do not stack unrelated setup in one Effect. | Each Effect then has one reason to re-run and one cleanup. |
| An Effect that fetches needs an `ignore` flag or an `AbortController`. Prefer Section 7 instead. | Otherwise an out-of-order response overwrites newer data. |
| Keep the dependency array honest and complete. Extract a reusable Effect into a custom hook. | A lie in the array is a stale-closure bug. |
| To read the latest prop or state inside an Effect without re-subscribing, use an Effect Event (`useEffectEvent`, experimental). Do not just drop it from the array. | It separates "what the Effect reacts to" from "what it reads". |

---

## 5. Refs

| Rule | Why |
|---|---|
| Use `useRef` for a value that must survive renders but must not trigger one: a DOM node, a timer id, a previous value. | Writing a ref does not re-render, which is the point. |
| Do not read or write `ref.current` during render. Do it in an event handler or an Effect. | During render its value is not settled. |
| Accept `ref` as a plain prop (React 19). Do not add `forwardRef`. | `ref` is now an ordinary prop for function components. |
| A `ref` callback may return a cleanup function. Use it to detach a listener you attached. | It runs when the node is removed, like an Effect cleanup. |
| Expose an imperative API from a component with `useImperativeHandle`, and only a small named one (`focus`, `scrollIntoView`). | It keeps the surface deliberate instead of handing out the raw node. |
| Move focus with a ref after a navigation, after an async action, or when a dialog opens (architecture-and-design Section 9). | A view change that does not move focus strands a keyboard or screen-reader user. |
| The ref is an escape hatch. Reach for state or a prop first. | Imperative DOM code is harder to follow and to test. |

---

## 6. Context and Composition

| Rule | Why |
|---|---|
| Use context for low-frequency, widely-read data: theme, locale, the current user, a DI container. | A context update re-renders every consumer, so it must be rare. |
| Split a fast-changing value into its own context, or keep it in local state or a store with selectors. | One big context makes every change a wide re-render. |
| Render a provider as `<ThemeContext value={theme}>`, not `<ThemeContext.Provider>`. | React 19 makes the context itself the provider. |
| Read context with `use(Context)` when you need it inside a condition; otherwise `useContext`. | `use` can be called conditionally; `useContext` cannot. |
| Memoize the context `value` (or let the React Compiler do it). Do not pass an inline object literal. | A fresh `value` object each parent render re-renders every consumer. |
| Make a component extensible with `children` and slot props (`header`, `footer`), not a growing list of boolean config props. | Composition keeps the component closed for modification (architecture-and-design Section 1). |
| Render a modal, tooltip, or toast through `createPortal`. Keep it in the React tree so context and events still flow. | The portal escapes `overflow` and stacking-context traps in the DOM without leaving the component tree. |

---

## 7. Data Fetching and Suspense

| Rule | Why |
|---|---|
| Do not fetch in a bare `useEffect`. Use the framework loader, a cache library (TanStack Query, SWR), or `use(promise)` with a promise that a cache created (architecture-and-design Section 8). | A raw Effect fetch has no cache, races on prop change, and creates request waterfalls. |
| Give each request a stable cache key from its inputs. | The key is how the cache dedups, refetches, and invalidates. |
| Wrap an async read in `<Suspense>` with a real fallback. Wrap each independent region in an error boundary (architecture-and-design Section 9). | The success path is not the only path. |
| There is no error-boundary hook. Use a class component or `react-error-boundary`. | A thrown render error needs a class `componentDidCatch` or the library that wraps it. |
| Mark a non-urgent update with `useTransition`, or read a lagging value with `useDeferredValue`. | It keeps typing and clicks responsive while a big list re-renders. |
| For a mutation, update the cache from the response. Use `useOptimistic` only with a rollback path. | An optimistic update with no rollback shows a lie after a failed write. |

---

## 8. Forms and Actions

| Rule | Why |
|---|---|
| Submit with `<form action={submitAction}>`. Drive it with `useActionState` for `[state, submitAction, isPending]`. | React manages the pending state, the error, and the form reset for you. |
| Read pending state in a child with `useFormStatus`, not a prop drilled from the form. | The child asks the nearest form directly. |
| Show an optimistic row with `useOptimistic`. React reverts it on failure. | The user sees the result immediately, and a failure corrects it. |
| Use an uncontrolled input by default. Make it controlled only when its value drives other UI. | Controlling every keystroke re-renders the form. |
| Do not switch an input between controlled and uncontrolled. A `value` that starts `undefined` and later becomes a string does this. Pick one for the input's life. | React warns and the cursor and selection jump on the switch. |
| Build the validators from the same schema the server uses (architecture-and-design Section 14). Re-validate on the server. | The client check is a convenience; the network is not a boundary you control. |
| Keep the entered values on a failed submit. Map a field error back to its field. | A wiped form and a generic error are the classic form bugs. |

---

## 9. Server and Client Components

| Rule | Why |
|---|---|
| A component is a Server Component by default (in a framework that supports RSC). There is no directive for it. It has no state, no Effects, no browser APIs, and no event handlers. | It runs once, does not re-render, and does not hydrate. Only its output reaches the browser. |
| A Server Component may be `async` and `await` in render: read the database or a file directly. | It runs on the server, so there is no API layer to build for its own data. |
| Put `'use client'` on the smallest interactive leaf, not the page or the layout. | Everything in a `'use client'` file and its imports ships to the browser. |
| Mark a server function with `'use server'`. Call it from a Client Component as an Action. `'use server'` is not how you make a Server Component. | It runs on the server with no API route to hand-write. |
| Pass serializable props across the boundary — data and JSX as `children`. No functions (except a Server Action), no class instances. | The boundary serializes props. |
| Keep a server-only module (a database client, a secret, `fs`) out of any `'use client'` file and anything it imports. The `server-only` package turns the mistake into a build error. | Otherwise the secret or the driver is bundled for the browser. |
| Do data fetching in the Server Component or the loader. Pass the result down. | It removes a client round-trip and a loading state. |

---

## 10. Performance and Rendering

| Rule | Why |
|---|---|
| Turn on the React Compiler. Let it memoize. | It is more correct and more complete than hand memoization. |
| Where the compiler is not on, add `memo`, `useMemo`, or `useCallback` only on a path you measured with the React DevTools Profiler. | Blanket memoization adds cost and code with no proven gain. Keep the profile that proved the hot path. |
| Do not build a new object, array, or function in render and pass it to a memoized child. | A fresh reference defeats the child's `memo`. The compiler fixes this; without it, hoist or `useCallback`. |
| Give a list item a stable id `key`. Never the array index for a list that can reorder, grow, or shrink. | An index key reuses the wrong DOM node and its state. |
| Code-split a route with `lazy()` and a `<Suspense>` boundary. | The route's code loads when the user goes there. |
| Virtualize a list of more than a few hundred rows. | The DOM node count, not the data, is the cost. |
| Render `<title>`, `<meta>`, and `<link rel>` in the component that owns them. React 19 hoists them to `<head>` and dedups. | The page metadata lives with the view that sets it, not in a separate head-manager. |

---

## 11. Testing

Test each layer the way architecture-and-design Section 11 describes. The React specifics:

| Rule | Why |
|---|---|
| Render with React Testing Library. Query by role and accessible name. | It tests what a user and a screen reader perceive. |
| Drive interaction with `@testing-library/user-event`, not `fireEvent`. | `user-event` reproduces the real sequence of events. |
| Mock at the network with MSW. Do not mock a module or a hook to fake data. | The test then exercises the real component and data path. |
| Assert on rendered output, not on state, props, or a call count. | A behavior test survives a refactor. |
| For an async result, assert with `findBy*` or `await waitFor(...)`. `await` every `user-event` call. | It removes `act()` warnings and the flakiness they mark. |
| Test a custom hook through a component that uses it. Use `renderHook` only when there is no such component. | A hook exists to serve a component; test it the way it is consumed. |
| `createPortal` content renders outside the render container. Query it through `screen` (document-wide), not the `render()` return value. | The portal node is on `document.body`, not inside `container`. |
| No shallow rendering, no Enzyme, no broad snapshot. | They couple the test to the implementation. |

```tsx
render(<UserCard user={ada} onRemove={onRemove} />);
await userEvent.click(screen.getByRole('button', { name: 'Remove' }));
expect(onRemove).toHaveBeenCalledWith(ada.id);
```

---

## 12. Code Review Checklist

Run this checklist before you approve a change or finish generated code. This step is not optional. Name the section number for each item that fails.

Make sure that:

- [ ] **Pure render:** no mutation of props or state, no side effect in the render body; the app tree is wrapped in `<StrictMode>`.
- [ ] **Props typing:** a `type` or `interface`, not `React.FC`; children as `ReactNode`.
- [ ] **Hooks:** every hook is at the top level, before any early return; no conditional hook; dependency arrays are complete and not suppressed.
- [ ] **No needless Effect:** derived data is computed in render; a user action lives in its handler; state resets with `key`.
- [ ] **Effect hygiene:** one Effect per concern; every Effect has a cleanup; an Effect that fetches guards against a stale response.
- [ ] **State updates:** state is never mutated in place; the updater form is used when the next value depends on the previous.
- [ ] **State placement:** no prop mirrored in state; state is colocated; an external store uses `useSyncExternalStore`.
- [ ] **Refs:** `useRef` only for non-rendered values; no `forwardRef`; no `ref.current` read in render.
- [ ] **Context:** context holds low-frequency data; the `value` is memoized; a fast value is not in a wide context.
- [ ] **Data fetching:** no bare `useEffect` fetch; a loader, a cache library, or `use()`; a `<Suspense>` and an error boundary around it.
- [ ] **Forms:** `<form action>` with `useActionState`; validity derived; values kept on failure.
- [ ] **Server/Client:** `'use client'` is on the smallest leaf; server components have no state or effects; props across the boundary are serializable; no server-only module in a client file.
- [ ] **Accessibility:** semantic elements over `div` handlers; `useId` ties labels to inputs; focus moves on navigation.
- [ ] **Rendering:** React Compiler on, or memoization is measured; list keys are stable ids; routes are code-split.

---

## 13. Worked Example: A Review Pass

Input diff:

```tsx
// user-list.tsx — proposed in a pull request
1  import React from 'react';
2
3  export const UserList: React.FC<{ teamId: string }> = ({ teamId }) => {
4    const [users, setUsers] = useState<User[]>([]);
5    const [sorted, setSorted] = useState<User[]>([]);
6
7    useEffect(() => {
8      fetch(`/api/teams/${teamId}/users`)
9        .then((r) => r.json())
10       .then(setUsers);
11   }, [teamId]);
12
13   useEffect(() => {
14     setSorted([...users].sort((a, b) => a.name.localeCompare(b.name)));
15   }, [users]);
16
17   return (
18     <ul>
19       {sorted.map((u, i) => (
20         <li key={i}>
21           <UserRow user={u} config={{ onRemove: () => removeUser(u.id) }} />
22         </li>
23       ))}
24     </ul>
25   );
26 };
```

Output, in the format from How to Use This Skill:

```
must-fix · Section 7 · user-list.tsx:7 — data fetched in a bare `useEffect`: no cache, and it races on a `teamId` change. Use a cache library keyed by `['team-users', teamId]`, or the framework loader.
must-fix · Section 4 · user-list.tsx:13 — `sorted` is state derived from `users` through an Effect. Compute it in render: `const sorted = useMemo(() => [...users].sort(byName), [users])`.
must-fix · Section 10 · user-list.tsx:20 — `key={i}` is the array index. Use `key={u.id}`.
consider · Section 1 · user-list.tsx:3 — `React.FC`. Type the props directly: `function UserList({ teamId }: { teamId: string })`.
consider · Section 1 · user-list.tsx:1 — the `React` import is unused with the automatic JSX runtime. Remove it.
consider · Section 6 · user-list.tsx:21 — `config` is a bag passed to a child. Pass an `onRemove` prop, or `children` (composition over config).
```

---

## Limits

This skill is React framework rules. It does not cover:

- Language rules (see core-typescript) or framework-neutral architecture (see architecture-and-design).
- A specific framework's router, loaders, or metadata API (Next.js, React Router, TanStack Start) — the RSC and data-fetching rules here apply, the framework's own conventions do not.
- Store libraries (Redux Toolkit, Zustand, Jotai) — use the state tiers in architecture-and-design Section 8 and reach for a store only when they call for one.
- Accessibility depth — `useId` and focus management are noted where they fit; the full lens lives in `accessibility.md`.
- React Native, styling systems, animation libraries, and i18n.

The React Compiler is on a release track. The rules here assume you adopt it; where you have not, the manual-memoization rules in Section 10 apply.

---

## References

This skill extends the base skills. It composes with:

- **`core-typescript.md`** — the language base: `strict`, safe typing, narrowing, `unknown`, utility types. JSX and hooks do not exempt code from these.
- **`architecture-and-design.md`** — layering, feature boundaries, the adapter / repository pattern, state tiers, forms validation, security. This skill gives the React form of those rules; architecture-and-design decides the design.
- **`accessibility.md`** — the accessibility review lens. React's tools for it are `useId`, ref-based focus management, and accessible primitive libraries (Radix, React Aria).
- **`angular.md`** — the sibling framework skill.

On a conflict between this skill and architecture-and-design, architecture-and-design decides the design and this skill decides the React API.
