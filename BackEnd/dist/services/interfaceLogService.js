"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logInterfaceOperation = logInterfaceOperation;
exports.getRecentLogs = getRecentLogs;
exports.getLogStats = getLogStats;
exports.cleanupOldLogs = cleanupOldLogs;
exports.withLogging = withLogging;
const database_1 = require("../config/database");
async function logInterfaceOperation(params) {
    const { tablename, errorMessage = null, createdBy = 0, recordsImported = 0, recordsUpdated = 0, recordsSkipped = 0, recordsFailed = 0, durationMs = null } = params;
    try {
        const result = await (0, database_1.getDatabasePool)().query(`SELECT log_interface_operation($1, $2, $3, $4, $5, $6, $7, $8) as log_id`, [
            tablename,
            errorMessage,
            createdBy,
            recordsImported,
            recordsUpdated,
            recordsSkipped,
            recordsFailed,
            durationMs
        ]);
        const logId = result.rows[0]?.log_id;
        console.log(`✅ Logged ${tablename} operation: log_id=${logId}`);
        return logId;
    }
    catch (error) {
        console.error('❌ Failed to log interface operation:', error);
        return -1;
    }
}
async function getRecentLogs(tablename, limit = 100) {
    try {
        const result = await (0, database_1.getDatabasePool)().query(`SELECT * FROM get_recent_interface_logs($1, $2)`, [tablename || null, limit]);
        return result.rows;
    }
    catch (error) {
        console.error('❌ Failed to get recent logs:', error);
        throw error;
    }
}
async function getLogStats(tablename, days = 7) {
    try {
        const result = await (0, database_1.getDatabasePool)().query(`SELECT * FROM get_interface_log_stats($1, $2)`, [tablename, days]);
        return result.rows[0] || {
            total_operations: 0,
            successful_operations: 0,
            failed_operations: 0,
            total_imported: 0,
            total_updated: 0,
            total_skipped: 0,
            total_failed: 0,
            avg_duration_ms: null
        };
    }
    catch (error) {
        console.error('❌ Failed to get log stats:', error);
        throw error;
    }
}
async function cleanupOldLogs(tablename, daysToKeep = 90) {
    try {
        const query = tablename
            ? `DELETE FROM log_interface
         WHERE tablename = $1
         AND import_date < CURRENT_TIMESTAMP - ($2 || ' days')::INTERVAL`
            : `DELETE FROM log_interface
         WHERE import_date < CURRENT_TIMESTAMP - ($1 || ' days')::INTERVAL`;
        const params = tablename ? [tablename, daysToKeep] : [daysToKeep];
        const result = await (0, database_1.getDatabasePool)().query(query, params);
        const deletedCount = result.rowCount || 0;
        console.log(`🗑️ Cleaned up ${deletedCount} old log entries`);
        return deletedCount;
    }
    catch (error) {
        console.error('❌ Failed to cleanup old logs:', error);
        throw error;
    }
}
async function withLogging(tablename, userId, operation) {
    const startTime = Date.now();
    let errorMessage = null;
    let results = {
        imported: 0,
        updated: 0,
        skipped: 0,
        failed: 0
    };
    try {
        const opResult = await operation();
        results = {
            imported: opResult.imported,
            updated: opResult.updated,
            skipped: opResult.skipped,
            failed: opResult.failed || 0
        };
        return opResult;
    }
    catch (error) {
        errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw error;
    }
    finally {
        const durationMs = Date.now() - startTime;
        await logInterfaceOperation({
            tablename,
            errorMessage,
            createdBy: userId || 0,
            recordsImported: results.imported,
            recordsUpdated: results.updated,
            recordsSkipped: results.skipped,
            recordsFailed: results.failed,
            durationMs
        });
    }
}
exports.default = {
    logInterfaceOperation,
    getRecentLogs,
    getLogStats,
    cleanupOldLogs,
    withLogging
};
