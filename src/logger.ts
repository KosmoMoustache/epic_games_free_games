/* eslint-disable @typescript-eslint/no-explicit-any */
import winston from 'winston';
const { combine, timestamp, prettyPrint, errors, printf } = winston.format;

const defaultLogger = [
  timestamp(),
  prettyPrint(),
  errors({ stack: true }),
  printf((info) => {
    return `[${info.timestamp}] ${info.level}: ${info.message} ${
      info.keys ? JSON.stringify(info.keys) : null
    }`;
  }),
];

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      format: combine(...defaultLogger),
    }),
  ],
});

if (process.env.NODE_ENV === 'production') {
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
    })
  );
}

class Logger {
  static debug(message: string, ...args: any[]) {
    logger.debug(message, { keys: args });
  }

  static info(message: string, ...args: any[]) {
    logger.info(message, { keys: args });
  }

  static warn(message: string, ...args: any[]) {
    logger.warn(message, { keys: args });
  }

  static error(message: string, ...args: any[]) {
    logger.error(message, { keys: args });
  }

  get logger() {
    return logger;
  }
}

export default Logger;
