# Frontend Code Review — Worked Example: A Review Pass

A full pass: route the diff, run the skills, de-duplicate, and merge. Findings keep the Output
Format of the skill that produced them.

Input diff:

```tsx
// notification-badge.tsx — proposed in a pull request
1   import React from 'react';
2   export const NotificationBadge: React.FC<{ userId: string }> = ({ userId }) => {
3     const [count, setCount] = React.useState(0);
4     React.useEffect(() => {
5       fetch(`/api/notifications/${userId}/count`).then((r) => r.json()).then((d) => setCount(d.count));
6     }, [userId]);
7     return (
8       <div className="badge" style={{ background: '#d33' }} onClick={() => setCount(0)}>
9         {count}
10      </div>
11    );
12  };
```

Routing:

```
notification-badge.tsx → core-typescript, architecture-and-design, react, accessibility, styling-and-design-tokens, i18n-and-localization
```

Merged review:

```
1 file · 3 must-fix · 4 consider · blocks merge

notification-badge.tsx
  must-fix · data-fetching · notification-badge.tsx:4 — bare useEffect fetch: no cache, refetches every mount, races on userId change. Use a cache library keyed by ['notif-count', userId]. (react)
  must-fix · accessibility · notification-badge.tsx:8 — <div onClick> has no role, name, or keyboard behaviour. Use <button type="button" aria-label="Clear notifications">. Also flagged by `react` (purity). [WCAG 4.1.2, 2.1.1]
  must-fix · tokens · notification-badge.tsx:8 — raw #d33 for the background. Use a semantic token, e.g. var(--color-danger). (styling-and-design-tokens)
  consider · purity · notification-badge.tsx:1 — `import React` serves only as a namespace for the hooks. Import `useState` / `useEffect` by name; the automatic JSX runtime needs no React import. (react)
  consider · purity · notification-badge.tsx:2 — React.FC. Type the props directly: function NotificationBadge({ userId }: { userId: string }). (react)
  consider · state · notification-badge.tsx:3 — server data held in useState. Let the cache own it. (react, agrees with architecture-and-design state-and-data)
  consider · formatting · notification-badge.tsx:9 — `{count}` renders the raw number. Format it with `Intl.NumberFormat(locale)` so grouping follows the locale. (i18n-and-localization)
```

De-duplication applied: the `<div onClick>` was raised by both `accessibility` and `react` — kept
the `accessibility` finding (it owns the requirement) and credited `react`.
