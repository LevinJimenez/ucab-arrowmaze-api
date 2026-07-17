#!/usr/bin/env node
/**
 * Siembra los niveles de campaña en la base de datos vía la API pública
 * (PUT /levels/:id), sin tocar Prisma ni la DB directamente — funciona contra
 * cualquier despliegue (local, Railway) sin conocer su DATABASE_URL.
 *
 * Uso:
 *   node scripts/seed-levels.mjs --levels <dir> [--api <baseUrl>]
 *
 *   --levels  Directorio con manifest.json + <id>.json (formato plano del
 *             cliente móvil: ucab-arrowmaze-mobile/assets/levels).
 *   --api     Base URL de la API. Default: http://localhost:3000.
 *
 * Credenciales (env o .env): SEED_EMAIL, SEED_PASSWORD, SEED_USERNAME.
 * Hace login; si la cuenta no existe la registra. PUT /levels/:id es
 * idempotente (upsert), así que el script puede correrse las veces que haga
 * falta.
 */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import process from 'node:process';

// Carga .env si existe (mismo comportamiento que la app; sin dependencias).
try {
  const dotenv = await import('dotenv');
  dotenv.config();
} catch {
  /* opcional */
}

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const API = (arg('api', 'http://localhost:3000')).replace(/\/$/, '');
const LEVELS_DIR = arg('levels', null);
const { SEED_EMAIL, SEED_PASSWORD, SEED_USERNAME } = process.env;

if (!LEVELS_DIR) {
  console.error('Falta --levels <dir> (p. ej. ../ucab-arrowmaze-mobile/assets/levels)');
  process.exit(1);
}
if (!SEED_EMAIL || !SEED_PASSWORD || !SEED_USERNAME) {
  console.error('Define SEED_EMAIL, SEED_PASSWORD y SEED_USERNAME (env o .env).');
  process.exit(1);
}

async function api(method, path, body, token) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const envelope = await res.json().catch(() => ({}));
  return { status: res.status, envelope };
}

async function authenticate() {
  const login = await api('POST', '/auth/login', {
    email: SEED_EMAIL,
    password: SEED_PASSWORD,
  });
  if (login.envelope.success) return login.envelope.data.token;

  console.log(`Login falló (${login.status}); registrando cuenta de seed...`);
  const register = await api('POST', '/auth/register', {
    username: SEED_USERNAME,
    email: SEED_EMAIL,
    password: SEED_PASSWORD,
  });
  if (!register.envelope.success) {
    throw new Error(`No se pudo autenticar: ${JSON.stringify(register.envelope)}`);
  }
  return register.envelope.data.token;
}

/** Formato plano del cliente → body del upsert (data = contrato intacto). */
function toUpsertBody(flat) {
  return {
    name: flat.name ?? flat.id,
    ...(flat.difficulty ? { difficulty: flat.difficulty } : {}),
    ...(flat.parMoves ? { parMoves: flat.parMoves } : {}),
    data: {
      cells: flat.cells,
      arrows: flat.arrows,
      ...(flat.lives != null ? { lives: flat.lives } : {}),
      ...(flat.timeLimitSeconds != null
        ? { timeLimitSeconds: flat.timeLimitSeconds }
        : {}),
    },
  };
}

const manifest = JSON.parse(
  await readFile(join(LEVELS_DIR, 'manifest.json'), 'utf8'),
);
const ids = manifest.levels;
console.log(`Sembrando ${ids.length} niveles en ${API} ...`);

const token = await authenticate();

let ok = 0;
for (const id of ids) {
  const flat = JSON.parse(await readFile(join(LEVELS_DIR, `${id}.json`), 'utf8'));
  const { status, envelope } = await api(
    'PUT',
    `/levels/${id}`,
    toUpsertBody(flat),
    token,
  );
  if (envelope.success) {
    ok++;
    console.log(`  ✔ ${id} (${flat.name})`);
  } else {
    console.error(`  ✘ ${id} → HTTP ${status}: ${JSON.stringify(envelope)}`);
  }
}

const check = await api('GET', '/levels');
console.log(
  `\nListo: ${ok}/${ids.length} sembrados. GET /levels ahora devuelve ` +
    `${check.envelope.data?.length ?? '?'} niveles.`,
);
process.exit(ok === ids.length ? 0 : 1);
