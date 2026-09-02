# Dependency Injection — why, and an example

The rules are in the `angular` Ruleset (`dependency-injection` group). This file is the reasoning
and an example.

- **`@Injectable({ providedIn: 'root' })`** — a tree-shakable singleton with no provider array. Provide a narrower scope only when the instance must be
  per-route or per-component.
- **Functional guards and interceptors.** `CanActivateFn` and `HttpInterceptorFn` (with `withInterceptors`) are the current default; the class-based guard
  interfaces are deprecated.
- **At a system boundary, inject an `InjectionToken<T>` for an abstraction**, not a concrete class — this is `architecture-and-design`, solid (DIP) and
  patterns, in Angular form.
- **`inject()` runs only in an injection context**: a constructor, a field initializer, or a `provide*` factory. Outside that context it throws — wrap a later
  call in `runInInjectionContext`. Get `DestroyRef` with `inject(DestroyRef)` for manual teardown tied to the component lifetime.

```ts
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isSignedIn() || router.createUrlTree(['/login']);
};
```
