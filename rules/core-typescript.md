---
name: core-typescript
description: >-
  Language-level TypeScript conventions for every project, framework or not.
  Covers compiler strictness, safe typing, inference and `satisfies`,
  discriminated unions, narrowing with type guards and assertion functions,
  generics, utility and type-level tools, nullability, async rules, error
  handling, module hygiene, and a review checklist. This is the base skill that
  the React and Angular skills extend, and that the architecture-and-design
  skill composes with. Use it when writing, reviewing, or refactoring
  TypeScript, or when setting up `tsconfig.json`. Also use when the user says
  "TypeScript", "tsconfig", "strict mode", "type error", "is this typed
  correctly", "any", "generics", "type safety", "utility types", "discriminated
  union", or "narrowing".
---

# Core TypeScript Conventions — Base Engineering Skill

This skill holds the language-level TypeScript rules for every project, framework or not. It is the base skill. The React and Angular skills extend it. The architecture-and-design skill composes with it.

Every rule here assumes the compiler runs in `strict` mode (Section 1). The examples are plain TypeScript with no framework.

---

## How to Use This Skill

Pick the mode that matches the task. Do the steps in order.

| Mode | Steps |
|---|---|
| **Generate** — write new TypeScript | 1. Assume `strict` is on (Section 1). 2. Write the code and apply Sections 2 to 14 as you go. 3. Annotate the return type of every exported function (Section 9). 4. Run the Section 15 checklist. Fix each fail before you hand off. |
| **Review** — check a diff | 1. Run the Section 15 checklist against the diff. 2. Write one finding per fail, in the Output Format below. 3. Order the findings: `must-fix` first, then `consider`. 4. If nothing fails, say so in one line. Do not invent findings. |
| **Configure** — set up or audit `tsconfig.json` | 1. Start from the Section 1 block. 2. Turn on every flag listed. 3. For a flag you cannot turn on yet, add a `// TODO` with the reason. 4. Do not relax a flag to clear an error. Fix the code. |

### Output Format

Write one finding per line:

```
<severity> · Section <n> · <file>:<line> — <what is wrong>. <the fix as an action>.
```

- `<severity>` is `must-fix` (breaks a rule in this skill or the build) or `consider` (safe, but a rule prefers another form).
- `<n>` is a section number from this skill. Cite only numbers that exist here.

### Rules for Every Mode

- Cite a section number when you enforce a rule.
- Prefer the simplest type that stays precise. A wider type hides bugs. An over-clever type slows the next reader.
- A type that needs a comment to explain it is a smell. Give it a name, or make it simpler.

---

## Rules at a Glance

| Section | Rule |
|---|---|
| 1 | Run `strict` plus `noUncheckedIndexedAccess` and the extra flags. Never relax a flag to hide an error. |
| 2 | No `any`, no `as`, no `!`, no `@ts-ignore`. Take an unknown value as `unknown` and narrow it. |
| 3 | Let the compiler infer. Use `satisfies` to check a literal without widening it. |
| 4 | Model data with literal unions and discriminated unions. Never a TypeScript `enum`. |
| 5 | Narrow with a type guard or an assertion function. End every union `switch` with `assertNever`. |
| 6 | Add a generic only when two types move together. Constrain it. No single-use type parameter. |
| 7 | Derive related types with utility types, `keyof`, `typeof`, and indexed access. Do not hand-copy a shape. |
| 8 | Use `undefined` as the one empty value. Use `?.` and `??`, not `||`, for a default. |
| 9 | Annotate the return type of every exported function. Pass an options object, not many positional args. |
| 10 | Never leave a promise floating. Run independent calls with `Promise.all`. |
| 11 | A `catch` binding is `unknown`. Narrow before use. Throw an `Error`, never a string. |
| 12 | Use `import type`. Prefer named exports. No circular imports. No project-wide barrel. |
| 13 | `===` only. `const` by default. No parameter reassignment. |
| 14 | Run the `typescript-eslint` type-checked rules. Format with Prettier. |

---

## 1. Compiler Configuration

Type safety starts in `tsconfig.json`. A loose configuration makes every later rule optional.

```jsonc
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true,
    "forceConsistentCasingInFileNames": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "target": "ES2022",
    "module": "ESNext"
  }
}
```

