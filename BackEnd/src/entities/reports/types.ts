// server/src/entities/reports/types.ts
// ===== LAR REPORT TYPES =====
// Line Acceptance Rate (LAR) Report Entity Types
// Manufacturing Quality Control System - Report Entity
 
// ========================================= Shared Report INTERFACES =========================================

/**
 * Query parameters for report
 */
export interface ReportQueryParams {
  yearFrom?: string;
  wwFrom?: string;
  yearTo?: string;
  wwTo?: string;
  dateFrom?: string;  // For month period filtering (YYYY-MM format)
  dateTo?: string;    // For month period filtering (YYYY-MM format)
  model?: string;
  models?: string[];
  product_type?: string;
  productionSite?: string;
  customerSite?: string;
  productFamily?: string;
  productType?: string;
  // Array support for multi-select filters
  productionSites?: string[];
  customerSites?: string[];
  customer?: string[];
  productFamilies?: string[];
  productTypes?: string[];
  isCustomerReport?: boolean ;
  lotno?: string;
}

interface ReportResult {
  success: boolean;
  message?: string;
  errors?: string[];
}
// ==================== INTERFACES ====================
/**
 * LAR Report Data Record
 * Represents a single week's LAR data with defect breakdown
 */
export interface LARReportRecord {
  ww: string;                      // Work Week (e.g., 'WW49', 'WW50')
  total_lot: number;               // Total number of lots inspected
  total_pass_lot: number;          // Number of lots that passed
  total_fail_lot: number;          // Number of lots that failed
  total_inspection: number;        // Total number of inspections performed
  total_ng: number;                // Total NG (Not Good) count for this defect
  lar: number;                     // Line Acceptance Rate (percentage)
  dppm: number;                    // Defects Per Million (parts)
  defects: { 
    [key: string]: number;
  };  
}

/**
 * Service result for LAR report data
 */
export interface LARReportResult extends ReportResult {
  data?: LARReportRecord[];
}


/**
 * IQA OQA DPPM Overall Report Data Record
 */
export interface IQAOQADPPMOverallRecord {
  yearmonth: string;                   // Year Month, optional end 99 for mark curent yearmonth (e.g., '20250199', '202502')
  dppmTarget: number;                  // DPPM target
  total_lot_oqa: number;               // OQA Total number of lots inspected
  total_pass_lot_oqa: number;          // OQA Number of lots that passed
  total_fail_lot_oqa: number;          // OQA Number of lots that failed
  total_inspection_oqa: number;        // OQA Total number of inspections performed
  total_ng_oqa: number;                // OQA Total number of inspections performed
  lar_oqa: number;                     // OQA Defects Per Million (parts)
  dppm_oqa: number;                    // OQA Defects Per Million (parts)
  total_lot_iqa: number;               // IQA Total number of lots inspected
  total_pass_lot_iqa: number;          // IQA Number of lots that passed
  total_fail_lot_iqa: number;          // IQA Number of lots that failed
  total_inspection_iqa: number;        // IQA Total number of inspections performed
  total_ng_iqa: number;                // IQA Total number of inspections performed
  lar_iqa: number;                     // IQA Defects Per Million (parts)
  dppm_iqa: number;                    // IQA Defects Per Million (parts)
}

/**
 * Service result for IQA and OQA DPPM Overall report data
 */
export interface IQAOQADPPMOverallResult extends ReportResult {
  data?: IQAOQADPPMOverallRecord[];
}
 

/**
 * OQA DPPM Overall Report Data Record
 */
export interface OQADPPMOverallRecord {
  yearmonth: string;                // Year Month, optional end 99 for mark curent yearmonth (e.g., '20250199', '202502')
  lar: number;                     // Line Acceptance Rate (percentage)
  dppmTarget: number;              // Defects Per Million target
  dppm: number;                    // Defects Per Million (parts)
  defects: {
    [key: string]: number;
  };
}

/**
 * Service result for OQA DPPM Overall report data
 */
export interface OQADPPMOverallResult extends ReportResult {
  data?: OQADPPMOverallRecord[];
}
 
/**
 * Seagate IQA Result Report Data Record
 */
