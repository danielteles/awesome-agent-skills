---
name: architecture-and-design
description: >-
  Architecture and design standards for frontend engineering in TypeScript with
  React, Angular, Vue, or a similar component framework. Covers SOLID, clean
  code, clean architecture, layer boundaries, feature-first structure, design
  patterns, expressive logic, type safety, state management, data fetching,
  forms and validation, resilience, security, testing strategy, domain modeling
  with DDD tactical patterns, micro-frontends, and a review checklist. Use this
  skill when generating a component or module, refactoring frontend code,
  reviewing a pull request, or making an architecture decision. Also use when
  the user says "code review", "review this", "is this well structured", "clean
  architecture", "SOLID", "clean code", "best practices", "design pattern",
  "DDD", "domain-driven design", "bounded context", "aggregate",
  "micro-frontend", "data fetching", "caching", "form validation", "how should I
  structure", or "architecture".
---

# Architecture and Design Principles — Frontend Engineering Skill

This skill sets the architecture standards, design principles, and structure patterns for modern web applications in TypeScript. The principles apply to React, Angular, Vue, and any component-based framework. Use this skill to guide code generation, refactoring, and code review.

Code examples use React and TSX for one concrete syntax. Each principle holds for an Angular template, a Vue single-file component, and similar. Where an example names a framework API, the equivalent concept is noted for the others.

---

## How to Use This Skill

Pick the mode that matches the task. Do the steps in order.

| Mode | Steps |
|---|---|
| **Generate** — write a new component, hook, or module | 1. Apply Sections 1 to 4 and Section 8 as you write. 2. Model async state as a discriminated union (Section 7.2). 3. Validate external data at the boundary (Section 4). 4. Run the Section 15 checklist. Fix each fail before you hand off. |
| **Review** — check a pull request or a diff | 1. Run the Section 15 checklist against the diff. 2. Write one finding per fail, in the Output Format below. 3. Order the findings: `must-fix` first, then `consider`. 4. If nothing fails, say so in one line. Do not invent findings. 5. Flag the problem and suggest the fix. Do not rewrite the author's code in silence. |
| **Refactor** — restructure existing code | 1. Change the structure, keep the behavior. 2. Lean on Section 2, Section 3, and Section 8. 3. Make one kind of change per commit. 4. Keep the tests green (Section 11). |

### Output Format

Write one finding per line:

```
<severity> · Section <n> · <file>:<line> — <what is wrong>. <the fix as an action>.
```

- `<severity>` is `must-fix` (breaks a rule in this skill) or `consider` (safe, but a rule prefers another form).
- `<n>` is a section number from this skill. Cite only numbers that exist here.

### Rules for Every Mode

- Cite a section number when you enforce a rule.
- State the reason, not only the rule. "This re-renders the whole tree" beats "move state down".
- A principle serves the code. When two principles conflict, pick the one that makes the code simpler to read and change, and say why.
- When the task is a decision, not a diff, weigh the options against Sections 1, 5, 6, 8, and 13, and record the choice as an ADR in the repo (context, options, decision, consequences).

---

## Rules at a Glance

| Section | Rule |
|---|---|
| 1 | Apply SOLID: one reason to change, compose instead of adding flags, depend on abstractions. |
| 2 | Clean code: intent-revealing names, small functions, no dead code, immutable data, loud failures. |
| 3 | Expressive logic: no redundant booleans, guard clauses over nesting, name a complex condition, a dispatch table over an `if/else` ladder. |
| 4 | Type safety: no `any`, discriminated unions over optional bags, illegal states unrepresentable, validate external data at the boundary. |
| 5 | Clean architecture: the domain core has zero framework imports. Dependencies point inward. |
| 6 | Structure: feature-first folders. `features` import `shared`, never the reverse. Cross-feature only through `index.ts`. |
| 7 | Patterns: hide an external contract behind an adapter. Model async state as a discriminated union. |
| 8 | State and data fetching: colocate, derive instead of store, use a cache library keyed by input, fetch at the point of use. |
| 9 | Frontend: computation out of the template, model every async state, stable keys, narrow effects, error boundaries, cancel stale async, accessibility. |
| 10 | Security: no unsanitized HTML, no secrets in the bundle, guard external links and redirects, deliberate token storage. |
| 11 | Testing: unit-test the domain, test components by role and behavior, mock at the network boundary. |
| 12 | DDD tactical: one ubiquitous language, value objects immutable, reach an aggregate through its root, domain events in the past tense. |
| 13 | Micro-frontends: default to a modular monolith; split only for team deploy autonomy, behind a versioned shell/remote contract. |
| 14 | Forms: local form state, one shared validation schema, derive validity, re-validate on the server. |

---

## 1. Applied SOLID Principles in Frontend Design

