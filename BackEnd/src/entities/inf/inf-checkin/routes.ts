// server/src/entities/inf/inf-checkin/routes.ts
// ===== SIMPLIFIED INF CHECKIN ROUTES =====
// Data Display Only - Essential Endpoints for Search and Retrieval
// Manufacturing Quality Control System - Simplified Read-Only Routes

import { Router, Request, Response, NextFunction } from 'express';

import { InfCheckinController } from './controller';
import { InfCheckinService } from './service';
import { createInfCheckinModel } from './model';
import { getDrizzle } from '../../../config/database';

// Import middleware (optional - remove if not available)
// import {
//   requireAuthentication,
//   requireUser,
//   requestTracking
// } from '../../../middleware/auth';

/**
 * Create INF CheckIn routes with all necessary endpoints
 */
export default function createInfCheckinRoutes(_db?: any): Router {
  const router = Router();

  // Create entity stack with Drizzle
  const drizzleDb = getDrizzle();
  const model = createInfCheckinModel(drizzleDb);
  const service = new InfCheckinService(model as any, drizzleDb.$client);
  const controller = new InfCheckinController(service);

  // Optional middleware (uncomment if available)
  // router.use(requestTracking);

  // ==================== CORE DATA ENDPOINTS ====================

  /**
   * GET /api/inf-checkin
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
   * GET /api/inf-checkin/user/:username
   * Get records by username
   */
  router.get('/user/:username',
    // requireAuthentication,
    // requireUser,
    (req: Request, res: Response, next: NextFunction) => {
      controller.getByUsername(req, res, next);
    }
  );

  /**
   * GET /api/inf-checkin/line/:lineId
   * Get records by line ID
   */
  router.get('/line/:lineId',
    // requireAuthentication,
    // requireUser,
    (req: Request, res: Response, next: NextFunction) => {
      controller.getByLineId(req, res, next);
    }
  );

  /**
   * GET /api/inf-checkin/active
   * Get currently active workers
   */
  router.get('/active',
    // requireAuthentication,
    // requireUser,
    (req: Request, res: Response, next: NextFunction) => {
      controller.getActiveWorkers(req, res, next);
    }
  );

  /**
   * GET /api/inf-checkin/statistics
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
   * GET /api/inf-checkin/operators?gr_code=XXX
   * Get unique operators (username and oprname) for autocomplete
   * Query params:
   *   - gr_code: Optional group code filter (if blank, show all)
   */
  router.get('/operators',
    // requireAuthentication,
    // requireUser,
    (req: Request, res: Response, next: NextFunction) => {
      controller.getOperators(req, res, next);
    }
  );

  /**
   * GET /api/inf-checkin/fvi-leaders
   * Get FVI leader operators (username and oprname) for autocomplete
   * Used for QC Leader/FVI Leader Confirm Name field
   */
  router.get('/fvi-leaders',
    // requireAuthentication,
    // requireUser,
    (req: Request, res: Response, next: NextFunction) => {
      controller.getFVILeaderOperators(req, res, next);
    }
  );

  /**
   * GET /api/inf-checkin/filter-options
   * Get filter options for dropdowns
   */
  router.get('/filter-options',
    // requireAuthentication,
    // requireUser,
    (req: Request, res: Response, next: NextFunction) => {
      controller.getFilterOptions(req, res, next);
    }
  );

  /**
   * GET /api/inf-checkin/search
   * Search records by multiple criteria
   */
  router.get('/search',
    // requireAuthentication,
    // requireUser,
    (req: Request, res: Response, next: NextFunction) => {
      controller.searchRecords(req, res, next);
    }
  );

  /**
   * GET /api/inf-checkin/fvi-line-mapping
   * Get FVI line mapping for production line visualization
   */
  router.get('/fvi-line-mapping',
    // requireAuthentication,
    // requireUser,
    (req: Request, res: Response, next: NextFunction) => {
      controller.getFVILineMapping(req, res, next);
    }
  );

  /**
   * GET /api/inf-checkin/fvi-lines-by-date
   * Get list of FVI lines by date
   */
  router.get('/fvi-lines-by-date',
    // requireAuthentication,
    // requireUser,
    (req: Request, res: Response, next: NextFunction) => {
      controller.getFVILinesByDate(req, res, next);
    }
  );

  /**
   * GET /api/inf-checkin/distinct-lines
   * Get distinct FVI lines (all lines with line_no_id length between 1 and 5)
   */
  router.get('/distinct-lines',
    // requireAuthentication,
    // requireUser,
    (req: Request, res: Response, next: NextFunction) => {
      controller.getDistinctFVILines(req, res, next);
    }
  );

  /**
   * GET /api/inf-checkin/health
   * Health check endpoint
   */
  router.get('/health',
    (req: Request, res: Response, next: NextFunction) => {
      controller.healthCheck(req, res, next);
    }
  );

  // ==================== IMPORT ENDPOINTS ====================

  /**
   * GET /api/inf-checkin/sync
   * Check if import should run based on last import time and sync interval
   * Only returns status without actually running the import
   */
  router.get('/sync',
    // requireAuthentication,
    // requireUser,
    (req: Request, res: Response, next: NextFunction) => {
      controller.checkSync(req, res, next);
    }
  );

  /**
   * POST /api/inf-checkin/sync
   * Check sync status and automatically run import if needed
   */
  router.post('/sync',
    // requireAuthentication,
    // requireUser,
    (req: Request, res: Response, next: NextFunction) => {
      controller.runSync(req, res, next);
    }
  );

  /**
   * POST /api/inf-checkin/import
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
   * POST /api/inf-checkin/import/today
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
   * POST /api/inf-checkin/import/range
   * Import data by date range from MSSQL
   */
  router.post('/import/range',
    // requireAuthentication,
    // requireManager,
    (req: Request, res: Response, next: NextFunction) => {
      controller.importDateRange(req, res, next);
    }
  );

  /**
   * POST /api/inf-checkin/import/auto
   * Auto-import new data from MSSQL (continues from last CreatedOn)
   */
  router.post('/import/auto',
    // requireAuthentication,
    (req: Request, res: Response, next: NextFunction) => {
      controller.importAuto(req, res, next);
    }
  );

  return router;
}

/*
=== SIMPLIFIED INF CHECKIN ROUTES ===

SIMPLIFIED ARCHITECTURE:
✅ Direct router creation without complex inheritance
✅ Simple entity stack creation (model -> service -> controller)
✅ Standard Express router with explicit endpoint definitions
✅ Matches inf-lotinput pattern exactly

CORE ENDPOINTS:
✅ GET / - List with filtering and pagination
✅ GET /user/:username - Find by username
✅ GET /line/:lineId - Find by line ID
✅ GET /active - Active workers
✅ GET /statistics - Dashboard stats
✅ GET /filter-options - Dropdown options
✅ GET /search - Multi-criteria search
✅ GET /health - Health check

PLACEHOLDER ENDPOINTS:
✅ POST /import/today - Import today's data (501 Not Implemented)
✅ POST /import/range - Import date range (501 Not Implemented)

MIDDLEWARE READY:
✅ Authentication middleware placeholders
✅ Request tracking middleware placeholder
✅ Role-based access control ready

The simplified routes follow the exact same pattern as inf-lotinput
with direct endpoint definitions and no complex generic abstractions.
*/