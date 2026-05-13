// server/src/generic/entities/serial-id-entity/generic-routes.ts
// Updated Generic Serial ID Routes - Complete Separation Entity Architecture
// Enhanced with Health, Statistics, and Advanced Search Endpoints

import { Router, Request, Response, NextFunction } from 'express';
import {
  BaseSerialIdEntity,
  SerialIdEntityConfig,
  ISerialIdController
} from './generic-types';

// Import your FIXED core middleware
import {
  requireAuthentication,
  requireAdmin,
  requireManager,
  requireUser,
  validateSerialId,
  requestTracking
} from '../../../middleware/auth';

/**
 * Enhanced Generic Serial ID Routes Implementation
 * 
 * ✅ INCLUDES: All existing CRUD routes
 * ✅ ADDS: Health monitoring, statistics, and advanced search endpoints
 * ✅ MAINTAINS: Type safety and middleware integration
 * ✅ COMPATIBLE: With existing auth and session systems
 */
export class GenericSerialIdRoutes<T extends BaseSerialIdEntity> {
  protected controller: ISerialIdController;
  protected config: SerialIdEntityConfig;
  protected router: Router;

  constructor(controller: ISerialIdController, config: SerialIdEntityConfig) {
    this.controller = controller;
    this.config = config;
    this.router = Router();
    this.setupRoutes();
  }

  /**
   * Get the configured router
   */
  getRouter(): Router {
    return this.router;
  }

  /**
   * Setup all routes with enhanced endpoints
   */
  private setupRoutes(): void {
    // Apply request tracking to all routes
    this.router.use(requestTracking);

    // ==================== EXISTING CRUD ROUTES ====================

    /**
     * POST /api/{entity}
     * Create new entity (Manager+ role required)
     */
    this.router.post('/', 
      requireAuthentication,   // Your session-based auth
      requireManager,         // Your role-based access (manager+ can create)
      (req: Request, res: Response, next: NextFunction) => {
        this.controller.create(req as any, res, next);
      }
    );

    /**
     * GET /api/{entity}
     * Get all entities with pagination and filtering (User+ role required)
     */
    this.router.get('/', 
      requireAuthentication,   // Your session-based auth
      requireUser,            // Your role-based access (any authenticated user)
      (req: Request, res: Response, next: NextFunction) => {
        this.controller.getAll(req as any, res, next);
      }
    );

    // ==================== ENHANCED ROUTES (BEFORE :id ROUTES) ====================

    /**
     * GET /api/{entity}/health
     * Get entity health status (User+ role required)
     * No authentication required for health checks (monitoring systems)
     */
    this.router.get('/health',
      (req: Request, res: Response, next: NextFunction) => {
        this.controller.health(req as any, res, next);
      }
    );

    /**
     * GET /api/{entity}/statistics
     * Get comprehensive entity statistics (Manager+ role required)
     */
    this.router.get('/statistics',
      requireAuthentication,   // Your session-based auth
      requireManager,         // Manager+ can view statistics
      (req: Request, res: Response, next: NextFunction) => {
        this.controller.statistics(req as any, res, next);
      }
    );

    /**
     * GET /api/{entity}/search/name
     * Search entities by name (User+ role required)
     * Query params: name (required), page, limit, sortBy, sortOrder, isActive
     */
    this.router.get('/search/name',
      requireAuthentication,   // Your session-based auth
      requireUser,            // Any authenticated user can search
      (req: Request, res: Response, next: NextFunction) => {
        this.controller.getByName(req as any, res, next);
      }
    );

    /**
     * GET /api/{entity}/filter/status
     * Filter entities by active status (User+ role required)
     * Query params: status (required boolean), page, limit, sortBy, sortOrder
     */
    this.router.get('/filter/status',
      requireAuthentication,   // Your session-based auth
      requireUser,            // Any authenticated user can filter
      (req: Request, res: Response, next: NextFunction) => {
        this.controller.filterStatus(req as any, res, next);
      }
    );

    /**
     * GET /api/{entity}/search/pattern
     * Search entities by pattern in name or description (User+ role required)
     * Query params: pattern (required), page, limit, sortBy, sortOrder, isActive
     */
    this.router.get('/search/pattern',
      requireAuthentication,   // Your session-based auth
      requireUser,            // Any authenticated user can search
      (req: Request, res: Response, next: NextFunction) => {
        this.controller.search(req as any, res, next);
      }
    );

    /**
     * GET /api/{entity}/:id
     * Get entity by ID (User+ role required)
     */
    this.router.get('/:id',
      requireAuthentication,   // Your session-based auth
      requireUser,            // Your role-based access
      validateSerialId,       // Your parameter validation
      (req: Request, res: Response, next: NextFunction) => {
        this.controller.getById(req as any, res, next);
      }
    );

    /**
     * PUT /api/{entity}/:id
     * Update entity by ID (Manager+ role required)
     */
    this.router.put('/:id', 
      requireAuthentication,   // Your session-based auth
      requireManager,         // Your role-based access (manager+ can update)
      validateSerialId,       // Your parameter validation
      (req: Request, res: Response, next: NextFunction) => {
        this.controller.update(req as any, res, next);
      }
    );

    /**
     * DELETE /api/{entity}/:id
     * Change Status (soft delete) by ID (Manager+ role required)
     */
    this.router.delete('/:id', 
      requireAuthentication,   // Your session-based auth
      requireManager,         // Your role-based access  
      validateSerialId,       // Your parameter validation
      (req: Request, res: Response, next: NextFunction) => {
        this.controller.delete(req as any, res, next);
      }
    );

    /**
     * PATCH /api/{entity}/:id/status
     * Toggle entity status (Manager+ role required)
     */
    this.router.patch('/:id/status',
      requireAuthentication,
      requireManager,
      validateSerialId,
      (req, res, next) => this.controller.changeStatus(req as any, res, next)
    );

  }
}

