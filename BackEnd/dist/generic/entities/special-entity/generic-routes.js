"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSpecialRoutes = exports.GenericSpecialRoutes = void 0;
exports.createSpecialEntityRoutes = createSpecialEntityRoutes;
exports.createSpecialRoutesWithCustomization = createSpecialRoutesWithCustomization;
exports.setupSpecialEntity = setupSpecialEntity;
const express_1 = require("express");
const auth_1 = require("../../../middleware/auth");
function createSpecialEntityRoutes(controller, config) {
    const router = (0, express_1.Router)();
    console.log(`🛣️  Creating SPECIAL entity routes for ${config.entityName} with authentication`);
    router.get('/health', auth_1.requireAuthentication, controller.getHealth);
    router.get('/statistics', auth_1.requireAuthentication, controller.getStatistics);
    console.log(`✅ SPECIAL entity routes created for ${config.entityName}:`);
    console.log(`   📊 GET /${config.entityName}/health [Auth Required]`);
    console.log(`   📈 GET /${config.entityName}/statistics [Manager+ Required]`);
    return router;
}
class GenericSpecialRoutes {
    constructor(controller, config) {
        this.router = (0, express_1.Router)();
        this.controller = controller;
        this.config = config;
    }
    setupCustomRoutes() {
        this.setupRoutes();
    }
    setupRoutes() {
        const routes = createSpecialEntityRoutes(this.controller, this.config);
        this.router.use('/', routes);
    }
    getRouter() {
        return this.router;
    }
    addCustomRoute(path, method, handler) {
        this.router[method](path, handler);
    }
}
exports.GenericSpecialRoutes = GenericSpecialRoutes;
exports.createSpecialRoutes = createSpecialEntityRoutes;
function createSpecialRoutesWithCustomization(controller, config, customizations) {
    const router = createSpecialEntityRoutes(controller, config);
    if (customizations?.middleware) {
        customizations.middleware.forEach(middleware => {
            router.use(middleware);
        });
    }
    if (customizations?.additionalRoutes) {
        customizations.additionalRoutes.forEach(route => {
            router[route.method](route.path, route.handler);
        });
    }
    return router;
}
function setupSpecialEntity(controller, config) {
    const router = createSpecialEntityRoutes(controller, config);
    const mountPath = config.apiPath || `/api/${config.entityName}`;
    return {
        router,
        config,
        mountPath
    };
}
exports.default = createSpecialEntityRoutes;