export interface SeagateIQAResultReportRecord {
  fyww: string;                     // Fiscal Work Week (e.g., '202549', '202550')
  fy: string;                       // Fiscal year (e.g., '2025', '2025')
  ww: string;                       // Work Week (e.g., '49', '50')
  model: string;                    // Model name (e.g., 'Iris 20.4')  
  total_inspection_lot: number;     // Total number of lots inspected
  acceptable_lot: number;           // Number of lots that passed
  rejected_lot: number;             // Number of lots that failed
  rejected_qty: number;             // Total NG (Not Good) count for this defect
  lar: number;                      // Line Acceptance Rate (percentage)
}

/**
 * SGT IQA Trend Report Data Record
 */
export interface SGTIQATrendRecord {
  yearmonth: string;                   // Year Month, optional end 99 for mark curent yearmonth (e.g., '20250199', '202502')
  model: string;                    // Model name (e.g., 'Iris 20.4') 
  product_type: string;            // Product type name (e.g., 'ICA') 
  total_lot: number;               // Total number of lots inspected
  total_pass_lot: number;          // Number of lots that passed
  total_fail_lot: number;          // Number of lots that failed
  total_inspection: number;        // Total number of inspections performed
  defectname: string | null;       // Name of the defect type
  total_ng: number;                // Total NG (Not Good) count for this defect
  lar: number;                     // Line Acceptance Rate (percentage)
  dppm: number;                    // Defects Per Million (parts)
  defects: {
    [key: string]: number;
  };  
}

/**
 * Service result for SGT IQA Trend report data
 */
export interface SGTIQATrendResult extends ReportResult{
  data?: SGTIQATrendRecord[];
}

/**
 * SGT IQA WEEKLY TREND REPORT  Data Record
 */
export interface WeeklyTrendData {
  period: string;
  dppm: number;
  lar: number;
  lotAuditVisual: number;
  lotPassVisual: number;
  lotFailVisual: number;
  lotSamplingQty: number;
  defectQty: number;
  stickyOnDamper: number;
  brownContamOnDamper: number;
  contamination: number;
  bentDentDeform: number;
  p2tCrack: number;
  fiberOnAnyArea: number;
  scratch: number;
  otherDefects: number;
}

// ==================== Dashboard ====================
/**
 * LAR Dashboard Data Record
 * Represents a  LAR data
 */
export interface LARDashboardRecord {
  month_year: string;              // Month Year (e.g., '2024-01')
  model: string;                   // Model name
  lar_achieve_threshold?: number;   // lar  % achieve threshold
  lar_accept_min_threshold?: number; // lar  % ccept min_ threshold
  lar_accept_max_threshold?: number; // lar  % accept max threshold
  lar_abnormal_threshold?: number;   // lar  % abnormal_threshold
  lar: number;                     // Line Acceptance Rate (percentage)
}

/**
 * Service result for LAR Dashboard  data
 */
export interface LARDashboardResult extends ReportResult {
  data?: LARDashboardRecord[];
}

/**
 * DPPM Dashboard Data Record
 * Represents DPPM data
 */
export interface DPPMDashboardRecord {
  month_year: string;              // Month Year (e.g., '2024-01')
  model: string;                   // Model name
  dppm_achieve_threshold?: number;   // DPPM achieve threshold
  dppm_accept_min_threshold?: number; // DPPM accept min threshold
  dppm_accept_max_threshold?: number; // DPPM accept max threshold
  dppm_abnormal_threshold?: number;   // DPPM abnormal threshold
  dppm: number;                    // Defects Per Million value
}


/**
 * Underkill Dashboard Data Record
 * Represents Underkill data
 */
export interface UnderkillDashboardRecord {
  month_year: string;              // Month Year (e.g., '2024-01')
  model: string;                   // Model name
  underkill_achieve_threshold?: number;   // Underkill achieve threshold
  underkill_accept_min_threshold?: number; // Underkill accept min threshold
  underkill_accept_max_threshold?: number; // Underkill accept max threshold
  underkill_abnormal_threshold?: number;   // Underkill abnormal threshold
  underkill: number;                    // Defects Per Million value
}

/**
 * Service result for DPPM Dashboard data
 */
export interface DPPMDashboardResult extends ReportResult {
  data?: DPPMDashboardRecord[];
}

/**
 * Service result for Underkill Dashboard data
 */
export interface UnderkillDashboardResult extends ReportResult {
  data?: UnderkillDashboardRecord[];
}

