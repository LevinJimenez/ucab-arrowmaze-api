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
![Class Diagram](docs/class-diagram.svg)

> 🔍 The class diagram is large — to **zoom and pan** it comfortably, open the interactive viewer in a browser: [`docs/class-diagram-viewer.html`](docs/class-diagram-viewer.html) (wheel = zoom, drag = pan).

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
| Strategy | Behavioural | [`src/infrastructure/strategies/*LeaderboardStrategy.ts`](src/infrastructure/strategies/) — three ranking policies for the per-level leaderboard. The ranking is a **read-time policy** over an immutable log of runs: the active one returns one row per player (their best), which is why "one entry per player" lives here and not in SQL. Deliberately **not** used for survival mode, which has a single policy: the ordering lives in the repository query instead. |

> Class diagram → [`docs/class-diagram.svg`](docs/class-diagram.svg) (source: [`.d2`](docs/class-diagram.d2)) — all 85 classes, every structural relationship drawn. Zoomable viewer: [`docs/class-diagram-viewer.html`](docs/class-diagram-viewer.html).

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

Create a `.env` file in the project root.

> **This file is for local development and the integration tests only.** The primary database is the
> **PostgreSQL instance on Railway**, which backs production and reads its own variables from the
> Railway dashboard — it never sees this file (`.dockerignore` keeps `.env*` out of the image). See
> [Deploy on Railway](#deploy-on-railway). Point `DATABASE_URL` here at a database you are allowed to
> destroy: the integration tests wipe every table between cases.

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
LLM_MODEL=claude-sonnet-5
LLM_TIMEOUT_MS=120000
# Optional (low|medium|high). The adapter does not send `thinking`, so on
# claude-sonnet-5 adaptive thinking stays ON and defaults to effort=high —
# which made calls take 45-85s and sometimes burn the whole token budget on
# reasoning. `low` drops latency to ~10-25s and produces better silhouettes.
# Leave empty on Haiku 4.5, which rejects the parameter.
LLM_EFFORT=low
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

This builds the API image (Prisma client generated for the Linux container, TypeScript compiled) and starts its own Postgres 16 container. On startup, the API applies the schema with `prisma db push` before listening — no manual migration step required. The stack uses `.env.docker` (committed, dev-only secrets) and its own named volume, completely independent of both the production database on Railway and the external database configured in `.env` — in this project, the Supabase instance used for development and the integration tests.

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

## Deploy on Railway

Production runs on [Railway](https://railway.com): one project with **two services** — this API
(built from the `Dockerfile`, branch `main`) and a **PostgreSQL** instance. They talk over the
project's private network, so no public database endpoint is exposed.

### Setup

1. Create a project and add **PostgreSQL** (`+ New → Database → Add PostgreSQL`). It needs no
   configuration — Railway provisions the database, user and password, and exposes `DATABASE_URL`.
2. In the **same project**, add the service from this GitHub repo and point it at `main`. Railway
   detects the `Dockerfile` and builds with it.
3. Set these variables on the **API** service:

| Variable | Value | Notes |
|---|---|---|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` | reference to the Postgres service |
| `DIRECT_URL` | `${{Postgres.DATABASE_URL}}` | **the same URL** — see below |
| `JWT_SECRET` | a ≥16-char random secret | required; without it the app crash-loops |
| `LLM_EFFORT` | `low` | **required in production** — see below |
| `ANTHROPIC_API_KEY` | your Anthropic key (mark it *sealed*) | optional |

`PORT` and `NODE_ENV` need no configuration: Railway injects the former (`app.listen(env.PORT)`
reads it) and the `Dockerfile` sets the latter. Railway ignores `EXPOSE` — it only requires the app
to listen on `$PORT`.

4. Enable **Wait for CI** so a merge to `main` only deploys after GitHub Actions passes. It needs
   GitHub's *checks* and *actions* permissions; if the toggle reverts on its own, accept the App's
   updated permissions.
5. **Settings → Networking → Generate Domain** to expose the service publicly.

### Why the schema needs no manual step

The container's `CMD` is `prisma db push --skip-generate && node dist/app.js`, so **every deploy
applies the schema before the app listens**. A brand-new database gets its tables on first boot, and
a schema change can never ship without its migration — nobody has to remember to run anything.

### Two things that will bite you

- **`DIRECT_URL` is not redundant.** Prisma needs a direct (non-pooled) connection to apply schema.
  Railway's Postgres has no pooler, so one URL serves both — but if `DIRECT_URL` is missing,
  `prisma db push` fails and the container never starts.
- **`LLM_EFFORT` has no default in code**, and `.env.docker` never reaches the image. Without it the
  adapter omits `effort`; on `claude-sonnet-5` adaptive thinking then defaults to `high`, turning a
  ~15s call into 45–85s. No test catches this — it only shows up as a slow endpoint in production.

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

End-to-end HTTP tests with **supertest** against the full Express app. Require a live Postgres instance (configured in `.env` — the Supabase development instance, **never** the Railway production database). Files run sequentially (`--no-file-parallelism`) because they share one database and clean their tables in `beforeEach` — which is also why the target must be disposable.

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
| `GET` | `/leaderboard/{levelId}` | — | 200 `LeaderboardEntryDto[]` — one entry per player, their best run | 400 |
| `GET` | `/levels` | — | 200 `LevelDto[]` | — |
| `GET` | `/levels/{id}` | — | 200 `LevelDto` | 400 · 404 |
| `PUT` | `/levels/{id}` | 🔒 Bearer | 200 `LevelDto` | 400 · 401 · 422 |
| `POST` | `/levels/generate` | 🔒 Bearer | 200 `LevelData` | 401 · 422 · 429 · 502 |
| `POST` | `/survival` | 🔒 Bearer | 201 `SurvivalEntryDto` | 401 · 422 |
| `GET` | `/survival/leaderboard` | — | 200 `SurvivalEntryDto[]` — one entry per player, their best run | 422 |
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
