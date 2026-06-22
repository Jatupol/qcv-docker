"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = startServer;
exports.setupGracefulShutdown = setupGracefulShutdown;
exports.cleanup = cleanup;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, '..', '.env') });
const environment_1 = require("./config/environment");
const database_1 = require("./config/database");
const app_1 = require("./app");
const syncScheduler_1 = require("./services/syncScheduler");
const forceLogoutScheduler_1 = require("./services/forceLogoutScheduler");
const purgeJanitor_1 = require("./services/purgeJanitor");
const PORT = parseInt(process.env.PORT || '8080');
const HOST = process.env.HOST || '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV || 'development';
let server;
let db;
let syncSchedulerStarted = false;
let forceLogoutSchedulerStarted = false;
let purgeJanitorStarted = false;
async function startServer() {
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
        console.log('🔧 Validating environment configuration...');
        try {
            (0, environment_1.validateEnvironment)();
            console.log('✅ Environment configuration validated');
        }
        catch (error) {
            console.error('❌ Environment validation failed:', error);
            console.error('💡 Check your .env file and ensure all required variables are set');
            process.exit(1);
        }
        console.log('🗄️ Establishing database connection...');
        try {
            db = (0, database_1.createDatabasePool)();
            const isConnected = await (0, database_1.testDatabaseConnection)();
            if (!isConnected) {
                throw new Error('Database connection test failed');
            }
            console.log('✅ Database connection established');
            console.log(`   📍 Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
            console.log(`   🏢 Database: ${process.env.DB_NAME}`);
            console.log(`   👤 User: ${process.env.DB_USER}`);
            console.log('🔧 Initializing Drizzle ORM...');
            (0, database_1.initializeDrizzle)();
        }
        catch (error) {
            console.error('❌ Database connection failed:', error);
            console.error('💡 Ensure PostgreSQL is running and credentials are correct');
            console.error('💡 Check your .env file for database settings');
            process.exit(1);
        }
        console.log('📦 Creating Express application with all middleware...');
        let app;
        try {
            app = await (0, app_1.createApp)(db);
            console.log('✅ Express application created successfully');
            console.log('   🔐 Session middleware configured');
            console.log('   🛡️ Authentication middleware initialized');
            console.log('   🔍 Auto-discovery routes registered');
        }
        catch (error) {
            console.error('❌ Express app creation failed:', error);
            if (error instanceof Error) {
                console.error('Error details:', error.message);
            }
            process.exit(1);
        }
        console.log('🌐 Starting HTTP server...');
        try {
            server = app.listen(PORT, HOST, () => {
                console.log('\n🎉 Manufacturing Quality Control Server Started Successfully!');
                console.log('='.repeat(60));
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
                console.log('='.repeat(60));
            });
            setupGracefulShutdown();
        }
        catch (error) {
            console.error('❌ HTTP server startup failed:', error);
            process.exit(1);
        }
        console.log('⏰ Starting Sync Scheduler...');
        try {
            const scheduler = (0, syncScheduler_1.getSyncScheduler)(db);
            await scheduler.start();
            syncSchedulerStarted = true;
            console.log('✅ Sync Scheduler started');
            console.log(`   📊 Endpoint: http://${HOST}:${PORT}/api/scheduler/status`);
        }
        catch (error) {
            console.error('⚠️ Sync Scheduler failed to start:', error);
            console.error('💡 Manual sync is still available via API endpoints');
        }
        console.log('🔒 Starting Force Logout Scheduler...');
        try {
            const flScheduler = (0, forceLogoutScheduler_1.getForceLogoutScheduler)(db);
            flScheduler.start();
            forceLogoutSchedulerStarted = true;
            console.log('✅ Force Logout Scheduler started');
        }
        catch (error) {
            console.error('⚠️ Force Logout Scheduler failed to start:', error);
        }
        console.log('🧹 Starting Purge Janitor...');
        try {
            await (0, purgeJanitor_1.getPurgeJanitor)(db).start();
            purgeJanitorStarted = true;
            console.log('✅ Purge Janitor started');
        }
        catch (error) {
            console.error('⚠️ Purge Janitor failed to start:', error);
        }
        server.on('error', (error) => {
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
    }
    catch (error) {
        console.error('\n💥 SERVER STARTUP FAILED');
        console.error('='.repeat(50));
        if (error instanceof Error) {
            console.error('❌ Error:', error.message);
            if (error.stack && NODE_ENV === 'development') {
                console.error('📋 Stack trace:', error.stack);
            }
        }
        else {
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
function setupGracefulShutdown() {
    const gracefulShutdown = async (signal) => {
        console.log(`\n🔄 Received ${signal}, shutting down gracefully...`);
        try {
            if (syncSchedulerStarted) {
                try {
                    const scheduler = (0, syncScheduler_1.getSyncScheduler)();
                    scheduler.stop();
                    console.log('✅ Sync Scheduler stopped');
                }
                catch (e) {
                    console.log('⚠️ Sync Scheduler already stopped');
                }
            }
            if (forceLogoutSchedulerStarted) {
                try {
                    (0, forceLogoutScheduler_1.getForceLogoutScheduler)().stop();
                    console.log('✅ Force Logout Scheduler stopped');
                }
                catch (e) {
                    console.log('⚠️ Force Logout Scheduler already stopped');
                }
            }
            if (purgeJanitorStarted) {
                try {
                    (0, purgeJanitor_1.getPurgeJanitor)().stop();
                    console.log('✅ Purge Janitor stopped');
                }
                catch (e) {
                    console.log('⚠️ Purge Janitor already stopped');
                }
            }
            if (server) {
                await new Promise((resolve, reject) => {
                    server.close((error) => {
                        if (error) {
                            reject(error);
                        }
                        else {
                            console.log('✅ HTTP server closed');
                            resolve();
                        }
                    });
                });
            }
            await cleanup();
            console.log('✅ Graceful shutdown complete');
            process.exit(0);
        }
        catch (error) {
            console.error('❌ Error during graceful shutdown:', error);
            process.exit(1);
        }
    };
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}
async function cleanup() {
    try {
        if (db) {
            console.log('🔄 Closing database connections...');
            await db.end();
            console.log('✅ Database connections closed');
        }
    }
    catch (error) {
        console.error('⚠️ Error during cleanup:', error);
    }
}
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
if (require.main === module) {
    startServer().catch((error) => {
        console.error('💥 Failed to start server:', error);
        process.exit(1);
    });
}
