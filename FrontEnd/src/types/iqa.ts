// client/src/types/iqa.ts

/**
 * Client-Side IQA Types & Interfaces
 *
 * Type definitions for IQA (Incoming Quality Assurance) data management
 */

import type { ApiResponse, PaginatedApiResponse, BaseQueryParams } from './base';

// ==================== CORE IQA INTERFACES ====================

export interface IQAData {
  id?: number;
  fy: string;              // Fiscal Year (4-digit)
  ww: string;              // Work Week (2-digit)
  fw: string;              // Factory Week (6-character)
  date_iqa: string;
  shift_to_shift: string;
  expense: string;
  re_expense: string;
  qc_owner: string;
  model: string;
  item: string;
  telex: string;
  supplier: string;
  descr: string;
  location: string;
  qty: number;
  supplier_do: string;
  remark: string;
  po: string;
  sbr: string;
  disposition_code: string;
  receipt_date: string;
  age: number;
  warehouse: string;
  building: string;
  business_unit: string;
  std_case_qty: number;
  lpn: number;
  lotno: string;
  ref_code: string;
  data_on_web: string;
  inspec: number;
  rej: number;
  defect: string;
  vender: string;
}

// ==================== EXCEL TEMPLATE CONFIGURATION ====================

export const IQA_EXPECTED_HEADERS = [
  'FW',
  'Date',
  'Shift for Shift',
  'Expense',
  'Re-Expense',
  'QC Owner',
  'MODEL',
  'ITEM',
  'TELEX',
  'SUPPLIER',
  'DESCR',
  'LOCATIONS',
  'QTY',
  'SUPPLIER DO',
  'REMARK',
  'PO#',
  'SBR#',
  'DISPOSITION CODE',
  'RECEIPT_DATE',
  'AGE',
  'Warehouse',
  'Building',
  'Business Unit',
  'Std Case Quantity',
  'LPN',
  'Ref Code(Order Marking)',
  'Lot No',
  'Data on Web',
  'Inspec',
  'Rej.',
  'Defect',
  'Vender'
] as const;

export type IQAHeaderType = typeof IQA_EXPECTED_HEADERS[number];

// ==================== REQUEST/RESPONSE INTERFACES ====================

export interface IQACreateRequest {
  fy?: string;             // Optional: auto-calculated from date_iqa on backend
  ww?: string;             // Optional: auto-calculated from date_iqa on backend
  fw: string;
  date_iqa: string;
  shift_to_shift: string | null;
  expense: string | null;
  re_expense: string | null;
  qc_owner: string | null;
  model: string | null;
  item: string | null;
  telex: string | null;
  supplier: string | null;
  descr: string | null;
  location: string | null;
  qty: number | null;
  supplier_do: string | null;
  remark: string | null;
  po: string | null;
  sbr: string | null;
  disposition_code: string | null;
  receipt_date: string | null;
  age: number | null;
  warehouse: string | null;
  building: string | null;
  business_unit: string | null;
  std_case_qty: number | null;
  lpn: number | null;
  ref_code: string | null;
  lotno: string | null;
  data_on_web: string | null;
  inspec: number | null;
  rej: number | null;
  defect: string | null;
  vender: string | null;
}

export interface IQABulkImportRequest {
  records: IQACreateRequest[];
}

export interface IQABulkImportResponse {
  success: boolean;
  message: string;
  imported: number;
  failed: number;
  errors?: Array<{
    row: number;
    error: string;
  }>;
}

// ==================== QUERY & FILTERING ====================

export interface IQAQueryFilters {
  fy?: string;
  ww?: string;
  fw?: string;
  model?: string;
  supplier?: string;
  qc_owner?: string;
  date_from?: string;
  date_to?: string;
}

export interface IQAQueryOptions extends BaseQueryParams {
  sortBy?: keyof IQAData;
  sortOrder?: 'asc' | 'desc';
}

// ==================== EXPORT INTERFACES ====================

