"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DrizzleSerialIdHelper = void 0;
const drizzle_orm_1 = require("drizzle-orm");
class DrizzleSerialIdHelper {
    constructor(db, table, idColumn) {
        this.db = db;
        this.table = table;
        this.idColumn = idColumn;
    }
    async findAll() {
        const result = await this.db.select().from(this.table);
        return result;
    }
    async findById(id) {
        const result = await this.db
            .select()
            .from(this.table)
            .where((0, drizzle_orm_1.eq)(this.idColumn, id))
            .limit(1);
        return result[0] || null;
    }
    async create(data) {
        const result = await this.db
            .insert(this.table)
            .values(data)
            .returning();
        return result[0];
    }
    async update(id, data) {
        const result = await this.db
            .update(this.table)
            .set(data)
            .where((0, drizzle_orm_1.eq)(this.idColumn, id))
            .returning();
        return result[0] || null;
    }
    async delete(id) {
        const result = await this.db
            .delete(this.table)
            .where((0, drizzle_orm_1.eq)(this.idColumn, id))
            .returning();
        return result.length > 0;
    }
    async findPaginated(options = {}) {
        const { page = 1, pageSize = 10, sortBy, sortOrder = 'asc', search, searchFields = [], filters = {}, } = options;
        const offset = (page - 1) * pageSize;
        const conditions = [];
        if (search && searchFields.length > 0) {
            const searchConditions = searchFields.map((field) => {
                const column = this.table[field];
                if (column) {
                    return (0, drizzle_orm_1.like)(column, `%${search}%`);
                }
                return null;
            }).filter((c) => c !== null);
            if (searchConditions.length > 0) {
                conditions.push((0, drizzle_orm_1.or)(...searchConditions));
            }
        }
        for (const [key, value] of Object.entries(filters)) {
            if (value !== undefined && value !== null && value !== '') {
                const column = this.table[key];
                if (column) {
                    conditions.push((0, drizzle_orm_1.eq)(column, value));
                }
            }
        }
        const whereClause = conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined;
        const countResult = await this.db
            .select({ count: (0, drizzle_orm_1.sql) `count(*)::int` })
            .from(this.table)
            .where(whereClause);
        const totalItems = countResult[0]?.count || 0;
        let query = this.db
            .select()
            .from(this.table)
            .where(whereClause)
            .limit(pageSize)
            .offset(offset);
        if (sortBy) {
            const sortColumn = this.table[sortBy];
            if (sortColumn) {
                query = query.orderBy(sortOrder === 'desc' ? (0, drizzle_orm_1.desc)(sortColumn) : (0, drizzle_orm_1.asc)(sortColumn));
            }
        }
        const data = await query;
        return {
            data: data,
            pagination: {
                page,
                pageSize,
                totalItems,
                totalPages: Math.ceil(totalItems / pageSize),
            },
        };
    }
    async exists(id) {
        const result = await this.db
            .select({ id: this.idColumn })
            .from(this.table)
            .where((0, drizzle_orm_1.eq)(this.idColumn, id))
            .limit(1);
        return result.length > 0;
    }
    async count(filters) {
        const conditions = [];
        if (filters) {
            for (const [key, value] of Object.entries(filters)) {
                if (value !== undefined && value !== null && value !== '') {
                    const column = this.table[key];
                    if (column) {
                        conditions.push((0, drizzle_orm_1.eq)(column, value));
                    }
                }
            }
        }
        const whereClause = conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined;
        const result = await this.db
            .select({ count: (0, drizzle_orm_1.sql) `count(*)::int` })
            .from(this.table)
            .where(whereClause);
        return result[0]?.count || 0;
    }
}
exports.DrizzleSerialIdHelper = DrizzleSerialIdHelper;
