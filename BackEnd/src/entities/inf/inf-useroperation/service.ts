// server/src/entities/inf/inf-useroperation/service.ts
// ===== INF USER OPERATION SERVICE =====
// Business Logic for User Operation Data Retrieval and MSSQL Sync
// User/Operator Management Interface

import {
  InfUserOperationRecord,
  InfUserOperationQueryParams,
  InfUserOperationListResult,
  InfUserOperationStatsResult,
  InfUserOperationSyncResult,
  SyncResult
} from './types';
import { InfUserOperationModel } from './model';
import { getMssqlPool } from '../../../config/mssql';
import { logInterfaceOperation } from '../../../services/interfaceLogService';
import { Pool as PgPool } from 'pg';

/**
 * INF User Operation Service - Business logic for data retrieval and sync
 */
export class InfUserOperationService {
  private model: InfUserOperationModel;
  private pgPool: PgPool;

  constructor(model: InfUserOperationModel, pgPool?: PgPool) {
    this.model = model;
    this.pgPool = pgPool as PgPool;
  }

  // ==================== CORE BUSINESS OPERATIONS ====================

  /**
   * Get all records with filtering and pagination
   */
  async getAll(queryParams: InfUserOperationQueryParams = {}): Promise<InfUserOperationListResult> {
    try {
      console.log('🔧 InfUserOperationService.getAll called with params:', queryParams);

      // Validate parameters
      const validationError = this.validateQueryParams(queryParams);
      if (validationError) {
        return {
          success: false,
          message: validationError,
          errors: [validationError]
        };
      }

      const result = await this.model.getAll(queryParams);

      console.log(`✅ InfUserOperationService.getAll: Retrieved ${result.data.length} records`);

      return {
        success: true,
        data: result.data,
        pagination: result.pagination,
        message: 'User operation data retrieved successfully'
      };

    } catch (error) {
      console.error('❌ Error in InfUserOperationService.getAll:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve user operation data',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get record by LineNoId
   */
  async getByLineNoId(lineNoId: string): Promise<InfUserOperationListResult> {
    try {
      console.log('🔧 InfUserOperationService.getByLineNoId called:', { lineNoId });

      if (!lineNoId || !lineNoId.trim()) {
        return {
          success: false,
          message: 'LineNoId is required',
          errors: ['LineNoId parameter is missing or empty']
        };
      }

      const data = await this.model.getByLineNoId(lineNoId.trim());

      if (!data) {
        return {
          success: false,
          message: `User not found: ${lineNoId}`,
          errors: [`No Line found with lineNoId: ${lineNoId}`]
        };
      }

      console.log(`✅ InfUserOperationService.getByLineNoId: Found user ${lineNoId}`);

      return {
        success: true,
        data: [data],
        message: `Found user: ${lineNoId}`
      };

    } catch (error) {
      console.error('❌ Error in InfUserOperationService.getByLineNoId:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve user',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get statistics for dashboard
   */
  async getStatistics(): Promise<InfUserOperationStatsResult> {
    try {
      console.log('📊 InfUserOperationService.getStatistics called');

      const stats = await this.model.getStatistics();

      console.log('✅ InfUserOperationService.getStatistics: Retrieved statistics', stats);

      return {
        success: true,
        data: stats,
        message: 'Statistics retrieved successfully'
      };

    } catch (error) {
      console.error('❌ Error in InfUserOperationService.getStatistics:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve statistics',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get filter options for dropdowns
   */
  async getFilterOptions(): Promise<{
    success: boolean;
    data?: {
      roleCodes: string[];
      lineNoIds: string[];
      workShiftIds: string[];
    };
    message?: string;
  }> {
    try {
      console.log('🔧 InfUserOperationService.getFilterOptions called');

      const options = await this.model.getFilterOptions();

      console.log('✅ InfUserOperationService.getFilterOptions: Retrieved filter options', options);

      return {
        success: true,
        data: options,
        message: 'Filter options retrieved successfully'
      };

    } catch (error) {
      console.error('❌ Error in InfUserOperationService.getFilterOptions:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve filter options'
      };
    }
  }

  // ==================== MSSQL SYNC OPERATIONS ====================

  /**
   * Get last import time from inf_useroperation table
   */
  private async getLastImportTime(): Promise<Date | null> {
    try {
      const result = await this.pgPool.query(`
        SELECT MAX(imported_at) as last_import
        FROM inf_useroperation
      `);

      if (result.rows.length > 0 && result.rows[0].last_import) {
        return new Date(result.rows[0].last_import);
      }
      return null;
    } catch (error) {
      console.error('❌ Error getting last import time:', error);
      return null;
    }
  }

  /**
   * Sync user operation data from MSSQL to PostgreSQL (incremental)
   * Only imports records where CreatedOn > max(imported_at)
   * @param params - Optional parameters including tableName, forceSync
   */
  async syncFromMssql(params?: {
    tableName?: string;
    dateFrom?: string;
    dateTo?: string;
    forceSync?: boolean;
  }): Promise<InfUserOperationSyncResult> {
    const startTime = Date.now();

    try {
      console.log('🔄 InfUserOperationService.syncFromMssql started with params:', params);

      const tableName = params?.tableName || 'Users'; // Table name from MSSQL
      const forceSync = params?.forceSync || false;

      // Get MSSQL connection with config from sysconfig table
      const mssqlPool = await getMssqlPool(this.pgPool);

      // Get last import time for incremental sync
      const lastImportTime = await this.getLastImportTime();
      console.log('📅 Last import time:', lastImportTime?.toISOString() || 'None (first import)');

      // Build query with incremental filter
      let query = `
        SELECT
          Username,
          IsActive,
          IsDelete,
          IsSuperAdmin,
          RoleCode,
          OperatorName,
          IsMRB,
          LineNoId,
          WorkShiftId,
          CreatedOn
        FROM dbo.${tableName}
      `;

      // Add incremental filter if not force sync and we have a last import time
      if (!forceSync && lastImportTime) {
        // Format date for MSSQL - use local time methods
        const year = lastImportTime.getFullYear();
        const month = String(lastImportTime.getMonth() + 1).padStart(2, '0');
        const day = String(lastImportTime.getDate()).padStart(2, '0');
        const hours = String(lastImportTime.getHours()).padStart(2, '0');
        const minutes = String(lastImportTime.getMinutes()).padStart(2, '0');
        const seconds = String(lastImportTime.getSeconds()).padStart(2, '0');
        const lastImportStr = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

        query += ` WHERE CreatedOn > '${lastImportStr}'`;
        console.log(`📋 Incremental sync: fetching records created after ${lastImportStr}`);
      } else if (forceSync) {
        console.log('📋 Force sync: fetching ALL records');
      } else {
        console.log('📋 First sync: fetching ALL records');
      }

      query += ' ORDER BY CreatedOn ASC';

      console.log('📋 Executing MSSQL query:', query);

      // Fetch data from MSSQL
      const result = await mssqlPool.request().query(query);
      const records = result.recordset;

      console.log(`✅ Fetched ${records.length} records from MSSQL`);

      if (records.length === 0) {
        // Log the operation
        await logInterfaceOperation({
          tablename: 'UOP',
          createdBy: 0,
          recordsImported: 0,
          recordsUpdated: 0,
          recordsSkipped: 0,
          recordsFailed: 0,
          durationMs: Date.now() - startTime
        });

        return {
          success: true,
          message: 'No new records found to import',
          data: {
            imported: 0,
            updated: 0,
            skipped: 0,
            failed: 0
          }
        };
      }

      // Transform and normalize MSSQL records
      const transformedRecords = records.map(record => ({
        username: record.Username,
        isActive: record.IsActive !== undefined ? record.IsActive : true,
        isDelete: record.IsDelete !== undefined ? record.IsDelete : false,
        isSuperAdmin: record.IsSuperAdmin !== undefined ? record.IsSuperAdmin : false,
        roleCode: record.RoleCode || null,
        operatorName: record.OperatorName || null,
        isMrb: record.IsMRB !== undefined ? record.IsMRB : false,
        lineNoId: record.LineNoId || null,
        workShiftId: record.WorkShiftId || null
      }));

      // Bulk upsert to PostgreSQL
      const syncResult: SyncResult = await this.model.bulkUpsert(transformedRecords);

      const durationMs = Date.now() - startTime;

      // Log the operation
      await logInterfaceOperation({
        tablename: 'UOP',
        createdBy: 0,
        recordsImported: syncResult.imported,
        recordsUpdated: syncResult.updated,
        recordsSkipped: syncResult.skipped,
        recordsFailed: syncResult.failed,
        durationMs
      });

      console.log(`✅ InfUserOperationService.syncFromMssql completed: ${syncResult.imported} imported, ${syncResult.updated} updated, ${syncResult.skipped} skipped, ${syncResult.failed} failed`);

      return {
        success: true,
        message: `Successfully processed ${records.length} records: ${syncResult.imported} imported, ${syncResult.updated} updated, ${syncResult.skipped} skipped, ${syncResult.failed} failed`,
        data: syncResult
      };

    } catch (error) {
      const durationMs = Date.now() - startTime;

      // Log the error
      await logInterfaceOperation({
        tablename: 'UOP',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        createdBy: 0,
        recordsImported: 0,
        recordsUpdated: 0,
        recordsSkipped: 0,
        recordsFailed: 1,
        durationMs
      });

      console.error('❌ Error in InfUserOperationService.syncFromMssql:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to sync from MSSQL',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  // ==================== VALIDATION METHODS ====================

  /**
   * Validate query parameters
   */
  private validateQueryParams(params: InfUserOperationQueryParams): string | null {
    const { page, limit } = params;

    // Validate page
    if (page !== undefined) {
      if (!Number.isInteger(page) || page < 1) {
        return 'Page must be a positive integer';
      }
    }
 

    return null;
  }

  /**
   * Check if date string is valid
   */
  private isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }

  /**
   * Format date for PostgreSQL TIMESTAMP WITHOUT TIME ZONE
   * Preserves original MSSQL datetime without UTC conversion
   */
  private normalizeDate(dateValue: any): string | null {
    // Handle null, undefined, empty string, whitespace, and string "null"
    if (!dateValue ||
        (typeof dateValue === 'string' &&
         (dateValue.trim() === '' || dateValue.trim().toLowerCase() === 'null'))) {
      return null;
    }

    // If it's already a Date object from MSSQL
    if (dateValue instanceof Date) {
      if (isNaN(dateValue.getTime())) {
        return null;
      }
      // Format as local datetime string (no timezone conversion)
      const year = dateValue.getFullYear();
      const month = String(dateValue.getMonth() + 1).padStart(2, '0');
      const day = String(dateValue.getDate()).padStart(2, '0');
      const hours = String(dateValue.getHours()).padStart(2, '0');
      const minutes = String(dateValue.getMinutes()).padStart(2, '0');
      const seconds = String(dateValue.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    // If it's a string, try to parse and format
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) {
      console.warn(`⚠️ Invalid date value: "${dateValue}" (type: ${typeof dateValue})`);
      return null;
    }

    // Format as local datetime string
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Health check for the service
   */
  async healthCheck(): Promise<{
    success: boolean;
    message: string;
    timestamp: string;
    service: string;
  }> {
    try {
      // Try to get basic statistics to verify database connectivity
      await this.model.getStatistics();

      return {
        success: true,
        message: 'INF User Operation service is healthy',
        timestamp: new Date().toISOString(),
        service: 'inf-useroperation'
      };

    } catch (error) {
      return {
        success: false,
        message: 'INF User Operation service is unhealthy: ' + (error instanceof Error ? error.message : 'Unknown error'),
        timestamp: new Date().toISOString(),
        service: 'inf-useroperation'
      };
    }
  }
}

export default InfUserOperationService;
