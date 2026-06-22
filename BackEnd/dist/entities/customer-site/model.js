"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerSiteModel = void 0;
exports.createCustomerSiteModel = createCustomerSiteModel;
const drizzle_orm_1 = require("drizzle-orm");
const auditLogger_1 = require("../../utils/auditLogger");
const schema_1 = require("../../db/schema");
const types_1 = require("./types");
function mapDrizzleToEntity(row) {
    return {
        code: row.code,
        customers: row.customers || '',
        site: row.site || '',
        is_active: row.isActive ?? true,
        created_by: row.createdBy ?? 0,
        updated_by: row.updatedBy ?? 0,
        created_at: row.createdAt ?? new Date(),
        updated_at: row.updatedAt ?? new Date(),
        customer_name: row.customerName || undefined,
    };
}
function mapDrizzleArrayToEntities(rows) {
    return rows.map(mapDrizzleToEntity);
}
class CustomerSiteModel {
    constructor(db) {
        this.config = types_1.CUSTOMER_SITE_ENTITY_CONFIG;
        this.db = db;
    }
    async getByKey(keyValues) {
        const { code } = keyValues;
        if (!code) {
            throw new Error('Code is required');
        }
        const result = await this.db
            .select({
            code: schema_1.customersSite.code,
            customers: schema_1.customersSite.customers,
            site: schema_1.customersSite.site,
            isActive: schema_1.customersSite.isActive,
            createdBy: schema_1.customersSite.createdBy,
            updatedBy: schema_1.customersSite.updatedBy,
            createdAt: schema_1.customersSite.createdAt,
            updatedAt: schema_1.customersSite.updatedAt,
            customerName: schema_1.customers.name,
        })
            .from(schema_1.customersSite)
            .leftJoin(schema_1.customers, (0, drizzle_orm_1.eq)(schema_1.customersSite.customers, schema_1.customers.code))
            .where((0, drizzle_orm_1.eq)(schema_1.customersSite.code, code))
            .limit(1);
        return result[0] ? mapDrizzleToEntity(result[0]) : null;
    }
    async getAll() {
        const result = await this.db
            .select({
            code: schema_1.customersSite.code,
            customers: schema_1.customersSite.customers,
            site: schema_1.customersSite.site,
            isActive: schema_1.customersSite.isActive,
            createdBy: schema_1.customersSite.createdBy,
            updatedBy: schema_1.customersSite.updatedBy,
            createdAt: schema_1.customersSite.createdAt,
            updatedAt: schema_1.customersSite.updatedAt,
            customerName: schema_1.customers.name,
        })
            .from(schema_1.customersSite)
            .leftJoin(schema_1.customers, (0, drizzle_orm_1.eq)(schema_1.customersSite.customers, schema_1.customers.code))
            .orderBy((0, drizzle_orm_1.asc)(schema_1.customersSite.site));
        return mapDrizzleArrayToEntities(result);
    }
    async findAll(options = {}) {
        const page = options.page || 1;
        const limit = options.limit || this.config.defaultLimit;
        const offset = (page - 1) * limit;
        const sortBy = options.sortBy || 'code';
        const sortOrder = options.sortOrder || 'ASC';
        const conditions = [];
        if (options.isActive !== undefined) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.customersSite.isActive, options.isActive));
        }
        if (options.customerCode) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.customersSite.customers, options.customerCode));
        }
        if (options.siteCode) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.customersSite.site, options.siteCode));
        }
        if (options.search) {
            const searchPattern = `%${options.search}%`;
            conditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(schema_1.customersSite.code, searchPattern), (0, drizzle_orm_1.ilike)(schema_1.customersSite.customers, searchPattern), (0, drizzle_orm_1.ilike)(schema_1.customersSite.site, searchPattern)));
        }
        const whereClause = conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined;
        const countResult = await this.db
            .select({ count: (0, drizzle_orm_1.sql) `count(*)::int` })
            .from(schema_1.customersSite)
            .where(whereClause);
        const total = countResult[0]?.count || 0;
        const sortColumn = sortBy === 'customers' ? schema_1.customersSite.customers :
            sortBy === 'site' ? schema_1.customersSite.site :
                sortBy === 'created_at' ? schema_1.customersSite.createdAt :
                    schema_1.customersSite.code;
        const orderFn = sortOrder.toUpperCase() === 'DESC' ? drizzle_orm_1.desc : drizzle_orm_1.asc;
        const data = await this.db
            .select({
            code: schema_1.customersSite.code,
            customers: schema_1.customersSite.customers,
            site: schema_1.customersSite.site,
            isActive: schema_1.customersSite.isActive,
            createdBy: schema_1.customersSite.createdBy,
            updatedBy: schema_1.customersSite.updatedBy,
            createdAt: schema_1.customersSite.createdAt,
            updatedAt: schema_1.customersSite.updatedAt,
            customerName: schema_1.customers.name,
        })
            .from(schema_1.customersSite)
            .leftJoin(schema_1.customers, (0, drizzle_orm_1.eq)(schema_1.customersSite.customers, schema_1.customers.code))
            .where(whereClause)
            .orderBy(orderFn(sortColumn))
            .limit(limit)
            .offset(offset);
        const totalPages = Math.ceil(total / limit);
        return {
            data: mapDrizzleArrayToEntities(data),
            pagination: {
                currentPage: page,
                totalPages,
                totalCount: total,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            }
        };
    }
    async create(data) {
        try {
            const now = new Date();
            const insertData = {
                code: data.code,
                customers: data.customers,
                site: data.site,
                isActive: data.is_active !== undefined ? data.is_active : true,
                createdBy: data.created_by || 0,
                updatedBy: data.updated_by || 0,
                createdAt: data.created_at || now,
                updatedAt: data.updated_at || now,
            };
            const result = await this.db
                .insert(schema_1.customersSite)
                .values(insertData)
                .returning();
            if (result.length > 0) {
                console.log('✅ CustomerSiteModel.create - Created customer-site:', result[0].code);
                return {
                    success: true,
                    data: mapDrizzleToEntity(result[0])
                };
            }
            return {
                success: false,
                error: 'Failed to create customer-site relationship'
            };
        }
        catch (error) {
            console.error('❌ Error creating customer-site relationship:', error);
            if (error.code === '23505') {
                return {
                    success: false,
                    error: 'Customer-site code already exists'
                };
            }
            else if (error.code === '23503') {
                return {
                    success: false,
                    error: 'Invalid customer or site reference'
                };
            }
            return {
                success: false,
                error: error.message || 'Database error occurred'
            };
        }
    }
    async update(keyValues, data) {
        try {
            const { code } = keyValues;
            if (!code) {
                return {
                    success: false,
                    error: 'Code is required for update'
                };
            }
            const now = new Date();
            const updateData = {
                updatedAt: data.updated_at || now,
            };
            if (data.customers !== undefined)
                updateData.customers = data.customers;
            if (data.site !== undefined)
                updateData.site = data.site;
            if (data.is_active !== undefined)
                updateData.isActive = data.is_active;
            if (data.updated_by !== undefined)
                updateData.updatedBy = data.updated_by;
            const result = await this.db
                .update(schema_1.customersSite)
                .set(updateData)
                .where((0, drizzle_orm_1.eq)(schema_1.customersSite.code, code))
                .returning();
            if (result.length > 0) {
                console.log('✅ CustomerSiteModel.update - Updated customer-site:', result[0].code);
                return {
                    success: true,
                    data: mapDrizzleToEntity(result[0])
                };
            }
            return {
                success: false,
                error: 'Customer-site relationship not found'
            };
        }
        catch (error) {
            console.error('❌ Error updating customer-site relationship:', error);
            if (error.code === '23503') {
                return {
                    success: false,
                    error: 'Invalid customer or site reference'
                };
            }
            return {
                success: false,
                error: error.message || 'Database error occurred'
            };
        }
    }
    async delete(keyValues, actor = null, req) {
        try {
            const { code } = keyValues;
            if (!code) {
                return {
                    success: false,
                    error: 'Code is required for deletion'
                };
            }
            return await this.db.transaction(async (tx) => {
                const [deleted] = await tx
                    .delete(schema_1.customersSite)
                    .where((0, drizzle_orm_1.eq)(schema_1.customersSite.code, code))
                    .returning();
                if (!deleted) {
                    return {
                        success: false,
                        error: 'Customer-site relationship not found'
                    };
                }
                await (0, auditLogger_1.logDelete)(this.db, {
                    entity: 'customers_site',
                    recordId: deleted.code,
                    oldValues: deleted,
                    actor,
                    req,
                    tx,
                });
                console.log('✅ CustomerSiteModel.delete - Deleted customer-site:', code);
                return { success: true };
            });
        }
        catch (error) {
            console.error('❌ Error deleting customer-site relationship:', error);
            if (error.code === '23503') {
                return {
                    success: false,
                    error: 'Cannot delete customer-site relationship: it is referenced by other records'
                };
            }
            return {
                success: false,
                error: error.message || 'Database error occurred'
            };
        }
    }
    async exists(keyValues) {
        const { code } = keyValues;
        if (!code) {
            return false;
        }
        const result = await this.db
            .select({ code: schema_1.customersSite.code })
            .from(schema_1.customersSite)
            .where((0, drizzle_orm_1.eq)(schema_1.customersSite.code, code))
            .limit(1);
        return result.length > 0;
    }
    async getByCustomer(customerCode) {
        const result = await this.db
            .select({
            code: schema_1.customersSite.code,
            customers: schema_1.customersSite.customers,
            site: schema_1.customersSite.site,
            isActive: schema_1.customersSite.isActive,
            createdBy: schema_1.customersSite.createdBy,
            updatedBy: schema_1.customersSite.updatedBy,
            createdAt: schema_1.customersSite.createdAt,
            updatedAt: schema_1.customersSite.updatedAt,
            customerName: schema_1.customers.name,
        })
            .from(schema_1.customersSite)
            .leftJoin(schema_1.customers, (0, drizzle_orm_1.eq)(schema_1.customersSite.customers, schema_1.customers.code))
            .where((0, drizzle_orm_1.eq)(schema_1.customersSite.customers, customerCode))
            .orderBy((0, drizzle_orm_1.asc)(schema_1.customersSite.site));
        return mapDrizzleArrayToEntities(result);
    }
    async getBySite(siteCode) {
        const result = await this.db
            .select({
            code: schema_1.customersSite.code,
            customers: schema_1.customersSite.customers,
            site: schema_1.customersSite.site,
            isActive: schema_1.customersSite.isActive,
            createdBy: schema_1.customersSite.createdBy,
            updatedBy: schema_1.customersSite.updatedBy,
            createdAt: schema_1.customersSite.createdAt,
            updatedAt: schema_1.customersSite.updatedAt,
            customerName: schema_1.customers.name,
        })
            .from(schema_1.customersSite)
            .leftJoin(schema_1.customers, (0, drizzle_orm_1.eq)(schema_1.customersSite.customers, schema_1.customers.code))
            .where((0, drizzle_orm_1.eq)(schema_1.customersSite.site, siteCode))
            .orderBy((0, drizzle_orm_1.asc)(schema_1.customersSite.customers));
        return mapDrizzleArrayToEntities(result);
    }
    async count(options) {
        const conditions = [];
        if (options?.isActive !== undefined) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.customersSite.isActive, options.isActive));
        }
        if (options?.customerCode) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.customersSite.customers, options.customerCode));
        }
        if (options?.siteCode) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.customersSite.site, options.siteCode));
        }
        const whereClause = conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined;
        const result = await this.db
            .select({ count: (0, drizzle_orm_1.sql) `count(*)::int` })
            .from(schema_1.customersSite)
            .where(whereClause);
        return result[0]?.count || 0;
    }
}
exports.CustomerSiteModel = CustomerSiteModel;
function createCustomerSiteModel(db) {
    return new CustomerSiteModel(db);
}
exports.default = CustomerSiteModel;
