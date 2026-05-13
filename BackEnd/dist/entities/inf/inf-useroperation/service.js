"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfUserOperationService = void 0;
const mssql_1 = require("../../../config/mssql");
const interfaceLogService_1 = require("../../../services/interfaceLogService");
class InfUserOperationService {
    constructor(model, pgPool) {
        this.model = model;
        this.pgPool = pgPool;
    }
    async getAll(queryParams = {}) {
        try {
            console.log('🔧 InfUserOperationService.getAll called with params:', queryParams);
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
        }
        catch (error) {
            console.error('❌ Error in InfUserOperationService.getAll:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to retrieve user operation data',
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
    async getByLineNoId(lineNoId) {
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
        }
        catch (error) {
            console.error('❌ Error in InfUserOperationService.getByLineNoId:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to retrieve user',
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
    async getStatistics() {
        try {
            console.log('📊 InfUserOperationService.getStatistics called');
            const stats = await this.model.getStatistics();
            console.log('✅ InfUserOperationService.getStatistics: Retrieved statistics', stats);
            return {
                success: true,
                data: stats,
                message: 'Statistics retrieved successfully'
            };
        }
        catch (error) {
            console.error('❌ Error in InfUserOperationService.getStatistics:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to retrieve statistics',
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
    async getFilterOptions() {
        try {
            console.log('🔧 InfUserOperationService.getFilterOptions called');
            const options = await this.model.getFilterOptions();
            console.log('✅ InfUserOperationService.getFilterOptions: Retrieved filter options', options);
            return {
                success: true,
                data: options,
                message: 'Filter options retrieved successfully'
            };
        }
        catch (error) {
            console.error('❌ Error in InfUserOperationService.getFilterOptions:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to retrieve filter options'
            };
        }
    }
    async getLastImportTime() {
        try {
            const result = await this.pgPool.query(`
        SELECT MAX(imported_at) as last_import
        FROM inf_useroperation
      `);
            if (result.rows.length > 0 && result.rows[0].last_import) {
                return new Date(result.rows[0].last_import);
            }
            return null;
        }
        catch (error) {
            console.error('❌ Error getting last import time:', error);
            return null;
        }
    }
    async syncFromMssql(params) {
        const startTime = Date.now();
        try {
            console.log('🔄 InfUserOperationService.syncFromMssql started with params:', params);
            const tableName = params?.tableName || 'Users';
            const forceSync = params?.forceSync || false;
            const mssqlPool = await (0, mssql_1.getMssqlPool)(this.pgPool);
            const lastImportTime = await this.getLastImportTime();
            console.log('📅 Last import time:', lastImportTime?.toISOString() || 'None (first import)');
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
            if (!forceSync && lastImportTime) {
                const year = lastImportTime.getFullYear();
                const month = String(lastImportTime.getMonth() + 1).padStart(2, '0');
                const day = String(lastImportTime.getDate()).padStart(2, '0');
                const hours = String(lastImportTime.getHours()).padStart(2, '0');
                const minutes = String(lastImportTime.getMinutes()).padStart(2, '0');
                const seconds = String(lastImportTime.getSeconds()).padStart(2, '0');
                const lastImportStr = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
                query += ` WHERE CreatedOn > '${lastImportStr}'`;
                console.log(`📋 Incremental sync: fetching records created after ${lastImportStr}`);
            }
            else if (forceSync) {
                console.log('📋 Force sync: fetching ALL records');
            }
            else {
                console.log('📋 First sync: fetching ALL records');
            }
            query += ' ORDER BY CreatedOn ASC';
            console.log('📋 Executing MSSQL query:', query);
            const result = await mssqlPool.request().query(query);
            const records = result.recordset;
            console.log(`✅ Fetched ${records.length} records from MSSQL`);
            if (records.length === 0) {
                await (0, interfaceLogService_1.logInterfaceOperation)({
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
            const syncResult = await this.model.bulkUpsert(transformedRecords);
            const durationMs = Date.now() - startTime;
            await (0, interfaceLogService_1.logInterfaceOperation)({
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
        }
        catch (error) {
            const durationMs = Date.now() - startTime;
            await (0, interfaceLogService_1.logInterfaceOperation)({
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
    validateQueryParams(params) {
        const { page, limit } = params;
        if (page !== undefined) {
            if (!Number.isInteger(page) || page < 1) {
                return 'Page must be a positive integer';
            }
        }
        return null;
    }
    isValidDate(dateString) {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date.getTime());
    }
    normalizeDate(dateValue) {
        if (!dateValue ||
            (typeof dateValue === 'string' &&
                (dateValue.trim() === '' || dateValue.trim().toLowerCase() === 'null'))) {
            return null;
        }
        if (dateValue instanceof Date) {
            if (isNaN(dateValue.getTime())) {
                return null;
            }
            const year = dateValue.getFullYear();
            const month = String(dateValue.getMonth() + 1).padStart(2, '0');
            const day = String(dateValue.getDate()).padStart(2, '0');
            const hours = String(dateValue.getHours()).padStart(2, '0');
            const minutes = String(dateValue.getMinutes()).padStart(2, '0');
            const seconds = String(dateValue.getSeconds()).padStart(2, '0');
            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        }
        const date = new Date(dateValue);
        if (isNaN(date.getTime())) {
            console.warn(`⚠️ Invalid date value: "${dateValue}" (type: ${typeof dateValue})`);
            return null;
        }
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
    async healthCheck() {
        try {
            await this.model.getStatistics();
            return {
                success: true,
                message: 'INF User Operation service is healthy',
                timestamp: new Date().toISOString(),
                service: 'inf-useroperation'
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'INF User Operation service is unhealthy: ' + (error instanceof Error ? error.message : 'Unknown error'),
                timestamp: new Date().toISOString(),
                service: 'inf-useroperation'
            };
        }
    }
}
exports.InfUserOperationService = InfUserOperationService;
exports.default = InfUserOperationService;
