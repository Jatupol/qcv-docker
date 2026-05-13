// client/src/types/report.ts
// Centralized Types - Single Source of Truth
// All entity types and shared interfaces in one place
import { calculateFiscalWeekNumber, getFiscalYear, getCurrentFiscalWeek, getCurrentFiscalYear } from '@qcv/shared';

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
  productFamilies?: string[];
  productTypes?: string[];
  isCustomerReport?: boolean;
}


export interface DefectLegendItem {
  name: string;
  color: string;
}


// ========================================= Report INTERFACES =========================================
/**
 * Customer Report 
 * /report/lar-report			LARPage
   /report/sgt-iqa-vs-nhk-oqa		SGTIQAvsNHKOQAPage
   /report/oqaoverall-rereport		OverallOQAPage
   /report/sgt-iqa-result-report		SGTIQAResultPage
   /report/sgt-iqa-trend-report		SGTIQATrendPage
 * 
 */


/**
 * LAR Report Data Record Interface
 */
export interface LARReportRecord {
  ww: string;
  total_lot: number;
  total_pass_lot: number;
  total_fail_lot: number;
  total_inspection: number;
  total_ng: number;
  lar: number;
  dppm: number;
  defects: { 
    [key: string]: number;
  };
}

/**
 *  IQA OQA DPPM Overall Report Data Record
 */
export interface IQAOQADPPMOverallRecord {
  yearmonth: string;                   // Year Month, optional end 99 for mark curent yearmonth (e.g., '20250199', '202502')
  dppmTarget: number;                  // DPPM target
  total_lot_oqa?: number;               // OQA Total number of lots inspected
  total_pass_lot_oqa?: number;          // OQA Number of lots that passed
  total_fail_lot_oqa?: number;          // OQA Number of lots that failed
  total_inspection_oqa?: number;        // OQA Total number of inspections performed
  total_ng_oqa?: number;                // OQA Total number of inspections performed
  lar_oqa?: number;                     // OQA Defects Per Million (parts)
  dppm_oqa: number;                    // OQA Defects Per Million (parts)
  total_lot_iqa?: number;               // IQA Total number of lots inspected
  total_pass_lot_iqa?: number;          // IQA Number of lots that passed
  total_fail_lot_iqa?: number;          // IQA Number of lots that failed
  total_inspection_iqa?: number;        // IQA Total number of inspections performed
  total_ng_iqa?: number;                // IQA Total number of inspections performed
  lar_iqa?: number;                     // IQA Defects Per Million (parts)
  dppm_iqa: number;                    // IQA Defects Per Million (parts)
}

/**
 *  OQA DPPM Overall Report Data Record
 */
export interface OQADPPMOverallRecord {
  yearmonth: string;
  lar: number;
  dppmTarget: number;
  dppm: number;
  defects: {
    [key: string]: number;
  };
}

/**
 * Seagate IQA Result Report Data Record
 */
export interface SGTIQAResultRecord {
  fyww: string;
  fy: string;
  ww: string;  
  model: string;
  total_inspection_lot: number;
  acceptable_lot: number;
  rejected_lot: number;
  rejected_qty: number;
  lar: number | string;
}

/**
 * SGT IQA Trend Report Data Record
 */
export interface SGTIQATrendRecord {
  yearmonth: string;
  model: string;
  product_type: string;
  total_lot: number;
  total_pass_lot: number;
  total_fail_lot: number;
  total_inspection: number;
  total_ng: number;  //Rej
  lar: number;
  dppm: number;
  defects: {
    [key: string]: number;
  }; 
}

/**
 * SGT IQA WEEKLY TREND REPORT  Data Record
 */
/**
 * History Tracking Record
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

/**
 * Defect Image Summary Record
 */
export interface DefectImageSummaryRecord {
  defectname: string;
  image_ids: number[] | null;
}

/**
 * Overview OQA Raw Record (aggregated by partno_customer × defect_group)
 * DPPM and LAR calculated on backend
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

