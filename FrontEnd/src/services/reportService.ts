// client/src/services/reportService.ts
// ======================================= REPORT SERVICE =======================================
// Uses centralized API configuration and fetch utility

import { 
  apiBaseUrl, 
  BaseService, 
  type ApiResponse  
} from './api';
import {
  type ReportQueryParams,
  type LARReportRecord,
  type IQAOQADPPMOverallRecord,
  type OQADPPMOverallRecord,
  type SGTIQATrendRecord,
  type SGTIQAResultRecord,
  type HistoryTrackingRecord,
  type DefectImageSummaryRecord,
  type OverviewOQARawRecord
  } from '../types/report';
import { calculateFiscalWeekNumber, getFiscalYear, getCurrentFiscalWeek, getCurrentFiscalYear } from '@qcv/shared';

// Re-export ApiResponse for backward compatibility
export type { ApiResponse };


// ========================================= SERVICE CLASS =========================================

/**
 * Report Service Class
 * Handles all report-related API calls using centralized configuration
 * Extends BaseService for common fetch functionality
 */
class ReportService extends BaseService {
  constructor() {
    super(apiBaseUrl('report'));
  }

 

  // ===================================== LAR REPORT METHODS =====================================

  /**
   * Get available models for filtering
   */
  async getLARModels(params: ReportQueryParams = { isCustomerReport: false }): Promise<ApiResponse<string[]>> {
        const queryString = this.buildQueryString(params);
    return this.apiFetch<string[]>(`/modelsLAR${queryString}`);
  }

  /**
   * Get LAR chart data (simplified format without defect breakdown)
   */
  async getLARChart(params: ReportQueryParams = { isCustomerReport: false }): Promise<ApiResponse<LARReportRecord[]>> {
    const queryString = this.buildQueryString(params);
    return this.apiFetch<LARReportRecord[]>(`/lar-chart${queryString}`);
  }

  /**
   * Get LAR defect data (defects grouped by week)
   */
  async getLARDefect(params: ReportQueryParams = { isCustomerReport: false }): Promise<ApiResponse<LARReportRecord[]>> {
    const queryString = this.buildQueryString(params);
    return this.apiFetch<LARReportRecord[]>(`/lar-defect${queryString}`);
  }

  /**
   * Get LAR Dashboard data with month period and models filtering
   */
  async getLARDashboard(params: ReportQueryParams = {}): Promise<ApiResponse<any[]>> {
    const queryString = this.buildQueryString(params);
    return this.apiFetch<any[]>(`/lar-dashboard${queryString}`);
  }

  /**
   * Get DPPM Dashboard data with month period and models filtering
   */
  async getDPPMDashboard(params: ReportQueryParams = {}): Promise<ApiResponse<any[]>> {
    const queryString = this.buildQueryString(params);
    return this.apiFetch<any[]>(`/dppm-dashboard${queryString}`);
  }

  /**
   * Get Underkill Dashboard data with month period and models filtering
   */
  async getUnderkillDashboard(params: ReportQueryParams = {}): Promise<ApiResponse<any[]>> {
    const queryString = this.buildQueryString(params);
    return this.apiFetch<any[]>(`/underkill-dashboard${queryString}`);
  }


  // ==================== OQA DPPM Overall REPORT METHODS ====================
  /**
   * Get IQA and OQA DPPM Overall chart data
   */
  async getIQAOQADPPMOverallChart(params: ReportQueryParams = {}): Promise<ApiResponse<IQAOQADPPMOverallRecord[]>> {
    const queryString = this.buildQueryString(params);
    return this.apiFetch<IQAOQADPPMOverallRecord[]>(`/iqa-oqa-dppm-overall-chart${queryString}`);
  }
  /**
   * Get OQA DPPM Overall chart data
   */
  async getOQADPPMOverallChart(params: ReportQueryParams = {}): Promise<ApiResponse<OQADPPMOverallRecord[]>> {
    const queryString = this.buildQueryString(params);
    return this.apiFetch<OQADPPMOverallRecord[]>(`/oqa-dppm-overall-chart${queryString}`);
  }

