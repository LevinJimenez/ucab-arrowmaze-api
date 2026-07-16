import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../../src/app';

const TIMEOUT = 15_000;

describe('OpenAPI spec — smoke tests', () => {
  it('GET /api-docs.json returns a valid OpenAPI 3 document with all paths', async () => {
    const res = await request(app).get('/api-docs.json');

    expect(res.status).toBe(200);
    expect(res.body.openapi).toBe('3.0.0');
    expect(res.body.info.title).toBe('Arrow Maze API');

    const paths: Record<string, unknown> = res.body.paths;
    expect(paths['/auth/register']).toBeDefined();
    expect(paths['/auth/login']).toBeDefined();
    expect(paths['/progress']).toBeDefined();
    expect(paths['/leaderboard/{levelId}']).toBeDefined();
    expect(paths['/levels']).toBeDefined();
    expect(paths['/levels/{id}']).toBeDefined();
    expect(paths['/health']).toBeDefined();
  }, TIMEOUT);

  it('GET /api-docs/ returns HTML for Swagger UI', async () => {
    const res = await request(app).get('/api-docs/');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/html/);
  }, TIMEOUT);
});
