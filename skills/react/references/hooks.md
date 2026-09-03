# React — Rules of Hooks: why, and an example

The rules are in the `react` Ruleset (`hooks` group).

- **Top level, unconditional.** React identifies each hook by its call order within a render. A hook skipped by a condition or an early `return` shifts every
  later hook onto the wrong slot, so state and effects from one hook leak into another. This is why a hook cannot go in a condition, loop, nested function,
  event handler, `try`/`catch`, or a callback passed to `useMemo` / `useReducer` / `useEffect` — those run outside the render's hook sequence.
- **Only in a component or custom hook.** A hook needs a render to attach its state to. Called from a plain function there is no render, and it throws.
- **Custom hooks for shared stateful logic.** A `useX` hook composes and is testable in isolation, where a shared base component or a render prop drags
  rendering along with the logic. Return a stable, typed value.
- **Honest dependency arrays.** A missing dependency freezes the value the effect or callback closed over on an earlier render. The bug shows up later, far from
  the lie, as a stale value or an update that never fires.

```tsx
// ❌ Hook after an early return — the call order changes between renders
function Row({ user }: { user?: User }) {
  if (!user) return null;
  const [open, setOpen] = useState(false); // skipped whenever user is undefined
  // ...
}

// ✅ Every hook first, unconditionally; branch on the value afterwards
function Row({ user }: { user?: User }) {
  const [open, setOpen] = useState(false);
  if (!user) return null;
  // ...
}
```
