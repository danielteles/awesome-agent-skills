# React — Worked Example: A Review Pass

A full pass in the skill's Output Format. Findings cite the Ruleset topic they fail.

Input diff:

```tsx
// user-list.tsx — proposed in a pull request
1  import React from 'react';
2
3  export const UserList: React.FC<{ teamId: string }> = ({ teamId }) => {
4    const [users, setUsers] = useState<User[]>([]);
5    const [sorted, setSorted] = useState<User[]>([]);
6
7    useEffect(() => {
8      fetch(`/api/teams/${teamId}/users`)
9        .then((r) => r.json())
10       .then(setUsers);
11   }, [teamId]);
12
13   useEffect(() => {
14     setSorted([...users].sort((a, b) => a.name.localeCompare(b.name)));
15   }, [users]);
16
17   return (
18     <ul>
19       {sorted.map((u, i) => (
20         <li key={i}>
21           <UserRow user={u} config={{ onRemove: () => removeUser(u.id) }} />
22         </li>
23       ))}
24     </ul>
25   );
26 };
```

Output:

```
must-fix · data-fetching · user-list.tsx:7 — data fetched in a bare `useEffect`: no cache, and it races on a `teamId` change. Use a cache library keyed by `['team-users', teamId]`, or the framework loader.
must-fix · effects · user-list.tsx:13 — `sorted` is state derived from `users` through an Effect. Compute it in render: `const sorted = useMemo(() => [...users].sort(byName), [users])`.
must-fix · rendering · user-list.tsx:20 — `key={i}` is the array index. Use `key={u.id}`.
consider · purity · user-list.tsx:3 — `React.FC`. Type the props directly: `function UserList({ teamId }: { teamId: string })`.
consider · purity · user-list.tsx:1 — once `React.FC` goes, the `React` import is unused under the automatic JSX runtime. Remove it.
consider · rendering · user-list.tsx:21 — `config={{ … }}` is a fresh object every render and a config bag. Pass `onRemove` as a prop (the slot-vs-config call is `component-api-design`).
```
