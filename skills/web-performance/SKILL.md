---
name: web-performance
description: >-
  A framework-neutral review lens for the loading and runtime performance of a
  web UI: Core Web Vitals budgets, diagnosing and fixing LCP, INP, and CLS,
  JavaScript bundle analysis and a code-splitting policy, image and font
  loading, hydration cost, and field measurement (RUM) with regression gating.
  Composes with `react`, `angular`, and `vue` for the framework rendering API and
  with `architecture-and-design` for data and state strategy. Use it when the user
  mentions performance, Core Web Vitals, LCP, INP, CLS, Lighthouse, bundle size,
  code splitting, lazy loading, hydration, "slow page", "large bundle",
  web-vitals, or RUM.
license: CC-BY-4.0
metadata:
  author: danielteles
  version: "1.0"
---

# Web Performance — Review Skill

The performance review lens for web UI: what the page costs to load and to interact with, measured
against a budget. Framework-neutral — the metrics and diagnoses are the same for any stack; examples
are HTML plus a little TSX for where a framework changes the fix.

> **Builds on.** `react`, `angular`, or `vue` for the framework rendering and hydration API (their
> rendering and SSR groups), and `architecture-and-design` for data fetching, caching, and state strategy. On
> a conflict, this skill sets the budget and the diagnosis and the framework skill
> decides the API that meets it. The Ruleset below is complete on its own; load a named skill only
> when the task turns on its layer, not by default. If a named sibling skill is not loaded, apply
> that layer from general knowledge and do not block.

This SKILL.md is self-sufficient — the **Ruleset** below is the complete, enforceable list, with the
target numbers inline, and nothing here depends on a `references/` file being read. Each
`references/<topic>.md` holds the *reasoning* and `❌ / ✅` code for one Ruleset group
(`references/lcp.md`, `references/javascript.md`, …), plus `references/worked-example.md` for a full
review pass. Open them for depth when your runtime allows.

---

## How to Use This Skill

Pick the mode that matches the task. Do the steps in order.

| Mode | Steps |
|---|---|
| **Generate** — build a page or feature with a budget | 1. State the budget for this route — LCP, INP, CLS, and a JS transfer ceiling (`budgets`). 2. Server-render the LCP element; do not lazy-load it; preload the LCP image and the fonts it needs (`lcp`, `assets`). 3. Ship the least JavaScript that works; split by route; keep interactions off the main thread (`javascript`, `inp`). 4. Reserve space for every image, embed, and async region (`cls`). 5. Run the Ruleset as a checklist. Fix each fail before you hand off. |
| **Review** — check a pull request or a diff | 1. Run the Ruleset against the diff. 2. Write one finding per fail, in the Output Format below, with the metric it costs and a number where you can estimate one. 3. Order the findings: `must-fix` first, then `consider`. 4. If nothing fails, say so in one line. Do not invent findings. |
| **Diagnose** — a page is slow in the field | 1. Read field data first (CrUX / RUM), not a single lab run — know which metric fails at p75 and on which route. 2. For LCP, find the LCP element and walk its critical path (TTFB → render-blocking resources → the resource itself). 3. For INP, capture a trace of the slow interaction and find the long task. 4. For CLS, record the session and identify the shifting element. 5. Fix the top contributor, re-measure in the field, repeat. |

### Output Format

Write one finding per line:

```
<severity> · <topic> · <file>:<line> — <what is wrong>. <the fix as an action>.
```

- `<severity>` is `must-fix` (breaks a budget, or a rule in this skill or a lint rule) or `consider` (a real cost that is under the line or unmeasured).
- `<topic>` is a Ruleset topic slug (`budgets`, `lcp`, `inp`, `cls`, `javascript`, `assets`, `rum`).

### The targets

Core Web Vitals, measured at the **75th percentile** of real users, **on mobile**, from **field
data**:

| Metric | Good | Meaning |
|---|---|---|
| **LCP** — Largest Contentful Paint | ≤ 2.5 s | When the main content has rendered. |
| **INP** — Interaction to Next Paint | ≤ 200 ms | Worst-case tap/keypress-to-paint latency across the visit. |
| **CLS** — Cumulative Layout Shift | ≤ 0.1 | How much visible content jumps during load. |

Supporting: **TTFB** ≤ 800 ms, and lab **TBT** ≤ 200 ms as the pre-release proxy for INP.

### Rules for Every Mode

- Name the Ruleset topic when you enforce a rule.
- Tie every claim to a metric and, where you can, a number — "adds ~90 KB gzip to the entry bundle, pushing TBT over 200 ms", not "this is heavy".
- A fix for one metric can cost another: preloading everything delays the LCP resource, over-splitting adds request latency, `font-display: block` trades CLS
  for blank text. State the trade.
- The budget is p75, mobile, field data. A fast run on a desktop with a wired connection is not a pass.

---

## Ruleset

The complete rule list. Read it top to bottom when generating; tick each box against a diff when
reviewing. Each group links to its `references/` file for rationale and examples.

### budgets → `references/budgets.md`

- [ ] Each route has a written budget: LCP, INP, CLS targets plus a ceiling for JS transfer size and request count.
- [ ] The budget is enforced in CI — a bundle-size check and Lighthouse CI (or equivalent) on every pull request — and a regression past the ceiling fails the
      build.
- [ ] Third-party scripts have their own byte and main-thread budget; a new one is justified against it, loaded `async` / `defer`, and behind consent where
      required.
- [ ] The budget is derived from field data and the competitive set, not a round number picked once.
- [ ] A performance change is verified in the field after release, not only in the pull request.

### lcp → `references/lcp.md`

