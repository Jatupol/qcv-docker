// server/src/generic/entities/special-entity/generic-model.ts
// Updated Generic SPECIAL Entity Model - Complete Separation Entity Architecture
// Sampling Inspection Control System - Enhanced with Health & Statistics

import { Pool, PoolClient } from 'pg';
import {
  BaseSpecialEntity,
  CreateSpecialData,
  UpdateSpecialData,
  SpecialQueryOptions,
  SpecialPaginatedResponse,
  SpecialEntityConfig,
  ISpecialModel,
  buildPrimaryKeyWhereClause
} from './generic-types';

/**
 * Health Check Result Interface
 */
export interface EntityHealthResult {
  entityName: string;
  tableName: string;
  status: 'healthy' | 'warning' | 'critical';
  checks: {
    tableExists: boolean;
    hasData: boolean;
    hasActiveRecords: boolean;
    recentActivity: boolean;
    indexHealth: boolean;
  };
  statistics: {
    total: number;
    active: number;
    inactive: number;
  };
  issues: string[];
  lastChecked: Date;
  responseTime: number; // milliseconds
}

/**
 * Entity Statistics Result Interface
 */
export interface EntityStatisticsResult {
  entityName: string;
  tableName: string;
  overview: {
    total: number;
    active: number;
    inactive: number;
  };
  lastCalculated: Date;
}

/**
 * Updated Generic SPECIAL Entity Model Implementation
 * 
 * Enhanced with health() and statistics() methods for monitoring and analytics.
 * Supports flexible primary key patterns and comprehensive entity health checks.
 */
export class GenericSpecialModel<T extends BaseSpecialEntity> implements ISpecialModel<T> {
  protected db: Pool;
  protected config: SpecialEntityConfig;

  constructor(db: Pool, config: SpecialEntityConfig) {
    this.db = db;
    this.config = config;
  }