  /**
   * Get OQA DPPM Overall defect data
   */
  async getOQADPPMOverallDefect(params: ReportQueryParams = {}): Promise<ApiResponse<OQADPPMOverallRecord[]>> {
    const queryString = this.buildQueryString(params);
    return this.apiFetch<OQADPPMOverallRecord[]>(`/oqa-dppm-overall-defect${queryString}`);
  }

  // ==================== SGT IQA TREND REPORT METHODS ====================

  /**
   * Get SGT IQA Trend chart data
   */
  async getSGTIQATrendChart(params: ReportQueryParams  = {}): Promise<ApiResponse<SGTIQATrendRecord[]>> {
    const queryString = this.buildQueryString(params);
    return this.apiFetch<SGTIQATrendRecord[]>(`/sgt-iqa-trend-chart${queryString}`);
  }

  /**
   * Get SGT IQA Trend defect data
   */
  async getSGTIQATrendDefect(params: ReportQueryParams  = {}): Promise<ApiResponse<SGTIQATrendRecord[]>> {
    const queryString = this.buildQueryString(params);
    return this.apiFetch<SGTIQATrendRecord[]>(`/sgt-iqa-trend-defect${queryString}`);
  }

  // ==================== SEAGATE IQA RESULT REPORT METHODS ====================

  /**
   * Get Seagate IQA Result report data
   */
  async getSeagateIQAResult(params: ReportQueryParams ): Promise<ApiResponse<SGTIQAResultRecord[]>> {
    const queryString = this.buildQueryString(params);
    return this.apiFetch<SGTIQAResultRecord[]>(`/seagate-iqa-result${queryString}`);
  }


  /**
   * Get Top Defect data with date range filtering
   */
  async getTopDefect(params: ReportQueryParams = {}): Promise<ApiResponse<any[]>> {
    const queryString = this.buildQueryString(params);
    return this.apiFetch<any[]>(`/top-defect${queryString}`);
  }

  /**
   * Get FVI Inspection data
   */
  async getFVIInspection(params: {
    inputDateFrom?: string;
    inputDateTo?: string;
    lotno?: string;
    judgment?: string;
  }): Promise<ApiResponse<any[]>> {
    const queryString = this.buildQueryString(params);
    return this.apiFetch<any[]>(`/fvi-inspection${queryString}`);
  }

  /**
   * Delete inf_lotinput records by lot number
   */
  async deleteFVILotInput(lotno: string): Promise<ApiResponse<{ deletedCount: number }>> {
    return this.apiFetch<{ deletedCount: number }>(`/fvi-inspection/lotno/${encodeURIComponent(lotno)}`, {
      method: 'DELETE'
    });
  }

  // ======================== DEFECT TYPE ANALYSIS ========================

  /**
   * Get Defect Type Analysis data with date range filtering
   */
  async getDefectTypeAnalysis(params: { dateFrom?: string; dateTo?: string; models?: string[]; shifts?: string[] }): Promise<ApiResponse<any[]>> {
    const queryString = this.buildQueryString(params);
    return this.apiFetch<any[]>(`/defect-type-analysis${queryString}`);
  }

  // ======================== OQA VISUAL INSPECTION ========================

  /**
   * Get OQA Visual Inspection dashboard data (combo charts per model)
   */
  async getOQAVIDashboard(params: ReportQueryParams = {}): Promise<ApiResponse<any[]>> {
    const queryString = this.buildQueryString(params);
    return this.apiFetch<any[]>(`/oqa-vi-dashboard${queryString}`);
  }

  // ======================== NEW ANALYTICS METHODS ========================

  /**
   * Get Production Line Quality Heatmap data
   */
  async getProductionLineHeatmap(params: ReportQueryParams = {}): Promise<ApiResponse<any[]>> {
    const queryString = this.buildQueryString(params);
    return this.apiFetch<any[]>(`/production-line-heatmap${queryString}`);
  }

  /**
   * Get Product Quality Scorecard data
   */
  async getProductQualityScorecard(params: ReportQueryParams = {}): Promise<ApiResponse<any[]>> {
    const queryString = this.buildQueryString(params);
    return this.apiFetch<any[]>(`/product-quality-scorecard${queryString}`);
  }

  /**
   * Get Defect Root Cause Analysis data
   */
  async getDefectRootCause(params: ReportQueryParams = {}): Promise<ApiResponse<any[]>> {
    const queryString = this.buildQueryString(params);
    return this.apiFetch<any[]>(`/defect-root-cause${queryString}`);
  }