| Principle | Apply it by | Why |
|---|---|---|
| **SRP** — one reason to change | Splitting rendering from data fetching, state transitions, and domain math into hooks, services, and pure functions. | A component with one job is testable and safe to change. |
| **OCP** — open to extend, closed to modify | Composing with `children`, slots, or render props. Never a boolean flag per variant. | A new variant stops editing the core component. |
| **LSP** — a subtype substitutes for its base | Making a custom primitive or a mock honor the full interface its consumers expect. | A partial implementation breaks callers that rely on the contract. |
| **ISP** — depend only on what you use | Passing the exact props a component reads, not a whole domain entity. | A narrow prop list decouples the component from the model. |
| **DIP** — depend on abstractions | Injecting an interface, an abstract class, an injection token, or a context instead of a concrete client, SDK, or `localStorage`. | The business logic and UI stop depending on a vendor. |

### 1.1 SRP

```ts
// ❌ Fetches, transforms, handles errors, and renders in one component
export function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then((res) => res.json())
      .then((data) => setUser({ ...data, fullName: `${data.firstName} ${data.lastName}` }));
  }, [userId]);

  if (!user) return <div>Loading...</div>;
  return <div>{user.fullName}</div>;
}

// ✅ Business logic and data fetching isolated from rendering
export function UserProfile({ userId }: { userId: string }) {
  const { user, isLoading } = useUser(userId);

  if (isLoading) return <SkeletonLoader />;
  if (!user) return <EmptyState />;

  return <UserCard avatarUrl={user.avatarUrl} name={user.fullName} />;
}
```

### 1.2 OCP

```tsx
// ❌ A new action edits the card core
interface CardProps {
  title: string;
  showShareButton?: boolean;
  showLikeButton?: boolean;
  showBookmarkButton?: boolean;
}

// ✅ The card accepts composed actions
interface CardProps {
  title: string;
  actions?: React.ReactNode;
}

export function Card({ title, actions }: CardProps) {
  return (
    <div className="card">
      <h2>{title}</h2>
      {actions && <div className="card-actions">{actions}</div>}
    </div>
  );
}
```

### 1.3 LSP

```ts
// ✅ The custom input fulfills the whole standard input contract
interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function CustomInput({ label, error, ...restProps }: CustomInputProps) {
  return (
    <label>
      <span>{label}</span>
      <input {...restProps} />
      {error && <span role="alert">{error}</span>}
    </label>
  );
}
```

### 1.4 ISP

```tsx
// ❌ Needs user.name, receives the whole entity
function UserBadge({ user }: { user: UserEntity }) {
  return <span>{user.name}</span>;
}

// ✅ Depends only on the fields it reads
function UserBadge({ name, avatarUrl }: { name: string; avatarUrl?: string }) {
  return (
    <div className="user-badge">
      {avatarUrl && <img src={avatarUrl} alt="" />}
      <span>{name}</span>
    </div>
  );
}
```

### 1.5 DIP

```ts
// ❌ Depends on concrete localStorage and global fetch
export function AnalyticsTracker() {
  const token = localStorage.getItem('auth_token');
  fetch('/api/analytics', { headers: { Authorization: token } });
}

// ✅ Depends on an abstract interface, injected
export interface IAnalyticsService {
  trackEvent(event: string, payload?: Record<string, unknown>): void;
}

export class PostHogAnalyticsService implements IAnalyticsService {
  trackEvent(event: string, payload?: Record<string, unknown>) {
    // Concrete vendor implementation
  }
}
```

---

## 2. Clean Code Practices

| Rule | Why |
|---|---|
| Name a boolean with `is` / `has` / `should` / `can`. Name a function with a verb. | The name carries the type and the effect. |
| No unclear abbreviations. One term for one concept across the codebase. | `cfg` / `usr` and `user` / `account` drift cost the reader time. |
| Keep a function short enough to read without a scroll. Pass an options object past three parameters. | A long function and positional args hide what it does. |
| No boolean flag parameter that switches behavior. Write two functions. | A flag couples two behaviors and two call sites. |
| A comment explains why, not what. | The code already says what. |
| Do not mutate a parameter, a prop, or state in place. Build a new value. | A shared mutation causes bugs far from the change. |
| Handle an error or let it rise. Never an empty `catch`. | A silent failure cannot be debugged. |
| Delete dead code: commented blocks, unused exports, unreachable branches. | Version control keeps the history. |

### Two functions, not a flag

```ts
// ❌ The flag hides two behaviors
function save(data: Data, isDraft: boolean) { /* ... */ }

// ✅ Two clear entry points
function saveDraft(data: Data) { /* ... */ }
function publish(data: Data) { /* ... */ }
```

### Comment the reason

```ts
// ❌ Repeats the code
// increment index by one
index += 1;

// ✅ Explains the reason
// The API pages from 1, not 0.
index += 1;
```

