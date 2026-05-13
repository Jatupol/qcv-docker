// server/src/entities/inspectiondata/model-drizzle.ts
/* InspectionData Entity Model - Drizzle ORM Implementation
 * SPECIAL Pattern Implementation (SERIAL Primary Key)
 *
 * This is the Drizzle ORM version of the InspectionDataModel.
 * It provides the same interface as the original model but uses Drizzle ORM.
 *
 * Migration Notes:
 * - Same interface as original InspectionDataModel
 * - Uses Drizzle schema and query builder
 * - Enabled via DRIZZLE_INSPECTIONDATA=true in .env
 */

import { eq, like, or, and, sql, desc, asc, ilike, gte, lte, getTableColumns } from 'drizzle-orm';
import type { Request } from 'express';
import { formatDateLocal } from '../../utils/dateTimeUtils';
import { logDelete, SessionUserLite } from '../../utils/auditLogger';
import { DrizzleDb } from '../../db';
import {
  inspectiondata,
  Inspectiondata as DrizzleInspectiondata,
  NewInspectiondata,
  samplingReasons,
  defectdata
} from '../../db/schema';

// Get table columns for type-safe spread in select queries
const inspectiondataColumns = getTableColumns(inspectiondata);
import {
  InspectionData,
  CreateInspectionDataRequest,
  UpdateInspectionDataRequest,
  INSPECTIONDATA_ENTITY_CONFIG
} from './types';
import { getFiscalYear } from '@qcv/shared';
import { toDate } from '../../utils/dateTimeUtils';

// ==================== TYPE MAPPING ====================

/**
 * Map Drizzle result to entity type
 */
function mapDrizzleToEntity(
  row: DrizzleInspectiondata & {
    samplingReasonName?: string | null;
    samplingReasonDescription?: string | null;
    defectNum?: number | null;
    ngNum?: number | null;
  },
  searchTerm?: string
): InspectionData {
  const entity: InspectionData = {
    id: row.id,
    station: row.station ?? '',
    inspection_no: row.inspectionNo ?? '',
    inspection_no_ref: row.inspectionNoRef ?? '',
    inspection_date: row.inspectionDate ?? new Date(),
    fy: row.fy ?? '',
    ww: row.ww ?? '',
    month_year: row.monthYear ?? '',
    shift: row.shift ?? '',
    lotno: row.lotno ?? '',
    partsite: row.partsite ?? '',
    itemno: row.itemno ?? '',
    model: row.model ?? '',
    version: row.version ?? '',
    fvilineno: row.fvilineno ?? '',
    mclineno: row.mclineno ?? '',
    round: row.round ?? 0,
    qc_id: row.qcId ?? 0,
    fvi_lot_qty: row.fviLotQty ?? 0,
    general_sampling_qty: row.generalSamplingQty ?? 0,
    crack_sampling_qty: row.crackSamplingQty ?? 0,
    sampling_reason_id: row.samplingReasonId ?? 0,
    judgment: row.judgment ?? null,
    color: row.color ?? null,
    created_by: row.createdBy ?? 0,
    updated_by: row.updatedBy ?? 0,
    created_at: row.createdAt ?? new Date(),
    updated_at: row.updatedAt ?? new Date(),

    // View-only fields from joins
    sampling_reason_name: row.samplingReasonName || undefined,
    sampling_reason_description: row.samplingReasonDescription || undefined,
    defect_num: row.defectNum ?? 0,
    ng_num: row.ngNum ?? 0
  };

  // Add highlighting if search term is provided
  if (searchTerm && searchTerm.trim()) {
    entity.highlight = createHighlightedFields(entity, searchTerm);
  }

  return entity;
}

/**
 * Create highlighted fields for search results
 */
function createHighlightedFields(entity: InspectionData, searchTerm: string): Record<string, string> {
  const highlighted: Record<string, string> = {};
  const searchableFields = ['inspection_no', 'station', 'shift', 'lotno', 'partsite', 'itemno', 'model', 'version', 'fvilineno'];

  const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');

  searchableFields.forEach(field => {
    const value = entity[field as keyof InspectionData] as string;
    if (value && typeof value === 'string') {
      const highlightedValue = value.replace(regex, '<mark>$1</mark>');
      if (highlightedValue !== value) {
        highlighted[field] = highlightedValue;
      }
    }
  });

  return highlighted;
}

// ==================== INSPECTIONDATA MODEL CLASS (DRIZZLE) ====================

/**
 * InspectionData Entity Model - Drizzle ORM Version
 *
 * Data access layer for inspection data management using Drizzle ORM.
 * Provides inspection-specific database operations with type-safe queries.
 */
export class InspectionDataModel {
  private db: DrizzleDb;
  private config = INSPECTIONDATA_ENTITY_CONFIG;

  constructor(db: DrizzleDb) {
    this.db = db;
  }

  // ==================== REQUIRED ISPECIALMODEL METHODS ====================

