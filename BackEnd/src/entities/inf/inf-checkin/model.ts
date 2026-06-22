// server/src/entities/inf/inf-checkin/model-drizzle.ts
/* INF CheckIn Entity Model - Drizzle ORM Implementation
 * Interface Table (synced from MSSQL) - Read-Only Focus
 *
 * This is the Drizzle ORM version of the InfCheckinModel.
 * It provides the same interface as the original model but uses Drizzle ORM.
 *
 * Migration Notes:
 * - Same interface as original InfCheckinModel
 * - Uses Drizzle schema and query builder
 * - Enabled via DRIZZLE_INF_CHECKIN=true in .env
 */

import { eq, like, or, and, sql, desc, asc, ilike, isNull, isNotNull } from 'drizzle-orm';
import { DrizzleDb } from '../../../db';
import { infCheckin, InfCheckin as DrizzleInfCheckin } from '../../../db/schema';
import {
  InfCheckinRecord,
  InfCheckinQueryParams,
  PaginationInfo,
  CheckinStats,
  FilterOptions,
  INF_CHECKIN_TABLE_CONFIG
} from './types';
import { formatDateTimeLocal } from '../../../utils/dateTimeUtils';

// ==================== TYPE MAPPING ====================

/**
 * Map Drizzle result to entity type
 */
function mapDrizzleToRecord(row: DrizzleInfCheckin): InfCheckinRecord {
  return {
    id: row.id,
    line_no_id: row.lineNoId,
    work_shift_id: row.workShiftId,
    gr_code: row.grCode,
    username: row.username,
    oprname: row.oprname,
    created_on: row.createdOn ? formatDateTimeLocal(row.createdOn) : null,
    checked_out: row.checkedOut ? formatDateTimeLocal(row.checkedOut) : null,
    date_time_start_work: row.dateTimeStartWork ? formatDateTimeLocal(row.dateTimeStartWork) : null,
    date_time_off_work: row.dateTimeOffWork ? formatDateTimeLocal(row.dateTimeOffWork) : null,
    time_off_work: row.timeOffWork,
    time_start_work: row.timeStartWork,
    group_code: row.groupCode,
    team: row.team,
    imported_at: row.importedAt ? formatDateTimeLocal(row.importedAt) : null,
  };
}

// ==================== INF CHECKIN MODEL CLASS (DRIZZLE) ====================

/**
 * INF CheckIn Entity Model - Drizzle ORM Version
 *
 * Data access layer for check-in data using Drizzle ORM.
 * Focus on data retrieval and search operations.
 */
export class InfCheckinModel {
  private db: DrizzleDb;
  private config = INF_CHECKIN_TABLE_CONFIG;

  constructor(db: DrizzleDb) {
    this.db = db;
  }

  // ==================== CORE DATA RETRIEVAL ====================

