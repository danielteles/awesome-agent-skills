---
name: angular
description: >-
  Modern Angular conventions for writing, reviewing, refactoring, or migrating
  Angular: standalone components, `OnPush` and signals, `input()` / `output()` /
  `model()`, `@if` / `@for` / `@switch` control flow, `inject()` and functional
  providers, functional guards and interceptors, typed reactive forms, lazy
  routing, zoneless-ready change detection and SSR, testing by role. Builds on
  `core-typescript` and `architecture-and-design`. Use it when the user mentions
  Angular, signals, `computed`, `effect`, standalone, `OnPush`, control flow,
  `inject`, RxJS, reactive forms, change detection, zoneless, `NgModule`, or
  `ng generate`.
license: CC-BY-4.0
metadata:
  author: danielteles
  version: "1.0"
---

# Angular Conventions — Framework Skill

Angular-specific rules for modern Angular: standalone, signals, block control flow, functional
providers. It gives the Angular form of rules that `core-typescript` and `architecture-and-design`
set in general terms.

> **Builds on.** `core-typescript` (language rules) and `architecture-and-design` (design), plus
> `accessibility` for UI work. The Ruleset below is complete on its own; load one of these when the
> task turns on its layer, not by default. If a named skill is not loaded, apply that layer from
> general knowledge and do not block.

This SKILL.md is self-sufficient — the **Ruleset** below is the complete, enforceable list, and
nothing here depends on a `references/` file being read. Each `references/<topic>.md` holds the
*reasoning* and code for one Ruleset group (`references/signals.md`, `references/rxjs.md`, …), plus
`references/worked-example.md` for a full review pass. Open them for depth when your runtime allows.

---

## How to Use This Skill

Pick the mode that matches the task. Do the steps in order.

| Mode | Steps |
|---|---|
| **Generate** — write a new component, service, or route | 1. Standalone, `OnPush`, `inject()`, signals (`bootstrap`, `components`, `signals`, `inputs-outputs`). 2. Block control flow in the template (`templates`). 3. Give every subscription a teardown (`rxjs`). 4. Run the Ruleset as a checklist. Fix each fail before you hand off. |
| **Review** — check a pull request or a diff | 1. Run the Ruleset against the diff. 2. Write one finding per fail, in the Output Format below. 3. Order the findings: `must-fix` first, then `consider`. 4. If nothing fails, say so in one line. Do not invent findings. |
| **Migrate** — modernize legacy Angular | 1. Run the official schematics first: `ng generate @angular/core:standalone`, `control-flow`, `inject`, `signal-input-migration`, `output-migration`, `signal-queries-migration`, `route-lazy-loading`. 2. Apply the Ruleset by hand for what a schematic left behind. 3. One migration per commit. Keep the tests green. |

### Output Format

Write one finding per line:

```
<severity> · <topic> · <file>:<line> — <what is wrong>. <the fix as an action>.
```

- `<severity>` is `must-fix` (breaks a rule in this skill or a compiler check) or `consider` (safe, but a rule prefers another form).
- `<topic>` is a Ruleset topic slug (`signals`, `templates`, `rxjs`, …).

### Rules for Every Mode

- Name the Ruleset topic when you enforce a rule.
- Prefer the current Angular API over its decorator or NgModule predecessor.
- Consistency within a file wins. When a file already follows an older style throughout, match it and note the gap rather than half-converting it.

---

## Ruleset

The complete rule list. Read it top to bottom when generating; tick each box against a diff when
reviewing. Each group links to its `references/` file for rationale and examples.

### bootstrap → `references/bootstrap.md`

- [ ] No `NgModule` — every component, directive, and pipe is standalone; no redundant `standalone: true` where it is already the default. Each component lists what it uses in its own `imports` array.
- [ ] Bootstrap with `bootstrapApplication(App, appConfig)` and functional providers (`provideZonelessChangeDetection`, `provideRouter`, `provideHttpClient`, `provideClientHydration`).
- [ ] `angularCompilerOptions` has `strictTemplates`, `strictInjectionParameters`, `strictInputAccessModifiers`, `strictStandalone`, and `typeCheckHostBindings` on.
- [ ] `angular-eslint` runs (`recommended` + `template/recommended` + `template/accessibility`), with `prefer-standalone`, `prefer-on-push-component-change-detection`, `use-lifecycle-interface`, `no-input-rename`, `template/prefer-control-flow`, and `template/prefer-ngsrc` on.

### components → `references/components.md`

