import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import { app, prisma } from '../../../src/app';

const TIMEOUT = 30_000;

async function cleanDb(): Promise<void> {
  await prisma.leaderboardEntry.deleteMany();
  await prisma.playerProgress.deleteMany();
  await prisma.user.deleteMany();
}

describe('Leaderboard API — integration', () => {
  beforeEach(async () => {
    await cleanDb();
  }, TIMEOUT);

  afterAll(async () => {
    await cleanDb();
    await prisma.$disconnect();
  }, TIMEOUT);

  it('synced game entry appears ranked in GET /leaderboard/:levelId', async () => {
    const registerRes = await request(app)
      .post('/auth/register')
      .send({ username: 'player1', email: 'player1@example.com', password: 'password123' });
    const token: string = registerRes.body.data.token;

    await request(app)
      .put('/progress')
      .set('Authorization', `Bearer ${token}`)
      .send({
        completedLevels: ['level_1'],
        bestScores: { level_1: 950 },
        currentLevelId: 'level_2',
        lastLevelId: 'level_1',
        lastScore: 950,
        lastMoves: 8,
        lastTimeSeconds: 45,
      });

    const res = await request(app).get('/leaderboard/level_1');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].username).toBe('player1');
    expect(res.body.data[0].score).toBe(950);
    expect(res.body.data[0].levelId).toBe('level_1');
    expect(res.body.data[0].moves).toBe(8);
    expect(typeof res.body.data[0].rankedAt).toBe('string');
  }, TIMEOUT);

  it('GET /leaderboard/:levelId returns empty array when the level has no entries', async () => {
    const res = await request(app).get('/leaderboard/level_without_entries');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
  }, TIMEOUT);

  it('GET /leaderboard/:levelId respects the limit query param', async () => {
    const player1 = await request(app)
      .post('/auth/register')
      .send({ username: 'player1', email: 'player1@example.com', password: 'password123' });
    const player2 = await request(app)
      .post('/auth/register')
      .send({ username: 'player2', email: 'player2@example.com', password: 'password123' });

    await request(app)
      .put('/progress')
      .set('Authorization', `Bearer ${player1.body.data.token}`)
      .send({
        completedLevels: ['level_1'],
        bestScores: { level_1: 900 },
        currentLevelId: 'level_2',
        lastLevelId: 'level_1',
        lastScore: 900,
      });
    await request(app)
      .put('/progress')
      .set('Authorization', `Bearer ${player2.body.data.token}`)
      .send({
        completedLevels: ['level_1'],
        bestScores: { level_1: 800 },
        currentLevelId: 'level_2',
        lastLevelId: 'level_1',
        lastScore: 800,
      });

    const res = await request(app).get('/leaderboard/level_1?limit=1');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].username).toBe('player1');
  }, TIMEOUT);

  it('returns a single row with the best score when the same player syncs the same level twice', async () => {
    // levelId único para no chocar con la caché del leaderboard (TTL 30s,
    // clave lb:<levelId>:<limit>) de tests anteriores que ya consultaron level_1.
    const uniqueLevelId = `level_dedup_${Date.now()}`;

    const registerRes = await request(app)
      .post('/auth/register')
      .send({ username: 'player1', email: 'player1@example.com', password: 'password123' });
    const token: string = registerRes.body.data.token;

    await request(app)
      .put('/progress')
      .set('Authorization', `Bearer ${token}`)
      .send({
        completedLevels: [uniqueLevelId],
        bestScores: { [uniqueLevelId]: 700 },
        currentLevelId: uniqueLevelId,
        lastLevelId: uniqueLevelId,
        lastScore: 700,
        lastMoves: 12,
        lastTimeSeconds: 40,
      });

    await request(app)
      .put('/progress')
      .set('Authorization', `Bearer ${token}`)
      .send({
        completedLevels: [uniqueLevelId],
        bestScores: { [uniqueLevelId]: 950 },
        currentLevelId: uniqueLevelId,
        lastLevelId: uniqueLevelId,
        lastScore: 950,
        lastMoves: 8,
        lastTimeSeconds: 30,
      });

    const res = await request(app).get(`/leaderboard/${uniqueLevelId}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].username).toBe('player1');
    expect(res.body.data[0].score).toBe(950);
  }, TIMEOUT);
});
