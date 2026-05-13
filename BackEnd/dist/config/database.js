"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDatabasePool = createDatabasePool;
exports.getDatabasePool = getDatabasePool;
exports.closeDatabasePool = closeDatabasePool;
exports.testDatabaseConnection = testDatabaseConnection;
exports.initializeDrizzle = initializeDrizzle;
exports.getDrizzle = getDrizzle;
const pg_1 = require("pg");
const db_1 = require("../db");
const features_1 = require("./features");
pg_1.types.setTypeParser(1114, (str) => {
    const match = str.match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?$/);
    if (match) {
        const [, year, month, day, hours, minutes, seconds, ms] = match;
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes), parseInt(seconds), ms ? parseInt(ms.substring(0, 3)) : 0);
    }
    return new Date(str);
});
const databaseConfig = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    max: parseInt(process.env.DB_MAX_CONNECTIONS || '20'),
    min: 2,
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30000'),
    query_timeout: parseInt(process.env.DB_QUERY_TIMEOUT || '60000'),
    statement_timeout: parseInt(process.env.DB_STATEMENT_TIMEOUT || '60000'),
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
};
let pool = null;
let drizzleDb = null;
function createDatabasePool() {
    if (pool) {
        return pool;
    }
    pool = new pg_1.Pool(databaseConfig);
    pool.on('error', (err) => {
        console.error('❌ Database pool error:', err.message);
    });
    console.log('✅ Database pool created');
    console.log(`   📍 ${databaseConfig.host}:${databaseConfig.port}/${databaseConfig.database}`);
    return pool;
}
function getDatabasePool() {
    if (!pool) {
        return createDatabasePool();
    }
    return pool;
}
async function closeDatabasePool() {
    if (pool) {
        console.log('🔄 Closing database pool...');
        await pool.end();
        pool = null;
        console.log('✅ Database pool closed');
    }
}
async function testDatabaseConnection() {
    try {
        const dbPool = getDatabasePool();
        const client = await dbPool.connect();
        try {
            await client.query('SELECT NOW()');
            console.log('✅ Database connection test passed');
            return true;
        }
        finally {
            client.release();
        }
    }
    catch (error) {
        console.error('❌ Database connection test failed:', error);
        return false;
    }
}
function initializeDrizzle() {
    if (drizzleDb) {
        return drizzleDb;
    }
    const dbPool = getDatabasePool();
    drizzleDb = (0, db_1.createDrizzleDb)(dbPool);
    (0, features_1.logDrizzleStatus)();
    return drizzleDb;
}
function getDrizzle() {
    if (!drizzleDb) {
        return initializeDrizzle();
    }
    return drizzleDb;
}
exports.default = createDatabasePool;
