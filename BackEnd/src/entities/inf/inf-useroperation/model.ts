// server/src/entities/inf/inf-useroperation/model-drizzle.ts
/* INF User Operation Model - Drizzle ORM Implementation
 * VARCHAR Primary Key Pattern (username)
 *
 * This is the Drizzle ORM version of the InfUserOperationModel.
 * It provides the same interface as the original model but uses Drizzle ORM.
 *
 * Migration Notes:
 * - Same interface as original InfUserOperationModel
 * - Uses Drizzle schema and query builder
 * - Enabled via DRIZZLE_INF_USEROPERATION=true in .env
 */

import { eq, like, or, and, sql, desc, asc, ilike } from 'drizzle-orm';
import { DrizzleDb } from '../../../db';
import { infUseroperation, InfUseroperation as DrizzleInfUseroperation, NewInfUseroperation } from '../../../db/schema';
import {
  InfUserOperationRecord,
  InfUserOperationQueryParams,
  PaginationInfo,
  ImportStats,
  SyncResult,
  INF_USEROPERATION_TABLE_CONFIG
} from './types';
import { formatDateTimeLocal } from '../../../utils/dateTimeUtils';

// ==================== TYPE MAPPING ====================

/**
 * Map Drizzle result to entity type
 */
function mapDrizzleToRecord(row: DrizzleInfUseroperation): InfUserOperationRecord {
  return {
    username: row.username || '',
    isActive: row.isActive ?? true,
    isDelete: row.isDelete ?? false,
    isSuperAdmin: row.isSuperAdmin ?? false,
    roleCode: row.roleCode || null,
    operatorName: row.operatorName || null,
    isMrb: row.isMrb ?? false,
    lineNoId: row.lineNoId || null,
    workShiftId: row.workShiftId || null,
    importedAt: row.importedAt ? formatDateTimeLocal(row.importedAt) : formatDateTimeLocal(new Date())
  };
}

// ==================== INF USER OPERATION MODEL CLASS (DRIZZLE) ====================

/**
 * INF User Operation Model - Drizzle ORM Version
 *
 * Data access layer for user operation management using Drizzle ORM.
 * Provides user operation-specific database operations with type-safe queries.
 */
export class InfUserOperationModel {
  private db: DrizzleDb;
  private config = INF_USEROPERATION_TABLE_CONFIG;

  constructor(db: DrizzleDb) {
    this.db = db;
  }

  // ==================== CORE DATA RETRIEVAL ====================

