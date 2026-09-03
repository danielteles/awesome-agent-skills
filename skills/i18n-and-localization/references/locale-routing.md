# Locale Routing and Negotiation — why

The rules are in the `i18n-and-localization` Ruleset (`locale-routing` group).

- **The locale belongs in the URL.** A path prefix (`/de/pricing`) or a subdomain makes each
  localized page independently linkable, bookmarkable, CDN-cacheable, and crawlable. A cookie- or
  `Accept-Language`-only scheme serves different content at the same URL — search engines index one
  locale, shared links open in the wrong one, and the cache is poisoned.
- **Negotiate once, then obey the user.** On the first visit with no locale in the URL, match
  `Accept-Language` against the supported set (respecting quality values) and redirect to the best
  fit, with a defined default (`x-default`) when nothing matches. After the user picks a locale,
  persist it and let it win over the header.
- **`hreflang` and canonical.** Each page lists its localized alternates with `hreflang` (plus
  `x-default`) and a self-referential `canonical`, so search engines serve the right one and do not
  treat them as duplicates.
- **`lang` must be exact.** `<html lang>` reflects the actually-rendered locale, region included
  where formatting or spelling differ (`en-GB` vs `en-US`, `pt-BR` vs `pt-PT`), and it updates when
  the user switches locale client-side — screen readers change voice on it.
- **SSR renders the real locale.** The first server response carries the requested locale's
  messages and formats. Rendering the default and swapping after hydration is a visible flash and a
  hydration mismatch.

```tsx
// ❌ locale only in a cookie; same URL for every language; lang hardcoded
document.cookie = `locale=${locale}`;
// <html lang="en">  ... always

// ✅ locale in the path, negotiated default, correct lang, hreflang alternates
// /en/pricing  /de/pricing  /ar/pricing
// middleware: no locale in path -> pick from Accept-Language ∩ supported, else 'en', 302 to /<loc>/…
<html lang={locale} dir={rtlLocales.has(locale) ? 'rtl' : 'ltr'}>
<link rel="alternate" hrefLang="de" href="https://example.com/de/pricing" />
<link rel="alternate" hrefLang="x-default" href="https://example.com/en/pricing" />
<link rel="canonical" href={`https://example.com/${locale}/pricing`} />
```
