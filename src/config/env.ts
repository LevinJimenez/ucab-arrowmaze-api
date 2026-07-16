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
  LLM_MODEL: z.string().default('claude-opus-4-8'),
  LLM_TIMEOUT_MS: z.coerce.number().int().positive().default(30000),
  // Opcional: no todos los modelos aceptan output_config.effort (Haiku 4.5 lo
  // rechaza). Si está definido se envía tal cual; si no, se omite el campo.
  LLM_EFFORT: z.enum(['low', 'medium', 'high']).optional(),
});

export const env = envSchema.parse(process.env);
