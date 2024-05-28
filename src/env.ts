import * as dotenv from 'dotenv';
import z from 'zod';

dotenv.config();

const logger = console;

const schema = {
  NODE_ENV: z.enum(['production', 'development']).optional(),
  WEBHOOK_URL: z.string(),
  DEV: Zboolean(),
  AXIOS_DEBUG: z.string(),
} as const;

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const env: Record<string, any> = {};

type EnvVariable = keyof typeof schema;

export function get<E extends EnvVariable>(
  variable: E
): z.infer<(typeof schema)[E]> {
  return env[variable];
}

Object.entries(schema).forEach(([key, value]) => {
  const v = process.env[key];
  try {
    const output = value.parse(v);
    env[key] = output;
  } catch (e) {
    logger.error(
      `[${new Date().toISOString()}] [] error: ${key} env variable is missing`
    );
    if (e instanceof z.ZodError) {
      e.issues.forEach((issue) => {
        logger.error(`-> ${issue.message}`);
      });
    }
  }
});

export function Zboolean(defaultValue = false) {
  return z.preprocess((str: unknown) => {
    if (str === 'true') return true;
    if (str === 'false') return false;
    return undefined;
  }, z.boolean().optional().default(defaultValue));
}
