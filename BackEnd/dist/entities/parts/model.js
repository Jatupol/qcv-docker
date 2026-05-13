"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartsModel = void 0;
exports.createPartsModel = createPartsModel;
const drizzle_orm_1 = require("drizzle-orm");
const auditLogger_1 = require("../../utils/auditLogger");
const schema_1 = require("../../db/schema");
const types_1 = require("./types");
function mapDrizzleToEntity(row, searchTerm) {
    const entity = {
        partno: row.partno,
        partno_customer: row.partnoCustomer ?? undefined,
        product_families: row.productFamilies ?? '',
        versions: row.versions ?? '',
        customers_site: row.customersSite ?? '',
        tab: row.tab ?? '',
        product_type: row.productType ?? '',
        customer_driver: row.customerDriver || '',
        lar_achieve_threshold: row.larAchieveThreshold ? parseFloat(row.larAchieveThreshold) : undefined,
        lar_accept_min_threshold: row.larAcceptMinThreshold ? parseFloat(row.larAcceptMinThreshold) : undefined,
        lar_accept_max_threshold: row.larAcceptMaxThreshold ? parseFloat(row.larAcceptMaxThreshold) : undefined,
        lar_abnormal_threshold: row.larAbnormalThreshold ? parseFloat(row.larAbnormalThreshold) : undefined,
        dppm_achieve_threshold: row.dppmAchieveThreshold ? parseFloat(row.dppmAchieveThreshold) : undefined,
        dppm_accept_min_threshold: row.dppmAcceptMinThreshold ? parseFloat(row.dppmAcceptMinThreshold) : undefined,
        dppm_accept_max_threshold: row.dppmAcceptMaxThreshold ? parseFloat(row.dppmAcceptMaxThreshold) : undefined,
        dppm_abnormal_threshold: row.dppmAbnormalThreshold ? parseFloat(row.dppmAbnormalThreshold) : undefined,
        underkill_achieve_threshold: row.underkillAchieveThreshold ? parseFloat(row.underkillAchieveThreshold) : undefined,
        underkill_accept_min_threshold: row.underkillAcceptMinThreshold ? parseFloat(row.underkillAcceptMinThreshold) : undefined,
        underkill_accept_max_threshold: row.underkillAcceptMaxThreshold ? parseFloat(row.underkillAcceptMaxThreshold) : undefined,
        underkill_abnormal_threshold: row.underkillAbnormalThreshold ? parseFloat(row.underkillAbnormalThreshold) : undefined,
        is_active: row.isActive ?? true,
        created_by: row.createdBy ?? 0,
        updated_by: row.updatedBy ?? 0,
        created_at: row.createdAt,
        updated_at: row.updatedAt,
        customer_site_code: row.customerSiteCode || undefined,
        customer_name: row.customerName || undefined,
    };
    return entity;
}
class PartsModel {
    constructor(db) {
        this.config = types_1.PARTS_ENTITY_CONFIG;
        this.db = db;
    }
    formatLocalDateTime(date) {
        if (!date) {
            const now = new Date();
            return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        }
        if (typeof date === 'string') {
            if (date.includes('T')) {
                const d = new Date(date);
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
            }
            return date;
        }
        const d = date;
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
    }
    async getByKey(keyValues) {
        try {
            const { partno } = keyValues;
            if (!partno) {
                throw new Error('Part number is required');
            }
            const result = await this.db
                .select()
                .from(schema_1.parts)
                .where((0, drizzle_orm_1.eq)(schema_1.parts.partno, partno))
                .limit(1);
            return result[0] ? mapDrizzleToEntity(result[0]) : null;
        }
        catch (error) {
            console.error('Parts getByKey error:', error);
            throw new Error(`Failed to find part: ${error.message}`);
        }
    }
    async getAll(searchTerm, page, limit) {
        try {
            console.log('🔧 Parts query with pagination:', { page, limit, searchTerm });
            const conditions = [];
            if (searchTerm?.trim()) {
                const searchPattern = `%${searchTerm}%`;
                conditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(schema_1.parts.partno, searchPattern), (0, drizzle_orm_1.ilike)(schema_1.parts.productFamilies, searchPattern), (0, drizzle_orm_1.ilike)(schema_1.parts.versions, searchPattern), (0, drizzle_orm_1.ilike)(schema_1.parts.customersSite, searchPattern), (0, drizzle_orm_1.ilike)(schema_1.parts.tab, searchPattern), (0, drizzle_orm_1.ilike)(schema_1.parts.productType, searchPattern), (0, drizzle_orm_1.ilike)(schema_1.parts.customerDriver, searchPattern)));
            }
            const whereClause = conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined;
            let query = this.db
                .select({
                partno: schema_1.parts.partno,
                partnoCustomer: schema_1.parts.partnoCustomer,
                productFamilies: schema_1.parts.productFamilies,
                versions: schema_1.parts.versions,
                customersSite: schema_1.parts.customersSite,
                tab: schema_1.parts.tab,
                productType: schema_1.parts.productType,
                customerDriver: schema_1.parts.customerDriver,
                larAchieveThreshold: schema_1.parts.larAchieveThreshold,
                larAcceptMinThreshold: schema_1.parts.larAcceptMinThreshold,
                larAcceptMaxThreshold: schema_1.parts.larAcceptMaxThreshold,
                larAbnormalThreshold: schema_1.parts.larAbnormalThreshold,
                dppmAchieveThreshold: schema_1.parts.dppmAchieveThreshold,
                dppmAcceptMinThreshold: schema_1.parts.dppmAcceptMinThreshold,
                dppmAcceptMaxThreshold: schema_1.parts.dppmAcceptMaxThreshold,
                dppmAbnormalThreshold: schema_1.parts.dppmAbnormalThreshold,
                underkillAchieveThreshold: schema_1.parts.underkillAchieveThreshold,
                underkillAcceptMinThreshold: schema_1.parts.underkillAcceptMinThreshold,
                underkillAcceptMaxThreshold: schema_1.parts.underkillAcceptMaxThreshold,
                underkillAbnormalThreshold: schema_1.parts.underkillAbnormalThreshold,
                isActive: schema_1.parts.isActive,
                createdBy: schema_1.parts.createdBy,
                updatedBy: schema_1.parts.updatedBy,
                createdAt: schema_1.parts.createdAt,
                updatedAt: schema_1.parts.updatedAt,
                customerSiteCode: schema_1.customersSite.code,
                customerName: schema_1.customers.name,
            })
                .from(schema_1.parts)
                .leftJoin(schema_1.customersSite, (0, drizzle_orm_1.eq)(schema_1.parts.customersSite, schema_1.customersSite.code))
                .leftJoin(schema_1.customers, (0, drizzle_orm_1.eq)(schema_1.customersSite.customers, schema_1.customers.code))
                .where(whereClause)
                .orderBy((0, drizzle_orm_1.asc)(schema_1.parts.partno));
            if (limit && limit > 0) {
                query = query.limit(limit);
                if (page && page > 0) {
                    const offset = (page - 1) * limit;
                    query = query.offset(offset);
                }
            }
            const result = await query;
            return result.map(row => mapDrizzleToEntity(row, searchTerm));
        }
        catch (error) {
            console.error('Parts getAll error:', error);
            throw new Error(`Failed to get parts: ${error.message}`);
        }
    }
    async getCount(searchTerm) {
        try {
            const conditions = [];
            if (searchTerm?.trim()) {
                const searchPattern = `%${searchTerm}%`;
                conditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(schema_1.parts.partno, searchPattern), (0, drizzle_orm_1.ilike)(schema_1.parts.productFamilies, searchPattern), (0, drizzle_orm_1.ilike)(schema_1.parts.versions, searchPattern), (0, drizzle_orm_1.ilike)(schema_1.parts.customersSite, searchPattern), (0, drizzle_orm_1.ilike)(schema_1.parts.tab, searchPattern), (0, drizzle_orm_1.ilike)(schema_1.parts.productType, searchPattern), (0, drizzle_orm_1.ilike)(schema_1.parts.customerDriver, searchPattern)));
            }
            const whereClause = conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined;
            const result = await this.db
                .select({ count: (0, drizzle_orm_1.sql) `count(*)::int` })
                .from(schema_1.parts)
                .where(whereClause);
            return result[0]?.count || 0;
        }
        catch (error) {
            console.error('Parts getCount error:', error);
            return 0;
        }
    }
    async create(data, userId) {
        try {
            const nowStr = this.formatLocalDateTime(new Date());
            console.log('🔧 Executing parts create query:', { partno: data.partno });
            const result = await this.db.execute((0, drizzle_orm_1.sql) `
        INSERT INTO parts (
          partno, partno_customer, product_families, versions, customers_site,
          tab, product_type, customer_driver,
          lar_achieve_threshold, lar_accept_min_threshold, lar_accept_max_threshold, lar_abnormal_threshold,
          dppm_achieve_threshold, dppm_accept_min_threshold, dppm_accept_max_threshold, dppm_abnormal_threshold,
          underkill_achieve_threshold, underkill_accept_min_threshold, underkill_accept_max_threshold, underkill_abnormal_threshold,
          is_active, created_by, updated_by, created_at, updated_at
        ) VALUES (
          ${data.partno},
          ${data.partno_customer || null},
          ${data.product_families || ''},
          ${data.versions || ''},
          ${data.customers_site || ''},
          ${data.tab || ''},
          ${data.product_type || ''},
          ${data.customer_driver || ''},
          ${data.lar_achieve_threshold?.toString() || null},
          ${data.lar_accept_min_threshold?.toString() || null},
          ${data.lar_accept_max_threshold?.toString() || null},
          ${data.lar_abnormal_threshold?.toString() || null},
          ${data.dppm_achieve_threshold?.toString() || null},
          ${data.dppm_accept_min_threshold?.toString() || null},
          ${data.dppm_accept_max_threshold?.toString() || null},
          ${data.dppm_abnormal_threshold?.toString() || null},
          ${data.underkill_achieve_threshold?.toString() || null},
          ${data.underkill_accept_min_threshold?.toString() || null},
          ${data.underkill_accept_max_threshold?.toString() || null},
          ${data.underkill_abnormal_threshold?.toString() || null},
          ${data.is_active ?? true},
          ${userId},
          ${userId},
          ${nowStr}::timestamp,
          ${nowStr}::timestamp
        )
        RETURNING *
      `);
            const rows = result.rows || result;
            if (rows && rows.length > 0) {
                console.log('✅ Part created successfully');
                const row = rows[0];
                const mappedRow = {
                    partno: row.partno,
                    partnoCustomer: row.partno_customer,
                    productFamilies: row.product_families,
                    versions: row.versions,
                    customersSite: row.customers_site,
                    tab: row.tab,
                    productType: row.product_type,
                    customerDriver: row.customer_driver,
                    larAchieveThreshold: row.lar_achieve_threshold,
                    larAcceptMinThreshold: row.lar_accept_min_threshold,
                    larAcceptMaxThreshold: row.lar_accept_max_threshold,
                    larAbnormalThreshold: row.lar_abnormal_threshold,
                    dppmAchieveThreshold: row.dppm_achieve_threshold,
                    dppmAcceptMinThreshold: row.dppm_accept_min_threshold,
                    dppmAcceptMaxThreshold: row.dppm_accept_max_threshold,
                    dppmAbnormalThreshold: row.dppm_abnormal_threshold,
                    underkillAchieveThreshold: row.underkill_achieve_threshold,
                    underkillAcceptMinThreshold: row.underkill_accept_min_threshold,
                    underkillAcceptMaxThreshold: row.underkill_accept_max_threshold,
                    underkillAbnormalThreshold: row.underkill_abnormal_threshold,
                    isActive: row.is_active,
                    createdBy: row.created_by,
                    updatedBy: row.updated_by,
                    createdAt: row.created_at,
                    updatedAt: row.updated_at
                };
                return {
                    success: true,
                    data: mapDrizzleToEntity(mappedRow)
                };
            }
            return {
                success: false,
                error: 'Failed to create part'
            };
        }
        catch (error) {
            console.error('❌ Error creating part:', error);
            if (error.code === '23505') {
                return {
                    success: false,
                    error: 'Part number already exists'
                };
            }
            return {
                success: false,
                error: error.message || 'Database error occurred'
            };
        }
    }
    async upsert(data, userId) {
        try {
            const nowStr = this.formatLocalDateTime(new Date());
            console.log('🔧 Executing parts upsert query:', { partno: data.partno });
            const result = await this.db.execute((0, drizzle_orm_1.sql) `
        INSERT INTO parts (
          partno, partno_customer, product_families, versions, customers_site,
          tab, product_type, customer_driver,
          lar_achieve_threshold, lar_accept_min_threshold, lar_accept_max_threshold, lar_abnormal_threshold,
          dppm_achieve_threshold, dppm_accept_min_threshold, dppm_accept_max_threshold, dppm_abnormal_threshold,
          underkill_achieve_threshold, underkill_accept_min_threshold, underkill_accept_max_threshold, underkill_abnormal_threshold,
          is_active, created_by, updated_by, created_at, updated_at
        ) VALUES (
          ${data.partno},
          ${data.partno_customer || null},
          ${data.product_families || null},
          ${data.versions || null},
          ${data.customers_site || null},
          ${data.tab || null},
          ${data.product_type || null},
          ${data.customer_driver || null},
          ${data.lar_achieve_threshold != null ? data.lar_achieve_threshold.toString() : null},
          ${data.lar_accept_min_threshold != null ? data.lar_accept_min_threshold.toString() : null},
          ${data.lar_accept_max_threshold != null ? data.lar_accept_max_threshold.toString() : null},
          ${data.lar_abnormal_threshold != null ? data.lar_abnormal_threshold.toString() : null},
          ${data.dppm_achieve_threshold != null ? data.dppm_achieve_threshold.toString() : null},
          ${data.dppm_accept_min_threshold != null ? data.dppm_accept_min_threshold.toString() : null},
          ${data.dppm_accept_max_threshold != null ? data.dppm_accept_max_threshold.toString() : null},
          ${data.dppm_abnormal_threshold != null ? data.dppm_abnormal_threshold.toString() : null},
          ${data.underkill_achieve_threshold != null ? data.underkill_achieve_threshold.toString() : null},
          ${data.underkill_accept_min_threshold != null ? data.underkill_accept_min_threshold.toString() : null},
          ${data.underkill_accept_max_threshold != null ? data.underkill_accept_max_threshold.toString() : null},
          ${data.underkill_abnormal_threshold != null ? data.underkill_abnormal_threshold.toString() : null},
          ${data.is_active ?? true},
          ${userId},
          ${userId},
          ${nowStr}::timestamp,
          ${nowStr}::timestamp
        )
        ON CONFLICT (partno) DO UPDATE SET
          partno_customer = COALESCE(EXCLUDED.partno_customer, parts.partno_customer),
          product_families = COALESCE(EXCLUDED.product_families, parts.product_families),
          versions = COALESCE(EXCLUDED.versions, parts.versions),
          customers_site = COALESCE(EXCLUDED.customers_site, parts.customers_site),
          tab = COALESCE(EXCLUDED.tab, parts.tab),
          product_type = COALESCE(EXCLUDED.product_type, parts.product_type),
          customer_driver = COALESCE(EXCLUDED.customer_driver, parts.customer_driver),
          lar_achieve_threshold = COALESCE(EXCLUDED.lar_achieve_threshold, parts.lar_achieve_threshold),
          lar_accept_min_threshold = COALESCE(EXCLUDED.lar_accept_min_threshold, parts.lar_accept_min_threshold),
          lar_accept_max_threshold = COALESCE(EXCLUDED.lar_accept_max_threshold, parts.lar_accept_max_threshold),
          lar_abnormal_threshold = COALESCE(EXCLUDED.lar_abnormal_threshold, parts.lar_abnormal_threshold),
          dppm_achieve_threshold = COALESCE(EXCLUDED.dppm_achieve_threshold, parts.dppm_achieve_threshold),
          dppm_accept_min_threshold = COALESCE(EXCLUDED.dppm_accept_min_threshold, parts.dppm_accept_min_threshold),
          dppm_accept_max_threshold = COALESCE(EXCLUDED.dppm_accept_max_threshold, parts.dppm_accept_max_threshold),
          dppm_abnormal_threshold = COALESCE(EXCLUDED.dppm_abnormal_threshold, parts.dppm_abnormal_threshold),
          underkill_achieve_threshold = COALESCE(EXCLUDED.underkill_achieve_threshold, parts.underkill_achieve_threshold),
          underkill_accept_min_threshold = COALESCE(EXCLUDED.underkill_accept_min_threshold, parts.underkill_accept_min_threshold),
          underkill_accept_max_threshold = COALESCE(EXCLUDED.underkill_accept_max_threshold, parts.underkill_accept_max_threshold),
          underkill_abnormal_threshold = COALESCE(EXCLUDED.underkill_abnormal_threshold, parts.underkill_abnormal_threshold),
          updated_by = ${userId},
          updated_at = ${nowStr}::timestamp
        RETURNING *
      `);
            const rows = result.rows || result;
            if (rows && rows.length > 0) {
                console.log('✅ Part upserted successfully');
                const row = rows[0];
                const mappedRow = {
                    partno: row.partno,
                    partnoCustomer: row.partno_customer,
                    productFamilies: row.product_families,
                    versions: row.versions,
                    customersSite: row.customers_site,
                    tab: row.tab,
                    productType: row.product_type,
                    customerDriver: row.customer_driver,
                    larAchieveThreshold: row.lar_achieve_threshold,
                    larAcceptMinThreshold: row.lar_accept_min_threshold,
                    larAcceptMaxThreshold: row.lar_accept_max_threshold,
                    larAbnormalThreshold: row.lar_abnormal_threshold,
                    dppmAchieveThreshold: row.dppm_achieve_threshold,
                    dppmAcceptMinThreshold: row.dppm_accept_min_threshold,
                    dppmAcceptMaxThreshold: row.dppm_accept_max_threshold,
                    dppmAbnormalThreshold: row.dppm_abnormal_threshold,
                    underkillAchieveThreshold: row.underkill_achieve_threshold,
                    underkillAcceptMinThreshold: row.underkill_accept_min_threshold,
                    underkillAcceptMaxThreshold: row.underkill_accept_max_threshold,
                    underkillAbnormalThreshold: row.underkill_abnormal_threshold,
                    isActive: row.is_active,
                    createdBy: row.created_by,
                    updatedBy: row.updated_by,
                    createdAt: row.created_at,
                    updatedAt: row.updated_at
                };
                return {
                    success: true,
                    data: mapDrizzleToEntity(mappedRow)
                };
            }
            return {
                success: false,
                error: 'Failed to upsert part'
            };
        }
        catch (error) {
            console.error('❌ Error upserting part:', error);
            return {
                success: false,
                error: error.message || 'Database error occurred'
            };
        }
    }
    async update(keyValues, data, userId) {
        try {
            const { partno } = keyValues;
            if (!partno) {
                return {
                    success: false,
                    error: 'Part number is required for update'
                };
            }
            const nowStr = this.formatLocalDateTime(new Date());
            console.log('🔧 Executing parts update query:', { partno });
            const result = await this.db.execute((0, drizzle_orm_1.sql) `
        UPDATE parts SET
          updated_by = ${userId},
          updated_at = ${nowStr}::timestamp,
          partno_customer = COALESCE(${data.partno_customer ?? null}, partno_customer),
          product_families = COALESCE(${data.product_families ?? null}, product_families),
          versions = COALESCE(${data.versions ?? null}, versions),
          customers_site = COALESCE(${data.customers_site ?? null}, customers_site),
          tab = COALESCE(${data.tab ?? null}, tab),
          product_type = COALESCE(${data.product_type ?? null}, product_type),
          customer_driver = COALESCE(${data.customer_driver ?? null}, customer_driver),
          is_active = COALESCE(${data.is_active ?? null}, is_active),
          lar_achieve_threshold = COALESCE(${data.lar_achieve_threshold?.toString() ?? null}, lar_achieve_threshold),
          lar_accept_min_threshold = COALESCE(${data.lar_accept_min_threshold?.toString() ?? null}, lar_accept_min_threshold),
          lar_accept_max_threshold = COALESCE(${data.lar_accept_max_threshold?.toString() ?? null}, lar_accept_max_threshold),
          lar_abnormal_threshold = COALESCE(${data.lar_abnormal_threshold?.toString() ?? null}, lar_abnormal_threshold),
          dppm_achieve_threshold = COALESCE(${data.dppm_achieve_threshold?.toString() ?? null}, dppm_achieve_threshold),
          dppm_accept_min_threshold = COALESCE(${data.dppm_accept_min_threshold?.toString() ?? null}, dppm_accept_min_threshold),
          dppm_accept_max_threshold = COALESCE(${data.dppm_accept_max_threshold?.toString() ?? null}, dppm_accept_max_threshold),
          dppm_abnormal_threshold = COALESCE(${data.dppm_abnormal_threshold?.toString() ?? null}, dppm_abnormal_threshold),
          underkill_achieve_threshold = COALESCE(${data.underkill_achieve_threshold?.toString() ?? null}, underkill_achieve_threshold),
          underkill_accept_min_threshold = COALESCE(${data.underkill_accept_min_threshold?.toString() ?? null}, underkill_accept_min_threshold),
          underkill_accept_max_threshold = COALESCE(${data.underkill_accept_max_threshold?.toString() ?? null}, underkill_accept_max_threshold),
          underkill_abnormal_threshold = COALESCE(${data.underkill_abnormal_threshold?.toString() ?? null}, underkill_abnormal_threshold)
        WHERE partno = ${partno}
        RETURNING *
      `);
            const rows = result.rows || result;
            if (rows && rows.length > 0) {
                console.log('✅ Part updated successfully');
                const row = rows[0];
                const mappedRow = {
                    partno: row.partno,
                    partnoCustomer: row.partno_customer,
                    productFamilies: row.product_families,
                    versions: row.versions,
                    customersSite: row.customers_site,
                    tab: row.tab,
                    productType: row.product_type,
                    customerDriver: row.customer_driver,
                    larAchieveThreshold: row.lar_achieve_threshold,
                    larAcceptMinThreshold: row.lar_accept_min_threshold,
                    larAcceptMaxThreshold: row.lar_accept_max_threshold,
                    larAbnormalThreshold: row.lar_abnormal_threshold,
                    dppmAchieveThreshold: row.dppm_achieve_threshold,
                    dppmAcceptMinThreshold: row.dppm_accept_min_threshold,
                    dppmAcceptMaxThreshold: row.dppm_accept_max_threshold,
                    dppmAbnormalThreshold: row.dppm_abnormal_threshold,
                    underkillAchieveThreshold: row.underkill_achieve_threshold,
                    underkillAcceptMinThreshold: row.underkill_accept_min_threshold,
                    underkillAcceptMaxThreshold: row.underkill_accept_max_threshold,
                    underkillAbnormalThreshold: row.underkill_abnormal_threshold,
                    isActive: row.is_active,
                    createdBy: row.created_by,
                    updatedBy: row.updated_by,
                    createdAt: row.created_at,
                    updatedAt: row.updated_at
                };
                return {
                    success: true,
                    data: mapDrizzleToEntity(mappedRow)
                };
            }
            return {
                success: false,
                error: 'Part not found'
            };
        }
        catch (error) {
            console.error('❌ Error updating part:', error);
            return {
                success: false,
                error: error.message || 'Database error occurred'
            };
        }
    }
    async delete(keyValues, actor = null, req) {
        try {
            const { partno } = keyValues;
            if (!partno) {
                return {
                    success: false,
                    error: 'Part number is required for deletion'
                };
            }
            return await this.db.transaction(async (tx) => {
                const [deleted] = await tx
                    .delete(schema_1.parts)
                    .where((0, drizzle_orm_1.eq)(schema_1.parts.partno, partno))
                    .returning();
                if (!deleted) {
                    return { success: false, error: 'Part not found' };
                }
                await (0, auditLogger_1.logDelete)(this.db, {
                    entity: 'parts',
                    recordId: deleted.partno,
                    oldValues: deleted,
                    actor,
                    req,
                    tx,
                });
                console.log('✅ Part deleted successfully');
                return { success: true };
            });
        }
        catch (error) {
            console.error('❌ Error deleting part:', error);
            return {
                success: false,
                error: error.message || 'Database error occurred'
            };
        }
    }
    async exists(keyValues) {
        const { partno } = keyValues;
        if (!partno) {
            return false;
        }
        const result = await this.db
            .select({ partno: schema_1.parts.partno })
            .from(schema_1.parts)
            .where((0, drizzle_orm_1.eq)(schema_1.parts.partno, partno))
            .limit(1);
        return result.length > 0;
    }
    async health() {
        const startTime = Date.now();
        try {
            const totalResult = await this.db.select({ count: (0, drizzle_orm_1.sql) `count(*)::int` }).from(schema_1.parts);
            const activeResult = await this.db.select({ count: (0, drizzle_orm_1.sql) `count(*)::int` }).from(schema_1.parts).where((0, drizzle_orm_1.eq)(schema_1.parts.isActive, true));
            const inactiveResult = await this.db.select({ count: (0, drizzle_orm_1.sql) `count(*)::int` }).from(schema_1.parts).where((0, drizzle_orm_1.eq)(schema_1.parts.isActive, false));
            const total = totalResult[0]?.count || 0;
            const active = activeResult[0]?.count || 0;
            const inactive = inactiveResult[0]?.count || 0;
            return {
                entityName: this.config.entityName,
                tableName: this.config.tableName,
                status: 'healthy',
                checks: {
                    tableExists: true,
                    hasData: total > 0,
                    hasActiveRecords: active > 0,
                    recentActivity: true,
                    indexHealth: true
                },
                statistics: { total, active, inactive },
                issues: [],
                lastChecked: new Date(),
                responseTime: Date.now() - startTime
            };
        }
        catch {
            return {
                entityName: this.config.entityName,
                tableName: this.config.tableName,
                status: 'critical',
                checks: {
                    tableExists: false,
                    hasData: false,
                    hasActiveRecords: false,
                    recentActivity: false,
                    indexHealth: false
                },
                statistics: { total: 0, active: 0, inactive: 0 },
                issues: ['Failed to connect to database'],
                lastChecked: new Date(),
                responseTime: Date.now() - startTime
            };
        }
    }
    async statistics() {
        const totalResult = await this.db.select({ count: (0, drizzle_orm_1.sql) `count(*)::int` }).from(schema_1.parts);
        const activeResult = await this.db.select({ count: (0, drizzle_orm_1.sql) `count(*)::int` }).from(schema_1.parts).where((0, drizzle_orm_1.eq)(schema_1.parts.isActive, true));
        const inactiveResult = await this.db.select({ count: (0, drizzle_orm_1.sql) `count(*)::int` }).from(schema_1.parts).where((0, drizzle_orm_1.eq)(schema_1.parts.isActive, false));
        const total = totalResult[0]?.count || 0;
        const active = activeResult[0]?.count || 0;
        const inactive = inactiveResult[0]?.count || 0;
        return {
            entityName: this.config.entityName,
            overview: {
                total,
                active,
                inactive,
                activePercentage: total > 0 ? Math.round((active / total) * 100) : 0
            },
            activity: {
                createdToday: 0,
                updatedToday: 0,
                createdThisWeek: 0,
                updatedThisWeek: 0
            },
            dataQuality: {
                completenessScore: 100,
                validationScore: 100,
                issues: []
            },
            calculatedAt: new Date()
        };
    }
    async getCustomerSites() {
        try {
            const result = await this.db
                .select({
                code: schema_1.customersSite.code,
                customers: schema_1.customersSite.customers,
                site: schema_1.customersSite.site,
                customerName: schema_1.customers.name,
            })
                .from(schema_1.customersSite)
                .leftJoin(schema_1.customers, (0, drizzle_orm_1.eq)(schema_1.customersSite.customers, schema_1.customers.code))
                .where((0, drizzle_orm_1.eq)(schema_1.customersSite.isActive, true))
                .orderBy((0, drizzle_orm_1.asc)(schema_1.customersSite.code));
            const rows = result.map(row => ({
                value: row.code,
                label: `${row.customerName || row.customers} - ${row.site}`,
                customer: row.customers || '',
                site: row.site || '',
                customer_name: row.customerName || ''
            }));
            return { rows };
        }
        catch (error) {
            console.error('Error getting customer-sites:', error);
            return { rows: [] };
        }
    }
}
exports.PartsModel = PartsModel;
function createPartsModel(db) {
    return new PartsModel(db);
}
exports.default = PartsModel;
