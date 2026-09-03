# Status Messages and Route Changes — why

The rules are in the `accessibility` Ruleset (`live-regions` group).

- **A screen-reader user does not see a toast appear.** An async result — a toast, a validation summary, a search-result count, a save state — is announced
  through a live region: `role="status"` or `aria-live="polite"`, and `role="alert"` for an error (WCAG 4.1.3).
- **`role="status"` announces politely and reads the whole region; `role="alert"` interrupts.** Reserve `alert` / `assertive` for a genuine error — an overused
  assertive region talks over everything, and live-region support is uneven across screen readers. For a critical message, move focus to it rather than trust
  the announcement.
- **The live region element is already in the DOM before the update.** Change its text; do not insert the region and its message together — a region added with
  its content is often not announced.
- **On a client-side navigation, update the page `<title>` and move focus to the new view** (see `keyboard-focus`), or the screen reader reports that nothing
  changed.
- **Announce a loading state in text**, not with a spinner alone, and announce when it finishes — "Loading" and "12 results" are the information; the spinner is
  decoration (WCAG 4.1.3).
