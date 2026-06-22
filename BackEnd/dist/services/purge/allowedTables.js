"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALLOWED_PURGE_TABLES = void 0;
exports.isValidIdentifier = isValidIdentifier;
exports.findAllowedTable = findAllowedTable;
exports.isAllowedTableColumn = isAllowedTableColumn;
exports.ALLOWED_PURGE_TABLES = [
    { tableName: 'log_interface', timestampColumn: 'import_date', label: 'MSSQL Sync Audit Log' },
    { tableName: 'defectdata', timestampColumn: 'defect_date', label: 'Defect Data' },
    { tableName: 'inspectiondata', timestampColumn: 'inspection_date', label: 'Inspection Data' },
    { tableName: 'defectdata_customer', timestampColumn: 'defect_date', label: 'Defect Data (Customer)' },
    { tableName: 'inspectiondata_customer', timestampColumn: 'updated_at', label: 'Inspection Data (Customer)' },
    { tableName: 'inf_checkin', timestampColumn: 'imported_at', label: 'INF Check-in' },
    { tableName: 'inf_lotinput', timestampColumn: 'inputdate', label: 'INF Lot Input' },
    { tableName: 'inf_useroperation', timestampColumn: 'imported_at', label: 'INF User Operation' },
];
const IDENT_RE = /^[a-z][a-z0-9_]*$/;
function isValidIdentifier(s) {
    return typeof s === 'string' && IDENT_RE.test(s) && s.length <= 63;
}
function findAllowedTable(tableName) {
    return exports.ALLOWED_PURGE_TABLES.find(t => t.tableName === tableName);
}
function isAllowedTableColumn(tableName, timestampColumn) {
    if (!isValidIdentifier(tableName) || !isValidIdentifier(timestampColumn))
        return false;
    const entry = findAllowedTable(tableName);
    return !!entry && entry.timestampColumn === timestampColumn;
}
