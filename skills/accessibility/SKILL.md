---
name: accessibility
description: >-
  Web accessibility as a review lens, grounded in the W3C Web Accessibility
  Initiative: WCAG 2.2 level AA, WAI-ARIA, and the ARIA Authoring Practices
  Guide. Framework-neutral. Covers semantic HTML and structure, accessible names
  and ARIA, keyboard and focus, forms, perceivable content (text alternatives,
  color, contrast, motion, zoom), live regions and SPA route announcements, and
  a11y testing. Composes with `react` and `angular` for the framework mechanism.
  Use it when building or reviewing UI, or when the user says "accessibility",
  "a11y", "WCAG", "ARIA", "screen reader", "keyboard navigation", "focus",
  "contrast", "axe", "landmark", or "WAI".
---

# Accessibility — Review Skill

The accessibility review lens for web UI, grounded in the W3C Web Accessibility Initiative (WAI).
The target is **WCAG 2.2, conformance level AA** — the technical bar behind EN 301 549, the ADA,
Section 508, and the European Accessibility Act.

> **Prerequisites.** Load `architecture-and-design` alongside this skill, and `react` or `angular`
> for the framework mechanism behind each rule. `npx skills add …@accessibility` installs this file
> alone.

This SKILL.md is self-sufficient: the **Ruleset** below is the complete, enforceable list, with the
key WCAG criteria inline. Each `references/` file holds the *reasoning*, the finer criteria, and
code for one Ruleset topic (`references/keyboard-focus.md`, `references/forms.md`, …), plus
`references/worked-example.md`. Open them for depth if your runtime allows it — the Ruleset stays
authoritative, and nothing here depends on them being read.

WCAG is organized by four principles — **POUR**:

| Principle | The content must be |
|---|---|
| **Perceivable** | Available to the senses: text alternatives, captions, contrast, structure that survives restyling. |
| **Operable** | Usable by keyboard and other input, with enough time, no seizure triggers, and clear navigation. |
| **Understandable** | Readable and predictable, with labels and error help. |
| **Robust** | Parseable by browsers and assistive technology, now and as they change. |

---

## How to Use This Skill

Pick the mode that matches the task. Do the steps in order.

| Mode | Steps |
|---|---|
| **Generate** — build a component or page | 1. Reach for the native element first. 2. Give every control an accessible name. 3. Confirm the keyboard path and a visible focus indicator. 4. Run the axe checks. 5. Run the Ruleset as a checklist. Fix each fail before you hand off. |
| **Review** — check a pull request or a diff | 1. Run the Ruleset against the diff. 2. Write one finding per fail, in the Output Format below; add the WCAG success criterion where it sharpens the point. 3. Order the findings: `must-fix` first, then `consider`. 4. If nothing fails, say so in one line. |
| **Audit** — assess an existing surface | 1. Run the automated checks (axe-core). They catch about 30 to 40 percent. 2. Walk every critical path with the keyboard only. 3. Run a screen reader over the critical flows (NVDA or JAWS with Chrome, VoiceOver with Safari). 4. Map each finding to a WCAG 2.2 AA criterion. |

Triage first for the failures that dominate real sites, in this order: low-contrast text, missing
image `alt`, links and buttons with no accessible name, unlabeled form fields, and a missing
`lang`. These account for most of what breaks in the field (WebAIM Million).

### Output Format

Write one finding per line:

```
<severity> · <topic> · <file>:<line> — <what is wrong>. <the fix as an action>. [WCAG <criterion>]
```

- `<severity>` is `must-fix` (fails a WCAG 2.2 AA criterion or blocks a user) or `consider` (a real barrier below the AA line, or a robustness risk).
- `<topic>` is a Ruleset topic slug (`structure`, `keyboard-focus`, `forms`, …).
- `[WCAG <criterion>]` is optional — add it when a criterion names the requirement, e.g. `[WCAG 1.4.3]`.

### Rules for Every Mode

- The first of the five rules of ARIA (`w3.org/TR/using-aria`): if a native element already carries the role, state, keyboard behavior, and focus, use it. **No ARIA beats wrong ARIA.**
- Accessibility is a correctness requirement, not a feature and not a later pass.
- The bar is WCAG 2.2 level AA unless the product owner set a higher one.

---

## Ruleset

The complete rule list. Read it top to bottom when generating; tick each box against a diff when
reviewing. Each group links to its `references/` file for rationale, the finer WCAG criteria, and
code.

### structure → `references/structure.md`

