# React — Components and Purity: why, and examples

The rules are in the `react` Ruleset (`purity` group). This file is the reasoning and a code
example; if it ever disagrees with the Ruleset, the Ruleset wins.

## Why render must be pure

- React may call a component many times, in any order, and discard the result. A render that mutates or has a side effect produces different output on the
  second call.
- Strict Mode double-invokes render (and Effects) in development precisely to surface impurity and missing cleanup. Code that only works with Strict Mode off is
  broken.

## Why not `React.FC`

It blocks a generic component (a type parameter cannot be expressed on `React.FC`) and hides the props type behind a wrapper, and it no longer adds anything
— the types stopped injecting an implicit `children` in React 18. A plain `type` or `interface` on the props is more precise. Type `children` explicitly as
`ReactNode` when the component takes them.

## Why `ref` as a prop

React 19 passes `ref` like any other prop to a function component. `forwardRef` is a legacy wrapper that no longer buys anything and adds a layer.

```tsx
type UserCardProps = {
  user: User;
  onRemove: (id: UserId) => void;
  ref?: React.Ref<HTMLDivElement>;
};

export function UserCard({ user, onRemove, ref }: UserCardProps) {
  return (
    <div ref={ref}>
      <span>{user.fullName}</span>
      <button onClick={() => onRemove(user.id)}>Remove</button>
    </div>
  );
}
```

## Why the JSX/lint setup

`"jsx": "react-jsx"` enables the automatic runtime, so no `import React` is needed for JSX. `eslint-plugin-react` catches JSX-level mistakes (an array-index
`key`, a missing `key`, an unstable nested component); `eslint-plugin-react-hooks` (v6 or later, `recommended`, which includes the React Compiler rules) catches
conditional hooks, broken dependency arrays, and state set during render — none of which a type checker sees. A suppressed warning in either is a latent bug.

## Accessibility

Element choice and accessible names are the `accessibility` skill's rules. React's own mechanism is `useId()`: the id that ties a `<label>` (or
`aria-describedby`) to its field is stable across server and client render, which a hand-made id is not — and it is never a list key.
