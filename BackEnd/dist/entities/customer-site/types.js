"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CUSTOMER_SITE_ENTITY_CONFIG = exports.CUSTOMER_SITE_PRIMARY_KEY_CONFIG = exports.CustomerSiteConstants = void 0;
exports.isCreateCustomerSiteRequest = isCreateCustomerSiteRequest;
exports.isUpdateCustomerSiteRequest = isUpdateCustomerSiteRequest;
exports.isCustomerSite = isCustomerSite;
exports.createDefaultCustomerSiteQueryOptions = createDefaultCustomerSiteQueryOptions;
exports.validateCustomerSiteKey = validateCustomerSiteKey;
exports.formatCustomerSiteKey = formatCustomerSiteKey;
exports.parseCustomerSiteKey = parseCustomerSiteKey;
exports.CustomerSiteConstants = {
    CUSTOMER_CODE_MAX_LENGTH: 5,
    CUSTOMER_CODE_MIN_LENGTH: 1,
    SITE_CODE_MAX_LENGTH: 5,
    SITE_CODE_MIN_LENGTH: 1,
    NAME_MAX_LENGTH: 100,
    NAME_MIN_LENGTH: 1,
    DESCRIPTION_MAX_LENGTH: 500,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
    DEFAULT_SORT_BY: 'customer_code',
    DEFAULT_SORT_ORDER: 'ASC',
    CODE_PATTERN: /^[A-Z0-9_-]+$/,
    NAME_PATTERN: /^[a-zA-Z0-9\s\-_.,()&]+$/,
    API_PATH: '/api/customer-sites',
    ENTITY_NAME: 'customer-site',
    TABLE_NAME: 'customers_site'
};
exports.CUSTOMER_SITE_PRIMARY_KEY_CONFIG = {
    fields: ['code'],
    routes: [':code'],
    routePattern: '/:code'
};
exports.CUSTOMER_SITE_ENTITY_CONFIG = {
    entityName: exports.CustomerSiteConstants.ENTITY_NAME,
    tableName: exports.CustomerSiteConstants.TABLE_NAME,
    apiPath: exports.CustomerSiteConstants.API_PATH,
    primaryKey: exports.CUSTOMER_SITE_PRIMARY_KEY_CONFIG,
    searchableFields: [
        'code',
        'customers',
        'site'
    ],
    requiredFields: [
        'code',
        'customers',
        'site'
    ],
    defaultLimit: exports.CustomerSiteConstants.DEFAULT_LIMIT,
    maxLimit: exports.CustomerSiteConstants.MAX_LIMIT
};
function isCreateCustomerSiteRequest(data) {
    return (data &&
        typeof data.customer_code === 'string' &&
        typeof data.site_code === 'string' &&
        typeof data.name === 'string' &&
        data.customer_code.trim().length > 0 &&
        data.site_code.trim().length > 0 &&
        data.name.trim().length > 0 &&
        data.customer_code.length <= exports.CustomerSiteConstants.CUSTOMER_CODE_MAX_LENGTH &&
        data.site_code.length <= exports.CustomerSiteConstants.SITE_CODE_MAX_LENGTH &&
        data.name.length <= exports.CustomerSiteConstants.NAME_MAX_LENGTH);
}
function isUpdateCustomerSiteRequest(data) {
    return (data &&
        typeof data === 'object' &&
        (data.name === undefined || (typeof data.name === 'string' && data.name.length <= exports.CustomerSiteConstants.NAME_MAX_LENGTH)) &&
        (data.description === undefined || (typeof data.description === 'string' && data.description.length <= exports.CustomerSiteConstants.DESCRIPTION_MAX_LENGTH)) &&
        (data.is_active === undefined || typeof data.is_active === 'boolean'));
}
function isCustomerSite(obj) {
    return (obj &&
        typeof obj.customer_code === 'string' &&
        typeof obj.site_code === 'string' &&
        typeof obj.name === 'string' &&
        typeof obj.is_active === 'boolean' &&
        obj.created_at instanceof Date &&
        obj.updated_at instanceof Date &&
        typeof obj.created_by === 'number' &&
        typeof obj.updated_by === 'number');
}
function createDefaultCustomerSiteQueryOptions() {
    return {
        page: 1,
        limit: exports.CustomerSiteConstants.DEFAULT_LIMIT,
        sortBy: exports.CustomerSiteConstants.DEFAULT_SORT_BY,
        sortOrder: exports.CustomerSiteConstants.DEFAULT_SORT_ORDER,
        isActive: true
    };
}
function validateCustomerSiteKey(customerCode, siteCode) {
    const errors = [];
    if (!customerCode || customerCode.trim().length === 0) {
        errors.push('Customer code is required');
    }
    else if (customerCode.length > exports.CustomerSiteConstants.CUSTOMER_CODE_MAX_LENGTH) {
        errors.push(`Customer code cannot exceed ${exports.CustomerSiteConstants.CUSTOMER_CODE_MAX_LENGTH} characters`);
    }
    if (!siteCode || siteCode.trim().length === 0) {
        errors.push('Site code is required');
    }
    else if (siteCode.length > exports.CustomerSiteConstants.SITE_CODE_MAX_LENGTH) {
        errors.push(`Site code cannot exceed ${exports.CustomerSiteConstants.SITE_CODE_MAX_LENGTH} characters`);
    }
    return {
        isValid: errors.length === 0,
        errors
    };
}
function formatCustomerSiteKey(customerCode, siteCode) {
    return `${customerCode}/${siteCode}`;
}
function parseCustomerSiteKey(keyString) {
    const parts = keyString.split('/');
    if (parts.length !== 2) {
        throw new Error('Invalid customer-site key format. Expected "CUSTOMER_CODE/SITE_CODE"');
    }
    return {
        customerCode: parts[0].trim(),
        siteCode: parts[1].trim()
    };
}
