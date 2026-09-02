# Vue — The Nuxt / SSR Boundary: why

The rules are in the `vue` Ruleset (`server` group). This file is the reasoning and a `❌ / ✅`
example — it adds no rule the Ruleset does not state.

- **`setup` runs on the server.** Reading `window`, `document`, or `localStorage` at the top level
  of `<script setup>` throws during SSR or during the server render pass of hydration. Put that code
  in `onMounted` (client-only) or behind `import.meta.client` (Nuxt) / `!import.meta.env.SSR` (Vite SSR).
- **Module `ref` is shared across requests.** On the server the module is evaluated once and lives
  for the process lifetime, so a module-scope `ref` holding "the current user" is handed to every
  concurrent request. Use the framework's request-scoped primitive — Nuxt `useState(key, init)`.
- **Fetch once, keyed.** `useAsyncData` / `useFetch` run on the server, serialize the result into
  the payload, and the client reuses it on hydration — *if* the key is stable. A missing or
  changing key causes a second fetch on the client and can cause a mismatch.
- **Fix mismatches at the source.** A hydration warning means server HTML and first client render
  differed — `Date.now()`, `Math.random()`, `if (import.meta.client)` in render, locale-dependent
  formatting. Fix the non-determinism; wrap genuinely client-only UI in `<ClientOnly>` rather than
  suppressing the warning.
- **Keep server code server-side.** A secret, a DB client, or anything under `server/` imported
  into a component gets bundled and shipped to the browser.

```ts
// ❌ browser API at setup top level; module ref shared across SSR requests
const theme = ref(localStorage.getItem('theme') ?? 'light'); // ReferenceError on the server
// (at module scope) export const user = ref<User | null>(null); // leaks between requests

// ✅ request-scoped state; browser API after mount
const theme = useState('theme', () => 'light');
onMounted(() => { theme.value = localStorage.getItem('theme') ?? 'light'; });
```
