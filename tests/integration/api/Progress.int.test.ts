import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import { app, prisma } from '../../../src/app';

const TIMEOUT = 30_000;

async function cleanDb(): Promise<void> {
  await prisma.leaderboardEntry.deleteMany();
  await prisma.playerProgress.deleteMany();
  await prisma.user.deleteMany();
}

describe('Progress API — integration', () => {
  beforeEach(async () => {
    await cleanDb();
  }, TIMEOUT);

  afterAll(async () => {
    await cleanDb();
    await prisma.$disconnect();
  }, TIMEOUT);

  it('GET /progress without token returns 401', async () => {
    const res = await request(app).get('/progress');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  }, TIMEOUT);

  it('PUT /progress saves data and GET /progress retrieves it', async () => {
    const registerRes = await request(app)
      .post('/auth/register')
      .send({ username: 'progressuser', email: 'progress@example.com', password: 'password123' });
    const token: string = registerRes.body.data.token;

    const putRes = await request(app)
      .put('/progress')
      .set('Authorization', `Bearer ${token}`)
      .send({
        completedLevels: ['level_1', 'level_2'],
        bestScores: { level_1: 900, level_2: 800 },
        currentLevelId: 'level_3',
      });

    expect(putRes.status).toBe(200);
    expect(putRes.body.success).toBe(true);
    expect(putRes.body.data.completedLevels).toEqual(['level_1', 'level_2']);
    expect(putRes.body.data.bestScores).toEqual({ level_1: 900, level_2: 800 });
    expect(putRes.body.data.currentLevelId).toBe('level_3');

    const getRes = await request(app)
      .get('/progress')
      .set('Authorization', `Bearer ${token}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body.success).toBe(true);
    expect(getRes.body.data.completedLevels).toEqual(['level_1', 'level_2']);
    expect(getRes.body.data.bestScores).toEqual({ level_1: 900, level_2: 800 });
    expect(getRes.body.data.currentLevelId).toBe('level_3');
  }, TIMEOUT);
});
