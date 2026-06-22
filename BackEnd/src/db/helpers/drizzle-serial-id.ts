// server/src/db/helpers/drizzle-serial-id.ts
// Drizzle ORM Adapter for Serial ID Entities
// Manufacturing Quality Control System
//
// This helper provides the same interface as GenericSerialIdModel
// but uses Drizzle ORM instead of raw pg queries.

import { eq, like, or, and, sql, desc, asc, SQL } from 'drizzle-orm';
import { PgTable, PgColumn } from 'drizzle-orm/pg-core';
import { DrizzleDb } from '../index';

/**
 * Pagination result interface
 */
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

/**
 * Query options for list operations
 */
export interface QueryOptions {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  searchFields?: string[];
  filters?: Record<string, unknown>;
}

/**
 * Drizzle ORM adapter for entities with SERIAL PRIMARY KEY
 * Provides same interface as GenericSerialIdModel for easy migration
 */
export class DrizzleSerialIdHelper<TSelect, TInsert> {
  constructor(
    protected db: DrizzleDb,
    protected table: PgTable,
    protected idColumn: PgColumn,
  ) {}

  /**
   * Get all records
   */
  async findAll(): Promise<TSelect[]> {
    const result = await this.db.select().from(this.table);
    return result as TSelect[];
  }

  /**
   * Get record by ID
   */
  async findById(id: number): Promise<TSelect | null> {
    const result = await this.db
      .select()
      .from(this.table)
      .where(eq(this.idColumn, id))
      .limit(1);
    return (result[0] as TSelect) || null;
  }

  /**
   * Create new record
   */
  async create(data: TInsert): Promise<TSelect> {
    const result = await this.db
      .insert(this.table)
      .values(data as Record<string, unknown>)
      .returning();
    return result[0] as TSelect;
  }

  /**
   * Update record by ID
   */
  async update(id: number, data: Partial<TInsert>): Promise<TSelect | null> {
    const result = await this.db
      .update(this.table)
      .set(data as Record<string, unknown>)
      .where(eq(this.idColumn, id))
      .returning();
    return (result[0] as TSelect) || null;
  }

  /**
   * Delete record by ID
   */
  async delete(id: number): Promise<boolean> {
    const result = await this.db
      .delete(this.table)
      .where(eq(this.idColumn, id))
      .returning();
    return result.length > 0;
  }

  /**
   * Get paginated list with search and filters
   */
  async findPaginated(options: QueryOptions = {}): Promise<PaginatedResult<TSelect>> {
    const {
      page = 1,
      pageSize = 10,
      sortBy,
      sortOrder = 'asc',
      search,
      searchFields = [],
      filters = {},
    } = options;

    const offset = (page - 1) * pageSize;
    const conditions: SQL[] = [];

    // Add search conditions
    if (search && searchFields.length > 0) {
      const searchConditions = searchFields.map((field) => {
        const column = (this.table as unknown as Record<string, PgColumn>)[field];
        if (column) {
          return like(column, `%${search}%`);
        }
        return null;
      }).filter((c): c is SQL => c !== null);

      if (searchConditions.length > 0) {
        conditions.push(or(...searchConditions)!);
      }
    }

    // Add filter conditions
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '') {
        const column = (this.table as unknown as Record<string, PgColumn>)[key];
        if (column) {
          conditions.push(eq(column, value));
        }
      }
    }

    // Build where clause
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const countResult = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(this.table)
      .where(whereClause);
    const totalItems = countResult[0]?.count || 0;

    // Build query
    let query = this.db
      .select()
      .from(this.table)
      .where(whereClause)
      .limit(pageSize)
      .offset(offset);

    // Add sorting
    if (sortBy) {
      const sortColumn = (this.table as unknown as Record<string, PgColumn>)[sortBy];
      if (sortColumn) {
        query = query.orderBy(sortOrder === 'desc' ? desc(sortColumn) : asc(sortColumn)) as typeof query;
      }
    }

    const data = await query;

    return {
      data: data as TSelect[],
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
      },
    };
  }

  /**
   * Check if record exists by ID
   */
  async exists(id: number): Promise<boolean> {
    const result = await this.db
      .select({ id: this.idColumn })
      .from(this.table)
      .where(eq(this.idColumn, id))
      .limit(1);
    return result.length > 0;
  }

  /**
   * Count all records
   */
  async count(filters?: Record<string, unknown>): Promise<number> {
    const conditions: SQL[] = [];

    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null && value !== '') {
          const column = (this.table as unknown as Record<string, PgColumn>)[key];
          if (column) {
            conditions.push(eq(column, value));
          }
        }
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const result = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(this.table)
      .where(whereClause);

    return result[0]?.count || 0;
  }
}
