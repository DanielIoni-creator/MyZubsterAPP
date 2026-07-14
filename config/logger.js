// config/logger.js
const winston = require('winston');
const path = require('path');

// Filtra i dati sensibili dai log
const sensitiveFilter = winston.format((info) => {
  // Non loggare password, token, seed, etc.
  const sensitiveFields = ['password', 'token', 'seed', 'privateKey', 'mnemonic'];
  if (info.meta) {
    Object.keys(info.meta).forEach(key => {
      if (sensitiveFields.includes(key)) {
        info.meta[key] = '[REDACTED]';
      }
    });
  }
  return info;
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    sensitiveFilter(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  transports: [
    // Log degli errori su file separato
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Log generale
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Log delle transazioni Monero
    new winston.transports.File({
      filename: 'logs/monero.log',
      level: 'info',
      maxsize: 5242880,
      maxFiles: 5,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: 'logs/exceptions.log',
      maxsize: 5242880,
      maxFiles: 5
    })
  ]
});

// In development, logga anche su console
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

module.exports = logger;