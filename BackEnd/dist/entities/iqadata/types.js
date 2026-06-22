"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_IQADATA_CONFIG = void 0;
exports.DEFAULT_IQADATA_CONFIG = {
    entityName: 'IQAData',
    tableName: 'iqadata',
    apiPath: '/api/iqadata',
    primaryKey: {
        fields: ['id'],
        routePattern: ':id'
    },
    requiredFields: [],
    searchableFields: ['ww', 'model', 'supplier', 'qc_owner', 'item', 'lotno', 'defect'],
    defaultLimit: 50,
    maxLimit: 500,
};
