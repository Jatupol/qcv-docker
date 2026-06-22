// server/src/entities/iqadata/model-drizzle.ts
/**
 * IQA Data Entity Model - Drizzle ORM Implementation
 * SPECIAL Pattern with SERIAL Primary Key
 *
 * This is the Drizzle ORM version of the IQADataModel.
 * It provides the same interface as the original model but uses Drizzle ORM.
 *
 * Migration Notes:
 * - Same interface as original IQADataModel
 * - Uses Drizzle schema and query builder
 * - Enabled via DRIZZLE_IQADATA=true in .env
 */

import { eq, sql, desc, ilike, or, and, isNotNull, ne } from 'drizzle-orm';
import type { Request } from 'express';
import { logDelete, SessionUserLite } from '../../utils/auditLogger';
import { DrizzleDb } from '../../db';
import { iqadata, Iqadata, NewIqadata } from '../../db/schema';
import {
  IQAData,
  CreateIQADataRequest,
  UpdateIQADataRequest,
  DEFAULT_IQADATA_CONFIG
} from './types';
import { getFiscalYear, calculateFiscalWeekNumber } from '@qcv/shared';

// ==================== TYPE MAPPING ====================

/**
 * Map Drizzle result to entity type (camelCase → snake_case)
 */
function mapDrizzleToEntity(row: Iqadata, searchTerm?: string): IQAData {
  const entity: IQAData = {
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

    // BaseSpecialEntity required fields
    is_active: true,
    created_by: 0,
    updated_by: 0,
    created_at: new Date(),
    updated_at: new Date()
  };

  // Add search highlighting if search term provided
  if (searchTerm) {
    entity.highlight = highlightSearchTerm(entity, searchTerm);
  }

  return entity;
}

/**
 * Highlight search term in entity fields
 */
function highlightSearchTerm(entity: IQAData, searchTerm: string): Record<string, string> {
  const highlight: Record<string, string> = {};
  const regex = new RegExp(`(${searchTerm})`, 'gi');

  const searchableFields = ['ww', 'model', 'supplier', 'qc_owner', 'item', 'lotno', 'defect'];

  searchableFields.forEach(field => {
    const value = (entity as any)[field];
    if (value && typeof value === 'string' && regex.test(value)) {
      highlight[field] = value.replace(regex, '<mark>$1</mark>');
    }
  });

  return highlight;
}

// ==================== IQA DATA MODEL CLASS (DRIZZLE) ====================

/**
 * IQA Data Entity Model - Drizzle ORM Version
 *
 * Data access layer for IQA data management using Drizzle ORM.
 * Provides bulk import functionality with type-safe queries.
 */
export class IQADataModel {
  private db: DrizzleDb;
  private config = DEFAULT_IQADATA_CONFIG;

  constructor(db: DrizzleDb) {
    this.db = db;
  }

  // ==================== REQUIRED ISPECIALMODEL METHODS ====================

  /**
   * Find IQA data by id (primary key)
   */
  async getByKey(keyValues: Record<string, any>): Promise<IQAData | null> {
    try {
      const { id } = keyValues;

      if (!id) {
        throw new Error('ID is required');
      }

      const result = await this.db
        .select()
        .from(iqadata)
        .where(eq(iqadata.id, id))
        .limit(1);

      return result.length > 0 ? mapDrizzleToEntity(result[0]) : null;
    } catch (error: any) {
      console.error('IQAData getByKey error:', error);
      throw new Error(`Failed to find IQA data: ${error.message}`);
    }
  }