  /**
   * Get Monthly Quality Trend data
   */
  async getMonthlyQualityTrend(params: ReportQueryParams = {}): Promise<ApiResponse<any[]>> {
    const queryString = this.buildQueryString(params);
    return this.apiFetch<any[]>(`/monthly-quality-trend${queryString}`);
  }

  // ======================== HISTORY TRACKING ========================

  /**
   * Get History Tracking data by lot numbers
   */
  async getHistoryTracking(lotNumbers: string[]): Promise<ApiResponse<HistoryTrackingRecord[]>> {
    const lotNumbersParam = lotNumbers.join(',');
    return this.apiFetch<HistoryTrackingRecord[]>(`/history-tracking?lotNumbers=${encodeURIComponent(lotNumbersParam)}`);
  }

  // ======================== DEFECT IMAGE SUMMARY ========================

  /**
   * Get Defect Image Summary data grouped by defect name
   */
  async getDefectImageSummary(params: {
    dateFrom: string;
    dateTo: string;
    sites?: string[];
    customerSites?: string[];
    productFamilies?: string[];
    productTypes?: string[];
    models?: string[];
    defects?: string[];
  }): Promise<ApiResponse<DefectImageSummaryRecord[]>> {
    const queryString = this.buildQueryString(params);
    return this.apiFetch<DefectImageSummaryRecord[]>(`/defect-image-summary${queryString}`);
  }

  // ======================== SOQM DAILY ========================

  /**
   * Get SOQM Daily data (NG qty from OQA station)
   */
  async getSOQMDaily(params: ReportQueryParams = {}): Promise<ApiResponse<any[]>> {
    const queryString = this.buildQueryString(params);
    return this.apiFetch<any[]>(`/soqm-daily${queryString}`);
  }

  // ======================== SOQM WEEKLY ========================

  /**
   * Get SOQM Weekly summary data (pivot by model)
   */
  async getSOQMWeekly(params: ReportQueryParams = {}): Promise<ApiResponse<any>> {
    const queryString = this.buildQueryString(params);
    return this.apiFetch<any>(`/soqm-weekly${queryString}`);
  }

  // ======================== PARTS FILTER OPTIONS ========================

  /**
   * Get parts filter options (product families, types, models) with cascading support
   */
  async getPartsFilterOptions(params: {
    customerSites: string[];
    productFamilies?: string[];
    productTypes?: string[];
  }): Promise<ApiResponse<{
    productFamilies: string[];
    productTypes: string[];
    models: string[];
  }>> {
    const queryString = this.buildQueryString(params);
    return this.apiFetch(`/parts-filter-options${queryString}`);
  }

  // ======================== OVERVIEW OQA ========================

  /**
   * Get Overview OQA data (lot-level with defect group)
   */
  async getOverviewOQA(params: ReportQueryParams): Promise<ApiResponse<OverviewOQARawRecord[]>> {
    const queryString = this.buildQueryString(params);
    return this.apiFetch<OverviewOQARawRecord[]>(`/overview-oqa${queryString}`);
  }

  /**
   * Get Overview OQA lot detail (lot-level NG qty)
   */
  async getOverviewOQALotDetail(fy: string, ww: string, model: string, defect_group: string): Promise<ApiResponse<{ lotno: string; ng_qty: number }[]>> {
    const params = new URLSearchParams({ fy, ww, model, defect_group });
    return this.apiFetch<{ lotno: string; ng_qty: number }[]>(`/overview-oqa-lot-detail?${params.toString()}`);
  }

  // ======================== UTILITY METHODS ========================

  /**
   * Get available models for filtering
   */
  async getAvailableModels(): Promise<ApiResponse<string[]>> {
    return this.apiFetch<string[]>('/models');
  }

  /**
   * Get available models for filtering Lars report   *
   * Get data of Product OQA and IQA backward 2 curent fiscal years
   * Optional select filter by customer
   */
  async getModelsLAR(params: ReportQueryParams = {}): Promise<ApiResponse<string[]>> {
    const queryString = this.buildQueryString(params);
    return this.apiFetch<string[]>(`/modelsLAR${queryString}`);
  }

