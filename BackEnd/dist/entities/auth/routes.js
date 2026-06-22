"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = createAuthRoutes;
const express_1 = require("express");
const controller_1 = require("./controller");
const service_1 = require("./service");
const model_1 = require("./model");
const auth_1 = require("../../middleware/auth");
function createAuthRoutes(db) {
    const router = (0, express_1.Router)();
    try {
        console.log('🔧 Creating auth routes with fixed controller...');
        const authModel = new model_1.AuthModel(db);
        const authService = new service_1.AuthService(authModel);
        const authController = new controller_1.AuthController(authService);
        console.log('✅ Auth components created successfully');
        router.post('/login', auth_1.authMiddleware.requestTracking, async (req, res) => {
            try {
                await authController.login(req, res);
            }
            catch (error) {
                console.error('Login route error:', error);
                res.status(500).json(auth_1.authMiddleware.formatError('Login failed due to server error', 'LOGIN_ROUTE_ERROR', 500));
            }
        });
        router.get('/status', auth_1.authMiddleware.requestTracking, auth_1.authMiddleware.optionalAuth, async (req, res) => {
            try {
                await authController.status(req, res);
            }
            catch (error) {
                console.error('Status route error:', error);
                res.status(500).json(auth_1.authMiddleware.formatError('Status check failed', 'STATUS_ROUTE_ERROR', 500));
            }
        });
        router.post('/logout', auth_1.authMiddleware.requestTracking, auth_1.authMiddleware.requireAuth, async (req, res) => {
            try {
                await authController.logout(req, res);
            }
            catch (error) {
                console.error('Logout route error:', error);
                res.status(500).json(auth_1.authMiddleware.formatError('Logout failed', 'LOGOUT_ROUTE_ERROR', 500));
            }
        });
        router.get('/profile', auth_1.authMiddleware.requestTracking, auth_1.authMiddleware.requireAuth, async (req, res) => {
            try {
                await authController.profile(req, res);
            }
            catch (error) {
                console.error('Profile route error:', error);
                res.status(500).json(auth_1.authMiddleware.formatError('Profile retrieval failed', 'PROFILE_ROUTE_ERROR', 500));
            }
        });
        router.put('/password', auth_1.authMiddleware.requestTracking, auth_1.authMiddleware.requireAuth, async (req, res) => {
            try {
                await authController.changePassword(req, res);
            }
            catch (error) {
                console.error('Password change route error:', error);
                res.status(500).json(auth_1.authMiddleware.formatError('Password change failed', 'PASSWORD_ROUTE_ERROR', 500));
            }
        });
        router.get('/health', auth_1.authMiddleware.requestTracking, auth_1.authMiddleware.optionalAuth, async (req, res) => {
            try {
                await authController.health(req, res);
            }
            catch (error) {
                console.error('Health route error:', error);
                res.status(500).json(auth_1.authMiddleware.formatError('Health check failed', 'HEALTH_ROUTE_ERROR', 500));
            }
        });
        console.log('✅ Auth routes registered successfully:');
        console.log('   POST /api/auth/login    - User authentication');
        console.log('   GET  /api/auth/status   - Authentication status (FIXED)');
        console.log('   POST /api/auth/logout   - User logout');
        console.log('   GET  /api/auth/profile  - User profile');
        console.log('   PUT  /api/auth/password - Change password');
        console.log('   GET  /api/auth/health   - Health check');
        return router;
    }
    catch (error) {
        console.error('❌ Error creating auth routes:', error);
        const fallbackRouter = (0, express_1.Router)();
        fallbackRouter.use('*', (req, res) => {
            console.error(`🔍 Fallback auth route hit: ${req.method} ${req.originalUrl}`);
            res.status(500).json({
                success: false,
                message: 'Authentication service unavailable',
                error: 'AUTH_SERVICE_ERROR',
                details: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            });
        });
        return fallbackRouter;
    }
}