| Flag | Why |
|---|---|
| `strict` | Turns on `noImplicitAny`, `noImplicitThis`, `alwaysStrict`, `strictNullChecks`, `strictFunctionTypes`, `strictBindCallApply`, `strictPropertyInitialization`, `strictBuiltinIteratorReturn`, and `useUnknownInCatchVariables`. A later version can add more. |
| `noUncheckedIndexedAccess` | Adds `undefined` to `array[i]` and `record[key]`. Not part of `strict`. Catches a class of runtime errors. |
| `exactOptionalPropertyTypes` | Keeps `{ x?: number }` and `{ x: number \| undefined }` apart. Not part of `strict`. Some libraries need work-arounds. |
| `noImplicitOverride`, `noFallthroughCasesInSwitch`, `noImplicitReturns` | Separate flags, not part of `strict`. Turn each on. |
| `verbatimModuleSyntax` | Emits imports and exports as written. An unmarked type import stays in the output (Section 12). |
| `skipLibCheck` | Skips the type check of every `.d.ts`, including your own, not only `node_modules`. Faster build. A fault in a hand-written `.d.ts` can pass unseen. |

---

## 2. Ban Unsafe Types

| Rule | Why |
|---|---|
| No `any`. Take an unknown input as `unknown`, then narrow it (Section 5). | `any` turns off every check for that value and the values it touches. |
| No `as` to force a type. Use a type guard. | A cast tells the compiler to stop checking. |
| Never `as any` or `as unknown as T`. | A hole in the type system with no check at all. |
| Use `!` only when the value is proven present on the line above. | The non-null assertion hides a real `undefined`. |
| No `Function`, `Object`, or `{}` as a type. `object` is fine when you mean a non-primitive. | `Function` is unsafe to call. `{}` means "anything except `null` or `undefined`". |
| No `@ts-ignore`. Use `@ts-expect-error` with a comment. | `@ts-expect-error` fails the build once the error is fixed, so it does not rot. |

```ts
// ❌ The cast hides a real mismatch
const config = JSON.parse(raw) as AppConfig;

// ✅ Parse, then check
const config: unknown = JSON.parse(raw);
if (!isAppConfig(config)) throw new Error('Invalid config');
```

---

## 3. Let Inference Work; Use `satisfies`

| Rule | Why |
|---|---|
| Do not annotate a value the compiler already infers exactly. Exception: a public API boundary (Section 9). | A repeated annotation is noise and can widen the type. |
| Use `satisfies` (TypeScript 4.9 or later) to check a literal against a shape. | It validates the shape without widening the value's type. |

```ts
// ❌ The annotation widens: routes.home is string, not '/'
const routes: Record<string, string> = { home: '/', about: '/about' };

// ✅ satisfies checks the shape and keeps the literal types
const routes = {
  home: '/',
  about: '/about',
} satisfies Record<string, `/${string}`>;

routes.home; // type is '/'
```

---

## 4. Model Data with Precise Types

| Rule | Why |
|---|---|
| Use a union of string literals, not a TypeScript `enum`. `const enum` is not the fix. | `enum` adds runtime code and has surprising nominal rules. `const enum` breaks under `isolatedModules`. |
| Freeze a runtime lookup with `as const`. | It keeps the literal types and blocks mutation. |
| Mark unchanging data `readonly`. Use `readonly T[]` for a list. | The compiler then rejects a mutation. |
| Model mutually exclusive states as a discriminated union. Design rationale: architecture-and-design Section 7.2. | A shared discriminant field lets the compiler narrow and check every case. |

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
```

---

## 5. Narrowing: Type Guards and Assertion Functions

| Tool | Shape | Use |
|---|---|---|
| Type guard | `function f(v: unknown): v is T` | Narrow `unknown` or a union by returning a boolean. |
| Assertion function | `function f(v: unknown): asserts v is T` | Narrow by throwing instead of returning. |
| `assertNever` | `function f(v: never): never` | End a union `switch` so a new member fails to compile. |

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

---

## 6. Generics with Restraint

| Rule | Why |
|---|---|
| Add a generic only when two types move together, for example an input type and a return type. | A type parameter used once is `unknown` with extra syntax. |
| Constrain a type parameter with `extends`. | The body can then use its shape. |
| Give a common type parameter a default. | Most callers skip the explicit argument. |
| Use a `const` type parameter (`<const T>`, TypeScript 5.0) when the caller passes a literal. | It keeps the narrow type without `as const` at each call site. |

```ts
// ❌ T is used once; it adds nothing
function first<T>(list: T[]): unknown {
  return list[0];
}

