// client/src/utils/logger.ts
// Development Logger Utility - Automatically disabled in production

/**
 * Environment-aware logger that only logs in development mode
 *
 * Usage:
 * - logger.log('message', data) - General logging
 * - logger.info('message', data) - Info messages
 * - logger.warn('message', data) - Warnings
 * - logger.error('message', data) - Errors (always shown, even in production)
 * - logger.debug('message', data) - Debug messages
 */

const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

class Logger {
  private enabled: boolean;

  constructor() {
    this.enabled = isDevelopment;
  }

  /**
   * General log (only in development)
   */
  log(...args: any[]): void {
    if (this.enabled) {
      console.log(...args);
    }
  }

  /**
   * Info log (only in development)
   */
  info(...args: any[]): void {
    if (this.enabled) {
      console.info('ℹ️', ...args);
    }
  }

  /**
   * Warning log (only in development)
   */
  warn(...args: any[]): void {
    if (this.enabled) {
      console.warn('⚠️', ...args);
    }
  }

  /**
   * Error log (ALWAYS shown, even in production)
   * Errors should always be visible for debugging production issues
   */
  error(...args: any[]): void {
    console.error('❌', ...args);
  }

  /**
   * Debug log (only in development)
   */
  debug(...args: any[]): void {
    if (this.enabled) {
      console.debug('🐛', ...args);
    }
  }

  /**
   * Group logs together (only in development)
   */
  group(label: string): void {
    if (this.enabled) {
      console.group(label);
    }
  }

  groupEnd(): void {
    if (this.enabled) {
      console.groupEnd();
    }
  }

  /**
   * Collapsed group (only in development)
   */
  groupCollapsed(label: string): void {
    if (this.enabled) {
      console.groupCollapsed(label);
    }
  }

  /**
   * Table log (only in development)
   */
  table(data: any): void {
    if (this.enabled) {
      console.table(data);
    }
  }

  /**
   * Time measurement (only in development)
   */
  time(label: string): void {
    if (this.enabled) {
      console.time(label);
    }
  }

  timeEnd(label: string): void {
    if (this.enabled) {
      console.timeEnd(label);
    }
  }

  /**
   * Trace log (only in development)
   */
  trace(...args: any[]): void {
    if (this.enabled) {
      console.trace(...args);
    }
  }

  /**
   * Enable/disable logging programmatically
   */
  enable(): void {
    this.enabled = true;
  }

  disable(): void {
    this.enabled = false;
  }

  /**
   * Check if logger is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}

// Export singleton instance
export const logger = new Logger();

// Export as default for convenience
export default logger;

/**
 * Conditional logging based on environment
 */
export const devLog = isDevelopment ? console.log.bind(console) : () => {};
export const devInfo = isDevelopment ? console.info.bind(console) : () => {};
export const devWarn = isDevelopment ? console.warn.bind(console) : () => {};
export const devDebug = isDevelopment ? console.debug.bind(console) : () => {};

// Errors should always be logged
export const logError = console.error.bind(console);

/**
 * Usage examples:
 *
 * import logger from '@/utils/logger';
 *
 * logger.log('User logged in:', user);
 * logger.info('API request completed');
 * logger.warn('Deprecated function called');
 * logger.error('Failed to load data', error);
 * logger.debug('State updated:', state);
 *
 * // Group related logs
 * logger.group('User Authentication');
 * logger.log('Checking credentials...');
 * logger.log('User found');
 * logger.groupEnd();
 *
 * // Performance measurement
 * logger.time('API Request');
 * await fetchData();
 * logger.timeEnd('API Request');
 *
 * // Simple alternative
 * import { devLog } from '@/utils/logger';
 * devLog('This only shows in development');
 */
