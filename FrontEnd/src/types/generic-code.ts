// client/src/types/generic-code.ts

/**
 * Enhanced Generic Code Types
 * 
 * Complete type definitions for the Generic entity including:
 * - Core site interfaces
 * - API request/response types
 * - Form and validation types
 * - UI state management types
 * - Statistics and analytics types
 */
// ==================== CORE SITE INTERFACES ====================

export interface Code {
  code: string;
  name: string;
  is_active: boolean;
  created_by: number ;
  updated_by: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateCodeRequest {
  code: string;
  name: string;
  is_active?: boolean;
}

export interface UpdateCodeRequest {
  name?: string;
  is_active?: boolean;
}

// ==================== API RESPONSE TYPES ====================

export interface CodeResponse {
  success: boolean;
  data?: Code;
  message?: string;
  error?: string;
  timestamp: string;
}

export interface CodeListResponse {
  success: boolean;
  data?: Code[]; // Direct array of sites
  message?: string;
  error?: string;
  timestamp: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CodeStatsResponse {
  success: boolean;
  data?: CodeStats;
  message?: string;
  error?: string;
  timestamp: string;
}

export interface BulkOperationResult {
  success: boolean;
  message?: string;
  summary?: {
    total: number;
    successful: number;
    failed: number;
  };
  results?: Array<{
    code: string;
    success: boolean;
    error?: string;
    data?: Code;
  }>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp?: string;
  summary?: {
    total: number;
    successful: number;
    failed: number;
  };
  details?: Array<{
    code: string;
    success: boolean;
    error?: string;
    data?: Code;
  }>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ==================== UI STATE TYPES ====================
 
export interface CodeModalState {
  isOpen: boolean;
  mode: ModalMode;
  site?: Code;
  loading: boolean;
  error?: string;
}

// ==================== TABLE COLUMN TYPES ====================

export interface CodeTableColumn {
  key: keyof Code | 'actions' | 'select';
  title: string;
  sortable: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (site: Code) => React.ReactNode;
}

// ==================== QUERY AND FILTER TYPES ====================
export type CodeSortField = 
  | 'code'
  | 'name' 
  | 'is_active'
  | 'created_at'
  | 'updated_at'
  | 'created_by'
  | 'updated_by';

export type SortOrder =  'ASC' | 'DESC';

export interface CodeQueryParams {
  search?: string;
  page?: number;
  limit?: number;
  is_active?: boolean;
  sort_by?: CodeSortField;
  sort_order?: SortOrder;
}

export interface CodeFilters {
  search: string;
  isActive: boolean | null;
  dateRange: {
    start: string;
    end: string;
  };
  createdBy?: number;
  updatedBy?: number;
}

// ==================== STATISTICS TYPES ====================

export interface CodeStats {
  total: number;
  active: number;
  inactive: number;
  recentlyCreated: number;
  recentlyUpdated: number;
  createdToday: number;
  createdThisWeek: number;
  createdThisMonth: number;
  updatedToday: number;
  updatedThisWeek: number;
  updatedThisMonth: number;
  byStatus: {
    active: number;
    inactive: number;
  };
  byCreatedBy?: {
    [userId: number]: number;
  };
  trends?: {
    period: string;
    created: number;
    updated: number;
    activated: number;
    deactivated: number;
  }[];
}




// ==================== FORM TYPES ====================

export interface CodeFormData {
  code: string;
  name: string;
  is_active: boolean;
}

export interface CodeFormErrors {
  code?: string;
  name?: string;
  general?: string;
}

export interface CodeFormState {
  data: CodeFormData;
  errors: CodeFormErrors;
  touched: {
    code: boolean;
    name: boolean;
  };
  isValid: boolean;
  isSubmitting: boolean;
  isDirty: boolean;
}

// ==================== VALIDATION TYPES ====================

export interface CodeValidationResult {
  isValid: boolean;
  message?: string;
  errors?: string[];
}

export interface CodeValidationRules {
  code: {
    required: boolean;
    minLength: number;
    maxLength: number;
    pattern: RegExp;
    checkAvailability: boolean;
  };
  name: {
    required: boolean;
    minLength: number;
    maxLength: number;
    pattern?: RegExp;
  };
}

// ==================== UI STATE TYPES ====================

export interface FormCodeData {
  code: string;
  name: string;
  is_active: boolean;
}

export interface FormCodeErrors {
  code?: string;
  name?: string;
  general?: string;
}

export type ModalMode = 
  | 'create' 
  | 'edit' 
  | 'view' 
  | 'delete' 
  | 'bulk-delete'
  | 'bulk-activate'
  | 'bulk-deactivate';

export interface CodeTableState {
  sortBy: CodeSortField;
  sortOrder: SortOrder;
  page: number;
  limit: number;
  filters: CodeFilters;
  selectedCodes: Set<string>;
} 

// ==================== NOTIFICATION TYPES ====================
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timeout?: number;
  dismissible?: boolean;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

// ==================== EXPORT TYPES ====================

export interface CodeExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  includeInactive: boolean;
  columns: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  filters?: CodeFilters;
}

export interface CodeExportResult {
  success: boolean;
  filename?: string;
  downloadUrl?: string;
  error?: string;
}

// ==================== HOOK RETURN TYPES ====================

export interface UseCodesResult {
  // Data
  sites: Code[];
  activeCodes: Code[];
  inactiveCodes: Code[];
  pagination: CodeListResponse['pagination'] | null;
  siteStats: CodeStats;
  
