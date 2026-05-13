"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_QUERY_OPTIONS = exports.DEFAULT_SERIAL_ID_CONFIG = void 0;
exports.DEFAULT_SERIAL_ID_CONFIG = {
    searchableFields: ['name', 'description'],
    defaultLimit: 20,
    maxLimit: 100
};
exports.DEFAULT_QUERY_OPTIONS = {
    page: 1,
    limit: 20,
    sortBy: 'name',
    sortOrder: 'ASC',
    isActive: true
};
