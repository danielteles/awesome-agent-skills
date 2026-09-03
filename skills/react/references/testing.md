# React — Testing: why, and an example

The rules are in the `react` Ruleset (`testing` group) — the React mechanics for rendering and
querying. Test each layer the way `architecture-and-design`, testing, describes; judge the
individual test by `test-quality` (behavior not implementation, meaningful assertions,
determinism). These are the React specifics.

- **Query by role and accessible name.** It tests the tree a user and a screen reader actually perceive, and a test that cannot find an element by role is often
  flagging a real accessibility gap.
- **`@testing-library/user-event`, awaited**, reproduces the full event sequence (focus, keydown, input, keyup, click) that `fireEvent` skips. Awaiting each
  call removes `act()` warnings and the flakiness they mark.
- **Mock at the network, not a module or hook** (`test-quality`, test-doubles). Mocking a module or a hook to fake data means the test no longer exercises
  the real component and data path; MSW intercepts the request and leaves everything else real.
- **Assert on output**, not state, props, or call counts — a behavior assertion survives a refactor. For async results use `findBy*` or `waitFor`.
- **Test a custom hook through a component** that uses it; `renderHook` only when no such component exists — a hook exists to serve a component.
- **`createPortal` content** is on `document.body`, not inside the `render()` container, so query it via `screen`.
- **No shallow rendering, no Enzyme, no broad snapshot** — they couple the test to the implementation.

```tsx
render(<UserCard user={ada} onRemove={onRemove} />);
await userEvent.click(screen.getByRole('button', { name: 'Remove' }));
expect(onRemove).toHaveBeenCalledWith(ada.id);
```