- [ ] The LCP element is server-rendered in the initial HTML — not injected by client JavaScript, not inside a client-only component.
- [ ] The LCP image or its font is not lazy-loaded, not behind `content-visibility`, and carries `fetchpriority="high"`; a `<link rel="preload">` is used only
      when the resource is discovered late.
- [ ] Render-blocking CSS is minimal and critical; non-critical CSS and all non-essential JS are deferred so they do not delay first render.
- [ ] TTFB is within budget — cached/streamed HTML, no slow synchronous work in the server render path.
- [ ] No above-the-fold web font blocks text for more than 100 ms; `font-display: swap` or `optional`, with a metric-matched fallback to limit the swap shift.

### inp → `references/inp.md`

- [ ] No task on the main thread runs longer than 50 ms during or after load; long work is chunked, yielded (`await scheduler.yield()` / `setTimeout`), or moved
      to a Web Worker.
- [ ] An event handler does the minimum synchronously (update state, show feedback) and defers the rest; a non-urgent re-render is marked as such
      (`useTransition`, `startTransition`).
- [ ] Input handlers on high-frequency events (`input`, `scroll`, `pointermove`) are debounced or throttled and do no layout-thrashing reads-then-writes.
- [ ] Hydration does not block the first interaction — it is deferred, chunked, or scoped to interactive islands (see `javascript`).
- [ ] A large list is virtualized; expensive derived data is memoized so a keystroke does not recompute it.

### cls → `references/cls.md`

- [ ] Every `<img>`, `<video>`, `<iframe>`, and embed has explicit `width` and `height` (or a reserved `aspect-ratio` box).
- [ ] Space is reserved for anything that arrives late — ads, embeds, cookie banners, async content — so it does not push content down.
- [ ] Web fonts use `size-adjust` / `ascent-override` or a metric-compatible fallback so the swap does not reflow.
- [ ] Content is never inserted above existing content in the viewport except in response to a user interaction.
- [ ] A region whose height changes (accordion, skeleton → content) animates with `transform`, or reserves its final height with `min-height`.

### javascript → `references/javascript.md`

- [ ] The bundle is inspected with an analyzer before shipping; nothing large or duplicated ships unexplained.
- [ ] Code is split at the route boundary, and non-critical below-the-fold widgets are lazy-loaded; the initial route ships only what it needs to render and
      become interactive.
- [ ] Imports are tree-shakeable — named imports from ES modules, no default-importing a whole utility or icon library for one function; a heavy dependency is
      replaced with a platform API or a smaller one where the need is small.
- [ ] Polyfills and transpilation target the supported browser baseline only (`browserslist`), with a modern build served to modern browsers.
- [ ] `modulepreload` (or the framework's equivalent) is used for the critical chunk graph so splitting does not create a request waterfall.

### assets → `references/assets.md`

- [ ] Raster images are served responsively (`srcset` + `sizes`) in a modern format (AVIF or WebP) at the displayed size, through an image CDN or the
      framework's image component.
- [ ] Below-the-fold images are `loading="lazy"`; all images set `decoding="async"` and explicit dimensions.
- [ ] Fonts are self-hosted, subset to the glyphs used, `woff2`, preloaded only for the above-the-fold weights, with `font-display` set.
- [ ] `preconnect` is set for a required cross-origin asset host; unused `preconnect` / `dns-prefetch` hints are removed.
- [ ] No layout-critical asset is served from a slow or uncached origin; static assets have a long-lived immutable cache header.

### rum → `references/rum.md`

- [ ] Field data is collected in production with the `web-vitals` library (or a RUM provider) and read at p75, segmented by route and device class.
- [ ] INP and LCP are captured with attribution (which element, which script) so a regression points at a cause.
- [ ] A dashboard tracks the three metrics over time; an alert fires when p75 crosses the target.
- [ ] Lab tools (Lighthouse, WebPageTest) are used for diagnosis and pre-release gating, never as the source of truth for how users experience the page.
- [ ] A/B tests and experiments report their performance delta, not only the conversion delta.

---

## Limits

This skill is the loading and interaction performance of a web UI. It does not cover:

- Server and infrastructure performance — CDN config, origin autoscaling, database query tuning, edge vs origin rendering trade-offs beyond their TTFB effect.
- Backend API latency and payload design, GraphQL resolver cost, and caching layers on the server.
- Animation smoothness and rendering-pipeline work (`will-change`, compositor layers, `requestAnimationFrame` budgets) beyond their INP and CLS effect.
- Build-tool configuration in depth (bundler internals, module federation) beyond the splitting and preload policy here.
- Memory leaks, and native app or React Native performance.
- Choosing metrics targets for a specific business — the CWV "good" thresholds are the floor; a product may set stricter ones.

This skill states the budget and the diagnosis. It is not a substitute for a trace of the real slow interaction and field data at p75.

---

## References

This skill composes with:

- **`react`** — the rendering and hydration API: `<Suspense>` and `lazy()`, `useTransition` / `useDeferredValue`, Server Components, streaming SSR,
  `fetchpriority` on `<img>`. On a conflict this skill sets the budget, `react` picks the API.
- **`angular`** — `@defer` blocks, `NgOptimizedImage`, route-level lazy loading, `provideClientHydration()` and incremental hydration, zoneless change
  detection.
- **`vue`** — `defineAsyncComponent` and the router's lazy import, `<Suspense>`, Nuxt `<NuxtImg>` / `useAsyncData`, and the lazy hydration strategies
  (`hydrateOnVisible`, `hydrateOnIdle`).
- **`architecture-and-design`** — data fetching, caching, and the state tiers that decide what renders when and how much ships to the client.
- **`accessibility`** — `prefers-reduced-motion` and the reflow/zoom requirements that a CLS or font fix must also satisfy.
