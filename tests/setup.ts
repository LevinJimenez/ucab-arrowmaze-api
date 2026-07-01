import 'dotenv/config';
// Fuerza NODE_ENV=test para que app.ts NO levante el listener al importarse
// en los tests de integración. Las variables de integración (CI) se respetan.
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET ??= 'test-secret-key-minimum-16-chars';
process.env.JWT_EXPIRES_IN ??= '30d';
process.env.DATABASE_URL ??= 'postgresql://test:test@localhost:5432/arrowmaze_test';
process.env.DIRECT_URL ??= process.env.DATABASE_URL;
