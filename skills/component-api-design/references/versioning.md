# Versioning a Shared Component — why

The rules are in the `component-api-design` Ruleset (`versioning` group).

- **The API is bigger than the props type.** Consumers depend on the prop names, the default
  values, the rendered DOM structure, and the class or slot names they style and query against. Any
  of these changing under them is a breaking change, even if TypeScript stays green.

  | Change | Semver |
  |---|---|
  | New optional prop, new slot, new `variant` value | minor |
  | New required prop, removed/renamed prop, changed default, changed DOM/class contract | major |
  | Bug fix that does not alter the contract | patch |

- **Deprecate, do not delete.** A prop being renamed keeps working for one major version: accept
  both, map the old to the new, mark it `@deprecated` with the replacement named, and warn once in
  development. Remove it in the next major.
- **Defaults are frozen.** Changing `size` from `md` to `sm` by default silently restyles every
  existing usage. That is a major change with a migration note, never a minor.
- **Renames ship a codemod.** A find-and-replace the consumer runs, plus a changelog entry with the
  version and before/after.

```tsx
// ❌ prop renamed and default changed in a minor release — every consumer breaks silently
- type Props = { label: string; size?: 'sm' | 'md' }; // was default 'md'
+ type Props = { text: string; size?: 'sm' | 'md' };   // now default 'sm', `label` gone

// ✅ additive + deprecation path, default unchanged
type Props = {
  /** @deprecated since 4.2 — use `text`. Removed in 5.0. */
  label?: string;
  text?: string;
  size?: 'sm' | 'md'; // still defaults to 'md'
};
function Chip({ label, text, ...rest }: Props) {
  if (label && process.env.NODE_ENV !== 'production') console.warn('<Chip label> is deprecated; use `text`.');
  const content = text ?? label ?? '';
  // …
}
```