- [ ] Interactive elements are native — `<button>` / `<a href>` / `<input>` — not a `<div>` with a handler. A link navigates; a button acts; neither fakes the other. [WCAG 4.1.2, 2.1.1]
- [ ] One `<h1>` per page; headings step down by one, never skipped for styling. [1.3.1, 2.4.6]
- [ ] Regions are wrapped in landmarks (`header` / `nav` / `main` / `aside` / `footer`), exactly one `<main>`, same-type landmarks given a distinguishing `aria-label`. [1.3.1]
- [ ] A list is marked up as a list; tabular data as `<table>` with `<th>` and `scope`.
- [ ] `lang` is set on `<html>` (and on any foreign-language element); every page has a unique, descriptive `<title>`. [3.1.1, 2.4.2]
- [ ] A link that opens a new tab or downloads a file says so, in visible or screen-reader text.
- [ ] A help mechanism (contact link, chat entry) is in the same place on every page that has one. [3.2.6]

### names-aria → `references/names-aria.md`

- [ ] Every interactive element has an accessible name (visible text, `aria-label`, or `aria-labelledby`) — icon-only buttons included. When the visible label is text, the accessible name contains that text. [4.1.2, 2.5.3]
- [ ] Link and button text makes sense read on its own — no bare "click here" / "read more". [2.4.4]
- [ ] No native role is overridden, and no role is added that the element already has; ARIA state (`aria-expanded`, `aria-selected`, `aria-checked`, `aria-pressed`) stays in sync with the UI.
- [ ] A custom widget (menu, combobox, tabs, disclosure, slider) follows its ARIA APG pattern — roles *and* keyboard interaction.
- [ ] A modal is `role="dialog"` (or `<dialog>` + `showModal()`) with `aria-modal="true"` and `aria-labelledby` its heading; Esc closes it; the background is `inert`.
- [ ] No focusable element sits inside an `aria-hidden` subtree.

### keyboard-focus → `references/keyboard-focus.md`

- [ ] Every interactive element is reachable and operable with the keyboard alone; no step traps focus. [2.1.1, 2.1.2]
- [ ] Tab order follows reading order; no positive `tabindex`; DOM order matches visual order (no CSS `order`/positioning that tab and reading order cannot follow). [2.4.3, 1.3.2]
- [ ] Every swipe / pinch / path gesture and every drag-and-drop has a single-pointer alternative. [2.5.1, 2.5.7]
- [ ] Every time limit warns before it expires and can be extended or turned off. [2.2.1]
- [ ] A visible focus indicator, styled with `:focus-visible`, at 3:1 contrast; any `outline: none` has an equal-or-better replacement; a sticky header or footer never covers the focused element. [2.4.7, 1.4.11, 2.4.11]
- [ ] A "skip to main content" link is the first focusable element, visually hidden until focused (not `display: none`). [2.4.1]
- [ ] A client-side route change moves focus to the new view (its `<h1>`, or a `tabindex="-1"` container); a dialog traps focus and restores it to the trigger on close.
- [ ] A composite widget (grid, listbox, toolbar, tab list) uses roving `tabindex` or `aria-activedescendant` — one tab stop, arrow keys within.
- [ ] An interactive target is at least 24×24 CSS px, or has 24 px of clear spacing. [2.5.8]

### forms → `references/forms.md`

- [ ] Every field has a programmatically associated `<label>` (`for`/`id`, or wrapping); a placeholder is never the label. [1.3.1, 3.3.2]
- [ ] Related fields are grouped in `<fieldset>` + `<legend>`; instructions and format hints come before the field, linked with `aria-describedby`. [1.3.1, 3.3.2]
- [ ] On error: stated in text, linked with `aria-describedby`, `aria-invalid` on the field, with a suggested fix — never color alone. [3.3.1, 3.3.3, 1.4.1]
- [ ] A failed submit renders an error summary at the top of the form (a heading, then one link per error to its field) and moves focus to the summary.
- [ ] The submit button is not disabled to signal an invalid form — the submit happens and the summary shows.
- [ ] Required fields are stated in the visible label and with `aria-required`, not an asterisk alone. [3.3.2]
- [ ] `autocomplete` tokens are set on identity and contact fields; the same information is not asked twice in one flow. [1.3.5, 3.3.7]
- [ ] Login allows paste and password managers, sets `autocomplete="current-password"` / `"one-time-code"`, and offers a passkey or email-link path; a puzzle CAPTCHA has a non-cognitive alternative. [3.3.8]
- [ ] A submission with a legal, financial, or destructive consequence is reversible, checked, or confirmed before it commits. [3.3.4]

### perceivable → `references/perceivable.md`

