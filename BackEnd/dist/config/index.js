"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shutdownConfig = exports.getConfigurationSummary = exports.getSystemHealth = exports.initializeConfig = exports.configManager = exports.ConfigManager = exports.sessionManager = exports.dbManager = exports.validateConfig = exports.securityConfig = exports.sessionConfig = exports.serverConfig = exports.env = exports.testDatabaseConnection = exports.closeDatabasePool = exports.getDatabasePool = exports.createDatabasePool = void 0;
const environment_1 = require("./environment");
var database_1 = require("./database");
Object.defineProperty(exports, "createDatabasePool", { enumerable: true, get: function () { return database_1.createDatabasePool; } });
Object.defineProperty(exports, "getDatabasePool", { enumerable: true, get: function () { return database_1.getDatabasePool; } });
Object.defineProperty(exports, "closeDatabasePool", { enumerable: true, get: function () { return database_1.closeDatabasePool; } });
Object.defineProperty(exports, "testDatabaseConnection", { enumerable: true, get: function () { return database_1.testDatabaseConnection; } });
var environment_2 = require("./environment");
Object.defineProperty(exports, "env", { enumerable: true, get: function () { return environment_2.config; } });
Object.defineProperty(exports, "serverConfig", { enumerable: true, get: function () { return environment_2.serverConfig; } });
Object.defineProperty(exports, "sessionConfig", { enumerable: true, get: function () { return environment_2.sessionConfig; } });
Object.defineProperty(exports, "securityConfig", { enumerable: true, get: function () { return environment_2.securityConfig; } });
Object.defineProperty(exports, "validateConfig", { enumerable: true, get: function () { return environment_2.validateEnvironment; } });
class MockDatabaseManager {
    async initialize() {
        console.log('📦 Mock Database Manager initialized');
    }
    async getHealth() {
        return {
            status: 'healthy',
            responseTime: 50,
            connectionCount: 5,
            totalConnections: 10,
            version: 'PostgreSQL 14.0',
            lastCheck: new Date()
        };
    }
    async shutdown() {
        console.log('📦 Mock Database Manager shutdown');
    }
}
class MockSessionManager {
    async initialize() {
        console.log('📦 Mock Session Manager initialized');
    }
    async getHealth() {
        return {
            status: 'healthy',
            responseTime: 25,
            activeConnections: 3,
            storeStatus: 'connected',
            lastCheck: new Date()
        };
    }
    async shutdown() {
        console.log('📦 Mock Session Manager shutdown');
    }
}
const mockDbManager = new MockDatabaseManager();
const mockSessionManager = new MockSessionManager();
exports.dbManager = mockDbManager;
exports.sessionManager = mockSessionManager;
class ConfigManager {
    constructor() {
        this.initialized = false;
        this.initializationTime = null;
    }
    static getInstance() {
        if (!ConfigManager.instance) {
            ConfigManager.instance = new ConfigManager();
        }
        return ConfigManager.instance;
    }
    async initialize() {
        if (this.initialized) {
            return;
        }
        try {
            (0, environment_1.validateEnvironment)();
            await exports.dbManager.initialize();
            await exports.sessionManager.initialize();
            this.initialized = true;
            this.initializationTime = new Date();
            console.log('✅ Configuration Manager initialized successfully', {
                timestamp: this.initializationTime.toISOString(),
                environment: environment_1.config.server.nodeEnv,
                version: '1.0.0'
            });
        }
        catch (error) {
            console.error('❌ Configuration Manager initialization failed:', error);
            throw error;
        }
    }
    isInitialized() {
        return this.initialized;
    }
    getInitializationTime() {
        return this.initializationTime;
    }
    async getSystemHealth() {
        if (!this.initialized) {
            return {
                status: 'unhealthy',
                message: 'Configuration not initialized',
                components: [],
                timestamp: new Date().toISOString()
            };
        }
        const components = [];
        try {
            const dbHealth = await exports.dbManager.getHealth();
            components.push({
                name: 'database',
                status: dbHealth.status,
                responseTime: dbHealth.responseTime,
                details: {
                    connectionCount: dbHealth.connectionCount || 0,
                    totalConnections: dbHealth.totalConnections || 0,
                    version: dbHealth.version || 'unknown'
                },
                lastCheck: new Date().toISOString()
            });
        }
        catch (error) {
            components.push({
                name: 'database',
                status: 'unhealthy',
                details: {
                    error: error instanceof Error ? error.message : 'Unknown database error'
                },
                lastCheck: new Date().toISOString()
            });
        }
        try {
            const sessionHealth = await exports.sessionManager.getHealth();
            components.push({
                name: 'session',
                status: sessionHealth.status,
                responseTime: sessionHealth.responseTime,
                details: {
                    activeConnections: sessionHealth.activeConnections || 0,
                    storeStatus: sessionHealth.storeStatus || 'unknown'
                },
                lastCheck: new Date().toISOString()
            });
        }
        catch (error) {
            components.push({
                name: 'session',
                status: 'unhealthy',
                details: {
                    error: error instanceof Error ? error.message : 'Unknown session error'
                },
                lastCheck: new Date().toISOString()
            });
        }
        const memoryUsage = process.memoryUsage();
        const memoryUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
        const memoryTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
        const memoryPercentage = Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100);
        components.push({
            name: 'memory',
            status: memoryPercentage > 90 ? 'unhealthy' : memoryPercentage > 70 ? 'degraded' : 'healthy',
            details: {
                used: memoryUsedMB,
                total: memoryTotalMB,
                percentage: memoryPercentage
            },
            lastCheck: new Date().toISOString()
        });
        const healthyComponents = components.filter(c => c.status === 'healthy');
        const degradedComponents = components.filter(c => c.status === 'degraded');
        const unhealthyComponents = components.filter(c => c.status === 'unhealthy');
        let overallStatus;
        if (unhealthyComponents.length > 0) {
            overallStatus = 'unhealthy';
        }
        else if (degradedComponents.length > 0) {
            overallStatus = 'degraded';
        }
        else {
            overallStatus = 'healthy';
        }
        return {
            status: overallStatus,
            message: overallStatus === 'healthy' ?
                'All systems operational' :
                `${unhealthyComponents.length} unhealthy, ${degradedComponents.length} degraded components`,
            components,
            timestamp: new Date().toISOString(),
            uptime: this.initializationTime ? Date.now() - this.initializationTime.getTime() : 0,
            version: '1.0.0',
            environment: environment_1.config.server.nodeEnv
        };
    }
    getConfigurationSummary() {
        return {
            environment: environment_1.config.server.nodeEnv,
            version: '1.0.0',
            initialized: this.initialized,
            initializationTime: this.initializationTime?.toISOString() || null,
            app: {
                name: 'Manufacturing QC System',
                host: environment_1.config.server.isDevelopment ? 'localhost' : 'production-host',
                port: environment_1.config.server.port,
                apiPrefix: environment_1.config.server.apiPrefix
            },
            database: {
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT || '5432'),
                name: process.env.DB_NAME || 'qcv',
                ssl: process.env.DB_SSL === 'true',
                poolMin: 1,
                poolMax: parseInt(process.env.DB_MAX_CONNECTIONS || '20')
            },
            session: {
                name: environment_1.config.session.name,
                ttl: environment_1.config.session.maxAge,
                secure: environment_1.config.session.secure,
                httpOnly: environment_1.config.session.httpOnly
            },
            manufacturing: {
                defaultShift: 'day',
                defaultSite: 'main',
                auditRetentionDays: 90,
                batchSizeLimit: 1000
            }
        };
    }
    async shutdown() {
        try {
            await exports.dbManager.shutdown();
            await exports.sessionManager.shutdown();
            this.initialized = false;
            this.initializationTime = null;
            console.log('✅ Configuration Manager shutdown completed');
        }
        catch (error) {
            console.error('❌ Configuration Manager shutdown failed:', error);
            throw error;
        }
    }
}
exports.ConfigManager = ConfigManager;
exports.configManager = ConfigManager.getInstance();
const initializeConfig = async () => {
    await exports.configManager.initialize();
};
exports.initializeConfig = initializeConfig;
const getSystemHealth = () => {
    return exports.configManager.getSystemHealth();
};
exports.getSystemHealth = getSystemHealth;
const getConfigurationSummary = () => {
    return exports.configManager.getConfigurationSummary();
};
exports.getConfigurationSummary = getConfigurationSummary;
const shutdownConfig = async () => {
    await exports.configManager.shutdown();
};
exports.shutdownConfig = shutdownConfig;
exports.default = {
    env: environment_1.config,
    dbManager: exports.dbManager,
    sessionManager: exports.sessionManager,
    configManager: exports.configManager,
    initializeConfig: exports.initializeConfig,
    getSystemHealth: exports.getSystemHealth,
    getConfigurationSummary: exports.getConfigurationSummary,
    shutdownConfig: exports.shutdownConfig
};