  /**
   * Find inspection data by id (primary key)
   * Uses JOIN to include sampling_reason_name
   */
  async getByKey(keyValues: Record<string, any>): Promise<InspectionData | null> {
    try {
      const { id } = keyValues;

      if (!id) {
        throw new Error('ID is required');
      }

      // Query with LEFT JOIN to sampling_reasons
      const result = await this.db
        .select({
          ...inspectiondataColumns,
          samplingReasonName: samplingReasons.name,
          samplingReasonDescription: samplingReasons.description
        })
        .from(inspectiondata)
        .leftJoin(samplingReasons, eq(inspectiondata.samplingReasonId, samplingReasons.id))
        .where(eq(inspectiondata.id, id))
        .limit(1);

      if (result.length > 0) {
        const row = result[0];
        console.log('📊 Raw DB row for inspection ID', id, ':', {
          general_sampling_qty: row.generalSamplingQty,
          crack_sampling_qty: row.crackSamplingQty,
          fvi_lot_qty: row.fviLotQty,
          sampling_reason_id: row.samplingReasonId,
          sampling_reason_name: row.samplingReasonName
        });

        // Get defect counts
        const defectCounts = await this.getDefectCounts(row.inspectionNo || '');

        return mapDrizzleToEntity({
          ...row,
          defectNum: defectCounts.defectNum,
          ngNum: defectCounts.ngNum
        });
      }

      return null;
    } catch (error: any) {
      console.error('InspectionData getByKey error:', error);
      throw new Error(`Failed to find inspection data: ${error.message}`);
    }
  }

  /**
   * Get defect counts for an inspection number
   */
  private async getDefectCounts(inspectionNo: string): Promise<{ defectNum: number; ngNum: number }> {
    try {
      const result = await this.db
        .select({
          defectNum: sql<number>`count(*)::int`,
          ngNum: sql<number>`COALESCE(SUM(${defectdata.ngQty}), 0)::int`
        })
        .from(defectdata)
        .where(eq(defectdata.inspectionNo, inspectionNo));

      return {
        defectNum: result[0]?.defectNum || 0,
        ngNum: result[0]?.ngNum || 0
      };
    } catch (error) {
      console.error('Error getting defect counts:', error);
      return { defectNum: 0, ngNum: 0 };
    }
  }

