"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityConfig = exports.sessionConfig = exports.serverConfig = exports.config = void 0;
exports.validateEnvironment = validateEnvironment;
function validateEnvironment() {
    const required = [
        'DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'
    ];
    const missing = required.filter(key => !process.env[key]);
    if (missing.length > 0 && process.env.NODE_ENV === 'production') {
        console.error('❌ Missing required environment variables:');
        missing.forEach(key => console.error(`   ${key}`));
        console.error('🔧 Please set these in your .env file or environment');
        process.exit(1);
    }
    if (process.env.NODE_ENV === 'production') {
        console.log('✅ Environment validation passed (production mode)');
    }
}
const nodeEnv = process.env.NODE_ENV || 'development';
exports.config = {
    server: {
        port: parseInt(process.env.PORT || '8080'),
        nodeEnv,
        isDevelopment: nodeEnv === 'development',
        isProduction: nodeEnv === 'production',
        apiPrefix: '/api'
    },
    session: {
        secret: process.env.SESSION_SECRET || 'manufacturing_qc_super_secret_key_change_in_production_2025',
        name: 'qc.session.id',
        maxAge: 6 * 60 * 60 * 1000,
        secure: nodeEnv === 'production',
        httpOnly: true,
        sameSite: 'lax'
    },
    security: {
        corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:80',
        rateLimitEnabled: process.env.RATE_LIMIT_ENABLED !== 'false',
        rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000'),
        rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000')
    }
};
exports.serverConfig = exports.config.server;
exports.sessionConfig = exports.config.session;
exports.securityConfig = exports.config.security;
exports.default = exports.config;
