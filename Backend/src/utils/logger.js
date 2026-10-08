const winston = require('winston');
const Sentry = require('@sentry/node');

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
  });
}

const winstonLogger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console()
  ],
});

const logger = {
  info: (message, meta = {}) => {
    winstonLogger.info(message, meta);
  },

  error: (message, error = null) => {
    winstonLogger.error(message, { error: error instanceof Error ? error.message : error, stack: error?.stack });
    if (process.env.SENTRY_DSN) {
       if (error instanceof Error) Sentry.captureException(error);
       else Sentry.captureMessage(message);
    }
  },

  warn: (message, meta = {}) => {
    winstonLogger.warn(message, meta);
  },

  debug: (message, meta = {}) => {
    winstonLogger.debug(message, meta);
  },
};

module.exports = logger;