/**
 * Top Defect Data Record
 * Represents top defect data for a specific month and model
 */
export interface TopDefectRecord {
  month_year: string;              // Month Year in YYYYMM format (e.g., '202309')
  model: string;                   // Model name (e.g., 'Astra-S 1.0')
  defect_id: number;               // Defect ID
  defect_name: string;             // Defect name (e.g., 'Contamination')
  defect_description: string;      // Defect description
  total_ng: number;                // Total NG count for this defect
}

/**
 * Service result for Top Defect data
 */
export interface TopDefectResult extends ReportResult {
  data?: TopDefectRecord[];
}

// ==================== PRODUCTION LINE QUALITY HEATMAP ====================

/**
 * Production Line Quality Heatmap Record
 * Shows DPPM and defect counts by production line, group, and station
 */
export interface ProductionLineHeatmapRecord {
  linevi: string;                  // Production line (A-Z, AA-AP)
  groupvi: string;                 // Section/Group (A-E)
  station: string;                 // Station (OQA, FVI, QC, INS)
  total_inspections: number;       // Total inspections for this line/group/station
  total_ng: number;                // Total NG count
  dppm: number;                    // DPPM for this combination
  defect_count: number;            // Number of defect occurrences
  top_defect: string | null;       // Most common defect type
  alert_status: string;            // 'normal' | 'warning' | 'critical'
}

/**
 * Service result for Production Line Heatmap data
 */
export interface ProductionLineHeatmapResult extends ReportResult {
  data?: ProductionLineHeatmapRecord[];
}

// ==================== PRODUCT QUALITY SCORECARD ====================

/**
 * Product Quality Scorecard Record
 * Executive dashboard showing product quality status vs targets
 */
export interface ProductQualityScorecardRecord {
  model: string;                   // Product model
  current_lar: number;             // Current LAR percentage
  target_lar: number;              // Target LAR from parts table
  lar_status: string;              // 'excellent' | 'good' | 'warning' | 'critical'
  lar_trend: string;               // 'up' | 'down' | 'stable'
  current_dppm: number;            // Current DPPM value
  target_dppm: number;             // Target DPPM from parts table
  dppm_status: string;             // 'excellent' | 'good' | 'warning' | 'critical'
  dppm_trend: string;              // 'up' | 'down' | 'stable'
  total_lot: number;               // Total lots in period
  total_lotpass: number;           // Total lots passed in period
  total_inspections: number;       // Total inspections in period
  total_defects: number;           // Total defects found
  month_year: string;              // Period (YYYY-MM)
}

/**
 * Service result for Product Quality Scorecard data
 */
export interface ProductQualityScorecardResult extends ReportResult {
  data?: ProductQualityScorecardRecord[];
}

// ==================== DEFECT ROOT CAUSE ANALYSIS ====================

/**
 * Defect Root Cause Analysis Record
 * Analyzes defect patterns by type, product, time, etc.
 */
export interface DefectRootCauseRecord {
  defect_name: string;             // Defect type name
  defect_group: string | null;     // Defect classification group
  total_occurrences: number;       // Total times this defect occurred
  total_ng_qty: number;            // Total NG quantity
  affected_products: number;       // Number of unique products affected
  top_product: string | null;      // Product with most occurrences
  top_line: string | null;         // Production line with most occurrences
  top_station: string | null;      // Station with most occurrences
  trend: string;                   // 'increasing' | 'decreasing' | 'stable'
  avg_ng_per_occurrence: number;   // Average NG per defect occurrence
}

/**
 * Service result for Defect Root Cause data
 */
export interface DefectRootCauseResult extends ReportResult {
  data?: DefectRootCauseRecord[];
}

// ==================== MONTHLY QUALITY TREND ====================

/**
 * Monthly Quality Trend Record
 * Month-over-month quality metrics and trends
 */
export interface MonthlyQualityTrendRecord {
  month_year: string;              // Month/Year (YYYY-MM)
  total_lot: number;               // Total lots in month
  total_lotpass: number;           // Total lots passed in month
  total_inspections: number;       // Total inspections in month
  total_ng: number;                // Total NG in month
  lar: number;                     // Monthly LAR percentage
  dppm: number;                    // Monthly DPPM
  lar_change: number | null;       // Change from previous month (percentage points)
  dppm_change: number | null;      // Change from previous month (ppm)
  rolling_3month_lar: number | null;  // 3-month rolling average LAR
  rolling_3month_dppm: number | null; // 3-month rolling average DPPM
  top_defect: string | null;       // Most common defect this month
  defect_count: number;            // Number of defect types found
}

