# Clean Code — why, and examples

The rules are in the `architecture-and-design` Ruleset (`clean-code` group). This file is the
reasoning and examples.

- **Names carry the type and the effect.** A boolean named `is` / `has` / `should` / `can` reads as a fact; a function named with a verb reads as an action.
  `cfg` / `usr` abbreviations and `user` / `account` synonyms for one concept cost the reader time on every encounter.
- **Length.** A function you have to scroll to read is doing too much. The options-object rule for a long parameter list is `core-typescript`, functions.
- **No behavior-switching flag parameter.** `save(data, isDraft)` couples two behaviors and two call sites in one body. Two named functions are clearer and each
  is simpler.
- **Comments explain why.** The code already says what it does. A comment earns its place by recording a reason the code cannot show.
- **No in-place mutation** of a parameter, prop, or state — a shared mutation causes bugs far from the change. Build and return a new value.
- **Fail loud.** An empty `catch` makes a failure invisible and undebuggable. Handle the error, or let it rise.
- **Delete dead code** — commented blocks, unused exports, unreachable branches. Version control keeps the history.

## Two functions, not a flag

```ts
// ❌ The flag hides two behaviors
function save(data: Data, isDraft: boolean) { /* ... */ }

// ✅ Two clear entry points
function saveDraft(data: Data) { /* ... */ }
function publish(data: Data) { /* ... */ }
```

## Comment the reason

```ts
// ❌ Repeats the code
// increment index by one
index += 1;

// ✅ Explains the reason
// The API pages from 1, not 0.
index += 1;
```

## Return a new value

```ts
// ❌ Mutates the input
function addItem(cart: Cart, item: Item) {
  cart.items.push(item);
  return cart;
}

// ✅ Returns a new value
function addItem(cart: Cart, item: Item): Cart {
  return { ...cart, items: [...cart.items, item] };
}
```

## Fail loud

```ts
// ❌ Swallows the error
try {
  await save();
} catch (e) {}

// ✅ Handle it, or let it rise
try {
  await save();
} catch (error) {
  logger.error('save failed', { error });
  throw error;
}
```
