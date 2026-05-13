"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INSPECTIONDATA_ENTITY_CONFIG = exports.INSPECTIONDATA_PRIMARY_KEY_CONFIG = void 0;
exports.INSPECTIONDATA_PRIMARY_KEY_CONFIG = {
    fields: ['id'],
    routes: [':id'],
    routePattern: '/:id'
};
exports.INSPECTIONDATA_ENTITY_CONFIG = {
    entityName: 'inspectiondata',
    tableName: 'inspectiondata',
    apiPath: '/api/inspectiondata',
    primaryKey: exports.INSPECTIONDATA_PRIMARY_KEY_CONFIG,
    searchableFields: [
        'inspection_no',
        'station',
        'shift',
        'lotno',
        'partsite',
        'itemno',
        'model',
        'version',
        'fvilineno',
        'mclineno'
    ],
    requiredFields: [
        'station',
        'inspection_no',
        'fy',
        'ww',
        'month_year',
        'shift',
        'lotno',
        'partsite',
        'itemno',
        'model',
        'version',
        'fvilineno',
        'mclineno'
    ],
    defaultLimit: 20,
    maxLimit: 100
};
