# Angular — Worked Example: A Review Pass

A full pass in the skill's Output Format. Findings cite the Ruleset topic they fail.

Input diff:

```ts
// user-menu.component.ts — proposed in a pull request
1  @Component({
2    selector: 'user-menu',
3    template: `
4      <div *ngIf="user">
5        <span>{{ fullName() }}</span>
6        <button (click)="onClick()">Sign out</button>
7      </div>`,
8  })
9  export class UserMenuComponent implements OnInit {
10   @Input() user!: User;
11   @Output() signOut = new EventEmitter<void>();
12   items = [];
13
14   constructor(private auth: AuthService) {}
15
16   ngOnInit() {
17     this.auth.getSession().subscribe((s) => (this.items = s.menu));
18   }
19
20   fullName() {
21     return `${this.user.firstName} ${this.user.lastName}`;
22   }
23
24   onClick() {
25     this.signOut.emit();
26   }
27 }
```

Output:

```
must-fix · components · user-menu.component.ts:1 — no `changeDetection`. Add `ChangeDetectionStrategy.OnPush`.
must-fix · components · user-menu.component.ts:2 — selector `user-menu` has no project prefix. Use `app-user-menu`.
must-fix · inputs-outputs · user-menu.component.ts:10 — `@Input()` decorator. Use `user = input.required<User>()` and read it as `user()`.
must-fix · inputs-outputs · user-menu.component.ts:11 — `@Output() EventEmitter`. Use `signOut = output<void>()`.
must-fix · components · user-menu.component.ts:14 — constructor injection. Use `private readonly auth = inject(AuthService)`.
must-fix · rxjs · user-menu.component.ts:17 — `.subscribe()` with no teardown. Convert with `toSignal()`, or add `takeUntilDestroyed()`.
must-fix · templates · user-menu.component.ts:4 — `*ngIf`. Use `@if (user(); as u)`.
must-fix · templates · user-menu.component.ts:5 — `fullName()` is a method call in a binding. Make it a `computed()`.
consider · signals · user-menu.component.ts:12 — `items` is state set from a stream. Hold it as `toSignal(this.auth.getSession()...)`.
consider · components · user-menu.component.ts:24 — `onClick` is named for the event. Name it for the action, or emit inline in the template.
consider · components · user-menu.component.ts:9 — the file is `user-menu.component.ts`; the current style guide uses `user-menu.ts`. Match the codebase.
```
