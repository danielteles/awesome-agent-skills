# Field Measurement (RUM) — why

The rules are in the `web-performance` Ruleset (`rum` group). This file is the reasoning and a
`❌ / ✅` example — it adds no rule the Ruleset does not state.

- **Lab data is a prediction; field data is the result.** Lighthouse runs one profile on one
  machine on one network. Real users are on old phones, flaky connections, and cold caches. INP in
  particular barely shows up in a lab run because it needs real interactions. Ship the `web-vitals`
  library (or a RUM provider) and read production.
- **Read p75, segmented.** The average hides the slow tail; p75 is the CWV assessment point. Break
  it down by route and device class — a global number can pass while the checkout route on mobile
  fails.
- **Capture attribution.** `web-vitals` attribution tells you *which* element was the LCP and
  *which* script blocked the interaction, so a regression alert points at a cause instead of a
  metric.
- **Alert on the trend.** A dashboard of the three metrics over time, with an alert when p75
  crosses the target, catches a slow regression that no single deploy would fail.
- **Lab tools stay for diagnosis.** Use Lighthouse and WebPageTest to reproduce and fix a specific
  problem and to gate a release, not as the number you report to the business.

```ts
// ❌ a one-off Lighthouse score in a slide, treated as "we are fast"

// ✅ real-user metrics sent to analytics, with attribution, read at p75 by route
import { onLCP, onINP, onCLS } from 'web-vitals/attribution';

function report({ name, value, rating, attribution }: import('web-vitals').Metric) {
  navigator.sendBeacon('/rum', JSON.stringify({ name, value, rating, attribution, path: location.pathname }));
}
onLCP(report);
onINP(report);
onCLS(report);
```
