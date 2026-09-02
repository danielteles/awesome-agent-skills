# React — Components and Purity: why, and examples

The rules are in the `react` Ruleset (`purity` group). This file is the reasoning and a code
example; if it ever disagrees with the Ruleset, the Ruleset wins.

## Why render must be pure

- React may call a component many times, in any order, and discard the result. A render that mutates or has a side effect produces different output on the
  second call.
- Strict Mode double-invokes render (and Effects) in development precisely to surface impurity and missing cleanup. Code that only works with Strict Mode off is
  broken.

## Why not `React.FC`

It injects an implicit `children` (so a component that takes none still type-checks with children passed), and it blocks generic components. A plain `type` or
`interface` on the props is more precise. Type `children` explicitly as `ReactNode` when the component takes them.

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
`key`, a missing `key`, an unstable nested component); `eslint-plugin-react-hooks` (v5) catches conditional hooks and broken dependency arrays that no type
checker sees — a suppressed warning in either is a latent bug.

## Accessibility

A `<div onClick>` has no role, no keyboard behavior, and no focusability; a screen reader and the Tab key both skip it. Reach for `<button>` / `<a href>` /
`<label>` first, give every control an accessible name, and use `useId()` for the id that ties a `<label>` (or `aria-describedby`) to its field — it is stable
across server and client render, which a hand-made id is not. Full lens: the `accessibility` skill.
