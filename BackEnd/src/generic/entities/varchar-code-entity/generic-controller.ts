// server/src/generic/entities/varchar-code-entity/generic-controller.ts
// 🛠️ ENHANCED: Generic VARCHAR Code Controller with New Endpoints
// Complete Separation Entity Architecture - Sampling Inspection Control System

import { Response, NextFunction } from 'express';
import {
  BaseVarcharCodeEntity,
  CreateVarcharCodeData,
  UpdateVarcharCodeData,
  VarcharCodeQueryOptions,
  VarcharCodeEntityRequest,
  VarcharCodeApiResponse,
  VarcharCodeEntityConfig,
  IVarcharCodeController,
  IVarcharCodeService
} from './generic-types';

export class GenericVarcharCodeController<T extends BaseVarcharCodeEntity> implements IVarcharCodeController {
  protected service: IVarcharCodeService<T>;
  protected config: VarcharCodeEntityConfig;

  constructor(service: IVarcharCodeService<T>, config: VarcharCodeEntityConfig) {
    this.service = service;
    this.config = config;
  }

  // ==================== EXISTING CRUD ENDPOINTS ====================

  /**
   * POST /api/{entity}
   * Create new entity
   */
  create = async (req: VarcharCodeEntityRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const createData: CreateVarcharCodeData = req.body;

      const result = await this.service.create(createData, userId);

      if (result.success && result.data) {
        const response: VarcharCodeApiResponse<T> = {
          success: true,
          data: result.data,
          message: `${this.config.entityName} created successfully`
        };
        res.status(201).json(response);
      } else {
        const response: VarcharCodeApiResponse = {
          success: false,
          error: result.error || `Failed to create ${this.config.entityName}`
        };
        res.status(400).json(response);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/{entity}/:code
   * Get entity by code
   */
  getByCode = async (req: VarcharCodeEntityRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { code } = req.params;

      const result = await this.service.getByCode(code);

      if (result.success && result.data) {
        const response: VarcharCodeApiResponse<T> = {
          success: true,
          data: result.data
        };
        res.status(200).json(response);
      } else {
        const response: VarcharCodeApiResponse = {
          success: false,
          error: result.error || `${this.config.entityName} not found`
        };
        res.status(404).json(response);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/{entity}
   * Get all entities with pagination and filtering
   */
  getAll = async (req: VarcharCodeEntityRequest<any, any, VarcharCodeQueryOptions>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const queryOptions = this.parseQueryOptions(req.query);

      const result = await this.service.getAll(queryOptions);

      if (result.success && result.data) {
        const response: VarcharCodeApiResponse = {
          success: true,
          data: result.data.data,
          message: `Retrieved ${result.data.data.length} ${this.config.entityName} records`,
          // Include pagination metadata in response
          ...result.data.pagination && { pagination: result.data.pagination }
        };
        res.status(200).json(response);
      } else {
        const response: VarcharCodeApiResponse = {
          success: false,
          error: result.error || `Failed to retrieve ${this.config.entityName} list`
        };
        res.status(500).json(response);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/{entity}/:code
   * Update existing entity
   */
  update = async (req: VarcharCodeEntityRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { code } = req.params;
      const userId = req.user!.id;
      const updateData: UpdateVarcharCodeData = req.body;

      const result = await this.service.update(code, updateData, userId);

      if (result.success && result.data) {
        const response: VarcharCodeApiResponse<T> = {
          success: true,
          data: result.data,
          message: `${this.config.entityName} updated successfully`
        };
        res.status(200).json(response);
      } else {
        const response: VarcharCodeApiResponse = {
          success: false,
          error: result.error || `Failed to update ${this.config.entityName}`
        };
        res.status(400).json(response);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/{entity}/:code
   * Soft delete entity (set is_active = false)
   */
  delete = async (req: VarcharCodeEntityRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { code } = req.params;

      const result = await this.service.delete(code);

      if (result.success) {
        const response: VarcharCodeApiResponse<boolean> = {
          success: true,
          data: true,
          message: `${this.config.entityName} deactivated successfully`
        };
        res.status(200).json(response);
      } else {
        const response: VarcharCodeApiResponse = {
          success: false,
          error: result.error || `Failed to deactivate ${this.config.entityName}`
        };
        res.status(400).json(response);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/{entity}/:code/status
   * Toggle entity active status
   */
  changeStatus = async (req: VarcharCodeEntityRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { code } = req.params;
      const userId = req.user!.id;

      const result = await this.service.changeStatus(code, userId);

      if (result.success) {
        const response: VarcharCodeApiResponse<boolean> = {
          success: true,
          data: true,
          message: `${this.config.entityName} status changed successfully`
        };
        res.status(200).json(response);
      } else {
        const response: VarcharCodeApiResponse = {
          success: false,
          error: result.error || `Failed to change ${this.config.entityName} status`
        };
        res.status(400).json(response);
      }
    } catch (error) {
      next(error);
    }
  };

  // ==================== NEW ENHANCED ENDPOINTS ====================

  /**
   * GET /api/{entity}/health
   * Get system health status for the entity
   */
  getHealth = async (req: VarcharCodeEntityRequest, res: Response, next: NextFunction): Promise<void> => {
    try {

      const result = await this.service.getHealth();

      if (result.success && result.data) {
        const response: VarcharCodeApiResponse = {
          success: true,
          data: result.data,
          message: `${this.config.entityName} health status retrieved successfully`
        };
        
        // Set HTTP status based on health status
        const httpStatus = result.data.status === 'healthy' ? 200 : 
                          result.data.status === 'degraded' ? 206 : 503;
        
        res.status(httpStatus).json(response);
      } else {
        const response: VarcharCodeApiResponse = {
          success: false,
          error: result.error || `Failed to get ${this.config.entityName} health status`
        };
        res.status(500).json(response);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/{entity}/statistics
   * Get comprehensive entity statistics
   */
  getStatistics = async (req: VarcharCodeEntityRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
    

      const result = await this.service.getStatistics( );

      if (result.success && result.data) {
        const response: VarcharCodeApiResponse = {
          success: true,
          data: result.data,
          message: `${this.config.entityName} statistics retrieved successfully`
        };
        res.status(200).json(response);
      } else {
        const response: VarcharCodeApiResponse = {
          success: false,
          error: result.error || `Failed to get ${this.config.entityName} statistics`
        };
        res.status(500).json(response);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/{entity}/search/name/:name
   * Search entities by exact name match
   */
  getByName = async (req: VarcharCodeEntityRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name } = req.params;
      const queryOptions = this.parseQueryOptions(req.query);

      const result = await this.service.getByName(name, queryOptions);

      if (result.success && result.data) {
        const response: VarcharCodeApiResponse = {
          success: true,
          data: result.data.data,
          message: `Found ${result.data.data.length} ${this.config.entityName} records matching name '${name}'`,
          ...result.data.pagination && { pagination: result.data.pagination }
        };
        res.status(200).json(response);
      } else {
        const response: VarcharCodeApiResponse = {
          success: false,
          error: result.error || `Failed to search ${this.config.entityName} by name`
        };
        res.status(400).json(response);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/{entity}/filter/status/:status
   * Filter entities by active status (true/false)
   */
  filterStatus = async (req: VarcharCodeEntityRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { status } = req.params;
      const queryOptions = this.parseQueryOptions(req.query);

      // Parse status parameter
      let statusValue: boolean;
      if (status.toLowerCase() === 'true' || status === '1') {
        statusValue = true;
      } else if (status.toLowerCase() === 'false' || status === '0') {
        statusValue = false;
      } else {
        const response: VarcharCodeApiResponse = {
          success: false,
          error: 'Status parameter must be true, false, 1, or 0'
        };
        res.status(400).json(response);
        return;
      }

      const result = await this.service.filterStatus(statusValue, queryOptions);

      if (result.success && result.data) {
        const statusText = statusValue ? 'active' : 'inactive';
        const response: VarcharCodeApiResponse = {
          success: true,
          data: result.data.data,
          message: `Found ${result.data.data.length} ${statusText} ${this.config.entityName} records`,
          ...result.data.pagination && { pagination: result.data.pagination }
        };
        res.status(200).json(response);
      } else {
        const response: VarcharCodeApiResponse = {
          success: false,
          error: result.error || `Failed to filter ${this.config.entityName} by status`
        };
        res.status(400).json(response);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/{entity}/search/pattern/:pattern
   * Search entities by code OR name pattern (contains)
   */
  search = async (req: VarcharCodeEntityRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { pattern } = req.params;
      const queryOptions = this.parseQueryOptions(req.query);

      const result = await this.service.search(pattern, queryOptions );

      if (result.success && result.data) {
        const response: VarcharCodeApiResponse = {
          success: true,
          data: result.data.data,
          message: `Found ${result.data.data.length} ${this.config.entityName} records matching pattern '${pattern}' in code or name`,
          ...result.data.pagination && { pagination: result.data.pagination }
        };
        res.status(200).json(response);
      } else {
        const response: VarcharCodeApiResponse = {
          success: false,
          error: result.error || `Failed to search ${this.config.entityName} by pattern`
        };
        res.status(400).json(response);
      }
    } catch (error) {
      next(error);
    }
  };

  // ==================== HELPER METHODS ====================

  /**
   * Parse query parameters into VarcharCodeQueryOptions
   */
  private parseQueryOptions(query: any): VarcharCodeQueryOptions {
    return {
      page: query.page ? parseInt(query.page, 10) : undefined,
      limit: query.limit ? parseInt(query.limit, 10) : undefined,
      sortBy: query.sortBy || undefined,
      sortOrder: query.sortOrder === 'DESC' ? 'DESC' : 'ASC',
      search: query.search || undefined,
      isActive: query.isActive !== undefined ? 
        (query.isActive === 'true' || query.isActive === '1') : undefined,
      createdAfter: query.createdAfter ? new Date(query.createdAfter) : undefined,
      createdBefore: query.createdBefore ? new Date(query.createdBefore) : undefined,
      updatedAfter: query.updatedAfter ? new Date(query.updatedAfter) : undefined,
      updatedBefore: query.updatedBefore ? new Date(query.updatedBefore) : undefined
    };
  }
}

/**
 * Factory function to create a generic VARCHAR CODE controller
 */
export function createGenericVarcharCodeController<T extends BaseVarcharCodeEntity>(
  service: IVarcharCodeService<T>,
  config: VarcharCodeEntityConfig
): GenericVarcharCodeController<T> {
  return new GenericVarcharCodeController<T>(service, config);
}

export default GenericVarcharCodeController;

 