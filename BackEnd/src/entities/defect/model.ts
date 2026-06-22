// server/src/entities/defect/model.ts
/**
 * Defect Entity Model - Drizzle ORM Implementation
 * SERIAL ID Pattern Implementation
 *
 * Data access layer for defect management using Drizzle ORM.
 * Provides defect-specific database operations with type-safe queries.
 *
 * Database Schema Compliance:
 * - Table: defects
 * - Primary Key: id SERIAL PRIMARY KEY
 * - Pattern: SERIAL ID Entity
 * - API Routes: /api/defects/:id
 */

import { eq, and, sql, desc, asc, ilike, or } from 'drizzle-orm';
import { DrizzleDb } from '../../db';
import { defects, Defect as DrizzleDefect, NewDefect } from '../../db/schema';
import {
  Defect,
  CreateDefectData,
  UpdateDefectData,
  DefectQueryOptions,
  DEFAULT_DEFECT_CONFIG
} from './types';
import {
  SerialIdPaginatedResponse,
  SerialIdSearchResult,
  SerialIdHealthResponse,
  SerialIdStatistics
} from '../../generic/entities/serial-id-entity/generic-types';

// ==================== TYPE MAPPING ====================

/**
 * Map Drizzle result (camelCase) to entity type (snake_case)
 */
function mapDrizzleToEntity(row: DrizzleDefect): Defect {
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    defect_group: row.defectGroup || undefined,
    is_active: row.isActive ?? true,
    created_by: row.createdBy ?? 0,
    updated_by: row.updatedBy ?? 0,
    created_at: row.createdAt ?? new Date(),
    updated_at: row.updatedAt ?? new Date(),
  };
}

/**
 * Map array of Drizzle results to entity array
 */
function mapDrizzleArrayToEntities(rows: DrizzleDefect[]): Defect[] {
  return rows.map(mapDrizzleToEntity);
}

// ==================== DEFECT MODEL CLASS ====================

/**
 * Defect Entity Model
 *
 * Data access layer for defect management using Drizzle ORM.
 * Provides defect-specific database operations with type-safe queries.
 */
export class DefectModel {
  private db: DrizzleDb;
  private config = DEFAULT_DEFECT_CONFIG;

  constructor(db: DrizzleDb) {
    this.db = db;
  }

  // ==================== CRUD OPERATIONS ====================

  /**
   * Get all defects with pagination
   */
  async getAll(options: DefectQueryOptions = {}): Promise<SerialIdPaginatedResponse<Defect>> {
    return this.getPaginated(options);
  }

  /**
   * Get defect by ID
   */
  async getById(id: number): Promise<Defect | null> {
    const result = await this.db
      .select()
      .from(defects)
      .where(eq(defects.id, id))
      .limit(1);
    return result[0] ? mapDrizzleToEntity(result[0]) : null;
  }

