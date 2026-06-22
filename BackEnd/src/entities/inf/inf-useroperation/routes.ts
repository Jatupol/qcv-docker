// server/src/entities/inf/inf-useroperation/routes.ts
// ===== INF USER OPERATION ROUTES =====
// Essential Endpoints for User Operation Data and MSSQL Sync
// User/Operator Management Interface

import { Router, Request, Response, NextFunction } from 'express';

import { InfUserOperationController } from './controller';
import { InfUserOperationService } from './service';
import { createInfUserOperationModel } from './model';
import { getDrizzle } from '../../../config/database';

/**
 * Create INF User Operation routes with all necessary endpoints
 */
export default function createInfUserOperationRoutes(_db?: any): Router {
  const router = Router();

  // Create entity stack with Drizzle
  const drizzleDb = getDrizzle();
  const model = createInfUserOperationModel(drizzleDb);
  const service = new InfUserOperationService(model as any, drizzleDb.$client);
  const controller = new InfUserOperationController(service);

  // ==================== CORE DATA ENDPOINTS ====================
  // NOTE: Specific routes MUST come BEFORE generic /:username route to prevent conflicts

  /**
   * GET /api/inf-useroperation/statistics
   * Get statistics for dashboard
   */
  router.get('/statistics',
    (req: Request, res: Response, next: NextFunction) => {
      controller.getStatistics(req, res, next);
    }
  );

  /**
   * GET /api/inf-useroperation/filter-options
   * Get filter options for dropdowns
   */
  router.get('/filter-options',
    (req: Request, res: Response, next: NextFunction) => {
      controller.getFilterOptions(req, res, next);
    }
  );

  /**
   * GET /api/inf-useroperation/health
   * Health check endpoint
   */
  router.get('/health',
    (req: Request, res: Response, next: NextFunction) => {
      controller.healthCheck(req, res, next);
    }
  );

  /**
   * GET /api/inf-useroperation/test
   * Simple test endpoint to verify route is working
   */
  router.get('/test',
    (req: Request, res: Response) => {
      res.json({
        success: true,
        message: 'inf-useroperation routes are working!',
        timestamp: new Date().toISOString(),
        route: '/api/inf-useroperation/test'
      });
    }
  );

  /**
   * GET /api/inf-useroperation
   * Get all records with filtering and pagination
   */
  router.get('/',
    (req: Request, res: Response, next: NextFunction) => {
      controller.getAll(req, res, next);
    }
  );

  // ==================== SYNC ENDPOINTS ====================

  /**
   * POST /api/inf-useroperation/sync
   * Manually sync data from MSSQL database
   * NOTE: This MUST be registered BEFORE the /:username route
   */
  router.post('/sync',
    (req: Request, res: Response, next: NextFunction) => {
      controller.sync(req, res, next);
    }
  );


  /**
   * GET /api/inf-useroperation/:line_no_id
   * Get record by line_no_id
   * NOTE: This MUST be registered AFTER all specific routes (statistics, filter-options, health, sync)
   */
  router.get('/:line_no_id',
    (req: Request, res: Response, next: NextFunction) => {
      controller.getByLineNoId(req, res, next);
    }
  );

  return router;
}