/**
 * Service result for Monthly Quality Trend data
 */
export interface MonthlyQualityTrendResult extends ReportResult {
  data?: MonthlyQualityTrendRecord[];
}


// ==================== HISTORY TRACKING ====================

/**
 * History Tracking Record
 * Represents a single row from v_history_tracking joined with defect images
 */
export interface HistoryTrackingRecord {
  ww: number;
  shift: string | null;
  sampling_reason_description: string | null;
  round: number;
  lotno: string;
  tab: string | null;
  model: string | null;
  partsite: string | null;
  customers: string | null;
  partno_customer: string | null;
  mclineno: string | null;
  fvi_lot_qty: number | null;
  general_sampling_qty: number | null;
  crack_sampling_qty: number | null;
  qc_name: string | null;
  judgment: boolean | null;
  rejqty: number | null;
  defect_type: string | null;
  defectname: string | null;
  image_ids: number[] | null;
}

/**
 * Service result for History Tracking data
 */
export interface HistoryTrackingResult extends ReportResult {
  data?: HistoryTrackingRecord[];
}

// ==================== DEFECT IMAGE SUMMARY ====================

/**
 * Query parameters for Defect Image Summary report
 */
export interface DefectImageSummaryParams {
  dateFrom: string;  // YYYY-MM-DD
  dateTo: string;    // YYYY-MM-DD
  sites?: string[];
  customerSites?: string[];
  productFamilies?: string[];
  productTypes?: string[];
  models?: string[];
  defects?: string[];
}

/**
 * Defect Image Summary Record
 */
export interface DefectImageSummaryRecord {
  defectname: string;
  image_ids: number[] | null;
}

/**
 * Service result for Defect Image Summary data
 */
export interface DefectImageSummaryResult extends ReportResult {
  data?: DefectImageSummaryRecord[];
}

// ==================== DEFECT TYPE ANALYSIS ====================

/**
 * Defect Type Analysis Record
 * Represents aggregated defect data from inspections joined with defect details
 */
export interface DefectTypeAnalysisRecord {
  inspection_date: string;
  itemno: string;
  model: string;
  version: string;
  lotno: string;
  shift: string;
  tab: string;
  station: string;
  defect_id: number;
  defect_type: string;
  name: string;
  description: string;
  ng_qty: number;
  qc_name: string;
  qc_fullname: string;
  qclead_name: string;
  qclead_fullname: string;
  inspector: string;
  inspector_fullname: string;
  groupvi: string;
  defect_station: string;
  mbr_name: string;
  defect_date: string;
  defect_detail: string;
  image_ids: number[] | null;
  photo_magnification: string;
  stamp: string;
}

/**
 * Service result for Defect Type Analysis data
 */
export interface DefectTypeAnalysisResult extends ReportResult {
  data?: DefectTypeAnalysisRecord[];
}

// ==================== OQA VISUAL INSPECTION ====================

/**
 * OQA Visual Inspection Dashboard Record
 * Represents monthly LAR% and DPPM data per model for combo charts
 */
export interface OQAVIRecord {
  month_year: string;              // Month Year (e.g., '202401')
  product_family: string;          // Product family (e.g., 'Iris')
  customer_site: string;           // Customer site label (e.g., 'SGT (KR)')
  site: string;                    // Site short code (e.g., 'TNHK')
  model: string;                   // Model name (e.g., 'Iris 20.4')
  total_pass_lot: number;          // Number of lots that passed
  total_lot: number;               // Total number of lots inspected
  lar: number;                     // Line Acceptance Rate (percentage)
  total_ng: number;                // Total NG count
  total_inspection: number;        // Total number of inspections
  dppm: number;                    // Defects Per Million value
}

/**
 * Service result for OQA Visual Inspection data
 */
export interface OQAVIResult extends ReportResult {
  data?: OQAVIRecord[];
}

// ==================== OVERVIEW OQA ====================

/**
 * Overview OQA Raw Record (aggregated by partno_customer × defect_group)
 * Returned from v_oqa_overview + v_oqa_overview_defectgroup with DPPM/LAR calculated in SQL
 */
