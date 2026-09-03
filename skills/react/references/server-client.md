# React — Server and Client Components: why, and an example

The rules are in the `react` Ruleset (`server-client` group).

- **Server Component is the default** in a framework that supports RSC — there is no directive for it. It runs once on the server, does not re-render, does not
  hydrate, and only its rendered output reaches the browser, so it has no state, no Effects, no browser APIs, and no event handlers.
- **It can be `async`.** A Server Component may `await` in render and read the database or a file directly; there is no API layer to build for its own data.
- **`'use client'` marks a boundary, not a component.** Everything in a `'use client'` file *and everything it imports* ships to the browser. Put the directive
  on the smallest interactive leaf, not the page or layout, or the whole subtree becomes client code.
- **`'use server'`** marks a function that runs on the server, callable from a Client Component as an Action — it is not how you make a Server Component.
- **The boundary serializes props.** Only data and JSX passed as `children` cross it. No functions (except a Server Action), no class instances.
- **Server-only code must stay server-only.** A database client, a secret, or `fs` reached from a `'use client'` file gets bundled for the browser. The
  `server-only` package turns that into a build error.
- **Fetch on the server.** Data fetched in the Server Component or loader and passed down removes a client round-trip and its loading state.

```tsx
// ❌ 'use client' on the page — Article and everything it imports now ship to the browser
'use client';
export default function Page() {
  return (<><Article /><LikeButton /></>);
}

// ✅ Directive on the interactive leaf only
// like-button.tsx
'use client';
export function LikeButton() {
  const [liked, setLiked] = useState(false);
  // ...
}

// page.tsx — a Server Component, no directive
export default function Page() {
  return (<><Article /><LikeButton /></>);
}
```