  /**
   * Get all records with pagination and filtering
   */
  async getAll(queryParams: InfCheckinQueryParams = {}): Promise<{
    data: InfCheckinRecord[];
    pagination?: PaginationInfo;
  }> {
    const {
      page = 1,
      limit = this.config.defaultLimit,
      username,
      usernameSearch,
      oprname,
      lineNoSearch,
      globalSearch,
      line_no_id,
      work_shift_id,
      group_code,
      team,
      status,
      createdOnFrom,
      createdOnTo,
      lineId,
      shiftId,
      search
    } = queryParams;

    try {
      console.log('🔧 InfCheckinModel.getAll called with params:', queryParams);

      // Build conditions
      const conditions = [];

      // Search filters
      const searchTerm = globalSearch || search || usernameSearch || lineNoSearch;
      if (searchTerm?.trim()) {
        const searchPattern = `%${searchTerm}%`;
        conditions.push(
          or(
            ilike(infCheckin.username, searchPattern),
            ilike(infCheckin.oprname, searchPattern),
            ilike(infCheckin.lineNoId, searchPattern),
            ilike(infCheckin.workShiftId, searchPattern),
            ilike(infCheckin.groupCode, searchPattern),
            ilike(infCheckin.team, searchPattern)
          )!
        );
      }

      // Username filter
      if (username?.trim()) {
        conditions.push(ilike(infCheckin.username, `%${username}%`));
      }

      // Operator name filter
      if (oprname?.trim()) {
        conditions.push(ilike(infCheckin.oprname, `%${oprname}%`));
      }

      // Line ID filter
      if (line_no_id || lineId) {
        conditions.push(eq(infCheckin.lineNoId, line_no_id || lineId!));
      }

      // Work shift filter
      if (work_shift_id || shiftId) {
        conditions.push(eq(infCheckin.workShiftId, work_shift_id || shiftId!));
      }

      // Group code filter
      if (group_code) {
        conditions.push(eq(infCheckin.groupCode, group_code));
      }

      // Team filter
      if (team) {
        conditions.push(eq(infCheckin.team, team));
      }

      // Work status filter
      if (status && status !== 'all') {
        if (status === 'working') {
          conditions.push(isNull(infCheckin.dateTimeOffWork));
        } else if (status === 'checked_out') {
          conditions.push(isNotNull(infCheckin.dateTimeOffWork));
        }
      }

      // Date filters
      if (createdOnFrom) {
        conditions.push(sql`${infCheckin.createdOn} >= ${createdOnFrom}`);
      }

      if (createdOnTo) {
        conditions.push(sql`${infCheckin.createdOn} <= ${createdOnTo}::date + INTERVAL '1 day' - INTERVAL '1 second'`);
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Count total records
      const countResult = await this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(infCheckin)
        .where(whereClause);
      const total = countResult[0]?.count || 0;

      // Calculate pagination
      const validLimit = Math.min(Math.max(1, limit), this.config.maxLimit);
      const validPage = Math.max(1, page);
      const offset = (validPage - 1) * validLimit;
      const totalPages = Math.ceil(total / validLimit);

      // Get paginated data
      const data = await this.db
        .select()
        .from(infCheckin)
        .where(whereClause)
        .orderBy(desc(infCheckin.createdOn))
        .limit(validLimit)
        .offset(offset);

      const records = data.map(mapDrizzleToRecord);

      console.log(`✅ InfCheckinModel.getAll: Retrieved ${records.length} records`);

      const pagination: PaginationInfo = {
        page: validPage,
        limit: validLimit,
        total,
        totalPages,
        hasNext: validPage < totalPages,
        hasPrev: validPage > 1
      };

      return { data: records, pagination };

    } catch (error) {
      console.error('❌ Error in InfCheckinModel.getAll:', error);
      throw error;
    }
  }

  /**
   * Get records by username
   */
  async getByUsername(username: string): Promise<InfCheckinRecord[]> {
    try {
      console.log('🔧 InfCheckinModel.getByUsername called:', { username });

      const data = await this.db
        .select()
        .from(infCheckin)
        .where(ilike(infCheckin.username, `%${username}%`))
        .orderBy(desc(infCheckin.createdOn))
        .limit(100);

      const records = data.map(mapDrizzleToRecord);
      console.log(`✅ InfCheckinModel.getByUsername: Found ${records.length} records`);
      return records;

    } catch (error) {
      console.error('❌ Error in InfCheckinModel.getByUsername:', error);
      throw error;
    }
  }

  /**
   * Get records by line ID
   */
  async getByLineId(lineId: string): Promise<InfCheckinRecord[]> {
    try {
      console.log('🔧 InfCheckinModel.getByLineId called:', { lineId });

      const data = await this.db
        .select()
        .from(infCheckin)
        .where(eq(infCheckin.lineNoId, lineId))
        .orderBy(desc(infCheckin.createdOn))
        .limit(100);

      const records = data.map(mapDrizzleToRecord);
      console.log(`✅ InfCheckinModel.getByLineId: Found ${records.length} records`);
      return records;

    } catch (error) {
      console.error('❌ Error in InfCheckinModel.getByLineId:', error);
      throw error;
    }
  }

  /**
   * Get currently active workers (no check-out time)
   */
  async getActiveWorkers(): Promise<InfCheckinRecord[]> {
    try {
      console.log('🔧 InfCheckinModel.getActiveWorkers called');

      const data = await this.db
        .select()
        .from(infCheckin)
        .where(isNull(infCheckin.dateTimeOffWork))
        .orderBy(desc(infCheckin.createdOn))
        .limit(200);

      const records = data.map(mapDrizzleToRecord);
      console.log(`✅ InfCheckinModel.getActiveWorkers: Found ${records.length} active workers`);
      return records;

    } catch (error) {
      console.error('❌ Error in InfCheckinModel.getActiveWorkers:', error);
      throw error;
    }
  }

  /**
   * Get statistics for dashboard
   */
  async getStatistics(): Promise<CheckinStats> {
    try {
      console.log('📊 InfCheckinModel.getStatistics called');

      const result = await this.db
        .select({
          totalRecords: sql<number>`count(*)::int`,
          totalToday: sql<number>`count(CASE WHEN ${infCheckin.createdOn}::date = CURRENT_DATE THEN 1 END)::int`,
          totalMonth: sql<number>`count(CASE WHEN date_trunc('month', ${infCheckin.createdOn}) = date_trunc('month', CURRENT_DATE) THEN 1 END)::int`,
          totalYear: sql<number>`count(CASE WHEN date_trunc('year', ${infCheckin.createdOn}) = date_trunc('year', CURRENT_DATE) THEN 1 END)::int`,
          lastSync: sql<Date>`max(${infCheckin.importedAt})`
        })
        .from(infCheckin);

      const stats = result[0];

      const records: CheckinStats = {
        totalRecords: stats?.totalRecords || 0,
        totalToday: stats?.totalToday || 0,
        totalMonth: stats?.totalMonth || 0,
        totalYear: stats?.totalYear || 0,
        lastSync: stats?.lastSync ? formatDateTimeLocal(stats.lastSync) : undefined
      };

      console.log('✅ InfCheckinModel.getStatistics: Retrieved statistics', records);
      return records;

    } catch (error) {
      console.error('❌ Error in InfCheckinModel.getStatistics:', error);
      throw error;
    }
  }

  /**
   * Get unique operators for autocomplete
   */
  async getOperators(gr_code?: string): Promise<Array<{ username: string; oprname: string }>> {
    try {
      console.log('🔧 InfCheckinModel.getOperators called with gr_code:', gr_code);

      const conditions = [
        isNotNull(infCheckin.username),
        isNotNull(infCheckin.oprname),
        sql`${infCheckin.username} != ''`,
        sql`${infCheckin.oprname} != ''`
      ];

      if (gr_code?.trim()) {
        conditions.push(eq(infCheckin.grCode, gr_code.trim()));
      }

      const result = await this.db
        .select({
          username: infCheckin.username,
          oprname: sql<string>`max(${infCheckin.oprname})`
        })
        .from(infCheckin)
        .where(and(...conditions))
        .groupBy(infCheckin.username)
        .orderBy(asc(infCheckin.username));

      const operators = result.map(row => ({
        username: row.username || '',
        oprname: row.oprname || ''
      }));

      console.log(`✅ InfCheckinModel.getOperators: Retrieved ${operators.length} operators`);
      return operators;

    } catch (error) {
      console.error('❌ Error in InfCheckinModel.getOperators:', error);
      throw error;
    }
  }

  /**
   * Get FVI leader operators
   */
  async getFVILeaderOperators(): Promise<Array<{ username: string; oprname: string }>> {
    try {
      // This uses a view, so we use raw SQL
      const result = await this.db.execute(sql`
        SELECT username, oprname
        FROM v_fvilead
        ORDER BY username
      `);

      const operators = (result.rows as any[]).map(row => ({
        username: row.username,
        oprname: row.oprname
      }));

      console.log(`✅ InfCheckinModel.getFVILeaderOperators: Retrieved ${operators.length} operators`);
      return operators;

    } catch (error) {
      console.error('❌ Error in InfCheckinModel.getFVILeaderOperators:', error);
      throw error;
    }
  }

  /**
   * Get filter options for dropdowns
   */
  async getFilterOptions(): Promise<FilterOptions> {
    try {
      console.log('🔧 InfCheckinModel.getFilterOptions called');

      const [lineIds, workShiftIds, groupCodes, teams] = await Promise.all([
        this.db.selectDistinct({ value: infCheckin.lineNoId })
          .from(infCheckin)
          .where(isNotNull(infCheckin.lineNoId))
          .orderBy(asc(infCheckin.lineNoId))
          .limit(50),

        this.db.selectDistinct({ value: infCheckin.workShiftId })
          .from(infCheckin)
          .where(isNotNull(infCheckin.workShiftId))
          .orderBy(asc(infCheckin.workShiftId))
          .limit(50),

        this.db.selectDistinct({ value: infCheckin.groupCode })
          .from(infCheckin)
          .where(isNotNull(infCheckin.groupCode))
          .orderBy(asc(infCheckin.groupCode))
          .limit(50),

        this.db.selectDistinct({ value: infCheckin.team })
          .from(infCheckin)
          .where(isNotNull(infCheckin.team))
          .orderBy(asc(infCheckin.team))
          .limit(50)
      ]);

      const options: FilterOptions = {
        lineIds: lineIds.map(r => r.value!),
        workShiftIds: workShiftIds.map(r => r.value!),
        groupCodes: groupCodes.map(r => r.value!),
        teams: teams.map(r => r.value!)
      };

      console.log('✅ InfCheckinModel.getFilterOptions: Retrieved options');
      return options;

    } catch (error) {
      console.error('❌ Error in InfCheckinModel.getFilterOptions:', error);
      throw error;
    }
  }

  /**
   * Get FVI line mapping for production line visualization
   */
  async getFVILineMapping(params: {
    line: string;
    date: string;
    shift: string;
  }): Promise<Array<{
    gr_code: string;
    group_code: string;
    username: string;
    oprname?: string;
  }>> {
    try {
      console.log('🔧 InfCheckinModel.getFVILineMapping called with params:', params);

      const { line, date, shift } = params;

      const data = await this.db
        .select({
          gr_code: infCheckin.grCode,
          group_code: infCheckin.groupCode,
          username: infCheckin.username,
          oprname: infCheckin.oprname
        })
        .from(infCheckin)
        .where(
          and(
            eq(infCheckin.lineNoId, line),
            sql`${infCheckin.dateTimeStartWork}::date = ${date}`,
            eq(infCheckin.workShiftId, shift)
          )
        )
        .orderBy(asc(infCheckin.grCode));

      const mappings = data.map(row => ({
        gr_code: row.gr_code || '',
        group_code: row.group_code || '',
        username: row.username || ''
      }));

      console.log(`✅ InfCheckinModel.getFVILineMapping: Found ${mappings.length} station mappings`);
      return mappings;

    } catch (error) {
      console.error('❌ Error in InfCheckinModel.getFVILineMapping:', error);
      throw error;
    }
  }

  /**
   * Get list of FVI lines by date
   */
  async getFVILinesByDate(date: string): Promise<Array<{ line_no_id: string }>> {
    try {
      console.log('🔧 InfCheckinModel.getFVILinesByDate called with date:', date);

      const result = await this.db
        .selectDistinct({ line_no_id: infCheckin.lineNoId })
        .from(infCheckin)
        .where(sql`${infCheckin.dateTimeStartWork}::date = ${date}`)
        .orderBy(asc(infCheckin.lineNoId));

      const lines = result.map(row => ({
        line_no_id: row.line_no_id!
      }));

      console.log(`✅ InfCheckinModel.getFVILinesByDate: Found ${lines.length} lines`);
      return lines;

    } catch (error) {
      console.error('❌ Error in InfCheckinModel.getFVILinesByDate:', error);
      throw error;
    }
  }

  /**
   * Get distinct FVI lines (all lines with line_no_id length between 1 and 5)
   * Query: SELECT DISTINCT line_no_id, concat('Line ', line_no_id) AS line_name
   *        FROM public.inf_checkin WHERE length(line_no_id) BETWEEN 1 AND 5
   *        GROUP BY line_no_id ORDER BY line_no_id
   */
  async getDistinctFVILines(): Promise<Array<{ line_no_id: string; line_name: string }>> {
    try {
      console.log('🔧 InfCheckinModel.getDistinctFVILines called');

      const result = await this.db.execute(sql`
        SELECT DISTINCT line_no_id, concat('Line ', line_no_id) AS line_name
        FROM public.inf_checkin
        WHERE length(line_no_id) BETWEEN 1 AND 5
        GROUP BY line_no_id
        ORDER BY line_no_id
      `);

      const lines = (result.rows as any[]).map(row => ({
        line_no_id: row.line_no_id,
        line_name: row.line_name
      }));

      console.log(`✅ InfCheckinModel.getDistinctFVILines: Found ${lines.length} distinct lines`);
      return lines;

    } catch (error) {
      console.error('❌ Error in InfCheckinModel.getDistinctFVILines:', error);
      throw error;
    }
  }

  /**
   * Search records by multiple criteria
   */
  async searchRecords(searchParams: {
    searchTerm?: string;
    username?: string;
    oprname?: string;
    lineId?: string;
    groupCode?: string;
    team?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<InfCheckinRecord[]> {
    try {
      console.log('🔍 InfCheckinModel.searchRecords called with params:', searchParams);

      const conditions = [];

      if (searchParams.searchTerm?.trim()) {
        const pattern = `%${searchParams.searchTerm}%`;
        conditions.push(
          or(
            ilike(infCheckin.username, pattern),
            ilike(infCheckin.oprname, pattern),
            ilike(infCheckin.lineNoId, pattern),
            ilike(infCheckin.groupCode, pattern),
            ilike(infCheckin.team, pattern)
          )!
        );
      }

      if (searchParams.username?.trim()) {
        conditions.push(ilike(infCheckin.username, `%${searchParams.username}%`));
      }

      if (searchParams.oprname?.trim()) {
        conditions.push(ilike(infCheckin.oprname, `%${searchParams.oprname}%`));
      }

      if (searchParams.lineId?.trim()) {
        conditions.push(eq(infCheckin.lineNoId, searchParams.lineId));
      }

      if (searchParams.groupCode?.trim()) {
        conditions.push(eq(infCheckin.groupCode, searchParams.groupCode));
      }

      if (searchParams.team?.trim()) {
        conditions.push(eq(infCheckin.team, searchParams.team));
      }

      if (searchParams.dateFrom) {
        conditions.push(sql`${infCheckin.createdOn} >= ${searchParams.dateFrom}`);
      }

      if (searchParams.dateTo) {
        conditions.push(sql`${infCheckin.createdOn} <= ${searchParams.dateTo}::date + INTERVAL '1 day' - INTERVAL '1 second'`);
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const data = await this.db
        .select()
        .from(infCheckin)
        .where(whereClause)
        .orderBy(desc(infCheckin.createdOn))
        .limit(100);

      const records = data.map(mapDrizzleToRecord);

      console.log(`✅ InfCheckinModel.searchRecords: Found ${records.length} matching records`);
      return records;

    } catch (error) {
      console.error('❌ Error in InfCheckinModel.searchRecords:', error);
      throw error;
    }
  }
}

// ==================== FACTORY FUNCTION ====================

/**
 * Factory function to create a Drizzle inf-checkin model instance
 */
export function createInfCheckinModel(db: DrizzleDb): InfCheckinModel {
  return new InfCheckinModel(db);
}

export default InfCheckinModel;