  async getModelsDashboard(params: ReportQueryParams = {}): Promise<ApiResponse<string[]>> {
    const queryString = this.buildQueryString(params);
    return this.apiFetch<string[]>(`/modelsDashboard${queryString}`);
  }

  /**
   * Get available models for filtering Seagate IQA report
   * Get data of Product IQA backward 2 current fiscal years
   * Optional filter by fiscal year and work week
   */
  async getModelsSGAIQA(params?: { year?: string; ww?: string; onlyWeekOfProduct?: boolean }): Promise<ApiResponse<string[]>> {
    const queryParams = new URLSearchParams();
    // Combine year+ww into fyww parameter
    if (params?.year && params?.ww) {
      queryParams.append('fyww', `${params.year}${params.ww.padStart(2, '0')}`);
    } else if (params?.year) {
      queryParams.append('year', params.year);
    }
    if (params?.onlyWeekOfProduct) {
      queryParams.append('onlyWeekOfProduct', 'true');
    }
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return this.apiFetch<string[]>(`/modelsSGAIQA${queryString}`);
  }

  /**
   * Get available product families for filtering Seagate IQA report
   * Returns distinct product_families only (without versions), matching OQA inspection page model filter
   */
  async getProductFamiliesSGAIQA(params?: { year?: string; ww?: string }): Promise<ApiResponse<string[]>> {
    const queryParams = new URLSearchParams();
    if (params?.year && params?.ww) {
      queryParams.append('fyww', `${params.year}${params.ww.padStart(2, '0')}`);
    } else if (params?.year) {
      queryParams.append('year', params.year);
    }
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return this.apiFetch<string[]>(`/productFamiliesSGAIQA${queryString}`);
  }



  /**
   * Get available fiscal years for filtering
   */
  async getFiscalYears(report:string): Promise<ApiResponse<string[]>> {    
    return this.apiFetch<string[]>(`/fiscal-years/${report}`);
    
  }

  /**
   * Get available work weeks for filtering (optionally filtered by fiscal year)
   * @param fiscalYear - Optional fiscal year to filter work weeks
   */
  async getWorkWeeks(report:string, fiscalYear?: string): Promise<ApiResponse<string[]>> {
    const queryString = fiscalYear ? `?fy=${fiscalYear}` : '';
    return this.apiFetch<string[]>(`/work-weeks/${report}${queryString}`);
  }
}

// ==================== SINGLETON EXPORT ====================

const reportService = new ReportService();

// Export individual methods for backward compatibility
export const getLARModels = (params?: ReportQueryParams) => reportService.getLARModels(params || { isCustomerReport: false });
export const getLARChart = (params?: ReportQueryParams) => reportService.getLARChart(params || { isCustomerReport: false });
export const getLARDefect = (params?: ReportQueryParams) => reportService.getLARDefect(params || { isCustomerReport: false });
export const getIQAOQADPPMOverallChart = (params?: ReportQueryParams) => reportService.getIQAOQADPPMOverallChart(params);
export const getOQADPPMOverallChart = (params?: ReportQueryParams) => reportService.getOQADPPMOverallChart(params);
export const getOQADPPMOverallDefect = (params?: ReportQueryParams) => reportService.getOQADPPMOverallDefect(params);
export const getSGTIQATrendChart = (params?: ReportQueryParams ) => reportService.getSGTIQATrendChart(params);
export const getSGTIQATrendDefect = (params?: ReportQueryParams ) => reportService.getSGTIQATrendDefect(params);
export const getSeagateIQAResult = (params: ReportQueryParams ) => reportService.getSeagateIQAResult(params);
export const getAvailableModels = () => reportService.getAvailableModels();
export const getModelsLAR = (params?: ReportQueryParams) => reportService.getModelsLAR(params);
export const getModelsDashboard = (params?: ReportQueryParams) => reportService.getModelsDashboard(params);
export const getModelsSGAIQA = (params?: { year?: string; ww?: string; onlyWeekOfProduct?: boolean }) => reportService.getModelsSGAIQA(params);
export const getProductFamiliesSGAIQA = (params?: { year?: string; ww?: string }) => reportService.getProductFamiliesSGAIQA(params);
export const getFiscalYearsLAR = () => reportService.getFiscalYears('LAR');
export const getWorkWeeksLAR = (fiscalYear?: string) => reportService.getWorkWeeks('LAR',fiscalYear);
export const getFiscalYearsIQAOQA = () => reportService.getFiscalYears('IQAOQA');
export const getWorkWeeksIQAOQA = (fiscalYear?: string) => reportService.getWorkWeeks('IQAOQA',fiscalYear);
export const getFiscalYearsDPPM = () => reportService.getFiscalYears('DPPM');
export const getWorkWeeksDPPM = (fiscalYear?: string) => reportService.getWorkWeeks('DPPM', fiscalYear);
export const getFiscalYearsResult = () => reportService.getFiscalYears('Result');
export const getWorkWeeksResult = (fiscalYear?: string) => reportService.getWorkWeeks('Result', fiscalYear);
export const getFiscalYearsTrend = () => reportService.getFiscalYears('Trend');
export const getWorkWeeksTrend = (fiscalYear?: string) => reportService.getWorkWeeks('Trend', fiscalYear);
export const getTopDefect = (params?: ReportQueryParams) => reportService.getTopDefect(params);

