# Test Quality — Test Doubles: why, and examples

The rules are in the `test-quality` Ruleset (`test-doubles` group). This file is the reasoning and code.
Terms (Meszaros): a **dummy** is a value passed to fill a parameter and never used; a **stub**
returns canned data; a **spy** is a stub that also records how it was called; a **fake** is a
working lightweight implementation; a **mock** carries scripted expectations and fails if they are
not met.

## Replace a collaborator only for a reason

Each double removes real code from the test's reach. Use one when the real thing is slow, hits the
network, is non-deterministic, has a side effect you cannot undo, or does not exist yet. A double
for a fast pure function is pure cost — call the real one.

## Mock at the boundary, not your own modules

Mocking your own module (`vi.mock('./pricing')`) means the test stops exercising that module's real
code and its wiring to the unit. Stub the *external* edge — HTTP, the clock, the filesystem — and
let everything you own run.

```ts
// ❌ The mapping/adapter code between fetch and the domain model never runs
vi.mock('./user-repository', () => ({
  getUser: () => ({ id: 'u1', name: 'Ada', plan: 'pro' }),
}));

// ✅ MSW answers the HTTP call; the repository, its parsing, and its mapping all run
server.use(
  http.get('/api/users/u1', () =>
    HttpResponse.json({ id: 'u1', full_name: 'Ada', subscription: { tier: 'pro' } }),
  ),
);
```

## Prefer a fake over a scripted mock

For a dependency used across many tests — a repository, a clock, a key-value store — a small
in-memory fake reads better and does not break on every internal change:

```ts
class InMemoryUserRepo implements UserRepo {
  private users = new Map<string, User>();
  async save(u: User) { this.users.set(u.id, u); }
  async findById(id: string) { return this.users.get(id) ?? null; }
}
```

Scripted mocks (`expect(x).toHaveBeenCalledWith(...)`) are for the few places where the interaction
*is* the behavior — see `behavior-not-implementation.md`.

## A fake must be verified against the real thing

A hand-written `InMemoryUserRepo` is a second implementation of the `UserRepo` contract, and it
will drift: the real adapter starts trimming whitespace, or returns `null` where the fake returns
`undefined`, and every test on the fake stays green while production breaks. Write one contract
test suite against the `UserRepo` interface and run it twice — once with the fake, once with the
real implementation (against a test database or container in an integration job).

```ts
function userRepoContract(makeRepo: () => Promise<UserRepo>) {
  it('returns null for an unknown id', async () => {
    const repo = await makeRepo();
    expect(await repo.findById('missing')).toBeNull();
  });
  it('round-trips a saved user', async () => {
    const repo = await makeRepo();
    const user = makeUser({ id: 'u1' });
    await repo.save(user);
    expect(await repo.findById('u1')).toEqual(user);
  });
}

describe('InMemoryUserRepo', () => userRepoContract(async () => new InMemoryUserRepo()));
describe('SqlUserRepo', () => userRepoContract(async () => new SqlUserRepo(await testDb())));
```

## Never mock the type under test

If `PricingService` is what the test covers, its real code must run. Stub what it depends on.

## Realistic stub returns, and reset between tests

A stub that returns `undefined` because that "works today" hides the case where the collaborator
returns a real value. Return something the contract would actually produce. Clear mock state
between tests so no stub leaks into the next one: `vi.resetAllMocks()` / `jest.resetAllMocks()` in
`afterEach`, or the config flags — `resetMocks: true` clears call history and implementations on
every `vi.fn()`, while `restoreMocks: true` only puts back originals replaced by `vi.spyOn`. Use
both, or reset explicitly.
