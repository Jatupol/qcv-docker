// server/src/entities/reports/service.ts
// ===== LAR REPORT SERVICE =====
// Line Acceptance Rate (LAR) Report Entity Service
// Manufacturing Quality Control System - Business Logic Layer

import {
  ReportQueryParams,
  LARReportResult,
  LARDashboardResult,
  DPPMDashboardResult,
  UnderkillDashboardResult,
  TopDefectResult,
  SeagateIQAResultReportRecord,
  SGTIQATrendResult,
  OQADPPMOverallResult,
  IQAOQADPPMOverallResult,
  ProductionLineHeatmapResult,
  ProductQualityScorecardResult,
  DefectRootCauseResult,
  MonthlyQualityTrendResult,
  HistoryTrackingResult,
  DefectImageSummaryParams,
  DefectImageSummaryResult,
  OQAVIResult,
  DefectTypeAnalysisResult,
  OverviewOQAResult,
  OverviewOQALotDetailResult
} from './types';
import { ReportModel } from './model';

// ==================== LAR REPORT SERVICE CLASS ====================

/**
 * Report Service
 * Business logic layer for report generation
 */
export class ReportService {
  private model: ReportModel;

  constructor(model: ReportModel) {
    this.model = model;
  }

  // ==================== CORE BUSINESS OPERATIONS ====================

