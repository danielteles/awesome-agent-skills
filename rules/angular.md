---
name: angular
description: >-
  Angular conventions for modern Angular: standalone components, signals, the
  block control flow, `inject()`, functional providers, typed reactive forms,
  and zoneless-ready change detection. Extends core-typescript (language rules)
  and architecture-and-design (layering, boundaries, state tiers, forms
  validation, security). Use it when writing, reviewing, refactoring, or
  migrating Angular code. Also use when the user says "Angular", "signal",
  "computed", "effect", "standalone", "OnPush", "@if", "@for", "control flow",
  "inject", "RxJS", "reactive forms", "change detection", "zoneless", "NgModule",
  or "ng generate".
---

# Angular Conventions — Framework Skill

This skill holds Angular-specific rules for modern Angular (standalone, signals, block control flow). It extends **core-typescript** for language rules and **architecture-and-design** for layering, feature boundaries, state tiers, forms validation, and security.

Where those skills and this one cover the same ground, this skill gives the Angular form of the rule.

---

## How to Use This Skill

Pick the mode that matches the task. Do the steps in order.

| Mode | Steps |
|---|---|
| **Generate** — write a new component, service, or route | 1. Standalone, `OnPush`, `inject()`, signals (Sections 1 to 4). 2. Block control flow in the template (Section 5). 3. Give every subscription a teardown (Section 7). 4. Run the Section 12 checklist. Fix each fail before you hand off. |
| **Review** — check a pull request or a diff | 1. Run the Section 12 checklist against the diff. 2. Write one finding per fail, in the Output Format below. 3. Order the findings: `must-fix` first, then `consider`. 4. If nothing fails, say so in one line. Do not invent findings. |
| **Migrate** — modernize legacy Angular | 1. Run the official schematics first: `ng generate @angular/core:standalone`, `control-flow`, `inject`, `signal-input-migration`, `output-migration`, `signal-queries-migration`, `route-lazy-loading`. 2. Apply Sections 1 to 10 by hand for what a schematic left behind. 3. One migration per commit. Keep the tests green. |

### Output Format

Write one finding per line:

```
<severity> · Section <n> · <file>:<line> — <what is wrong>. <the fix as an action>.
```

- `<severity>` is `must-fix` (breaks a rule in this skill or a compiler check) or `consider` (safe, but a rule prefers another form).
- `<n>` is a section number from this skill. Cite only numbers that exist here.

### Rules for Every Mode

- Cite a section number when you enforce a rule.
- Prefer the current Angular API over its decorator or NgModule predecessor.
- Consistency within a file wins. When a file already follows an older style throughout, match it and note the gap rather than half-converting it.

---

## Rules at a Glance

| Section | Rule |
|---|---|
| 1 | No `NgModule`. Standalone everything. Bootstrap and configure with functional providers. |
| 2 | Every component is `OnPush`. Dependencies come from `inject()`. Angular-owned members are `readonly`. |
| 3 | State in `signal`, derived in `computed`. Never write a signal inside `effect()`. |
| 4 | Inputs, outputs, and queries use `input()`, `output()`, `model()`, `viewChild()` — not decorators. |
| 5 | `@if` / `@for` / `@switch`. Every `@for` has `track`. No method calls in bindings. |
| 6 | Services are `providedIn: 'root'`. Guards and interceptors are functional. |
| 7 | Signals for state, Observables for streams. Every subscription has a teardown. |
| 8 | Reactive, typed forms. Validity is derived, not stored. |
| 9 | Routes lazy-load with `loadComponent`. A route maps to a feature folder. |
| 10 | Zoneless-ready: updates come from signals or `async`, never a change-detection side effect. |
| 11 | Test a standalone component through `TestBed` imports, real providers, and role-based queries. |

---

## 1. Standalone and Bootstrap

| Rule | Why |
|---|---|
| No `NgModule`. Every component, directive, and pipe is standalone. | Standalone is the default on current Angular. NgModules add wiring with no gain. |
| Bootstrap with `bootstrapApplication(App, appConfig)` in `main.ts`. | One entry point, one provider list. |
| Configure with functional providers: `provideRouter`, `provideHttpClient`, `provideClientHydration`, `provideZonelessChangeDetection`. | Tree-shakable and typed. No module graph. |
| Do not write `standalone: true` on a version where it is the default. Write it only on a version that still needs it. | Redundant text on current Angular. |
| A component lists what it uses in its own `imports` array. | The component declares its own dependencies. |