// ✅ T links the parameter and the return type
function first<T>(list: readonly T[]): T | undefined {
  return list[0];
}

// ✅ Constrained and with a default
function pluck<T, K extends keyof T = keyof T>(item: T, key: K): T[K] {
  return item[key];
}
```

---

## 7. Utility and Type-Level Tools

Derive a related type. Do not hand-copy a shape.

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

---

## 8. Nullability

| Rule | Why |
|---|---|
| Use `undefined` as the one empty value. Reserve `null` for an external contract that sends it. | One convention removes "which empty is it" branches. |
| Read `array[i]` and `record[key]` as possibly `undefined` (needs `noUncheckedIndexedAccess`). | The index may not be present at runtime. |
| Use `?.` and `??`. Do not use `||` for a default when `0` or `''` is valid. | `||` also replaces `0`, `''`, and `false`. |

```ts
// ❌ `||` replaces a valid 0
const pageSize = input.pageSize || 20;

// ✅ `??` replaces only null or undefined
const pageSize = input.pageSize ?? 20;
```

---

## 9. Functions and Signatures

| Rule | Why |
|---|---|
| Annotate the return type of every exported function. | It fixes the contract and stops an accidental widening. |
| Let a local, non-exported function infer its return type. | The annotation adds nothing inside one file. |
| Pass one options object, not a long parameter list. | Order-dependent booleans are unreadable at the call site. |
| Use a union parameter, not an overload set, when the bodies match. | Fewer signatures to keep in sync. |

```ts
// ✅ The annotation `: number` checks the body against the contract
export function toCents(raw: string): number {
  return Math.round(Number(raw) * 100);
}

// ❌ Three positional args, two of them boolean
function createUser(name: string, isAdmin: boolean, sendEmail: boolean) { /* ... */ }

// ✅ One options object
function createUser(options: { name: string; isAdmin: boolean; sendEmail: boolean }) { /* ... */ }
```

---

## 10. Asynchronous Code

| Rule | Why |
|---|---|
| Never leave a promise unhandled. `await` it, or mark it `void`. | A floating promise swallows its error. |
| Run independent async work with `Promise.all`. | Serial `await` wastes time when the calls do not depend on each other. |
| Use serial `await` only for a step that needs the previous result. | Otherwise the calls can run in parallel. |

```ts
// ❌ Floating promise: an error here is swallowed
sendAnalytics(event);

// ✅ Awaited, or ignored on purpose
await sendAnalytics(event);
void sendAnalytics(event);

// ❌ Serial when the calls are independent
const user = await getUser(id);
const roles = await getRoles(id);

// ✅ Parallel
const [user, roles] = await Promise.all([getUser(id), getRoles(id)]);
```

---

## 11. Errors are `unknown`

| Rule | Why |
|---|---|
| A `catch` binding is `unknown` (from `useUnknownInCatchVariables`). Narrow before you read a field. | `.message` does not type-check on `unknown` and may not exist. |
| Extend `Error` for a custom type. Set `name`. Below an ES2015 `target`, also call `Object.setPrototypeOf(this, new.target.prototype)`. | Without it, `instanceof` fails on the subclass. |
| Throw an `Error`, never a string or a plain object. | A thrown non-`Error` has no stack and breaks `instanceof` checks. |

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

---

## 12. Modules and Imports

| Rule | Why |
|---|---|
| Use `import type` and `export type`, or an inline `type` on the name. | It keeps types out of the build. Under `verbatimModuleSyntax`, an unmarked type import runs at runtime. |
| Prefer a named export. | A default export has no fixed name and refactors badly. |
| No circular import between two modules. | It resolves to `undefined` at module load. |
| A feature `index.ts` barrel is fine. No project-wide barrel. | A wide barrel breaks tree-shaking and invites cycles (architecture-and-design Section 6.2). |

```ts
// ❌ Pulls a type through the value graph
import { User, getUser } from './user';

