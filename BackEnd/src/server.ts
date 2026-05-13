// server/src/server.ts
/**
 * Manufacturing Quality Control System - Server Entry Point
 * Single Source of Truth: server/.env file
 *
 * ✅ All configuration from .env file
 * ✅ No duplicate database configuration
 * ✅ Simplified config loading
 * ✅ Compatible with auto-discovery and session middleware
 */

// CRITICAL: Load .env file FIRST before any other imports
import dotenv from 'dotenv';
import path from 'path';

// Load .env from server directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import { Server } from 'http';
import { Pool } from 'pg';

// Import configuration - all values from .env
import { validateEnvironment } from './config/environment';
import { createDatabasePool, testDatabaseConnection, initializeDrizzle } from './config/database';

// Import the main app factory
import { createApp } from './app';

// Import sync scheduler
import { getSyncScheduler } from './services/syncScheduler';

// Import force logout scheduler (server-side enforcement of scheduled auto-logout)
import { getForceLogoutScheduler } from './services/forceLogoutScheduler';

// Import generic purge janitor (per-target retention policies)
import { getPurgeJanitor } from './services/purgeJanitor';

/**
 * Server Configuration from Environment
 */
const PORT = parseInt(process.env.PORT || '8080');
const HOST = process.env.HOST || '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Global instances for cleanup
 */
let server: Server;
let db: Pool;
let syncSchedulerStarted = false;
let forceLogoutSchedulerStarted = false;
let purgeJanitorStarted = false;

/**
 * Start Application Server with Configuration Loading
 */
