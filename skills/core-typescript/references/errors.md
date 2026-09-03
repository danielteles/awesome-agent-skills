# Errors are `unknown` — why, and examples

The rules are in the `core-typescript` Ruleset (`errors` group).

- **A `catch` binding is `unknown`** (from `useUnknownInCatchVariables`). `.message` does not type-check on `unknown` and may not exist at runtime — a thrown
  non-`Error` has no such field. Narrow first: `error instanceof Error ? error.message : String(error)`.
- **Throw an `Error`, never a string or a plain object.** A thrown non-`Error` carries no stack and breaks every `instanceof` check downstream.
- **A custom error type extends `Error` and sets `name`.** Below an ES2015 `target`, also call `Object.setPrototypeOf(this, new.target.prototype)` in the
  constructor, or `instanceof` fails on the subclass.

```ts
// ❌ `error` is `unknown`; `.message` does not type-check
try {
  await run();
} catch (error) {
  logger.error(error.message);
}

// ✅ Narrow first
try {
  await run();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  logger.error(message);
}

// ✅ A custom error type
class PaymentError extends Error {
  constructor(message: string, readonly code: string) {
    super(message);
    this.name = 'PaymentError';
  }
}
```
