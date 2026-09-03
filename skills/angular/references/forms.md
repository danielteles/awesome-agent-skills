# Reactive Forms — why

The rules are in the `angular` Ruleset (`forms` group). This file is the reasoning.

- **Signal Forms for a new form in a signal-based component** (stable since v22) — the form is built from a signal model with validation declared once in a
  schema, and the template reads field state as signals, so there is no `FormControl` to keep in sync with a signal. Reactive forms stay where a codebase
  is already built on them; a template-driven form hides its model and is hard to test, so it is kept for a trivial single input only.
- **A reactive form is typed** — `new FormControl<string>('', { nonNullable: true })`; an untyped form loses every guarantee.
- **Build the validators from the same schema as the domain model** (`architecture-and-design`, forms) — one source of truth for the rules, client and server.
- **Derive `invalid` / `dirty` / error text from the form state.** A copy into a signal goes stale against the control.
- **A control a mode does not render is `disable({ emitEvent: false })`d, not `@if`-hidden.** A hidden control keeps its validators and its patched value, keeps
  `form.invalid` true, and has no element to show the error — so the save button silently does nothing. A disabled control is excluded from both `form.value`
  and validity.
- **When a save is blocked, show the user why** — a toast or an inline message. A blocked save with only a disabled button reads as a broken button.
