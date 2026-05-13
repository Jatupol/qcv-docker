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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const connect_pg_simple_1 = __importDefault(require("connect-pg-simple"));
const cors_1 = __importDefault(require("cors"));
const auth_1 = require("./middleware/auth");
const requestLogger_1 = require("./middleware/requestLogger");
const entity_auto_discovery_1 = require("./factories/entity-auto-discovery");
async function createApp(db) {
    const app = (0, express_1.default)();
    const PostgreSqlStore = (0, connect_pg_simple_1.default)(express_session_1.default);
    app.use((0, express_session_1.default)({
        store: new PostgreSqlStore({
            pool: db,
            tableName: 'session',
            createTableIfMissing: true,
        }),
        secret: process.env.SESSION_SECRET || 'your-super-secret-key-change-in-production',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false,
            httpOnly: true,
            maxAge: 6 * 60 * 60 * 1000,
            sameSite: 'lax',
            domain: process.env.COOKIE_DOMAIN || undefined,
        }
    }));
    console.log('✅ Session middleware configured with PostgreSQL store');
    console.log('   🍪 Cookie settings:');
    console.log(`      - secure: false (allows HTTP)`);
    console.log(`      - httpOnly: true (prevents XSS)`);
    console.log(`      - sameSite: lax (allows cross-port)`);
    console.log(`      - domain: ${process.env.COOKIE_DOMAIN || '(not set - same host+port only)'}`);
    const corsOriginEnv = process.env.CORS_ORIGIN || 'http://localhost:5173';
    const allowedOrigins = corsOriginEnv.split(',').map(origin => origin.trim());
    console.log('🌐 CORS Configuration:');
    console.log(`   - Allowed Origins: ${allowedOrigins.join(', ')}`);
    console.log(`   - Credentials: true (allows cookies)`);
    console.log(`   - Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS`);
    app.use((0, cors_1.default)({
        origin: (origin, callback) => {
            console.log(`📡 CORS request from origin: ${origin || 'no origin header'}`);
            if (!origin) {
                console.log('   ✅ Allowing request with no origin header');
                return callback(null, true);
            }
            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            console.log(`   ❌ Rejecting origin: ${origin} (expected one of: ${allowedOrigins.join(', ')})`);
            callback(new Error('Not allowed by CORS'));
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cache-Control', 'Pragma', 'Expires', 'Access-Control-Request-Private-Network'],
        exposedHeaders: ['Set-Cookie'],
        maxAge: 86400
    }));
    app.use((req, res, next) => {
        if (req.headers['access-control-request-private-network'] === 'true') {
            res.setHeader('Access-Control-Allow-Private-Network', 'true');
        }
        next();
    });
    app.use(express_1.default.json({ limit: '10mb' }));
    app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
    app.use(requestLogger_1.requestLogger);
    console.log('✅ Request logging middleware configured - logs writing to /app/logs');
    auth_1.authMiddleware.init(db);
    const versionRoutes = (await Promise.resolve().then(() => __importStar(require('./routes/version')))).default;
    app.use('/api/version', versionRoutes);
    console.log('✅ Version and health check routes registered at /api/version');
    const fiscalWeekRoutes = (await Promise.resolve().then(() => __importStar(require('./routes/fiscalWeekRoutes')))).default;
    app.use('/api/fiscal-week', fiscalWeekRoutes);
    console.log('✅ Fiscal week test routes registered at /api/fiscal-week');
    const fiscalCalendarRoutes = (await Promise.resolve().then(() => __importStar(require('./routes/fiscalCalendarRoutes')))).default;
    app.use('/api/fiscal-calendar', fiscalCalendarRoutes);
    console.log('✅ Fiscal calendar routes registered at /api/fiscal-calendar');
    console.log('🔍 Starting Entity Auto-Discovery...');
    try {
        const registrationSummary = await entity_auto_discovery_1.EntityAutoDiscoveryFactory.discoverAndRegister(app, db);
        console.log(`🎉 Auto-Discovery completed successfully!`);
        console.log(`   ✅ ${registrationSummary.successful}/${registrationSummary.totalEntities} entities registered`);
        console.log(`   ⏱️ Registration took ${registrationSummary.duration}ms`);
        if (registrationSummary.failed > 0) {
            console.warn(`   ⚠️ ${registrationSummary.failed} entities failed to register`);
            registrationSummary.results
                .filter(r => !r.success)
                .forEach(r => console.warn(`      - ${r.entityName}: ${r.error}`));
        }
        console.log('\n📋 Available API Endpoints:');
        registrationSummary.results
            .filter(r => r.success)
            .forEach(r => {
            console.log(`   ${r.patternType.padEnd(12)} ${r.apiPath}`);
        });
        app.get('/api/debug/routes', (req, res) => {
            const routes = [];
            app._router.stack.forEach((middleware) => {
                if (middleware.route) {
                    routes.push(`${Object.keys(middleware.route.methods)} ${middleware.route.path}`);
                }
                else if (middleware.name === 'router') {
                    middleware.handle.stack.forEach((handler) => {
                        if (handler.route) {
                            routes.push(`${Object.keys(handler.route.methods)} ${middleware.regexp.source}${handler.route.path}`);
                        }
                    });
                }
            });
            res.json({ routes, registeredEntities: registrationSummary.results });
        });
        app.post('/api/inspectiondata/test', (req, res) => {
            res.json({
                success: true,
                message: 'Test endpoint working',
                timestamp: new Date().toISOString()
            });
        });
        const infCheckinRegistered = registrationSummary.results.some(r => r.entityName === 'inf-checkin' && r.success);
        if (!infCheckinRegistered) {
            console.log('🔧 inf-checkin not registered via auto-discovery, registering manually...');
            try {
                const infCheckinRoutes = await Promise.resolve().then(() => __importStar(require('./entities/inf/inf-checkin/routes')));
                console.log('📦 inf-checkin module imported, default export type:', typeof infCheckinRoutes.default);
                if (typeof infCheckinRoutes.default === 'function') {
                    const router = infCheckinRoutes.default(db);
                    console.log('📦 Router created, type:', typeof router);
                    app.use('/api/inf-checkin', router);
                    console.log('✅ inf-checkin routes manually registered');
                }
                else {
                    console.error('❌ inf-checkin default export is not a function');
                    console.error('Available exports:', Object.keys(infCheckinRoutes));
                }
            }
            catch (manualError) {
                console.error('❌ Manual inf-checkin registration failed:', manualError);
            }
        }
        const infLotInputRegistered = registrationSummary.results.some(r => r.entityName === 'inf-lotinput' && r.success);
        if (!infLotInputRegistered) {
            console.log('🔧 inf-lotinput not registered via auto-discovery, registering manually...');
            try {
                const infLotInputRoutes = await Promise.resolve().then(() => __importStar(require('./entities/inf/inf-lotinput/routes')));
                console.log('📦 inf-lotinput module imported, default export type:', typeof infLotInputRoutes.default);
                if (typeof infLotInputRoutes.default === 'function') {
                    const router = infLotInputRoutes.default(db);
                    console.log('📦 inf-lotinput router created, type:', typeof router);
                    app.use('/api/inf-lotinput', router);
                    console.log('✅ inf-lotinput routes manually registered');
                }
                else {
                    console.error('❌ inf-lotinput default export is not a function');
                    console.error('Available exports:', Object.keys(infLotInputRoutes));
                }
            }
            catch (manualError) {
                console.error('❌ Manual inf-lotinput registration failed:', manualError);
            }
        }
        const infUserOperationRegistered = registrationSummary.results.some(r => r.entityName === 'inf-useroperation' && r.success);
        if (!infUserOperationRegistered) {
            console.log('🔧 inf-useroperation not registered via auto-discovery, registering manually...');
            try {
                const infUserOperationRoutes = await Promise.resolve().then(() => __importStar(require('./entities/inf/inf-useroperation/routes')));
                console.log('📦 inf-useroperation module imported, default export type:', typeof infUserOperationRoutes.default);
                if (typeof infUserOperationRoutes.default === 'function') {
                    const router = infUserOperationRoutes.default(db);
                    console.log('📦 inf-useroperation router created, type:', typeof router);
                    app.use('/api/inf-useroperation', router);
                    console.log('✅ inf-useroperation routes manually registered');
                }
                else {
                    console.error('❌ inf-useroperation default export is not a function');
                    console.error('Available exports:', Object.keys(infUserOperationRoutes));
                }
            }
            catch (manualError) {
                console.error('❌ Manual inf-useroperation registration failed:', manualError);
            }
        }
        const inspectionDataRegistered = registrationSummary.results.some(r => r.entityName === 'inspectiondata' && r.success);
        if (!inspectionDataRegistered) {
            console.log('🔧 inspectiondata not registered via auto-discovery, registering manually...');
            try {
                const { createInspectionDataRoutes } = await Promise.resolve().then(() => __importStar(require('./entities/inspectiondata/routes')));
                console.log('📦 inspectiondata factory imported, type:', typeof createInspectionDataRoutes);
                if (typeof createInspectionDataRoutes === 'function') {
                    const router = createInspectionDataRoutes(db);
                    console.log('📦 inspectiondata router created, type:', typeof router);
                    app.use('/api/inspectiondata', router);
                    console.log('✅ inspectiondata routes manually registered');
                }
                else {
                    console.error('❌ createInspectionDataRoutes is not a function');
                }
            }
            catch (manualError) {
                console.error('❌ Manual inspectiondata registration failed:', manualError);
            }
        }
        console.log('🔧 Force registering inf-checkin for debugging...');
        try {
            const infCheckinRoutes = await Promise.resolve().then(() => __importStar(require('./entities/inf/inf-checkin/routes')));
            if (typeof infCheckinRoutes.default === 'function') {
                const router = infCheckinRoutes.default(db);
                app.use('/api/inf-checkin-debug', router);
                console.log('✅ inf-checkin routes registered at /api/inf-checkin-debug for testing');
            }
        }
        catch (debugError) {
            console.error('❌ Debug registration failed:', debugError);
        }
        console.log('🔧 Force registering inf-lotinput for debugging...');
        try {
            const infLotInputRoutes = await Promise.resolve().then(() => __importStar(require('./entities/inf/inf-lotinput/routes')));
            if (typeof infLotInputRoutes.default === 'function') {
                const router = infLotInputRoutes.default(db);
                app.use('/api/inf-lotinput-debug', router);
            }
        }
        catch (debugError) {
        }
        console.log('🔧 Manually registering defectdata-iqa routes...');
        try {
            const defectDataIQAModule = await Promise.resolve().then(() => __importStar(require('./entities/defectdata-iqa')));
            if (typeof defectDataIQAModule.default === 'function') {
                const router = defectDataIQAModule.default(db);
                app.use('/api/defectdata-iqa', router);
                console.log('✅ defectdata-iqa routes registered at /api/defectdata-iqa');
            }
            else {
                console.error('❌ defectdata-iqa default export is not a function');
            }
        }
        catch (error) {
            console.error('❌ defectdata-iqa registration failed:', error);
        }
    }
    catch (error) {
        console.error('❌ Auto-Discovery failed:', error);
        console.error('   Falling back to manual route registration...');
        try {
            console.log('🔧 Manually registering inf-checkin routes...');
            const infCheckinRoutes = await Promise.resolve().then(() => __importStar(require('./entities/inf/inf-checkin/routes')));
            if (typeof infCheckinRoutes.default === 'function') {
                const router = infCheckinRoutes.default(db);
                app.use('/api/inf-checkin', router);
                console.log('✅ inf-checkin routes manually registered');
            }
            else {
                console.error('❌ inf-checkin default export is not a function');
            }
        }
        catch (manualError) {
            console.error('❌ Manual inf-checkin registration failed:', manualError);
        }
        const createAuthRoutes = (await Promise.resolve().then(() => __importStar(require('./entities/auth/routes')))).default;
        app.use('/api/auth', createAuthRoutes(db));
        console.log('✅ Auth routes registered manually as fallback');
    }
    try {
        const schedulerRoutes = (await Promise.resolve().then(() => __importStar(require('./routes/schedulerRoutes')))).default;
        app.use('/api/scheduler', schedulerRoutes);
        console.log('✅ Scheduler routes registered at /api/scheduler');
    }
    catch (error) {
        console.error('⚠️ Failed to register scheduler routes:', error);
    }
    try {
        const systemRoutes = (await Promise.resolve().then(() => __importStar(require('./routes/systemRoutes')))).default;
        app.use('/api/system', systemRoutes);
        console.log('✅ System management routes registered at /api/system');
    }
    catch (error) {
        console.error('⚠️ Failed to register system routes:', error);
    }
    try {
        const { createAdminAuthRoutes } = await Promise.resolve().then(() => __importStar(require('./routes/adminAuthRoutes')));
        app.use('/api/admin', createAdminAuthRoutes(db));
        console.log('✅ Admin auth/session routes registered at /api/admin');
    }
    catch (error) {
        console.error('⚠️ Failed to register admin auth routes:', error);
    }
    try {
        const { createAdminPurgeRoutes } = await Promise.resolve().then(() => __importStar(require('./routes/adminPurgeRoutes')));
        app.use('/api/admin/purge', createAdminPurgeRoutes(db));
        console.log('✅ Admin purge routes registered at /api/admin/purge');
    }
    catch (error) {
        console.error('⚠️ Failed to register admin purge routes:', error);
    }
    try {
        const { createAdminAuditRoutes } = await Promise.resolve().then(() => __importStar(require('./routes/adminAuditRoutes')));
        app.use('/api/admin', createAdminAuditRoutes(db));
        console.log('✅ Admin audit routes registered at /api/admin/audit-log');
    }
    catch (error) {
        console.error('⚠️ Failed to register admin audit routes:', error);
    }
    app.get('/health', (req, res) => {
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            session: req.session ? 'configured' : 'missing',
            database: 'connected',
            authentication: 'enabled',
            autoDiscovery: 'enabled',
            version: process.env.npm_package_version || '1.0.0'
        });
    });
    app.get('/api', (req, res) => {
        res.json({
            message: 'Manufacturing Quality Control API',
            version: '1.0.0',
            session: req.session ? 'active' : 'none',
            authenticated: req.session?.user ? 'yes' : 'no',
            user: req.session?.user || null,
            architecture: 'Complete Separation Entity + Generic Patterns',
            autoDiscovery: 'enabled',
            commonEndpoints: {
                auth: '/api/auth/*',
                users: '/api/users/*',
                defects: '/api/defects/*',
                customers: '/api/customers/*',
                scheduler: '/api/scheduler/*',
                health: '/health',
                apiInfo: '/api'
            },
            timestamp: new Date().toISOString()
        });
    });
    app.use('*', (req, res) => {
        res.status(404).json({
            success: false,
            message: `Route not found: ${req.method} ${req.path}`,
            code: 'ROUTE_NOT_FOUND',
            meta: {
                timestamp: new Date().toISOString(),
                method: req.method,
                url: req.path,
                hint: 'Check /api for available endpoints'
            }
        });
    });
    app.use((error, req, res, next) => {
        console.error('Global error handler:', error);
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Internal server error',
            code: error.code || 'INTERNAL_ERROR',
            meta: {
                timestamp: new Date().toISOString(),
                method: req.method,
                url: req.path,
                ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
            }
        });
    });
    return app;
}
