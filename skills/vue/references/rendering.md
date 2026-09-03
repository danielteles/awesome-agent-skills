# Vue — Rendering and Async: why

The rules are in the `vue` Ruleset (`rendering` group).

- **Top-level `await` needs `<Suspense>`.** A component whose `setup` awaits data does not render
  until the promise resolves; without a `<Suspense>` ancestor there is no fallback and no defined
  error path. Wrap it, give it a real fallback, and catch failures with `onErrorCaptured` or a
  boundary component.
- **Split what the first screen does not need.** `defineAsyncComponent` (or the router's `() =>
  import(...)`) keeps a heavy chart, editor, or route out of the initial bundle until it is used.
- **`<KeepAlive>` is targeted.** Wrapping the whole `<RouterView>` in `<KeepAlive>` holds every
  visited page's component tree in memory. Scope it with `:include` to the few views where
  preserving scroll and form state actually matters.
- **Do not hand a child fresh references.** An object or arrow function created in the template is
  a new identity every render, so the child re-renders each time; hoist it or make it a `computed`.
  Virtualize a list past a few hundred rows — the node count is the cost.
- **Watchers cost.** A deep `watch` over a big structure re-diffs it on every change; a
  `watchEffect` that reads too much re-runs too often. Watch the one field that matters.

```ts
// ❌ async component with no Suspense boundary; deep watch over a large list
const data = await fetchDashboard(); // parent has no <Suspense> — blank render, no fallback
watch(rows, recompute, { deep: true }); // re-diffs 5k rows on every keystroke elsewhere

// ✅ Suspense around the async child; watch the specific field
// <Suspense><template #default><Dashboard /></template><template #fallback><Spinner /></template></Suspense>
watch(() => filters.value.status, recompute);
```
