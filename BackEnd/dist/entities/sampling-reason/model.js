"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SamplingReasonModel = void 0;
exports.createSamplingReasonModel = createSamplingReasonModel;
const drizzle_orm_1 = require("drizzle-orm");
const auditLogger_1 = require("../../utils/auditLogger");
const schema_1 = require("../../db/schema");
const types_1 = require("./types");
function mapDrizzleToEntity(row) {
    return {
        id: row.id,
        name: row.name,
        description: row.description || '',
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
class SamplingReasonModel {
    constructor(db) {
        this.config = types_1.DEFAULT_SAMPLING_REASON_CONFIG;
        this.db = db;
    }
    async findById(id) {
        const result = await this.db
            .select()
            .from(schema_1.samplingReasons)
            .where((0, drizzle_orm_1.eq)(schema_1.samplingReasons.id, id))
            .limit(1);
        return result[0] ? mapDrizzleToEntity(result[0]) : null;
    }
    async getById(id) {
        return this.findById(id);
    }
    async findAll(options = {}) {
        const page = options.page || 1;
        const limit = options.limit || this.config.defaultLimit;
        const offset = (page - 1) * limit;
        const sortBy = options.sortBy || 'name';
        const sortOrder = options.sortOrder || 'ASC';
        const conditions = [];
        if (options.isActive !== undefined) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.samplingReasons.isActive, options.isActive));
        }
        if (options.search) {
            const searchPattern = `%${options.search}%`;
            conditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(schema_1.samplingReasons.name, searchPattern), (0, drizzle_orm_1.ilike)(schema_1.samplingReasons.description, searchPattern)));
        }
        if (options.hasDescription !== undefined) {
            if (options.hasDescription) {
                conditions.push((0, drizzle_orm_1.sql) `${schema_1.samplingReasons.description} IS NOT NULL AND ${schema_1.samplingReasons.description} != ''`);
            }
            else {
                conditions.push((0, drizzle_orm_1.sql) `(${schema_1.samplingReasons.description} IS NULL OR ${schema_1.samplingReasons.description} = '')`);
            }
        }
        if (options.nameContains) {
            conditions.push((0, drizzle_orm_1.ilike)(schema_1.samplingReasons.name, `%${options.nameContains}%`));
        }
        if (options.descriptionContains) {
            conditions.push((0, drizzle_orm_1.ilike)(schema_1.samplingReasons.description, `%${options.descriptionContains}%`));
        }
        const whereClause = conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined;
        const countResult = await this.db
            .select({ count: (0, drizzle_orm_1.sql) `count(*)::int` })
            .from(schema_1.samplingReasons)
            .where(whereClause);
        const total = countResult[0]?.count || 0;
        const sortColumn = sortBy === 'name' ? schema_1.samplingReasons.name :
            sortBy === 'description' ? schema_1.samplingReasons.description :
                sortBy === 'created_at' ? schema_1.samplingReasons.createdAt :
                    sortBy === 'updated_at' ? schema_1.samplingReasons.updatedAt :
                        schema_1.samplingReasons.id;
        const orderFn = sortOrder.toUpperCase() === 'DESC' ? drizzle_orm_1.desc : drizzle_orm_1.asc;
        const data = await this.db
            .select()
            .from(schema_1.samplingReasons)
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
    async getAll(options = {}) {
        return this.findAll(options);
    }
    async getByName(name, options = {}) {
        const page = options.page || 1;
        const limit = options.limit || this.config.defaultLimit;
        const offset = (page - 1) * limit;
        const conditions = [(0, drizzle_orm_1.ilike)(schema_1.samplingReasons.name, `%${name}%`)];
        if (options.isActive !== undefined) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.samplingReasons.isActive, options.isActive));
        }
        const whereClause = (0, drizzle_orm_1.and)(...conditions);
        const countResult = await this.db
            .select({ count: (0, drizzle_orm_1.sql) `count(*)::int` })
            .from(schema_1.samplingReasons)
            .where(whereClause);
        const total = countResult[0]?.count || 0;
        const data = await this.db
            .select()
            .from(schema_1.samplingReasons)
            .where(whereClause)
            .orderBy((0, drizzle_orm_1.asc)(schema_1.samplingReasons.name))
            .limit(limit)
            .offset(offset);
        return {
            data: mapDrizzleArrayToEntities(data),
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        };
    }
    async filterStatus(status, options = {}) {
        return this.findAll({ ...options, isActive: status });
    }
    async search(pattern, options = {}) {
        return this.findAll({ ...options, search: pattern });
    }
    async health() {
        try {
            await this.db.select({ count: (0, drizzle_orm_1.sql) `1` }).from(schema_1.samplingReasons).limit(1);
            return {
                status: 'healthy',
                entityName: this.config.entityName,
                timestamp: new Date()
            };
        }
        catch {
            return {
                status: 'unhealthy',
                entityName: this.config.entityName,
                timestamp: new Date()
            };
        }
    }
    async statistics() {
        const totalResult = await this.db.select({ count: (0, drizzle_orm_1.sql) `count(*)::int` }).from(schema_1.samplingReasons);
        const activeResult = await this.db.select({ count: (0, drizzle_orm_1.sql) `count(*)::int` }).from(schema_1.samplingReasons).where((0, drizzle_orm_1.eq)(schema_1.samplingReasons.isActive, true));
        const inactiveResult = await this.db.select({ count: (0, drizzle_orm_1.sql) `count(*)::int` }).from(schema_1.samplingReasons).where((0, drizzle_orm_1.eq)(schema_1.samplingReasons.isActive, false));
        return {
            total: totalResult[0]?.count || 0,
            active: activeResult[0]?.count || 0,
            inactive: inactiveResult[0]?.count || 0
        };
    }
    async create(data, userId) {
        const now = new Date();
        const insertData = {
            name: data.name.trim(),
            description: data.description || null,
            isActive: data.is_active !== undefined ? data.is_active : true,
            createdBy: userId,
            updatedBy: userId,
            createdAt: now,
            updatedAt: now,
        };
        const result = await this.db
            .insert(schema_1.samplingReasons)
            .values(insertData)
            .returning();
        console.log('✅ SamplingReasonModel.create - Created sampling reason:', result[0].id);
        return mapDrizzleToEntity(result[0]);
    }
    async update(id, data, userId) {
        const now = new Date();
        const updateData = {
            updatedBy: userId,
            updatedAt: now,
        };
        if (data.name !== undefined)
            updateData.name = data.name.trim();
        if (data.description !== undefined)
            updateData.description = data.description || null;
        if (data.is_active !== undefined)
            updateData.isActive = data.is_active;
        const result = await this.db
            .update(schema_1.samplingReasons)
            .set(updateData)
            .where((0, drizzle_orm_1.eq)(schema_1.samplingReasons.id, id))
            .returning();
        if (result.length === 0) {
            throw new Error(`Sampling reason with ID ${id} not found`);
        }
        console.log('✅ SamplingReasonModel.update - Updated sampling reason:', result[0].id);
        return mapDrizzleToEntity(result[0]);
    }
    async delete(id, actor = null, req) {
        return await this.db.transaction(async (tx) => {
            const [deleted] = await tx
                .delete(schema_1.samplingReasons)
                .where((0, drizzle_orm_1.eq)(schema_1.samplingReasons.id, id))
                .returning();
            if (!deleted)
                return false;
            await (0, auditLogger_1.logDelete)(this.db, {
                entity: 'sampling_reasons',
                recordId: deleted.id,
                oldValues: deleted,
                actor,
                req,
                tx,
            });
            return true;
        });
    }
    async changeStatus(id, userId) {
        const reason = await this.findById(id);
        if (!reason) {
            throw new Error(`Sampling reason with ID ${id} not found`);
        }
        const result = await this.db
            .update(schema_1.samplingReasons)
            .set({
            isActive: !reason.is_active,
            updatedBy: userId,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.samplingReasons.id, id))
            .returning();
        return result.length > 0;
    }
    async isNameUnique(name, excludeId) {
        const conditions = [
            (0, drizzle_orm_1.sql) `LOWER(${schema_1.samplingReasons.name}) = LOWER(${name.trim()})`
        ];
        if (excludeId) {
            conditions.push((0, drizzle_orm_1.sql) `${schema_1.samplingReasons.id} != ${excludeId}`);
        }
        const result = await this.db
            .select({ count: (0, drizzle_orm_1.sql) `count(*)::int` })
            .from(schema_1.samplingReasons)
            .where((0, drizzle_orm_1.and)(...conditions));
        return (result[0]?.count || 0) === 0;
    }
    async exists(id) {
        const result = await this.db
            .select({ id: schema_1.samplingReasons.id })
            .from(schema_1.samplingReasons)
            .where((0, drizzle_orm_1.eq)(schema_1.samplingReasons.id, id))
            .limit(1);
        return result.length > 0;
    }
    async count(options) {
        const conditions = [];
        if (options?.isActive !== undefined) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.samplingReasons.isActive, options.isActive));
        }
        const whereClause = conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined;
        const result = await this.db
            .select({ count: (0, drizzle_orm_1.sql) `count(*)::int` })
            .from(schema_1.samplingReasons)
            .where(whereClause);
        return result[0]?.count || 0;
    }
    async findActiveForSelection() {
        const result = await this.db
            .select({ id: schema_1.samplingReasons.id, name: schema_1.samplingReasons.name })
            .from(schema_1.samplingReasons)
            .where((0, drizzle_orm_1.eq)(schema_1.samplingReasons.isActive, true))
            .orderBy((0, drizzle_orm_1.asc)(schema_1.samplingReasons.name));
        return result;
    }
}
exports.SamplingReasonModel = SamplingReasonModel;
function createSamplingReasonModel(db) {
    return new SamplingReasonModel(db);
}
exports.default = SamplingReasonModel;
