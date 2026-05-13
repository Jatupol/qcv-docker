"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = createInfUserOperationRoutes;
const express_1 = require("express");
const controller_1 = require("./controller");
const service_1 = require("./service");
const model_1 = require("./model");
const database_1 = require("../../../config/database");
function createInfUserOperationRoutes(_db) {
    const router = (0, express_1.Router)();
    const drizzleDb = (0, database_1.getDrizzle)();
    const model = (0, model_1.createInfUserOperationModel)(drizzleDb);
    const service = new service_1.InfUserOperationService(model, drizzleDb.$client);
    const controller = new controller_1.InfUserOperationController(service);
    router.get('/statistics', (req, res, next) => {
        controller.getStatistics(req, res, next);
    });
    router.get('/filter-options', (req, res, next) => {
        controller.getFilterOptions(req, res, next);
    });
    router.get('/health', (req, res, next) => {
        controller.healthCheck(req, res, next);
    });
    router.get('/test', (req, res) => {
        res.json({
            success: true,
            message: 'inf-useroperation routes are working!',
            timestamp: new Date().toISOString(),
            route: '/api/inf-useroperation/test'
        });
    });
    router.get('/', (req, res, next) => {
        controller.getAll(req, res, next);
    });
    router.post('/sync', (req, res, next) => {
        controller.sync(req, res, next);
    });
    router.get('/:line_no_id', (req, res, next) => {
        controller.getByLineNoId(req, res, next);
    });
    return router;
}
