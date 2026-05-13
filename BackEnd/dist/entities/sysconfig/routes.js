"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = createSysconfigRoutes;
exports.createSysconfigRoutesWithController = createSysconfigRoutesWithController;
exports.createSysconfigEntity = createSysconfigEntity;
const express_1 = require("express");
const generic_routes_1 = require("../../generic/entities/serial-id-entity/generic-routes");
const types_1 = require("./types");
const controller_1 = require("./controller");
const service_1 = require("./service");
const model_1 = require("./model");
const database_1 = require("../../config/database");
const auth_1 = require("../../middleware/auth");
function createSysconfigRoutes(_db) {
    const router = (0, express_1.Router)();
    const sysconfigModel = (0, model_1.createSysconfigModel)((0, database_1.getDrizzle)());
    const sysconfigService = new service_1.SysconfigService(sysconfigModel);
    const sysconfigController = new controller_1.SysconfigController(sysconfigService);
    router.use(auth_1.requestTracking);
    router.get('/active', (req, res, next) => {
        sysconfigController.getActiveConfig(req, res, next);
    });
    router.get('/active/parsed', auth_1.requireAuthentication, auth_1.requireUser, (req, res, next) => {
        sysconfigController.getActiveConfigWithParsed(req, res, next);
    });
    router.get('/parsed', auth_1.requireAuthentication, auth_1.requireUser, (req, res, next) => {
        sysconfigController.getAllWithParsed(req, res, next);
    });
    router.post('/test-mssql', auth_1.requireAuthentication, auth_1.requireUser, (req, res, next) => {
        sysconfigController.testMssqlConnection(req, res, next);
    });
    router.post('/test-smtp', auth_1.requireAuthentication, auth_1.requireUser, (req, res, next) => {
        sysconfigController.testSmtpConnection(req, res, next);
    });
    router.get('/test-smtp', auth_1.requireAuthentication, auth_1.requireUser, (req, res, next) => {
        sysconfigController.testSmtpConnection(req, res, next);
    });
    router.get('/:id/parsed', auth_1.requireAuthentication, auth_1.requireUser, auth_1.validateSerialId, (req, res, next) => {
        sysconfigController.getByIdWithParsed(req, res, next);
    });
    router.put('/:id/activate', auth_1.requireAuthentication, auth_1.requireAdmin, auth_1.validateSerialId, (req, res, next) => {
        sysconfigController.activateConfig(req, res, next);
    });
    const genericRouter = (0, generic_routes_1.createSerialIdRoutes)(sysconfigController, types_1.SYSCONFIG_ENTITY_CONFIG);
    router.use('/', genericRouter);
    return router;
}
function createSysconfigRoutesWithController(controller) {
    const router = (0, express_1.Router)();
    router.use(auth_1.requestTracking);
    router.get('/active', (req, res, next) => {
        controller.getActiveConfig(req, res, next);
    });
    router.get('/active/parsed', auth_1.requireAuthentication, auth_1.requireUser, (req, res, next) => {
        controller.getActiveConfigWithParsed(req, res, next);
    });
    router.get('/parsed', auth_1.requireAuthentication, auth_1.requireUser, (req, res, next) => {
        controller.getAllWithParsed(req, res, next);
    });
    router.post('/test-mssql', auth_1.requireAuthentication, auth_1.requireUser, (req, res, next) => {
        controller.testMssqlConnection(req, res, next);
    });
    router.post('/test-smtp', auth_1.requireAuthentication, auth_1.requireUser, (req, res, next) => {
        controller.testSmtpConnection(req, res, next);
    });
    router.get('/:id/parsed', auth_1.requireAuthentication, auth_1.requireUser, auth_1.validateSerialId, (req, res, next) => {
        controller.getByIdWithParsed(req, res, next);
    });
    router.put('/:id/activate', auth_1.requireAuthentication, auth_1.requireAdmin, auth_1.validateSerialId, (req, res, next) => {
        controller.activateConfig(req, res, next);
    });
    const genericRouter = (0, generic_routes_1.createSerialIdRoutes)(controller, types_1.SYSCONFIG_ENTITY_CONFIG);
    router.use('/', genericRouter);
    return router;
}
function createSysconfigEntity(_db) {
    const model = (0, model_1.createSysconfigModel)((0, database_1.getDrizzle)());
    const service = new service_1.SysconfigService(model);
    const controller = new controller_1.SysconfigController(service);
    const routes = createSysconfigRoutesWithController(controller);
    return {
        model,
        service,
        controller,
        routes
    };
}