### Return a new value

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

### Fail loud

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

---

## 3. Expressive Logic

Logic must state its intent. These patterns appear often in pull request reviews.

| Rule | Why |
|---|---|
| Never map a truthy test to `true : false`, or `if (c) return true; else return false`. | The condition is already the value. |
| Do not compare against a boolean literal (`=== true`, `!== false`). | It adds a redundant operation. |
| Replace `x ? x : y` with `x \|\| y`, and a null check with `x ?? y`. | Shorter, and `??` keeps a valid `0` or `''`. |
| Use a guard clause. Return early instead of nesting. | Flat code scans top to bottom. |
| Give a name to a long boolean chain: a variable or a predicate function. | The name states intent the operators hide. |
| Use `?.` and `??` instead of a manual `&&` null chain. | Fewer tokens, same safety. |
| State a condition in the positive. No double negative. | `!isNotReady` takes two reads. |
| Give a magic number or string a named constant. | `900000` does not say "15 minutes". |
| Replace an `if/else if` ladder on one value with a typed lookup or an exhaustive `switch`. | The ladder edits the same function for each new case (breaks OCP, Section 1). |

### Redundant booleans

```ts
// ❌ Redundant
const isActive = status === 'active' ? true : false;
const hasAccess = Boolean(user.permissions.length > 0 ? true : false);

// ✅ Direct
const isActive = status === 'active';
const hasAccess = user.permissions.length > 0;

// ❌ Four lines for one expression
function canSubmit(form: Form): boolean {
  if (form.isValid && !form.isPending) {
    return true;
  }
  return false;
}

// ✅ Return the expression
function canSubmit(form: Form): boolean {
  return form.isValid && !form.isPending;
}
```

### Default value

```ts
// ❌
const label = props.label ? props.label : 'Untitled';
const count = data.count !== null && data.count !== undefined ? data.count : 0;

// ✅
const label = props.label || 'Untitled';
const count = data.count ?? 0;
```

### Guard clauses

```ts
// ❌ Nested, hard to scan
function getDiscount(user: User): number {
  if (user.isActive) {
    if (user.plan === 'pro') {
      return 0.2;
    } else {
      return 0.1;
    }
  } else {
    return 0;
  }
}

// ✅ Early returns, flat and linear
function getDiscount(user: User): number {
  if (!user.isActive) return 0;
  if (user.plan === 'pro') return 0.2;
  return 0.1;
}
```

### Name a complex condition

```tsx
// ❌ Decode the condition inline
if (user.age >= 18 && user.country === 'BR' && !user.isBlocked && user.hasVerifiedEmail) {
  allowCheckout();
}

// ✅ The name states the intent
const canCheckout =
  user.age >= 18 &&
  user.country === 'BR' &&
  !user.isBlocked &&
  user.hasVerifiedEmail;

if (canCheckout) allowCheckout();
```

### Name magic values

```ts
// ❌ What is 3? What is 900000?
if (retries > 3) abort();
setTimeout(refresh, 900000);

// ✅ Named constants
const MAX_RETRIES = 3;
const REFRESH_INTERVAL_MS = 15 * 60 * 1000;

if (retries > MAX_RETRIES) abort();
setTimeout(refresh, REFRESH_INTERVAL_MS);
```

### Lookup instead of an if/else ladder

```ts
// ❌ The ladder grows with every new mode
submit(): void {
  this.showValidation.set(true);

  if (this.hasFieldError()) return;
  if (this.isRevisionMode() && (this.hasMissingFields() || this.hasConflictError())) return;

  const mode = this.editorMode();
  if (mode === 'CREATE_DRAFT') {
    this.createDraft();
  } else if (mode === 'PUBLISH_DOC') {
    this.publishDoc();
  } else if (mode === 'ARCHIVE_DOC') {
    this.archiveDoc();
  }
}

// ✅ A typed lookup maps each mode to its handler
private readonly submitHandlers: Record<EditorMode, () => void> = {
  CREATE_DRAFT: () => this.createDraft(),
  PUBLISH_DOC: () => this.publishDoc(),
  ARCHIVE_DOC: () => this.archiveDoc(),
};

submit(): void {
  this.showValidation.set(true);

  if (this.hasFieldError()) return;
  if (this.isRevisionMode() && (this.hasMissingFields() || this.hasConflictError())) return;

  this.submitHandlers[this.editorMode()]();
}
```

`Record<EditorMode, () => void>` forces a handler for every union member, so a missing case fails to compile, and a new mode adds one entry instead of editing the `submit` flow. Use a `switch` with an `assertNever` default when a branch needs local variables or fall-through:

