"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logError = exports.devDebug = exports.devWarn = exports.devInfo = exports.devLog = exports.logger = void 0;
const isDevelopment = process.env.NODE_ENV !== 'production';
const isProduction = process.env.NODE_ENV === 'production';
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
    constructor() {
        this.enabled = isDevelopment;
        this.showTimestamps = true;
    }
    getTimestamp() {
        if (!this.showTimestamps)
            return '';
        const now = new Date();
        return `[${now.toISOString()}]`;
    }
    formatMessage(level, color, ...args) {
        const timestamp = this.getTimestamp();
        const prefix = `${color}${timestamp} ${level}${colors.reset}`;
        console.log(prefix, ...args);
    }
    log(...args) {
        if (this.enabled) {
            const timestamp = this.getTimestamp();
            console.log(`${colors.dim}${timestamp}${colors.reset}`, ...args);
        }
    }
    info(...args) {
        if (this.enabled) {
            this.formatMessage('ℹ️ INFO', colors.cyan, ...args);
        }
    }
    success(...args) {
        if (this.enabled) {
            this.formatMessage('✅ SUCCESS', colors.green, ...args);
        }
    }
    warn(...args) {
        if (this.enabled) {
            this.formatMessage('⚠️  WARN', colors.yellow, ...args);
        }
    }
    error(...args) {
        this.formatMessage('❌ ERROR', colors.red, ...args);
    }
    debug(...args) {
        if (this.enabled) {
            this.formatMessage('🐛 DEBUG', colors.magenta, ...args);
        }
    }
    http(method, path, statusCode) {
        if (this.enabled) {
            const status = statusCode || 0;
            const statusColor = status >= 500 ? colors.red :
                status >= 400 ? colors.yellow :
                    status >= 300 ? colors.cyan :
                        status >= 200 ? colors.green : colors.white;
            this.formatMessage(`🌐 HTTP`, colors.blue, `${method} ${path}`, statusCode ? `${statusColor}${statusCode}${colors.reset}` : '');
        }
    }
    db(...args) {
        if (this.enabled) {
            this.formatMessage('💾 DB', colors.blue, ...args);
        }
    }
    group(label) {
        if (this.enabled) {
            console.group(`${colors.bright}${label}${colors.reset}`);
        }
    }
    groupEnd() {
        if (this.enabled) {
            console.groupEnd();
        }
    }
    table(data) {
        if (this.enabled) {
            console.table(data);
        }
    }
    time(label) {
        if (this.enabled) {
            console.time(`⏱️  ${label}`);
        }
    }
    timeEnd(label) {
        if (this.enabled) {
            console.timeEnd(`⏱️  ${label}`);
        }
    }
    trace(...args) {
        if (this.enabled) {
            console.trace(...args);
        }
    }
    setTimestamps(enabled) {
        this.showTimestamps = enabled;
    }
    enable() {
        this.enabled = true;
    }
    disable() {
        this.enabled = false;
    }
    isEnabled() {
        return this.enabled;
    }
    getEnvironment() {
        return process.env.NODE_ENV || 'development';
    }
}
exports.logger = new ServerLogger();
exports.default = exports.logger;
exports.devLog = isDevelopment ? console.log.bind(console) : () => { };
exports.devInfo = isDevelopment ? console.info.bind(console) : () => { };
exports.devWarn = isDevelopment ? console.warn.bind(console) : () => { };
exports.devDebug = isDevelopment ? console.debug.bind(console) : () => { };
exports.logError = console.error.bind(console);
