# Arrow Maze API

[![CI](https://github.com/LevinJimenez/ucab-arrowmaze-api/actions/workflows/ci.yml/badge.svg)](https://github.com/LevinJimenez/ucab-arrowmaze-api/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

REST backend for the **Arrow Maze — Escape Puzzle** game. Players register, sync their game progress, and compete on per-level leaderboards. Level definitions are stored as opaque JSON blobs that the client interprets.

**Stack:** Node 22 · TypeScript 6 · Express 5 · Prisma 6 / PostgreSQL · pnpm · Vitest 4

---

## Architecture

The project follows **Clean Architecture** (Uncle Bob). Dependencies point inward only — outer layers import from inner layers, never the reverse.

```mermaid
graph TD
    subgraph L4["Layer 4 — Frameworks & Drivers"]
        FW["src/app.ts · src/config/\ninfrastructure/strategies/\ninfrastructure/decorators/\ninfrastructure/services/"]
    end
    subgraph L3["Layer 3 — Interface Adapters"]
        IA["application/controllers/\napplication/routes/\napplication/mappers/\napplication/middleware/\napplication/factories/\ninfrastructure/repositories/"]
    end
    subgraph L2["Layer 2 — Use Cases"]
        UC["domain/use-cases/\ndomain/interfaces/"]
    end
    subgraph L1["Layer 1 — Entities / Domain"]
        EN["domain/entities/\ndomain/errors/"]
    end

    FW -->|imports| IA
    FW -->|imports| UC
    IA -->|imports| UC
    UC -->|imports| EN
```

> See the full annotated diagram → [`docs/architecture.md`](docs/architecture.md)

### Folder → Layer mapping

| Layer | Folders |
|---|---|
| **1 — Entities** | `domain/entities/`, `domain/errors/` |
| **2 — Use Cases** | `domain/use-cases/`, `domain/interfaces/` |
| **3 — Interface Adapters** | `application/*`, `infrastructure/repositories/` |
| **4 — Frameworks & Drivers** | `infrastructure/{strategies,decorators,services}/`, `config/`, `app.ts` |

### Data-contract decision (Mechanic A)

The backend does **not** simulate game behaviour. It persists the *data contract* assumed by Mechanic A ("clear the board"). If the contract changes, impact is limited to the `LevelDefinition` invariants and the `upsertSchema` in `LevelController`. Level IDs are `string`; `data` is an opaque JSON blob.

---

## Design Patterns

| Pattern | Category | Where |
|---|---|---|
| Factory Method | Creational | [`src/application/factories/ResponseFactory.ts`](src/application/factories/ResponseFactory.ts) |
| Adapter | Structural | [`src/infrastructure/repositories/Postgres*Repository.ts`](src/infrastructure/repositories/) — wrap Prisma behind domain ports |
| Facade | Structural | [`src/infrastructure/services/AuthFacade.ts`](src/infrastructure/services/AuthFacade.ts) |
| Decorator | Structural | [`src/infrastructure/decorators/*UseCaseDecorator.ts`](src/infrastructure/decorators/) — AOP without libraries |
| Strategy | Behavioural | [`src/infrastructure/strategies/*LeaderboardStrategy.ts`](src/infrastructure/strategies/) |

> Class diagram → [`docs/class-diagram.md`](docs/class-diagram.md)

---

## SOLID Principles

| Principle | Real example in this codebase |
|---|---|
| **SRP** | Each use case owns one operation; each mapper converts one domain type; each repository wraps one table. |
| **OCP** | New leaderboard ranking algorithms implement `ILeaderboardStrategy` without touching existing code. New AOP aspects implement `IUseCase<I,O>` and wrap the chain. |
| **LSP** | All three `*UseCaseDecorator` classes are substitutable wherever `IUseCase<I,O>` is expected — `withAop()` in `app.ts` composes them freely without casts. |
| **ISP** | Ports are fine-grained: `IPasswordHasher` and `IPasswordVerifier` are separate interfaces so a use case only depends on what it actually calls. |
| **DIP** | Use cases depend on `IUserRepository`, `IProgressRepository`, etc. — never on Prisma. The composition root (`src/app.ts`) injects concrete Postgres implementations. |

---

## AOP — Cross-Cutting Concerns

Three aspects are applied via the **Decorator + DIP** pattern — no AOP library required. Each decorator implements `IUseCase<I,O>` and wraps another `IUseCase<I,O>`.

| Aspect | Decorator | Applied to |
|---|---|---|
| Logging | `LoggingUseCaseDecorator` | All use cases |
| Exception handling | `ExceptionHandlingUseCaseDecorator` | All use cases |
| Result caching (30 s TTL) | `CachingUseCaseDecorator` | Leaderboard only |

Composition helper from `src/app.ts`:

```typescript
function withAop<I, O>(useCase: IUseCase<I, O>, name: string): IUseCase<I, O> {
  return new ExceptionHandlingUseCaseDecorator(
    new LoggingUseCaseDecorator(useCase, logger, name),
    logger,
    name,
  );
}
```

The leaderboard additionally wraps the result in `CachingUseCaseDecorator` with a TTL-based in-memory cache and a configurable key function.

---

## Getting Started

**Prerequisites:** Node ≥ 22, pnpm (via corepack)

```bash
corepack enable
pnpm install
```

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://user:pass@host:6543/db?pgbouncer=true"
DIRECT_URL="postgresql://user:pass@host:5432/db"   # optional, for migrations
JWT_SECRET=your-secret-at-least-16-chars
JWT_EXPIRES_IN=30d
PORT=3000
NODE_ENV=development
```

Then generate the Prisma client and start the dev server:

```bash
pnpm prisma:generate
pnpm dev
```

Open **`http://localhost:3000/api-docs`** to explore the interactive API documentation.

---

## Running Tests

The test suite is split into two independent layers:

### Unit tests — no database, instant feedback

```bash
pnpm test:unit
```

Covers Layers 1–2 (entities, use cases, mappers, middleware, AOP decorators, leaderboard strategies). Uses **fake in-memory repositories** instead of real Postgres. The "in-memory database" requirement from the course specification is fulfilled here — each fake stores data in a `Map` and resets between tests.

**Testing philosophy:**
- *State over interaction*: assertions check return values and entity state, not internal calls (no `expect(mock).toHaveBeenCalledWith`).
- *Testing API*: use cases are tested through their public `execute()` contract.
- Documented exception: `*UseCaseDecorator` tests use `vi.fn()` because the decorator's only observable behaviour *is* calling the inner use case.

```bash
pnpm test:coverage   # enforces thresholds: ≥90% domain, ≥85% global
```

### Integration tests — real Postgres required

```bash
pnpm test:integration
```

End-to-end HTTP tests with **supertest** against the full Express app. Require a live Postgres instance (configured in `.env`). Files run sequentially (`--no-file-parallelism`) because they share one database and clean their tables in `beforeEach`.

### Run everything

```bash
pnpm test   # unit → integration
```

---

## API Endpoints

All endpoints return `{ success, data?, message?, meta? }` except `/health` (raw JSON).

| Method | Route | Auth | Success | Errors |
|---|---|---|---|---|
| `POST` | `/auth/register` | — | 201 `{user, token}` | 409 · 422 |
| `POST` | `/auth/login` | — | 200 `{user, token}` | 401 · 422 |
| `GET` | `/progress` | 🔒 Bearer | 200 `ProgressDto` | 401 · 404 |
| `PUT` | `/progress` | 🔒 Bearer | 200 `ProgressDto` | 401 · 422 |
| `GET` | `/leaderboard/{levelId}` | — | 200 `LeaderboardEntryDto[]` | 400 |
| `GET` | `/levels` | — | 200 `LevelDto[]` | — |
| `GET` | `/levels/{id}` | — | 200 `LevelDto` | 400 · 404 |
| `PUT` | `/levels/{id}` | 🔒 Bearer | 200 `LevelDto` | 400 · 401 · 422 |
| `GET` | `/health` | — | 200 `{status, timestamp}` | — |

Full interactive docs with request/response schemas: **`/api-docs`**
Raw OpenAPI spec (JSON): **`/api-docs.json`**

---

## Contributing

- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/) enforced by commitlint (header ≤ 100 chars).
- **Branching:** Gitflow — `feature/*` branches off `develop`; PRs merge back to `develop`.
- **Linting:** `pnpm lint` must pass before committing (husky pre-commit hook).

---

## AI Usage

See [`AI_USAGE.md`](AI_USAGE.md) for a detailed log of AI-assisted tasks, lessons learned, and critical evaluation.

---

## License

[MIT](LICENSE)
