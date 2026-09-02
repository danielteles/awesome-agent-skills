# Image and Font Loading — why

The rules are in the `web-performance` Ruleset (`assets` group). This file is the reasoning and a
`❌ / ✅` example — it adds no rule the Ruleset does not state.

- **Serve the image the device needs.** A 2000px JPEG scaled to a 375px column wastes most of its
  bytes and delays LCP. `srcset` + `sizes` lets the browser pick; AVIF or WebP cuts 30–50% over
  JPEG; an image CDN or the framework's image component automates both.
- **Lazy below the fold, eager above.** `loading="lazy"` on offscreen images frees bandwidth for
  the LCP resource. `decoding="async"` keeps decode off the main thread. Always set dimensions
  (see `cls`).
- **Fonts: self-host, subset, preload one weight.** A `@import` from a font host adds a connection
  and a redirect on the critical path. Self-hosted `woff2`, subset to the glyphs used, with a
  `preload` for the single above-the-fold weight and `font-display` set, is the fast path.
- **Connect early, but only where needed.** `preconnect` to a required asset origin saves the
  DNS+TLS round trip; a `preconnect` to an origin you end up not using wastes a connection. Remove
  stale hints.
- **Cache aggressively.** Fingerprinted static assets get `Cache-Control: public, max-age=31536000,
  immutable`. A layout-critical asset on a slow, uncached origin is an LCP risk.

```html
<!-- ❌ one huge JPEG for all screens, font imported from a third party on the critical path -->
<img src="/hero-2000.jpg" alt="…" />
<style>@import url("https://fonts.example.com/inter.css");</style>

<!-- ✅ responsive modern formats + self-hosted, preloaded, subset font -->
<link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossorigin />
<img
  src="/hero-800.avif"
  srcset="/hero-400.avif 400w, /hero-800.avif 800w, /hero-1600.avif 1600w"
  sizes="(min-width: 60rem) 40rem, 100vw"
  width="1600" height="900" fetchpriority="high" decoding="async" alt="…" />
```
