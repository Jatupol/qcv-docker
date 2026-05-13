"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INF_CHECKIN_TABLE_CONFIG = void 0;
exports.INF_CHECKIN_TABLE_CONFIG = {
    tableName: 'inf_checkin',
    primaryKey: 'id',
    fieldMappings: {
        'id': 'id',
        'line_no_id': 'line_no_id',
        'work_shift_id': 'work_shift_id',
        'gr_code': 'gr_code',
        'username': 'username',
        'oprname': 'oprname',
        'created_on': 'created_on',
        'checked_out': 'checked_out',
        'date_time_start_work': 'date_time_start_work',
        'date_time_off_work': 'date_time_off_work',
        'time_off_work': 'time_off_work',
        'time_start_work': 'time_start_work',
        'group_code': 'group_code',
        'team': 'team',
        'imported_at': 'imported_at'
    },
    searchableFields: ['username', 'oprname', 'line_no_id', 'work_shift_id', 'group_code', 'team'],
    dateFields: ['created_on', 'checked_out', 'date_time_start_work', 'date_time_off_work', 'imported_at'],
    defaultLimit: 50,
    maxLimit: 200
};
