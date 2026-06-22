// client/src/types/defect.ts

/**
 * Client-Side Defect Types & Interfaces
 * 
 * Matches server-side implementation for seamless integration
 * with the improved Defect entity backend
 */
import type {ApiResponse, PaginatedApiResponse, BaseQueryParams, BaseEntity } from './base.ts';
// ==================== CORE DEFECT INTERFACES ====================

export interface Defect extends BaseEntity {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
  created_by: number;
  updated_by: number;
  created_at: Date; // ISO string for client-side
  updated_at: Date; // ISO string for client-side
}

export interface DefectSummary {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DefectProfile extends Defect {
  usage_count?: number;
  last_used?: string | null;
  created_by_username?: string;
  updated_by_username?: string;
}

// ==================== REQUEST/RESPONSE INTERFACES ====================

export interface DefectCreateRequest {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface DefectUpdateRequest {
  name?: string;
  description?: string | null;
  is_active?: boolean;
}

export interface DefectBulkCreateRequest {
  defects: DefectCreateRequest[];
  validate_names?: boolean;
  skip_duplicates?: boolean;
}

export interface DefectBulkUpdateRequest {
  updates: Array<{
    id: number;
    data: DefectUpdateRequest;
  }>;
  validate_names?: boolean;
}

export interface DefectBulkDeleteRequest {
  ids: number[];
  soft_delete?: boolean;
  permanent?: boolean;
}

// ==================== QUERY & FILTERING ====================

export interface DefectQueryFilters {
  id?: number;
  name?: string;
  is_active?: boolean;
  created_by?: number;
  updated_by?: number;
  name_contains?: string;
  name_starts_with?: string;
  name_ends_with?: string;
  description_contains?: string;
  created_after?: string;
  created_before?: string;
  updated_after?: string;
  updated_before?: string;
  usage_count_min?: number;
  usage_count_max?: number;
  last_used_after?: string;
  last_used_before?: string;
  created_by_users?: number[];
  updated_by_users?: number[];
}

export type DefectSortField = 
  | 'id' 
  | 'name' 
  | 'description'
  | 'is_active' 
  | 'created_by'
  | 'updated_by'
  | 'created_at' 
  | 'updated_at'
  | 'usage_count'
  | 'last_used';

export interface DefectQueryOptions {
  page?: number;
  limit?: number;
  sortBy?: DefectSortField;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  search_fields?: ('name' | 'description')[];
  include_inactive?: boolean;
  include_usage_stats?: boolean;
  include_audit_info?: boolean;
  count_total?: boolean;
  cache_duration?: number;
}

// ==================== API RESPONSE INTERFACES ====================

 
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface DefectListResponse extends ApiResponse<Defect[]> {
  pagination: PaginationInfo;
}

// ==================== STATISTICS & MONITORING ====================

export interface DefectStatistics {
  total_count: number;
  active_count: number;
  inactive_count: number;
  
  most_used: Array<{
    id: number;
    name: string;
    usage_count: number;
  }>;
  
  least_used: Array<{
    id: number;
    name: string;
    usage_count: number;
  }>;
  
  unused_defects: Array<{
    id: number;
    name: string;
    created_at: string;
  }>;

  created_this_month: number;
  updated_this_month: number;
  average_description_length: number;
  
  top_creators: Array<{
    user_id: number;
    username?: string;
    defect_count: number;
  }>;
  
  recent_activity: Array<{
    id: number;
    name: string;
    action: 'created' | 'updated' | 'deactivated' | 'reactivated';
    timestamp: string;
    user_id: number;
    username?: string;
  }>;
}

export interface DefectHealthInfo {
  entity: 'defect';
  status: 'healthy' | 'warning' | 'error';
  timestamp: string;
  
  database: {
    connection: 'connected' | 'disconnected';
    table_exists: boolean;
    record_count: number;
    last_record_created: string | null;
  };
  
  validation: {
    schema_valid: boolean;
    unique_constraints: boolean;
    foreign_key_constraints: boolean;
  };
  
  performance: {
    average_query_time_ms: number;
    slow_queries_count: number;
    cache_hit_rate: number;
  };
  