- [ ] Every meaningful image has an `alt` that conveys it; a decorative image has `alt=""`; an icon inside a labeled control has `alt=""` or `aria-hidden`. [1.1.1]
- [ ] Video has captions; audio has a transcript; audio that autoplays for more than 3 s has a pause/stop control and independent volume. [1.2.1, 1.2.2, 1.4.2]
- [ ] Meaning is never carried by color, shape, or position alone. [1.4.1]
- [ ] Body text contrast is at least 4.5:1; large text (~24 px, or 19 px bold), UI component boundaries, and focus indicators at least 3:1. [1.4.3, 1.4.11]
- [ ] Usable at 200% zoom, reflows to 320 CSS px with no loss of content or function, survives text-spacing overrides; not locked to one orientation. [1.4.10, 1.4.12, 1.3.4]
- [ ] `prefers-reduced-motion` is honored (no parallax, autoplay video, or large motion); nothing flashes more than three times per second. [2.3.1]
- [ ] Content that moves, scrolls, or auto-updates for more than 5 s has a visible pause / stop / hide control. [2.2.2]
- [ ] Forced-colors mode works: no meaning in a `background-image`, icons drawn with `currentColor` or a system color, tested under `@media (forced-colors: active)`.
- [ ] Content shown on hover or focus is dismissible, hoverable, and stays until dismissed. [1.4.13]

### live-regions → `references/live-regions.md`

- [ ] An async result (toast, validation summary, result count, save state) is announced through a live region — `role="status"` / `aria-live="polite"`, `role="alert"` for an error. [4.1.3]
- [ ] The live region element already exists in the DOM before the update — its text changes; the region and its message are not inserted together.
- [ ] `assertive` / `alert` is reserved for a genuine error; for a critical message, focus is moved to it rather than trusting the announcement.
- [ ] A client-side navigation updates `<title>` and moves focus to the new view (see `keyboard-focus`).
- [ ] A loading state is announced in text, not a spinner alone, and its completion is announced too. [4.1.3]

### testing → `references/testing.md`

- [ ] Automated checks run in CI: `axe-core`, plus `eslint-plugin-jsx-a11y` (React) or the `angular-eslint` template accessibility rules (Angular) — they catch roughly a third.
- [ ] Every critical path is walked with the keyboard only (Tab, Shift+Tab, Enter, Space, arrows, Esc).
- [ ] Critical flows are run through a screen reader — NVDA or JAWS with Chrome, VoiceOver with Safari — a widget tested in both browse and forms/focus mode.
- [ ] Tested at 400% browser zoom and with the OS text size increased, not only at 200%. [1.4.10]
- [ ] Unit tests query by role and accessible name (`getByRole('button', { name: 'Save' })`).
- [ ] Contrast is checked once in the design system, not per feature.
- [ ] A custom widget is built on an accessible primitive (Radix, React Aria, Angular CDK), not derived from scratch.

---

## Limits

This skill covers the accessibility of a web UI. It does not cover:

- ATAG (authoring tools) or UAAG (browsers) — the WAI standards for tool and user-agent makers, not app authors.
- Native mobile accessibility (iOS `UIAccessibility`, Android accessibility APIs) and document accessibility (PDF, Office).
- Legal advice. WCAG 2.2 AA is the technical bar behind EN 301 549, the ADA, Section 508, and the EAA; conformance strategy and legal risk are for counsel.
- WCAG level AAA criteria beyond AA, and the in-progress WCAG 3 and cognitive-accessibility (COGA) work — track them, do not build to a draft. WCAG 3 is likely to replace the 4.5:1 contrast ratio with a perceptual model (APCA); the 2.2 numbers stay the requirement until it does.

---

## References

This skill is the accessibility review lens. It composes with:

- **`architecture-and-design`** — its `frontend-practices` rules check only that a semantic element and a label are present, and defer focus management, ARIA, live regions, and a11y testing to this skill.
- **`react`** — the React mechanism: `useId` for label association, ref-based focus moves, `createPortal` for dialogs, and primitive libraries (Radix, React Aria).
- **`angular`** — the Angular mechanism: the CDK `a11y` package (`cdkTrapFocus`, `FocusMonitor`, `LiveAnnouncer`) and the `template/accessibility` lint rules.

**Normative:**

- WCAG 2.2 — `w3.org/TR/WCAG22`
- WAI-ARIA 1.2 and the ARIA Authoring Practices Guide — `w3.org/WAI/ARIA/apg`
- Using ARIA (the five rules) — `w3.org/TR/using-aria`
- ARIA in HTML (which ARIA is valid on which element) — `w3.org/TR/html-aria`

**Practitioner references:**

- MDN Accessibility — how ARIA and HTML behave in browsers
- The A11Y Project checklist — `a11yproject.com/checklist`
- WebAIM — contrast checker, the annual WebAIM Million report, the Screen Reader Survey
- GOV.UK Design System — user-tested component and pattern notes, the error-summary pattern

On a conflict, this skill decides the accessibility requirement and the framework skill decides the API that satisfies it.
