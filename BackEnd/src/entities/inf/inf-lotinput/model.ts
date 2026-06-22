// server/src/entities/inf/inf-lotinput/model-drizzle.ts
/* INF Lot Input Entity Model - Drizzle ORM Implementation
 * Interface Table (synced from MSSQL) - Read-Only Focus
 *
 * This is the Drizzle ORM version of the InfLotInputModel.
 * It provides the same interface as the original model but uses Drizzle ORM.
 *
 * Migration Notes:
 * - Same interface as original InfLotInputModel
 * - Uses Drizzle schema and query builder
 * - Enabled via DRIZZLE_INF_LOTINPUT=true in .env
 */

import { eq, like, or, and, sql, desc, asc, ilike, isNull, isNotNull } from 'drizzle-orm';
import { DrizzleDb } from '../../../db';
import { infLotinput, InfLotinput as DrizzleInfLotinput } from '../../../db/schema';
import {
  InfLotInputRecord,
  InfLotInputQueryParams,
  PaginationInfo,
  ImportStats,
  FilterOptions,
  INF_LOTINPUT_TABLE_CONFIG
} from './types';
import { formatDateTimeLocal } from '../../../utils/dateTimeUtils';

// ==================== TYPE MAPPING ====================

/**
 * Map Drizzle result to entity type
 */
function mapDrizzleToRecord(row: DrizzleInfLotinput): InfLotInputRecord {
  return {
    id: row.id || '',
    LotNo: row.lotno || '',
    PartSite: row.partsite || '',
    LineNo: row.lineno || '',
    ItemNo: row.itemno || '',
    Model: row.model || '',
    Version: row.version || '',
    InputDate: row.inputdate ? formatDateTimeLocal(row.inputdate) : '',
    FinishOn: row.finishOn ? formatDateTimeLocal(row.finishOn) : null,
    imported_at: row.importedAt ? formatDateTimeLocal(row.importedAt) : '',
  };
}

// ==================== INF LOT INPUT MODEL CLASS (DRIZZLE) ====================

/**
 * INF Lot Input Entity Model - Drizzle ORM Version
 *
 * Data access layer for lot input data using Drizzle ORM.
 * Focus on data retrieval and search operations.
 */
export class InfLotInputModel {
  private db: DrizzleDb;
  private config = INF_LOTINPUT_TABLE_CONFIG;

  constructor(db: DrizzleDb) {
    this.db = db;
  }

  // ==================== CORE DATA RETRIEVAL ====================

