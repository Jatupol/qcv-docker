"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_QUERY_OPTIONS = exports.DEFAULT_VARCHAR_CODE_CONFIG = void 0;
exports.DEFAULT_VARCHAR_CODE_CONFIG = {
    searchableFields: ['code', 'name'],
    defaultLimit: 20,
    maxLimit: 100
};
exports.DEFAULT_QUERY_OPTIONS = {
    page: 1,
    limit: 20,
    sortBy: 'code',
    sortOrder: 'ASC',
    isActive: true
};
