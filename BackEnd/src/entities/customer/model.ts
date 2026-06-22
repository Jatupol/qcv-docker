// server/src/entities/customer/model-drizzle.ts
/* Customer Entity Model - Drizzle ORM Implementation
 * VARCHAR CODE Pattern Implementation
 *
 * This is the Drizzle ORM version of the CustomerModel.
 * It provides the same interface as the original model but uses Drizzle ORM.
 *
 * Migration Notes:
 * - Same interface as original CustomerModel
 * - Uses Drizzle schema and query builder
 * - Enabled via DRIZZLE_CUSTOMERS=true in .env
 */

import { eq, like, or, and, sql, desc, asc, ilike } from 'drizzle-orm';
import { DrizzleDb } from '../../db';
import { customers, Customer as DrizzleCustomer, NewCustomer } from '../../db/schema';
import {
  Customer,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  CustomerQueryOptions,
  CustomerEntityConfig,
  CustomerConstants
} from './types';
import {
  VarcharCodePaginatedResponse
} from '../../generic/entities/varchar-code-entity/generic-types';

// ==================== TYPE MAPPING ====================

/**
 * Map Drizzle result (camelCase) to entity type (snake_case)
 * Handles nullable fields from schema with default values
 */
function mapDrizzleToEntity(row: DrizzleCustomer): Customer {
  return {
    code: row.code,
    name: row.name,
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
function mapDrizzleArrayToEntities(rows: DrizzleCustomer[]): Customer[] {
  return rows.map(mapDrizzleToEntity);
}

// ==================== CUSTOMER MODEL CLASS (DRIZZLE) ====================

/**
 * Customer Entity Model - Drizzle ORM Version
 *
 * Data access layer for customer management using Drizzle ORM.
 * Provides customer-specific database operations with type-safe queries.
 */
export class CustomerModel {
  private db: DrizzleDb;
  private config = CustomerEntityConfig;

  constructor(db: DrizzleDb) {
    this.db = db;
  }

  // ==================== CRUD OPERATIONS ====================

  /**
   * Find customer by code
   */
  async findByCode(code: string): Promise<Customer | null> {
    const result = await this.db
      .select()
      .from(customers)
      .where(eq(customers.code, code))
      .limit(1);
    return result[0] ? mapDrizzleToEntity(result[0]) : null;
  }

  /**
   * Get customer by code (alias for interface compliance)
   */
  async getByCode(code: string): Promise<Customer | null> {
    return this.findByCode(code);
  }

  /**
   * Find all customers with pagination and filtering
   */
  async findAll(options: CustomerQueryOptions = {}): Promise<VarcharCodePaginatedResponse<Customer>> {
    const page = options.page || 1;
    const limit = options.limit || this.config.defaultLimit;
    const offset = (page - 1) * limit;
    const sortBy = options.sortBy || 'code';
    const sortOrder = options.sortOrder || 'ASC';

    // Build conditions
    const conditions = [];

    // Active filter
    if (options.isActive !== undefined) {
      conditions.push(eq(customers.isActive, options.isActive));
    }

    // Search filter
    if (options.search) {
      const searchPattern = `%${options.search}%`;
      conditions.push(
        or(
          ilike(customers.code, searchPattern),
          ilike(customers.name, searchPattern)
        )!
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const countResult = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(customers)
      .where(whereClause);
    const total = countResult[0]?.count || 0;

    // Get paginated data with sorting
    const sortColumn = sortBy === 'name' ? customers.name :
                       sortBy === 'created_at' ? customers.createdAt :
                       sortBy === 'updated_at' ? customers.updatedAt :
                       customers.code;

    const orderFn = sortOrder.toUpperCase() === 'DESC' ? desc : asc;

    const data = await this.db
      .select()
      .from(customers)
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
   * Get all customers (alias for interface compliance)
   */
  async getAll(options: CustomerQueryOptions = {}): Promise<VarcharCodePaginatedResponse<Customer>> {
    return this.findAll(options);
  }

  /**
   * Get customers by name (exact or pattern match)
   */
  async getByName(name: string, options: CustomerQueryOptions = {}): Promise<VarcharCodePaginatedResponse<Customer>> {
    const page = options.page || 1;
    const limit = options.limit || this.config.defaultLimit;
    const offset = (page - 1) * limit;

    const conditions = [ilike(customers.name, `%${name}%`)];

    if (options.isActive !== undefined) {
      conditions.push(eq(customers.isActive, options.isActive));
    }

    const whereClause = and(...conditions);

    const countResult = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(customers)
      .where(whereClause);
    const total = countResult[0]?.count || 0;

    const data = await this.db
      .select()
      .from(customers)
      .where(whereClause)
      .orderBy(asc(customers.name))
      .limit(limit)
      .offset(offset);

    return {
      data: mapDrizzleArrayToEntities(data),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  }

  /**
   * Filter customers by active status
   */
  async filterStatus(status: boolean, options: CustomerQueryOptions = {}): Promise<VarcharCodePaginatedResponse<Customer>> {
    return this.findAll({ ...options, isActive: status });
  }

  /**
   * Search customers by code or name pattern
   */
  async search(pattern: string, options: CustomerQueryOptions = {}): Promise<VarcharCodePaginatedResponse<Customer>> {
    return this.findAll({ ...options, search: pattern });
  }

  /**
   * Get health status
   */
  async health(): Promise<{ status: string; entityName: string; timestamp: Date }> {
    try {
      await this.db.select({ count: sql<number>`1` }).from(customers).limit(1);
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
    const totalResult = await this.db.select({ count: sql<number>`count(*)::int` }).from(customers);
    const activeResult = await this.db.select({ count: sql<number>`count(*)::int` }).from(customers).where(eq(customers.isActive, true));
    const inactiveResult = await this.db.select({ count: sql<number>`count(*)::int` }).from(customers).where(eq(customers.isActive, false));

    return {
      total: totalResult[0]?.count || 0,
      active: activeResult[0]?.count || 0,
      inactive: inactiveResult[0]?.count || 0
    };
  }

  /**
   * Create new customer
   */
  async create(data: CreateCustomerRequest, userId: number): Promise<Customer> {
    const now = new Date();

    const insertData: NewCustomer = {
      code: data.code.toUpperCase().trim(),
      name: data.name.trim(),
      isActive: data.is_active !== undefined ? data.is_active : true,
      createdBy: userId,
      updatedBy: userId,
      createdAt: now,
      updatedAt: now,
    };

    const result = await this.db
      .insert(customers)
      .values(insertData)
      .returning();

    console.log('✅ CustomerModel.create - Created customer:', result[0].code);
    return mapDrizzleToEntity(result[0]);
  }

  /**
   * Update existing customer
   */
  async update(code: string, data: UpdateCustomerRequest, userId: number): Promise<Customer> {
    const now = new Date();

    // Build update object dynamically
    const updateData: Partial<NewCustomer> = {
      updatedBy: userId,
      updatedAt: now,
    };

    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.is_active !== undefined) updateData.isActive = data.is_active;

    const result = await this.db
      .update(customers)
      .set(updateData)
      .where(eq(customers.code, code))
      .returning();

    if (result.length === 0) {
      throw new Error(`Customer with code ${code} not found`);
    }

    console.log('✅ CustomerModel.update - Updated customer:', result[0].code);
    return mapDrizzleToEntity(result[0]);
  }

  /**
   * Delete customer by code
   */
  async delete(code: string): Promise<boolean> {
    const result = await this.db
      .delete(customers)
      .where(eq(customers.code, code))
      .returning();

    return result.length > 0;
  }

  /**
   * Change customer active status
   */
  async changeStatus(code: string, userId: number): Promise<boolean> {
    const customer = await this.findByCode(code);
    if (!customer) {
      throw new Error(`Customer with code ${code} not found`);
    }

    const result = await this.db
      .update(customers)
      .set({
        isActive: !customer.is_active,
        updatedBy: userId,
        updatedAt: new Date(),
      })
      .where(eq(customers.code, code))
      .returning();

    return result.length > 0;
  }

  // ==================== CUSTOMER-SPECIFIC OPERATIONS ====================

  /**
   * Check if customer code is available for creation
   */
  async isCodeAvailable(code: string): Promise<boolean> {
    if (!this.isValidCustomerCode(code)) {
      return false;
    }

    const exists = await this.exists(code);
    return !exists;
  }

  /**
   * Find customers with similar codes
   */
  async findSimilarCodes(code: string): Promise<string[]> {
    const result = await this.db
      .select({ code: customers.code })
      .from(customers)
      .where(
        and(
          ilike(customers.code, `%${code}%`),
          sql`${customers.code} != ${code}`
        )
      )
      .orderBy(asc(customers.code))
      .limit(5);

    return result.map(row => row.code);
  }

  /**
   * Find customers by partial code match
   */
  async findByCodePrefix(codePrefix: string, limit: number = 10): Promise<Pick<Customer, 'code' | 'name'>[]> {
    const result = await this.db
      .select({ code: customers.code, name: customers.name })
      .from(customers)
      .where(
        and(
          ilike(customers.code, `${codePrefix}%`),
          eq(customers.isActive, true)
        )
      )
      .orderBy(asc(customers.code))
      .limit(limit);

    return result;
  }

  /**
   * Check if customer exists by code
   */
  async exists(code: string): Promise<boolean> {
    const result = await this.db
      .select({ code: customers.code })
      .from(customers)
      .where(eq(customers.code, code))
      .limit(1);
    return result.length > 0;
  }

  /**
   * Count customers with optional filters
   */
  async count(options?: CustomerQueryOptions): Promise<number> {
    const conditions = [];

    if (options?.isActive !== undefined) {
      conditions.push(eq(customers.isActive, options.isActive));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const result = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(customers)
      .where(whereClause);

    return result[0]?.count || 0;
  }

  // ==================== VALIDATION HELPERS ====================

  /**
   * Validate customer code format
   */
  private isValidCustomerCode(code: string): boolean {
    if (!code || typeof code !== 'string') {
      return false;
    }

    const trimmedCode = code.trim();

    if (trimmedCode.length < CustomerConstants.CODE_MIN_LENGTH ||
        trimmedCode.length > CustomerConstants.CODE_MAX_LENGTH) {
      return false;
    }

    return CustomerConstants.CODE_PATTERN.test(trimmedCode);
  }
}

// ==================== FACTORY FUNCTION ====================

/**
 * Factory function to create a Drizzle customer model instance
 */
export function createCustomerModel(db: DrizzleDb): CustomerModel {
  return new CustomerModel(db);
}

export default CustomerModel;
