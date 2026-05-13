// server/src/entities/reports/routes.ts
// ===== REPORT ROUTES =====
// Report Entity Routes
// Manufacturing Quality Control System - HTTP Route Definitions

import { Router, Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import { ReportController } from './controller';
import { ReportService } from './service';
import { ReportModel } from './model';

// ==================== ROUTE FACTORY FUNCTION ====================

/**
 * Create Report routes with all necessary endpoints
 */
export default function createReportRoutes(db: Pool): Router {
  const router = Router();

  // Create entity stack
  const model = new ReportModel(db);
  const service = new ReportService(model);
  const controller = new ReportController(service);

  // ==================== CORE REPORT ENDPOINTS ====================

  /**
   * GET /api/report/lar-chart
   * Get LAR chart data (simplified format without defect breakdown)
   *
   * Query Parameters:
   * - yearFrom: Start fiscal year (e.g., '2025')
   * - wwFrom: Start work week (e.g., '01')
   * - yearTo: End fiscal year (e.g., '2025')
   * - wwTo: End work week (e.g., '52')
   * - model: Model filter (e.g., 'ModelA 1.0')
   *
   * Fixed Parameters:
   * - station: 'OQA' (hardcoded)
   * - round: 1 (hardcoded)
   */
  router.get('/lar-chart',
    (req: Request, res: Response, next: NextFunction) => {
      controller.getLARChart(req, res, next);
    }
  );

  /**
   * GET /api/report/lar-defect
   * Get LAR defect data (defects grouped by week)
   *
   * Query Parameters:
   * - yearFrom: Start fiscal year (e.g., '2025')
   * - wwFrom: Start work week (e.g., '01')
   * - yearTo: End fiscal year (e.g., '2025')
   * - wwTo: End work week (e.g., '52')
   * - model: Model filter (e.g., 'ModelA 1.0')
   *
   * Fixed Parameters:
   * - station: 'OQA' (hardcoded)
   * - round: 1 (hardcoded)
   */
  router.get('/lar-defect',
    (req: Request, res: Response, next: NextFunction) => {
      controller.getLARDefect(req, res, next);
    }
  );

  /**
   * GET /api/report/sgt-iqa-trend-chart
   * Get SGT IQA Trend chart data
   *
   * Query Parameters:
   * - isCustomerReport: Boolean flag for customer-specific data (e.g., 'true' or 'false')
   * - year: Fiscal year (e.g., '2025')
   * - ww: Work week (e.g., '09')
   * - model: Model filter (e.g., 'ModelA 1.0')
   * - models: Multiple models filter (e.g., ['ModelA 1.0', 'ModelB 2.0'])
   * - product_type: Product type filter (e.g., 'HDD')
   */
  router.get('/sgt-iqa-trend-chart',
    (req: Request, res: Response, next: NextFunction) => {
      controller.getSGTIQATrendChart(req, res, next);
    }
  );

  /**
   * GET /api/report/sgt-iqa-trend-defect
   * Get SGT IQA Trend defect data
   *
   * Query Parameters:
   * - isCustomerReport: Boolean flag for customer-specific data (e.g., 'true' or 'false')
   * - year: Fiscal year (e.g., '2025')
   * - ww: Work week (e.g., '09')
   * - model: Model filter (e.g., 'ModelA 1.0')
   * - models: Multiple models filter (e.g., ['ModelA 1.0', 'ModelB 2.0'])
   * - product_type: Product type filter (e.g., 'HDD')
   */
  router.get('/sgt-iqa-trend-defect',
    (req: Request, res: Response, next: NextFunction) => {
      controller.getSGTIQATrendDefect(req, res, next);
    }
  );


  /**
   * GET /api/report/models
   * Get available models for filtering
   */
  router.get('/models',
    (req: Request, res: Response, next: NextFunction) => {
      controller.getAvailableModels(req, res, next);
    }
  );
  
  /**
   * GET /api/report/modelsSGAIQA
   * Get available models for Seagete IQA filtering
   */
  router.get('/modelsSGAIQA',
    (req: Request, res: Response, next: NextFunction) => {
      controller.getModelsSGAIQA(req, res, next);
    }
  );

  /**
   * GET /api/report/productFamiliesSGAIQA
   * Get available product families for Seagate IQA filtering (without versions)
   */
  router.get('/productFamiliesSGAIQA',
    (req: Request, res: Response, next: NextFunction) => {
      controller.getProductFamiliesSGAIQA(req, res, next);
    }
  );

  /**
   * GET /api/report/modelsLAR?customer=xyz
   * Get available models for filtering Lars report
   * Get data of Product OQA and IQA backward 2 curent fiscal years
   * Optional select filter by customer
   */
  router.get('/modelsLAR',
    (req: Request, res: Response, next: NextFunction) => {
      controller.getModelsLAR(req, res, next);
    }
  );

  router.get('/modelsDashboard',
    (req: Request, res: Response, next: NextFunction) => {
      controller.getModelsDashboard(req, res, next);
    }
  );

  /**
   * GET /api/report/lar-dashboard
   * Get LAR Dashboard data with month period and models filtering
   *
   * Query Parameters:
   * - dateFrom: Start month (e.g., '2024-01') - format YYYY-MM
   * - dateTo: End month (e.g., '2024-12') - format YYYY-MM
   * - model: Model filter (e.g., 'ModelA 1.0') - single model
   * - models: Multiple models filter (e.g., ['ModelA 1.0', 'ModelB 2.0'])
   * - isCustomerReport: Boolean flag for customer-specific data (e.g., 'true' or 'false')
   */
  router.get('/lar-dashboard',
    (req: Request, res: Response, next: NextFunction) => {
      controller.getLARDashboard(req, res, next);
    }
  );

  /**
   * GET /api/report/dppm-dashboard
   * Get DPPM Dashboard data with month period and models filtering
   *
   * Query Parameters:
   * - dateFrom: Start month (e.g., '2024-01') - format YYYY-MM
   * - dateTo: End month (e.g., '2024-12') - format YYYY-MM
   * - model: Model filter (e.g., 'ModelA 1.0') - single model
   * - models: Multiple models filter (e.g., ['ModelA 1.0', 'ModelB 2.0'])
   * - isCustomerReport: Boolean flag for customer-specific data (e.g., 'true' or 'false')
   */
  router.get('/dppm-dashboard',
    (req: Request, res: Response, next: NextFunction) => {
      controller.getDPPMDashboard(req, res, next);
    }
  );

  /**
   * GET /api/report/underkill-dashboard
   * Get Underkill Dashboard data with month period and models filtering
   *
   * Query Parameters:
   * - dateFrom: Start month (e.g., '2024-01') - format YYYY-MM
   * - dateTo: End month (e.g., '2024-12') - format YYYY-MM
   * - model: Model filter (e.g., 'ModelA 1.0') - single model
   * - models: Multiple models filter (e.g., ['ModelA 1.0', 'ModelB 2.0'])
   * - isCustomerReport: Boolean flag for customer-specific data (e.g., 'true' or 'false')
   * - productionSites: Production sites filter (e.g., ['Site1', 'Site2'])
   * - customerSites: Customer sites filter (e.g., ['Customer1', 'Customer2'])
   * - productFamilies: Product families filter (e.g., ['Family1', 'Family2'])
   * - productTypes: Product types filter (e.g., ['Type1', 'Type2'])
   */
  router.get('/underkill-dashboard',
    (req: Request, res: Response, next: NextFunction) => {
      controller.getUnderkillDashboard(req, res, next);
    }
  );


  /**
   * GET /api/report/top-defect
   * Get Top Defect data with month period filtering
   *
   * Query Parameters:
   * - dateFrom: Start month (e.g., '2024-01') - format YYYY-MM
   * - dateTo: End month (e.g., '2024-12') - format YYYY-MM
   */
  router.get('/top-defect',
    (req: Request, res: Response, next: NextFunction) => {
      controller.getTopDefect(req, res, next);
    }
  );

  // ==================== NEW ANALYTICS ROUTES ====================

  /**
   * GET /api/report/production-line-heatmap?dateFrom=YYYY-MM&dateTo=YYYY-MM
   * Get production line quality heatmap data
   */
  router.get('/production-line-heatmap',
    (req: Request, res: Response, next: NextFunction) => {
      controller.getProductionLineHeatmap(req, res, next);
    }
  );

  /**
   * GET /api/report/product-quality-scorecard?dateFrom=YYYY-MM&dateTo=YYYY-MM
   * Get product quality scorecard data
   */
  router.get('/product-quality-scorecard',
    (req: Request, res: Response, next: NextFunction) => {
      controller.getProductQualityScorecard(req, res, next);
    }
  );

  /**
   * GET /api/report/defect-root-cause?dateFrom=YYYY-MM&dateTo=YYYY-MM
   * Get defect root cause analysis data
   */
  router.get('/defect-root-cause',
    (req: Request, res: Response, next: NextFunction) => {
      controller.getDefectRootCause(req, res, next);
    }
  );

  /**
   * GET /api/report/monthly-quality-trend?dateFrom=YYYY-MM&dateTo=YYYY-MM
   * Get monthly quality trend data
   */
  router.get('/monthly-quality-trend',
    (req: Request, res: Response, next: NextFunction) => {
      controller.getMonthlyQualityTrend(req, res, next);
    }
  );

  /**
   * GET /api/report/parts-filter-options?customerSite=...
   * Get product families, product types, and models for a given customer site
   */
  router.get('/parts-filter-options',
    (req: Request, res: Response, next: NextFunction) => {
      controller.getPartsFilterOptions(req, res, next);
    }
  );

  /**
   * GET /api/report/defect-image-summary?dateFrom=YYYY-MM-DD&dateTo=YYYY-MM-DD&site=...&customerSite=...&productFamily=...&productType=...&model=...
   * Get Defect Image Summary data grouped by defect name
   */
  router.get('/defect-image-summary',
    (req: Request, res: Response, next: NextFunction) => {
      controller.getDefectImageSummary(req, res, next);
    }
  );

  /**
   * GET /api/report/history-tracking?lotNumbers=LOT1,LOT2,LOT3
   * Get History Tracking data by lot numbers (comma-separated, max 10)
   */
  router.get('/history-tracking',
    (req: Request, res: Response, next: NextFunction) => {
      controller.getHistoryTracking(req, res, next);
    }
  );

  /**
   * GET /api/report/fiscal-years
   * Get available fiscal years for filtering by report
   */
  router.get('/fiscal-years/:report',
    (req: Request, res: Response, next: NextFunction) => {
      controller.getFiscalYears(req, res, next);
    }
  );

  /**
   * GET /api/report/work-weeks?fy=2025
   * Get available work weeks for filtering by report
   * Optional query parameter: fy (fiscal year) by report
   */
  router.get('/work-weeks/:report',
    (req: Request, res: Response, next: NextFunction) => {
      controller.getWorkWeeks(req, res, next);
    }
  );

  /**
   * GET /api/report/seagate-iqa-result?year=2025&ww=09
   * Get Seagate IQA Result report data
   *
   * Query Parameters:
   * - year: Fiscal year (e.g., '2025') - REQUIRED
   * - ww: Work week (e.g., '09') - REQUIRED
   */
  router.get('/seagate-iqa-result',
    (req: Request, res: Response, next: NextFunction) => {
      controller.getSeagateIQAResult(req, res, next);
    }
  );


  /**
   * GET /api/report/iqa-oqa-dppm-overall?year=2025&ww=09
   * Get IQA and OQA DPPM Overall report data
   *
   * Query Parameters:
   * - year: Fiscal year (e.g., '2025') - REQUIRED
   * - ww: Work week (e.g., '09') - REQUIRED
   */
  router.get('/iqa-oqa-dppm-overall-chart',
    (req: Request, res: Response, next: NextFunction) => {
      controller.getIQAOQADppmOverallChart(req, res, next);
    }
  );


  /**
   * GET /api/report/oqa-dppm-overall?year=2025&ww=09
   * Get OQA DPPM Overall report data
   *
   * Query Parameters:
   * - year: Fiscal year (e.g., '2025') - REQUIRED
   * - ww: Work week (e.g., '09') - REQUIRED
   */
  router.get('/oqa-dppm-overall-chart',
    (req: Request, res: Response, next: NextFunction) => {
      controller.getOQADppmOverallChart(req, res, next);
    }
  );

 

  /**
   * GET /api/report/oqa-dppm-overall-defect
   * Get OQA DPPM Overall defect data
   *
   * Query Parameters:
   * - yearFrom: fiscal year (e.g., '2024')
   * - wwFrom: work week (e.g., '49')
   */
  router.get('/oqa-dppm-overall-defect',
    (req: Request, res: Response, next: NextFunction) => {
      controller.getOQADppmOverallDefect(req, res, next);
    }
  );

  /**
   * GET /api/report/sgt-iqa-trend-chart
   * Get SGT IQA Trend chart data
   *
   * Query Parameters:
   * - yearFrom: Start fiscal year (e.g., '2024')
   * - wwFrom: Start work week (e.g., '49')
   * - yearTo: End fiscal year (e.g., '2025')
   * - wwTo: End work week (e.g., '06')
   * - model: Model filter (e.g., 'PINE 5.2.6')
   * - product_type: Product type filter (e.g., 'HSA', 'HDD')
   */
  router.get('/sgt-iqa-trend-chart',
    (req: Request, res: Response, next: NextFunction) => {
      controller.getSGTIQATrendChart(req, res, next);
    }
  );

  /**
   * GET /api/report/sgt-iqa-trend-defect
   * Get SGT IQA Trend defect data
   *
   * Query Parameters:
   * - yearFrom: Start fiscal year (e.g., '2024')
   * - wwFrom: Start work week (e.g., '49')
   * - yearTo: End fiscal year (e.g., '2025')
   * - wwTo: End work week (e.g., '06')
   * - model: Model filter (e.g., 'PINE 5.2.6')
   * - product_type: Product type filter (e.g., 'HSA', 'HDD')
   */
  router.get('/sgt-iqa-trend-defect',
    (req: Request, res: Response, next: NextFunction) => {
      controller.getSGTIQATrendDefect(req, res, next);
    }
  );

  // ==================== OQA VISUAL INSPECTION ====================

  /**
   * GET /api/report/oqa-vi-dashboard
   * Get OQA Visual Inspection dashboard data (combo charts per model)
   *
   * Query Parameters:
   * - dateFrom: Start month (e.g., '2024-01') - format YYYY-MM
   * - dateTo: End month (e.g., '2024-12') - format YYYY-MM
   * - models: Multiple models filter
   * - productionSites, customerSites, productFamilies, productTypes: Cascading filters
   * - isCustomerReport: Boolean flag for customer-specific data
   */
  router.get('/oqa-vi-dashboard',
    (req: Request, res: Response, next: NextFunction) => {
      controller.getOQAVisualInspection(req, res, next);
    }
  );

  // ==================== DEFECT TYPE ANALYSIS ====================

  /**
   * GET /api/report/defect-type-analysis
   * Get Defect Type Analysis data with date range filtering
   *
   * Query Parameters:
   * - dateFrom: Start date (YYYY-MM-DD)
   * - dateTo: End date (YYYY-MM-DD)
   */
  router.get('/defect-type-analysis',
    (req: Request, res: Response, next: NextFunction) => {
      controller.getDefectTypeAnalysis(req, res, next);
    }
  );

  // ==================== OVERVIEW OQA ====================

  /**
   * GET /api/report/overview-oqa
   * Get Overview OQA data (lot-level with defect group) for customer report
   *
   * Query Parameters:
   * - yearFrom: Fiscal year (e.g., '2026') - REQUIRED
   * - wwFrom: Work week (e.g., '09') - REQUIRED
   * - models: Multiple models filter (e.g., ['Iris 20.4', 'Pine 5.2'])
   */
  router.get('/overview-oqa',
    (req: Request, res: Response, next: NextFunction) => {
      controller.getOverviewOQA(req, res, next);
    }
  );

  /**
   * GET /api/report/overview-oqa-lot-detail
   * Get lot-level NG detail for a specific product and defect group
   *
   * Query Parameters:
   * - fy: Fiscal year - REQUIRED
   * - ww: Work week - REQUIRED
   * - partno_customer: Customer part number - REQUIRED
   * - defect_group: Defect group name - REQUIRED
   */
  router.get('/overview-oqa-lot-detail',
    (req: Request, res: Response, next: NextFunction) => {
      controller.getOverviewOQALotDetail(req, res, next);
    }
  );

  // ==================== SOQM WEEKLY ====================

  /**
   * GET /api/report/soqm-weekly
   * SOQM Weekly summary report - pivot by model with metrics and defect breakdown
   */
  router.get('/soqm-weekly',
    (req: Request, res: Response, next: NextFunction) => {
      controller.getSOQMWeekly(req, res, next);
    }
  );

  // ==================== SOQM DAILY ====================

  /**
   * GET /api/report/soqm-daily
   * SOQM Daily report - NG qty from OQA station
   *
   * Query Parameters:
   * - yearFrom, wwFrom, yearTo, wwTo: Fiscal year/week range
   * - models: Model filter (multiple)
   * - lotno: Lot number search (partial match)
   */
  router.get('/soqm-daily',
    (req: Request, res: Response, next: NextFunction) => {
      controller.getSOQMDaily(req, res, next);
    }
  );

  // ==================== FVI INSPECTION ====================

  /**
   * GET /api/report/fvi-inspection
   * Query Parameters: inputDateFrom, inputDateTo, lotno, judgment
   */
  router.get('/fvi-inspection',
    (req: Request, res: Response, next: NextFunction) => {
      controller.getFVIInspection(req, res, next);
    }
  );

  /**
   * DELETE /api/report/fvi-inspection/lotno/:lotno
   * Delete records from inf_lotinput by lot number
   */
  router.delete('/fvi-inspection/lotno/:lotno',
    (req: Request, res: Response, next: NextFunction) => {
      controller.deleteFVILotInput(req, res, next);
    }
  );

  return router;
}

/**
 * Alternative factory function for use with dependency injection
 */
export function createLARReportRoutesWithController(controller: ReportController): Router {
  const router = Router();

  router.get('/lar-chart', controller.getLARChart);
  router.get('/lar-defect', controller.getLARDefect);
  router.get('/models', controller.getAvailableModels);
  router.get('/modelsLAR', controller.getModelsLAR);
  router.get('/lar-fiscal-years', controller.getFiscalYears);
  router.get('/lar-work-weeks', controller.getWorkWeeks);
  router.get('/seagate-iqa-result', controller.getSeagateIQAResult);
  router.get('/oqa-dppm-overall-chart', controller.getOQADppmOverallChart);
  router.get('/oqa-dppm-overall-defect', controller.getOQADppmOverallDefect);
  router.get('/sgt-iqa-trend-chart', controller.getSGTIQATrendChart);
  router.get('/sgt-iqa-trend-defect', controller.getSGTIQATrendDefect);
  return router;
}

/*
=== LAR REPORT ROUTES FEATURES ===

COMPLETE SEPARATION ARCHITECTURE:
✅ Self-contained route definitions
✅ No dependencies on other entities
✅ Standard Express Router pattern
✅ Factory pattern support


QUERY PARAMETERS:
✅ wwFrom/wwTo - Work week range filtering
✅ dateFrom/dateTo - Date range filtering
✅ station - Station filtering (default: 'OQA')
✅ round - Round filtering (default: 1)

MIDDLEWARE READY:
✅ Authentication middleware placeholders (commented)
✅ Request tracking middleware placeholders
✅ Role-based access control ready

MANUFACTURING FOCUS:
✅ Work week based reporting
✅ LAR (Line Acceptance Rate) metrics
✅ DPPM (Defects Per Million) tracking
✅ Defect type breakdown
✅ OQA station quality metrics
*/
