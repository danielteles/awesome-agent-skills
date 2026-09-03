# Vue — Reactivity Caveats: why

The rules are in the `vue` Ruleset (`reactivity` group).

- **`ref` over `reactive`.** `reactive` breaks the moment you destructure it or reassign the whole
  object — the new binding is a plain value with no tracking. `ref` survives destructuring of the
  returned object, works for primitives, and has one consistent access rule (`.value`). Reach for
  `reactive` only for a cohesive object you never pull apart.
- **`.value` in script, bare in template.** The template compiler unwraps a top-level ref, so
  `{{ count }}` is right and `{{ count.value }}` is wrong; in `<script>` it is always `.value`.
- **`computed` is pure.** It is cached and re-evaluated lazily; a side effect or async call inside
  it fires at unpredictable times. Derive, do not act.
- **`watch` with explicit sources.** `watch(source, cb)` states exactly what it depends on;
  `watchEffect` re-collects dependencies every run, which surprises people when a newly-read ref
  starts triggering it. Use `watch` unless the dependency set is genuinely dynamic — and use
  neither to compute a value `computed` can.
- **`shallowRef` for big or foreign data.** Deep reactivity on a 10k-row array or a class instance
  from a library is wasted work; `shallowRef` tracks only reassignment. A deep `watch` is a
  deliberate, commented cost.
- **`readonly` on exposed state.** Handing callers a raw `ref` invites mutation from a distance;
  `readonly(state)` makes the write path go through your functions.

```ts
// ❌ destructured reactive — count and inc are no longer reactive
const state = reactive({ count: 0 });
let { count } = state; // a plain number — the reactive link is gone
function inc() { count++; } // mutates the local copy; the template never updates

// ✅ ref, or toRefs if a reactive group is really wanted
const count = ref(0);
function inc() { count.value++; }
```
