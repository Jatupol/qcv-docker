"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartsRoutes = void 0;
exports.createPartsRoutesWithController = createPartsRoutesWithController;
exports.default = default_1;
exports.createpartsRoutes = createpartsRoutes;
exports.createPartsEntity = createPartsEntity;
const express_1 = require("express");
const controller_1 = require("./controller");
const service_1 = require("./service");
const model_1 = require("./model");
const database_1 = require("../../config/database");
const auth_1 = require("../../middleware/auth");
class PartsRoutes {
    constructor(controller) {
        this.router = (0, express_1.Router)();
        this.controller = controller;
        this.setupRoutes();
    }
    getRouter() {
        return this.router;
    }
    setupRoutes() {
        this.router.use(auth_1.requestTracking);
        this.router.get('/health', auth_1.requireAuthentication, (req, res, next) => {
            this.controller.getHealth(req, res, next);
        });
        this.router.get('/statistics', auth_1.requireAuthentication, auth_1.requireManager, (req, res, next) => {
            this.controller.getStatistics(req, res, next);
        });
        this.router.get('/customer-sites', auth_1.requireAuthentication, auth_1.requireUser, (req, res, next) => {
            this.controller.getCustomerSites(req, res, next);
        });
        this.router.get('/', auth_1.requireAuthentication, auth_1.requireUser, (req, res, next) => {
            this.controller.getAll(req, res, next);
        });
        this.router.get('/:partno', auth_1.requireAuthentication, auth_1.requireUser, (req, res, next) => {
            this.controller.getByKey(req, res, next);
        });
        this.router.post('/', auth_1.requireAuthentication, auth_1.requireManager, (req, res, next) => {
            this.controller.create(req, res, next);
        });
        this.router.post('/import', auth_1.requireAuthentication, auth_1.requireManager, (req, res, next) => {
            this.controller.import(req, res, next);
        });
        this.router.put('/:partno', auth_1.requireAuthentication, auth_1.requireManager, (req, res, next) => {
            this.controller.update(req, res, next);
        });
        this.router.delete('/:partno', auth_1.requireAuthentication, auth_1.requireAdmin, (req, res, next) => {
            this.controller.delete(req, res, next);
        });
    }
}
exports.PartsRoutes = PartsRoutes;
function createPartsRoutesWithController(controller) {
    const partsRoutes = new PartsRoutes(controller);
    return partsRoutes.getRouter();
}
function default_1(_db) {
    const partsModel = (0, model_1.createPartsModel)((0, database_1.getDrizzle)());
    const partsService = new service_1.PartsService(partsModel);
    const partsController = new controller_1.PartsController(partsService);
    return createPartsRoutesWithController(partsController);
}
function createpartsRoutes(_db) {
    const partsModel = (0, model_1.createPartsModel)((0, database_1.getDrizzle)());
    const partsService = new service_1.PartsService(partsModel);
    const partsController = new controller_1.PartsController(partsService);
    return createPartsRoutesWithController(partsController);
}
function createPartsEntity(_db) {
    const model = (0, model_1.createPartsModel)((0, database_1.getDrizzle)());
    const service = new service_1.PartsService(model);
    const controller = new controller_1.PartsController(service);
    const routes = new PartsRoutes(controller);
    return {
        model,
        service,
        controller,
        routes: routes.getRouter()
    };
}
