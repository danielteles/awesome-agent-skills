# Compiler Configuration — why, and the block

The rules are in the `core-typescript` Ruleset (`compiler-config` group). This file is the reasoning
and the config. Type safety starts in `tsconfig.json` — a loose configuration makes every later rule
optional.

```jsonc
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
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
| `noUnusedLocals`, `noUnusedParameters` | Fail the build on dead bindings. Prefix a deliberately unused parameter with `_`. |
| `verbatimModuleSyntax` | Emits imports and exports as written. An unmarked type import stays in the output (see `modules`). |
| `skipLibCheck` | Skips the type check of every `.d.ts`, including your own, not only `node_modules`. Faster build. A fault in a hand-written `.d.ts` can pass unseen. |

Never relax a flag to clear an error. Fix the code; if a flag genuinely cannot go on yet, leave a
`// TODO` with the reason.
