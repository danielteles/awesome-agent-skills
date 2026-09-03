# Forms and Validation — why, and an example

The rules are in the `architecture-and-design` Ruleset (`forms` group). A form bundles three concerns — draft state, validation, submission — kept separate
and each where it belongs.

- **Draft state is local UI state** (`state-and-data`). Keep it in the form or a form library; a global draft leaks between screens.
- **One validation schema, next to the domain model, reused on client and server.** Two hand-written rule sets drift. The client check is a convenience for
  feedback; the server re-checks the same schema for trust, because the network is not a boundary you control (`type-safety`).
- **Derive `isValid` / `isDirty` / per-field errors from the form state.** A stored flag falls out of sync with the values.
- **Uncontrolled inputs with a form library for a large form**; a controlled input only when its value drives other UI in real time. Controlling every keystroke
  re-renders the whole form.
- **Map a server validation error back onto its field.** A generic "submit failed" makes the user hunt for the problem.
- **Disable submit while a submit is in flight; keep the entered values on failure.** A double submit and a wiped form are the two classic form bugs.

```ts
// One schema, next to the domain model, reused on both sides
const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12),
});
type SignupInput = z.infer<typeof SignupSchema>;

// Client: validate for feedback
const form = useForm<SignupInput>({ resolver: zodResolver(SignupSchema) });

// Server: re-validate the same schema before the data reaches the domain
export function handleSignup(raw: unknown) {
  const input = SignupSchema.parse(raw); // throws on bad input
  // ...
}
```
