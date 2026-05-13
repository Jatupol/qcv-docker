// server/src/entities/inspectiondata/routes.ts
/**
 * SIMPLIFIED: InspectionData Entity Routes - Special Pattern Implementation
 * Sampling Inspection Control System - Simple CRUD with Special Pattern
 */

import { Router, Request, Response, NextFunction } from 'express';

import { InspectionDataController } from './controller';
import { InspectionDataService } from './service';
import { createInspectionDataModel } from './model';
import { getDrizzle } from '../../config/database';

// Import middleware
import {
  requireAuthentication,
  requireUser,
  requireManager,
  requestTracking
} from '../../middleware/auth';

// ==================== SIMPLE INSPECTIONDATA ROUTES CLASS ====================

/**
 * Simple InspectionData Entity Routes - extends Router for HTTP routing
 */
export class InspectionDataRoutes {
  public router: Router;
  private controller: InspectionDataController;

  constructor(controller: InspectionDataController) {
    this.router = Router();
    this.controller = controller;
    this.initializeRoutes();
  }

  /**
   * Initialize all inspection data routes
   */
  private initializeRoutes(): void {
    // Apply middleware stack
    this.router.use(requestTracking);

    // ==================== HEALTH & MONITORING ====================

    /**
     * GET /api/inspectiondata/health
     * Health check endpoint
     */
    this.router.get('/health',
      requireAuthentication,
      (req: Request, res: Response, next: NextFunction) => {
        this.controller.getHealth(req as any, res, next);
      }
    );

    /**
     * GET /api/inspectiondata/statistics
     * Get inspectiondata statistics
     */
    this.router.get('/statistics',
      requireAuthentication,
      requireManager,
      (req: Request, res: Response, next: NextFunction) => {
        this.controller.getStatistics(req as any, res, next);
      }
    );

    /**
     * GET /api/inspectiondata/stats/:station
     * Get station-specific statistics for dashboard
     */
    this.router.get('/stats/:station',
      requireAuthentication,
      requireUser,
      (req: Request, res: Response, next: NextFunction) => {
        this.controller.getStationStats(req as any, res, next);
      }
    );

    /**
     * GET /api/inspectiondata/weekly-trend/:station
     * Get weekly trend data for charts
     */
    this.router.get('/weekly-trend/:station',
      requireAuthentication,
      requireUser,
      (req: Request, res: Response, next: NextFunction) => {
        this.controller.getWeeklyTrend(req as any, res, next);
      }
    );

    // ==================== CUSTOM ROUTES ====================

    /**
     * GET /api/inspectiondata/sampling-round?station=...&lotno=...
     * Get the next sampling round for a station and lotno combination
     */
    this.router.get('/sampling-round',
      requireAuthentication,
      (req: Request, res: Response, next: NextFunction) => {
        this.controller.getNextSamplingRound(req as any, res, next);
      }
    );

    /**
     * GET /api/inspectiondata/generate-inspection-number?station=...&date=...&ww=...
     * Generate the next inspection number with format: Station+YY+MM+WW+'-'+DD+RunningNumber4digit
     * Running number resets to 1 at the beginning of each day
     */
    this.router.get('/generate-inspection-number',
      requireAuthentication,
      (req: Request, res: Response, next: NextFunction) => {
        this.controller.generateInspectionNumber(req as any, res, next);
      }
    );

    /**
     * POST /api/inspectiondata/:id/create-siv
     * Create SIV inspection from OQA inspection
     */
    this.router.post('/:id/create-siv',
      requireAuthentication,
      requireUser,
      (req: Request, res: Response, next: NextFunction) => {
        this.controller.createSIVFromOQA(req as any, res, next);
      }
    );

    /**
     * GET /api/inspectiondata/parts-sgt
     * Get all SGT customer part numbers
     */
    this.router.get('/parts-sgt',
      requireAuthentication,
      requireUser,
      (req: Request, res: Response, next: NextFunction) => {
        this.controller.getPartsSGT(req as any, res, next);
      }
    );

    /**
     * GET /api/inspectiondata/siv-format
     * Get SIV format data for export
     */
    this.router.get('/siv-format',
      requireAuthentication,
      requireUser,
      (req: Request, res: Response, next: NextFunction) => {
        this.controller.getSIVFormat(req as any, res, next);
      }
    );

    /**
     * GET /api/inspectiondata/lot/:lotno
     * Get inspection data by lot number
     */
    this.router.get('/lot/:lotno',
      requireAuthentication,
      requireUser,
      (req: Request, res: Response, next: NextFunction) => {
        this.controller.getByLotNumber(req as any, res, next);
      }
    );

    /**
     * GET /api/inspectiondata/inspection-no/:inspectionNo
     * Get inspection data by inspection number
     */
    this.router.get('/inspection-no/:inspectionNo',
      requireAuthentication,
      requireUser,
      (req: Request, res: Response, next: NextFunction) => {
        this.controller.getByInspectionNo(req as any, res, next);
      }
    );

    // ==================== CRUD OPERATIONS ====================

    /**
     * GET /api/inspectiondata/customerdata
     * Get all customer inspection data from inspectiondata_customer table
     */
    this.router.get('/customerdata',
      requireAuthentication,
      requireUser,
      (req: Request, res: Response, next: NextFunction) => {
        this.controller.getAllCustomer(req as any, res, next);
      }
    );

    /**
     * GET /api/inspectiondata
     * Get all inspection data
     */
    this.router.get('/',
      requireAuthentication,
      requireUser,
      (req: Request, res: Response, next: NextFunction) => {
        this.controller.getAll(req as any, res, next);
      }
    );

    /**
     * GET /api/inspectiondata/:id
     * Get inspection data by id
     */
    this.router.get('/:id',
      requireAuthentication,
      requireUser,
      (req: Request, res: Response, next: NextFunction) => {
        this.controller.getByKey(req as any, res, next);
      }
    );

    /**
     * POST /api/inspectiondata
     * Create new inspection data
     */
    this.router.post('/',
      requireAuthentication,
      requireUser,
      (req: Request, res: Response, next: NextFunction) => {
        this.controller.create(req as any, res, next);
      }
    );

    /**
     * PUT /api/inspectiondata/:id
     * Update inspection data by id
     */
    this.router.put('/:id',
      requireAuthentication,
      requireUser,
      (req: Request, res: Response, next: NextFunction) => {
        this.controller.update(req as any, res, next);
      }
    );

    /**
     * DELETE /api/inspectiondata/:id
     * Delete inspection data by id
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
 * Factory function to create InspectionData routes
 */
export function createInspectionDataRoutes(
  db: any // Pool instance
): Router {
  // Create entity stack with Drizzle
  const model = createInspectionDataModel(getDrizzle());
  const service = new InspectionDataService(model as any);
  const controller = new InspectionDataController(service);
  const routes = new InspectionDataRoutes(controller);

  return routes.router;
}

/**
 * Factory function to create InspectionData routes with controller
 */
export function createInspectionDataRoutesWithController(
  controller: InspectionDataController
): Router {
  const routes = new InspectionDataRoutes(controller);
  return routes.router;
}

/**
 * Default export function for auto-discovery
 *
 * This function is called by the entity auto-discovery system
 */
export default function createInspectionDataRouter(_db?: any): Router {
  return createInspectionDataRoutes(getDrizzle());
}