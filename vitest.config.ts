import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    // Evita que el CI quede rojo en fases tempranas sin tests aún.
    // Cuando una capa tenga tests, se ejecutan con normalidad.
    passWithNoTests: true,
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
        'src/application/factories/**',
        'src/infrastructure/strategies/**',
        'src/infrastructure/decorators/**',
        'src/infrastructure/services/**',
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
});
