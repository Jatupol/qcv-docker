// server/src/entities/inf/inf-checkin/service.ts
// ===== SIMPLIFIED INF CHECKIN SERVICE =====
// Data Display Only - Business Logic for Search and Retrieval
// Manufacturing Quality Control System - Simplified Read-Only Service

import {
  InfCheckinRecord,
  InfCheckinQueryParams,
  InfCheckinServiceResult,
  InfCheckinListResult,
  InfCheckinStatsResult,
  CheckinStats
} from './types';
import { InfCheckinModel } from './model';
import { getMssqlPool } from '../../../config/mssql';
import { logInterfaceOperation } from '../../../services/interfaceLogService';
import { Pool as PgPool } from 'pg';
import { formatDateTimeLocal } from '../../../utils/dateTimeUtils';

/**
 * Simplified INF CheckIn Service - Focus on business logic for data retrieval only
 */
export class InfCheckinService {
  private model: InfCheckinModel;
  private pgPool: PgPool;

  constructor(model: InfCheckinModel, pgPool?: PgPool) {
    this.model = model;
    this.pgPool = pgPool as PgPool;
  }

  // ==================== CORE BUSINESS OPERATIONS ====================

  /**
   * Get all records with filtering and pagination
   */
  async getAll(queryParams: InfCheckinQueryParams = {}): Promise<InfCheckinListResult> {
    try {
      console.log('🔧 InfCheckinService.getAll called with params:', queryParams);

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

      console.log(`✅ InfCheckinService.getAll: Retrieved ${result.data.length} records`);

      return {
        success: true,
        data: result.data,
        pagination: result.pagination,
        message: 'INF CheckIn data retrieved successfully'
      };

    } catch (error) {
      console.error('❌ Error in InfCheckinService.getAll:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve INF CheckIn data',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get records by username
   */
  async getByUsername(username: string): Promise<InfCheckinListResult> {
    try {
      console.log('🔧 InfCheckinService.getByUsername called:', { username });

      if (!username || !username.trim()) {
        return {
          success: false,
          message: 'Username is required',
          errors: ['Username parameter is missing or empty']
        };
      }

      const data = await this.model.getByUsername(username.trim());

      console.log(`✅ InfCheckinService.getByUsername: Found ${data.length} records for user ${username}`);

      return {
        success: true,
        data,
        message: `Found ${data.length} records for username: ${username}`
      };

    } catch (error) {
      console.error('❌ Error in InfCheckinService.getByUsername:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve user data',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get records by line ID
   */
  async getByLineId(lineId: string): Promise<InfCheckinListResult> {
    try {
      console.log('🔧 InfCheckinService.getByLineId called:', { lineId });

      if (!lineId || !lineId.trim()) {
        return {
          success: false,
          message: 'Line ID is required',
          errors: ['Line ID parameter is missing or empty']
        };
      }

      const data = await this.model.getByLineId(lineId.trim());

      console.log(`✅ InfCheckinService.getByLineId: Found ${data.length} records for line ${lineId}`);

      return {
        success: true,
        data,
        message: `Found ${data.length} records for line ID: ${lineId}`
      };

    } catch (error) {
      console.error('❌ Error in InfCheckinService.getByLineId:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve line data',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get active workers (currently checked in)
   */
  async getActiveWorkers(): Promise<InfCheckinListResult> {
    try {
      console.log('🔧 InfCheckinService.getActiveWorkers called');

      const data = await this.model.getActiveWorkers();

      console.log(`✅ InfCheckinService.getActiveWorkers: Found ${data.length} active workers`);

      return {
        success: true,
        data,
        message: `Found ${data.length} active workers`
      };

    } catch (error) {
      console.error('❌ Error in InfCheckinService.getActiveWorkers:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve active workers',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get statistics for dashboard
   */
  async getStatistics(): Promise<InfCheckinStatsResult> {
    try {
      console.log('📊 InfCheckinService.getStatistics called');

      const stats = await this.model.getStatistics();

      console.log('✅ InfCheckinService.getStatistics: Retrieved statistics', stats);

      return {
        success: true,
        data: stats,
        message: 'Statistics retrieved successfully'
      };

    } catch (error) {
      console.error('❌ Error in InfCheckinService.getStatistics:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve statistics',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get unique operators (username and oprname) for autocomplete
   * @param gr_code - Optional group code filter (if blank, show all)
   */
  async getOperators(gr_code?: string): Promise<{
    success: boolean;
    data?: Array<{ username: string; oprname: string }>;
    message?: string;
  }> {
    try {
      console.log('🔧 InfCheckinService.getOperators called with gr_code:', gr_code);

      const operators = await this.model.getOperators(gr_code);

      console.log(`✅ InfCheckinService.getOperators: Retrieved ${operators.length} operators`);

      return {
        success: true,
        data: operators,
        message: 'Operators retrieved successfully'
      };

    } catch (error) {
      console.error('❌ Error in InfCheckinService.getOperators:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve operators'
      };
    }
  }

  /**
   * Get FVI leader operators (username and oprname) for autocomplete
   * Used for QC Leader/FVI Leader Confirm Name field
   */
  async getFVILeaderOperators(): Promise<{
    success: boolean;
    data?: Array<{ username: string; oprname: string }>;
    message?: string;
  }> {
    try {
      console.log('🔧 InfCheckinService.getFVILeaderOperators called');

      const operators = await this.model.getFVILeaderOperators();

      console.log(`✅ InfCheckinService.getFVILeaderOperators: Retrieved ${operators.length} FVI leaders`);

      return {
        success: true,
        data: operators,
        message: 'FVI leader operators retrieved successfully'
      };

    } catch (error) {
      console.error('❌ Error in InfCheckinService.getFVILeaderOperators:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve FVI leader operators'
      };
    }
  }

  /**
   * Get filter options for dropdowns
   */
  async getFilterOptions(): Promise<{
    success: boolean;
    data?: {
      lineIds: string[];
      workShiftIds: string[];
      groupCodes: string[];
      teams: string[];
    };
    message?: string;
  }> {
    try {
      console.log('🔧 InfCheckinService.getFilterOptions called');

      const options = await this.model.getFilterOptions();

      console.log('✅ InfCheckinService.getFilterOptions: Retrieved filter options', options);

      return {
        success: true,
        data: options,
        message: 'Filter options retrieved successfully'
      };

    } catch (error) {
      console.error('❌ Error in InfCheckinService.getFilterOptions:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve filter options'
      };
    }
  }

  /**
   * Search records by multiple criteria
   */
  async searchRecords(searchParams: {
    searchTerm?: string;
    username?: string;
    lineId?: string;
    groupCode?: string;
    team?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<InfCheckinListResult> {
    try {
      console.log('🔧 InfCheckinService.searchRecords called with params:', searchParams);

      const data = await this.model.searchRecords(searchParams);

      console.log(`✅ InfCheckinService.searchRecords: Found ${data.length} matching records`);

      return {
        success: true,
        data,
        message: `Found ${data.length} matching records`
      };

    } catch (error) {
      console.error('❌ Error in InfCheckinService.searchRecords:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to search records',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get FVI line mapping for production line visualization
   */
  async getFVILineMapping(params: {
    line: string;
    date: string;
    shift: string;
  }): Promise<{
    success: boolean;
    data?: Array<{
      gr_code: string;
      group_code: string;
      username: string;
      oprname?: string;
    }>;
    message?: string;
    errors?: string[];
  }> {
    try {
      console.log('🔧 InfCheckinService.getFVILineMapping called with params:', params);

      // Validate parameters
      if (!params.line || !params.date || !params.shift) {
        return {
          success: false,
          message: 'Missing required parameters: line, date, and shift',
          errors: ['line, date, and shift are required parameters']
        };
      }

      // Validate date format
      if (!this.isValidDate(params.date)) {
        return {
          success: false,
          message: 'Invalid date format. Use YYYY-MM-DD',
          errors: ['Date must be in YYYY-MM-DD format']
        };
      }

      const data = await this.model.getFVILineMapping(params);

      console.log(`✅ InfCheckinService.getFVILineMapping: Found ${data.length} station mappings`);

      return {
        success: true,
        data,
        message: `Found ${data.length} station mappings for line ${params.line}, shift ${params.shift} on ${params.date}`
      };

    } catch (error) {
      console.error('❌ Error in InfCheckinService.getFVILineMapping:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve FVI line mapping',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get list of FVI lines by date
   */
  async getFVILinesByDate(date: string): Promise<{
    success: boolean;
    data?: Array<{ line_no_id: string }>;
    message?: string;
    errors?: string[];
  }> {
    try {
      console.log('🔧 InfCheckinService.getFVILinesByDate called with date:', date);

      // Validate date parameter
      if (!date || !date.trim()) {
        return {
          success: false,
          message: 'Date parameter is required',
          errors: ['Date parameter is missing or empty']
        };
      }

      // Validate date format
      if (!this.isValidDate(date)) {
        return {
          success: false,
          message: 'Invalid date format. Use YYYY-MM-DD',
          errors: ['Date must be in YYYY-MM-DD format']
        };
      }

      const data = await this.model.getFVILinesByDate(date);

      console.log(`✅ InfCheckinService.getFVILinesByDate: Found ${data.length} lines for date ${date}`);

      return {
        success: true,
        data,
        message: `Found ${data.length} FVI lines on ${date}`
      };

    } catch (error) {
      console.error('❌ Error in InfCheckinService.getFVILinesByDate:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve FVI lines',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get distinct FVI lines (all lines with line_no_id length between 1 and 5)
   */
  async getDistinctFVILines(): Promise<{
    success: boolean;
    data?: Array<{ line_no_id: string; line_name: string }>;
    message?: string;
    errors?: string[];
  }> {
    try {
      console.log('🔧 InfCheckinService.getDistinctFVILines called');

      const data = await this.model.getDistinctFVILines();

      console.log(`✅ InfCheckinService.getDistinctFVILines: Found ${data.length} distinct lines`);

      return {
        success: true,
        data,
        message: `Found ${data.length} distinct FVI lines`
      };

    } catch (error) {
      console.error('❌ Error in InfCheckinService.getDistinctFVILines:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve distinct FVI lines',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  // ==================== VALIDATION METHODS ====================

  /**
   * Validate query parameters
   */
  private validateQueryParams(params: InfCheckinQueryParams): string | null {
    const { page, limit } = params;

    // Validate page
    if (page !== undefined) {
      if (!Number.isInteger(page) || page < 1) {
        return 'Page must be a positive integer';
      }
    }

  
    // Validate date formats
    if (params.createdOnFrom && !this.isValidDate(params.createdOnFrom)) {
      return 'Invalid createdOnFrom format. Use YYYY-MM-DD';
    }

    if (params.createdOnTo && !this.isValidDate(params.createdOnTo)) {
      return 'Invalid createdOnTo format. Use YYYY-MM-DD';
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
        message: 'INF CheckIn service is healthy',
        timestamp: new Date().toISOString(),
        service: 'inf-checkin'
      };

    } catch (error) {
      return {
        success: false,
        message: 'INF CheckIn service is unhealthy: ' + (error instanceof Error ? error.message : 'Unknown error'),
        timestamp: new Date().toISOString(),
        service: 'inf-checkin'
      };
    }
  }

  // ==================== IMPORT FROM MSSQL ====================

  /**
   * Check if import should run based on last import time and mssql_sync interval
   * This method only checks the status without actually running the import
   * @param autoImport - If true, automatically trigger import when shouldImport is true
   * @param options - Optional parameters including dateFrom, dateTo, and forceSync
   * @returns Object with import status and metadata
   */
  async sync(autoImport: boolean = false, options?: { dateFrom?: string; dateTo?: string; forceSync?: boolean }): Promise<{
    success: boolean;
    shouldImport?: boolean;
    data?: {
      imported: number;
      updated: number;
      skipped: number;
    };
    lastImportTime?: Date;
    nextImportTime?: Date;
    syncIntervalMinutes?: number;
    message: string;
    errors?: string[];
  }> {
    try {
      console.log('🔧 InfCheckinService.sync called with autoImport:', autoImport, 'options:', options);

      // If forceSync is true (manual import), bypass time check and import directly
      if (options?.forceSync && autoImport) {
        console.log('🔄 Force sync requested (manual import), bypassing time check...');

        // Get last CreatedOn to continue from where we left off (or use provided dates)
        const lastCreatedOn = await this.getLastCreatedOn();

        const importResult = await this.importFromMssql({
          dateFrom: options?.dateFrom || lastCreatedOn || '2024-01-01',
          dateTo: options?.dateTo
        });

        return {
          success: importResult.success,
          shouldImport: true,
          data: {
            imported: importResult.imported || 0,
            updated: importResult.updated || 0,
            skipped: importResult.skipped || 0
          },
          message: importResult.success
            ? `Manual sync completed: ${importResult.imported} imported, ${importResult.updated} updated, ${importResult.skipped} skipped`
            : `Manual sync failed: ${importResult.message}`,
          errors: importResult.errors
        };
      }

      // Regular auto-sync flow with time check
      // Get mssql_sync value from sysconfig
      const sysconfigQuery = `
        SELECT mssql_sync
        FROM sysconfig
        ORDER BY created_at DESC
        LIMIT 1
      `;
      const sysconfigResult = await this.pgPool.query(sysconfigQuery);

      if (sysconfigResult.rows.length === 0 || !sysconfigResult.rows[0].mssql_sync) {
        return {
          success: true,
          shouldImport: false,
          message: 'MSSQL sync interval not configured in sysconfig'
        };
      }

      const syncIntervalMinutes = sysconfigResult.rows[0].mssql_sync;

      // Get last import time from inf_checkin.imported_at
      const lastImportQuery = `
        SELECT imported_at
        FROM inf_checkin
        ORDER BY imported_at DESC
        LIMIT 1
      `;
      const lastImportResult = await this.pgPool.query(lastImportQuery);

      let shouldImport = false;
      let lastImportTime: Date | undefined;
      let nextImportTime: Date | undefined;

      if (lastImportResult.rows.length === 0) {
        // No previous imports, should import
        console.log('✅ No previous imports found, should import');
        shouldImport = true;
      } else {
        lastImportTime = new Date(lastImportResult.rows[0].imported_at);
        const currentTime = new Date();
        nextImportTime = new Date(lastImportTime.getTime() + (syncIntervalMinutes * 60 * 1000));
        shouldImport = currentTime >= nextImportTime;

        console.log(`✅ Last import: ${lastImportTime.toISOString()}, Next import: ${nextImportTime.toISOString()}, Should import: ${shouldImport}`);
      }

      // If autoImport is enabled and should import, trigger the import automatically
      if (autoImport && shouldImport) {
        console.log('🔄 Auto-import enabled and sync interval elapsed, triggering automatic import...');

        // Get last CreatedOn to continue from where we left off
        const lastCreatedOn = await this.getLastCreatedOn();

        const importResult = await this.importFromMssql({
          dateFrom: options?.dateFrom || lastCreatedOn || '2024-01-01',
          dateTo: options?.dateTo
        });

        return {
          success: importResult.success,
          shouldImport: true,
          data: {
            imported: importResult.imported || 0,
            updated: importResult.updated || 0,
            skipped: importResult.skipped || 0
          },
          lastImportTime,
          nextImportTime,
          syncIntervalMinutes,
          message: importResult.success
            ? `Sync completed: ${importResult.imported} imported, ${importResult.updated} updated, ${importResult.skipped} skipped`
            : `Sync failed: ${importResult.message}`,
          errors: importResult.errors
        };
      } else {
        // Just return the status without importing
        return {
          success: true,
          shouldImport,
          data: {
            imported: 0,
            updated: 0,
            skipped: 0
          },
          lastImportTime,
          nextImportTime,
          syncIntervalMinutes,
          message: shouldImport
            ? `Import should run (sync interval elapsed)`
            : `Import should not run yet (next import at: ${nextImportTime?.toISOString()})`
        };
      }

    } catch (error) {
      console.error('❌ Error in InfCheckinService.sync:', error);
      return {
        success: true,
        shouldImport: false,
        message: error instanceof Error ? error.message : 'Failed to check import status'
      };
    }
  }

  /**
   * Get the last CreatedOn timestamp from PostgreSQL inf_checkin table
   */
  async getLastCreatedOn(): Promise<string | null> {
    try {
      console.log('🔧 InfCheckinService.getLastCreatedOn called');

      const query = `
        SELECT created_on
        FROM inf_checkin
        ORDER BY created_on DESC
        LIMIT 1
      `;

      const result = await this.pgPool.query(query);

      if (result.rows.length > 0 && result.rows[0].created_on) {
        const lastCreatedOn = formatDateTimeLocal(result.rows[0].created_on);
        console.log(`✅ InfCheckinService.getLastCreatedOn: Found last CreatedOn: ${lastCreatedOn}`);
        return lastCreatedOn;
      }

      console.log('✅ InfCheckinService.getLastCreatedOn: No records found, returning default date 2024-01-01');
      return '2024-01-01';

    } catch (error) {
      console.error('❌ Error in InfCheckinService.getLastCreatedOn:', error);
      return null;
    }
  }

  /**
   * Import data from MSSQL database to PostgreSQL inf_checkin table
   * Automatically continues from last CreatedOn if no dateFrom is specified
   * @param tableName - Source table name in MSSQL (optional, defaults to inf_checkin)
   * @param dateFrom - Start date for import (optional, auto-continues from last CreatedOn if not provided)
   * @param dateTo - End date for import (optional)
   */
  async importFromMssql(params?: {
    tableName?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<{
    success: boolean;
    message: string;
    imported?: number;
    updated?: number;
    skipped?: number;
    errors?: string[];
  }> {
    const startTime = Date.now();

    try {
      console.log('🔄 InfCheckinService.importFromMssql started with params:', params);

      const tableName = params?.tableName || 'inf_checkin';
      let { dateFrom, dateTo } = params || {};

      // If no dateFrom specified, automatically continue from last CreatedOn
      if (!dateFrom) {
        const lastCreatedOn = await this.getLastCreatedOn();
        if (lastCreatedOn) {
          dateFrom = lastCreatedOn;
          console.log(`📅 Auto-continuing import from last CreatedOn: ${dateFrom}`);
        }
      }

      // Get MSSQL connection with config from sysconfig table
      const mssqlPool = await getMssqlPool(this.pgPool);

      // Build query with optional date filters
      let query = `
        SELECT
          id,
          LineNoId,
          WorkShiftId,
          GrCode,
          Username,
          Firstname,
          CreatedOn,
          CheckedOut,
          TimeOffWork,
          [Group],
          Team,
          TimeStartWork,
          DateTimeStartWork,
          DateTimeOffWork
        FROM dbo.CheckIn
      `;

      const conditions: string[] = [];
      if (dateFrom) {
        conditions.push(` convert(date,CreatedOn) >= '${dateFrom}'`); // Use > instead of >= to continue after last record
      }
      if (dateTo) {
        conditions.push(` convert(date,CreatedOn) <= '${dateTo}'`);
      }

      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
      }

      query += ' ORDER BY CreatedOn ASC'; // Changed to ASC for chronological import

      console.log('📋 Executing MSSQL query:', query);

      // Fetch data from MSSQL
      const result = await mssqlPool.request().query(query);
      const records = result.recordset;

      console.log(`✅ Fetched ${records.length} records from MSSQL`);

      if (records.length === 0) {
        return {
          success: true,
          message: 'No new records found to import',
          imported: 0,
          updated: 0,
          skipped: 0
        };
      }

      // Insert records into PostgreSQL using UPSERT with tracking
      let importedCount = 0;
      let updatedCount = 0;
      let skippedCount = 0;
      const errors: string[] = [];

      for (const record of records) {
        try {
          // Check if record exists to determine insert vs update
          const checkQuery = 'SELECT id FROM inf_checkin WHERE id = $1';
          const checkResult = await this.pgPool.query(checkQuery, [record.id]);
          const exists = checkResult.rows.length > 0;

          // Format date for PostgreSQL TIMESTAMP WITHOUT TIME ZONE
          // IMPORTANT: MSSQL driver (tedious) returns Date objects interpreted as UTC
          // We use getUTC* methods to preserve the original MSSQL datetime values
          const normalizeDate = (dateValue: any): string | null => {
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
              // Use UTC methods to preserve original MSSQL datetime values
              // MSSQL driver interprets datetime as UTC, so getUTC* gives us the original values
              const year = dateValue.getUTCFullYear();
              const month = String(dateValue.getUTCMonth() + 1).padStart(2, '0');
              const day = String(dateValue.getUTCDate()).padStart(2, '0');
              const hours = String(dateValue.getUTCHours()).padStart(2, '0');
              const minutes = String(dateValue.getUTCMinutes()).padStart(2, '0');
              const seconds = String(dateValue.getUTCSeconds()).padStart(2, '0');
              return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
            }

            // If it's a string, return as-is if it's already formatted
            if (typeof dateValue === 'string') {
              // Check if already in YYYY-MM-DD HH:mm:ss format
              const match = dateValue.match(/^(\d{4})-(\d{2})-(\d{2})[\sT](\d{2}):(\d{2}):(\d{2})/);
              if (match) {
                const [, year, month, day, hours, minutes, seconds] = match;
                return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
              }
            }

            // Try to parse as Date (fallback)
            const date = new Date(dateValue);
            if (isNaN(date.getTime())) {
              console.warn(`⚠️ Invalid date value: "${dateValue}" (type: ${typeof dateValue})`);
              return null;
            }

            // Use UTC methods for parsed dates too
            const year = date.getUTCFullYear();
            const month = String(date.getUTCMonth() + 1).padStart(2, '0');
            const day = String(date.getUTCDate()).padStart(2, '0');
            const hours = String(date.getUTCHours()).padStart(2, '0');
            const minutes = String(date.getUTCMinutes()).padStart(2, '0');
            const seconds = String(date.getUTCSeconds()).padStart(2, '0');
            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
          };

          // Generate local timestamp for imported_at (server's local time)
          const now = new Date();
          const localNow = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

          const upsertQuery = `
            INSERT INTO inf_checkin (
              id, line_no_id, work_shift_id, gr_code, username, oprname,
              created_on, checked_out, time_off_work, group_code, team,
              time_start_work, date_time_start_work, date_time_off_work,
              imported_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            ON CONFLICT (id)
            DO UPDATE SET
              line_no_id = EXCLUDED.line_no_id,
              work_shift_id = EXCLUDED.work_shift_id,
              gr_code = EXCLUDED.gr_code,
              username = EXCLUDED.username,
              oprname = EXCLUDED.oprname,
              created_on = EXCLUDED.created_on,
              checked_out = EXCLUDED.checked_out,
              time_off_work = EXCLUDED.time_off_work,
              group_code = EXCLUDED.group_code,
              team = EXCLUDED.team,
              time_start_work = EXCLUDED.time_start_work,
              date_time_start_work = EXCLUDED.date_time_start_work,
              date_time_off_work = EXCLUDED.date_time_off_work,
              imported_at = EXCLUDED.imported_at
          `;

          await this.pgPool.query(upsertQuery, [
            record.id,
            record.LineNoId,
            record.WorkShiftId,
            record.GrCode,
            record.Username,
            record.Firstname,
            normalizeDate(record.CreatedOn),        // timestamp
            normalizeDate(record.CheckedOut),       // timestamp - needs normalization
            record.TimeOffWork || null,             // varchar - time string like "07:35"
            record.Group,
            record.Team,
            record.TimeStartWork || null,           // varchar - time string like "07:35"
            normalizeDate(record.DateTimeStartWork), // timestamp
            normalizeDate(record.DateTimeOffWork),  // timestamp
            localNow                                // imported_at - local timestamp
          ]);

          if (exists) {
            updatedCount++;
          } else {
            importedCount++;
          }
        } catch (error) {
          const errorMsg = `Failed to import record ${record.id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          console.error('❌', errorMsg);
          errors.push(errorMsg);
          skippedCount++;
        }
      }

      const durationMs = Date.now() - startTime;

      // Log the operation
      await logInterfaceOperation({
        tablename: 'CHK',
        createdBy: 0,
        recordsImported: importedCount,
        recordsUpdated: updatedCount,
        recordsSkipped: skippedCount,
        recordsFailed: errors.length,
        durationMs
      });

      console.log(`✅ InfCheckinService.importFromMssql completed: ${importedCount} imported, ${updatedCount} updated, ${skippedCount} skipped`);

      return {
        success: true,
        message: `Successfully processed ${records.length} records: ${importedCount} imported, ${updatedCount} updated, ${skippedCount} skipped`,
        imported: importedCount,
        updated: updatedCount,
        skipped: skippedCount,
        errors: errors.length > 0 ? errors : undefined
      };

    } catch (error) {
      const durationMs = Date.now() - startTime;

      // Log the error
      await logInterfaceOperation({
        tablename: 'CHK',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        createdBy: 0,
        recordsImported: 0,
        recordsUpdated: 0,
        recordsSkipped: 0,
        recordsFailed: 1,
        durationMs
      });

      console.error('❌ Error in InfCheckinService.importFromMssql:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to import data from MSSQL',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }
}

export default InfCheckinService;

/*
=== SIMPLIFIED INF CHECKIN SERVICE FEATURES ===

SIMPLIFIED ARCHITECTURE:
✅ Direct service class without complex inheritance
✅ Simple method signatures matching inf-lotinput pattern
✅ Focus on business logic for data retrieval only
✅ No complex generic patterns or abstractions

CORE BUSINESS OPERATIONS:
✅ getAll() - Paginated list with filtering
✅ getByUsername() - Find records by username
✅ getByLineId() - Find records by line ID
✅ getActiveWorkers() - Currently checked-in workers
✅ getStatistics() - Dashboard statistics
✅ getFilterOptions() - Dropdown options
✅ searchRecords() - Multi-criteria search

INPUT VALIDATION:
✅ Query parameter validation
✅ Date format validation
✅ Required field validation
✅ Consistent error messaging

CONSISTENT RESULT TYPES:
✅ InfCheckinListResult for data lists
✅ InfCheckinStatsResult for statistics
✅ Standard success/error structure
✅ Detailed error messages and logging

MANUFACTURING FOCUS:
✅ Worker check-in/out tracking
✅ Production line monitoring
✅ Shift and team management
✅ Real-time active worker identification

The refactored service follows the exact same pattern as inf-lotinput
with simple, direct method calls and consistent error handling.
*/