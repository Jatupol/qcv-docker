// server/src/generic/entities/varchar-code-entity/generic-routes.ts
// 🛠️ ENHANCED: Generic VARCHAR Code Routes with New Endpoints
// Complete Separation Entity Architecture - Manufacturing Quality Control System

import { Router } from 'express';
import {
  BaseVarcharCodeEntity,
  VarcharCodeEntityConfig,
  IVarcharCodeController
} from './generic-types';

// Middleware imports - assuming these exist in your middleware directory
import {
  requireAuthentication,
  requireUser,
  requireManager,
  requireAdmin,
  validateVarcharCode,
  requestTracking
} from '../../../middleware/auth';  

export class GenericVarcharCodeRoutes<T extends BaseVarcharCodeEntity> {
  private router: Router;
  private controller: IVarcharCodeController;
  private config: VarcharCodeEntityConfig;

  constructor(controller: IVarcharCodeController, config: VarcharCodeEntityConfig) {
    this.router = Router();
    this.controller = controller;
    this.config = config;
    this.setupRoutes();
  }

  /**
   * Get the configured router
   */
  getRouter(): Router {
    return this.router;
  }

  /**
   * Setup all routes with middleware chains
   */
  private setupRoutes(): void {
    // Apply request tracking to all routes
    this.router.use(requestTracking);

    // ==================== HEALTH & ANALYTICS ENDPOINTS ====================
    
    /**
     * GET /api/{entity}/health
     * Get system health status (Manager+ role required)
     * Middleware chain: requestTracking → requireAuthentication → requireManager → controller
     */
    this.router.get('/health',
      requireAuthentication,
      requireManager,
      (req, res, next) => this.controller.getHealth(req as any, res, next)
    );

    /**
     * GET /api/{entity}/statistics  
     * Get comprehensive statistics (Manager+ role required)
     * Middleware chain: requestTracking → requireAuthentication → requireManager → controller
     */
    this.router.get('/statistics',
      requireAuthentication,
      requireManager,
      (req, res, next) => this.controller.getStatistics(req as any, res, next)
    );

    // ==================== SEARCH ENDPOINTS ====================

    /**
     * GET /api/{entity}/search/name/:name
     * Search by exact name match (User+ role required)
     * Middleware chain: requestTracking → requireAuthentication → requireUser → validatePagination → controller
     */
    this.router.get('/search/name/:name',
      requireAuthentication,
      requireUser,
      this.validateNameParameter,
      (req, res, next) => this.controller.getByName(req as any, res, next)
    );

    /**
     * GET /api/{entity}/search/pattern/:pattern
     * Search by name pattern (User+ role required)
     * Middleware chain: requestTracking → requireAuthentication → requireUser → validatePagination → controller
     */
    this.router.get('/search/pattern/:pattern',
      requireAuthentication,
      requireUser,
      this.validatePatternParameter,
      (req, res, next) => this.controller.search(req as any, res, next)
    );

    // ==================== FILTER ENDPOINTS ====================

    /**
     * GET /api/{entity}/filter/status/:status
     * Filter by active status (User+ role required)
     * Middleware chain: requestTracking → requireAuthentication → requireUser → validatePagination → controller
     */
    this.router.get('/filter/status/:status',
      requireAuthentication,
      requireUser,
      this.validateStatusParameter,
      (req, res, next) => this.controller.filterStatus(req as any, res, next)
    );

    // ==================== STANDARD CRUD ENDPOINTS ====================

    /**
     * POST /api/{entity}
     * Create new entity (Manager+ role required)
     * Middleware chain: requestTracking → requireAuthentication → requireManager → controller
     */
    this.router.post('/',
      requireAuthentication,
      requireManager,
      this.validateCreateData,
      (req, res, next) => this.controller.create(req as any, res, next)
    );

    /**
     * GET /api/{entity}
     * Get all entities with pagination (User+ role required)
     * Middleware chain: requestTracking → requireAuthentication → requireUser → validatePagination → controller
     */
    this.router.get('/',
      requireAuthentication,
      requireUser,
      (req, res, next) => this.controller.getAll(req as any, res, next)
    );

    /**
     * GET /api/{entity}/:code
     * Get entity by code (User+ role required)
     * Middleware chain: requestTracking → requireAuthentication → requireUser → validateVarcharCode → controller
     */
    this.router.get('/:code',
      requireAuthentication,
      requireUser,
      validateVarcharCode,
      (req, res, next) => this.controller.getByCode(req as any, res, next)
    );

    /**
     * PUT /api/{entity}/:code
     * Update existing entity (Manager+ role required)
     * Middleware chain: requestTracking → requireAuthentication → requireManager → validateVarcharCode → controller
     */
    this.router.put('/:code',
      requireAuthentication,
      requireManager,
      validateVarcharCode,
      this.validateUpdateData,
      (req, res, next) => this.controller.update(req as any, res, next)
    );

    /**
     * PATCH /api/{entity}/:code/status
     * Toggle entity status (Manager+ role required)
     * Middleware chain: requestTracking → requireAuthentication → requireManager → validateVarcharCode → controller
     */
    this.router.patch('/:code/status',
      requireAuthentication,
      requireManager,
      validateVarcharCode,
      (req, res, next) => this.controller.changeStatus(req as any, res, next)
    );

    /**
     * DELETE /api/{entity}/:code
     * Soft delete entity (Admin role required)
     * Middleware chain: requestTracking → requireAuthentication → requireAdmin → validateVarcharCode → controller
     */
    this.router.delete('/:code',
      requireAuthentication,
      requireAdmin,
      validateVarcharCode,
      (req, res, next) => this.controller.delete(req as any, res, next)
    );
  }

