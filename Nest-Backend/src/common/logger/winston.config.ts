import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import * as path from 'path';

const logsDir = path.join(process.cwd(), 'logs');

// ─── Shared format: timestamp + level + message + metadata ────────────────────
const baseFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
);

// ─── JSON format for file transports ──────────────────────────────────────────
const fileFormat = winston.format.combine(
  baseFormat,
  winston.format.json(),
);

// ─── Colorized human-readable format for console ──────────────────────────────
const consoleFormat = winston.format.combine(
  baseFormat,
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, stack, context, ...meta }) => {
    const ctx = context ? `[${context}] ` : '';
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    const stackStr = stack ? `\n${stack}` : '';
    return `${timestamp} ${level} ${ctx}${message}${metaStr}${stackStr}`;
  }),
);

// ─── Error-only file transport (logs/error.log) ──────────────────────────────
const errorRotateTransport: DailyRotateFile = new DailyRotateFile({
  dirname: logsDir,
  filename: 'error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  maxSize: '5m',
  maxFiles: '14d',
  zippedArchive: true,
  format: fileFormat,
});

// ─── Combined file transport (logs/combined.log) ─────────────────────────────
const combinedRotateTransport: DailyRotateFile = new DailyRotateFile({
  dirname: logsDir,
  filename: 'combined-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '10m',
  maxFiles: '14d',
  zippedArchive: true,
  format: fileFormat,
});

// ─── Console transport ───────────────────────────────────────────────────────
const consoleTransport = new winston.transports.Console({
  format: consoleFormat,
});

// ─── Winston configuration object for nest-winston ───────────────────────────
export const winstonConfig: winston.LoggerOptions = {
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transports: [
    consoleTransport,
    errorRotateTransport,
    combinedRotateTransport,
  ],
  // Catch uncaught exceptions and unhandled rejections
  exceptionHandlers: [
    new DailyRotateFile({
      dirname: logsDir,
      filename: 'exceptions-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '5m',
      maxFiles: '7d',
      zippedArchive: true,
      format: fileFormat,
    }),
  ],
  rejectionHandlers: [
    new DailyRotateFile({
      dirname: logsDir,
      filename: 'rejections-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '5m',
      maxFiles: '7d',
      zippedArchive: true,
      format: fileFormat,
    }),
  ],
};
