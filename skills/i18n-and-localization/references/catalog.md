# The Message Catalog Lifecycle — why

The rules are in the `i18n-and-localization` Ruleset (`catalog` group).

- **A missing translation must degrade, not break.** A key rendered raw (`checkout.payButton`) or
  an empty string in the UI is worse than English text a user can still act on. Fall back down a
  defined chain (`fr-CA` → `fr` → `en`) and report the miss so it gets translated.
- **Do not ship every locale in the main bundle.** Forty locales of messages inlined into the entry
  chunk is hundreds of KB the user downloads to read one. Load the active locale's bundle on demand,
  split from the app code (`web-performance`).
- **Plural/CLDR data is per locale too.** The rules that make `plural` work for Polish are data;
  load them with that locale's messages, not as a global assumption.
- **Pseudo-localization catches bugs early.** A build-time pseudo-locale — accented (`Ácçëñtéd`),
  padded 40% longer, bracketed (`[…]`) — makes hardcoded strings show up as plain English,
  concatenation show up as `[Broken] [sentence]`, and layouts that cannot take longer text break in
  CI, not in the Finnish translation.
- **Keys are API.** A shipping locale with an untranslated key, or a catalog with a key nothing
  references, should fail or warn the build. A removed key is deprecated for a cycle, not dropped
  mid-release while translations are in flight.

```ts
// ❌ all locales bundled; missing key renders raw; no pseudo pass
import en from './locales/en.json';
import de from './locales/de.json';
import fr from './locales/fr.json'; // ...×40, all in the entry chunk
const t = (k: string) => messages[locale][k] ?? k; // shows "checkout.payButton" to the user

// ✅ lazy per-locale load, fallback chain, pseudo in CI
const messages = (await import(`./locales/${locale}.json`)).default;
const t = (k: string) => messages[k] ?? fallback['en'][k] ?? reportMissing(k, locale);
// build: `LOCALE=pseudo` run renders padded/accented text; CI fails on untranslated keys in shipping locales
```
