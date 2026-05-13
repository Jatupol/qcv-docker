// server/src/entities/defectdata/model-drizzle.ts
/* DefectData Entity Model - Drizzle ORM Implementation
 * SPECIAL Pattern Implementation (SERIAL Primary Key)
 *
 * This is the Drizzle ORM version of the DefectDataModel.
 * It provides the same interface as the original model but uses Drizzle ORM.
 *
 * Migration Notes:
 * - Same interface as original DefectDataModel
 * - Uses Drizzle schema and query builder
 * - Enabled via DRIZZLE_DEFECTDATA=true in .env
 */

import { eq, like, or, and, sql, desc, asc, ilike, gte, lte, inArray, getTableColumns } from 'drizzle-orm';
import type { Request } from 'express';
import { formatDateTimeLocal } from '../../utils/dateTimeUtils';
import { logDelete, SessionUserLite } from '../../utils/auditLogger';
import { DrizzleDb } from '../../db';
import {
  defectdata,
  Defectdata as DrizzleDefectdata,
  NewDefectdata,
  defects
} from '../../db/schema';

// Get table columns for type-safe spread in select queries
const defectdataColumns = getTableColumns(defectdata);
import {
  DefectData,
  DefectDetail,
  DefectEmail,
  CreateDefectDataRequest,
  UpdateDefectDataRequest,
  DefectDataQueryOptions,
  DefectDataSummary,
  DefectDataProfile,
  DefectDataTrend,
  InspectorPerformance,
  DEFAULT_DEFECTDATA_CONFIG
} from './types';

// ==================== TYPE MAPPING ====================

/**
 * Map Drizzle result to DefectData entity
 */
function mapDrizzleToEntity(
  row: DrizzleDefectdata & { defect_name?: string | null; defect_description?: string | null }
): DefectData {
  return {
    id: row.id,
    inspection_no: row.inspectionNo ?? '',
    defect_date: row.defectDate ?? new Date(),
    qc_name: row.qcName ?? '',
    qclead_name: row.qcleadName ?? '',
    mbr_name: row.mbrName ?? '',
    linevi: row.linevi ?? '',
    groupvi: row.groupvi ?? '',
    station: row.station ?? '',
    inspector: row.inspector ?? '',
    defect_id: row.defectId ?? 0,
    defect_detail: row.defectDetail || undefined,
    ng_qty: row.ngQty ?? 0,
    trayno: row.trayno || undefined,
    tray_position: row.trayPosition || undefined,
    color: row.color || undefined,
    is_active: true,
    created_by: row.createdBy ?? 0,
    updated_by: row.updatedBy ?? 0,
    created_at: row.createdAt ?? new Date(),
    updated_at: row.updatedAt ?? new Date()
  };
}

// ==================== DEFECTDATA MODEL CLASS (DRIZZLE) ====================

/**
 * DefectData Entity Model - Drizzle ORM Version
 *
 * Data access layer for defect data management using Drizzle ORM.
 * Provides defect data-specific database operations with type-safe queries.
 */
export class DefectDataModel {
  private db: DrizzleDb;
  private config = DEFAULT_DEFECTDATA_CONFIG;

  constructor(db: DrizzleDb) {
    this.db = db;
  }

  // ==================== CRUD OPERATIONS ====================

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

