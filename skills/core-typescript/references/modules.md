# Modules and Imports — why, and an example

The rules are in the `core-typescript` Ruleset (`modules` group). This file is the reasoning and
an example.

- **`import type` / `export type`** (or an inline `type` on the name) keeps types out of the emitted build. Under `verbatimModuleSyntax`, an unmarked type import is emitted as a real runtime import and can pull a whole module graph — or crash — at load.
- **Named exports over a default.** A default export has no fixed name, so every importer can call it something different and a rename tool cannot follow it.
- **No circular import between two modules** — one side resolves to `undefined` at module-load time, an error that appears far from its cause.
- **No project-wide barrel.** A wide `index.ts` re-exporting everything breaks tree-shaking and invites import cycles (`architecture-and-design`, structure). A single feature's `index.ts` as its public boundary is fine.

```ts
// ❌ Pulls a type through the value graph
import { User, getUser } from './user';

// ✅ Types marked as types
import type { User } from './user';
import { getUser } from './user';
```