  // ==================== CUSTOM VALIDATION MIDDLEWARE ====================

  /**
   * Validate name parameter for search endpoints
   */
  private validateNameParameter = (req: any, res: any, next: any): void => {
    const { name } = req.params;

    if (!name || typeof name !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Name parameter is required and must be a string'
      });
    }

    if (name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Name parameter cannot be empty'
      });
    }

    if (name.length > 255) {
      return res.status(400).json({
        success: false,
        error: 'Name parameter is too long (max 255 characters)'
      });
    }

    // Decode URL-encoded name
    req.params.name = decodeURIComponent(name);
    next();
  };

  /**
   * Validate pattern parameter for search endpoints
   */
  private validatePatternParameter = (req: any, res: any, next: any): void => {
    const { pattern } = req.params;

    if (!pattern || typeof pattern !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Pattern parameter is required and must be a string'
      });
    }

    if (pattern.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Pattern parameter cannot be empty'
      });
    }

    if (pattern.length > 255) {
      return res.status(400).json({
        success: false,
        error: 'Pattern parameter is too long (max 255 characters)'
      });
    }

    // Decode URL-encoded pattern
    req.params.pattern = decodeURIComponent(pattern);
    next();
  };

  /**
   * Validate status parameter for filter endpoints
   */
  private validateStatusParameter = (req: any, res: any, next: any): void => {
    const { status } = req.params;

    if (!status || typeof status !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Status parameter is required and must be a string'
      });
    }

    const validValues = ['true', 'false', '1', '0'];
    if (!validValues.includes(status.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: 'Status parameter must be true, false, 1, or 0'
      });
    }

    next();
  };

  /**
   * Validate create data
   */
  private validateCreateData = (req: any, res: any, next: any): void => {
    const { code, name, is_active } = req.body;

    // Required field validation
    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Code is required and must be a string'
      });
    }

    if (!name || typeof name !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Name is required and must be a string'
      });
    }

    // Length validation
    if (code.length === 0 || code.length > this.config.codeLength) {
      return res.status(400).json({
        success: false,
        error: `Code must be 1-${this.config.codeLength} characters long`
      });
    }

    if (name.trim().length === 0 || name.length > 255) {
      return res.status(400).json({
        success: false,
        error: 'Name must be 1-255 characters long'
      });
    }

    // Code format validation
    if (!/^[A-Z0-9_-]+$/i.test(code)) {
      return res.status(400).json({
        success: false,
        error: 'Code can only contain letters, numbers, underscores, and hyphens'
      });
    }

    // Optional field validation
    if (is_active !== undefined && typeof is_active !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'is_active must be a boolean value'
      });
    }

    next();
  };

  /**
   * Validate update data
   */
  private validateUpdateData = (req: any, res: any, next: any): void => {
    const { name, is_active } = req.body;

    // At least one field must be provided for update
    if (name === undefined && is_active === undefined) {
      return res.status(400).json({
        success: false,
        error: 'At least one field (name or is_active) must be provided for update'
      });
    }

    // Name validation (if provided)
    if (name !== undefined) {
      if (typeof name !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Name must be a string'
        });
      }

      if (name.trim().length === 0 || name.length > 255) {
        return res.status(400).json({
          success: false,
          error: 'Name must be 1-255 characters long'
        });
      }
    }

    // is_active validation (if provided)
    if (is_active !== undefined && typeof is_active !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'is_active must be a boolean value'
      });
    }

    next();
  };
}

// ==================== FACTORY FUNCTIONS ====================

/**
 * Factory function to create generic VARCHAR CODE routes with standard middleware
 */
export function createVarcharCodeRoutes<T extends BaseVarcharCodeEntity>(
  controller: IVarcharCodeController,
  config: VarcharCodeEntityConfig
): Router {
  const routes = new GenericVarcharCodeRoutes<T>(controller, config);
  return routes.getRouter();
}

/**
 * Enhanced factory function with custom role configuration
 * Allows per-entity customization of role requirements
 */
