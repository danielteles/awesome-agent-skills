# RxJS and Async — why, and an example

The rules are in the `angular` Ruleset (`rxjs` group). This file is the reasoning and an example.

- **Signal for state, Observable for a stream over time** — HTTP, router events, WebSocket, DOM events. Convert the stream to a signal at the edge with
  `toSignal()` and render the signal, so the component holds a value, not a subscription.
- **No manual `.subscribe()` without teardown.** A live subscription after destroy is a leak. Add `takeUntilDestroyed()` (called in an injection context, or
  passed a `DestroyRef`) or use the `async` pipe.
- **`HttpClient` from a repository, not a component** (`architecture-and-design`, patterns) — the component depends on a domain interface, not the transport.
  **Cache server state with a cache library**, not a hand-rolled `BehaviorSubject` store (`architecture-and-design`, state-and-data); caching, refetch, and
  staleness are solved there.
- **`resource()` / `httpResource()` for a component-level read** (stable since v22) — a signal-driven request with `value()`, `isLoading()`, and `error()`
  built in, reloaded when its `params` signal changes; `rxResource()` wraps an Observable loader. `toSignal()` stays for a plain stream; a cache library
  earns its place once several components share the data and need dedup and invalidation.
- **Transport errors in one functional interceptor** — map status codes to domain errors, retry an idempotent call with backoff — not a `catchError` in every
  call. **One top-level `ErrorHandler`** for anything that reaches it: report, then show a fallback (`architecture-and-design`, frontend-practices).

```ts
private readonly route = inject(ActivatedRoute);

// ✅ Stream to signal at the edge
readonly id = toSignal(this.route.paramMap.pipe(map((p) => p.get('id'))));
```
