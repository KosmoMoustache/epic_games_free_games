import * as dotenv from 'dotenv'
import z from 'zod'

dotenv.config()

const logger = console

const schema = {
  NODE_ENV: z.enum(['production', 'development']).default('production'),
  WEBHOOK_URL: z.string(),
  UPTIME_URL: z.string().optional(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  USE_CACHE: ZpreprocessBoolean().optional().default(false),
} as const

// biome-ignore lint/suspicious/noExplicitAny: not public use, use in get() which is type safe
const env: Record<string, any> = {}

type EnvVariable = keyof typeof schema

export function get<E extends EnvVariable>(
  variable: E,
): z.infer<(typeof schema)[E]> {
  return env[variable]
}

for (const [key, value] of Object.entries(schema)) {
  const v = process.env[key]
  try {
    const output = value.parse(v)
    env[key] = output
  } catch (e) {
    logger.error(
      `[${new Date().toISOString()}] [] error: ${key} env variable is missing`,
    )
    if (e instanceof z.ZodError) {
      for (const issue of e.issues) {
        logger.error(`-> ${issue.message}`)
      }
    }
    process.exit(1)
  }
}

export function ZpreprocessBoolean() {
  return z.preprocess((str: unknown) => {
    if (str === 'true') return true
    if (str === 'false') return false
    return undefined
  }, z.boolean())
}
