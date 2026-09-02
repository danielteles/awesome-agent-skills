# Standalone and Bootstrap — why, and the config

The rules are in the `angular` Ruleset (`bootstrap` group). This file is the reasoning and the
config blocks.

- **No `NgModule`.** Standalone is the default on current Angular; an `NgModule` adds a wiring layer with no gain. A component lists what it uses in its own `imports` array. Do not write `standalone: true` where it is already the default.
- **`bootstrapApplication(App, appConfig)` in `main.ts`** — one entry point, one provider list. Configure with functional providers: they are tree-shakable and typed, with no module graph.

```ts
// main.ts
bootstrapApplication(App, {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideClientHydration(),
    provideBrowserGlobalErrorListeners(),
  ],
});
```

## Compiler strictness

Turn on the Angular compiler's own checks, next to the TypeScript `strict` flags from
`core-typescript`, compiler-config.

```jsonc
// tsconfig.json
{
  "angularCompilerOptions": {
    "strictTemplates": true,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictStandalone": true,
    "typeCheckHostBindings": true,
    "extendedDiagnostics": { "defaultCategory": "error" }
  }
}
```

| Flag | Why |
|---|---|
| `strictTemplates` | Type-checks every binding, `@if`/`@for` variable, pipe, and event in the template. The biggest single win. |
| `strictInjectionParameters` | Fails a DI parameter that has no resolvable type. |
| `strictInputAccessModifiers` | A `protected` or `private` input is a build error, not a silent runtime miss. |
| `strictStandalone` | Rejects a non-standalone component. |

## Lint

Run `angular-eslint`: `@angular-eslint/recommended` plus `@angular-eslint/template/recommended` and
`template/accessibility` — it enforces most of this skill automatically. Turn on `prefer-standalone`,
`prefer-on-push-component-change-detection`, `use-lifecycle-interface`, `no-input-rename`,
`template/prefer-control-flow`, and `template/prefer-ngsrc`.
