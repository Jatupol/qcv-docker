// server/src/entities/parts/model-drizzle.ts
/* Parts Entity Model - Drizzle ORM Implementation
 * SPECIAL Pattern Implementation (VARCHAR Primary Key)
 *
 * This is the Drizzle ORM version of the PartsModel.
 * It provides the same interface as the original model but uses Drizzle ORM.
 *
 * Migration Notes:
 * - Same interface as original PartsModel
 * - Uses Drizzle schema and query builder
 * - Enabled via DRIZZLE_PARTS=true in .env
 */

import { eq, like, or, and, sql, desc, asc, ilike } from 'drizzle-orm';
import type { Request } from 'express';
import { logDelete, SessionUserLite } from '../../utils/auditLogger';
import { DrizzleDb } from '../../db';
import { parts, Part as DrizzlePart, NewPart, customers, customersSite } from '../../db/schema';
import {
  Parts,
  CreatePartsRequest,
  UpdatePartsRequest,
  PartsQueryParams,
  PARTS_ENTITY_CONFIG
} from './types';

// ==================== TYPE MAPPING ====================

/**
 * Map Drizzle result to entity type
 */
function mapDrizzleToEntity(
  row: DrizzlePart & { customerSiteCode?: string | null; customerName?: string | null },
  searchTerm?: string
): Parts {
  const entity: Parts = {
    partno: row.partno,
    partno_customer: row.partnoCustomer ?? undefined,
    product_families: row.productFamilies ?? '',
    versions: row.versions ?? '',
    customers_site: row.customersSite ?? '',
    tab: row.tab ?? '',
    product_type: row.productType ?? '',
    customer_driver: row.customerDriver || '',

    // LAR thresholds
    lar_achieve_threshold: row.larAchieveThreshold ? parseFloat(row.larAchieveThreshold) : undefined,
    lar_accept_min_threshold: row.larAcceptMinThreshold ? parseFloat(row.larAcceptMinThreshold) : undefined,
    lar_accept_max_threshold: row.larAcceptMaxThreshold ? parseFloat(row.larAcceptMaxThreshold) : undefined,
    lar_abnormal_threshold: row.larAbnormalThreshold ? parseFloat(row.larAbnormalThreshold) : undefined,

    // DPPM thresholds
    dppm_achieve_threshold: row.dppmAchieveThreshold ? parseFloat(row.dppmAchieveThreshold) : undefined,
    dppm_accept_min_threshold: row.dppmAcceptMinThreshold ? parseFloat(row.dppmAcceptMinThreshold) : undefined,
    dppm_accept_max_threshold: row.dppmAcceptMaxThreshold ? parseFloat(row.dppmAcceptMaxThreshold) : undefined,
    dppm_abnormal_threshold: row.dppmAbnormalThreshold ? parseFloat(row.dppmAbnormalThreshold) : undefined,

    // Underkill thresholds
    underkill_achieve_threshold: row.underkillAchieveThreshold ? parseFloat(row.underkillAchieveThreshold) : undefined,
    underkill_accept_min_threshold: row.underkillAcceptMinThreshold ? parseFloat(row.underkillAcceptMinThreshold) : undefined,
    underkill_accept_max_threshold: row.underkillAcceptMaxThreshold ? parseFloat(row.underkillAcceptMaxThreshold) : undefined,
    underkill_abnormal_threshold: row.underkillAbnormalThreshold ? parseFloat(row.underkillAbnormalThreshold) : undefined,

    is_active: row.isActive ?? true,
    created_by: row.createdBy ?? 0,
    updated_by: row.updatedBy ?? 0,
    created_at: row.createdAt!,
    updated_at: row.updatedAt!,

    // JOIN fields
    customer_site_code: row.customerSiteCode || undefined,
    customer_name: row.customerName || undefined,
  };

  return entity;
}

// ==================== PARTS MODEL CLASS (DRIZZLE) ====================

