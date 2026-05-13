// server/src/services/interfaceLogService.ts
// Service for logging interface operations (Lot Input and Check-In)

import { getDatabasePool } from '../config/database';

export interface LogInterfaceParams {
  tablename: 'LIN' | 'CHK' | 'UOP';
  errorMessage?: string | null;
  createdBy?: number;
  recordsImported?: number;
  recordsUpdated?: number;
  recordsSkipped?: number;
  recordsFailed?: number;
  durationMs?: number;
}

export interface InterfaceLog {
  id: number;
  tablename: string;
  import_date: Date;
  error_message: string | null;
  created_by: number;
  records_imported: number;
  records_updated: number;
  records_skipped: number;
  records_failed: number;
  duration_ms: number | null;
  created_at: Date;
}

export interface LogStats {
  total_operations: number;
  successful_operations: number;
  failed_operations: number;
  total_imported: number;
  total_updated: number;
  total_skipped: number;
  total_failed: number;
  avg_duration_ms: number | null;
}

/**
 * Log an interface operation (sync/import)
 */
export async function logInterfaceOperation(
  params: LogInterfaceParams
): Promise<number> {
  const {
    tablename,
    errorMessage = null,
    createdBy = 0,
    recordsImported = 0,
    recordsUpdated = 0,
    recordsSkipped = 0,
    recordsFailed = 0,
    durationMs = null
  } = params;

  try {
    const result = await getDatabasePool().query(
      `SELECT log_interface_operation($1, $2, $3, $4, $5, $6, $7, $8) as log_id`,
      [
        tablename,
        errorMessage,
        createdBy,
        recordsImported,
        recordsUpdated,
        recordsSkipped,
        recordsFailed,
        durationMs
      ]
    );

    const logId = result.rows[0]?.log_id;
    console.log(`✅ Logged ${tablename} operation: log_id=${logId}`);
    return logId;
  } catch (error) {
    console.error('❌ Failed to log interface operation:', error);
    // Don't throw - logging failure shouldn't break the main operation
    return -1;
  }
}

/**
 * Get recent log entries
 */
export async function getRecentLogs(
  tablename?: 'LIN' | 'CHK' | 'UOP',
  limit: number = 100
): Promise<InterfaceLog[]> {
  try {
    const result = await getDatabasePool().query(
      `SELECT * FROM get_recent_interface_logs($1, $2)`,
      [tablename || null, limit]
    );

    return result.rows;
  } catch (error) {
    console.error('❌ Failed to get recent logs:', error);
    throw error;
  }
}

/**
 * Get log statistics for a specific interface
 */
export async function getLogStats(
  tablename: 'LIN' | 'CHK' | 'UOP',
  days: number = 7
): Promise<LogStats> {
  try {
    const result = await getDatabasePool().query(
      `SELECT * FROM get_interface_log_stats($1, $2)`,
      [tablename, days]
    );

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
  } catch (error) {
    console.error('❌ Failed to get log stats:', error);
    throw error;
  }
}

/**
 * Delete old log entries (cleanup)
 */
export async function cleanupOldLogs(
  tablename?: 'LIN' | 'CHK',
  daysToKeep: number = 90
): Promise<number> {
  try {
    const query = tablename
      ? `DELETE FROM log_interface
         WHERE tablename = $1
         AND import_date < CURRENT_TIMESTAMP - ($2 || ' days')::INTERVAL`
      : `DELETE FROM log_interface
         WHERE import_date < CURRENT_TIMESTAMP - ($1 || ' days')::INTERVAL`;

    const params = tablename ? [tablename, daysToKeep] : [daysToKeep];

    const result = await getDatabasePool().query(query, params);
    const deletedCount = result.rowCount || 0;

    console.log(`🗑️ Cleaned up ${deletedCount} old log entries`);
    return deletedCount;
  } catch (error) {
    console.error('❌ Failed to cleanup old logs:', error);
    throw error;
  }
}

/**
 * Helper function to wrap sync operations with automatic logging
 */
export async function withLogging<T>(
  tablename: 'LIN' | 'CHK',
  userId: number | undefined,
  operation: () => Promise<{
    imported: number;
    updated: number;
    skipped: number;
    failed?: number;
  }>
): Promise<T> {
  const startTime = Date.now();
  let errorMessage: string | null = null;
  let results = {
    imported: 0,
    updated: 0,
    skipped: 0,
    failed: 0
  };

  try {
    // Execute the operation
    const opResult = await operation();
    results = {
      imported: opResult.imported,
      updated: opResult.updated,
      skipped: opResult.skipped,
      failed: opResult.failed || 0
    };

    return opResult as unknown as T;
  } catch (error) {
    // Capture error
    errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw error;
  } finally {
    // Always log the operation
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

export default {
  logInterfaceOperation,
  getRecentLogs,
  getLogStats,
  cleanupOldLogs,
  withLogging
};
