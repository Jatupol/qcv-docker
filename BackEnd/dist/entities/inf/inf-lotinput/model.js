"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfLotInputModel = void 0;
exports.createInfLotInputModel = createInfLotInputModel;
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../../../db/schema");
const types_1 = require("./types");
const dateTimeUtils_1 = require("../../../utils/dateTimeUtils");
function mapDrizzleToRecord(row) {
    return {
        id: row.id || '',
        LotNo: row.lotno || '',
        PartSite: row.partsite || '',
        LineNo: row.lineno || '',
        ItemNo: row.itemno || '',
        Model: row.model || '',
        Version: row.version || '',
        InputDate: row.inputdate ? (0, dateTimeUtils_1.formatDateTimeLocal)(row.inputdate) : '',
        FinishOn: row.finishOn ? (0, dateTimeUtils_1.formatDateTimeLocal)(row.finishOn) : null,
        imported_at: row.importedAt ? (0, dateTimeUtils_1.formatDateTimeLocal)(row.importedAt) : '',
    };
}
class InfLotInputModel {
    constructor(db) {
        this.config = types_1.INF_LOTINPUT_TABLE_CONFIG;
        this.db = db;
    }
    async getAll(queryParams = {}) {
        const { page = 1, limit = this.config.defaultLimit, lotNoSearch, itemNoSearch, globalSearch, partSite, lineNo, model, version, inputDateFrom, inputDateTo, lotNo, itemNo, search } = queryParams;
        try {
            console.log('🔧 InfLotInputModel.getAll called with params:', queryParams);
            const conditions = [];
            if (lotNoSearch || lotNo) {
                conditions.push((0, drizzle_orm_1.ilike)(schema_1.infLotinput.lotno, `%${lotNoSearch || lotNo}%`));
            }
            if (itemNoSearch || itemNo) {
                conditions.push((0, drizzle_orm_1.ilike)(schema_1.infLotinput.itemno, `%${itemNoSearch || itemNo}%`));
            }
            if (globalSearch || search) {
                const searchTerm = globalSearch || search;
                const searchPattern = `%${searchTerm}%`;
                conditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(schema_1.infLotinput.lotno, searchPattern), (0, drizzle_orm_1.ilike)(schema_1.infLotinput.partsite, searchPattern), (0, drizzle_orm_1.ilike)(schema_1.infLotinput.lineno, searchPattern), (0, drizzle_orm_1.ilike)(schema_1.infLotinput.itemno, searchPattern), (0, drizzle_orm_1.ilike)(schema_1.infLotinput.model, searchPattern), (0, drizzle_orm_1.ilike)(schema_1.infLotinput.version, searchPattern)));
            }
            if (partSite) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.infLotinput.partsite, partSite));
            }
            if (lineNo) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.infLotinput.lineno, lineNo));
            }
            if (model) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.infLotinput.model, model));
            }
            if (version) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.infLotinput.version, version));
            }
            if (inputDateFrom) {
                conditions.push((0, drizzle_orm_1.sql) `${schema_1.infLotinput.inputdate} >= ${inputDateFrom}`);
            }
            if (inputDateTo) {
                conditions.push((0, drizzle_orm_1.sql) `${schema_1.infLotinput.inputdate} <= ${inputDateTo}::date + INTERVAL '1 day' - INTERVAL '1 second'`);
            }
            const whereClause = conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined;
            const countResult = await this.db
                .select({ count: (0, drizzle_orm_1.sql) `count(*)::int` })
                .from(schema_1.infLotinput)
                .where(whereClause);
            const total = countResult[0]?.count || 0;
            const offset = (page - 1) * limit;
            const totalPages = Math.ceil(total / limit);
            const data = await this.db
                .select()
                .from(schema_1.infLotinput)
                .where(whereClause)
                .orderBy((0, drizzle_orm_1.desc)(schema_1.infLotinput.inputdate), (0, drizzle_orm_1.desc)(schema_1.infLotinput.importedAt))
                .limit(limit)
                .offset(offset);
            const records = data.map(mapDrizzleToRecord);
            console.log(`✅ InfLotInputModel.getAll: Retrieved ${records.length} records`);
            const pagination = {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            };
            return { data: records, pagination };
        }
        catch (error) {
            console.error('❌ Error in InfLotInputModel.getAll:', error);
            throw new Error(`Failed to retrieve inf lot input data: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getByLotNumber(lotNo) {
        try {
            console.log('🔧 InfLotInputModel.getByLotNumber called:', { lotNo });
            const data = await this.db
                .select()
                .from(schema_1.infLotinput)
                .where((0, drizzle_orm_1.eq)(schema_1.infLotinput.lotno, lotNo))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.infLotinput.inputdate), (0, drizzle_orm_1.desc)(schema_1.infLotinput.importedAt));
            const records = data.map(mapDrizzleToRecord);
            console.log(`✅ InfLotInputModel.getByLotNumber: Found ${records.length} records`);
            return records;
        }
        catch (error) {
            console.error('❌ Error in InfLotInputModel.getByLotNumber:', error);
            throw new Error(`Failed to retrieve lot: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getStatistics() {
        try {
            console.log('📊 InfLotInputModel.getStatistics called');
            const result = await this.db
                .select({
                totalRecords: (0, drizzle_orm_1.sql) `count(*)::int`,
                totalToday: (0, drizzle_orm_1.sql) `count(CASE WHEN ${schema_1.infLotinput.inputdate}::date = CURRENT_DATE THEN 1 END)::int`,
                totalMonth: (0, drizzle_orm_1.sql) `count(CASE WHEN date_trunc('month', ${schema_1.infLotinput.inputdate}) = date_trunc('month', CURRENT_DATE) THEN 1 END)::int`,
                totalYear: (0, drizzle_orm_1.sql) `count(CASE WHEN date_trunc('year', ${schema_1.infLotinput.inputdate}) = date_trunc('year', CURRENT_DATE) THEN 1 END)::int`,
                lastSync: (0, drizzle_orm_1.sql) `max(${schema_1.infLotinput.importedAt})`
            })
                .from(schema_1.infLotinput);
            const stats = result[0];
            const records = {
                totalRecords: stats?.totalRecords || 0,
                totalToday: stats?.totalToday || 0,
                totalMonth: stats?.totalMonth || 0,
                totalYear: stats?.totalYear || 0,
                lastSync: stats?.lastSync ? (0, dateTimeUtils_1.formatDateTimeLocal)(stats.lastSync) : undefined
            };
            console.log('✅ InfLotInputModel.getStatistics: Retrieved statistics', records);
            return records;
        }
        catch (error) {
            console.error('❌ Error in InfLotInputModel.getStatistics:', error);
            throw new Error(`Failed to retrieve statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getFilterOptions() {
        try {
            console.log('🔧 InfLotInputModel.getFilterOptions called');
            const [partSites, lineNos, models, versions] = await Promise.all([
                this.db.selectDistinct({ value: schema_1.infLotinput.partsite })
                    .from(schema_1.infLotinput)
                    .where((0, drizzle_orm_1.isNotNull)(schema_1.infLotinput.partsite))
                    .orderBy((0, drizzle_orm_1.asc)(schema_1.infLotinput.partsite)),
                this.db.selectDistinct({ value: schema_1.infLotinput.lineno })
                    .from(schema_1.infLotinput)
                    .where((0, drizzle_orm_1.isNotNull)(schema_1.infLotinput.lineno))
                    .orderBy((0, drizzle_orm_1.asc)(schema_1.infLotinput.lineno)),
                this.db.selectDistinct({ value: schema_1.infLotinput.model })
                    .from(schema_1.infLotinput)
                    .where((0, drizzle_orm_1.isNotNull)(schema_1.infLotinput.model))
                    .orderBy((0, drizzle_orm_1.asc)(schema_1.infLotinput.model)),
                this.db.selectDistinct({ value: schema_1.infLotinput.version })
                    .from(schema_1.infLotinput)
                    .where((0, drizzle_orm_1.isNotNull)(schema_1.infLotinput.version))
                    .orderBy((0, drizzle_orm_1.asc)(schema_1.infLotinput.version))
            ]);
            const options = {
                partSites: partSites.map(r => r.value),
                lineNos: lineNos.map(r => r.value),
                models: models.map(r => r.value),
                versions: versions.map(r => r.value)
            };
            console.log('✅ InfLotInputModel.getFilterOptions: Retrieved options');
            return options;
        }
        catch (error) {
            console.error('❌ Error in InfLotInputModel.getFilterOptions:', error);
            return {
                partSites: [],
                lineNos: [],
                models: [],
                versions: []
            };
        }
    }
}
exports.InfLotInputModel = InfLotInputModel;
function createInfLotInputModel(db) {
    return new InfLotInputModel(db);
}
exports.default = InfLotInputModel;