/**
 * Parts Entity Model - Drizzle ORM Version
 *
 * Data access layer for parts management using Drizzle ORM.
 * Provides parts-specific database operations with type-safe queries.
 */
export class PartsModel {
  private db: DrizzleDb;
  private config = PARTS_ENTITY_CONFIG;

  constructor(db: DrizzleDb) {
    this.db = db;
  }

  /**
   * Format datetime as local time string to preserve local timezone
   * This bypasses Drizzle's UTC conversion for timestamp WITHOUT timezone columns
   */
  private formatLocalDateTime(date: Date | string | null | undefined): string {
    if (!date) {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    }

    if (typeof date === 'string') {
      // Check if it's an ISO date string (contains 'T' and possibly 'Z')
      // Convert to Date object first to get local time
      if (date.includes('T')) {
        const d = new Date(date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
      }
      // Already a local time string (e.g., "2026-01-27 20:34:53")
      return date;
    }

    const d = date;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
  }

  // ==================== CORE OPERATIONS ====================

  /**
   * Find part by partno (primary key)
   */
  async getByKey(keyValues: Record<string, any>): Promise<Parts | null> {
    try {
      const { partno } = keyValues;

      if (!partno) {
        throw new Error('Part number is required');
      }

      const result = await this.db
        .select()
        .from(parts)
        .where(eq(parts.partno, partno))
        .limit(1);

      return result[0] ? mapDrizzleToEntity(result[0]) : null;
    } catch (error: any) {
      console.error('Parts getByKey error:', error);
      throw new Error(`Failed to find part: ${error.message}`);
    }
  }

  /**
   * Get all parts with customer-site relationship and search support
   */
  async getAll(searchTerm?: string, page?: number, limit?: number): Promise<Parts[]> {
    try {
      console.log('🔧 Parts query with pagination:', { page, limit, searchTerm });

      const conditions = [];

      if (searchTerm?.trim()) {
        const searchPattern = `%${searchTerm}%`;
        conditions.push(
          or(
            ilike(parts.partno, searchPattern),
            ilike(parts.productFamilies, searchPattern),
            ilike(parts.versions, searchPattern),
            ilike(parts.customersSite, searchPattern),
            ilike(parts.tab, searchPattern),
            ilike(parts.productType, searchPattern),
            ilike(parts.customerDriver, searchPattern)
          )!
        );
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      let query = this.db
        .select({
          partno: parts.partno,
          partnoCustomer: parts.partnoCustomer,
          productFamilies: parts.productFamilies,
          versions: parts.versions,
          customersSite: parts.customersSite,
          tab: parts.tab,
          productType: parts.productType,
          customerDriver: parts.customerDriver,
          larAchieveThreshold: parts.larAchieveThreshold,
          larAcceptMinThreshold: parts.larAcceptMinThreshold,
          larAcceptMaxThreshold: parts.larAcceptMaxThreshold,
          larAbnormalThreshold: parts.larAbnormalThreshold,
          dppmAchieveThreshold: parts.dppmAchieveThreshold,
          dppmAcceptMinThreshold: parts.dppmAcceptMinThreshold,
          dppmAcceptMaxThreshold: parts.dppmAcceptMaxThreshold,
          dppmAbnormalThreshold: parts.dppmAbnormalThreshold,
          underkillAchieveThreshold: parts.underkillAchieveThreshold,
          underkillAcceptMinThreshold: parts.underkillAcceptMinThreshold,
          underkillAcceptMaxThreshold: parts.underkillAcceptMaxThreshold,
          underkillAbnormalThreshold: parts.underkillAbnormalThreshold,
          isActive: parts.isActive,
          createdBy: parts.createdBy,
          updatedBy: parts.updatedBy,
          createdAt: parts.createdAt,
          updatedAt: parts.updatedAt,
          customerSiteCode: customersSite.code,
          customerName: customers.name,
        })
        .from(parts)
        .leftJoin(customersSite, eq(parts.customersSite, customersSite.code))
        .leftJoin(customers, eq(customersSite.customers, customers.code))
        .where(whereClause)
        .orderBy(asc(parts.partno));

      // Apply pagination
      if (limit && limit > 0) {
        query = query.limit(limit) as typeof query;

        if (page && page > 0) {
          const offset = (page - 1) * limit;
          query = query.offset(offset) as typeof query;
        }
      }

      const result = await query;

      return result.map(row => mapDrizzleToEntity(row, searchTerm));
    } catch (error: any) {
      console.error('Parts getAll error:', error);
      throw new Error(`Failed to get parts: ${error.message}`);
    }
  }

  /**
   * Get total count of parts (for pagination)
   */
  async getCount(searchTerm?: string): Promise<number> {
    try {
      const conditions = [];

      if (searchTerm?.trim()) {
        const searchPattern = `%${searchTerm}%`;
        conditions.push(
          or(
            ilike(parts.partno, searchPattern),
            ilike(parts.productFamilies, searchPattern),
            ilike(parts.versions, searchPattern),
            ilike(parts.customersSite, searchPattern),
            ilike(parts.tab, searchPattern),
            ilike(parts.productType, searchPattern),
            ilike(parts.customerDriver, searchPattern)
          )!
        );
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const result = await this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(parts)
        .where(whereClause);

      return result[0]?.count || 0;
    } catch (error: any) {
      console.error('Parts getCount error:', error);
      return 0;
    }
  }

  /**
   * Create new part
   * Uses raw SQL to bypass Drizzle's timestamp UTC conversion
   */
  async create(data: CreatePartsRequest, userId: number): Promise<{ success: boolean; data?: Parts; error?: string }> {
    try {
      const nowStr = this.formatLocalDateTime(new Date());

      console.log('🔧 Executing parts create query:', { partno: data.partno });

      // Use raw SQL to bypass Drizzle's timestamp handling
      const result = await this.db.execute(sql`
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

      const rows = (result as any).rows || result;
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
          data: mapDrizzleToEntity(mappedRow as any)
        };
      }

      return {
        success: false,
        error: 'Failed to create part'
      };
    } catch (error: any) {
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

  /**
   * Upsert part (Insert or Update if exists)
   * Used by import function to handle both new and existing parts
   */
  async upsert(data: CreatePartsRequest, userId: number): Promise<{ success: boolean; data?: Parts; error?: string }> {
    try {
      const nowStr = this.formatLocalDateTime(new Date());

      console.log('🔧 Executing parts upsert query:', { partno: data.partno });

      // Use INSERT ... ON CONFLICT ... DO UPDATE for upsert behavior
      const result = await this.db.execute(sql`
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

      const rows = (result as any).rows || result;
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
          data: mapDrizzleToEntity(mappedRow as any)
        };
      }

      return {
        success: false,
        error: 'Failed to upsert part'
      };
    } catch (error: any) {
      console.error('❌ Error upserting part:', error);

      return {
        success: false,
        error: error.message || 'Database error occurred'
      };
    }
  }

  /**
   * Update part by partno
   * Uses raw SQL to bypass Drizzle's timestamp UTC conversion
   */
  async update(keyValues: Record<string, any>, data: UpdatePartsRequest, userId: number): Promise<{ success: boolean; data?: Parts; error?: string }> {
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

      // Use raw SQL with COALESCE to only update provided fields
      const result = await this.db.execute(sql`
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

      const rows = (result as any).rows || result;
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
          data: mapDrizzleToEntity(mappedRow as any)
        };
      }

      return {
        success: false,
        error: 'Part not found'
      };
    } catch (error: any) {
      console.error('❌ Error updating part:', error);
      return {
        success: false,
        error: error.message || 'Database error occurred'
      };
    }
  }

  /**
   * Delete part by partno
   */
  async delete(
    keyValues: Record<string, any>,
    actor: SessionUserLite | null = null,
    req?: Request
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { partno } = keyValues;

      if (!partno) {
        return {
          success: false,
          error: 'Part number is required for deletion'
        };
      }

      return await this.db.transaction(async (tx: any) => {
        const [deleted] = await tx
          .delete(parts)
          .where(eq(parts.partno, partno))
          .returning();

        if (!deleted) {
          return { success: false, error: 'Part not found' };
        }

        await logDelete(this.db, {
          entity: 'parts',
          recordId: deleted.partno,
          oldValues: deleted as any,
          actor,
          req,
          tx,
        });

        console.log('✅ Part deleted successfully');
        return { success: true };
      });
    } catch (error: any) {
      console.error('❌ Error deleting part:', error);
      return {
        success: false,
        error: error.message || 'Database error occurred'
      };
    }
  }

  /**
   * Check if part exists
   */
  async exists(keyValues: Record<string, any>): Promise<boolean> {
    const { partno } = keyValues;

    if (!partno) {
      return false;
    }

    const result = await this.db
      .select({ partno: parts.partno })
      .from(parts)
      .where(eq(parts.partno, partno))
      .limit(1);

    return result.length > 0;
  }

  /**
   * Get health status
   */
  async health(): Promise<{
    entityName: string;
    tableName: string;
    status: 'healthy' | 'warning' | 'critical';
    checks: {
      tableExists: boolean;
      hasData: boolean;
      hasActiveRecords: boolean;
      recentActivity: boolean;
      indexHealth: boolean;
    };
    statistics: { total: number; active: number; inactive: number };
    issues: string[];
    lastChecked: Date;
    responseTime: number;
  }> {
    const startTime = Date.now();
    try {
      const totalResult = await this.db.select({ count: sql<number>`count(*)::int` }).from(parts);
      const activeResult = await this.db.select({ count: sql<number>`count(*)::int` }).from(parts).where(eq(parts.isActive, true));
      const inactiveResult = await this.db.select({ count: sql<number>`count(*)::int` }).from(parts).where(eq(parts.isActive, false));

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
    } catch {
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

  /**
   * Get statistics
   */
  async statistics(): Promise<{
    entityName: string;
    overview: { total: number; active: number; inactive: number; activePercentage: number };
    activity: { createdToday: number; updatedToday: number; createdThisWeek: number; updatedThisWeek: number };
    dataQuality: { completenessScore: number; validationScore: number; issues: string[] };
    calculatedAt: Date;
  }> {
    const totalResult = await this.db.select({ count: sql<number>`count(*)::int` }).from(parts);
    const activeResult = await this.db.select({ count: sql<number>`count(*)::int` }).from(parts).where(eq(parts.isActive, true));
    const inactiveResult = await this.db.select({ count: sql<number>`count(*)::int` }).from(parts).where(eq(parts.isActive, false));

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

  /**
   * Get customer-sites for dropdown
   */
  async getCustomerSites(): Promise<{ rows: Array<{ value: string; label: string; customer: string; site: string; customer_name: string }> }> {
    try {
      const result = await this.db
        .select({
          code: customersSite.code,
          customers: customersSite.customers,
          site: customersSite.site,
          customerName: customers.name,
        })
        .from(customersSite)
        .leftJoin(customers, eq(customersSite.customers, customers.code))
        .where(eq(customersSite.isActive, true))
        .orderBy(asc(customersSite.code));

      const rows = result.map(row => ({
        value: row.code,
        label: `${row.customerName || row.customers} - ${row.site}`,
        customer: row.customers || '',
        site: row.site || '',
        customer_name: row.customerName || ''
      }));

      return { rows };
    } catch (error: any) {
      console.error('Error getting customer-sites:', error);
      return { rows: [] };
    }
  }
}

// ==================== FACTORY FUNCTION ====================

/**
 * Factory function to create a Drizzle parts model instance
 */
export function createPartsModel(db: DrizzleDb): PartsModel {
  return new PartsModel(db);
}

export default PartsModel;
