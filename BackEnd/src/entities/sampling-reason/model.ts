// server/src/entities/sampling-reason/model-drizzle.ts
/* Sampling Reason Entity Model - Drizzle ORM Implementation
 * SERIAL ID Pattern Implementation
 *
 * This is the Drizzle ORM version of the SamplingReasonModel.
 * It provides the same interface as the original model but uses Drizzle ORM.
 *
 * Migration Notes:
 * - Same interface as original SamplingReasonModel
 * - Uses Drizzle schema and query builder
 * - Enabled via DRIZZLE_SAMPLING_REASONS=true in .env
 */

import { eq, like, or, and, sql, desc, asc, ilike } from 'drizzle-orm';
import type { Request } from 'express';
import { logDelete, SessionUserLite } from '../../utils/auditLogger';
import { DrizzleDb } from '../../db';
import { samplingReasons, SamplingReason as DrizzleSamplingReason, NewSamplingReason } from '../../db/schema';
import {
  SamplingReason,
  CreateSamplingReasonData,
  UpdateSamplingReasonData,
  SamplingReasonQueryOptions,
  DEFAULT_SAMPLING_REASON_CONFIG
} from './types';
import {
  SerialIdPaginatedResponse
} from '../../generic/entities/serial-id-entity/generic-types';

// ==================== TYPE MAPPING ====================

/**
 * Map Drizzle result (camelCase) to entity type (snake_case)
 */
