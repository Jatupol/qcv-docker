"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerSiteRoutes = void 0;
exports.createCustomerSiteRoutesWithController = createCustomerSiteRoutesWithController;
exports.default = default_1;
exports.createcustomersiteRoutes = createcustomersiteRoutes;
exports.createCustomerSiteRoutesMinimal = createCustomerSiteRoutesMinimal;
exports.createCustomerSiteRoutesWithCustomRoles = createCustomerSiteRoutesWithCustomRoles;
exports.createCustomerSiteEntity = createCustomerSiteEntity;
const express_1 = require("express");
const generic_routes_1 = require("../../generic/entities/special-entity/generic-routes");
const types_1 = require("./types");
const controller_1 = require("./controller");
const service_1 = require("./service");
const model_1 = require("./model");
const database_1 = require("../../config/database");
const auth_1 = require("../../middleware/auth");
function createCustomerSiteRoutesWithController(controller) {
    const customerSiteRoutes = new CustomerSiteRoutes(controller);
    return customerSiteRoutes.getRouter();
}
function default_1(_db) {
    const customerSiteModel = (0, model_1.createCustomerSiteModel)((0, database_1.getDrizzle)());
    const customerSiteService = new service_1.CustomerSiteService(customerSiteModel);
    const customerSiteController = new controller_1.CustomerSiteController(customerSiteService);
    return createCustomerSiteRoutesWithController(customerSiteController);
}
class CustomerSiteRoutes {
    constructor(controller) {
        this.validateSiteCode = (req, res, next) => {
            const { siteCode } = req.params;
            if (!siteCode || siteCode.length > 5) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid site code'
                });
                return;
            }
            next();
        };
        this.router = (0, express_1.Router)();
        this.controller = controller;
        this.setupRoutes();
    }
    getRouter() {
        return this.router;
    }
    setupRoutes() {
        this.setupGenericRoutes();
        this.setupCustomerSiteSpecificRoutes();
    }
    setupGenericRoutes() {
        const genericRouter = (0, generic_routes_1.createSpecialRoutes)(this.controller, types_1.CUSTOMER_SITE_ENTITY_CONFIG);
        this.router.use('/', genericRouter);
    }
    setupCustomerSiteSpecificRoutes() {
        this.router.use(auth_1.requestTracking);
        this.router.get('/', auth_1.requireAuthentication, auth_1.requireUser, (req, res, next) => {
            this.controller.getAll(req, res, next);
        });
        this.router.get('/:code', auth_1.requireAuthentication, auth_1.requireUser, (req, res, next) => {
            this.controller.getByKey(req, res, next);
        });
        this.router.post('/', auth_1.requireAuthentication, auth_1.requireManager, (req, res, next) => {
            this.controller.create(req, res, next);
        });
        this.router.put('/:code', auth_1.requireAuthentication, auth_1.requireManager, (req, res, next) => {
            this.controller.update(req, res, next);
        });
        this.router.delete('/:code', auth_1.requireAuthentication, auth_1.requireAdmin, (req, res, next) => {
            this.controller.delete(req, res, next);
        });
        this.router.get('/statistics', auth_1.requireAuthentication, auth_1.requireManager, (req, res, next) => {
            this.controller.getStatistics(req, res, next);
        });
        this.router.get('/customer/:customerCode', auth_1.requireAuthentication, auth_1.requireUser, (req, res, next) => {
            this.controller.getByCustomer(req, res, next);
        });
        this.router.get('/site/:siteCode', auth_1.requireAuthentication, auth_1.requireUser, this.validateSiteCode, (req, res, next) => {
            this.controller.getBySite(req, res, next);
        });
    }
}
exports.CustomerSiteRoutes = CustomerSiteRoutes;
function createcustomersiteRoutes(_db) {
    const customerSiteModel = (0, model_1.createCustomerSiteModel)((0, database_1.getDrizzle)());
    const customerSiteService = new service_1.CustomerSiteService(customerSiteModel);
    const customerSiteController = new controller_1.CustomerSiteController(customerSiteService);
    return createCustomerSiteRoutesWithController(customerSiteController);
}
function createCustomerSiteRoutesMinimal(_db) {
    const customerSiteModel = (0, model_1.createCustomerSiteModel)((0, database_1.getDrizzle)());
    const customerSiteService = new service_1.CustomerSiteService(customerSiteModel);
    const customerSiteController = new controller_1.CustomerSiteController(customerSiteService);
    return (0, generic_routes_1.createSpecialRoutes)(customerSiteController, types_1.CUSTOMER_SITE_ENTITY_CONFIG);
}
function createCustomerSiteRoutesWithCustomRoles(controller, roleConfig) {
    const router = (0, express_1.Router)();
    router.use(auth_1.requestTracking);
    const roles = {
        create: roleConfig?.create || auth_1.requireManager,
        read: roleConfig?.read || auth_1.requireUser,
        update: roleConfig?.update || auth_1.requireManager,
        delete: roleConfig?.delete || auth_1.requireAdmin,
        statistics: roleConfig?.statistics || auth_1.requireManager,
    };
    router.post('/', auth_1.requireAuthentication, roles.create, (req, res, next) => {
        controller.create(req, res, next);
    });
    router.get('/', auth_1.requireAuthentication, roles.read, (req, res, next) => {
        controller.getAll(req, res, next);
    });
    router.get('/:customerCode/:siteCode', auth_1.requireAuthentication, roles.read, (req, res, next) => {
        controller.getBySite(req, res, next);
    });
    router.put('/:customerCode/:siteCode', auth_1.requireAuthentication, roles.update, (req, res, next) => {
        controller.update(req, res, next);
    });
    router.delete('/:customerCode/:siteCode', auth_1.requireAuthentication, roles.delete, (req, res, next) => {
        controller.delete(req, res, next);
    });
    router.get('/statistics', auth_1.requireAuthentication, roles.statistics, (req, res, next) => {
        controller.getStatistics(req, res, next);
    });
    return router;
}
function createCustomerSiteEntity(_db) {
    const model = (0, model_1.createCustomerSiteModel)((0, database_1.getDrizzle)());
    const service = new service_1.CustomerSiteService(model);
    const controller = new controller_1.CustomerSiteController(service);
    const routes = new CustomerSiteRoutes(controller);
    return {
        model,
        service,
        controller,
        routes: routes.getRouter()
    };
}
