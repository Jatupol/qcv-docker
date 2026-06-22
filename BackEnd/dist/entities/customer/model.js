"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerModel = void 0;
exports.createCustomerModel = createCustomerModel;
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../../db/schema");
const types_1 = require("./types");
function mapDrizzleToEntity(row) {
    return {
        code: row.code,
        name: row.name,
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
class CustomerModel {
    constructor(db) {
        this.config = types_1.CustomerEntityConfig;
        this.db = db;
    }
    async findByCode(code) {
        const result = await this.db
            .select()
            .from(schema_1.customers)
            .where((0, drizzle_orm_1.eq)(schema_1.customers.code, code))
            .limit(1);
        return result[0] ? mapDrizzleToEntity(result[0]) : null;
    }
    async getByCode(code) {
        return this.findByCode(code);
    }
    async findAll(options = {}) {
        const page = options.page || 1;
        const limit = options.limit || this.config.defaultLimit;
        const offset = (page - 1) * limit;
        const sortBy = options.sortBy || 'code';
        const sortOrder = options.sortOrder || 'ASC';
        const conditions = [];
        if (options.isActive !== undefined) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.customers.isActive, options.isActive));
        }
        if (options.search) {
            const searchPattern = `%${options.search}%`;
            conditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(schema_1.customers.code, searchPattern), (0, drizzle_orm_1.ilike)(schema_1.customers.name, searchPattern)));
        }
        const whereClause = conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined;
        const countResult = await this.db
            .select({ count: (0, drizzle_orm_1.sql) `count(*)::int` })
            .from(schema_1.customers)
            .where(whereClause);
        const total = countResult[0]?.count || 0;
        const sortColumn = sortBy === 'name' ? schema_1.customers.name :
            sortBy === 'created_at' ? schema_1.customers.createdAt :
                sortBy === 'updated_at' ? schema_1.customers.updatedAt :
                    schema_1.customers.code;
        const orderFn = sortOrder.toUpperCase() === 'DESC' ? drizzle_orm_1.desc : drizzle_orm_1.asc;
        const data = await this.db
            .select()
            .from(schema_1.customers)
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
        const conditions = [(0, drizzle_orm_1.ilike)(schema_1.customers.name, `%${name}%`)];
        if (options.isActive !== undefined) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.customers.isActive, options.isActive));
        }
        const whereClause = (0, drizzle_orm_1.and)(...conditions);
        const countResult = await this.db
            .select({ count: (0, drizzle_orm_1.sql) `count(*)::int` })
            .from(schema_1.customers)
            .where(whereClause);
        const total = countResult[0]?.count || 0;
        const data = await this.db
            .select()
            .from(schema_1.customers)
            .where(whereClause)
            .orderBy((0, drizzle_orm_1.asc)(schema_1.customers.name))
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
            await this.db.select({ count: (0, drizzle_orm_1.sql) `1` }).from(schema_1.customers).limit(1);
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
        const totalResult = await this.db.select({ count: (0, drizzle_orm_1.sql) `count(*)::int` }).from(schema_1.customers);
        const activeResult = await this.db.select({ count: (0, drizzle_orm_1.sql) `count(*)::int` }).from(schema_1.customers).where((0, drizzle_orm_1.eq)(schema_1.customers.isActive, true));
        const inactiveResult = await this.db.select({ count: (0, drizzle_orm_1.sql) `count(*)::int` }).from(schema_1.customers).where((0, drizzle_orm_1.eq)(schema_1.customers.isActive, false));
        return {
            total: totalResult[0]?.count || 0,
            active: activeResult[0]?.count || 0,
            inactive: inactiveResult[0]?.count || 0
        };
    }
    async create(data, userId) {
        const now = new Date();
        const insertData = {
            code: data.code.toUpperCase().trim(),
            name: data.name.trim(),
            isActive: data.is_active !== undefined ? data.is_active : true,
            createdBy: userId,
            updatedBy: userId,
            createdAt: now,
            updatedAt: now,
        };
        const result = await this.db
            .insert(schema_1.customers)
            .values(insertData)
            .returning();
        console.log('✅ CustomerModel.create - Created customer:', result[0].code);
        return mapDrizzleToEntity(result[0]);
    }
    async update(code, data, userId) {
        const now = new Date();
        const updateData = {
            updatedBy: userId,
            updatedAt: now,
        };
        if (data.name !== undefined)
            updateData.name = data.name.trim();
        if (data.is_active !== undefined)
            updateData.isActive = data.is_active;
        const result = await this.db
            .update(schema_1.customers)
            .set(updateData)
            .where((0, drizzle_orm_1.eq)(schema_1.customers.code, code))
            .returning();
        if (result.length === 0) {
            throw new Error(`Customer with code ${code} not found`);
        }
        console.log('✅ CustomerModel.update - Updated customer:', result[0].code);
        return mapDrizzleToEntity(result[0]);
    }
    async delete(code) {
        const result = await this.db
            .delete(schema_1.customers)
            .where((0, drizzle_orm_1.eq)(schema_1.customers.code, code))
            .returning();
        return result.length > 0;
    }
    async changeStatus(code, userId) {
        const customer = await this.findByCode(code);
        if (!customer) {
            throw new Error(`Customer with code ${code} not found`);
        }
        const result = await this.db
            .update(schema_1.customers)
            .set({
            isActive: !customer.is_active,
            updatedBy: userId,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.customers.code, code))
            .returning();
        return result.length > 0;
    }
    async isCodeAvailable(code) {
        if (!this.isValidCustomerCode(code)) {
            return false;
        }
        const exists = await this.exists(code);
        return !exists;
    }
    async findSimilarCodes(code) {
        const result = await this.db
            .select({ code: schema_1.customers.code })
            .from(schema_1.customers)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.ilike)(schema_1.customers.code, `%${code}%`), (0, drizzle_orm_1.sql) `${schema_1.customers.code} != ${code}`))
            .orderBy((0, drizzle_orm_1.asc)(schema_1.customers.code))
            .limit(5);
        return result.map(row => row.code);
    }
    async findByCodePrefix(codePrefix, limit = 10) {
        const result = await this.db
            .select({ code: schema_1.customers.code, name: schema_1.customers.name })
            .from(schema_1.customers)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.ilike)(schema_1.customers.code, `${codePrefix}%`), (0, drizzle_orm_1.eq)(schema_1.customers.isActive, true)))
            .orderBy((0, drizzle_orm_1.asc)(schema_1.customers.code))
            .limit(limit);
        return result;
    }
    async exists(code) {
        const result = await this.db
            .select({ code: schema_1.customers.code })
            .from(schema_1.customers)
            .where((0, drizzle_orm_1.eq)(schema_1.customers.code, code))
            .limit(1);
        return result.length > 0;
    }
    async count(options) {
        const conditions = [];
        if (options?.isActive !== undefined) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.customers.isActive, options.isActive));
        }
        const whereClause = conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined;
        const result = await this.db
            .select({ count: (0, drizzle_orm_1.sql) `count(*)::int` })
            .from(schema_1.customers)
            .where(whereClause);
        return result[0]?.count || 0;
    }
    isValidCustomerCode(code) {
        if (!code || typeof code !== 'string') {
            return false;
        }
        const trimmedCode = code.trim();
        if (trimmedCode.length < types_1.CustomerConstants.CODE_MIN_LENGTH ||
            trimmedCode.length > types_1.CustomerConstants.CODE_MAX_LENGTH) {
            return false;
        }
        return types_1.CustomerConstants.CODE_PATTERN.test(trimmedCode);
    }
}
exports.CustomerModel = CustomerModel;
function createCustomerModel(db) {
    return new CustomerModel(db);
}
exports.default = CustomerModel;
