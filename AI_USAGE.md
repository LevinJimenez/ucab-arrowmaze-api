# AI Usage Documentation — Arrow Maze Backend

## Herramientas utilizadas

| Herramienta | Versión / Modelo | Rol en el flujo de trabajo |
|-------------|------------------|----------------------------|
| Claude Code | claude-sonnet-4-6 | Implementación guiada por plan, generación de código y tests |

## Registro de uso por tarea

| # | Fecha | Herramienta | Prompt / Instrucción | Acción Realizada | Archivos Afectados | Modificaciones Humanas | Lecciones Aprendidas |
|---|-------|-------------|---------------------|-----------------|-------------------|----------------------|---------------------|
| 1 | 2026-06-23 | Claude Code (claude-sonnet-4-6) | "Ejecutar tarea 1.1 del plan_bloque_3" | Inicializar proyecto Node.js + TypeScript con Express 5, Prisma, Vitest, ESLint (flat config v10), configuración pnpm v11 | package.json, tsconfig.json, vitest.config.ts, tests/setup.ts, .env.example, src/config/env.ts, eslint.config.js, .npmrc, pnpm-workspace.yaml | Pendiente de revisión | ESLint v10 usa flat config; pnpm v11 usa allowBuilds en pnpm-workspace.yaml; TS v6 requiere ignoreDeprecations para baseUrl |
| 2 | 2026-06-23 | Claude Code (claude-sonnet-4-6) | "Ejecutar tarea 1.2 del plan_bloque_3" | Crear .gitignore y plantilla AI_USAGE.md | .gitignore, AI_USAGE.md | Pendiente de revisión | Pendiente |
| 3 | 2026-06-23 | Claude Code (claude-sonnet-4-6) | "Ejecutar tarea 1.3 del plan_bloque_3" | Inicializar Prisma v7 y definir schema con modelos User, PlayerProgress, LeaderboardEntry, LevelDefinition | prisma/schema.prisma, prisma.config.ts | Pendiente de revisión | Prisma v7 usa provider="prisma-client" y output="../src/generated/prisma"; directUrl se configura en prisma.config.ts |
| 4 | 2026-06-23 | Claude Code (claude-sonnet-4-6) | "Ejecutar tarea 1.4 del plan_bloque_3" | Crear workflow CI/CD con GitHub Actions (pnpm, Postgres, lint, tests, build) | .github/workflows/ci.yml | Pendiente de revisión | Se usa pnpm/action-setup@v4 antes de setup-node; cache: pnpm; todos los comandos npm→pnpm |
| 5 | 2026-06-23 | Claude Code (claude-sonnet-4-6) | "Ejecutar tarea 1.5 del plan_bloque_3" | Instalar commitlint + husky, crear hooks pre-commit y commit-msg con pnpm | commitlint.config.js, .husky/pre-commit, .husky/commit-msg, package.json | Pendiente de revisión | husky init con pnpm exec; hooks usan pnpm run lint y pnpm exec commitlint |
| 7 | 2026-06-24 | Claude Code (claude-sonnet-4-6) | "Ejecutar tareas 2.0–2.8b del plan_bloque_3 (Fase 2 Domain Layer)" | Implementar jerarquía de errores de dominio, 4 entidades puras, 7 puertos (interfaces), IUseCase genérico, 6 use cases, fakes in-memory, builders Object Mother, 34 tests unitarios (aceptación + invariantes de entidad). Cobertura dominio: 97.14% stmts / 95.16% branches / 92.3% funcs | src/domain/errors/DomainErrors.ts; src/domain/entities/{User,PlayerProgress,LeaderboardEntry,LevelDefinition}.ts; src/domain/interfaces/{IUserRepository,IProgressRepository,ILeaderboardRepository,ILevelDefinitionRepository,ILeaderboardStrategy,IIdGenerator,IUseCase}.ts; src/domain/use-cases/{RegisterUser,AuthenticateUser,SyncProgress,GetLeaderboard,GetLevelDefinitions,UpsertLevelDefinition}UseCase.ts; tests/fakes/*; tests/builders/*; tests/domain/**/*.test.ts | Pendiente de revisión | Dominio 100% TypeScript puro (sin importar libs externas); fakes en lugar de mocks; builders para Arrange legible; toThrow(ValidationError) por tipo; AAA estricto |
| 6 | 2026-06-23 | Claude Code (claude-sonnet-4-6) | "Correcciones post-revisión Fase 1" | (1) Eliminar .eslintrc.json huérfano; (2) Añadir ignores globales en eslint.config.js; (3) Consolidar allowlist de build-scripts en pnpm-workspace.yaml con allowBuilds (única fuente); (4) Quitar version:10 del CI pnpm/action-setup; (5) Bajar Prisma a v6 clásico: schema.prisma con prisma-client-js + env vars, eliminar prisma.config.ts, eliminar src/generated/, mover @prisma/client a dependencies | .eslintrc.json (eliminado), eslint.config.js, .npmrc, pnpm-workspace.yaml, .github/workflows/ci.yml, prisma/schema.prisma, prisma.config.ts (eliminado), src/generated/ (eliminado), .gitignore, package.json, .env | Revisión humana | pnpm v11 usa allowBuilds en pnpm-workspace.yaml; @prisma/client runtime debe ir en dependencies no devDependencies |

## Evaluación crítica

- **Porcentaje aproximado de código con asistencia de IA:** (completar al final).
- **Casos donde la IA produjo resultados incorrectos o subóptimos:** (completar).
- **Reflexión sobre impacto en productividad y calidad:** (completar).
