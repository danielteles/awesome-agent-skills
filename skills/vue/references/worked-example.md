# Vue — Worked Example: A Review Pass

A full pass in the skill's Output Format. Findings cite the Ruleset topic they fail.

Input diff:

```vue
<!-- UserPanel.vue — proposed in a pull request -->
1   <script lang="ts">
2   export default defineComponent({
3     props: { userId: String },
4     setup(props) {
5       const state = reactive({ user: null, theme: localStorage.getItem('theme') || 'light' });
6       const { user } = state;
7       fetch(`/api/users/${props.userId}`).then((r) => r.json()).then((u) => (state.user = u));
8       const fullName = computed(() => `${state.user?.first} ${state.user?.last}`);
9       return { state, user, fullName };
10    },
11  });
12  </script>
13
14  <template>
15    <div @click="openMenu">
16      <p v-for="(role, i) in state.user?.roles" :key="i" v-if="role.active">{{ role.name }}</p>
17      <span>{{ fullName }}</span>
18    </div>
19  </template>
```

Output:

```
must-fix · components · UserPanel.vue:2 — options-object `defineComponent` with a `setup`. Rewrite as `<script setup lang="ts">`.
must-fix · components · UserPanel.vue:3 — runtime `props: { userId: String }`. Type it: `const props = defineProps<{ userId: string }>()`.
must-fix · reactivity · UserPanel.vue:6 — `const { user } = state` destructures a `reactive`, so `user` is a plain value with no tracking. Keep `state.user`, or model state as `ref`s.
must-fix · server · UserPanel.vue:5 — `localStorage.getItem` runs at setup top level and throws during SSR. Read it in `onMounted`, or use `useState` seeded on the client.
must-fix · state · UserPanel.vue:7 — bare `fetch` in `setup`: no cache, no dedup, no loading or error state, refetches every mount. Use a query cache (`useQuery` / `useAsyncData`) keyed by `userId`.
must-fix · templates · UserPanel.vue:16 — `v-if` and `v-for` on one element, and `:key="i"` is the array index. Compute `activeRoles` and use `:key="role.id"`.
must-fix · templates · UserPanel.vue:15 — `<div @click>` is not a control. Use `<button type="button">` with an accessible name.
consider · reactivity · UserPanel.vue:8 — `fullName` renders "undefined undefined" until the fetch resolves. Guard the block with `v-if="user"` or return a placeholder from the computed.
```