```ts
function runMode(mode: EditorMode): void {
  switch (mode) {
    case 'CREATE_DRAFT':
      return createDraft();
    case 'PUBLISH_DOC':
      return publishDoc();
    case 'ARCHIVE_DOC':
      return archiveDoc();
    default:
      return assertNever(mode);
  }
}

function assertNever(value: never): never {
  throw new Error(`Unhandled mode: ${value}`);
}
```

---

## 4. Type Safety as Design

A type is a design tool, not paperwork. A precise type stops a class of bugs before the code runs. For the syntax, see core-typescript Sections 2 to 5.

| Rule | Why |
|---|---|
| No `any`. Type an unknown input as `unknown` and narrow it. Treat `as` as a smell. | `any` disables checking; a cast tells the compiler to stop. |
| Model mutually exclusive states as a discriminated union, not an object of optional fields. | An optional-field bag allows states that cannot exist. |
| Make illegal values unrepresentable: `readonly`, `as const`, a branded id type. | The compiler then rejects the bad value. |
| Validate external data with a schema at the adapter, then map to the domain model. | A type on a network response is a promise, not a fact. |

### Narrow from `unknown`

```ts
// ❌ `any` spreads and hides real errors
function parse(input: any) {
  return input.data.items.map((i) => i.value);
}

// ✅ `unknown` forces a check before use
function parse(input: unknown): number[] {
  if (!isPayload(input)) throw new Error('Unexpected payload');
  return input.data.items.map((item) => item.value);
}
```

### Discriminated union, not an optional bag

```ts
// ❌ Allows a paid order with no payment, or a draft with a shipped date
interface Order {
  status?: 'draft' | 'paid' | 'shipped';
  paymentId?: string;
  shippedAt?: Date;
}

// ✅ Each variant carries exactly its own fields
type Order =
  | { status: 'draft' }
  | { status: 'paid'; paymentId: string }
  | { status: 'shipped'; paymentId: string; shippedAt: Date };
```

### Illegal values unrepresentable

```ts
// ✅ A branded id cannot be swapped with another string id
type UserId = string & { readonly __brand: 'UserId' };
type ProductId = string & { readonly __brand: 'ProductId' };

function getCart(userId: UserId): Cart { /* ... */ }

getCart(productId); // compile error, even though both are strings
```

### Validate at the boundary

```ts
// Infrastructure adapter — the only place that meets raw data
const ProductDto = z.object({
  item_id: z.string(),
  item_name: z.string(),
  unit_price: z.number(),
});

export class RestProductRepository implements ProductRepository {
  async getById(id: ProductId): Promise<Product> {
    const raw = await fetch(`/api/v1/items/${id}`).then((res) => res.json());
    const dto = ProductDto.parse(raw); // throws on an unexpected shape

    return {
      id: dto.item_id as ProductId,
      title: dto.item_name,
      priceInCents: Math.round(dto.unit_price * 100),
    };
  }
}
```

---

## 5. Clean Architecture on the Frontend

Clean architecture keeps core business rules separate from frameworks, UI libraries, and external infrastructure.

```text
┌────────────────────────────────────────────────────────┐
│                   UI / PRESENTATION                    │
│        (Components, Templates, Design System)          │
└───────────────────────────┬────────────────────────────┘
                            │ Dispatches Intents
                            ▼
┌────────────────────────────────────────────────────────┐
│                   USE CASES / APPLICATION              │
│      (State Handlers, Custom Hooks, Application Services)│
└───────────────────────────┬────────────────────────────┘
                            │ Operates On
                            ▼
┌────────────────────────────────────────────────────────┐
│                   DOMAIN CORE (Entities)               │
│     (Pure Types, Domain Models, Business Validation Rules)│
└───────────────────────────▲────────────────────────────┘
                            │ Implements Abstractions
                            │ (Inverted Dependency)
┌───────────────────────────┴────────────────────────────┐
│                 INFRASTRUCTURE / DATA                  │
│   (Axios/Fetch, GraphQL Clients, Storage Adapters)     │
└───────────────────────────┘
```

| Layer | Contains | Depends on |
|---|---|---|
| Domain core | Pure models, value objects, business rules | Nothing. No framework, no DOM, no network client. |
| Use cases / application | Application flows (`ExecuteCheckoutUseCase`), custom hooks, services | Domain entities and abstract repository interfaces. |
| Presentation (UI) | Components, templates, signals, stores | Use cases. It renders and forwards user actions only. |
| Infrastructure | REST, GraphQL, WebSockets, LocalStorage, IndexedDB | Implements the domain's abstract interfaces (dependency inverted). |

---

## 6. Structural Organization and Boundaries

### 6.1 Feature-First Directory Layout
Organize code by business feature, not by technical role. Folders such as `/components`, `/services`, and `/utils` become dumping grounds and lead to tangled code.

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

### 6.2 Strict Dependency Rules and Boundaries

