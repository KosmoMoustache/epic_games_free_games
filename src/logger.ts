import winston from 'winston';
const { combine, timestamp, prettyPrint, errors, printf } = winston.format;

const defaultLogger = [
  timestamp(),
  prettyPrint(),
  errors({ stack: true }),
  printf((info) => {
    return `[${info.timestamp}] ${info.level}: ${info.message}`;
  }),
];

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      format: combine(...defaultLogger),
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
      format: combine(...defaultLogger),
    }),
  ],
});

export default logger;
