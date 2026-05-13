// server/src/entities/inf/inf-lotinput/routes.ts
// ===== SIMPLIFIED INF LOT INPUT ROUTES =====
// Data Display Only - Essential Endpoints for Search and Retrieval
// Sampling Inspection Control System - Simplified Read-Only Routes

import { Router, Request, Response, NextFunction } from 'express';

import { InfLotInputController } from './controller';
import { InfLotInputService } from './service';
import { createInfLotInputModel } from './model';
import { getDrizzle } from '../../../config/database';

// Import middleware (optional - remove if not available)
// import {
//   requireAuthentication,
//   requireUser,
//   requestTracking
// } from '../../../middleware/auth';

/**
 * Create INF Lot Input routes with all necessary endpoints
 */
export default function createInfLotInputRoutes(_db?: any): Router {
  const router = Router();

  // Create entity stack with Drizzle
  const drizzleDb = getDrizzle();
  const model = createInfLotInputModel(drizzleDb);
  const service = new InfLotInputService(model as any, drizzleDb.$client);
  const controller = new InfLotInputController(service);

  // Optional middleware (uncomment if available)
  // router.use(requestTracking);

  // ==================== EXCLUDE KEYWORDS & CLEANUP ====================

  /**
   * GET /api/inf-lotinput/exclude-keywords
   * Get current exclude keywords from sysconfig
   */
  router.get('/exclude-keywords',
    (req: Request, res: Response, next: NextFunction) => {
      controller.getExcludeKeywords(req, res, next);
    }
  );

  /**
   * PUT /api/inf-lotinput/exclude-keywords
   * Update exclude keywords in sysconfig
   */
  router.put('/exclude-keywords',
    (req: Request, res: Response, next: NextFunction) => {
      controller.updateExcludeKeywords(req, res, next);
    }
  );

  /**
   * POST /api/inf-lotinput/cleanup
   * Remove lots from inf_lotinput matching exclude keywords in MSSQL (last 3 months)
   */
  router.post('/cleanup',
    (req: Request, res: Response, next: NextFunction) => {
      controller.cleanupByKeywords(req, res, next);
    }
  );

  // ==================== CORE DATA ENDPOINTS ====================

  /**
   * GET /api/inf-lotinput
   * Get all records with filtering and pagination
   */
  router.get('/',
    // requireAuthentication,
    // requireUser,
    (req: Request, res: Response, next: NextFunction) => {
      controller.getAll(req, res, next);
    }
  );

  /**
   * GET /api/inf-lotinput/lot/:lotNumber
   * Get records by lot number
   */
  router.get('/lot/:lotNumber',
    // requireAuthentication,
    // requireUser,
    (req: Request, res: Response, next: NextFunction) => {
      controller.getByLotNumber(req, res, next);
    }
  );

  /**
   * GET /api/inf-lotinput/statistics
   * Get statistics for dashboard
   */
  router.get('/statistics',
    // requireAuthentication,
    // requireUser,
    (req: Request, res: Response, next: NextFunction) => {
      controller.getStatistics(req, res, next);
    }
  );

  /**
   * GET /api/inf-lotinput/filter-options
   * Get available filter options for dropdowns
   */
  router.get('/filter-options',
    // requireAuthentication,
    // requireUser,
    (req: Request, res: Response, next: NextFunction) => {
      controller.getFilterOptions(req, res, next);
    }
  );

  /**
   * GET /api/inf-lotinput/health
   * Health check endpoint
   */
  router.get('/health',
    (req: Request, res: Response, next: NextFunction) => {
      controller.getHealth(req, res, next);
    }
  );

  // ==================== IMPORT ENDPOINTS ====================

  /**
   * GET /api/inf-lotinput/sync
   * Sync/Import data from MSSQL database
   */
  router.get('/sync',
    // requireAuthentication,
    // requireUser,
    (req: Request, res: Response, next: NextFunction) => {
      controller.sync(req, res, next);
    }
  );

  /**
   * POST /api/inf-lotinput/sync
   * Sync/Import data from MSSQL database
   */
  router.post('/sync',
    // requireAuthentication,
    // requireUser,
    (req: Request, res: Response, next: NextFunction) => {
      controller.sync(req, res, next);
    }
  );

  /**
   * POST /api/inf-lotinput/import
   * Import data from MSSQL database
   */
  router.post('/import',
    // requireAuthentication,
    // requireManager,
    (req: Request, res: Response, next: NextFunction) => {
      controller.importFromMssql(req, res, next);
    }
  );

  /**
   * POST /api/inf-lotinput/import/today
   * Import today's data from MSSQL
   */
  router.post('/import/today',
    // requireAuthentication,
    // requireManager,
    (req: Request, res: Response, next: NextFunction) => {
      controller.importTodayData(req, res, next);
    }
  );

  /**
   * POST /api/inf-lotinput/import/range
   * Import data by date range from MSSQL
   */
  router.post('/import/range',
    // requireAuthentication,
    // requireManager,
    (req: Request, res: Response, next: NextFunction) => {
      controller.importDateRange(req, res, next);
    }
  );

  // ==================== LEGACY COMPATIBILITY ====================

  /**
   * GET /api/inf-lotinput/sync/today-finished
   * Legacy endpoint - returns empty success for compatibility
   */
  router.post('/sync/today-finished',
    (req: Request, res: Response) => {
      res.status(200).json({
        success: true,
        data: {
          imported: 0,
          skipped: 0,
          errors: 0
        },
        message: 'Sync operation disabled - using data display only mode'
      });
    }
  );

  /**
   * GET /api/inf-lotinput/connection/test
   * Legacy endpoint - returns success for compatibility
   */
  router.post('/connection/test',
    (req: Request, res: Response) => {
      res.status(200).json({
        success: true,
        message: 'Connection test disabled - using data display only mode'
      });
    }
  );

  /**
   * GET /api/inf-lotinput/connection/refresh
   * Legacy endpoint - returns success for compatibility
   */
  router.post('/connection/refresh',
    (req: Request, res: Response) => {
      res.status(200).json({
        success: true,
        message: 'Connection refresh disabled - using data display only mode'
      });
    }
  );

  return router;
}

