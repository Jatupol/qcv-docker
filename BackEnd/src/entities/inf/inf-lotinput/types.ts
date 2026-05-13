// server/src/entities/inf/inf-lotinput/types.ts
// ===== SIMPLIFIED INF LOT INPUT ENTITY TYPES =====
// Data Display Only - Matching Frontend Interface
// Sampling Inspection Control System - Simplified Read-Only Entity

// ==================== CORE INTERFACES ====================

/**
 * INF Lot Input Record - Matches frontend interface exactly
 */
export interface InfLotInputRecord {
  id: string;
  LotNo: string;
  PartSite: string;
  LineNo: string;
  ItemNo: string;
  Model: string;
  Version: string;
  InputDate: string;
  FinishOn?: string | null;
  imported_at: string;
}

/**
 * Query parameters for filtering and pagination
 */
export interface InfLotInputQueryParams {
  // Pagination
  page?: number;
  limit?: number;

  // Search fields
  lotNoSearch?: string;
  itemNoSearch?: string;
  globalSearch?: string;

  // Dropdown filters
  partSite?: string;
  lineNo?: string;
  model?: string;
  version?: string;
  status?: 'ALL' | 'IN_PROGRESS' | 'FINISHED' | 'EXPIRED';

  // Date filters
  inputDateFrom?: string;
  inputDateTo?: string;

  // Legacy support for complex filters
  lotNo?: string;
  itemNo?: string;
  search?: string;
}

/**
 * Pagination information
 */
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * API response structure
 */
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
  pagination?: PaginationInfo;
}

/**
 * Statistics for dashboard
 */
export interface ImportStats {
  totalRecords: number;
  totalToday: number;
  totalMonth: number;
  totalYear: number;
  lastSync?: string;
}

/**
 * Filter options for dropdowns
 */
export interface FilterOptions {
  partSites: string[];
  lineNos: string[];
  models: string[];
  versions: string[];
}

// ==================== SERVICE RESULT TYPES ====================

export type InfLotInputServiceResult<T = InfLotInputRecord> = ApiResponse<T>;
export type InfLotInputListResult = ApiResponse<InfLotInputRecord[]>;
export type InfLotInputStatsResult = ApiResponse<ImportStats>;

// ==================== DATABASE CONFIGURATION ====================

/**
 * Database table configuration
 */
export const INF_LOTINPUT_TABLE_CONFIG = {
  tableName: 'inf_lotinput',
  primaryKey: 'id',

  // Field mappings: database_field -> frontend_field
  fieldMappings: {
    'id': 'id',
    'lotno': 'LotNo',
    'partsite': 'PartSite',
    'lineno': 'LineNo',
    'itemno': 'ItemNo',
    'model': 'Model',
    'version': 'Version',
    'inputdate': 'InputDate',
    'finish_on': 'FinishOn',
    'imported_at': 'imported_at'
  },

  // Searchable fields (database column names)
  searchableFields: ['lotno', 'partsite', 'lineno', 'itemno', 'model', 'version'],

  // Date fields for filtering
  dateFields: ['inputdate', 'finish_on', 'imported_at'],

  // Default pagination
  defaultLimit: 50,
  maxLimit: 200
};

export default InfLotInputRecord;