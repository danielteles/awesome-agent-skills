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
notification-badge.tsx → core-typescript, architecture-and-design, react, accessibility, styling-and-design-tokens, web-performance
```

Merged review:

```
1 file · 4 must-fix · 3 consider · blocks merge

notification-badge.tsx
  must-fix · accessibility · notification-badge.tsx:8 — <div onClick> has no role, name, or keyboard behaviour. Use <button type="button" aria-label="Clear notifications">. Also flagged by `react` (purity). [WCAG 4.1.2, 2.1.1]
  must-fix · data-fetching · notification-badge.tsx:4 — bare useEffect fetch: no cache, refetches every mount, races on userId change. Use a cache library keyed by ['notif-count', userId]. (react)
  must-fix · tokens · notification-badge.tsx:8 — raw #d33 for the background. Use a semantic token, e.g. var(--color-danger). (styling-and-design-tokens)
  must-fix · rum · notification-badge.tsx:4 — a poll with no interval control and no visibility check will run on every mount across the app; measure its INP/main-thread cost or move it behind a shared query. (web-performance)
  consider · purity · notification-badge.tsx:2 — React.FC. Type the props directly: function NotificationBadge({ userId }: { userId: string }). (react)
  consider · purity · notification-badge.tsx:1 — unused React import with the automatic JSX runtime. Remove it. (react)
  consider · state · notification-badge.tsx:3 — server data held in useState. Let the cache own it. (react, agrees with architecture-and-design state-and-data)
```

De-duplication applied: the `<div onClick>` was raised by both `accessibility` and `react` — kept
the `accessibility` finding (it owns the requirement) and credited `react`.
