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
exports.EntityAutoDiscoveryFactory = void 0;
const express_1 = require("express");
const ENTITY_PATTERNS = {
    'user': 'SERIAL_ID',
    'defect': 'SERIAL_ID',
    'sysconfig': 'SERIAL_ID',
    'sampling-reason': 'SERIAL_ID',
    'customer': 'VARCHAR_CODE',
    'auth': 'SPECIAL',
    'parts': 'SPECIAL',
    'customer-site': 'SPECIAL',
    'inspectiondata': 'SPECIAL',
    'defectdata': 'SPECIAL',
    'defectdata-customer': 'SPECIAL',
    'defect-image': 'SPECIAL',
    'defect-customer-image': 'SPECIAL',
    'inf/inf-checkin': 'SPECIAL',
    'inf-lotinput': 'SPECIAL',
    'iqadata': 'SPECIAL',
    'report': 'SPECIAL'
};
const ENTITY_CONFIGS = {
    user: {
        entityName: 'user',
        apiPath: '/api/users',
        primaryKey: 'id',
        tableName: 'users',
        filePath: 'user'
    },
    defect: {
        entityName: 'defect',
        apiPath: '/api/defects',
        primaryKey: 'id',
        tableName: 'defects',
        filePath: 'defect'
    },
    sysconfig: {
        entityName: 'sysconfig',
        apiPath: '/api/sysconfig',
        primaryKey: 'id',
        tableName: 'sysconfig',
        filePath: 'sysconfig'
    },
    'sampling-reason': {
        entityName: 'sampling-reason',
        apiPath: '/api/sampling-reasons',
        primaryKey: 'id',
        tableName: 'sampling_reasons',
        filePath: 'sampling-reason'
    },
    customer: {
        entityName: 'customer',
        apiPath: '/api/customers',
        primaryKey: 'code',
        tableName: 'customers',
        filePath: 'customer'
    },
    auth: {
        entityName: 'auth',
        apiPath: '/api/auth',
        primaryKey: 'special',
        tableName: 'auth',
        filePath: 'auth'
    },
    parts: {
        entityName: 'parts',
        apiPath: '/api/parts',
        primaryKey: 'serial',
        tableName: 'parts',
        filePath: 'parts'
    },
    'customer-site': {
        entityName: 'customer-site',
        apiPath: '/api/customer-sites',
        primaryKey: 'composite',
        tableName: 'customers_site',
        filePath: 'customer-site'
    },
    inspectiondata: {
        entityName: 'inspectiondata',
        apiPath: '/api/inspectiondata',
        primaryKey: 'special',
        tableName: 'inspectiondata',
        filePath: 'inspectiondata'
    },
    defectdata: {
        entityName: 'defectdata',
        apiPath: '/api/defectdata',
        primaryKey: 'special',
        tableName: 'defectdata',
        filePath: 'defectdata'
    },
    'defectdata-customer': {
        entityName: 'defectdata-customer',
        apiPath: '/api/defectdata-customer',
        primaryKey: 'special',
        tableName: 'defectdata_customer',
        filePath: 'defectdata-customer'
    },
    'defect-image': {
        entityName: 'defect-image',
        apiPath: '/api/defect-image',
        primaryKey: 'special',
        tableName: 'defect_image',
        filePath: 'defect-image'
    },
    'defect-customer-image': {
        entityName: 'defect-customer-image',
        apiPath: '/api/defect-customer-image',
        primaryKey: 'special',
        tableName: 'defect_customer_image',
        filePath: 'defect-customer-image'
    },
    'inf/inf-checkin': {
        entityName: 'inf-checkin',
        apiPath: '/api/inf-checkin',
        primaryKey: 'special',
        tableName: 'inf_checkin',
        filePath: 'inf/inf-checkin'
    },
    'inf-lotinput': {
        entityName: 'inf-lotinput',
        apiPath: '/api/inf-lotinput',
        primaryKey: 'special',
        tableName: 'inf_lotinput',
        filePath: 'inf/inf-lotinput'
    },
    iqadata: {
        entityName: 'iqadata',
        apiPath: '/api/iqadata',
        primaryKey: 'id',
        tableName: 'iqadata',
        filePath: 'iqadata'
    },
    'report': {
        entityName: 'report',
        apiPath: '/api/report',
        primaryKey: 'special',
        tableName: 'report',
        filePath: 'reports'
    }
};
class EntityAutoDiscovery {
    constructor(app, db) {
        this.registrationResults = [];
        this.app = app;
        this.db = db;
    }
    async discoverAndRegister() {
        const startTime = new Date();
        console.log('🔍 Starting Entity Auto-Discovery...');
        console.log(`📋 Registering ${Object.keys(ENTITY_PATTERNS).length} entities`);
        for (const [entityName, patternType] of Object.entries(ENTITY_PATTERNS)) {
            try {
                await this.registerEntity(entityName, patternType);
            }
            catch (error) {
                console.error(`❌ Failed to register ${entityName}:`, error);
                this.registrationResults.push({
                    entityName,
                    patternType,
                    apiPath: ENTITY_CONFIGS[entityName]?.apiPath || 'unknown',
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
        const endTime = new Date();
        const summary = this.generateRegistrationSummary(startTime, endTime);
        this.logRegistrationSummary(summary);
        return summary;
    }
    async registerEntity(entityName, patternType) {
        const config = ENTITY_CONFIGS[entityName];
        if (!config) {
            throw new Error(`No configuration found for entity: ${entityName}`);
        }
        let router;
        switch (patternType) {
            case 'SERIAL_ID':
                router = await this.createSerialIdEntityRouter(entityName, config);
                break;
            case 'VARCHAR_CODE':
                router = await this.createVarcharCodeEntityRouter(entityName, config);
                break;
            case 'SPECIAL':
                router = await this.createSpecialEntityRouter(entityName, config);
                break;
            default:
                throw new Error(`Unknown pattern type: ${patternType} for entity: ${entityName}`);
        }
        if (!this.isValidRouter(router)) {
            throw new Error(`Invalid router returned for entity: ${entityName}`);
        }
        this.app.use(config.apiPath, router);
        this.registrationResults.push({
            entityName,
            patternType,
            apiPath: config.apiPath,
            success: true
        });
        console.log(`✅ Registered ${patternType} entity: ${entityName} at ${config.apiPath}`);
    }
    isValidRouter(router) {
        return router &&
            typeof router === 'function' &&
            typeof router.use === 'function' &&
            typeof router.get === 'function' &&
            typeof router.post === 'function' &&
            typeof router.put === 'function' &&
            typeof router.delete === 'function';
    }
    async createSerialIdEntityRouter(entityName, config) {
        try {
            const filePath = config.filePath || entityName;
            const entityModule = await Promise.resolve(`${`../entities/${filePath}/routes`}`).then(s => __importStar(require(s)));
            let router = await this.extractRouterFromModule(entityModule, entityName);
            if (!router) {
                console.warn(`⚠️  Could not extract router from ${entityName}, creating fallback`);
                return this.createBasicSerialIdRouter(config);
            }
            return router;
        }
        catch (error) {
            console.warn(`⚠️  Could not import ${entityName} routes, creating basic router`);
            console.warn(`${entityName} import error:`, error);
            return this.createBasicSerialIdRouter(config);
        }
    }
    async createVarcharCodeEntityRouter(entityName, config) {
        try {
            const filePath = config.filePath || entityName;
            const entityModule = await Promise.resolve(`${`../entities/${filePath}/routes`}`).then(s => __importStar(require(s)));
            let router = await this.extractRouterFromModule(entityModule, entityName);
            if (!router) {
                console.warn(`⚠️  Could not extract router from ${entityName}, creating fallback`);
                return this.createBasicVarcharCodeRouter(config);
            }
            return router;
        }
        catch (error) {
            console.warn(`⚠️  Could not import ${entityName} routes, creating basic router`);
            console.warn(`${entityName} import error:`, error);
            return this.createBasicVarcharCodeRouter(config);
        }
    }
    async createSpecialEntityRouter(entityName, config) {
        if (entityName === 'auth') {
            try {
                const authModule = await Promise.resolve().then(() => __importStar(require('../entities/auth/routes')));
                let authRouter = await this.extractRouterFromModule(authModule, 'auth');
                if (!authRouter) {
                    console.warn('⚠️  Could not extract auth router, creating fallback');
                    return this.createBasicAuthRouter();
                }
                return authRouter;
            }
            catch (error) {
                console.warn('⚠️  Could not import auth routes, creating basic auth router');
                console.warn('Auth import error:', error);
                return this.createBasicAuthRouter();
            }
        }
        try {
            const filePath = config.filePath || entityName;
            const entityModule = await Promise.resolve(`${`../entities/${filePath}/routes`}`).then(s => __importStar(require(s)));
            let router = await this.extractRouterFromModule(entityModule, entityName);
            if (!router) {
                console.warn(`⚠️  Could not extract router from ${entityName}, creating fallback`);
                return this.createBasicSpecialRouter(config);
            }
            return router;
        }
        catch (error) {
            console.warn(`⚠️  Could not import ${entityName} routes, creating basic router`);
            console.warn(`${entityName} import error:`, error);
            return this.createBasicSpecialRouter(config);
        }
    }
    async extractRouterFromModule(entityModule, entityName) {
        if (typeof entityModule.default === 'function') {
            try {
                const router = entityModule.default(this.db);
                if (this.isValidRouter(router)) {
                    console.log(`✅ Found default function export for ${entityName}`);
                    return router;
                }
            }
            catch (error) {
                console.warn(`⚠️  Default function failed for ${entityName}:`, error);
            }
        }
        if (this.isValidRouter(entityModule.default)) {
            console.log(`✅ Found default router export for ${entityName}`);
            return entityModule.default;
        }
        const possibleFunctions = [
            `create${this.capitalize(entityName)}Routes`,
            `${entityName}Routes`,
            'createRoutes',
            'getRouter',
            ...(entityName === 'inspectiondata' ? ['createInspectionDataRoutes'] : [])
        ];
        for (const funcName of possibleFunctions) {
            if (typeof entityModule[funcName] === 'function') {
                try {
                    const router = entityModule[funcName](this.db);
                    if (this.isValidRouter(router)) {
                        console.log(`✅ Found function export ${funcName} for ${entityName}`);
                        return router;
                    }
                }
                catch (error) {
                    console.warn(`⚠️  Function ${funcName} failed for ${entityName}:`, error);
                }
            }
        }
        const possibleRouters = [
            `${entityName}Routes`,
            'router',
            'routes'
        ];
        for (const routerName of possibleRouters) {
            if (this.isValidRouter(entityModule[routerName])) {
                console.log(`✅ Found router export ${routerName} for ${entityName}`);
                return entityModule[routerName];
            }
        }
        const possibleFactories = [
            `create${this.capitalize(entityName)}RoutesWithDb`,
            `setup${this.capitalize(entityName)}Entity`
        ];
        for (const factoryName of possibleFactories) {
            if (typeof entityModule[factoryName] === 'function') {
                try {
                    const router = entityModule[factoryName](this.db);
                    if (this.isValidRouter(router)) {
                        console.log(`✅ Found factory export ${factoryName} for ${entityName}`);
                        return router;
                    }
                }
                catch (error) {
                    console.warn(`⚠️  Factory ${factoryName} failed for ${entityName}:`, error);
                }
            }
        }
        if (typeof entityModule.default === 'function' && entityModule.default.prototype) {
            console.warn(`⚠️  ${entityName} exports a class as default, but no factory function found`);
            console.warn(`   Recommended: Export a function that takes (db: Pool) and returns Router`);
            console.warn(`   Example: export default function(db: Pool): Router { ... }`);
        }
        console.warn(`⚠️  No valid router found in ${entityName} module`);
        console.warn(`   Available exports:`, Object.keys(entityModule));
        return null;
    }
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    createBasicSerialIdRouter(config) {
        const router = (0, express_1.Router)();
        router.get('/', (req, res) => {
            res.json({
                message: `${config.entityName} list endpoint`,
                pattern: 'SERIAL_ID',
                note: 'Using fallback router - implement proper routes'
            });
        });
        router.get('/:id', (req, res) => {
            res.json({
                message: `Get ${config.entityName} by ID: ${req.params.id}`,
                pattern: 'SERIAL_ID',
                note: 'Using fallback router - implement proper routes'
            });
        });
        return router;
    }
    createBasicVarcharCodeRouter(config) {
        const router = (0, express_1.Router)();
        router.get('/', (req, res) => {
            res.json({
                message: `${config.entityName} list endpoint`,
                pattern: 'VARCHAR_CODE',
                note: 'Using fallback router - implement proper routes'
            });
        });
        router.get('/:code', (req, res) => {
            res.json({
                message: `Get ${config.entityName} by code: ${req.params.code}`,
                pattern: 'VARCHAR_CODE',
                note: 'Using fallback router - implement proper routes'
            });
        });
        return router;
    }
    createBasicSpecialRouter(config) {
        const router = (0, express_1.Router)();
        router.get('/', (req, res) => {
            res.json({
                message: `${config.entityName} endpoint`,
                pattern: 'SPECIAL',
                note: 'Using fallback router - implement proper routes'
            });
        });
        return router;
    }
    createBasicAuthRouter() {
        const router = (0, express_1.Router)();
        router.post('/login', (req, res) => {
            res.json({
                message: 'Auth login endpoint',
                note: 'Using fallback auth router - implement proper authentication'
            });
        });
        router.post('/logout', (req, res) => {
            res.json({
                message: 'Auth logout endpoint',
                note: 'Using fallback auth router - implement proper authentication'
            });
        });
        return router;
    }
    generateRegistrationSummary(startTime, endTime) {
        const successful = this.registrationResults.filter(r => r.success).length;
        const failed = this.registrationResults.filter(r => !r.success).length;
        return {
            totalEntities: this.registrationResults.length,
            successful,
            failed,
            results: this.registrationResults,
            startTime,
            endTime,
            duration: endTime.getTime() - startTime.getTime()
        };
    }
    logRegistrationSummary(summary) {
        console.log('\n🎯 Entity Auto-Discovery Summary:');
        console.log(`   📊 Total Entities: ${summary.totalEntities}`);
        console.log(`   ✅ Successful: ${summary.successful}`);
        console.log(`   ❌ Failed: ${summary.failed}`);
        console.log(`   ⏱️  Duration: ${summary.duration}ms`);
        if (summary.failed > 0) {
            console.log('\n❌ Failed Entity Registrations:');
            summary.results
                .filter(r => !r.success)
                .forEach(r => console.log(`   - ${r.entityName}: ${r.error}`));
        }
        console.log('\n📋 Registered API Endpoints:');
        summary.results
            .filter(r => r.success)
            .forEach(r => console.log(`   ${r.patternType.padEnd(12)} ${r.apiPath}`));
        console.log('\n🚀 Auto-Discovery Complete - All routes ready!\n');
    }
}
class EntityAutoDiscoveryFactory {
    static async discoverAndRegister(app, db) {
        const discovery = new EntityAutoDiscovery(app, db);
        return await discovery.discoverAndRegister();
    }
    static getEntityInfo() {
        return ENTITY_PATTERNS;
    }
    static validateConfigurations() {
        const entityNames = Object.keys(ENTITY_PATTERNS);
        const configNames = Object.keys(ENTITY_CONFIGS);
        const missingConfigs = entityNames.filter(name => !configNames.includes(name));
        if (missingConfigs.length > 0) {
            console.error('❌ Missing entity configurations:', missingConfigs);
            return false;
        }
        console.log('✅ All entity configurations validated');
        return true;
    }
}
exports.EntityAutoDiscoveryFactory = EntityAutoDiscoveryFactory;
exports.default = EntityAutoDiscoveryFactory;
