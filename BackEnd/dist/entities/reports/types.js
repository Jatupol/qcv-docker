"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLARReportRecord = isLARReportRecord;
exports.isLARReportQueryParams = isLARReportQueryParams;
function isLARReportRecord(obj) {
    return (typeof obj === 'object' &&
        obj !== null &&
        typeof obj.ww === 'string' &&
        typeof obj.total_lot === 'number' &&
        typeof obj.total_pass_lot === 'number' &&
        typeof obj.total_fail_lot === 'number' &&
        typeof obj.total_inspection === 'number' &&
        (obj.defectname === null || typeof obj.defectname === 'string') &&
        typeof obj.total_ng === 'number' &&
        typeof obj.lar === 'number' &&
        typeof obj.dppm === 'number');
}
function isLARReportQueryParams(obj) {
    return (typeof obj === 'object' &&
        obj !== null &&
        (obj.wwFrom === undefined || typeof obj.wwFrom === 'string') &&
        (obj.wwTo === undefined || typeof obj.wwTo === 'string') &&
        (obj.year === undefined || typeof obj.year === 'string') &&
        (obj.model === undefined || typeof obj.model === 'string'));
}