export interface IQAExportData {
  '#': number;
  'FY': string;
  'WW': string;
  'FW': string;
  'Date IQA': string;
  'Shift to Shift': string;
  'Expense': string;
  'Re-Expense': string;
  'QC Owner': string;
  'MODEL': string;
  'ITEM': string;
  'TELEX': string;
  'SUPPLIER': string;
  'DESCR': string;
  'LOCATION': string;
  'QTY': number;
  'SUPPLIER DO': string;
  'REMARK': string;
  'PO': string;
  'SBR': string;
  'DISPOSITION CODE': string;
  'RECEIPT DATE': string;
  'AGE': number;
  'Warehouse': string;
  'Building': string;
  'Business Unit': string;
  'Std Case Qty': number;
  'LPN': number;
  'Ref Code': string;
  'Lot No': string;
  'Data on Web': string;
  'Inspec': number;
  'Rej': number;
  'Defect': string;
  'Vender': string;
}

// ==================== FILTER OPTIONS ====================

export interface IQAFilterOptions {
  fyOptions: string[];
  wwOptions: string[];
}

// ==================== VALIDATION INTERFACES ====================

export interface IQAHeaderValidationResult {
  isValid: boolean;
  errors: string[];
  expectedCount: number;
  actualCount: number;
  mismatches: Array<{
    column: number;
    expected: string;
    actual: string;
  }>;
}

// ==================== UI STATE INTERFACES ====================

export interface IQAListState {
  records: IQAData[];
  filteredRecords: IQAData[];
  loading: boolean;
  error: string | null;
  success: string | null;
  importing: boolean;
  deleting: boolean;
  filters: {
    fy: string;
    ww: string;
  };
  filterOptions: IQAFilterOptions;
  pagination: {
    currentPage: number;
    itemsPerPage: number;
    totalPages: number;
  };
  selection: {
    selectedIds: Set<number>;
    selectAll: boolean;
  };
  sort: {
    field: keyof IQAData | null;
    direction: 'asc' | 'desc';
  };
}

// ==================== DEFECT SUBMISSION INTERFACES ====================

export interface IQADefectSubmission {
  iqa_id: number;
  defect_id: number;
  defect_description: string;
  images?: File[];
}

export interface IQADefectData {
  id: number;
  iqa_id: number;
  defect_id: number;
  defect_name: string;
  defect_description: string;
  image_urls: string[];
  created_at: string;
}

// ==================== CONSTANTS ====================

export const IQA_VALIDATION_RULES = {
  fw: {
    required: true,
    pattern: /^[A-Z0-9]{6}$/,
    errorMessage: 'FW must be 6 characters'
  },
  date_iqa: {
    required: true,
    pattern: /^\d{4}-\d{2}-\d{2}$/,
    errorMessage: 'Date must be in YYYY-MM-DD format'
  },
  qty: {
    min: 0,
    errorMessage: 'Quantity must be a positive number'
  },
  inspec: {
    min: 0,
    errorMessage: 'Inspection quantity must be a positive number'
  },
  rej: {
    min: 0,
    errorMessage: 'Rejection quantity must be a positive number'
  }
} as const;

export const IQA_LIMITS = {
  bulkImport: 1000,
  bulkDelete: 100,
  listPageSize: 50,
  maxPageSize: 200
} as const;

// ==================== UTILITY TYPES ====================

export type IQASortField = keyof IQAData;

export type IQAAction =
  | 'import'
  | 'export'
  | 'delete'
  | 'bulk_delete'
  | 'filter'
  | 'sort'
  | 'submit_defect';

// ==================== ERROR TYPES ====================

export interface IQAError {
  type: 'validation' | 'import' | 'network' | 'server';
  message: string;
  field?: string;
  row?: number;
  details?: any;
}

export class IQAValidationError extends Error {
  public field: string;
  public row?: number;

  constructor(message: string, field: string, row?: number) {
    super(message);
    this.name = 'IQAValidationError';
    this.field = field;
    this.row = row;
  }
}

export class IQAImportError extends Error {
  public errors: Array<{ row: number; error: string }>;

  constructor(message: string, errors: Array<{ row: number; error: string }>) {
    super(message);
    this.name = 'IQAImportError';
    this.errors = errors;
  }
}
