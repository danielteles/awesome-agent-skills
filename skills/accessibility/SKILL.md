---
name: accessibility
description: >-
  Web accessibility as a review lens, grounded in the W3C Web Accessibility
  Initiative: WCAG 2.2 at conformance level AA, WAI-ARIA, and the ARIA Authoring
  Practices Guide. Framework-neutral. Covers semantic HTML and structure,
  accessible names and ARIA, keyboard and focus, forms, perceivable content
  (text alternatives, color, contrast, motion, zoom), status messages and SPA
  route changes, and accessibility testing. Extends architecture-and-design;
  composes with react and angular for the framework mechanism. Use it when
  building or reviewing UI, or when the user says "accessibility", "a11y",
  "WCAG", "ARIA", "screen reader", "keyboard navigation", "focus", "contrast",
  "axe", "landmark", or "WAI".
---

# Accessibility — Review Skill

This skill is the accessibility review lens for web UI, grounded in the W3C Web Accessibility Initiative (WAI). The target is **WCAG 2.2, conformance level AA** — the technical bar behind EN 301 549, the ADA, Section 508, and the European Accessibility Act.

It is framework-neutral. It extends **architecture-and-design** (Section 9 defers to this skill) and composes with **react** and **angular** for the framework mechanism behind each rule.

> **Prerequisites.** Load `architecture-and-design` alongside this skill, and `react` or `angular` for the framework mechanism. `npx skills add …@accessibility` installs this file alone and does not pull them in.

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
| **Generate** — build a component or page | 1. Reach for the native element first. 2. Give every control an accessible name. 3. Confirm the keyboard path and a visible focus indicator. 4. Run the axe checks. 5. Run the Section 8 checklist. Fix each fail before you hand off. |
| **Review** — check a pull request or a diff | 1. Run the Section 8 checklist against the diff. 2. Write one finding per fail, in the Output Format below; add the WCAG success criterion where it sharpens the point. 3. Order the findings: `must-fix` first, then `consider`. 4. If nothing fails, say so in one line. |
| **Audit** — assess an existing surface | 1. Run the automated checks (axe-core). They catch about 30 to 40 percent. 2. Walk every critical path with the keyboard only. 3. Run a screen reader over the critical flows (NVDA or JAWS with Chrome, VoiceOver with Safari). 4. Map each finding to a WCAG 2.2 AA criterion. |

Triage first for the failures that dominate real sites, in this order: low-contrast text, missing image `alt`, links and buttons with no accessible name, unlabeled form fields, and a missing `lang`. These account for most of what breaks in the field (WebAIM Million).

### Output Format

Write one finding per line:

```
<severity> · Section <n> · <file>:<line> — <what is wrong>. <the fix as an action>. [WCAG <criterion>]
```

- `<severity>` is `must-fix` (fails a WCAG 2.2 AA criterion or blocks a user) or `consider` (a real barrier below the AA line, or a robustness risk).
- `[WCAG <criterion>]` is optional — add it when a criterion names the requirement, for example `[WCAG 1.4.3]`.

### Rules for Every Mode

- The first of the five rules of ARIA (`w3.org/TR/using-aria`): if a native element already carries the role, state, keyboard behavior, and focus, use it. **No ARIA beats wrong ARIA.**
- Accessibility is a correctness requirement, not a feature and not a later pass.
- The bar is WCAG 2.2 level AA unless the product owner set a higher one.

---

## Rules at a Glance

| Section | Rule |
|---|---|
| 1 | Native semantic element first. One `<h1>`, ordered headings, landmark regions, `lang` on `<html>`, a unique `<title>`. |
| 2 | Every control has an accessible name that makes sense alone. A custom widget follows its ARIA APG pattern, keyboard included. A modal is `role="dialog"` + `aria-modal` with the background `inert`. |
| 3 | Everything works by keyboard, in DOM order, with a visible focus ring. Every gesture has a pointer alternative; every time limit is adjustable. Manage focus on route and dialog changes. |
| 4 | Every field has an associated label. Errors are in text and linked; a failed submit shows an error summary that takes focus. Do not disable the submit button to signal invalidity. Login works with password managers; a consequential submission is reversible or confirmed. |
| 5 | Text alternative for every meaningful image. Never meaning by color alone. Body text contrast 4.5:1. Honor reduced motion and forced-colors mode. |
| 6 | Announce async results and route changes through a live region and a focus move. |
| 7 | Automated checks in CI, then a keyboard pass, then a screen-reader pass. Build on accessible primitives. |

---

## 1. Semantic HTML and Structure

