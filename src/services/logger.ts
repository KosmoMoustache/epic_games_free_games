import winston, { type LeveledLogMethod } from 'winston'
import { get } from './env.ts'

const { combine, timestamp, errors, printf, colorize } = winston.format

const defaultLogger = [
  timestamp({ format: 'YYYY-MM-DDTHH:mm:ss' }),
  errors({ stack: true }),
  printf(info => {
    const metadata =
      info[Symbol.for('splat')] && Array.isArray(info[Symbol.for('splat')])
        ? JSON.stringify(info[Symbol.for('splat')])
        : ''
    return `[${info.timestamp}] [${info.label || 'DEFAULT'}/${info.level.toUpperCase()}]: ${info.message} ${metadata}`
  }),
]

const rotation_filename = () => {
  const a = new Date().toISOString().split('T')[0]
  return a?.slice(0, a.length - 3)
}

const baseLogger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      level: get('LOG_LEVEL'),
      format: combine(...[...defaultLogger, colorize({ all: true })]),
    }),
    new winston.transports.File({
      dirname: 'logs',
      filename: 'error.log',
      level: 'error',
      format: combine(...defaultLogger),
    }),
    new winston.transports.File({
      dirname: 'logs',
      filename: `${rotation_filename()}.log`,
      level: get('LOG_LEVEL'),
      format: combine(...defaultLogger),
    }),
  ],
})

baseLogger.info('Logger initialized')

class Logger {
  #logger: winston.Logger
  constructor(label = 'default') {
    this.#logger = baseLogger.child({ label })
  }

  static getLogger(label: string) {
    return new Logger(label)
  }

  get name() {
    return this.#logger.profile.name
  }

  info: LeveledLogMethod = (...args) => this.#logger.info(...args)
  warn: LeveledLogMethod = (...args) => this.#logger.warn(...args)
  error: LeveledLogMethod = (...args) => this.#logger.error(...args)
  debug: LeveledLogMethod = (...args) => this.#logger.debug(...args)
  verbose: LeveledLogMethod = (...args) => this.#logger.verbose(...args)

  table(...args: Parameters<Console['table']>) {
    this.#logger.info('Table:')
    console.table(...args)
  }

  get logger() {
    return this.#logger
  }
}

export default Logger
