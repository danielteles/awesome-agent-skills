# Narrowing: Type Guards and Assertion Functions — why, and examples

The rules are in the `core-typescript` Ruleset (`narrowing` group).

| Tool | Shape | Use |
|---|---|---|
| Type guard | `function f(v: unknown): v is T` | Narrow `unknown` or a union by returning a boolean. |
| Assertion function | `function f(v: unknown): asserts v is T` | Narrow by throwing instead of returning. |
| `assertNever` | `function f(v: never): never` | End a union `switch` so a new member fails to compile. |

A type guard or assertion function is the checked alternative to a cast: it proves the shape at
runtime, where `as` just silences the compiler. `assertNever` in the `default` of a `switch` turns
"someone added a union member and forgot a case" from a runtime surprise into a build error.

```ts
function isUser(value: unknown): value is User {
  return typeof value === 'object' && value !== null && 'id' in value;
}

function assertUser(value: unknown): asserts value is User {
  if (!isUser(value)) throw new Error('Not a User');
}

function assertNever(value: never): never {
  throw new Error(`Unhandled value: ${String(value)}`);
}
```
