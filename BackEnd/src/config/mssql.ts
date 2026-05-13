// server/src/config/mssql.ts
// MSSQL Database Configuration
// Manufacturing Quality Control System - MSSQL Connection Pool

import * as sql from 'mssql';
import { config as SqlConfig, ConnectionPool } from 'mssql';
import { Pool as PgPool } from 'pg';

/**
 * MSSQL Database Configuration
 *
 * Connection configuration for importing data from MSSQL database.
 * Configuration is fetched from sysconfig table in PostgreSQL.
 */

// ==================== INTERFACE ====================

export interface MssqlConfig {
  server: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

// ==================== MSSQL CONFIGURATION ====================

/**
 * Fetch MSSQL configuration from sysconfig table
 */
async function getMssqlConfigFromSysconfig(pgPool: PgPool): Promise<MssqlConfig | null> {
  try {
    console.log('🔧 Fetching MSSQL config from sysconfig table...');

    const result = await pgPool.query(`
      SELECT
        mssql_server,
        mssql_port,
        mssql_database,
        mssql_username,
        mssql_password
      FROM sysconfig
      ORDER BY id DESC
      LIMIT 1
    `);

    console.log(`📋 Found ${result.rows.length} active sysconfig records`);

    if (result.rows.length === 0) {
      console.error('❌ No active sysconfig found in database');
      return null;
    }

    const config = result.rows[0];
    console.log('📋 Sysconfig MSSQL settings:', {
      server: config.mssql_server || '(empty)',
      port: config.mssql_port || '(default: 1433)',
      database: config.mssql_database || '(empty)',
      username: config.mssql_username || '(empty)',
      hasPassword: !!config.mssql_password
    });

    // Validate required fields
    if (!config.mssql_server || !config.mssql_database || !config.mssql_username) {
      const missingFields = [];
      if (!config.mssql_server) missingFields.push('server');
      if (!config.mssql_database) missingFields.push('database');
      if (!config.mssql_username) missingFields.push('username');

      console.error('❌ Incomplete MSSQL configuration in sysconfig');
      console.error(`   Missing required fields: ${missingFields.join(', ')}`);
      return null;
    }

    console.log('✅ Valid MSSQL configuration found in sysconfig table');
    return {
      server: config.mssql_server,
      port: parseInt(config.mssql_port) || 1433,
      database: config.mssql_database,
      user: config.mssql_username,
      password: config.mssql_password || ''
    };
  } catch (error) {
    console.error('❌ Error fetching MSSQL config from sysconfig:', error);
    return null;
  }
}

/**
 * Get MSSQL connection configuration
 * REQUIRES configuration from sysconfig table - no fallback to environment variables
 */
async function getMssqlConnectionConfig(pgPool?: PgPool): Promise<SqlConfig> {
  console.log('🔧 getMssqlConnectionConfig: pgPool provided?', !!pgPool);

  // pgPool is required to fetch config from sysconfig table
  if (!pgPool) {
    const error = 'PostgreSQL pool is required to fetch MSSQL configuration from sysconfig table';
    console.error('❌', error);
    throw new Error(error);
  }

  // Get config from sysconfig table
  const config = await getMssqlConfigFromSysconfig(pgPool);

  // Configuration must be complete in sysconfig table
  if (!config) {
    const error = 'MSSQL configuration not found or incomplete in sysconfig table. Please configure MSSQL settings in System Setup.';
    console.error('❌', error);
    throw new Error(error);
  }

  console.log('✅ Using MSSQL configuration from sysconfig:', {
    server: config.server,
    port: config.port,
    database: config.database,
    user: config.user
  });

  return {
    server: config.server,
    port: config.port,
    database: config.database,
    user: config.user,
    password: config.password,
    options: {
      encrypt: false, // Set to true for Azure SQL
      trustServerCertificate: true, // Set to true for self-signed certificates
      enableArithAbort: true,
      connectTimeout: 30000, // 30 seconds
      requestTimeout: 30000, // 30 seconds
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000
    }
  };
}

// ==================== CONNECTION POOL ====================

/**
 * Global MSSQL connection pool
 */
let pool: ConnectionPool | null = null;
let currentConfig: SqlConfig | null = null;

/**
 * Create MSSQL connection pool with dynamic configuration
 * @param pgPool - PostgreSQL pool to fetch config from sysconfig table
 */
export async function createMssqlPool(pgPool?: PgPool): Promise<ConnectionPool> {
  const config = await getMssqlConnectionConfig(pgPool);

  // Check if config has changed
  const configChanged = currentConfig && (
    currentConfig.server !== config.server ||
    currentConfig.port !== config.port ||
    currentConfig.database !== config.database ||
    currentConfig.user !== config.user
  );

  // Close existing pool if config changed
  if (configChanged && pool) {
    console.log('🔄 MSSQL configuration changed, closing existing pool...');
    await pool.close();
    pool = null;
  }

  // Return existing pool if already connected
  if (pool && pool.connected) {
    return pool;
  }

  try {
    pool = new sql.ConnectionPool(config);
    await pool.connect();
    currentConfig = config;

    console.log('✅ MSSQL pool created and connected');
    console.log(`   📍 ${config.server}:${config.port}/${config.database}`);

    // Handle pool errors
    pool.on('error', (err) => {
      console.error('❌ MSSQL pool error:', err.message);
    });

    return pool;
  } catch (error) {
    console.error('❌ Failed to create MSSQL pool:', error);
    throw error;
  }
}

/**
 * Get existing MSSQL pool or create new one
 * @param pgPool - PostgreSQL pool to fetch config from sysconfig table
 */
export async function getMssqlPool(pgPool?: PgPool): Promise<ConnectionPool> {
  if (!pool || !pool.connected) {
    return await createMssqlPool(pgPool);
  }
  return pool;
}

/**
 * Close MSSQL pool
 */
export async function closeMssqlPool(): Promise<void> {
  if (pool) {
    console.log('🔄 Closing MSSQL pool...');
    await pool.close();
    pool = null;
    currentConfig = null;
    console.log('✅ MSSQL pool closed');
  }
}

/**
 * Test MSSQL connection
 * @param pgPool - PostgreSQL pool to fetch config from sysconfig table
 * @returns Object with success status and error details
 */
export async function testMssqlConnection(pgPool?: PgPool): Promise<{
  success: boolean;
  error?: string;
  details?: any;
}> {
  try {
    console.log('🔧 testMssqlConnection: Starting connection test...');

    const mssqlPool = await getMssqlPool(pgPool);
    console.log('✅ testMssqlConnection: MSSQL pool obtained');

    const result = await mssqlPool.request().query('SELECT GETDATE() as CurrentDateTime');
    console.log('✅ MSSQL connection test passed:', result.recordset[0]);

    return {
      success: true,
      details: result.recordset[0]
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorDetails = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : error;

    console.error('❌ MSSQL connection test failed:', errorMessage);
    console.error('❌ Error details:', errorDetails);

    return {
      success: false,
      error: errorMessage,
      details: errorDetails
    };
  }
}

// ==================== EXPORTS ====================

export default {
  createMssqlPool,
  getMssqlPool,
  closeMssqlPool,
  testMssqlConnection
};
