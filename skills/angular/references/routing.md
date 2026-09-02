# Routing and Lazy Loading — why, and an example

The rules are in the `angular` Ruleset (`routing` group). This file is the reasoning and an example.

- **`provideRouter(routes)`; lazy-load a feature** with `loadComponent` or `loadChildren` so each feature ships in its own chunk. **A route maps to a feature
  folder** (`architecture-and-design`, structure) — the route tree and the source tree stay parallel.
- **Scope a feature-only service in the route's `providers` array**, not `providedIn: 'root'` — it then loads and unloads with the lazy chunk instead of living
  for the whole session.
- **Bind route params, query params, and data to inputs** with `withComponentInputBinding()`, so the component reads an `input()` rather than injecting
  `ActivatedRoute`.
- **Guard a route with a functional `CanActivateFn`** that uses `inject()` — no guard class, no module.
- **Keep filters, the current tab, and pagination in the URL** (`architecture-and-design`, state-and-data) — shareable, and it survives a reload.

```ts
export const routes: Routes = [
  {
    path: 'checkout',
    loadComponent: () => import('./checkout/checkout-page').then((m) => m.CheckoutPage),
    canActivate: [authGuard],
  },
];
```
