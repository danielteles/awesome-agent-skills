# Applied SOLID — why, and examples

The rules are in the `architecture-and-design` Ruleset (`solid` group).

| Principle | Apply it by | Why |
|---|---|---|
| **SRP** — one reason to change | Splitting rendering from data fetching, state transitions, and domain math into hooks, services, and pure functions. | A component with one job is testable and safe to change. |
| **OCP** — open to extend, closed to modify | Composing with `children`, slots, or render props. Never a boolean flag per variant. | A new variant stops editing the core component. |
| **LSP** — a subtype substitutes for its base | Making a custom primitive or a mock honor the full interface its consumers expect. | A partial implementation breaks callers that rely on the contract. |
| **ISP** — depend only on what you use | Passing the exact props a component reads, not a whole domain entity. | A narrow prop list decouples the component from the model. |
| **DIP** — depend on abstractions | Injecting an interface, an abstract class, an injection token, or a context instead of a concrete client, SDK, or `localStorage`. | The business logic and UI stop depending on a vendor. |

## SRP

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

## OCP

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

## LSP

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

## ISP

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

## DIP

```ts
// ❌ Depends on concrete localStorage and global fetch
export function AnalyticsTracker() {
  const token = localStorage.getItem('auth_token');
  fetch('/api/analytics', { headers: { Authorization: token } });
}

// ✅ Depends on an abstract interface, injected
export interface AnalyticsService {
  trackEvent(event: string, payload?: Record<string, unknown>): void;
}

export class VendorAnalyticsService implements AnalyticsService {
  trackEvent(event: string, payload?: Record<string, unknown>) {
    // Concrete vendor implementation
  }
}
```
