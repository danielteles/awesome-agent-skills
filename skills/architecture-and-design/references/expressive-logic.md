# Expressive Logic — why, and examples

The rules are in the `architecture-and-design` Ruleset (`expressive-logic` group). This file is the
reasoning and examples. These patterns dominate pull-request review comments.

- **The condition is already the value.** `status === 'active' ? true : false` and `if (c) return true; else return false` both wrap a boolean in a boolean.
  Comparing against a boolean literal (`=== true`, `!== false`) adds a redundant operation.
- **Guard clauses over nesting.** Return early. Flat code scans top to bottom; a pyramid of `if/else` makes the reader hold state.
- **Positive conditions.** `!isNotReady` takes two reads to parse. Name the state so the condition is direct.
- **Name a long boolean chain.** A variable or a predicate function states the intent that the operators hide.
- **`?.` and `??`.** Fewer tokens than a manual `&&` null chain, same safety. When `??` beats `||` is `core-typescript`, nullability.
- **Name magic values.** `900000` does not say "15 minutes"; `3` does not say "max retries".
- **Dispatch table over an `if/else if` ladder** on one value. The ladder edits the same function for every new case (breaks OCP). A `Record<Union, Handler>`
  forces a handler for every member — a missing case fails to compile, a new case adds one entry.

## Redundant booleans

```ts
// ❌ Redundant
const isActive = status === 'active' ? true : false;
const hasAccess = Boolean(user.permissions.length > 0 ? true : false);

// ✅ Direct
const isActive = status === 'active';
const hasAccess = user.permissions.length > 0;

// ❌ Four lines for one expression
function canSubmit(form: Form): boolean {
  if (form.isValid && !form.isPending) {
    return true;
  }
  return false;
}

// ✅ Return the expression
function canSubmit(form: Form): boolean {
  return form.isValid && !form.isPending;
}
```

## Default value

```ts
// ❌
const label = props.label ? props.label : 'Untitled';
const count = data.count !== null && data.count !== undefined ? data.count : 0;

// ✅
const label = props.label ?? 'Untitled';
const count = data.count ?? 0;
```

## Guard clauses

```ts
// ❌ Nested, hard to scan
function getDiscount(user: User): number {
  if (user.isActive) {
    if (user.plan === 'pro') {
      return 0.2;
    } else {
      return 0.1;
    }
  } else {
    return 0;
  }
}

// ✅ Early returns, flat and linear
function getDiscount(user: User): number {
  if (!user.isActive) return 0;
  if (user.plan === 'pro') return 0.2;
  return 0.1;
}
```

## Name a complex condition

```tsx
// ❌ Decode the condition inline
if (user.age >= 18 && user.country === 'BR' && !user.isBlocked && user.hasVerifiedEmail) {
  allowCheckout();
}

// ✅ The name states the intent
const canCheckout =
  user.age >= 18 &&
  user.country === 'BR' &&
  !user.isBlocked &&
  user.hasVerifiedEmail;

if (canCheckout) allowCheckout();
```

## Name magic values

```ts
// ❌ What is 3? What is 900000?
if (retries > 3) abort();
setTimeout(refresh, 900000);

// ✅ Named constants
const MAX_RETRIES = 3;
const REFRESH_INTERVAL_MS = 15 * 60 * 1000;

if (retries > MAX_RETRIES) abort();
setTimeout(refresh, REFRESH_INTERVAL_MS);
```

## Lookup instead of an if/else ladder

```ts
// ❌ The ladder grows with every new mode
submit(): void {
  this.showValidation.set(true);

  if (this.hasFieldError()) return;
  if (this.isRevisionMode() && (this.hasMissingFields() || this.hasConflictError())) return;

  const mode = this.editorMode();
  if (mode === 'CREATE_DRAFT') {
    this.createDraft();
  } else if (mode === 'PUBLISH_DOC') {
    this.publishDoc();
  } else if (mode === 'ARCHIVE_DOC') {
    this.archiveDoc();
  }
}

// ✅ A typed lookup maps each mode to its handler
private readonly submitHandlers: Record<EditorMode, () => void> = {
  CREATE_DRAFT: () => this.createDraft(),
  PUBLISH_DOC: () => this.publishDoc(),
  ARCHIVE_DOC: () => this.archiveDoc(),
};

submit(): void {
  this.showValidation.set(true);

  if (this.hasFieldError()) return;
  if (this.isRevisionMode() && (this.hasMissingFields() || this.hasConflictError())) return;

  this.submitHandlers[this.editorMode()]();
}
```

`Record<EditorMode, () => void>` forces a handler for every union member, so a missing case fails to
compile, and a new mode adds one entry instead of editing the `submit` flow. Use a `switch` with an
`assertNever` default when a branch needs local variables or fall-through:

```ts
function runMode(mode: EditorMode): void {
  switch (mode) {
    case 'CREATE_DRAFT':
      return createDraft();
    case 'PUBLISH_DOC':
      return publishDoc();
    case 'ARCHIVE_DOC':
      return archiveDoc();
    default:
      return assertNever(mode);
  }
}

function assertNever(value: never): never {
  throw new Error(`Unhandled mode: ${value}`);
}
```
