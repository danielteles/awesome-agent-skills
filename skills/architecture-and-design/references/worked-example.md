# Architecture and Design — Worked Example: A Review Pass

A full pass in the skill's Output Format. Findings cite the Ruleset topic they fail.

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

Output:

```
must-fix · solid · PriceTag.tsx:1 — the prop takes a full `ProductEntity` but reads only `product.id`. Take `productId: ProductId` (ISP).
must-fix · solid · PriceTag.tsx:4 — the component fetches, parses, and renders. Move the fetch to a `useProductPrice(productId)` hook (SRP).
must-fix · state-and-data · PriceTag.tsx:4 — server data is fetched in an effect into local state: no cache, no dedup, and a race on `product.id` change. Use a cache library keyed by `['product-price', productId]`.
must-fix · type-safety · PriceTag.tsx:7 — `data.amount` is read from an unvalidated response. Parse it with a schema in the adapter.
must-fix · frontend-practices · PriceTag.tsx:12 — no error state; a failed fetch stays on "Loading..." forever. Model async state as a union (see `patterns`).
must-fix · frontend-practices · PriceTag.tsx:4 — the effect does not cancel. Add an `AbortController`.
consider · expressive-logic · PriceTag.tsx:10 — `price === 0 ? true : false` is redundant. Write `price === 0`.
consider · expressive-logic · PriceTag.tsx:12 — both branches return. Drop the `else` and use a guard clause.
consider · expressive-logic · PriceTag.tsx:7 — `/ 100` is a magic value. Return cents from the hook and format at the edge.
```
