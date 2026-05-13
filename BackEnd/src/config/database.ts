// server/src/config/database.ts
// Simple Database Configuration - Complete Separation Entity Architecture
// Manufacturing Quality Control System - PostgreSQL Connection Pool
// All configuration values read from .env file

import { Pool, PoolConfig, types } from 'pg';
import { createDrizzleDb, DrizzleDb } from '../db';
import { logDrizzleStatus } from './features';

// PostgreSQL OID 1114 = timestamp without timezone
// By default, pg driver's parser can misinterpret timestamps causing timezone shifts
// Parse explicitly as local time components to ensure correct Date objects
types.setTypeParser(1114, (str: string) => {
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?$/);
  if (match) {
    const [, year, month, day, hours, minutes, seconds, ms] = match;
    return new Date(
      parseInt(year), parseInt(month) - 1, parseInt(day),
      parseInt(hours), parseInt(minutes), parseInt(seconds),
      ms ? parseInt(ms.substring(0, 3)) : 0
    );
  }
  return new Date(str);
});

/**
 * Simple Database Configuration
 *
 * All database configuration is read from .env file.
 * This is the single source of truth for database settings.
 */

// ==================== DATABASE CONFIGURATION ====================

/**
 * Database connection pool configuration from .env
 */
const databaseConfig: PoolConfig = {
  // Basic connection settings from .env
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,

  // Pool settings from .env with defaults
  max: parseInt(process.env.DB_MAX_CONNECTIONS || '20'),
  min: 2,
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30000'),

  // Query timeout
  query_timeout: parseInt(process.env.DB_QUERY_TIMEOUT || '60000'),

  // Connection retry settings
  statement_timeout: parseInt(process.env.DB_STATEMENT_TIMEOUT || '60000'),

  // SSL configuration from .env
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
};

// ==================== CONNECTION POOL ====================

/**
 * Global database connection pool
 */
let pool: Pool | null = null;

/**
 * Global Drizzle database instance
 */
let drizzleDb: DrizzleDb | null = null;

/**
 * Create database connection pool
 * 
 * Simple factory function that creates a PostgreSQL connection pool.
 */
export function createDatabasePool(): Pool {
  if (pool) {
    return pool;
  }

  // Create connection pool
  pool = new Pool(databaseConfig);

  // Simple error handling
  pool.on('error', (err) => {
    console.error('❌ Database pool error:', err.message);
  });

  // Log successful creation
  console.log('✅ Database pool created');
  console.log(`   📍 ${databaseConfig.host}:${databaseConfig.port}/${databaseConfig.database}`);

  return pool;
}

/**
 * Get existing database pool
 */
export function getDatabasePool(): Pool {
  if (!pool) {
    return createDatabasePool();
  }
  return pool;
}

/**
 * Close database pool
 */
export async function closeDatabasePool(): Promise<void> {
  if (pool) {
    console.log('🔄 Closing database pool...');
    await pool.end();
    pool = null;
    console.log('✅ Database pool closed');
  }
}

/**
 * Test database connection
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const dbPool = getDatabasePool();
    const client = await dbPool.connect();
    
    try {
      await client.query('SELECT NOW()');
      console.log('✅ Database connection test passed');
      return true;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    return false;
  }
}

// ==================== DRIZZLE ORM ====================

/**
 * Initialize Drizzle ORM
 * Creates Drizzle instance using existing pg Pool
 */
export function initializeDrizzle(): DrizzleDb {
  if (drizzleDb) {
    return drizzleDb;
  }

  const dbPool = getDatabasePool();
  drizzleDb = createDrizzleDb(dbPool);
  logDrizzleStatus();

  return drizzleDb;
}

/**
 * Get existing Drizzle database instance
 */
export function getDrizzle(): DrizzleDb {
  if (!drizzleDb) {
    return initializeDrizzle();
  }
  return drizzleDb;
}

// ==================== EXPORTS ====================

/**
 * Default export
 */
export default createDatabasePool;