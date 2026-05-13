// server/src/generic/entities/serial-id-entity/generic-model.ts
// Updated Generic Serial ID Model - Complete Separation Entity Architecture
// Enhanced with Health, Statistics, and Advanced Search Methods

import { Pool } from 'pg';
import {
  BaseSerialIdEntity,
  CreateSerialIdData,
  UpdateSerialIdData,
  SerialIdQueryOptions,
  SerialIdPaginatedResponse,
  SerialIdEntityConfig,
  SerialIdHealthResponse,
  SerialIdStatistics,
  SerialIdSearchResult,
  ISerialIdModel
} from './generic-types';

/**
 * Enhanced Generic Serial ID Model Implementation
 * 
 * Provides essential database operations for all SERIAL ID entities
 * with new health, statistics, and advanced search capabilities.
 */
export class GenericSerialIdModel<T extends BaseSerialIdEntity> implements ISerialIdModel<T> {
  protected db: Pool;
  protected config: SerialIdEntityConfig;

  constructor(db: Pool, config: SerialIdEntityConfig) {
    this.db = db;
    this.config = config;
  }

  // ==================== SQL LOGGING HELPER ====================

  /**
   * Log SQL query with parameters for debugging
   */
  private logQuery(query: string, params: any[] = [], operation: string = 'QUERY'): void {
    console.log('🗃️ ========== SQL QUERY LOG ==========');
    console.log(`📋 Entity: ${this.config.entityName}`);
    console.log(`🔧 Operation: ${operation}`);
    console.log(`📝 Query: ${query}`);
    console.log(`📊 Parameters: ${JSON.stringify(params)}`);
    console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
    console.log('🗃️ ====================================');
  }