| Rule | Why |
|---|---|
| One-way flow: `features` import `shared`. `shared` never imports `features`. | A shared module that knows a feature is no longer shared. |
| Feature isolation: a feature never imports another feature's internals. Cross only through `index.ts`, shared state, or routing. | A deep import couples two features forever. |
| Enforce it with a linter (`eslint-plugin-boundaries`, Nx module boundaries). | A rule that is not enforced is a rule that is not kept. |

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

---

## 7. Design Patterns for Frontend Engineering

| Pattern | Use it to | Shape |
|---|---|---|
| Adapter / Repository | Hide a third-party library, SDK, or raw API response | A domain model, a repository interface, and an infrastructure class that translates between them. |
| Discriminated state | Replace loose booleans (`isLoading`, `isError`, `hasData`) | A union with a `status` discriminant, one variant per state. |

### 7.1 Adapter / Repository

```ts
// 1. Domain Model
export interface Product {
  id: string;
  title: string;
  priceInCents: number;
}

// 2. Repository Interface
export interface ProductRepository {
  getById(id: string): Promise<Product>;
}

// 3. Infrastructure Adapter — translates the external schema to the domain model
export class RestProductRepository implements ProductRepository {
  async getById(id: string): Promise<Product> {
    const rawData = await fetch(`/api/v1/items/${id}`).then((res) => res.json());

    return {
      id: rawData.item_id,
      title: rawData.item_name,
      priceInCents: Math.round(rawData.unit_price * 100),
    };
  }
}
```

### 7.2 Discriminated State

```ts
// ❌ Allows impossible states (isLoading true AND data set AND error set)
interface FetchState<T> {
  isLoading: boolean;
  error?: Error;
  data?: T;
}

// ✅ Discriminated union
export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'pending' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };
```

---

## 8. State Management and Data Fetching

Most state bugs come from too much state in the wrong place. Keep the state small and near its use.

| Rule | Why |
|---|---|
| Colocate state in the component that uses it. Lift only when a second component needs it. | State too high re-renders a large tree and couples unrelated parts. |
| Derive a value on render. Do not store what you can compute. | A stored copy goes stale. |
| Normalize a server collection: store each entity once, keyed by id. | Three copies means three places to update. |
| Match the tool to the state kind (table below). | Each kind has a home that handles its lifecycle. |
| Keep context for low-frequency values. Put fast-changing state in a store with selectors. | A changing context value re-renders every consumer. |

| State kind | Home |
|---|---|
| Server data | A server-cache library (TanStack Query, an RxJS service). |
| URL state (filters, tab, pagination) | Query params. Shareable, survives a reload. |
| Global client state (theme, auth session) | A small store or a context. |
| Local UI state (open, hovered, input draft) | The component. |

### Derive, do not store

```ts
// ❌ `fullName` can fall out of sync with first / last
const [fullName, setFullName] = useState(`${first} ${last}`);

// ✅ Compute on render
const fullName = `${first} ${last}`;
```

### Server state: fetching and caching

Server data is not component state. It has an owner elsewhere, and the client holds a cached copy.

| Rule | Why |
|---|---|
| Use a server-cache library (TanStack Query, RTK Query, an Angular resource). Do not fetch in an effect into local state. | The library handles caching, dedup, refetch, and stale state that hand-rolled code gets wrong. |
| Give each request a stable, serializable cache key derived from its inputs. | The key is how the cache dedups, invalidates, and refetches. |
| Fetch at the point of use. Do not thread server data through props from a far ancestor. | Prop-drilled server data goes stale and couples the tree. |
| Load independent data in parallel. A child that fetches only after its parent resolved is a waterfall. | Sequential requests add their latencies. |
| Update the cache from the mutation response. Use an optimistic update only with a rollback path. | An optimistic update with no rollback shows a lie after a failed write. |
| Set an explicit stale time and retry policy per query type. | The right value for a price is wrong for a dashboard. |

```ts
// ❌ Fetch in an effect, store in local state: no cache, no dedup, races on prop change
const [user, setUser] = useState<User>();
useEffect(() => {
  fetch(`/api/users/${id}`).then((r) => r.json()).then(setUser);
}, [id]);

// ✅ A cache library, keyed by input
const { data: user, isPending, error } = useQuery({
  queryKey: ['user', id],
  queryFn: () => api.getUser(id),
  staleTime: 60_000,
});
```

---

## 9. Frontend Best Practices

