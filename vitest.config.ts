import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      // Solo se MIDE cobertura de las capas que cubren los tests UNIT.
      // Controllers, routes, factories, repos, services, wiring y config se
      // validan por integración (FASE 7), NO por cobertura unitaria; incluirlos
      // aquí hundiría el umbral con código que `test:coverage` (unit) no ejecuta.
      include: [
        'src/domain/**',
        'src/application/mappers/**',
        'src/application/middleware/**',
        'src/infrastructure/strategies/**',
        'src/infrastructure/decorators/**',
      ],
      thresholds: {
        // El núcleo de negocio (entidades + casos de uso) exige cobertura alta.
        'src/domain/**': { lines: 90, functions: 90, branches: 85, statements: 90 },
        // Umbral global para el resto del código cubierto por unit.
        lines: 85,
        functions: 85,
        branches: 80,
        statements: 85,
      },
    },
  },
  resolve: {
    alias: {
      '@domain': path.resolve(__dirname, 'src/domain'),
      '@application': path.resolve(__dirname, 'src/application'),
      '@infrastructure': path.resolve(__dirname, 'src/infrastructure'),
      '@config': path.resolve(__dirname, 'src/config'),
    },
  },
});