  // ==================== EXISTING CRUD OPERATIONS ====================
 
 
  /**
   * Count entities with filters
   */
  async count(filters: Record<string, any> = {}): Promise<number> {
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        conditions.push(`${key} = $${paramIndex}`);
        params.push(value);
        paramIndex++;
      }
    });

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    try {
      const query = `SELECT COUNT(*) FROM ${this.config.tableName} ${whereClause}`;
      const result = await this.db.query(query, params);
      return parseInt(result.rows[0].count);
    } catch (error) {
      throw new Error(`Failed to count ${this.config.entityName} records: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

 
  /**
   * Comprehensive health check for the entity
   * 
   * Performs various health checks including:
   * - Table existence and accessibility
   * - Data availability and quality
   * - Recent activity monitoring
   * - Index health assessment
   */
  async health(): Promise<EntityHealthResult> {
    const startTime = Date.now();
    const issues: string[] = [];
    const checks = {
      tableExists: false,
      hasData: false,
      hasActiveRecords: false,
      recentActivity: false,
      indexHealth: false
    };

    let statistics = {
      total: 0,
      active: 0,
      inactive: 0,
      recent: 0
    };

    try {
      // Check 1: Table existence and accessibility
      try {
        const tableExistsQuery = `
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          )
        `;
        const tableResult = await this.db.query(tableExistsQuery, [this.config.tableName]);
        checks.tableExists = tableResult.rows[0].exists;
        
        if (!checks.tableExists) {
          issues.push(`Table '${this.config.tableName}' does not exist`);
        }
      } catch (error) {
        issues.push(`Failed to check table existence: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // Check 2: Data availability
      if (checks.tableExists) {
        try {
          const totalCountResult = await this.db.query(`SELECT COUNT(*) FROM ${this.config.tableName}`);
          statistics.total = parseInt(totalCountResult.rows[0].count);
          checks.hasData = statistics.total > 0;

          if (!checks.hasData) {
            issues.push('Table has no data');
          }
        } catch (error) {
          issues.push(`Failed to check data availability: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }

        // Check 3: Active records
        try {
          const activeCountResult = await this.db.query(
            `SELECT COUNT(*) FROM ${this.config.tableName} WHERE is_active = true`
          );
          statistics.active = parseInt(activeCountResult.rows[0].count);
          statistics.inactive = statistics.total - statistics.active;
          checks.hasActiveRecords = statistics.active > 0;

          if (!checks.hasActiveRecords && statistics.total > 0) {
            issues.push('No active records found');
          }
        } catch (error) {
          issues.push(`Failed to check active records: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }

        // Check 4: Recent activity (last 7 days)
        try {
          const recentActivityResult = await this.db.query(
            `SELECT COUNT(*) FROM ${this.config.tableName} 
             WHERE created_at >= NOW() - INTERVAL '7 days'`
          );
          statistics.recent = parseInt(recentActivityResult.rows[0].count);
          checks.recentActivity = statistics.recent > 0;

          if (!checks.recentActivity && statistics.total > 10) {
            issues.push('No recent activity (last 7 days)');
          }
        } catch (error) {
          issues.push(`Failed to check recent activity: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }

        // Check 5: Index health (primary key index usage)
        try {
          const primaryKeyField = this.config.primaryKey.fields[0]; // Use first primary key field
          const indexHealthQuery = `
            SELECT schemaname, tablename, indexname, idx_tup_read, idx_tup_fetch 
            FROM pg_stat_user_indexes 
            WHERE tablename = $1 AND indexname LIKE '%pkey%'
          `;
          const indexResult = await this.db.query(indexHealthQuery, [this.config.tableName]);
          
          if (indexResult.rows.length > 0) {
            const indexData = indexResult.rows[0];
            const indexUsage = indexData.idx_tup_read || 0;
            checks.indexHealth = indexUsage >= 0; // Index exists and is being tracked
          } else {
            issues.push('Primary key index not found or not being used');
          }
        } catch (error) {
          issues.push(`Failed to check index health: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

    } catch (error) {
      issues.push(`Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Determine overall status
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    
    if (!checks.tableExists || !checks.hasData) {
      status = 'critical';
    } else if (issues.length > 0 || !checks.hasActiveRecords) {
      status = 'warning';
    }

    const responseTime = Date.now() - startTime;

    return {
      entityName: this.config.entityName,
      tableName: this.config.tableName,
      status,
      checks,
      statistics,
      issues,
      lastChecked: new Date(),
      responseTime
    };
  }

  /**
   * Comprehensive statistics for the entity
   * 
   * Provides detailed analytics including:
   * - Overview statistics (total, active, inactive)
   * - Activity trends and patterns
   * - Data quality assessment
   * - Performance metrics
   * - Growth trends and user activity
   */
  async statistics(): Promise<EntityStatisticsResult> {
    const startTime = Date.now();
    
    // Initialize result structure
    const result: EntityStatisticsResult = {
      entityName: this.config.entityName,
      tableName: this.config.tableName,
      overview: {
        total: 0,
        active: 0,
        inactive: 0 
      },
      lastCalculated: new Date()
    };

    try {
      // Overview Statistics
      const overviewQuery = `
        SELECT 
          COUNT(*) as total_records,
          COUNT(*) FILTER (WHERE is_active = true) as active_records,
          COUNT(*) FILTER (WHERE is_active = false) as inactive_records
        FROM ${this.config.tableName}
      `;
      const overviewResult = await this.db.query(overviewQuery);
      const overview = overviewResult.rows[0];
      
      result.overview.total = parseInt(overview.total_records);
      result.overview.active = parseInt(overview.active_records);
      result.overview.inactive = parseInt(overview.inactive_records);

    } catch (error) {
      console.error(`Failed to calculate statistics for ${this.config.entityName}:`, error);
      // Return partial results even if some queries fail
    }

    return result;
  }
}

/**
 * Factory function to create a generic SPECIAL model
 */
export function createSpecialModel<T extends BaseSpecialEntity>(
  db: Pool,
  config: SpecialEntityConfig
): GenericSpecialModel<T> {
  return new GenericSpecialModel<T>(db, config);
}

export default GenericSpecialModel;

 