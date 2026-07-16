import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';
import request from 'supertest';

const TIMEOUT = 30_000;

// El adaptador construye el cliente Anthropic de forma perezosa en el primer
// generate(); con la key dummy fijada ANTES de importar la app, recorre su
// camino real (construcción del cliente, llamada a messages.parse) sin red,
// porque el SDK está mockeado.
vi.hoisted(() => { process.env.ANTHROPIC_API_KEY = 'test-key'; });

// El fixture se declara DENTRO del factory (no fuera) porque vi.mock se
// hoistea por encima de las declaraciones del módulo; una referencia externa
// dispararía un ReferenceError por orden de evaluación.
vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(function () {
    return {
      messages: {
        parse: vi.fn().mockResolvedValue({
          // El modelo devuelve la silueta como grid ASCII; el adaptador la
          // convierte a cells [[0,0],[0,1],[1,0]] antes de responder.
          parsed_output: {
            grid: ['110', '100'],
            arrows: [{ id: 'a1', path: [[0, 0], [0, 1]], color: '#EF476F' }],
            lives: 3,
          },
        }),
      },
    };
  }),
}));

import { app, prisma } from '../../../src/app';

const canonicalLevel = {
  cells: [[0, 0], [0, 1], [1, 0]],
  arrows: [{ id: 'a1', path: [[0, 0], [0, 1]], color: '#EF476F' }],
  lives: 3,
};

async function cleanDb(): Promise<void> {
  await prisma.survivalEntry.deleteMany();
  await prisma.leaderboardEntry.deleteMany();
  await prisma.playerProgress.deleteMany();
  await prisma.user.deleteMany();
}

describe('Levels API — generate (LLM mocked) — integration', () => {
  beforeEach(async () => {
    await cleanDb();
  }, TIMEOUT);

  afterAll(async () => {
    await cleanDb();
    await prisma.$disconnect();
  }, TIMEOUT);

  it('POST /levels/generate without token returns 401', async () => {
    const res = await request(app)
      .post('/levels/generate')
      .send({ prompt: 'a maze shaped like a heart' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  }, TIMEOUT);

  it('POST /levels/generate with a valid prompt returns 200 with the generated level', async () => {
    const registerRes = await request(app)
      .post('/auth/register')
      .send({ username: 'designer1', email: 'designer1@example.com', password: 'password123' });
    const token: string = registerRes.body.data.token;

    const res = await request(app)
      .post('/levels/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({ prompt: 'a maze shaped like a heart', difficulty: 'medium' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.cells).toEqual(canonicalLevel.cells);
    expect(res.body.data.arrows).toEqual(canonicalLevel.arrows);
    expect(res.body.data.lives).toBe(3);
  }, TIMEOUT);

  it('POST /levels/generate with an empty prompt returns 422', async () => {
    const registerRes = await request(app)
      .post('/auth/register')
      .send({ username: 'designer1', email: 'designer1@example.com', password: 'password123' });
    const token: string = registerRes.body.data.token;

    const res = await request(app)
      .post('/levels/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({ prompt: '' });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  }, TIMEOUT);

  it('POST /levels/generate without a prompt returns 422', async () => {
    const registerRes = await request(app)
      .post('/auth/register')
      .send({ username: 'designer1', email: 'designer1@example.com', password: 'password123' });
    const token: string = registerRes.body.data.token;

    const res = await request(app)
      .post('/levels/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  }, TIMEOUT);

  it('POST /levels/generate does not persist the generated level', async () => {
    const registerRes = await request(app)
      .post('/auth/register')
      .send({ username: 'designer1', email: 'designer1@example.com', password: 'password123' });
    const token: string = registerRes.body.data.token;

    await request(app)
      .post('/levels/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({ prompt: 'a maze shaped like a heart' });

    // Mecánica A: el nivel generado se devuelve, NUNCA se persiste server-side.
    const levelsRes = await request(app).get('/levels');
    expect(levelsRes.body.data).toEqual([]);
  }, TIMEOUT);
});
