# Signal Inputs, Outputs, and Queries — why, and the mapping

The rules are in the `angular` Ruleset (`inputs-outputs` group). This file is the reasoning and the
decorator → function mapping.

| Decorator form | Function form |
|---|---|
| `@Input() name: string` | `name = input.required<string>()` or `input('')` |
| `@Input()` with a setter transform | `input(0, { transform: numberAttribute })` |
| `@Input()` + `@Output()` pair for two-way binding | `value = model<T>()` |
| `@Output() saved = new EventEmitter<T>()` | `saved = output<T>()` |
| `@ViewChild` / `@ContentChild` | `viewChild()` / `contentChild()` |

- **An input is a signal now** — read it as a call, `this.name()`.
- **`input.required<T>()`** over an optional input plus a `?` guard: it fails at build time when a parent forgets to pass it.
- **A two-way value** is written with `this.value.set(...)` — `model()` is a writable signal wired to the parent binding.
- **Bind route params to inputs** with `withComponentInputBinding()` (see `routing`), so the component reads an `input()` rather than injecting `ActivatedRoute`.
