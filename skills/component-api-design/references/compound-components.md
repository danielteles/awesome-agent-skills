# Compound Components — why

The rules are in the `component-api-design` Ruleset (`compound-components` group). This file is the
reasoning and a `❌ / ✅` example — it adds no rule the Ruleset does not state.

- **What the pattern buys.** `<Tabs><Tabs.List><Tabs.Tab/></Tabs.List><Tabs.Panel/></Tabs>` lets the
  caller arrange, reorder, and omit parts while the parts still share `selectedTab` without the
  caller wiring it. It is composition plus implicit state.
- **When it earns its cost.** Only when *both* are true: the caller needs to control the arrangement
  of the parts, and the parts must share state. If the structure is fixed (a `Modal` always has a
  header, body, footer in that order), a flat props or slots API is simpler and has fewer moving
  pieces.
- **Share state through context.** Passing state by cloning `children` and injecting props is
  fragile — it breaks with a wrapping `<div>` or a `.map`. A context provider set by the parent and
  read by each subcomponent works at any nesting depth. A subcomponent rendered with no parent
  throws a clear "must be used within `<Tabs>`" error.
- **Accessibility spans the whole.** The roles, `aria-controls` / `aria-selected` wiring, and arrow-
  key handling live across `Tabs`, `Tabs.Tab`, and `Tabs.Panel` together, following the APG tabs
  pattern (`accessibility`).
- **Namespace the parts.** `Tabs.Tab` (or a co-located export) signals they belong together and
  are typed as a set.

```tsx
// ❌ cloneElement prop injection — breaks with any wrapper, no error when misused
function Tabs({ children, ...rest }) {
  return Children.map(children, (c) => cloneElement(c, { ...rest }));
}

// ✅ context-shared state, guarded subcomponents, namespaced
const TabsCtx = createContext<TabsContext | null>(null);
export function Tabs({ defaultValue, children }: TabsProps) {
  const [value, setValue] = useState(defaultValue);
  return <TabsCtx value={{ value, setValue }}>{children}</TabsCtx>;
}
Tabs.Tab = function Tab({ value, children }: TabProps) {
  const ctx = useContext(TabsCtx);
  if (!ctx) throw new Error('<Tabs.Tab> must be used within <Tabs>');
  return <button role="tab" aria-selected={ctx.value === value} onClick={() => ctx.setValue(value)}>{children}</button>;
};
```
