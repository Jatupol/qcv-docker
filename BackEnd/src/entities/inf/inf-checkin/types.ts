// server/src/entities/inf/inf-checkin/types.ts
// ===== SIMPLIFIED INF CHECKIN ENTITY TYPES =====
// Data Display Only - Matching Frontend Interface
// Manufacturing Quality Control System - Simplified Read-Only Entity

// ==================== CORE INTERFACES ====================

/**
 * INF CheckIn Record - Matches frontend interface exactly
 */
export interface InfCheckinRecord {
  id: string;
  line_no_id?: string | null;
  work_shift_id?: string | null;
  gr_code?: string | null;
  username?: string | null;
  oprname?: string | null;
  created_on?: string | null;
  checked_out?: string | null;
  date_time_start_work?: string | null;
  date_time_off_work?: string | null;
  time_off_work?: string | null;
  time_start_work?: string | null;
  group_code?: string | null;
  team?: string | null;
  imported_at?: string | null;
}

/**
 * Query parameters for filtering and pagination
 */
export interface InfCheckinQueryParams {
  // Pagination
  page?: number;
  limit?: number;

  // Search fields
  username?: string;
  oprname?: string;
  usernameSearch?: string;
  lineNoSearch?: string;
  globalSearch?: string;

  // Dropdown filters
  line_no_id?: string;
  work_shift_id?: string;
  group_code?: string;
  team?: string;
  status?: 'all' | 'working' | 'checked_out';

  // Date filters
  createdOnFrom?: string;
  createdOnTo?: string;

  // Legacy support for complex filters
  lineId?: string;
  shiftId?: string;
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
export interface CheckinStats {
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
  lineIds: string[];
  workShiftIds: string[];
  groupCodes: string[];
  teams: string[];
}

// ==================== SERVICE RESULT TYPES ====================

export type InfCheckinServiceResult<T = InfCheckinRecord> = ApiResponse<T>;
export type InfCheckinListResult = ApiResponse<InfCheckinRecord[]>;
export type InfCheckinStatsResult = ApiResponse<CheckinStats>;

// ==================== DATABASE CONFIGURATION ====================

/**
 * Database table configuration
 */
export const INF_CHECKIN_TABLE_CONFIG = {
  tableName: 'inf_checkin',
  primaryKey: 'id',

  // Field mappings: database_field -> frontend_field
  fieldMappings: {
    'id': 'id',
    'line_no_id': 'line_no_id',
    'work_shift_id': 'work_shift_id',
    'gr_code': 'gr_code',
    'username': 'username',
    'oprname': 'oprname',
    'created_on': 'created_on',
    'checked_out': 'checked_out',
    'date_time_start_work': 'date_time_start_work',
    'date_time_off_work': 'date_time_off_work',
    'time_off_work': 'time_off_work',
    'time_start_work': 'time_start_work',
    'group_code': 'group_code',
    'team': 'team',
    'imported_at': 'imported_at'
  },

  // Searchable fields (database column names)
  searchableFields: ['username','oprname',  'line_no_id', 'work_shift_id', 'group_code', 'team'],

  // Date fields for filtering
  dateFields: ['created_on', 'checked_out', 'date_time_start_work', 'date_time_off_work', 'imported_at'],

  // Default pagination
  defaultLimit: 50,
  maxLimit: 200
};

// ==================== MODEL INTERFACE ====================

/**
 * Simplified model interface for basic operations
 */
export interface InfCheckinModel {
  getAll(queryParams: InfCheckinQueryParams): Promise<{
    data: InfCheckinRecord[];
    pagination?: PaginationInfo;
  }>;

  getByUsername(username: string): Promise<InfCheckinRecord[]>;
  getByLineId(lineId: string): Promise<InfCheckinRecord[]>;
  getActiveWorkers(): Promise<InfCheckinRecord[]>;
  getStatistics(): Promise<CheckinStats>;
  getFilterOptions(): Promise<FilterOptions>;
  searchRecords(searchParams: {
    searchTerm?: string;
    username?: string;
    oprname?: string;
    lineId?: string;
    groupCode?: string;
    team?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<InfCheckinRecord[]>;
}

export default InfCheckinRecord;

/*
=== SIMPLIFIED INF CHECKIN TYPES ===

SIMPLIFIED STRUCTURE:
✅ Direct interfaces without complex inheritance
✅ Simple query parameter types
✅ Standard API response patterns
✅ Consistent with inf-lotinput architecture

CORE INTERFACES:
✅ InfCheckinRecord - Main data record interface
✅ InfCheckinQueryParams - Query filtering parameters
✅ CheckinStats - Dashboard statistics
✅ FilterOptions - Dropdown options
✅ Simple model interface for basic operations

RESULT TYPES:
✅ InfCheckinListResult for data lists
✅ InfCheckinStatsResult for statistics
✅ Standard success/error structure
✅ Pagination support

DATABASE CONFIGURATION:
✅ Table and field mappings
✅ Searchable fields definition
✅ Date field identification
✅ Pagination defaults

The simplified types match inf-lotinput structure exactly
while supporting manufacturing check-in functionality.
*/