"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INF_USEROPERATION_TABLE_CONFIG = void 0;
exports.INF_USEROPERATION_TABLE_CONFIG = {
    tableName: 'inf_useroperation',
    primaryKey: 'username',
    fieldMappings: {
        'username': 'username',
        'is_active': 'isActive',
        'is_delete': 'isDelete',
        'is_super_admin': 'isSuperAdmin',
        'role_code': 'roleCode',
        'operator_name': 'operatorName',
        'is_mrb': 'isMrb',
        'line_no_id': 'lineNoId',
        'work_shift_id': 'workShiftId',
        'imported_at': 'importedAt'
    },
    searchableFields: ['username', 'operator_name', 'role_code', 'line_no_id', 'work_shift_id'],
    dateFields: ['imported_at'],
    booleanFields: ['is_active', 'is_super_admin', 'is_mrb', 'is_delete'],
    defaultLimit: 50,
    maxLimit: 200
};
