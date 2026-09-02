# Slots vs Configuration Props — why

The rules are in the `component-api-design` Ruleset (`slots-vs-config` group). This file is the
reasoning and a `❌ / ✅` example — it adds no rule the Ruleset does not state.

- **Config props do not scale to structure.** Every new layout need adds a prop —
  `showFooter`, `headerActions`, `leftIcon`, `rightAddon`, `renderTitle` — and the component's
  render becomes a maze of conditionals. The component is only extensible by its maintainer editing
  it (closed for extension — `architecture-and-design`, solid).
- **Slots invert that.** `children` and named slots let the caller supply the markup, so a new
  arrangement is a new *composition* the maintainer never sees. The component owns behaviour and
  wiring; the caller owns content.
- **The dividing line.** Use a slot when the caller provides markup or a subtree. Use a prop when
  the component decides the markup from a value (a `variant`, a `count`, a `status`). `icon="search"`
  is a prop if the component maps names to icons; `icon={<SearchIcon />}` is a slot.
- **Expose state through the slot when needed.** A render prop or scoped slot passes a small, typed,
  stable argument (`{ isOpen, close }`) — not the whole internal state object.
- **Name slots by role.** `header`, `actions`, `empty` — positions that stay meaningful as uses
  change, not `dashboardHeaderSlot`.

```tsx
// ❌ structure expressed as a growing prop list
<Card
  title="Revenue"
  showFooter
  footerText="Updated 2m ago"
  headerActionLabel="Export"
  onHeaderAction={exportCsv}
/>

// ✅ slots for markup, props for values
<Card>
  <Card.Header>
    Revenue
    <Card.Actions><Button onClick={exportCsv}>Export</Button></Card.Actions>
  </Card.Header>
  <Card.Body>{/* … */}</Card.Body>
  <Card.Footer>Updated 2m ago</Card.Footer>
</Card>
// Vue: <template #header> / <template #actions>; Angular: <ng-content select="[card-header]">
```
