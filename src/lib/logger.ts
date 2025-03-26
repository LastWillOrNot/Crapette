// utils/logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

const currentLogLevel: LogLevel = import.meta.env.DEV ? 'debug' : 'warn';

export const logger = {
  debug: (...args: any[]) => {
    if (LOG_LEVELS[currentLogLevel] <= LOG_LEVELS.debug) {
      console.debug('[DEBUG]', ...args);
    }
  },
  info: (...args: any[]) => {
    if (LOG_LEVELS[currentLogLevel] <= LOG_LEVELS.info) {
      console.info('[INFO]', ...args);
    }
  },
  warn: (...args: any[]) => {
    if (LOG_LEVELS[currentLogLevel] <= LOG_LEVELS.warn) {
      console.warn('[WARN]', ...args);
    }
  },
  error: (...args: any[]) => {
    if (LOG_LEVELS[currentLogLevel] <= LOG_LEVELS.error) {
      console.error('[ERROR]', ...args);
    }
  }
};