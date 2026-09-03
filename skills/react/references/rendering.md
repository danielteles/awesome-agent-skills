# React — Performance and Rendering: why, and an example

The rules are in the `react` Ruleset (`rendering` group). This file is the reasoning and an example.

- **React Compiler first.** It memoizes automatically and more completely than hand code, and it does not drift when the surrounding code changes. Where it is
  on, `memo` / `useMemo` / `useCallback` for referential identity alone are noise.
- **Measure before hand-memoizing.** Where the compiler is off, add memoization only on a path you profiled with React DevTools, and keep the profile that
  justified it. Blanket memoization costs CPU and code for no proven gain.
- **Fresh references defeat `memo`.** An object, array, or function literal built in render and passed to a memoized child changes identity every render, so the
  child re-renders anyway. Hoist it, `useCallback` it, or let the compiler handle it.
- **Stable keys.** An array-index `key` on a list that can reorder, grow, or shrink makes React reuse the wrong DOM node and its state. Use a stable id.
- **Code-split routes** with `lazy()` + a `<Suspense>` boundary so a route's code loads when the user navigates to it. **Virtualize** a list past a few hundred
  rows — the DOM node count, not the data, is the cost.
- **Document metadata** (`<title>`, `<meta>`, `<link rel>`) rendered in the component that owns it is hoisted to `<head>` and deduped by React 19, so it lives
  with the view instead of a separate head-manager.

```tsx
// ❌ Array index as key on a list that can reorder — React reuses the wrong node, state leaks
{rows.map((row, i) => <Row key={i} row={row} />)}

// ✅ A stable id from the data
{rows.map((row) => <Row key={row.id} row={row} />)}
```