| Rule | Why |
|---|---|
| Use the native element for the job: `<button>`, `<a href>`, `<input>`, `<nav>`, `<table>`. | It brings the role, the keyboard behavior, and focus with it. A `<div>` with a handler brings none (WCAG 4.1.2, 2.1.1). |
| A link navigates to a URL; a button performs an action. Do not fake either — no `<a href="#">` as a button, no `<button>` that navigates. | A user expects "open in new tab" to work on a link and Space to activate a button. Empty and mislabeled links are a top real-world failure. |
| One `<h1>` per page. Headings step down by one. Never skip a level for styling. | A screen-reader user navigates the page by its heading outline (WCAG 1.3.1, 2.4.6). |
| Wrap regions in landmarks: `<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`. Exactly one `<main>`. Give two landmarks of the same type a distinguishing `aria-label` ("Primary", "Breadcrumb"). | Landmarks are the "jump to section" map for assistive technology (WCAG 1.3.1). |
| Mark up a list as a list, and tabular data as a `<table>` with `<th>` and `scope`. | The structure is announced; a styled `<div>` grid is silent (WCAG 1.3.1). |
| Set `lang` on `<html>` and on any element in another language. Give every page a unique, descriptive `<title>`. | The screen reader picks the right voice, and the browser tab is identifiable (WCAG 3.1.1, 2.4.2). |
| A link that opens a new tab or downloads a file says so, in visible or screen-reader text. | The user did not ask for a context switch and needs to expect it. |
| Keep a help mechanism — a contact link, a chat entry point — in the same place on every page that has one. | A user in trouble should not hunt for it (WCAG 3.2.6). |

---

## 2. Accessible Names, Roles, and ARIA

| Rule | Why |
|---|---|
| Every interactive element has an accessible name: visible text, `aria-label`, or `aria-labelledby`. An icon-only button needs one. | Without a name the control is announced as just "button" (WCAG 4.1.2). |
| When the visible label is text, the accessible name must contain that text. | Voice-control users speak the visible word (WCAG 2.5.3). |
| A link or button label makes sense read on its own. No bare "click here", "read more", "learn more". | A screen-reader user pulls up a list of links out of context (WCAG 2.4.4). |
| Do not override a native role, and do not add a role an element already has. | `<button role="button">` is noise. `<div role="button">` still owes you every keyboard handler `<button>` gives for free. |
| Keep ARIA state in sync with the UI: `aria-expanded`, `aria-selected`, `aria-checked`, `aria-pressed`, `aria-disabled`. | A stale state attribute lies to the screen reader. |
| For a custom widget — menu, combobox, tabs, disclosure, slider — follow the ARIA Authoring Practices Guide pattern: its roles and its keyboard interaction. | The APG is the contract screen-reader users expect. Half a pattern is worse than none. |
| A modal dialog has `role="dialog"` (or the native `<dialog>` with `showModal()`), `aria-modal="true"`, and `aria-labelledby` its heading. Esc closes it. Everything behind it is `inert`. | Without `aria-modal` or `inert`, a screen reader still reads the page behind the dialog. |
| `hidden` and `display: none` remove an element from everyone. `aria-hidden="true"` hides it from assistive technology only. `inert` removes focus, interaction, and AT for a whole subtree. Never put a focusable element inside an `aria-hidden` subtree. | Use `inert` for the background behind a modal or an off-screen drawer; a focusable node inside `aria-hidden` is reachable by keyboard but invisible to the screen reader. |

---

## 3. Keyboard and Focus

