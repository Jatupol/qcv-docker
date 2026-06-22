"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INF_LOTINPUT_TABLE_CONFIG = void 0;
exports.INF_LOTINPUT_TABLE_CONFIG = {
    tableName: 'inf_lotinput',
    primaryKey: 'id',
    fieldMappings: {
        'id': 'id',
        'lotno': 'LotNo',
        'partsite': 'PartSite',
        'lineno': 'LineNo',
        'itemno': 'ItemNo',
        'model': 'Model',
        'version': 'Version',
        'inputdate': 'InputDate',
        'finish_on': 'FinishOn',
        'imported_at': 'imported_at'
    },
    searchableFields: ['lotno', 'partsite', 'lineno', 'itemno', 'model', 'version'],
    dateFields: ['inputdate', 'finish_on', 'imported_at'],
    defaultLimit: 50,
    maxLimit: 200
};
