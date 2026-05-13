// server/src/generic/entities/serial-id-entity/generic-controller.ts
// TypeScript Fixed Generic Serial ID Controller - Complete Separation Entity Architecture
// Enhanced with Health, Statistics, and Advanced Search Methods - TYPE SAFE

import { Request, Response, NextFunction } from 'express';
import {
  BaseSerialIdEntity,
  SerialIdQueryOptions,
  SerialIdEntityRequest,
  SerialIdApiResponse,
  SerialIdEntityConfig,
  ISerialIdService,
  ISerialIdController
} from './generic-types';

/**
 * Enhanced Generic Serial ID Controller Implementation
 * 
 * Handles HTTP request/response for all SERIAL ID entities
 * with new health monitoring, statistics, and advanced search endpoints.
 * 
 * TypeScript SAFE - All type issues resolved
 */
export class GenericSerialIdController<T extends BaseSerialIdEntity> implements ISerialIdController {
  protected service: ISerialIdService<T>;
  protected config: SerialIdEntityConfig;

  constructor(service: ISerialIdService<T>, config: SerialIdEntityConfig) {
    this.service = service;
    this.config = config;
  }

  // ==================== EXISTING CRUD ENDPOINTS ====================

  /**
   * POST /api/{entity}
   * Create new entity
   */
  async create(req: SerialIdEntityRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId: number = this.extractUserId(req);
      const result = await this.service.create(req.body, userId);

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: 'Failed to create entity',
          error: result.error
        });
        return;
      }

      res.status(201).json({
        success: true,
        message: `${this.config.entityName} created successfully`,
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/{entity}/:id
   * Get entity by ID
   */
  async getById(req: SerialIdEntityRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, isValid, error } = this.parseIdParameter(req);
      if (!isValid) {
        res.status(400).json({
          success: false,
          message: error || 'Invalid ID parameter'
        });
        return;
      }

      const result = await this.service.getById(id);

      if (!result.success) {
        const statusCode = result.error?.includes('not found') ? 404 : 400;
        res.status(statusCode).json({
          success: false,
          message: result.error || 'Failed to get entity'
        });
        return;
      }

      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/{entity}/:id
   * Update entity by ID
   */
  async update(req: SerialIdEntityRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, isValid, error } = this.parseIdParameter(req);
      if (!isValid) {
        res.status(400).json({
          success: false,
          message: error || 'Invalid ID parameter'
        });
        return;
      }

      const userId: number = this.extractUserId(req);
      const result = await this.service.update(id, req.body, userId);

      if (!result.success) {
        const statusCode = result.error?.includes('not found') ? 404 : 400;
        res.status(statusCode).json({
          success: false,
          message: 'Failed to update entity',
          error: result.error
        });
        return;
      }

      res.json({
        success: true,
        message: `${this.config.entityName} updated successfully`,
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/{entity}/:id
   * Delete entity by ID (hard delete)
   */
  async delete(req: SerialIdEntityRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, isValid, error } = this.parseIdParameter(req);
      if (!isValid) {
        res.status(400).json({
          success: false,
          message: error || 'Invalid ID parameter'
        });
        return;
      }

      const result = await this.service.delete(id, (req as any).user ?? null, req);

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: 'Failed to delete entity',
          error: result.error
        });
        return;
      }

      res.json({
        success: true,
        message: `${this.config.entityName} deleted successfully`
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/{entity}/:id/status
   * Change entity status (toggle active/inactive)
   */
  async changeStatus(req: SerialIdEntityRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, isValid, error } = this.parseIdParameter(req);
      if (!isValid) {
        res.status(400).json({
          success: false,
          message: error || 'Invalid ID parameter'
        });
        return;
      }

      const userId: number = this.extractUserId(req);
      const result = await this.service.changeStatus(id, userId);

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: 'Failed to change status',
          error: result.error
        });
        return;
      }

      res.json({
        success: true,
        message: `${this.config.entityName} status changed successfully`
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/{entity}
   * Get all entities with pagination and filtering
   */
  async getAll(req: SerialIdEntityRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const options: SerialIdQueryOptions = this.buildQueryOptions(req);
      const result = await this.service.getAll(options);

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: 'Failed to get entities',
          error: result.error
        });
        return;
      }

      res.json({
        success: true,
        data: result.data?.data,
        pagination: result.data?.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  // ==================== NEW ENHANCED ENDPOINTS ====================

  /**
   * GET /api/{entity}/health
   * Get entity health status
   */
  async health(req: SerialIdEntityRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.service.health();

      if (!result.success) {
        res.status(503).json({
          success: false,
          message: 'Health check failed',
          error: result.error
        });
        return;
      }

      // Set appropriate status code based on health status
      const statusCode = result.data?.status === 'healthy' ? 200 : 
                        result.data?.status === 'warning' ? 200 : 503;

      res.status(statusCode).json({
        success: true,
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/{entity}/statistics
   * Get comprehensive entity statistics
   */
  async statistics(req: SerialIdEntityRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.service.statistics();

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: 'Failed to get statistics',
          error: result.error
        });
        return;
      }

      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/{entity}/search/name
   * Search entities by name
   * Query params: name (required), page, limit, sortBy, sortOrder, isActive
   */
  async getByName(req: SerialIdEntityRequest, res: Response, next: NextFunction): Promise<void> {
    try {

      const { value: name, isValid, error } = this.validateRequiredParam(req, 'name', 'string');

      if (!isValid || !name) {
        res.status(400).json({
          success: false,
          message: error || 'Name parameter is required for search'
        });
        return;
      }

      const options: SerialIdQueryOptions = this.buildQueryOptions(req);
      const result = await this.service.getByName(name as string, options);

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: 'Failed to search by name',
          error: result.error
        });
        return;
      }

      res.json({
        success: true,
        data: result.data?.data,
        pagination: result.data?.pagination,
        searchInfo: result.data?.searchInfo
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/{entity}/filter/status
   * Filter entities by active status
   * Query params: status (required boolean), page, limit, sortBy, sortOrder
   */
  async filterStatus(req: SerialIdEntityRequest, res: Response, next: NextFunction): Promise<void> {
    try {

      const { value: status, isValid, error } = this.validateRequiredParam(req, 'status', 'boolean');

      if (!isValid || status === null || status === undefined) {
        res.status(400).json({
          success: false,
          message: error || 'Status parameter is required for filtering (true/false)'
        });
        return;
      }

      const options: SerialIdQueryOptions = this.buildQueryOptions(req);
      const result = await this.service.filterStatus(status as boolean, options);

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: 'Failed to filter by status',
          error: result.error
        });
        return;
      }

      res.json({
        success: true,
        data: result.data?.data,
        pagination: result.data?.pagination,
        searchInfo: result.data?.searchInfo
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/{entity}/search/pattern
   * Search entities by pattern in name or description
   * Query params: pattern (required), page, limit, sortBy, sortOrder, isActive
   */
  async search(req: SerialIdEntityRequest, res: Response, next: NextFunction): Promise<void> {
    try {

      const { value: pattern, isValid, error } = this.validateRequiredParam(req, 'pattern', 'string');

      if (!isValid || !pattern) {
        res.status(400).json({
          success: false,
          message: error || 'Pattern parameter is required for search'
        });
        return;
      }

      const options: SerialIdQueryOptions = this.buildQueryOptions(req);
      const result = await this.service.search(pattern as string, options);

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: 'Failed to search by pattern',
          error: result.error
        });
        return;
      }

      res.json({
        success: true,
        data: result.data?.data,
        pagination: result.data?.pagination,
        searchInfo: result.data?.searchInfo
      });
    } catch (error) {
      next(error);
    }
  }

  // ==================== HELPER METHODS - TYPE SAFE ====================

  /**
   * Extract user ID from request with proper type handling
   */
  private extractUserId(req: SerialIdEntityRequest): number {
    return req.user?.id ?? 0;
  }

  /**
   * Parse and validate pagination parameters
   */
  protected parsePaginationOptions(req: SerialIdEntityRequest): { page: number; limit: number } {
    const pageParam = req.query.page;
    const limitParam = req.query.limit;
    
    const page = Math.max(1, parseInt(String(pageParam || '1'), 10) || 1);
    const limit = Math.min(
      Math.max(1, parseInt(String(limitParam || this.config.defaultLimit), 10) || this.config.defaultLimit),
      this.config.maxLimit
    );

    return { page, limit };
  }

  /**
   * Parse sort options with validation
   */
  protected parseSortOptions(req: SerialIdEntityRequest): { sortBy: string; sortOrder: 'ASC' | 'DESC' } {
    const sortBy = String(req.query.sortBy || 'name');
    const sortOrderParam = String(req.query.sortOrder || 'ASC').toUpperCase();
    const sortOrder = sortOrderParam === 'DESC' ? 'DESC' : 'ASC';

    return { sortBy, sortOrder };
  }

  /**
   * Parse boolean query parameter
   */
  protected parseBoolean(value: any, defaultValue: boolean = true): boolean {
    if (value === undefined || value === null) {
      return defaultValue;
    }
    return String(value).toLowerCase() === 'true';
  }

  /**
   * Send standardized error response
   */
  protected sendError(res: Response, statusCode: number, message: string, error?: string): void {
    res.status(statusCode).json({
      success: false,
      message,
      error
    });
  }

  /**
   * Send standardized success response
   */
  protected sendSuccess(res: Response, data?: any, message?: string, statusCode: number = 200): void {
    const response: SerialIdApiResponse = {
      success: true,
      data
    };

    if (message) {
      response.message = message;
    }

    res.status(statusCode).json(response);
  }

  /**
   * Validate and parse ID parameter - TYPE SAFE
   */
  protected parseIdParameter(req: SerialIdEntityRequest): { id: number; isValid: boolean; error?: string } {
    const idParam = req.params.id;
    
    if (!idParam || idParam.trim() === '') {
      return { id: 0, isValid: false, error: 'ID parameter is required' };
    }

    const id = parseInt(idParam, 10);

    if (isNaN(id) || id <= 0) {
      return { id: 0, isValid: false, error: 'Invalid ID parameter. Must be a positive integer' };
    }

    return { id, isValid: true };
  }

  /**
   * Validate required query parameter - TYPE SAFE
   */
  protected validateRequiredParam(
    req: SerialIdEntityRequest, 
    paramName: string, 
    paramType: 'string' | 'number' | 'boolean' = 'string'
  ): { value: any; isValid: boolean; error?: string } {
    const value = req.query[paramName as keyof SerialIdQueryOptions];

    if (value === undefined || value === null || value === '') {
      return {
        value: null,
        isValid: false,
        error: `${paramName} parameter is required`
      };
    }

    if (paramType === 'string') {
      const stringValue = String(value);
      if (!stringValue.trim()) {
        return {
          value: null,
          isValid: false,
          error: `${paramName} must be a non-empty string`
        };
      }
      return { value: stringValue.trim(), isValid: true };
    }

    if (paramType === 'boolean') {
      const boolValue = String(value).toLowerCase();
      if (boolValue !== 'true' && boolValue !== 'false') {
        return {
          value: null,
          isValid: false,
          error: `${paramName} must be true or false`
        };
      }
      return { value: boolValue === 'true', isValid: true };
    }

    if (paramType === 'number') {
      const numValue = parseInt(String(value), 10);
      if (isNaN(numValue)) {
        return {
          value: null,
          isValid: false,
          error: `${paramName} must be a valid number`
        };
      }
      return { value: numValue, isValid: true };
    }

    return { value, isValid: true };
  }

  /**
   * Build standardized query options from request - TYPE SAFE
   */
  protected buildQueryOptions(req: SerialIdEntityRequest): SerialIdQueryOptions {
    const { page, limit } = this.parsePaginationOptions(req);
    const { sortBy, sortOrder } = this.parseSortOptions(req);
    
    return {
      page,
      limit,
      search: req.query.search ? String(req.query.search).trim() : undefined,
      sortBy,
      sortOrder,
      isActive: this.parseBoolean(req.query.isActive, true)
    };
  }

  /**
   * Log request for debugging - TYPE SAFE
   */
  protected logRequest(req: SerialIdEntityRequest, endpoint: string): void {
    if (process.env.NODE_ENV === 'development') {
      const userId = req.user?.id;
      
      console.log(`[${this.config.entityName.toUpperCase()}] ${req.method} ${endpoint}`, {
        user: userId !== undefined ? userId.toString() : 'anonymous',
        query: req.query,
        body: req.method === 'POST' || req.method === 'PUT' ? req.body : undefined
      });
    }
  }
}

/**
 * Factory function to create a generic Serial ID controller
 */
export function createSerialIdController<T extends BaseSerialIdEntity>(
  service: ISerialIdService<T>,
  config: SerialIdEntityConfig
): GenericSerialIdController<T> {
  return new GenericSerialIdController<T>(service, config);
}

export default GenericSerialIdController;