// History Tracking Export
export const getHistoryTracking = (lotNumbers: string[]) => reportService.getHistoryTracking(lotNumbers);

// Parts Filter Options Export
export const getPartsFilterOptions = (params: {
  customerSites: string[];
  productFamilies?: string[];
  productTypes?: string[];
}) => reportService.getPartsFilterOptions(params);

// Defect Image Summary Export
export const getDefectImageSummary = (params: {
  dateFrom: string;
  dateTo: string;
  sites?: string[];
  customerSites?: string[];
  productFamilies?: string[];
  productTypes?: string[];
  models?: string[];
  defects?: string[];
}) => reportService.getDefectImageSummary(params);

// Defect Type Analysis Export
export const getDefectTypeAnalysis = (params: { dateFrom?: string; dateTo?: string; models?: string[]; shifts?: string[] }) => reportService.getDefectTypeAnalysis(params);

// OQA Visual Inspection Export
export const getOQAVIDashboard = (params?: ReportQueryParams) => reportService.getOQAVIDashboard(params);

// New Analytics Exports
export const getProductionLineHeatmap = (params?: ReportQueryParams) => reportService.getProductionLineHeatmap(params);
export const getProductQualityScorecard = (params?: ReportQueryParams) => reportService.getProductQualityScorecard(params);
export const getDefectRootCause = (params?: ReportQueryParams) => reportService.getDefectRootCause(params);
export const getMonthlyQualityTrend = (params?: ReportQueryParams) => reportService.getMonthlyQualityTrend(params);

// Overview OQA Exports
export const getOverviewOQA = (params: ReportQueryParams) => reportService.getOverviewOQA(params);
export const getOverviewOQALotDetail = (fy: string, ww: string, model: string, defect_group: string) => reportService.getOverviewOQALotDetail(fy, ww, model, defect_group);
export const getFiscalYearsOverviewOQA = () => reportService.getFiscalYears('OverviewOQA');
export const getWorkWeeksOverviewOQA = (fiscalYear?: string) => reportService.getWorkWeeks('OverviewOQA', fiscalYear);

// SOQM Weekly Export
export const getSOQMWeekly = (params?: ReportQueryParams) => reportService.getSOQMWeekly(params);

// SOQM Daily Export
export const getSOQMDaily = (params?: ReportQueryParams) => reportService.getSOQMDaily(params);
export const getFiscalYearsSOQMDaily = () => reportService.getFiscalYears('SOQMDaily');
export const getWorkWeeksSOQMDaily = (fiscalYear?: string) => reportService.getWorkWeeks('SOQMDaily', fiscalYear);

// FVI Inspection Export
export const getFVIInspection = (params: {
  inputDateFrom?: string;
  inputDateTo?: string;
  lotno?: string;
  judgment?: string;
}) => reportService.getFVIInspection(params);
export const deleteFVILotInput = (lotno: string) => reportService.deleteFVILotInput(lotno);

// Export service instance
export { reportService };

// ========================================= Helper Method =========================================

