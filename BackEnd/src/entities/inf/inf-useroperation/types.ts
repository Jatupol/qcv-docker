// server/src/entities/inf/inf-useroperation/types.ts
// ===== INF USER OPERATION ENTITY TYPES =====
// Data Display Only - Synced from External MSSQL
// User/Operator Management Interface

// ==================== CORE INTERFACES ====================

/**
 * INF User Operation Record - Matches frontend interface exactly
 */
export interface InfUserOperationRecord {
  username: string;
  isActive: boolean;
  isDelete: boolean;
  isSuperAdmin: boolean;
  roleCode: string | null;
  operatorName: string | null;
  isMrb: boolean;
  lineNoId: string | null;
  workShiftId: string | null;
  importedAt: string;
}

/**
 * Query parameters for filtering and pagination
 */
export interface InfUserOperationQueryParams {
  // Pagination
  page?: number;
  limit?: number;

  // Search fields
  usernameSearch?: string;
  operatorNameSearch?: string;
  globalSearch?: string;

  // Dropdown filters
  roleCode?: string;
  lineNoId?: string;
  workShiftId?: string;

  // Boolean filters
  isActive?: boolean;
  isSuperAdmin?: boolean;
  isMrb?: boolean;
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
  totalActive: number;
  totalInactive: number;
  totalSuperAdmin: number;
  totalMrb: number;
  lastSync?: string;
}

/**
 * Filter options for dropdowns
 */
export interface FilterOptions {
  roleCodes: string[];
  lineNoIds: string[];
  workShiftIds: string[];
}

/**
 * Sync result from MSSQL
 */
export interface SyncResult {
  imported: number;
  updated: number;
  skipped: number;
  failed: number;
  errors?: string[];
}

// ==================== SERVICE RESULT TYPES ====================

export type InfUserOperationServiceResult<T = InfUserOperationRecord> = ApiResponse<T>;
export type InfUserOperationListResult = ApiResponse<InfUserOperationRecord[]>;
export type InfUserOperationStatsResult = ApiResponse<ImportStats>;
export type InfUserOperationSyncResult = ApiResponse<SyncResult>;

// ==================== DATABASE CONFIGURATION ====================

/**
 * Database table configuration
 */
export const INF_USEROPERATION_TABLE_CONFIG = {
  tableName: 'inf_useroperation',
  primaryKey: 'username',

  // Field mappings: database_field -> frontend_field
  fieldMappings: {
    'username': 'username',
    'is_active': 'isActive',
    'is_delete': 'isDelete',
    'is_super_admin': 'isSuperAdmin',
    'role_code': 'roleCode',
    'operator_name': 'operatorName',
    'is_mrb': 'isMrb',
    'line_no_id': 'lineNoId',
    'work_shift_id': 'workShiftId',
    'imported_at': 'importedAt'
  },

  // Searchable fields (database column names)
  searchableFields: ['username', 'operator_name', 'role_code', 'line_no_id', 'work_shift_id'],

  // Date fields for filtering
  dateFields: ['imported_at'],

  // Boolean fields for filtering
  booleanFields: ['is_active', 'is_super_admin', 'is_mrb', 'is_delete'],

  // Default pagination
  defaultLimit: 50,
  maxLimit: 200
};

export default InfUserOperationRecord;
