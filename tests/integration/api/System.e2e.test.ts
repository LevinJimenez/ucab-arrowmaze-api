import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../../src/app';

const TIMEOUT = 15_000;

describe('System — smoke tests (DB-free)', () => {
  it('GET /health returns 200 with status and timestamp', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(typeof res.body.timestamp).toBe('string');
  }, TIMEOUT);
});