| Rule | Why |
|---|---|
| Every interactive element is reachable and operable with the keyboard alone. No step traps focus. | Many users never use a pointer (WCAG 2.1.1, 2.1.2). |
| Tab order follows reading order. Do not use a positive `tabindex`. `tabindex="0"` adds an element to the order; `tabindex="-1"` marks a programmatic focus target only. | A positive value fights the DOM and drifts out of sync (WCAG 2.4.3). |
| Keep DOM order equal to visual order. Do not reorder with CSS `order`, grid placement, or absolute positioning in a way tab and reading order cannot follow. | Screen-reader and keyboard order come from the DOM, not the pixels (WCAG 1.3.2, 2.4.3). |
| Every swipe, pinch, or path-based gesture, and every drag-and-drop, has a single-pointer alternative: a tap, a button, or a menu. | A path gesture is impossible for many motor-impaired and switch users (WCAG 2.5.1, 2.5.7). |
| A time limit — a session timeout, an auto-advancing step — warns before it expires and lets the user extend or turn it off. | A user who reads slowly or steps away loses their work otherwise (WCAG 2.2.1). |
| Show a visible focus indicator. Never `outline: none` without an equal-or-better replacement. The indicator itself needs 3:1 contrast. | The keyboard user has to see where they are (WCAG 2.4.7, 1.4.11). |
| Style the indicator with `:focus-visible`, not `:focus`, so a mouse click does not paint a ring but a keyboard focus does. | It removes the usual reason a developer reaches for `outline: none`. |
| A sticky header or footer must not cover the focused element. | The user cannot see what they are about to activate (WCAG 2.4.11). |
| Put a "skip to main content" link as the first focusable element on the page. Hide it visually until it is focused — not with `display: none`, which drops it from the tab order. | It bypasses the navigation on every page (WCAG 2.4.1). |
| On a client-side route change, move focus to the new view — its `<h1>`, or a container with `tabindex="-1"`. On opening a dialog, move focus in and trap it; on closing, return focus to the trigger. | The router does none of this. Without it the user is stranded at the old location. |
| For a composite widget — grid, listbox, toolbar, tab list — use roving `tabindex` or `aria-activedescendant`: one tab stop, arrow keys within. | Tabbing through fifty cells is unusable. |

---

## 4. Forms

| Rule | Why |
|---|---|
| Every field has a programmatically associated `<label>` — `for` and `id`, or the input wrapped in the label. | A placeholder is not a label: it disappears on input and usually fails contrast (WCAG 1.3.1, 3.3.2). |
| Group related fields in a `<fieldset>` with a `<legend>` — a radio group, an address block. | The group's purpose is announced with each field (WCAG 1.3.1). |
| Put instructions and format hints before the field, linked with `aria-describedby`. | The user hears the hint before typing, not after the error (WCAG 3.3.2). |
| On error: state it in text, link it with `aria-describedby`, set `aria-invalid` on the field, and suggest the fix. | A red border alone and color alone are invisible to many users (WCAG 3.3.1, 3.3.3, 1.4.1). |
| On a failed submit, render an error summary at the top of the form: a heading, then one link per error that moves focus to its field. Move focus to the summary. | It is the tested pattern for finding and fixing errors with a screen reader or keyboard (GOV.UK Design System). |
| Do not disable the submit button to signal an invalid form. Let the submit happen and show the error summary. | A disabled button is not focusable, gives no feedback, and hides why it is blocked. |
| Mark a required field in the visible label and with `aria-required`, not with an asterisk alone. | "Asterisk means required" is a convention, not a guarantee (WCAG 3.3.2). |
| Set `autocomplete` tokens on identity and contact fields. Do not ask for the same information twice in one flow. | It cuts typing and cognitive load (WCAG 1.3.5, 3.3.7). |
| Do not require a cognitive test to log in. Allow paste and password managers, set `autocomplete="current-password"` and `autocomplete="one-time-code"`, and offer a passkey or email-link path. A puzzle CAPTCHA needs a non-cognitive alternative. | Recalling a password or transcribing a code is a barrier for many cognitive and memory disabilities (WCAG 3.3.8). |
| A submission with a legal or financial consequence, or one that deletes data, is reversible, checked for errors, or confirmed before it commits. | A slip should not cost the user money or data (WCAG 3.3.4). |
| An interactive target is at least 24 by 24 CSS pixels, or has 24 pixels of clear spacing. | A small target fails users with a motor impairment and touch users (WCAG 2.5.8). |

---

## 5. Perceivable Content

| Rule | Why |
|---|---|
| Every image that carries meaning has an `alt` that conveys it. A decorative image has `alt=""`. An icon inside a labeled control has `alt=""` or `aria-hidden="true"`. | A missing `alt` reads the file name; a decorative one adds noise (WCAG 1.1.1). |
| Video has captions. Audio has a transcript. | Not everyone can hear (WCAG 1.2.1, 1.2.2). |
| Audio that plays automatically for more than 3 seconds has a pause or stop control, and a volume control independent of the system. | It collides with a screen reader and cannot be escaped otherwise (WCAG 1.4.2). |
| Never carry meaning by color, shape, or position alone. Pair it with text, or an icon that has a name. | Color-blind and screen-reader users miss it (WCAG 1.4.1). |
| Body text contrast is at least 4.5:1. Large text (about 24px, or 19px bold), UI component boundaries, and focus indicators are at least 3:1. | Low contrast fails low-vision users and bright-light use (WCAG 1.4.3, 1.4.11). |
| The page is usable at 200% zoom, reflows to a 320 CSS pixel width with no loss of content or function, and survives user text-spacing overrides. | Low-vision users zoom and restyle (WCAG 1.4.10, 1.4.12). |
| Do not lock the UI to portrait or landscape unless that orientation is essential. | A user with a mounted device cannot rotate it (WCAG 1.3.4). |
| Honor `prefers-reduced-motion`: no parallax, auto-playing video, or large motion for those users. Nothing flashes more than three times per second. | Motion triggers vestibular disorders; flashing triggers seizures (WCAG 2.3.1). |
| Content that moves, scrolls, blinks, or auto-updates for more than 5 seconds — a carousel, a ticker, a live feed — has a visible pause, stop, or hide control. | The motion competes for attention and can make text unreadable (WCAG 2.2.2). |
| Support forced-colors mode (Windows High Contrast). Do not carry meaning in a `background-image`; draw icons with `currentColor` or a system color keyword; test under `@media (forced-colors: active)`. | Forced-colors replaces your palette with the user's; an image-only icon or a color-only cue disappears. |
| Content shown on hover or focus is dismissible, hoverable, and stays until dismissed. | A tooltip that vanishes on the way to it is unusable (WCAG 1.4.13). |

