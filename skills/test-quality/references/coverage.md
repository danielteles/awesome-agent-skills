# Test Quality — Coverage: why, and examples

The rules are in the `testing` Ruleset (`coverage` group). This file is the reasoning and code.

## Coverage measures execution, not verification

A line is "covered" when a test *ran* it — not when a test *checked its result*. You can hit 100%
with tests that assert nothing. Read the report the other way round: the uncovered lines are a
list of code no test touches at all, which is useful; the covered percentage is not a quality
score.

```ts
// Lifts coverage on parsePrice to 100%, verifies nothing
it('parses a price', () => {
  parsePrice('12.34');
});

// Actually verifies it
it('parses a decimal price into cents', () => {
  expect(parsePrice('12.34')).toBe(1234);
});
it('rejects a negative price', () => {
  expect(() => parsePrice('-1')).toThrow(RangeError);
});
```

## Enforce on the diff, not a global number

A global threshold rewards piling tests onto easy code and says nothing about the risky lines in
the current change. Gate the pull request on coverage of the lines it touches.

## Line coverage misses branches and boundaries

One test through a function marks every line green while leaving the `else`, the empty input, the
off-by-one at the limit, and the overflow untested. Chase the branches and the edges, not the
line count.

## Where mutation testing pays

For logic where a wrong answer is expensive — money, tax, auth, permissions, data migrations — a
mutation tester (Stryker) flips `+` to `-`, `<` to `<=`, `&&` to `||`, and reports which mutants
your suite fails to catch. A surviving mutant is a real gap a coverage report cannot show. It is
slow, so point it at the critical modules, not the whole repo.

## Every bug fix ships with a test

Write the test first, watch it fail on the current code, then fix. That proves the fix addresses
the reported bug and stops the regression from returning unnoticed.

## Characterization tests: a net before you touch legacy code

Before changing code that has no tests, write tests that pin its *current* observable behavior —
including behavior that looks wrong. Run them green against the untouched code. Now a refactor that
changes any observable behavior turns one red, and you decide case by case whether that change was
intended (update the test) or a mistake (revert). Do not fix bugs and add the net in one step; you
lose the ability to tell a deliberate change from a regression.

## Prune tests that no longer earn their place

Coverage is not only about what is missing. A test that duplicates another, asserts a tautology
(`expect(true).toBe(true)`), or covers a code path that has been deleted is pure drag — it slows
the suite and misleads the next reader into thinking the behavior is checked. Delete it in the same
change that makes it redundant.
