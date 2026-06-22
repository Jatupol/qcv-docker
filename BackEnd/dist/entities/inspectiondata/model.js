"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InspectionDataModel = void 0;
exports.createInspectionDataModel = createInspectionDataModel;
const drizzle_orm_1 = require("drizzle-orm");
const dateTimeUtils_1 = require("../../utils/dateTimeUtils");
const auditLogger_1 = require("../../utils/auditLogger");
const schema_1 = require("../../db/schema");
const inspectiondataColumns = (0, drizzle_orm_1.getTableColumns)(schema_1.inspectiondata);
const types_1 = require("./types");
const shared_1 = require("@qcv/shared");
const dateTimeUtils_2 = require("../../utils/dateTimeUtils");
function mapDrizzleToEntity(row, searchTerm) {
    const entity = {
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
        sampling_reason_name: row.samplingReasonName || undefined,
        sampling_reason_description: row.samplingReasonDescription || undefined,
        defect_num: row.defectNum ?? 0,
        ng_num: row.ngNum ?? 0
    };
    if (searchTerm && searchTerm.trim()) {
        entity.highlight = createHighlightedFields(entity, searchTerm);
    }
    return entity;
}
function createHighlightedFields(entity, searchTerm) {
    const highlighted = {};
    const searchableFields = ['inspection_no', 'station', 'shift', 'lotno', 'partsite', 'itemno', 'model', 'version', 'fvilineno'];
    const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');
    searchableFields.forEach(field => {
        const value = entity[field];
        if (value && typeof value === 'string') {
            const highlightedValue = value.replace(regex, '<mark>$1</mark>');
            if (highlightedValue !== value) {
                highlighted[field] = highlightedValue;
            }
        }
    });
    return highlighted;
}
class InspectionDataModel {
    constructor(db) {
        this.config = types_1.INSPECTIONDATA_ENTITY_CONFIG;
        this.db = db;
    }
    async getByKey(keyValues) {
        try {
            const { id } = keyValues;
            if (!id) {
                throw new Error('ID is required');
            }
            const result = await this.db
                .select({
                ...inspectiondataColumns,
                samplingReasonName: schema_1.samplingReasons.name,
                samplingReasonDescription: schema_1.samplingReasons.description
            })
                .from(schema_1.inspectiondata)
                .leftJoin(schema_1.samplingReasons, (0, drizzle_orm_1.eq)(schema_1.inspectiondata.samplingReasonId, schema_1.samplingReasons.id))
                .where((0, drizzle_orm_1.eq)(schema_1.inspectiondata.id, id))
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
                const defectCounts = await this.getDefectCounts(row.inspectionNo || '');
                return mapDrizzleToEntity({
                    ...row,
                    defectNum: defectCounts.defectNum,
                    ngNum: defectCounts.ngNum
                });
            }
            return null;
        }
        catch (error) {
            console.error('InspectionData getByKey error:', error);
            throw new Error(`Failed to find inspection data: ${error.message}`);
        }
    }
    async getDefectCounts(inspectionNo) {
        try {
            const result = await this.db
                .select({
                defectNum: (0, drizzle_orm_1.sql) `count(*)::int`,
                ngNum: (0, drizzle_orm_1.sql) `COALESCE(SUM(${schema_1.defectdata.ngQty}), 0)::int`
            })
                .from(schema_1.defectdata)
                .where((0, drizzle_orm_1.eq)(schema_1.defectdata.inspectionNo, inspectionNo));
            return {
                defectNum: result[0]?.defectNum || 0,
                ngNum: result[0]?.ngNum || 0
            };
        }
        catch (error) {
            console.error('Error getting defect counts:', error);
            return { defectNum: 0, ngNum: 0 };
        }
    }
    async getAll(searchTerm, options) {
        try {
            const page = options?.page && options.page > 0 ? options.page : 1;
            const limit = options?.limit && options.limit > 0 ? options.limit : 20;
            const offset = (page - 1) * limit;
            const viewName = options?.isCustomer ? 'v_inspectiondata_customer' : 'v_inspectiondata';
            const viewDefectName = options?.isCustomer ? 'v_defectdata_customer' : 'defectdata';
            const values = [];
            const conditions = [];
            let paramIndex = 1;
            if (options?.station && options.station.trim()) {
                conditions.push(`i.station = $${paramIndex}`);
                values.push(options.station.trim());
                paramIndex++;
            }
            if (options?.inspectionDateFrom) {
                conditions.push(`i.inspection_date >= $${paramIndex}::timestamp`);
                values.push(`${options.inspectionDateFrom} 00:00:00`);
                paramIndex++;
            }
            if (options?.inspectionDateTo) {
                conditions.push(`i.inspection_date <= $${paramIndex}::timestamp`);
                values.push(`${options.inspectionDateTo} 23:59:59.999`);
                paramIndex++;
            }
            if (searchTerm && searchTerm.trim()) {
                const searchPattern = `%${searchTerm.trim()}%`;
                values.push(searchPattern);
                conditions.push(`(i.inspection_no ILIKE $${paramIndex} OR i.station ILIKE $${paramIndex} OR i.shift ILIKE $${paramIndex} OR i.lotno ILIKE $${paramIndex} OR i.partsite ILIKE $${paramIndex} OR i.itemno ILIKE $${paramIndex} OR i.model ILIKE $${paramIndex} OR i.version ILIKE $${paramIndex} OR i.fvilineno ILIKE $${paramIndex} OR i.mclineno ILIKE $${paramIndex})`);
                paramIndex++;
            }
            const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
            values.push(limit);
            const limitParam = paramIndex++;
            values.push(offset);
            const offsetParam = paramIndex;
            console.log(`🔧 Executing paginated query: page=${page}, limit=${limit}, offset=${offset}`);
            const query = `
        SELECT
          i.*,
          sr.name AS sampling_reason_name,
          sr.description AS sampling_reason_description,
          COALESCE(dc.defect_num, 0)::int AS defect_num,
          COALESCE(dc.ng_num, 0)::int AS ng_num
        FROM ${viewName} i
        LEFT JOIN sampling_reasons sr ON i.sampling_reason_id = sr.id
        LEFT JOIN (
          SELECT inspection_no, count(*)::int AS defect_num, COALESCE(SUM(ng_qty), 0)::int AS ng_num
          FROM ${viewDefectName}
          GROUP BY inspection_no
        ) dc ON i.inspection_no = dc.inspection_no
        ${whereClause}
        ORDER BY i.id DESC
        LIMIT $${limitParam} OFFSET $${offsetParam}
      `;
            const result = await this.db.$client.query(query, values);
            return result.rows.map((row) => mapDrizzleToEntity({
                id: row.id,
                station: row.station,
                inspectionNo: row.inspection_no,
                inspectionNoRef: row.inspection_no_ref,
                inspectionDate: row.inspection_date,
                ww: row.ww,
                fy: row.fy,
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
                updatedAt: row.updated_at,
                samplingReasonName: row.sampling_reason_name,
                samplingReasonDescription: row.sampling_reason_description,
                defectNum: row.defect_num,
                ngNum: row.ng_num
            }, searchTerm));
        }
        catch (error) {
            console.error('InspectionData getAll error:', error);
            throw new Error(`Failed to get inspection data: ${error.message}`);
        }
    }
    async getDefectCountsBatch(inspectionNos) {
        const map = new Map();
        if (inspectionNos.length === 0) {
            return map;
        }
        try {
            const result = await this.db
                .select({
                inspectionNo: schema_1.defectdata.inspectionNo,
                defectNum: (0, drizzle_orm_1.sql) `count(*)::int`,
                ngNum: (0, drizzle_orm_1.sql) `COALESCE(SUM(${schema_1.defectdata.ngQty}), 0)::int`
            })
                .from(schema_1.defectdata)
                .where((0, drizzle_orm_1.sql) `${schema_1.defectdata.inspectionNo} = ANY(ARRAY[${drizzle_orm_1.sql.join(inspectionNos.map(n => (0, drizzle_orm_1.sql) `${n}`), (0, drizzle_orm_1.sql) `, `)}])`)
                .groupBy(schema_1.defectdata.inspectionNo);
            for (const row of result) {
                if (row.inspectionNo) {
                    map.set(row.inspectionNo, {
                        defectNum: row.defectNum || 0,
                        ngNum: row.ngNum || 0
                    });
                }
            }
        }
        catch (error) {
            console.error('Error getting batch defect counts:', error);
        }
        return map;
    }
    async getCount(searchTerm, station, inspectionDateFrom, inspectionDateTo, isCustomer) {
        try {
            const viewName = isCustomer ? 'v_inspectiondata_customer' : 'v_inspectiondata';
            const values = [];
            const conditions = [];
            let paramIndex = 1;
            if (station && station.trim()) {
                conditions.push(`station = $${paramIndex}`);
                values.push(station.trim());
                paramIndex++;
            }
            if (inspectionDateFrom) {
                conditions.push(`inspection_date >= $${paramIndex}::timestamp`);
                values.push(`${inspectionDateFrom} 00:00:00`);
                paramIndex++;
            }
            if (inspectionDateTo) {
                conditions.push(`inspection_date <= $${paramIndex}::timestamp`);
                values.push(`${inspectionDateTo} 23:59:59.999`);
                paramIndex++;
            }
            if (searchTerm && searchTerm.trim()) {
                const searchPattern = `%${searchTerm.trim()}%`;
                values.push(searchPattern);
                conditions.push(`(inspection_no ILIKE $${paramIndex} OR station ILIKE $${paramIndex} OR shift ILIKE $${paramIndex} OR lotno ILIKE $${paramIndex} OR partsite ILIKE $${paramIndex} OR itemno ILIKE $${paramIndex} OR model ILIKE $${paramIndex} OR version ILIKE $${paramIndex} OR fvilineno ILIKE $${paramIndex} OR mclineno ILIKE $${paramIndex})`);
                paramIndex++;
            }
            const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
            const query = `SELECT count(*)::int AS count FROM ${viewName} ${whereClause}`;
            const result = await this.db.$client.query(query, values);
            return result.rows[0]?.count || 0;
        }
        catch (error) {
            console.error('InspectionData getCount error:', error);
            return 0;
        }
    }
    async create(data, userId) {
        try {
            let inspectionDateValue;
            if (data.inspection_date instanceof Date) {
                const d = data.inspection_date;
                inspectionDateValue = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
            }
            else if (data.inspection_date) {
                inspectionDateValue = String(data.inspection_date);
            }
            else {
                const now = new Date();
                inspectionDateValue = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
            }
            const now = new Date();
            const nowStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
            console.log('📅 inspection_date input:', data.inspection_date, '-> output:', inspectionDateValue);
            console.log('🔧 Executing inspectiondata create query:', { inspection_no: data.inspection_no });
            const result = await this.db.execute((0, drizzle_orm_1.sql) `
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
            const rows = result.rows || result;
            if (rows && rows.length > 0) {
                console.log('✅ InspectionData created successfully');
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
                    data: mapDrizzleToEntity(mappedRow)
                };
            }
            return {
                success: false,
                error: 'Failed to create inspection data'
            };
        }
        catch (error) {
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
    async update(keyValues, data, userId) {
        try {
            const { id } = keyValues;
            if (!id) {
                return {
                    success: false,
                    error: 'ID is required for update'
                };
            }
            const now = new Date();
            const nowStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
            let inspectionDateValue = null;
            if (data.inspection_date !== undefined) {
                if (data.inspection_date instanceof Date) {
                    const d = data.inspection_date;
                    inspectionDateValue = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
                }
                else {
                    inspectionDateValue = String(data.inspection_date);
                }
                console.log('📅 Update inspection_date:', data.inspection_date, '->', inspectionDateValue);
            }
            console.log('🔧 Executing inspectiondata update query:', { id });
            const result = await this.db.execute((0, drizzle_orm_1.sql) `
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
            const rows = result.rows || result;
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
                    data: mapDrizzleToEntity(mappedRow)
                };
            }
            return {
                success: false,
                error: 'Inspection data not found'
            };
        }
        catch (error) {
            console.error('❌ Error updating inspection data:', error);
            return {
                success: false,
                error: error.message || 'Database error occurred'
            };
        }
    }
    async updateFviToDefault(sivNo) {
        try {
            const result = await this.db
                .update(schema_1.inspectiondata)
                .set({
                shift: '',
                fvilineno: '',
                qcId: null,
                generalSamplingQty: null,
                crackSamplingQty: null,
                judgment: null
            })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.inspectiondata.station, 'SIV'), (0, drizzle_orm_1.eq)(schema_1.inspectiondata.inspectionNo, sivNo)))
                .returning();
            if (result.length > 0) {
                console.log('✅ InspectionData update FVI record to default successfully');
                return { success: true };
            }
            return {
                success: false,
                error: 'Inspection data not found'
            };
        }
        catch (error) {
            console.error('❌ Error update FVI record to default inspection data:', error);
            return {
                success: false,
                error: error.message || 'Database error occurred'
            };
        }
    }
    async getPartsSGT() {
        try {
            const result = await this.db.execute((0, drizzle_orm_1.sql) `SELECT partno FROM v_part_sgt`);
            const rows = result.rows || result;
            return Array.isArray(rows) ? rows.map((r) => r.partno) : [];
        }
        catch (error) {
            console.error('❌ Error fetching v_part_sgt:', error);
            return [];
        }
    }
    async isPartSGT(itemno) {
        try {
            const result = await this.db.execute((0, drizzle_orm_1.sql) `SELECT 1 FROM v_part_sgt WHERE partno = ${itemno} LIMIT 1`);
            return result.rows?.length > 0 || (Array.isArray(result) && result.length > 0);
        }
        catch (error) {
            console.error('❌ Error checking v_part_sgt:', error);
            return false;
        }
    }
    async delete(keyValues, actor = null, req) {
        try {
            const { id } = keyValues;
            if (!id) {
                return {
                    success: false,
                    error: 'ID is required for deletion'
                };
            }
            return await this.db.transaction(async (tx) => {
                const [deleted] = await tx
                    .delete(schema_1.inspectiondata)
                    .where((0, drizzle_orm_1.eq)(schema_1.inspectiondata.id, id))
                    .returning();
                if (!deleted) {
                    return { success: false, error: 'Inspection data not found' };
                }
                await (0, auditLogger_1.logDelete)(this.db, {
                    entity: 'inspectiondata',
                    recordId: deleted.id,
                    oldValues: deleted,
                    actor,
                    req,
                    tx,
                });
                console.log('✅ InspectionData deleted successfully');
                return { success: true };
            });
        }
        catch (error) {
            console.error('❌ Error deleting inspection data:', error);
            return {
                success: false,
                error: error.message || 'Database error occurred'
            };
        }
    }
    async exists(keyValues) {
        try {
            const { id } = keyValues;
            if (!id) {
                return false;
            }
            const result = await this.db
                .select({ id: schema_1.inspectiondata.id })
                .from(schema_1.inspectiondata)
                .where((0, drizzle_orm_1.eq)(schema_1.inspectiondata.id, id))
                .limit(1);
            return result.length > 0;
        }
        catch (error) {
            console.error('InspectionData exists error:', error);
            return false;
        }
    }
    async inspectionNumberExists(inspectionNo) {
        try {
            if (!inspectionNo || !inspectionNo.trim()) {
                return false;
            }
            console.log(`🔍 Checking if inspection number exists: ${inspectionNo}`);
            const result = await this.db
                .select({ id: schema_1.inspectiondata.id })
                .from(schema_1.inspectiondata)
                .where((0, drizzle_orm_1.eq)(schema_1.inspectiondata.inspectionNo, inspectionNo.trim()))
                .limit(1);
            const exists = result.length > 0;
            if (exists) {
                console.log(`⚠️ Inspection number already exists: ${inspectionNo}`);
            }
            else {
                console.log(`✅ Inspection number is available: ${inspectionNo}`);
            }
            return exists;
        }
        catch (error) {
            console.error('❌ Error checking inspection number existence:', error);
            return false;
        }
    }
    async getByLotNumber(lotno) {
        try {
            const rows = await this.db
                .select()
                .from(schema_1.inspectiondata)
                .where((0, drizzle_orm_1.eq)(schema_1.inspectiondata.lotno, lotno))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.inspectiondata.id));
            return rows.map(row => mapDrizzleToEntity(row));
        }
        catch (error) {
            console.error('❌ Error in getByLotNumber:', error);
            throw error;
        }
    }
    async getByInspectionNo(inspectionNo) {
        try {
            const rows = await this.db
                .select()
                .from(schema_1.inspectiondata)
                .where((0, drizzle_orm_1.eq)(schema_1.inspectiondata.inspectionNo, inspectionNo))
                .limit(1);
            return rows.length > 0 ? mapDrizzleToEntity(rows[0]) : null;
        }
        catch (error) {
            console.error('❌ Error in getByInspectionNo:', error);
            throw error;
        }
    }
    async getSamplingRoundCount(station, lotno) {
        try {
            console.log('🔧 Getting sampling round count:', { station, lotno });
            const result = await this.db
                .select({ maxRound: (0, drizzle_orm_1.sql) `COALESCE(MAX(${schema_1.inspectiondata.round}), 0)::int` })
                .from(schema_1.inspectiondata)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.inspectiondata.station, station), (0, drizzle_orm_1.eq)(schema_1.inspectiondata.lotno, lotno)));
            const maxRound = result[0]?.maxRound || 0;
            console.log(`✅ Current max round for station=${station}, lotno=${lotno}: ${maxRound}`);
            return maxRound;
        }
        catch (error) {
            console.error('❌ Error getting sampling round count:', error);
            return 0;
        }
    }
    async generateInspectionNumber(station, date, wwNumber) {
        try {
            const dateObj = (0, dateTimeUtils_2.toDate)(date);
            const fiscalYear = (0, shared_1.getFiscalYear)(dateObj, 6);
            const fiscalYearYY = fiscalYear.toString().slice(-2);
            const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
            const day = dateObj.getDate().toString().padStart(2, '0');
            const formattedWW = `${String(wwNumber).padStart(2, '0')}`;
            const prefix = `${station}${fiscalYearYY}${month}${formattedWW}-${day}`;
            console.log('🔧 Generating inspection number for:', {
                station,
                date: (0, dateTimeUtils_1.formatDateLocal)(dateObj),
                fiscalYear,
                fiscalYearYY,
                month,
                wwNumber,
                formattedWW,
                prefix
            });
            const result = await this.db
                .select({ inspectionNo: schema_1.inspectiondata.inspectionNo })
                .from(schema_1.inspectiondata)
                .where((0, drizzle_orm_1.like)(schema_1.inspectiondata.inspectionNo, `${prefix}%`))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.inspectiondata.inspectionNo));
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
        }
        catch (error) {
            console.error('❌ Error generating inspection number:', error);
            const fallbackDate = (0, dateTimeUtils_2.toDate)(date);
            const fiscalYear = (0, shared_1.getFiscalYear)(fallbackDate, 6);
            const fiscalYearYY = fiscalYear.toString().slice(-2);
            const month = (fallbackDate.getMonth() + 1).toString().padStart(2, '0');
            const day = fallbackDate.getDate().toString().padStart(2, '0');
            const formattedWW = `W${String(wwNumber).padStart(2, '0')}`;
            const timestamp = Date.now().toString().slice(-4);
            return `${station}${fiscalYearYY}${month}${formattedWW}-${day}${timestamp}`;
        }
    }
    formatWorkWeek(ww) {
        return String(ww).padStart(2, '0');
    }
    async getDefectsForInspection(inspection_no) {
        try {
            const result = await this.db.execute((0, drizzle_orm_1.sql) `
        SELECT
          dd.*,
          d.name as defect_name
        FROM defectdata dd
        LEFT JOIN defects d ON dd.defect_id = d.id
        WHERE dd.inspection_no = ${inspection_no}
        ORDER BY dd.id DESC
      `);
            const defectsWithImages = await Promise.all(result.rows.map(async (defect) => {
                try {
                    const imageResult = await this.db.execute((0, drizzle_orm_1.sql) `
              SELECT id, encode(imge_data, 'base64') as image_data
              FROM defect_image
              WHERE defect_id = ${defect.id}
              ORDER BY id
            `);
                    const imageUrls = imageResult.rows.map((img) => `data:image/jpeg;base64,${img.image_data}`);
                    return {
                        ...defect,
                        image_urls: imageUrls
                    };
                }
                catch (error) {
                    console.error(`Error loading images for defect ${defect.id}:`, error);
                    return {
                        ...defect,
                        image_urls: []
                    };
                }
            }));
            return defectsWithImages;
        }
        catch (error) {
            console.error('Error fetching defects for inspection:', error);
            return [];
        }
    }
    async getDefectsCustomerForInspection(inspection_no) {
        try {
            const result = await this.db.execute((0, drizzle_orm_1.sql) `
        SELECT
          dd.*,
          d.name as defect_name
        FROM defectdata_customer dd
        LEFT JOIN defects d ON dd.defect_id = d.id
        WHERE dd.inspection_no = ${inspection_no}
        ORDER BY dd.id DESC
      `);
            const defectsWithImages = await Promise.all(result.rows.map(async (defect) => {
                try {
                    const imageResult = await this.db.execute((0, drizzle_orm_1.sql) `
              SELECT id, encode(imge_data, 'base64') as image_data
              FROM defect_customer_image
              WHERE defect_id = ${defect.id}
              ORDER BY id
            `);
                    const imageUrls = imageResult.rows.map((img) => `data:image/jpeg;base64,${img.image_data}`);
                    return {
                        ...defect,
                        image_urls: imageUrls
                    };
                }
                catch (error) {
                    console.error(`Error loading images for defect ${defect.id}:`, error);
                    return {
                        ...defect,
                        image_urls: []
                    };
                }
            }));
            return defectsWithImages;
        }
        catch (error) {
            console.error('Error fetching defects for inspection:', error);
            return [];
        }
    }
    async getAllWithDefects(searchTerm, options) {
        try {
            const inspections = await this.getAll(searchTerm, options);
            return inspections.map(inspection => ({
                ...inspection,
                defects: []
            }));
        }
        catch (error) {
            console.error('InspectionData getAllWithDefects error:', error);
            throw new Error(`Failed to get inspection data with defects: ${error.message}`);
        }
    }
    async getStationStatistics(station) {
        try {
            const today = new Date();
            const currentYear = today.getFullYear();
            const currentMonth = today.getMonth() + 1;
            const currentWeek = this.getCurrentWeekNumber(today);
            const monthStart = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
            const todayStr = (0, dateTimeUtils_1.formatDateLocal)(today);
            const result = await this.db
                .select({
                total: (0, drizzle_orm_1.sql) `count(*)::int`,
                thisYear: (0, drizzle_orm_1.sql) `count(CASE WHEN EXTRACT(YEAR FROM ${schema_1.inspectiondata.inspectionDate}) = ${currentYear} THEN 1 END)::int`,
                thisMonth: (0, drizzle_orm_1.sql) `count(CASE WHEN ${schema_1.inspectiondata.inspectionDate} >= ${monthStart}::date THEN 1 END)::int`,
                thisWeek: (0, drizzle_orm_1.sql) `count(CASE WHEN ${schema_1.inspectiondata.ww} = ${String(currentWeek).padStart(2, '0')} THEN 1 END)::int`,
                today: (0, drizzle_orm_1.sql) `count(CASE WHEN DATE(${schema_1.inspectiondata.inspectionDate}) = ${todayStr}::date THEN 1 END)::int`
            })
                .from(schema_1.inspectiondata)
                .where((0, drizzle_orm_1.eq)(schema_1.inspectiondata.station, station));
            return {
                total: result[0]?.total || 0,
                this_year: result[0]?.thisYear || 0,
                this_month: result[0]?.thisMonth || 0,
                this_week: result[0]?.thisWeek || 0,
                today: result[0]?.today || 0
            };
        }
        catch (error) {
            console.error(`Error getting station statistics for ${station}:`, error);
            throw error;
        }
    }
    async getWeeklyTrend(station, fiscalYearWeek) {
        try {
            const result = await this.db.execute((0, drizzle_orm_1.sql) `
        SELECT
          (w.fiscal_year || w.ww) AS fyww,
          w.fiscal_year AS year,
          w.ww,
          COUNT(i.id)::int AS total,
          COUNT(CASE WHEN i.judgment = true THEN 1 END)::int AS pass,
          COUNT(CASE WHEN i.judgment = false THEN 1 END)::int AS fail
        FROM fiscal_calendar w
          INNER JOIN ${schema_1.inspectiondata} i ON i.inspection_date::date = w.calendar_date
        WHERE i.station = ${station}
          AND (w.fiscal_year || w.ww) <= ${fiscalYearWeek}
        GROUP BY w.fiscal_year, w.ww
        ORDER BY w.fiscal_year DESC, w.ww DESC
        LIMIT 4
      `);
            console.log('🔧 get weekly trend for station:', station, 'fiscalYearWeek:', fiscalYearWeek);
            return result.rows.reverse();
        }
        catch (error) {
            console.error(`Error getting weekly trend for ${station}:`, error);
            throw error;
        }
    }
    getCurrentWeekNumber(date) {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    }
    async getSIVFormat(params) {
        try {
            const conditions = [`i.station = 'SIV'`];
            const values = [];
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
            if (params.judgment && params.judgment !== 'all') {
                if (params.judgment === 'pending') {
                    conditions.push(`i.judgment IS NULL`);
                }
                else if (params.judgment === 'pass') {
                    conditions.push(`i.judgment = true`);
                }
                else if (params.judgment === 'reject') {
                    conditions.push(`i.judgment = false`);
                }
            }
            if (params.model && params.model !== 'All' && params.model.trim()) {
                conditions.push(`(i.model || ' ' || i.version) = $${paramIndex}`);
                values.push(params.model.trim());
                paramIndex++;
            }
            if (params.lotno && params.lotno.trim()) {
                conditions.push(`i.lotno ILIKE $${paramIndex}`);
                values.push(`%${params.lotno.trim()}%`);
                paramIndex++;
            }
            if (params.fvilineno && params.fvilineno.trim()) {
                conditions.push(`i.fvilineno ILIKE $${paramIndex}`);
                values.push(`%${params.fvilineno.trim()}%`);
                paramIndex++;
            }
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
            const result = await this.db.execute(drizzle_orm_1.sql.raw(query.replace(/\$(\d+)/g, (_, i) => {
                const val = values[parseInt(i) - 1];
                if (val === null || val === undefined)
                    return 'NULL';
                return `'${String(val).replace(/'/g, "''")}'`;
            })));
            return result.rows || result || [];
        }
        catch (error) {
            console.error('Error in getSIVFormat:', error);
            throw error;
        }
    }
    async getCustomerJudgment(inspectionNo) {
        try {
            const result = await this.db
                .select({ judgment: schema_1.inspectiondataCustomer.judgment })
                .from(schema_1.inspectiondataCustomer)
                .where((0, drizzle_orm_1.eq)(schema_1.inspectiondataCustomer.inspectionNo, inspectionNo))
                .limit(1);
            if (result.length === 0)
                return null;
            return result[0].judgment ?? null;
        }
        catch (error) {
            console.error('Error getting customer judgment:', error);
            throw new Error(`Failed to get customer judgment: ${error.message}`);
        }
    }
    async updateCustomerJudgment(inspectionNo, judgment, updatedBy) {
        try {
            const result = await this.db
                .update(schema_1.inspectiondataCustomer)
                .set({ judgment, updatedBy, updatedAt: new Date() })
                .where((0, drizzle_orm_1.eq)(schema_1.inspectiondataCustomer.inspectionNo, inspectionNo))
                .returning({ inspectionNo: schema_1.inspectiondataCustomer.inspectionNo });
            return result.length > 0;
        }
        catch (error) {
            console.error('Error updating customer judgment:', error);
            throw new Error(`Failed to update customer judgment: ${error.message}`);
        }
    }
}
exports.InspectionDataModel = InspectionDataModel;
function createInspectionDataModel(db) {
    return new InspectionDataModel(db);
}
exports.default = InspectionDataModel;
