// server/src/entities/reports/controller.ts
// ===== LAR REPORT CONTROLLER =====
// Line Acceptance Rate (LAR) Report Entity Controller
// Manufacturing Quality Control System - HTTP Request Handling

import { Request, Response, NextFunction } from 'express';
import { ReportQueryParams, DefectImageSummaryParams } from './types';
import { ReportService } from './service';

// ==================== LAR REPORT CONTROLLER CLASS ====================

/**
 * Report Controller
 * HTTP request handling for report endpoints
 */
export class ReportController {
  private service: ReportService;

  constructor(service: ReportService) {
    this.service = service;
  }

  // ==================== CORE HTTP ENDPOINTS ====================

  /**
   * GET /api/report-lar/chart
   * Get LAR chart data (simplified format without defect breakdown)
   */
  getLARChart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log(`📊 GET /api/report-lar/chart - Query params:`, req.query);

      // Extract and validate query parameters
      const queryParams: ReportQueryParams = {
        isCustomerReport: req.query.isCustomerReport === 'true',
        yearFrom: req.query.yearFrom as string,
        wwFrom: req.query.wwFrom as string,
        yearTo: req.query.yearTo as string,
        wwTo: req.query.wwTo as string,
        model: req.query.model as string,
        models: req.query.models ? (Array.isArray(req.query.models) ? req.query.models as string[] : [req.query.models as string]) : undefined
      };

