# Contributing

This repository is a set of composable, model-agnostic agent skills for frontend
engineering. Each skill is a lean `SKILL.md` plus a `references/` folder of
on-demand depth. Everything below is the contract a skill must meet; the checks
in [`bin/`](bin/) enforce the mechanical parts and a reviewer enforces the rest.

New here? Read this file and copy [`templates/`](templates/). You should not need
to open an existing skill to add one.

---

## Repository layout

```
skills/<name>/
  SKILL.md                       # frontmatter + the complete Ruleset, loaded in full on every trigger
  references/<topic>.md          # one file per Ruleset group — reasoning and ❌ / ✅ code, loaded on demand
  references/worked-example.md   # one review pass in the Output Format — always present
templates/                       # scaffolds for a new skill — copied, not imported
bin/                             # the checks that guard the contract
```

`references/` is exactly one level deep. No subfolders.

---

## Adding a skill

1. Pick a slug: lowercase, hyphen-separated, matching the directory name
   (`web-performance`, not `Web Performance` or `web_performance`).
2. `cp templates/SKILL.md skills/<slug>/SKILL.md`, then copy
   `templates/reference.md` to `skills/<slug>/references/<topic>.md` once per
   Ruleset group and `templates/worked-example.md` to
   `skills/<slug>/references/worked-example.md`.
3. Fill every `<placeholder>` and delete every HTML comment.
4. Run the checks (below). Fix every failure.
5. Open a pull request — see [Review process](#review-process).

Copy the templates as they are. Do not restructure the sections.

---

## The contract

### Frontmatter

YAML, at the top of `SKILL.md`, with exactly these keys:

| Key | Rule |
|---|---|
| `name` | Equals the directory name. Lowercase, hyphen-separated. |
| `description` | <= 1024 characters. Says what the skill does and when to use it. Ends with the trigger keywords a user is likely to type. |

### Body sections

In this order, with these headings and nothing else at the top level:

1. `# <Title> — <Kind> Skill` — `Kind` is `Base Engineering Skill`,
   `Framework Skill`, `Review Skill`, or `Engineering Skill`.
2. Intro paragraph.
3. `> **Builds on.**` blockquote — see [Builds-on note](#builds-on-note).
4. The "self-sufficient" paragraph (`This SKILL.md is self-sufficient …`).
5. `## How to Use This Skill` — a modes table. One row is `**Review**` with the
   standard steps from the template. The other rows are named for what the skill
   does (Generate, Write, Migrate, Triage, Configure, Characterize).
6. `### Output Format` — see [Output Format](#output-format).
7. `### Rules for Every Mode` — the always-on judgment calls.
8. `## Ruleset` — `### <topic> → ` `` `references/<topic>.md` `` groups of
   `- [ ]` lines.
9. `## Limits` — what the skill does not cover, and which skill owns each
   neighbouring concern.
10. `## References` — the sibling skills it composes with, one bullet each.

One optional `### <Named>` explainer subsection may sit between Output Format and
Rules for Every Mode when the skill rests on a model the reader needs first (for
example a properties list or a principle table). Keep it short; most skills omit
it.

### Output Format

The finding line is fixed. Copy it verbatim:

```
<severity> · <topic> · <file>:<line> — <what is wrong>. <the fix as an action>.
```

- `<severity>` is `must-fix` (breaks a rule in this skill, or the build / a lint
  rule) or `consider` (safe, but a rule prefers another form).
- `<topic>` is a Ruleset topic slug.

A skill may append one bracketed tag per finding for an external standard it
cites (for example `[WCAG 1.4.1]`). Document that convention under Output Format
if you use it.

### Self-sufficiency

`SKILL.md` is enforceable on its own. Every rule in the Ruleset is a single
sentence a reviewer can hold a line against and call pass or fail without
opening any other file. Rationale, finer detail, and code do **not** live in the
Ruleset.

### Reference files

One `references/<topic>.md` per Ruleset group, named for the group's slug. A
reference file:

- opens with `# <Group> — why` and the line "The rules are in the `<skill>`
  Ruleset (`<topic>` group). This file is the reasoning…";
- carries no rule the Ruleset does not already state — only the *why* and the
  `❌ / ✅` code that makes each rule concrete;
- has at least one `❌ / ✅` pair (prose-only is acceptable only for a group that
  is not about code shape).

Every group in the Ruleset has a file; every file except `worked-example.md` is
named by a group. No orphans, no dangling pointers.

### Worked example

`references/worked-example.md` is required. It is one review pass: a realistic
8–25-line numbered diff that trips several Ruleset groups, followed by the
findings in the exact Output Format, `must-fix` before `consider`, covering at
least three topics.

### Builds-on note

- Name sibling skills in bare backticks (`` `react` ``). Never a path, a URL, or
  an install command.
- State who wins on a conflict, on which axis.
- State the fallback: if a named sibling is not loaded, apply that layer from
  general knowledge and do not block.
- A base skill with no siblings writes only
  `> **Builds on.** Nothing — this is a base skill.`

### How skills compose

- A **base** skill (`core-typescript`, `architecture-and-design`) has no
  framework or UI assumptions.
- A **framework** skill (`react`, `angular`) extends `core-typescript` and
  `architecture-and-design` with one framework's API.
- A **lens** / Review skill (`accessibility`, `test-quality`) composes over UI
  work or test code, deferring framework mechanics to the framework skills and
  design strategy to `architecture-and-design`.

### No tool, vendor, or model names

The skill body names no assistant, model, editor, or installer — no product
names, no `npx …` commands. Skills are model-agnostic. Install instructions live
in the [README](README.md) only.

---

## Budgets and size limits

The token estimate is `characters / 4`. [`bin/check-token-budget.mjs`](bin/check-token-budget.mjs)
enforces it.

| File | Soft (warn) | Hard (fail) |
|---|---|---|
| `SKILL.md` | 3800 tokens | 4300 tokens |
| a `references/*.md` | 1400 tokens | 2000 tokens |

`SKILL.md` is also capped at **500 lines**.

Never raise a budget to make a file fit. Split the group, tighten the prose, or
move detail into a reference file.

---

## Checks

Run both before opening a pull request and paste the output into the PR:

```bash
node bin/check-references.mjs      # frontmatter name matches dir; every references/ pointer resolves; no orphans; worked-example present
node bin/check-token-budget.mjs    # every SKILL.md and references/*.md within budget
```

[`.github/workflows/check-skills.yml`](.github/workflows/check-skills.yml) runs
both on every pull request. A red check blocks merge.

---

## Review process

1. One skill or one change per pull request.
2. The PR description has: a two-line summary, a **Changes** bullet list, a
   **Verification** section quoting the check output, and the generated-with
   footer.
3. A reviewer checks the mechanical contract (the checks cover most of it) and
   then the judgment calls: is every Ruleset rule enforceable from the sentence
   alone? Does each reference file explain rather than restate? Does the
   worked example read like a real review?
4. A change to a base skill is reviewed for its effect on every skill that
   builds on it.

---

## Commit and PR style

- Imperative mood, sentence case, no `type:` prefix
  (`Add web-performance skill`, not `feat: add web-performance skill`).
- One logical change per commit.
- End every commit message with:

  ```
  Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
  ```

- End every pull request description with:

  ```
  🤖 Generated with [Claude Code](https://claude.com/claude-code)
  ```

---

## Licensing

By contributing you agree that your contributions are licensed under
[CC BY 4.0](LICENSE), the license covering the skill content in this repository.
