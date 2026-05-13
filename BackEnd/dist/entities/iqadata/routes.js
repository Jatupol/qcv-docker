"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IQADataRoutes = void 0;
exports.createIQADataRoutes = createIQADataRoutes;
exports.createIQADataRoutesWithController = createIQADataRoutesWithController;
exports.default = createIQADataRouter;
const express_1 = require("express");
const controller_1 = require("./controller");
const service_1 = require("./service");
const model_1 = require("./model");
const database_1 = require("../../config/database");
const auth_1 = require("../../middleware/auth");
class IQADataRoutes {
    constructor(controller) {
        this.router = (0, express_1.Router)();
        this.controller = controller;
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.use(auth_1.requestTracking);
        this.router.get('/health', auth_1.requireAuthentication, (req, res, next) => {
            this.controller.getHealth(req, res, next);
        });
        this.router.get('/statistics', auth_1.requireAuthentication, auth_1.requireManager, (req, res, next) => {
            this.controller.getStatistics(req, res, next);
        });
        this.router.get('/distinct-fy', auth_1.requireAuthentication, auth_1.requireUser, (req, res, next) => {
            this.controller.getDistinctFY(req, res, next);
        });
        this.router.get('/distinct-ww', auth_1.requireAuthentication, auth_1.requireUser, (req, res, next) => {
            this.controller.getDistinctWW(req, res, next);
        });
        this.router.post('/bulk', auth_1.requireAuthentication, auth_1.requireUser, (req, res, next) => {
            this.controller.bulkImport(req, res, next);
        });
        this.router.post('/upsert', auth_1.requireAuthentication, auth_1.requireUser, (req, res, next) => {
            this.controller.upsert(req, res, next);
        });
        this.router.delete('/all', auth_1.requireAuthentication, auth_1.requireAdmin, (req, res, next) => {
            this.controller.deleteAll(req, res, next);
        });
        this.router.post('/bulk-delete', auth_1.requireAuthentication, auth_1.requireManager, (req, res, next) => {
            this.controller.bulkDelete(req, res, next);
        });
        this.router.get('/', auth_1.requireAuthentication, auth_1.requireUser, (req, res, next) => {
            this.controller.getAll(req, res, next);
        });
        this.router.get('/:id', auth_1.requireAuthentication, auth_1.requireUser, (req, res, next) => {
            this.controller.getByKey(req, res, next);
        });
        this.router.post('/', auth_1.requireAuthentication, auth_1.requireUser, (req, res, next) => {
            this.controller.create(req, res, next);
        });
        this.router.put('/:id', auth_1.requireAuthentication, auth_1.requireUser, (req, res, next) => {
            this.controller.update(req, res, next);
        });
        this.router.delete('/:id', auth_1.requireAuthentication, auth_1.requireManager, (req, res, next) => {
            this.controller.delete(req, res, next);
        });
    }
}
exports.IQADataRoutes = IQADataRoutes;
function createIQADataRoutes(_db) {
    const model = (0, model_1.createIQADataModel)((0, database_1.getDrizzle)());
    const service = new service_1.IQADataService(model);
    const controller = new controller_1.IQADataController(service);
    const routes = new IQADataRoutes(controller);
    return routes.router;
}
function createIQADataRoutesWithController(controller) {
    const routes = new IQADataRoutes(controller);
    return routes.router;
}
function createIQADataRouter(_db) {
    return createIQADataRoutes((0, database_1.getDrizzle)());
}
