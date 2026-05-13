// server/src/generic/entities/special-entity/generic-service.ts
// Updated Generic SPECIAL Entity Service - Complete Separation Entity Architecture
// Sampling Inspection Control System - Enhanced with Health & Statistics

import {
  BaseSpecialEntity,
  CreateSpecialData,
  UpdateSpecialData,
  SpecialQueryOptions,
  SpecialPaginatedResponse,
  SpecialServiceResult,
  ValidationResult,
  SpecialEntityConfig,
  ISpecialService,
  ISpecialModel,
  EntityHealthResult,
  EntityStatisticsResult,
  createSuccessResult,
  createErrorResult,
  validateEntityData
} from './generic-types';

/**
 * Updated Generic SPECIAL Entity Service Implementation
 * 
 * Enhanced with health() and statistics() methods for comprehensive monitoring.
 * Provides essential business logic for all SPECIAL entities with health checks.
 */
export class GenericSpecialService<T extends BaseSpecialEntity> implements ISpecialService<T> {
  protected model: ISpecialModel<T>;
  protected config: SpecialEntityConfig;

  constructor(model: ISpecialModel<T>, config: SpecialEntityConfig) {
    this.model = model;
    this.config = config;
  }

  // ==================== EXISTING CRUD OPERATIONS ====================

 
 

  // ==================== NEW HEALTH & STATISTICS METHODS ====================

  /**
   * Perform comprehensive health check for the entity
   * 
   * Provides detailed health monitoring including:
   * - Database connectivity and table health
   * - Data quality and integrity checks
   * - Performance metrics and activity monitoring
   * - System resource utilization
   */
  async checkHealth(userId: number): Promise<SpecialServiceResult<EntityHealthResult>> {
    try {
      console.log(`🔍 Performing health check for ${this.config.entityName}...`);
      
      const healthResult = await this.model.health();
      
      // Log health status for monitoring
      const statusEmoji = {
        'healthy': '✅',
        'warning': '⚠️',
        'critical': '❌'
      }[healthResult.status];
      
      console.log(`${statusEmoji} Health check completed for ${this.config.entityName}: ${healthResult.status.toUpperCase()}`);
      
      if (healthResult.issues.length > 0) {
        console.log(`   Issues found: ${healthResult.issues.join(', ')}`);
      }
      
      console.log(`   Statistics: ${healthResult.statistics.total} total, ${healthResult.statistics.active} active`);
      console.log(`   Response time: ${healthResult.responseTime}ms`);

      return createSuccessResult(healthResult);
    } catch (error) {
      console.error(`❌ Health check failed for ${this.config.entityName}:`, error);
      
      // Return a critical health result even when the check fails
      const criticalHealth: EntityHealthResult = {
        entityName: this.config.entityName,
        tableName: this.config.tableName,
        status: 'critical',
        checks: {
          tableExists: false,
          hasData: false,
          hasActiveRecords: false,
          recentActivity: false,
          indexHealth: false
        },
        statistics: {
          total: 0,
          active: 0,
          inactive: 0 
        },
        issues: [`Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        lastChecked: new Date(),
        responseTime: 0
      };

      return createSuccessResult(criticalHealth);
    }
  }

  /**
   * Get comprehensive statistics for the entity
   * 
   * Provides detailed analytics including:
   * - Overview and activity metrics
   * - Data quality assessment
   * - Performance analysis
   * - Growth trends and user activity
   */
  async getStatistics(userId: number): Promise<SpecialServiceResult<EntityStatisticsResult>> {
    try {
      console.log(`📊 Calculating statistics for ${this.config.entityName}...`);
      
      const startTime = Date.now();
      const statisticsResult = await this.model.statistics();
      const calculationTime = Date.now() - startTime;
      
      // Log statistics summary for monitoring
      console.log(`✅ Statistics calculated for ${this.config.entityName} in ${calculationTime}ms`);
 
 
      return createSuccessResult(statisticsResult);
    } catch (error) {
      console.error(`❌ Statistics calculation failed for ${this.config.entityName}:`, error);
      return createErrorResult(`Failed to calculate statistics for ${this.config.entityName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ==================== ENHANCED VALIDATION ====================

  /**
   * Enhanced validation with health considerations
   */
  protected validateData(data: any, operation: 'create' | 'update'): ValidationResult {
    // Use the utility function from types
    const baseValidation = validateEntityData(data, this.config, operation);
    
    // Add entity-specific validation
    const customValidation = this.validateEntitySpecific(data, operation);
    const errors = [...baseValidation.errors, ...customValidation];

    return {
      isValid: errors.length === 0,
      errors
    };
  }

 
  /**
   * Entity-specific validation (override in subclasses)
   */
  protected validateEntitySpecific(data: any, operation: 'create' | 'update'): string[] {
    // Default implementation - can be overridden by specific entities
    return [];
  }

  // ==================== STATISTICAL ANALYSIS HELPERS ====================
 
 

  // ==================== HELPER METHODS ====================

  /**
   * Apply default query options with health-aware limits
   */
  private applyDefaultOptions(options: SpecialQueryOptions): SpecialQueryOptions {
    return {
      page: options.page || 1,
      limit: Math.min(options.limit || this.config.defaultLimit, this.config.maxLimit),
      sortBy: options.sortBy || 'created_at',
      sortOrder: options.sortOrder || 'DESC',
      search: options.search,
      isActive: options.isActive !== undefined ? options.isActive : true,
      filters: options.filters || {}
    };
  }

  /**
   * Sanitize search string
   */
  protected sanitizeSearchString(search: string): string {
    return search.trim().replace(/[%_]/g, '\\$&');
  }

  /**
   * Validate filter values with health considerations
   */
  protected validateFilters(filters: Record<string, any>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Basic filter validation - can be extended per entity
    Object.keys(filters).forEach(key => {
      if (filters[key] === null || filters[key] === undefined) {
        delete filters[key]; // Remove null/undefined filters
      }
      
      // Health-aware validation: check for potentially expensive filters
      if (typeof filters[key] === 'string' && filters[key].length > 100) {
        errors.push(`Filter value for '${key}' is too long`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // ==================== MONITORING METHODS ====================

  /**
   * Log service activity for monitoring
   */
  protected logActivity(action: string, details: any = {}) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${this.config.entityName} Service: ${action}`, details);
  }

  /**
   * Create audit log entry for important operations
   */
  protected createAuditEntry(action: string, userId: number, details: any = {}) {
    // This could be extended to write to an audit log table
    this.logActivity(`AUDIT: ${action}`, { userId, ...details });
  }

  /**
   * Performance monitoring wrapper
   */
  protected async withPerformanceMonitoring<R>(
    operation: string, 
    fn: () => Promise<R>
  ): Promise<R> {
    const startTime = Date.now();
    try {
      const result = await fn();
      const duration = Date.now() - startTime;
      
      if (duration > 1000) {
        console.warn(`⚠️ Slow operation detected: ${operation} took ${duration}ms for ${this.config.entityName}`);
      }
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ Operation failed: ${operation} failed after ${duration}ms for ${this.config.entityName}`, error);
      throw error;
    }
  }
}

/**
 * Factory function to create a generic SPECIAL service with health monitoring
 */
export function createSpecialService<T extends BaseSpecialEntity>(
  model: ISpecialModel<T>,
  config: SpecialEntityConfig
): GenericSpecialService<T> {
  console.log(`🏭 Creating SPECIAL service for ${config.entityName} with health monitoring`);
  return new GenericSpecialService<T>(model, config);
}

export default GenericSpecialService;

 