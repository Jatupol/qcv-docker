"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfUserOperationModel = void 0;
exports.createInfUserOperationModel = createInfUserOperationModel;
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../../../db/schema");
const types_1 = require("./types");
const dateTimeUtils_1 = require("../../../utils/dateTimeUtils");
function mapDrizzleToRecord(row) {
    return {
        username: row.username || '',
        isActive: row.isActive ?? true,
        isDelete: row.isDelete ?? false,
        isSuperAdmin: row.isSuperAdmin ?? false,
        roleCode: row.roleCode || null,
        operatorName: row.operatorName || null,
        isMrb: row.isMrb ?? false,
        lineNoId: row.lineNoId || null,
        workShiftId: row.workShiftId || null,
        importedAt: row.importedAt ? (0, dateTimeUtils_1.formatDateTimeLocal)(row.importedAt) : (0, dateTimeUtils_1.formatDateTimeLocal)(new Date())
    };
}
class InfUserOperationModel {
    constructor(db) {
        this.config = types_1.INF_USEROPERATION_TABLE_CONFIG;
        this.db = db;
    }
    async getAll(queryParams = {}) {
        const { page = 1, limit = this.config.defaultLimit, usernameSearch, operatorNameSearch, globalSearch, roleCode, lineNoId, workShiftId, isActive, isSuperAdmin, isMrb } = queryParams;
        try {
            const conditions = [];
            if (usernameSearch) {
                conditions.push((0, drizzle_orm_1.ilike)(schema_1.infUseroperation.username, `%${usernameSearch}%`));
            }
            if (operatorNameSearch) {
                conditions.push((0, drizzle_orm_1.ilike)(schema_1.infUseroperation.operatorName, `%${operatorNameSearch}%`));
            }
            if (globalSearch) {
                const searchPattern = `%${globalSearch}%`;
                conditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(schema_1.infUseroperation.username, searchPattern), (0, drizzle_orm_1.ilike)(schema_1.infUseroperation.operatorName, searchPattern), (0, drizzle_orm_1.ilike)(schema_1.infUseroperation.roleCode, searchPattern), (0, drizzle_orm_1.ilike)(schema_1.infUseroperation.lineNoId, searchPattern), (0, drizzle_orm_1.ilike)(schema_1.infUseroperation.workShiftId, searchPattern)));
            }
            if (roleCode) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.infUseroperation.roleCode, roleCode));
            }
            if (lineNoId) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.infUseroperation.lineNoId, lineNoId));
            }
            if (workShiftId) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.infUseroperation.workShiftId, workShiftId));
            }
            if (isActive !== undefined) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.infUseroperation.isActive, isActive));
            }
            if (isSuperAdmin !== undefined) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.infUseroperation.isSuperAdmin, isSuperAdmin));
            }
            if (isMrb !== undefined) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.infUseroperation.isMrb, isMrb));
            }
            const whereClause = conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined;
            const countResult = await this.db
                .select({ count: (0, drizzle_orm_1.sql) `count(*)::int` })
                .from(schema_1.infUseroperation)
                .where(whereClause);
            const total = countResult[0]?.count || 0;
            const offset = (page - 1) * limit;
            const totalPages = Math.ceil(total / limit);
            const data = await this.db
                .select()
                .from(schema_1.infUseroperation)
                .where(whereClause)
                .orderBy((0, drizzle_orm_1.desc)(schema_1.infUseroperation.importedAt))
                .limit(limit)
                .offset(offset);
            const records = data.map(row => mapDrizzleToRecord(row));
            const pagination = {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            };
            return {
                data: records,
                pagination
            };
        }
        catch (error) {
            console.error('❌ Error in InfUserOperationModel.getAll:', error);
            throw new Error(`Failed to retrieve user operation data: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getByUsername(username) {
        try {
            const result = await this.db
                .select()
                .from(schema_1.infUseroperation)
                .where((0, drizzle_orm_1.eq)(schema_1.infUseroperation.username, username))
                .limit(1);
            if (result.length === 0) {
                return null;
            }
            return mapDrizzleToRecord(result[0]);
        }
        catch (error) {
            console.error('❌ Error in InfUserOperationModel.getByUsername:', error);
            throw new Error(`Failed to retrieve user: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getByLineNoId(lineNoId) {
        try {
            const result = await this.db
                .select()
                .from(schema_1.infUseroperation)
                .where((0, drizzle_orm_1.eq)(schema_1.infUseroperation.lineNoId, lineNoId))
                .limit(1);
            if (result.length === 0) {
                return null;
            }
            return mapDrizzleToRecord(result[0]);
        }
        catch (error) {
            console.error('❌ Error in InfUserOperationModel.getByLineNoId:', error);
            throw new Error(`Failed to retrieve user: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getStatistics() {
        try {
            const result = await this.db
                .select({
                totalRecords: (0, drizzle_orm_1.sql) `count(*)::int`,
                totalToday: (0, drizzle_orm_1.sql) `count(CASE WHEN ${schema_1.infUseroperation.importedAt}::date = CURRENT_DATE THEN 1 END)::int`,
                totalMonth: (0, drizzle_orm_1.sql) `count(CASE WHEN date_trunc('month', ${schema_1.infUseroperation.importedAt}) = date_trunc('month', CURRENT_DATE) THEN 1 END)::int`,
                totalYear: (0, drizzle_orm_1.sql) `count(CASE WHEN date_trunc('year', ${schema_1.infUseroperation.importedAt}) = date_trunc('year', CURRENT_DATE) THEN 1 END)::int`,
                totalActive: (0, drizzle_orm_1.sql) `count(CASE WHEN ${schema_1.infUseroperation.isActive} = true THEN 1 END)::int`,
                totalInactive: (0, drizzle_orm_1.sql) `count(CASE WHEN ${schema_1.infUseroperation.isActive} = false THEN 1 END)::int`,
                totalSuperAdmin: (0, drizzle_orm_1.sql) `count(CASE WHEN ${schema_1.infUseroperation.isSuperAdmin} = true THEN 1 END)::int`,
                totalMrb: (0, drizzle_orm_1.sql) `count(CASE WHEN ${schema_1.infUseroperation.isMrb} = true THEN 1 END)::int`,
                lastSync: (0, drizzle_orm_1.sql) `max(${schema_1.infUseroperation.importedAt})`
            })
                .from(schema_1.infUseroperation);
            const stats = result[0];
            return {
                totalRecords: stats?.totalRecords || 0,
                totalToday: stats?.totalToday || 0,
                totalMonth: stats?.totalMonth || 0,
                totalYear: stats?.totalYear || 0,
                totalActive: stats?.totalActive || 0,
                totalInactive: stats?.totalInactive || 0,
                totalSuperAdmin: stats?.totalSuperAdmin || 0,
                totalMrb: stats?.totalMrb || 0,
                lastSync: stats?.lastSync ? (0, dateTimeUtils_1.formatDateTimeLocal)(new Date(stats.lastSync)) : undefined
            };
        }
        catch (error) {
            console.error('❌ Error in InfUserOperationModel.getStatistics:', error);
            throw new Error(`Failed to retrieve statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getFilterOptions() {
        try {
            const result = await this.db
                .select({
                roleCodes: (0, drizzle_orm_1.sql) `ARRAY_AGG(DISTINCT ${schema_1.infUseroperation.roleCode} ORDER BY ${schema_1.infUseroperation.roleCode}) FILTER (WHERE ${schema_1.infUseroperation.roleCode} IS NOT NULL)`,
                lineNoIds: (0, drizzle_orm_1.sql) `ARRAY_AGG(DISTINCT ${schema_1.infUseroperation.lineNoId} ORDER BY ${schema_1.infUseroperation.lineNoId}) FILTER (WHERE ${schema_1.infUseroperation.lineNoId} IS NOT NULL)`,
                workShiftIds: (0, drizzle_orm_1.sql) `ARRAY_AGG(DISTINCT ${schema_1.infUseroperation.workShiftId} ORDER BY ${schema_1.infUseroperation.workShiftId}) FILTER (WHERE ${schema_1.infUseroperation.workShiftId} IS NOT NULL)`
            })
                .from(schema_1.infUseroperation);
            const options = result[0];
            return {
                roleCodes: options?.roleCodes || [],
                lineNoIds: options?.lineNoIds || [],
                workShiftIds: options?.workShiftIds || []
            };
        }
        catch (error) {
            console.error('❌ Error in InfUserOperationModel.getFilterOptions:', error);
            return {
                roleCodes: [],
                lineNoIds: [],
                workShiftIds: []
            };
        }
    }
    getLocalNow() {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const day = now.getDate();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        return new Date(year, month, day, hours, minutes, seconds);
    }
    async upsertRecord(record) {
        try {
            const localNow = this.getLocalNow();
            const insertData = {
                username: record.username,
                isActive: record.isActive ?? true,
                isDelete: record.isDelete ?? false,
                isSuperAdmin: record.isSuperAdmin ?? false,
                roleCode: record.roleCode || null,
                operatorName: record.operatorName || null,
                isMrb: record.isMrb ?? false,
                lineNoId: record.lineNoId || null,
                workShiftId: record.workShiftId || null,
                importedAt: localNow
            };
            const result = await this.db
                .insert(schema_1.infUseroperation)
                .values(insertData)
                .onConflictDoUpdate({
                target: schema_1.infUseroperation.username,
                set: {
                    isActive: insertData.isActive,
                    isDelete: insertData.isDelete,
                    isSuperAdmin: insertData.isSuperAdmin,
                    roleCode: insertData.roleCode,
                    operatorName: insertData.operatorName,
                    isMrb: insertData.isMrb,
                    lineNoId: insertData.lineNoId,
                    workShiftId: insertData.workShiftId,
                    importedAt: localNow
                }
            })
                .returning();
            return mapDrizzleToRecord(result[0]);
        }
        catch (error) {
            console.error('❌ Error in InfUserOperationModel.upsertRecord:', error);
            throw new Error(`Failed to upsert record: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async bulkUpsert(records) {
        const result = {
            imported: 0,
            updated: 0,
            skipped: 0,
            failed: 0,
            errors: []
        };
        for (const record of records) {
            try {
                const existing = await this.getByUsername(record.username);
                await this.upsertRecord(record);
                if (existing) {
                    result.updated++;
                }
                else {
                    result.imported++;
                }
            }
            catch (error) {
                result.failed++;
                const errorMessage = `Failed to upsert ${record.username}: ${error instanceof Error ? error.message : 'Unknown error'}`;
                result.errors?.push(errorMessage);
                console.error('❌', errorMessage);
            }
        }
        return result;
    }
}
exports.InfUserOperationModel = InfUserOperationModel;
function createInfUserOperationModel(db) {
    return new InfUserOperationModel(db);
}
exports.default = InfUserOperationModel;