// Export helper function for building customer date range params
export const buildCustomerDateRangeParams = (params: ReportQueryParams = {}): ReportQueryParams => {
  const dateStart = new Date(Date.now() - 91 * 24 * 60 * 60 * 1000);
  return {
    ...params,
    yearFrom: params.yearFrom || getFiscalYear(dateStart, 6).toString(),
    wwFrom: params.wwFrom || calculateFiscalWeekNumber(dateStart, 6).toString().padStart(2, '0'),
    yearTo: params.yearTo || getCurrentFiscalYear().toString(),
    wwTo: params.wwTo || getCurrentFiscalWeek().toString().padStart(2, '0')
  };
};

// Export helper function for getting default date range (backward 91 days to current)
export const getDefaultDateRange = () => {
  const dateStart = new Date(Date.now() - 91 * 24 * 60 * 60 * 1000);
  return {
    yearFrom: getFiscalYear(dateStart, 6).toString(),
    wwFrom: calculateFiscalWeekNumber(dateStart, 6).toString().padStart(2, '0'),
    yearTo: getCurrentFiscalYear().toString(),
    wwTo: getCurrentFiscalWeek().toString().padStart(2, '0')
  };
};

 

// Default export for backward compatibility
export default reportService;

/*
=== REPORT SERVICE - CENTRALIZED API CONFIGURATION ===

ARCHITECTURE:
✅ Service class pattern with singleton instance
✅ Uses apiBaseUrl('report') from centralized config/api.config.ts
✅ Eliminated dependency on api.ts client (deleted)
✅ Uses native fetch with proper error handling
✅ Maintains backward compatibility with exported functions

CENTRALIZED API CONFIGURATION:
✅ Base URL: apiBaseUrl('report') -> '/api/report' or 'http://server:8021/api/report'
✅ All endpoints are relative to base URL (e.g., '/lar-chart' becomes '/api/report/lar-chart')
✅ Environment-aware (development uses Vite proxy, production uses full URLs)
✅ Single source of truth for API endpoint configuration

CLIENT-SIDE API SERVICE:
✅ ReportService class with private methods (apiFetch, buildQueryString)
✅ Type-safe interfaces matching server-side types
✅ Query parameter building and URL encoding
✅ Comprehensive error handling with logging
✅ Session cookie support (credentials: 'include')

CORE OPERATIONS:
✅ getLARModels() - Fetch available models
✅ getLARChart() - Fetch LAR chart data
✅ getLARDefect() - Fetch LAR defect breakdown
✅ getOQADPPMOverallChart() - Fetch OQA DPPM chart
✅ getOQADPPMOverallDefect() - Fetch OQA DPPM defects
✅ getSGTIQATrendChart() - Fetch SGT IQA trend chart
✅ getSGTIQATrendDefect() - Fetch SGT IQA defect data
✅ getSeagateIQAResult() - Fetch Seagate IQA results
✅ getAvailableModels() - Fetch available models (utility)
✅ getFiscalYears() - Fetch fiscal years
✅ getWorkWeeks() - Fetch work weeks

QUERY PARAMETERS:
✅ Work week range filtering (wwFrom, wwTo)
✅ Fiscal year filtering (year, ww)
✅ Model filtering (model)
✅ Product type filtering (product_type)

ERROR HANDLING:
✅ Try-catch blocks in apiFetch method
✅ Console logging for debugging
✅ User-friendly error messages
✅ Network error handling

TYPE SAFETY:
✅ TypeScript interfaces for all data types
✅ Generic ApiResponse<T> wrapper
✅ Proper type annotations throughout
✅ Null safety for optional fields

USAGE:
// Import service instance
import { reportService } from '../services/reportService';

// Or import individual functions (backward compatible)
import { getLARChart, getFiscalYears } from '../services/reportService';

// Use service instance
const result = await reportService.getLARChart({ yearFrom: '24', wwFrom: '01' });

// Or use exported functions
const result = await getLARChart({ yearFrom: '24', wwFrom: '01' });

BENEFITS:
✅ Service class pattern with encapsulation
✅ Uses centralized API configuration (apiBaseUrl)
✅ Cleaner, more maintainable code structure
✅ Backward compatible exports
✅ Follows same pattern as other services (infCheckinService, inspectionDataService)
✅ Environment-aware API URL construction
*/