  /**
   * Get all records with pagination and filtering
   */
  async getAll(queryParams: InfLotInputQueryParams = {}): Promise<{
    data: InfLotInputRecord[];
    pagination?: PaginationInfo;
  }> {
    const {
      page = 1,
      limit = this.config.defaultLimit,
      lotNoSearch,
      itemNoSearch,
      globalSearch,
      partSite,
      lineNo,
      model,
      version,
      inputDateFrom,
      inputDateTo,
      lotNo,
      itemNo,
      search
    } = queryParams;

    try {
      console.log('🔧 InfLotInputModel.getAll called with params:', queryParams);

      // Build conditions
      const conditions = [];

      // Lot number search
      if (lotNoSearch || lotNo) {
        conditions.push(ilike(infLotinput.lotno, `%${lotNoSearch || lotNo}%`));
      }

      // Item number search
      if (itemNoSearch || itemNo) {
        conditions.push(ilike(infLotinput.itemno, `%${itemNoSearch || itemNo}%`));
      }

      // Global search
      if (globalSearch || search) {
        const searchTerm = globalSearch || search;
        const searchPattern = `%${searchTerm}%`;
        conditions.push(
          or(
            ilike(infLotinput.lotno, searchPattern),
            ilike(infLotinput.partsite, searchPattern),
            ilike(infLotinput.lineno, searchPattern),
            ilike(infLotinput.itemno, searchPattern),
            ilike(infLotinput.model, searchPattern),
            ilike(infLotinput.version, searchPattern)
          )!
        );
      }

      // Dropdown filters
      if (partSite) {
        conditions.push(eq(infLotinput.partsite, partSite));
      }

      if (lineNo) {
        conditions.push(eq(infLotinput.lineno, lineNo));
      }

      if (model) {
        conditions.push(eq(infLotinput.model, model));
      }

      if (version) {
        conditions.push(eq(infLotinput.version, version));
      }

      // Date filters
      if (inputDateFrom) {
        conditions.push(sql`${infLotinput.inputdate} >= ${inputDateFrom}`);
      }

      if (inputDateTo) {
        conditions.push(sql`${infLotinput.inputdate} <= ${inputDateTo}::date + INTERVAL '1 day' - INTERVAL '1 second'`);
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Count total records
      const countResult = await this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(infLotinput)
        .where(whereClause);
      const total = countResult[0]?.count || 0;

      // Calculate pagination
      const offset = (page - 1) * limit;
      const totalPages = Math.ceil(total / limit);

      // Get paginated data
      const data = await this.db
        .select()
        .from(infLotinput)
        .where(whereClause)
        .orderBy(desc(infLotinput.inputdate), desc(infLotinput.importedAt))
        .limit(limit)
        .offset(offset);

      const records = data.map(mapDrizzleToRecord);

      console.log(`✅ InfLotInputModel.getAll: Retrieved ${records.length} records`);

      const pagination: PaginationInfo = {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      };

      return { data: records, pagination };

    } catch (error) {
      console.error('❌ Error in InfLotInputModel.getAll:', error);
      throw new Error(`Failed to retrieve inf lot input data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get records by specific lot number
   */
  async getByLotNumber(lotNo: string): Promise<InfLotInputRecord[]> {
    try {
      console.log('🔧 InfLotInputModel.getByLotNumber called:', { lotNo });

      const data = await this.db
        .select()
        .from(infLotinput)
        .where(eq(infLotinput.lotno, lotNo))
        .orderBy(desc(infLotinput.inputdate), desc(infLotinput.importedAt));

      const records = data.map(mapDrizzleToRecord);
      console.log(`✅ InfLotInputModel.getByLotNumber: Found ${records.length} records`);
      return records;

    } catch (error) {
      console.error('❌ Error in InfLotInputModel.getByLotNumber:', error);
      throw new Error(`Failed to retrieve lot: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get statistics for dashboard
   */
  async getStatistics(): Promise<ImportStats> {
    try {
      console.log('📊 InfLotInputModel.getStatistics called');

      const result = await this.db
        .select({
          totalRecords: sql<number>`count(*)::int`,
          totalToday: sql<number>`count(CASE WHEN ${infLotinput.inputdate}::date = CURRENT_DATE THEN 1 END)::int`,
          totalMonth: sql<number>`count(CASE WHEN date_trunc('month', ${infLotinput.inputdate}) = date_trunc('month', CURRENT_DATE) THEN 1 END)::int`,
          totalYear: sql<number>`count(CASE WHEN date_trunc('year', ${infLotinput.inputdate}) = date_trunc('year', CURRENT_DATE) THEN 1 END)::int`,
          lastSync: sql<Date>`max(${infLotinput.importedAt})`
        })
        .from(infLotinput);

      const stats = result[0];

      const records: ImportStats = {
        totalRecords: stats?.totalRecords || 0,
        totalToday: stats?.totalToday || 0,
        totalMonth: stats?.totalMonth || 0,
        totalYear: stats?.totalYear || 0,
        lastSync: stats?.lastSync ? formatDateTimeLocal(stats.lastSync) : undefined
      };

      console.log('✅ InfLotInputModel.getStatistics: Retrieved statistics', records);
      return records;

    } catch (error) {
      console.error('❌ Error in InfLotInputModel.getStatistics:', error);
      throw new Error(`Failed to retrieve statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get unique filter options from data
   */
  async getFilterOptions(): Promise<FilterOptions> {
    try {
      console.log('🔧 InfLotInputModel.getFilterOptions called');

      const [partSites, lineNos, models, versions] = await Promise.all([
        this.db.selectDistinct({ value: infLotinput.partsite })
          .from(infLotinput)
          .where(isNotNull(infLotinput.partsite))
          .orderBy(asc(infLotinput.partsite)),

        this.db.selectDistinct({ value: infLotinput.lineno })
          .from(infLotinput)
          .where(isNotNull(infLotinput.lineno))
          .orderBy(asc(infLotinput.lineno)),

        this.db.selectDistinct({ value: infLotinput.model })
          .from(infLotinput)
          .where(isNotNull(infLotinput.model))
          .orderBy(asc(infLotinput.model)),

        this.db.selectDistinct({ value: infLotinput.version })
          .from(infLotinput)
          .where(isNotNull(infLotinput.version))
          .orderBy(asc(infLotinput.version))
      ]);

      const options: FilterOptions = {
        partSites: partSites.map(r => r.value!),
        lineNos: lineNos.map(r => r.value!),
        models: models.map(r => r.value!),
        versions: versions.map(r => r.value!)
      };

      console.log('✅ InfLotInputModel.getFilterOptions: Retrieved options');
      return options;

    } catch (error) {
      console.error('❌ Error in InfLotInputModel.getFilterOptions:', error);
      return {
        partSites: [],
        lineNos: [],
        models: [],
        versions: []
      };
    }
  }
}

// ==================== FACTORY FUNCTION ====================

/**
 * Factory function to create a Drizzle inf-lotinput model instance
 */
export function createInfLotInputModel(db: DrizzleDb): InfLotInputModel {
  return new InfLotInputModel(db);
}

export default InfLotInputModel;
