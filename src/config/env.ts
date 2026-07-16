import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url().optional(), // Solo necesario para migraciones (Supabase)
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default('30d'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  ANTHROPIC_API_KEY: z.string().optional(),
  // Defaults alineados con la configuración verificada contra la API real
  // (ver .env.docker). El modelo importa: como NO se envía `thinking`, en
  // claude-sonnet-5 el adaptativo queda ENCENDIDO (lo que se midió y afinó),
  // mientras que en la familia Opus 4.7/4.8 omitirlo lo dejaría APAGADO.
  LLM_MODEL: z.string().default('claude-sonnet-5'),
  // 120 s: con effort=low las llamadas van a ~10-25 s, pero sin effort el
  // adaptativo a effort=high por defecto llega a 45-85 s. 30 s se quedaba corto.
  LLM_TIMEOUT_MS: z.coerce.number().int().positive().default(120000),
  // Opcional: no todos los modelos aceptan output_config.effort (Haiku 4.5 lo
  // rechaza). Si está definido se envía tal cual; si no, se omite el campo.
  LLM_EFFORT: z.enum(['low', 'medium', 'high']).optional(),
});

export const env = envSchema.parse(process.env);
