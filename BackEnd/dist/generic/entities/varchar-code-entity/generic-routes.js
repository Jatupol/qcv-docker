"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenericVarcharCodeRoutes = void 0;
exports.createVarcharCodeRoutes = createVarcharCodeRoutes;
exports.createVarcharCodeRoutesWithRoles = createVarcharCodeRoutesWithRoles;
exports.setupVarcharCodeEntity = setupVarcharCodeEntity;
const express_1 = require("express");
const auth_1 = require("../../../middleware/auth");
class GenericVarcharCodeRoutes {
    constructor(controller, config) {
        this.validateNameParameter = (req, res, next) => {
            const { name } = req.params;
            if (!name || typeof name !== 'string') {
                return res.status(400).json({
                    success: false,
                    error: 'Name parameter is required and must be a string'
                });
            }
            if (name.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Name parameter cannot be empty'
                });
            }
            if (name.length > 255) {
                return res.status(400).json({
                    success: false,
                    error: 'Name parameter is too long (max 255 characters)'
                });
            }
            req.params.name = decodeURIComponent(name);
            next();
        };
        this.validatePatternParameter = (req, res, next) => {
            const { pattern } = req.params;
            if (!pattern || typeof pattern !== 'string') {
                return res.status(400).json({
                    success: false,
                    error: 'Pattern parameter is required and must be a string'
                });
            }
            if (pattern.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Pattern parameter cannot be empty'
                });
            }
            if (pattern.length > 255) {
                return res.status(400).json({
                    success: false,
                    error: 'Pattern parameter is too long (max 255 characters)'
                });
            }
            req.params.pattern = decodeURIComponent(pattern);
            next();
        };
        this.validateStatusParameter = (req, res, next) => {
            const { status } = req.params;
            if (!status || typeof status !== 'string') {
                return res.status(400).json({
                    success: false,
                    error: 'Status parameter is required and must be a string'
                });
            }
            const validValues = ['true', 'false', '1', '0'];
            if (!validValues.includes(status.toLowerCase())) {
                return res.status(400).json({
                    success: false,
                    error: 'Status parameter must be true, false, 1, or 0'
                });
            }
            next();
        };
        this.validateCreateData = (req, res, next) => {
            const { code, name, is_active } = req.body;
            if (!code || typeof code !== 'string') {
                return res.status(400).json({
                    success: false,
                    error: 'Code is required and must be a string'
                });
            }
            if (!name || typeof name !== 'string') {
                return res.status(400).json({
                    success: false,
                    error: 'Name is required and must be a string'
                });
            }
            if (code.length === 0 || code.length > this.config.codeLength) {
                return res.status(400).json({
                    success: false,
                    error: `Code must be 1-${this.config.codeLength} characters long`
                });
            }
            if (name.trim().length === 0 || name.length > 255) {
                return res.status(400).json({
                    success: false,
                    error: 'Name must be 1-255 characters long'
                });
            }
            if (!/^[A-Z0-9_-]+$/i.test(code)) {
                return res.status(400).json({
                    success: false,
                    error: 'Code can only contain letters, numbers, underscores, and hyphens'
                });
            }
            if (is_active !== undefined && typeof is_active !== 'boolean') {
                return res.status(400).json({
                    success: false,
                    error: 'is_active must be a boolean value'
                });
            }
            next();
        };
        this.validateUpdateData = (req, res, next) => {
            const { name, is_active } = req.body;
            if (name === undefined && is_active === undefined) {
                return res.status(400).json({
                    success: false,
                    error: 'At least one field (name or is_active) must be provided for update'
                });
            }
            if (name !== undefined) {
                if (typeof name !== 'string') {
                    return res.status(400).json({
                        success: false,
                        error: 'Name must be a string'
                    });
                }
                if (name.trim().length === 0 || name.length > 255) {
                    return res.status(400).json({
                        success: false,
                        error: 'Name must be 1-255 characters long'
                    });
                }
            }
            if (is_active !== undefined && typeof is_active !== 'boolean') {
                return res.status(400).json({
                    success: false,
                    error: 'is_active must be a boolean value'
                });
            }
            next();
        };
        this.router = (0, express_1.Router)();
        this.controller = controller;
        this.config = config;
        this.setupRoutes();
    }
    getRouter() {
        return this.router;
    }
    setupRoutes() {
        this.router.use(auth_1.requestTracking);
        this.router.get('/health', auth_1.requireAuthentication, auth_1.requireManager, (req, res, next) => this.controller.getHealth(req, res, next));
        this.router.get('/statistics', auth_1.requireAuthentication, auth_1.requireManager, (req, res, next) => this.controller.getStatistics(req, res, next));
        this.router.get('/search/name/:name', auth_1.requireAuthentication, auth_1.requireUser, this.validateNameParameter, (req, res, next) => this.controller.getByName(req, res, next));
        this.router.get('/search/pattern/:pattern', auth_1.requireAuthentication, auth_1.requireUser, this.validatePatternParameter, (req, res, next) => this.controller.search(req, res, next));
        this.router.get('/filter/status/:status', auth_1.requireAuthentication, auth_1.requireUser, this.validateStatusParameter, (req, res, next) => this.controller.filterStatus(req, res, next));
        this.router.post('/', auth_1.requireAuthentication, auth_1.requireManager, this.validateCreateData, (req, res, next) => this.controller.create(req, res, next));
        this.router.get('/', auth_1.requireAuthentication, auth_1.requireUser, (req, res, next) => this.controller.getAll(req, res, next));
        this.router.get('/:code', auth_1.requireAuthentication, auth_1.requireUser, auth_1.validateVarcharCode, (req, res, next) => this.controller.getByCode(req, res, next));
        this.router.put('/:code', auth_1.requireAuthentication, auth_1.requireManager, auth_1.validateVarcharCode, this.validateUpdateData, (req, res, next) => this.controller.update(req, res, next));
        this.router.patch('/:code/status', auth_1.requireAuthentication, auth_1.requireManager, auth_1.validateVarcharCode, (req, res, next) => this.controller.changeStatus(req, res, next));
        this.router.delete('/:code', auth_1.requireAuthentication, auth_1.requireAdmin, auth_1.validateVarcharCode, (req, res, next) => this.controller.delete(req, res, next));
    }
}
exports.GenericVarcharCodeRoutes = GenericVarcharCodeRoutes;
function createVarcharCodeRoutes(controller, config) {
    const routes = new GenericVarcharCodeRoutes(controller, config);
    return routes.getRouter();
}
function createVarcharCodeRoutesWithRoles(controller, config, roleConfig) {
    const router = (0, express_1.Router)();
    router.use(auth_1.requestTracking);
    const roles = {
        create: roleConfig?.create || auth_1.requireManager,
        read: roleConfig?.read || auth_1.requireUser,
        update: roleConfig?.update || auth_1.requireManager,
        delete: roleConfig?.delete || auth_1.requireAdmin,
        health: roleConfig?.health || auth_1.requireUser,
        statistics: roleConfig?.statistics || auth_1.requireUser
    };
    router.get('/health', auth_1.requireAuthentication, roles.health, (req, res, next) => controller.getHealth(req, res, next));
    router.get('/statistics', auth_1.requireAuthentication, roles.statistics, (req, res, next) => controller.getStatistics(req, res, next));
    router.get('/search/name/:name', auth_1.requireAuthentication, roles.read, (req, res, next) => controller.getByName(req, res, next));
    router.get('/search/pattern/:pattern', auth_1.requireAuthentication, roles.read, (req, res, next) => controller.search(req, res, next));
    router.get('/filter/status/:status', auth_1.requireAuthentication, roles.read, (req, res, next) => controller.filterStatus(req, res, next));
    router.post('/', auth_1.requireAuthentication, roles.create, (req, res, next) => controller.create(req, res, next));
    router.get('/', auth_1.requireAuthentication, roles.read, (req, res, next) => controller.getAll(req, res, next));
    router.get('/:code', auth_1.requireAuthentication, roles.read, auth_1.validateVarcharCode, (req, res, next) => controller.getByCode(req, res, next));
    router.put('/:code', auth_1.requireAuthentication, roles.update, auth_1.validateVarcharCode, (req, res, next) => controller.update(req, res, next));
    router.patch('/:code/status', auth_1.requireAuthentication, roles.update, auth_1.validateVarcharCode, (req, res, next) => controller.changeStatus(req, res, next));
    router.delete('/:code', auth_1.requireAuthentication, roles.delete, auth_1.validateVarcharCode, (req, res, next) => controller.delete(req, res, next));
    return router;
}
function setupVarcharCodeEntity(controller, config, customRoles) {
    if (customRoles) {
        return createVarcharCodeRoutesWithRoles(controller, config, customRoles);
    }
    return createVarcharCodeRoutes(controller, config);
}
exports.default = GenericVarcharCodeRoutes;
