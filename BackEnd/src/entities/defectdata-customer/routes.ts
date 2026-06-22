// server/src/entities/defectdatacustomer/routes.ts
/**
 * DefectDataCustomer Entity Routes - Complete Separation Entity Architecture
 * SPECIAL Pattern Implementation
 *
 * Complete Separation Entity Architecture:
 * ✅ Uses GenericSpecialRoutes for maximum code reuse
 * ✅ No direct cross-entity dependencies
 * ✅ Self-contained defectdatacustomer routing layer
 * ✅ Manufacturing Quality Control domain optimized
 *
 * Database Schema Compliance:
 * - Table: defectdatacustomer
 * - Primary Key: id SERIAL PRIMARY KEY
 * - Pattern: SPECIAL Entity (SERIAL ID with complex structure)
 * - API Routes: /api/defectdatacustomer/:id
 */

import { Router } from 'express';

import { GenericSpecialRoutes, createSpecialRoutes } from '../../generic/entities/special-entity/generic-routes';
import {
  DefectData,
  DEFAULT_DEFECTDATA_CONFIG
} from './types';
import { createDefectDataCustomerModel } from './model';
import { DefectDataService, createDefectDataService } from './service';
import { DefectDataController, createDefectDataController } from './controller';
import { createDefectCustomerImageModel } from '../defect-customer-image/model';
import { getDrizzle } from '../../config/database';

// ==================== DEFECTDATA ROUTES CLASS ====================

/**
 * DefectData Routes - Express routing for DefectData entity
 *
 * Provides defect data-specific routes while extending
 * the generic SPECIAL routes pattern for maximum code reuse.
 *
 * Features:
 * - Complete CRUD routes via generic pattern
 * - DefectData-specific route extensions
 * - Manufacturing Quality Control optimized endpoints
 * - Enhanced middleware and validation
 * - Analytics and reporting routes
 */
export class DefectDataRoutes extends GenericSpecialRoutes {

  private defectDataController: DefectDataController;

  constructor(defectDataController: DefectDataController) {
    // Pass the controller to the generic routes
    super(defectDataController, DEFAULT_DEFECTDATA_CONFIG);
    this.defectDataController = defectDataController;

    // Setup routes immediately after initialization
    this.setupCustomRoutes();
  }

  /**
   * Setup defect data specific routes
   *
   * Extends the generic routes with defect data specific endpoints
   */
  protected setupCustomRoutes(): void {
    // Call parent to setup generic CRUD routes
    super.setupCustomRoutes();

    // Add defect data specific routes
    this.setupDefectDataRoutes();
  }

  /**
   * Setup defect data specific routes
   */
  private setupDefectDataRoutes(): void {
    // ==================== INSPECTION-BASED ROUTES ====================

    /**
     * Get defect data by inspection number
     * GET /inspection/:inspectionNo
     */
    this.router.get('/inspection/:inspectionNo', this.defectDataController.getByInspectionNo);

    /**
     * Get defect detail data by inspection number
     * GET /detail/:inspectionNo
     */
    this.router.get('/detail/:inspectionNo', this.defectDataController.getDetailByInspectionNo);

    // ==================== STATION-BASED ROUTES ====================

    /**
     * Get defect data by station and date range
     * GET /station/:station?startDate=...&endDate=...&limit=...
     */
    this.router.get('/station/:station', this.defectDataController.getByStationAndDateRange);

    // ==================== INSPECTOR-BASED ROUTES ====================

    /**
     * Get defect data by inspector
     * GET /inspector/:inspector?limit=...
     */
    this.router.get('/inspector/:inspector', this.defectDataController.getByInspector);

    /**
     * Get inspector performance data
     * GET /inspector/:inspector/performance
     */
    this.router.get('/inspector/:inspector/performance', this.defectDataController.getInspectorPerformance);

    // ==================== DETAILED INFORMATION ROUTES ====================

    /**
     * Get defect data profile with detailed information
     * GET /:id/profile
     */
    this.router.get('/:id/profile', this.defectDataController.getProfile);

    /**
     * Resend defect notification email
     * POST /:id/resend-email
     */
    this.router.post('/:id/resend-email', this.defectDataController.resendDefectEmail);

    // ==================== ANALYTICS ROUTES ====================

    /**
     * Get defect data summary for analytics
     * GET /summary?startDate=...&endDate=...
     */
    this.router.get('/summary', this.defectDataController.getSummary);

    /**
     * Get defect data trends for charts
     * GET /trends?days=...
     */
    this.router.get('/trends', this.defectDataController.getTrends);

    // ==================== TIME-BASED ROUTES ====================

    /**
     * Get defect data by today's date
     * GET /today?station=...
     */
    this.router.get('/today', this.defectDataController.getTodayDefectData);

    // ==================== SEARCH AND BULK ROUTES ====================

    /**
     * Advanced search endpoint
     * POST /search
     */
    this.router.post('/search', this.defectDataController.searchDefectData);

    /**
     * Bulk create defect data
     * POST /bulk
     */
    this.router.post('/bulk', this.defectDataController.bulkCreateDefectData);

    // ==================== ENHANCED CRUD ROUTES ====================

    /**
     * Enhanced create with defect data validation
     * Override the generic POST /
     */
    this.router.post('/', this.defectDataController.createDefectData);

    /**
     * Enhanced update with defect data validation
     * Override the generic PUT /:id
     */
    this.router.put('/:id', this.defectDataController.updateDefectData);

    /**
     * Delete defect data by ID
     * DELETE /:id
     */
    this.router.delete('/:id', this.defectDataController.deleteDefectData);
  }

