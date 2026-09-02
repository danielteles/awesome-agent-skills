# Testing — why, and an example

The rules are in the `angular` Ruleset (`testing` group). Test each layer the way
`architecture-and-design`, testing, describes; these are the Angular specifics.

- **A standalone component needs no host module** — test it through its own imports: `TestBed.configureTestingModule({ imports: [TheComponent] })`, or `@testing-library/angular`'s `render(TheComponent, …)`, which does the same.
- **`provideHttpClientTesting()` and assert on `HttpTestingController`** — the test controls every response and verifies the request; the network is never hit.
- **Drive navigation with `RouterTestingHarness`**, not a hand-built `ActivatedRoute` stub that drifts from the real router contract.
- **Query the DOM by role and accessible name** — a CDK component harness or `@testing-library/angular`'s `screen.getByRole` — never a raw CSS selector on `DebugElement` / `nativeElement`. A harness and a role query survive a template refactor and test the tree the screen reader uses.
- **Read a `signal` / `computed` after `fixture.detectChanges()`** and assert on its value. Use real providers; mock only at the network boundary and at a true external service — a test built on deep mocks passes while the app breaks.
- **`fakeAsync` / `tick` only when `await fixture.whenStable()` cannot do it** — `fakeAsync` hides timing bugs as often as it exposes them. For an assertion that depends on a resolved promise chain, `await` the chain (or an `expectAsync`) first; `fixture.whenStable()` alone may not have flushed a chained `.then()`.
- **Overlay content** (dialog, dropdown) renders through a CDK overlay on `document.body`, not the host element — assert on its controlling signal (`component.dialogOpen()`) or query `document`, not `fixture.nativeElement`.

```ts
await render(UserCard, {
  inputs: { userId: 'u_1' },
  providers: [provideHttpClientTesting(), { provide: UserService, useClass: FakeUserService }],
});

expect(screen.getByRole('heading', { name: /Ada/ })).toBeInTheDocument();
```

With a plain `TestBed`, load a CDK harness instead — never assert on `nativeElement.querySelector`.
