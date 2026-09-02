# React — Rules of Hooks: why

The rules are in the `react` Ruleset (`hooks` group). This file is the reasoning.

- **Top level, unconditional.** React identifies each hook by its call order within a render. A hook skipped by a condition or an early `return` shifts every later hook onto the wrong slot, so state and effects from one hook leak into another. This is why a hook cannot go in a condition, loop, nested function, event handler, or `try`/`catch`.
- **Only in a component or custom hook.** A hook needs a render to attach its state to. Called from a plain function there is no render, and it throws.
- **Custom hooks for shared stateful logic.** A `useX` hook composes and is testable in isolation, where a shared base component or a render prop drags rendering along with the logic. Return a stable, typed value.
- **Honest dependency arrays.** A missing dependency freezes the value the effect or callback closed over on an earlier render. The bug shows up later, far from the lie, as a stale value or an update that never fires.
