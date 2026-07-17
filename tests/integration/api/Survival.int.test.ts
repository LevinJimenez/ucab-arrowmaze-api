import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import { app, prisma } from '../../../src/app';

const TIMEOUT = 30_000;

async function cleanDb(): Promise<void> {
  await prisma.survivalEntry.deleteMany();
  await prisma.leaderboardEntry.deleteMany();
  await prisma.playerProgress.deleteMany();
  await prisma.user.deleteMany();
}

describe('Survival API — integration', () => {
  beforeEach(async () => {
    await cleanDb();
  }, TIMEOUT);

  afterAll(async () => {
    await cleanDb();
    await prisma.$disconnect();
  }, TIMEOUT);

  it('POST /survival without token returns 401', async () => {
    const res = await request(app)
      .post('/survival')
      .send({ boardsSolved: 7, durationSeconds: 120 });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  }, TIMEOUT);

  it('POST /survival records a run and GET /survival/leaderboard ranks it', async () => {
    const registerRes = await request(app)
      .post('/auth/register')
      .send({ username: 'player1', email: 'player1@example.com', password: 'password123' });
    const token: string = registerRes.body.data.token;

    const submitRes = await request(app)
      .post('/survival')
      .set('Authorization', `Bearer ${token}`)
      .send({ boardsSolved: 7, durationSeconds: 120, totalScore: 4200 });

    expect(submitRes.status).toBe(201);
    expect(submitRes.body.success).toBe(true);
    expect(submitRes.body.data.username).toBe('player1');
    expect(submitRes.body.data.boardsSolved).toBe(7);
    expect(submitRes.body.data.durationSeconds).toBe(120);
    expect(submitRes.body.data.totalScore).toBe(4200);
    expect(typeof submitRes.body.data.playedAt).toBe('string');

    const leaderboardRes = await request(app).get('/survival/leaderboard?durationSeconds=120');

    expect(leaderboardRes.status).toBe(200);
    expect(leaderboardRes.body.success).toBe(true);
    expect(leaderboardRes.body.data).toHaveLength(1);
    expect(leaderboardRes.body.data[0].username).toBe('player1');
    expect(leaderboardRes.body.data[0].boardsSolved).toBe(7);
  }, TIMEOUT);

  it('POST /survival with invalid body returns 422', async () => {
    const registerRes = await request(app)
      .post('/auth/register')
      .send({ username: 'player1', email: 'player1@example.com', password: 'password123' });
    const token: string = registerRes.body.data.token;

    const res = await request(app)
      .post('/survival')
      .set('Authorization', `Bearer ${token}`)
      .send({ boardsSolved: -1, durationSeconds: 0 });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  }, TIMEOUT);

  it('POST /survival persists a run without totalScore when not provided', async () => {
    const registerRes = await request(app)
      .post('/auth/register')
      .send({ username: 'player1', email: 'player1@example.com', password: 'password123' });
    const token: string = registerRes.body.data.token;

    const res = await request(app)
      .post('/survival')
      .set('Authorization', `Bearer ${token}`)
      .send({ boardsSolved: 3, durationSeconds: 60 });

    expect(res.status).toBe(201);
    expect(res.body.data.totalScore).toBeUndefined();
  }, TIMEOUT);

  it('GET /survival/leaderboard returns empty array when no runs exist for that duration', async () => {
    const res = await request(app).get('/survival/leaderboard?durationSeconds=180');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
  }, TIMEOUT);

  it('GET /survival/leaderboard without durationSeconds returns 422', async () => {
    const res = await request(app).get('/survival/leaderboard');

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  }, TIMEOUT);

  it('returns a single row with the best run when the same player submits two runs for the same duration', async () => {
    // durationSeconds único para no chocar con corridas de otros tests en el
    // mismo archivo (GetSurvivalLeaderboardUseCase no lleva caché, pero los
    // datos de otros tests en la misma duración sí contaminarían el conteo).
    const uniqueDuration = 121;

    const registerRes = await request(app)
      .post('/auth/register')
      .send({ username: 'player1', email: 'player1@example.com', password: 'password123' });
    const token: string = registerRes.body.data.token;

    await request(app)
      .post('/survival')
      .set('Authorization', `Bearer ${token}`)
      .send({ boardsSolved: 4, durationSeconds: uniqueDuration });
    await request(app)
      .post('/survival')
      .set('Authorization', `Bearer ${token}`)
      .send({ boardsSolved: 9, durationSeconds: uniqueDuration });

    const res = await request(app).get(`/survival/leaderboard?durationSeconds=${uniqueDuration}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].username).toBe('player1');
    expect(res.body.data[0].boardsSolved).toBe(9);
  }, TIMEOUT);

  it('GET /survival/leaderboard respects the limit query param and ranks by boardsSolved', async () => {
    const player1 = await request(app)
      .post('/auth/register')
      .send({ username: 'player1', email: 'player1@example.com', password: 'password123' });
    const player2 = await request(app)
      .post('/auth/register')
      .send({ username: 'player2', email: 'player2@example.com', password: 'password123' });

    await request(app)
      .post('/survival')
      .set('Authorization', `Bearer ${player1.body.data.token}`)
      .send({ boardsSolved: 9, durationSeconds: 120 });
    await request(app)
      .post('/survival')
      .set('Authorization', `Bearer ${player2.body.data.token}`)
      .send({ boardsSolved: 5, durationSeconds: 120 });

    const res = await request(app).get('/survival/leaderboard?durationSeconds=120&limit=1');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].username).toBe('player1');
  }, TIMEOUT);
});
