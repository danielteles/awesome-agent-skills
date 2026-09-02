# Functions and Signatures — why, and examples

The rules are in the `core-typescript` Ruleset (`functions` group). This file is the reasoning and
examples.

- **Annotate the return type of every exported function.** It fixes the contract and stops an accidental widening when the body changes. A local, non-exported function can infer it — the annotation adds nothing inside one file.
- **One options object past a few parameters.** A long positional list, especially with booleans, is unreadable at the call site (`createUser('Ada', true, false)` — which flag is which?).
- **A union parameter over an overload set** when the bodies are the same — fewer signatures to keep in sync.

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
