# Right-to-Left and Bidirectional Text — why

The rules are in the `i18n-and-localization` Ruleset (`rtl-bidi` group).

- **RTL is a layout flip, not a text tweak.** Arabic, Hebrew, Persian, and Urdu read right-to-left:
  the whole UI mirrors — navigation, icons, progress, the side a drawer slides from. Setting `dir`
  on `<html>` from the locale drives it; then the CSS has to be direction-agnostic
  (`styling-and-design-tokens`).
- **Logical properties do the mirroring for free.** `margin-inline-start`, `inset-inline-end`,
  `text-align: start`, `padding-block` — they resolve to the correct physical side per `dir`.
  `left: 0` / `text-align: left` are stuck LTR and need a mirrored override for every rule.
- **Interpolated values need bidi isolation.** Dropping a Hebrew name or an LTR file path into a
  sentence of the other direction makes the browser's bidi algorithm reorder nearby punctuation and
  numbers — "file (מסמך).pdf" renders with the parenthesis on the wrong side. Wrap the value in
  `<bdi>` or the library's isolate.
- **`dir="auto"` for unknown content.** A comment, a display name, a search query — you do not know
  its direction at build time. `dir="auto"` lets the browser detect it per value.
- **Mirror the directional icons only.** Back/forward arrows, "send", undo/redo, list bullets, and
  breadcrumb chevrons flip. A logo, a checkmark, a play button, and a clock do not.

```html
<!-- ❌ physical properties, raw interpolation, arrow never mirrors -->
<div style="margin-left: 12px; text-align: left;">
  Renamed to {{ userTitle }} — undo
  <svg class="arrow-back"><!-- always points left --></svg>
</div>

<!-- ✅ logical properties, isolated value, mirroring icon -->
<div class="row"> <!-- .row { margin-inline-start: 12px; text-align: start; } -->
  Renamed to <bdi>{{ userTitle }}</bdi> — undo
  <svg class="icon-back" aria-hidden="true"><!-- CSS: [dir="rtl"] .icon-back { transform: scaleX(-1) } --></svg>
</div>
```
