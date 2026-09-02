# Component API Design — Worked Example: A Review Pass

A full pass in the skill's Output Format. Findings cite the Ruleset topic they fail.

Input diff:

```tsx
// select-field.tsx — proposed in a pull request
1   type SelectFieldProps = {
2     options: InternalOption[];
3     value?: string;
4     onValueChanged?: (v: string) => void;
5     isPrimary?: boolean;
6     isCompact?: boolean;
7     showClearButton?: boolean;
8     renderOptionRow?: (o: InternalOption) => JSX.Element;
9     config?: Record<string, unknown>;
10  };
11
12  export function SelectField(props: SelectFieldProps) {
13    const [selected, setSelected] = useState(props.value ?? '');
14    // ... renders using `selected`, calls props.onValueChanged on change
15  }
```

Output:

```
must-fix · controlled-uncontrolled · select-field.tsx:13 — accepts `value` but also keeps `selected` state, so the two drift and the mode can flip. Pick one contract: controlled when `value` is passed, else uncontrolled from `defaultValue`.
must-fix · props-contract · select-field.tsx:2 — `options: InternalOption[]` exposes an internal type. Export a public `SelectOption` type ({ value, label, disabled? }).
must-fix · props-contract · select-field.tsx:5 — `isPrimary` + `isCompact` are booleans for what are really axes. Use `variant?: 'primary' | 'default'` and `size?: 'sm' | 'md'`.
must-fix · props-contract · select-field.tsx:9 — `config?: Record<string, unknown>` is an untyped god-object prop. Replace with named, typed props.
must-fix · slots-vs-config · select-field.tsx:7 — `showClearButton` plus `renderOptionRow` is config for structure. Take a `clear` action slot and an `option` render slot with a typed argument.
must-fix · props-contract · select-field.tsx:4 — `onValueChanged` breaks the library's `on<Event>` convention. Name it `onChange`.
consider · props-contract · select-field.tsx:1 — no `className` / `id` / `aria-*` passthrough. Forward the standard DOM props to the control.
consider · versioning · select-field.tsx:1 — if this replaces an existing `Select`, ship it additively with a deprecation on the old props, not as a drop-in rename.
```
