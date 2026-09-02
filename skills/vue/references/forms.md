# Vue — Forms: why

The rules are in the `vue` Ruleset (`forms` group). This file is the reasoning and a `❌ / ✅`
example — it adds no rule the Ruleset does not state.

- **`v-model` and its modifiers do the plumbing.** `.number` coerces, `.trim` trims, `.lazy` syncs
  on `change` not `input`. A custom field component exposes `defineModel()` so the parent binds it
  with plain `v-model`. Wrapping a native input in hand-written `:value` + `@input` is a step
  backward.
- **One schema, two checks.** The client validators are built from the same schema the server
  validates with (VeeValidate with a Zod/Yup resolver, or the schema directly). The client check is
  feedback; the server re-checks because the network is not a trusted boundary
  (`architecture-and-design`, forms).
- **Derive error state.** `computed(() => errors.value.email)` stays correct automatically; copying
  the error into its own `ref` in a `watch` creates a second source of truth that drifts.
- **Survive a failed submit.** Keep the entered values, show each error at its field, and do not
  make a disabled submit button the only signal — the user cannot tell why.
- **Unused fields leave the payload.** A field the current step does not use is removed from the
  submitted data or explicitly disabled, not merely `v-if`-hidden while still bound.

```vue
<!-- ❌ hand-rolled binding, error copied into a separate ref, values lost on failure -->
<script setup lang="ts">
const email = ref('');
const emailError = ref('');
watch(email, (v) => (emailError.value = v.includes('@') ? '' : 'Invalid'));
async function submit() { try { await save({ email: email.value }); email.value = ''; } catch {} }
</script>

<!-- ✅ schema-driven, derived errors, values kept -->
<script setup lang="ts">
const { defineField, errors, handleSubmit } = useForm({ validationSchema: toTypedSchema(accountSchema) });
const [email] = defineField('email');
const submit = handleSubmit(async (values) => { await save(values); }); // server re-validates
</script>
```