- [ ] `ChangeDetectionStrategy.OnPush` on every component.
- [ ] Dependencies come from `inject()`, not constructor parameters; injected members, inputs, outputs, and queries are grouped at the top; every Angular-assigned member is `readonly`; a template-only member is `protected`.
- [ ] One component / directive / service per file, named for the class (the current style guide drops the `.component` suffix — match the codebase if it still uses it).
- [ ] A single project selector prefix; an attribute selector for a directive; each lifecycle hook is kept short and implements its interface (`OnInit`, `OnDestroy`); host bindings and listeners go in the `host` object, not `@HostBinding` / `@HostListener`.
- [ ] An event handler is named for the action (`saveDraft()`), not the event (`onClick()`).
- [ ] Cross-cutting behavior is a `hostDirective`, not a base class or copy-paste.
- [ ] No `::ng-deep`; `ViewEncapsulation.None` only in a clearly-named global file; a child-piercing override is scoped with `:has()`.

### signals → `references/signals.md`

- [ ] State is in `signal()`; every dependent value is a `computed()`, kept pure.
- [ ] No signal write inside `effect()` — use `computed()` or `linkedSignal()`. An `effect()` only pushes a signal value into a non-reactive API (logging, `localStorage`, a canvas, a widget) and releases its resource in `onCleanup`.
- [ ] `untracked()` wraps a read that must not become a dependency.
- [ ] No `cdr.detectChanges()` or `markForCheck()` after a signal write — the write schedules the update itself; `cdr.detectChanges()` is left only for an imperative non-signal change Angular cannot observe (and that field should become a signal).
- [ ] Shared state is a `providedIn: 'root'` service exposing `signal` / `computed` members; a store library only once that service grows entities, effects, and derived collections (`architecture-and-design`, state-and-data).

### inputs-outputs → `references/inputs-outputs.md`

- [ ] `input()` / `input.required()` / `output()` / `model()` / `viewChild()` / `contentChild()` — no `@Input()` / `@Output()` / `@ViewChild` / `@ContentChild` decorators.
- [ ] An input is read as a call (`this.name()`); `input.required<T>()` over an optional input plus a `?` guard; a two-way value is written with `this.value.set(...)`.
- [ ] Route params are bound to inputs with `withComponentInputBinding()` (see `routing`).

### templates → `references/templates.md`

- [ ] `@if` / `@for` / `@switch`, not `*ngIf` / `*ngFor` / `*ngSwitch`; every `@for` has a `track` on a stable id, not `$index`.
- [ ] No method call in a binding — a `computed()` or a pure pipe; any expression past a property read or one pipe is moved into a `computed()`; `@let` for a value read more than once.
- [ ] `@defer` with an `on` trigger around a heavy or below-the-fold section.
- [ ] `[class.x]` / `[style.x.px]` over `NgClass` / `NgStyle`; an Observable is shown via the `async` pipe or `toSignal()`, never `.subscribe()` in the class for display data.
- [ ] A reusable component takes content via `<ng-content>` + named slots, a `TemplateRef` input + `*ngTemplateOutlet`, or `NgComponentOutlet` — not a pile of boolean config props (`architecture-and-design`, solid — OCP).
- [ ] A custom pipe is pure, standalone, typed, and does no I/O.

### dependency-injection → `references/dependency-injection.md`

- [ ] A service is `@Injectable({ providedIn: 'root' })`; a narrower scope only when the instance must be per-route or per-component.
- [ ] Route guards are functional (`CanActivateFn`); HTTP interceptors are functional (`HttpInterceptorFn` with `withInterceptors`).
- [ ] A system boundary injects an `InjectionToken<T>` for an abstraction, not a concrete class (`architecture-and-design`, solid — DIP, and patterns).
- [ ] `inject()` is called only in an injection context (constructor, field initializer, `provide*` factory); a later call is wrapped in `runInInjectionContext`.
- [ ] Manual teardown is tied to `inject(DestroyRef)`, not an `ngOnDestroy` bookkeeping field.

### rxjs → `references/rxjs.md`

- [ ] A signal for state; an Observable for a stream over time (HTTP, router events, WebSocket, DOM events), converted to a signal at the edge with `toSignal()`.
- [ ] No manual `.subscribe()` without `takeUntilDestroyed()` (in an injection context or passed a `DestroyRef`) or the `async` pipe.
- [ ] `HttpClient` is called from a repository, not a component (`architecture-and-design`, patterns); server state is cached with a cache library, not a hand-rolled `BehaviorSubject` store (`architecture-and-design`, state-and-data).
- [ ] `resource()` / `rxResource()` / `httpResource()` are avoided while experimental — `toSignal()` or a cache library.
- [ ] Transport errors are handled in one functional interceptor (status → domain error, backoff retry for an idempotent call); one top-level `ErrorHandler` reports and shows a fallback (`architecture-and-design`, frontend-practices).

### forms → `references/forms.md`

