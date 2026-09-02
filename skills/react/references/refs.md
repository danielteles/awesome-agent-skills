# React — Refs: why

The rules are in the `react` Ruleset (`refs` group). This file is the reasoning.

- **What a ref is for.** A value that must survive renders but must not trigger one: a DOM node, a timer id, the previous value of something. Writing `ref.current` does not re-render — that is the point, and also why a rendered value must not live in a ref.
- **Not during render.** `ref.current` is not settled while rendering (the DOM node is not attached yet on the first pass). Read and write it in an event handler or an Effect.
- **`ref` is a plain prop** in React 19; `forwardRef` is a legacy wrapper.
- **Ref callbacks can clean up.** A `ref` callback may return a cleanup function that runs when the node is removed — use it to detach a listener you attached in the callback.
- **`useImperativeHandle` sparingly.** Expose a small, named API (`focus`, `scrollIntoView`), not the raw node, so the component's surface stays deliberate.
- **Focus management.** After a client-side navigation, after an async action completes, and when a dialog opens, move focus with a ref — the router and the framework do not. A view change that leaves focus on the old, now-gone element strands keyboard and screen-reader users.
- **Last resort.** Imperative DOM code is harder to read and test. Reach for state or a prop first.
