# React — Effects: why, and the decision aid

The rules are in the `react` Ruleset (`effects` group). This file is the reasoning and an example.

## Why most Effects are a mistake

An Effect runs *after* render, then again on every dependency change and on remount. Using one to
compute render data means the UI paints once with stale or empty data, then again after the Effect
catches up — a visible flash, an extra render, and a dependency array to keep honest. Almost
everything an Effect is reached for has a direct home.

## "You might not need an Effect" — where the logic actually goes

| Reached-for Effect | Where it belongs |
|---|---|
| Transforming data for the render | Compute it during render. |
| An expensive calculation | `useMemo`. |
| Resetting state when a prop changes | A `key` on the component. |
| Adjusting state when a prop changes | Compute during render, or set state during render on the same component. |
| Anything in response to a user event | The event handler. |
| A POST on submit or click | The event handler. |
| A chain of state updates that trigger each other | Compute the whole next state in one handler. |
| One-time app init | Module scope, guarded for the browser. |
| Notifying the parent of a change | The same handler that set the state. |
| Subscribing to an external store | `useSyncExternalStore`. |

## What is left, and how to do it right

An Effect is correct only to synchronize with an external system: a non-React widget, a socket, an
event subscription, the document title.

- **Cleanup is not optional.** The Effect re-runs and unmounts; without a cleanup function it leaks the listener, timer, or subscription it created. One Effect
  per synchronization, so each has one reason to re-run and one thing to clean up.
- **Fetching in an Effect races.** Responses can arrive out of order and overwrite newer data. An `AbortController` or an `ignore` flag is the minimum; a cache
  library (see `data-fetching`) is better.
- **`useEffectEvent`** lets the Effect read the latest prop or state without listing it as a dependency, so it does not re-subscribe on every change. It is the
  honest alternative to omitting the dependency.

```tsx
// ❌ An Effect to derive render data — paints empty, then re-renders once it catches up
const [visible, setVisible] = useState<Item[]>([]);
useEffect(() => setVisible(items.filter((i) => i.active)), [items]);

// ✅ Derive during render (wrap in useMemo only if profiling says it is expensive)
const visible = items.filter((i) => i.active);
```
