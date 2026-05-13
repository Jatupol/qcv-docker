"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENTITY_CONFIGS = exports.setupSpecialEntity = exports.createSpecialRoutesWithCustomization = exports.createSpecialRoutes = exports.GenericSpecialRoutes = exports.createSpecialController = exports.GenericSpecialController = exports.createSpecialService = exports.GenericSpecialService = exports.createSpecialModel = exports.GenericSpecialModel = exports.buildPrimaryKeyWhereClause = exports.ENTITY_PRIMARY_KEY_CONFIGS = exports.DEFAULT_QUERY_OPTIONS = exports.DEFAULT_SPECIAL_CONFIG = void 0;
exports.createCompleteSpecialEntity = createCompleteSpecialEntity;
exports.createSpecialEntityRoutes = createSpecialEntityRoutes;
exports.createSpecialConfig = createSpecialConfig;
exports.validateSpecialConfig = validateSpecialConfig;
exports.isSpecialEntity = isSpecialEntity;
exports.validatePrimaryKeyConfig = validatePrimaryKeyConfig;
exports.generateRoutePattern = generateRoutePattern;
var generic_types_1 = require("./generic-types");
Object.defineProperty(exports, "DEFAULT_SPECIAL_CONFIG", { enumerable: true, get: function () { return generic_types_1.DEFAULT_SPECIAL_CONFIG; } });
Object.defineProperty(exports, "DEFAULT_QUERY_OPTIONS", { enumerable: true, get: function () { return generic_types_1.DEFAULT_QUERY_OPTIONS; } });
Object.defineProperty(exports, "ENTITY_PRIMARY_KEY_CONFIGS", { enumerable: true, get: function () { return generic_types_1.ENTITY_PRIMARY_KEY_CONFIGS; } });
Object.defineProperty(exports, "buildPrimaryKeyWhereClause", { enumerable: true, get: function () { return generic_types_1.buildPrimaryKeyWhereClause; } });
var generic_model_1 = require("./generic-model");
Object.defineProperty(exports, "GenericSpecialModel", { enumerable: true, get: function () { return generic_model_1.GenericSpecialModel; } });
Object.defineProperty(exports, "createSpecialModel", { enumerable: true, get: function () { return generic_model_1.createSpecialModel; } });
var generic_service_1 = require("./generic-service");
Object.defineProperty(exports, "GenericSpecialService", { enumerable: true, get: function () { return generic_service_1.GenericSpecialService; } });
Object.defineProperty(exports, "createSpecialService", { enumerable: true, get: function () { return generic_service_1.createSpecialService; } });
var generic_controller_1 = require("./generic-controller");
Object.defineProperty(exports, "GenericSpecialController", { enumerable: true, get: function () { return generic_controller_1.GenericSpecialController; } });
Object.defineProperty(exports, "createSpecialController", { enumerable: true, get: function () { return generic_controller_1.createSpecialController; } });
var generic_routes_1 = require("./generic-routes");
Object.defineProperty(exports, "GenericSpecialRoutes", { enumerable: true, get: function () { return generic_routes_1.GenericSpecialRoutes; } });
Object.defineProperty(exports, "createSpecialRoutes", { enumerable: true, get: function () { return generic_routes_1.createSpecialRoutes; } });
Object.defineProperty(exports, "createSpecialRoutesWithCustomization", { enumerable: true, get: function () { return generic_routes_1.createSpecialRoutesWithCustomization; } });
Object.defineProperty(exports, "setupSpecialEntity", { enumerable: true, get: function () { return generic_routes_1.setupSpecialEntity; } });
const generic_types_2 = require("./generic-types");
const generic_model_2 = require("./generic-model");
const generic_service_2 = require("./generic-service");
const generic_controller_2 = require("./generic-controller");
const generic_routes_2 = require("./generic-routes");
function createCompleteSpecialEntity(db, config) {
    const model = new generic_model_2.GenericSpecialModel(db, config);
    const service = new generic_service_2.GenericSpecialService(model, config);
    const controller = new generic_controller_2.GenericSpecialController(service, config);
    const routes = (0, generic_routes_2.createSpecialEntityRoutes)(controller, config);
    return {
        model,
        service,
        controller,
        routes,
        config
    };
}
function createSpecialEntityRoutes(db, config) {
    const { routes } = createCompleteSpecialEntity(db, config);
    return routes;
}
function createSpecialConfig(entityName, tableName, primaryKeyConfig, customConfig = {}) {
    return {
        entityName,
        tableName,
        primaryKey: primaryKeyConfig,
        apiPath: `/api/${entityName}`,
        searchableFields: ['name', 'description'],
        requiredFields: [],
        defaultLimit: 20,
        maxLimit: 100,
        ...customConfig
    };
}
function validateSpecialConfig(config) {
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
    if (!config.primaryKey || !config.primaryKey.fields || config.primaryKey.fields.length === 0) {
        errors.push('primaryKey configuration is required with at least one field');
    }
    if (!config.primaryKey.routePattern || config.primaryKey.routePattern.trim().length === 0) {
        errors.push('primaryKey routePattern is required');
    }
    if (!Array.isArray(config.searchableFields)) {
        errors.push('searchableFields must be an array');
    }
    if (!Array.isArray(config.requiredFields)) {
        errors.push('requiredFields must be an array');
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
    checkininf: createSpecialConfig('checkininf', 'checkininf_checkin', generic_types_2.ENTITY_PRIMARY_KEY_CONFIGS['checkininf'], {
        searchableFields: ['checkin_id', 'checkout_id', 'status', 'notes'],
        requiredFields: ['checkin_id', 'checkout_id'],
        defaultLimit: 25
    }),
    infLotinput: createSpecialConfig('infLotinput', 'inf_lotinput', generic_types_2.ENTITY_PRIMARY_KEY_CONFIGS['infLotinput'], {
        searchableFields: ['inf_id', 'lot_input_id', 'batch_number', 'status'],
        requiredFields: ['inf_id', 'lot_input_id'],
        defaultLimit: 30
    }),
    inspectiondata: createSpecialConfig('inspectiondata', 'inspectiondata', generic_types_2.ENTITY_PRIMARY_KEY_CONFIGS['inspectiondata'], {
        searchableFields: ['inspection_no', 'station', 'shift', 'lotno', 'partsite', 'mclineno', 'itemno', 'model', 'version', 'fvilineno', 'grps', 'zones'],
        requiredFields: ['station', 'inspection_no', 'month_year', 'shift', 'lotno', 'partsite', 'mclineno', 'itemno', 'model', 'version', 'fvilineno', 'grps', 'zones'],
        defaultLimit: 20
    }),
    parts: createSpecialConfig('parts', 'parts', generic_types_2.ENTITY_PRIMARY_KEY_CONFIGS['parts'], {
        searchableFields: ['partno', 'product_families', 'versions', 'production_site', 'part_site', 'customer'],
        requiredFields: ['partno'],
        defaultLimit: 20
    })
};
function isSpecialEntity(obj) {
    return obj &&
        typeof obj.is_active === 'boolean' &&
        obj.created_at instanceof Date &&
        obj.updated_at instanceof Date &&
        typeof obj.created_by === 'number' &&
        typeof obj.updated_by === 'number';
}
function validatePrimaryKeyConfig(config) {
    const errors = [];
    if (!Array.isArray(config.fields) || config.fields.length === 0) {
        errors.push('Primary key fields array is required and cannot be empty');
    }
    if (!config.routePattern || !config.routePattern.startsWith('/')) {
        errors.push('Route pattern must start with "/" and contain parameter placeholders');
    }
    const paramCount = (config.routePattern.match(/:/g) || []).length;
    if (paramCount !== config.fields.length) {
        errors.push(`Route pattern parameter count (${paramCount}) must match fields count (${config.fields.length})`);
    }
    return {
        valid: errors.length === 0,
        errors
    };
}
function generateRoutePattern(fields) {
    return '/' + fields.map(field => {
        const paramName = field.replace(/_id$/, 'Id').replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        return `:${paramName}`;
    }).join('/');
}