```ts
// main.ts
bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideClientHydration(),
    provideBrowserGlobalErrorListeners(),
  ],
});
```

### Compiler strictness

Turn on the Angular compiler's own checks, next to the TypeScript `strict` flags from core-typescript Section 1.

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

### Lint

| Rule | Why |
|---|---|
| Run `angular-eslint`: `@angular-eslint/recommended` plus `@angular-eslint/template/recommended` and `template/accessibility`. | It enforces most rules in this skill automatically. |
| Turn on `prefer-standalone`, `prefer-on-push-component-change-detection`, `use-lifecycle-interface`, `no-input-rename`, `template/prefer-control-flow`, `template/prefer-ngsrc`. | These map to Sections 1, 2, 5, and 10. |

---

## 2. Component Authoring

| Rule | Why |
|---|---|
| Set `changeDetection: ChangeDetectionStrategy.OnPush` on every component. | `OnPush` plus signals is the fast, zoneless-ready default. Default change detection re-checks the whole tree. |
| Get dependencies with `inject()`, not constructor parameters. | Better type inference, works outside a constructor, easier to annotate. |
| Group injected dependencies, inputs, outputs, and queries at the top of the class. | One place to see the component's surface. |
| Mark every `input()`, `model()`, `output()`, and query result `readonly`. | Angular assigns them. Reassigning is a bug. |
| Use `protected` for a member that only the template reads. | Keeps the class's real public API honest. |
| One component, directive, or service per file. Name the file for the class: `user-profile.ts`, `user-profile.html`, `user-profile.spec.ts`. | The current style guide drops the `.component` suffix. Match the codebase when it still uses the older name. |
| Give component selectors one project prefix. Use an attribute selector for a directive. | Avoids collisions and states intent. |
| Keep a lifecycle hook short. Implement its interface (`OnInit`, `OnDestroy`). | A misspelled `ngOnInit` runs never and warns nothing without the interface. |
| Put host bindings and listeners in the `host` object, not `@HostBinding` or `@HostListener`. | One place, fewer decorators. |
| Name an event handler for the action, not the event: `saveDraft()`, not `onClick()`. | The name says what happens. |
| Reuse cross-cutting behavior with `hostDirectives`, not a base class or copy-paste. | It composes: a component can apply several, each with its own inputs and outputs. |

```ts
@Component({
  selector: 'app-user-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-card.html',
  host: { '[class.is-active]': 'active()' },
})
export class UserCard {
  private readonly users = inject(UserService);

  readonly userId = input.required<UserId>();
  readonly removed = output<UserId>();

  protected readonly user = computed(() => this.users.byId(this.userId()));
  protected readonly active = signal(false);
}
```

---

## 3. Signals for State

| Rule | Why |
|---|---|
| Hold component state in `signal()`. Derive every dependent value with `computed()`. | Signals update only what changed and make the component zoneless-ready. |
| Never write a signal inside `effect()`. Use `computed()` or `linkedSignal()`. | An effect that sets state is a hidden update cycle that is hard to trace. |
| Use `effect()` only to push a signal value into a non-reactive API: logging, `localStorage`, a canvas, a third-party widget. | That is its one job. |
| Release an effect's resource in its `onCleanup` callback. | A leaked timer or listener outlives the component. |
| Wrap a read you do not want to depend on in `untracked()`. | Otherwise the read becomes a dependency and re-runs the effect. |
| Keep `computed()` pure. It is lazy and memoized and may not run when you expect. | A side effect inside it fires unpredictably. |
| Share state across components with a `providedIn: 'root'` service that exposes `signal` and `computed` members. Reach for a store library (`@ngrx/signals` SignalStore) only when that service grows entities, effects, and derived collections. | A signal service covers most apps. Classic NgRx boilerplate rarely pays off on the frontend (architecture-and-design Section 8). |

