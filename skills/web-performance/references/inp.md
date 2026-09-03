# Interaction to Next Paint — why

The rules are in the `web-performance` Ruleset (`inp` group).

- **INP is the worst interaction, not the average.** One 400 ms tap during the visit sets the
  score. The cause is almost always a long task blocking the main thread: the browser cannot paint
  the response until the task yields.
- **Break up long work.** Anything over 50 ms is a long task. Chunk it and yield —
  `await scheduler.yield()`, `setTimeout`, or `isInputPending()` — so the browser can service the
  click between chunks. Pure computation belongs in a Web Worker.
- **Handlers do the minimum synchronously.** Update the state that shows immediate feedback, then
  defer the heavy re-render or network work. In React, wrap the non-urgent update in
  `startTransition` so typing stays responsive while a big list re-renders.
- **Tame high-frequency events.** `input`, `scroll`, and `pointermove` fire in bursts; debounce or
  throttle, and never interleave DOM reads and writes in the handler (layout thrash).
- **Hydration competes with the first tap.** A large synchronous hydration pass right after load is
  a classic INP offender — defer it, chunk it, or hydrate only interactive islands (`javascript`).

```tsx
// ❌ filters the whole list synchronously on every keystroke — long task, janky typing
function Search({ items }: { items: Item[] }) {
  const [q, setQ] = useState('');
  const results = items.filter((i) => matches(i, q)); // 10k items, runs on the keydown
  return <><input value={q} onChange={(e) => setQ(e.target.value)} /><List rows={results} /></>;
}

// ✅ urgent input update; the expensive re-render is a transition
function Search({ items }: { items: Item[] }) {
  const [q, setQ] = useState('');
  const deferredQ = useDeferredValue(q);
  const results = useMemo(() => items.filter((i) => matches(i, deferredQ)), [items, deferredQ]);
  return <><input value={q} onChange={(e) => setQ(e.target.value)} /><List rows={results} /></>;
}
```
