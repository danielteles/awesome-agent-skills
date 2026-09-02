# React — Context and Composition: why, and an example

The rules are in the `react` Ruleset (`context` group). This file is the reasoning and an example.

- **Low-frequency data only.** Every consumer of a context re-renders when its `value` changes. That is fine for theme, locale, the current user, or a DI
  container, which change rarely. A value that changes on keystroke or scroll in a wide context re-renders half the tree each time — put it in local state, or a
  store with selectors so consumers subscribe to just the slice they read.
- **`<Context value={…}>`** is the provider in React 19; `<Context.Provider>` still works but is the old form.
- **Conditional read.** `use(Context)` may be called inside a condition; `useContext` may not. Default to `useContext` and switch to `use` only where you need
  the conditional call.
- **Memoize `value`.** An inline object literal (`value={{ user, setUser }}`) is a fresh reference every parent render, so every consumer re-renders even when
  nothing changed. Memoize it, or let the React Compiler do it.
- **Compose, don't configure.** A component that grows a boolean prop per variant is closed to extension only by editing it. `children` and named slot props
  (`header`, `footer`) let a caller extend it without touching it.
- **Portals stay in the tree.** `createPortal` renders a modal, tooltip, or toast into a different DOM node (escaping `overflow` and stacking-context traps)
  while keeping it in the React tree, so context and event bubbling still work.

```tsx
// ❌ Inline object literal — a fresh reference every render re-renders every consumer
<UserContext value={{ user, setUser }}>{children}</UserContext>;

// ✅ Stable value (or let the React Compiler memoize it)
const value = useMemo(() => ({ user, setUser }), [user]);
<UserContext value={value}>{children}</UserContext>;
```
