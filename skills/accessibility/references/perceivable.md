# Perceivable Content — why

The rules are in the `accessibility` Ruleset (`perceivable` group).

- **Text alternatives.** Every image that carries meaning has an `alt` that conveys it; a decorative image has `alt=""`; an icon inside an already-labeled
  control has `alt=""` or `aria-hidden="true"`. A missing `alt` reads the file name; a decorative one that is not empty adds noise (WCAG 1.1.1).
- **Time-based media.** Video has captions; audio has a transcript. Audio that plays automatically for more than 3 seconds has a pause or stop control and a
  volume control independent of the system, or it collides with a screen reader (WCAG 1.2.1, 1.2.2, 1.4.2).
- **Never carry meaning by color, shape, or position alone** — pair it with text or a named icon. Color-blind and screen-reader users miss it (WCAG 1.4.1).
- **Contrast.** Body text at least 4.5:1. Large text (about 24 px, or 19 px bold), UI component boundaries, and focus indicators at least 3:1 (WCAG 1.4.3,
  1.4.11).
- **Zoom and reflow.** Usable at 200% zoom, reflows to a 320 CSS pixel width with no loss of content or function, and survives user text-spacing overrides (WCAG
  1.4.10, 1.4.12). Do not lock the UI to one orientation unless it is essential — a user with a mounted device cannot rotate it (WCAG 1.3.4).
- **Motion.** Honor `prefers-reduced-motion`: no parallax, auto-playing video, or large motion for those users. Nothing flashes more than three times per second
  — flashing triggers seizures, motion triggers vestibular disorders (WCAG 2.3.1). Content that moves, scrolls, blinks, or auto-updates for more than 5 seconds
  — a carousel, ticker, live feed — has a visible pause, stop, or hide control (WCAG 2.2.2).
- **Forced-colors mode** (Windows High Contrast) replaces your palette with the user's. Do not carry meaning in a `background-image`; draw icons with
  `currentColor` or a system color keyword; test under `@media (forced-colors: active)`.
- **Content shown on hover or focus** is dismissible, hoverable, and stays until dismissed — a tooltip that vanishes on the way to it is unusable (WCAG 1.4.13).
