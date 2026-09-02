# React — Data Fetching and Suspense: why

The rules are in the `react` Ruleset (`data-fetching` group). This file is the reasoning.

- **Not a bare `useEffect`.** A hand-rolled Effect fetch has no cache, no dedup, and no invalidation; it refetches on every mount, races when the input prop changes, and turns a parent/child pair into a request waterfall. A framework loader, a cache library (TanStack Query, SWR), or `use(promise)` with a promise a cache created handles all of that. See `architecture-and-design`, State Management and Data Fetching, for why server data is not component state.
- **Stable cache key.** The key derived from the request inputs is how the cache dedups concurrent callers, refetches on input change, and invalidates after a mutation. An unstable key defeats all three.
- **The success path is not the only path.** Wrap an async read in `<Suspense>` with a real fallback, and put an error boundary around each independently-failing region so one failed request does not blank the page.
- **No error-boundary hook.** A render error has to be caught by a class component's `componentDidCatch` / `getDerivedStateFromError`, or by `react-error-boundary` which wraps that.
- **Keep input responsive.** `useTransition` marks an update non-urgent; `useDeferredValue` reads a lagging copy. Either keeps typing and clicks responsive while a large list re-renders.
- **Optimistic needs rollback.** `useOptimistic` shows the result before the write confirms — with no rollback path, a failed write leaves a lie on screen. Update the cache from the mutation response.
