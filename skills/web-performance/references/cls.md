# Cumulative Layout Shift — why

The rules are in the `web-performance` Ruleset (`cls` group).

- **Every shift comes from unreserved space.** A media element with no dimensions, a late-arriving
  ad or banner, or a font swap that changes line height all move content that was already painted.
  The fix is always: reserve the final space before the content arrives.
- **Images and embeds need dimensions.** `width` and `height` attributes (or an `aspect-ratio` box)
  let the browser lay out the box before the bytes load. Framework image components do this for you.
- **Reserve space for the dynamic stuff.** Ads, cookie banners, "you may also like" strips —
  give the slot a `min-height` so filling it does not push the article down.
- **Fonts.** The fallback and the web font must occupy the same space. `size-adjust`,
  `ascent-override`, and `descent-override` on the `@font-face`, or a metric-matched fallback, keep
  the swap invisible.
- **Never inject above the viewport.** Prepending content, expanding a banner above the fold, or
  inserting a notification at the top shifts everything down — only ever do this in direct response
  to a user action.

```html
<!-- ❌ no dimensions; the image loads and shoves the text down -->
<img src="/chart.png" alt="Revenue by quarter" />
<p>As the chart shows…</p>

<!-- ✅ box reserved from first layout via width/height (→ aspect-ratio) -->
<img src="/chart.png" width="800" height="450" alt="Revenue by quarter" />
<p>As the chart shows…</p>
```
