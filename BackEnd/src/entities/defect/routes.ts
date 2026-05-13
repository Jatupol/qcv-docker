// server/src/entities/defect/routes.ts
/**
 * FIXED: Defect Entity Routes - Complete Separation Entity Architecture
 * Manufacturing Quality Control System - SERIAL ID Pattern
 * 
 * ✅ IMPLEMENTS: Customer routes following Generic Serial ID pattern
 * ✅ PROVIDES: HTTP endpoint definitions for defect entity
 * ✅ INCLUDES: Main factory function for defect routes with controller
 * ✅ AUTO-DISCOVERS: Complete entity stack configuration
 * ✅ NO CONFLICTS: Eliminates route conflict issues
 * ✅ STANDARD EXPRESS: All route handlers use standard Express Request type
 * ✅ COMPOSITION: Setup all routes using composition approach
 * ✅ ONLY EXISTING METHODS: Uses only methods that actually exist in controller
 */

import { Router, Request, Response, NextFunction } from 'express';
import {
  createSerialIdRoutes
} from '../../generic/entities/serial-id-entity/generic-routes';

import {
  Defect,
  DEFAULT_DEFECT_CONFIG
} from './types';

import { DefectController } from './controller';
import { DefectService } from './service';
import { createDefectModel } from './model';
import { getDrizzle } from '../../config/database';

// Import core middleware
import {
  requireAuthentication,
  requireAdmin,
  requireManager,
  requireUser,
  validateSerialId,
  requestTracking
} from '../../middleware/auth';

// ==================== MAIN FACTORY FUNCTION (AUTO-DISCOVERY COMPATIBLE) ====================

/**
 * Create defect routes with complete entity stack auto-discovery
 * ✅ AUTO-DISCOVERS: Complete entity stack configuration
 * ✅ NO CONFLICTS: Eliminates route conflict issues through proper ordering
 * ✅ ONLY USES: Methods that actually exist in the DefectController
 * 
 * @param db - Database pool instance
 * @returns Express router with defect routes
 */
export default function createDefectRoutes(_db?: any): Router {
  const router = Router();

  // Configure entity stack with Drizzle (db param ignored for backward compatibility)
  const defectModel = createDefectModel(getDrizzle());
  const defectService = new DefectService(defectModel as any);
  const defectController = new DefectController(defectService);

  // Apply request tracking to all routes
  router.use(requestTracking);

  // ==================== STEP 1: DEFECT-SPECIFIC ROUTES FIRST (PREVENT CONFLICTS) ====================
  
  /**
   * GET /api/defects/validate/name/:name
   * Validate defect name uniqueness
   * ✅ USES EXISTING METHOD: defectController.validateNameUnique
   * ✅ BEFORE generic routes to prevent /:id conflicts
   */
  router.get('/validate/name/:name',
    requireAuthentication,
    requireUser,
    validateDefectName,
    (req: Request, res: Response, next: NextFunction) => {
      defectController.validateNameUnique(req as any, res, next);
    }
  );

  /**
   * GET /api/defects/validate/name/:name/:excludeId
   * Validate defect name uniqueness excluding specific ID
   * ✅ USES EXISTING METHOD: defectController.validateNameUnique
   * ✅ BEFORE generic routes to prevent /:id conflicts
   */
  router.get('/validate/name/:name/:excludeId',
    requireAuthentication,
    requireUser,
    validateDefectName,
    validateExcludeId,
    (req: Request, res: Response, next: NextFunction) => {
      defectController.validateNameUnique(req as any, res, next);
    }
  );

  // ==================== STEP 2: GENERIC ROUTES LAST (COMPOSITION APPROACH) ====================
  
  /**
   * Setup generic SERIAL ID entity routes using factory function
   * ✅ MOUNTED LAST to prevent route conflicts
   * ✅ PROVIDES: Standard CRUD operations (POST /, GET /, GET /:id, PUT /:id, DELETE /:id)
   * ✅ INCLUDES: Enhanced routes (health, statistics, search endpoints)
   * ✅ USES INHERITED METHODS: All methods inherited from GenericSerialIdController
   * 
   * Inherited methods from GenericSerialIdController:
   * - create(req, res, next) - POST /api/defects
   * - getById(req, res, next) - GET /api/defects/:id  
   * - update(req, res, next) - PUT /api/defects/:id
   * - delete(req, res, next) - DELETE /api/defects/:id
   * - getAll(req, res, next) - GET /api/defects
   */
  const genericRouter = createSerialIdRoutes<Defect>(defectController, DEFAULT_DEFECT_CONFIG);
  router.use('/', genericRouter);

  return router;
}

// ==================== ADDITIONAL FACTORY FUNCTIONS ====================

