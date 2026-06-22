// server/src/config/environment.ts
// Simplified Environment Configuration - Complete Separation Entity Architecture
// Manufacturing Quality Control System - Essential Configuration Only
// All configuration values read from .env file

/**
 * SIMPLIFIED ENVIRONMENT CONFIGURATION
 *
 * Single source of truth: server/.env file
 * ✅ Simple, direct configuration structure
 * ✅ No duplicate database configuration
 * ✅ All values from .env with sensible defaults
 * ✅ Essential features only for Manufacturing Quality Control
 */

// ==================== VALIDATION ====================

export function validateEnvironment(): void {
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

// ==================== CONFIGURATION ====================

export interface EnvironmentConfig {
  server: {
    port: number;
    nodeEnv: string;
    isDevelopment: boolean;
    isProduction: boolean;
    apiPrefix: string;
  };
  session: {
    secret: string;
    name: string;
    maxAge: number;
    secure: boolean;
    httpOnly: boolean;
    sameSite: 'strict' | 'lax' | 'none';
  };
  security: {
    corsOrigin: string;
    rateLimitEnabled: boolean;
    rateLimitMaxRequests: number;
    rateLimitWindowMs: number;
  };
}

const nodeEnv = process.env.NODE_ENV || 'development';

export const config: EnvironmentConfig = {
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
    maxAge: 6 * 60 * 60 * 1000, // 6 hours   
    secure: nodeEnv === 'production',
    httpOnly: true,
    sameSite: 'lax'
  },
  security: {
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:80',
    rateLimitEnabled: process.env.RATE_LIMIT_ENABLED !== 'false',
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000'),
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000') // 15 minutes
  }
};

// ==================== HELPER CONFIGS ====================

export const serverConfig = config.server;
export const sessionConfig = config.session;
export const securityConfig = config.security;

// ==================== EXPORTS ====================

export default config;

/**
 * CONFIGURATION NOTES:
 *
 * Database Configuration:
 * - All database settings are now in server/.env file
 * - Database connection pool is managed by server/src/config/database.ts
 * - No duplicate database configuration in this file
 *
 * Configuration Hierarchy:
 * 1. server/.env - Single source of truth for all settings
 * 2. server/src/config/database.ts - Database pool management
 * 3. server/src/config/environment.ts - Server, session, security config
 *
 * Usage:
 * - Import database pool from './config/database'
 * - Import server/session/security config from './config/environment'
 * - All values ultimately read from .env file
 */