async function startServer(): Promise<void> {
  try {
    console.log('🚀 Starting Manufacturing Quality Control Server...');
    console.log(`📍 Environment: ${NODE_ENV}`);
    console.log(`🌐 Server will start on: http://${HOST}:${PORT}`);
    console.log('');
    console.log('🔧 Environment Variables:');
    console.log(`   PORT: ${process.env.PORT}`);
    console.log(`   CORS_ORIGIN: ${process.env.CORS_ORIGIN}`);
    console.log(`   COOKIE_DOMAIN: ${process.env.COOKIE_DOMAIN || '(not set)'}`);
    console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
    console.log('');

    // ==================== STEP 1: VALIDATE ENVIRONMENT ====================
    
    console.log('🔧 Validating environment configuration...');
    try {
      validateEnvironment();
      console.log('✅ Environment configuration validated');
    } catch (error) {
      console.error('❌ Environment validation failed:', error);
      console.error('💡 Check your .env file and ensure all required variables are set');
      process.exit(1);
    }
    
    // ==================== STEP 2: DATABASE CONNECTION ====================
    
    console.log('🗄️ Establishing database connection...');
    try {
      // Create database pool using existing config
      db = createDatabasePool();
      
      // Test database connection
      const isConnected = await testDatabaseConnection();
      if (!isConnected) {
        throw new Error('Database connection test failed');
      }
      
      console.log('✅ Database connection established');
      console.log(`   📍 Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
      console.log(`   🏢 Database: ${process.env.DB_NAME}`);
      console.log(`   👤 User: ${process.env.DB_USER}`);

      // Initialize Drizzle ORM
      console.log('🔧 Initializing Drizzle ORM...');
      initializeDrizzle();

    } catch (error) {
      console.error('❌ Database connection failed:', error);
      console.error('💡 Ensure PostgreSQL is running and credentials are correct');
      console.error('💡 Check your .env file for database settings');
      process.exit(1);
    }

    // ==================== STEP 3: CREATE EXPRESS APP ====================
    
    console.log('📦 Creating Express application with all middleware...');
    try {
      // ✅ FIXED: Pass database pool to createApp as required
      const app = await createApp(db);
      console.log('✅ Express application created successfully');
      console.log('   🔐 Session middleware configured');
      console.log('   🛡️ Authentication middleware initialized'); 
      console.log('   🔍 Auto-discovery routes registered');
      
    } catch (error) {
      console.error('❌ Express app creation failed:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
      process.exit(1);
    }
    
    // ==================== STEP 4: START HTTP SERVER ====================
    
    console.log('🌐 Starting HTTP server...');
    try {
      const app = await createApp(db); // Re-create for server start
      
      server = app.listen(PORT, HOST, () => {
        console.log('\n🎉 Manufacturing Quality Control Server Started Successfully!');
        console.log('=' .repeat(60));
        console.log(`✅ Server running on: http://${HOST}:${PORT}`);
        console.log(`📊 Health check:     http://${HOST}:${PORT}/health`);
        console.log(`📋 API info:         http://${HOST}:${PORT}/api`);
        console.log('');
        console.log('🔐 Authentication Endpoints:');
        console.log(`   POST http://${HOST}:${PORT}/api/auth/login`);
        console.log(`   GET  http://${HOST}:${PORT}/api/auth/status`);
        console.log(`   POST http://${HOST}:${PORT}/api/auth/logout`);
        console.log('');
        console.log('👥 User Management Endpoints:');
        console.log(`   GET  http://${HOST}:${PORT}/api/users`);
        console.log(`   GET  http://${HOST}:${PORT}/api/users/:id`);
        console.log(`   POST http://${HOST}:${PORT}/api/users`);
        console.log(`   PUT  http://${HOST}:${PORT}/api/users/:id`);
        console.log('');
        console.log('🔧 Auto-Discovery: All entity routes registered automatically');
        console.log('🔒 Session-based authentication is active');
        console.log('=' .repeat(60));
      });
      
      // Setup graceful shutdown
      setupGracefulShutdown();

    } catch (error) {
      console.error('❌ HTTP server startup failed:', error);
      process.exit(1);
    }

    // ==================== STEP 5: START SYNC SCHEDULER ====================

    console.log('⏰ Starting Sync Scheduler...');
    try {
      const scheduler = getSyncScheduler(db);
      await scheduler.start();
      syncSchedulerStarted = true;
      console.log('✅ Sync Scheduler started');
      console.log(`   📊 Endpoint: http://${HOST}:${PORT}/api/scheduler/status`);
    } catch (error) {
      console.error('⚠️ Sync Scheduler failed to start:', error);
      console.error('💡 Manual sync is still available via API endpoints');
      // Don't exit - scheduler is not critical for server operation
    }

    // ==================== STEP 5b: START FORCE LOGOUT SCHEDULER ====================

    console.log('🔒 Starting Force Logout Scheduler...');
    try {
      const flScheduler = getForceLogoutScheduler(db);
      flScheduler.start();
      forceLogoutSchedulerStarted = true;
      console.log('✅ Force Logout Scheduler started');
    } catch (error) {
      console.error('⚠️ Force Logout Scheduler failed to start:', error);
      // Non-critical
    }

    // ==================== STEP 5c: START PURGE JANITOR ====================

    console.log('🧹 Starting Purge Janitor...');
    try {
      await getPurgeJanitor(db).start();
      purgeJanitorStarted = true;
      console.log('✅ Purge Janitor started');
    } catch (error) {
      console.error('⚠️ Purge Janitor failed to start:', error);
      // Non-critical
    }

    // ==================== STEP 6: SERVER ERROR HANDLING ====================
    
    server.on('error', (error: any) => {
      if (error.syscall !== 'listen') {
        throw error;
      }
      
      const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;
      
      switch (error.code) {
        case 'EACCES':
          console.error(`❌ ${bind} requires elevated privileges`);
          console.error('💡 Try running with sudo or use a port > 1024');
          process.exit(1);
          break;
          
        case 'EADDRINUSE':
          console.error(`❌ ${bind} is already in use`);
          console.error('💡 Another application is using this port');
          console.error('💡 Try changing PORT in your .env file or stop other services');
          console.error('💡 Use: lsof -ti:8080 | xargs kill to free the port');
          process.exit(1);
          break;
          
        default:
          throw error;
      }
    });
    
  } catch (error) {
    console.error('\n💥 SERVER STARTUP FAILED');
    console.error('=' .repeat(50));
    
    if (error instanceof Error) {
      console.error('❌ Error:', error.message);
      if (error.stack && NODE_ENV === 'development') {
        console.error('📋 Stack trace:', error.stack);
      }
    } else {
      console.error('❌ Unknown error:', error);
    }
    
    console.error('\n🔍 Troubleshooting:');
    console.error('1. Check server/.env file exists and has correct values');
    console.error('2. Ensure PostgreSQL is running with correct host/port');
    console.error('3. Verify database credentials in .env are correct');
    console.error('4. Make sure the configured port is not already in use');
    console.error('5. Check file permissions for config files');
    
    await cleanup();
    process.exit(1);
  }
}

