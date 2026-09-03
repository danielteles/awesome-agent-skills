# Signals for State — why, and an example

The rules are in the `angular` Ruleset (`signals` group).

- **State in `signal()`, derived values in `computed()`.** Signals update only what changed and make the component zoneless-ready. Keep `computed()` pure — it
  is lazy and memoized and may not run when you expect, so a side effect inside it fires unpredictably.
- **Never write a signal inside `effect()`.** An effect that sets state is a hidden update cycle that is hard to trace. Use `computed()` or `linkedSignal()`. An
  `effect()` has one job: push a signal value into a non-reactive API (logging, `localStorage`, a canvas, a third-party widget). Release its resources in the
  `onCleanup` callback, or a leaked timer or listener outlives the component.
- **`untracked()`** around a read you do not want to become a dependency, or that read re-runs the effect.
- **No `cdr.detectChanges()` / `markForCheck()` after a signal write.** The write schedules the view update itself; the call is a no-op that hides the fact the
  state is already reactive. Use `cdr.detectChanges()` only for an imperative non-signal change Angular cannot observe (a widget's imperative method, a plain
  class field read in the template) — and prefer converting that field to a signal.
- **Share state via a `providedIn: 'root'` service** exposing `signal` / `computed` members. Reach for a store library (`@ngrx/signals` SignalStore) only when
  that service grows entities, effects, and derived collections — classic NgRx boilerplate rarely pays off on the frontend (`architecture-and-design`,
  state-and-data).

```ts
readonly query = signal('');
readonly page = signal(1);

// ✅ Derived state, not an effect
readonly params = computed(() => ({ q: this.query(), page: this.page() }));

// ✅ Effect syncs to a non-reactive API, with cleanup
constructor() {
  effect((onCleanup) => {
    const id = setInterval(() => this.poll(), 30_000);
    onCleanup(() => clearInterval(id));
  });
}
```
