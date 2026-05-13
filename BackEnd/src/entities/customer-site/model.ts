// server/src/entities/customer-site/model-drizzle.ts
/* Customer-Site Entity Model - Drizzle ORM Implementation
 * SPECIAL Entity Pattern Implementation
 *
 * This is the Drizzle ORM version of the CustomerSiteModel.
 * It provides the same interface as the original model but uses Drizzle ORM.
 *
 * Migration Notes:
 * - Same interface as original CustomerSiteModel
 * - Uses Drizzle schema and query builder
 * - Enabled via DRIZZLE_CUSTOMERS_SITE=true in .env
 */

import { eq, like, or, and, sql, desc, asc, ilike } from 'drizzle-orm';
import type { Request } from 'express';
import { logDelete, SessionUserLite } from '../../utils/auditLogger';
import { DrizzleDb } from '../../db';
import { customersSite, CustomersSite as DrizzleCustomersSite, NewCustomersSite, customers } from '../../db/schema';
import {
  CustomerSite,
  CreateCustomerSiteRequest,
  UpdateCustomerSiteRequest,
  CustomerSiteQueryParams,
  CUSTOMER_SITE_ENTITY_CONFIG
} from './types';
import {
  SpecialPaginatedResponse
} from '../../generic/entities/special-entity/generic-types';

// ==================== TYPE MAPPING ====================

/**
 * Map Drizzle result (camelCase) to entity type (snake_case)
 */
function mapDrizzleToEntity(row: DrizzleCustomersSite & { customerName?: string | null }): CustomerSite {
  return {
    code: row.code,
    customers: row.customers || '',
    site: row.site || '',
    is_active: row.isActive ?? true,
    created_by: row.createdBy ?? 0,
    updated_by: row.updatedBy ?? 0,
    created_at: row.createdAt ?? new Date(),
    updated_at: row.updatedAt ?? new Date(),
    customer_name: row.customerName || undefined,
  };
}

/**
 * Map array of Drizzle results to entity array
 */
function mapDrizzleArrayToEntities(rows: (DrizzleCustomersSite & { customerName?: string | null })[]): CustomerSite[] {
  return rows.map(mapDrizzleToEntity);
}

// ==================== CUSTOMER-SITE MODEL CLASS (DRIZZLE) ====================

/**
 * Customer-Site Entity Model - Drizzle ORM Version
 *
 * Data access layer for customer-site relationships using Drizzle ORM.
 * Provides customer-site-specific database operations with type-safe queries.
 */
export class CustomerSiteModel {
  private db: DrizzleDb;
  private config = CUSTOMER_SITE_ENTITY_CONFIG;

  constructor(db: DrizzleDb) {
    this.db = db;
  }

  // ==================== CRUD OPERATIONS ====================

  /**
   * Find customer-site by code (primary key)
   */
  async getByKey(keyValues: Record<string, any>): Promise<CustomerSite | null> {
    const { code } = keyValues;

    if (!code) {
      throw new Error('Code is required');
    }

    const result = await this.db
      .select({
        code: customersSite.code,
        customers: customersSite.customers,
        site: customersSite.site,
        isActive: customersSite.isActive,
        createdBy: customersSite.createdBy,
        updatedBy: customersSite.updatedBy,
        createdAt: customersSite.createdAt,
        updatedAt: customersSite.updatedAt,
        customerName: customers.name,
      })
      .from(customersSite)
      .leftJoin(customers, eq(customersSite.customers, customers.code))
      .where(eq(customersSite.code, code))
      .limit(1);

    return result[0] ? mapDrizzleToEntity(result[0]) : null;
  }

  /**
   * Get all customer-site relationships
   */
  async getAll(): Promise<CustomerSite[]> {
    const result = await this.db
      .select({
        code: customersSite.code,
        customers: customersSite.customers,
        site: customersSite.site,
        isActive: customersSite.isActive,
        createdBy: customersSite.createdBy,
        updatedBy: customersSite.updatedBy,
        createdAt: customersSite.createdAt,
        updatedAt: customersSite.updatedAt,
        customerName: customers.name,
      })
      .from(customersSite)
      .leftJoin(customers, eq(customersSite.customers, customers.code))
      .orderBy(asc(customersSite.site));

    return mapDrizzleArrayToEntities(result);
  }

