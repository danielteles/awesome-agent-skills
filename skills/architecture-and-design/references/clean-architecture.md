# Clean Architecture on the Frontend — why

The rules are in the `architecture-and-design` Ruleset (`clean-architecture` group). This file is the
reasoning.

Clean architecture keeps core business rules separate from frameworks, UI libraries, and external
infrastructure, so a change to any of those does not reach into the domain.

```text
┌────────────────────────────────────────────────────────┐
│                   UI / PRESENTATION                     │
│         (Components, Templates, Design System)          │
└───────────────────────────┬────────────────────────────┘
                            │ dispatches intents
                            ▼
┌────────────────────────────────────────────────────────┐
│                USE CASES / APPLICATION                  │
│   (State Handlers, Custom Hooks, Application Services)  │
└───────────────────────────┬────────────────────────────┘
                            │ operates on
                            ▼
┌────────────────────────────────────────────────────────┐
│                  DOMAIN CORE (Entities)                 │
│  (Pure Types, Domain Models, Business Validation Rules) │
└───────────────────────────▲────────────────────────────┘
                            │ implements abstractions
                            │ (dependency inverted)
┌───────────────────────────┴────────────────────────────┐
│                 INFRASTRUCTURE / DATA                   │
│    (Axios/Fetch, GraphQL Clients, Storage Adapters)     │
└────────────────────────────────────────────────────────┘
```

| Layer | Contains | Depends on |
|---|---|---|
| Domain core | Pure models, value objects, business rules | Nothing. No framework, no DOM, no network client. |
| Use cases / application | Application flows (`ExecuteCheckoutUseCase`), custom hooks, services | Domain entities and abstract repository interfaces. |
| Presentation (UI) | Components, templates, signals, stores | Use cases. It renders and forwards user actions only. |
| Infrastructure | REST, GraphQL, WebSockets, LocalStorage, IndexedDB | Implements the domain's abstract interfaces (dependency inverted). |

The one rule that makes this hold: **dependencies point inward.** Infrastructure depends on the
domain by implementing its interfaces, never the reverse — so swapping Axios for `fetch`, or REST
for GraphQL, touches one adapter and nothing in the core.
