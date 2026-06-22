// server/src/generic/entities/varchar-code-entity/generic-model.ts
// Complete Separation Entity Architecture - Manufacturing Quality Control System

import { Pool, QueryResult } from 'pg';
import {
  BaseVarcharCodeEntity,
  CreateVarcharCodeData,
  UpdateVarcharCodeData,
  VarcharCodeQueryOptions,
  VarcharCodePaginatedResponse,
  VarcharCodeEntityConfig,
  IVarcharCodeModel
} from './generic-types';

export class GenericVarcharCodeModel<T extends BaseVarcharCodeEntity> implements IVarcharCodeModel<T> {
  protected db: Pool;
  protected config: VarcharCodeEntityConfig;

  constructor(db: Pool, config: VarcharCodeEntityConfig) {
    this.db = db;
    this.config = config;
  }

  // ==================== EXISTING CRUD OPERATIONS ====================

  /**
   * Find entity by code
   */
  async getByCode(code: string): Promise<T | null> {
    const query = `
      SELECT * FROM ${this.config.tableName}
      WHERE code = $1
      LIMIT 1
    `;

    try {
      const result = await this.db.query(query, [code]);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      throw new Error(`Failed to find ${this.config.entityName} by code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find all entities with advanced filtering and pagination
   */
  async getAll(options: VarcharCodeQueryOptions = {}): Promise<VarcharCodePaginatedResponse<T>> {
    // Apply defaults
    const {
      page = 1,
      limit = this.config.defaultLimit || 20,
      sortBy = 'code',
      sortOrder = 'ASC',
      search,
      isActive
    } = options;

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build WHERE conditions
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    // Active status filter
    if (isActive !== undefined) {
      conditions.push(`is_active = $${paramIndex}`);
      params.push(isActive);
      paramIndex++;
    }

    // Search functionality
    if (search && search.trim()) {
      const searchConditions = this.config.searchableFields.map(field => 
        `LOWER(${field}::text) LIKE LOWER($${paramIndex})`
      );
      conditions.push(`(${searchConditions.join(' OR ')})`);
      params.push(`%${this.escapeLikeString(search.trim())}%`);
      paramIndex++;
    }

    // Build WHERE clause
    const whereClause = conditions.length > 0 ? 
      `WHERE ${conditions.join(' AND ')}` : '';

    // Validate sort field (prevent SQL injection)
    const validSortField = this.validateSortField(sortBy);
    const validSortOrder = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    // Main query
    const dataQuery = `
      SELECT * FROM ${this.config.tableName}
      ${whereClause}
      ORDER BY ${validSortField} ${validSortOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    // Count query for pagination
    const countQuery = `
      SELECT COUNT(*) as total FROM ${this.config.tableName}
      ${whereClause}
    `;

    try {
      // Execute both queries
      const dataParams = [...params, limit, offset];
      const [dataResult, countResult] = await Promise.all([
        this.db.query(dataQuery, dataParams),
        this.db.query(countQuery, params)
      ]);

      const total = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(total / limit);

      return {
        data: dataResult.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      };
    } catch (error) {
      throw new Error(`Failed to find ${this.config.entityName} list: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create new entity
   */
  async create(data: CreateVarcharCodeData, userId: number): Promise<T> {
    const now = new Date();
    
    const fields = ['code', 'name', 'is_active', 'created_by', 'updated_by', 'created_at', 'updated_at'];
    const values = [
      data.code,
      data.name,
      data.is_active !== undefined ? data.is_active : true,
      userId,
      userId,
      now,
      now
    ];

    const placeholders = fields.map((_, index) => `$${index + 1}`).join(', ');
    
    const query = `
      INSERT INTO ${this.config.tableName} (${fields.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;

    try {
      const result = await this.db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to create ${this.config.entityName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update existing entity
   */
  async update(code: string, data: UpdateVarcharCodeData, userId: number): Promise<T> {
    const now = new Date();
    
    // Build dynamic SET clause
    const setFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      setFields.push(`name = $${paramIndex}`);
      values.push(data.name);
      paramIndex++;
    }

    if (data.is_active !== undefined) {
      setFields.push(`is_active = $${paramIndex}`);
      values.push(data.is_active);
      paramIndex++;
    }

    // Always update audit fields
    setFields.push(`updated_by = $${paramIndex}`);
    values.push(userId);
    paramIndex++;

    setFields.push(`updated_at = $${paramIndex}`);
    values.push(now);
    paramIndex++;

    // Add code parameter for WHERE clause
    values.push(code);

    const query = `
      UPDATE ${this.config.tableName}
      SET ${setFields.join(', ')}
      WHERE code = $${paramIndex}
      RETURNING *
    `;

    try {
      const result = await this.db.query(query, values);
      
      if (result.rows.length === 0) {
        throw new Error(`${this.config.entityName} not found`);
      }

      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to update ${this.config.entityName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete entity  
   */
  async delete(code: string): Promise<boolean> {
    const now = new Date();
    
    const query = `
      DELETE FROM ${this.config.tableName}
      WHERE code = $1  
      RETURNING code
    `;

    try {
      const result = await this.db.query(query, [code]);
      return result.rows.length > 0;
    } catch (error) {
      throw new Error(`Failed to delete ${this.config.entityName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Toggle entity active status
   */
  async changeStatus(code: string, userId: number): Promise<boolean> {
    const now = new Date();
    
    const query = `
      UPDATE ${this.config.tableName}
      SET is_active = NOT is_active,
          updated_by = $1,
          updated_at = $2
      WHERE code = $3
      RETURNING is_active
    `;

    try {
      const result = await this.db.query(query, [userId, now, code]);
      return result.rows.length > 0;
    } catch (error) {
      throw new Error(`Failed to change ${this.config.entityName} status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Count entities with optional filtering
   */
  async count(options: VarcharCodeQueryOptions = {}): Promise<number> {
    const { search} = options;

    // Build WHERE conditions
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    // Search functionality
    if (search && search.trim()) {
      const searchConditions = this.config.searchableFields.map(field => 
        `LOWER(${field}::text) LIKE LOWER($${paramIndex})`
      );
      conditions.push(`(${searchConditions.join(' OR ')})`);
      params.push(`%${this.escapeLikeString(search.trim())}%`);
      paramIndex++;
    }

    // Build WHERE clause
    const whereClause = conditions.length > 0 ? 
      `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT COUNT(*) as total FROM ${this.config.tableName}
      ${whereClause}
    `;

    try {
      const result = await this.db.query(query, params);
      return parseInt(result.rows[0].total);
    } catch (error) {
      throw new Error(`Failed to count ${this.config.entityName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if entity exists by code
   */
  async exists(code: string): Promise<boolean> {
    const query = `
      SELECT 1 FROM ${this.config.tableName}
      WHERE code = $1
      LIMIT 1
    `;

    try {
      const result = await this.db.query(query, [code]);
      return result.rows.length > 0;
    } catch (error) {
      throw new Error(`Failed to check ${this.config.entityName} existence: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }


  async health(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: {
      database: boolean;
      table: boolean;
      records: boolean;
    };
    metrics: {
      total: number;
      active: number;
      inactive: number;
      lastUpdated: Date | null;
    };
    timestamp: Date;
  }> {
    const timestamp = new Date();
    const checks = {
      database: false,
      table: false,
      records: false
    };
    
    let metrics = {
      total: 0,
      active: 0,
      inactive: 0,
      lastUpdated: null as Date | null
    };

    try {
      // Check database connection
      const dbTest = await this.db.query('SELECT 1');
      checks.database = dbTest.rowCount !== null;

      // Check table existence and structure
      const tableCheck = await this.db.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = $1
        )
      `, [this.config.tableName]);
      checks.table = tableCheck.rows[0].exists;

      if (checks.table) {
        // Get detailed metrics
        const metricsQuery = await this.db.query(`
          SELECT 
            COUNT(*) as total_records,
            COUNT(*) FILTER (WHERE is_active = true) as active_records,
            COUNT(*) FILTER (WHERE is_active = false) as inactive_records,
            MAX(updated_at) as last_updated
          FROM ${this.config.tableName}
        `);

        if (metricsQuery.rows.length > 0) {
          const row = metricsQuery.rows[0];
          metrics = {
            total: parseInt(row.total_records) || 0,
            active: parseInt(row.active_records) || 0,
            inactive: parseInt(row.inactive_records) || 0,
            lastUpdated: row.last_updated ? new Date(row.last_updated) : null
          };
          checks.records = true;
        }
      }

      // Determine overall status
      let status: 'healthy' | 'degraded' | 'unhealthy';
      if (checks.database && checks.table && checks.records) {
        status = 'healthy';
      } else if (checks.database && checks.table) {
        status = 'degraded';
      } else {
        status = 'unhealthy';
      }

      return {
        status,
        checks,
        metrics,
        timestamp
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        checks,
        metrics,
        timestamp
      };
    }
  }

 
  async statistics(): Promise<{
    overview: {
      total: number;
      active: number;
      inactive: number; 
    };

  }> {

    try {
      // Overview statistics
      const overviewQuery = await this.db.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE is_active = true) as active,
          COUNT(*) FILTER (WHERE is_active = false) as inactive
        FROM ${this.config.tableName}
      `);

      const overview = {
        total: parseInt(overviewQuery.rows[0].total) || 0,
        active: parseInt(overviewQuery.rows[0].active) || 0,
        inactive: parseInt(overviewQuery.rows[0].inactive) || 0
      };

      return {overview};
    } catch (error) {
      throw new Error(`Failed to get ${this.config.entityName} statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getByName(name: string, options: VarcharCodeQueryOptions = {}): Promise<VarcharCodePaginatedResponse<T>> {
    // Apply defaults
    const {
      page = 1,
      limit = this.config.defaultLimit || 20,
      sortBy = 'code',
      sortOrder = 'ASC',
      isActive
    } = options;

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build WHERE conditions
    const conditions: string[] = ['LOWER(name) = LOWER($1)'];
    const params: any[] = [name];
    let paramIndex = 2;

    // Build WHERE clause
    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    // Validate sort field
    const validSortField = this.validateSortField(sortBy);
    const validSortOrder = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    // Main query
    const dataQuery = `
      SELECT * FROM ${this.config.tableName}
      ${whereClause}
      ORDER BY ${validSortField} ${validSortOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    // Count query
    const countQuery = `
      SELECT COUNT(*) as total FROM ${this.config.tableName}
      ${whereClause}
    `;

    try {
      // Execute both queries
      const dataParams = [...params, limit, offset];
      const [dataResult, countResult] = await Promise.all([
        this.db.query(dataQuery, dataParams),
        this.db.query(countQuery, params)
      ]);

      const total = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(total / limit);

      return {
        data: dataResult.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      };
    } catch (error) {
      throw new Error(`Failed to search ${this.config.entityName} by name: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }


  async filterStatus(status: boolean, options: VarcharCodeQueryOptions = {}): Promise<VarcharCodePaginatedResponse<T>> {
    // Apply defaults
    const {
      page = 1,
      limit = this.config.defaultLimit || 20,
      sortBy = 'code',
      sortOrder = 'ASC',
      search
    } = options;

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build WHERE conditions
    const conditions: string[] = ['is_active = $1'];
    const params: any[] = [status];
    let paramIndex = 2;

    // Search functionality
    if (search && search.trim()) {
      const searchConditions = this.config.searchableFields.map(field => 
        `LOWER(${field}::text) LIKE LOWER($${paramIndex})`
      );
      conditions.push(`(${searchConditions.join(' OR ')})`);
      params.push(`%${this.escapeLikeString(search.trim())}%`);
      paramIndex++;
    }

    // Build WHERE clause
    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    // Validate sort field
    const validSortField = this.validateSortField(sortBy);
    const validSortOrder = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    // Main query
    const dataQuery = `
      SELECT * FROM ${this.config.tableName}
      ${whereClause}
      ORDER BY ${validSortField} ${validSortOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    // Count query
    const countQuery = `
      SELECT COUNT(*) as total FROM ${this.config.tableName}
      ${whereClause}
    `;

    try {
      // Execute both queries
      const dataParams = [...params, limit, offset];
      const [dataResult, countResult] = await Promise.all([
        this.db.query(dataQuery, dataParams),
        this.db.query(countQuery, params)
      ]);

      const total = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(total / limit);

      return {
        data: dataResult.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      };
    } catch (error) {
      throw new Error(`Failed to filter ${this.config.entityName} by status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async search(pattern: string, options: VarcharCodeQueryOptions = {}): Promise<VarcharCodePaginatedResponse<T>> {
    // Apply defaults
    const {
      page = 1,
      limit = this.config.defaultLimit || 20,
      sortBy = 'code',
      sortOrder = 'ASC'
    } = options;

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build WHERE conditions - Search both code AND name fields
    const conditions: string[] = ['(LOWER(code) LIKE LOWER($1) OR LOWER(name) LIKE LOWER($1))'];
    const params: any[] = [`%${this.escapeLikeString(pattern)}%`];
    let paramIndex = 2;

    // Build WHERE clause
    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    // Validate sort field
    const validSortField = this.validateSortField(sortBy);
    const validSortOrder = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    // Main query
    const dataQuery = `
      SELECT * FROM ${this.config.tableName}
      ${whereClause}
      ORDER BY ${validSortField} ${validSortOrder}
      LIMIT ${paramIndex} OFFSET ${paramIndex + 1}
    `;

    // Count query
    const countQuery = `
      SELECT COUNT(*) as total FROM ${this.config.tableName}
      ${whereClause}
    `;

    try {
      // Execute both queries
      const dataParams = [...params, limit, offset];
      const [dataResult, countResult] = await Promise.all([
        this.db.query(dataQuery, dataParams),
        this.db.query(countQuery, params)
      ]);

      const total = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(total / limit);

      return {
        data: dataResult.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      };
    } catch (error) {
      throw new Error(`Failed to search ${this.config.entityName} by pattern: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Validate sort field to prevent SQL injection
   */
  private validateSortField(sortBy: string): string {
    // Define allowed sort fields (basic entity fields + configurable searchable fields)
    const allowedFields = [
      'code', 
      'name', 
      'is_active', 
      'created_at', 
      'updated_at',
      ...this.config.searchableFields
    ];
    
    // Remove duplicates
    const uniqueAllowedFields = [...new Set(allowedFields)];
    
    if (uniqueAllowedFields.includes(sortBy)) {
      return sortBy;
    }
    
    // Default to code if invalid field provided
    return 'code';
  }

  /**
   * Escape special characters for LIKE queries
   */
  private escapeLikeString(str: string): string {
    // Escape %, _, and \ for safe LIKE usage
    return str.replace(/[%_\\]/g, '\\$&');
  }
}

/**
 * Factory function to create a generic VARCHAR CODE model
 */
export function createVarcharCodeModel<T extends BaseVarcharCodeEntity>(
  db: Pool,
  config: VarcharCodeEntityConfig
): GenericVarcharCodeModel<T> {
  return new GenericVarcharCodeModel<T>(db, config);
}

export default GenericVarcharCodeModel;

 