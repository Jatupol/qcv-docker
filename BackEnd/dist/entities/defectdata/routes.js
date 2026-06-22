"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefectDataRoutes = void 0;
exports.createDefectDataRoutes = createDefectDataRoutes;
exports.createDefectDataRoutesGeneric = createDefectDataRoutesGeneric;
exports.setupDefectDataEntity = setupDefectDataEntity;
exports.default = createDefectDataRouter;
const generic_routes_1 = require("../../generic/entities/special-entity/generic-routes");
const types_1 = require("./types");
const model_1 = require("./model");
const service_1 = require("./service");
const controller_1 = require("./controller");
const model_2 = require("../defect-image/model");
const database_1 = require("../../config/database");
class DefectDataRoutes extends generic_routes_1.GenericSpecialRoutes {
    constructor(defectDataController) {
        super(defectDataController, types_1.DEFAULT_DEFECTDATA_CONFIG);
        this.defectDataController = defectDataController;
        this.setupCustomRoutes();
    }
    setupCustomRoutes() {
        super.setupCustomRoutes();
        this.setupDefectDataRoutes();
    }
    setupDefectDataRoutes() {
        this.router.get('/inspection/:inspectionNo', this.defectDataController.getByInspectionNo);
        this.router.get('/detail/:inspectionNo', this.defectDataController.getDetailByInspectionNo);
        this.router.get('/station/:station', this.defectDataController.getByStationAndDateRange);
        this.router.get('/inspector/:inspector', this.defectDataController.getByInspector);
        this.router.get('/inspector/:inspector/performance', this.defectDataController.getInspectorPerformance);
        this.router.get('/:id/profile', this.defectDataController.getProfile);
        this.router.post('/:id/resend-email', this.defectDataController.resendDefectEmail);
        this.router.get('/summary', this.defectDataController.getSummary);
        this.router.get('/trends', this.defectDataController.getTrends);
        this.router.get('/today', this.defectDataController.getTodayDefectData);
        this.router.post('/search', this.defectDataController.searchDefectData);
        this.router.post('/bulk', this.defectDataController.bulkCreateDefectData);
        this.router.post('/', this.defectDataController.createDefectData);
        this.router.put('/:id', this.defectDataController.updateDefectData);
        this.router.delete('/:id', this.defectDataController.deleteDefectData);
    }
    getRouter() {
        return this.router;
    }
}
exports.DefectDataRoutes = DefectDataRoutes;
function createDefectDataRoutes(_db) {
    const drizzleDb = (0, database_1.getDrizzle)();
    const model = (0, model_1.createDefectDataModel)(drizzleDb);
    const imageModel = (0, model_2.createDefectImageModel)(drizzleDb);
    const service = (0, service_1.createDefectDataService)(model, imageModel);
    const controller = (0, controller_1.createDefectDataController)(service, drizzleDb.$client);
    const routes = new DefectDataRoutes(controller);
    return routes.getRouter();
}
function createDefectDataRoutesGeneric(_db) {
    const drizzleDb = (0, database_1.getDrizzle)();
    const model = (0, model_1.createDefectDataModel)(drizzleDb);
    const imageModel = (0, model_2.createDefectImageModel)(drizzleDb);
    const service = (0, service_1.createDefectDataService)(model, imageModel);
    const controller = (0, controller_1.createDefectDataController)(service, drizzleDb.$client);
    const router = (0, generic_routes_1.createSpecialRoutes)(controller, types_1.DEFAULT_DEFECTDATA_CONFIG);
    setupDefectDataSpecificRoutes(router, controller);
    return router;
}
function setupDefectDataSpecificRoutes(router, controller) {
    router.get('/inspection/:inspectionNo', controller.getByInspectionNo);
    router.get('/detail/:inspectionNo', controller.getDetailByInspectionNo);
    router.get('/station/:station', controller.getByStationAndDateRange);
    router.get('/inspector/:inspector', controller.getByInspector);
    router.get('/inspector/:inspector/performance', controller.getInspectorPerformance);
    router.get('/:id/profile', controller.getProfile);
    router.post('/:id/resend-email', controller.resendDefectEmail);
    router.get('/summary', controller.getSummary);
    router.get('/trends', controller.getTrends);
    router.get('/today', controller.getTodayDefectData);
    router.post('/search', controller.searchDefectData);
    router.post('/bulk', controller.bulkCreateDefectData);
    router.post('/', controller.createDefectData);
    router.put('/:id', controller.updateDefectData);
    router.delete('/:id', controller.deleteDefectData);
}
function setupDefectDataEntity(_db) {
    const drizzleDb = (0, database_1.getDrizzle)();
    const model = (0, model_1.createDefectDataModel)(drizzleDb);
    const imageModel = (0, model_2.createDefectImageModel)(drizzleDb);
    const service = (0, service_1.createDefectDataService)(model, imageModel);
    const controller = (0, controller_1.createDefectDataController)(service, drizzleDb.$client);
    const routes = new DefectDataRoutes(controller);
    return {
        model,
        service,
        controller,
        routes,
        router: routes.getRouter()
    };
}
function createDefectDataRouter(_db) {
    return createDefectDataRoutes((0, database_1.getDrizzle)());
}
