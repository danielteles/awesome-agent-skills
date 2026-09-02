# Web Performance — Worked Example: A Review Pass

A full pass in the skill's Output Format. Findings cite the Ruleset topic they fail and name the
metric and, where possible, a number.

Input diff:

```tsx
// product-hero.tsx — proposed in a pull request
1   'use client';
2   import moment from 'moment';
3   import { HeroCarousel } from './hero-carousel';
4
5   export function ProductHero({ product }: { product: Product }) {
6     const [idx, setIdx] = useState(0);
7     return (
8       <section>
9         <img src={product.images[0]} alt={product.name} loading="lazy" />
10        <h1>{product.name}</h1>
11        <p>In stock since {moment(product.since).fromNow()}</p>
12        <HeroCarousel images={product.images} onSelect={setIdx} />
13      </section>
14    );
15  }
```

Output:

```
must-fix · lcp · product-hero.tsx:1 — the hero is inside a 'use client' component, so the LCP element cannot paint until the bundle downloads and hydrates. Render ProductHero as a Server Component and keep only HeroCarousel interactive.
must-fix · lcp · product-hero.tsx:9 — the LCP image is loading="lazy" with no priority, delaying LCP by the lazy-load threshold. Drop lazy, add fetchpriority="high", render it through the framework image component.
must-fix · cls · product-hero.tsx:9 — the <img> has no width/height, so it shifts layout when it loads. Set explicit width and height (or an aspect-ratio box).
must-fix · assets · product-hero.tsx:9 — a raw full-size image URL: no srcset/sizes, not AVIF/WebP. Serve responsive modern formats at the displayed size via an image CDN or the image component.
must-fix · javascript · product-hero.tsx:2 — moment adds ~70 KB gzip to the client bundle for one relative-time string. Use Intl.RelativeTimeFormat, or dayjs/date-fns if more formatting is needed.
consider · javascript · product-hero.tsx:3 — HeroCarousel is eager and below the fold on mobile. Load it with lazy() + <Suspense>.
consider · budgets · product-hero.tsx:1 — this route has no size assertion, so the new client component and moment grow the entry bundle unchecked. Add a size-limit entry and a Lighthouse CI check for the route.
```
