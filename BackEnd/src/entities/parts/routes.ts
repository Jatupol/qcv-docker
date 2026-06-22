// server/src/entities/parts/routes.ts
/**
 * SIMPLIFIED: Parts Entity Routes - Special Pattern Implementation
 * Sampling Inspection Control System - Simple CRUD with Special Pattern
 */

import { Router, Request, Response, NextFunction } from 'express';


import { PartsController } from './controller';
import { PartsService } from './service';
import { createPartsModel } from './model';
import { getDrizzle } from '../../config/database';

// Import authentication middleware
import {
  requireAuthentication,
  requireAdmin,
  requireManager,
  requireUser,
  requestTracking
} from '../../middleware/auth';

// ==================== SIMPLE PARTS ROUTES ====================

/**
 * Simple Parts Routes Class - Basic CRUD with authentication
 */
export class PartsRoutes {

  private router: Router;
  private controller: PartsController;

  constructor(controller: PartsController) {
    this.router = Router();
    this.controller = controller;
    this.setupRoutes();
  }

  /**
   * Get the configured router
   */
  getRouter(): Router {
    return this.router;
  }

  /**
   * Setup all parts routes
   */
  private setupRoutes(): void {
    this.router.use(requestTracking);

    // ==================== HEALTH & MONITORING ====================

    /**
     * GET /api/parts/health
     * Health check endpoint
     */
    this.router.get('/health',
      requireAuthentication,
      (req: Request, res: Response, next: NextFunction) => {
        this.controller.getHealth(req as any, res, next);
      }
    );

    /**
     * GET /api/parts/statistics
     * Get parts statistics
     */
    this.router.get('/statistics',
      requireAuthentication,
      requireManager,
      (req: Request, res: Response, next: NextFunction) => {
        this.controller.getStatistics(req as any, res, next);
      }
    );

    /**
     * GET /api/parts/customer-sites
     * Get available customer-sites for parts form
     */
    this.router.get('/customer-sites',
      requireAuthentication,
      requireUser,
      (req: Request, res: Response, next: NextFunction) => {
        this.controller.getCustomerSites(req as any, res, next);
      }
    );

    // ==================== CRUD OPERATIONS ====================

    /**
     * GET /api/parts
     * Get all parts
     */
    this.router.get('/',
      requireAuthentication,
      requireUser,
      (req: Request, res: Response, next: NextFunction) => {
        this.controller.getAll(req as any, res, next);
      }
    );

    /**
     * GET /api/parts/:partno
     * Get part by partno
     */
    this.router.get('/:partno',
      requireAuthentication,
      requireUser,
      (req: Request, res: Response, next: NextFunction) => {
        this.controller.getByKey(req as any, res, next);
      }
    );

    /**
     * POST /api/parts
     * Create new part (Manager+ required)
     */
    this.router.post('/',
      requireAuthentication,
      requireManager,
      (req: Request, res: Response, next: NextFunction) => {
        this.controller.create(req as any, res, next);
      }
    );

    /**
     * POST /api/parts/import
     * Create new part (Manager+ required)
     */
    this.router.post('/import',
      requireAuthentication,
      requireManager,
      (req: Request, res: Response, next: NextFunction) => {
        this.controller.import(req as any, res, next);
      }
    );

    /**
     * PUT /api/parts/:partno
     * Update part by partno (Manager+ required)
     */
    this.router.put('/:partno',
      requireAuthentication,
      requireManager,
      (req: Request, res: Response, next: NextFunction) => {
        this.controller.update(req as any, res, next);
      }
    );

    /**
     * DELETE /api/parts/:partno
     * Delete part by partno (Admin required)
     */
    this.router.delete('/:partno',
      requireAuthentication,
      requireAdmin,
      (req: Request, res: Response, next: NextFunction) => {
        this.controller.delete(req as any, res, next);
      }
    );
  }
}

// ==================== FACTORY FUNCTIONS ====================

/**
 * Factory function to create Parts routes with controller
 */
export function createPartsRoutesWithController(controller: PartsController): Router {
  const partsRoutes = new PartsRoutes(controller);
  return partsRoutes.getRouter();
}

/**
 * Default export function for auto-discovery compatibility
 * Creates the full entity stack and returns the router
 */
export default function(_db?: any): Router {
  // Create the entity stack with Drizzle
  const partsModel = createPartsModel(getDrizzle());
  const partsService = new PartsService(partsModel as any);
  const partsController = new PartsController(partsService);

  // Use the factory function
  return createPartsRoutesWithController(partsController);
}

/**
 * Factory function to create complete Parts routes
 */
export function createpartsRoutes(_db?: any): Router {
  // Create entity stack with Drizzle
  const partsModel = createPartsModel(getDrizzle());
  const partsService = new PartsService(partsModel as any);
  const partsController = new PartsController(partsService);

  return createPartsRoutesWithController(partsController);
}

/**
 * Create complete entity stack for advanced usage
 */
export function createPartsEntity(_db?: any): {
  model: any;
  service: PartsService;
  controller: PartsController;
  routes: Router;
} {
  // Create entity stack with Drizzle
  const model = createPartsModel(getDrizzle());
  const service = new PartsService(model as any);
  const controller = new PartsController(service);
  const routes = new PartsRoutes(controller);

  return {
    model,
    service,
    controller,
    routes: routes.getRouter()
  };
}