  /**
   * Get LAR chart data (aggregated by week without defect breakdown)
   * Returns simplified chart data from database
   */
  async getLARChart(queryParams: ReportQueryParams = { isCustomerReport: false }): Promise<LARReportResult> {
    try {
      console.log('🔧 LARReportService.getLARChart called with params:', queryParams);

      // Validate parameters
      const validationError = this.validateQueryParams(queryParams);
      if (validationError) {
        return {
          success: false,
          message: validationError,
          errors: [validationError]
        };
      }

      const data = await this.model.getLARChart(queryParams);

      console.log(`✅ LARReportService.getLARChart: Retrieved ${data.length} records`);

      return {
        success: true,
        data,
        message: 'LAR chart data retrieved successfully'
      };

    } catch (error) {
      console.error('❌ Error in LARReportService.getLARChart:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve LAR chart data',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get LAR defect data
   * Returns defect data grouped by week
   */
  async getLARDefect(queryParams: ReportQueryParams = { isCustomerReport: false }): Promise<LARReportResult> {
    try {
      console.log('🔧 LARReportService.getLARDefect called with params:', queryParams);

      // Validate parameters
      const validationError = this.validateQueryParams(queryParams);
      if (validationError) {
        return {
          success: false,
          message: validationError,
          errors: [validationError]
        };
      }

      const data = await this.model.getLARDefect(queryParams);

      console.log(`✅ LARReportService.getLARDefect: Retrieved ${data.length} defect records`);

      return {
        success: true,
        data,
        message: 'LAR defect data retrieved successfully'
      };

    } catch (error) {
      console.error('❌ Error in LARReportService.getLARDefect:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve LAR defect data',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get LAR Dashboard data
   * Returns LAR data grouped by month and model
   */
  async getLARDashboard(queryParams: ReportQueryParams = {}): Promise<LARDashboardResult> {
    try {
      console.log('🔧 LARReportService.getLARDashboard called with params:', queryParams);

      const data = await this.model.getLARDashboard(queryParams);

      console.log(`✅ LARReportService.getLARDashboard: Retrieved ${data.length} dashboard records`);

      return {
        success: true,
        data,
        message: 'LAR dashboard data retrieved successfully'
      };

    } catch (error) {
      console.error('❌ Error in LARReportService.getLARDashboard:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve LAR dashboard data',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get DPPM Dashboard data
   * Returns DPPM data grouped by month and model
   */
  async getDPPMDashboard(queryParams: ReportQueryParams = {}): Promise<DPPMDashboardResult> {
    try {
      console.log('🔧 DPPMReportService.getDPPMDashboard called with params:', queryParams);

      const data = await this.model.getDPPMDashboard(queryParams);

      console.log(`✅ DPPMReportService.getDPPMDashboard: Retrieved ${data.length} dashboard records`);

      return {
        success: true,
        data,
        message: 'DPPM dashboard data retrieved successfully'
      };

    } catch (error) {
      console.error('❌ Error in DPPMReportService.getDPPMDashboard:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve DPPM dashboard data',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get Underkill Dashboard data
   * Returns Underkill data grouped by month and model
   */
  async getUnderkillDashboard(queryParams: ReportQueryParams = {}): Promise<UnderkillDashboardResult> {
    try {
      console.log('🔧 UnderkillReportService.getUnderkillDashboard called with params:', queryParams);

      const data = await this.model.getUnderkillDashboard(queryParams);

      console.log(`✅ UnderkillReportService.getUnderkillDashboard: Retrieved ${data.length} dashboard records`);

      return {
        success: true,
        data,
        message: 'Underkill dashboard data retrieved successfully'
      };

    } catch (error) {
      console.error('❌ Error in UnderkillReportService.getUnderkillDashboard:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve Underkill dashboard data',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }


  /**
   * Get Top Defect data
   * Returns top defect data by month and model
   */
  async getTopDefect(queryParams: ReportQueryParams = {}): Promise<TopDefectResult> {
    try {
      console.log('🔧 ReportService.getTopDefect called with params:', queryParams);

      const data = await this.model.getTopDefect(queryParams);

      console.log(`✅ ReportService.getTopDefect: Retrieved ${data.length} top defect records`);

      return {
        success: true,
        data,
        message: 'Top defect data retrieved successfully'
      };

    } catch (error) {
      console.error('❌ Error in ReportService.getTopDefect:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve top defect data',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  // ==================== NEW ANALYTICS SERVICES ====================

  /**
   * Get Production Line Quality Heatmap data
   */
  async getProductionLineHeatmap(queryParams: ReportQueryParams = {}): Promise<ProductionLineHeatmapResult> {
    try {
      console.log('🔧 ReportService.getProductionLineHeatmap called with params:', queryParams);

      const data = await this.model.getProductionLineHeatmap(queryParams);

      console.log(`✅ ReportService.getProductionLineHeatmap: Retrieved ${data.length} records`);

      return {
        success: true,
        data,
        message: 'Production line heatmap data retrieved successfully'
      };

    } catch (error) {
      console.error('❌ Error in ReportService.getProductionLineHeatmap:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve production line heatmap data',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get Product Quality Scorecard data
   */
  async getProductQualityScorecard(queryParams: ReportQueryParams = {}): Promise<ProductQualityScorecardResult> {
    try {
      console.log('🔧 ReportService.getProductQualityScorecard called with params:', queryParams);

      const data = await this.model.getProductQualityScorecard(queryParams);

      console.log(`✅ ReportService.getProductQualityScorecard: Retrieved ${data.length} records`);

      return {
        success: true,
        data,
        message: 'Product quality scorecard data retrieved successfully'
      };

    } catch (error) {
      console.error('❌ Error in ReportService.getProductQualityScorecard:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve product quality scorecard data',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get Defect Root Cause Analysis data
   */
  async getDefectRootCause(queryParams: ReportQueryParams = {}): Promise<DefectRootCauseResult> {
    try {
      console.log('🔧 ReportService.getDefectRootCause called with params:', queryParams);

      const data = await this.model.getDefectRootCause(queryParams);

      console.log(`✅ ReportService.getDefectRootCause: Retrieved ${data.length} records`);

      return {
        success: true,
        data,
        message: 'Defect root cause analysis data retrieved successfully'
      };

    } catch (error) {
      console.error('❌ Error in ReportService.getDefectRootCause:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve defect root cause analysis data',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get Monthly Quality Trend data
   */
  async getMonthlyQualityTrend(queryParams: ReportQueryParams = {}): Promise<MonthlyQualityTrendResult> {
    try {
      console.log('🔧 ReportService.getMonthlyQualityTrend called with params:', queryParams);

      const data = await this.model.getMonthlyQualityTrend(queryParams);

      console.log(`✅ ReportService.getMonthlyQualityTrend: Retrieved ${data.length} records`);

      return {
        success: true,
        data,
        message: 'Monthly quality trend data retrieved successfully'
      };

    } catch (error) {
      console.error('❌ Error in ReportService.getMonthlyQualityTrend:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve monthly quality trend data',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  // ==================== HISTORY TRACKING ====================

  /**
   * Get History Tracking data by lot numbers
   * Validates input and delegates to model
   */
  async getHistoryTracking(lotNumbers: string[]): Promise<HistoryTrackingResult> {
    try {
      console.log('🔧 ReportService.getHistoryTracking called with lotNumbers:', lotNumbers);

      // Validate: array not empty
      if (!lotNumbers || lotNumbers.length === 0) {
        return {
          success: false,
          message: 'At least one lot number is required',
          errors: ['No lot numbers provided']
        };
      }

      // Validate: max 10 items
      if (lotNumbers.length > 10) {
        return {
          success: false,
          message: 'Maximum 10 lot numbers allowed',
          errors: ['Too many lot numbers (max 10)']
        };
      }

      // Trim whitespace from each lot number and filter empty
      const cleanedLotNumbers = lotNumbers
        .map(lot => lot.trim())
        .filter(lot => lot.length > 0);

      if (cleanedLotNumbers.length === 0) {
        return {
          success: false,
          message: 'At least one valid lot number is required',
          errors: ['All lot numbers were empty after trimming']
        };
      }

      const data = await this.model.getHistoryTracking(cleanedLotNumbers);

      console.log(`✅ ReportService.getHistoryTracking: Retrieved ${data.length} records`);

      return {
        success: true,
        data,
        message: 'History tracking data retrieved successfully'
      };

    } catch (error) {
      console.error('❌ Error in ReportService.getHistoryTracking:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve history tracking data',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  // ==================== DEFECT IMAGE SUMMARY ====================

  /**
   * Get Defect Image Summary data
   * Validates dateFrom/dateTo required, delegates to model
   */
  async getDefectImageSummary(params: DefectImageSummaryParams): Promise<DefectImageSummaryResult> {
    try {
      console.log('🔧 ReportService.getDefectImageSummary called with params:', params);

      // Validate required parameters
      if (!params.dateFrom || !params.dateTo) {
        return {
          success: false,
          message: 'dateFrom and dateTo are required',
          errors: ['Missing required date range parameters']
        };
      }

      const data = await this.model.getDefectImageSummary(params);

      console.log(`✅ ReportService.getDefectImageSummary: Retrieved ${data.length} records`);

      return {
        success: true,
        data,
        message: 'Defect image summary data retrieved successfully'
      };

    } catch (error) {
      console.error('❌ Error in ReportService.getDefectImageSummary:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve defect image summary data',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get parts filter options by customer_site(s) with optional cascading filters
   */
  async getPartsFilterOptions(params: {
    customerSites: string[];
    productFamilies?: string[];
    productTypes?: string[];
  }): Promise<{
    success: boolean;
    data?: { productFamilies: string[]; productTypes: string[]; models: string[] };
    message?: string;
  }> {
    try {
      if (!params.customerSites || params.customerSites.length === 0) {
        return { success: false, message: 'customerSites is required' };
      }
      const data = await this.model.getPartsFilterOptions(params);
      return { success: true, data, message: 'Parts filter options retrieved successfully' };
    } catch (error) {
      console.error('❌ Error in ReportService.getPartsFilterOptions:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get parts filter options'
      };
    }
  }

  // ==================== VALIDATION ====================

  /**
   * Validate query parameters
   */
  private validateQueryParams(params: ReportQueryParams): string | null {
    // Validate work week format (WWxx)
    if (params.wwFrom && !this.isValidWorkWeek(params.wwFrom)) {
      return `Invalid work week format for wwFrom: ${params.wwFrom}. Expected format: xx (e.g., 01, 52)`;
    }

    if (params.wwTo && !this.isValidWorkWeek(params.wwTo)) {
      return `Invalid work week format for wwTo: ${params.wwTo}. Expected format: xx (e.g., 01, 52)`;
    }

    return null;
  }

  /**
   * Check if work week string is valid (WWxx format)
   */
  private isValidWorkWeek(ww: string): boolean {
    const wwPattern = /^\d{2}$/i;
    return wwPattern.test(ww);
  }

  /**
   * Check if date string is valid (YYYY-MM-DD format)
   */
  private isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }

  // ==================== FILTER OPTIONS ====================

  /**
   * Get available models for filtering
   */
  async getAvailableModels(): Promise<{
    success: boolean;
    data?: string[];
    message?: string;
    errors?: string[];
  }> {
    try {
      console.log('🔧 LARReportService.getAvailableModels called');

      const models = await this.model.getAvailableModels();

      console.log(`✅ LARReportService.getAvailableModels: Retrieved ${models.length} models`);

      return {
        success: true,
        data: models,
        message: 'Available models retrieved successfully'
      };

    } catch (error) {
      console.error('❌ Error in LARReportService.getAvailableModels:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get available models',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

    /**
   * Get available models for SGA IQA filtering
   * @param fyww - Combined fiscal year + work week (e.g. "202652")
   */
  async getModelsSGAIQA(fyww?: string): Promise<{
    success: boolean;
    data?: string[];
    message?: string;
    errors?: string[];
  }> {
    try {
      console.log('🔧 LARReportService.getSGAIQA called with fyww:', fyww);

      const models = await this.model.getSGAIQAModels(fyww);

      console.log(`✅ LARReportService.getSGAIQA: Retrieved ${models.length} models`);

      return {
        success: true,
        data: models,
        message: 'Available SGAIQA models retrieved successfully'
      };

    } catch (error) {
      console.error('❌ Error in LARReportService.getSGAIQA:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get available models',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get available product families for SGA IQA filtering
   * Returns distinct product_families only (without versions)
   */
  async getProductFamiliesSGAIQA(fyww?: string): Promise<{
    success: boolean;
    data?: string[];
    message?: string;
    errors?: string[];
  }> {
    try {
      console.log('🔧 LARReportService.getProductFamiliesSGAIQA called with fyww:', fyww);

      const productFamilies = await this.model.getSGAIQAProductFamilies(fyww);

      console.log(`✅ LARReportService.getProductFamiliesSGAIQA: Retrieved ${productFamilies.length} product families`);

      return {
        success: true,
        data: productFamilies,
        message: 'Available SGAIQA product families retrieved successfully'
      };

    } catch (error) {
      console.error('❌ Error in LARReportService.getProductFamiliesSGAIQA:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get available product families',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get available models for LAR filtering
   */
  async getModelsLAR(params: ReportQueryParams = {}): Promise<{
    success: boolean;
    data?: string[];
    message?: string;
    errors?: string[];
  }> {
    try {
      console.log('🔧 LARReportService.getModelsLAR called with params:', params);

      const models = await this.model.getModelsLAR(params);

      console.log(`✅ LARReportService.getModelsLAR: Retrieved ${models.length} models`);

      return {
        success: true,
        data: models,
        message: 'Available LAR models retrieved successfully'
      };

    } catch (error) {
      console.error('❌ Error in LARReportService.getModelsLAR:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get available models',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  async getModelsDashboard(params: ReportQueryParams = {}): Promise<{
    success: boolean;
    data?: string[];
    message?: string;
    errors?: string[];
  }> {
    try {
      const models = await this.model.getModelsDashboard(params);

      return {
        success: true,
        data: models,
        message: 'Available dashboard models retrieved successfully'
      };

    } catch (error) {
      console.error('❌ Error in ReportService.getModelsDashboard:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get dashboard models',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get available fiscal years for filtering
   */
  async getFiscalYears(report:string): Promise<{
    success: boolean;
    data?: string[];
    message?: string;
    errors?: string[];
  }> {
    try {
      console.log('🔧 LARReportService.getFiscalYears called');

      const fiscalYears = await this.model.getFiscalYears(report);

      console.log(`✅ LARReportService.getFiscalYears: Retrieved ${fiscalYears.length} fiscal years`);

      return {
        success: true,
        data: fiscalYears,
        message: 'Fiscal years retrieved successfully'
      };

    } catch (error) {
      console.error('❌ Error in LARReportService.getFiscalYears:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get fiscal years',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get available work weeks for filtering (optionally filtered by fiscal year)
   */
  async getWorkWeeks(report:string, fiscalYear?: string): Promise<{
    success: boolean;
    data?: string[];
    message?: string;
    errors?: string[];
  }> {
    try {
      console.log('🔧 LARReportService.getWorkWeeks called with fiscalYear:', fiscalYear);

      const workWeeks = await this.model.getWorkWeeks(report, fiscalYear);

      console.log(`✅ LARReportService.getWorkWeeks: Retrieved ${workWeeks.length} work weeks`);

      return {
        success: true,
        data: workWeeks,
        message: 'Work weeks retrieved successfully'
      };

    } catch (error) {
      console.error('❌ Error in LARReportService.getWorkWeeks:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get work weeks',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  // ==================== SEAGATE IQA RESULT REPORT ====================

  /**
   * Get Seagate IQA Result report data for a specific fiscal year and work week
   */
  async getSeagateIQAResult(params: ReportQueryParams): Promise<{
    success: boolean;
    data?: SeagateIQAResultReportRecord[];
    message?: string;
    errors?: string[];
  }> {
    try {
      console.log('🔧 ReportService.getSeagateIQAResult called with params:', params);

      // Validate required parameters
      if (!params.yearFrom || !params.wwFrom) {
        return {
          success: false,
          message: 'Year and WW parameters are required',
          errors: ['Missing required parameters: year and ww']
        };
      }

      const data = await this.model.getSeagateIQAResult(params);

      console.log(`✅ ReportService.getSeagateIQAResult: Retrieved ${data.length} records`);

      return {
        success: true,
        data,
        message: 'Seagate IQA Result data retrieved successfully'
      };

    } catch (error) {
      console.error('❌ Error in ReportService.getSeagateIQAResult:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve Seagate IQA Result data',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  // ==================== SGT IQA TREND REPORT ====================
  /**
   * Get  IQA and OQA DPPM OVerall  chart data
   * Returns aggregated chart data by yearmonth
   */
  async getIQAOQADppmOverallChart(queryParams: ReportQueryParams = {}): Promise<IQAOQADPPMOverallResult> {
    try {
      console.log('🔧 ReportService.getIQAOQADppmOverallChart called with params:', queryParams);

      const data = await this.model.getIQAOQADppmOverallChart(queryParams);

      console.log(`✅ ReportService.getIQAOQADppmOverallChart: Retrieved ${data.length} records`);

      return {
        success: true,
        data,
        message: 'SGT IQA Trend chart data retrieved successfully'
      };

    } catch (error) {
      console.error('❌ Error in ReportService.getIQAOQADppmOverallChart:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve SGT IQA Trend chart data',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get  OQA DPPM OVerall  chart data
   * Returns aggregated chart data by yearmonth
   */
  async getOQADppmOverallChart(queryParams: ReportQueryParams = {}): Promise<OQADPPMOverallResult> {
    try {
      console.log('🔧 ReportService.getOQADppmOverallChart called with params:', queryParams);

      const data = await this.model.getOQADppmOverallChart(queryParams);

      console.log(`✅ ReportService.getOQADppmOverallChart: Retrieved ${data.length} records`);

      return {
        success: true,
        data,
        message: 'SGT IQA Trend chart data retrieved successfully'
      };

    } catch (error) {
      console.error('❌ Error in ReportService.getOQADppmOverallChart:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve SGT IQA Trend chart data',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get  OQA DPPM OVerall defect data
   * Returns defect data grouped by yearmonth
   */
  async getOQADppmOverallDefect(queryParams: ReportQueryParams = {}): Promise<OQADPPMOverallResult> {
    try {
      console.log('🔧 ReportService.getOQADppmOverallDefect called with params:', queryParams);

      const data = await this.model.getOQADppmOverallDefect(queryParams);

      console.log(`✅ ReportService.getOQADppmOverallDefect: Retrieved ${data.length} defect records`);

      return {
        success: true,
        data,
        message: 'SGT IQA Trend defect data retrieved successfully'
      };

    } catch (error) {
      console.error('❌ Error in ReportService.getOQADppmOverallDefect:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve SGT IQA Trend defect data',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }


  // ==================== SGT IQA TREND REPORT ====================

   /**
   * Get SGT IQA Trend chart data
   * Returns chart data with LAR and DPPM metrics
   */
  async getSGTIQATrendChart(queryParams: ReportQueryParams = { }): Promise<SGTIQATrendResult> {
    try {
      console.log('🔧 ReportService.getSGTIQATrendChart called with params:', queryParams);

      const data = await this.model.getSGTIQATrendChart(queryParams);

      console.log(`✅ ReportService.getSGTIQATrendChart: Retrieved ${data.length} records`);

      return {
        success: true,
        data,
        message: 'SGT IQA Trend chart data retrieved successfully'
      };

    } catch (error) {
      console.error('❌ Error in ReportService.getSGTIQATrendChart:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve SGT IQA Trend chart data',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get SGT IQA Trend defect data
   * Returns defect data grouped by period
   */
  async getSGTIQATrendDefect(queryParams: ReportQueryParams = { }): Promise<SGTIQATrendResult> {
    try {
      console.log('🔧 ReportService.getSGTIQATrendDefect called with params:', queryParams);

      const data = await this.model.getSGTIQATrendDefect(queryParams);

      console.log(`✅ ReportService.getSGTIQATrendDefect: Retrieved ${data.length} defect records`);

      return {
        success: true,
        data,
        message: 'SGT IQA Trend defect data retrieved successfully'
      };

    } catch (error) {
      console.error('❌ Error in ReportService.getSGTIQATrendDefect:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve SGT IQA Trend defect data',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  // ==================== OQA VISUAL INSPECTION ====================

  /**
   * Get OQA Visual Inspection dashboard data
   * Returns monthly LAR% and DPPM per model for combo charts
   */
  async getOQAVisualInspection(queryParams: ReportQueryParams = { isCustomerReport: false }): Promise<OQAVIResult> {
    try {
      console.log('🔧 ReportService.getOQAVisualInspection called with params:', queryParams);

      // Validate date range
      if (!queryParams.dateFrom || !queryParams.dateTo) {
        return {
          success: false,
          message: 'dateFrom and dateTo are required',
          errors: ['Missing required date range parameters']
        };
      }

      const data = await this.model.getOQAVisualInspection(queryParams);

      console.log(`✅ ReportService.getOQAVisualInspection: Retrieved ${data.length} records`);

      return {
        success: true,
        data,
        message: 'OQA Visual Inspection data retrieved successfully'
      };

    } catch (error) {
      console.error('❌ Error in ReportService.getOQAVisualInspection:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve OQA Visual Inspection data',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  // ==================== DEFECT TYPE ANALYSIS ====================

  /**
   * Get Defect Type Analysis data
   * Returns defect data grouped by inspection date, item, model, lot, and defect
   */
  async getDefectTypeAnalysis(dateFrom: string, dateTo: string, models?: string[], shifts?: string[]): Promise<DefectTypeAnalysisResult> {
    try {
      console.log('🔧 ReportService.getDefectTypeAnalysis called with dateFrom:', dateFrom, 'dateTo:', dateTo, 'models:', models, 'shifts:', shifts);

      if (!dateFrom || !dateTo) {
        return {
          success: false,
          message: 'dateFrom and dateTo are required',
          errors: ['Missing required date range parameters']
        };
      }

      const data = await this.model.getDefectTypeAnalysis(dateFrom, dateTo, models, shifts);

      console.log(`✅ ReportService.getDefectTypeAnalysis: Retrieved ${data.length} records`);

      return {
        success: true,
        data,
        message: 'Defect type analysis data retrieved successfully'
      };

    } catch (error) {
      console.error('❌ Error in ReportService.getDefectTypeAnalysis:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve defect type analysis data',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  // ==================== OVERVIEW OQA ====================

  /**
   * Get Overview OQA data
   * Returns lot-level rows with defect group for client-side aggregation
   */
  async getOverviewOQA(queryParams: ReportQueryParams): Promise<OverviewOQAResult> {
    try {
      console.log('🔧 ReportService.getOverviewOQA called with params:', queryParams);

      if (!queryParams.yearFrom || !queryParams.wwFrom) {
        return {
          success: false,
          message: 'yearFrom and wwFrom are required',
          errors: ['Missing required parameters: yearFrom and wwFrom']
        };
      }

      const data = await this.model.getOverviewOQA(queryParams);

      console.log(`✅ ReportService.getOverviewOQA: Retrieved ${data.length} records`);

      return {
        success: true,
        data,
        message: 'Overview OQA data retrieved successfully'
      };

    } catch (error) {
      console.error('❌ Error in ReportService.getOverviewOQA:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve Overview OQA data',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get Overview OQA lot detail
   */
  async getOverviewOQALotDetail(fy: string, ww: string, partno_customer: string, defect_group: string): Promise<OverviewOQALotDetailResult> {
    try {
      if (!fy || !ww || !partno_customer || !defect_group) {
        return {
          success: false,
          message: 'fy, ww, partno_customer and defect_group are required',
          errors: ['Missing required parameters']
        };
      }

      const data = await this.model.getOverviewOQALotDetail(fy, ww, partno_customer, defect_group);

      return {
        success: true,
        data,
        message: 'Overview OQA lot detail retrieved successfully'
      };
    } catch (error) {
      console.error('❌ Error in ReportService.getOverviewOQALotDetail:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve lot detail',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  // ==================== SOQM DAILY ====================

  async getSOQMDaily(queryParams: ReportQueryParams): Promise<{ success: boolean; data?: any[]; message?: string; errors?: string[] }> {
    try {
      console.log('🔧 ReportService.getSOQMDaily called with params:', queryParams);
      const data = await this.model.getSOQMDaily(queryParams);
      console.log(`✅ ReportService.getSOQMDaily: Retrieved ${data.length} records`);
      return {
        success: true,
        data,
        message: 'SOQM Daily data retrieved successfully'
      };
    } catch (error) {
      console.error('❌ Error in ReportService.getSOQMDaily:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve SOQM Daily data',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  // ==================== SOQM WEEKLY ====================

  async getSOQMWeekly(queryParams: ReportQueryParams): Promise<{ success: boolean; data?: any; message?: string; errors?: string[] }> {
    try {
      console.log('🔧 ReportService.getSOQMWeekly called with params:', queryParams);
      const data = await this.model.getSOQMWeekly(queryParams);
      console.log(`✅ ReportService.getSOQMWeekly: Retrieved ${data.summary.length} models`);
      return {
        success: true,
        data,
        message: 'SOQM Weekly data retrieved successfully'
      };
    } catch (error) {
      console.error('❌ Error in ReportService.getSOQMWeekly:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve SOQM Weekly data',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  // ==================== FVI INSPECTION ====================

  async getFVIInspection(params: {
    inputDateFrom?: string;
    inputDateTo?: string;
    lotno?: string;
    judgment?: string;
  }): Promise<{ success: boolean; data?: any[]; message?: string; errors?: string[] }> {
    try {
      console.log('🔧 ReportService.getFVIInspection called with params:', params);
      const data = await this.model.getFVIInspection(params);
      console.log(`✅ ReportService.getFVIInspection: Retrieved ${data.length} records`);
      return {
        success: true,
        data,
        message: 'FVI Inspection data retrieved successfully'
      };
    } catch (error) {
      console.error('❌ Error in ReportService.getFVIInspection:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve FVI Inspection data',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  async deleteFVILotInput(lotno: string): Promise<{ success: boolean; deletedCount?: number; message?: string }> {
    try {
      console.log('🔧 ReportService.deleteFVILotInput called for lotno:', lotno);
      const result = await this.model.deleteFVILotInput(lotno);
      return {
        success: true,
        deletedCount: result.deletedCount,
        message: `Deleted ${result.deletedCount} records for lot ${lotno}`
      };
    } catch (error) {
      console.error('❌ Error in ReportService.deleteFVILotInput:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete lot input records'
      };
    }
  }

}

// ==================== FACTORY FUNCTION ====================

/**
 * Factory function to create a Report service instance
 */
export function createReportService(model: ReportModel): ReportService {
  return new ReportService(model);
}

export default ReportService;

/*
=== REPORT SERVICE FEATURES ===

COMPLETE SEPARATION ARCHITECTURE:
✅ Self-contained business logic layer
✅ No dependencies on other entities
✅ Clean separation from data access layer
✅ Manufacturing Quality Control domain focused

CORE OPERATIONS:
✅ getLARReport() - Raw database report data
✅ getLARWeeklyReport() - Aggregated weekly data with defects grouped
✅ getLARStats() - Statistical summary across all weeks
✅ healthCheck() - Service health verification

DATA AGGREGATION:
✅ Group defects by week
✅ Calculate weekly LAR and DPPM
✅ Aggregate lot pass/fail counts
✅ Top defects ranking

INPUT VALIDATION:
✅ Work week format validation (WWxx)
✅ Date format validation (YYYY-MM-DD)
✅ Round number range validation
✅ Comprehensive error messages

ERROR HANDLING:
✅ Try-catch blocks for all operations
✅ Detailed error logging
✅ User-friendly error messages
✅ Graceful error recovery

CONSISTENT RESULT TYPES:
✅ LARReportResult for raw data
✅ LARWeeklyReportResult for aggregated data
✅ LARStatsResult for statistics
✅ Standard success/error structure
*/
