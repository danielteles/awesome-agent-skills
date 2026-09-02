# Accessibility — Worked Example: A Review Pass

A full pass in the skill's Output Format. Findings cite the Ruleset topic they fail, plus the WCAG
criterion where it sharpens the point.

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

Output:

```
must-fix · structure · filter-bar.tsx:5 — a `<div onClick>` toggles the panel. Use `<button type="button" aria-expanded={open} aria-label="Filters">`. [WCAG 4.1.2, 2.1.1]
must-fix · structure · filter-bar.tsx:10 — the Apply control is a `<div>`. Use `<button type="button">`. [WCAG 2.1.1]
must-fix · forms · filter-bar.tsx:8 — the input has only a placeholder. Add an associated `<label>`. [WCAG 3.3.2]
must-fix · forms · filter-bar.tsx:9 — the error is carried by red color alone and is not linked to the input. Keep the text, link it with `aria-describedby`, set `aria-invalid`. [WCAG 1.4.1, 3.3.1]
must-fix · keyboard-focus · filter-bar.tsx:10 — `outline: none` removes the focus indicator with no replacement. [WCAG 2.4.7]
must-fix · keyboard-focus · filter-bar.tsx:6 — opening the panel does not move focus into it; closing does not restore focus to the toggle.
consider · perceivable · filter-bar.tsx:5 — `⚙` is a decorative glyph a screen reader may read as "gear". Wrap it `aria-hidden="true"` and rely on the button's `aria-label`. [WCAG 1.1.1]
```
