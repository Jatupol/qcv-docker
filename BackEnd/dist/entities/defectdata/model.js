"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefectDataModel = void 0;
exports.createDefectDataModel = createDefectDataModel;
const drizzle_orm_1 = require("drizzle-orm");
const dateTimeUtils_1 = require("../../utils/dateTimeUtils");
const auditLogger_1 = require("../../utils/auditLogger");
const schema_1 = require("../../db/schema");
const defectdataColumns = (0, drizzle_orm_1.getTableColumns)(schema_1.defectdata);
const types_1 = require("./types");
function mapDrizzleToEntity(row) {
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
class DefectDataModel {
    constructor(db) {
        this.config = types_1.DEFAULT_DEFECTDATA_CONFIG;
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
    async create(data, userId) {
        try {
            const defectDateValue = this.formatLocalDateTime(data.defect_date);
            const nowStr = this.formatLocalDateTime(new Date());
            console.log('📅 defect_date input:', data.defect_date, '-> output:', defectDateValue);
            console.log('🔧 Executing defectdata create query:', { inspection_no: data.inspection_no });
            const result = await this.db.execute((0, drizzle_orm_1.sql) `
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
            const rows = result.rows || result;
            if (rows && rows.length > 0) {
                console.log('✅ DefectData created successfully');
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
                return mapDrizzleToEntity(mappedRow);
            }
            throw new Error('Failed to create defect data');
        }
        catch (error) {
            console.error('❌ Error creating defect data:', error);
            throw new Error(`Failed to create defect data: ${error.message}`);
        }
    }
    async update(id, data, userId) {
        try {
            const nowStr = this.formatLocalDateTime(new Date());
            let defectDateValue = null;
            if (data.defect_date !== undefined) {
                defectDateValue = this.formatLocalDateTime(data.defect_date);
                console.log('📅 Update defect_date:', data.defect_date, '->', defectDateValue);
            }
            console.log('🔧 Executing defectdata update query:', { id });
            const result = await this.db.execute((0, drizzle_orm_1.sql) `
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
            const rows = result.rows || result;
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
                return mapDrizzleToEntity(mappedRow);
            }
            return null;
        }
        catch (error) {
            console.error('❌ Error updating defect data:', error);
            throw new Error(`Failed to update defect data: ${error.message}`);
        }
    }
    async delete(id, actor = null, req) {
        try {
            if (!id) {
                return {
                    success: false,
                    error: 'Defect data Id is required for deletion'
                };
            }
            console.log('🔧 Executing defectdata delete query:', { id });
            return await this.db.transaction(async (tx) => {
                const [deleted] = await tx
                    .delete(schema_1.defectdata)
                    .where((0, drizzle_orm_1.eq)(schema_1.defectdata.id, parseInt(id)))
                    .returning();
                if (!deleted) {
                    return { success: false, error: 'Defect data not found' };
                }
                await (0, auditLogger_1.logDelete)(this.db, {
                    entity: 'defectdata',
                    recordId: deleted.id,
                    oldValues: deleted,
                    actor,
                    req,
                    tx,
                });
                console.log('✅ Defect data deleted successfully');
                return { success: true };
            });
        }
        catch (error) {
            console.error('❌ Error deleting Defect data:', error);
            return {
                success: false,
                error: error.message || 'Database error occurred'
            };
        }
    }
    async getByInspectionNo(inspectionNo) {
        const result = await this.db
            .select({
            ...defectdataColumns,
            defect_name: schema_1.defects.name,
            defect_description: schema_1.defects.description
        })
            .from(schema_1.defectdata)
            .leftJoin(schema_1.defects, (0, drizzle_orm_1.eq)(schema_1.defectdata.defectId, schema_1.defects.id))
            .where((0, drizzle_orm_1.eq)(schema_1.defectdata.inspectionNo, inspectionNo))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.defectdata.createdAt));
        return result.map(row => mapDrizzleToEntity(row));
    }
    async getDetailByInspectionNo(inspectionNo) {
        const result = await this.db.execute((0, drizzle_orm_1.sql) `
      SELECT
          v.id, v.inspection_no, v.defect_date, v.inspector, v.qc_name, v.qclead_name
        , v.mbr_name, v.linevi, v.groupvi, v.station, v.trayno, v.tray_position, v.color
        , v.ng_qty, v.defect_detail, v.inspector_fullname, v.qc_fullname, v.qclead_fullname
        , v.mbr_fullname, v.defect_id, v.defect_name, v.defect_description, v.defect_group
        , v.defect_type, v.created_by, v.created_at
        , i.round
        , COALESCE(di.image_ids, '[]'::json) as image_ids
      FROM v_defectdata v
      LEFT JOIN v_inspectiondata i ON i.inspection_no = v.inspection_no
      LEFT JOIN v_defect_image_ids di ON di.defect_id = v.id
      WHERE v.inspection_no = ${inspectionNo}
      ORDER BY v.created_at DESC
    `);
        return result.rows.map(row => this.transformRowToDefectDetail(row));
    }
    async getEmailById(defectId) {
        const result = await this.db.execute((0, drizzle_orm_1.sql) `
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
        return result.rows.map(row => this.transformRowToDefectEmail(row));
    }
    async getByStationAndDateRange(station, startDate, endDate, limit = 100) {
        const result = await this.db
            .select({
            ...defectdataColumns,
            defect_name: schema_1.defects.name,
            defect_description: schema_1.defects.description
        })
            .from(schema_1.defectdata)
            .leftJoin(schema_1.defects, (0, drizzle_orm_1.eq)(schema_1.defectdata.defectId, schema_1.defects.id))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.defectdata.station, station), (0, drizzle_orm_1.sql) `${schema_1.defectdata.defectDate} >= ${(0, dateTimeUtils_1.formatDateTimeLocal)(startDate).replace('T', ' ')}::timestamp`, (0, drizzle_orm_1.sql) `${schema_1.defectdata.defectDate} <= ${(0, dateTimeUtils_1.formatDateTimeLocal)(endDate).replace('T', ' ')}::timestamp`))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.defectdata.defectDate), (0, drizzle_orm_1.desc)(schema_1.defectdata.createdAt))
            .limit(limit);
        return result.map(row => mapDrizzleToEntity(row));
    }
    async getByInspector(inspector, limit = 100) {
        const result = await this.db
            .select({
            ...defectdataColumns,
            defect_name: schema_1.defects.name,
            defect_description: schema_1.defects.description
        })
            .from(schema_1.defectdata)
            .leftJoin(schema_1.defects, (0, drizzle_orm_1.eq)(schema_1.defectdata.defectId, schema_1.defects.id))
            .where((0, drizzle_orm_1.eq)(schema_1.defectdata.inspector, inspector))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.defectdata.defectDate), (0, drizzle_orm_1.desc)(schema_1.defectdata.createdAt))
            .limit(limit);
        return result.map(row => mapDrizzleToEntity(row));
    }
    async getProfile(id) {
        const mainResult = await this.db
            .select({
            ...defectdataColumns,
            defect_name: schema_1.defects.name,
            defect_description: schema_1.defects.description
        })
            .from(schema_1.defectdata)
            .leftJoin(schema_1.defects, (0, drizzle_orm_1.eq)(schema_1.defectdata.defectId, schema_1.defects.id))
            .where((0, drizzle_orm_1.eq)(schema_1.defectdata.id, id))
            .limit(1);
        if (mainResult.length === 0) {
            return null;
        }
        const mainRecord = mapDrizzleToEntity(mainResult[0]);
        mainRecord.defect_name = mainResult[0].defect_name || undefined;
        mainRecord.defect_description = mainResult[0].defect_description || undefined;
        const relatedResult = await this.db
            .select({
            ...defectdataColumns,
            defect_name: schema_1.defects.name
        })
            .from(schema_1.defectdata)
            .leftJoin(schema_1.defects, (0, drizzle_orm_1.eq)(schema_1.defectdata.defectId, schema_1.defects.id))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.defectdata.inspectionNo, mainRecord.inspection_no), (0, drizzle_orm_1.sql) `${schema_1.defectdata.id} != ${id}`))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.defectdata.createdAt))
            .limit(10);
        mainRecord.related_records = relatedResult.map(row => mapDrizzleToEntity(row));
        const statsResult = await this.db.execute((0, drizzle_orm_1.sql) `
      SELECT
        (SELECT COUNT(*) FROM defectdata WHERE inspection_no = ${mainRecord.inspection_no}) as same_inspection_count,
        (SELECT COUNT(*) FROM defectdata WHERE station = ${mainRecord.station}) as same_station_count,
        (SELECT COUNT(*) FROM defectdata WHERE defect_id = ${mainRecord.defect_id}) as same_defect_count
    `);
        const stats = statsResult.rows[0];
        mainRecord.summary_stats = {
            same_inspection_count: parseInt(stats.same_inspection_count),
            same_station_count: parseInt(stats.same_station_count),
            same_defect_count: parseInt(stats.same_defect_count)
        };
        return mainRecord;
    }
    async getSummary(startDate, endDate) {
        const conditions = [];
        if (startDate && endDate) {
            const startStr = (0, dateTimeUtils_1.formatDateTimeLocal)(startDate).replace('T', ' ');
            const endStr = (0, dateTimeUtils_1.formatDateTimeLocal)(endDate).replace('T', ' ');
            conditions.push((0, drizzle_orm_1.sql) `${schema_1.defectdata.defectDate} >= ${startStr}::timestamp`);
            conditions.push((0, drizzle_orm_1.sql) `${schema_1.defectdata.defectDate} <= ${endStr}::timestamp`);
        }
        const whereClause = conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined;
        const basicResult = await this.db
            .select({
            total_records: (0, drizzle_orm_1.sql) `count(*)::int`,
            today_records: (0, drizzle_orm_1.sql) `count(CASE WHEN ${schema_1.defectdata.defectDate} >= CURRENT_DATE THEN 1 END)::int`,
            this_week_records: (0, drizzle_orm_1.sql) `count(CASE WHEN ${schema_1.defectdata.defectDate} >= date_trunc('week', CURRENT_DATE) THEN 1 END)::int`,
            this_month_records: (0, drizzle_orm_1.sql) `count(CASE WHEN ${schema_1.defectdata.defectDate} >= date_trunc('month', CURRENT_DATE) THEN 1 END)::int`,
            total_ng_qty: (0, drizzle_orm_1.sql) `COALESCE(SUM(${schema_1.defectdata.ngQty}), 0)::int`,
            latest_record_at: (0, drizzle_orm_1.sql) `MAX(${schema_1.defectdata.defectDate})`
        })
            .from(schema_1.defectdata)
            .where(whereClause);
        const basicStats = basicResult[0];
        const stationResult = await this.db
            .select({
            station: schema_1.defectdata.station,
            count: (0, drizzle_orm_1.sql) `count(*)::int`,
            total_ng_qty: (0, drizzle_orm_1.sql) `COALESCE(SUM(${schema_1.defectdata.ngQty}), 0)::int`,
            defect_types: (0, drizzle_orm_1.sql) `array_agg(DISTINCT ${schema_1.defects.name})`
        })
            .from(schema_1.defectdata)
            .leftJoin(schema_1.defects, (0, drizzle_orm_1.eq)(schema_1.defectdata.defectId, schema_1.defects.id))
            .where(whereClause)
            .groupBy(schema_1.defectdata.station)
            .orderBy((0, drizzle_orm_1.desc)((0, drizzle_orm_1.sql) `count(*)`));
        const lineviResult = await this.db
            .select({
            linevi: schema_1.defectdata.linevi,
            count: (0, drizzle_orm_1.sql) `count(*)::int`,
            total_ng_qty: (0, drizzle_orm_1.sql) `COALESCE(SUM(${schema_1.defectdata.ngQty}), 0)::int`
        })
            .from(schema_1.defectdata)
            .where(whereClause)
            .groupBy(schema_1.defectdata.linevi)
            .orderBy((0, drizzle_orm_1.desc)((0, drizzle_orm_1.sql) `count(*)`));
        const defectResult = await this.db
            .select({
            defect_id: schema_1.defectdata.defectId,
            defect_name: schema_1.defects.name,
            count: (0, drizzle_orm_1.sql) `count(*)::int`,
            total_ng_qty: (0, drizzle_orm_1.sql) `COALESCE(SUM(${schema_1.defectdata.ngQty}), 0)::int`
        })
            .from(schema_1.defectdata)
            .leftJoin(schema_1.defects, (0, drizzle_orm_1.eq)(schema_1.defectdata.defectId, schema_1.defects.id))
            .where(whereClause)
            .groupBy(schema_1.defectdata.defectId, schema_1.defects.name)
            .orderBy((0, drizzle_orm_1.desc)((0, drizzle_orm_1.sql) `count(*)`))
            .limit(10);
        const inspectorResult = await this.db
            .select({
            inspector: schema_1.defectdata.inspector,
            count: (0, drizzle_orm_1.sql) `count(*)::int`,
            total_ng_qty: (0, drizzle_orm_1.sql) `COALESCE(SUM(${schema_1.defectdata.ngQty}), 0)::int`
        })
            .from(schema_1.defectdata)
            .where(whereClause)
            .groupBy(schema_1.defectdata.inspector)
            .orderBy((0, drizzle_orm_1.desc)((0, drizzle_orm_1.sql) `count(*)`))
            .limit(10);
        const summary = {
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
                    defect_types: (row.defect_types || []).filter((type) => type !== null)
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
            inspector: row.inspector,
            count: row.count,
            total_ng_qty: row.total_ng_qty
        }));
        return summary;
    }
    async getTrends(days = 7) {
        const result = await this.db.execute((0, drizzle_orm_1.sql) `
      SELECT
        DATE(${schema_1.defectdata.defectDate}) as date,
        COUNT(*)::int as count,
        COALESCE(SUM(${schema_1.defectdata.ngQty}), 0)::int as total_ng_qty,
        COUNT(DISTINCT ${schema_1.defectdata.inspectionNo})::int as unique_inspections,
        COUNT(DISTINCT ${schema_1.defectdata.defectId})::int as unique_defect_types
      FROM ${schema_1.defectdata}
      WHERE ${schema_1.defectdata.defectDate} >= CURRENT_DATE - INTERVAL '${drizzle_orm_1.sql.raw(String(days))} days'
      GROUP BY DATE(${schema_1.defectdata.defectDate})
      ORDER BY date DESC
    `);
        return result.rows.map(row => ({
            date: new Date(row.date),
            count: parseInt(row.count),
            total_ng_qty: parseInt(row.total_ng_qty),
            unique_inspections: parseInt(row.unique_inspections),
            unique_defect_types: parseInt(row.unique_defect_types)
        }));
    }
    async getInspectorPerformance(inspector) {
        const result = await this.db
            .select({
            inspector: schema_1.defectdata.inspector,
            total_records: (0, drizzle_orm_1.sql) `count(*)::int`,
            total_ng_qty: (0, drizzle_orm_1.sql) `COALESCE(SUM(${schema_1.defectdata.ngQty}), 0)::int`,
            unique_defects_found: (0, drizzle_orm_1.sql) `COUNT(DISTINCT ${schema_1.defectdata.defectId})::int`,
            stations_covered: (0, drizzle_orm_1.sql) `array_agg(DISTINCT ${schema_1.defectdata.station})`,
            lines_covered: (0, drizzle_orm_1.sql) `array_agg(DISTINCT ${schema_1.defectdata.linevi})`,
            avg_ng_per_record: (0, drizzle_orm_1.sql) `AVG(${schema_1.defectdata.ngQty})`,
            latest_record_at: (0, drizzle_orm_1.sql) `MAX(${schema_1.defectdata.defectDate})`
        })
            .from(schema_1.defectdata)
            .where((0, drizzle_orm_1.eq)(schema_1.defectdata.inspector, inspector))
            .groupBy(schema_1.defectdata.inspector);
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
    async inspectionNumberExists(inspectionNo) {
        const result = await this.db
            .select({ count: (0, drizzle_orm_1.sql) `count(*)::int` })
            .from(schema_1.defectdata)
            .where((0, drizzle_orm_1.eq)(schema_1.defectdata.inspectionNo, inspectionNo));
        return (result[0]?.count || 0) > 0;
    }
    async validateDefectId(defectId) {
        const result = await this.db
            .select({ count: (0, drizzle_orm_1.sql) `count(*)::int` })
            .from(schema_1.defects)
            .where((0, drizzle_orm_1.eq)(schema_1.defects.id, defectId));
        return (result[0]?.count || 0) > 0;
    }
    async getByFilters(filters) {
        const conditions = [];
        if (filters.inspection_no) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.defectdata.inspectionNo, filters.inspection_no));
        }
        if (filters.station) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.defectdata.station, filters.station));
        }
        if (filters.linevi) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.defectdata.linevi, filters.linevi));
        }
        if (filters.inspector) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.defectdata.inspector, filters.inspector));
        }
        if (filters.defect_id) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.defectdata.defectId, filters.defect_id));
        }
        if (filters.defect_date_from) {
            const fromDateStr = `${filters.defect_date_from} 00:00:00`;
            conditions.push((0, drizzle_orm_1.sql) `${schema_1.defectdata.defectDate} >= ${fromDateStr}::timestamp`);
        }
        if (filters.defect_date_to) {
            const toDateStr = `${filters.defect_date_to} 23:59:59.999`;
            conditions.push((0, drizzle_orm_1.sql) `${schema_1.defectdata.defectDate} <= ${toDateStr}::timestamp`);
        }
        if (filters.ng_qty_min !== undefined) {
            conditions.push((0, drizzle_orm_1.gte)(schema_1.defectdata.ngQty, filters.ng_qty_min));
        }
        if (filters.ng_qty_max !== undefined) {
            conditions.push((0, drizzle_orm_1.lte)(schema_1.defectdata.ngQty, filters.ng_qty_max));
        }
        if (filters.search) {
            const searchPattern = `%${filters.search}%`;
            conditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(schema_1.defectdata.inspectionNo, searchPattern), (0, drizzle_orm_1.ilike)(schema_1.defectdata.qcName, searchPattern), (0, drizzle_orm_1.ilike)(schema_1.defectdata.inspector, searchPattern), (0, drizzle_orm_1.ilike)(schema_1.defectdata.station, searchPattern)));
        }
        const whereClause = conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined;
        const countResult = await this.db
            .select({ count: (0, drizzle_orm_1.sql) `count(*)::int` })
            .from(schema_1.defectdata)
            .where(whereClause);
        const total = countResult[0]?.count || 0;
        const page = filters.page || 1;
        const limit = Math.min(filters.limit || 50, 500);
        const offset = (page - 1) * limit;
        const data = await this.db
            .select({
            ...defectdataColumns,
            defect_name: schema_1.defects.name,
            defect_description: schema_1.defects.description
        })
            .from(schema_1.defectdata)
            .leftJoin(schema_1.defects, (0, drizzle_orm_1.eq)(schema_1.defectdata.defectId, schema_1.defects.id))
            .where(whereClause)
            .orderBy((0, drizzle_orm_1.desc)(schema_1.defectdata.defectDate))
            .limit(limit)
            .offset(offset);
        return {
            data: data.map(row => mapDrizzleToEntity(row)),
            total
        };
    }
    transformRowToDefectDetail(row) {
        let imageUrls = [];
        if (row.image_ids) {
            let imageIds = [];
            if (Array.isArray(row.image_ids)) {
                imageIds = row.image_ids;
            }
            else if (typeof row.image_ids === 'string') {
                try {
                    imageIds = JSON.parse(row.image_ids);
                }
                catch (e) {
                    imageIds = [];
                }
            }
            imageUrls = imageIds.map(id => `/api/defect-image/${id}`);
        }
        else if (row.image_urls) {
            if (Array.isArray(row.image_urls)) {
                imageUrls = row.image_urls;
            }
            else if (typeof row.image_urls === 'string') {
                try {
                    imageUrls = JSON.parse(row.image_urls);
                }
                catch (e) {
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
            round: row.round,
            created_by: row.created_by,
            created_at: row.created_at,
            image_urls: imageUrls
        };
    }
    transformRowToDefectEmail(row) {
        let imageUrls = [];
        if (row.image_urls) {
            if (Array.isArray(row.image_urls)) {
                imageUrls = row.image_urls;
            }
            else if (typeof row.image_urls === 'string') {
                try {
                    imageUrls = JSON.parse(row.image_urls);
                }
                catch (e) {
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
exports.DefectDataModel = DefectDataModel;
function createDefectDataModel(db) {
    return new DefectDataModel(db);
}
exports.default = DefectDataModel;
