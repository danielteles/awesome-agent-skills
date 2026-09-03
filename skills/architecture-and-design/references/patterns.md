# Design Patterns for Frontend Engineering — why, and examples

The rules are in the `architecture-and-design` Ruleset (`patterns` group).

| Pattern | Use it to | Shape |
|---|---|---|
| Adapter / Repository | Hide a third-party library, SDK, or raw API response | A domain model, a repository interface, and an infrastructure class that translates between them. |
| Discriminated state | Replace loose booleans (`isLoading`, `isError`, `hasData`) | A union with a `status` discriminant, one variant per state. |

## Adapter / Repository

The domain depends on the interface (`ProductRepository`), not the transport. Swapping REST for
GraphQL, or a vendor SDK for another, changes only the infrastructure class.

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
    const raw = await fetch(`/api/v1/items/${id}`).then((res) => res.json());
    const dto = ProductDto.parse(raw); // validate the raw shape first — see `type-safety`

    return {
      id: dto.item_id,
      title: dto.item_name,
      priceInCents: Math.round(dto.unit_price * 100),
    };
  }
}
```

The adapter is the one place raw external data enters, so it is also the one place that runs schema
validation (`type-safety`). A mapping that trusts `raw.item_id` without parsing is the common bug.

## Discriminated State

```ts
// ❌ Allows impossible states (isLoading true AND data set AND error set)
interface FetchState<T> {
  isLoading: boolean;
  error?: Error;
  data?: T;
}

// ✅ Discriminated union — one variant per state, each with exactly its fields
export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'pending' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };
```
