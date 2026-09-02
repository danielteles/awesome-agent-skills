# Vue — Testing by Role: why

The rules are in the `vue` Ruleset (`testing` group). This file is the reasoning and a `❌ / ✅`
example — it adds no rule the Ruleset does not state.

- **Query the way a user perceives.** `@testing-library/vue` (or `mount`, never `shallowMount`)
  plus `getByRole('button', { name: 'Save' })` asserts on the accessible UI. A selector on
  `wrapper.find('.save-btn')` or a read of `wrapper.vm.someState` breaks on a refactor the user
  would never notice and passes when the visible behavior is wrong.
- **`emitted()` counts are not behavior.** Asserting "emitted `save` once" is testing the
  implementation. Assert the effect the emit produces — the parent updated, the row appeared —
  unless the event *is* the contract at that boundary.
- **Mock at the network boundary.** MSW intercepts the request; stubbing `fetch` or mocking the
  composable couples the test to how data is loaded rather than what renders.
- **Await async updates.** `await nextTick()`, `await flushPromises()`, or a `findBy*` query before
  the assertion — a synchronous `expect` right after an interaction races the re-render.
- **Composables through a host.** Test a composable by mounting a tiny component that uses it and
  asserting on rendered output; isolated calls only when there is no component.
- **Teleported nodes are in `document`.** A modal rendered with `<Teleport>` is not inside the
  mounted wrapper; query it via `screen` / `document`.

```ts
// ❌ shallowMount, internal state, emitted-count assertion, no await
const wrapper = shallowMount(TodoItem, { props: { todo } });
wrapper.find('input[type=checkbox]').setValue(true);
expect(wrapper.vm.checked).toBe(true);
expect(wrapper.emitted('toggle')).toHaveLength(1);

// ✅ render, role query, awaited interaction, assert on output
render(TodoList, { props: { todos } });
await userEvent.click(screen.getByRole('checkbox', { name: /buy milk/i }));
expect(screen.getByRole('listitem', { name: /buy milk/i })).toHaveTextContent('done');
```