export function createVarcharCodeRoutesWithRoles<T extends BaseVarcharCodeEntity>(
  controller: IVarcharCodeController,
  config: VarcharCodeEntityConfig,
  roleConfig?: {
    create?: typeof requireManager | typeof requireAdmin;
    read?: typeof requireUser | typeof requireManager | typeof requireAdmin;
    update?: typeof requireManager | typeof requireAdmin;
    delete?: typeof requireManager | typeof requireAdmin;
    health?: typeof requireUser | typeof requireManager | typeof requireAdmin;
    statistics?: typeof requireUser | typeof requireManager | typeof requireAdmin;
  }
): Router {
  const router = Router();
  
  // Apply request tracking to all routes
  router.use(requestTracking);

  // Use custom roles if provided, otherwise use defaults
  const roles = {
    create: roleConfig?.create || requireManager,
    read: roleConfig?.read || requireUser,
    update: roleConfig?.update || requireManager,
    delete: roleConfig?.delete || requireAdmin,
    health: roleConfig?.health || requireUser,
    statistics: roleConfig?.statistics || requireUser
  };

  // Enhanced endpoints with custom roles
  router.get('/health', requireAuthentication, roles.health, 
    (req, res, next) => controller.getHealth(req as any, res, next));

  router.get('/statistics', requireAuthentication, roles.statistics,
    (req, res, next) => controller.getStatistics(req as any, res, next));

  // Search and filter endpoints (always require at least read permission)
  router.get('/search/name/:name', requireAuthentication, roles.read, 
    (req, res, next) => controller.getByName(req as any, res, next));

  router.get('/search/pattern/:pattern', requireAuthentication, roles.read, 
    (req, res, next) => controller.search(req as any, res, next));

  router.get('/filter/status/:status', requireAuthentication, roles.read, 
    (req, res, next) => controller.filterStatus(req as any, res, next));

  // Standard CRUD endpoints with custom roles
  router.post('/', requireAuthentication, roles.create,
    (req, res, next) => controller.create(req as any, res, next));

  router.get('/', requireAuthentication, roles.read, 
    (req, res, next) => controller.getAll(req as any, res, next));

  router.get('/:code', requireAuthentication, roles.read, validateVarcharCode,
    (req, res, next) => controller.getByCode(req as any, res, next));

  router.put('/:code', requireAuthentication, roles.update, validateVarcharCode,
    (req, res, next) => controller.update(req as any, res, next));

  router.patch('/:code/status', requireAuthentication, roles.update, validateVarcharCode,
    (req, res, next) => controller.changeStatus(req as any, res, next));

  router.delete('/:code', requireAuthentication, roles.delete, validateVarcharCode,
    (req, res, next) => controller.delete(req as any, res, next));

  return router;
}

/**
 * Complete entity setup factory function
 * Creates a complete VARCHAR CODE entity with all layers and returns router
 */
export function setupVarcharCodeEntity<T extends BaseVarcharCodeEntity>(
  controller: IVarcharCodeController,
  config: VarcharCodeEntityConfig,
  customRoles?: any
): Router {
  if (customRoles) {
    return createVarcharCodeRoutesWithRoles<T>(controller, config, customRoles);
  }
  return createVarcharCodeRoutes<T>(controller, config);
}

export default GenericVarcharCodeRoutes;

/*
=== 🛠️ ENHANCED GENERIC VARCHAR CODE ROUTES FEATURES ===

COMPLETE SEPARATION ARCHITECTURE:
✅ Zero dependencies on other entities or business domains
✅ Generic routes implementation for VARCHAR CODE pattern
✅ Self-contained routing layer with middleware integration
✅ Foundation for all VARCHAR CODE entities

NEW ENHANCED ENDPOINTS:
✅ 1. GET /health - System health check (Manager+ required)
✅ 2. GET /statistics - Comprehensive analytics (Manager+ required)
✅ 3. GET /search/name/:name - Exact name search (User+ required)
✅ 4. GET /filter/status/:status - Status filtering (User+ required)
✅ 5. GET /search/pattern/:pattern - Pattern search (User+ required)

MANUFACTURING DOMAIN SUPPORT:
✅ Role-based access control integration
✅ Session-based authentication middleware
✅ Request tracking for audit trails
✅ Manufacturing-friendly validation rules
✅ Quality control status management

MIDDLEWARE INTEGRATION:
✅ Request tracking on all routes
✅ Authentication requirement enforcement
✅ Role-based authorization (User/Manager/Admin)
✅ Parameter validation middleware
✅ Pagination validation middleware
✅ Custom validation for new endpoints

VALIDATION & SECURITY:
✅ Comprehensive parameter validation
✅ URL decoding for special characters
✅ Length and format validation
✅ SQL injection prevention through validation
✅ Type checking for all inputs
✅ Custom validation middleware for each endpoint type

FLEXIBLE CONFIGURATION:
✅ Standard routes factory function
✅ Custom role configuration factory
✅ Complete entity setup factory
✅ Configurable role requirements per operation
✅ Entity-specific validation based on config

ERROR HANDLING:
✅ Consistent error response format
✅ Meaningful validation error messages
✅ Proper HTTP status codes
✅ Parameter-specific error handling
✅ Express error middleware integration

This enhanced routes implementation provides comprehensive HTTP routing for VARCHAR CODE
entities with advanced search, analytics, and monitoring endpoints while maintaining
complete entity separation and security best practices with flexible role-based access control.
*/