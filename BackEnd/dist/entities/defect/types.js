"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_DEFECT_CONFIG = void 0;
const generic_types_1 = require("../../generic/entities/serial-id-entity/generic-types");
exports.DEFAULT_DEFECT_CONFIG = {
    ...generic_types_1.DEFAULT_SERIAL_ID_CONFIG,
    entityName: 'Defect',
    tableName: 'defects',
    apiPath: '/api/defects',
    searchableFields: ['name', 'description'],
    defaultLimit: 30,
    maxLimit: 200
};
