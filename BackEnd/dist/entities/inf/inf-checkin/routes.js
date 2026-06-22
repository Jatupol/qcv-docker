"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = createInfCheckinRoutes;
const express_1 = require("express");
const controller_1 = require("./controller");
const service_1 = require("./service");
const model_1 = require("./model");
const database_1 = require("../../../config/database");
function createInfCheckinRoutes(_db) {
    const router = (0, express_1.Router)();
    const drizzleDb = (0, database_1.getDrizzle)();
    const model = (0, model_1.createInfCheckinModel)(drizzleDb);
    const service = new service_1.InfCheckinService(model, drizzleDb.$client);
    const controller = new controller_1.InfCheckinController(service);
    router.get('/', (req, res, next) => {
        controller.getAll(req, res, next);
    });
    router.get('/user/:username', (req, res, next) => {
        controller.getByUsername(req, res, next);
    });
    router.get('/line/:lineId', (req, res, next) => {
        controller.getByLineId(req, res, next);
    });
    router.get('/active', (req, res, next) => {
        controller.getActiveWorkers(req, res, next);
    });
    router.get('/statistics', (req, res, next) => {
        controller.getStatistics(req, res, next);
    });
    router.get('/operators', (req, res, next) => {
        controller.getOperators(req, res, next);
    });
    router.get('/fvi-leaders', (req, res, next) => {
        controller.getFVILeaderOperators(req, res, next);
    });
    router.get('/filter-options', (req, res, next) => {
        controller.getFilterOptions(req, res, next);
    });
    router.get('/search', (req, res, next) => {
        controller.searchRecords(req, res, next);
    });
    router.get('/fvi-line-mapping', (req, res, next) => {
        controller.getFVILineMapping(req, res, next);
    });
    router.get('/fvi-lines-by-date', (req, res, next) => {
        controller.getFVILinesByDate(req, res, next);
    });
    router.get('/distinct-lines', (req, res, next) => {
        controller.getDistinctFVILines(req, res, next);
    });
    router.get('/health', (req, res, next) => {
        controller.healthCheck(req, res, next);
    });
    router.get('/sync', (req, res, next) => {
        controller.checkSync(req, res, next);
    });
    router.post('/sync', (req, res, next) => {
        controller.runSync(req, res, next);
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
    router.post('/import/auto', (req, res, next) => {
        controller.importAuto(req, res, next);
    });
    return router;
}
