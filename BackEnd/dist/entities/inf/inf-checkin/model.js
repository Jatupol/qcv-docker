"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfCheckinModel = void 0;
exports.createInfCheckinModel = createInfCheckinModel;
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../../../db/schema");
const types_1 = require("./types");
const dateTimeUtils_1 = require("../../../utils/dateTimeUtils");
function mapDrizzleToRecord(row) {
    return {
        id: row.id,
        line_no_id: row.lineNoId,
        work_shift_id: row.workShiftId,
        gr_code: row.grCode,
        username: row.username,
        oprname: row.oprname,
        created_on: row.createdOn ? (0, dateTimeUtils_1.formatDateTimeLocal)(row.createdOn) : null,
        checked_out: row.checkedOut ? (0, dateTimeUtils_1.formatDateTimeLocal)(row.checkedOut) : null,
        date_time_start_work: row.dateTimeStartWork ? (0, dateTimeUtils_1.formatDateTimeLocal)(row.dateTimeStartWork) : null,
        date_time_off_work: row.dateTimeOffWork ? (0, dateTimeUtils_1.formatDateTimeLocal)(row.dateTimeOffWork) : null,
        time_off_work: row.timeOffWork,
        time_start_work: row.timeStartWork,
        group_code: row.groupCode,
        team: row.team,
        imported_at: row.importedAt ? (0, dateTimeUtils_1.formatDateTimeLocal)(row.importedAt) : null,
    };
}
class InfCheckinModel {
    constructor(db) {
        this.config = types_1.INF_CHECKIN_TABLE_CONFIG;
        this.db = db;
    }
    async getAll(queryParams = {}) {
        const { page = 1, limit = this.config.defaultLimit, username, usernameSearch, oprname, lineNoSearch, globalSearch, line_no_id, work_shift_id, group_code, team, status, createdOnFrom, createdOnTo, lineId, shiftId, search } = queryParams;
        try {
            console.log('🔧 InfCheckinModel.getAll called with params:', queryParams);
            const conditions = [];
            const searchTerm = globalSearch || search || usernameSearch || lineNoSearch;
            if (searchTerm?.trim()) {
                const searchPattern = `%${searchTerm}%`;
                conditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(schema_1.infCheckin.username, searchPattern), (0, drizzle_orm_1.ilike)(schema_1.infCheckin.oprname, searchPattern), (0, drizzle_orm_1.ilike)(schema_1.infCheckin.lineNoId, searchPattern), (0, drizzle_orm_1.ilike)(schema_1.infCheckin.workShiftId, searchPattern), (0, drizzle_orm_1.ilike)(schema_1.infCheckin.groupCode, searchPattern), (0, drizzle_orm_1.ilike)(schema_1.infCheckin.team, searchPattern)));
            }
            if (username?.trim()) {
                conditions.push((0, drizzle_orm_1.ilike)(schema_1.infCheckin.username, `%${username}%`));
            }
            if (oprname?.trim()) {
                conditions.push((0, drizzle_orm_1.ilike)(schema_1.infCheckin.oprname, `%${oprname}%`));
            }
            if (line_no_id || lineId) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.infCheckin.lineNoId, line_no_id || lineId));
            }
            if (work_shift_id || shiftId) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.infCheckin.workShiftId, work_shift_id || shiftId));
            }
            if (group_code) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.infCheckin.groupCode, group_code));
            }
            if (team) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.infCheckin.team, team));
            }
            if (status && status !== 'all') {
                if (status === 'working') {
                    conditions.push((0, drizzle_orm_1.isNull)(schema_1.infCheckin.dateTimeOffWork));
                }
                else if (status === 'checked_out') {
                    conditions.push((0, drizzle_orm_1.isNotNull)(schema_1.infCheckin.dateTimeOffWork));
                }
            }
            if (createdOnFrom) {
                conditions.push((0, drizzle_orm_1.sql) `${schema_1.infCheckin.createdOn} >= ${createdOnFrom}`);
            }
            if (createdOnTo) {
                conditions.push((0, drizzle_orm_1.sql) `${schema_1.infCheckin.createdOn} <= ${createdOnTo}::date + INTERVAL '1 day' - INTERVAL '1 second'`);
            }
            const whereClause = conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined;
            const countResult = await this.db
                .select({ count: (0, drizzle_orm_1.sql) `count(*)::int` })
                .from(schema_1.infCheckin)
                .where(whereClause);
            const total = countResult[0]?.count || 0;
            const validLimit = Math.min(Math.max(1, limit), this.config.maxLimit);
            const validPage = Math.max(1, page);
            const offset = (validPage - 1) * validLimit;
            const totalPages = Math.ceil(total / validLimit);
            const data = await this.db
                .select()
                .from(schema_1.infCheckin)
                .where(whereClause)
                .orderBy((0, drizzle_orm_1.desc)(schema_1.infCheckin.createdOn))
                .limit(validLimit)
                .offset(offset);
            const records = data.map(mapDrizzleToRecord);
            console.log(`✅ InfCheckinModel.getAll: Retrieved ${records.length} records`);
            const pagination = {
                page: validPage,
                limit: validLimit,
                total,
                totalPages,
                hasNext: validPage < totalPages,
                hasPrev: validPage > 1
            };
            return { data: records, pagination };
        }
        catch (error) {
            console.error('❌ Error in InfCheckinModel.getAll:', error);
            throw error;
        }
    }
    async getByUsername(username) {
        try {
            console.log('🔧 InfCheckinModel.getByUsername called:', { username });
            const data = await this.db
                .select()
                .from(schema_1.infCheckin)
                .where((0, drizzle_orm_1.ilike)(schema_1.infCheckin.username, `%${username}%`))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.infCheckin.createdOn))
                .limit(100);
            const records = data.map(mapDrizzleToRecord);
            console.log(`✅ InfCheckinModel.getByUsername: Found ${records.length} records`);
            return records;
        }
        catch (error) {
            console.error('❌ Error in InfCheckinModel.getByUsername:', error);
            throw error;
        }
    }
    async getByLineId(lineId) {
        try {
            console.log('🔧 InfCheckinModel.getByLineId called:', { lineId });
            const data = await this.db
                .select()
                .from(schema_1.infCheckin)
                .where((0, drizzle_orm_1.eq)(schema_1.infCheckin.lineNoId, lineId))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.infCheckin.createdOn))
                .limit(100);
            const records = data.map(mapDrizzleToRecord);
            console.log(`✅ InfCheckinModel.getByLineId: Found ${records.length} records`);
            return records;
        }
        catch (error) {
            console.error('❌ Error in InfCheckinModel.getByLineId:', error);
            throw error;
        }
    }
    async getActiveWorkers() {
        try {
            console.log('🔧 InfCheckinModel.getActiveWorkers called');
            const data = await this.db
                .select()
                .from(schema_1.infCheckin)
                .where((0, drizzle_orm_1.isNull)(schema_1.infCheckin.dateTimeOffWork))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.infCheckin.createdOn))
                .limit(200);
            const records = data.map(mapDrizzleToRecord);
            console.log(`✅ InfCheckinModel.getActiveWorkers: Found ${records.length} active workers`);
            return records;
        }
        catch (error) {
            console.error('❌ Error in InfCheckinModel.getActiveWorkers:', error);
            throw error;
        }
    }
    async getStatistics() {
        try {
            console.log('📊 InfCheckinModel.getStatistics called');
            const result = await this.db
                .select({
                totalRecords: (0, drizzle_orm_1.sql) `count(*)::int`,
                totalToday: (0, drizzle_orm_1.sql) `count(CASE WHEN ${schema_1.infCheckin.createdOn}::date = CURRENT_DATE THEN 1 END)::int`,
                totalMonth: (0, drizzle_orm_1.sql) `count(CASE WHEN date_trunc('month', ${schema_1.infCheckin.createdOn}) = date_trunc('month', CURRENT_DATE) THEN 1 END)::int`,
                totalYear: (0, drizzle_orm_1.sql) `count(CASE WHEN date_trunc('year', ${schema_1.infCheckin.createdOn}) = date_trunc('year', CURRENT_DATE) THEN 1 END)::int`,
                lastSync: (0, drizzle_orm_1.sql) `max(${schema_1.infCheckin.importedAt})`
            })
                .from(schema_1.infCheckin);
            const stats = result[0];
            const records = {
                totalRecords: stats?.totalRecords || 0,
                totalToday: stats?.totalToday || 0,
                totalMonth: stats?.totalMonth || 0,
                totalYear: stats?.totalYear || 0,
                lastSync: stats?.lastSync ? (0, dateTimeUtils_1.formatDateTimeLocal)(stats.lastSync) : undefined
            };
            console.log('✅ InfCheckinModel.getStatistics: Retrieved statistics', records);
            return records;
        }
        catch (error) {
            console.error('❌ Error in InfCheckinModel.getStatistics:', error);
            throw error;
        }
    }
    async getOperators(gr_code) {
        try {
            console.log('🔧 InfCheckinModel.getOperators called with gr_code:', gr_code);
            const conditions = [
                (0, drizzle_orm_1.isNotNull)(schema_1.infCheckin.username),
                (0, drizzle_orm_1.isNotNull)(schema_1.infCheckin.oprname),
                (0, drizzle_orm_1.sql) `${schema_1.infCheckin.username} != ''`,
                (0, drizzle_orm_1.sql) `${schema_1.infCheckin.oprname} != ''`
            ];
            if (gr_code?.trim()) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.infCheckin.grCode, gr_code.trim()));
            }
            const result = await this.db
                .select({
                username: schema_1.infCheckin.username,
                oprname: (0, drizzle_orm_1.sql) `max(${schema_1.infCheckin.oprname})`
            })
                .from(schema_1.infCheckin)
                .where((0, drizzle_orm_1.and)(...conditions))
                .groupBy(schema_1.infCheckin.username)
                .orderBy((0, drizzle_orm_1.asc)(schema_1.infCheckin.username));
            const operators = result.map(row => ({
                username: row.username || '',
                oprname: row.oprname || ''
            }));
            console.log(`✅ InfCheckinModel.getOperators: Retrieved ${operators.length} operators`);
            return operators;
        }
        catch (error) {
            console.error('❌ Error in InfCheckinModel.getOperators:', error);
            throw error;
        }
    }
    async getFVILeaderOperators() {
        try {
            const result = await this.db.execute((0, drizzle_orm_1.sql) `
        SELECT username, oprname
        FROM v_fvilead
        ORDER BY username
      `);
            const operators = result.rows.map(row => ({
                username: row.username,
                oprname: row.oprname
            }));
            console.log(`✅ InfCheckinModel.getFVILeaderOperators: Retrieved ${operators.length} operators`);
            return operators;
        }
        catch (error) {
            console.error('❌ Error in InfCheckinModel.getFVILeaderOperators:', error);
            throw error;
        }
    }
    async getFilterOptions() {
        try {
            console.log('🔧 InfCheckinModel.getFilterOptions called');
            const [lineIds, workShiftIds, groupCodes, teams] = await Promise.all([
                this.db.selectDistinct({ value: schema_1.infCheckin.lineNoId })
                    .from(schema_1.infCheckin)
                    .where((0, drizzle_orm_1.isNotNull)(schema_1.infCheckin.lineNoId))
                    .orderBy((0, drizzle_orm_1.asc)(schema_1.infCheckin.lineNoId))
                    .limit(50),
                this.db.selectDistinct({ value: schema_1.infCheckin.workShiftId })
                    .from(schema_1.infCheckin)
                    .where((0, drizzle_orm_1.isNotNull)(schema_1.infCheckin.workShiftId))
                    .orderBy((0, drizzle_orm_1.asc)(schema_1.infCheckin.workShiftId))
                    .limit(50),
                this.db.selectDistinct({ value: schema_1.infCheckin.groupCode })
                    .from(schema_1.infCheckin)
                    .where((0, drizzle_orm_1.isNotNull)(schema_1.infCheckin.groupCode))
                    .orderBy((0, drizzle_orm_1.asc)(schema_1.infCheckin.groupCode))
                    .limit(50),
                this.db.selectDistinct({ value: schema_1.infCheckin.team })
                    .from(schema_1.infCheckin)
                    .where((0, drizzle_orm_1.isNotNull)(schema_1.infCheckin.team))
                    .orderBy((0, drizzle_orm_1.asc)(schema_1.infCheckin.team))
                    .limit(50)
            ]);
            const options = {
                lineIds: lineIds.map(r => r.value),
                workShiftIds: workShiftIds.map(r => r.value),
                groupCodes: groupCodes.map(r => r.value),
                teams: teams.map(r => r.value)
            };
            console.log('✅ InfCheckinModel.getFilterOptions: Retrieved options');
            return options;
        }
        catch (error) {
            console.error('❌ Error in InfCheckinModel.getFilterOptions:', error);
            throw error;
        }
    }
    async getFVILineMapping(params) {
        try {
            console.log('🔧 InfCheckinModel.getFVILineMapping called with params:', params);
            const { line, date, shift } = params;
            const data = await this.db
                .select({
                gr_code: schema_1.infCheckin.grCode,
                group_code: schema_1.infCheckin.groupCode,
                username: schema_1.infCheckin.username,
                oprname: schema_1.infCheckin.oprname
            })
                .from(schema_1.infCheckin)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.infCheckin.lineNoId, line), (0, drizzle_orm_1.sql) `${schema_1.infCheckin.dateTimeStartWork}::date = ${date}`, (0, drizzle_orm_1.eq)(schema_1.infCheckin.workShiftId, shift)))
                .orderBy((0, drizzle_orm_1.asc)(schema_1.infCheckin.grCode));
            const mappings = data.map(row => ({
                gr_code: row.gr_code || '',
                group_code: row.group_code || '',
                username: row.username || ''
            }));
            console.log(`✅ InfCheckinModel.getFVILineMapping: Found ${mappings.length} station mappings`);
            return mappings;
        }
        catch (error) {
            console.error('❌ Error in InfCheckinModel.getFVILineMapping:', error);
            throw error;
        }
    }
    async getFVILinesByDate(date) {
        try {
            console.log('🔧 InfCheckinModel.getFVILinesByDate called with date:', date);
            const result = await this.db
                .selectDistinct({ line_no_id: schema_1.infCheckin.lineNoId })
                .from(schema_1.infCheckin)
                .where((0, drizzle_orm_1.sql) `${schema_1.infCheckin.dateTimeStartWork}::date = ${date}`)
                .orderBy((0, drizzle_orm_1.asc)(schema_1.infCheckin.lineNoId));
            const lines = result.map(row => ({
                line_no_id: row.line_no_id
            }));
            console.log(`✅ InfCheckinModel.getFVILinesByDate: Found ${lines.length} lines`);
            return lines;
        }
        catch (error) {
            console.error('❌ Error in InfCheckinModel.getFVILinesByDate:', error);
            throw error;
        }
    }
    async getDistinctFVILines() {
        try {
            console.log('🔧 InfCheckinModel.getDistinctFVILines called');
            const result = await this.db.execute((0, drizzle_orm_1.sql) `
        SELECT DISTINCT line_no_id, concat('Line ', line_no_id) AS line_name
        FROM public.inf_checkin
        WHERE length(line_no_id) BETWEEN 1 AND 5
        GROUP BY line_no_id
        ORDER BY line_no_id
      `);
            const lines = result.rows.map(row => ({
                line_no_id: row.line_no_id,
                line_name: row.line_name
            }));
            console.log(`✅ InfCheckinModel.getDistinctFVILines: Found ${lines.length} distinct lines`);
            return lines;
        }
        catch (error) {
            console.error('❌ Error in InfCheckinModel.getDistinctFVILines:', error);
            throw error;
        }
    }
    async searchRecords(searchParams) {
        try {
            console.log('🔍 InfCheckinModel.searchRecords called with params:', searchParams);
            const conditions = [];
            if (searchParams.searchTerm?.trim()) {
                const pattern = `%${searchParams.searchTerm}%`;
                conditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(schema_1.infCheckin.username, pattern), (0, drizzle_orm_1.ilike)(schema_1.infCheckin.oprname, pattern), (0, drizzle_orm_1.ilike)(schema_1.infCheckin.lineNoId, pattern), (0, drizzle_orm_1.ilike)(schema_1.infCheckin.groupCode, pattern), (0, drizzle_orm_1.ilike)(schema_1.infCheckin.team, pattern)));
            }
            if (searchParams.username?.trim()) {
                conditions.push((0, drizzle_orm_1.ilike)(schema_1.infCheckin.username, `%${searchParams.username}%`));
            }
            if (searchParams.oprname?.trim()) {
                conditions.push((0, drizzle_orm_1.ilike)(schema_1.infCheckin.oprname, `%${searchParams.oprname}%`));
            }
            if (searchParams.lineId?.trim()) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.infCheckin.lineNoId, searchParams.lineId));
            }
            if (searchParams.groupCode?.trim()) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.infCheckin.groupCode, searchParams.groupCode));
            }
            if (searchParams.team?.trim()) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.infCheckin.team, searchParams.team));
            }
            if (searchParams.dateFrom) {
                conditions.push((0, drizzle_orm_1.sql) `${schema_1.infCheckin.createdOn} >= ${searchParams.dateFrom}`);
            }
            if (searchParams.dateTo) {
                conditions.push((0, drizzle_orm_1.sql) `${schema_1.infCheckin.createdOn} <= ${searchParams.dateTo}::date + INTERVAL '1 day' - INTERVAL '1 second'`);
            }
            const whereClause = conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined;
            const data = await this.db
                .select()
                .from(schema_1.infCheckin)
                .where(whereClause)
                .orderBy((0, drizzle_orm_1.desc)(schema_1.infCheckin.createdOn))
                .limit(100);
            const records = data.map(mapDrizzleToRecord);
            console.log(`✅ InfCheckinModel.searchRecords: Found ${records.length} matching records`);
            return records;
        }
        catch (error) {
            console.error('❌ Error in InfCheckinModel.searchRecords:', error);
            throw error;
        }
    }
}
exports.InfCheckinModel = InfCheckinModel;
function createInfCheckinModel(db) {
    return new InfCheckinModel(db);
}
exports.default = InfCheckinModel;
