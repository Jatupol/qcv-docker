"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMssqlPool = createMssqlPool;
exports.getMssqlPool = getMssqlPool;
exports.closeMssqlPool = closeMssqlPool;
exports.testMssqlConnection = testMssqlConnection;
const sql = __importStar(require("mssql"));
async function getMssqlConfigFromSysconfig(pgPool) {
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
        if (!config.mssql_server || !config.mssql_database || !config.mssql_username) {
            const missingFields = [];
            if (!config.mssql_server)
                missingFields.push('server');
            if (!config.mssql_database)
                missingFields.push('database');
            if (!config.mssql_username)
                missingFields.push('username');
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
    }
    catch (error) {
        console.error('❌ Error fetching MSSQL config from sysconfig:', error);
        return null;
    }
}
async function getMssqlConnectionConfig(pgPool) {
    console.log('🔧 getMssqlConnectionConfig: pgPool provided?', !!pgPool);
    if (!pgPool) {
        const error = 'PostgreSQL pool is required to fetch MSSQL configuration from sysconfig table';
        console.error('❌', error);
        throw new Error(error);
    }
    const config = await getMssqlConfigFromSysconfig(pgPool);
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
            encrypt: false,
            trustServerCertificate: true,
            enableArithAbort: true,
            connectTimeout: 30000,
            requestTimeout: 30000,
        },
        pool: {
            max: 10,
            min: 0,
            idleTimeoutMillis: 30000
        }
    };
}
let pool = null;
let currentConfig = null;
async function createMssqlPool(pgPool) {
    const config = await getMssqlConnectionConfig(pgPool);
    const configChanged = currentConfig && (currentConfig.server !== config.server ||
        currentConfig.port !== config.port ||
        currentConfig.database !== config.database ||
        currentConfig.user !== config.user);
    if (configChanged && pool) {
        console.log('🔄 MSSQL configuration changed, closing existing pool...');
        await pool.close();
        pool = null;
    }
    if (pool && pool.connected) {
        return pool;
    }
    try {
        pool = new sql.ConnectionPool(config);
        await pool.connect();
        currentConfig = config;
        console.log('✅ MSSQL pool created and connected');
        console.log(`   📍 ${config.server}:${config.port}/${config.database}`);
        pool.on('error', (err) => {
            console.error('❌ MSSQL pool error:', err.message);
        });
        return pool;
    }
    catch (error) {
        console.error('❌ Failed to create MSSQL pool:', error);
        throw error;
    }
}
async function getMssqlPool(pgPool) {
    if (!pool || !pool.connected) {
        return await createMssqlPool(pgPool);
    }
    return pool;
}
async function closeMssqlPool() {
    if (pool) {
        console.log('🔄 Closing MSSQL pool...');
        await pool.close();
        pool = null;
        currentConfig = null;
        console.log('✅ MSSQL pool closed');
    }
}
async function testMssqlConnection(pgPool) {
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
    }
    catch (error) {
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
exports.default = {
    createMssqlPool,
    getMssqlPool,
    closeMssqlPool,
    testMssqlConnection
};