/**
 * Factory function for defect routes with existing controller
 * ✅ MAIN FACTORY: For use with existing controller instances
 * 
 * @param controller - DefectController instance
 * @returns Express router with defect routes
 */
export function createDefectRoutesWithController(controller: DefectController): Router {
  const router = Router();

  // Apply request tracking
  router.use(requestTracking);

  // Setup defect-specific routes first (only existing methods)
  setupDefectSpecificRoutes(router, controller);

  // Add generic routes last
  const genericRouter = createSerialIdRoutes<Defect>(controller, DEFAULT_DEFECT_CONFIG);
  router.use('/', genericRouter);

  return router;
}

/**
 * Advanced defect routes factory with custom role configuration
 * 
 * @param controller - DefectController instance
 * @param customRoles - Custom role requirements
 * @returns Express router with custom role configuration
 */
export function createDefectRoutesWithCustomRoles(
  controller: DefectController,
  customRoles?: {
    create?: typeof requireManager | typeof requireAdmin;
    read?: typeof requireUser | typeof requireManager | typeof requireAdmin;
    update?: typeof requireManager | typeof requireAdmin;
    delete?: typeof requireAdmin;
    statistics?: typeof requireManager | typeof requireAdmin;
    search?: typeof requireUser | typeof requireManager | typeof requireAdmin;
  }
): Router {
  const router = Router();
  router.use(requestTracking);

  // Setup defect-specific routes with custom roles
  setupDefectSpecificRoutesWithRoles(router, controller, customRoles);

  // Add generic routes with default configuration (custom roles would need more implementation)
  const genericRouter = createSerialIdRoutes<Defect>(controller, DEFAULT_DEFECT_CONFIG);
  router.use('/', genericRouter);

  return router;
}

/**
 * Complete entity factory function (backward compatibility)
 * Returns full entity stack for complex setups
 */
export function createDefectEntity(_db?: any): {
  model: any;
  service: DefectService;
  controller: DefectController;
  routes: Router;
} {
  // Create entity stack with Drizzle
  const model = createDefectModel(getDrizzle());
  const service = new DefectService(model as any);
  const controller = new DefectController(service);
  const routes = createDefectRoutesWithController(controller);

  return {
    model,
    service,
    controller,
    routes
  };
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Setup defect-specific routes for reuse (only existing methods)
 */
function setupDefectSpecificRoutes(router: Router, controller: DefectController): void {
  
  // Name validation routes (using existing validateNameUnique method)
  router.get('/validate/name/:name', 
    requireAuthentication, 
    requireUser, 
    validateDefectName,
    (req: Request, res: Response, next: NextFunction) => {
      controller.validateNameUnique(req as any, res, next);
    }
  );

  router.get('/validate/name/:name/:excludeId', 
    requireAuthentication, 
    requireUser, 
    validateDefectName,
    validateExcludeId,
    (req: Request, res: Response, next: NextFunction) => {
      controller.validateNameUnique(req as any, res, next);
    }
  );
}

/**
 * Setup defect-specific routes with custom roles (only existing methods)
 */
function setupDefectSpecificRoutesWithRoles(
  router: Router, 
  controller: DefectController, 
  customRoles?: any
): void {
  const roles = {
    read: customRoles?.read || requireUser,
    search: customRoles?.search || requireUser
  };

  // Apply same route setup but with custom roles
  router.get('/validate/name/:name', 
    requireAuthentication, 
    roles.search,
    validateDefectName,
    (req: Request, res: Response, next: NextFunction) => {
      controller.validateNameUnique(req as any, res, next);
    }
  );

  router.get('/validate/name/:name/:excludeId', 
    requireAuthentication, 
    roles.search,
    validateDefectName,
    validateExcludeId,
    (req: Request, res: Response, next: NextFunction) => {
      controller.validateNameUnique(req as any, res, next);
    }
  );
}

// ==================== VALIDATION MIDDLEWARE ====================

/**
 * Validate defect name parameter
 */
function validateDefectName(req: Request, res: Response, next: NextFunction): void {
  const name = req.params.name;
  
  if (!name || name.trim().length === 0) {
    res.status(400).json({
      success: false,
      error: 'Defect name is required'
    });
    return;
  }
  
  if (name.length > 100) {
    res.status(400).json({
      success: false,
      error: 'Defect name too long (max 100 characters)'
    });
    return;
  }
  
  next();
}

/**
 * Validate exclude ID parameter
 */
function validateExcludeId(req: Request, res: Response, next: NextFunction): void {
  const excludeId = req.params.excludeId;
  
  if (excludeId && (isNaN(parseInt(excludeId)) || parseInt(excludeId) <= 0)) {
    res.status(400).json({
      success: false,
      error: 'Invalid exclude ID parameter'
    });
    return;
  }
  
  next();
}

 