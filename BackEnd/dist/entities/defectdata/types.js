"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFECTDATA_BUSINESS_RULES = exports.DEFECTDATA_VALIDATION_RULES = exports.DEFAULT_DEFECTDATA_CONFIG = exports.DEFECTDATA_PRIMARY_KEY_CONFIG = void 0;
exports.DEFECTDATA_PRIMARY_KEY_CONFIG = {
    fields: ['id'],
    routes: [':id'],
    routePattern: '/:id'
};
exports.DEFAULT_DEFECTDATA_CONFIG = {
    entityName: 'defectdata',
    tableName: 'defectdata',
    primaryKey: exports.DEFECTDATA_PRIMARY_KEY_CONFIG,
    apiPath: '/api/defectdata',
    searchableFields: [
        'inspection_no', 'qc_name', 'qclead_name', 'mbr_name',
        'linevi', 'groupvi', 'station', 'inspector', 'trayno', 'color'
    ],
    requiredFields: [
        'inspection_no', 'qc_name', 'qclead_name', 'mbr_name',
        'linevi', 'groupvi', 'station', 'inspector', 'defect_id'
    ],
    defaultLimit: 50,
    maxLimit: 500
};
exports.DEFECTDATA_VALIDATION_RULES = {
    inspection_no: {
        required: true,
        max_length: 20,
        pattern: /^[A-Z0-9\-_]+$/
    },
    qc_name: {
        required: true,
        max_length: 30
    },
    qclead_name: {
        required: true,
        max_length: 30
    },
    mbr_name: {
        required: true,
        max_length: 30
    },
    inspector: {
        required: true,
        max_length: 20
    },
    defect_id: {
        required: true,
        must_exist: true
    },
    ng_qty: {
        required: true,
        min_value: 0,
        max_value: 999999
    },
    trayno: {
        required: false,
        max_length: 5
    },
    tray_position: {
        required: false,
        max_length: 5
    },
    color: {
        required: false,
        max_length: 20
    }
};
exports.DEFECTDATA_BUSINESS_RULES = {
    max_ng_qty_per_record: 999999,
    required_fields_for_tray: ['trayno', 'tray_position'],
    valid_stations: ['OQA', 'FVI', 'QC', 'INS'],
    valid_line_vi_codes: ['A', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM', 'AN', 'AO', 'AP', 'AQ', 'AR', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
    valid_group_vi_codes: ['A', 'B', 'C', 'D', 'E'],
    inspector_name_pattern: /^[a-zA-Z0-9\s\-_.]+$/
};