// ✅ Types marked as types
import type { User } from './user';
import { getUser } from './user';
```

---

## 13. Language Hygiene

| Rule | Why |
|---|---|
| `===` and `!==` only. The one exception is `x == null`, which tests `null` and `undefined` together. | `==` runs type coercion with surprising results. |
| `Number.isNaN` and `Number.isFinite`, not the global `isNaN`. | The global coerces its argument first. |
| `const` by default. `let` only for a reassigned variable. Never `var`. | `var` ignores block scope. |
| Do not reassign a function parameter. Make a new local. | A reassigned parameter hides the original input. |
| For real bit flags, use a `const` object of powers of two plus a derived type. | A string-literal union cannot represent an OR of two flags. |

---

## 14. Lint and Format

| Rule | Why |
|---|---|
| Run `typescript-eslint` with the `recommended-type-checked` config. | It enforces many rules in this skill automatically. |
| Turn on `no-floating-promises`, `no-explicit-any`, `consistent-type-imports`, and `switch-exhaustiveness-check`. | These map to Sections 10, 2, 12, and 5. |
| Format with Prettier. | Style stops being a review topic. |

---

## 15. Code Review Checklist

Run this checklist before you approve a change or finish generated code. This step is not optional. Name the section number for each item that fails.

Make sure that:

- [ ] **No `any`:** an unknown value is typed `unknown` and narrowed. No `as any`, no `as unknown as T`.
- [ ] **Assertions justified:** every `as` and every `!` has a guard or a comment that proves it is safe.
- [ ] **Strict on:** the project runs `strict` plus `noUncheckedIndexedAccess`.
- [ ] **Literal unions:** a string set uses a union or a frozen `const` object, not a TypeScript `enum`.
- [ ] **Exhaustive switch:** every `switch` on a union ends with an `assertNever` default.
- [ ] **Public return types:** every exported function annotates its return type.
- [ ] **No floating promise:** every promise is awaited or marked `void`.
- [ ] **Catch is narrowed:** no field read on a raw `catch` binding.
- [ ] **Type-only imports:** a type reference uses `import type`.
- [ ] **Equality:** `===` and `!==` everywhere.
- [ ] **Inference:** no annotation that only repeats what the compiler already infers.

---

## 16. Worked Example: A Review Pass

Input diff:

```ts
// money.ts — proposed in a pull request
1  enum Currency { USD = 'USD', EUR = 'EUR' }
2
3  export function format(amount, currency: Currency) {
4    const symbol = currency == Currency.USD ? '$' : '€';
5    return symbol + (amount / 100).toFixed(2);
6  }
7
8  export async function loadRate(from: string, to: string) {
9    fetch(`/api/rate?from=${from}&to=${to}`)
10     .then((res) => res.json())
11     .then((data) => cache.set(`${from}:${to}`, data as Rate));
12 }
```

Output, in the format from How to Use This Skill:

```
must-fix · Section 2 · money.ts:3 — `amount` has an implicit `any`. Annotate it `number`.
must-fix · Section 10 · money.ts:9 — the `fetch` chain floats and swallows errors. Return `await fetch(...)` and its parsed value.
must-fix · Section 2 · money.ts:11 — `data as Rate` asserts an unproven shape. Parse it with a schema (architecture-and-design Section 4).
must-fix · Section 13 · money.ts:4 — `==` used. Change to `===`.
consider · Section 4 · money.ts:1 — `enum Currency` adds runtime code. Use `type Currency = 'USD' | 'EUR'`.
consider · Section 9 · money.ts:3 — `format` has no return type. Add `: string`.
consider · Section 4 · money.ts:4 — the `'$' : '€'` branch does not scale. Map currency to symbol in a frozen `const` object.
```

---

## Limits

This skill is language-level TypeScript. It does not cover:

- Architecture, layering, state management, and component design — see architecture-and-design.
- Framework APIs and patterns — see react and angular.
- Build tooling, bundlers, and monorepo setup beyond the `tsconfig` baseline in Section 1.
- Runtime schema libraries (Zod, Valibot) — named where relevant, not taught here.

This skill decides the syntax. It does not replace reading the code and understanding the domain.

---

## References

This skill is the language base. It composes with:

- **`architecture-and-design.md`** — the design layer: SOLID, clean architecture, feature boundaries, state management, security, testing. On a shared topic such as discriminated unions or branded ids, architecture-and-design decides the design and this skill decides the syntax.
- **`react.md`** — extends this skill with React: hooks, effects, memoization, TSX conventions.
- **`angular.md`** — extends this skill with Angular: standalone components, signals, `OnPush`, dependency injection, RxJS.

When a framework skill and this skill conflict on a language point, this skill wins.
