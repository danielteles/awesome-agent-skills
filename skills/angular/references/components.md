# Component Authoring — why, and an example

The rules are in the `angular` Ruleset (`components` group).

- **`OnPush` on every component.** `OnPush` plus signals is the fast, zoneless-ready default; default change detection re-checks the whole tree on every event.
- **`inject()` over constructor parameters** — better type inference, works outside a constructor, easier to annotate. Group injected members, inputs, outputs,
  and queries at the top of the class so the component's surface is in one place. Mark every Angular-assigned member (`input()`, `model()`, `output()`, query
  results) `readonly` — reassigning one is a bug. Use `protected` for a member only the template reads, so the class's real public API stays honest.
- **One component / directive / service per file, named for the class.** The current style guide drops the `.component` suffix (`user-profile.ts`, not
  `user-profile.component.ts`); match the codebase when it still uses the old name.
- **A single project selector prefix** avoids collisions; an **attribute selector** for a directive states intent. **Implement a lifecycle hook's interface**
  (`OnInit`, `OnDestroy`) — a misspelled `ngOnInit` runs never and warns nothing without it. Put **host bindings and listeners in the `host` object**, not
  `@HostBinding` / `@HostListener`.
- **Name an event handler for the action** (`saveDraft()`), not the event (`onClick()`).
- **Cross-cutting behavior is a `hostDirective`** — it composes (a component can apply several, each with its own inputs and outputs), where a base class or
  copy-paste does not.
- **No `::ng-deep`** — it is deprecated and becomes an unscoped global selector at runtime, breaking across upgrades. Default to emulated encapsulation; if you
  need `ViewEncapsulation.None` for a theme or library override, put it in a file whose name says it is global (a component-shaped filename hides that every
  selector is now app-wide). To pierce into a child, use a named global stylesheet and scope each rule with `:has(your-selector)`.

```ts
@Component({
  selector: 'app-user-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-card.html',
  host: { '[class.is-active]': 'active()' },
})
export class UserCard {
  private readonly users = inject(UserService);

  readonly userId = input.required<UserId>();
  readonly removed = output<UserId>();

  protected readonly user = computed(() => this.users.byId(this.userId()));
  protected readonly active = signal(false);
}
```
