# Locale-Aware Formatting — why

The rules are in the `i18n-and-localization` Ruleset (`formatting` group). This file is the
reasoning and a `❌ / ✅` example — it adds no rule the Ruleset does not state.

- **`Intl` already knows.** Date order (`MM/DD` vs `DD.MM` vs `YYYY年MM月`), decimal and grouping
  separators (`1,234.56` vs `1.234,56` vs `1 234,56`), currency symbol placement, and the
  and-conjunction in a list all vary by locale and are all in `Intl`. Hand-building any of them is a
  bug per locale.
- **`toLocaleString()` with no argument is non-deterministic.** It uses the runtime's default
  locale — the user's browser on the client, but *the server's OS setting* during SSR, so the same
  value renders differently and hydration mismatches. Always pass an explicit locale (and time
  zone for dates).
- **Currency needs three things.** The locale, the ISO `currency` code, and an integer minor-unit
  amount. A float loses cents; a missing currency code makes `1000` ambiguous.
- **Relative time and lists have APIs.** `Intl.RelativeTimeFormat` for "in 3 days" / "2 hours ago";
  `Intl.ListFormat` for "A, B, and C". Joining with `', '` and a hardcoded `' and '` is wrong
  everywhere but English.
- **Sort with `Intl.Collator`.** The default sort compares UTF-16 code units, so `ä` sorts after
  `z` and `Z` before `a`. `Intl.Collator(locale)` sorts the way that locale expects.

```ts
// ❌ manual date, separator-naive number, locale-less toLocaleString, hand-joined list
const d = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
const price = '$' + (cents / 100).toFixed(2);
const total = amount.toLocaleString();
const names = users.map((u) => u.name).join(', ') + ' and ' + last;

// ✅ Intl with the active locale
new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: tz }).format(date);
new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' }).format(cents / 100);
new Intl.NumberFormat(locale).format(amount);
new Intl.ListFormat(locale, { type: 'conjunction' }).format(users.map((u) => u.name));
```