| Rule | Why |
|---|---|
| Compute values before the return. Keep filters, maps, and chains out of the template. | Template logic reruns on every render and hides intent. Angular: a field or pure pipe. Vue: a `computed`. |
| Model every async state: loading, empty, error, success. Use the union from Section 7.2. | The success-only path leaves the UI stuck on a failure. |
| Give a list item a stable id `key`. Never the array index for a list that reorders. | An index key reuses the wrong DOM node and state. |
| One effect per concern. List every dependency. Prefer a derived value or an event handler. | A stacked effect with a silenced linter is a bug source. |
| Put server, URL, global, and local state each in its tier (Section 8). | One misplaced tier is a class of state bug. |
| Use a semantic element before a `div` with a handler. Label every input and icon-only control. | Assistive tech and the keyboard depend on semantics. |
| Wrap each independent region in an error handler with its own fallback. | One handler at the root turns a small failure into a blank page. React boundary, Angular `ErrorHandler`, Vue `onErrorCaptured`. |
| Cancel or ignore a stale async result with an `AbortController` or an ignore flag. | A late response overwrites newer data. |

### Computation out of the template

```tsx
// ❌ Computation inside the return
return <p>{items.filter((i) => i.active).map((i) => i.name).join(', ')}</p>;

// ✅ Compute first, render second
const activeNames = items.filter((item) => item.active).map((item) => item.name);
return <p>{activeNames.join(', ')}</p>;
```

### Cancel stale async work

```tsx
useEffect(() => {
  const controller = new AbortController();

  fetchResults(query, { signal: controller.signal })
    .then(setResults)
    .catch((error) => {
      if (error.name !== 'AbortError') throw error;
    });

  return () => controller.abort();
}, [query]);
```

---

## 10. Security by Design

The browser runs your code next to the user's session. A small gap becomes account access.

| Rule | Why |
|---|---|
| Never build HTML from untrusted input. Sanitize with DOMPurify. Avoid `dangerouslySetInnerHTML` (React), `[innerHTML]` (Angular), `v-html` (Vue). | Injected markup runs as script. |
| Keep secrets out of the bundle. A third-party key lives on a server. | Everything in the frontend build is public. |
| Add `rel="noopener noreferrer"` to every `target="_blank"` link. | The new tab can otherwise script the opener. |
| Validate a redirect URL from a query param against an allowlist. | An open redirect helps phishing. |
| Choose token storage on purpose. Write down the trade-off. | `localStorage` is readable by any XSS. An httpOnly cookie is not. |
| Keep the framework's default text escaping. Any bypass needs a review. | React, Angular, and Vue escape interpolated text. |

---

## 11. Testing Strategy by Layer

| Layer | Test it by | Why |
|---|---|---|
| Domain and use cases | Fast unit tests on plain functions, no DOM or network. | This is where edge-case coverage pays off most. |
| Components | Querying by role and label; asserting on what the user sees. | A behavior test survives a refactor. |
| Network | Mocking HTTP at the boundary (MSW), not by replacing modules. | The test then exercises the real adapter and mapping code. |

Use a snapshot only for small, stable output. A large snapshot breaks on every change and no one reads the diff.

### Test behavior, not internals

```ts
// ❌ Couples the test to the implementation
expect(wrapper.state('isOpen')).toBe(true);

// ✅ Asserts on observable behavior
expect(screen.getByRole('dialog', { name: 'Edit profile' })).toBeVisible();
```

---

## 12. Domain Modeling with DDD Tactical Patterns

DDD tactical patterns name the parts of the domain core (Section 5). Use the words the domain experts use.

| Pattern | What it is | In this codebase |
|---|---|---|
| Ubiquitous language | One shared name for a concept, in code, tests, and conversation | A `Cart` is `Cart` everywhere. Not `Basket` in the UI and `Order` in the API layer. |
| Entity | An object with an identity that persists through change | A branded `UserId`. Two users with the same fields are still different users. |
| Value object | An immutable object defined only by its fields | `Money`, `DateRange`, `Address`. No id. Compare by value. Build a new one to change it. |
| Aggregate | A cluster of objects with one root and one invariant boundary | `Cart` is the root; a `CartLine` is reachable only through it. |
| Domain event | A record that something happened, named in the past tense | `OrderPlaced`, `PaymentFailed`. The app publishes it; features react without a direct call. |
| Bounded context | A boundary inside which one model holds | A `feature/` folder (Section 6). `checkout` and `billing` can each have a different `Customer`. |
| Anti-corruption layer | A translation layer that keeps an external model out of the domain | The adapter / repository (Section 7.1). |

| Rule | Why |
|---|---|
| Keep entities and value objects in the feature's `model/`, free of framework and network code. | They are the domain core (Section 5). |
| Make a value object immutable. Return a new instance to change it. | Shared mutation of a value object corrupts every holder. |
| Reach an aggregate's inner parts only through its root. | The root enforces the invariant. A loose inner entity can break it. |
| Name a domain event in the past tense and treat it as a fact. | An event is history. It does not command; each consumer decides what to do. |
| Do not share one model across two bounded contexts. Translate at the edge. | A model that serves two contexts fits neither and couples them. |