function mapDrizzleToEntity(row: DrizzleSamplingReason): SamplingReason {
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
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
function mapDrizzleArrayToEntities(rows: DrizzleSamplingReason[]): SamplingReason[] {
  return rows.map(mapDrizzleToEntity);
}

// ==================== SAMPLING REASON MODEL CLASS (DRIZZLE) ====================

/**
 * Sampling Reason Entity Model - Drizzle ORM Version
 *
 * Data access layer for sampling reason management using Drizzle ORM.
 * Provides sampling reason-specific database operations with type-safe queries.
 */
export class SamplingReasonModel {
  private db: DrizzleDb;
  private config = DEFAULT_SAMPLING_REASON_CONFIG;

  constructor(db: DrizzleDb) {
    this.db = db;
  }

  // ==================== CRUD OPERATIONS ====================

  /**
   * Find sampling reason by ID
   */
  async findById(id: number): Promise<SamplingReason | null> {
    const result = await this.db
      .select()
      .from(samplingReasons)
      .where(eq(samplingReasons.id, id))
      .limit(1);
    return result[0] ? mapDrizzleToEntity(result[0]) : null;
  }

  /**
   * Get sampling reason by ID (alias for interface compliance)
   */
  async getById(id: number): Promise<SamplingReason | null> {
    return this.findById(id);
  }

  /**
   * Find all sampling reasons with pagination and filtering
   */
  async findAll(options: SamplingReasonQueryOptions = {}): Promise<SerialIdPaginatedResponse<SamplingReason>> {
    const page = options.page || 1;
    const limit = options.limit || this.config.defaultLimit;
    const offset = (page - 1) * limit;
    const sortBy = options.sortBy || 'name';
    const sortOrder = options.sortOrder || 'ASC';

    // Build conditions
    const conditions = [];

    // Active filter
    if (options.isActive !== undefined) {
      conditions.push(eq(samplingReasons.isActive, options.isActive));
    }

    // Search filter
    if (options.search) {
      const searchPattern = `%${options.search}%`;
      conditions.push(
        or(
          ilike(samplingReasons.name, searchPattern),
          ilike(samplingReasons.description, searchPattern)
        )!
      );
    }

    // Has description filter
    if (options.hasDescription !== undefined) {
      if (options.hasDescription) {
        conditions.push(sql`${samplingReasons.description} IS NOT NULL AND ${samplingReasons.description} != ''`);
      } else {
        conditions.push(sql`(${samplingReasons.description} IS NULL OR ${samplingReasons.description} = '')`);
      }
    }

    // Name contains filter
    if (options.nameContains) {
      conditions.push(ilike(samplingReasons.name, `%${options.nameContains}%`));
    }

    // Description contains filter
    if (options.descriptionContains) {
      conditions.push(ilike(samplingReasons.description, `%${options.descriptionContains}%`));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const countResult = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(samplingReasons)
      .where(whereClause);
    const total = countResult[0]?.count || 0;

    // Get paginated data with sorting
    const sortColumn = sortBy === 'name' ? samplingReasons.name :
                       sortBy === 'description' ? samplingReasons.description :
                       sortBy === 'created_at' ? samplingReasons.createdAt :
                       sortBy === 'updated_at' ? samplingReasons.updatedAt :
                       samplingReasons.id;

    const orderFn = sortOrder.toUpperCase() === 'DESC' ? desc : asc;

    const data = await this.db
      .select()
      .from(samplingReasons)
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
   * Get all sampling reasons (alias for interface compliance)
   */
  async getAll(options: SamplingReasonQueryOptions = {}): Promise<SerialIdPaginatedResponse<SamplingReason>> {
    return this.findAll(options);
  }

  /**
   * Get sampling reasons by name (pattern match)
   */
  async getByName(name: string, options: SamplingReasonQueryOptions = {}): Promise<SerialIdPaginatedResponse<SamplingReason>> {
    const page = options.page || 1;
    const limit = options.limit || this.config.defaultLimit;
    const offset = (page - 1) * limit;

    const conditions = [ilike(samplingReasons.name, `%${name}%`)];

    if (options.isActive !== undefined) {
      conditions.push(eq(samplingReasons.isActive, options.isActive));
    }

    const whereClause = and(...conditions);

    const countResult = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(samplingReasons)
      .where(whereClause);
    const total = countResult[0]?.count || 0;

    const data = await this.db
      .select()
      .from(samplingReasons)
      .where(whereClause)
      .orderBy(asc(samplingReasons.name))
      .limit(limit)
      .offset(offset);

    return {
      data: mapDrizzleArrayToEntities(data),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  }

  /**
   * Filter sampling reasons by active status
   */
  async filterStatus(status: boolean, options: SamplingReasonQueryOptions = {}): Promise<SerialIdPaginatedResponse<SamplingReason>> {
    return this.findAll({ ...options, isActive: status });
  }

  /**
   * Search sampling reasons by name or description pattern
   */
  async search(pattern: string, options: SamplingReasonQueryOptions = {}): Promise<SerialIdPaginatedResponse<SamplingReason>> {
    return this.findAll({ ...options, search: pattern });
  }

  /**
   * Get health status
   */
  async health(): Promise<{ status: string; entityName: string; timestamp: Date }> {
    try {
      await this.db.select({ count: sql<number>`1` }).from(samplingReasons).limit(1);
      return {
        status: 'healthy',
        entityName: this.config.entityName,
        timestamp: new Date()
      };
    } catch {
      return {
        status: 'unhealthy',
        entityName: this.config.entityName,
        timestamp: new Date()
      };
    }
  }

  /**
   * Get statistics
   */
  async statistics(): Promise<{ total: number; active: number; inactive: number }> {
    const totalResult = await this.db.select({ count: sql<number>`count(*)::int` }).from(samplingReasons);
    const activeResult = await this.db.select({ count: sql<number>`count(*)::int` }).from(samplingReasons).where(eq(samplingReasons.isActive, true));
    const inactiveResult = await this.db.select({ count: sql<number>`count(*)::int` }).from(samplingReasons).where(eq(samplingReasons.isActive, false));

    return {
      total: totalResult[0]?.count || 0,
      active: activeResult[0]?.count || 0,
      inactive: inactiveResult[0]?.count || 0
    };
  }

  /**
   * Create new sampling reason
   */
  async create(data: CreateSamplingReasonData, userId: number): Promise<SamplingReason> {
    const now = new Date();

    const insertData: NewSamplingReason = {
      name: data.name.trim(),
      description: data.description || null,
      isActive: data.is_active !== undefined ? data.is_active : true,
      createdBy: userId,
      updatedBy: userId,
      createdAt: now,
      updatedAt: now,
    };

    const result = await this.db
      .insert(samplingReasons)
      .values(insertData)
      .returning();

    console.log('✅ SamplingReasonModel.create - Created sampling reason:', result[0].id);
    return mapDrizzleToEntity(result[0]);
  }

  /**
   * Update existing sampling reason
   */
  async update(id: number, data: UpdateSamplingReasonData, userId: number): Promise<SamplingReason> {
    const now = new Date();

    // Build update object dynamically
    const updateData: Partial<NewSamplingReason> = {
      updatedBy: userId,
      updatedAt: now,
    };

    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.description !== undefined) updateData.description = data.description || null;
    if (data.is_active !== undefined) updateData.isActive = data.is_active;

    const result = await this.db
      .update(samplingReasons)
      .set(updateData)
      .where(eq(samplingReasons.id, id))
      .returning();

    if (result.length === 0) {
      throw new Error(`Sampling reason with ID ${id} not found`);
    }

    console.log('✅ SamplingReasonModel.update - Updated sampling reason:', result[0].id);
    return mapDrizzleToEntity(result[0]);
  }

  /**
   * Delete sampling reason by ID
   */
  async delete(
    id: number,
    actor: SessionUserLite | null = null,
    req?: Request
  ): Promise<boolean> {
    return await this.db.transaction(async (tx: any) => {
      const [deleted] = await tx
        .delete(samplingReasons)
        .where(eq(samplingReasons.id, id))
        .returning();

      if (!deleted) return false;

      await logDelete(this.db, {
        entity: 'sampling_reasons',
        recordId: deleted.id,
        oldValues: deleted as any,
        actor,
        req,
        tx,
      });

      return true;
    });
  }

  /**
   * Change sampling reason active status
   */
  async changeStatus(id: number, userId: number): Promise<boolean> {
    const reason = await this.findById(id);
    if (!reason) {
      throw new Error(`Sampling reason with ID ${id} not found`);
    }

    const result = await this.db
      .update(samplingReasons)
      .set({
        isActive: !reason.is_active,
        updatedBy: userId,
        updatedAt: new Date(),
      })
      .where(eq(samplingReasons.id, id))
      .returning();

    return result.length > 0;
  }

  // ==================== SAMPLING REASON SPECIFIC OPERATIONS ====================

  /**
   * Check if name is unique
   */
  async isNameUnique(name: string, excludeId?: number): Promise<boolean> {
    const conditions = [
      sql`LOWER(${samplingReasons.name}) = LOWER(${name.trim()})`
    ];

    if (excludeId) {
      conditions.push(sql`${samplingReasons.id} != ${excludeId}`);
    }

    const result = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(samplingReasons)
      .where(and(...conditions));

    return (result[0]?.count || 0) === 0;
  }

  /**
   * Check if sampling reason exists by ID
   */
  async exists(id: number): Promise<boolean> {
    const result = await this.db
      .select({ id: samplingReasons.id })
      .from(samplingReasons)
      .where(eq(samplingReasons.id, id))
      .limit(1);
    return result.length > 0;
  }

  /**
   * Count sampling reasons with optional filters
   */
  async count(options?: SamplingReasonQueryOptions): Promise<number> {
    const conditions = [];

    if (options?.isActive !== undefined) {
      conditions.push(eq(samplingReasons.isActive, options.isActive));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const result = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(samplingReasons)
      .where(whereClause);

    return result[0]?.count || 0;
  }

  /**
   * Find active sampling reasons for selection dropdowns
   */
  async findActiveForSelection(): Promise<Pick<SamplingReason, 'id' | 'name'>[]> {
    const result = await this.db
      .select({ id: samplingReasons.id, name: samplingReasons.name })
      .from(samplingReasons)
      .where(eq(samplingReasons.isActive, true))
      .orderBy(asc(samplingReasons.name));

    return result;
  }
}

// ==================== FACTORY FUNCTION ====================

/**
 * Factory function to create a Drizzle sampling reason model instance
 */
export function createSamplingReasonModel(db: DrizzleDb): SamplingReasonModel {
  return new SamplingReasonModel(db);
}

export default SamplingReasonModel;
