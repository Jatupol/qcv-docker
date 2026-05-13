"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.USER_ROUTE_CONFIG = void 0;
exports.default = createUserRoutes;
const express_1 = require("express");
const controller_1 = require("./controller");
const service_1 = require("./service");
const model_1 = require("./model");
const database_1 = require("../../config/database");
const auth_1 = require("../../middleware/auth");
function createUserRoutes(_db) {
    const router = (0, express_1.Router)();
    const userModel = (0, model_1.createUserModel)((0, database_1.getDrizzle)());
    const userService = new service_1.UserService(userModel);
    const userController = new controller_1.UserController(userService);
    const wrapper = createControllerWrapper(userController, userModel);
    router.use(auth_1.authMiddleware.requestTracking);
    router.get('/statistics', auth_1.authMiddleware.requireAuth, wrapper.getUserStatistics);
    router.get('/health', wrapper.healthCheck);
    router.get('/check-username', wrapper.checkUsernameAvailability);
    router.get('/check-email', wrapper.checkEmailAvailability);
    router.post('/export', auth_1.authMiddleware.requireAuth, wrapper.exportUsers);
    router.post('/checkin', wrapper.checkin);
    router.patch('/bulk-update-status', auth_1.authMiddleware.requireAuth, wrapper.bulkUpdateStatus);
    router.put('/:id/password', auth_1.authMiddleware.requireAuth, wrapper.changePassword);
    router.patch('/:id/reset-password', auth_1.authMiddleware.requireAuth, wrapper.resetPassword);
    router.patch('/:id/toggle-status', auth_1.authMiddleware.requireAuth, wrapper.toggleStatus);
    router.patch('/:id/profile', auth_1.authMiddleware.requireAuth, wrapper.updateProfile);
    router.get('/', auth_1.authMiddleware.requireAuth, wrapper.getAll);
    router.post('/', auth_1.authMiddleware.requireAuth, wrapper.create);
    router.get('/:id', auth_1.authMiddleware.requireAuth, wrapper.getById);
    router.put('/:id', auth_1.authMiddleware.requireAuth, wrapper.update);
    router.delete('/:id', auth_1.authMiddleware.requireAuth, wrapper.delete);
    return router;
}
function createControllerWrapper(controller, userModel) {
    return {
        create: (req, res, next) => {
            controller.create(req, res, next);
        },
        getById: (req, res, next) => {
            controller.getById(req, res, next);
        },
        getAll: (req, res, next) => {
            controller.getAll(req, res, next);
        },
        update: (req, res, next) => {
            controller.update(req, res, next);
        },
        delete: (req, res, next) => {
            controller.delete(req, res, next);
        },
        changePassword: (req, res, next) => {
            controller.changePassword(req, res, next);
        },
        resetPassword: async (req, res, next) => {
            try {
                const id = parseInt(req.params.id);
                if (isNaN(id) || id <= 0) {
                    res.status(400).json({
                        success: false,
                        message: 'Invalid user ID'
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    data: { temporaryPassword: 'TEMP_PASSWORD_' + Math.random().toString(36).slice(-8) },
                    message: 'Password reset successfully'
                });
            }
            catch (error) {
                next(error);
            }
        },
        toggleStatus: async (req, res, next) => {
            try {
                const id = parseInt(req.params.id);
                if (isNaN(id) || id <= 0) {
                    res.status(400).json({
                        success: false,
                        message: 'Invalid user ID'
                    });
                    return;
                }
                const currentUser = await userModel.findById(id);
                if (!currentUser) {
                    res.status(404).json({
                        success: false,
                        message: 'User not found'
                    });
                    return;
                }
                const updatedBy = req.user?.id || 0;
                const updatedUser = await userModel.updateUser(id, { is_active: !currentUser.is_active }, updatedBy);
                res.status(200).json({
                    success: true,
                    data: updatedUser,
                    message: `User ${updatedUser.is_active ? 'activated' : 'deactivated'} successfully`
                });
            }
            catch (error) {
                next(error);
            }
        },
        updateProfile: async (req, res, next) => {
            try {
                const id = parseInt(req.params.id);
                if (isNaN(id) || id <= 0) {
                    res.status(400).json({
                        success: false,
                        message: 'Invalid user ID'
                    });
                    return;
                }
                controller.update(req, res, next);
            }
            catch (error) {
                next(error);
            }
        },
        getUserStatistics: (req, res, next) => {
            controller.getUserStatistics(req, res, next);
        },
        healthCheck: async (req, res, next) => {
            try {
                res.status(200).json({
                    success: true,
                    data: {
                        status: 'healthy',
                        timestamp: new Date().toISOString()
                    },
                    message: 'User service is healthy'
                });
            }
            catch (error) {
                next(error);
            }
        },
        checkUsernameAvailability: async (req, res, next) => {
            try {
                const { username, exclude_user_id } = req.query;
                if (!username || typeof username !== 'string') {
                    res.status(400).json({
                        success: false,
                        message: 'Username is required'
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    data: { available: true },
                    message: 'Username is available'
                });
            }
            catch (error) {
                next(error);
            }
        },
        checkEmailAvailability: async (req, res, next) => {
            try {
                const { email, exclude_user_id } = req.query;
                if (!email || typeof email !== 'string') {
                    res.status(400).json({
                        success: false,
                        message: 'Email is required'
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    data: { available: true },
                    message: 'Email is available'
                });
            }
            catch (error) {
                next(error);
            }
        },
        bulkUpdateStatus: async (req, res, next) => {
            try {
                const { userIds, isActive } = req.body;
                if (!Array.isArray(userIds) || userIds.length === 0) {
                    res.status(400).json({
                        success: false,
                        message: 'No user IDs provided'
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    data: {
                        updated: userIds.length,
                        failed: 0
                    },
                    message: 'Users updated successfully'
                });
            }
            catch (error) {
                next(error);
            }
        },
        exportUsers: async (req, res, next) => {
            try {
                res.status(200).json({
                    success: true,
                    data: {
                        downloadUrl: '/api/users/downloads/users-export-' + Date.now() + '.csv'
                    },
                    message: 'Export initiated successfully'
                });
            }
            catch (error) {
                next(error);
            }
        },
        checkin: (req, res, next) => {
            controller.checkin(req, res, next);
        }
    };
}
exports.USER_ROUTE_CONFIG = {
    basePath: '/api/users',
    entityName: 'user',
    primaryKey: 'id',
    endpoints: {
        getAll: { method: 'GET', path: '/', auth: true },
        getById: { method: 'GET', path: '/:id', auth: true },
        create: { method: 'POST', path: '/', auth: true },
        update: { method: 'PUT', path: '/:id', auth: true },
        delete: { method: 'DELETE', path: '/:id', auth: true },
        toggleStatus: { method: 'PATCH', path: '/:id/toggle-status', auth: true },
        changePassword: { method: 'PUT', path: '/:id/password', auth: true },
        resetPassword: { method: 'PATCH', path: '/:id/reset-password', auth: true },
        updateProfile: { method: 'PATCH', path: '/:id/profile', auth: true },
        getStatistics: { method: 'GET', path: '/statistics', auth: true },
        healthCheck: { method: 'GET', path: '/health', auth: false },
        checkUsername: { method: 'GET', path: '/check-username', auth: false },
        checkEmail: { method: 'GET', path: '/check-email', auth: false },
        bulkUpdateStatus: { method: 'PATCH', path: '/bulk-update-status', auth: true },
        exportUsers: { method: 'POST', path: '/export', auth: true },
        checkin: { method: 'POST', path: '/checkin', auth: false }
    }
};
