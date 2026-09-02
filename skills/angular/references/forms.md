# Reactive Forms — why

The rules are in the `angular` Ruleset (`forms` group). This file is the reasoning.

- **Reactive, typed forms** (`FormGroup`, `FormControl`) for anything past a single field — a template-driven form hides its model and is hard to test. Type every control: `new FormControl<string>('', { nonNullable: true })`; an untyped form loses every guarantee. Keep template-driven only for a trivial single input.
- **Build the validators from the same schema as the domain model** (`architecture-and-design`, forms) — one source of truth for the rules, client and server.
- **Derive `invalid` / `dirty` / error text from the form state.** A copy into a signal goes stale against the control.
- **A control a mode does not render is `disable({ emitEvent: false })`d, not `@if`-hidden.** A hidden control keeps its validators and its patched value, keeps `form.invalid` true, and has no element to show the error — so the save button silently does nothing. A disabled control is excluded from both `form.value` and validity.
- **When a save is blocked, show the user why** — a toast or an inline message. A blocked save with only a disabled button reads as a broken button.