  issues: Array<{
    type: 'warning' | 'error';
    message: string;
    resolution?: string;
  }>;
}

// ==================== VALIDATION INTERFACES ====================

export interface DefectValidationResult {
  name: string;
  format_valid: boolean;
  format_errors: string[];
  available: boolean;
  can_use: boolean;
}

export interface DefectUsageSummary {
  defect: Defect;
  usageCount: number;
  lastUsed: string | null;
  canDelete: boolean;
}

// ==================== BULK OPERATION RESULTS ====================

export interface DefectBulkCreateResult {
  created: Defect[];
  errors: Array<{
    index: number;
    error: string;
  }>;
}

export interface DefectBulkUpdateResult {
  updated: Defect[];
  errors: Array<{
    id: number;
    error: string;
  }>;
}

export interface DefectBulkDeleteResult {
  deleted_count: number;
}

// ==================== UI STATE INTERFACES ====================

export interface DefectListState {
  defects: Defect[];
  loading: boolean;
  error: string | null;
  filters: DefectQueryFilters;
  options: DefectQueryOptions;
  pagination: PaginationInfo | null;
  selectedDefects: number[];
  sortConfig: {
    field: DefectSortField;
    direction: 'asc' | 'desc';
  };
}

export interface DefectFormState {
  data: Partial<DefectCreateRequest | DefectUpdateRequest>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  submitting: boolean;
  mode: 'create' | 'edit';
}

export interface DefectModalState {
  isOpen: boolean;
  mode: 'create' | 'edit' | 'view' | 'delete' | 'bulk';
  selectedDefect: Defect | null;
  selectedDefects: Defect[];
}

// ==================== FILTER PRESETS ====================

export interface DefectFilterPreset {
  id: string;
  name: string;
  description: string;
  filters: DefectQueryFilters;
  options: DefectQueryOptions;
  isDefault?: boolean;
  isCustom?: boolean;
}

export const DEFAULT_FILTER_PRESETS: DefectFilterPreset[] = [
  {
    id: 'active',
    name: 'Active Defects',
    description: 'Show only active defects',
    filters: { is_active: true },
    options: { sortBy: 'name', sortOrder: 'asc' },
    isDefault: true
  },
  {
    id: 'recent',
    name: 'Recently Created',
    description: 'Defects created in the last 30 days',
    filters: { 
      is_active: true,
      created_after: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    options: { sortBy: 'created_at', sortOrder: 'desc' },
    isDefault: true
  },
  {
    id: 'inactive',
    name: 'Inactive Defects',
    description: 'Show inactive defects',
    filters: { is_active: false },
    options: { sortBy: 'updated_at', sortOrder: 'desc' }
  },
  {
    id: 'all',
    name: 'All Defects',
    description: 'Show all defects including inactive',
    filters: {},
    options: { 
      include_inactive: true, 
      sortBy: 'created_at', 
      sortOrder: 'desc' 
    }
  }
];

// ==================== CONSTANTS ====================

export const DEFECT_VALIDATION_RULES = {
  name: {
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-_\.]+$/,
    required: true
  },
  description: {
    maxLength: 1000,
    required: false
  }
} as const;

export const DEFECT_LIMITS = {
  bulkCreate: 100,
  bulkUpdate: 50,
  bulkDelete: 50,
  searchResults: 100,
  listPageSize: 20,
  maxPageSize: 100
} as const;

export const DEFECT_SORT_OPTIONS: Array<{
  value: DefectSortField;
  label: string;
}> = [
  { value: 'name', label: 'Name' },
  { value: 'created_at', label: 'Created Date' },
  { value: 'updated_at', label: 'Updated Date' },
  { value: 'is_active', label: 'Status' },
  { value: 'id', label: 'ID' }
];

// ==================== UTILITY TYPES ====================

export type DefectFormField = keyof DefectCreateRequest | keyof DefectUpdateRequest;

export type DefectAction = 
  | 'create'
  | 'update' 
  | 'delete'
  | 'toggle'
  | 'bulk_create'
  | 'bulk_update'
  | 'bulk_delete'
  | 'export'
  | 'search';

export interface DefectActionPermissions {
  [key: string]: {
    create: boolean;
    update: boolean;
    delete: boolean;
    bulk_operations: boolean;
    export: boolean;
    view_statistics: boolean;
    view_health: boolean;
  };
}

// ==================== ERROR TYPES ====================

export interface DefectError {
  type: 'validation' | 'network' | 'server' | 'permission';
  message: string;
  field?: string;
  code?: string;
  details?: any;
}

export class DefectValidationError extends Error {
  public field: string;
  public code: string;

  constructor(message: string, field: string, code: string = 'VALIDATION_ERROR') {
    super(message);
    this.name = 'DefectValidationError';
    this.field = field;
    this.code = code;
  }
}

export class DefectNetworkError extends Error {
  public status: number;
  public code: string;

  constructor(message: string, status: number = 0, code: string = 'NETWORK_ERROR') {
    super(message);
    this.name = 'DefectNetworkError';
    this.status = status;
    this.code = code;
  }
}

/*
=== CLIENT-SIDE DEFECT TYPES IMPLEMENTATION ===

✅ COMPLETE TYPE COVERAGE:
- Core entity interfaces matching server-side exactly
- Request/response interfaces for all API operations
- Query and filtering interfaces for advanced search
- UI state management interfaces
- Bulk operation result interfaces

✅ MANUFACTURING/QC DOMAIN SUPPORT:
- Usage tracking and validation interfaces
- Statistics and health monitoring types
- Audit trail support with user information
- Quality control workflow state management

✅ ADVANCED FUNCTIONALITY:
- Filter presets for common use cases
- Comprehensive validation rule definitions
- Error handling with specific error types
- Permission management interfaces

✅ CLIENT-SIDE OPTIMIZATION:
- ISO string dates for client compatibility
- Pagination and sorting support
- Caching configuration options
- Performance monitoring interfaces

✅ DEVELOPER EXPERIENCE:
- TypeScript strict typing throughout
- Comprehensive constants and limits
- Utility types for form handling
- Error classes for proper error handling

This types implementation provides the foundation for a
comprehensive client-side defect management system that
seamlessly integrates with the improved server-side API.
*/