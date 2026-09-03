# CSS Modules vs Utility vs CSS-in-JS — why

The rules are in the `styling-and-design-tokens` Ruleset (`methodology` group).

| Approach | Reach for it when | Watch out for |
|---|---|---|
| Scoped CSS / CSS Modules | Default. You want plain CSS, zero runtime, easy debugging. | Dynamic values still need custom properties, not new classes. |
| Utility system | A team wants one vocabulary and no naming debates; design is token-driven. | Arbitrary values (`p-[13px]`) — that is a missing token. Long class lists need componentising. |
| Zero-runtime CSS-in-JS (extracted at build) | You want colocation and TS types on styles without shipping a runtime. | Build setup; a smaller ecosystem. |
| Runtime CSS-in-JS | Rarely. Truly per-instance dynamic styling that custom properties cannot express. | Re-serializes CSS on render; breaks or degrades in Server Components; a cost on long lists. |

- **Pick one, write it down.** Three systems in one codebase means three ways to express spacing and
  three places a review has to check. Mixing a utility system with ad-hoc CSS Modules is common and
  still costs consistency.
- **Runtime cost.** Styling should be free at render time. Runtime CSS-in-JS recomputes and
  re-injects styles as props change; in a Server Component it either fails or forces a client
  boundary; in a thousand-row list it shows up in the profile.
- **Dynamic values are custom properties.** Set `style={{ '--progress': pct + '%' }}` and read
  `var(--progress)` in a static rule — no new class, no runtime.

```tsx
// ❌ runtime CSS-in-JS generating a class per value — re-serialized every render
const Bar = styled.div<{ pct: number }>`
  width: ${(p) => p.pct}%;
  background: ${(p) => (p.pct > 80 ? 'red' : 'green')};
`;

// ✅ one static rule, the dynamic bit passed as a custom property
// bar.module.css
// .bar { inline-size: var(--pct); background: var(--bar-color); }
<div
  className={styles.bar}
  style={{ '--pct': `${pct}%`, '--bar-color': pct > 80 ? 'var(--color-danger)' : 'var(--color-success)' } as React.CSSProperties}
/>;
```
