"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfLotInputService = void 0;
const mssql_1 = require("../../../config/mssql");
const sql = __importStar(require("mssql"));
const interfaceLogService_1 = require("../../../services/interfaceLogService");
const dateTimeUtils_1 = require("../../../utils/dateTimeUtils");
class InfLotInputService {
    constructor(model, pgPool) {
        this.model = model;
        this.pgPool = pgPool;
    }
    async getAll(queryParams = {}) {
        try {
            console.log('🔧 InfLotInputService.getAll called with params:', queryParams);
            const validationError = this.validateQueryParams(queryParams);
            if (validationError) {
                return {
                    success: false,
                    message: validationError,
                    errors: [validationError]
                };
            }
            const result = await this.model.getAll(queryParams);
            console.log(`✅ InfLotInputService.getAll: Retrieved ${result.data.length} records`);
            return {
                success: true,
                data: result.data,
                pagination: result.pagination,
                message: 'INF Lot Input data retrieved successfully'
            };
        }
        catch (error) {
            console.error('❌ Error in InfLotInputService.getAll:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to retrieve INF Lot Input data',
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
    async getByLotNumber(lotNo) {
        try {
            console.log('🔧 InfLotInputService.getByLotNumber called:', { lotNo });
            if (!lotNo || !lotNo.trim()) {
                return {
                    success: false,
                    message: 'Lot number is required',
                    errors: ['Lot number parameter is missing or empty']
                };
            }
            const data = await this.model.getByLotNumber(lotNo.trim());
            console.log(`✅ InfLotInputService.getByLotNumber: Found ${data.length} records for lot ${lotNo}`);
            return {
                success: true,
                data,
                message: `Found ${data.length} records for lot number: ${lotNo}`
            };
        }
        catch (error) {
            console.error('❌ Error in InfLotInputService.getByLotNumber:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to retrieve lot data',
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
    async getStatistics() {
        try {
            console.log('📊 InfLotInputService.getStatistics called');
            const stats = await this.model.getStatistics();
            console.log('✅ InfLotInputService.getStatistics: Retrieved statistics', stats);
            return {
                success: true,
                data: stats,
                message: 'Statistics retrieved successfully'
            };
        }
        catch (error) {
            console.error('❌ Error in InfLotInputService.getStatistics:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to retrieve statistics',
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
    async getFilterOptions() {
        try {
            console.log('🔧 InfLotInputService.getFilterOptions called');
            const options = await this.model.getFilterOptions();
            console.log('✅ InfLotInputService.getFilterOptions: Retrieved filter options', options);
            return {
                success: true,
                data: options,
                message: 'Filter options retrieved successfully'
            };
        }
        catch (error) {
            console.error('❌ Error in InfLotInputService.getFilterOptions:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to retrieve filter options'
            };
        }
    }
    async getMissingItems() {
        try {
            console.log('🔍 InfLotInputService.getMissingItems called');
            const query = `
        SELECT itemno
        FROM public.inf_lotinput
        WHERE inputdate >= (CURRENT_DATE - INTERVAL '2 months')
          AND itemno NOT IN (SELECT partno FROM public.parts)
        GROUP BY itemno
        ORDER BY itemno
      `;
            const result = await this.pgPool.query(query);
            const items = result.rows.map((r) => r.itemno);
            console.log(`✅ getMissingItems: found ${items.length} missing items`);
            return { success: true, data: items, message: `Found ${items.length} missing item(s)` };
        }
        catch (error) {
            console.error('❌ Error in getMissingItems:', error);
            return { success: false, message: error instanceof Error ? error.message : 'Failed to query missing items' };
        }
    }
    validateQueryParams(params) {
        const { page, limit } = params;
        if (page !== undefined) {
            if (!Number.isInteger(page) || page < 1) {
                return 'Page must be a positive integer';
            }
        }
        if (limit !== undefined) {
            if (!Number.isInteger(limit) || limit < 1 || limit > 200) {
                return 'Limit must be between 1 and 200';
            }
        }
        if (params.inputDateFrom && !this.isValidDate(params.inputDateFrom)) {
            return 'Invalid inputDateFrom format. Use YYYY-MM-DD';
        }
        if (params.inputDateTo && !this.isValidDate(params.inputDateTo)) {
            return 'Invalid inputDateTo format. Use YYYY-MM-DD';
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
                message: 'INF Lot Input service is healthy',
                timestamp: new Date().toISOString(),
                service: 'inf-lotinput'
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'INF Lot Input service is unhealthy: ' + (error instanceof Error ? error.message : 'Unknown error'),
                timestamp: new Date().toISOString(),
                service: 'inf-lotinput'
            };
        }
    }
    async getLastInputDate() {
        try {
            console.log('🔧 InfLotInputService.getLastInputDate called');
            const query = `
        SELECT inputdate
        FROM inf_lotinput
        ORDER BY inputdate DESC
        LIMIT 1
      `;
            const result = await this.pgPool.query(query);
            if (result.rows.length > 0 && result.rows[0].inputdate) {
                const lastInputDate = (0, dateTimeUtils_1.formatDateTimeLocal)(result.rows[0].inputdate);
                console.log(`✅ InfLotInputService.getLastInputDate: Found last InputDate: ${lastInputDate}`);
                return lastInputDate;
            }
            console.log('✅ InfLotInputService.getLastInputDate: No records found, returning default date 2024-01-01');
            return '2024-01-01';
        }
        catch (error) {
            console.error('❌ Error in InfLotInputService.getLastInputDate:', error);
            return null;
        }
    }
    async sync(autoImport = false, options) {
        try {
            console.log('🔧 InfLotInputService.sync called with autoImport:', autoImport, 'options:', options);
            if (options?.forceSync && autoImport) {
                console.log('🔄 Force sync requested (manual import), bypassing time check...');
                const lastInputDate = await this.getLastInputDate();
                const importResult = await this.importFromMssql({
                    dateFrom: options?.dateFrom || lastInputDate || '2024-01-01',
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
        FROM inf_lotinput
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
                const lastInputDate = await this.getLastInputDate();
                const importResult = await this.importFromMssql({
                    dateFrom: options?.dateFrom || lastInputDate || '2024-01-01',
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
            console.error('❌ Error in InfLotInputService.sync:', error);
            return {
                success: true,
                shouldImport: false,
                message: error instanceof Error ? error.message : 'Failed to check import status'
            };
        }
    }
    async importFromMssql(params) {
        const startTime = Date.now();
        try {
            console.log('🔄 InfLotInputService.importFromMssql started with params:', params);
            const tableName = params?.tableName || 'inf_lotinput';
            const { dateFrom, dateTo } = params || {};
            const mssqlPool = await (0, mssql_1.getMssqlPool)(this.pgPool);
            let query = `
        SELECT
          Id,
          LotNo,
          PartSite,
          left(LotNo,3) as [LineNo],
          ItemNo,
          Model,
          Version,
          InputDate,
          FinishOn
        FROM dbo.Input
      `;
            const kwResult = await this.pgPool.query(`SELECT mssql_exclude_keywords FROM sysconfig ORDER BY created_at DESC LIMIT 1`);
            const keywordsStr = kwResult.rows[0]?.mssql_exclude_keywords || '';
            const keywords = keywordsStr.split(',').map((k) => k.trim()).filter(Boolean);
            let excludedLotNos = new Set();
            if (keywords.length > 0) {
                try {
                    const debugRequest = mssqlPool.request();
                    const debugResult = await debugRequest.query(`SELECT TOP 10 LotNo, DefectRemark, DATALENGTH(DefectRemark) as byte_len, LEN(DefectRemark) as char_len
             FROM dbo.Input
             WHERE LotNo = 'T5464N568' OR DefectRemark IS NOT NULL
             ORDER BY CASE WHEN LotNo = 'T5464N568' THEN 0 ELSE 1 END`);
                    console.log('🔍 DEBUG DefectRemark samples:');
                    debugResult.recordset.forEach((r) => {
                        console.log(`  LotNo=${r.LotNo}, DefectRemark=[${r.DefectRemark}], bytes=${r.byte_len}, chars=${r.char_len}`);
                    });
                    keywords.forEach((kw) => {
                        console.log(`  Keyword [${kw}] hex: ${Buffer.from(kw, 'utf8').toString('hex')}`);
                    });
                }
                catch (dbgErr) {
                    console.log('🔍 DEBUG query failed:', dbgErr);
                }
                const excludeRequest = mssqlPool.request();
                const kwPlaceholders = keywords.map((_, i) => `CAST(@ekw${i} AS VARCHAR(500))`);
                keywords.forEach((kw, i) => {
                    excludeRequest.input(`ekw${i}`, sql.NVarChar, kw);
                });
                const excludeQuery = `
          SELECT DISTINCT LotNo
          FROM dbo.Input
          WHERE DefectRemark IN (${kwPlaceholders.join(',')})
        `;
                console.log('📋 Exclude keywords query:', excludeQuery);
                console.log('📋 Exclude keywords:', keywords);
                const excludeResult = await excludeRequest.query(excludeQuery);
                const excludedList = excludeResult.recordset.map((r) => r.LotNo).filter(Boolean);
                excludedLotNos = new Set(excludedList);
                console.log(`🚫 Found ${excludedLotNos.size} lots to exclude by keywords`);
                if (excludedList.length > 0) {
                    console.log(`🚫 First 20 excluded lots:`, excludedList.slice(0, 20));
                }
            }
            const conditions = [];
            const request = mssqlPool.request();
            if (dateFrom) {
                conditions.push(`convert(date,inputdate) >= @dateFrom`);
                request.input('dateFrom', dateFrom);
            }
            if (dateTo) {
                conditions.push(`convert(date,inputdate) <= @dateTo`);
                request.input('dateTo', dateTo);
            }
            if (conditions.length > 0) {
                query += ` WHERE ${conditions.join(' AND ')}`;
            }
            query += ' ORDER BY inputdate ASC';
            console.log('📋 Executing MSSQL query:', query);
            const result = await request.query(query);
            const allRecords = result.recordset;
            console.log(`✅ Fetched ${allRecords.length} records from MSSQL`);
            let records = allRecords;
            if (excludedLotNos.size > 0) {
                if (allRecords.length > 0) {
                    console.log('🔍 Record keys:', Object.keys(allRecords[0]));
                    console.log('🔍 Sample record LotNo:', JSON.stringify(allRecords[0].LotNo));
                }
                console.log('🔍 Is T5464N568 in excluded set?', excludedLotNos.has('T5464N568'));
                records = allRecords.filter((r) => !excludedLotNos.has(r.LotNo));
                console.log(`🚫 Excluded ${allRecords.length - records.length} records (${excludedLotNos.size} lots matched keywords)`);
            }
            else {
                console.log('⚠️ No exclude keywords found - importing all records without filtering');
            }
            if (records.length === 0) {
                return {
                    success: true,
                    message: 'No records found to import',
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
                    const checkQuery = 'SELECT id FROM inf_lotinput WHERE id = $1';
                    const checkResult = await this.pgPool.query(checkQuery, [record.id]);
                    const exists = checkResult.rows.length > 0;
                    const upsertQuery = `
            INSERT INTO inf_lotinput (
              id, lotno, partsite, lineno, itemno,
              model, version, inputdate, finish_on, imported_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            ON CONFLICT (id)
            DO UPDATE SET
              lotno = EXCLUDED.lotno,
              partsite = EXCLUDED.partsite,
              lineno = EXCLUDED.lineno,
              itemno = EXCLUDED.itemno,
              model = EXCLUDED.model,
              version = EXCLUDED.version,
              inputdate = EXCLUDED.inputdate,
              finish_on = EXCLUDED.finish_on,
              imported_at = EXCLUDED.imported_at
          `;
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
                    await this.pgPool.query(upsertQuery, [
                        record.Id,
                        record.LotNo,
                        record.PartSite,
                        record.LineNo,
                        record.ItemNo,
                        record.Model,
                        record.Version,
                        normalizeDate(record.InputDate),
                        normalizeDate(record.FinishOn),
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
                    const errorMsg = `Failed to import record ${record.Id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
                    console.error('❌', errorMsg);
                    errors.push(errorMsg);
                    skippedCount++;
                }
            }
            const durationMs = Date.now() - startTime;
            await (0, interfaceLogService_1.logInterfaceOperation)({
                tablename: 'LIN',
                createdBy: 0,
                recordsImported: importedCount,
                recordsUpdated: updatedCount,
                recordsSkipped: skippedCount,
                recordsFailed: errors.length,
                durationMs
            });
            console.log(`✅ InfLotInputService.importFromMssql completed: ${importedCount} imported, ${updatedCount} updated, ${skippedCount} skipped`);
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
                tablename: 'LIN',
                errorMessage: error instanceof Error ? error.message : 'Unknown error',
                createdBy: 0,
                recordsImported: 0,
                recordsUpdated: 0,
                recordsSkipped: 0,
                recordsFailed: 1,
                durationMs
            });
            console.error('❌ Error in InfLotInputService.importFromMssql:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to import data from MSSQL',
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
    async getExcludeKeywords() {
        try {
            const result = await this.pgPool.query(`SELECT mssql_exclude_keywords FROM sysconfig ORDER BY created_at DESC LIMIT 1`);
            const keywords = result.rows[0]?.mssql_exclude_keywords || '';
            return { success: true, data: keywords };
        }
        catch (error) {
            console.error('❌ Error getting exclude keywords:', error);
            return { success: false, message: error instanceof Error ? error.message : 'Failed to get keywords' };
        }
    }
    async updateExcludeKeywords(keywords) {
        try {
            await this.pgPool.query(`UPDATE sysconfig SET mssql_exclude_keywords = $1, updated_at = NOW()
         WHERE id = (SELECT id FROM sysconfig ORDER BY created_at DESC LIMIT 1)`, [keywords]);
            console.log('✅ Exclude keywords updated:', keywords);
            return { success: true, data: keywords, message: 'Keywords updated successfully' };
        }
        catch (error) {
            console.error('❌ Error updating exclude keywords:', error);
            return { success: false, message: error instanceof Error ? error.message : 'Failed to update keywords' };
        }
    }
    async cleanupByKeywords() {
        try {
            console.log('🧹 Starting cleanup by keywords...');
            const kwResult = await this.pgPool.query(`SELECT mssql_exclude_keywords FROM sysconfig ORDER BY created_at DESC LIMIT 1`);
            const keywordsStr = kwResult.rows[0]?.mssql_exclude_keywords || '';
            const keywords = keywordsStr.split(',').map((k) => k.trim()).filter(Boolean);
            if (keywords.length === 0) {
                return { success: false, message: 'No exclude keywords configured' };
            }
            console.log('🔑 Cleanup keywords:', keywords);
            const mssqlPool = await (0, mssql_1.getMssqlPool)(this.pgPool);
            const request = mssqlPool.request();
            const kwPlaceholders = keywords.map((_, i) => `CAST(@ckw${i} AS VARCHAR(500))`);
            keywords.forEach((kw, i) => {
                request.input(`ckw${i}`, sql.NVarChar, kw);
            });
            const mssqlQuery = `
        SELECT DISTINCT LotNo
        FROM dbo.Input
        WHERE DefectRemark IN (${kwPlaceholders.join(',')})
        AND CONVERT(date, inputdate) >= DATEADD(month, -3, GETDATE())
      `;
            console.log('📋 MSSQL cleanup query:', mssqlQuery);
            const mssqlResult = await request.query(mssqlQuery);
            const lotNumbers = mssqlResult.recordset.map((r) => r.LotNo).filter(Boolean);
            if (lotNumbers.length === 0) {
                return { success: true, message: 'No matching lots found to remove', removed: 0, lotNumbers: [] };
            }
            console.log(`🔍 Found ${lotNumbers.length} lots to remove from inf_lotinput`);
            const deleteResult = await this.pgPool.query(`DELETE FROM inf_lotinput WHERE lotno = ANY($1)`, [lotNumbers]);
            const removed = deleteResult.rowCount || 0;
            console.log(`✅ Cleanup complete: removed ${removed} records from inf_lotinput`);
            return {
                success: true,
                message: `Cleanup complete: removed ${removed} records (${lotNumbers.length} lots matched)`,
                removed,
                lotNumbers
            };
        }
        catch (error) {
            console.error('❌ Error in cleanupByKeywords:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to cleanup data'
            };
        }
    }
}
exports.InfLotInputService = InfLotInputService;
exports.default = InfLotInputService;
