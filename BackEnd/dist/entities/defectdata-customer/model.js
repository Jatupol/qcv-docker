"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefectDataCustomerModel = void 0;
exports.createDefectDataCustomerModel = createDefectDataCustomerModel;
const drizzle_orm_1 = require("drizzle-orm");
const dateTimeUtils_1 = require("../../utils/dateTimeUtils");
const auditLogger_1 = require("../../utils/auditLogger");
const schema_1 = require("../../db/schema");
const defectdataCustomerColumns = (0, drizzle_orm_1.getTableColumns)(schema_1.defectdataCustomer);
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
class DefectDataCustomerModel {
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
            console.log('🔧 Executing defectdata_customer create query:', { inspection_no: data.inspection_no });
            const result = await this.db.execute((0, drizzle_orm_1.sql) `
        INSERT INTO defectdata_customer (
          inspection_no, defect_date, qc_name, qclead_name, mbr_name,
          linevi, groupvi, station, inspector, defect_id, defect_detail,
          ng_qty, trayno, tray_position, color,
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
          ${userId || 0},
          ${userId || 0},
          ${nowStr}::timestamp,
          ${nowStr}::timestamp
        )
        RETURNING *
      `);
            const rows = result.rows || result;
            if (rows && rows.length > 0) {
                console.log('✅ DefectData Customer created successfully');
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
                    createdBy: row.created_by,
                    updatedBy: row.updated_by,
                    createdAt: row.created_at,
                    updatedAt: row.updated_at
                };
                return mapDrizzleToEntity(mappedRow);
            }
            throw new Error('Failed to create defect data customer');
        }
        catch (error) {
            console.error('❌ Error creating defect data customer:', error);
            throw new Error(`Failed to create defect data customer: ${error.message}`);
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
            console.log('🔧 Executing defectdata_customer update query:', { id });
            const result = await this.db.execute((0, drizzle_orm_1.sql) `
        UPDATE defectdata_customer SET
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
          color = COALESCE(${data.color ?? null}, color)
        WHERE id = ${id}
        RETURNING *
      `);
            const rows = result.rows || result;
            if (rows && rows.length > 0) {
                console.log('✅ DefectData Customer updated successfully');
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
            console.error('❌ Error updating defect data customer:', error);
            throw new Error(`Failed to update defect data customer: ${error.message}`);
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
            console.log('🔧 Executing defectdata_customer delete query:', { id });
            return await this.db.transaction(async (tx) => {
                const [deleted] = await tx
                    .delete(schema_1.defectdataCustomer)
                    .where((0, drizzle_orm_1.eq)(schema_1.defectdataCustomer.id, parseInt(id)))
                    .returning();
                if (!deleted) {
                    return { success: false, error: 'Defect data not found' };
                }
                await (0, auditLogger_1.logDelete)(this.db, {
                    entity: 'defectdata_customer',
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
            ...defectdataCustomerColumns,
            defect_name: schema_1.defects.name,
            defect_description: schema_1.defects.description
        })
            .from(schema_1.defectdataCustomer)
            .leftJoin(schema_1.defects, (0, drizzle_orm_1.eq)(schema_1.defectdataCustomer.defectId, schema_1.defects.id))
            .where((0, drizzle_orm_1.eq)(schema_1.defectdataCustomer.inspectionNo, inspectionNo))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.defectdataCustomer.createdAt));
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
        , COALESCE(di.image_ids, '[]'::json) as image_ids
      FROM v_defectdata_customer v
      LEFT JOIN v_defect_image_customer_ids di ON di.defect_id = v.id
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
        , i.crack_sampling_qty, i.judgment
        , COALESCE(
            (SELECT json_agg('data:image/jpeg;base64,' || replace(encode(di.imge_data, 'base64'), E'\n', ''))
             FROM defect_image di
             WHERE di.defect_id = v.id),
            '[]'::json
          ) as image_urls
      FROM v_defectdata_customer v
      LEFT JOIN v_inspectiondata_customer i ON i.inspection_no = v.inspection_no
      LEFT JOIN parts p ON p.partno = i.itemno
      WHERE v.id = ${defectId}
      ORDER BY v.created_at DESC
    `);
        return result.rows.map(row => this.transformRowToDefectEmail(row));
    }
    async getByStationAndDateRange(station, startDate, endDate, limit = 100) {
        const result = await this.db
            .select({
            ...defectdataCustomerColumns,
            defect_name: schema_1.defects.name,
            defect_description: schema_1.defects.description
        })
            .from(schema_1.defectdataCustomer)
            .leftJoin(schema_1.defects, (0, drizzle_orm_1.eq)(schema_1.defectdataCustomer.defectId, schema_1.defects.id))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.defectdataCustomer.station, station), (0, drizzle_orm_1.sql) `${schema_1.defectdataCustomer.defectDate} >= ${(0, dateTimeUtils_1.formatDateTimeLocal)(startDate).replace('T', ' ')}::timestamp`, (0, drizzle_orm_1.sql) `${schema_1.defectdataCustomer.defectDate} <= ${(0, dateTimeUtils_1.formatDateTimeLocal)(endDate).replace('T', ' ')}::timestamp`))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.defectdataCustomer.defectDate), (0, drizzle_orm_1.desc)(schema_1.defectdataCustomer.createdAt))
            .limit(limit);
        return result.map(row => mapDrizzleToEntity(row));
    }
    async getByInspector(inspector, limit = 100) {
        const result = await this.db
            .select({
            ...defectdataCustomerColumns,
            defect_name: schema_1.defects.name,
            defect_description: schema_1.defects.description
        })
            .from(schema_1.defectdataCustomer)
            .leftJoin(schema_1.defects, (0, drizzle_orm_1.eq)(schema_1.defectdataCustomer.defectId, schema_1.defects.id))
            .where((0, drizzle_orm_1.eq)(schema_1.defectdataCustomer.inspector, inspector))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.defectdataCustomer.defectDate), (0, drizzle_orm_1.desc)(schema_1.defectdataCustomer.createdAt))
            .limit(limit);
        return result.map(row => mapDrizzleToEntity(row));
    }
    async getProfile(id) {
        const mainResult = await this.db
            .select({
            ...defectdataCustomerColumns,
            defect_name: schema_1.defects.name,
            defect_description: schema_1.defects.description
        })
            .from(schema_1.defectdataCustomer)
            .leftJoin(schema_1.defects, (0, drizzle_orm_1.eq)(schema_1.defectdataCustomer.defectId, schema_1.defects.id))
            .where((0, drizzle_orm_1.eq)(schema_1.defectdataCustomer.id, id))
            .limit(1);
        if (mainResult.length === 0) {
            return null;
        }
        const mainRecord = mapDrizzleToEntity(mainResult[0]);
        mainRecord.defect_name = mainResult[0].defect_name || undefined;
        mainRecord.defect_description = mainResult[0].defect_description || undefined;
        const relatedResult = await this.db
            .select({
            ...defectdataCustomerColumns,
            defect_name: schema_1.defects.name
        })
            .from(schema_1.defectdataCustomer)
            .leftJoin(schema_1.defects, (0, drizzle_orm_1.eq)(schema_1.defectdataCustomer.defectId, schema_1.defects.id))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.defectdataCustomer.inspectionNo, mainRecord.inspection_no), (0, drizzle_orm_1.sql) `${schema_1.defectdataCustomer.id} != ${id}`))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.defectdataCustomer.createdAt))
            .limit(10);
        mainRecord.related_records = relatedResult.map(row => mapDrizzleToEntity(row));
        const statsResult = await this.db.execute((0, drizzle_orm_1.sql) `
      SELECT
        (SELECT COUNT(*) FROM defectdata_customer WHERE inspection_no = ${mainRecord.inspection_no}) as same_inspection_count,
        (SELECT COUNT(*) FROM defectdata_customer WHERE station = ${mainRecord.station}) as same_station_count,
        (SELECT COUNT(*) FROM defectdata_customer WHERE defect_id = ${mainRecord.defect_id}) as same_defect_count
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
            conditions.push((0, drizzle_orm_1.sql) `${schema_1.defectdataCustomer.defectDate} >= ${startStr}::timestamp`);
            conditions.push((0, drizzle_orm_1.sql) `${schema_1.defectdataCustomer.defectDate} <= ${endStr}::timestamp`);
        }
        const whereClause = conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined;
        const basicResult = await this.db
            .select({
            total_records: (0, drizzle_orm_1.sql) `count(*)::int`,
            today_records: (0, drizzle_orm_1.sql) `count(CASE WHEN ${schema_1.defectdataCustomer.defectDate} >= CURRENT_DATE THEN 1 END)::int`,
            this_week_records: (0, drizzle_orm_1.sql) `count(CASE WHEN ${schema_1.defectdataCustomer.defectDate} >= date_trunc('week', CURRENT_DATE) THEN 1 END)::int`,
            this_month_records: (0, drizzle_orm_1.sql) `count(CASE WHEN ${schema_1.defectdataCustomer.defectDate} >= date_trunc('month', CURRENT_DATE) THEN 1 END)::int`,
            total_ng_qty: (0, drizzle_orm_1.sql) `COALESCE(SUM(${schema_1.defectdataCustomer.ngQty}), 0)::int`,
            latest_record_at: (0, drizzle_orm_1.sql) `MAX(${schema_1.defectdataCustomer.defectDate})`
        })
            .from(schema_1.defectdataCustomer)
            .where(whereClause);
        const basicStats = basicResult[0];
        const stationResult = await this.db
            .select({
            station: schema_1.defectdataCustomer.station,
            count: (0, drizzle_orm_1.sql) `count(*)::int`,
            total_ng_qty: (0, drizzle_orm_1.sql) `COALESCE(SUM(${schema_1.defectdataCustomer.ngQty}), 0)::int`,
            defect_types: (0, drizzle_orm_1.sql) `array_agg(DISTINCT ${schema_1.defects.name})`
        })
            .from(schema_1.defectdataCustomer)
            .leftJoin(schema_1.defects, (0, drizzle_orm_1.eq)(schema_1.defectdataCustomer.defectId, schema_1.defects.id))
            .where(whereClause)
            .groupBy(schema_1.defectdataCustomer.station)
            .orderBy((0, drizzle_orm_1.desc)((0, drizzle_orm_1.sql) `count(*)`));
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
        return summary;
    }
    async getTrends(days = 7) {
        const result = await this.db.execute((0, drizzle_orm_1.sql) `
      SELECT
        DATE(${schema_1.defectdataCustomer.defectDate}) as date,
        COUNT(*)::int as count,
        COALESCE(SUM(${schema_1.defectdataCustomer.ngQty}), 0)::int as total_ng_qty,
        COUNT(DISTINCT ${schema_1.defectdataCustomer.inspectionNo})::int as unique_inspections,
        COUNT(DISTINCT ${schema_1.defectdataCustomer.defectId})::int as unique_defect_types
      FROM ${schema_1.defectdataCustomer}
      WHERE ${schema_1.defectdataCustomer.defectDate} >= CURRENT_DATE - INTERVAL '${drizzle_orm_1.sql.raw(String(days))} days'
      GROUP BY DATE(${schema_1.defectdataCustomer.defectDate})
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
            inspector: schema_1.defectdataCustomer.inspector,
            total_records: (0, drizzle_orm_1.sql) `count(*)::int`,
            total_ng_qty: (0, drizzle_orm_1.sql) `COALESCE(SUM(${schema_1.defectdataCustomer.ngQty}), 0)::int`,
            unique_defects_found: (0, drizzle_orm_1.sql) `COUNT(DISTINCT ${schema_1.defectdataCustomer.defectId})::int`,
            stations_covered: (0, drizzle_orm_1.sql) `array_agg(DISTINCT ${schema_1.defectdataCustomer.station})`,
            lines_covered: (0, drizzle_orm_1.sql) `array_agg(DISTINCT ${schema_1.defectdataCustomer.linevi})`,
            avg_ng_per_record: (0, drizzle_orm_1.sql) `AVG(${schema_1.defectdataCustomer.ngQty})`,
            latest_record_at: (0, drizzle_orm_1.sql) `MAX(${schema_1.defectdataCustomer.defectDate})`
        })
            .from(schema_1.defectdataCustomer)
            .where((0, drizzle_orm_1.eq)(schema_1.defectdataCustomer.inspector, inspector))
            .groupBy(schema_1.defectdataCustomer.inspector);
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
            imageUrls = imageIds.map(id => `/api/defect-customer-image/${id}`);
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
exports.DefectDataCustomerModel = DefectDataCustomerModel;
function createDefectDataCustomerModel(db) {
    return new DefectDataCustomerModel(db);
}
exports.default = DefectDataCustomerModel;