```ts
readonly query = signal('');
readonly page = signal(1);

// ✅ Derived state, not an effect
readonly params = computed(() => ({ q: this.query(), page: this.page() }));

// ✅ Effect syncs to a non-reactive API, with cleanup
constructor() {
  effect((onCleanup) => {
    const id = setInterval(() => this.poll(), 30_000);
    onCleanup(() => clearInterval(id));
  });
}
```

---

## 4. Signal Inputs, Outputs, and Queries

Replace the decorator with its function form.

| Decorator form | Function form |
|---|---|
| `@Input() name: string` | `name = input.required<string>()` or `input('')` |
| `@Input()` with a setter transform | `input(0, { transform: numberAttribute })` |
| `@Input()` + `@Output()` pair for two-way binding | `value = model<T>()` |
| `@Output() saved = new EventEmitter<T>()` | `saved = output<T>()` |
| `@ViewChild` / `@ContentChild` | `viewChild()` / `contentChild()` |

| Rule | Why |
|---|---|
| Read an input as a call: `this.name()`. | An input is a signal now. |
| Prefer `input.required<T>()` over an optional input plus a `?` guard. | It fails at build time when a parent forgets to pass it. |
| Write a two-way value with `this.value.set(...)`. | `model()` is a writable signal wired to the parent binding. |
| Bind route params to inputs with `withComponentInputBinding()` (Section 9). | The component reads an `input()`, not the `ActivatedRoute`. |

---

## 5. Templates and Control Flow

| Rule | Why |
|---|---|
| Use `@if`, `@for`, `@switch`. Do not use `*ngIf`, `*ngFor`, `*ngSwitch`. | The block syntax is the default, faster, and needs no import. |
| Every `@for` has a `track`. Track a stable id, not `$index`, for a list that can reorder. | `track` is required. A wrong key rebuilds the wrong DOM and loses state. |
| Do not call a method inside a binding. Move the value to a `computed()` or a pure pipe. | A method in a binding runs on every change-detection pass. |
| Move any expression past a property read or one pipe into a `computed()`. | Template logic is hard to test and reruns often. |
| Use `@let` for a value the template reads more than once. | Avoids repeating the expression. |
| Wrap a heavy or below-the-fold section in `@defer` with a trigger (`on viewport`, `on idle`, `on interaction`). | It stays out of the initial bundle. |
| Bind with `[class.active]` and `[style.width.px]`, not `NgClass` or `NgStyle`. | Clearer syntax, better performance. |
| Show an Observable with the `async` pipe or `toSignal()`. Never `.subscribe()` in the class for display data. | The pipe unsubscribes for you. |
| Take content with `<ng-content>` and named slots (`select=`). Take a caller-supplied template with an `input<TemplateRef>()` rendered by `*ngTemplateOutlet`. Render a caller-supplied component with `NgComponentOutlet`. | This is how a reusable component stays open for extension (architecture-and-design Section 1, OCP). |
| Keep a custom pipe pure and standalone. Type its `transform`. Do no I/O or heavy work in it. | An impure pipe runs on every change-detection pass. |

```html
@if (user(); as u) {
  <span>{{ fullName() }}</span>       <!-- computed, not a method -->
  @for (role of u.roles; track role.id) {
    <app-role-chip [role]="role" />
  } @empty {
    <p>No roles</p>
  }
}

@defer (on viewport) {
  <app-activity-feed [userId]="user()!.id" />
} @placeholder {
  <app-skeleton />
}
```

---

## 6. Dependency Injection

| Rule | Why |
|---|---|
| Register a service with `@Injectable({ providedIn: 'root' })`. | Tree-shakable singleton, no provider array. |
| Provide a narrower scope only when the instance must be per-route or per-component. | Root is the default; a scoped instance is the exception. |
| Use a functional route guard (`CanActivateFn`) and a functional HTTP interceptor (`HttpInterceptorFn` with `withInterceptors`). | The class-based guard interfaces are deprecated; functional interceptors are the current default. |
| At a system boundary, inject an `InjectionToken<T>` for an abstraction, not a concrete class. | Matches architecture-and-design Section 1 (DIP) and Section 7. |
| Get `DestroyRef` with `inject(DestroyRef)` for manual teardown. | It ties cleanup to the component lifetime. |
| Call `inject()` only in an injection context: a constructor, a field initializer, or a `provide*` factory. Wrap a later call in `runInInjectionContext`. | Outside that context `inject()` throws. This is the one constraint the pattern carries. |

