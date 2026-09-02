<!--
  references/worked-example.md — every skill has one. It is one review pass in
  the skill's exact Output Format, so a reader sees the skill applied end to
  end. It is linked from prose, not from the Ruleset, so it is not one of the
  per-group reference files. Delete every HTML comment before you commit.
-->

# <Skill> — Worked Example: A Review Pass

A full pass in the skill's Output Format. Findings cite the Ruleset topic they
fail<, plus <the external tag> where it sharpens the point>.

Input diff:

```tsx
// <file>.tsx — proposed in a pull request
1  <line>
2  <line>
3  <line>
4  <line>
5  <line>
6  <line>
7  <line>
8  <line>
```

Output:

```
must-fix · <topic-a> · <file>.tsx:<line> — <what is wrong>. <the fix as an action>.
must-fix · <topic-b> · <file>.tsx:<line> — <what is wrong>. <the fix as an action>.
must-fix · <topic-b> · <file>.tsx:<line> — <what is wrong>. <the fix as an action>.
consider · <topic-c> · <file>.tsx:<line> — <what is wrong>. <the fix as an action>.
consider · <topic-a> · <file>.tsx:<line> — <what is wrong>. <the fix as an action>.
```

<!-- One realistic diff, 8-25 numbered lines, that trips several Ruleset groups.
     Every output line is in the exact Output Format from SKILL.md. Cover at
     least three distinct topics and both severities. Order: must-fix first,
     then consider. -->
