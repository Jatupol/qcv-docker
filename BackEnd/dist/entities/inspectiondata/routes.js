"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InspectionDataRoutes = void 0;
exports.createInspectionDataRoutes = createInspectionDataRoutes;
exports.createInspectionDataRoutesWithController = createInspectionDataRoutesWithController;
exports.default = createInspectionDataRouter;
const express_1 = require("express");
const controller_1 = require("./controller");
const service_1 = require("./service");
const model_1 = require("./model");
const database_1 = require("../../config/database");
const auth_1 = require("../../middleware/auth");
class InspectionDataRoutes {
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
        this.router.get('/stats/:station', auth_1.requireAuthentication, auth_1.requireUser, (req, res, next) => {
            this.controller.getStationStats(req, res, next);
        });
        this.router.get('/weekly-trend/:station', auth_1.requireAuthentication, auth_1.requireUser, (req, res, next) => {
            this.controller.getWeeklyTrend(req, res, next);
        });
        this.router.get('/sampling-round', auth_1.requireAuthentication, (req, res, next) => {
            this.controller.getNextSamplingRound(req, res, next);
        });
        this.router.get('/generate-inspection-number', auth_1.requireAuthentication, (req, res, next) => {
            this.controller.generateInspectionNumber(req, res, next);
        });
        this.router.post('/:id/create-siv', auth_1.requireAuthentication, auth_1.requireUser, (req, res, next) => {
            this.controller.createSIVFromOQA(req, res, next);
        });
        this.router.get('/parts-sgt', auth_1.requireAuthentication, auth_1.requireUser, (req, res, next) => {
            this.controller.getPartsSGT(req, res, next);
        });
        this.router.get('/siv-format', auth_1.requireAuthentication, auth_1.requireUser, (req, res, next) => {
            this.controller.getSIVFormat(req, res, next);
        });
        this.router.get('/lot/:lotno', auth_1.requireAuthentication, auth_1.requireUser, (req, res, next) => {
            this.controller.getByLotNumber(req, res, next);
        });
        this.router.get('/inspection-no/:inspectionNo', auth_1.requireAuthentication, auth_1.requireUser, (req, res, next) => {
            this.controller.getByInspectionNo(req, res, next);
        });
        this.router.get('/customerdata', auth_1.requireAuthentication, auth_1.requireUser, (req, res, next) => {
            this.controller.getAllCustomer(req, res, next);
        });
        this.router.get('/customerdata-judgment/:inspectionNo', auth_1.requireAuthentication, auth_1.requireUser, (req, res, next) => {
            this.controller.getCustomerJudgment(req, res, next);
        });
        this.router.put('/customerdata-judgment', auth_1.requireAuthentication, auth_1.requireUser, (req, res, next) => {
            this.controller.updateCustomerJudgment(req, res, next);
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
exports.InspectionDataRoutes = InspectionDataRoutes;
function createInspectionDataRoutes(db) {
    const model = (0, model_1.createInspectionDataModel)((0, database_1.getDrizzle)());
    const service = new service_1.InspectionDataService(model);
    const controller = new controller_1.InspectionDataController(service);
    const routes = new InspectionDataRoutes(controller);
    return routes.router;
}
function createInspectionDataRoutesWithController(controller) {
    const routes = new InspectionDataRoutes(controller);
    return routes.router;
}
function createInspectionDataRouter(_db) {
    return createInspectionDataRoutes((0, database_1.getDrizzle)());
}