```ts
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isSignedIn() || router.createUrlTree(['/login']);
};
```

---

## 7. RxJS and Async

| Rule | Why |
|---|---|
| Use a signal for state. Use an Observable for a stream over time: HTTP, router events, WebSocket, DOM events. | Each tool for its job. |
| Convert a stream to a signal at the edge with `toSignal()`. Render the signal. | The component holds a value, not a subscription. |
| Never leave a manual `.subscribe()` without teardown. Add `takeUntilDestroyed()` or use the `async` pipe. | A live subscription after destroy is a leak. |
| Call `takeUntilDestroyed()` in an injection context, or pass it a `DestroyRef`. | It reads the current lifetime from the context. |
| Call `HttpClient` from a repository, not from a component (architecture-and-design Section 7). | The component depends on a domain interface, not the transport. |
| Cache server state with a cache library, not a hand-rolled `BehaviorSubject` store (architecture-and-design Section 8). | Caching, refetch, and staleness are solved elsewhere. |
| `resource()`, `rxResource()`, and `httpResource()` are experimental. Prefer `toSignal()` or a cache library until they stabilize. | Building on an experimental API costs a rewrite later. |
| Handle transport errors in a functional HTTP interceptor: map status codes to domain errors, retry an idempotent call with backoff. | One place for the policy, not a `catchError` in every call. |
| Register one `ErrorHandler` for anything that reaches the top. Report it, then show a fallback (architecture-and-design Section 9). | An unhandled error otherwise dies in the console. |

```ts
private readonly route = inject(ActivatedRoute);

// ✅ Stream to signal at the edge
readonly id = toSignal(this.route.paramMap.pipe(map((p) => p.get('id'))));
```

---

## 8. Reactive Forms

| Rule | Why |
|---|---|
| Use reactive forms (`FormGroup`, `FormControl`) for anything past a single field. | A template-driven form hides its model and is hard to test. |
| Type every control: `new FormControl<string>('', { nonNullable: true })`. | An untyped form loses every guarantee. |
| Build the validators from the same schema as the domain model (architecture-and-design Section 14). | One source of truth for the rules, client and server. |
| Derive `invalid`, `dirty`, and error text from the form state. Do not copy them into signals. | A copy goes stale against the control. |
| Keep a template-driven form only for a trivial single input. | Below that line the reactive setup is not worth it. |

---

## 9. Routing and Lazy Loading

| Rule | Why |
|---|---|
| Define routes with `provideRouter(routes)`. Lazy-load a feature with `loadComponent` or `loadChildren`. | Each feature ships in its own chunk. |
| A route maps to a feature folder (architecture-and-design Section 6). | The route tree and the source tree stay parallel. |
| Scope a feature-only service with the route's `providers` array, not `providedIn: 'root'`. | It loads and unloads with the lazy chunk instead of living for the whole session. |
| Bind route params, query params, and data to inputs with `withComponentInputBinding()`. | The component reads an `input()`, not `ActivatedRoute`. |
| Guard a route with a functional `CanActivateFn` that uses `inject()`. | No guard class, no module. |
| Keep filters, the current tab, and pagination in the URL (architecture-and-design Section 8). | Shareable, and it survives a reload. |

```ts
export const routes: Routes = [
  {
    path: 'checkout',
    loadComponent: () => import('./checkout/checkout-page').then((m) => m.CheckoutPage),
    canActivate: [authGuard],
  },
];
```

---

## 10. Change Detection, Rendering, and SSR

