# Structural Organization and Boundaries — why, and examples

The rules are in the `architecture-and-design` Ruleset (`structure` group). This file is the
reasoning and examples.

## Feature-first layout

Organize code by business feature, not by technical role. Folders such as `/components`, `/services`,
and `/utils` become dumping grounds: unrelated code piles up by file type and every feature reaches
across all of them, so nothing has a boundary.

```text
src/
├── app/                      # App entry point, global providers, routing
├── shared/                   # Cross-cutting UI primitives (Design System) & generic utilities
│   ├── ui/                   # Button, Modal, Input (framework-only)
│   └── lib/                  # Generic helpers (date, math, formatting)
└── features/                 # Self-contained domain modules
    ├── checkout/
    │   ├── api/              # Infrastructure: DTOs, endpoint calls, repositories
    │   ├── model/            # Domain: Types, schemas, business logic, state
    │   ├── ui/               # Presentation: CheckoutForm, PaymentSummary
    │   └── index.ts          # Public API boundary for the feature
    └── user-profile/
```

## The boundary rules, and why

- **One-way flow: `features` import `shared`, `shared` never imports `features`.** A shared module that knows about a feature is no longer shared — it now drags
  that feature into every other consumer.
- **Feature isolation: a feature never imports another feature's internals.** Cross only through `index.ts`, shared state, or routing. A deep import
  (`features/checkout/model/cart.ts` from `features/billing`) couples the two forever and breaks when either refactors.
- **Enforce it with a linter** (`eslint-plugin-boundaries`, Nx module boundaries). A boundary rule that is not enforced is not kept.

```javascript
// .eslintrc.js boundary rule concept
{
  "rules": {
    "boundaries/element-types": [
      2,
      {
        "default": "disallow",
        "rules": [
          { "from": "features", "allow": ["shared", ["features", { "featureName": "${from.featureName}" }]] },
          { "from": "shared", "allow": ["shared"] }
        ]
      }
    ]
  }
}
```
