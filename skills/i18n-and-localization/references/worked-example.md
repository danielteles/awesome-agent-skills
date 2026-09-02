# Internationalization and Localization — Worked Example: A Review Pass

A full pass in the skill's Output Format. Findings cite the Ruleset topic they fail.

Input diff:

```tsx
// order-summary.tsx — proposed in a pull request
1   export function OrderSummary({ order, user }: Props) {
2     const when = `${order.date.getMonth() + 1}/${order.date.getDate()}/${order.date.getFullYear()}`;
3     const total = '$' + (order.totalCents / 100).toFixed(2);
4     const itemText = order.items.length === 1 ? '1 item' : order.items.length + ' items';
5     const names = order.sharedWith.map((u) => u.name).join(', ') + ' and ' + user.name;
6     return (
7       <section style={{ textAlign: 'left', marginLeft: 16 }}>
8         <h2>Order for {user.name}</h2>
9         <p>Placed on {when} · {itemText} · {total}</p>
10        <p>Shared with {names}</p>
11      </section>
12    );
13  }
```

Output:

```
must-fix · messages · order-summary.tsx:9 — "Placed on … · … · …" is an assembled sentence with hardcoded English text. Make it one ICU message with {date}, {count}, {total} placeholders.
must-fix · messages · order-summary.tsx:8 — "Order for {name}" is a hardcoded literal. Externalize it with a meaning-based key and a translator description.
must-fix · plurals-gender · order-summary.tsx:4 — `length === 1 ? '1 item' : … + ' items'` hand-rolls pluralization. Use `{count, plural, one {# item} other {# items}}`.
must-fix · formatting · order-summary.tsx:2 — manual date string in MM/DD/YYYY order. Use `Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone })`.
must-fix · formatting · order-summary.tsx:3 — `'$' + toFixed(2)` hardcodes the symbol, placement, and separators. Use `Intl.NumberFormat(locale, { style: 'currency', currency: order.currency })`.
must-fix · formatting · order-summary.tsx:5 — list joined with ', ' and ' and '. Use `Intl.ListFormat(locale, { type: 'conjunction' })`.
must-fix · rtl-bidi · order-summary.tsx:7 — `textAlign: 'left'` and `marginLeft` are physical. Use `text-align: start` and `margin-inline-start` so RTL locales mirror.
consider · rtl-bidi · order-summary.tsx:10 — interpolated names of unknown direction. Wrap each in `<bdi>` to keep punctuation correct in mixed-direction text.
```
