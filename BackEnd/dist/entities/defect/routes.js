"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = createDefectRoutes;
exports.createDefectRoutesWithController = createDefectRoutesWithController;
exports.createDefectRoutesWithCustomRoles = createDefectRoutesWithCustomRoles;
exports.createDefectEntity = createDefectEntity;
const express_1 = require("express");
const generic_routes_1 = require("../../generic/entities/serial-id-entity/generic-routes");
const types_1 = require("./types");
const controller_1 = require("./controller");
const service_1 = require("./service");
const model_1 = require("./model");
const database_1 = require("../../config/database");
const auth_1 = require("../../middleware/auth");
function createDefectRoutes(_db) {
    const router = (0, express_1.Router)();
    const defectModel = (0, model_1.createDefectModel)((0, database_1.getDrizzle)());
    const defectService = new service_1.DefectService(defectModel);
    const defectController = new controller_1.DefectController(defectService);
    router.use(auth_1.requestTracking);
    router.get('/validate/name/:name', auth_1.requireAuthentication, auth_1.requireUser, validateDefectName, (req, res, next) => {
        defectController.validateNameUnique(req, res, next);
    });
    router.get('/validate/name/:name/:excludeId', auth_1.requireAuthentication, auth_1.requireUser, validateDefectName, validateExcludeId, (req, res, next) => {
        defectController.validateNameUnique(req, res, next);
    });
    const genericRouter = (0, generic_routes_1.createSerialIdRoutes)(defectController, types_1.DEFAULT_DEFECT_CONFIG);
    router.use('/', genericRouter);
    return router;
}
function createDefectRoutesWithController(controller) {
    const router = (0, express_1.Router)();
    router.use(auth_1.requestTracking);
    setupDefectSpecificRoutes(router, controller);
    const genericRouter = (0, generic_routes_1.createSerialIdRoutes)(controller, types_1.DEFAULT_DEFECT_CONFIG);
    router.use('/', genericRouter);
    return router;
}
function createDefectRoutesWithCustomRoles(controller, customRoles) {
    const router = (0, express_1.Router)();
    router.use(auth_1.requestTracking);
    setupDefectSpecificRoutesWithRoles(router, controller, customRoles);
    const genericRouter = (0, generic_routes_1.createSerialIdRoutes)(controller, types_1.DEFAULT_DEFECT_CONFIG);
    router.use('/', genericRouter);
    return router;
}
function createDefectEntity(_db) {
    const model = (0, model_1.createDefectModel)((0, database_1.getDrizzle)());
    const service = new service_1.DefectService(model);
    const controller = new controller_1.DefectController(service);
    const routes = createDefectRoutesWithController(controller);
    return {
        model,
        service,
        controller,
        routes
    };
}
function setupDefectSpecificRoutes(router, controller) {
    router.get('/validate/name/:name', auth_1.requireAuthentication, auth_1.requireUser, validateDefectName, (req, res, next) => {
        controller.validateNameUnique(req, res, next);
    });
    router.get('/validate/name/:name/:excludeId', auth_1.requireAuthentication, auth_1.requireUser, validateDefectName, validateExcludeId, (req, res, next) => {
        controller.validateNameUnique(req, res, next);
    });
}
function setupDefectSpecificRoutesWithRoles(router, controller, customRoles) {
    const roles = {
        read: customRoles?.read || auth_1.requireUser,
        search: customRoles?.search || auth_1.requireUser
    };
    router.get('/validate/name/:name', auth_1.requireAuthentication, roles.search, validateDefectName, (req, res, next) => {
        controller.validateNameUnique(req, res, next);
    });
    router.get('/validate/name/:name/:excludeId', auth_1.requireAuthentication, roles.search, validateDefectName, validateExcludeId, (req, res, next) => {
        controller.validateNameUnique(req, res, next);
    });
}
function validateDefectName(req, res, next) {
    const name = req.params.name;
    if (!name || name.trim().length === 0) {
        res.status(400).json({
            success: false,
            error: 'Defect name is required'
        });
        return;
    }
    if (name.length > 100) {
        res.status(400).json({
            success: false,
            error: 'Defect name too long (max 100 characters)'
        });
        return;
    }
    next();
}
function validateExcludeId(req, res, next) {
    const excludeId = req.params.excludeId;
    if (excludeId && (isNaN(parseInt(excludeId)) || parseInt(excludeId) <= 0)) {
        res.status(400).json({
            success: false,
            error: 'Invalid exclude ID parameter'
        });
        return;
    }
    next();
}
