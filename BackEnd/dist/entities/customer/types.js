"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerEntityMetadata = exports.CustomerEntityConfig = exports.CustomerConstants = void 0;
exports.CustomerConstants = {
    CODE_MAX_LENGTH: 5,
    CODE_MIN_LENGTH: 1,
    NAME_MAX_LENGTH: 100,
    NAME_MIN_LENGTH: 1,
    DESCRIPTION_MAX_LENGTH: 500,
    DEFAULT_IS_ACTIVE: true,
    DEFAULT_CREATED_BY: 0,
    DEFAULT_UPDATED_BY: 0,
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
    CODE_PATTERN: /^[A-Z0-9]+$/,
    ERROR_CODES: {
        DUPLICATE_CODE: 'CUSTOMER_DUPLICATE_CODE',
        DUPLICATE_NAME: 'CUSTOMER_DUPLICATE_NAME',
        INVALID_CODE: 'CUSTOMER_INVALID_CODE',
        INVALID_NAME: 'CUSTOMER_INVALID_NAME',
        NOT_FOUND: 'CUSTOMER_NOT_FOUND',
        INACTIVE: 'CUSTOMER_INACTIVE',
        CONSTRAINT_VIOLATION: 'CUSTOMER_CONSTRAINT_VIOLATION'
    }
};
exports.CustomerEntityConfig = {
    entityName: 'customer',
    tableName: 'customers',
    apiPath: '/api/customers',
    codeLength: 5,
    searchableFields: ['code', 'name'],
    defaultLimit: 20,
    maxLimit: 100
};
exports.CustomerEntityMetadata = {
    ...exports.CustomerEntityConfig,
    patternType: 'VARCHAR_CODE',
    primaryKey: 'code',
    primaryKeyType: 'string',
    fields: {
        code: { type: 'string', length: 5, required: true, unique: true },
        name: { type: 'string', length: 100, required: true, unique: true },
        is_active: { type: 'boolean', default: true },
        created_by: { type: 'number', default: 0 },
        updated_by: { type: 'number', default: 0 },
        created_at: { type: 'timestamp', auto: true },
        updated_at: { type: 'timestamp', auto: true }
    },
    routes: {
        list: 'GET /api/customers',
        create: 'POST /api/customers',
        get: 'GET /api/customers/:code',
        update: 'PUT /api/customers/:code',
        delete: 'DELETE /api/customers/:code',
        changeStatus: 'PATCH /api/customers/:code/status'
    }
};
