import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { PrismaClient } from '@prisma/client';
import { env } from './config/env';

import { PostgresUserRepository } from './infrastructure/repositories/PostgresUserRepository';
import { PostgresProgressRepository } from './infrastructure/repositories/PostgresProgressRepository';
import { PostgresLeaderboardRepository } from './infrastructure/repositories/PostgresLeaderboardRepository';
import { PostgresLevelDefinitionRepository } from './infrastructure/repositories/PostgresLevelDefinitionRepository';
import { BcryptPasswordService } from './infrastructure/services/BcryptPasswordService';
import { UuidIdGenerator } from './infrastructure/services/UuidIdGenerator';
import { ConsoleLogger } from './infrastructure/services/ConsoleLogger';
import { AuthFacade } from './infrastructure/services/AuthFacade';
import { PerLevelLeaderboardStrategy } from './infrastructure/strategies/PerLevelLeaderboardStrategy';

import { LoggingUseCaseDecorator } from './infrastructure/decorators/LoggingUseCaseDecorator';
import { ExceptionHandlingUseCaseDecorator } from './infrastructure/decorators/ExceptionHandlingUseCaseDecorator';
import { CachingUseCaseDecorator } from './infrastructure/decorators/CachingUseCaseDecorator';

import { RegisterUserUseCase } from './domain/use-cases/RegisterUserUseCase';
import { AuthenticateUserUseCase } from './domain/use-cases/AuthenticateUserUseCase';
import { SyncProgressUseCase } from './domain/use-cases/SyncProgressUseCase';
import { GetLeaderboardUseCase, GetLeaderboardInput } from './domain/use-cases/GetLeaderboardUseCase';
import { GetLevelDefinitionsUseCase } from './domain/use-cases/GetLevelDefinitionsUseCase';
import { UpsertLevelDefinitionUseCase } from './domain/use-cases/UpsertLevelDefinitionUseCase';
import { IUseCase } from './domain/interfaces/IUseCase';

import { AuthController } from './application/controllers/AuthController';
import { ProgressController } from './application/controllers/ProgressController';
import { LeaderboardController } from './application/controllers/LeaderboardController';
import { LevelController } from './application/controllers/LevelController';

import { createAuthRouter } from './application/routes/authRoutes';
import { createProgressRouter } from './application/routes/progressRoutes';
import { createLeaderboardRouter } from './application/routes/leaderboardRoutes';
import { createLevelRouter } from './application/routes/levelRoutes';
import { errorHandler } from './application/middleware/errorHandler';
import { createAuthMiddleware } from './application/middleware/authMiddleware';
import { setupSwagger } from './config/swagger';

const prisma = new PrismaClient();
const app: Application = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// --- Infraestructura ---
const logger = new ConsoleLogger();
const bcryptService = new BcryptPasswordService();
const idGenerator = new UuidIdGenerator();
const tokenService = new AuthFacade();
const userRepo = new PostgresUserRepository(prisma);
const progressRepo = new PostgresProgressRepository(prisma);
const leaderboardRepo = new PostgresLeaderboardRepository(prisma);
const levelRepo = new PostgresLevelDefinitionRepository(prisma);
const leaderboardStrategy = new PerLevelLeaderboardStrategy();

// --- Helper de composición AOP (logging + manejo de excepciones) ---
function withAop<I, O>(useCase: IUseCase<I, O>, name: string): IUseCase<I, O> {
  return new ExceptionHandlingUseCaseDecorator(
    new LoggingUseCaseDecorator(useCase, logger, name),
    logger,
    name,
  );
}

// --- Use cases (decorados con AOP) ---
const registerUseCase = withAop(
  new RegisterUserUseCase(userRepo, bcryptService, idGenerator),
  'RegisterUser',
);
const authenticateUseCase = withAop(
  new AuthenticateUserUseCase(userRepo, bcryptService),
  'AuthenticateUser',
);
const syncProgressUseCase = withAop(
  new SyncProgressUseCase(progressRepo, leaderboardRepo),
  'SyncProgress',
);

// Leaderboard: logging + excepciones + caché (30 s).
const getLeaderboardUseCase = new CachingUseCaseDecorator(
  withAop(new GetLeaderboardUseCase(leaderboardRepo, leaderboardStrategy), 'GetLeaderboard'),
  30_000,
  (input: GetLeaderboardInput) => `lb:${input.levelId}:${input.limit ?? 10}`,
  logger,
);

// GetLevelDefinitions NO lleva AOP: se inyecta concreto porque LevelController
// usa getById(), que vive fuera de IUseCase.
const getLevelDefinitionsUseCase = new GetLevelDefinitionsUseCase(levelRepo);
const upsertLevelDefinitionUseCase = withAop(
  new UpsertLevelDefinitionUseCase(levelRepo),
  'UpsertLevelDefinition',
);

// --- Controllers ---
// Los controllers dependen de IUseCase<I, O>; los use cases decorados con AOP
// son IUseCase<I, O>, por lo que el wiring no necesita ningún cast.
const authController = new AuthController(registerUseCase, authenticateUseCase, tokenService);
const progressController = new ProgressController(syncProgressUseCase, progressRepo);
const leaderboardController = new LeaderboardController(getLeaderboardUseCase);
const levelController = new LevelController(getLevelDefinitionsUseCase, upsertLevelDefinitionUseCase);

const authMiddleware = createAuthMiddleware(tokenService);

app.use('/auth', createAuthRouter(authController));
app.use('/progress', createProgressRouter(progressController, authMiddleware));
app.use('/leaderboard', createLeaderboardRouter(leaderboardController));
app.use('/levels', createLevelRouter(levelController, authMiddleware));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

setupSwagger(app);

app.use(errorHandler);

if (env.NODE_ENV !== 'test') {
  app.listen(env.PORT, () => {
    console.log(`Arrow Maze API running on port ${env.PORT}`);
  });
}

export { app, prisma };
