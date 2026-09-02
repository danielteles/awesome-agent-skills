# React — State: why, and examples

The rules are in the `react` Ruleset (`state` group). This file is the reasoning and an example.

- **Colocate.** State held higher than its readers re-renders everything in between on every change and couples unrelated parts of the tree. Lift only when a
  second component genuinely needs the same value.
- **Derive, don't store.** A value copied into state is a second source of truth that goes stale the moment its input changes. Compute it during render; memoize
  only if the computation is measurably expensive.
- **No mirrored props.** `useState(props.x)` reads `props.x` once and then stops tracking it. Read the prop directly, or lift the state so both sides share it.
- **`key` to reset.** Changing a component's `key` unmounts and remounts it with fresh state — `<Profile key={userId} />` gives each user a clean slate.
  Clearing fields in an Effect is the fragile version of this.
- **Never mutate.** A mutated object or array has the same reference, so React skips the re-render, and `memo` / the React Compiler see "no change". Build a new
  value.
- **Updater form.** `setCount(c => c + 1)` reads the latest value; `setCount(count + 1)` reads the value captured when the closure was created, so batched
  updates in one tick are lost.
- **Lazy init.** `useState(build())` runs `build()` on every render and throws the result away. `useState(() => build())` runs it once.
- **External stores.** `useSyncExternalStore` is tear-free under concurrent rendering; a `useState` + subscribe Effect can show two different values in one
  paint.

```tsx
// ❌ Derived state in an Effect
const [sorted, setSorted] = useState<User[]>([]);
useEffect(() => setSorted([...users].sort(byName)), [users]);

// ✅ Derived during render (memoize only if the list is large)
const sorted = useMemo(() => [...users].sort(byName), [users]);
```
