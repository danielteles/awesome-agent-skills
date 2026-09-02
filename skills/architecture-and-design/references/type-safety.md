# Type Safety as Design — why, and examples

The rules are in the `architecture-and-design` Ruleset (`type-safety` group). This file is the
reasoning and examples. For the syntax, see `core-typescript` (Ban Unsafe Types, Model Data with
Precise Types, Narrowing).

A type is a design tool, not paperwork. A precise type stops a class of bugs before the code runs.

- **`any` disables checking** for that value and everything it touches; a cast (`as`) tells the compiler to stop verifying. Type an unknown input as `unknown`
  and narrow it.
- **A discriminated union** carries exactly the fields each state has. An object of optional fields allows states that cannot exist (a paid order with no
  payment id, a draft with a shipped date).
- **Make illegal values unrepresentable** with `readonly`, `as const`, and branded id types, so the compiler rejects the bad value instead of a runtime check
  catching it.
- **A type on a network response is a promise, not a fact.** Parse the response against a schema at the adapter, then map it to the domain model. Generate API
  types from the contract (OpenAPI, GraphQL codegen, tRPC) — a hand-written type drifts from the server the moment the server changes.
- **Validate env and runtime config against a schema at startup**, so the app fails at boot with a clear message rather than mid-session on an undefined read.

## Narrow from `unknown`

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

## Discriminated union, not an optional bag

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

## Illegal values unrepresentable

```ts
// ✅ A branded id cannot be swapped with another string id
type UserId = string & { readonly __brand: 'UserId' };
type ProductId = string & { readonly __brand: 'ProductId' };

function getCart(userId: UserId): Cart { /* ... */ }

getCart(productId); // compile error, even though both are strings
```

## Validate at the boundary

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
