---
name: <skill-name>
description: >-
  <One or two sentences: what this skill governs and the form of guidance it
  gives — write, review, refactor, migrate.> <One sentence: the task types it
  serves.> Builds on <`sibling`, `sibling`>. Use it when the user mentions
  <keyword>, <keyword>, <keyword>, or <keyword>.
license: CC-BY-4.0
metadata:
  author: <your-handle>
  version: "1.0"
---

<!--
  Copy this directory layout for a new skill:

    skills/<skill-name>/
      SKILL.md                       # this file, filled in
      references/<topic-a>.md        # one file per Ruleset group
      references/<topic-b>.md
      references/worked-example.md   # always present — see templates/worked-example.md

  Fill every <placeholder>. Delete every HTML comment before you commit.
  `description` is <= 1024 characters and ends with the trigger keywords.
  Keep this file under 500 lines and under its token budget (see CONTRIBUTING.md).
  Sibling skills are named in bare backticks (`react`), never with a path or an
  installer command. No tool, vendor, or model name appears anywhere in the body.
-->

# <Title> — <Kind> Skill

<!-- Kind is one of: Base Engineering Skill · Framework Skill · Review Skill ·
     Engineering Skill. A framework skill extends `core-typescript` and
     `architecture-and-design`; a lens (Review Skill) composes over UI or test
     work. Title is a short human name, not the slug. -->

<Intro paragraph: one short paragraph. Name the layer this skill owns in plain
terms, and the language or framework the examples use.>

> **Builds on.** <`sibling-a`> (<what that skill owns>) and <`sibling-b`> (<what
> that skill owns>). On a conflict, <which skill wins on which axis — e.g.
> "`architecture-and-design` decides the design and this skill decides the
> framework API">. The Ruleset below is complete on its own; load a named skill
> only when the task turns on its layer, not by default. If a named sibling
> skill is not loaded, apply that layer from general knowledge and do not block.

<!-- A base skill with no siblings writes exactly:
     "> **Builds on.** Nothing — this is a base skill."
     and drops the conflict and fallback sentences. -->

This SKILL.md is self-sufficient: the **Ruleset** below is the complete,
enforceable list. Each `references/<topic>.md` holds that group's reasoning and
`❌ / ✅` code, and `references/worked-example.md` a full review pass; open them
for depth when your runtime allows.

---

## How to Use This Skill

Pick the mode that matches the task. Do the steps in order.

| Mode | Steps |
|---|---|
| **<Generate / Write>** — <write new code this skill governs> | 1. <first step, naming a `topic`>. 2. <second step>. 3. <third step>. 4. Run the Ruleset as a checklist. Fix each fail before you hand off. |
| **Review** — check a pull request or a diff | 1. Run the Ruleset against the diff. 2. Write one finding per fail, in the Output Format below. 3. Order the findings: `must-fix` first, then `consider`. 4. If nothing fails, say so in one line. Do not invent findings. |
| **<Migrate / Triage / Configure>** — <the third task type this skill serves> | 1. <first step>. 2. <second step>. 3. <third step>. |

<!-- Every skill has a Review mode with these exact steps. The other two modes
     are named for what the skill does (Generate, Write, Migrate, Triage,
     Configure, Characterize). Drop the third row if the skill has only two. -->

### Output Format

Write one finding per line:

```
<severity> · <topic> · <file>:<line> — <what is wrong>. <the fix as an action>.
```

- `<severity>` is `must-fix` (breaks a rule in this skill<, or the build / a lint rule>) or `consider` (safe, but a rule prefers another form).
- `<topic>` is a Ruleset topic slug (`<topic-a>`, `<topic-b>`, `<topic-c>`, …).

<!-- The finding line above is fixed — copy it verbatim. A skill may add one
     bracketed tag per finding for an external standard it cites (e.g.
     accessibility appends "[WCAG 1.4.1]"); note that convention here if so. -->

### Rules for Every Mode

- Name the Ruleset topic when you enforce a rule.
- State the reason, not only the rule.
- <One or two skill-specific always-on rules: the judgment calls that precede every mode.>

<!-- Optional: one `### <Named>` explainer subsection may sit between Output
     Format and Rules for Every Mode when the skill rests on a small model the
     reader needs first (e.g. test-quality's four properties, accessibility's
     POUR table). Keep it short. Most skills do not need one. -->

---

## Ruleset

### <topic-a> → `references/<topic-a>.md`

- [ ] <One enforceable rule: a reviewer can point at a line and call pass or fail from this sentence alone. No rationale — that lives in the reference file.>
- [ ] <Another rule in this group.>
- [ ] <Another rule.>

### <topic-b> → `references/<topic-b>.md`

- [ ] <rule>
- [ ] <rule>

<!-- One `###` group per Ruleset topic; 5-12 topics is typical. Every topic
     slug named here MUST have a matching references/<topic>.md, and every file
     in references/ (except worked-example.md) MUST be named by a group here. -->

---

## Limits

This skill is <its one-line scope>. It does not cover:

- <A neighbouring concern, and which skill owns it.>
- <Another out-of-scope area.>
- <Another.>

This skill states <what it decides>. It is not a substitute for running the
build or the suite and reading what actually fails.

---

## References

This skill composes with:

- **<`sibling-a`>** — <what it owns, and who wins on a conflict>.
- **<`sibling-b`>** — <what it owns>.
- **<`sibling-c`>** — <the sibling framework or lens skill, if any>.
