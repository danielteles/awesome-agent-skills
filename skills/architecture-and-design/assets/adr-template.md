<!--
  Architecture Decision Record template. Referenced from the `architecture-and-design`
  SKILL.md (Rules for Every Mode). Copy this file to your repo's ADR directory as
  `NNNN-short-title.md`, fill every section, and delete these comments.

  An ADR records one decision that is expensive to reverse: a state-management
  approach, a module boundary, a rendering strategy, a shared-component contract.
  It is not for reversible, local choices.
-->

# ADR-NNNN: <short decision title, imperative — "Adopt a query cache for server state">

- **Status:** Proposed | Accepted | Deprecated | Superseded by [ADR-XXXX](xxxx-title.md)
- **Date:** YYYY-MM-DD
- **Deciders:** <names or roles>
- **Tags:** <area — e.g. state-management, routing, boundaries, rendering>

## Context

<The situation that forces a decision. State the problem, the constraints (team size, timeline,
the existing system, non-negotiable requirements), and what a good outcome looks like. Link the
issue or design discussion. Call out any assumption that, if wrong, would change the decision.>

## Options considered

### Option 1 — <name>

<One paragraph: what it is and how it would work here.>

- **Pros:** <…>
- **Cons:** <…>
- **Cost / risk:** <implementation effort, migration, operational cost, lock-in>

### Option 2 — <name>

<As above.>

### Option 3 — do nothing / defer

<Always list this. What breaks, degrades, or gets more expensive if the decision is postponed.>

## Decision

<The chosen option in one active-voice sentence: "We will …". Then the reasoning: which
`architecture-and-design` principles drove it (`solid`, `clean-architecture`, `structure`,
`state-and-data`, `micro-frontends`), which option each ruled out, and why the trade-offs are
acceptable in this context.>

## Consequences

- **Positive:** <what becomes simpler, safer, or faster to change>
- **Negative / accepted trade-offs:** <what becomes harder or is now constrained; new obligations>
- **Follow-up:** <migrations, deprecations, a codemod, documentation, and a date to revisit>

## Compliance

<How the team will know the decision is being followed — a lint rule, an architecture fitness
function, a boundary/dependency test, a review-checklist item. If there is no automatic check,
say so and name who owns the manual check.>
