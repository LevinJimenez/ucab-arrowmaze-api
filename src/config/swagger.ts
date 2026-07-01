import { Application } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import helmet from 'helmet';

/**
 * OpenAPI 3.0 spec defined entirely inline so that the generated document
 * is stable in the production Docker image (no src/ scanning at runtime).
 */
const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Arrow Maze API',
      version: '1.0.0',
      description:
        'REST API for the Arrow Maze Escape Puzzle game — manage users, ' +
        'player progress, level definitions and leaderboards.',
    },
    servers: [{ url: 'http://localhost:3000', description: 'Development server' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      schemas: {
        // ── Error envelope ──────────────────────────────────────────────────
        ErrorResponse: {
          type: 'object',
          required: ['success'],
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error description' },
          },
        },

        // ── Auth ────────────────────────────────────────────────────────────
        RegisterRequest: {
          type: 'object',
          required: ['username', 'email', 'password'],
          properties: {
            username: { type: 'string', minLength: 3, maxLength: 30, example: 'alice' },
            email: { type: 'string', format: 'email', example: 'alice@example.com' },
            password: { type: 'string', minLength: 6, example: 'secret123' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'alice@example.com' },
            password: { type: 'string', minLength: 1, example: 'secret123' },
          },
        },
        RegisterUserOutput: {
          type: 'object',
          required: ['id', 'username', 'email'],
          properties: {
            id: { type: 'string', format: 'uuid', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
            username: { type: 'string', example: 'alice' },
            email: { type: 'string', format: 'email', example: 'alice@example.com' },
          },
        },
        AuthenticateUserOutput: {
          type: 'object',
          required: ['userId', 'username', 'email'],
          properties: {
            userId: { type: 'string', format: 'uuid', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
            username: { type: 'string', example: 'alice' },
            email: { type: 'string', format: 'email', example: 'alice@example.com' },
          },
        },
        RegisterResponse: {
          type: 'object',
          required: ['success', 'data'],
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              required: ['user', 'token'],
              properties: {
                user: { $ref: '#/components/schemas/RegisterUserOutput' },
                token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
              },
            },
          },
        },
        LoginResponse: {
          type: 'object',
          required: ['success', 'data'],
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              required: ['user', 'token'],
              properties: {
                user: { $ref: '#/components/schemas/AuthenticateUserOutput' },
                token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
              },
            },
          },
        },

        // ── Progress ────────────────────────────────────────────────────────
        ProgressDto: {
          type: 'object',
          required: ['userId', 'completedLevels', 'bestScores', 'currentLevelId'],
          properties: {
            userId: { type: 'string', format: 'uuid' },
            completedLevels: { type: 'array', items: { type: 'string' }, example: ['level_1', 'level_2'] },
            bestScores: {
              type: 'object',
              additionalProperties: { type: 'number' },
              example: { level_1: 900, level_2: 800 },
            },
            currentLevelId: { type: 'string', example: 'level_3' },
          },
        },
        SyncProgressRequest: {
          type: 'object',
          required: ['completedLevels', 'bestScores', 'currentLevelId'],
          properties: {
            completedLevels: { type: 'array', items: { type: 'string', minLength: 1 }, example: ['level_1'] },
            bestScores: {
              type: 'object',
              additionalProperties: { type: 'number' },
              example: { level_1: 900 },
            },
            currentLevelId: { type: 'string', minLength: 1, example: 'level_2' },
            lastLevelId: { type: 'string', minLength: 1, example: 'level_1' },
            lastScore: { type: 'integer', minimum: 0, example: 900 },
            lastMoves: { type: 'integer', minimum: 0, example: 12 },
            lastTimeSeconds: { type: 'integer', minimum: 0, example: 60 },
          },
        },
        ProgressResponse: {
          type: 'object',
          required: ['success', 'data'],
          properties: {
            success: { type: 'boolean', example: true },
            data: { $ref: '#/components/schemas/ProgressDto' },
          },
        },

        // ── Leaderboard ─────────────────────────────────────────────────────
        LeaderboardEntryDto: {
          type: 'object',
          required: ['userId', 'username', 'levelId', 'score', 'moves', 'timeSeconds', 'rankedAt'],
          properties: {
            userId: { type: 'string', format: 'uuid' },
            username: { type: 'string', example: 'alice' },
            levelId: { type: 'string', example: 'level_1' },
            score: { type: 'integer', example: 950 },
            moves: { type: 'integer', example: 8 },
            timeSeconds: { type: 'integer', example: 45 },
            rankedAt: { type: 'string', format: 'date-time' },
          },
        },
        LeaderboardResponse: {
          type: 'object',
          required: ['success', 'data'],
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'array', items: { $ref: '#/components/schemas/LeaderboardEntryDto' } },
          },
        },

        // ── Levels ──────────────────────────────────────────────────────────
        CellCoordinate: {
          type: 'array',
          items: { type: 'integer' },
          minItems: 2,
          maxItems: 2,
          example: [0, 1],
        },
        ArrowData: {
          type: 'object',
          required: ['id', 'path', 'color'],
          properties: {
            id: { type: 'string', example: 'arrow_1' },
            path: { type: 'array', items: { $ref: '#/components/schemas/CellCoordinate' }, minItems: 1 },
            color: { type: 'string', example: 'red' },
          },
        },
        LevelData: {
          type: 'object',
          required: ['cells', 'arrows'],
          properties: {
            cells: { type: 'array', items: { $ref: '#/components/schemas/CellCoordinate' }, minItems: 1 },
            arrows: { type: 'array', items: { $ref: '#/components/schemas/ArrowData' }, minItems: 1 },
            lives: { type: 'integer', minimum: 0, example: 3 },
          },
        },
        LevelDto: {
          type: 'object',
          required: ['id', 'name', 'difficulty', 'data'],
          properties: {
            id: { type: 'string', example: 'level_1' },
            name: { type: 'string', example: 'Tutorial' },
            difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'], example: 'easy' },
            parMoves: { type: 'integer', minimum: 1, example: 10 },
            data: { $ref: '#/components/schemas/LevelData' },
          },
        },
        UpsertLevelRequest: {
          type: 'object',
          required: ['name', 'data'],
          properties: {
            name: { type: 'string', minLength: 1, example: 'Tutorial' },
            difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'], example: 'easy' },
            parMoves: { type: 'integer', minimum: 1, example: 10 },
            data: { $ref: '#/components/schemas/LevelData' },
          },
        },
        LevelResponse: {
          type: 'object',
          required: ['success', 'data'],
          properties: {
            success: { type: 'boolean', example: true },
            data: { $ref: '#/components/schemas/LevelDto' },
          },
        },
        LevelsResponse: {
          type: 'object',
          required: ['success', 'data'],
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'array', items: { $ref: '#/components/schemas/LevelDto' } },
          },
        },

        // ── Health ──────────────────────────────────────────────────────────
        HealthResponse: {
          type: 'object',
          required: ['status', 'timestamp'],
          properties: {
            status: { type: 'string', example: 'ok' },
            timestamp: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    paths: {
      '/auth/register': {
        post: {
          summary: 'Register a new user',
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } },
          },
          responses: {
            '201': {
              description: 'User registered successfully',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterResponse' } } },
            },
            '409': {
              description: 'Email or username already in use',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
            },
            '422': {
              description: 'Validation error',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
            },
          },
        },
      },

      '/auth/login': {
        post: {
          summary: 'Authenticate a user and obtain a JWT',
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } },
          },
          responses: {
            '200': {
              description: 'Login successful',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginResponse' } } },
            },
            '401': {
              description: 'Invalid credentials',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
            },
            '422': {
              description: 'Validation error',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
            },
          },
        },
      },

      '/progress': {
        get: {
          summary: 'Get the current user\'s progress',
          tags: ['Progress'],
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'Player progress',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ProgressResponse' } } },
            },
            '401': {
              description: 'Missing or invalid token',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
            },
            '404': {
              description: 'No progress found for this user',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
            },
          },
        },
        put: {
          summary: 'Sync player progress (and optionally record a leaderboard entry)',
          tags: ['Progress'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SyncProgressRequest' } } },
          },
          responses: {
            '200': {
              description: 'Progress synced successfully',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ProgressResponse' } } },
            },
            '401': {
              description: 'Missing or invalid token',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
            },
            '422': {
              description: 'Validation error',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
            },
          },
        },
      },

      '/leaderboard/{levelId}': {
        get: {
          summary: 'Get the ranked leaderboard for a specific level',
          tags: ['Leaderboard'],
          parameters: [
            {
              name: 'levelId',
              in: 'path',
              required: true,
              description: 'Level identifier',
              schema: { type: 'string' },
              example: 'level_1',
            },
            {
              name: 'limit',
              in: 'query',
              required: false,
              description: 'Maximum number of entries to return (1-100, default 10)',
              schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
            },
          ],
          responses: {
            '200': {
              description: 'Ranked leaderboard entries',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/LeaderboardResponse' } } },
            },
            '400': {
              description: 'Invalid levelId',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
            },
          },
        },
      },

      '/levels': {
        get: {
          summary: 'List all level definitions',
          tags: ['Levels'],
          responses: {
            '200': {
              description: 'Array of all level definitions',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/LevelsResponse' } } },
            },
          },
        },
      },

      '/levels/{id}': {
        get: {
          summary: 'Get a level definition by ID',
          tags: ['Levels'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Level identifier',
              schema: { type: 'string' },
              example: 'level_1',
            },
          ],
          responses: {
            '200': {
              description: 'Level definition',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/LevelResponse' } } },
            },
            '400': {
              description: 'Invalid level id',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
            },
            '404': {
              description: 'Level not found',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
            },
          },
        },
        put: {
          summary: 'Create or update a level definition',
          tags: ['Levels'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Level identifier',
              schema: { type: 'string' },
              example: 'level_1',
            },
          ],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/UpsertLevelRequest' } } },
          },
          responses: {
            '200': {
              description: 'Level created or updated',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/LevelResponse' } } },
            },
            '400': {
              description: 'Invalid level id',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
            },
            '401': {
              description: 'Missing or invalid token',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
            },
            '422': {
              description: 'Validation error',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
            },
          },
        },
      },

      '/health': {
        get: {
          summary: 'Health check',
          tags: ['System'],
          responses: {
            '200': {
              description: 'Service is running (raw JSON, no success envelope)',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/HealthResponse' } } },
            },
          },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

/**
 * Mount Swagger UI at /api-docs and expose the raw spec at /api-docs.json.
 * A route-scoped helmet call relaxes the Content-Security-Policy only for
 * these two paths so that Swagger UI assets load without weakening the global CSP.
 */
export function setupSwagger(app: Application): void {
  app.use(
    '/api-docs',
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'blob:'],
          connectSrc: ["'self'"],
        },
      },
    }),
  );

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/api-docs.json', (_req, res) => { res.json(swaggerSpec); });
}