  /**
   * Find all customer-site relationships with pagination and filtering
   */
  async findAll(options: CustomerSiteQueryParams = {}): Promise<SpecialPaginatedResponse<CustomerSite>> {
    const page = options.page || 1;
    const limit = options.limit || this.config.defaultLimit;
    const offset = (page - 1) * limit;
    const sortBy = options.sortBy || 'code';
    const sortOrder = options.sortOrder || 'ASC';

    // Build conditions
    const conditions = [];

    // Active filter
    if (options.isActive !== undefined) {
      conditions.push(eq(customersSite.isActive, options.isActive));
    }

    // Customer code filter
    if (options.customerCode) {
      conditions.push(eq(customersSite.customers, options.customerCode));
    }

    // Site code filter
    if (options.siteCode) {
      conditions.push(eq(customersSite.site, options.siteCode));
    }

    // Search filter
    if (options.search) {
      const searchPattern = `%${options.search}%`;
      conditions.push(
        or(
          ilike(customersSite.code, searchPattern),
          ilike(customersSite.customers, searchPattern),
          ilike(customersSite.site, searchPattern)
        )!
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const countResult = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(customersSite)
      .where(whereClause);
    const total = countResult[0]?.count || 0;

    // Get paginated data with sorting
    const sortColumn = sortBy === 'customers' ? customersSite.customers :
                       sortBy === 'site' ? customersSite.site :
                       sortBy === 'created_at' ? customersSite.createdAt :
                       customersSite.code;

    const orderFn = sortOrder.toUpperCase() === 'DESC' ? desc : asc;

    const data = await this.db
      .select({
        code: customersSite.code,
        customers: customersSite.customers,
        site: customersSite.site,
        isActive: customersSite.isActive,
        createdBy: customersSite.createdBy,
        updatedBy: customersSite.updatedBy,
        createdAt: customersSite.createdAt,
        updatedAt: customersSite.updatedAt,
        customerName: customers.name,
      })
      .from(customersSite)
      .leftJoin(customers, eq(customersSite.customers, customers.code))
      .where(whereClause)
      .orderBy(orderFn(sortColumn))
      .limit(limit)
      .offset(offset);

    const totalPages = Math.ceil(total / limit);

    return {
      data: mapDrizzleArrayToEntities(data),
      pagination: {
        currentPage: page,
        totalPages,
        totalCount: total,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    };
  }

  /**
   * Create new customer-site relationship
   */
  async create(data: CreateCustomerSiteRequest): Promise<{ success: boolean; data?: CustomerSite; error?: string }> {
    try {
      const now = new Date();

      const insertData: NewCustomersSite = {
        code: data.code,
        customers: data.customers,
        site: data.site,
        isActive: data.is_active !== undefined ? data.is_active : true,
        createdBy: data.created_by || 0,
        updatedBy: data.updated_by || 0,
        createdAt: data.created_at || now,
        updatedAt: data.updated_at || now,
      };

      const result = await this.db
        .insert(customersSite)
        .values(insertData)
        .returning();

      if (result.length > 0) {
        console.log('✅ CustomerSiteModel.create - Created customer-site:', result[0].code);
        return {
          success: true,
          data: mapDrizzleToEntity(result[0])
        };
      }

      return {
        success: false,
        error: 'Failed to create customer-site relationship'
      };
    } catch (error: any) {
      console.error('❌ Error creating customer-site relationship:', error);

      if (error.code === '23505') {
        return {
          success: false,
          error: 'Customer-site code already exists'
        };
      } else if (error.code === '23503') {
        return {
          success: false,
          error: 'Invalid customer or site reference'
        };
      }

      return {
        success: false,
        error: error.message || 'Database error occurred'
      };
    }
  }

  /**
   * Update customer-site relationship
   */
  async update(keyValues: Record<string, any>, data: UpdateCustomerSiteRequest): Promise<{ success: boolean; data?: CustomerSite; error?: string }> {
    try {
      const { code } = keyValues;

      if (!code) {
        return {
          success: false,
          error: 'Code is required for update'
        };
      }

      const now = new Date();

      // Build update object dynamically
      const updateData: Partial<NewCustomersSite> = {
        updatedAt: data.updated_at || now,
      };

      if (data.customers !== undefined) updateData.customers = data.customers;
      if (data.site !== undefined) updateData.site = data.site;
      if (data.is_active !== undefined) updateData.isActive = data.is_active;
      if (data.updated_by !== undefined) updateData.updatedBy = data.updated_by;

      const result = await this.db
        .update(customersSite)
        .set(updateData)
        .where(eq(customersSite.code, code))
        .returning();

      if (result.length > 0) {
        console.log('✅ CustomerSiteModel.update - Updated customer-site:', result[0].code);
        return {
          success: true,
          data: mapDrizzleToEntity(result[0])
        };
      }

      return {
        success: false,
        error: 'Customer-site relationship not found'
      };
    } catch (error: any) {
      console.error('❌ Error updating customer-site relationship:', error);

      if (error.code === '23503') {
        return {
          success: false,
          error: 'Invalid customer or site reference'
        };
      }

      return {
        success: false,
        error: error.message || 'Database error occurred'
      };
    }
  }

  /**
   * Delete customer-site relationship
   */
  async delete(
    keyValues: Record<string, any>,
    actor: SessionUserLite | null = null,
    req?: Request
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { code } = keyValues;

      if (!code) {
        return {
          success: false,
          error: 'Code is required for deletion'
        };
      }

      return await this.db.transaction(async (tx: any) => {
        const [deleted] = await tx
          .delete(customersSite)
          .where(eq(customersSite.code, code))
          .returning();

        if (!deleted) {
          return {
            success: false,
            error: 'Customer-site relationship not found'
          };
        }

        await logDelete(this.db, {
          entity: 'customers_site',
          recordId: deleted.code,
          oldValues: deleted as any,
          actor,
          req,
          tx,
        });

        console.log('✅ CustomerSiteModel.delete - Deleted customer-site:', code);
        return { success: true };
      });
    } catch (error: any) {
      console.error('❌ Error deleting customer-site relationship:', error);

      if (error.code === '23503') {
        return {
          success: false,
          error: 'Cannot delete customer-site relationship: it is referenced by other records'
        };
      }

      return {
        success: false,
        error: error.message || 'Database error occurred'
      };
    }
  }

  /**
   * Check if customer-site relationship exists
   */
  async exists(keyValues: Record<string, any>): Promise<boolean> {
    const { code } = keyValues;

    if (!code) {
      return false;
    }

    const result = await this.db
      .select({ code: customersSite.code })
      .from(customersSite)
      .where(eq(customersSite.code, code))
      .limit(1);

    return result.length > 0;
  }

  // ==================== CUSTOMER-SITE SPECIFIC OPERATIONS ====================

  /**
   * Find all sites for a specific customer
   */
  async getByCustomer(customerCode: string): Promise<CustomerSite[]> {
    const result = await this.db
      .select({
        code: customersSite.code,
        customers: customersSite.customers,
        site: customersSite.site,
        isActive: customersSite.isActive,
        createdBy: customersSite.createdBy,
        updatedBy: customersSite.updatedBy,
        createdAt: customersSite.createdAt,
        updatedAt: customersSite.updatedAt,
        customerName: customers.name,
      })
      .from(customersSite)
      .leftJoin(customers, eq(customersSite.customers, customers.code))
      .where(eq(customersSite.customers, customerCode))
      .orderBy(asc(customersSite.site));

    return mapDrizzleArrayToEntities(result);
  }

  /**
   * Find all customers for a specific site
   */
  async getBySite(siteCode: string): Promise<CustomerSite[]> {
    const result = await this.db
      .select({
        code: customersSite.code,
        customers: customersSite.customers,
        site: customersSite.site,
        isActive: customersSite.isActive,
        createdBy: customersSite.createdBy,
        updatedBy: customersSite.updatedBy,
        createdAt: customersSite.createdAt,
        updatedAt: customersSite.updatedAt,
        customerName: customers.name,
      })
      .from(customersSite)
      .leftJoin(customers, eq(customersSite.customers, customers.code))
      .where(eq(customersSite.site, siteCode))
      .orderBy(asc(customersSite.customers));

    return mapDrizzleArrayToEntities(result);
  }

  /**
   * Count customer-site relationships
   */
  async count(options?: CustomerSiteQueryParams): Promise<number> {
    const conditions = [];

    if (options?.isActive !== undefined) {
      conditions.push(eq(customersSite.isActive, options.isActive));
    }

    if (options?.customerCode) {
      conditions.push(eq(customersSite.customers, options.customerCode));
    }

    if (options?.siteCode) {
      conditions.push(eq(customersSite.site, options.siteCode));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const result = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(customersSite)
      .where(whereClause);

    return result[0]?.count || 0;
  }
}

// ==================== FACTORY FUNCTION ====================

/**
 * Factory function to create a Drizzle customer-site model instance
 */
export function createCustomerSiteModel(db: DrizzleDb): CustomerSiteModel {
  return new CustomerSiteModel(db);
}

export default CustomerSiteModel;