  /**
   * Get all records with pagination and filtering
   */
  async getAll(queryParams: InfUserOperationQueryParams = {}): Promise<{
    data: InfUserOperationRecord[];
    pagination?: PaginationInfo;
  }> {
    const {
      page = 1,
      limit = this.config.defaultLimit,
      usernameSearch,
      operatorNameSearch,
      globalSearch,
      roleCode,
      lineNoId,
      workShiftId,
      isActive,
      isSuperAdmin,
      isMrb
    } = queryParams;

    try {
      const conditions = [];

      // Search conditions
      if (usernameSearch) {
        conditions.push(ilike(infUseroperation.username, `%${usernameSearch}%`));
      }

      if (operatorNameSearch) {
        conditions.push(ilike(infUseroperation.operatorName, `%${operatorNameSearch}%`));
      }

      if (globalSearch) {
        const searchPattern = `%${globalSearch}%`;
        conditions.push(
          or(
            ilike(infUseroperation.username, searchPattern),
            ilike(infUseroperation.operatorName, searchPattern),
            ilike(infUseroperation.roleCode, searchPattern),
            ilike(infUseroperation.lineNoId, searchPattern),
            ilike(infUseroperation.workShiftId, searchPattern)
          )!
        );
      }

      // Dropdown filters
      if (roleCode) {
        conditions.push(eq(infUseroperation.roleCode, roleCode));
      }

      if (lineNoId) {
        conditions.push(eq(infUseroperation.lineNoId, lineNoId));
      }

      if (workShiftId) {
        conditions.push(eq(infUseroperation.workShiftId, workShiftId));
      }

      // Boolean filters
      if (isActive !== undefined) {
        conditions.push(eq(infUseroperation.isActive, isActive));
      }

      if (isSuperAdmin !== undefined) {
        conditions.push(eq(infUseroperation.isSuperAdmin, isSuperAdmin));
      }

      if (isMrb !== undefined) {
        conditions.push(eq(infUseroperation.isMrb, isMrb));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Count total records for pagination
      const countResult = await this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(infUseroperation)
        .where(whereClause);

      const total = countResult[0]?.count || 0;

      // Calculate pagination
      const offset = (page - 1) * limit;
      const totalPages = Math.ceil(total / limit);

      // Main query with pagination
      const data = await this.db
        .select()
        .from(infUseroperation)
        .where(whereClause)
        .orderBy(desc(infUseroperation.importedAt))
        .limit(limit)
        .offset(offset);

      const records = data.map(row => mapDrizzleToRecord(row));

      const pagination: PaginationInfo = {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      };

      return {
        data: records,
        pagination
      };

    } catch (error) {
      console.error('❌ Error in InfUserOperationModel.getAll:', error);
      throw new Error(`Failed to retrieve user operation data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get record by username
   */
  async getByUsername(username: string): Promise<InfUserOperationRecord | null> {
    try {
      const result = await this.db
        .select()
        .from(infUseroperation)
        .where(eq(infUseroperation.username, username))
        .limit(1);

      if (result.length === 0) {
        return null;
      }

      return mapDrizzleToRecord(result[0]);

    } catch (error) {
      console.error('❌ Error in InfUserOperationModel.getByUsername:', error);
      throw new Error(`Failed to retrieve user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get record by LineNoId
   */
  async getByLineNoId(lineNoId: string): Promise<InfUserOperationRecord | null> {
    try {
      const result = await this.db
        .select()
        .from(infUseroperation)
        .where(eq(infUseroperation.lineNoId, lineNoId))
        .limit(1);

      if (result.length === 0) {
        return null;
      }

      return mapDrizzleToRecord(result[0]);

    } catch (error) {
      console.error('❌ Error in InfUserOperationModel.getByLineNoId:', error);
      throw new Error(`Failed to retrieve user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get statistics for dashboard
   */
  async getStatistics(): Promise<ImportStats> {
    try {
      const result = await this.db
        .select({
          totalRecords: sql<number>`count(*)::int`,
          totalToday: sql<number>`count(CASE WHEN ${infUseroperation.importedAt}::date = CURRENT_DATE THEN 1 END)::int`,
          totalMonth: sql<number>`count(CASE WHEN date_trunc('month', ${infUseroperation.importedAt}) = date_trunc('month', CURRENT_DATE) THEN 1 END)::int`,
          totalYear: sql<number>`count(CASE WHEN date_trunc('year', ${infUseroperation.importedAt}) = date_trunc('year', CURRENT_DATE) THEN 1 END)::int`,
          totalActive: sql<number>`count(CASE WHEN ${infUseroperation.isActive} = true THEN 1 END)::int`,
          totalInactive: sql<number>`count(CASE WHEN ${infUseroperation.isActive} = false THEN 1 END)::int`,
          totalSuperAdmin: sql<number>`count(CASE WHEN ${infUseroperation.isSuperAdmin} = true THEN 1 END)::int`,
          totalMrb: sql<number>`count(CASE WHEN ${infUseroperation.isMrb} = true THEN 1 END)::int`,
          lastSync: sql<Date | null>`max(${infUseroperation.importedAt})`
        })
        .from(infUseroperation);

      const stats = result[0];

      return {
        totalRecords: stats?.totalRecords || 0,
        totalToday: stats?.totalToday || 0,
        totalMonth: stats?.totalMonth || 0,
        totalYear: stats?.totalYear || 0,
        totalActive: stats?.totalActive || 0,
        totalInactive: stats?.totalInactive || 0,
        totalSuperAdmin: stats?.totalSuperAdmin || 0,
        totalMrb: stats?.totalMrb || 0,
        lastSync: stats?.lastSync ? formatDateTimeLocal(new Date(stats.lastSync)) : undefined
      };

    } catch (error) {
      console.error('❌ Error in InfUserOperationModel.getStatistics:', error);
      throw new Error(`Failed to retrieve statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get unique filter options from data
   */
  async getFilterOptions(): Promise<{
    roleCodes: string[];
    lineNoIds: string[];
    workShiftIds: string[];
  }> {
    try {
      const result = await this.db
        .select({
          roleCodes: sql<string[]>`ARRAY_AGG(DISTINCT ${infUseroperation.roleCode} ORDER BY ${infUseroperation.roleCode}) FILTER (WHERE ${infUseroperation.roleCode} IS NOT NULL)`,
          lineNoIds: sql<string[]>`ARRAY_AGG(DISTINCT ${infUseroperation.lineNoId} ORDER BY ${infUseroperation.lineNoId}) FILTER (WHERE ${infUseroperation.lineNoId} IS NOT NULL)`,
          workShiftIds: sql<string[]>`ARRAY_AGG(DISTINCT ${infUseroperation.workShiftId} ORDER BY ${infUseroperation.workShiftId}) FILTER (WHERE ${infUseroperation.workShiftId} IS NOT NULL)`
        })
        .from(infUseroperation);

      const options = result[0];

      return {
        roleCodes: options?.roleCodes || [],
        lineNoIds: options?.lineNoIds || [],
        workShiftIds: options?.workShiftIds || []
      };

    } catch (error) {
      console.error('❌ Error in InfUserOperationModel.getFilterOptions:', error);
      return {
        roleCodes: [],
        lineNoIds: [],
        workShiftIds: []
      };
    }
  }

  // ==================== SYNC OPERATIONS ====================

  /**
   * Format current datetime as local time string (preserves local timezone)
   * Used for timestamp WITHOUT timezone columns
   */
  private getLocalNow(): Date {
    const now = new Date();
    // Create a date string in local timezone format, then parse it back
    // This ensures the date object represents local time values
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    return new Date(year, month, day, hours, minutes, seconds);
  }

  /**
   * Upsert a single record (insert or update if exists)
   */
  async upsertRecord(record: Partial<InfUserOperationRecord>): Promise<InfUserOperationRecord> {
    try {
      // Use local time for imported_at (preserves local timezone)
      const localNow = this.getLocalNow();

      const insertData: NewInfUseroperation = {
        username: record.username!,
        isActive: record.isActive ?? true,
        isDelete: record.isDelete ?? false,
        isSuperAdmin: record.isSuperAdmin ?? false,
        roleCode: record.roleCode || null,
        operatorName: record.operatorName || null,
        isMrb: record.isMrb ?? false,
        lineNoId: record.lineNoId || null,
        workShiftId: record.workShiftId || null,
        importedAt: localNow
      };

      const result = await this.db
        .insert(infUseroperation)
        .values(insertData)
        .onConflictDoUpdate({
          target: infUseroperation.username,
          set: {
            isActive: insertData.isActive,
            isDelete: insertData.isDelete,
            isSuperAdmin: insertData.isSuperAdmin,
            roleCode: insertData.roleCode,
            operatorName: insertData.operatorName,
            isMrb: insertData.isMrb,
            lineNoId: insertData.lineNoId,
            workShiftId: insertData.workShiftId,
            importedAt: localNow
          }
        })
        .returning();

      return mapDrizzleToRecord(result[0]);

    } catch (error) {
      console.error('❌ Error in InfUserOperationModel.upsertRecord:', error);
      throw new Error(`Failed to upsert record: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Bulk upsert records (for sync operations)
   */
  async bulkUpsert(records: Partial<InfUserOperationRecord>[]): Promise<SyncResult> {
    const result: SyncResult = {
      imported: 0,
      updated: 0,
      skipped: 0,
      failed: 0,
      errors: []
    };

    for (const record of records) {
      try {
        // Check if record exists
        const existing = await this.getByUsername(record.username!);

        // Upsert the record
        await this.upsertRecord(record);

        if (existing) {
          result.updated++;
        } else {
          result.imported++;
        }

      } catch (error) {
        result.failed++;
        const errorMessage = `Failed to upsert ${record.username}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        result.errors?.push(errorMessage);
        console.error('❌', errorMessage);
      }
    }

    return result;
  }
}

// ==================== FACTORY FUNCTION ====================

/**
 * Factory function to create a Drizzle inf user operation model instance
 */
export function createInfUserOperationModel(db: DrizzleDb): InfUserOperationModel {
  return new InfUserOperationModel(db);
}

export default InfUserOperationModel;