| Rule | Why |
|---|---|
| Write zoneless-ready code: never depend on a side effect to trigger change detection. Drive the view from signals or the `async` pipe. | Signal-driven code works with Zone.js and without it. |
| Do DOM measurement or imperative DOM work in `afterNextRender()` or `afterRender()`, not `ngAfterViewInit`. | These run at the right phase and are safe under SSR. |
| Never read `window`, `document`, or `localStorage` in a constructor or a field initializer. Guard with `afterNextRender` or `isPlatformBrowser`. | It throws on the server. |
| Add `provideClientHydration()` for a server-rendered app. | It reuses the server DOM instead of re-rendering. |
| Use `NgOptimizedImage` (`ngSrc`) with explicit `width` and `height`, or `fill`. | It lazy-loads, sets fetch priority, and prevents layout shift. |
| Change the DOM through `Renderer2` or a binding, not `ElementRef.nativeElement` and `document`. | Direct DOM access breaks under SSR and Web Workers. |
| Interpolation and `[innerHTML]` are sanitized. Do not call `bypassSecurityTrust*` on anything a user or an API supplied. | A bypass on untrusted input is an XSS hole (architecture-and-design Section 12). |
| Manage focus and announce a live change with the CDK a11y tools: `FocusTrap`, `FocusMonitor`, `LiveAnnouncer`. | A route change or a dialog that does not move focus is unusable with a keyboard or a screen reader. |
| Until the app is zoneless, run a high-frequency listener (`scroll`, `mousemove`, `requestAnimationFrame`) inside `NgZone.runOutsideAngular`. | Each event otherwise triggers a full change-detection pass. |

---

## 11. Testing

Test each layer the way architecture-and-design Section 11 describes. The Angular specifics:

| Rule | Why |
|---|---|
| Test a standalone component with `TestBed.configureTestingModule({ imports: [TheComponent] })`. | A standalone component needs no host module. |
| Provide `provideHttpClientTesting()` and assert on `HttpTestingController`. Never let a test hit the network. | The test controls every response and verifies the request. |
| Drive navigation with `RouterTestingHarness`, not a hand-built `ActivatedRoute` stub. | The stub drifts from the real router contract. |
| Query the DOM through a CDK component harness or by role, not a raw CSS selector on `DebugElement`. | A harness survives a template refactor; a selector does not. |
| Read a `signal` or `computed` after `fixture.detectChanges()`. Assert on its value. | The value is the observable behavior. |
| Use real providers. Mock only at the network boundary and at a true external service. | A test built on deep mocks passes while the app breaks. |
| Reach for `fakeAsync` and `tick` only when a test cannot use `await fixture.whenStable()`. | `fakeAsync` hides timing bugs as often as it exposes them. |

```ts
TestBed.configureTestingModule({
  imports: [UserCard],
  providers: [provideHttpClientTesting(), { provide: UserService, useClass: FakeUserService }],
});
const fixture = TestBed.createComponent(UserCard);
fixture.componentRef.setInput('userId', 'u_1');
fixture.detectChanges();

expect(fixture.nativeElement.querySelector('[role="heading"]').textContent).toContain('Ada');
```

---

## 12. Code Review Checklist

Run this checklist before you approve a change or finish generated code. This step is not optional. Name the section number for each item that fails.

Make sure that:

- [ ] **Standalone:** no `NgModule`; the component or service is standalone; configuration uses functional providers.
- [ ] **OnPush:** every component sets `ChangeDetectionStrategy.OnPush`.
- [ ] **inject():** dependencies come from `inject()`, not constructor parameters.
- [ ] **Signals:** state is in `signal` / `computed`; no signal write inside `effect()`; an effect only syncs to a non-reactive API and cleans up.
- [ ] **Inputs and outputs:** `input()`, `output()`, `model()`, and signal queries; all marked `readonly`; no `@Input()` / `@Output()` decorators.
- [ ] **Control flow:** `@if` / `@for` / `@switch`; every `@for` has a `track` on a stable id.
- [ ] **Template:** no method call in a binding; a complex expression is a `computed()`; `[class.x]` over `NgClass`; a custom pipe is pure.
- [ ] **Reuse:** cross-cutting behavior is a `hostDirective`; a reusable component takes content through `<ng-content>` or a `TemplateRef` input.
- [ ] **Accessibility:** an interactive component moves focus and announces a live change (CDK a11y); the template passes `template/accessibility` lint.
- [ ] **Subscriptions:** no manual `.subscribe()` without `takeUntilDestroyed()` or the `async` pipe.
- [ ] **HTTP:** calls sit behind a repository; `provideHttpClient`; responses are typed.
- [ ] **Forms:** reactive and typed; validity and errors derived, not stored.
- [ ] **Routing:** a feature is lazy-loaded with `loadComponent`; guards are functional.
- [ ] **SSR:** no `window` or `document` at construction; DOM work is in `afterNextRender`.
- [ ] **Strict templates:** `angularCompilerOptions.strictTemplates` is on; no `bypassSecurityTrust*` on untrusted input.
- [ ] **Tests:** a standalone component is tested through `TestBed` imports and real providers; the network is mocked at `HttpTestingController`; assertions read signals and query by role.