      // Remove undefined values
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key as keyof ReportQueryParams] === undefined) {
          delete queryParams[key as keyof ReportQueryParams];
        }
      });

      const result = await this.service.getLARChart(queryParams);

      if (result.success) {
        console.log(`✅ GET /api/report-lar/chart - Success: ${result.data?.length || 0} records`);
        res.status(200).json(result);
      } else {
        console.log(`❌ GET /api/report-lar/chart - Error: ${result.message}`);
        res.status(400).json(result);
      }

    } catch (error) {
      console.error('❌ Error in LARReportController.getLARChart:', error);
      next(error);
    }
  };

  /**
   * GET /api/report-lar/defect
   * Get LAR defect data (defects grouped by week)
   */
  getLARDefect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log(`📊 GET /api/report-lar/defect - Query params:`, req.query);

      // Extract and validate query parameters
      const queryParams: ReportQueryParams = {
        isCustomerReport: req.query.isCustomerReport === 'true',
        yearFrom: req.query.yearFrom as string,
        wwFrom: req.query.wwFrom as string,
        yearTo: req.query.yearTo as string,
        wwTo: req.query.wwTo as string,
        model: req.query.model as string,
        models: req.query.models ? (Array.isArray(req.query.models) ? req.query.models as string[] : [req.query.models as string]) : undefined
      };

      // Remove undefined values
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key as keyof ReportQueryParams] === undefined) {
          delete queryParams[key as keyof ReportQueryParams];
        }
      });

      const result = await this.service.getLARDefect(queryParams);

      if (result.success) {
        console.log(`✅ GET /api/report-lar/defect - Success: ${result.data?.length || 0} defect records`);
        res.status(200).json(result);
      } else {
        console.log(`❌ GET /api/report-lar/defect - Error: ${result.message}`);
        res.status(400).json(result);
      }

    } catch (error) {
      console.error('❌ Error in LARReportController.getLARDefect:', error);
      next(error);
    }
  };

  /**
   * GET /api/report-lar/models
   * Get available models for filtering
   */
  getAvailableModels = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log(`📋 GET /api/report-lar/models`);

      const result = await this.service.getAvailableModels();

      if (result.success) {
        console.log(`✅ GET /api/report-lar/models - Success: ${result.data?.length || 0} models`);
        res.status(200).json(result);
      } else {
        console.log(`❌ GET /api/report-lar/models - Error: ${result.message}`);
        res.status(400).json(result);
      }

    } catch (error) {
      console.error('❌ Error in LARReportController.getAvailableModels:', error);
      next(error);
    }
  };
  
  /**
   * GET /api/report-lar/lar models
   * Get available models for LAR filtering
   */
  getModelsLAR = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log(`📋 GET /api/report/modelsLAR`);
      console.log(`📋 Query params:`, req.query);

      const parseArray = (value: any): string[] | undefined => {
        if (!value) return undefined;
        if (Array.isArray(value)) return value as string[];
        return [value as string];
      };

      const params: ReportQueryParams = {
        yearFrom: req.query.yearFrom as string | undefined,
        wwFrom: req.query.wwFrom as string | undefined,
        yearTo: req.query.yearTo as string | undefined,
        wwTo: req.query.wwTo as string | undefined,
        isCustomerReport: req.query.isCustomerReport === 'true',
        productionSites: parseArray(req.query.productionSites),
        customerSites: parseArray(req.query.customerSites),
        productFamilies: parseArray(req.query.productFamilies),
        productTypes: parseArray(req.query.productTypes),
      };

      const result = await this.service.getModelsLAR(params);

      if (result.success) {
        console.log(`✅ GET /api/report/modelsLAR - Success: ${result.data?.length || 0} models`);
        res.status(200).json(result);
      } else {
        console.log(`❌ GET /api/report/modelsLAR - Error: ${result.message}`);
        res.status(400).json(result);
      }

    } catch (error) {
      console.error('❌ Error in LARReportController.getModelsLAR:', error);
      next(error);
    }
  };


  getModelsDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parseArray = (value: any): string[] | undefined => {
        if (!value) return undefined;
        if (Array.isArray(value)) return value as string[];
        return [value as string];
      };

      const params: ReportQueryParams = {
        productionSites: parseArray(req.query.productionSites),
        customerSites: parseArray(req.query.customerSites),
        productFamilies: parseArray(req.query.productFamilies),
        productTypes: parseArray(req.query.productTypes),
      };

      const result = await this.service.getModelsDashboard(params);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }

    } catch (error) {
      console.error('❌ Error in ReportController.getModelsDashboard:', error);
      next(error);
    }
  };

  /**
   * GET /api/report/lar-dashboard
   * Get LAR Dashboard data with month period and models filtering
   */
  getLARDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log(`📊 GET /api/report/lar-dashboard - Query params:`, req.query);

      const parseArray = (value: any): string[] | undefined => {
        if (!value) return undefined;
        if (Array.isArray(value)) return value as string[];
        return [value as string];
      };

      // Extract and validate query parameters
      const queryParams: ReportQueryParams = {
        dateFrom: req.query.dateFrom as string,
        dateTo: req.query.dateTo as string,
        model: req.query.model as string,
        models: parseArray(req.query.models),
        productionSites: parseArray(req.query.productionSites),
        customerSites: parseArray(req.query.customerSites),
        productFamilies: parseArray(req.query.productFamilies),
        productTypes: parseArray(req.query.productTypes),
      };

      // Remove undefined values
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key as keyof ReportQueryParams] === undefined) {
          delete queryParams[key as keyof ReportQueryParams];
        }
      });

      const result = await this.service.getLARDashboard(queryParams);

      if (result.success) {
        console.log(`✅ GET /api/report/lar-dashboard - Success: ${result.data?.length || 0} records`);
        res.status(200).json(result);
      } else {
        console.log(`❌ GET /api/report/lar-dashboard - Error: ${result.message}`);
        res.status(400).json(result);
      }

    } catch (error) {
      console.error('❌ Error in ReportController.getLARDashboard:', error);
      next(error);
    }
  };

  /**
   * GET /api/report/dppm-dashboard
   * Get DPPM Dashboard data with month period and models filtering
   */
  getDPPMDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log(`📊 GET /api/report/dppm-dashboard - Query params:`, req.query);

      const parseArray = (value: any): string[] | undefined => {
        if (!value) return undefined;
        if (Array.isArray(value)) return value as string[];
        return [value as string];
      };

      // Extract and validate query parameters
      const queryParams: ReportQueryParams = {
        dateFrom: req.query.dateFrom as string,
        dateTo: req.query.dateTo as string,
        model: req.query.model as string,
        models: parseArray(req.query.models),
        productionSites: parseArray(req.query.productionSites),
        customerSites: parseArray(req.query.customerSites),
        productFamilies: parseArray(req.query.productFamilies),
        productTypes: parseArray(req.query.productTypes),
      };

      // Remove undefined values
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key as keyof ReportQueryParams] === undefined) {
          delete queryParams[key as keyof ReportQueryParams];
        }
      });

      const result = await this.service.getDPPMDashboard(queryParams);

      if (result.success) {
        console.log(`✅ GET /api/report/dppm-dashboard - Success: ${result.data?.length || 0} records`);
        res.status(200).json(result);
      } else {
        console.log(`❌ GET /api/report/dppm-dashboard - Error: ${result.message}`);
        res.status(400).json(result);
      }

    } catch (error) {
      console.error('❌ Error in ReportController.getDPPMDashboard:', error);
      next(error);
    }
  };

  /**
   * GET /api/report/underkill-dashboard
   * Get Underkill Dashboard data with month period and models filtering
   */
  getUnderkillDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log(`📊 GET /api/report/underkill-dashboard - Query params:`, req.query);

      const parseArray = (value: any): string[] | undefined => {
        if (!value) return undefined;
        if (Array.isArray(value)) return value as string[];
        return [value as string];
      };

      // Extract and validate query parameters
      const queryParams: ReportQueryParams = {
        dateFrom: req.query.dateFrom as string,
        dateTo: req.query.dateTo as string,
        model: req.query.model as string,
        models: parseArray(req.query.models),
        productionSites: parseArray(req.query.productionSites),
        customerSites: parseArray(req.query.customerSites),
        productFamilies: parseArray(req.query.productFamilies),
        productTypes: parseArray(req.query.productTypes),
      };

      // Remove undefined values
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key as keyof ReportQueryParams] === undefined) {
          delete queryParams[key as keyof ReportQueryParams];
        }
      });

      const result = await this.service.getUnderkillDashboard(queryParams);

      if (result.success) {
        console.log(`✅ GET /api/report/underkill-dashboard - Success: ${result.data?.length || 0} records`);
        res.status(200).json(result);
      } else {
        console.log(`❌ GET /api/report/underkill-dashboard - Error: ${result.message}`);
        res.status(400).json(result);
      }

    } catch (error) {
      console.error('❌ Error in ReportController.getUnderkillDashboard:', error);
      next(error);
    }
  };


  /**
   * GET /api/report/top-defect
   * Get Top Defect data with date range filtering
   */
  getTopDefect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log(`📊 GET /api/report/top-defect - Query params:`, req.query);

      // Extract and validate query parameters
      const queryParams: ReportQueryParams = {
        dateFrom: req.query.dateFrom as string,
        dateTo: req.query.dateTo as string,
        productionSites: req.query.productionSites ? (Array.isArray(req.query.productionSites) ? req.query.productionSites as string[] : [req.query.productionSites as string]) : undefined,
        customerSites: req.query.customerSites ? (Array.isArray(req.query.customerSites) ? req.query.customerSites as string[] : [req.query.customerSites as string]) : undefined,
        productFamilies: req.query.productFamilies ? (Array.isArray(req.query.productFamilies) ? req.query.productFamilies as string[] : [req.query.productFamilies as string]) : undefined,
        productTypes: req.query.productTypes ? (Array.isArray(req.query.productTypes) ? req.query.productTypes as string[] : [req.query.productTypes as string]) : undefined,
        models: req.query.models ? (Array.isArray(req.query.models) ? req.query.models as string[] : [req.query.models as string]) : undefined,
      };

      // Remove undefined values
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key as keyof ReportQueryParams] === undefined) {
          delete queryParams[key as keyof ReportQueryParams];
        }
      });

      const result = await this.service.getTopDefect(queryParams);

      if (result.success) {
        console.log(`✅ GET /api/report/top-defect - Success: ${result.data?.length || 0} records`);
        res.status(200).json(result);
      } else {
        console.log(`❌ GET /api/report/top-defect - Error: ${result.message}`);
        res.status(400).json(result);
      }

    } catch (error) {
      console.error('❌ Error in ReportController.getTopDefect:', error);
      next(error);
    }
  };

  // ==================== NEW ANALYTICS CONTROLLERS ====================

  /**
   * GET /api/report/production-line-heatmap
   * Get production line quality heatmap data
   */
  getProductionLineHeatmap = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log(`📊 GET /api/report/production-line-heatmap - Query params:`, req.query);

      const queryParams: ReportQueryParams = {
        dateFrom: req.query.dateFrom as string,
        dateTo: req.query.dateTo as string
      };

      Object.keys(queryParams).forEach(key => {
        if (queryParams[key as keyof ReportQueryParams] === undefined) {
          delete queryParams[key as keyof ReportQueryParams];
        }
      });

      const result = await this.service.getProductionLineHeatmap(queryParams);

      if (result.success) {
        console.log(`✅ GET /api/report/production-line-heatmap - Success: ${result.data?.length || 0} records`);
        res.status(200).json(result);
      } else {
        console.log(`❌ GET /api/report/production-line-heatmap - Error: ${result.message}`);
        res.status(400).json(result);
      }

    } catch (error) {
      console.error('❌ Error in ReportController.getProductionLineHeatmap:', error);
      next(error);
    }
  };

  /**
   * GET /api/report/product-quality-scorecard
   * Get product quality scorecard data
   */
  getProductQualityScorecard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log(`📊 GET /api/report/product-quality-scorecard - Query params:`, req.query);

      const queryParams: ReportQueryParams = {
        dateFrom: req.query.dateFrom as string,
        dateTo: req.query.dateTo as string
      };

      Object.keys(queryParams).forEach(key => {
        if (queryParams[key as keyof ReportQueryParams] === undefined) {
          delete queryParams[key as keyof ReportQueryParams];
        }
      });

      const result = await this.service.getProductQualityScorecard(queryParams);

      if (result.success) {
        console.log(`✅ GET /api/report/product-quality-scorecard - Success: ${result.data?.length || 0} records`);
        res.status(200).json(result);
      } else {
        console.log(`❌ GET /api/report/product-quality-scorecard - Error: ${result.message}`);
        res.status(400).json(result);
      }

    } catch (error) {
      console.error('❌ Error in ReportController.getProductQualityScorecard:', error);
      next(error);
    }
  };

  /**
   * GET /api/report/defect-root-cause
   * Get defect root cause analysis data
   */
  getDefectRootCause = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log(`📊 GET /api/report/defect-root-cause - Query params:`, req.query);

      const queryParams: ReportQueryParams = {
        dateFrom: req.query.dateFrom as string,
        dateTo: req.query.dateTo as string
      };

      Object.keys(queryParams).forEach(key => {
        if (queryParams[key as keyof ReportQueryParams] === undefined) {
          delete queryParams[key as keyof ReportQueryParams];
        }
      });

      const result = await this.service.getDefectRootCause(queryParams);

      if (result.success) {
        console.log(`✅ GET /api/report/defect-root-cause - Success: ${result.data?.length || 0} records`);
        res.status(200).json(result);
      } else {
        console.log(`❌ GET /api/report/defect-root-cause - Error: ${result.message}`);
        res.status(400).json(result);
      }

    } catch (error) {
      console.error('❌ Error in ReportController.getDefectRootCause:', error);
      next(error);
    }
  };

  /**
   * GET /api/report/monthly-quality-trend
   * Get monthly quality trend data
   */
  getMonthlyQualityTrend = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log(`📊 GET /api/report/monthly-quality-trend - Query params:`, req.query);

      const queryParams: ReportQueryParams = {
        dateFrom: req.query.dateFrom as string,
        dateTo: req.query.dateTo as string
      };

      Object.keys(queryParams).forEach(key => {
        if (queryParams[key as keyof ReportQueryParams] === undefined) {
          delete queryParams[key as keyof ReportQueryParams];
        }
      });

      const result = await this.service.getMonthlyQualityTrend(queryParams);

      if (result.success) {
        console.log(`✅ GET /api/report/monthly-quality-trend - Success: ${result.data?.length || 0} records`);
        res.status(200).json(result);
      } else {
        console.log(`❌ GET /api/report/monthly-quality-trend - Error: ${result.message}`);
        res.status(400).json(result);
      }

    } catch (error) {
      console.error('❌ Error in ReportController.getMonthlyQualityTrend:', error);
      next(error);
    }
  };

  /**
   * GET /api/report/getModelsSGAIQA
   * Get available models for Seagate IQA filtering
   * Optional query params: year, ww (combined into fyww), or fyww directly
   */
  getModelsSGAIQA = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { year, ww, fyww } = req.query;
      // Support both fyww param directly or combine year+ww
      const fywwValue = fyww as string | undefined
        || (year && ww ? `${year}${String(ww).padStart(2, '0')}` : undefined);
      console.log(`📋 GET /api/report/getModelsSGAIQA - fyww: ${fywwValue}`);

      const result = await this.service.getModelsSGAIQA(fywwValue);

      if (result.success) {
        console.log(`✅ GET /api/report/getModelsSGAIQA - Success: ${result.data?.length || 0} models`);
        res.status(200).json(result);
      } else {
        console.log(`❌ GET /api/report/getModelsSGAIQA - Error: ${result.message}`);
        res.status(400).json(result);
      }

    } catch (error) {
      console.error('❌ Error in LARReportController.getModelsSGAIQA:', error);
      next(error);
    }
  };

  /**
   * GET /api/report/productFamiliesSGAIQA
   * Get available product families for Seagate IQA filtering (without versions)
   * Optional query params: year, ww (combined into fyww), or fyww directly
   */
  getProductFamiliesSGAIQA = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { year, ww, fyww } = req.query;
      const fywwValue = fyww as string | undefined
        || (year && ww ? `${year}${String(ww).padStart(2, '0')}` : undefined);
      console.log(`📋 GET /api/report/productFamiliesSGAIQA - fyww: ${fywwValue}`);

      const result = await this.service.getProductFamiliesSGAIQA(fywwValue);

      if (result.success) {
        console.log(`✅ GET /api/report/productFamiliesSGAIQA - Success: ${result.data?.length || 0} product families`);
        res.status(200).json(result);
      } else {
        console.log(`❌ GET /api/report/productFamiliesSGAIQA - Error: ${result.message}`);
        res.status(400).json(result);
      }

    } catch (error) {
      console.error('❌ Error in LARReportController.getProductFamiliesSGAIQA:', error);
      next(error);
    }
  };

  /**
   * GET /api/report-lar/fiscal-years
   * Get available fiscal years for filtering
   */
  getFiscalYears = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log(`📋 GET /api/report-lar/fiscal-years`);

      const { report} = req.params;

      const result = await this.service.getFiscalYears(report);

      if (result.success) {
        console.log(`✅ GET /api/report-lar/fiscal-years - Success: ${result.data?.length || 0} fiscal years`);
        res.status(200).json(result);
      } else {
        console.log(`❌ GET /api/report-lar/fiscal-years - Error: ${result.message}`);
        res.status(400).json(result);
      }

    } catch (error) {
      console.error('❌ Error in LARReportController.getFiscalYears:', error);
      next(error);
    }
  };

  /**
   * GET /api/report-lar/work-weeks?fy=2025
   * Get available work weeks for filtering (optionally filtered by fiscal year)
   */
  getWorkWeeks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const fiscalYear = req.query.fy as string | undefined;
      console.log(`📋 GET /api/report-lar/work-weeks - fiscalYear:`, fiscalYear);
      const { report} = req.params;
      const result = await this.service.getWorkWeeks(report, fiscalYear);

      if (result.success) {
        console.log(`✅ GET /api/report-lar/work-weeks - Success: ${result.data?.length || 0} work weeks`);
        res.status(200).json(result);
      } else {
        console.log(`❌ GET /api/report-lar/work-weeks - Error: ${result.message}`);
        res.status(400).json(result);
      }

    } catch (error) {
      console.error('❌ Error in LARReportController.getWorkWeeks:', error);
      next(error);
    }
  };

  /**
   * GET /api/report-lar/seagate-iqa-result?year=2025&ww=09
   * Get Seagate IQA Result report data for a specific fiscal year and work week
   */
  getSeagateIQAResult = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const yearFrom = req.query.yearFrom as string;
      const wwFrom = req.query.wwFrom as string;

      console.log(`📊 GET /api/report-lar/seagate-iqa-result - Query params:`, { yearFrom, wwFrom });

      if (!yearFrom || !wwFrom) {
        res.status(400).json({
          success: false,
          message: 'Year and WW parameters are required'
        });
        return;
      }

      const result = await this.service.getSeagateIQAResult({ yearFrom, wwFrom });

      if (result.success) {
        console.log(`✅ GET /api/report-lar/seagate-iqa-result - Success: ${result.data?.length || 0} records`);
        res.status(200).json(result);
      } else {
        console.log(`❌ GET /api/report-lar/seagate-iqa-result - Error: ${result.message}`);
        res.status(400).json(result);
      }

    } catch (error) {
      console.error('❌ Error in ReportController.getSeagateIQAResult:', error);
      next(error);
    }
  };

  // ==================== HISTORY TRACKING ENDPOINT ====================

  /**
   * GET /api/report/history-tracking?lotNumbers=LOT1,LOT2,LOT3
   * Get History Tracking data by lot numbers (comma-separated)
   */
  getHistoryTracking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log(`📊 GET /api/report/history-tracking - Query params:`, req.query);

      const lotNumbersParam = req.query.lotNumbers as string;

      if (!lotNumbersParam) {
        res.status(400).json({
          success: false,
          message: 'lotNumbers query parameter is required'
        });
        return;
      }

      // Split comma-separated string into array
      const lotNumbers = lotNumbersParam.split(',').map(s => s.trim()).filter(s => s.length > 0);

      const result = await this.service.getHistoryTracking(lotNumbers);

      if (result.success) {
        console.log(`✅ GET /api/report/history-tracking - Success: ${result.data?.length || 0} records`);
        res.status(200).json(result);
      } else {
        console.log(`❌ GET /api/report/history-tracking - Error: ${result.message}`);
        res.status(400).json(result);
      }

    } catch (error) {
      console.error('❌ Error in ReportController.getHistoryTracking:', error);
      next(error);
    }
  };

  // ==================== DEFECT IMAGE SUMMARY ENDPOINT ====================

  /**
   * GET /api/report/defect-image-summary
   * Get Defect Image Summary data grouped by defect name
   */
  getDefectImageSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log(`📊 GET /api/report/defect-image-summary - Query params:`, req.query);

      // Helper to parse query param as string array
      const parseArray = (value: any): string[] | undefined => {
        if (!value) return undefined;
        if (Array.isArray(value)) return value as string[];
        return [value as string];
      };

      const params: DefectImageSummaryParams = {
        dateFrom: req.query.dateFrom as string,
        dateTo: req.query.dateTo as string,
        sites: parseArray(req.query.sites),
        customerSites: parseArray(req.query.customerSites),
        productFamilies: parseArray(req.query.productFamilies),
        productTypes: parseArray(req.query.productTypes),
        models: parseArray(req.query.models),
        defects: parseArray(req.query.defects),
      };

      if (!params.dateFrom || !params.dateTo) {
        res.status(400).json({
          success: false,
          message: 'dateFrom and dateTo query parameters are required'
        });
        return;
      }

      const result = await this.service.getDefectImageSummary(params);

      if (result.success) {
        console.log(`✅ GET /api/report/defect-image-summary - Success: ${result.data?.length || 0} records`);
        res.status(200).json(result);
      } else {
        console.log(`❌ GET /api/report/defect-image-summary - Error: ${result.message}`);
        res.status(400).json(result);
      }

    } catch (error) {
      console.error('❌ Error in ReportController.getDefectImageSummary:', error);
      next(error);
    }
  };

  /**
   * GET /api/report/parts-filter-options?customerSites=...&productFamilies=...&productTypes=...
   * Get product families, product types, and models with cascading filter support
   */
  getPartsFilterOptions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parseArray = (value: any): string[] | undefined => {
        if (!value) return undefined;
        if (Array.isArray(value)) return value as string[];
        return [value as string];
      };

      // Support both customerSite (single) and customerSites (array) for backward compat
      let customerSites: string[];
      if (req.query.customerSites) {
        customerSites = parseArray(req.query.customerSites)!;
      } else if (req.query.customerSite) {
        customerSites = [req.query.customerSite as string];
      } else {
        res.status(400).json({ success: false, message: 'customerSites query parameter is required' });
        return;
      }

      const productFamilies = parseArray(req.query.productFamilies);
      const productTypes = parseArray(req.query.productTypes);

      const result = await this.service.getPartsFilterOptions({
        customerSites,
        productFamilies,
        productTypes,
      });

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('❌ Error in ReportController.getPartsFilterOptions:', error);
      next(error);
    }
  };

  // ==================== OQA DPPM OVerall ENDPOINTS ====================
  /**
   * GET /api/report/iqa-oqa-dppm-overall-chart
   * Get IQA OQA DPPM OVerall chart data
   */
  getIQAOQADppmOverallChart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log(`📊 GET /api/report/iqa-oqa-dppm-overall-chart - Query params:`, req.query);

      // Extract and validate query parameters
      const queryParams: ReportQueryParams = {
        yearTo: req.query.yearTo as string,
        wwTo: req.query.wwTo as string
      };

      // Remove undefined values
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key as keyof ReportQueryParams] === undefined) {
          delete queryParams[key as keyof ReportQueryParams];
        }
      });

      const result = await this.service.getIQAOQADppmOverallChart(queryParams);

      if (result.success) {
        console.log(`✅ GET /api/report/iqa-oqa-dppm-overall-chart - Success: ${result.data?.length || 0} records`);
        res.status(200).json(result);
      } else {
        console.log(`❌ GET /api/report/iqa-oqa-dppm-overall-chart - Error: ${result.message}`);
        res.status(400).json(result);
      }

    } catch (error) {
      console.error('❌ Error in ReportController.getIQAOQADPPMOverallChart:', error);
      next(error);
    }
  };

  /**
   * GET /api/report/oqa-dppm-overall-chart
   * Get OQA DPPM OVerall chart data
   */
  getOQADppmOverallChart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log(`📊 GET /api/report/oqa-dppm-overall-chart - Query params:`, req.query);

      // Extract and validate query parameters
      const queryParams: ReportQueryParams = {
        yearFrom: req.query.year as string,
        wwFrom: req.query.ww as string
      };

      // Remove undefined values
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key as keyof ReportQueryParams] === undefined) {
          delete queryParams[key as keyof ReportQueryParams];
        }
      });

      const result = await this.service.getOQADppmOverallChart(queryParams);

      if (result.success) {
        console.log(`✅ GET /api/report/oqa-dppm-overall-chart - Success: ${result.data?.length || 0} records`);
        res.status(200).json(result);
      } else {
        console.log(`❌ GET /api/report/oqa-dppm-overall-chart - Error: ${result.message}`);
        res.status(400).json(result);
      }

    } catch (error) {
      console.error('❌ Error in ReportController.getOQADPPMOverallChart:', error);
      next(error);
    }
  };

  /**
   * GET /api/report/oqa-dppm-overall-defect
   * Get OQA DPPM OVerall defect data
   */
  getOQADppmOverallDefect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log(`📊 GET /api/report/oqa-dppm-overall-defect - Query params:`, req.query);

      // Extract and validate query parameters
      const queryParams: ReportQueryParams = {
        yearFrom: req.query.yearFrom as string,
        wwFrom: req.query.wwFrom as string
      };

      // Remove undefined values
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key as keyof ReportQueryParams] === undefined) {
          delete queryParams[key as keyof ReportQueryParams];
        }
      });

      const result = await this.service.getOQADppmOverallDefect(queryParams);

      if (result.success) {
        console.log(`✅ GET /api/report/oqa-dppm-overall-defect - Success: ${result.data?.length || 0} defect records`);
        res.status(200).json(result);
      } else {
        console.log(`❌ GET /api/report/oqa-dppm-overall-defect - Error: ${result.message}`);
        res.status(400).json(result);
      }

    } catch (error) {
      console.error('❌ Error in ReportController.getOQADPPMOverallDefect:', error);
      next(error);
    }
  };

  // ==================== SGT IQA TREND ENDPOINTS ====================

  /**
   * GET /api/report/sgt-iqa-trend-chart
   * Get SGT IQA Trend chart data
   */
  getSGTIQATrendChart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log(`📊 GET /api/report/sgt-iqa-trend-chart - Query params:`, req.query);

      // Extract and validate query parameters
      // Support both year/ww and yearTo/wwTo for flexibility
      const queryParams: ReportQueryParams = {
        yearTo: (req.query.year || req.query.yearTo) as string,
        wwTo: (req.query.ww || req.query.wwTo) as string,
        model: req.query.model as string,
        models: req.query.models ? (Array.isArray(req.query.models) ? req.query.models as string[] : [req.query.models as string]) : undefined,
        productFamilies: req.query.productFamilies ? (Array.isArray(req.query.productFamilies) ? req.query.productFamilies as string[] : [req.query.productFamilies as string]) : undefined,
        product_type: req.query.product_type as string
      };

      // Remove undefined values
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key as keyof ReportQueryParams] === undefined) {
          delete queryParams[key as keyof ReportQueryParams];
        }
      });

      const result = await this.service.getSGTIQATrendChart(queryParams);

      if (result.success) {
        console.log(`✅ GET /api/report/sgt-iqa-trend-chart - Success: ${result.data?.length || 0} records`);
        res.status(200).json(result);
      } else {
        console.log(`❌ GET /api/report/sgt-iqa-trend-chart - Error: ${result.message}`);
        res.status(400).json(result);
      }

    } catch (error) {
      console.error('❌ Error in ReportController.getSGTIQATrendChart:', error);
      next(error);
    }
  };

  /**
   * GET /api/report/sgt-iqa-trend-defect
   * Get SGT IQA Trend defect data
   */
  getSGTIQATrendDefect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log(`📊 GET /api/report/sgt-iqa-trend-defect - Query params:`, req.query);

      // Extract and validate query parameters
      // Support both year/ww and yearTo/wwTo for flexibility
      const queryParams: ReportQueryParams = {
        yearTo: (req.query.year || req.query.yearTo) as string,
        wwTo: (req.query.ww || req.query.wwTo) as string,
        model: req.query.model as string,
        models: req.query.models ? (Array.isArray(req.query.models) ? req.query.models as string[] : [req.query.models as string]) : undefined,
        productFamilies: req.query.productFamilies ? (Array.isArray(req.query.productFamilies) ? req.query.productFamilies as string[] : [req.query.productFamilies as string]) : undefined,
        product_type: req.query.product_type as string
      };

      // Remove undefined values
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key as keyof ReportQueryParams] === undefined) {
          delete queryParams[key as keyof ReportQueryParams];
        }
      });

      const result = await this.service.getSGTIQATrendDefect(queryParams);

      if (result.success) {
        console.log(`✅ GET /api/report/sgt-iqa-trend-defect - Success: ${result.data?.length || 0} defect records`);
        res.status(200).json(result);
      } else {
        console.log(`❌ GET /api/report/sgt-iqa-trend-defect - Error: ${result.message}`);
        res.status(400).json(result);
      }

    } catch (error) {
      console.error('❌ Error in ReportController.getSGTIQATrendDefect:', error);
      next(error);
    }
  };

  // ==================== OQA VISUAL INSPECTION ====================

  /**
   * GET /api/report/oqa-vi-dashboard
   * Get OQA Visual Inspection dashboard data (combo charts per model)
   */
  getOQAVisualInspection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log(`📊 GET /api/report/oqa-vi-dashboard - Query params:`, req.query);

      const parseArray = (value: any): string[] | undefined => {
        if (!value) return undefined;
        if (Array.isArray(value)) return value as string[];
        return [value as string];
      };

      const queryParams: ReportQueryParams = {
        isCustomerReport: req.query.isCustomerReport === 'true',
        dateFrom: req.query.dateFrom as string,
        dateTo: req.query.dateTo as string,
        model: req.query.model as string,
        models: parseArray(req.query.models),
        productionSites: parseArray(req.query.productionSites),
        customerSites: parseArray(req.query.customerSites),
        productFamilies: parseArray(req.query.productFamilies),
        productTypes: parseArray(req.query.productTypes),
      };

      // Remove undefined values
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key as keyof ReportQueryParams] === undefined) {
          delete queryParams[key as keyof ReportQueryParams];
        }
      });

      const result = await this.service.getOQAVisualInspection(queryParams);

      if (result.success) {
        console.log(`✅ GET /api/report/oqa-vi-dashboard - Success: ${result.data?.length || 0} records`);
        res.status(200).json(result);
      } else {
        console.log(`❌ GET /api/report/oqa-vi-dashboard - Error: ${result.message}`);
        res.status(400).json(result);
      }

    } catch (error) {
      console.error('❌ Error in ReportController.getOQAVisualInspection:', error);
      next(error);
    }
  };

  // ==================== DEFECT TYPE ANALYSIS ====================

  /**
   * GET /api/report/defect-type-analysis
   * Get Defect Type Analysis data with date range filtering
   */
  getDefectTypeAnalysis = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log(`📊 GET /api/report/defect-type-analysis - Query params:`, req.query);

      const dateFrom = req.query.dateFrom as string;
      const dateTo = req.query.dateTo as string;
      const models = req.query.models
        ? (Array.isArray(req.query.models) ? req.query.models as string[] : [req.query.models as string])
        : undefined;
      const shifts = req.query.shifts
        ? (Array.isArray(req.query.shifts) ? req.query.shifts as string[] : [req.query.shifts as string])
        : undefined;

      if (!dateFrom || !dateTo) {
        res.status(400).json({
          success: false,
          message: 'dateFrom and dateTo query parameters are required'
        });
        return;
      }

      const result = await this.service.getDefectTypeAnalysis(dateFrom, dateTo, models, shifts);

      if (result.success) {
        console.log(`✅ GET /api/report/defect-type-analysis - Success: ${result.data?.length || 0} records`);
        res.status(200).json(result);
      } else {
        console.log(`❌ GET /api/report/defect-type-analysis - Error: ${result.message}`);
        res.status(400).json(result);
      }

    } catch (error) {
      console.error('❌ Error in ReportController.getDefectTypeAnalysis:', error);
      next(error);
    }
  };

  // ==================== OVERVIEW OQA ====================

  /**
   * GET /api/report/overview-oqa
   * Get Overview OQA data with FY/WW and optional models filtering
   */
  getOverviewOQA = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log(`📊 GET /api/report/overview-oqa - Query params:`, req.query);

      const yearFrom = req.query.yearFrom as string;
      const wwFrom = req.query.wwFrom as string;
      const models = req.query.models
        ? (Array.isArray(req.query.models) ? req.query.models as string[] : [req.query.models as string])
        : undefined;

      if (!yearFrom || !wwFrom) {
        res.status(400).json({
          success: false,
          message: 'yearFrom and wwFrom parameters are required'
        });
        return;
      }

      const result = await this.service.getOverviewOQA({ yearFrom, wwFrom, models });

      if (result.success) {
        console.log(`✅ GET /api/report/overview-oqa - Success: ${result.data?.length || 0} records`);
        res.status(200).json(result);
      } else {
        console.log(`❌ GET /api/report/overview-oqa - Error: ${result.message}`);
        res.status(400).json(result);
      }

    } catch (error) {
      console.error('❌ Error in ReportController.getOverviewOQA:', error);
      next(error);
    }
  };

  /**
   * GET /api/report/overview-oqa-lot-detail
   * Get lot-level NG detail for a specific product and defect group
   */
  getOverviewOQALotDetail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const fy = req.query.fy as string;
      const ww = req.query.ww as string;
      const partno_customer = req.query.partno_customer as string;
      const defect_group = req.query.defect_group as string;

      if (!fy || !ww || !partno_customer || !defect_group) {
        res.status(400).json({
          success: false,
          message: 'fy, ww, partno_customer and defect_group parameters are required'
        });
        return;
      }

      const result = await this.service.getOverviewOQALotDetail(fy, ww, partno_customer, defect_group);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('❌ Error in ReportController.getOverviewOQALotDetail:', error);
      next(error);
    }
  };

  // ==================== FVI INSPECTION ====================

  getSOQMWeekly = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log(`📊 GET /api/report/soqm-weekly - Query params:`, req.query);

      const parseArray = (value: any): string[] | undefined => {
        if (!value) return undefined;
        if (Array.isArray(value)) return value as string[];
        return [value as string];
      };

      const queryParams: ReportQueryParams = {
        yearFrom: req.query.yearFrom as string,
        wwFrom: req.query.wwFrom as string,
        yearTo: req.query.yearTo as string,
        wwTo: req.query.wwTo as string,
        model: req.query.model as string,
        models: parseArray(req.query.models),
        customerSites: parseArray(req.query.customerSites),
        lotno: req.query.lotno as string | undefined,
      };

      Object.keys(queryParams).forEach(key => {
        if (queryParams[key as keyof ReportQueryParams] === undefined) {
          delete queryParams[key as keyof ReportQueryParams];
        }
      });

      const result = await this.service.getSOQMWeekly(queryParams);

      if (result.success) {
        console.log(`✅ GET /api/report/soqm-weekly - Success`);
        res.status(200).json(result);
      } else {
        console.log(`❌ GET /api/report/soqm-weekly - Error: ${result.message}`);
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('❌ Error in ReportController.getSOQMWeekly:', error);
      next(error);
    }
  };

  getSOQMDaily = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log(`📊 GET /api/report/soqm-daily - Query params:`, req.query);

      const parseArray = (value: any): string[] | undefined => {
        if (!value) return undefined;
        if (Array.isArray(value)) return value as string[];
        return [value as string];
      };

      const queryParams: ReportQueryParams = {
        yearFrom: req.query.yearFrom as string,
        wwFrom: req.query.wwFrom as string,
        yearTo: req.query.yearTo as string,
        wwTo: req.query.wwTo as string,
        model: req.query.model as string,
        models: parseArray(req.query.models),
        customerSites: parseArray(req.query.customerSites),
        lotno: req.query.lotno as string | undefined,
      };

      // Remove undefined values
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key as keyof ReportQueryParams] === undefined) {
          delete queryParams[key as keyof ReportQueryParams];
        }
      });

      const result = await this.service.getSOQMDaily(queryParams);

      if (result.success) {
        console.log(`✅ GET /api/report/soqm-daily - Success: ${result.data?.length || 0} records`);
        res.status(200).json(result);
      } else {
        console.log(`❌ GET /api/report/soqm-daily - Error: ${result.message}`);
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('❌ Error in ReportController.getSOQMDaily:', error);
      next(error);
    }
  };

  getFVIInspection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log(`📊 GET /api/report/fvi-inspection - Query params:`, req.query);

      const params = {
        inputDateFrom: req.query.inputDateFrom as string | undefined,
        inputDateTo: req.query.inputDateTo as string | undefined,
        lotno: req.query.lotno as string | undefined,
        judgment: req.query.judgment as string | undefined,
      };

      const result = await this.service.getFVIInspection(params);

      if (result.success) {
        console.log(`✅ GET /api/report/fvi-inspection - Success: ${result.data?.length || 0} records`);
        res.status(200).json(result);
      } else {
        console.log(`❌ GET /api/report/fvi-inspection - Error: ${result.message}`);
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('❌ Error in ReportController.getFVIInspection:', error);
      next(error);
    }
  };

  deleteFVILotInput = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const lotno = req.params.lotno;
      console.log(`🗑️ DELETE /api/report/fvi-inspection/lotno/${lotno}`);

      if (!lotno || !lotno.trim()) {
        res.status(400).json({ success: false, message: 'Lot number is required' });
        return;
      }

      const result = await this.service.deleteFVILotInput(lotno.trim());

      if (result.success) {
        console.log(`✅ DELETE fvi-inspection lotno - Success: ${result.deletedCount} deleted`);
        res.status(200).json(result);
      } else {
        console.log(`❌ DELETE fvi-inspection lotno - Error: ${result.message}`);
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('❌ Error in ReportController.deleteFVILotInput:', error);
      next(error);
    }
  };

}

