"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = createsamplingreasonRoutes;
exports.createSamplingReasonRoutesWithController = createSamplingReasonRoutesWithController;
exports.createSamplingReasonRoutesWithCustomRoles = createSamplingReasonRoutesWithCustomRoles;
exports.createSamplingReasonEntity = createSamplingReasonEntity;
const express_1 = require("express");
const generic_routes_1 = require("../../generic/entities/serial-id-entity/generic-routes");
const types_1 = require("./types");
const controller_1 = require("./controller");
const service_1 = require("./service");
const model_1 = require("./model");
const database_1 = require("../../config/database");
const auth_1 = require("../../middleware/auth");
function createsamplingreasonRoutes(_db) {
    const router = (0, express_1.Router)();
    const samplingReasonModel = (0, model_1.createSamplingReasonModel)((0, database_1.getDrizzle)());
    const samplingReasonService = new service_1.SamplingReasonService(samplingReasonModel);
    const samplingReasonController = new controller_1.SamplingReasonController(samplingReasonService);
    router.use(auth_1.requestTracking);
    const genericRouter = (0, generic_routes_1.createSerialIdRoutes)(samplingReasonController, types_1.DEFAULT_SAMPLING_REASON_CONFIG);
    router.use('/', genericRouter);
    return router;
}
function createSamplingReasonRoutesWithController(controller) {
    const router = (0, express_1.Router)();
    router.use(auth_1.requestTracking);
    setupSamplingReasonSpecificRoutes(router, controller);
    const genericRouter = (0, generic_routes_1.createSerialIdRoutes)(controller, types_1.DEFAULT_SAMPLING_REASON_CONFIG);
    router.use('/', genericRouter);
    return router;
}
function createSamplingReasonRoutesWithCustomRoles(controller, customRoles) {
    const router = (0, express_1.Router)();
    router.use(auth_1.requestTracking);
    setupSamplingReasonSpecificRoutesWithRoles(router, controller, customRoles);
    const genericRouter = (0, generic_routes_1.createSerialIdRoutes)(controller, types_1.DEFAULT_SAMPLING_REASON_CONFIG);
    router.use('/', genericRouter);
    return router;
}
function createSamplingReasonEntity(_db) {
    const model = (0, model_1.createSamplingReasonModel)((0, database_1.getDrizzle)());
    const service = new service_1.SamplingReasonService(model);
    const controller = new controller_1.SamplingReasonController(service);
    const routes = createSamplingReasonRoutesWithController(controller);
    return {
        model,
        service,
        controller,
        routes
    };
}
function setupSamplingReasonSpecificRoutes(router, controller) {
}
function setupSamplingReasonSpecificRoutesWithRoles(router, controller, customRoles) {
    const roles = {
        read: customRoles?.read || auth_1.requireUser,
        search: customRoles?.search || auth_1.requireUser
    };
}
function validateSamplingReasonName(req, res, next) {
    const name = req.params.name;
    if (!name || name.trim().length === 0) {
        res.status(400).json({
            success: false,
            error: 'Sampling reason name is required'
        });
        return;
    }
    if (name.length > 100) {
        res.status(400).json({
            success: false,
            error: 'Sampling reason name too long (max 100 characters)'
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
