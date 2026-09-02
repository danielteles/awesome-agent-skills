# Utility and Type-Level Tools — why, and examples

The rules are in the `core-typescript` Ruleset (`utility-types` group). This file is the reasoning
and examples. Derive a related type; do not hand-copy a shape — a copy drifts the moment the
original changes.

| Need | Tool |
|---|---|
| A subset or a variant of a type | `Pick`, `Omit`, `Partial`, `Required`, `Readonly`, `Record` |
| A type from a function | `ReturnType`, `Parameters`, `Awaited` |
| Drop `null` and `undefined` | `NonNullable` |
| One field's type | indexed access: `User['address']` |
| A union of keys, or a type from a value | `keyof`, `typeof` |
| A string with a known pattern | a template literal type |

```ts
type User = { id: string; name: string; address: Address };

type UserPreview = Pick<User, 'id' | 'name'>;
type UserPatch = Partial<Omit<User, 'id'>>;
type AddressField = keyof User['address'];
type EventName = `on${Capitalize<'click' | 'focus'>}`; // 'onClick' | 'onFocus'
```