- [ ] Reactive, typed forms (`new FormControl<string>('', { nonNullable: true })`) for anything past a single field; template-driven only for a trivial single input.
- [ ] Validators are built from the same schema as the domain model (`architecture-and-design`, forms).
- [ ] `invalid` / `dirty` / error text are derived from form state, not copied into signals.
- [ ] A control a mode does not render is `disable({ emitEvent: false })`d, not `@if`-hidden.
- [ ] A blocked save shows the user why — a toast or an inline message, not only a disabled button.

### routing → `references/routing.md`

- [ ] `provideRouter(routes)`; a feature is lazy-loaded with `loadComponent` / `loadChildren` and maps to a feature folder (`architecture-and-design`, structure).
- [ ] A feature-only service is scoped in the route's `providers` array, not `providedIn: 'root'`.
- [ ] Route params, query params, and data are bound to inputs with `withComponentInputBinding()`.
- [ ] A route guard is a functional `CanActivateFn` using `inject()`.
- [ ] Filters, the current tab, and pagination are kept in the URL (`architecture-and-design`, state-and-data).

### rendering-ssr → `references/rendering-ssr.md`

- [ ] Zoneless-ready: the view is driven by signals or the `async` pipe, never a change-detection side effect.
- [ ] DOM measurement and imperative DOM work go in `afterNextRender()` / `afterRender()`, not `ngAfterViewInit`; DOM changes go through `Renderer2` or a binding, not `ElementRef.nativeElement` + `document`.
- [ ] No `window` / `document` / `localStorage` in a constructor or field initializer — guarded with `afterNextRender` or `isPlatformBrowser`.
- [ ] `provideClientHydration()` for an SSR app; `NgOptimizedImage` (`ngSrc`) with explicit `width` / `height` or `fill`.
- [ ] No `bypassSecurityTrust*` on anything a user or an API supplied (`architecture-and-design`, security).
- [ ] Focus and live-change announcement use the CDK a11y tools (`FocusTrap`, `FocusMonitor`, `LiveAnnouncer`); full lens: `accessibility`.
- [ ] Until the app is zoneless, a high-frequency listener (`scroll`, `mousemove`, `rAF`) runs inside `NgZone.runOutsideAngular`.

### testing → `references/testing.md`

- [ ] A standalone component is tested through its own imports — `TestBed.configureTestingModule({ imports: [C] })` or `@testing-library/angular`'s `render(C, …)`.
- [ ] `provideHttpClientTesting()` and assertions on `HttpTestingController`; the network is never hit.
- [ ] Navigation is driven by `RouterTestingHarness`, not a hand-built `ActivatedRoute` stub.
- [ ] The DOM is queried by role and accessible name (a CDK harness or `@testing-library/angular`'s `screen.getByRole`), never a raw CSS selector on `DebugElement` / `nativeElement`.
- [ ] A `signal` / `computed` is read after `fixture.detectChanges()`; real providers, mocks only at the network boundary and at a true external service.
- [ ] `fakeAsync` / `tick` only when `await fixture.whenStable()` cannot do it; a resolved promise chain is `await`ed before a synchronous assertion.
- [ ] Overlay content (dialog, dropdown) is asserted via its controlling signal or a `document` query, not `fixture.nativeElement`.
- [ ] Each test also passes the `test-quality` Ruleset — asserts on behavior not internals, has a meaningful assertion, is deterministic. This group is the Angular mechanics; `test-quality` judges the test itself.

---

## Limits

This skill is Angular framework rules. It does not cover:

- Language rules (see `core-typescript`) or framework-neutral architecture (see `architecture-and-design`).
- Deep RxJS operator design, and store libraries (NgRx, NGXS) — use the state tiers in `architecture-and-design`, state-and-data, and reach for a store only when they call for one.
- Nx or monorepo setup, Angular Material theming, `@angular/animations`, and i18n.
- Accessibility depth — CDK a11y usage is noted where it fits, but focus management, ARIA, and a11y testing live in `accessibility`.
- Angular versions before standalone components and block control flow. For a legacy app, migrate first (the Migrate mode above).
- Other frameworks — `react` and `vue` are the sibling skills; every rule here is Angular-specific.

Zoneless change detection is stabilizing. The rules here keep code zoneless-ready without requiring the provider.

---

## References

This skill composes with:

- **`core-typescript`** — the language base; Angular templates and DI do not exempt code from it.
- **`architecture-and-design`** — the design layer. On a conflict it decides the design, this skill decides the Angular API.
- **`accessibility`** — the review lens for UI; Angular's tools are the CDK `a11y` package and `LiveAnnouncer`.
- **`test-quality`** — judges the individual test this skill's `testing` group produces.
- **`react`** / **`vue`** — the sibling framework skills.
