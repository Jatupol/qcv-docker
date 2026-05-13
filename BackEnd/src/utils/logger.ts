// server/src/utils/logger.ts
// Server-side Logger Utility - Environment-aware logging

/**
 * Environment-aware logger for server-side code
 *
 * Features:
 * - Automatically disabled in production (based on NODE_ENV)
 * - Color-coded console output
 * - Timestamp support
 * - Log levels (debug, info, warn, error)
 * - Always logs errors even in production
 */

const isDevelopment = process.env.NODE_ENV !== 'production';
const isProduction = process.env.NODE_ENV === 'production';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

class ServerLogger {
  private enabled: boolean;
  private showTimestamps: boolean;

  constructor() {
    this.enabled = isDevelopment;
    this.showTimestamps = true;
  }

  /**
   * Get current timestamp
   */
  private getTimestamp(): string {
    if (!this.showTimestamps) return '';
    const now = new Date();
    return `[${now.toISOString()}]`;
  }

  /**
   * Format log message with color
   */
  private formatMessage(level: string, color: string, ...args: any[]): void {
    const timestamp = this.getTimestamp();
    const prefix = `${color}${timestamp} ${level}${colors.reset}`;
    console.log(prefix, ...args);
  }

  /**
   * General log (only in development)
   */
  log(...args: any[]): void {
    if (this.enabled) {
      const timestamp = this.getTimestamp();
      console.log(`${colors.dim}${timestamp}${colors.reset}`, ...args);
    }
  }

  /**
   * Info log (only in development)
   */
  info(...args: any[]): void {
    if (this.enabled) {
      this.formatMessage('ℹ️ INFO', colors.cyan, ...args);
    }
  }

  /**
   * Success log (only in development)
   */
  success(...args: any[]): void {
    if (this.enabled) {
      this.formatMessage('✅ SUCCESS', colors.green, ...args);
    }
  }

  /**
   * Warning log (only in development)
   */
  warn(...args: any[]): void {
    if (this.enabled) {
      this.formatMessage('⚠️  WARN', colors.yellow, ...args);
    }
  }

  /**
   * Error log (ALWAYS shown, even in production)
   */
  error(...args: any[]): void {
    this.formatMessage('❌ ERROR', colors.red, ...args);
  }

  /**
   * Debug log (only in development)
   */
  debug(...args: any[]): void {
    if (this.enabled) {
      this.formatMessage('🐛 DEBUG', colors.magenta, ...args);
    }
  }

  /**
   * HTTP request log (only in development)
   */
  http(method: string, path: string, statusCode?: number): void {
    if (this.enabled) {
      const status = statusCode || 0;
      const statusColor = status >= 500 ? colors.red :
                         status >= 400 ? colors.yellow :
                         status >= 300 ? colors.cyan :
                         status >= 200 ? colors.green : colors.white;

      this.formatMessage(
        `🌐 HTTP`,
        colors.blue,
        `${method} ${path}`,
        statusCode ? `${statusColor}${statusCode}${colors.reset}` : ''
      );
    }
  }

  /**
   * Database query log (only in development)
   */
  db(...args: any[]): void {
    if (this.enabled) {
      this.formatMessage('💾 DB', colors.blue, ...args);
    }
  }

  /**
   * Group logs together (only in development)
   */
  group(label: string): void {
    if (this.enabled) {
      console.group(`${colors.bright}${label}${colors.reset}`);
    }
  }

  groupEnd(): void {
    if (this.enabled) {
      console.groupEnd();
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
      console.time(`⏱️  ${label}`);
    }
  }

  timeEnd(label: string): void {
    if (this.enabled) {
      console.timeEnd(`⏱️  ${label}`);
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
   * Enable/disable timestamps
   */
  setTimestamps(enabled: boolean): void {
    this.showTimestamps = enabled;
  }

  /**
   * Enable/disable logging
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

  /**
   * Get current environment
   */
  getEnvironment(): string {
    return process.env.NODE_ENV || 'development';
  }
}

// Export singleton instance
export const logger = new ServerLogger();

// Export as default for convenience
export default logger;

// Simple conditional logging functions
export const devLog = isDevelopment ? console.log.bind(console) : () => {};
export const devInfo = isDevelopment ? console.info.bind(console) : () => {};
export const devWarn = isDevelopment ? console.warn.bind(console) : () => {};
export const devDebug = isDevelopment ? console.debug.bind(console) : () => {};

// Errors should always be logged
export const logError = console.error.bind(console);

/**
 * Usage examples:
 *
 * import logger from './utils/logger';
 *
 * // Basic logging (only in development)
 * logger.log('Server started');
 * logger.info('User authenticated:', userId);
 * logger.warn('Deprecated API endpoint called');
 * logger.error('Database connection failed', error); // Always shown
 * logger.debug('Request payload:', req.body);
 *
 * // HTTP logging
 * logger.http('GET', '/api/users', 200);
 *
 * // Database logging
 * logger.db('Query executed:', query);
 *
 * // Performance measurement
 * logger.time('Database Query');
 * await db.query(sql);
 * logger.timeEnd('Database Query');
 *
 * // Group related logs
 * logger.group('User Creation Process');
 * logger.log('Validating input...');
 * logger.log('Hashing password...');
 * logger.log('Saving to database...');
 * logger.groupEnd();
 */
