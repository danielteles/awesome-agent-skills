<!--
  One reference file per Ruleset group, named references/<topic>.md where
  <topic> is the group's slug in SKILL.md. It carries no new rules — only the
  reasoning behind the group's rules and the `❌ / ✅` code that makes each one
  concrete. Budget: ~1400 tokens soft, 2000 hard (see CONTRIBUTING.md). If it
  does not fit, split the group or cut detail — never raise the budget.
  Delete every HTML comment before you commit.
-->

# <Group> — why

The rules are in the `<skill>` Ruleset (`<topic>` group). This file is the
reasoning and `❌ / ✅` examples — it adds no rule the Ruleset does not state.

- **<Rule, in a few words>.** <Why it exists: the bug it prevents or the cost it
  avoids. Two or three sentences. Name the sibling skill and group when the
  design rationale lives there ("`architecture-and-design`, patterns").>
- **<Next rule>.** <Its reasoning.>
- **<Next rule>.** <Its reasoning.>

```ts
// ❌ <what is wrong here>
<the failing code — small and self-contained>

// ✅ <why this form is right>
<the fixed code>
```

<!-- At least one ❌ / ✅ pair. Add a second only when the group has two
     distinct failure shapes. A short table (tool / shape / use) may precede the
     code when it earns its place. Prose-only, no code, is acceptable only when
     the group is not about code shape. -->
