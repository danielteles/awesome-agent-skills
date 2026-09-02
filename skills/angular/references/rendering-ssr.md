# Change Detection, Rendering, and SSR — why

The rules are in the `angular` Ruleset (`rendering-ssr` group). This file is the reasoning.

- **Zoneless-ready code never depends on a side effect to trigger change detection** — drive the view from signals or the `async` pipe. Signal-driven code works
  with Zone.js and without it.
- **DOM measurement and imperative DOM work in `afterNextRender()` / `afterRender()`**, not `ngAfterViewInit` — these run at the right phase and are safe under
  SSR. Change the DOM through `Renderer2` or a binding, not `ElementRef.nativeElement` + `document`, which breaks under SSR and Web Workers.
- **Never read `window` / `document` / `localStorage` in a constructor or field initializer** — it throws on the server. Guard with `afterNextRender` or
  `isPlatformBrowser`.
- **`provideClientHydration()`** for a server-rendered app reuses the server DOM instead of re-rendering. **`NgOptimizedImage` (`ngSrc`)** with explicit
  `width`/`height` or `fill` lazy-loads, sets fetch priority, and prevents layout shift.
- **Interpolation and `[innerHTML]` are sanitized** — never call `bypassSecurityTrust*` on anything a user or an API supplied; that is an XSS hole
  (`architecture-and-design`, security).
- **Focus management and live-change announcement** use the CDK a11y tools: `FocusTrap`, `FocusMonitor`, `LiveAnnouncer`. A route change or a dialog that does
  not move focus is unusable with a keyboard or a screen reader. Full lens: `accessibility`.
- **Until the app is zoneless, run a high-frequency listener** (`scroll`, `mousemove`, `requestAnimationFrame`) inside `NgZone.runOutsideAngular`, or each event
  triggers a full change-detection pass.