export interface OverviewOQARawRecord {
  partno_customer: string;
  model: string;
  product_type: string;
  total_lot_inspection: number;
  total_lot_pass: number;
  total_lot_fail: number;
  total_sampling: number;
  defect_group: string;
  ng_qty: number;
  lar: number;
  dppm: number;
}

/**
 * Service result for Overview OQA data
 */
export interface OverviewOQAResult extends ReportResult {
  data?: OverviewOQARawRecord[];
}

// ==================== SOQM DAILY ====================

/**
 * SOQM Daily Record
 * Shows NG qty summary per lot from OQA station
 */
export interface SOQMDailyRecord {
  ww: number;
  inspection_date: string;
  model: string;
  inspector_id: string;
  lotno: string;
  total_ng: number;
}

/**
 * Service result for SOQM Daily data
 */
export interface SOQMDailyResult extends ReportResult {
  data?: SOQMDailyRecord[];
}

/**
 * Overview OQA Lot Detail Record
 * Per-lot NG qty for a specific (fy, ww, partno_customer, defect_group)
 */
export interface OverviewOQALotDetailRecord {
  lotno: string;
  ng_qty: number;
  inspection_no: string;
}

/**
 * Service result for Overview OQA Lot Detail
 */
export interface OverviewOQALotDetailResult extends ReportResult {
  data?: OverviewOQALotDetailRecord[];
}

// ==================== TYPE GUARDS ====================

/**
 * Type guard to check if object is a valid LARReportRecord
 */
export function isLARReportRecord(obj: any): obj is LARReportRecord {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.ww === 'string' &&
    typeof obj.total_lot === 'number' &&
    typeof obj.total_pass_lot === 'number' &&
    typeof obj.total_fail_lot === 'number' &&
    typeof obj.total_inspection === 'number' &&
    (obj.defectname === null || typeof obj.defectname === 'string') &&
    typeof obj.total_ng === 'number' &&
    typeof obj.lar === 'number' &&
    typeof obj.dppm === 'number'
  );
}

/**
 * Type guard to check if object is a valid LARReportQueryParams
 */
export function isLARReportQueryParams(obj: any): obj is ReportQueryParams {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    (obj.wwFrom === undefined || typeof obj.wwFrom === 'string') &&
    (obj.wwTo === undefined || typeof obj.wwTo === 'string') &&
    (obj.year === undefined || typeof obj.year === 'string') &&
    (obj.model === undefined || typeof obj.model === 'string')
  );
}

// ==================== CONSTANTS ====================

 
/*
=== LAR REPORT TYPES FEATURES ===

COMPLETE SEPARATION ARCHITECTURE:
✅ Self-contained report entity types
✅ No dependencies on other entities
✅ Clean interface definitions
✅ Type-safe query parameters

DATA STRUCTURES:
✅ LARReportRecord - Raw database result
✅ LARWeeklyReport - Aggregated weekly data
✅ LARReportQueryParams - Flexible filtering
✅ LARReportStats - Summary statistics

TYPE SAFETY:
✅ Type guards for runtime validation
✅ Proper TypeScript interfaces
✅ Null safety for optional fields
✅ Const assertions for defaults

// ==================== FVI INSPECTION ====================

/**
 * Query parameters for FVI Inspection report
 */
export interface FVIInspectionParams {
  inputDateFrom?: string;
  inputDateTo?: string;
  lotno?: string;
  judgment?: string;  // 'true' | 'false' | 'null'
}

/**
 * FVI Inspection Record
 */
export interface FVIInspectionRecord {
  inputdate: string | null;
  lotno: string;
  partsite: string | null;
  lineno: string | null;
  itemno: string | null;
  model: string | null;
  version: string | null;
  station: string | null;
  fvilineno: string | null;
  judgment: boolean | null;
  inspection_date: string | null;
}

/**
 * Service result for FVI Inspection data
 */
export interface FVIInspectionResult extends ReportResult {
  data?: FVIInspectionRecord[];
}

/*
MANUFACTURING QUALITY FOCUS:
✅ LAR (Line Acceptance Rate) calculation
✅ DPPM (Defects Per Million) tracking
✅ Defect type breakdown
✅ Work week (WW) based reporting
✅ Pass/Fail lot tracking
*/
