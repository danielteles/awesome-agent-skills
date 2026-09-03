# The Props Contract — why

The rules are in the `component-api-design` Ruleset (`props-contract` group). This file is the
reasoning and a `❌ / ✅` example — it adds no rule the Ruleset does not state.

- **Every prop is permanent.** Once a consumer uses it, removing or changing it is a breaking
  change. A prop is also a test case, a line of docs, and a branch the next maintainer must reason
  about. Add one only when a real caller needs it; a "we might want to configure this" prop is
  liability with no payoff.
- **Make illegal states unrepresentable.** Four booleans (`isPrimary`, `isDanger`, `isGhost`,
  `isLink`) allow sixteen combinations, most nonsensical, and the component needs precedence rules
  for `isPrimary && isDanger`. One `variant` union has exactly the valid values and the type checker
  enforces it.
- **Name for intent, consistently.** A handler follows the framework's event convention —
  `on<Event>` in React, no `on` prefix on an Angular output, `update:x` for a Vue model; a boolean
  reads as a state (`disabled`, not `enabled={false}`); the same concept has the same name across
  the library (`onChange` everywhere, not `onChange` here and `onUpdate` there).
- **Do not leak internals.** A prop typed as the component's private `InternalRowModel` couples
  every caller to a shape that should be free to change. Export a deliberate public type.
- **No god object.** A single `config={{ ... }}` prop is an un-typed, un-discoverable API. Real
  named props with defaults let the common case pass nothing.

```tsx
// ❌ boolean explosion, inconsistent handler name, internal type, config bag
type ButtonProps = {
  isPrimary?: boolean;
  isDanger?: boolean;
  isSmall?: boolean;
  clicked?: () => void;
  config?: Partial<InternalButtonState>;
};

// ✅ unions for each axis, sensible defaults, consistent names, public types
type ButtonProps = {
  variant?: 'primary' | 'secondary' | 'ghost'; // default 'secondary'
  tone?: 'neutral' | 'danger'; // default 'neutral'
  size?: 'sm' | 'md'; // default 'md'
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
};
```
