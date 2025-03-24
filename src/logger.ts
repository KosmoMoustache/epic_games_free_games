import winston from 'winston'
import { get } from './env.ts'

const { combine, timestamp, prettyPrint, errors, printf, colorize } =
  winston.format

const defaultLogger = [
  timestamp(),
  prettyPrint(),
  errors({ stack: true }),
  printf(info => {
    return `[${info.timestamp}] ${info.level}: ${info.message} ${
      info.keys && Array.isArray(info.keys) && info.keys.length >= 1
        ? JSON.stringify(info.keys)
        : ''
    }`
  }),
]

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      level: get('LOG_LEVEL'),
      format: combine(...[colorize(), ...defaultLogger]),
    }),
    new winston.transports.File({
      dirname: 'logs',
      filename: 'error.log',
      level: 'error',
      format: combine(...defaultLogger),
    }),
    new winston.transports.File({
      dirname: 'logs',
      filename: 'combined.log',
      level: get('LOG_LEVEL'),
      format: combine(...defaultLogger),
    }),
  ],
})

class Logger {
  // biome-ignore lint/suspicious/noExplicitAny: winston take any as meta parameter
  static table(message: string, args: any[] | undefined) {
    logger.debug(`Table: ${message}`)
    console.table(args)
  }
  // biome-ignore lint/suspicious/noExplicitAny: winston take any as meta parameter
  static debug(message: string, ...args: any[]) {
    logger.debug(message, { keys: args })
  }

  // biome-ignore lint/suspicious/noExplicitAny: winston take any as meta parameter
  static info(message: string, ...args: any[]) {
    logger.info(message, { keys: args })
  }
  // biome-ignore lint/suspicious/noExplicitAny: winston take any as meta parameter
  static warn(message: string, ...args: any[]) {
    logger.warn(message, { keys: args })
  }
  // biome-ignore lint/suspicious/noExplicitAny: winston take any as meta parameter
  static error(message: string, ...args: any[]) {
    logger.error(message, { keys: args })
  }

  get logger() {
    return logger
  }
}

export default Logger
