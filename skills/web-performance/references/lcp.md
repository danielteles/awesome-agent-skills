# Largest Contentful Paint — why

The rules are in the `web-performance` Ruleset (`lcp` group). This file is the reasoning and a
`❌ / ✅` example — it adds no rule the Ruleset does not state.

- **The LCP element must be in the HTML.** If the hero image or headline is rendered by client
  JavaScript, LCP cannot happen until the bundle downloads, parses, and executes — often seconds on
  mobile. Server-render it so the browser can paint it from the first response.
- **Do not delay the LCP resource.** `loading="lazy"` on the hero image, putting it inside a
  `content-visibility: auto` block, or discovering it late in CSS all push LCP out.
  `fetchpriority="high"` on the image tells the browser it matters; a `preload` helps only when the
  URL is not in the initial HTML (e.g. a CSS `background-image`).
- **Clear the critical path.** Render-blocking CSS and synchronous scripts in `<head>` delay first
  paint. Inline the critical CSS, `defer` scripts, and load the rest async.
- **TTFB is part of LCP.** A 1.5 s server response leaves 1 s for everything else. Stream or cache
  the HTML and keep slow work out of the render path.
- **Fonts.** A blocking web font delays the text that is often the LCP element. `font-display: swap`
  or `optional`, preload the one weight above the fold, and match fallback metrics to cut the swap
  shift.

```html
<!-- ❌ hero rendered client-side, lazy-loaded, no priority -->
<div id="app"></div>
<script src="/bundle.js" defer></script>
<!-- <img loading="lazy" src="/hero.jpg"> mounted by JS after hydration -->

<!-- ✅ LCP image in the initial HTML, high priority, eager, sized -->
<img src="/hero.avif" width="1200" height="600" fetchpriority="high"
     decoding="async" alt="…" />
```
