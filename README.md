# Arrow Maze API

[![CI](https://github.com/LevinJimenez/ucab-arrowmaze-api/actions/workflows/ci.yml/badge.svg)](https://github.com/LevinJimenez/ucab-arrowmaze-api/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

REST backend for the **Arrow Maze — Escape Puzzle** game. Players register, sync their game progress, compete on per-level and survival-mode leaderboards, and generate brand-new levels with AI. Level definitions are stored as opaque JSON blobs that the client interprets.

**Stack:** Node 22 · TypeScript 6 · Express 5 · Prisma 6 / PostgreSQL · Anthropic SDK · pnpm · Vitest 4

---

## Architecture

The project follows **Clean Architecture** (Uncle Bob). Dependencies point inward only — outer layers import from inner layers, never the reverse.

```mermaid
graph TD
    subgraph L4["Layer 4 — Frameworks & Drivers"]
        FW["src/app.ts · src/config/\ninfrastructure/repositories/\ninfrastructure/services/\ninfrastructure/strategies/\ninfrastructure/decorators/"]
    end
    subgraph L3["Layer 3 — Interface Adapters"]
        IA["application/controllers/\napplication/routes/\napplication/mappers/\napplication/middleware/\napplication/factories/"]
    end
    subgraph L2["Layer 2 — Use Cases"]
        UC["domain/use-cases/\ndomain/interfaces/"]
    end
    subgraph L1["Layer 1 — Entities / Domain"]
        EN["domain/entities/\ndomain/value-objects/\ndomain/errors/"]
    end

    FW -->|imports| IA
    FW -->|imports| UC
    IA -->|imports| UC
    UC -->|imports| EN
```

> See the full annotated diagram → [`docs/backend-architecture.svg`](docs/backend-architecture.svg) (source: [`.d2`](docs/backend-architecture.d2))

### Folder → Layer mapping

| Layer | Folders |
|---|---|
| **1 — Entities** | `domain/entities/`, `domain/value-objects/`, `domain/errors/` |
| **2 — Use Cases** | `domain/use-cases/`, `domain/interfaces/` |
| **3 — Interface Adapters** | `application/*` |
| **4 — Frameworks & Drivers** | `infrastructure/*` (`repositories/`, `services/`, `strategies/`, `decorators/`), `config/`, `app.ts` |

> **Why repositories live in Layer 4, not 3.** The concrete `Postgres*Repository` classes import
> `PrismaClient`. Placing them in Layer 3 would make that an *outward* dependency (3 → 4), breaking
> the Dependency Rule. Keeping them next to Prisma in Layer 4 makes `repository → Prisma` an
> intra-layer detail, while the port they implement (`I*Repository`) stays in the domain — so the
> arrow still points inward. The naming is the trap here: the folder `domain/` spans Layers 1–2,
> and `infrastructure/` is all Layer 4.

### Data-contract decision 

The backend does **not** simulate game behaviour. It persists the *data contract* assumed by Mechanic A ("clear the board"). If the contract changes, impact is limited to the `LevelDefinition` invariants and the `upsertSchema` in `LevelController`. Level IDs are `string`; `data` is an opaque JSON blob.

---

## Design Patterns

| Pattern | Category | Where |
|---|---|---|
| Factory Method | Creational | [`src/application/factories/ResponseFactory.ts`](src/application/factories/ResponseFactory.ts) |
| Adapter | Structural | [`src/infrastructure/repositories/Postgres*Repository.ts`](src/infrastructure/repositories/) — wrap Prisma behind domain ports · [`src/infrastructure/services/LlmLevelGenerator.ts`](src/infrastructure/services/LlmLevelGenerator.ts) — wraps the Anthropic SDK behind `ILevelGenerator`, so swapping AI provider is a new adapter, not a domain change |
| Facade | Structural | [`src/infrastructure/services/AuthFacade.ts`](src/infrastructure/services/AuthFacade.ts) |
| Decorator | Structural | [`src/infrastructure/decorators/*UseCaseDecorator.ts`](src/infrastructure/decorators/) — AOP without libraries |
| Strategy | Behavioural | [`src/infrastructure/strategies/*LeaderboardStrategy.ts`](src/infrastructure/strategies/) — three ranking policies for the per-level leaderboard. Deliberately **not** used for survival mode, which has a single policy: the ordering lives in the repository query instead. |

> Class diagram → [`docs/class-diagram.svg`](docs/class-diagram.svg) (source: [`.d2`](docs/class-diagram.d2)) — all 79 classes, every structural relationship drawn.

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

# AI level generation — optional. Without a key the app still starts normally
# and only POST /levels/generate returns 502. Never commit a real key.
ANTHROPIC_API_KEY=
LLM_MODEL=claude-opus-4-8
LLM_TIMEOUT_MS=30000
```

Then generate the Prisma client and start the dev server:

```bash
pnpm prisma:generate
pnpm dev
```

Open **`http://localhost:3000/api-docs`** to explore the interactive API documentation.

---

## Run with Docker

**Prerequisite:** Docker (with Compose) — no Node, pnpm or Postgres install needed.

```bash
docker compose up --build
```

This builds the API image (Prisma client generated for the Linux container, TypeScript compiled) and starts its own Postgres 16 container. On startup, the API applies the schema with `prisma db push` before listening — no manual migration step required. The stack uses `.env.docker` (committed, dev-only secrets) and its own named volume, completely independent of any external database (e.g. Supabase) you may have configured in `.env`.

Once it's up:

- API: **`http://localhost:3000`**
- Interactive docs: **`http://localhost:3000/api-docs`**
- Health check: **`http://localhost:3000/health`**

To stop the stack:

```bash
docker compose down        # stop containers, keep the Postgres volume
docker compose down -v     # stop containers and wipe the Postgres volume
```

---

## Running Tests

The test suite is split into two independent layers:

### Unit tests — no database, instant feedback

```bash
pnpm test:unit
```

Covers the domain core (entities, value objects, use cases) plus everything that can run without I/O: mappers, middleware, AOP decorators and leaderboard strategies. Uses **fake in-memory repositories** instead of real Postgres — and a `FakeLevelGenerator` instead of a real LLM, so unit tests never make a network call or cost money. The "in-memory database" requirement from the course specification is fulfilled here — each fake stores data in a `Map` and resets between tests.

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
| `POST` | `/levels/generate` | 🔒 Bearer | 200 `LevelData` | 401 · 422 · 429 · 502 |
| `POST` | `/survival` | 🔒 Bearer | 201 `SurvivalEntryDto` | 401 · 422 |
| `GET` | `/survival/leaderboard` | — | 200 `SurvivalEntryDto[]` | 422 |
| `GET` | `/health` | — | 200 `{status, timestamp}` | — |

`POST /levels/generate` takes `{ prompt, difficulty? }`, asks the LLM for a level, re-validates it through the `LevelData` invariants and **returns it without persisting** — the client stores it locally. It is rate-limited to **10 requests/minute per IP** (applied *before* auth, since it is the only endpoint that costs money).

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
