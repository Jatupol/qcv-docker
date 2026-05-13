"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = createInfLotInputRoutes;
exports.createInfLotInputRoutesWithController = createInfLotInputRoutesWithController;
const express_1 = require("express");
const controller_1 = require("./controller");
const service_1 = require("./service");
const model_1 = require("./model");
const database_1 = require("../../../config/database");
function createInfLotInputRoutes(_db) {
    const router = (0, express_1.Router)();
    const drizzleDb = (0, database_1.getDrizzle)();
    const model = (0, model_1.createInfLotInputModel)(drizzleDb);
    const service = new service_1.InfLotInputService(model, drizzleDb.$client);
    const controller = new controller_1.InfLotInputController(service);
    router.get('/exclude-keywords', (req, res, next) => {
        controller.getExcludeKeywords(req, res, next);
    });
    router.put('/exclude-keywords', (req, res, next) => {
        controller.updateExcludeKeywords(req, res, next);
    });
    router.post('/cleanup', (req, res, next) => {
        controller.cleanupByKeywords(req, res, next);
    });
    router.get('/', (req, res, next) => {
        controller.getAll(req, res, next);
    });
    router.get('/lot/:lotNumber', (req, res, next) => {
        controller.getByLotNumber(req, res, next);
    });
    router.get('/statistics', (req, res, next) => {
        controller.getStatistics(req, res, next);
    });
    router.get('/filter-options', (req, res, next) => {
        controller.getFilterOptions(req, res, next);
    });
    router.get('/health', (req, res, next) => {
        controller.getHealth(req, res, next);
    });
    router.get('/sync', (req, res, next) => {
        controller.sync(req, res, next);
    });
    router.post('/sync', (req, res, next) => {
        controller.sync(req, res, next);
    });
    router.post('/import', (req, res, next) => {
        controller.importFromMssql(req, res, next);
    });
    router.post('/import/today', (req, res, next) => {
        controller.importTodayData(req, res, next);
    });
    router.post('/import/range', (req, res, next) => {
        controller.importDateRange(req, res, next);
    });
    router.post('/sync/today-finished', (req, res) => {
        res.status(200).json({
            success: true,
            data: {
                imported: 0,
                skipped: 0,
                errors: 0
            },
            message: 'Sync operation disabled - using data display only mode'
        });
    });
    router.post('/connection/test', (req, res) => {
        res.status(200).json({
            success: true,
            message: 'Connection test disabled - using data display only mode'
        });
    });
    router.post('/connection/refresh', (req, res) => {
        res.status(200).json({
            success: true,
            message: 'Connection refresh disabled - using data display only mode'
        });
    });
    return router;
}
function createInfLotInputRoutesWithController(controller) {
    const router = (0, express_1.Router)();
    router.get('/', controller.getAll);
    router.get('/lot/:lotNumber', controller.getByLotNumber);
    router.get('/statistics', controller.getStatistics);
    router.get('/filter-options', controller.getFilterOptions);
    router.get('/health', controller.getHealth);
    router.post('/sync/today-finished', (req, res) => {
        res.status(200).json({
            success: true,
            data: { imported: 0, skipped: 0, errors: 0 },
            message: 'Sync disabled - data display only'
        });
    });
    router.post('/connection/test', (req, res) => {
        res.status(200).json({
            success: true,
            message: 'Connection test disabled - data display only'
        });
    });
    router.post('/connection/refresh', (req, res) => {
        res.status(200).json({
            success: true,
            message: 'Connection refresh disabled - data display only'
        });
    });
    return router;
}