  /**
   * Get all inspection data with search support and pagination
   */
  async getAll(searchTerm?: string, options?: {
    page?: number;
    limit?: number;
    station?: string;
    inspectionDateFrom?: string;
    inspectionDateTo?: string;
  }): Promise<InspectionData[]> {
    try {
      const page = options?.page && options.page > 0 ? options.page : 1;
      const limit = options?.limit && options.limit > 0 ? options.limit : 20; // No limit cap - load all records
      const offset = (page - 1) * limit;

      const conditions = [];

      // Station filter
      if (options?.station && options.station.trim()) {
        conditions.push(eq(inspectiondata.station, options.station.trim()));
      }

      // Date filtering
      // For date range filtering, we need to handle the full day:
      // - inspectionDateFrom: start of day (00:00:00)
      // - inspectionDateTo: end of day (23:59:59)
      // IMPORTANT: Use raw SQL strings to avoid Drizzle's UTC conversion
      // Database stores timestamps WITHOUT timezone, so we compare as strings
      if (options?.inspectionDateFrom) {
        // Start of day as string - no timezone conversion
        const fromDateStr = `${options.inspectionDateFrom} 00:00:00`;
        conditions.push(sql`${inspectiondata.inspectionDate} >= ${fromDateStr}::timestamp`);
      }

      if (options?.inspectionDateTo) {
        // End of day as string - no timezone conversion
        const toDateStr = `${options.inspectionDateTo} 23:59:59.999`;
        conditions.push(sql`${inspectiondata.inspectionDate} <= ${toDateStr}::timestamp`);
      }

      // Search functionality
      if (searchTerm && searchTerm.trim()) {
        const searchPattern = `%${searchTerm.trim()}%`;
        conditions.push(
          or(
            ilike(inspectiondata.inspectionNo, searchPattern),
            ilike(inspectiondata.station, searchPattern),
            ilike(inspectiondata.shift, searchPattern),
            ilike(inspectiondata.lotno, searchPattern),
            ilike(inspectiondata.partsite, searchPattern),
            ilike(inspectiondata.itemno, searchPattern),
            ilike(inspectiondata.model, searchPattern),
            ilike(inspectiondata.version, searchPattern),
            ilike(inspectiondata.fvilineno, searchPattern),
            ilike(inspectiondata.mclineno, searchPattern)
          )!
        );
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      console.log(`🔧 Executing paginated query: page=${page}, limit=${limit}, offset=${offset}`);

      // Defect counts subquery - computed once via LEFT JOIN instead of separate batch query
      const defectCounts = this.db
        .select({
          inspectionNo: defectdata.inspectionNo,
          defectNum: sql<number>`count(*)::int`.as('defect_num'),
          ngNum: sql<number>`COALESCE(SUM(${defectdata.ngQty}), 0)::int`.as('ng_num')
        })
        .from(defectdata)
        .groupBy(defectdata.inspectionNo)
        .as('dc');

      // Single query with both sampling_reasons and defect counts joined
      const result = await this.db
        .select({
          ...inspectiondataColumns,
          samplingReasonName: samplingReasons.name,
          samplingReasonDescription: samplingReasons.description,
          defectNum: sql<number>`COALESCE(${defectCounts.defectNum}, 0)`,
          ngNum: sql<number>`COALESCE(${defectCounts.ngNum}, 0)`
        })
        .from(inspectiondata)
        .leftJoin(samplingReasons, eq(inspectiondata.samplingReasonId, samplingReasons.id))
        .leftJoin(defectCounts, eq(inspectiondata.inspectionNo, defectCounts.inspectionNo))
        .where(whereClause)
        .orderBy(desc(inspectiondata.id))
        .limit(limit)
        .offset(offset);

      return result.map(row => mapDrizzleToEntity(row, searchTerm));
    } catch (error: any) {
      console.error('InspectionData getAll error:', error);
      throw new Error(`Failed to get inspection data: ${error.message}`);
    }
  }

  /**
   * Get defect counts for multiple inspection numbers in batch
   */
  private async getDefectCountsBatch(inspectionNos: string[]): Promise<Map<string, { defectNum: number; ngNum: number }>> {
    const map = new Map<string, { defectNum: number; ngNum: number }>();

    if (inspectionNos.length === 0) {
      return map;
    }

    try {
      const result = await this.db
        .select({
          inspectionNo: defectdata.inspectionNo,
          defectNum: sql<number>`count(*)::int`,
          ngNum: sql<number>`COALESCE(SUM(${defectdata.ngQty}), 0)::int`
        })
        .from(defectdata)
        .where(sql`${defectdata.inspectionNo} = ANY(ARRAY[${sql.join(inspectionNos.map(n => sql`${n}`), sql`, `)}])`)
        .groupBy(defectdata.inspectionNo);

      for (const row of result) {
        if (row.inspectionNo) {
          map.set(row.inspectionNo, {
            defectNum: row.defectNum || 0,
            ngNum: row.ngNum || 0
          });
        }
      }
    } catch (error) {
      console.error('Error getting batch defect counts:', error);
    }

    return map;
  }

  /**
   * Get total count for pagination
   */
  async getCount(searchTerm?: string, station?: string, inspectionDateFrom?: string, inspectionDateTo?: string): Promise<number> {
    try {
      const conditions = [];

      if (station && station.trim()) {
        conditions.push(eq(inspectiondata.station, station.trim()));
      }

      if (inspectionDateFrom) {
        // Start of day as string - no timezone conversion
        const fromDateStr = `${inspectionDateFrom} 00:00:00`;
        conditions.push(sql`${inspectiondata.inspectionDate} >= ${fromDateStr}::timestamp`);
      }

      if (inspectionDateTo) {
        // End of day as string - no timezone conversion
        const toDateStr = `${inspectionDateTo} 23:59:59.999`;
        conditions.push(sql`${inspectiondata.inspectionDate} <= ${toDateStr}::timestamp`);
      }

      if (searchTerm && searchTerm.trim()) {
        const searchPattern = `%${searchTerm.trim()}%`;
        conditions.push(
          or(
            ilike(inspectiondata.inspectionNo, searchPattern),
            ilike(inspectiondata.station, searchPattern),
            ilike(inspectiondata.shift, searchPattern),
            ilike(inspectiondata.lotno, searchPattern),
            ilike(inspectiondata.partsite, searchPattern),
            ilike(inspectiondata.itemno, searchPattern),
            ilike(inspectiondata.model, searchPattern),
            ilike(inspectiondata.version, searchPattern),
            ilike(inspectiondata.fvilineno, searchPattern),
            ilike(inspectiondata.mclineno, searchPattern)
          )!
        );
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const result = await this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(inspectiondata)
        .where(whereClause);

      return result[0]?.count || 0;
    } catch (error: any) {
      console.error('InspectionData getCount error:', error);
      return 0;
    }
  }

  /**
   * Create new inspection data
   */
  async create(data: CreateInspectionDataRequest, userId: number): Promise<{ success: boolean; data?: InspectionData; error?: string }> {
    try {
      // IMPORTANT: For timestamp WITHOUT timezone, we need to pass the datetime string directly
      // to PostgreSQL to avoid JavaScript Date UTC conversion.
      // Format datetime as string to preserve local time exactly
      let inspectionDateValue: string;
      if (data.inspection_date instanceof Date) {
        const d = data.inspection_date;
        inspectionDateValue = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
      } else if (data.inspection_date) {
        // Already a string - use as-is (e.g., "2026-01-27 20:34:53")
        inspectionDateValue = String(data.inspection_date);
      } else {
        // Fallback to current local time
        const now = new Date();
        inspectionDateValue = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      }

      // Format current time for created_at/updated_at
      const now = new Date();
      const nowStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

      console.log('📅 inspection_date input:', data.inspection_date, '-> output:', inspectionDateValue);
      console.log('🔧 Executing inspectiondata create query:', { inspection_no: data.inspection_no });

      // Use raw SQL to bypass Drizzle's timestamp handling (which converts to UTC)
      const result = await this.db.execute(sql`
        INSERT INTO inspectiondata (
          station, inspection_no, inspection_no_ref, inspection_date, fy, ww, month_year,
          shift, lotno, partsite, itemno, model, version, fvilineno, mclineno,
          round, qc_id, fvi_lot_qty, general_sampling_qty, crack_sampling_qty,
          sampling_reason_id, judgment, color, created_by, updated_by, created_at, updated_at
        ) VALUES (
          ${data.station},
          ${data.inspection_no},
          ${data.inspection_no_ref || ''},
          ${inspectionDateValue}::timestamp,
          ${data.fy},
          ${this.formatWorkWeek(data.ww)},
          ${data.month_year},
          ${data.shift},
          ${data.lotno},
          ${data.partsite},
          ${data.itemno},
          ${data.model},
          ${data.version},
          ${data.fvilineno},
          ${data.mclineno || ''},
          ${data.round || 0},
          ${data.qc_id || 0},
          ${data.fvi_lot_qty || 0},
          ${data.general_sampling_qty || 0},
          ${data.crack_sampling_qty || 0},
          ${data.sampling_reason_id || 0},
          ${data.judgment !== undefined ? data.judgment : null},
          ${data.color || null},
          ${userId || 0},
          ${userId || 0},
          ${nowStr}::timestamp,
          ${nowStr}::timestamp
        )
        RETURNING *
      `);

      // Raw SQL returns { rows: [...] }
      const rows = (result as any).rows || result;
      if (rows && rows.length > 0) {
        console.log('✅ InspectionData created successfully');
        // Map snake_case columns from raw SQL to camelCase for mapDrizzleToEntity
        const row = rows[0];
        const mappedRow = {
          id: row.id,
          station: row.station,
          inspectionNo: row.inspection_no,
          inspectionNoRef: row.inspection_no_ref,
          inspectionDate: row.inspection_date,
          fy: row.fy,
          ww: row.ww,
          monthYear: row.month_year,
          samplingReasonId: row.sampling_reason_id,
          shift: row.shift,
          lotno: row.lotno,
          partsite: row.partsite,
          mclineno: row.mclineno,
          itemno: row.itemno,
          model: row.model,
          version: row.version,
          fvilineno: row.fvilineno,
          round: row.round,
          qcId: row.qc_id,
          fviLotQty: row.fvi_lot_qty,
          generalSamplingQty: row.general_sampling_qty,
          crackSamplingQty: row.crack_sampling_qty,
          color: row.color,
          judgment: row.judgment,
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
        error: 'Failed to create inspection data'
      };
    } catch (error: any) {
      console.error('❌ Error creating inspection data:', error);

      if (error.code === '23505') {
        return {
          success: false,
          error: 'Inspection number already exists'
        };
      }

      return {
        success: false,
        error: error.message || 'Database error occurred'
      };
    }
  }

  /**
   * Update inspection data by id
   * Uses raw SQL to bypass Drizzle's timestamp UTC conversion
   */
  async update(keyValues: Record<string, any>, data: UpdateInspectionDataRequest, userId: number): Promise<{ success: boolean; data?: InspectionData; error?: string }> {
    try {
      const { id } = keyValues;

      if (!id) {
        return {
          success: false,
          error: 'ID is required for update'
        };
      }

      // Format updated_at as local time string
      const now = new Date();
      const nowStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

      // Format inspection_date if provided
      let inspectionDateValue: string | null = null;
      if (data.inspection_date !== undefined) {
        if (data.inspection_date instanceof Date) {
          const d = data.inspection_date;
          inspectionDateValue = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
        } else {
          inspectionDateValue = String(data.inspection_date);
        }
        console.log('📅 Update inspection_date:', data.inspection_date, '->', inspectionDateValue);
      }

      console.log('🔧 Executing inspectiondata update query:', { id });

      // Use raw SQL with all fields to bypass Drizzle timestamp handling
      const result = await this.db.execute(sql`
        UPDATE inspectiondata SET
          updated_by = ${userId},
          updated_at = ${nowStr}::timestamp,
          station = COALESCE(${data.station ?? null}, station),
          inspection_no = COALESCE(${data.inspection_no ?? null}, inspection_no),
          inspection_date = COALESCE(${inspectionDateValue}::timestamp, inspection_date),
          fy = COALESCE(${data.fy ?? null}, fy),
          ww = COALESCE(${data.ww ? this.formatWorkWeek(data.ww) : null}, ww),
          month_year = COALESCE(${data.month_year ?? null}, month_year),
          shift = COALESCE(${data.shift ?? null}, shift),
          lotno = COALESCE(${data.lotno ?? null}, lotno),
          partsite = COALESCE(${data.partsite ?? null}, partsite),
          itemno = COALESCE(${data.itemno ?? null}, itemno),
          model = COALESCE(${data.model ?? null}, model),
          version = COALESCE(${data.version ?? null}, version),
          fvilineno = COALESCE(${data.fvilineno ?? null}, fvilineno),
          mclineno = COALESCE(${data.mclineno ?? null}, mclineno),
          round = COALESCE(${data.round ?? null}, round),
          qc_id = COALESCE(${data.qc_id ?? null}, qc_id),
          fvi_lot_qty = COALESCE(${data.fvi_lot_qty ?? null}, fvi_lot_qty),
          general_sampling_qty = COALESCE(${data.general_sampling_qty ?? null}, general_sampling_qty),
          crack_sampling_qty = COALESCE(${data.crack_sampling_qty ?? null}, crack_sampling_qty),
          judgment = COALESCE(${data.judgment ?? null}, judgment),
          color = COALESCE(${data.color ?? null}, color),
          sampling_reason_id = COALESCE(${data.sampling_reason_id ?? null}, sampling_reason_id)
        WHERE id = ${id}
        RETURNING *
      `);

      // Raw SQL returns { rows: [...] }
      const rows = (result as any).rows || result;
      if (rows && rows.length > 0) {
        console.log('✅ InspectionData updated successfully');
        const row = rows[0];
        const mappedRow = {
          id: row.id,
          station: row.station,
          inspectionNo: row.inspection_no,
          inspectionNoRef: row.inspection_no_ref,
          inspectionDate: row.inspection_date,
          fy: row.fy,
          ww: row.ww,
          monthYear: row.month_year,
          samplingReasonId: row.sampling_reason_id,
          shift: row.shift,
          lotno: row.lotno,
          partsite: row.partsite,
          mclineno: row.mclineno,
          itemno: row.itemno,
          model: row.model,
          version: row.version,
          fvilineno: row.fvilineno,
          round: row.round,
          qcId: row.qc_id,
          fviLotQty: row.fvi_lot_qty,
          generalSamplingQty: row.general_sampling_qty,
          crackSamplingQty: row.crack_sampling_qty,
          color: row.color,
          judgment: row.judgment,
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
        error: 'Inspection data not found'
      };
    } catch (error: any) {
      console.error('❌ Error updating inspection data:', error);
      return {
        success: false,
        error: error.message || 'Database error occurred'
      };
    }
  }

  /**
   * Update inspection SIV by id to default
   */
  async updateFviToDefault(sivNo: string): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await this.db
        .update(inspectiondata)
        .set({
          shift: '',
          fvilineno: '',
          qcId: null,
          generalSamplingQty: null,
          crackSamplingQty: null,
          judgment: null
        })
        .where(and(
          eq(inspectiondata.station, 'SIV'),
          eq(inspectiondata.inspectionNo, sivNo)
        ))
        .returning();

      if (result.length > 0) {
        console.log('✅ InspectionData update FVI record to default successfully');
        return { success: true };
      }

      return {
        success: false,
        error: 'Inspection data not found'
      };
    } catch (error: any) {
      console.error('❌ Error update FVI record to default inspection data:', error);
      return {
        success: false,
        error: error.message || 'Database error occurred'
      };
    }
  }

  /**
   * Get all SGT customer part numbers from v_part_sgt view
   */
  async getPartsSGT(): Promise<string[]> {
    try {
      const result = await this.db.execute(sql`SELECT partno FROM v_part_sgt`);
      const rows = (result as any).rows || result;
      return Array.isArray(rows) ? rows.map((r: any) => r.partno) : [];
    } catch (error: any) {
      console.error('❌ Error fetching v_part_sgt:', error);
      return [];
    }
  }

  /**
   * Check if a part number belongs to SGT customer (exists in v_part_sgt view)
   */
  async isPartSGT(itemno: string): Promise<boolean> {
    try {
      const result = await this.db.execute(
        sql`SELECT 1 FROM v_part_sgt WHERE partno = ${itemno} LIMIT 1`
      );
      return (result as any).rows?.length > 0 || (Array.isArray(result) && result.length > 0);
    } catch (error: any) {
      console.error('❌ Error checking v_part_sgt:', error);
      return false;
    }
  }

  /**
   * Delete inspection data by id
   */
  async delete(
    keyValues: Record<string, any>,
    actor: SessionUserLite | null = null,
    req?: Request
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { id } = keyValues;

      if (!id) {
        return {
          success: false,
          error: 'ID is required for deletion'
        };
      }

      return await this.db.transaction(async (tx: any) => {
        const [deleted] = await tx
          .delete(inspectiondata)
          .where(eq(inspectiondata.id, id))
          .returning();

        if (!deleted) {
          return { success: false, error: 'Inspection data not found' };
        }

        await logDelete(this.db, {
          entity: 'inspectiondata',
          recordId: deleted.id,
          oldValues: deleted as any,
          actor,
          req,
          tx,
        });

        console.log('✅ InspectionData deleted successfully');
        return { success: true };
      });
    } catch (error: any) {
      console.error('❌ Error deleting inspection data:', error);
      return {
        success: false,
        error: error.message || 'Database error occurred'
      };
    }
  }

  /**
   * Check if inspection data exists by id
   */
  async exists(keyValues: Record<string, any>): Promise<boolean> {
    try {
      const { id } = keyValues;

      if (!id) {
        return false;
      }

      const result = await this.db
        .select({ id: inspectiondata.id })
        .from(inspectiondata)
        .where(eq(inspectiondata.id, id))
        .limit(1);

      return result.length > 0;
    } catch (error: any) {
      console.error('InspectionData exists error:', error);
      return false;
    }
  }

  /**
   * Check if an inspection number already exists in the database
   */
  async inspectionNumberExists(inspectionNo: string): Promise<boolean> {
    try {
      if (!inspectionNo || !inspectionNo.trim()) {
        return false;
      }

      console.log(`🔍 Checking if inspection number exists: ${inspectionNo}`);

      const result = await this.db
        .select({ id: inspectiondata.id })
        .from(inspectiondata)
        .where(eq(inspectiondata.inspectionNo, inspectionNo.trim()))
        .limit(1);

      const exists = result.length > 0;
      if (exists) {
        console.log(`⚠️ Inspection number already exists: ${inspectionNo}`);
      } else {
        console.log(`✅ Inspection number is available: ${inspectionNo}`);
      }

      return exists;
    } catch (error: any) {
      console.error('❌ Error checking inspection number existence:', error);
      return false;
    }
  }

  // ==================== CUSTOM METHODS ====================

  /**
   * Get inspection data by lot number
   */
  async getByLotNumber(lotno: string): Promise<InspectionData[]> {
    try {
      const rows = await this.db
        .select()
        .from(inspectiondata)
        .where(eq(inspectiondata.lotno, lotno))
        .orderBy(desc(inspectiondata.id));

      return rows.map(row => mapDrizzleToEntity(row));
    } catch (error: any) {
      console.error('❌ Error in getByLotNumber:', error);
      throw error;
    }
  }

  /**
   * Get inspection data by inspection number
   */
  async getByInspectionNo(inspectionNo: string): Promise<InspectionData | null> {
    try {
      const rows = await this.db
        .select()
        .from(inspectiondata)
        .where(eq(inspectiondata.inspectionNo, inspectionNo))
        .limit(1);

      return rows.length > 0 ? mapDrizzleToEntity(rows[0]) : null;
    } catch (error: any) {
      console.error('❌ Error in getByInspectionNo:', error);
      throw error;
    }
  }

  /**
   * Get the current sampling round count for a given station and lotno
   */
  async getSamplingRoundCount(station: string, lotno: string): Promise<number> {
    try {
      console.log('🔧 Getting sampling round count:', { station, lotno });

      const result = await this.db
        .select({ maxRound: sql<number>`COALESCE(MAX(${inspectiondata.round}), 0)::int` })
        .from(inspectiondata)
        .where(and(
          eq(inspectiondata.station, station),
          eq(inspectiondata.lotno, lotno)
        ));

      const maxRound = result[0]?.maxRound || 0;
      console.log(`✅ Current max round for station=${station}, lotno=${lotno}: ${maxRound}`);

      return maxRound;
    } catch (error: any) {
      console.error('❌ Error getting sampling round count:', error);
      return 0;
    }
  }

  /**
   * Generate next inspection number with format: Station+FiscalYY+MM+W+WW+'-'+DD+RunningNumber4digit
   */
  async generateInspectionNumber(station: string, date: Date | string, wwNumber: string): Promise<string> {
    try {
      // Uses toDate() to preserve local timezone
      const dateObj = toDate(date);

      const fiscalYear = getFiscalYear(dateObj, 6);
      const fiscalYearYY = fiscalYear.toString().slice(-2);
      const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
      const day = dateObj.getDate().toString().padStart(2, '0');
      const formattedWW = `${String(wwNumber).padStart(2, '0')}`;
      const prefix = `${station}${fiscalYearYY}${month}${formattedWW}-${day}`;

      console.log('🔧 Generating inspection number for:', {
        station,
        date: formatDateLocal(dateObj),
        fiscalYear,
        fiscalYearYY,
        month,
        wwNumber,
        formattedWW,
        prefix
      });

      const result = await this.db
        .select({ inspectionNo: inspectiondata.inspectionNo })
        .from(inspectiondata)
        .where(like(inspectiondata.inspectionNo, `${prefix}%`))
        .orderBy(desc(inspectiondata.inspectionNo));

      let runningNumber = 1;
      if (result.length > 0) {
        let maxRunning = 0;
        for (const row of result) {
          const inspectionNo = row.inspectionNo;
          if (inspectionNo) {
            const runningStr = inspectionNo.substring(inspectionNo.length - 4);
            const running = parseInt(runningStr, 10);
            if (!isNaN(running) && running > maxRunning) {
              maxRunning = running;
            }
          }
        }
        runningNumber = maxRunning + 1;
        console.log(`📊 Found ${result.length} existing records, max running: ${maxRunning}, next: ${runningNumber}`);
      }

      const inspectionNo = `${prefix}${runningNumber.toString().padStart(4, '0')}`;
      console.log(`✅ Generated inspection number: ${inspectionNo}`);

      return inspectionNo;
    } catch (error: any) {
      console.error('❌ Error generating inspection number:', error);
      // Uses toDate() in catch block too
      const fallbackDate = toDate(date);
      const fiscalYear = getFiscalYear(fallbackDate, 6);
      const fiscalYearYY = fiscalYear.toString().slice(-2);
      const month = (fallbackDate.getMonth() + 1).toString().padStart(2, '0');
      const day = fallbackDate.getDate().toString().padStart(2, '0');
      const formattedWW = `W${String(wwNumber).padStart(2, '0')}`;
      const timestamp = Date.now().toString().slice(-4);
      return `${station}${fiscalYearYY}${month}${formattedWW}-${day}${timestamp}`;
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Format work week as 2-digit string
   */
  private formatWorkWeek(ww: string | number): string {
    return String(ww).padStart(2, '0');
  }

  /**
   * Get defects for a specific inspection with images
   */
  async getDefectsForInspection(inspection_no: string): Promise<any[]> {
    try {
      // This uses raw SQL since it involves bytea image data
      // For now, delegate to raw query
      const result = await this.db.execute(sql`
        SELECT
          dd.*,
          d.name as defect_name
        FROM defectdata dd
        LEFT JOIN defects d ON dd.defect_id = d.id
        WHERE dd.inspection_no = ${inspection_no}
        ORDER BY dd.id DESC
      `);

      // For images, we need raw queries due to bytea encoding
      const defectsWithImages = await Promise.all(
        (result.rows as any[]).map(async (defect) => {
          try {
            const imageResult = await this.db.execute(sql`
              SELECT id, encode(imge_data, 'base64') as image_data
              FROM defect_image
              WHERE defect_id = ${defect.id}
              ORDER BY id
            `);

            const imageUrls = (imageResult.rows as any[]).map((img: any) =>
              `data:image/jpeg;base64,${img.image_data}`
            );

            return {
              ...defect,
              image_urls: imageUrls
            };
          } catch (error: any) {
            console.error(`Error loading images for defect ${defect.id}:`, error);
            return {
              ...defect,
              image_urls: []
            };
          }
        })
      );

      return defectsWithImages;
    } catch (error: any) {
      console.error('Error fetching defects for inspection:', error);
      return [];
    }
  }

  /**
   * Get defects for a specific inspection with images - Customer view
   */
  async getDefectsCustomerForInspection(inspection_no: string): Promise<any[]> {
    try {
      const result = await this.db.execute(sql`
        SELECT
          dd.*,
          d.name as defect_name
        FROM defectdata_customer dd
        LEFT JOIN defects d ON dd.defect_id = d.id
        WHERE dd.inspection_no = ${inspection_no}
        ORDER BY dd.id DESC
      `);

      const defectsWithImages = await Promise.all(
        (result.rows as any[]).map(async (defect) => {
          try {
            const imageResult = await this.db.execute(sql`
              SELECT id, encode(imge_data, 'base64') as image_data
              FROM defect_customer_image
              WHERE defect_id = ${defect.id}
              ORDER BY id
            `);

            const imageUrls = (imageResult.rows as any[]).map((img: any) =>
              `data:image/jpeg;base64,${img.image_data}`
            );

            return {
              ...defect,
              image_urls: imageUrls
            };
          } catch (error: any) {
            console.error(`Error loading images for defect ${defect.id}:`, error);
            return {
              ...defect,
              image_urls: []
            };
          }
        })
      );

      return defectsWithImages;
    } catch (error: any) {
      console.error('Error fetching defects for inspection:', error);
      return [];
    }
  }

  /**
   * Get all inspection data with defects included (with pagination)
   */
  async getAllWithDefects(searchTerm?: string, options?: {
    page?: number;
    limit?: number;
    station?: string;
    inspectionDateFrom?: string;
    inspectionDateTo?: string;
  }): Promise<InspectionData[]> {
    try {
      const inspections = await this.getAll(searchTerm, options);

      return inspections.map(inspection => ({
        ...inspection,
        defects: []
      }));
    } catch (error: any) {
      console.error('InspectionData getAllWithDefects error:', error);
      throw new Error(`Failed to get inspection data with defects: ${error.message}`);
    }
  }

  /**
   * Get station-specific statistics for dashboard
   */
  async getStationStatistics(station: string): Promise<{
    total: number;
    this_year: number;
    this_month: number;
    this_week: number;
    today: number;
  }> {
    try {
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth() + 1;
      const currentWeek = this.getCurrentWeekNumber(today);
      const monthStart = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
      const todayStr = formatDateLocal(today);

      const result = await this.db
        .select({
          total: sql<number>`count(*)::int`,
          thisYear: sql<number>`count(CASE WHEN EXTRACT(YEAR FROM ${inspectiondata.inspectionDate}) = ${currentYear} THEN 1 END)::int`,
          thisMonth: sql<number>`count(CASE WHEN ${inspectiondata.inspectionDate} >= ${monthStart}::date THEN 1 END)::int`,
          thisWeek: sql<number>`count(CASE WHEN ${inspectiondata.ww} = ${String(currentWeek).padStart(2, '0')} THEN 1 END)::int`,
          today: sql<number>`count(CASE WHEN DATE(${inspectiondata.inspectionDate}) = ${todayStr}::date THEN 1 END)::int`
        })
        .from(inspectiondata)
        .where(eq(inspectiondata.station, station));

      return {
        total: result[0]?.total || 0,
        this_year: result[0]?.thisYear || 0,
        this_month: result[0]?.thisMonth || 0,
        this_week: result[0]?.thisWeek || 0,
        today: result[0]?.today || 0
      };
    } catch (error) {
      console.error(`Error getting station statistics for ${station}:`, error);
      throw error;
    }
  }

  /**
   * Get weekly trend data for charts
   */
  async getWeeklyTrend(
    station: string,
    fiscalYearWeek: string
  ): Promise<Array<{
    ww: string;
    total: number;
    pass: number;
    fail: number;
  }>> {
    try {
      const result = await this.db.execute(sql`
        SELECT
          (w.fiscal_year || w.ww) AS fyww,
          w.fiscal_year AS year,
          w.ww,
          COUNT(i.id)::int AS total,
          COUNT(CASE WHEN i.judgment = true THEN 1 END)::int AS pass,
          COUNT(CASE WHEN i.judgment = false THEN 1 END)::int AS fail
        FROM fiscal_calendar w
          INNER JOIN ${inspectiondata} i ON i.inspection_date::date = w.calendar_date
        WHERE i.station = ${station}
          AND (w.fiscal_year || w.ww) <= ${fiscalYearWeek}
        GROUP BY w.fiscal_year, w.ww
        ORDER BY w.fiscal_year DESC, w.ww DESC
        LIMIT 4
      `);

      console.log('🔧 get weekly trend for station:', station, 'fiscalYearWeek:', fiscalYearWeek);

      return (result.rows as any[]).reverse();
    } catch (error) {
      console.error(`Error getting weekly trend for ${station}:`, error);
      throw error;
    }
  }

  /**
   * Helper: Get current week number
   */
  private getCurrentWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }
  /**
   * Get SIV format data from v_sivformat view
   * Supports same filter parameters as getAll for consistent export
   */
  async getSIVFormat(params: {
    inspection_date_from?: string;
    inspection_date_to?: string;
    searchTerm?: string;
    judgment?: string;
    model?: string;
    lotno?: string;
    fvilineno?: string;
    partsite?: string;
  }): Promise<any[]> {
    try {
      const conditions: string[] = [`i.station = 'SIV'`];
      const values: any[] = [];
      let paramIndex = 1;

      if (params.inspection_date_from) {
        conditions.push(`i.inspection_date >= $${paramIndex}::timestamp`);
        values.push(`${params.inspection_date_from} 00:00:00`);
        paramIndex++;
      }
      if (params.inspection_date_to) {
        conditions.push(`i.inspection_date <= $${paramIndex}::timestamp`);
        values.push(`${params.inspection_date_to} 23:59:59.999`);
        paramIndex++;
      }

      // Search term filter
      if (params.searchTerm && params.searchTerm.trim()) {
        const searchPattern = `%${params.searchTerm.trim()}%`;
        conditions.push(`(
          i.lotno ILIKE $${paramIndex}
          OR i.itemno ILIKE $${paramIndex}
          OR i.mclineno ILIKE $${paramIndex}
          OR i.fvilineno ILIKE $${paramIndex}
        )`);
        values.push(searchPattern);
        paramIndex++;
      }

      // Judgment filter
      if (params.judgment && params.judgment !== 'all') {
        if (params.judgment === 'pending') {
          conditions.push(`i.judgment IS NULL`);
        } else if (params.judgment === 'pass') {
          conditions.push(`i.judgment = true`);
        } else if (params.judgment === 'reject') {
          conditions.push(`i.judgment = false`);
        }
      }

      // Model filter
      if (params.model && params.model !== 'All' && params.model.trim()) {
        conditions.push(`(i.model || ' ' || i.version) = $${paramIndex}`);
        values.push(params.model.trim());
        paramIndex++;
      }

      // Lotno filter
      if (params.lotno && params.lotno.trim()) {
        conditions.push(`i.lotno ILIKE $${paramIndex}`);
        values.push(`%${params.lotno.trim()}%`);
        paramIndex++;
      }

      // FVI Line filter
      if (params.fvilineno && params.fvilineno.trim()) {
        conditions.push(`i.fvilineno ILIKE $${paramIndex}`);
        values.push(`%${params.fvilineno.trim()}%`);
        paramIndex++;
      }

      // Partsite filter
      if (params.partsite && params.partsite.trim()) {
        conditions.push(`i.partsite = $${paramIndex}`);
        values.push(params.partsite.trim());
        paramIndex++;
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const query = `
        SELECT
          q.name AS qc_name,
          i.ww,
          i.inspection_date,
          i.round,
          i.itemno,
          p.tab,
          i.lotno,
          i.fvi_lot_qty,
          i.color,
          ''::text AS groupcolorqty,
          i.general_sampling_qty,
          d.ng_qty,
          d.traynos AS trayno,
          d.tray_positions AS tray_position,
          c.name AS creaete_name,
          m.name AS modify_name,
          i.judgment,
          d.description AS defect_name,
          i.mclineno,
          i.fvilineno,
          i.partsite
        FROM inspectiondata i
        LEFT JOIN parts p ON p.partno::text = i.itemno::text
        LEFT JOIN users q ON q.id = i.qc_id
        LEFT JOIN users c ON c.id = i.created_by
        LEFT JOIN users m ON m.id = i.updated_by
        LEFT JOIN (
          SELECT
            d_1.inspection_no,
            SUM(d_1.ng_qty) AS ng_qty,
            m_inner.traynos,
            m_inner.tray_positions,
            d_1.defect_type,
            t.description
          FROM defectdata d_1
          JOIN defects t ON t.id = d_1.defect_id
          LEFT JOIN (
            SELECT
              defect_id,
              string_agg(DISTINCT trayno, ', ') AS traynos,
              string_agg(DISTINCT tray_position, ', ') AS tray_positions
            FROM defect_image
            GROUP BY defect_id
          ) m_inner ON m_inner.defect_id = d_1.id
          GROUP BY d_1.inspection_no, m_inner.traynos, m_inner.tray_positions, d_1.defect_type, t.description
        ) d ON d.inspection_no::text = i.inspection_no::text
        ${whereClause}
        ORDER BY i.inspection_date, i.lotno
      `;

      const result = await this.db.execute(sql.raw(
        query.replace(/\$(\d+)/g, (_, i) => {
          const val = values[parseInt(i) - 1];
          if (val === null || val === undefined) return 'NULL';
          return `'${String(val).replace(/'/g, "''")}'`;
        })
      ));

      return (result as any).rows || result || [];
    } catch (error) {
      console.error('Error in getSIVFormat:', error);
      throw error;
    }
  }
}

// ==================== FACTORY FUNCTION ====================

/**
 * Factory function to create a Drizzle inspection data model instance
 */
export function createInspectionDataModel(db: DrizzleDb): InspectionDataModel {
  return new InspectionDataModel(db);
}

export default InspectionDataModel;
