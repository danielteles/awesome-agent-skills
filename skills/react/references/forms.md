# React — Forms and Actions: why, and an example

The rules are in the `react` Ruleset (`forms` group). This file is the reasoning and an example.

- **`<form action>` + `useActionState`.** React manages the pending flag, the returned error/state, and the form reset. `useActionState` gives
  `[state, submitAction, isPending]` with no manual `useState` juggling and no submit `useEffect`.
- **`useFormStatus`** lets a nested control (a submit button in its own component) read the parent form's pending state directly, instead of drilling a prop
  down.
- **`useOptimistic`** shows the new row immediately and reverts it if the action rejects.
- **Uncontrolled by default.** A controlled input re-renders the form on every keystroke. Control an input only when its value drives other UI in real time.
  Never switch an input between controlled and uncontrolled mid-life (a `value` that starts `undefined` then becomes a string does this) — React warns and the
  cursor jumps.
- **One schema, two checks.** Build the client validators from the same schema the server validates with (`architecture-and-design`, forms). The client check is
  feedback; the network is not a boundary you control, so the server must re-check.
- **Failure handling.** Keep the entered values on a failed submit and map each error back to its field. A wiped form plus a generic "submit failed" is the
  classic pair of form bugs.

```tsx
// ❌ Manual submit: useState juggling and a submit Effect
const [pending, setPending] = useState(false);
const [error, setError] = useState<string>();
async function onSubmit(e: FormEvent) {
  e.preventDefault();
  setPending(true);
  // ...
}

// ✅ Action-driven: React owns the pending flag, the error/state, and the reset
const [error, submitAction, isPending] = useActionState(saveProfile, undefined);
return <form action={submitAction}>{/* fields */}</form>;
```