  // State
  loading: {
    list: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
    bulk: boolean;
    toggle: boolean;
    search: boolean;
    stats: boolean;
    export: boolean;
  };
  errors: {
    list: string | null;
    create: string | null;
    update: string | null;
    delete: string | null;
    bulk: string | null;
    toggle: string | null;
    search: string | null;
    stats: string | null;
    export: string | null;

  };
  notifications: Notification[];
  
  // Operations
  fetchCodes: (params?: CodeQueryParams) => Promise<{ success: boolean; error?: string }>;
  createCode: (data: CreateCodeRequest) => Promise<{ success: boolean; data?: Code; error?: string }>;
  updateCode: (code: string, data: UpdateCodeRequest) => Promise<{ success: boolean; data?: Code; error?: string }>;
  deleteCode: (code: string) => Promise<{ success: boolean; error?: string }>;
  toggleCodeStatus: (code: string) => Promise<{ success: boolean; data?: Code; error?: string }>;
  searchCodes: (term: string) => Promise<{ success: boolean; data?: Code[]; error?: string }>;
  getStats: () => Promise<{ success: boolean; data?: CodeStats; error?: string }>;
  exportCodes: (format?: 'csv' | 'excel') => Promise<{ success: boolean; error?: string }>;
  
  // Bulk operations
  bulkDelete: (codes: string[]) => Promise<{ success: boolean; errors?: string[] }>;
  bulkToggleStatus: (codes: string[], activate: boolean) => Promise<{ success: boolean; errors?: string[] }>;
  