---

## 6. Status Messages and Route Changes

| Rule | Why |
|---|---|
| Announce an async result — a toast, a validation summary, a search-result count, a save state — through a live region: `role="status"` or `aria-live="polite"`, and `role="alert"` for an error. | A screen-reader user does not see a toast appear (WCAG 4.1.3). |
| `role="status"` announces politely and reads the whole region; `role="alert"` interrupts and moves nothing. Reserve `alert` and `assertive` for a genuine error. For a critical message, move focus to it rather than trust the announcement. | An overused `assertive` region talks over everything; live-region support is uneven across screen readers. |
| The live region element is already in the DOM before the update. Change its text; do not insert the region and its message together. | A region added together with its content is often not announced. |
| On a client-side navigation, update the page `<title>` and move focus to the new view (Section 3). | Otherwise the screen reader reports that nothing changed. |
| Announce a loading state in text, not with a spinner alone, and announce when it finishes. | "Loading" and "12 results" are the information; the spinner is decoration (WCAG 4.1.3). |

---

## 7. Testing

| Rule | Why |
|---|---|
| Run automated checks in CI: `axe-core` (Playwright or Jest integration), `eslint-plugin-jsx-a11y` for React, the `angular-eslint` template accessibility rules for Angular. | They are cheap and catch roughly a third of issues before review. |
| Automated checks catch a third. Walk every critical path with the keyboard only — Tab, Shift+Tab, Enter, Space, arrows, Esc. | A linter cannot fully verify keyboard operability or focus order. |
| Run a screen reader over the critical flows: NVDA or JAWS with Chrome, and VoiceOver with Safari. Test a widget in both browse mode and forms/focus mode. | These are the pairings real users run; a widget can work in one screen-reader mode and fail in the other (WebAIM Screen Reader Survey). |
| Test at 400% browser zoom, and with the OS text size increased, not only at 200%. | 400% at a 1280px viewport is the reflow target; OS scaling exposes different breakage (WCAG 1.4.10). |
| In unit tests, query by role and accessible name — `getByRole('button', { name: 'Save' })`. A test that cannot is often flagging the bug. | The test then depends on the same tree the screen reader uses. |
| Check color contrast once in the design system, not per feature. | Fixing the tokens fixes every screen at once. |
| Build a custom widget on an accessible primitive — Radix, React Aria, or the Angular CDK — rather than deriving combobox or dialog semantics from scratch. | Those libraries implement the APG patterns and their edge cases. |

---

## 8. Accessibility Review Checklist

Run this checklist before you approve UI or finish a generated component. This step is not optional. Name the section, and where it helps the WCAG criterion, for each fail.

Make sure that:

