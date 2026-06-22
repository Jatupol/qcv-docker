"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefectModel = void 0;
exports.createDefectModel = createDefectModel;
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../../db/schema");
const types_1 = require("./types");
function mapDrizzleToEntity(row) {
    return {
        id: row.id,
        name: row.name,
        description: row.description || '',
        defect_group: row.defectGroup || undefined,
        report_order: row.reportOrder ?? undefined,
        is_active: row.isActive ?? true,
        created_by: row.createdBy ?? 0,
        updated_by: row.updatedBy ?? 0,
        created_at: row.createdAt ?? new Date(),
        updated_at: row.updatedAt ?? new Date(),
    };
}
function mapDrizzleArrayToEntities(rows) {
    return rows.map(mapDrizzleToEntity);
}
class DefectModel {
    constructor(db) {
        this.config = types_1.DEFAULT_DEFECT_CONFIG;
        this.db = db;
    }
    async getAll(options = {}) {
        return this.getPaginated(options);
    }
    async getById(id) {
        const result = await this.db
            .select()
            .from(schema_1.defects)
            .where((0, drizzle_orm_1.eq)(schema_1.defects.id, id))
            .limit(1);
        return result[0] ? mapDrizzleToEntity(result[0]) : null;
    }
    async getPaginated(options = {}) {
        const page = options.page || 1;
        const limit = options.limit || this.config.defaultLimit;
        const offset = (page - 1) * limit;
        const sortBy = options.sortBy || 'id';
        const sortOrder = options.sortOrder || 'desc';
        const conditions = [];
        if (options.isActive !== undefined) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.defects.isActive, options.isActive));
        }
        if (options.search) {
            const searchPattern = `%${options.search}%`;
            conditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(schema_1.defects.name, searchPattern), (0, drizzle_orm_1.ilike)(schema_1.defects.description, searchPattern)));
        }
        if (options.defect_group) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.defects.defectGroup, options.defect_group));
        }
        const whereClause = conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined;
        const countResult = await this.db
            .select({ count: (0, drizzle_orm_1.sql) `count(*)::int` })
            .from(schema_1.defects)
            .where(whereClause);
        const total = countResult[0]?.count || 0;
        const sortColumn = sortBy === 'name' ? schema_1.defects.name :
            sortBy === 'description' ? schema_1.defects.description :
                sortBy === 'created_at' ? schema_1.defects.createdAt :
                    sortBy === 'updated_at' ? schema_1.defects.updatedAt :
                        schema_1.defects.id;
        const orderFn = sortOrder === 'desc' ? drizzle_orm_1.desc : drizzle_orm_1.asc;
        const data = await this.db
            .select()
            .from(schema_1.defects)
            .where(whereClause)
            .orderBy(orderFn(sortColumn))
            .limit(limit)
            .offset(offset);
        return {
            data: mapDrizzleArrayToEntities(data),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    async create(data, userId) {
        const now = new Date();
        const insertData = {
            name: data.name,
            description: data.description || '',
            defectGroup: data.defect_group || null,
            reportOrder: data.report_order ?? null,
            isActive: data.is_active !== undefined ? data.is_active : true,
            createdBy: userId,
            updatedBy: userId,
            createdAt: now,
            updatedAt: now,
        };
        const result = await this.db
            .insert(schema_1.defects)
            .values(insertData)
            .returning();
        console.log('✅ DefectModel.create - Created defect:', result[0]);
        return mapDrizzleToEntity(result[0]);
    }
    async update(id, data, userId) {
        const now = new Date();
        const updateData = {
            updatedBy: userId,
            updatedAt: now,
        };
        if (data.name !== undefined)
            updateData.name = data.name;
        if (data.description !== undefined)
            updateData.description = data.description;
        if (data.is_active !== undefined)
            updateData.isActive = data.is_active;
        if (data.defect_group !== undefined)
            updateData.defectGroup = data.defect_group || null;
        if (data.report_order !== undefined)
            updateData.reportOrder = data.report_order ?? null;
        const result = await this.db
            .update(schema_1.defects)
            .set(updateData)
            .where((0, drizzle_orm_1.eq)(schema_1.defects.id, id))
            .returning();
        if (result.length === 0) {
            throw new Error(`Defect with ID ${id} not found`);
        }
        console.log('✅ DefectModel.update - Updated defect:', result[0]);
        return mapDrizzleToEntity(result[0]);
    }
    async delete(id) {
        const result = await this.db
            .delete(schema_1.defects)
            .where((0, drizzle_orm_1.eq)(schema_1.defects.id, id))
            .returning();
        return result.length > 0;
    }
    async getByDefectGroup(defectGroup, options = {}) {
        console.log('🔧 DefectModel.getByDefectGroup - defect_group filter:', defectGroup);
        const page = options.page || 1;
        const limit = options.limit || 50;
        const offset = (page - 1) * limit;
        const sortBy = options.sortBy || 'id';
        const sortOrder = options.sortOrder || 'desc';
        const conditions = [
            (0, drizzle_orm_1.sql) `LOWER(TRIM(${schema_1.defects.defectGroup})) = LOWER(TRIM(${defectGroup}))`
        ];
        if (options.isActive !== undefined) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.defects.isActive, options.isActive));
        }
        if (options.search) {
            const searchPattern = `%${options.search.toLowerCase()}%`;
            conditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(schema_1.defects.name, searchPattern), (0, drizzle_orm_1.ilike)(schema_1.defects.description, searchPattern)));
        }
        const whereClause = (0, drizzle_orm_1.and)(...conditions);
        const countResult = await this.db
            .select({ count: (0, drizzle_orm_1.sql) `count(*)::int` })
            .from(schema_1.defects)
            .where(whereClause);
        const total = countResult[0]?.count || 0;
        console.log('🔧 DefectModel.getByDefectGroup - Total results found:', total);
        const sortColumn = sortBy === 'name' ? schema_1.defects.name : schema_1.defects.id;
        const orderFn = sortOrder === 'desc' ? drizzle_orm_1.desc : drizzle_orm_1.asc;
        const data = await this.db
            .select()
            .from(schema_1.defects)
            .where(whereClause)
            .orderBy(orderFn(sortColumn))
            .limit(limit)
            .offset(offset);
        console.log('🔧 DefectModel.getByDefectGroup - Rows returned:', data.length);
        return {
            data: mapDrizzleArrayToEntities(data),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    async isDefectNameUnique(name, excludeId) {
        const conditions = [
            (0, drizzle_orm_1.sql) `LOWER(${schema_1.defects.name}) = LOWER(${name.trim()})`
        ];
        if (excludeId) {
            conditions.push((0, drizzle_orm_1.sql) `${schema_1.defects.id} != ${excludeId}`);
        }
        const result = await this.db
            .select({ count: (0, drizzle_orm_1.sql) `count(*)::int` })
            .from(schema_1.defects)
            .where((0, drizzle_orm_1.and)(...conditions));
        return (result[0]?.count || 0) === 0;
    }
    async exists(id) {
        const result = await this.db
            .select({ id: schema_1.defects.id })
            .from(schema_1.defects)
            .where((0, drizzle_orm_1.eq)(schema_1.defects.id, id))
            .limit(1);
        return result.length > 0;
    }
    async count(options) {
        const conditions = options?.isActive !== undefined
            ? (0, drizzle_orm_1.eq)(schema_1.defects.isActive, options.isActive)
            : undefined;
        const result = await this.db
            .select({ count: (0, drizzle_orm_1.sql) `count(*)::int` })
            .from(schema_1.defects)
            .where(conditions);
        return result[0]?.count || 0;
    }
    async changeStatus(id, userId) {
        const defect = await this.getById(id);
        if (!defect)
            return false;
        await this.update(id, { is_active: !defect.is_active }, userId);
        return true;
    }
    async getByName(name, options = {}) {
        const result = await this.getPaginated({ ...options, search: name });
        return {
            ...result,
            searchInfo: {
                query: name,
                searchType: 'name',
                resultCount: result.pagination.total
            }
        };
    }
    async filterStatus(status, options = {}) {
        const result = await this.getPaginated({ ...options, isActive: status });
        return {
            ...result,
            searchInfo: {
                query: String(status),
                searchType: 'status',
                resultCount: result.pagination.total
            }
        };
    }
    async search(pattern, options = {}) {
        const result = await this.getPaginated({ ...options, search: pattern });
        return {
            ...result,
            searchInfo: {
                query: pattern,
                searchType: 'pattern',
                resultCount: result.pagination.total
            }
        };
    }
    async health() {
        const total = await this.count();
        const active = await this.count({ isActive: true });
        return {
            status: 'healthy',
            entity: 'defects',
            timestamp: new Date(),
            checks: {
                database: 'connected',
                records: { total, active, inactive: total - active }
            }
        };
    }
    async statistics() {
        const total = await this.count();
        const active = await this.count({ isActive: true });
        return {
            entity: 'defects',
            timestamp: new Date(),
            totals: {
                all: total,
                active,
                inactive: total - active
            }
        };
    }
}
exports.DefectModel = DefectModel;
function createDefectModel(db) {
    return new DefectModel(db);
}
exports.default = DefectModel;
