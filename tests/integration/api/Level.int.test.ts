import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import { app, prisma } from '../../../src/app';

const TIMEOUT = 30_000;

async function cleanDb(): Promise<void> {
  await prisma.leaderboardEntry.deleteMany();
  await prisma.playerProgress.deleteMany();
  await prisma.user.deleteMany();
  await prisma.levelDefinition.deleteMany();
}

const levelPayload = {
  name: 'Test Level 1',
  difficulty: 'easy',
  parMoves: 10,
  data: {
    cells: [[0, 0], [1, 0], [0, 1]],
    arrows: [{ id: 'arrow_1', path: [[0, 0], [1, 0]], color: 'red' }],
  },
};

describe('Level API — integration', () => {
  beforeEach(async () => {
    await cleanDb();
  }, TIMEOUT);

  afterAll(async () => {
    await cleanDb();
    await prisma.$disconnect();
  }, TIMEOUT);

  it('PUT /levels/:id without token returns 401', async () => {
    const res = await request(app)
      .put('/levels/level_1')
      .send(levelPayload);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  }, TIMEOUT);

  it('PUT /levels/:id upserts a level and GET /levels/:id retrieves it', async () => {
    const registerRes = await request(app)
      .post('/auth/register')
      .send({ username: 'admin', email: 'admin@example.com', password: 'password123' });
    const token: string = registerRes.body.data.token;

    const putRes = await request(app)
      .put('/levels/level_1')
      .set('Authorization', `Bearer ${token}`)
      .send(levelPayload);

    expect(putRes.status).toBe(200);
    expect(putRes.body.success).toBe(true);
    expect(putRes.body.data.id).toBe('level_1');
    expect(putRes.body.data.name).toBe('Test Level 1');
    expect(putRes.body.data.difficulty).toBe('easy');

    const getRes = await request(app).get('/levels/level_1');

    expect(getRes.status).toBe(200);
    expect(getRes.body.success).toBe(true);
    expect(getRes.body.data.id).toBe('level_1');
    expect(getRes.body.data.name).toBe('Test Level 1');
  }, TIMEOUT);

  it('PUT /levels/:id upserts a level with timeLimitSeconds and GET preserves it', async () => {
    const registerRes = await request(app)
      .post('/auth/register')
      .send({ username: 'admin', email: 'admin@example.com', password: 'password123' });
    const token: string = registerRes.body.data.token;

    const payloadWithTimeLimit = {
      ...levelPayload,
      data: { ...levelPayload.data, timeLimitSeconds: 90 },
    };

    const putRes = await request(app)
      .put('/levels/level_1')
      .set('Authorization', `Bearer ${token}`)
      .send(payloadWithTimeLimit);

    expect(putRes.status).toBe(200);
    expect(putRes.body.data.data.timeLimitSeconds).toBe(90);

    const getRes = await request(app).get('/levels/level_1');

    expect(getRes.status).toBe(200);
    expect(getRes.body.data.data.timeLimitSeconds).toBe(90);
  }, TIMEOUT);

  it('GET /levels/:id for non-existent level returns 404', async () => {
    const res = await request(app).get('/levels/nonexistent_level');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  }, TIMEOUT);

  it('GET /levels returns 200 with the list of levels', async () => {
    const registerRes = await request(app)
      .post('/auth/register')
      .send({ username: 'admin', email: 'admin@example.com', password: 'password123' });
    const token: string = registerRes.body.data.token;

    await request(app)
      .put('/levels/level_1')
      .set('Authorization', `Bearer ${token}`)
      .send(levelPayload);
    await request(app)
      .put('/levels/level_2')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...levelPayload, name: 'Test Level 2' });

    const res = await request(app).get('/levels');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
  }, TIMEOUT);

  it('PUT /levels/:id with invalid body returns 422', async () => {
    const registerRes = await request(app)
      .post('/auth/register')
      .send({ username: 'admin', email: 'admin@example.com', password: 'password123' });
    const token: string = registerRes.body.data.token;

    const res = await request(app)
      .put('/levels/level_1')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '', data: { cells: [], arrows: [] } });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  }, TIMEOUT);
});