/**
 * FIXED: Setup graceful shutdown handlers
 */
function setupGracefulShutdown(): void {
  const gracefulShutdown = async (signal: string) => {
    console.log(`\n🔄 Received ${signal}, shutting down gracefully...`);
    
    try {
      // Stop sync scheduler
      if (syncSchedulerStarted) {
        try {
          const scheduler = getSyncScheduler();
          scheduler.stop();
          console.log('✅ Sync Scheduler stopped');
        } catch (e) {
          console.log('⚠️ Sync Scheduler already stopped');
        }
      }

      // Stop force logout scheduler
      if (forceLogoutSchedulerStarted) {
        try {
          getForceLogoutScheduler().stop();
          console.log('✅ Force Logout Scheduler stopped');
        } catch (e) {
          console.log('⚠️ Force Logout Scheduler already stopped');
        }
      }

      // Stop purge janitor
      if (purgeJanitorStarted) {
        try {
          getPurgeJanitor().stop();
          console.log('✅ Purge Janitor stopped');
        } catch (e) {
          console.log('⚠️ Purge Janitor already stopped');
        }
      }

      // Close HTTP server
      if (server) {
        await new Promise<void>((resolve, reject) => {
          server.close((error) => {
            if (error) {
              reject(error);
            } else {
              console.log('✅ HTTP server closed');
              resolve();
            }
          });
        });
      }

      // Close database connections
      await cleanup();
      
      console.log('✅ Graceful shutdown complete');
      process.exit(0);
      
    } catch (error) {
      console.error('❌ Error during graceful shutdown:', error);
      process.exit(1);
    }
  };
  
  // Listen for termination signals
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

/**
 * Cleanup function for database and other resources
 */
async function cleanup(): Promise<void> {
  try {
    if (db) {
      console.log('🔄 Closing database connections...');
      await db.end();
      console.log('✅ Database connections closed');
    }
  } catch (error) {
    console.error('⚠️ Error during cleanup:', error);
  }
}

/**
 * Handle unhandled errors
 */
process.on('unhandledRejection', (reason, promise) => {
  console.error('\n💥 UNHANDLED REJECTION');
  console.error('Promise:', promise);
  console.error('Reason:', reason);
  
  cleanup().then(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (error) => {
  console.error('\n💥 UNCAUGHT EXCEPTION');
  console.error('Error:', error);
  
  cleanup().then(() => {
    process.exit(1);
  });
});

/**
 * Start the server (only if this file is run directly)
 */
if (require.main === module) {
  startServer().catch((error) => {
    console.error('💥 Failed to start server:', error);
    process.exit(1);
  });
}

// ==================== EXPORTS ====================

export { 
  startServer, 
  setupGracefulShutdown,
  cleanup 
};

/*
=== SERVER.TS FEATURES ===

CONFIGURATION:
✅ Single source of truth: server/.env file
✅ No duplicate configuration files
✅ Uses validateEnvironment() from config/environment.ts
✅ Uses createDatabasePool() from config/database.ts
✅ All values read from .env

DATABASE INTEGRATION:
✅ Creates database pool from .env configuration
✅ Tests database connection before app startup
✅ Passes db pool to createApp(db) as required
✅ Proper database cleanup on shutdown

AUTO-DISCOVERY SUPPORT:
✅ Compatible with EntityAutoDiscoveryFactory
✅ Works with both manual and auto-discovery routes
✅ Proper app creation with database dependency injection

ERROR HANDLING:
✅ Comprehensive startup error handling
✅ Helpful troubleshooting messages
✅ Port conflict detection with solutions
✅ Database connection failure guidance

GRACEFUL SHUTDOWN:
✅ Proper SIGTERM/SIGINT handling
✅ HTTP server graceful close
✅ Database connection cleanup
✅ Resource cleanup on errors

DEVELOPMENT FRIENDLY:
✅ Clear startup progress messages
✅ Available endpoints listed on startup
✅ Troubleshooting guides for common issues
✅ Environment-specific error details

CONFIGURATION HIERARCHY:
1. server/.env - Single source of truth
2. config/database.ts - Reads from .env, manages pool
3. config/environment.ts - Reads from .env, server/session/security
4. server.ts - Uses both config files, all values from .env
*/