- [ ] **Native first:** interactive elements are `<button>` / `<a href>` / `<input>`, not a `<div>` with a handler; links navigate and buttons act, not the reverse.
- [ ] **Structure:** one `<h1>`, headings step down, landmarks present (same-type landmarks labelled), `lang` set, a unique `<title>`.
- [ ] **Names:** every control — icon buttons included — has an accessible name, the name contains the visible label, and it makes sense out of context (no bare "click here").
- [ ] **ARIA:** no overridden native roles; state attributes stay in sync; a custom widget follows its APG pattern; no focusable element inside `aria-hidden`.
- [ ] **Dialog:** `role="dialog"` + `aria-modal` + `aria-labelledby`; Esc closes; the background is `inert`.
- [ ] **Keyboard:** full operation by keyboard, logical order, no trap, no positive `tabindex`; DOM order matches visual order.
- [ ] **Pointer and time:** every gesture and drag has a single-pointer alternative; every time limit warns and can be extended; moving content over 5s has a pause control.
- [ ] **Focus visible:** a `:focus-visible` indicator at 3:1 contrast; any `outline: none` has a replacement; the focused element is never covered.
- [ ] **Focus management:** a route change moves focus and updates `<title>`; a dialog traps focus and restores it on close; a skip link is first and visible on focus.
- [ ] **Forms:** every field labelled; errors in text, linked, `aria-invalid`; a failed submit renders an error summary that takes focus; the submit button is not disabled to signal invalidity; required stated in text; no placeholder as label.
- [ ] **Auth and consequential actions:** login allows paste and password managers, no forced cognitive test; a legal, financial, or destructive submission is reversible, checked, or confirmed.
- [ ] **Color and contrast:** no meaning by color alone; body text 4.5:1; large text and UI components 3:1.
- [ ] **Media and motion:** meaningful images have `alt`, decorative have `alt=""`; captions and transcripts present; autoplaying audio over 3s has a control; `prefers-reduced-motion` honored; forced-colors mode works; nothing flashes more than three times per second.
- [ ] **Zoom and reflow:** usable at 200% and 400% zoom and at 320 CSS pixels; survives text-spacing overrides; not locked to one orientation.
- [ ] **Live updates:** async results and loading states are announced through a live region that already exists in the DOM; `assertive` reserved for genuine errors.
- [ ] **Tested:** axe passes; a keyboard walkthrough of the changed path passes; unit tests query by role and name.

---

## 9. Worked Example: A Review Pass

Input diff:

```tsx
// filter-bar.tsx — proposed in a pull request
1  export function FilterBar({ onApply }: { onApply: () => void }) {
2    const [open, setOpen] = useState(false);
3    return (
4      <div className="filter-bar">
5        <div className="icon-btn" onClick={() => setOpen(!open)}>⚙</div>
6        {open && (
7          <div className="panel">
8            <input type="text" placeholder="Search" />
9            <span style={{ color: 'red' }}>{errorText}</span>
10           <div className="apply" style={{ outline: 'none' }} onClick={onApply}>Apply</div>
11         </div>
12       )}
13     </div>
14   );
15 }
```

Output, in the format from How to Use This Skill:

```
must-fix · Section 1 · filter-bar.tsx:5 — a `<div onClick>` toggles the panel. Use `<button type="button" aria-expanded={open} aria-label="Filters">`. [WCAG 4.1.2, 2.1.1]
must-fix · Section 1 · filter-bar.tsx:10 — the Apply control is a `<div>`. Use `<button type="button">`. [WCAG 2.1.1]
must-fix · Section 4 · filter-bar.tsx:8 — the input has only a placeholder. Add an associated `<label>`. [WCAG 3.3.2]
must-fix · Section 4 · filter-bar.tsx:9 — the error is carried by red color alone and is not linked to the input. Keep the text, link it with `aria-describedby`, set `aria-invalid`. [WCAG 1.4.1, 3.3.1]
must-fix · Section 3 · filter-bar.tsx:10 — `outline: none` removes the focus indicator with no replacement. [WCAG 2.4.7]
must-fix · Section 3 · filter-bar.tsx:6 — opening the panel does not move focus into it; closing does not restore focus to the toggle.
consider · Section 5 · filter-bar.tsx:5 — `⚙` is a decorative glyph a screen reader may read as "gear". Wrap it `aria-hidden="true"` and rely on the button's `aria-label`. [WCAG 1.1.1]
```

---

## Limits

This skill covers the accessibility of a web UI. It does not cover:

- ATAG (accessibility of authoring tools) or UAAG (accessibility of browsers) — the WAI standards for tool and user-agent makers, not app authors.
- Native mobile accessibility (iOS `UIAccessibility`, Android accessibility APIs) and document accessibility (PDF, Office).
- Legal advice. WCAG 2.2 AA is the technical bar behind EN 301 549, the ADA, Section 508, and the EAA; conformance strategy and legal risk are for counsel.
- WCAG level AAA criteria beyond AA, and the in-progress WCAG 3 and cognitive-accessibility (COGA) work — track them, do not build to a draft. WCAG 3 is likely to replace the 4.5:1 contrast ratio with a perceptual model (APCA); the 2.2 numbers stay the requirement until it does.

---

## References

This skill is the accessibility review lens. It composes with:

- **`architecture-and-design`** — Section 9 checks only that a semantic element and a label are present, and defers focus management, ARIA, live regions, and a11y testing to this skill.
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
