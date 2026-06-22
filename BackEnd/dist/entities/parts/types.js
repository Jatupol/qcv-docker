"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PARTS_ENTITY_CONFIG = exports.PARTS_PRIMARY_KEY_CONFIG = void 0;
exports.PARTS_PRIMARY_KEY_CONFIG = {
    fields: ['partno'],
    routes: [':partno'],
    routePattern: '/:partno'
};
exports.PARTS_ENTITY_CONFIG = {
    entityName: 'parts',
    tableName: 'parts',
    apiPath: '/api/parts',
    primaryKey: exports.PARTS_PRIMARY_KEY_CONFIG,
    searchableFields: [
        'partno',
        'product_families',
        'versions',
        'customers_site',
        'tab',
        'product_type',
        'customer_driver'
    ],
    requiredFields: [
        'partno',
        'product_families',
        'versions',
        'customers_site',
        'tab',
        'product_type',
        'customer_driver'
    ],
    defaultLimit: 20,
    maxLimit: 100
};
