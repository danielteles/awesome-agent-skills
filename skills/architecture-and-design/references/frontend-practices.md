# Frontend Best Practices — why, and examples

The rules are in the `architecture-and-design` Ruleset (`frontend-practices` group). This file is
the reasoning and examples.

- **Computation out of the template.** Filters, maps, and chains in the render body rerun on every render and hide intent. Compute a named value first. Angular:
  a field or a pure pipe. Vue: a `computed`.
- **Model every async state** — loading, empty, error, success (the union from `patterns`). A success-only path leaves the UI stuck on a failure.
- **Stable list keys**, never the array index for a list that can reorder — an index key reuses the wrong DOM node and its state.
- **One effect per concern, every dependency listed.** A stacked effect with a silenced linter is a bug source. Prefer a derived value or an event handler.
- **State tiers.** Server, URL, global, and local state each in their tier (`state-and-data`). One misplaced tier is a class of state bug.
- **Error boundaries per region.** One handler at the app root turns a small failure into a blank page. React boundary, Angular `ErrorHandler`, Vue
  `onErrorCaptured`.
- **Cancel stale async.** A late response overwrites newer data — use an `AbortController` or an ignore flag.
- **Ship errors to a tracker** (Sentry, Datadog) with the source map, the release tag, and session context. An error with no stack and no version is not
  actionable.
- **No `console.log` in production.** Lint it out; log structured events through one logger.
- **Accessibility:** this skill checks only that a semantic element and a label are present. Focus management, ARIA, live regions, and a11y testing are the
  `accessibility` lens.

## Computation out of the template

```tsx
// ❌ Computation inside the return
return <p>{items.filter((i) => i.active).map((i) => i.name).join(', ')}</p>;

// ✅ Compute first, render second
const activeNames = items.filter((item) => item.active).map((item) => item.name);
return <p>{activeNames.join(', ')}</p>;
```

## Cancel stale async work

```tsx
useEffect(() => {
  const controller = new AbortController();

  fetchResults(query, { signal: controller.signal })
    .then(setResults)
    .catch((error) => {
      if (error.name !== 'AbortError') throw error;
    });

  return () => controller.abort();
}, [query]);
```