  /**
   * Get all IQA data with optional search
   */
  async getAll(searchTerm?: string): Promise<IQAData[]> {
    try {
      let query = this.db.select().from(iqadata);

      if (searchTerm && searchTerm.trim()) {
        const sanitizedSearch = `%${searchTerm.trim()}%`;
        query = query.where(
          or(
            ilike(iqadata.ww, sanitizedSearch),
            ilike(iqadata.model, sanitizedSearch),
            ilike(iqadata.supplier, sanitizedSearch),
            ilike(iqadata.qcOwner, sanitizedSearch),
            ilike(iqadata.item, sanitizedSearch),
            ilike(iqadata.lotno, sanitizedSearch),
            ilike(iqadata.defect, sanitizedSearch)
          )
        ) as any;
      }

      const result = await query.orderBy(desc(iqadata.id));

      return result.map(row => mapDrizzleToEntity(row, searchTerm));
    } catch (error: any) {
      console.error('IQAData getAll error:', error);
      throw new Error(`Failed to get IQA data: ${error.message}`);
    }
  }

  /**
   * Create new IQA data record
   */
  async create(data: CreateIQADataRequest, userId: number): Promise<{ success: boolean; data?: IQAData; error?: string }> {
    try {
      // Calculate fiscal year and week from date_iqa if date is provided
      let calculatedFY: string | undefined;
      let calculatedWW: string | undefined;

      if (data.date_iqa) {
        const fyNumber = getFiscalYear(data.date_iqa);
        const wwNumber = calculateFiscalWeekNumber(data.date_iqa);
        calculatedFY = fyNumber.toString();
        calculatedWW = wwNumber.toString().padStart(2, '0');
      }

      const insertData: NewIqadata = {
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
        .insert(iqadata)
        .values(insertData)
        .returning();

      return {
        success: true,
        data: mapDrizzleToEntity(result[0])
      };
    } catch (error: any) {
      console.error('IQAData create error:', error);
      return {
        success: false,
        error: `Failed to create IQA data: ${error.message}`
      };
    }
  }

  /**
   * Update existing IQA data record
   */
  async update(keyValues: Record<string, any>, data: UpdateIQADataRequest, userId: number): Promise<{ success: boolean; data?: IQAData; error?: string }> {
    try {
      const { id } = keyValues;

      if (!id) {
        return {
          success: false,
          error: 'ID is required for update'
        };
      }

      const updateData: Partial<NewIqadata> = {};

      if (data.ww !== undefined) updateData.ww = data.ww;
      if (data.date_iqa !== undefined) updateData.dateIqa = data.date_iqa;
      if (data.shift_to_shift !== undefined) updateData.shiftToShift = data.shift_to_shift;
      if (data.expense !== undefined) updateData.expense = data.expense;
      if (data.re_expense !== undefined) updateData.reExpense = data.re_expense;
      if (data.qc_owner !== undefined) updateData.qcOwner = data.qc_owner;
      if (data.model !== undefined) updateData.model = data.model;
      if (data.item !== undefined) updateData.item = data.item;
      if (data.telex !== undefined) updateData.telex = data.telex;
      if (data.supplier !== undefined) updateData.supplier = data.supplier;
      if (data.descr !== undefined) updateData.descr = data.descr;
      if (data.location !== undefined) updateData.location = data.location;
      if (data.qty !== undefined) updateData.qty = data.qty;
      if (data.supplier_do !== undefined) updateData.supplierDo = data.supplier_do;
      if (data.remark !== undefined) updateData.remark = data.remark;
      if (data.po !== undefined) updateData.po = data.po;
      if (data.sbr !== undefined) updateData.sbr = data.sbr;
      if (data.disposition_code !== undefined) updateData.dispositionCode = data.disposition_code;
      if (data.receipt_date !== undefined) updateData.receiptDate = data.receipt_date;
      if (data.age !== undefined) updateData.age = data.age;
      if (data.warehouse !== undefined) updateData.warehouse = data.warehouse;
      if (data.building !== undefined) updateData.building = data.building;
      if (data.business_unit !== undefined) updateData.businessUnit = data.business_unit;
      if (data.std_case_qty !== undefined) updateData.stdCaseQty = data.std_case_qty;
      if (data.lpn !== undefined) updateData.lpn = data.lpn;
      if (data.lotno !== undefined) updateData.lotno = data.lotno;
      if (data.ref_code !== undefined) updateData.refCode = data.ref_code;
      if (data.data_on_web !== undefined) updateData.dataOnWeb = data.data_on_web;
      if (data.inspec !== undefined) updateData.inspec = data.inspec;
      if (data.rej !== undefined) updateData.rej = data.rej;
      if (data.defect !== undefined) updateData.defect = data.defect;
      if (data.vender !== undefined) updateData.vender = data.vender;

      if (Object.keys(updateData).length === 0) {
        return {
          success: false,
          error: 'No data provided for update'
        };
      }

      const result = await this.db
        .update(iqadata)
        .set(updateData)
        .where(eq(iqadata.id, id))
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
    } catch (error: any) {
      console.error('IQAData update error:', error);
      return {
        success: false,
        error: `Failed to update IQA data: ${error.message}`
      };
    }
  }

  /**
   * Delete IQA data record
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
          error: 'ID is required for delete'
        };
      }

      return await this.db.transaction(async (tx: any) => {
        const [deleted] = await tx
          .delete(iqadata)
          .where(eq(iqadata.id, id))
          .returning();

        if (!deleted) {
          return { success: false, error: 'IQA data not found' };
        }

        await logDelete(this.db, {
          entity: 'iqadata',
          recordId: deleted.id,
          oldValues: deleted as any,
          actor,
          req,
          tx,
        });

        return { success: true };
      });
    } catch (error: any) {
      console.error('IQAData delete error:', error);
      return {
        success: false,
        error: `Failed to delete IQA data: ${error.message}`
      };
    }
  }

  // ==================== IQA-SPECIFIC OPERATIONS ====================

  /**
   * Bulk insert or update IQA data records (UPSERT)
   * Uses raw SQL for ON CONFLICT clause since Drizzle onConflictDoUpdate has limitations
   */
  async bulkCreate(records: CreateIQADataRequest[]): Promise<IQAData[]> {
    if (records.length === 0) {
      return [];
    }

    const insertedRecords: IQAData[] = [];

    try {
      for (const record of records) {
        // Calculate fiscal year and week from date_iqa if date is provided
        let calculatedFY: string | undefined;
        let calculatedWW: string | undefined;

        if (record.date_iqa) {
          const fyNumber = getFiscalYear(record.date_iqa);
          const wwNumber = calculateFiscalWeekNumber(record.date_iqa);
          calculatedFY = fyNumber.toString();
          calculatedWW = wwNumber.toString().padStart(2, '0');
        }

        const insertData: NewIqadata = {
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

        // Update data excludes conflict target columns to avoid parameter duplication
        // Conflict target: fy, ww, fw, dateIqa, model, lotno, location, supplierDo, age, expense
        const updateData = {
          shiftToShift: record.shift_to_shift,
          // expense is part of conflict target, excluded from update
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
          // Use Drizzle's onConflictDoUpdate for upsert
          const result = await this.db
            .insert(iqadata)
            .values(insertData)
            .onConflictDoUpdate({
              target: [iqadata.fy, iqadata.ww, iqadata.fw, iqadata.dateIqa, iqadata.model, iqadata.lotno, iqadata.location, iqadata.supplierDo, iqadata.age, iqadata.expense],
              set: updateData
            })
            .returning();

          if (result.length > 0) {
            insertedRecords.push(mapDrizzleToEntity(result[0]));
          }
        } catch (error: any) {
          // If unique constraint doesn't exist, fall back to INSERT
          if (error.code === '42P10' || error.message?.includes('does not exist')) {
            console.warn('⚠️ Unique constraint iqadata_unique_import does not exist. Using INSERT instead.');
            const insertResult = await this.db
              .insert(iqadata)
              .values(insertData)
              .returning();

            if (insertResult.length > 0) {
              insertedRecords.push(mapDrizzleToEntity(insertResult[0]));
            }
          } else {
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
    } catch (error) {
      throw error;
    }
  }

  /**
   * Upsert IQA data records (Insert or Update based on unique constraint)
   * RULE 1: If data in all columns is same as existing, update it
   * Returns statistics about inserted, updated, and failed records
   * Also returns list of duplicate records (unchanged)
   */
  async upsert(records: CreateIQADataRequest[]): Promise<{
    inserted: number;
    updated: number;
    unchanged: number;
    failed: number;
    duplicates: Array<{ lotno: string; model: string; date_iqa: string }>;
  }> {
    if (records.length === 0) {
      return { inserted: 0, updated: 0, unchanged: 0, failed: 0, duplicates: [] };
    }

    let inserted = 0;
    let updated = 0;
    let unchanged = 0;
    let failed = 0;
    const duplicates: Array<{ lotno: string; model: string; date_iqa: string }> = [];

    for (const record of records) {
      try {
        // Calculate fiscal year and week from date_iqa if date is provided
        let calculatedFY: string | undefined;
        let calculatedWW: string | undefined;

        if (record.date_iqa) {
          const fyNumber = getFiscalYear(record.date_iqa);
          const wwNumber = calculateFiscalWeekNumber(record.date_iqa);
          calculatedFY = fyNumber.toString();
          calculatedWW = wwNumber.toString().padStart(2, '0');
        }

        const fy = calculatedFY || record.fy;
        const ww = calculatedWW || record.ww;

        // Check if record exists and get its data to compare
        // Note: Unique constraint is on (fy, ww, fw, date_iqa, model, lotno, location, supplier_do, age, expense)
        const existingRecords = await this.db
          .select()
          .from(iqadata)
          .where(
            and(
              eq(iqadata.fy, fy ?? ''),
              eq(iqadata.ww, ww ?? ''),
              eq(iqadata.fw, record.fw ?? ''),
              eq(iqadata.dateIqa, record.date_iqa ?? ''),
              eq(iqadata.model, record.model ?? ''),
              eq(iqadata.lotno, record.lotno ?? ''),
              eq(iqadata.location, record.location ?? ''),
              eq(iqadata.supplierDo, record.supplier_do ?? ''),
              eq(iqadata.age, record.age ?? 0),
              eq(iqadata.expense, record.expense ?? '')
            )
          )
          .limit(1);

        const existingRecord = existingRecords.length > 0 ? existingRecords[0] : null;

        // If record exists, check if data has changed
        if (existingRecord) {
          let hasChanges = false;

          // Compare all fields to detect changes
          const fieldMap: Record<string, any> = {
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
              const existingValue = (existingRecord as any)[field];
              // Normalize values for comparison (handle null, undefined, empty string)
              const normalizedNew = value === null || value === '' ? null : value;
              const normalizedExisting = existingValue === null || existingValue === '' ? null : existingValue;

              // Convert to string for comparison to handle type differences
              if (String(normalizedNew) !== String(normalizedExisting)) {
                hasChanges = true;
                break;
              }
            }
          }

          if (!hasChanges) {
            // Record exists and data is identical - skip update
            unchanged++;
            duplicates.push({
              lotno: record.lotno || '(empty)',
              model: record.model || '(empty)',
              date_iqa: record.date_iqa || '(empty)'
            });
            continue;
          }
        }

        const insertData: NewIqadata = {
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

        // Debug: Log key values to verify data integrity
        console.log('🔍 DEBUG - insertData key values:', {
          lotno: insertData.lotno,
          qty: insertData.qty,
          age: insertData.age,
          model: insertData.model,
          location: insertData.location,
          expense: insertData.expense
        });

        // Update data excludes conflict target columns to avoid parameter duplication
        // Conflict target: fy, ww, fw, dateIqa, model, lotno, location, supplierDo, age, expense
        const updateData = {
          shiftToShift: record.shift_to_shift,
          // expense is part of conflict target, excluded from update
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

        // Perform upsert
        await this.db
          .insert(iqadata)
          .values(insertData)
          .onConflictDoUpdate({
            target: [iqadata.fy, iqadata.ww, iqadata.fw, iqadata.dateIqa, iqadata.model, iqadata.lotno, iqadata.location, iqadata.supplierDo, iqadata.age, iqadata.expense],
            set: updateData
          });

        if (existingRecord) {
          updated++;
        } else {
          inserted++;
        }
      } catch (error: any) {
        // Extract PostgreSQL error details from Drizzle error
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

        // Check if it's a missing constraint error
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

  /**
   * Delete all IQA data records
   * Useful for clearing data before re-import
   * Audit strategy: emit a single summary row (record_id='*') with count + sample IDs.
   */
  async deleteAll(
    actor: SessionUserLite | null = null,
    req?: Request
  ): Promise<number> {
    try {
      return await this.db.transaction(async (tx: any) => {
        const result = await tx.delete(iqadata).returning({ id: iqadata.id });
        const count = result.length;

        if (count > 0) {
          const sampleIds = result.slice(0, 50).map((r: any) => r.id);
          await logDelete(this.db, {
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
    } catch (error: any) {
      console.error('IQAData deleteAll error:', error);
      throw new Error(`Failed to delete all IQA data: ${error.message}`);
    }
  }

  /**
   * Bulk delete IQA data records by IDs
   * @param ids - Array of IQA data IDs to delete
   * @returns Number of records deleted
   */
  async bulkDelete(ids: number[]): Promise<{ success: boolean; deletedCount: number; error?: string }> {
    try {
      // Validate input
      if (!ids || ids.length === 0) {
        return {
          success: false,
          deletedCount: 0,
          error: 'No IDs provided for deletion'
        };
      }

      // Build safe IN clause with escaped integer IDs
      const safeIds = ids.map(id => parseInt(String(id), 10)).filter(id => !isNaN(id));
      const result = await this.db.execute(
        sql.raw(`DELETE FROM iqadata WHERE id IN (${safeIds.join(', ')}) RETURNING id`)
      );

      const deletedCount = Array.isArray(result) ? result.length : ((result as any).rows?.length ?? 0);

      return {
        success: true,
        deletedCount
      };
    } catch (error: any) {
      console.error('IQAData bulkDelete error:', error);
      return {
        success: false,
        deletedCount: 0,
        error: `Failed to bulk delete IQA data: ${error.message}`
      };
    }
  }

  /**
   * Get distinct FY values
   * Used for filter dropdown
   */
  async getDistinctFY(): Promise<string[]> {
    try {
      const result = await this.db
        .selectDistinct({ fy: iqadata.fy })
        .from(iqadata)
        .where(and(isNotNull(iqadata.fy), ne(iqadata.fy, '')))
        .orderBy(desc(iqadata.fy));

      return result.map(row => row.fy!).filter(Boolean);
    } catch (error: any) {
      console.error('IQAData getDistinctFY error:', error);
      throw new Error(`Failed to get distinct FY values: ${error.message}`);
    }
  }

  /**
   * Get distinct WW values
   * Used for filter dropdown
   * @param fy - Optional fiscal year to filter WW values (empty string means all)
   */
  async getDistinctWW(fy: string): Promise<string[]> {
    try {
      let query = this.db
        .selectDistinct({ ww: iqadata.ww })
        .from(iqadata)
        .where(and(isNotNull(iqadata.ww), ne(iqadata.ww, '')));

      if (fy && fy.trim() !== '') {
        query = this.db
          .selectDistinct({ ww: iqadata.ww })
          .from(iqadata)
          .where(and(isNotNull(iqadata.ww), ne(iqadata.ww, ''), eq(iqadata.fy, fy)));
      }

      const result = await query.orderBy(iqadata.ww);

      return result.map(row => row.ww!).filter(Boolean);
    } catch (error: any) {
      console.error('IQAData getDistinctWW error:', error);
      throw new Error(`Failed to get distinct WW values: ${error.message}`);
    }
  }
}

// ==================== FACTORY FUNCTION ====================

/**
 * Factory function to create a Drizzle IQA data model instance
 */
export function createIQADataModel(db: DrizzleDb): IQADataModel {
  return new IQADataModel(db);
}

export default IQADataModel;
