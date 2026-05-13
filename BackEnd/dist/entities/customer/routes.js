"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerRoutes = void 0;
exports.createCustomerRoutes = createCustomerRoutes;
exports.default = createCustomerRoutesWithDb;
exports.createCustomerRoutesGeneric = createCustomerRoutesGeneric;
exports.createCustomerRoutesWithCustomRoles = createCustomerRoutesWithCustomRoles;
const express_1 = require("express");
const generic_routes_1 = require("../../generic/entities/varchar-code-entity/generic-routes");
const auth_1 = require("../../middleware/auth");
const types_1 = require("./types");
const controller_1 = require("./controller");
const service_1 = require("./service");
const model_1 = require("./model");
const database_1 = require("../../config/database");
function createCustomerRoutes(controller) {
    const customerRoutes = new CustomerRoutes(controller);
    return customerRoutes.getRouter();
}
function createCustomerRoutesWithDb(_db) {
    const customerModel = (0, model_1.createCustomerModel)((0, database_1.getDrizzle)());
    const customerService = new service_1.CustomerService(customerModel);
    const customerController = new controller_1.CustomerController(customerService);
    return createCustomerRoutes(customerController);
}
class CustomerRoutes {
    constructor(controller) {
        this.router = (0, express_1.Router)();
        this.controller = controller;
        this.setupRoutes();
    }
    getRouter() {
        return this.router;
    }
    setupRoutes() {
        this.setupCustomerSpecificRoutes();
        this.setupGenericRoutes();
    }
    setupCustomerSpecificRoutes() {
        this.router.use(auth_1.requestTracking);
        this.router.get('/statistics', auth_1.requireAuthentication, auth_1.requireUser, (req, res, next) => {
            this.controller.getStatistics(req, res, next);
        });
        this.router.post('/check-code', auth_1.requireAuthentication, auth_1.requireManager, (req, res, next) => {
            this.controller.checkCodeAvailability(req, res, next);
        });
        this.router.get('/search/name/:pattern', auth_1.requireAuthentication, auth_1.requireUser, (req, res, next) => {
            this.controller.search(req, res, next);
        });
        this.router.get('/:code/operational-status', auth_1.requireAuthentication, auth_1.requireUser, (req, res, next) => {
            this.controller.checkOperationalStatus(req, res, next);
        });
        this.router.get('/:code/deletion-check', auth_1.requireAuthentication, auth_1.requireManager, (req, res, next) => {
            this.controller.checkDeletionEligibility(req, res, next);
        });
    }
    setupGenericRoutes() {
        const genericRouter = (0, generic_routes_1.createVarcharCodeRoutes)(this.controller, types_1.CustomerEntityConfig);
        this.router.use('/', genericRouter);
    }
}
exports.CustomerRoutes = CustomerRoutes;
function createCustomerRoutesGeneric(controller) {
    return (0, generic_routes_1.createVarcharCodeRoutes)(controller, types_1.CustomerEntityConfig);
}
function createCustomerRoutesWithCustomRoles(controller, roleConfig) {
    return createCustomerRoutes(controller);
}
