// server/src/generic/entities/special-entity/generic-controller.ts
// Updated Generic SPECIAL Entity Controller - Complete Separation Entity Architecture  
// Manufacturing Quality Control System - Enhanced with Health & Statistics

import { Request, Response, NextFunction } from 'express';
import {
  BaseSpecialEntity,
  SpecialQueryOptions,
  SpecialEntityConfig,
  ISpecialController,
  ISpecialService,
  HTTP_STATUS,
  SPECIAL_ERROR_MESSAGES
} from './generic-types';

// Import authentication middleware types
import type { CompatibleQCRequest, SessionUser, UserRole } from '../../../middleware/auth';

/**
 * Updated Generic SPECIAL Entity Controller Implementation
 * 
 * Enhanced with health and statistics endpoints for comprehensive monitoring.
 * Provides standardized HTTP endpoints for all SPECIAL entities with health checks.
 */
export class GenericSpecialController<T extends BaseSpecialEntity> implements ISpecialController {
  protected service: ISpecialService<T>;
  protected config: SpecialEntityConfig;

  constructor(service: ISpecialService<T>, config: SpecialEntityConfig) {
    this.service = service;
    this.config = config;
  }

  

  // ==================== NEW HEALTH & STATISTICS ENDPOINTS ====================

  /**
   * Get comprehensive health check for the entity
   * GET /api/{entity}/health
   * Requires: Authentication middleware
   */
  getHealth = async (req: CompatibleQCRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // User is guaranteed to exist due to authentication middleware
      const userId = (req as any).user?.id || 0;
      
      console.log(`🔍 Health check requested for ${this.config.entityName} by user ${(req as any).user?.username} (${(req as any).user?.role})`);
      
      const result = await this.service.checkHealth(userId);
      
      if (!result.success) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
          success: false,
          error: result.error,
          timestamp: new Date().toISOString(),
          path: req.path
        });
        return;
      }

      const healthData = result.data!;

      // Log health status for monitoring
      const statusEmoji = {
        'healthy': '✅',
        'warning': '⚠️',
        'critical': '❌'
      }[healthData.status];
      
      console.log(`${statusEmoji} Health endpoint served for ${this.config.entityName}: ${healthData.status.toUpperCase()} [User: ${(req as any).user?.username}]`);
      
    } catch (error) {
      console.error(`❌ Error getting health for ${this.config.entityName}:`, error);
      next(error);
    }
  };

  /**
   * Get comprehensive statistics for the entity
   * GET /api/{entity}/statistics
   * Requires: Authentication middleware + Manager role
   */
  getStatistics = async (req: CompatibleQCRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // User is guaranteed to exist due to authentication middleware
      const userId = (req as any).user?.id || 0;

      console.log(`📊 Statistics requested for ${this.config.entityName} by user ${(req as any).user?.username} (${(req as any).user?.role})`);
      
      const result = await this.service.getStatistics(userId);
      
      if (!result.success) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
          success: false,
          error: result.error,
          timestamp: new Date().toISOString(),
          path: req.path
        });
        return;
      }

      const statisticsData = result.data!;

      // Add additional statistics metadata
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: {
          ...statisticsData,
          metadata: {
            endpoint: req.path,
            requestedBy: {
              userId: userId,
              username: (req as any).user?.username,
              role: (req as any).user?.role
            },
            entityConfig: {
              entityName: this.config.entityName,
              tableName: this.config.tableName,
              primaryKeyType: this.config.primaryKey,
              defaultLimit: this.config.defaultLimit,
              maxLimit: this.config.maxLimit
            },
 
          }
        },
        timestamp: new Date().toISOString()
      });
 
    } catch (error) {
      console.error(`❌ Error getting statistics for ${this.config.entityName}:`, error);
      next(error);
    }
  };

  // ==================== UTILITY AND HELPER METHODS ====================

  /**
   * Extract filter parameters from query string
   */
  private extractFilters(query: any): Record<string, any> {
    const filters: Record<string, any> = {};
    
    // Extract known filter parameters
    const knownParams = ['page', 'limit', 'sortBy', 'sortOrder', 'search', 'isActive'];
    
    Object.keys(query).forEach(key => {
      if (!knownParams.includes(key) && query[key] !== undefined) {
        filters[key] = query[key];
      }
    });

    return filters;
  }

  
  /**
   * Validate request parameters for health and statistics endpoints
   * Authentication is handled by middleware, so just validate additional parameters
   */
  private validateMonitoringRequest(req: CompatibleQCRequest): { valid: boolean; error?: string } {
    // Authentication is handled by middleware, user is guaranteed to exist
    if (!(req as any).user) {
      return { valid: false, error: SPECIAL_ERROR_MESSAGES.UNAUTHORIZED };
    }

    // Additional validation can be added here
    return { valid: true };
  }

  /**
   * Log API activity for monitoring and audit
   */
  private logApiActivity(
    endpoint: string, 
    user?: SessionUser, 
    method: string = 'GET', 
    additionalInfo: any = {}
  ): void {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] API Activity - ${this.config.entityName}:`, {
      endpoint,
      method,
      userId: user?.id,
      username: user?.username,
      role: user?.role,
      ...additionalInfo
    });
  }

  /**
   * Create standardized error response
   */
  private createErrorResponse(
    error: string, 
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    additionalData: any = {}
  ) {
    return {
      success: false,
      error,
      statusCode,
      timestamp: new Date().toISOString(),
      entityName: this.config.entityName,
      ...additionalData
    };
  }

  /**
   * Create standardized success response
   */
  private createSuccessResponse(data: any, additionalData: any = {}) {
    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
      entityName: this.config.entityName,
      ...additionalData
    };
  }

  // ==================== MIDDLEWARE HELPERS ====================
 

  /**
   * Cache control headers for monitoring endpoints
   */
  protected setCacheHeaders(res: Response, endpoint: string): void {
    // Set appropriate cache headers based on endpoint type
    if (endpoint.includes('/health')) {
      // Health data should not be cached
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    } else if (endpoint.includes('/statistics')) {
      // Statistics can be cached for a short time
      res.set('Cache-Control', 'public, max-age=300'); // 5 minutes
    }
  }
}

/**
 * Factory function to create a generic SPECIAL controller with monitoring
 */
export function createSpecialController<T extends BaseSpecialEntity>(
  service: ISpecialService<T>,
  config: SpecialEntityConfig
): GenericSpecialController<T> {
  console.log(`🎮 Creating SPECIAL controller for ${config.entityName} with health & statistics endpoints`);
  return new GenericSpecialController<T>(service, config);
}

export default GenericSpecialController;

 