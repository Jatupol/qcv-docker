"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfCheckinService = void 0;
const mssql_1 = require("../../../config/mssql");
const interfaceLogService_1 = require("../../../services/interfaceLogService");
const dateTimeUtils_1 = require("../../../utils/dateTimeUtils");
class InfCheckinService {
    constructor(model, pgPool) {
        this.model = model;
        this.pgPool = pgPool;
    }
    async getAll(queryParams = {}) {
        try {
            console.log('🔧 InfCheckinService.getAll called with params:', queryParams);
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
        }
        catch (error) {
            console.error('❌ Error in InfCheckinService.getAll:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to retrieve INF CheckIn data',
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
    async getByUsername(username) {
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
        }
        catch (error) {
            console.error('❌ Error in InfCheckinService.getByUsername:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to retrieve user data',
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
    async getByLineId(lineId) {
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
        }
        catch (error) {
            console.error('❌ Error in InfCheckinService.getByLineId:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to retrieve line data',
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
    async getActiveWorkers() {
        try {
            console.log('🔧 InfCheckinService.getActiveWorkers called');
            const data = await this.model.getActiveWorkers();
            console.log(`✅ InfCheckinService.getActiveWorkers: Found ${data.length} active workers`);
            return {
                success: true,
                data,
                message: `Found ${data.length} active workers`
            };
        }
        catch (error) {
            console.error('❌ Error in InfCheckinService.getActiveWorkers:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to retrieve active workers',
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
    async getStatistics() {
        try {
            console.log('📊 InfCheckinService.getStatistics called');
            const stats = await this.model.getStatistics();
            console.log('✅ InfCheckinService.getStatistics: Retrieved statistics', stats);
            return {
                success: true,
                data: stats,
                message: 'Statistics retrieved successfully'
            };
        }
        catch (error) {
            console.error('❌ Error in InfCheckinService.getStatistics:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to retrieve statistics',
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
    async getOperators(gr_code) {
        try {
            console.log('🔧 InfCheckinService.getOperators called with gr_code:', gr_code);
            const operators = await this.model.getOperators(gr_code);
            console.log(`✅ InfCheckinService.getOperators: Retrieved ${operators.length} operators`);
            return {
                success: true,
                data: operators,
                message: 'Operators retrieved successfully'
            };
        }
        catch (error) {
            console.error('❌ Error in InfCheckinService.getOperators:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to retrieve operators'
            };
        }
    }
    async getFVILeaderOperators() {
        try {
            console.log('🔧 InfCheckinService.getFVILeaderOperators called');
            const operators = await this.model.getFVILeaderOperators();
            console.log(`✅ InfCheckinService.getFVILeaderOperators: Retrieved ${operators.length} FVI leaders`);
            return {
                success: true,
                data: operators,
                message: 'FVI leader operators retrieved successfully'
            };
        }
        catch (error) {
            console.error('❌ Error in InfCheckinService.getFVILeaderOperators:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to retrieve FVI leader operators'
            };
        }
    }
    async getFilterOptions() {
        try {
            console.log('🔧 InfCheckinService.getFilterOptions called');
            const options = await this.model.getFilterOptions();
            console.log('✅ InfCheckinService.getFilterOptions: Retrieved filter options', options);
            return {
                success: true,
                data: options,
                message: 'Filter options retrieved successfully'
            };
        }
        catch (error) {
            console.error('❌ Error in InfCheckinService.getFilterOptions:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to retrieve filter options'
            };
        }
    }
    async searchRecords(searchParams) {
        try {
            console.log('🔧 InfCheckinService.searchRecords called with params:', searchParams);
            const data = await this.model.searchRecords(searchParams);
            console.log(`✅ InfCheckinService.searchRecords: Found ${data.length} matching records`);
            return {
                success: true,
                data,
                message: `Found ${data.length} matching records`
            };
        }
        catch (error) {
            console.error('❌ Error in InfCheckinService.searchRecords:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to search records',
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
    async getFVILineMapping(params) {
        try {
            console.log('🔧 InfCheckinService.getFVILineMapping called with params:', params);
            if (!params.line || !params.date || !params.shift) {
                return {
                    success: false,
                    message: 'Missing required parameters: line, date, and shift',
                    errors: ['line, date, and shift are required parameters']
                };
            }
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
        }
        catch (error) {
            console.error('❌ Error in InfCheckinService.getFVILineMapping:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to retrieve FVI line mapping',
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
    async getFVILinesByDate(date) {
        try {
            console.log('🔧 InfCheckinService.getFVILinesByDate called with date:', date);
            if (!date || !date.trim()) {
                return {
                    success: false,
                    message: 'Date parameter is required',
                    errors: ['Date parameter is missing or empty']
                };
            }
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
        }
        catch (error) {
            console.error('❌ Error in InfCheckinService.getFVILinesByDate:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to retrieve FVI lines',
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
    async getDistinctFVILines() {
        try {
            console.log('🔧 InfCheckinService.getDistinctFVILines called');
            const data = await this.model.getDistinctFVILines();
            console.log(`✅ InfCheckinService.getDistinctFVILines: Found ${data.length} distinct lines`);
            return {
                success: true,
                data,
                message: `Found ${data.length} distinct FVI lines`
            };
        }
        catch (error) {
            console.error('❌ Error in InfCheckinService.getDistinctFVILines:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to retrieve distinct FVI lines',
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
    validateQueryParams(params) {
        const { page, limit } = params;
        if (page !== undefined) {
            if (!Number.isInteger(page) || page < 1) {
                return 'Page must be a positive integer';
            }
        }
        if (params.createdOnFrom && !this.isValidDate(params.createdOnFrom)) {
            return 'Invalid createdOnFrom format. Use YYYY-MM-DD';
        }
        if (params.createdOnTo && !this.isValidDate(params.createdOnTo)) {
            return 'Invalid createdOnTo format. Use YYYY-MM-DD';
        }
        return null;
    }
    isValidDate(dateString) {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date.getTime());
    }
    async healthCheck() {
        try {
            await this.model.getStatistics();
            return {
                success: true,
                message: 'INF CheckIn service is healthy',
                timestamp: new Date().toISOString(),
                service: 'inf-checkin'
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'INF CheckIn service is unhealthy: ' + (error instanceof Error ? error.message : 'Unknown error'),
                timestamp: new Date().toISOString(),
                service: 'inf-checkin'
            };
        }
    }
    async sync(autoImport = false, options) {
        try {
            console.log('🔧 InfCheckinService.sync called with autoImport:', autoImport, 'options:', options);
            if (options?.forceSync && autoImport) {
                console.log('🔄 Force sync requested (manual import), bypassing time check...');
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
            const lastImportQuery = `
        SELECT imported_at
        FROM inf_checkin
        ORDER BY imported_at DESC
        LIMIT 1
      `;
            const lastImportResult = await this.pgPool.query(lastImportQuery);
            let shouldImport = false;
            let lastImportTime;
            let nextImportTime;
            if (lastImportResult.rows.length === 0) {
                console.log('✅ No previous imports found, should import');
                shouldImport = true;
            }
            else {
                lastImportTime = new Date(lastImportResult.rows[0].imported_at);
                const currentTime = new Date();
                nextImportTime = new Date(lastImportTime.getTime() + (syncIntervalMinutes * 60 * 1000));
                shouldImport = currentTime >= nextImportTime;
                console.log(`✅ Last import: ${lastImportTime.toISOString()}, Next import: ${nextImportTime.toISOString()}, Should import: ${shouldImport}`);
            }
            if (autoImport && shouldImport) {
                console.log('🔄 Auto-import enabled and sync interval elapsed, triggering automatic import...');
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
            }
            else {
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
        }
        catch (error) {
            console.error('❌ Error in InfCheckinService.sync:', error);
            return {
                success: true,
                shouldImport: false,
                message: error instanceof Error ? error.message : 'Failed to check import status'
            };
        }
    }
    async getLastCreatedOn() {
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
                const lastCreatedOn = (0, dateTimeUtils_1.formatDateTimeLocal)(result.rows[0].created_on);
                console.log(`✅ InfCheckinService.getLastCreatedOn: Found last CreatedOn: ${lastCreatedOn}`);
                return lastCreatedOn;
            }
            console.log('✅ InfCheckinService.getLastCreatedOn: No records found, returning default date 2024-01-01');
            return '2024-01-01';
        }
        catch (error) {
            console.error('❌ Error in InfCheckinService.getLastCreatedOn:', error);
            return null;
        }
    }
    async importFromMssql(params) {
        const startTime = Date.now();
        try {
            console.log('🔄 InfCheckinService.importFromMssql started with params:', params);
            const tableName = params?.tableName || 'inf_checkin';
            let { dateFrom, dateTo } = params || {};
            if (!dateFrom) {
                const lastCreatedOn = await this.getLastCreatedOn();
                if (lastCreatedOn) {
                    dateFrom = lastCreatedOn;
                    console.log(`📅 Auto-continuing import from last CreatedOn: ${dateFrom}`);
                }
            }
            const mssqlPool = await (0, mssql_1.getMssqlPool)(this.pgPool);
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
            const conditions = [];
            if (dateFrom) {
                conditions.push(` convert(date,CreatedOn) >= '${dateFrom}'`);
            }
            if (dateTo) {
                conditions.push(` convert(date,CreatedOn) <= '${dateTo}'`);
            }
            if (conditions.length > 0) {
                query += ` WHERE ${conditions.join(' AND ')}`;
            }
            query += ' ORDER BY CreatedOn ASC';
            console.log('📋 Executing MSSQL query:', query);
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
            let importedCount = 0;
            let updatedCount = 0;
            let skippedCount = 0;
            const errors = [];
            for (const record of records) {
                try {
                    const checkQuery = 'SELECT id FROM inf_checkin WHERE id = $1';
                    const checkResult = await this.pgPool.query(checkQuery, [record.id]);
                    const exists = checkResult.rows.length > 0;
                    const normalizeDate = (dateValue) => {
                        if (!dateValue ||
                            (typeof dateValue === 'string' &&
                                (dateValue.trim() === '' || dateValue.trim().toLowerCase() === 'null'))) {
                            return null;
                        }
                        if (dateValue instanceof Date) {
                            if (isNaN(dateValue.getTime())) {
                                return null;
                            }
                            const year = dateValue.getUTCFullYear();
                            const month = String(dateValue.getUTCMonth() + 1).padStart(2, '0');
                            const day = String(dateValue.getUTCDate()).padStart(2, '0');
                            const hours = String(dateValue.getUTCHours()).padStart(2, '0');
                            const minutes = String(dateValue.getUTCMinutes()).padStart(2, '0');
                            const seconds = String(dateValue.getUTCSeconds()).padStart(2, '0');
                            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
                        }
                        if (typeof dateValue === 'string') {
                            const match = dateValue.match(/^(\d{4})-(\d{2})-(\d{2})[\sT](\d{2}):(\d{2}):(\d{2})/);
                            if (match) {
                                const [, year, month, day, hours, minutes, seconds] = match;
                                return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
                            }
                        }
                        const date = new Date(dateValue);
                        if (isNaN(date.getTime())) {
                            console.warn(`⚠️ Invalid date value: "${dateValue}" (type: ${typeof dateValue})`);
                            return null;
                        }
                        const year = date.getUTCFullYear();
                        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
                        const day = String(date.getUTCDate()).padStart(2, '0');
                        const hours = String(date.getUTCHours()).padStart(2, '0');
                        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
                        const seconds = String(date.getUTCSeconds()).padStart(2, '0');
                        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
                    };
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
                        normalizeDate(record.CreatedOn),
                        normalizeDate(record.CheckedOut),
                        record.TimeOffWork || null,
                        record.Group,
                        record.Team,
                        record.TimeStartWork || null,
                        normalizeDate(record.DateTimeStartWork),
                        normalizeDate(record.DateTimeOffWork),
                        localNow
                    ]);
                    if (exists) {
                        updatedCount++;
                    }
                    else {
                        importedCount++;
                    }
                }
                catch (error) {
                    const errorMsg = `Failed to import record ${record.id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
                    console.error('❌', errorMsg);
                    errors.push(errorMsg);
                    skippedCount++;
                }
            }
            const durationMs = Date.now() - startTime;
            await (0, interfaceLogService_1.logInterfaceOperation)({
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
        }
        catch (error) {
            const durationMs = Date.now() - startTime;
            await (0, interfaceLogService_1.logInterfaceOperation)({
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
exports.InfCheckinService = InfCheckinService;
exports.default = InfCheckinService;
