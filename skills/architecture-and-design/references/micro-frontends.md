# Micro-Frontends — why, and the contract

The rules are in the `architecture-and-design` Ruleset (`micro-frontends` group). This file is the
reasoning.

A micro-frontend splits one app into pieces that are built and deployed on their own, one per team.
It is the frontend form of service decomposition, and it trades build simplicity for team autonomy.

- **Default to a modular monolith:** one build, feature folders with enforced boundaries (`structure`). Most teams never outgrow it; micro-frontends add real cost.
- **Split only when an independent deploy per team is the actual bottleneck.** The split solves an organization problem, not a code problem.
- **Give the shell and each remote a versioned contract:** a mount function, props in, events out. An implicit contract breaks silently on the next deploy.
- **Share the framework and the design system as pinned singletons.** Two framework copies on one page double the bytes and break hooks.
- **Isolate failure:** a remote that fails to load or throws must not blank the shell (`frontend-practices`). One team's bad deploy stays one team's problem.
- **Keep routing and auth in the shell.** Pass identity down. Two systems fighting over the URL and the session becomes a support queue.

Do not use micro-frontends when one team owns the whole app, the app is small or medium, or the UX
must stay tightly coupled across the whole surface.

```ts
// The contract every remote exports
export interface RemoteModule {
  mount(el: HTMLElement, props: RemoteProps): () => void; // returns an unmount function
}
```