```ts
// Value object: immutable, compared by value, no id
class Money {
  private constructor(readonly cents: number, readonly currency: 'USD' | 'EUR') {}

  static of(cents: number, currency: 'USD' | 'EUR'): Money {
    return new Money(cents, currency);
  }

  add(other: Money): Money {
    if (other.currency !== this.currency) throw new Error('currency mismatch');
    return new Money(this.cents + other.cents, this.currency);
  }
}

// Aggregate: Cart is the root; a CartLine is reached only through it
class Cart {
  private constructor(readonly id: CartId, private readonly lines: readonly CartLine[]) {}

  addLine(product: ProductId, quantity: number): Cart {
    // the root enforces the invariant: no duplicate product, quantity > 0
    return new Cart(this.id, [...this.lines, CartLine.of(product, quantity)]);
  }

  get total(): Money {
    return this.lines.reduce((sum, line) => sum.add(line.subtotal), Money.of(0, 'USD'));
  }
}
```

---

## 13. Micro-Frontends

A micro-frontend splits one app into pieces that are built and deployed on their own, one per team. It is the frontend form of service decomposition. It trades build simplicity for team autonomy.

| Rule | Why |
|---|---|
| Default to a modular monolith: one build, feature folders with enforced boundaries (Section 6). | Most teams never outgrow it. Micro-frontends add real cost. |
| Split only when an independent deploy per team is the actual bottleneck. | The split solves an organization problem, not a code problem. |
| Give the shell and each remote a versioned contract: a mount function, props in, events out. | An implicit contract breaks silently on the next deploy. |
| Share the framework and the design system as pinned singletons. | Two framework copies on one page double the bytes and break hooks. |
| Isolate failure: a remote that fails to load or throws must not blank the shell (Section 9). | One team's bad deploy stays one team's problem. |
| Keep routing and auth in the shell. Pass identity down. | Two systems fighting over the URL and the session becomes a support queue. |

Do not use micro-frontends when one team owns the whole app, the app is small or medium, or the UX must stay tightly coupled across the whole surface.

```ts
// The contract every remote exports
export interface RemoteModule {
  mount(el: HTMLElement, props: RemoteProps): () => void; // returns an unmount function
}
```

---

## 14. Forms and Validation

A form bundles three concerns: draft state, validation, and submission. Keep them separate and put each where it belongs.

| Rule | Why |
|---|---|
| Keep draft state local to the form, or in a form library. Do not lift a draft into global state. | A draft is local UI state (Section 8). A global draft leaks between screens. |
| Define the validation schema once, next to the domain model. Reuse it on the client and the server. | Two hand-written rule sets drift. The schema is the single source. |
| Validate on the client for feedback. Re-validate the same schema on the server for trust. | The client check is a convenience. The network is not a boundary you control (Section 4). |
| Derive `isValid`, `isDirty`, and per-field errors from the form state. Do not store them. | A stored flag falls out of sync with the values (Section 8). |
| Use uncontrolled inputs with a form library for a large form. Use a controlled input when its value drives other UI. | Controlling every keystroke re-renders the whole form. |
| Map a server validation error back onto the field it belongs to. | A generic "submit failed" makes the user hunt for the problem. |
| Disable submit while a submit is in flight. Keep the entered values on failure. | A double submit and a wiped form are the two classic form bugs. |

```ts
// One schema, next to the domain model, reused on both sides
const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12),
});
type SignupInput = z.infer<typeof SignupSchema>;

// Client: validate for feedback
const form = useForm<SignupInput>({ resolver: zodResolver(SignupSchema) });

// Server: re-validate the same schema before the data reaches the domain
export function handleSignup(raw: unknown) {
  const input = SignupSchema.parse(raw); // throws on bad input
  // ...
}
```

---

## 15. Code Review Checklist

Run this checklist before you approve a change or finish a generated component. This step is not optional. Name the section number for each item that fails.

Make sure that:

