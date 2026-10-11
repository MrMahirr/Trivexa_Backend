import * as winston from 'winston';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import 'winston-daily-rotate-file';

/**
 * Sensitive Data Masking Format
 * Masks passwords, tokens, and other sensitive information in logs
 */
const maskSensitiveData = winston.format((info) => {
  const sensitiveFields = [
    'password',
    'token',
    'accessToken',
    'refreshToken',
    'authorization',
    'cookie',
    'secret',
    'apiKey',
    'creditCard',
    'ssn',
  ];

  const maskValue = (obj: any): any => {
    if (!obj || typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) {
      return obj.map(maskValue);
    }

    const masked = { ...obj };
    for (const key of Object.keys(masked)) {
      const lowerKey = key.toLowerCase();

      // Check if key contains sensitive field name
      if (sensitiveFields.some((field) => lowerKey.includes(field.toLowerCase()))) {
        masked[key] = '***REDACTED***';
      } else if (typeof masked[key] === 'object') {
        masked[key] = maskValue(masked[key]);
      }
    }

    return masked;
  };

  info = maskValue(info);
  return info;
});

/**
 * Production Winston Configuration
 */
const productionTransports: winston.transport[] = [
  // Console output (JSON format for log aggregation)
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      maskSensitiveData(),
      winston.format.errors({ stack: true }),
      winston.format.json(),
    ),
  }),

  // Error logs with daily rotation
  new winston.transports.DailyRotateFile({
    filename: 'logs/error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    maxSize: '20m',
    maxFiles: '30d',
    zippedArchive: true,
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      maskSensitiveData(),
      winston.format.errors({ stack: true }),
      winston.format.json(),
    ),
  }),

  // Combined logs with daily rotation
  new winston.transports.DailyRotateFile({
    filename: 'logs/combined-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
    zippedArchive: true,
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      maskSensitiveData(),
      winston.format.json(),
    ),
  }),

  // Application logs (info and above) with daily rotation
  new winston.transports.DailyRotateFile({
    filename: 'logs/app-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    level: 'info',
    maxSize: '20m',
    maxFiles: '7d',
    zippedArchive: true,
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      maskSensitiveData(),
      winston.format.json(),
    ),
  }),
];

/**
 * Development Winston Configuration
 */
const developmentTransports: winston.transport[] = [
  // Console output (pretty format for development)
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp({ format: 'HH:mm:ss' }),
      winston.format.ms(),
      nestWinstonModuleUtilities.format.nestLike('Trivexa', {
        colors: true,
        prettyPrint: true,
      }),
    ),
  }),

  // Error logs (not rotated in dev)
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      maskSensitiveData(),
      winston.format.errors({ stack: true }),
      winston.format.json(),
    ),
  }),

  // Combined logs (not rotated in dev)
  new winston.transports.File({
    filename: 'logs/combined.log',
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    format: winston.format.combine(
      winston.format.timestamp(),
      maskSensitiveData(),
      winston.format.json(),
    ),
  }),
];

/**
 * Get Winston Configuration based on environment
 */
export const getWinstonConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
    transports: isProduction ? productionTransports : developmentTransports,
    exitOnError: false,
    // Silent mode for tests
    silent: process.env.NODE_ENV === 'test',
  };
};

// Backward compatibility
export const winstonConfig = getWinstonConfig();