  /**
   * Get paginated defects with filtering
   */
  async getPaginated(options: DefectQueryOptions = {}): Promise<SerialIdPaginatedResponse<Defect>> {
    const page = options.page || 1;
    const limit = options.limit || this.config.defaultLimit;
    const offset = (page - 1) * limit;
    const sortBy = options.sortBy || 'id';
    const sortOrder = options.sortOrder || 'desc';

    // Build conditions
    const conditions = [];

    // Active filter
    if (options.isActive !== undefined) {
      conditions.push(eq(defects.isActive, options.isActive));
    }

    // Search filter
    if (options.search) {
      const searchPattern = `%${options.search}%`;
      conditions.push(
        or(
          ilike(defects.name, searchPattern),
          ilike(defects.description, searchPattern)
        )!
      );
    }

    // Defect group filter
    if (options.defect_group) {
      conditions.push(eq(defects.defectGroup, options.defect_group));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const countResult = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(defects)
      .where(whereClause);
    const total = countResult[0]?.count || 0;

    // Get paginated data with sorting
    const sortColumn = sortBy === 'name' ? defects.name :
                       sortBy === 'description' ? defects.description :
                       sortBy === 'created_at' ? defects.createdAt :
                       sortBy === 'updated_at' ? defects.updatedAt :
                       defects.id;

    const orderFn = sortOrder === 'desc' ? desc : asc;

    const data = await this.db
      .select()
      .from(defects)
      .where(whereClause)
      .orderBy(orderFn(sortColumn))
      .limit(limit)
      .offset(offset);

    return {
      data: mapDrizzleArrayToEntities(data),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Create new defect
   */
  async create(data: CreateDefectData, userId: number): Promise<Defect> {
    const now = new Date();

    const insertData: NewDefect = {
      name: data.name,
      description: data.description || '',
      defectGroup: data.defect_group || null,
      isActive: data.is_active !== undefined ? data.is_active : true,
      createdBy: userId,
      updatedBy: userId,
      createdAt: now,
      updatedAt: now,
    };

    const result = await this.db
      .insert(defects)
      .values(insertData)
      .returning();

    console.log('✅ DefectModel.create - Created defect:', result[0]);
    return mapDrizzleToEntity(result[0]);
  }

  /**
   * Update existing defect
   */
  async update(id: number, data: UpdateDefectData, userId: number): Promise<Defect> {
    const now = new Date();

    // Build update object dynamically
    const updateData: Partial<NewDefect> = {
      updatedBy: userId,
      updatedAt: now,
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.is_active !== undefined) updateData.isActive = data.is_active;
    if (data.defect_group !== undefined) updateData.defectGroup = data.defect_group || null;

    const result = await this.db
      .update(defects)
      .set(updateData)
      .where(eq(defects.id, id))
      .returning();

    if (result.length === 0) {
      throw new Error(`Defect with ID ${id} not found`);
    }

    console.log('✅ DefectModel.update - Updated defect:', result[0]);
    return mapDrizzleToEntity(result[0]);
  }

  /**
   * Delete defect by ID
   */
  async delete(id: number): Promise<boolean> {
    const result = await this.db
      .delete(defects)
      .where(eq(defects.id, id))
      .returning();

    return result.length > 0;
  }

  // ==================== DEFECT-SPECIFIC OPERATIONS ====================

  /**
   * Get defects filtered by defect group
   */
  async getByDefectGroup(
    defectGroup: string,
    options: DefectQueryOptions = {}
  ): Promise<SerialIdPaginatedResponse<Defect>> {
    console.log('🔧 DefectModel.getByDefectGroup - defect_group filter:', defectGroup);

    const page = options.page || 1;
    const limit = options.limit || 50;
    const offset = (page - 1) * limit;
    const sortBy = options.sortBy || 'id';
    const sortOrder = options.sortOrder || 'desc';

    // Build conditions
    const conditions = [
      sql`LOWER(TRIM(${defects.defectGroup})) = LOWER(TRIM(${defectGroup}))`
    ];

    if (options.isActive !== undefined) {
      conditions.push(eq(defects.isActive, options.isActive));
    }

    if (options.search) {
      const searchPattern = `%${options.search.toLowerCase()}%`;
      conditions.push(
        or(
          ilike(defects.name, searchPattern),
          ilike(defects.description, searchPattern)
        )!
      );
    }

    const whereClause = and(...conditions);

    // Get total count
    const countResult = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(defects)
      .where(whereClause);
    const total = countResult[0]?.count || 0;

    console.log('🔧 DefectModel.getByDefectGroup - Total results found:', total);

    // Get paginated data
    const sortColumn = sortBy === 'name' ? defects.name : defects.id;
    const orderFn = sortOrder === 'desc' ? desc : asc;

    const data = await this.db
      .select()
      .from(defects)
      .where(whereClause)
      .orderBy(orderFn(sortColumn))
      .limit(limit)
      .offset(offset);

    console.log('🔧 DefectModel.getByDefectGroup - Rows returned:', data.length);

    return {
      data: mapDrizzleArrayToEntities(data),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Check if defect name is unique
   */
  async isDefectNameUnique(name: string, excludeId?: number): Promise<boolean> {
    const conditions = [
      sql`LOWER(${defects.name}) = LOWER(${name.trim()})`
    ];

    if (excludeId) {
      conditions.push(sql`${defects.id} != ${excludeId}`);
    }

    const result = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(defects)
      .where(and(...conditions));

    return (result[0]?.count || 0) === 0;
  }

  /**
   * Check if defect exists by ID
   */
  async exists(id: number): Promise<boolean> {
    const result = await this.db
      .select({ id: defects.id })
      .from(defects)
      .where(eq(defects.id, id))
      .limit(1);
    return result.length > 0;
  }

  /**
   * Count defects with optional filters
   */
  async count(options?: DefectQueryOptions): Promise<number> {
    const conditions = options?.isActive !== undefined
      ? eq(defects.isActive, options.isActive)
      : undefined;

    const result = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(defects)
      .where(conditions);

    return result[0]?.count || 0;
  }

  // ==================== INTERFACE COMPATIBILITY METHODS ====================

  /**
   * Change defect status (toggle is_active)
   */
  async changeStatus(id: number, userId: number): Promise<boolean> {
    const defect = await this.getById(id);
    if (!defect) return false;

    await this.update(id, { is_active: !defect.is_active }, userId);
    return true;
  }

  /**
   * Get defects by name (search)
   */
  async getByName(name: string, options: DefectQueryOptions = {}): Promise<SerialIdSearchResult<Defect>> {
    const result = await this.getPaginated({ ...options, search: name });
    return {
      ...result,
      searchInfo: {
        query: name,
        searchType: 'name',
        resultCount: result.pagination.total
      }
    };
  }

  /**
   * Filter defects by status
   */
  async filterStatus(status: boolean, options: DefectQueryOptions = {}): Promise<SerialIdSearchResult<Defect>> {
    const result = await this.getPaginated({ ...options, isActive: status });
    return {
      ...result,
      searchInfo: {
        query: String(status),
        searchType: 'status',
        resultCount: result.pagination.total
      }
    };
  }

  /**
   * Search defects by pattern
   */
  async search(pattern: string, options: DefectQueryOptions = {}): Promise<SerialIdSearchResult<Defect>> {
    const result = await this.getPaginated({ ...options, search: pattern });
    return {
      ...result,
      searchInfo: {
        query: pattern,
        searchType: 'pattern',
        resultCount: result.pagination.total
      }
    };
  }

  /**
   * Health check
   */
  async health(): Promise<SerialIdHealthResponse> {
    const total = await this.count();
    const active = await this.count({ isActive: true });

    return {
      status: 'healthy',
      entity: 'defects',
      timestamp: new Date(),
      checks: {
        database: 'connected',
        records: { total, active, inactive: total - active }
      }
    };
  }

  /**
   * Get statistics
   */
  async statistics(): Promise<SerialIdStatistics> {
    const total = await this.count();
    const active = await this.count({ isActive: true });

    return {
      entity: 'defects',
      timestamp: new Date(),
      totals: {
        all: total,
        active,
        inactive: total - active
      }
    };
  }

}

// ==================== FACTORY FUNCTION ====================

/**
 * Factory function to create a defect model instance
 */
export function createDefectModel(db: DrizzleDb): DefectModel {
  return new DefectModel(db);
}

export default DefectModel;