- [ ] **No leakage:** framework imports (React, Angular, Vue) have not entered domain entities or pure calculation functions.
- [ ] **Boundary compliance:** a feature does not import another feature's internal files. It uses the public entry point (`index.ts`).
- [ ] **Abstractions over concretions:** high-risk integrations (payment gateways, analytics, storage, raw APIs) sit behind an interface adapter.
- [ ] **Composition first:** component variability comes from slots and `children`, not from many boolean props.
- [ ] **Expressive logic:** no redundant `true : false`, no comparison against a boolean literal, no deep nesting where a guard clause fits.
- [ ] **Dispatch over ladders:** an `if/else if` chain on one enum-like value uses a typed lookup or an exhaustive `switch`.
- [ ] **Named values:** magic numbers and magic strings have a named constant.
- [ ] **Immutability:** no code mutates a prop, a parameter, or state in place.
- [ ] **No `any`:** an unknown input is typed `unknown` and narrowed. Every `as` cast has a clear reason.
- [ ] **Runtime validation:** data from the network is parsed against a schema at the adapter, not trusted by type alone.
- [ ] **Derived state:** no state holds a value that can be computed from props or other state.
- [ ] **State placement:** server data, URL state, global state, and local UI state each sit in the right tier.
- [ ] **Error boundaries:** an independent region has its own boundary and fallback, not only the app root.
- [ ] **Stale async:** an effect that fetches cancels or ignores an out-of-date response.
- [ ] **Security:** no unsanitized HTML injection, no secrets in the bundle, `rel="noopener"` on new-tab links, redirect targets validated.
- [ ] **Tests match the layer:** domain logic in unit tests, components tested by role and visible behavior, network mocked at the boundary.
- [ ] **Server state:** data is fetched through a cache library keyed by its inputs, not fetched in an effect into local state; independent requests do not run as a waterfall.
- [ ] **Forms:** one validation schema shared by client and server; validity and errors derived, not stored; entered values survive a failed submit.
- [ ] **Domain language:** one name per concept across UI, state, and API layers; an aggregate's inner parts are reached only through its root.
- [ ] **Split boundaries:** if the app is a micro-frontend, the shell/remote contract is versioned and a remote failure does not blank the shell.

---

## 16. Worked Example: A Review Pass

Input diff:

```tsx
// PriceTag.tsx — proposed in a pull request
1  export function PriceTag({ product }: { product: ProductEntity }) {
2    const [price, setPrice] = useState<number | null>(null);
3
4    useEffect(() => {
5      fetch(`/api/products/${product.id}/price`)
6        .then((res) => res.json())
7        .then((data) => setPrice(data.amount / 100));
8    }, [product.id]);
9
10   const isFree = price === 0 ? true : false;
11
12   if (price === null) {
13     return <span>Loading...</span>;
14   } else {
15     return <span>{isFree ? 'Free' : `$${price}`}</span>;
16   }
17 }
```

Output, in the format from How to Use This Skill:

```
must-fix · Section 1.4 · PriceTag.tsx:1 — the prop takes a full `ProductEntity` but reads only `product.id`. Take `productId: ProductId`.
must-fix · Section 1.1 · PriceTag.tsx:4 — the component fetches, parses, and renders. Move the fetch to a `useProductPrice(productId)` hook.
must-fix · Section 8 · PriceTag.tsx:4 — server data is fetched in an effect into local state: no cache, no dedup, and a race on `product.id` change. Use a cache library keyed by `['product-price', productId]`.
must-fix · Section 4 · PriceTag.tsx:7 — `data.amount` is read from an unvalidated response. Parse it with a schema in the adapter (Section 4).
must-fix · Section 9 · PriceTag.tsx:12 — no error state; a failed fetch stays on "Loading..." forever. Model async state as a union (Section 7.2).
must-fix · Section 9 · PriceTag.tsx:4 — the effect does not cancel. Add an `AbortController`.
consider · Section 3 · PriceTag.tsx:10 — `price === 0 ? true : false` is redundant. Write `price === 0`.
consider · Section 3 · PriceTag.tsx:12 — both branches return. Drop the `else` and use a guard clause.
consider · Section 3 · PriceTag.tsx:7 — `/ 100` is a magic value. Return cents from the hook and format at the edge.
```

---

## Limits

This skill covers frontend architecture and design. It does not cover:

- Backend, database, or infrastructure design.
- Distributed system architecture: microservices, service decomposition, event-driven backends, message brokers, sagas, distributed consistency. Section 12 covers DDD tactical patterns inside one app; strategic and cross-service concerns belong in a system-architecture skill. Section 13 covers micro-frontends only.
- Styling systems, design tokens, and CSS architecture beyond the note in Section 9.
- Deep performance profiling, bundle analysis, and Core Web Vitals tuning.
- Framework-specific rules: Rules of Hooks, `useMemo` and `useCallback` policy, Angular change detection and signals, Vue reactivity caveats. These live in the framework skills (see References).

This skill states principles. It is not a substitute for reading the code and understanding the domain.

---

## References

This skill is the framework-neutral architecture layer. It composes with:

- **`core-typescript.md`** — the base skill. Language-level TypeScript conventions: compiler strictness, safe typing, narrowing, utility types, `assertNever`. On a shared topic such as discriminated unions or branded ids, this skill decides the design and core-typescript decides the syntax.
- **`react.md`** — extends this skill with React specifics: Rules of Hooks, effect dependencies, memoization policy, `Suspense` and error boundaries, TSX conventions.
- **`angular.md`** — extends this skill with Angular specifics: standalone components, signals, `OnPush`, dependency injection, RxJS patterns.

When you work in a React or Angular codebase, apply this skill together with the matching framework skill. The framework skill wins on a direct conflict.
