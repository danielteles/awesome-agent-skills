# Vue — Components and `<script setup>`: why

The rules are in the `vue` Ruleset (`components` group).

- **`<script setup>` is the modern SFC.** It is less boilerplate than `defineComponent` with an
  `options` object, gives better type inference for props and emits, and compiles to a more
  efficient runtime. New components use it; there is no upside to the options object.
- **Type the macros.** `defineProps<{ id: string }>()` gives the compiler and the editor the real
  shape; `defineProps({ id: String })` is a runtime guess that TypeScript cannot check. Same for
  `defineEmits<{ save: [id: string] }>()`.
- **`defineModel` over the manual pair.** A custom field used to need a `modelValue` prop and an
  `update:modelValue` emit wired by hand. `defineModel()` is one line and stays in sync.
- **Defaults by destructure.** `const { size = 'md' } = defineProps<Props>()` is reactive since Vue 3.5 and
  reads as plain JavaScript; `withDefaults` is the older, noisier form.
- **One component per file, named.** The file name is the component name (`PascalCase`), and a
  resolvable `name` is what `<KeepAlive :include>`, `<component :is>`, and the devtools use.
- **Slots are Vue's composition mechanism.** Named and scoped slots (`<template #header>`,
  `v-slot="{ row }"`) let a caller supply markup; when a slot beats a prop is decided in
  `component-api-design`, slots-vs-config.

```vue
<!-- ❌ options object, runtime props, manual v-model pair -->
<script lang="ts">
export default defineComponent({
  props: { modelValue: String, label: String },
  emits: ['update:modelValue'],
});
</script>

<!-- ✅ script setup, typed macros, defineModel -->
<script setup lang="ts">
const model = defineModel<string>();
defineProps<{ label: string }>();
</script>

<template>
  <label>{{ label }}<input v-model="model" /></label>
</template>
```