  // Utilities
  clearErrors: () => void;
  clearError: (key: string) => void;
  removeNotification: (id: string) => void;
}

export interface UseCodeSelectionResult {
  selectedKeys: Set<string>;
  selectedCodes: Code[];
  selectedCount: number;
  isAllSelected: boolean;
  isPartiallySelected: boolean;
  selectCode: (code: string, selected?: boolean) => void;
  selectAll: () => void;
  selectNone: () => void;
  toggleAll: () => void;
  isSelected: (code: string) => boolean;
  selectRange: (fromCode: string, toCode: string) => void;
  setSelectedCodes: (codes: Set<string>) => void;
}

export interface UseCodeFiltersResult {
  filters: CodeFilters;
  filteredCodes: Code[];
  updateFilter: (key: keyof CodeFilters, value: any) => void;
  resetFilters: () => void;
  hasActiveFilters: boolean;
  setFilters: (filters: CodeFilters) => void;
}


// ==================== CONSTANTS ====================

export const SITE_PAGE_SIZES = [10, 20, 50, 100] as const;

export const SITE_STATUS_OPTIONS = [
  { value: true, label: 'Active', color: 'green' },
  { value: false, label: 'Inactive', color: 'red' }
] as const;

export const LOADING_STATE: UseCodesResult['loading'] = {
  list: false,
  create: false,
  update: false,
  delete: false,
  bulk: false,
  toggle: false,
  search: false,
  stats: false,
  export: false
};

export const ERROR_STATE: UseCodesResult['errors'] = {
  list: null,
  create: null,
  update: null,
  delete: null,
  bulk: null,
  toggle: null,
  search: null,
  stats: null,
  export: null
};



// Conditional types for form validation
export type RequiredCodeFields = 'code' | 'name';
export type OptionalCodeFields = 'is_active';

// ==================== DEFAULT VALUES ====================

export const DEFAULT_CODE_FILTERS: CodeFilters = {
  search: '',
  isActive: null,
  dateRange: {
    start: '',
    end: ''
  }
};

export const DEFAULT_CODE_FORM_DATA: CodeFormData = {
  code: '',
  name: '',
  is_active: true
};

export const DEFAULT_CODE_QUERY_PARAMS: CodeQueryParams = {
  page: 1,
  limit: 20,
  sort_by: 'created_at',
  sort_order: 'DESC'
};

export const DEFAULT_CODE_TABLE_STATE: CodeTableState = {
  sortBy: 'created_at',
  sortOrder: 'DESC',
  page: 1,
  limit: 20,
  filters: DEFAULT_CODE_FILTERS,
  selectedCodes: new Set()
};

// ==================== UTILITY TYPES ====================
// API response utility types
export type CodeApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
};

export type CodePaginatedResponse<T> = CodeApiResponse<T[]> & {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

// ==================== ERROR TYPES ====================

export interface CodeError {
  code: string;
  message: string;
  field?: string;
  details?: any;
}

export interface CodeValidationError extends CodeError {
  field: keyof CodeFormData;
  rule: string;
}

export interface CodeApiError extends CodeError {
  status: number;
  statusText: string;
}

// ==================== EVENT TYPES ====================

export interface CodeEvent {
  type: string;
  site: Code;
  timestamp: string;
  user?: {
    id: number;
    username: string;
  };
}

// ==================== PERMISSION TYPES ====================

export interface CodePermissions {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canToggleStatus: boolean;
  canExport: boolean;
  canBulkEdit: boolean;
}


// ==================== COMPONENT PROP TYPES ====================

export interface CodeListProps {
  sites?: Code[];
  loading?: boolean;
  error?: string;
  onCodeSelect?: (site: Code) => void;
  onCodeEdit?: (site: Code) => void;
  onCodeDelete?: (site: Code) => void;
  onCodeToggle?: (site: Code) => void;
  selectable?: boolean;
  showActions?: boolean;
  compact?: boolean;
  className?: string;
}

export interface CodeFormProps {
  site?: Code;
  mode: 'create' | 'edit' | 'view';
  onSubmit: (data: CreateCodeRequest | UpdateCodeRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  error?: string;
  className?: string;
}

export interface CodeModalProps {
  isOpen: boolean;
  mode: ModalMode;
  site?: Code;
  sites?: Code[];
  onClose: () => void;
  onSubmit?: (data: any) => Promise<void>;
  loading?: boolean;
  error?: string;
}

export interface CodeFiltersProps {
  filters: CodeFilters;
  onFiltersChange: (filters: CodeFilters) => void;
  onReset: () => void;
  loading?: boolean;
  className?: string;
}

export interface CodeStatsProps {
  stats?: CodeStats;
  loading?: boolean;
  error?: string;
  className?: string;
}
 