# Asynchronous Code — why, and examples

The rules are in the `core-typescript` Ruleset (`async` group). This file is the reasoning and
examples.

- **Never leave a promise unhandled.** A floating promise swallows its rejection — the error vanishes with no stack. `await` it, or mark it `void` to say the
  fire-and-forget is deliberate.
- **`Promise.all` for independent work.** Serial `await` on calls that do not depend on each other adds their latencies for no reason. Keep serial `await` only
  where a step needs the previous result.
- **`using` / `await using` for a disposable resource** — a timer, a subscription, a lock, a file handle. Explicit resource management runs the cleanup
  deterministically at end of scope, including on an early return or a throw, where a manual `finally` is easy to forget or misplace. Use it where the compile
  target and runtime support it.

```ts
// ❌ Floating promise: an error here is swallowed
sendAnalytics(event);

// ✅ Awaited, or ignored on purpose
await sendAnalytics(event);
void sendAnalytics(event);

// ❌ Serial when the calls are independent
const user = await getUser(id);
const roles = await getRoles(id);

// ✅ Parallel
const [user, roles] = await Promise.all([getUser(id), getRoles(id)]);

// ✅ Deterministic cleanup with `using`
{
  using sub = source.subscribe(onValue); // sub[Symbol.dispose]() runs at end of block
  await process();
} // unsubscribed here, even if process() threw
```
