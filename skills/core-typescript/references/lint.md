# Lint and Format — why

The rules are in the `core-typescript` Ruleset (`lint` group).

- **`typescript-eslint`, type-checked.** `strict-type-checked` enforces most of this skill automatically and matches its stance; `recommended-type-checked` is
  the softer floor if `strict` produces too much noise to adopt at once. Both need `parserOptions.project` set so the rules can see types.
- **Turn on** `no-floating-promises` (→ `async`), `no-explicit-any` (→ `unsafe-types`), `consistent-type-imports` (→ `modules`), and
  `switch-exhaustiveness-check` (→ `narrowing`) — they mechanize rules a review otherwise has to catch by eye.
- **Prettier** formats, so whitespace and line breaks stop being a review topic.