  /**
   * Get the configured router
   */
  getRouter(): Router {
    return this.router;
  }
}

// ==================== FACTORY FUNCTIONS ====================

/**
 * Create a complete defect data router with all dependencies
 *
 * Factory function that creates all layers and returns configured router
 */
export function createDefectDataRoutes(_db?: any): Router {
  // Create all layers with Drizzle
  const drizzleDb = getDrizzle();
  const model = createDefectDataCustomerModel(drizzleDb);
  const imageModel = createDefectCustomerImageModel(drizzleDb);
  const service = createDefectDataService(model as any, imageModel as any);
  const controller = createDefectDataController(service, drizzleDb.$client); // Pass db pool for email service
  const routes = new DefectDataRoutes(controller);

  // Routes are setup in constructor, just return router
  return routes.getRouter();
}

/**
 * Create defect data router using generic factory
 *
 * Alternative factory using the generic pattern
 */
export function createDefectDataRoutesGeneric(_db?: any): Router {
  // Create all layers with Drizzle
  const drizzleDb = getDrizzle();
  const model = createDefectDataCustomerModel(drizzleDb);
  const imageModel = createDefectCustomerImageModel(drizzleDb);
  const service = createDefectDataService(model as any, imageModel as any);
  const controller = createDefectDataController(service, drizzleDb.$client); // Pass db pool for email service

  // Use generic routes factory
  const router = createSpecialRoutes(controller, DEFAULT_DEFECTDATA_CONFIG);

  // Add defect data specific routes manually
  setupDefectDataSpecificRoutes(router, controller);

  return router;
}

/**
 * Setup defect data specific routes on an existing router
 */
function setupDefectDataSpecificRoutes(router: Router, controller: DefectDataController): void {
  // Inspection-based routes
  router.get('/inspection/:inspectionNo', controller.getByInspectionNo);

  // Inspection-based routes
  router.get('/detail/:inspectionNo', controller.getDetailByInspectionNo);

  // Station-based routes
  router.get('/station/:station', controller.getByStationAndDateRange);

  // Inspector-based routes
  router.get('/inspector/:inspector', controller.getByInspector);
  router.get('/inspector/:inspector/performance', controller.getInspectorPerformance);

  // Detailed information routes
  router.get('/:id/profile', controller.getProfile);
  router.post('/:id/resend-email', controller.resendDefectEmail);

  // Analytics routes
  router.get('/summary', controller.getSummary);
  router.get('/trends', controller.getTrends);

  // Time-based routes
  router.get('/today', controller.getTodayDefectData);

  // Search and bulk routes
  router.post('/search', controller.searchDefectData);
  router.post('/bulk', controller.bulkCreateDefectData);

  // Enhanced CRUD routes (override generic ones)
  router.post('/', controller.createDefectData);
  router.put('/:id', controller.updateDefectData);
  router.delete('/:id', controller.deleteDefectData);
}

/**
 * Setup complete defect data entity with all components
 *
 * Returns all components for advanced usage
 */
export function setupDefectDataEntity(_db?: any): {
  model: any;
  service: DefectDataService;
  controller: DefectDataController;
  routes: DefectDataRoutes;
  router: Router;
} {
  // Create entity stack with Drizzle
  const drizzleDb = getDrizzle();
  const model = createDefectDataCustomerModel(drizzleDb);
  const imageModel = createDefectCustomerImageModel(drizzleDb);
  const service = createDefectDataService(model as any, imageModel as any);
  const controller = createDefectDataController(service, drizzleDb.$client); // Pass db pool for email service
  const routes = new DefectDataRoutes(controller);

  // Routes are setup in constructor

  return {
    model,
    service,
    controller,
    routes,
    router: routes.getRouter()
  };
}

// ==================== DEFAULT EXPORT ====================

/**
 * Default export function for auto-discovery
 *
 * This function is called by the entity auto-discovery system
 */
export default function createDefectDataRouter(_db?: any): Router {
  return createDefectDataRoutes(getDrizzle());
}
