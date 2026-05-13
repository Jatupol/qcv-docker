"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENTITY_PRIMARY_KEY_CONFIGS = exports.DEFAULT_QUERY_OPTIONS = exports.DEFAULT_SPECIAL_CONFIG = exports.HTTP_STATUS = exports.SPECIAL_ERROR_MESSAGES = void 0;
exports.buildPrimaryKeyWhereClause = buildPrimaryKeyWhereClause;
exports.validateEntityData = validateEntityData;
exports.sanitizeSearchString = sanitizeSearchString;
exports.buildSortClause = buildSortClause;
exports.calculatePagination = calculatePagination;
exports.formatEntityResponse = formatEntityResponse;
exports.createSuccessResult = createSuccessResult;
exports.createErrorResult = createErrorResult;
exports.createVarcharSpecialConfig = createVarcharSpecialConfig;
exports.createCompositeSpecialConfig = createCompositeSpecialConfig;
exports.createInterfaceSpecialConfig = createInterfaceSpecialConfig;
function buildPrimaryKeyWhereClause(keyValues, primaryKey) {
    const conditions = [];
    const params = [];
    primaryKey.fields.forEach((field, index) => {
        if (keyValues[field] !== undefined && keyValues[field] !== null) {
            conditions.push(`${field} = ${index + 1}`);
            params.push(keyValues[field]);
        }
        else {
            throw new Error(`Missing required primary key field: ${field}`);
        }
    });
    return {
        clause: conditions.join(' AND '),
        params
    };
}
function validateEntityData(data, config, operation) {
    const errors = [];
    if (operation === 'create') {
        config.requiredFields.forEach(field => {
            if (!data[field] || (typeof data[field] === 'string' && data[field].trim().length === 0)) {
                errors.push(`Field '${field}' is required`);
            }
        });
    }
    config.primaryKey.fields.forEach(field => {
        if (data[field] !== undefined) {
            if (typeof data[field] === 'string' && data[field].length > 255) {
                errors.push(`Field '${field}' cannot exceed 255 characters`);
            }
        }
    });
    Object.keys(data).forEach(key => {
        const value = data[key];
        if (key === 'is_active' && typeof value !== 'boolean') {
            errors.push(`Field '${key}' must be a boolean`);
        }
        if (typeof value === 'string' && value.length > 500) {
            errors.push(`Field '${key}' is too long (max 500 characters)`);
        }
    });
    return {
        isValid: errors.length === 0,
        errors
    };
}
function sanitizeSearchString(search) {
    return search.replace(/[%_\\]/g, '\\$&');
}
function buildSortClause(sortBy = 'created_at', sortOrder = 'DESC', allowedFields = []) {
    const safeSortBy = allowedFields.length > 0 && !allowedFields.includes(sortBy)
        ? 'created_at'
        : sortBy;
    const safeSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase())
        ? sortOrder.toUpperCase()
        : 'DESC';
    return `${safeSortBy} ${safeSortOrder}`;
}
function calculatePagination(totalCount, page, limit) {
    const totalPages = Math.ceil(totalCount / limit);
    return {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
    };
}
function formatEntityResponse(data, totalCount, page, limit) {
    return {
        data,
        pagination: calculatePagination(totalCount, page, limit)
    };
}
function createSuccessResult(data) {
    return {
        success: true,
        data
    };
}
function createErrorResult(error) {
    return {
        success: false,
        error
    };
}
function createVarcharSpecialConfig(entityName, tableName, primaryKeyField = 'code', routeParam = 'code') {
    return {
        entityName,
        tableName,
        primaryKey: {
            fields: [primaryKeyField],
            routes: [`:${routeParam}`],
            routePattern: `/:${routeParam}`
        },
        apiPath: `/${entityName}`,
        searchableFields: [primaryKeyField, 'name'],
        requiredFields: [primaryKeyField],
        defaultLimit: 50,
        maxLimit: 500
    };
}
function createCompositeSpecialConfig(entityName, tableName, primaryKeyFields, routeParams) {
    return {
        entityName,
        tableName,
        primaryKey: {
            fields: primaryKeyFields,
            routes: routeParams.map(param => `:${param}`),
            routePattern: '/' + routeParams.map(param => `:${param}`).join('/')
        },
        apiPath: `/${entityName}`,
        searchableFields: [...primaryKeyFields],
        requiredFields: [...primaryKeyFields],
        defaultLimit: 50,
        maxLimit: 500
    };
}
function createInterfaceSpecialConfig(entityName, tableName, primaryKeyField = 'id', searchableFields = []) {
    return {
        entityName,
        tableName,
        primaryKey: {
            fields: [primaryKeyField],
            routes: [`:${primaryKeyField}`],
            routePattern: `/:${primaryKeyField}`
        },
        apiPath: `/${entityName}`,
        searchableFields: [primaryKeyField, ...searchableFields],
        requiredFields: [],
        defaultLimit: 100,
        maxLimit: 1000
    };
}
exports.SPECIAL_ERROR_MESSAGES = {
    ENTITY_NOT_FOUND: (entityName) => `${entityName} not found`,
    INVALID_PRIMARY_KEY: (fields) => `Invalid primary key: ${fields.join(', ')} required`,
    VALIDATION_FAILED: (errors) => `Validation failed: ${errors.join(', ')}`,
    DATABASE_ERROR: (entityName, operation) => `Database error during ${operation} for ${entityName}`,
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Insufficient permissions',
    INTERNAL_ERROR: 'Internal server error'
};
exports.HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500
};
exports.DEFAULT_SPECIAL_CONFIG = {
    searchableFields: ['name'],
    requiredFields: [],
    defaultLimit: 50,
    maxLimit: 500
};
exports.DEFAULT_QUERY_OPTIONS = {
    page: 1,
    limit: 50,
    sortBy: 'created_at',
    sortOrder: 'DESC'
};
exports.ENTITY_PRIMARY_KEY_CONFIGS = {
    'checkininf': {
        fields: ['checkin_id', 'checkout_id'],
        routes: [':checkinId', ':checkoutId'],
        routePattern: '/:checkinId/:checkoutId'
    },
    'infLotinput': {
        fields: ['inf_id', 'lot_input_id'],
        routes: [':infId', ':lotInputId'],
        routePattern: '/:infId/:lotInputId'
    },
    'inspectiondata': {
        fields: ['inspection_id'],
        routes: [':inspectionId'],
        routePattern: '/:inspectionId'
    },
    'parts': {
        fields: ['partno'],
        routes: [':partno'],
        routePattern: '/:partno'
    }
};
