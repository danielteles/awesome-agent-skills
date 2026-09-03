# Controlled and Uncontrolled Pairs — why

The rules are in the `component-api-design` Ruleset (`controlled-uncontrolled` group).

- **Two clean modes, never a hybrid.** *Uncontrolled*: the component owns the value, the caller
  seeds it with `defaultValue` and reads it via `ref` or `onChange`. *Controlled*: the caller owns
  the value, passes `value` and `onChange`, and the component is a pure function of `value`. A
  component that keeps its own state *and* accepts `value` has two sources of truth that drift, and
  switching an instance from one mode to the other (a `value` that starts `undefined`) makes the
  framework warn and the cursor jump.
- **`defaultValue` is mount-only.** Reading it on every render turns it into a second, broken
  `value`. Read it once to initialise, then the component owns the value until it unmounts.
- **Controlled means obey.** In controlled mode, render exactly what `value` says and call
  `onChange(next)` when the user asks for a change — do not also apply the change locally. The
  parent applying it re-renders with the new `value`.
- **Default to uncontrolled.** A plain text field does not need the parent to re-render on every
  keystroke. Make the caller opt into controlled when the value drives other UI or live validation.
- **Imperative handle stays small.** If a `ref` API is needed, expose `focus()`, `reset()`,
  `scrollIntoView()` — named, documented verbs — not the raw node or the internal store.

```tsx
// ❌ accepts `value` but also keeps its own state — drifts, and mode can flip
function Rating({ value, onChange }: { value?: number; onChange?: (n: number) => void }) {
  const [stars, setStars] = useState(value ?? 0);
  return <Stars value={stars} onSelect={(n) => { setStars(n); onChange?.(n); }} />;
}

// ✅ one mode per instance: controlled if `value` given, else uncontrolled
function Rating({ value, defaultValue = 0, onChange }: RatingProps) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState(defaultValue);
  const current = isControlled ? value : internal;
  return <Stars value={current} onSelect={(n) => { if (!isControlled) setInternal(n); onChange?.(n); }} />;
}
```
