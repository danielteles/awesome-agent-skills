# Vue — Composables: why

The rules are in the `vue` Ruleset (`composables` group). This file is the reasoning and a `❌ / ✅`
example — it adds no rule the Ruleset does not state.

- **Composables replace mixins.** A `useX()` function composes explicitly — you see what it returns
  and what it needs — where a mixin merges names into the component silently and two mixins can
  collide. It is also unit-testable on its own through a host component.
- **Accept a ref or a getter.** If a composable only accepts a plain value, the caller loses
  reactivity passing `props.id`. Accept `MaybeRefOrGetter<T>` and read it with `toValue()` inside,
  so `useThing(() => props.id)` and `useThing(idRef)` both stay live.
- **Register lifecycle synchronously.** `onMounted`, `onUnmounted`, and `watch` must be called
  before any `await` in the composable, or Vue cannot attach them to the current instance and the
  cleanup never runs.
- **No accidental module-scope state.** A `ref` declared at module scope inside a composable file
  is one shared instance for every caller — and on the server it persists across requests, leaking
  one user's data to the next. Declare state inside the function unless a singleton is the explicit
  intent.
- **Return a plain object.** Returning a `reactive` bag forces callers to avoid destructuring;
  return `{ x, y, doThing }` of refs and functions.

```ts
// ❌ module-scope state (shared across all callers + SSR requests); plain-value arg; lifecycle after await
const items = ref<Item[]>([]);
export async function useItems(query: string) {
  items.value = await getItems(query); // caller passes props.q once; later changes are never seen
  onUnmounted(() => (items.value = [])); // after an await: no current instance, so it never runs
  return { items };
}

// ✅ per-call state, getter arg read with toValue, sync watch
export function useItems(query: MaybeRefOrGetter<string>) {
  const items = ref<Item[]>([]);
  watch(() => toValue(query), async (q) => { items.value = await getItems(q); }, { immediate: true });
  return { items: readonly(items) };
}
```
