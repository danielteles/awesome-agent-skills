# Domain Modeling with DDD Tactical Patterns — why, and an example

The rules are in the `architecture-and-design` Ruleset (`ddd` group). These patterns name the parts of the domain core (`clean-architecture`). Use the
words the domain experts use.

| Pattern | What it is | In this codebase |
|---|---|---|
| Ubiquitous language | One shared name for a concept, in code, tests, and conversation | A `Cart` is `Cart` everywhere. Not `Basket` in the UI and `Order` in the API layer. |
| Entity | An object with an identity that persists through change | A branded `UserId`. Two users with the same fields are still different users. |
| Value object | An immutable object defined only by its fields | `Money`, `DateRange`, `Address`. No id. Compare by value. Build a new one to change it. |
| Aggregate | A cluster of objects with one root and one invariant boundary | `Cart` is the root; a `CartLine` is reachable only through it. |
| Domain event | A record that something happened, named in the past tense | `OrderPlaced`, `PaymentFailed`. The app publishes it; features react without a direct call. |
| Bounded context | A boundary inside which one model holds | A `feature/` folder (`structure`). `checkout` and `billing` can each have a different `Customer`. |
| Anti-corruption layer | A translation layer that keeps an external model out of the domain | The adapter / repository (`patterns`). |

- **Keep entities and value objects in the feature's `model/`**, free of framework and network code — they are the domain core.
- **A value object is immutable** — return a new instance to change it. Shared mutation corrupts every holder.
- **Reach an aggregate's inner parts only through its root** — the root enforces the invariant; a loose inner entity can break it.
- **A domain event is history** — named in the past tense, treated as a fact. It does not command; each consumer decides what to do.
- **Do not share one model across two bounded contexts.** A model that serves two contexts fits neither and couples them. Translate at the edge.

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
    if (quantity <= 0) throw new Error('quantity must be positive');
    if (this.lines.some((line) => line.product === product)) throw new Error('product already in cart');
    return new Cart(this.id, [...this.lines, CartLine.of(product, quantity)]);
  }

  get total(): Money {
    return this.lines.reduce((sum, line) => sum.add(line.subtotal), Money.of(0, 'USD'));
  }
}
```
