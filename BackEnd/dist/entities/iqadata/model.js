"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IQADataModel = void 0;
exports.createIQADataModel = createIQADataModel;
const drizzle_orm_1 = require("drizzle-orm");
const auditLogger_1 = require("../../utils/auditLogger");
const schema_1 = require("../../db/schema");
const types_1 = require("./types");
const shared_1 = require("@qcv/shared");
function mapDrizzleToEntity(row, searchTerm) {
    const entity = {
        id: row.id,
        fy: row.fy ?? undefined,
        ww: row.ww ?? undefined,
        fw: row.fw ?? undefined,
        date_iqa: row.dateIqa ?? undefined,
        shift_to_shift: row.shiftToShift ?? undefined,
        expense: row.expense ?? undefined,
        re_expense: row.reExpense ?? undefined,
        qc_owner: row.qcOwner ?? undefined,
        model: row.model ?? undefined,
        item: row.item ?? undefined,
        telex: row.telex ?? undefined,
        supplier: row.supplier ?? undefined,
        descr: row.descr ?? undefined,
        location: row.location ?? undefined,
        qty: row.qty ?? undefined,
        supplier_do: row.supplierDo ?? undefined,
        remark: row.remark ?? undefined,
        po: row.po ?? undefined,
        sbr: row.sbr ?? undefined,
        disposition_code: row.dispositionCode ?? undefined,
        receipt_date: row.receiptDate ?? undefined,
        age: row.age ?? undefined,
        warehouse: row.warehouse ?? undefined,
        building: row.building ?? undefined,
        business_unit: row.businessUnit ?? undefined,
        std_case_qty: row.stdCaseQty ?? undefined,
        lpn: row.lpn ?? undefined,
        lotno: row.lotno ?? undefined,
        ref_code: row.refCode ?? undefined,
        data_on_web: row.dataOnWeb ?? undefined,
        inspec: row.inspec ?? undefined,
        rej: row.rej ?? undefined,
        defect: row.defect ?? undefined,
        vender: row.vender ?? undefined,
        is_active: true,
        created_by: 0,
        updated_by: 0,
        created_at: new Date(),
        updated_at: new Date()
    };
    if (searchTerm) {
        entity.highlight = highlightSearchTerm(entity, searchTerm);
    }
    return entity;
}
function highlightSearchTerm(entity, searchTerm) {
    const highlight = {};
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const searchableFields = ['ww', 'model', 'supplier', 'qc_owner', 'item', 'lotno', 'defect'];
    searchableFields.forEach(field => {
        const value = entity[field];
        if (value && typeof value === 'string' && regex.test(value)) {
            highlight[field] = value.replace(regex, '<mark>$1</mark>');
        }
    });
    return highlight;
}
class IQADataModel {
    constructor(db) {
        this.config = types_1.DEFAULT_IQADATA_CONFIG;
        this.db = db;
    }
    async getByKey(keyValues) {
        try {
            const { id } = keyValues;
            if (!id) {
                throw new Error('ID is required');
            }
            const result = await this.db
                .select()
                .from(schema_1.iqadata)
                .where((0, drizzle_orm_1.eq)(schema_1.iqadata.id, id))
                .limit(1);
            return result.length > 0 ? mapDrizzleToEntity(result[0]) : null;
        }
        catch (error) {
            console.error('IQAData getByKey error:', error);
            throw new Error(`Failed to find IQA data: ${error.message}`);
        }
    }
    async getAll(searchTerm) {
        try {
            let query = this.db.select().from(schema_1.iqadata);
            if (searchTerm && searchTerm.trim()) {
                const sanitizedSearch = `%${searchTerm.trim()}%`;
                query = query.where((0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(schema_1.iqadata.ww, sanitizedSearch), (0, drizzle_orm_1.ilike)(schema_1.iqadata.model, sanitizedSearch), (0, drizzle_orm_1.ilike)(schema_1.iqadata.supplier, sanitizedSearch), (0, drizzle_orm_1.ilike)(schema_1.iqadata.qcOwner, sanitizedSearch), (0, drizzle_orm_1.ilike)(schema_1.iqadata.item, sanitizedSearch), (0, drizzle_orm_1.ilike)(schema_1.iqadata.lotno, sanitizedSearch), (0, drizzle_orm_1.ilike)(schema_1.iqadata.defect, sanitizedSearch)));
            }
            const result = await query.orderBy((0, drizzle_orm_1.desc)(schema_1.iqadata.id));
            return result.map(row => mapDrizzleToEntity(row, searchTerm));
        }
        catch (error) {
            console.error('IQAData getAll error:', error);
            throw new Error(`Failed to get IQA data: ${error.message}`);
        }
    }
    async create(data, userId) {
        try {
            let calculatedFY;
            let calculatedWW;
            if (data.date_iqa) {
                const fyNumber = (0, shared_1.getFiscalYear)(data.date_iqa);
                const wwNumber = (0, shared_1.calculateFiscalWeekNumber)(data.date_iqa);
                calculatedFY = fyNumber.toString();
                calculatedWW = wwNumber.toString().padStart(2, '0');
            }
            const insertData = {
                fy: calculatedFY || data.fy,
                ww: calculatedWW || data.ww,
                fw: data.fw,
                dateIqa: data.date_iqa,
                shiftToShift: data.shift_to_shift,
                expense: data.expense,
                reExpense: data.re_expense,
                qcOwner: data.qc_owner,
                model: data.model,
                item: data.item,
                telex: data.telex,
                supplier: data.supplier,
                descr: data.descr,
                location: data.location,
                qty: data.qty,
                supplierDo: data.supplier_do,
                remark: data.remark,
                po: data.po,
                sbr: data.sbr,
                dispositionCode: data.disposition_code,
                receiptDate: data.receipt_date,
                age: data.age,
                warehouse: data.warehouse,
                building: data.building,
                businessUnit: data.business_unit,
                stdCaseQty: data.std_case_qty,
                lpn: data.lpn,
                lotno: data.lotno,
                refCode: data.ref_code,
                dataOnWeb: data.data_on_web,
                inspec: data.inspec,
                rej: data.rej,
                defect: data.defect,
                vender: data.vender
            };
            const result = await this.db
                .insert(schema_1.iqadata)
                .values(insertData)
                .returning();
            return {
                success: true,
                data: mapDrizzleToEntity(result[0])
            };
        }
        catch (error) {
            console.error('IQAData create error:', error);
            return {
                success: false,
                error: `Failed to create IQA data: ${error.message}`
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
            const updateData = {};
            if (data.ww !== undefined)
                updateData.ww = data.ww;
            if (data.date_iqa !== undefined)
                updateData.dateIqa = data.date_iqa;
            if (data.shift_to_shift !== undefined)
                updateData.shiftToShift = data.shift_to_shift;
            if (data.expense !== undefined)
                updateData.expense = data.expense;
            if (data.re_expense !== undefined)
                updateData.reExpense = data.re_expense;
            if (data.qc_owner !== undefined)
                updateData.qcOwner = data.qc_owner;
            if (data.model !== undefined)
                updateData.model = data.model;
            if (data.item !== undefined)
                updateData.item = data.item;
            if (data.telex !== undefined)
                updateData.telex = data.telex;
            if (data.supplier !== undefined)
                updateData.supplier = data.supplier;
            if (data.descr !== undefined)
                updateData.descr = data.descr;
            if (data.location !== undefined)
                updateData.location = data.location;
            if (data.qty !== undefined)
                updateData.qty = data.qty;
            if (data.supplier_do !== undefined)
                updateData.supplierDo = data.supplier_do;
            if (data.remark !== undefined)
                updateData.remark = data.remark;
            if (data.po !== undefined)
                updateData.po = data.po;
            if (data.sbr !== undefined)
                updateData.sbr = data.sbr;
            if (data.disposition_code !== undefined)
                updateData.dispositionCode = data.disposition_code;
            if (data.receipt_date !== undefined)
                updateData.receiptDate = data.receipt_date;
            if (data.age !== undefined)
                updateData.age = data.age;
            if (data.warehouse !== undefined)
                updateData.warehouse = data.warehouse;
            if (data.building !== undefined)
                updateData.building = data.building;
            if (data.business_unit !== undefined)
                updateData.businessUnit = data.business_unit;
            if (data.std_case_qty !== undefined)
                updateData.stdCaseQty = data.std_case_qty;
            if (data.lpn !== undefined)
                updateData.lpn = data.lpn;
            if (data.lotno !== undefined)
                updateData.lotno = data.lotno;
            if (data.ref_code !== undefined)
                updateData.refCode = data.ref_code;
            if (data.data_on_web !== undefined)
                updateData.dataOnWeb = data.data_on_web;
            if (data.inspec !== undefined)
                updateData.inspec = data.inspec;
            if (data.rej !== undefined)
                updateData.rej = data.rej;
            if (data.defect !== undefined)
                updateData.defect = data.defect;
            if (data.vender !== undefined)
                updateData.vender = data.vender;
            if (Object.keys(updateData).length === 0) {
                return {
                    success: false,
                    error: 'No data provided for update'
                };
            }
            const result = await this.db
                .update(schema_1.iqadata)
                .set(updateData)
                .where((0, drizzle_orm_1.eq)(schema_1.iqadata.id, id))
                .returning();
            if (result.length === 0) {
                return {
                    success: false,
                    error: 'IQA data not found'
                };
            }
            return {
                success: true,
                data: mapDrizzleToEntity(result[0])
            };
        }
        catch (error) {
            console.error('IQAData update error:', error);
            return {
                success: false,
                error: `Failed to update IQA data: ${error.message}`
            };
        }
    }
    async delete(keyValues, actor = null, req) {
        try {
            const { id } = keyValues;
            if (!id) {
                return {
                    success: false,
                    error: 'ID is required for delete'
                };
            }
            return await this.db.transaction(async (tx) => {
                const [deleted] = await tx
                    .delete(schema_1.iqadata)
                    .where((0, drizzle_orm_1.eq)(schema_1.iqadata.id, id))
                    .returning();
                if (!deleted) {
                    return { success: false, error: 'IQA data not found' };
                }
                await (0, auditLogger_1.logDelete)(this.db, {
                    entity: 'iqadata',
                    recordId: deleted.id,
                    oldValues: deleted,
                    actor,
                    req,
                    tx,
                });
                return { success: true };
            });
        }
        catch (error) {
            console.error('IQAData delete error:', error);
            return {
                success: false,
                error: `Failed to delete IQA data: ${error.message}`
            };
        }
    }
    async bulkCreate(records) {
        if (records.length === 0) {
            return [];
        }
        const insertedRecords = [];
        try {
            for (const record of records) {
                let calculatedFY;
                let calculatedWW;
                if (record.date_iqa) {
                    const fyNumber = (0, shared_1.getFiscalYear)(record.date_iqa);
                    const wwNumber = (0, shared_1.calculateFiscalWeekNumber)(record.date_iqa);
                    calculatedFY = fyNumber.toString();
                    calculatedWW = wwNumber.toString().padStart(2, '0');
                }
                const insertData = {
                    fy: calculatedFY || record.fy,
                    ww: calculatedWW || record.ww,
                    fw: record.fw,
                    dateIqa: record.date_iqa,
                    shiftToShift: record.shift_to_shift,
                    expense: record.expense,
                    reExpense: record.re_expense,
                    qcOwner: record.qc_owner,
                    model: record.model,
                    item: record.item,
                    telex: record.telex,
                    supplier: record.supplier,
                    descr: record.descr,
                    location: record.location,
                    qty: record.qty,
                    supplierDo: record.supplier_do,
                    remark: record.remark,
                    po: record.po,
                    sbr: record.sbr,
                    dispositionCode: record.disposition_code,
                    receiptDate: record.receipt_date,
                    age: record.age,
                    warehouse: record.warehouse,
                    building: record.building,
                    businessUnit: record.business_unit,
                    stdCaseQty: record.std_case_qty,
                    lpn: record.lpn,
                    lotno: record.lotno,
                    refCode: record.ref_code,
                    dataOnWeb: record.data_on_web,
                    inspec: record.inspec,
                    rej: record.rej,
                    defect: record.defect,
                    vender: record.vender
                };
                const updateData = {
                    shiftToShift: record.shift_to_shift,
                    reExpense: record.re_expense,
                    qcOwner: record.qc_owner,
                    item: record.item,
                    telex: record.telex,
                    supplier: record.supplier,
                    descr: record.descr,
                    qty: record.qty,
                    remark: record.remark,
                    po: record.po,
                    sbr: record.sbr,
                    dispositionCode: record.disposition_code,
                    receiptDate: record.receipt_date,
                    warehouse: record.warehouse,
                    building: record.building,
                    businessUnit: record.business_unit,
                    stdCaseQty: record.std_case_qty,
                    lpn: record.lpn,
                    refCode: record.ref_code,
                    dataOnWeb: record.data_on_web,
                    inspec: record.inspec,
                    rej: record.rej,
                    defect: record.defect,
                    vender: record.vender
                };
                try {
                    const result = await this.db
                        .insert(schema_1.iqadata)
                        .values(insertData)
                        .onConflictDoUpdate({
                        target: [schema_1.iqadata.fy, schema_1.iqadata.ww, schema_1.iqadata.fw, schema_1.iqadata.dateIqa, schema_1.iqadata.model, schema_1.iqadata.lotno, schema_1.iqadata.location, schema_1.iqadata.supplierDo, schema_1.iqadata.age, schema_1.iqadata.expense],
                        set: updateData
                    })
                        .returning();
                    if (result.length > 0) {
                        insertedRecords.push(mapDrizzleToEntity(result[0]));
                    }
                }
                catch (error) {
                    if (error.code === '42P10' || error.message?.includes('does not exist')) {
                        console.warn('⚠️ Unique constraint iqadata_unique_import does not exist. Using INSERT instead.');
                        const insertResult = await this.db
                            .insert(schema_1.iqadata)
                            .values(insertData)
                            .returning();
                        if (insertResult.length > 0) {
                            insertedRecords.push(mapDrizzleToEntity(insertResult[0]));
                        }
                    }
                    else {
                        console.error('❌ Error during bulk upsert:', {
                            message: error.message,
                            code: error.code,
                            detail: error.detail,
                            hint: error.hint,
                            record: {
                                lotno: record.lotno,
                                model: record.model,
                                date_iqa: record.date_iqa,
                                qty: record.qty,
                                age: record.age
                            }
                        });
                        throw error;
                    }
                }
            }
            return insertedRecords;
        }
        catch (error) {
            throw error;
        }
    }
    async upsert(records) {
        if (records.length === 0) {
            return { inserted: 0, updated: 0, unchanged: 0, failed: 0, duplicates: [] };
        }
        let inserted = 0;
        let updated = 0;
        let unchanged = 0;
        let failed = 0;
        const duplicates = [];
        for (const record of records) {
            try {
                let calculatedFY;
                let calculatedWW;
                if (record.date_iqa) {
                    const fyNumber = (0, shared_1.getFiscalYear)(record.date_iqa);
                    const wwNumber = (0, shared_1.calculateFiscalWeekNumber)(record.date_iqa);
                    calculatedFY = fyNumber.toString();
                    calculatedWW = wwNumber.toString().padStart(2, '0');
                }
                const fy = calculatedFY || record.fy;
                const ww = calculatedWW || record.ww;
                const existingRecords = await this.db
                    .select()
                    .from(schema_1.iqadata)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.iqadata.fy, fy ?? ''), (0, drizzle_orm_1.eq)(schema_1.iqadata.ww, ww ?? ''), (0, drizzle_orm_1.eq)(schema_1.iqadata.fw, record.fw ?? ''), (0, drizzle_orm_1.eq)(schema_1.iqadata.dateIqa, record.date_iqa ?? ''), (0, drizzle_orm_1.eq)(schema_1.iqadata.model, record.model ?? ''), (0, drizzle_orm_1.eq)(schema_1.iqadata.lotno, record.lotno ?? ''), (0, drizzle_orm_1.eq)(schema_1.iqadata.location, record.location ?? ''), (0, drizzle_orm_1.eq)(schema_1.iqadata.supplierDo, record.supplier_do ?? ''), (0, drizzle_orm_1.eq)(schema_1.iqadata.age, record.age ?? 0), (0, drizzle_orm_1.eq)(schema_1.iqadata.expense, record.expense ?? '')))
                    .limit(1);
                const existingRecord = existingRecords.length > 0 ? existingRecords[0] : null;
                if (existingRecord) {
                    let hasChanges = false;
                    const fieldMap = {
                        fy: fy,
                        ww: ww,
                        fw: record.fw,
                        dateIqa: record.date_iqa,
                        shiftToShift: record.shift_to_shift,
                        expense: record.expense,
                        reExpense: record.re_expense,
                        qcOwner: record.qc_owner,
                        model: record.model,
                        item: record.item,
                        telex: record.telex,
                        supplier: record.supplier,
                        descr: record.descr,
                        location: record.location,
                        qty: record.qty,
                        supplierDo: record.supplier_do,
                        remark: record.remark,
                        po: record.po,
                        sbr: record.sbr,
                        dispositionCode: record.disposition_code,
                        receiptDate: record.receipt_date,
                        age: record.age,
                        warehouse: record.warehouse,
                        building: record.building,
                        businessUnit: record.business_unit,
                        stdCaseQty: record.std_case_qty,
                        lpn: record.lpn,
                        lotno: record.lotno,
                        refCode: record.ref_code,
                        dataOnWeb: record.data_on_web,
                        inspec: record.inspec,
                        rej: record.rej,
                        defect: record.defect,
                        vender: record.vender
                    };
                    for (const [field, value] of Object.entries(fieldMap)) {
                        if (value !== undefined) {
                            const existingValue = existingRecord[field];
                            const normalizedNew = value === null || value === '' ? null : value;
                            const normalizedExisting = existingValue === null || existingValue === '' ? null : existingValue;
                            if (String(normalizedNew) !== String(normalizedExisting)) {
                                hasChanges = true;
                                break;
                            }
                        }
                    }
                    if (!hasChanges) {
                        unchanged++;
                        duplicates.push({
                            lotno: record.lotno || '(empty)',
                            model: record.model || '(empty)',
                            date_iqa: record.date_iqa || '(empty)'
                        });
                        continue;
                    }
                }
                const insertData = {
                    fy: fy,
                    ww: ww,
                    fw: record.fw,
                    dateIqa: record.date_iqa,
                    shiftToShift: record.shift_to_shift,
                    expense: record.expense,
                    reExpense: record.re_expense,
                    qcOwner: record.qc_owner,
                    model: record.model,
                    item: record.item,
                    telex: record.telex,
                    supplier: record.supplier,
                    descr: record.descr,
                    location: record.location,
                    qty: record.qty,
                    supplierDo: record.supplier_do,
                    remark: record.remark,
                    po: record.po,
                    sbr: record.sbr,
                    dispositionCode: record.disposition_code,
                    receiptDate: record.receipt_date,
                    age: record.age,
                    warehouse: record.warehouse,
                    building: record.building,
                    businessUnit: record.business_unit,
                    stdCaseQty: record.std_case_qty,
                    lpn: record.lpn,
                    lotno: record.lotno,
                    refCode: record.ref_code,
                    dataOnWeb: record.data_on_web,
                    inspec: record.inspec,
                    rej: record.rej,
                    defect: record.defect,
                    vender: record.vender
                };
                console.log('🔍 DEBUG - insertData key values:', {
                    lotno: insertData.lotno,
                    qty: insertData.qty,
                    age: insertData.age,
                    model: insertData.model,
                    location: insertData.location,
                    expense: insertData.expense
                });
                const updateData = {
                    shiftToShift: record.shift_to_shift,
                    reExpense: record.re_expense,
                    qcOwner: record.qc_owner,
                    item: record.item,
                    telex: record.telex,
                    supplier: record.supplier,
                    descr: record.descr,
                    qty: record.qty,
                    remark: record.remark,
                    po: record.po,
                    sbr: record.sbr,
                    dispositionCode: record.disposition_code,
                    receiptDate: record.receipt_date,
                    warehouse: record.warehouse,
                    building: record.building,
                    businessUnit: record.business_unit,
                    stdCaseQty: record.std_case_qty,
                    lpn: record.lpn,
                    refCode: record.ref_code,
                    dataOnWeb: record.data_on_web,
                    inspec: record.inspec,
                    rej: record.rej,
                    defect: record.defect,
                    vender: record.vender
                };
                await this.db
                    .insert(schema_1.iqadata)
                    .values(insertData)
                    .onConflictDoUpdate({
                    target: [schema_1.iqadata.fy, schema_1.iqadata.ww, schema_1.iqadata.fw, schema_1.iqadata.dateIqa, schema_1.iqadata.model, schema_1.iqadata.lotno, schema_1.iqadata.location, schema_1.iqadata.supplierDo, schema_1.iqadata.age, schema_1.iqadata.expense],
                    set: updateData
                });
                if (existingRecord) {
                    updated++;
                }
                else {
                    inserted++;
                }
            }
            catch (error) {
                const pgError = error.cause || error;
                console.error('❌ Error upserting record:', {
                    message: error.message,
                    pgCode: pgError?.code,
                    pgDetail: pgError?.detail,
                    pgHint: pgError?.hint,
                    pgConstraint: pgError?.constraint,
                    record: {
                        lotno: record.lotno,
                        model: record.model,
                        date_iqa: record.date_iqa,
                        qty: record.qty,
                        age: record.age,
                        expense: record.expense,
                        location: record.location
                    }
                });
                if (error.message?.includes('no unique or exclusion constraint') ||
                    pgError?.code === '42P10') {
                    console.error('⚠️ HINT: The unique constraint iqadata_unique_import may not exist in the database.');
                    console.error('   Run the migration: database-server/migrations/2026-01-28_add_iqadata_unique_constraint.sql');
                }
                failed++;
            }
        }
        console.log('📊 Upsert summary:', {
            total: records.length,
            inserted,
            updated,
            unchanged,
            failed,
            duplicates: duplicates.length
        });
        return { inserted, updated, unchanged, failed, duplicates };
    }
    async deleteAll(actor = null, req) {
        try {
            return await this.db.transaction(async (tx) => {
                const result = await tx.delete(schema_1.iqadata).returning({ id: schema_1.iqadata.id });
                const count = result.length;
                if (count > 0) {
                    const sampleIds = result.slice(0, 50).map((r) => r.id);
                    await (0, auditLogger_1.logDelete)(this.db, {
                        entity: 'iqadata',
                        recordId: '*',
                        oldValues: { count, sampleIds },
                        actor,
                        req,
                        tx,
                        reason: 'BULK_DELETE_ALL',
                    });
                }
                return count;
            });
        }
        catch (error) {
            console.error('IQAData deleteAll error:', error);
            throw new Error(`Failed to delete all IQA data: ${error.message}`);
        }
    }
    async bulkDelete(ids) {
        try {
            if (!ids || ids.length === 0) {
                return {
                    success: false,
                    deletedCount: 0,
                    error: 'No IDs provided for deletion'
                };
            }
            const safeIds = ids.map(id => parseInt(String(id), 10)).filter(id => !isNaN(id));
            const result = await this.db.execute(drizzle_orm_1.sql.raw(`DELETE FROM iqadata WHERE id IN (${safeIds.join(', ')}) RETURNING id`));
            const deletedCount = Array.isArray(result) ? result.length : (result.rows?.length ?? 0);
            return {
                success: true,
                deletedCount
            };
        }
        catch (error) {
            console.error('IQAData bulkDelete error:', error);
            return {
                success: false,
                deletedCount: 0,
                error: `Failed to bulk delete IQA data: ${error.message}`
            };
        }
    }
    async getDistinctFY() {
        try {
            const result = await this.db
                .selectDistinct({ fy: schema_1.iqadata.fy })
                .from(schema_1.iqadata)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.isNotNull)(schema_1.iqadata.fy), (0, drizzle_orm_1.ne)(schema_1.iqadata.fy, '')))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.iqadata.fy));
            return result.map(row => row.fy).filter(Boolean);
        }
        catch (error) {
            console.error('IQAData getDistinctFY error:', error);
            throw new Error(`Failed to get distinct FY values: ${error.message}`);
        }
    }
    async getDistinctWW(fy) {
        try {
            let query = this.db
                .selectDistinct({ ww: schema_1.iqadata.ww })
                .from(schema_1.iqadata)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.isNotNull)(schema_1.iqadata.ww), (0, drizzle_orm_1.ne)(schema_1.iqadata.ww, '')));
            if (fy && fy.trim() !== '') {
                query = this.db
                    .selectDistinct({ ww: schema_1.iqadata.ww })
                    .from(schema_1.iqadata)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.isNotNull)(schema_1.iqadata.ww), (0, drizzle_orm_1.ne)(schema_1.iqadata.ww, ''), (0, drizzle_orm_1.eq)(schema_1.iqadata.fy, fy)));
            }
            const result = await query.orderBy(schema_1.iqadata.ww);
            return result.map(row => row.ww).filter(Boolean);
        }
        catch (error) {
            console.error('IQAData getDistinctWW error:', error);
            throw new Error(`Failed to get distinct WW values: ${error.message}`);
        }
    }
}
exports.IQADataModel = IQADataModel;
function createIQADataModel(db) {
    return new IQADataModel(db);
}
exports.default = IQADataModel;
