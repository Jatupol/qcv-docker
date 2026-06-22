// client/src/types/inspectiondata.ts


// ==================== TYPE DEFINITIONS ====================

export interface InspectionData {
  id: number;
  station: string;
  inspection_no: string;
  inspection_no_ref?: string; // Reference inspection number (for SIV)
  inspection_date: Date | string; // Accept both Date and string to preserve local timezone
  fy: string;
  ww: string;
  month_year: string;
  shift: string;
  lotno: string;
  partsite: string;
  mclineno: string;
  itemno: string;
  model: string;
  version: string;
  fvilineno: string;
  sampling_reason_id: number;
  round: number;
  qc_id: number;
  fvi_lot_qty: number;
  general_sampling_qty: number;
  crack_sampling_qty: number;
  judgment: boolean;
  color?: string; // Color Group for SIV station
  created_by?: number;
  updated_by?: number;
  created_at?: Date;
  updated_at?: Date;
}

 export interface InspectionRecord {
  id: string;
  timestamp: string;
  inspectionDate: Date;
  inspector: string;
  model: string;
  samplingRound: number;
  fviLotQty: number;
  generalSamplingQty: number;
  crackSamplingQty: number;
  sampling_reason_id: number;
  sampling_reason_name: string;
  sampling_reason_description: string;
  judgment: 'Pass' | 'Reject' | null;
  lotno: string;
  itemno: string;
  inspectionNo: string;
  inspectionNoRef: string;
  ww: string;
  mclineno: string;
  shift: string;
  station: string;
  fy: string;
  month_year: string;
  partsite: string;
  version: string;
  fvilineno: string;
  qc_id: number;
  color?: string; // Color Group for SIV station
  created_at?: Date;
  updated_at?: Date;
  created_by?: number;
  updated_by?: number;
  ng_num: number;
  defect_num: number;
  defects?: DefectDetail[];
}

export interface DefectDetail {
  id?: number;
  inspection_no: string;
  defect_date: Date;
  qc_name: string;
  qclead_name: string;
  mbr_name: string;
  linevi: string;
  groupvi: string;
  station: string;
  inspector: string;
  defect_id: number;
  defect_name: string;
  defect_detail?: string;
  defect_type?: string; // Defect type (e.g., "Normal defect", "Abnormal defect ≥1", etc.)
  ng_qty: number;
  trayno?: string;
  tray_position?: string;
  color?: string;
  created_at?: Date;
  updated_at?: Date;
  image_urls?: string[]; // Optional: array of image URLs
  inspector_fullname?: string; // Full name from mv_employee
  qc_fullname?: string;       // Full name from mv_employee
  qclead_fullname?: string;   // Full name from mv_employee
  mbr_fullname?: string;      // Full name from mv_employee
  round?: number;
}

export interface CreateInspectionDataRequest {
  station: string;
  inspection_no: string;
  inspection_no_ref?: string; // Reference inspection number (for SIV)
  inspection_date: Date | string; // Accept both Date and string to preserve local timezone
  fy: string; // Fiscal year field
  ww: string;
  month_year: string;
  shift: string;
  lotno: string;
  partsite: string;
  mclineno: string;
  itemno: string;
  model: string;
  version: string;
  fvilineno: string;
  round?: number;
  qc_id: string;
  fvi_lot_qty: number;
  sampling_reason_id: number;
  general_sampling_qty: number;
  crack_sampling_qty: number;
  judgment: boolean;
}

export interface UpdateInspectionDataRequest {
  station?: string;
  inspection_no?: string;
  inspection_no_ref?: string; // Reference inspection number (for SIV)
  fy?: string; // Fiscal year field
  ww?: string; // Work week as string to match InspectionData
  month_year?: string;
  inspection_date?: Date | string; // Accept both Date and string to preserve local timezone
  shift?: string;
  lotno?: string;
  partsite?: string;
  mclineno?: string;
  itemno?: string;
  model?: string;
  version?: string;
  fvilineno?: string;
  sampling_reason_id?: number;
  round?: number;
  qc_id?: number;
  fvi_lot_qty?: number;
  general_sampling_qty?: number;
  crack_sampling_qty?: number;
  judgment?: boolean;
  updated_by?: number;
}

export interface InspectionDataQuery {
  // Pagination
  page?: number;
  limit?: number;
  
  // Sorting
  sort_by?: string;
  sort_order?: 'ASC' | 'DESC';
  
  // Filters
  station?: string;
  ww?: number;
  inspection_date_from?: string; // Changed from Date to string to avoid timezone conversion
  inspection_date_to?: string;   // Changed from Date to string to avoid timezone conversion
  emp_qc_id?: string;
  shift?: string;
  line_fvi_no?: string;
  sampling_reason_id?: number;
  lotno?: string;
  part_site?: string;
  line_mc_no?: string;
  itemno?: string;
  model?: string;
  version?: string;
  round?: number;
  judgment?: boolean | null;
  created_by?: number;
  updated_by?: number;
  
  // Date shortcuts
  today?: boolean;
  yesterday?: boolean;
  this_week?: boolean;
  this_month?: boolean;
  
  // Search
  term?: string;
  fields?: string[];
}

export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
  // Duplicate detection metadata (added for inspection number regeneration)
  regenerated?: boolean; // True if inspection number was regenerated due to duplicate
  originalInspectionNo?: string; // Original inspection number that was duplicate
}

export interface ListResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  message?: string;
  errors?: string[];
}

export interface InspectionDataStatistics {
  total_inspections: number;
  today_inspections: number;
  this_week_inspections: number;
  this_month_inspections: number;
  pass_rate: number;
  reject_rate: number;
  pending_inspections: number;
  by_station: {
    [station: string]: {
      total: number;
      pass: number;
      reject: number;
      pending: number;
    };
  };
  by_shift: {
    [shift: string]: {
      total: number;
      pass: number;
      reject: number;
    };
  };
  by_model: {
    [model: string]: {
      total: number;
      pass: number;
      reject: number;
    };
  };
  latest_inspection_at: Date | null;
}

export interface InspectionTrend {
  date: Date;
  count: number;
  pass_count: number;
  reject_count: number;
  pass_rate: number;
}

export interface OQAInspectionData {
  lotno: string;
  station: string;
  shift: string;
  line_fvi_no: string;
  sampling_reason_id: number;
  part_site: string;
  line_mc_no: string;
  itemno: string;
  model: string;
  version: string;
  round: number;
  emp_qc_id: string;
  fvi_lot_qty: number;
  general_sampling_qty: number;
  crack_sampling_qty: number;
  judgment?: boolean;
}

export interface OQARecommendations {
  existingInspections: InspectionData[];
  canCreateNew: boolean;
  recommendations: {
    suggestedRound: number;
    previousJudgments: boolean[];
    lastInspectionDate: Date | null;
    riskLevel: 'low' | 'medium' | 'high';
  };
}



