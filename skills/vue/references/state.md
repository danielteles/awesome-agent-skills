# Vue — State and Pinia in the Tiers: why

The rules are in the `vue` Ruleset (`state` group). This file is the reasoning and a `❌ / ✅`
example — it adds no rule the Ruleset does not state.

The tiers, cheapest first (`architecture-and-design`, state-and-data):

| Need | Reach for |
|---|---|
| State one component uses | `ref` in that component. |
| Shared down one subtree | `provide` / `inject` with a typed `InjectionKey`. |
| Cross-view client state, non-trivial | A Pinia store (setup syntax). |
| Server data | A query cache — TanStack Query, or Nuxt `useAsyncData` / `useFetch`. |
| Filters, tab, pagination | The route query. |

- **Do not start at Pinia.** A global store for state that only ever lives in one dialog is
  ceremony: an import, a definition, and a mutation path for something a `ref` covered. Move up a
  tier only when the current one stops scaling.
- **Server data is not store state.** Caching, deduping, revalidation, and loading/error status are
  what a query library gives you; a `ref` or a Pinia field holding fetch results reimplements all
  of it badly and goes stale.
- **Pinia stores mutate through actions.** Setup-syntax store, derived values as `computed`,
  writes through actions or one `$patch`. A component assigning `store.count = 5` or
  `store.$state = …` scatters the write path and bypasses `$onAction` subscribers and plugins
  that expect every mutation to arrive through the store.
- **URL-owned state stays in the URL.** A shareable, reloadable filter belongs in the query string,
  not a store that resets on refresh.

```ts
// ❌ Pinia store that just holds fetch results — no caching, goes stale, manual loading flag
export const useUsers = defineStore('users', () => {
  const users = ref<User[]>([]);
  const loading = ref(false);
  async function load() { loading.value = true; users.value = await getUsers(); loading.value = false; }
  return { users, loading, load };
});

// ✅ query cache keyed by inputs; Pinia only for real cross-view client state
const { data: users, isPending } = useQuery({ queryKey: ['users'], queryFn: getUsers });
```