/**
 * Factory function to create generic Serial ID routes with enhanced endpoints
 */
export function createSerialIdRoutes<T extends BaseSerialIdEntity>(
  controller: ISerialIdController,
  config: SerialIdEntityConfig
): Router {
  const routes = new GenericSerialIdRoutes<T>(controller, config);
  return routes.getRouter();
}

/**
 * Enhanced factory function with custom role configuration
 * Allows per-entity customization of role requirements including new endpoints
 */
export function createSerialIdRoutesWithRoles<T extends BaseSerialIdEntity>(
  controller: ISerialIdController,
  config: SerialIdEntityConfig,
  roleConfig?: {
    create?: typeof requireManager | typeof requireAdmin;
    read?: typeof requireUser | typeof requireManager | typeof requireAdmin;
    update?: typeof requireManager | typeof requireAdmin;
    delete?: typeof requireAdmin;
    statistics?: typeof requireManager | typeof requireAdmin;
    search?: typeof requireUser | typeof requireManager | typeof requireAdmin;
  }
): Router {
  const router = Router();
  
  // Apply request tracking to all routes
  router.use(requestTracking);

  // Use provided role config or defaults
  const roles = {
    create: roleConfig?.create || requireManager,
    read: roleConfig?.read || requireUser,
    update: roleConfig?.update || requireManager,
    delete: roleConfig?.delete || requireManager,
    statistics: roleConfig?.statistics || requireManager,
    search: roleConfig?.search || requireUser
  };

  // ==================== EXISTING CRUD ROUTES ====================
  
  router.post('/', 
    requireAuthentication, 
    roles.create, 
    (req, res, next) => controller.create(req as any, res, next)
  );

  router.get('/',
    requireAuthentication,
    roles.read,
    (req, res, next) => controller.getAll(req as any, res, next)
  );

  // ==================== ENHANCED ROUTES (BEFORE :id ROUTES) ====================

  // Health endpoint - no authentication required for monitoring systems
  router.get('/health',
    (req, res, next) => controller.health(req as any, res, next)
  );

  // Statistics endpoint - manager+ required
  router.get('/statistics',
    requireAuthentication,
    roles.statistics,
    (req, res, next) => controller.statistics(req as any, res, next)
  );

  // Search by name endpoint
  router.get('/search/name',
    requireAuthentication,
    roles.search,
    (req, res, next) => controller.getByName(req as any, res, next)
  );

  // Filter by status endpoint
  router.get('/filter/status',
    requireAuthentication,
    roles.search,
    (req, res, next) => controller.filterStatus(req as any, res, next)
  );

  // Search by pattern endpoint
  router.get('/search/pattern',
    requireAuthentication,
    roles.search,
    (req, res, next) => controller.search(req as any, res, next)
  );

  router.get('/:id',
    requireAuthentication,
    roles.read,
    validateSerialId,
    (req, res, next) => controller.getById(req as any, res, next)
  );

  router.put('/:id', 
    requireAuthentication, 
    roles.update, 
    validateSerialId, 
    (req, res, next) => controller.update(req as any, res, next)
  );

  router.delete('/:id', 
    requireAuthentication, 
    roles.delete, 
    validateSerialId, 
    (req, res, next) => controller.delete(req as any, res, next)
  );

  router.patch('/:id/status', 
    requireAuthentication, 
    roles.update, 
    validateSerialId, 
    (req, res, next) => controller.changeStatus(req as any, res, next));


  return router;
}

/**
 * Complete entity setup factory with service injection and enhanced endpoints
 */
export function setupSerialIdEntity<T extends BaseSerialIdEntity>(
  service: any,
  config: SerialIdEntityConfig,
  controllerClass: any,
  roleConfig?: {
    create?: typeof requireManager | typeof requireAdmin;
    read?: typeof requireUser | typeof requireManager | typeof requireAdmin;
    update?: typeof requireManager | typeof requireAdmin;
    delete?: typeof requireAdmin;
    statistics?: typeof requireManager | typeof requireAdmin;
    search?: typeof requireUser | typeof requireManager | typeof requireAdmin;
  }
): Router {
  // Create controller instance
  const controller = new controllerClass(service, config);
  
  // Create and return routes with role configuration
  return roleConfig 
    ? createSerialIdRoutesWithRoles<T>(controller, config, roleConfig)
    : createSerialIdRoutes<T>(controller, config);
}

export default GenericSerialIdRoutes;

 