# State Management and Data Fetching — why, and examples

The rules are in the `architecture-and-design` Ruleset (`state-and-data` group). Most state bugs come from too much state in the wrong place.

- **Colocate.** State held higher than its readers re-renders the whole subtree between and couples unrelated parts. Lift only when a second component needs the
  same value.
- **Derive, don't store.** A stored copy of something computable goes stale when its input changes.
- **Normalize a server collection held in a client store** — each entity once, keyed by id; three copies of a user means three places to update. A
  query cache is keyed by request and does not normalize, so data it holds stays as fetched.
- **Match the tool to the state kind.** Each kind has a home that handles its lifecycle:

| State kind | Home |
|---|---|
| Server data | A server-cache library (TanStack Query, RTK Query, an Angular resource / RxJS service). |
| URL state (filters, tab, pagination) | Query params. Shareable, survives a reload. |
| Global client state (theme, auth session) | A small store or a context. |
| Local UI state (open, hovered, input draft) | The component. |

- **Context holds low-frequency values only.** A changing context value re-renders every consumer, so fast-changing state belongs in a store with selectors.

## Derive, do not store

```ts
// ❌ `fullName` can fall out of sync with first / last
const [fullName, setFullName] = useState(`${first} ${last}`);

// ✅ Compute on render
const fullName = `${first} ${last}`;
```

## Server state is not component state

It has an owner elsewhere; the client holds a cached copy.

- Use a server-cache library — it handles caching, dedup, refetch, and stale state that hand-rolled effect-into-`useState` code gets wrong.
- Give each request a **stable, serializable cache key** derived from its inputs — that is how the cache dedups, invalidates, and refetches.
- **Fetch at the point of use.** Prop-drilled server data from a far ancestor goes stale and couples the tree.
- **Load independent data in parallel.** A child that fetches only after its parent resolved is a waterfall; sequential requests add their latencies.
- **Update the cache from the mutation response.** An optimistic update with no rollback path shows a lie after a failed write.
- **Set an explicit stale time and retry policy per query type** — the right value for a price is wrong for a dashboard.

```ts
// ❌ Fetch in an effect, store in local state: no cache, no dedup, races on prop change
const [user, setUser] = useState<User>();
useEffect(() => {
  fetch(`/api/users/${id}`).then((r) => r.json()).then(setUser);
}, [id]);

// ✅ A cache library, keyed by input
const { data: user, isPending, error } = useQuery({
  queryKey: ['user', id],
  queryFn: () => api.getUser(id),
  staleTime: 60_000,
});
```