    // Format Date object as local time string
    const d = date;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
  }

  /**
   * Create new defect data record
   * Uses raw SQL to bypass Drizzle's timestamp UTC conversion
   */
  async create(data: CreateDefectDataRequest, userId?: number): Promise<DefectData> {
    try {
      // Format datetime as local time string to preserve local timezone
      const defectDateValue = this.formatLocalDateTime(data.defect_date);
      const nowStr = this.formatLocalDateTime(new Date());

      console.log('📅 defect_date input:', data.defect_date, '-> output:', defectDateValue);
      console.log('🔧 Executing defectdata create query:', { inspection_no: data.inspection_no });

      // Use raw SQL to bypass Drizzle's timestamp handling
      const result = await this.db.execute(sql`
        INSERT INTO defectdata (
          inspection_no, defect_date, qc_name, qclead_name, mbr_name,
          linevi, groupvi, station, inspector, defect_id, defect_detail,
          ng_qty, trayno, tray_position, color, defect_type,
          created_by, updated_by, created_at, updated_at
        ) VALUES (
          ${data.inspection_no},
          ${defectDateValue}::timestamp,
          ${data.qc_name},
          ${data.qclead_name},
          ${data.mbr_name},
          ${data.linevi},
          ${data.groupvi},
          ${data.station},
          ${data.inspector},
          ${data.defect_id},
          ${data.defect_detail || null},
          ${data.ng_qty || 0},
          ${data.trayno || null},
          ${data.tray_position || null},
          ${data.color || null},
          ${data.defect_type || null},
          ${userId || 0},
          ${userId || 0},
          ${nowStr}::timestamp,
          ${nowStr}::timestamp
        )
        RETURNING *
      `);

      // Raw SQL returns { rows: [...] } with snake_case columns
      const rows = (result as any).rows || result;
      if (rows && rows.length > 0) {
        console.log('✅ DefectData created successfully');
        const row = rows[0];
        // Map snake_case to camelCase for mapDrizzleToEntity
        const mappedRow = {
          id: row.id,
          inspectionNo: row.inspection_no,
          defectDate: row.defect_date,
          qcName: row.qc_name,
          qcleadName: row.qclead_name,
          mbrName: row.mbr_name,
          linevi: row.linevi,
          groupvi: row.groupvi,
          station: row.station,
          inspector: row.inspector,
          defectId: row.defect_id,
          defectDetail: row.defect_detail,
          ngQty: row.ng_qty,
          trayno: row.trayno,
          trayPosition: row.tray_position,
          color: row.color,
          defectType: row.defect_type,
          createdBy: row.created_by,
          updatedBy: row.updated_by,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        };
        return mapDrizzleToEntity(mappedRow as any);
      }

      throw new Error('Failed to create defect data');
    } catch (error: any) {
      console.error('❌ Error creating defect data:', error);
      throw new Error(`Failed to create defect data: ${error.message}`);
    }
  }

  /**
   * Update defect data record
   * Uses raw SQL to bypass Drizzle's timestamp UTC conversion
   */
  async update(id: number, data: UpdateDefectDataRequest, userId?: number): Promise<DefectData | null> {
    try {
      // Format updated_at as local time string
      const nowStr = this.formatLocalDateTime(new Date());

      // Format defect_date if provided
      let defectDateValue: string | null = null;
      if (data.defect_date !== undefined) {
        defectDateValue = this.formatLocalDateTime(data.defect_date);
        console.log('📅 Update defect_date:', data.defect_date, '->', defectDateValue);
      }

      console.log('🔧 Executing defectdata update query:', { id });

      // Use raw SQL with COALESCE to only update provided fields
      const result = await this.db.execute(sql`
        UPDATE defectdata SET
          updated_by = ${userId || 0},
          updated_at = ${nowStr}::timestamp,
          inspection_no = COALESCE(${data.inspection_no ?? null}, inspection_no),
          defect_date = COALESCE(${defectDateValue}::timestamp, defect_date),
          qc_name = COALESCE(${data.qc_name ?? null}, qc_name),
          qclead_name = COALESCE(${data.qclead_name ?? null}, qclead_name),
          mbr_name = COALESCE(${data.mbr_name ?? null}, mbr_name),
          linevi = COALESCE(${data.linevi ?? null}, linevi),
          groupvi = COALESCE(${data.groupvi ?? null}, groupvi),
          station = COALESCE(${data.station ?? null}, station),
          inspector = COALESCE(${data.inspector ?? null}, inspector),
          defect_id = COALESCE(${data.defect_id ?? null}, defect_id),
          defect_detail = COALESCE(${data.defect_detail ?? null}, defect_detail),
          ng_qty = COALESCE(${data.ng_qty ?? null}, ng_qty),
          trayno = COALESCE(${data.trayno ?? null}, trayno),
          tray_position = COALESCE(${data.tray_position ?? null}, tray_position),
          color = COALESCE(${data.color ?? null}, color),
          defect_type = COALESCE(${data.defect_type ?? null}, defect_type)
        WHERE id = ${id}
        RETURNING *
      `);

      // Raw SQL returns { rows: [...] }
      const rows = (result as any).rows || result;
      if (rows && rows.length > 0) {
        console.log('✅ DefectData updated successfully');
        const row = rows[0];
        const mappedRow = {
          id: row.id,
          inspectionNo: row.inspection_no,
          defectDate: row.defect_date,
          qcName: row.qc_name,
          qcleadName: row.qclead_name,
          mbrName: row.mbr_name,
          linevi: row.linevi,
          groupvi: row.groupvi,
          station: row.station,
          inspector: row.inspector,
          defectId: row.defect_id,
          defectDetail: row.defect_detail,
          ngQty: row.ng_qty,
          trayno: row.trayno,
          trayPosition: row.tray_position,
          color: row.color,
          defectType: row.defect_type,
          createdBy: row.created_by,
          updatedBy: row.updated_by,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        };
        return mapDrizzleToEntity(mappedRow as any);
      }

      return null;
    } catch (error: any) {
      console.error('❌ Error updating defect data:', error);
      throw new Error(`Failed to update defect data: ${error.message}`);
    }
  }

  /**
   * Delete Defect data Id
   */
  async delete(
    id: string,
    actor: SessionUserLite | null = null,
    req?: Request
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!id) {
        return {
          success: false,
          error: 'Defect data Id is required for deletion'
        };
      }

      console.log('🔧 Executing defectdata delete query:', { id });

      return await this.db.transaction(async (tx: any) => {
        const [deleted] = await tx
          .delete(defectdata)
          .where(eq(defectdata.id, parseInt(id)))
          .returning();

        if (!deleted) {
          return { success: false, error: 'Defect data not found' };
        }

        await logDelete(this.db, {
          entity: 'defectdata',
          recordId: deleted.id,
          oldValues: deleted as any,
          actor,
          req,
          tx,
        });

        console.log('✅ Defect data deleted successfully');
        return { success: true };
      });
    } catch (error: any) {
      console.error('❌ Error deleting Defect data:', error);
      return {
        success: false,
        error: error.message || 'Database error occurred'
      };
    }
  }

  // ==================== DEFECTDATA-SPECIFIC OPERATIONS ====================

  /**
   * Get defect data by inspection number
   */
  async getByInspectionNo(inspectionNo: string): Promise<DefectData[]> {
    const result = await this.db
      .select({
        ...defectdataColumns,
        defect_name: defects.name,
        defect_description: defects.description
      })
      .from(defectdata)
      .leftJoin(defects, eq(defectdata.defectId, defects.id))
      .where(eq(defectdata.inspectionNo, inspectionNo))
      .orderBy(desc(defectdata.createdAt));

    return result.map(row => mapDrizzleToEntity(row));
  }

  /**
   * Get defect Detail data by inspection number
   * Uses raw SQL for complex view queries
   *
   * PERFORMANCE OPTIMIZATION:
   * - Uses v_defect_image_ids (returns only IDs, not base64 data)
   * - Images are converted to URL paths for lazy loading via /api/defect-image/:id
   * - This reduces payload from ~6MB (5 base64 images) to ~200 bytes (5 IDs)
   */
  async getDetailByInspectionNo(inspectionNo: string): Promise<DefectDetail[]> {
    const result = await this.db.execute(sql`
      SELECT
          v.id, v.inspection_no, v.defect_date, v.inspector, v.qc_name, v.qclead_name
        , v.mbr_name, v.linevi, v.groupvi, v.station, v.trayno, v.tray_position, v.color
        , v.ng_qty, v.defect_detail, v.inspector_fullname, v.qc_fullname, v.qclead_fullname
        , v.mbr_fullname, v.defect_id, v.defect_name, v.defect_description, v.defect_group
        , v.defect_type, v.created_by, v.created_at
        , COALESCE(di.image_ids, '[]'::json) as image_ids
      FROM v_defectdata v
      LEFT JOIN v_defect_image_ids di ON di.defect_id = v.id
      WHERE v.inspection_no = ${inspectionNo}
      ORDER BY v.created_at DESC
    `);

    return (result.rows as any[]).map(row => this.transformRowToDefectDetail(row));
  }

  /**
   * Get defect Email Detail data by defect ID
   */
  async getEmailById(defectId: number): Promise<DefectEmail[]> {
    const result = await this.db.execute(sql`
      SELECT
          v.id, v.inspection_no, v.defect_date, v.inspector, v.qc_name, v.qclead_name
        , v.mbr_name, v.linevi, v.groupvi, i.station, v.trayno, v.tray_position, v.color
        , v.ng_qty, v.defect_detail, v.inspector_fullname, v.qc_fullname, v.qclead_fullname
        , v.mbr_fullname, v.defect_id, v.defect_name, v.defect_description, v.defect_group
        , v.created_by, v.created_at, p.tab, i.lotno, i.model, i.version, i.itemno, i.shift
        , i.fvilineno, i.fy, i.ww, i.month_year, i.qc_id, i.sampling_reason_description
        , i.partsite, i.mclineno, i.round, i.fvi_lot_qty, i.general_sampling_qty
        , i.crack_sampling_qty, i.judgment, v.defect_type, i.sampling_reason_name
        , COALESCE(
            (SELECT json_agg('data:image/jpeg;base64,' || replace(encode(di.imge_data, 'base64'), E'\n', ''))
             FROM defect_image di
             WHERE di.defect_id = v.id),
            '[]'::json
          ) as image_urls
      FROM v_defectdata v
      LEFT JOIN v_inspectiondata i ON i.inspection_no = v.inspection_no
      LEFT JOIN parts p ON p.partno = i.itemno
      WHERE v.id = ${defectId}
      ORDER BY v.created_at DESC
    `);

    return (result.rows as any[]).map(row => this.transformRowToDefectEmail(row));
  }

  /**
   * Get defect data by station and date range
   */
  async getByStationAndDateRange(
    station: string,
    startDate: Date,
    endDate: Date,
    limit: number = 100
  ): Promise<DefectData[]> {
    const result = await this.db
      .select({
        ...defectdataColumns,
        defect_name: defects.name,
        defect_description: defects.description
      })
      .from(defectdata)
      .leftJoin(defects, eq(defectdata.defectId, defects.id))
      .where(and(
        eq(defectdata.station, station),
        sql`${defectdata.defectDate} >= ${formatDateTimeLocal(startDate).replace('T', ' ')}::timestamp`,
        sql`${defectdata.defectDate} <= ${formatDateTimeLocal(endDate).replace('T', ' ')}::timestamp`
      ))
      .orderBy(desc(defectdata.defectDate), desc(defectdata.createdAt))
      .limit(limit);

    return result.map(row => mapDrizzleToEntity(row));
  }

  /**
   * Get defect data by inspector
   */
  async getByInspector(inspector: string, limit: number = 100): Promise<DefectData[]> {
    const result = await this.db
      .select({
        ...defectdataColumns,
        defect_name: defects.name,
        defect_description: defects.description
      })
      .from(defectdata)
      .leftJoin(defects, eq(defectdata.defectId, defects.id))
      .where(eq(defectdata.inspector, inspector))
      .orderBy(desc(defectdata.defectDate), desc(defectdata.createdAt))
      .limit(limit);

    return result.map(row => mapDrizzleToEntity(row));
  }

  /**
   * Get defect data profile with detailed information
   */
  async getProfile(id: number): Promise<DefectDataProfile | null> {
    // Get main record
    const mainResult = await this.db
      .select({
        ...defectdataColumns,
        defect_name: defects.name,
        defect_description: defects.description
      })
      .from(defectdata)
      .leftJoin(defects, eq(defectdata.defectId, defects.id))
      .where(eq(defectdata.id, id))
      .limit(1);

    if (mainResult.length === 0) {
      return null;
    }

    const mainRecord = mapDrizzleToEntity(mainResult[0]) as DefectDataProfile;
    mainRecord.defect_name = mainResult[0].defect_name || undefined;
    mainRecord.defect_description = mainResult[0].defect_description || undefined;

    // Get related records
    const relatedResult = await this.db
      .select({
        ...defectdataColumns,
        defect_name: defects.name
      })
      .from(defectdata)
      .leftJoin(defects, eq(defectdata.defectId, defects.id))
      .where(and(
        eq(defectdata.inspectionNo, mainRecord.inspection_no),
        sql`${defectdata.id} != ${id}`
      ))
      .orderBy(desc(defectdata.createdAt))
      .limit(10);

    mainRecord.related_records = relatedResult.map(row => mapDrizzleToEntity(row));

    // Get summary stats
    const statsResult = await this.db.execute(sql`
      SELECT
        (SELECT COUNT(*) FROM defectdata WHERE inspection_no = ${mainRecord.inspection_no}) as same_inspection_count,
        (SELECT COUNT(*) FROM defectdata WHERE station = ${mainRecord.station}) as same_station_count,
        (SELECT COUNT(*) FROM defectdata WHERE defect_id = ${mainRecord.defect_id}) as same_defect_count
    `);

    const stats = statsResult.rows[0] as any;
    mainRecord.summary_stats = {
      same_inspection_count: parseInt(stats.same_inspection_count),
      same_station_count: parseInt(stats.same_station_count),
      same_defect_count: parseInt(stats.same_defect_count)
    };

    return mainRecord;
  }

  /**
   * Get defect data summary for analytics
   */
  async getSummary(startDate?: Date, endDate?: Date): Promise<DefectDataSummary> {
    const conditions = [];
    if (startDate && endDate) {
      // Use raw SQL to avoid Drizzle's UTC conversion
      const startStr = formatDateTimeLocal(startDate).replace('T', ' ');
      const endStr = formatDateTimeLocal(endDate).replace('T', ' ');
      conditions.push(sql`${defectdata.defectDate} >= ${startStr}::timestamp`);
      conditions.push(sql`${defectdata.defectDate} <= ${endStr}::timestamp`);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get basic counts
    const basicResult = await this.db
      .select({
        total_records: sql<number>`count(*)::int`,
        today_records: sql<number>`count(CASE WHEN ${defectdata.defectDate} >= CURRENT_DATE THEN 1 END)::int`,
        this_week_records: sql<number>`count(CASE WHEN ${defectdata.defectDate} >= date_trunc('week', CURRENT_DATE) THEN 1 END)::int`,
        this_month_records: sql<number>`count(CASE WHEN ${defectdata.defectDate} >= date_trunc('month', CURRENT_DATE) THEN 1 END)::int`,
        total_ng_qty: sql<number>`COALESCE(SUM(${defectdata.ngQty}), 0)::int`,
        latest_record_at: sql<Date>`MAX(${defectdata.defectDate})`
      })
      .from(defectdata)
      .where(whereClause);

    const basicStats = basicResult[0];

    // Get by station
    const stationResult = await this.db
      .select({
        station: defectdata.station,
        count: sql<number>`count(*)::int`,
        total_ng_qty: sql<number>`COALESCE(SUM(${defectdata.ngQty}), 0)::int`,
        defect_types: sql<string[]>`array_agg(DISTINCT ${defects.name})`
      })
      .from(defectdata)
      .leftJoin(defects, eq(defectdata.defectId, defects.id))
      .where(whereClause)
      .groupBy(defectdata.station)
      .orderBy(desc(sql`count(*)`));

    // Get by linevi
    const lineviResult = await this.db
      .select({
        linevi: defectdata.linevi,
        count: sql<number>`count(*)::int`,
        total_ng_qty: sql<number>`COALESCE(SUM(${defectdata.ngQty}), 0)::int`
      })
      .from(defectdata)
      .where(whereClause)
      .groupBy(defectdata.linevi)
      .orderBy(desc(sql`count(*)`));

    // Get by defect type
    const defectResult = await this.db
      .select({
        defect_id: defectdata.defectId,
        defect_name: defects.name,
        count: sql<number>`count(*)::int`,
        total_ng_qty: sql<number>`COALESCE(SUM(${defectdata.ngQty}), 0)::int`
      })
      .from(defectdata)
      .leftJoin(defects, eq(defectdata.defectId, defects.id))
      .where(whereClause)
      .groupBy(defectdata.defectId, defects.name)
      .orderBy(desc(sql`count(*)`))
      .limit(10);

    // Get top inspectors
    const inspectorResult = await this.db
      .select({
        inspector: defectdata.inspector,
        count: sql<number>`count(*)::int`,
        total_ng_qty: sql<number>`COALESCE(SUM(${defectdata.ngQty}), 0)::int`
      })
      .from(defectdata)
      .where(whereClause)
      .groupBy(defectdata.inspector)
      .orderBy(desc(sql`count(*)`))
      .limit(10);

    // Build summary object
    const summary: DefectDataSummary = {
      total_records: basicStats.total_records || 0,
      today_records: basicStats.today_records || 0,
      this_week_records: basicStats.this_week_records || 0,
      this_month_records: basicStats.this_month_records || 0,
      total_ng_qty: basicStats.total_ng_qty || 0,
      latest_record_at: basicStats.latest_record_at,
      by_station: {},
      by_linevi: {},
      by_defect_type: {},
      top_inspectors: []
    };

    stationResult.forEach(row => {
      if (row.station) {
        summary.by_station[row.station] = {
          count: row.count,
          total_ng_qty: row.total_ng_qty,
          defect_types: (row.defect_types || []).filter((type: string | null) => type !== null)
        };
      }
    });

    lineviResult.forEach(row => {
      if (row.linevi) {
        summary.by_linevi[row.linevi] = {
          count: row.count,
          total_ng_qty: row.total_ng_qty
        };
      }
    });

    defectResult.forEach(row => {
      if (row.defect_id) {
        summary.by_defect_type[row.defect_id] = {
          count: row.count,
          total_ng_qty: row.total_ng_qty,
          defect_name: row.defect_name || undefined
        };
      }
    });

    summary.top_inspectors = inspectorResult
      .filter(row => row.inspector !== null)
      .map(row => ({
        inspector: row.inspector!,
        count: row.count,
        total_ng_qty: row.total_ng_qty
      }));

    return summary;
  }

  /**
   * Get defect data trends for charts
   */
  async getTrends(days: number = 7): Promise<DefectDataTrend[]> {
    const result = await this.db.execute(sql`
      SELECT
        DATE(${defectdata.defectDate}) as date,
        COUNT(*)::int as count,
        COALESCE(SUM(${defectdata.ngQty}), 0)::int as total_ng_qty,
        COUNT(DISTINCT ${defectdata.inspectionNo})::int as unique_inspections,
        COUNT(DISTINCT ${defectdata.defectId})::int as unique_defect_types
      FROM ${defectdata}
      WHERE ${defectdata.defectDate} >= CURRENT_DATE - INTERVAL '${sql.raw(String(days))} days'
      GROUP BY DATE(${defectdata.defectDate})
      ORDER BY date DESC
    `);

    return (result.rows as any[]).map(row => ({
      date: new Date(row.date),
      count: parseInt(row.count),
      total_ng_qty: parseInt(row.total_ng_qty),
      unique_inspections: parseInt(row.unique_inspections),
      unique_defect_types: parseInt(row.unique_defect_types)
    }));
  }

  /**
   * Get inspector performance data
   */
  async getInspectorPerformance(inspector: string): Promise<InspectorPerformance | null> {
    const result = await this.db
      .select({
        inspector: defectdata.inspector,
        total_records: sql<number>`count(*)::int`,
        total_ng_qty: sql<number>`COALESCE(SUM(${defectdata.ngQty}), 0)::int`,
        unique_defects_found: sql<number>`COUNT(DISTINCT ${defectdata.defectId})::int`,
        stations_covered: sql<string[]>`array_agg(DISTINCT ${defectdata.station})`,
        lines_covered: sql<string[]>`array_agg(DISTINCT ${defectdata.linevi})`,
        avg_ng_per_record: sql<number>`AVG(${defectdata.ngQty})`,
        latest_record_at: sql<Date>`MAX(${defectdata.defectDate})`
      })
      .from(defectdata)
      .where(eq(defectdata.inspector, inspector))
      .groupBy(defectdata.inspector);

    if (result.length === 0) {
      return null;
    }

    const row = result[0];
    return {
      inspector: row.inspector || '',
      total_records: row.total_records,
      total_ng_qty: row.total_ng_qty,
      unique_defects_found: row.unique_defects_found,
      stations_covered: row.stations_covered || [],
      lines_covered: row.lines_covered || [],
      avg_ng_per_record: parseFloat(String(row.avg_ng_per_record)) || 0,
      latest_record_at: row.latest_record_at
    };
  }

  /**
   * Check if inspection number exists
   */
  async inspectionNumberExists(inspectionNo: string): Promise<boolean> {
    const result = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(defectdata)
      .where(eq(defectdata.inspectionNo, inspectionNo));

    return (result[0]?.count || 0) > 0;
  }

  /**
   * Validate defect ID exists
   */
  async validateDefectId(defectId: number): Promise<boolean> {
    const result = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(defects)
      .where(eq(defects.id, defectId));

    return (result[0]?.count || 0) > 0;
  }

  /**
   * Get defect data by multiple filters
   */
  async getByFilters(filters: DefectDataQueryOptions): Promise<{ data: DefectData[]; total: number }> {
    const conditions = [];

    if (filters.inspection_no) {
      conditions.push(eq(defectdata.inspectionNo, filters.inspection_no));
    }

    if (filters.station) {
      conditions.push(eq(defectdata.station, filters.station));
    }

    if (filters.linevi) {
      conditions.push(eq(defectdata.linevi, filters.linevi));
    }

    if (filters.inspector) {
      conditions.push(eq(defectdata.inspector, filters.inspector));
    }

    if (filters.defect_id) {
      conditions.push(eq(defectdata.defectId, filters.defect_id));
    }

    if (filters.defect_date_from) {
      // Use raw SQL to avoid Drizzle's UTC conversion
      const fromDateStr = `${filters.defect_date_from} 00:00:00`;
      conditions.push(sql`${defectdata.defectDate} >= ${fromDateStr}::timestamp`);
    }

    if (filters.defect_date_to) {
      // Use raw SQL to avoid Drizzle's UTC conversion
      const toDateStr = `${filters.defect_date_to} 23:59:59.999`;
      conditions.push(sql`${defectdata.defectDate} <= ${toDateStr}::timestamp`);
    }

    if (filters.ng_qty_min !== undefined) {
      conditions.push(gte(defectdata.ngQty, filters.ng_qty_min));
    }

    if (filters.ng_qty_max !== undefined) {
      conditions.push(lte(defectdata.ngQty, filters.ng_qty_max));
    }

    if (filters.search) {
      const searchPattern = `%${filters.search}%`;
      conditions.push(
        or(
          ilike(defectdata.inspectionNo, searchPattern),
          ilike(defectdata.qcName, searchPattern),
          ilike(defectdata.inspector, searchPattern),
          ilike(defectdata.station, searchPattern)
        )!
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const countResult = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(defectdata)
      .where(whereClause);

    const total = countResult[0]?.count || 0;

    // Get data with pagination
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 50, 500);
    const offset = (page - 1) * limit;

    const data = await this.db
      .select({
        ...defectdataColumns,
        defect_name: defects.name,
        defect_description: defects.description
      })
      .from(defectdata)
      .leftJoin(defects, eq(defectdata.defectId, defects.id))
      .where(whereClause)
      .orderBy(desc(defectdata.defectDate))
      .limit(limit)
      .offset(offset);

    return {
      data: data.map(row => mapDrizzleToEntity(row)),
      total
    };
  }

  // ==================== HELPER METHODS ====================

  /**
   * Transform database row to DefectDetail entity
   *
   * PERFORMANCE OPTIMIZATION:
   * - Converts image_ids to URL paths (e.g., /api/defect-image/123)
   * - Images are loaded lazily by the browser, not embedded as base64
   * - This reduces initial payload and enables parallel image loading
   */
  private transformRowToDefectDetail(row: any): DefectDetail {
    let imageUrls: string[] = [];

    // Handle new format: image_ids (array of IDs to convert to URLs)
    if (row.image_ids) {
      let imageIds: number[] = [];
      if (Array.isArray(row.image_ids)) {
        imageIds = row.image_ids;
      } else if (typeof row.image_ids === 'string') {
        try {
          imageIds = JSON.parse(row.image_ids);
        } catch (e) {
          imageIds = [];
        }
      }
      // Convert IDs to API URLs for lazy loading
      imageUrls = imageIds.map(id => `/api/defect-image/${id}`);
    }
    // Fallback: handle legacy format (base64 data URLs)
    else if (row.image_urls) {
      if (Array.isArray(row.image_urls)) {
        imageUrls = row.image_urls;
      } else if (typeof row.image_urls === 'string') {
        try {
          imageUrls = JSON.parse(row.image_urls);
        } catch (e) {
          imageUrls = [row.image_urls];
        }
      }
    }

    return {
      id: row.id,
      inspection_no: row.inspection_no,
      defect_date: new Date(row.defect_date),
      qc_name: row.qc_name,
      qclead_name: row.qclead_name,
      qclead_fullname: row.qclead_fullname,
      mbr_name: row.mbr_name,
      mbr_fullname: row.mbr_fullname,
      inspector_fullname: row.inspector_fullname,
      qc_fullname: row.qc_fullname,
      linevi: row.linevi,
      groupvi: row.groupvi,
      station: row.station,
      inspector: row.inspector,
      defect_id: row.defect_id,
      defect_group: row.defect_group,
      defect_name: row.defect_name,
      defect_description: row.defect_description,
      defect_detail: row.defect_detail,
      defect_type: row.defect_type,
      ng_qty: row.ng_qty || 0,
      trayno: row.trayno,
      tray_position: row.tray_position,
      color: row.color,
      created_by: row.created_by,
      created_at: row.created_at,
      image_urls: imageUrls
    };
  }

  /**
   * Transform database row to DefectEmail entity
   */
  private transformRowToDefectEmail(row: any): DefectEmail {
    let imageUrls: string[] = [];
    if (row.image_urls) {
      if (Array.isArray(row.image_urls)) {
        imageUrls = row.image_urls;
      } else if (typeof row.image_urls === 'string') {
        try {
          imageUrls = JSON.parse(row.image_urls);
        } catch (e) {
          imageUrls = [row.image_urls];
        }
      }
    }

    return {
      id: row.id,
      inspection_no: row.inspection_no,
      defect_date: new Date(row.defect_date),
      qc_name: row.qc_name,
      qclead_name: row.qclead_name,
      qclead_fullname: row.qclead_fullname,
      mbr_name: row.mbr_name,
      mbr_fullname: row.mbr_fullname,
      inspector_fullname: row.inspector_fullname,
      qc_fullname: row.qc_fullname,
      linevi: row.linevi,
      groupvi: row.groupvi,
      station: row.station,
      inspector: row.inspector,
      defect_id: row.defect_id,
      defect_group: row.defect_group,
      defect_name: row.defect_name,
      defect_description: row.defect_description,
      defect_detail: row.defect_detail,
      defect_type: row.defect_type,
      ng_qty: row.ng_qty || 0,
      trayno: row.trayno,
      tray_position: row.tray_position,
      color: row.color,
      created_by: row.created_by,
      created_at: row.created_at,
      tab: row.tab,
      lotno: row.lotno,
      model: row.model,
      version: row.version,
      itemno: row.itemno,
      shift: row.shift,
      fvilineno: row.fvilineno,
      image_urls: imageUrls,
      fy: row.fy,
      ww: row.ww,
      month_year: row.month_year,
      qc_id: row.qc_id,
      sampling_reason_description: row.sampling_reason_description,
      sampling_reason_name: row.sampling_reason_name,
      partsite: row.partsite,
      mclineno: row.mclineno,
      round: row.round,
      fvi_lot_qty: row.fvi_lot_qty,
      general_sampling_qty: row.general_sampling_qty,
      crack_sampling_qty: row.crack_sampling_qty,
      judgment: row.judgment,
      fvi_inspected_qty: row.fvi_inspected_qty || 0
    };
  }
}

// ==================== FACTORY FUNCTION ====================

/**
 * Factory function to create a Drizzle defect data model instance
 */
export function createDefectDataModel(db: DrizzleDb): DefectDataModel {
  return new DefectDataModel(db);
}

export default DefectDataModel;
