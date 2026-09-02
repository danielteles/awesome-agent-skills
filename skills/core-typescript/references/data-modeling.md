# Model Data with Precise Types — why, and examples

The rules are in the `core-typescript` Ruleset (`data-modeling` group). This file is the reasoning
and examples. On the design of these shapes, `architecture-and-design` (patterns, type-safety)
decides; this skill decides the syntax.

- **Union of string literals, not `enum`.** A TypeScript `enum` emits runtime code and has surprising nominal rules (a plain string is not assignable to it). `const enum` breaks under `isolatedModules`. When you need the values at runtime, freeze a `const` object with `as const` and derive the type from it.
- **`readonly`** on unchanging data (and `readonly T[]` for a list) makes the compiler reject a mutation.
- **Discriminated union** for mutually exclusive states: a shared discriminant field (`kind`, `status`) lets the compiler narrow each case and flag a missing one.
- **Branded id** for a domain identifier: `string` ids are all interchangeable to the compiler, so a `UserId` and an `OrderId` swap silently. A brand makes the swap a compile error. Mint the branded value with one sanctioned cast, at the boundary where the raw string enters.

```ts
// ❌ Runtime code, nominal typing, no plain string assignment
enum Role { Admin = 'admin', Editor = 'editor' }

// ✅ Erased at build; a plain string works
type Role = 'admin' | 'editor';

// ✅ When you need the values at runtime
const ROLE = { admin: 'admin', editor: 'editor' } as const;
type Role = (typeof ROLE)[keyof typeof ROLE];

// ✅ Discriminated union: the `kind` field is the discriminant
type Result =
  | { kind: 'ok'; value: number }
  | { kind: 'err'; error: Error };

function unwrap(result: Result): number {
  switch (result.kind) {
    case 'ok':
      return result.value;
    case 'err':
      throw result.error;
    default:
      return assertNever(result);
  }
}

// ✅ Branded id: a compile-time tag over a plain runtime string
type UserId = string & { readonly __brand: 'UserId' };
type OrderId = string & { readonly __brand: 'OrderId' };

const toUserId = (raw: string): UserId => raw as UserId; // the one sanctioned cast, at the boundary

declare function loadUser(id: UserId): Promise<unknown>;
declare const orderId: OrderId;
loadUser(orderId); // compile error: OrderId is not assignable to UserId
```