---

## 13. Worked Example: A Review Pass

Input diff:

```ts
// user-menu.component.ts — proposed in a pull request
1  @Component({
2    selector: 'user-menu',
3    template: `
4      <div *ngIf="user">
5        <span>{{ fullName() }}</span>
6        <button (click)="onClick()">Sign out</button>
7      </div>`,
8  })
9  export class UserMenuComponent implements OnInit {
10   @Input() user!: User;
11   @Output() signOut = new EventEmitter<void>();
12   items = [];
13
14   constructor(private auth: AuthService) {}
15
16   ngOnInit() {
17     this.auth.getSession().subscribe((s) => (this.items = s.menu));
18   }
19
20   fullName() {
21     return `${this.user.firstName} ${this.user.lastName}`;
22   }
23
24   onClick() {
25     this.signOut.emit();
26   }
27 }
```

Output, in the format from How to Use This Skill:

```
must-fix · Section 2 · user-menu.component.ts:1 — no `changeDetection`. Add `ChangeDetectionStrategy.OnPush`.
must-fix · Section 4 · user-menu.component.ts:10 — `@Input()` decorator. Use `user = input.required<User>()` and read it as `user()`.
must-fix · Section 4 · user-menu.component.ts:11 — `@Output() EventEmitter`. Use `signOut = output<void>()`.
must-fix · Section 6 · user-menu.component.ts:14 — constructor injection. Use `private readonly auth = inject(AuthService)`.
must-fix · Section 7 · user-menu.component.ts:17 — `.subscribe()` with no teardown. Convert with `toSignal()`, or add `takeUntilDestroyed()`.
must-fix · Section 5 · user-menu.component.ts:4 — `*ngIf`. Use `@if (user(); as u)`.
must-fix · Section 5 · user-menu.component.ts:5 — `fullName()` is a method call in a binding. Make it a `computed()`.
consider · Section 3 · user-menu.component.ts:12 — `items` is state set from a stream. Hold it as `toSignal(this.auth.getSession()...)`.
consider · Section 2 · user-menu.component.ts:24 — `onClick` is named for the event. Name it for the action, or emit inline in the template.
consider · Section 2 · user-menu.component.ts — the file is `user-menu.component.ts`; the current style guide uses `user-menu.ts`. Match the codebase.
```

---

## Limits

This skill is Angular framework rules. It does not cover:

- Language rules (see core-typescript) or framework-neutral architecture (see architecture-and-design).
- Deep RxJS operator design, and store libraries (NgRx, NGXS) — use the state tiers in architecture-and-design Section 8 and reach for a store only when they call for one.
- Nx or monorepo setup, Angular Material theming, `@angular/animations`, and i18n.
- Angular versions before standalone components and block control flow. For a legacy app, migrate first (the Migrate mode above).

Zoneless change detection is stabilizing. The rules here keep code zoneless-ready without requiring the provider.

---

## References

This skill extends the base skills. It composes with:

- **`core-typescript.md`** — the language base: `strict`, safe typing, narrowing, `unknown`, utility types. Angular templates and DI do not exempt code from these.
- **`architecture-and-design.md`** — layering, feature boundaries, the adapter / repository pattern, state tiers, forms validation, security. This skill gives the Angular form of those rules; architecture-and-design decides the design.
- **`react.md`** — the sibling framework skill.

On a conflict between this skill and architecture-and-design, architecture-and-design decides the design and this skill decides the Angular API.
