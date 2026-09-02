# Vue — Templates and Keyed Lists: why

The rules are in the `vue` Ruleset (`templates` group). This file is the reasoning and a `❌ / ✅`
example — it adds no rule the Ruleset does not state.

- **Key on a stable id.** Vue uses `:key` to match old and new nodes. An array-index key means that
  when the list reorders or an item is removed, Vue keeps the wrong DOM node and its state — a
  half-typed input, a checked box — attached to the wrong data.
- **Never `v-if` with `v-for` on one element.** `v-for` has higher priority, so the `v-if` is
  evaluated per item on every render even for items you meant to skip. Filter in a `computed`, or
  move the `v-if` to a wrapping `<template>`.
- **Keep template expressions trivial.** A binding is re-evaluated on every render. Anything past a
  property read or a single call — a filter, a sort, a format — belongs in a `computed` so it is
  cached and testable.
- **`v-html` is an XSS sink.** Only ever bind sanitized or fully trusted HTML
  (`architecture-and-design`, security).
- **Semantic elements.** `<div @click>` has no role, no keyboard behavior, no focusability. Use
  `<button>` / `<a>` / `<label>` and give every control a name (`accessibility`).

```vue
<!-- ❌ index key, v-if on the v-for element, logic in the binding -->
<li v-for="(row, i) in rows" :key="i" v-if="row.active">
  {{ row.items.filter(x => x.done).length }} done
</li>

<!-- ✅ stable key, filtering in computed, derived value in computed -->
<li v-for="row in activeRows" :key="row.id">{{ doneCount(row) }} done</li>
```

```ts
const activeRows = computed(() => rows.value.filter((r) => r.active));
const doneCount = (row: Row) => row.items.filter((x) => x.done).length;
```