// ==================== FACTORY FUNCTION ====================

/**
 * Factory function to create a Report controller instance
 */
export function createeportController(service: ReportService): ReportController {
  return new ReportController(service);
}

export default ReportController;

/*
=== REPORT CONTROLLER FEATURES ===

COMPLETE SEPARATION ARCHITECTURE:
✅ Self-contained HTTP request handling
✅ No dependencies on other entities
✅ Clean separation from business logic
✅ Standard Express controller pattern

CORE HTTP ENDPOINTS:
✅ GET /api/report-lar - Raw report data
✅ GET /api/report-lar/weekly - Aggregated weekly data
✅ GET /api/report-lar/statistics - Statistical summary
✅ GET /api/report-lar/health - Health check

REQUEST HANDLING:
✅ Query parameter extraction
✅ Type conversion (string to number)
✅ Parameter validation through service layer
✅ Undefined value cleanup

RESPONSE HANDLING:
✅ Proper HTTP status codes (200, 400, 503)
✅ Consistent JSON response format
✅ Comprehensive error handling
✅ Detailed logging for debugging

ERROR HANDLING:
✅ Try-catch blocks for all endpoints
✅ Express error middleware integration
✅ User-friendly error messages
✅ Console logging for troubleshooting

MANUFACTURING FOCUS:
✅ Work week filtering
✅ Station and round filtering
✅ Date range filtering
✅ LAR and DPPM metrics
*/
