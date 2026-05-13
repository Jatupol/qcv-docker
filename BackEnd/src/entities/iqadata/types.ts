// server/src/entities/iqadata/types.ts
/**
 * IQA Data Entity Types - SPECIAL Pattern Implementation
 * Manufacturing Quality Control System - Bulk Import & Analytics
 */

import {
  BaseSpecialEntity,
  SpecialEntityRequest,
  SpecialQueryOptions,
  SpecialApiResponse,
  SpecialEntityConfig,
  PrimaryKeyConfig
} from '../../generic/entities/special-entity/generic-types';

// ==================== CORE IQA DATA INTERFACES ====================

/**
 * IQA Data entity interface - Special pattern with id as primary key
 * Extends BaseSpecialEntity to include standard audit fields
 */
export interface IQAData extends BaseSpecialEntity {
  // Primary Key Field
  id: number;                          // SERIAL PRIMARY KEY

  // IQA Data Fields (all optional for flexible bulk import)
  fy?: string;
  ww?: string;
  fw?: string;
  date_iqa?: string;
  shift_to_shift?: string;
  expense?: string;
  re_expense?: string;
  qc_owner?: string;
  model?: string;
  item?: string;
  telex?: string;
  supplier?: string;
  descr?: string;
  location?: string;
  qty?: number;
  supplier_do?: string;
  remark?: string;
  po?: string;
  sbr?: string;
  disposition_code?: string;
  receipt_date?: string;
  age?: number;
  warehouse?: string;
  building?: string;
  business_unit?: string;
  std_case_qty?: number;
  lpn?: number;
  lotno?: string;
  ref_code?: string;
  data_on_web?: string;
  inspec?: number;
  rej?: number;
  defect?: string;
  vender?: string;
  import_at?: Date;

  // Search highlighting (optional)
  highlight?: Record<string, string>;
}

// ==================== REQUEST/RESPONSE INTERFACES ====================

/**
 * Create IQA Data Request
 */
export interface CreateIQADataRequest {
  fy?: string;
  ww?: string;
  fw?: string;
  date_iqa?: string;
  shift_to_shift?: string;
  expense?: string;
  re_expense?: string;
  qc_owner?: string;
  model?: string;
  item?: string;
  telex?: string;
  supplier?: string;
  descr?: string;
  location?: string;
  qty?: number;
  supplier_do?: string;
  remark?: string;
  po?: string;
  sbr?: string;
  disposition_code?: string;
  receipt_date?: string;
  age?: number;
  warehouse?: string;
  building?: string;
  business_unit?: string;
  std_case_qty?: number;
  lpn?: number;
  lotno?: string;
  ref_code?: string;
  data_on_web?: string;
  inspec?: number;
  rej?: number;
  defect?: string;
  vender?: string;
}

/**
 * Update IQA Data Request
 */
export interface UpdateIQADataRequest {
  fy?: string;
  ww?: string;
  fw?: string;
  date_iqa?: string;
  shift_to_shift?: string;
  expense?: string;
  re_expense?: string;
  qc_owner?: string;
  model?: string;
  item?: string;
  telex?: string;
  supplier?: string;
  descr?: string;
  location?: string;
  qty?: number;
  supplier_do?: string;
  remark?: string;
  po?: string;
  sbr?: string;
  disposition_code?: string;
  receipt_date?: string;
  age?: number;
  warehouse?: string;
  building?: string;
  business_unit?: string;
  std_case_qty?: number;
  lpn?: number;
  lotno?: string;
  ref_code?: string;
  data_on_web?: string;
  inspec?: number;
  rej?: number;
  defect?: string;
  vender?: string;
}

/**
 * IQA Data Query Options
 */
export interface IQADataQueryOptions extends SpecialQueryOptions {
  fw?: string;
  model?: string;
  supplier?: string;
  qc_owner?: string;
  date_iqa_from?: string;
  date_iqa_to?: string;
}

// ==================== BULK IMPORT INTERFACE ====================

export interface BulkImportRequest {
  data: CreateIQADataRequest[];
}

export interface BulkImportResponse {
  success: boolean;
  imported: number;
  failed: number;
  unchanged?: number;
  errors?: string[];
  data?: IQAData[];
  details?: {
    inserted: number;
    updated: number;
    unchanged: number;
    duplicates?: Array<{ lotno: string; model: string; date_iqa: string }>;
  };
}

// ==================== SUMMARY AND PROFILE INTERFACES ====================

export interface IQADataSummary {
  id: number;
  fy?: string;
  ww?: string;
  fw?: string;
  date_iqa?: string;
  shift_to_shift?: string;
  qc_owner?: string;
  model?: string;
  item?: string;
  supplier?: string;
  qty?: number;
  defect?: string;
  import_at?: Date;
}

export interface IQADataProfile extends IQAData {}

// ==================== PAGINATION RESPONSE ====================

export interface IQADataPaginatedResponse {
  data: IQAData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ==================== API RESPONSE TYPES ====================

export interface IQADataApiResponse extends SpecialApiResponse<IQAData> {}

export interface IQADataListResponse extends SpecialApiResponse<IQADataPaginatedResponse> {}

// ==================== CONFIGURATION ====================

export interface IQADataEntityConfig extends SpecialEntityConfig {}

// ==================== DEFAULT CONFIGURATIONS ====================

export const DEFAULT_IQADATA_CONFIG: IQADataEntityConfig = {
  entityName: 'IQAData',
  tableName: 'iqadata',
  apiPath: '/api/iqadata',

  // Primary key configuration
  primaryKey: {
    fields: ['id'],
    routePattern: ':id'
  },

  // Validation configuration
  requiredFields: [],  // No required fields for bulk import flexibility

  // Search configuration
  searchableFields: ['ww', 'model', 'supplier', 'qc_owner', 'item', 'lotno', 'defect'],
  defaultLimit: 50,
  maxLimit: 500,


};