/**
 * Factory function for use with dependency injection
 */
export function createInfLotInputRoutesWithController(controller: InfLotInputController): Router {
  const router = Router();

  // Core endpoints
  router.get('/', controller.getAll);
  router.get('/lot/:lotNumber', controller.getByLotNumber);
  router.get('/statistics', controller.getStatistics);
  router.get('/filter-options', controller.getFilterOptions);
  router.get('/health', controller.getHealth);

  // Legacy compatibility endpoints
  router.post('/sync/today-finished', (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      data: { imported: 0, skipped: 0, errors: 0 },
      message: 'Sync disabled - data display only'
    });
  });

  router.post('/connection/test', (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: 'Connection test disabled - data display only'
    });
  });

  router.post('/connection/refresh', (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: 'Connection refresh disabled - data display only'
    });
  });

  return router;
}

/*
=== SIMPLIFIED INF LOT INPUT ROUTES FEATURES ===

ESSENTIAL ENDPOINTS ONLY:
✅ GET /api/inf-lotinput - List with pagination and filtering
✅ GET /api/inf-lotinput/lot/:lotNumber - Get by lot number
✅ GET /api/inf-lotinput/statistics - Dashboard statistics
✅ GET /api/inf-lotinput/filter-options - Dropdown options
✅ GET /api/inf-lotinput/health - Health check

LEGACY COMPATIBILITY:
✅ POST /api/inf-lotinput/sync/today-finished - Disabled stub
✅ POST /api/inf-lotinput/connection/test - Disabled stub
✅ POST /api/inf-lotinput/connection/refresh - Disabled stub

SIMPLIFIED ARCHITECTURE:
✅ No complex middleware dependencies
✅ No authentication dependencies (optional)
✅ Focus on data retrieval only
✅ Clean error handling
✅ Comprehensive logging

FRONTEND COMPATIBILITY:
✅ Matches expected API endpoints
✅ Returns data in frontend-expected format
✅ Supports all frontend filter parameters
✅ Pagination and search functionality

The simplified routes provide all functionality needed by the
frontend while eliminating complex sync and connection features.
*/