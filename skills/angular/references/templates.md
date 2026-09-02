# Templates and Control Flow — why, and an example

The rules are in the `angular` Ruleset (`templates` group). This file is the reasoning and an
example.

- **`@if` / `@for` / `@switch`**, not the `*ng*` structural directives — the block syntax is the default, faster, and needs no import. **Every `@for` has a
  `track`** on a stable id, not `$index`; a wrong key rebuilds the wrong DOM and loses state.
- **No method call in a binding** — it runs on every change-detection pass. Move the value to a `computed()` or a pure pipe. Move any expression past a property
  read or a single pipe into a `computed()`; template logic is hard to test and reruns often. Use `@let` for a value the template reads more than once.
- **`@defer` with an `on` trigger** (`on viewport`, `on idle`, `on interaction`) around a heavy or below-the-fold section keeps it out of the initial bundle.
- **`[class.active]` / `[style.width.px]`** over `NgClass` / `NgStyle` — clearer and faster. Show an Observable with the `async` pipe or `toSignal()`; never
  `.subscribe()` in the class for display data, since the pipe unsubscribes for you.
- **Extensibility via projection**: `<ng-content>` + named slots (`select=`), a caller-supplied template as an `input<TemplateRef>()` rendered by
  `*ngTemplateOutlet`, or a caller-supplied component via `NgComponentOutlet` — this is how a reusable component stays open for extension
  (`architecture-and-design`, solid — OCP), not a growing list of boolean config props.
- **A custom pipe is pure, standalone, and typed**, and does no I/O or heavy work — an impure pipe runs on every change-detection pass.

```html
@if (user(); as u) {
  <span>{{ fullName() }}</span>       <!-- computed, not a method -->
  @for (role of u.roles; track role.id) {
    <app-role-chip [role]="role" />
  } @empty {
    <p>No roles</p>
  }
}

@defer (on viewport) {
  <app-activity-feed [userId]="user()!.id" />
} @placeholder {
  <app-skeleton />
}
```
