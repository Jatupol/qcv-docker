"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenericSerialIdRoutes = void 0;
exports.createSerialIdRoutes = createSerialIdRoutes;
exports.createSerialIdRoutesWithRoles = createSerialIdRoutesWithRoles;
exports.setupSerialIdEntity = setupSerialIdEntity;
const express_1 = require("express");
const auth_1 = require("../../../middleware/auth");
class GenericSerialIdRoutes {
    constructor(controller, config) {
        this.controller = controller;
        this.config = config;
        this.router = (0, express_1.Router)();
        this.setupRoutes();
    }
    getRouter() {
        return this.router;
    }
    setupRoutes() {
        this.router.use(auth_1.requestTracking);
        this.router.post('/', auth_1.requireAuthentication, auth_1.requireManager, (req, res, next) => {
            this.controller.create(req, res, next);
        });
        this.router.get('/', auth_1.requireAuthentication, auth_1.requireUser, (req, res, next) => {
            this.controller.getAll(req, res, next);
        });
        this.router.get('/health', (req, res, next) => {
            this.controller.health(req, res, next);
        });
        this.router.get('/statistics', auth_1.requireAuthentication, auth_1.requireManager, (req, res, next) => {
            this.controller.statistics(req, res, next);
        });
        this.router.get('/search/name', auth_1.requireAuthentication, auth_1.requireUser, (req, res, next) => {
            this.controller.getByName(req, res, next);
        });
        this.router.get('/filter/status', auth_1.requireAuthentication, auth_1.requireUser, (req, res, next) => {
            this.controller.filterStatus(req, res, next);
        });
        this.router.get('/search/pattern', auth_1.requireAuthentication, auth_1.requireUser, (req, res, next) => {
            this.controller.search(req, res, next);
        });
        this.router.get('/:id', auth_1.requireAuthentication, auth_1.requireUser, auth_1.validateSerialId, (req, res, next) => {
            this.controller.getById(req, res, next);
        });
        this.router.put('/:id', auth_1.requireAuthentication, auth_1.requireManager, auth_1.validateSerialId, (req, res, next) => {
            this.controller.update(req, res, next);
        });
        this.router.delete('/:id', auth_1.requireAuthentication, auth_1.requireManager, auth_1.validateSerialId, (req, res, next) => {
            this.controller.delete(req, res, next);
        });
        this.router.patch('/:id/status', auth_1.requireAuthentication, auth_1.requireManager, auth_1.validateSerialId, (req, res, next) => this.controller.changeStatus(req, res, next));
    }
}
exports.GenericSerialIdRoutes = GenericSerialIdRoutes;
function createSerialIdRoutes(controller, config) {
    const routes = new GenericSerialIdRoutes(controller, config);
    return routes.getRouter();
}
function createSerialIdRoutesWithRoles(controller, config, roleConfig) {
    const router = (0, express_1.Router)();
    router.use(auth_1.requestTracking);
    const roles = {
        create: roleConfig?.create || auth_1.requireManager,
        read: roleConfig?.read || auth_1.requireUser,
        update: roleConfig?.update || auth_1.requireManager,
        delete: roleConfig?.delete || auth_1.requireManager,
        statistics: roleConfig?.statistics || auth_1.requireManager,
        search: roleConfig?.search || auth_1.requireUser
    };
    router.post('/', auth_1.requireAuthentication, roles.create, (req, res, next) => controller.create(req, res, next));
    router.get('/', auth_1.requireAuthentication, roles.read, (req, res, next) => controller.getAll(req, res, next));
    router.get('/health', (req, res, next) => controller.health(req, res, next));
    router.get('/statistics', auth_1.requireAuthentication, roles.statistics, (req, res, next) => controller.statistics(req, res, next));
    router.get('/search/name', auth_1.requireAuthentication, roles.search, (req, res, next) => controller.getByName(req, res, next));
    router.get('/filter/status', auth_1.requireAuthentication, roles.search, (req, res, next) => controller.filterStatus(req, res, next));
    router.get('/search/pattern', auth_1.requireAuthentication, roles.search, (req, res, next) => controller.search(req, res, next));
    router.get('/:id', auth_1.requireAuthentication, roles.read, auth_1.validateSerialId, (req, res, next) => controller.getById(req, res, next));
    router.put('/:id', auth_1.requireAuthentication, roles.update, auth_1.validateSerialId, (req, res, next) => controller.update(req, res, next));
    router.delete('/:id', auth_1.requireAuthentication, roles.delete, auth_1.validateSerialId, (req, res, next) => controller.delete(req, res, next));
    router.patch('/:id/status', auth_1.requireAuthentication, roles.update, auth_1.validateSerialId, (req, res, next) => controller.changeStatus(req, res, next));
    return router;
}
function setupSerialIdEntity(service, config, controllerClass, roleConfig) {
    const controller = new controllerClass(service, config);
    return roleConfig
        ? createSerialIdRoutesWithRoles(controller, config, roleConfig)
        : createSerialIdRoutes(controller, config);
}
exports.default = GenericSerialIdRoutes;
