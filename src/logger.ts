import winston from 'winston'
import { get } from './env.js'

const { combine, timestamp, prettyPrint, errors, printf, colorize } =
  winston.format

const defaultLogger = [
  timestamp(),
  prettyPrint(),
  colorize(),
  errors({ stack: true }),
  printf(info => {
    return `[${info.timestamp}] ${info.level}: ${info.message} ${
      info.keys ? JSON.stringify(info.keys) : null
    }`
  }),
]

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      level: get('NODE_ENV') === 'development' ? 'debug' : 'info',
      format: combine(...defaultLogger),
    }),
  ],
})

if (get('NODE_ENV') !== 'development') {
  logger.transports.push(
    new winston.transports.File({
      dirname: 'logs',
      filename: 'error.log',
      level: 'error',
      format: combine(...defaultLogger),
    }),
    new winston.transports.File({
      dirname: 'logs',
      filename: 'combined.log',
      level: 'info',
      format: combine(...defaultLogger),
    }),
  )
}

// TODO: Fix, empty square bracket or null at end of log message
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
