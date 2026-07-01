import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import { app, prisma } from '../../../src/app';

const TIMEOUT = 30_000;

async function cleanDb(): Promise<void> {
  await prisma.leaderboardEntry.deleteMany();
  await prisma.playerProgress.deleteMany();
  await prisma.user.deleteMany();
}

describe('Auth API — integration', () => {
  beforeEach(async () => {
    await cleanDb();
  }, TIMEOUT);

  afterAll(async () => {
    await cleanDb();
    await prisma.$disconnect();
  }, TIMEOUT);

  it('POST /auth/register returns 201 with token and user data', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ username: 'alice', email: 'alice@example.com', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.data.token).toBe('string');
    expect(res.body.data.user.email).toBe('alice@example.com');
    expect(res.body.data.user.username).toBe('alice');
  }, TIMEOUT);

  it('POST /auth/register with duplicate email returns 409', async () => {
    await request(app)
      .post('/auth/register')
      .send({ username: 'alice', email: 'alice@example.com', password: 'password123' });

    const res = await request(app)
      .post('/auth/register')
      .send({ username: 'bob', email: 'alice@example.com', password: 'password123' });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  }, TIMEOUT);

  it('POST /auth/login returns 200 with token', async () => {
    await request(app)
      .post('/auth/register')
      .send({ username: 'alice', email: 'alice@example.com', password: 'password123' });

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'alice@example.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.data.token).toBe('string');
    expect(res.body.data.user.email).toBe('alice@example.com');
  }, TIMEOUT);

  it('POST /auth/login with invalid credentials returns 401', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'nobody@example.com', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  }, TIMEOUT);
});
