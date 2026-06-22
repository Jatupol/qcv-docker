"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENTITY_CONFIGS = exports.setupVarcharCodeEntity = exports.createVarcharCodeRoutesWithRoles = exports.createVarcharCodeRoutes = exports.GenericVarcharCodeRoutes = exports.createGenericVarcharCodeController = exports.GenericVarcharCodeController = exports.createVarcharCodeService = exports.GenericVarcharCodeService = exports.createVarcharCodeModel = exports.GenericVarcharCodeModel = exports.DEFAULT_QUERY_OPTIONS = exports.DEFAULT_VARCHAR_CODE_CONFIG = void 0;
exports.createCompleteVarcharCodeEntity = createCompleteVarcharCodeEntity;
exports.createVarcharCodeEntityRoutes = createVarcharCodeEntityRoutes;
exports.createVarcharCodeConfig = createVarcharCodeConfig;
exports.validateVarcharCodeConfig = validateVarcharCodeConfig;
exports.isVarcharCodeEntity = isVarcharCodeEntity;
exports.validateCodeFormat = validateCodeFormat;
var generic_types_1 = require("./generic-types");
Object.defineProperty(exports, "DEFAULT_VARCHAR_CODE_CONFIG", { enumerable: true, get: function () { return generic_types_1.DEFAULT_VARCHAR_CODE_CONFIG; } });
Object.defineProperty(exports, "DEFAULT_QUERY_OPTIONS", { enumerable: true, get: function () { return generic_types_1.DEFAULT_QUERY_OPTIONS; } });
var generic_model_1 = require("./generic-model");
Object.defineProperty(exports, "GenericVarcharCodeModel", { enumerable: true, get: function () { return generic_model_1.GenericVarcharCodeModel; } });
Object.defineProperty(exports, "createVarcharCodeModel", { enumerable: true, get: function () { return generic_model_1.createVarcharCodeModel; } });
var generic_service_1 = require("./generic-service");
Object.defineProperty(exports, "GenericVarcharCodeService", { enumerable: true, get: function () { return generic_service_1.GenericVarcharCodeService; } });
Object.defineProperty(exports, "createVarcharCodeService", { enumerable: true, get: function () { return generic_service_1.createVarcharCodeService; } });
var generic_controller_1 = require("./generic-controller");
Object.defineProperty(exports, "GenericVarcharCodeController", { enumerable: true, get: function () { return generic_controller_1.GenericVarcharCodeController; } });
Object.defineProperty(exports, "createGenericVarcharCodeController", { enumerable: true, get: function () { return generic_controller_1.createGenericVarcharCodeController; } });
var generic_routes_1 = require("./generic-routes");
Object.defineProperty(exports, "GenericVarcharCodeRoutes", { enumerable: true, get: function () { return generic_routes_1.GenericVarcharCodeRoutes; } });
Object.defineProperty(exports, "createVarcharCodeRoutes", { enumerable: true, get: function () { return generic_routes_1.createVarcharCodeRoutes; } });
Object.defineProperty(exports, "createVarcharCodeRoutesWithRoles", { enumerable: true, get: function () { return generic_routes_1.createVarcharCodeRoutesWithRoles; } });
Object.defineProperty(exports, "setupVarcharCodeEntity", { enumerable: true, get: function () { return generic_routes_1.setupVarcharCodeEntity; } });
const generic_model_2 = require("./generic-model");
const generic_service_2 = require("./generic-service");
const generic_controller_2 = require("./generic-controller");
const generic_routes_2 = require("./generic-routes");
function createCompleteVarcharCodeEntity(db, config) {
    const model = new generic_model_2.GenericVarcharCodeModel(db, config);
    const service = new generic_service_2.GenericVarcharCodeService(model, config);
    const controller = new generic_controller_2.GenericVarcharCodeController(service, config);
    const routes = (0, generic_routes_2.createVarcharCodeRoutes)(controller, config);
    return {
        model,
        service,
        controller,
        routes,
        config
    };
}
function createVarcharCodeEntityRoutes(db, config) {
    const { routes } = createCompleteVarcharCodeEntity(db, config);
    return routes;
}
function createVarcharCodeConfig(entityName, tableName, codeLength, customConfig = {}) {
    return {
        entityName,
        tableName,
        codeLength,
        apiPath: `/api/${entityName}`,
        searchableFields: ['code', 'name', 'description'],
        defaultLimit: 20,
        maxLimit: 100,
        ...customConfig
    };
}
function validateVarcharCodeConfig(config) {
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
    if (typeof config.codeLength !== 'number' || config.codeLength <= 0) {
        errors.push('codeLength must be a positive number');
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
    customer: createVarcharCodeConfig('customer', 'customers', 5, {
        searchableFields: ['code', 'name', 'description'],
        defaultLimit: 25
    }),
    customersSite: createVarcharCodeConfig('customers-site', 'customers_site', 10, {
        searchableFields: ['code', 'name', 'description'],
        defaultLimit: 30
    }),
};
function isVarcharCodeEntity(obj) {
    return obj &&
        typeof obj.code === 'string' &&
        typeof obj.name === 'string' &&
        typeof obj.is_active === 'boolean' &&
        obj.created_at instanceof Date &&
        obj.updated_at instanceof Date;
}
function validateCodeFormat(code, maxLength) {
    const errors = [];
    if (typeof code !== 'string') {
        errors.push('Code must be a string');
        return { valid: false, errors };
    }
    if (code.trim().length === 0) {
        errors.push('Code cannot be empty');
    }
    if (code.length > maxLength) {
        errors.push(`Code cannot exceed ${maxLength} characters`);
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(code)) {
        errors.push('Code can only contain letters, numbers, hyphens, and underscores');
    }
    if (code !== code.trim()) {
        errors.push('Code cannot have leading or trailing spaces');
    }
    return {
        valid: errors.length === 0,
        errors
    };
}
