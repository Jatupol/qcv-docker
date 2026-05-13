"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENTITY_CONFIGS = exports.setupSerialIdEntity = exports.createSerialIdRoutes = exports.GenericSerialIdRoutes = exports.createSerialIdController = exports.GenericSerialIdController = exports.createSerialIdService = exports.GenericSerialIdService = exports.createSerialIdModel = exports.GenericSerialIdModel = exports.DEFAULT_QUERY_OPTIONS = exports.DEFAULT_SERIAL_ID_CONFIG = void 0;
exports.createCompleteSerialIdEntity = createCompleteSerialIdEntity;
exports.createSerialIdEntityRoutes = createSerialIdEntityRoutes;
exports.createSerialIdConfig = createSerialIdConfig;
exports.validateSerialIdConfig = validateSerialIdConfig;
exports.isSerialIdEntity = isSerialIdEntity;
var generic_types_1 = require("./generic-types");
Object.defineProperty(exports, "DEFAULT_SERIAL_ID_CONFIG", { enumerable: true, get: function () { return generic_types_1.DEFAULT_SERIAL_ID_CONFIG; } });
Object.defineProperty(exports, "DEFAULT_QUERY_OPTIONS", { enumerable: true, get: function () { return generic_types_1.DEFAULT_QUERY_OPTIONS; } });
var generic_model_1 = require("./generic-model");
Object.defineProperty(exports, "GenericSerialIdModel", { enumerable: true, get: function () { return generic_model_1.GenericSerialIdModel; } });
Object.defineProperty(exports, "createSerialIdModel", { enumerable: true, get: function () { return generic_model_1.createSerialIdModel; } });
var generic_service_1 = require("./generic-service");
Object.defineProperty(exports, "GenericSerialIdService", { enumerable: true, get: function () { return generic_service_1.GenericSerialIdService; } });
Object.defineProperty(exports, "createSerialIdService", { enumerable: true, get: function () { return generic_service_1.createSerialIdService; } });
var generic_controller_1 = require("./generic-controller");
Object.defineProperty(exports, "GenericSerialIdController", { enumerable: true, get: function () { return generic_controller_1.GenericSerialIdController; } });
Object.defineProperty(exports, "createSerialIdController", { enumerable: true, get: function () { return generic_controller_1.createSerialIdController; } });
var generic_routes_1 = require("./generic-routes");
Object.defineProperty(exports, "GenericSerialIdRoutes", { enumerable: true, get: function () { return generic_routes_1.GenericSerialIdRoutes; } });
Object.defineProperty(exports, "createSerialIdRoutes", { enumerable: true, get: function () { return generic_routes_1.createSerialIdRoutes; } });
Object.defineProperty(exports, "setupSerialIdEntity", { enumerable: true, get: function () { return generic_routes_1.setupSerialIdEntity; } });
const generic_model_2 = require("./generic-model");
const generic_service_2 = require("./generic-service");
const generic_controller_2 = require("./generic-controller");
const generic_routes_2 = require("./generic-routes");
function createCompleteSerialIdEntity(db, config) {
    const model = new generic_model_2.GenericSerialIdModel(db, config);
    const service = new generic_service_2.GenericSerialIdService(model, config);
    const controller = new generic_controller_2.GenericSerialIdController(service, config);
    const routes = (0, generic_routes_2.createSerialIdRoutes)(controller, config);
    return {
        model,
        service,
        controller,
        routes,
        config
    };
}
function createSerialIdEntityRoutes(db, config) {
    const { routes } = createCompleteSerialIdEntity(db, config);
    return routes;
}
function createSerialIdConfig(entityName, tableName, customConfig = {}) {
    return {
        entityName,
        tableName,
        apiPath: `/api/${entityName}`,
        searchableFields: ['name', 'description'],
        defaultLimit: 20,
        maxLimit: 100,
        ...customConfig
    };
}
function validateSerialIdConfig(config) {
    const errors = [];
    if (!config.entityName || config.entityName.trim().length === 0) {
        errors.push('entityName is required');
    }
    if (!config.tableName || config.tableName.trim().length === 0) {
        errors.push('tableName is required');
    }
    if (!config.apiPath || config.apiPath.trim().length === 0) {
        errors.push('apiPath is required');
    }
    if (!Array.isArray(config.searchableFields)) {
        errors.push('searchableFields must be an array');
    }
    if (typeof config.defaultLimit !== 'number' || config.defaultLimit <= 0) {
        errors.push('defaultLimit must be a positive number');
    }
    if (typeof config.maxLimit !== 'number' || config.maxLimit <= 0) {
        errors.push('maxLimit must be a positive number');
    }
    if (config.defaultLimit > config.maxLimit) {
        errors.push('defaultLimit cannot be greater than maxLimit');
    }
    return {
        valid: errors.length === 0,
        errors
    };
}
exports.ENTITY_CONFIGS = {
    user: createSerialIdConfig('user', 'users', {
        searchableFields: ['name', 'username', 'email'],
        defaultLimit: 25
    }),
    defect: createSerialIdConfig('defect', 'defects', {
        searchableFields: ['name', 'description'],
        defaultLimit: 30
    }),
    sysconfig: createSerialIdConfig('sysconfig', 'sysconfig', {
        searchableFields: ['name', 'description'],
        defaultLimit: 50
    }),
    samplingReason: createSerialIdConfig('sampling-reason', 'sampling_reasons', {
        searchableFields: ['name', 'description'],
        defaultLimit: 20
    })
};
function isSerialIdEntity(obj) {
    return obj &&
        typeof obj.id === 'number' &&
        typeof obj.name === 'string' &&
        typeof obj.is_active === 'boolean' &&
        obj.created_at instanceof Date &&
        obj.updated_at instanceof Date;
}
