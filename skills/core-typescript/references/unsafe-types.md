# Ban Unsafe Types — why, and an example

The rules are in the `core-typescript` Ruleset (`unsafe-types` group). This file is the reasoning
and an example.

- **`any`** turns off every check for that value *and the values it touches* — it spreads. Take an unknown input as `unknown` and narrow it (see `narrowing`).
- **`as`** to force a type tells the compiler to stop checking. Use a type guard. `as any` and `as unknown as T` are holes with no check at all.
- **`!`** (non-null assertion) hides a real `undefined`. Use it only when the value is proven present on the line directly above, and say so.
- **`Function`, `Object`, `{}`** as types are near-useless: `Function` is unsafe to call, `{}` means "anything except `null`/`undefined`". Use `object` when you
  mean a non-primitive.
- **`@ts-ignore`** silently rots — it stays after the underlying error is fixed. `@ts-expect-error` with a comment fails the build once the error is gone.

```ts
// ❌ The cast hides a real mismatch
const config = JSON.parse(raw) as AppConfig;

// ✅ Parse, then check
const config: unknown = JSON.parse(raw);
if (!isAppConfig(config)) throw new Error('Invalid config');
```
