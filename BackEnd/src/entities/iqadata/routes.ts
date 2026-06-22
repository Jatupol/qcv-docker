// server/src/entities/iqadata/routes.ts
/**
 * IQA Data Entity Routes - SPECIAL Pattern Implementation
 * Manufacturing Quality Control System - Bulk Import & Analytics
 */

import { Router, Request, Response, NextFunction } from 'express';

import { IQADataController } from './controller';
import { IQADataService } from './service';
import { createIQADataModel } from './model';
import { getDrizzle } from '../../config/database';

// Import middleware
import {
  requireAuthentication,
  requireUser,
  requireManager,
  requireAdmin,
  requestTracking
} from '../../middleware/auth';

// ==================== IQA DATA ROUTES CLASS ====================

/**
 * IQA Data Entity Routes - extends Router for HTTP routing
 * with custom bulk import endpoints
 */
export class IQADataRoutes {
  public router: Router;
  private controller: IQADataController;

  constructor(controller: IQADataController) {
    this.router = Router();
    this.controller = controller;
    this.initializeRoutes();
  }

  /**
   * Initialize all IQA data routes
   */
  private initializeRoutes(): void {
    // Apply middleware stack
    this.router.use(requestTracking);

    // ==================== HEALTH & MONITORING ====================

    /**
     * GET /api/iqadata/health
     * Health check endpoint
     */
    this.router.get('/health',
      requireAuthentication,
      (req: Request, res: Response, next: NextFunction) => {
        this.controller.getHealth(req as any, res, next);
      }
    );

    /**
     * GET /api/iqadata/statistics
     * Get IQA data statistics
     */
    this.router.get('/statistics',
      requireAuthentication,
      requireManager,
      (req: Request, res: Response, next: NextFunction) => {
        this.controller.getStatistics(req as any, res, next);
      }
    );

    // ==================== CUSTOM ROUTES (BEFORE GENERIC ROUTES) ====================

    /**
     * GET /api/iqadata/distinct-fy
     * Get distinct FY values for filter dropdown
     */
    this.router.get('/distinct-fy',
      requireAuthentication,
      requireUser,
      (req: Request, res: Response, next: NextFunction) => {
        this.controller.getDistinctFY(req as any, res, next);
      }
    );

    /**
     * GET /api/iqadata/distinct-ww
     * Get distinct WW values for filter dropdown
     */
    this.router.get('/distinct-ww',
      requireAuthentication,
      requireUser,
      (req: Request, res: Response, next: NextFunction) => {
        this.controller.getDistinctWW(req as any, res, next);
      }
    );

    /**
     * POST /api/iqadata/bulk
     * Bulk import IQA data from Excel
     */
    this.router.post('/bulk',
      requireAuthentication,
      requireUser,
      (req: Request, res: Response, next: NextFunction) => {
        this.controller.bulkImport(req as any, res, next);
      }
    );

    /**
     * POST /api/iqadata/upsert
     * Upsert (Insert or Update) IQA data from Excel
     * RULE 1: If data in all columns is same as existing, update it
     * RULE 2: Do not insert record if first column (FW) is blank or null
     */
    this.router.post('/upsert',
      requireAuthentication,
      requireUser,
      (req: Request, res: Response, next: NextFunction) => {
        this.controller.upsert(req as any, res, next);
      }
    );

    /**
     * DELETE /api/iqadata/all
     * Delete all IQA data records
     */
    this.router.delete('/all',
      requireAuthentication,
      requireAdmin,
      (req: Request, res: Response, next: NextFunction) => {
        this.controller.deleteAll(req as any, res, next);
      }
    );

    /**
     * POST /api/iqadata/bulk-delete
     * Bulk delete IQA data records by IDs
     */
    this.router.post('/bulk-delete',
      requireAuthentication,
      requireManager,
      (req: Request, res: Response, next: NextFunction) => {
        this.controller.bulkDelete(req as any, res, next);
      }
    );

    // ==================== CRUD OPERATIONS ====================

    /**
     * GET /api/iqadata
     * Get all IQA data
     */
    this.router.get('/',
      requireAuthentication,
      requireUser,
      (req: Request, res: Response, next: NextFunction) => {
        this.controller.getAll(req as any, res, next);
      }
    );

    /**
     * GET /api/iqadata/:id
     * Get IQA data by id
     */
    this.router.get('/:id',
      requireAuthentication,
      requireUser,
      (req: Request, res: Response, next: NextFunction) => {
        this.controller.getByKey(req as any, res, next);
      }
    );

    /**
     * POST /api/iqadata
     * Create new IQA data
     */
    this.router.post('/',
      requireAuthentication,
      requireUser,
      (req: Request, res: Response, next: NextFunction) => {
        this.controller.create(req as any, res, next);
      }
    );

    /**
     * PUT /api/iqadata/:id
     * Update IQA data by id
     */
    this.router.put('/:id',
      requireAuthentication,
      requireUser,
      (req: Request, res: Response, next: NextFunction) => {
        this.controller.update(req as any, res, next);
      }
    );

    /**
     * DELETE /api/iqadata/:id
     * Delete IQA data by id
     */
    this.router.delete('/:id',
      requireAuthentication,
      requireManager,
      (req: Request, res: Response, next: NextFunction) => {
        this.controller.delete(req as any, res, next);
      }
    );
  }
}

// ==================== FACTORY FUNCTIONS ====================

/**
 * Factory function to create IQA Data routes
 */
export function createIQADataRoutes(_db?: any): Router {
  // Create entity stack with Drizzle
  const model = createIQADataModel(getDrizzle());
  const service = new IQADataService(model as any);
  const controller = new IQADataController(service);
  const routes = new IQADataRoutes(controller);

  return routes.router;
}

/**
 * Factory function to create IQA Data routes with controller
 */
export function createIQADataRoutesWithController(controller: IQADataController): Router {
  const routes = new IQADataRoutes(controller);
  return routes.router;
}

/**
 * Default export function for auto-discovery
 * This function is called by the entity auto-discovery system
 */
export default function createIQADataRouter(_db?: any): Router {
  return createIQADataRoutes(getDrizzle());
}