  /**
   * Execute query with logging
   */
  private async executeQuery(query: string, params: any[] = [], operation: string = 'QUERY'): Promise<any> {
    this.logQuery(query, params, operation);

    const startTime = Date.now();
    try {
      const result = await this.db.query(query, params);
      const endTime = Date.now();

      console.log(`✅ SQL SUCCESS - ${operation} executed in ${endTime - startTime}ms`);
      console.log(`📦 Rows affected/returned: ${result.rowCount || result.rows?.length || 0}`);

      return result;
    } catch (error) {
      const endTime = Date.now();
      console.log(`❌ SQL ERROR - ${operation} failed in ${endTime - startTime}ms`);
      console.log(`💥 Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  // ==================== EXISTING CRUD OPERATIONS ====================

  /**
   * Find entity by ID
   */
  async getById(id: number): Promise<T | null> {
    const query = `SELECT * FROM ${this.config.tableName} WHERE id = $1`;

    try {
      const result = await this.executeQuery(query, [id], 'GET_BY_ID');
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Failed to find ${this.config.entityName} by ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find all entities with pagination and filtering
   */
  async getAll(options: SerialIdQueryOptions = {}): Promise<SerialIdPaginatedResponse<T>> {
    const {
      page = 1,
      limit = this.config.defaultLimit,
      search,
      sortBy = 'name',
      sortOrder = 'ASC',
      isActive
    } = options;

    // Ensure limits are within bounds
    const validLimit = Math.min(limit, this.config.maxLimit);
    const offset = (page - 1) * validLimit;

    // Build WHERE clause
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    // Status filter functionality (isActive filter)
    if (isActive !== undefined) {
      conditions.push(`is_active = $${paramIndex}`);
      params.push(isActive);
      paramIndex++;
    }

    // Search functionality
    if (search && search.trim()) {
      const searchConditions = this.config.searchableFields.map(field =>
        `${field} ILIKE $${paramIndex}`
      ).join(' OR ');

      if (searchConditions) {
        conditions.push(`(${searchConditions})`);
        params.push(`%${search.trim()}%`);
        paramIndex++;
      }
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

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
      // Execute both queries with logging
      const dataParams = [...params, validLimit, offset];
      const [dataResult, countResult] = await Promise.all([
        this.executeQuery(dataQuery, dataParams, 'GET_ALL_DATA'),
        this.executeQuery(countQuery, params, 'GET_ALL_COUNT')
      ]);

      const total = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(total / validLimit);

      return {
        data: dataResult.rows,
        pagination: {
          page,
          limit: validLimit,
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
  async create(data: CreateSerialIdData, userId: number): Promise<T> {
    const now = new Date();
    
    // Build insert fields and values
    const fields = ['name', 'description', 'is_active', 'created_by', 'updated_by', 'created_at', 'updated_at'];
    const values = [
      data.name,
      data.description || '',
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
  async update(id: number, data: UpdateSerialIdData, userId: number): Promise<T> {
    const now = new Date();
    
    // Build update fields
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramIndex}`);
      params.push(data.name);
      paramIndex++;
    }

    if (data.description !== undefined) {
      updates.push(`description = $${paramIndex}`);
      params.push(data.description);
      paramIndex++;
    }

    if (data.is_active !== undefined) {
      updates.push(`is_active = $${paramIndex}`);
      params.push(data.is_active);
      paramIndex++;
    }

    // Always update timestamp and user
    updates.push(`updated_by = $${paramIndex}`);
    params.push(userId);
    paramIndex++;
    
    updates.push(`updated_at = $${paramIndex}`);
    params.push(now);
    paramIndex++;

    // Add ID for WHERE clause
    params.push(id);

    const query = `
      UPDATE ${this.config.tableName} 
      SET ${updates.join(', ')} 
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    try {
      const result = await this.db.query(query, params);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to update ${this.config.entityName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete entity (hard delete)
   */
  async delete(id: number): Promise<boolean> {
    const query = `DELETE FROM ${this.config.tableName} WHERE id = $1`;

    try {
      const result = await this.db.query(query, [id]);
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      throw new Error(`Failed to delete ${this.config.entityName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Change Status (toggle active/inactive)
   */
  async changeStatus(id: number, userId: number): Promise<boolean> {
    const now = new Date();
    const query = `
      UPDATE ${this.config.tableName} 
      SET is_active = NOT is_active,
          updated_by = $2,
          updated_at = $3
      WHERE id = $1 
    `;

    try {
      const result = await this.db.query(query, [id, userId, now]);
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      throw new Error(`Failed to change status for ${this.config.entityName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Count entities with optional filtering
   */
  async count(options: SerialIdQueryOptions = {}): Promise<number> {
    const { search} = options;

    // Build WHERE clause
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    // Search functionality
    if (search && search.trim()) {
      const searchConditions = this.config.searchableFields.map(field => 
        `${field} ILIKE $${paramIndex}`
      ).join(' OR ');
      
      if (searchConditions) {
        conditions.push(`(${searchConditions})`);
        params.push(`%${search.trim()}%`);
        paramIndex++;
      }
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

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

  // ==================== NEW ENHANCED METHODS ====================

  /**
   * Health Check - Entity and Database Status
   */
  async health(): Promise<SerialIdHealthResponse> {
    const timestamp = new Date();
    let status: 'healthy' | 'warning' | 'unhealthy' = 'healthy';
    const issues: string[] = [];

    try {
      // Check database connection
      const connectionTest = await this.db.query('SELECT 1');
      const databaseStatus = connectionTest ? 'connected' : 'disconnected';

      if (databaseStatus === 'disconnected') {
        status = 'unhealthy';
        issues.push('Database connection failed');
      }

      // Check record counts
      const totalQuery = `SELECT COUNT(*) as total FROM ${this.config.tableName}`;
      const activeQuery = `SELECT COUNT(*) as active FROM ${this.config.tableName} WHERE is_active = true`;
      const inactiveQuery = `SELECT COUNT(*) as inactive FROM ${this.config.tableName} WHERE is_active = false`;
      const lastUpdatedQuery = `SELECT MAX(updated_at) as last_updated FROM ${this.config.tableName}`;

      const [totalResult, activeResult, inactiveResult, lastUpdatedResult] = await Promise.all([
        this.db.query(totalQuery),
        this.db.query(activeQuery),
        this.db.query(inactiveQuery),
        this.db.query(lastUpdatedQuery)
      ]);

      const total = parseInt(totalResult.rows[0]?.total || '0');
      const active = parseInt(activeResult.rows[0]?.active || '0');
      const inactive = parseInt(inactiveResult.rows[0]?.inactive || '0');
      const lastUpdated = lastUpdatedResult.rows[0]?.last_updated;

      // Health warnings
      if (total === 0) {
        status = 'warning';
        issues.push(`No ${this.config.entityName} records found`);
      }

      if (active === 0 && total > 0) {
        status = 'warning';
        issues.push(`All ${this.config.entityName} records are inactive`);
      }

      return {
        status,
        entity: this.config.entityName,
        timestamp,
        checks: {
          database: databaseStatus,
          records: {
            total,
            active,
            inactive
          },
          lastUpdated: lastUpdated ? new Date(lastUpdated) : undefined
        },
        issues: issues.length > 0 ? issues : undefined
      };

    } catch (error) {
      return {
        status: 'unhealthy',
        entity: this.config.entityName,
        timestamp,
        checks: {
          database: 'disconnected',
          records: {
            total: 0,
            active: 0,
            inactive: 0
          }
        },
        issues: [`Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  /**
   * Statistics - Comprehensive Entity Statistics
   */
  async statistics(): Promise<SerialIdStatistics> {
    const timestamp = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    try {
      // Basic counts
      const totalQuery = `SELECT COUNT(*) as total FROM ${this.config.tableName}`;
      const activeQuery = `SELECT COUNT(*) as active FROM ${this.config.tableName} WHERE is_active = true`;
      const inactiveQuery = `SELECT COUNT(*) as inactive FROM ${this.config.tableName} WHERE is_active = false`;

      // Trend queries
      const recentCreatedQuery = `SELECT COUNT(*) as recent_created FROM ${this.config.tableName} WHERE created_at >= $1`;
      const recentUpdatedQuery = `SELECT COUNT(*) as recent_updated FROM ${this.config.tableName} WHERE updated_at >= $1 AND updated_at != created_at`;

      // Distribution queries
      const withDescriptionQuery = `SELECT COUNT(*) as with_desc FROM ${this.config.tableName} WHERE description IS NOT NULL AND description != ''`;
      const withoutDescriptionQuery = `SELECT COUNT(*) as without_desc FROM ${this.config.tableName} WHERE description IS NULL OR description = ''`;

      // Top creators query
      const topCreatorsQuery = `
        SELECT created_by as user_id, COUNT(*) as count 
        FROM ${this.config.tableName} 
        WHERE created_by > 0 
        GROUP BY created_by 
        ORDER BY count DESC 
        LIMIT 5
      `;

      const [
        totalResult,
        activeResult,
        inactiveResult,
        recentCreatedResult,
        recentUpdatedResult,
        withDescResult,
        withoutDescResult,
        topCreatorsResult
      ] = await Promise.all([
        this.db.query(totalQuery),
        this.db.query(activeQuery),
        this.db.query(inactiveQuery),
        this.db.query(recentCreatedQuery, [thirtyDaysAgo]),
        this.db.query(recentUpdatedQuery, [thirtyDaysAgo]),
        this.db.query(withDescriptionQuery),
        this.db.query(withoutDescriptionQuery),
        this.db.query(topCreatorsQuery)
      ]);

      return {
        entity: this.config.entityName,
        timestamp,
        totals: {
          all: parseInt(totalResult.rows[0]?.total || '0'),
          active: parseInt(activeResult.rows[0]?.active || '0'),
          inactive: parseInt(inactiveResult.rows[0]?.inactive || '0')
        } 
      };

    } catch (error) {
      throw new Error(`Failed to get ${this.config.entityName} statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Search By Name - Find entities with exact or partial name match
   */
  async getByName(name: string, options: SerialIdQueryOptions = {}): Promise<SerialIdSearchResult<T>> {
    const {
      page = 1,
      limit = this.config.defaultLimit,
      sortBy = 'name',
      sortOrder = 'ASC'
    } = options;

    const validLimit = Math.min(limit, this.config.maxLimit);
    const offset = (page - 1) * validLimit;

    // Build WHERE clause
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    // Name search - exact or partial match
    if (name && name.trim()) {
      conditions.push(`name ILIKE $${paramIndex}`);
      params.push(`%${name.trim()}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
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
      const dataParams = [...params, validLimit, offset];
      const [dataResult, countResult] = await Promise.all([
        this.db.query(dataQuery, dataParams),
        this.db.query(countQuery, params)
      ]);

      const total = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(total / validLimit);

      return {
        data: dataResult.rows,
        pagination: {
          page,
          limit: validLimit,
          total,
          totalPages
        },
        searchInfo: {
          query: name.trim(),
          searchType: 'name',
          resultCount: total
        }
      };

    } catch (error) {
      throw new Error(`Failed to search ${this.config.entityName} by name: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Filter By Status - Find entities by active/inactive status
   */
  async filterStatus(status: boolean, options: SerialIdQueryOptions = {}): Promise<SerialIdSearchResult<T>> {
    const {
      page = 1,
      limit = this.config.defaultLimit,
      sortBy = 'name',
      sortOrder = 'ASC'
    } = options;

    const validLimit = Math.min(limit, this.config.maxLimit);
    const offset = (page - 1) * validLimit;
    const validSortField = this.validateSortField(sortBy);
    const validSortOrder = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    // Main query
    const dataQuery = `
      SELECT * FROM ${this.config.tableName}
      ORDER BY ${validSortField} ${validSortOrder}
      LIMIT $1 OFFSET $2
    `;

    // Count query
    const countQuery = `
      SELECT COUNT(*) as total FROM ${this.config.tableName}
    `;

    try {
      const [dataResult, countResult] = await Promise.all([
        this.db.query(dataQuery, [status, validLimit, offset]),
        this.db.query(countQuery, [status])
      ]);

      const total = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(total / validLimit);

      return {
        data: dataResult.rows,
        pagination: {
          page,
          limit: validLimit,
          total,
          totalPages
        },
        searchInfo: {
          query: status ? 'active' : 'inactive',
          searchType: 'status',
          resultCount: total
        }
      };

    } catch (error) {
      throw new Error(`Failed to filter ${this.config.entityName} by status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async search(pattern: string, options: SerialIdQueryOptions = {}): Promise<SerialIdSearchResult<T>> {
    const {
      page = 1,
      limit = this.config.defaultLimit,
      sortBy = 'name',
      sortOrder = 'ASC'
    } = options;

    const validLimit = Math.min(limit, this.config.maxLimit);
    const offset = (page - 1) * validLimit;

    // Build WHERE clause
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    // Pattern search in name and description
    if (pattern && pattern.trim()) {
      const searchConditions = ['name ILIKE $' + paramIndex, 'description ILIKE $' + paramIndex];
      conditions.push(`(${searchConditions.join(' OR ')})`);
      params.push(`%${pattern.trim()}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
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
      const dataParams = [...params, validLimit, offset];
      const [dataResult, countResult] = await Promise.all([
        this.db.query(dataQuery, dataParams),
        this.db.query(countQuery, params)
      ]);

      const total = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(total / validLimit);

      return {
        data: dataResult.rows,
        pagination: {
          page,
          limit: validLimit,
          total,
          totalPages
        },
        searchInfo: {
          query: pattern.trim(),
          searchType: 'pattern',
          resultCount: total
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
    // Define allowed sort fields (basic entity fields)
    const allowedFields = ['id', 'name', 'description', 'is_active', 'created_at', 'updated_at', 'created_by', 'updated_by'];
    
    if (allowedFields.includes(sortBy)) {
      return sortBy;
    }
    
    // Default to name if invalid field provided
    return 'name';
  }

  /**
   * Escape special characters for LIKE queries
   */
  private escapeLikeString(str: string): string {
    return str.replace(/[%_\\]/g, '\\$&');
  }
}

/**
 * Factory function to create a generic Serial ID model
 */
export function createSerialIdModel<T extends BaseSerialIdEntity>(
  db: Pool,
  config: SerialIdEntityConfig
): GenericSerialIdModel<T> {
  return new GenericSerialIdModel<T>(db, config);
}

export default GenericSerialIdModel;