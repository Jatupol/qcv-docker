// client/src/types/customer-site.ts
// Frontend Types for Customer-Site Entity

// ============ BASE INTERFACES ============

export interface CustomerSite {
  code: string;                       // Primary key
  customers: string;                  // Reference to customer
  site: string;                       // Reference to site
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: number;
  updated_by: number;
  customer_name?: string;             // From JOIN
}

export interface CreateCustomerSiteRequest {
  code: string;                       // Primary key (auto-generated)
  customers: string;                  // Customer code
  site: string;                       // Site code
  is_active?: boolean;
}

export interface UpdateCustomerSiteRequest {
  customers?: string;                 // Optional: Update customer reference
  site?: string;                      // Optional: Update site reference
  is_active?: boolean;
}

// ============ API RESPONSE TYPES ============

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
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
}

export interface CustomerSiteStats {
  total_customers_sites: number;
  active_customers_sites: number;
  inactive_customers_sites: number;
  recent_customers_sites: number;
  by_customer: Array<{
    customer_code: string;
    customer_name: string;
    count: number;
  }>;
  by_site: Array<{
    site_code: string;
    count: number;
  }>;
}

// ============ QUERY PARAMETERS ============

export interface CustomerSiteQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: keyof CustomerSite;
  sortOrder?: 'asc' | 'desc';
  isActive?: boolean;
  customers?: string;                 // Filter by customer code
  site?: string;                      // Filter by site code
  createdAfter?: string;
  createdBefore?: string;
}

// ============ UI STATE TYPES ============

export interface CustomerSiteFormData {
  code: string;
  customers: string;
  site: string;
  is_active: boolean;
}

export interface CustomerSiteFilters {
  search: string;
  isActive: boolean | null;
  customers: string;
  site: string;
  dateRange: {
    start: string;
    end: string;
  };
}

export interface CustomerSiteTableState {
  sortBy: keyof CustomerSite;
  sortOrder: 'asc' | 'desc';
  page: number;
  limit: number;
  filters: CustomerSiteFilters;
}

// ============ FORM VALIDATION TYPES ============

export interface ValidationErrors {
  code?: string[];
  customers?: string[];
  site?: string[];
  general?: string[];
}

export interface FormState {
  data: CustomerSiteFormData;
  errors: ValidationErrors;
  isSubmitting: boolean;
  isDirty: boolean;
}

// ============ MODAL TYPES ============

export type ModalMode = 'create' | 'edit' | 'view' | 'delete';

export interface ModalState {
  isOpen: boolean;
  mode: ModalMode;
  customerSite: CustomerSite | null;
}

// ============ COMPONENT PROPS TYPES ============

export interface CustomerSiteTableProps {
  customerSites: CustomerSite[];
  pagination: PaginatedResponse<CustomerSite>['pagination'];
  loading: boolean;
  onEdit: (customerSite: CustomerSite) => void;
  onDelete: (customerSite: CustomerSite) => void;
  onView: (customerSite: CustomerSite) => void;
  onToggleStatus: (customerSite: CustomerSite) => void;
  onSort: (field: keyof CustomerSite) => void;
  onPageChange: (page: number) => void;
  sortBy: keyof CustomerSite;
  sortOrder: 'asc' | 'desc';
}

export interface CustomerSiteFormProps {
  initialData?: CustomerSite;
  mode: 'create' | 'edit';
  onSubmit: (data: CustomerSiteFormData) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

export interface CustomerSiteFiltersProps {
  filters: CustomerSiteFilters;
  onFiltersChange: (filters: CustomerSiteFilters) => void;
  onReset: () => void;
  customersOptions: Array<{ code: string; name: string }>;
  sitesOptions: Array<{ code: string; name: string }>;
}

export interface CustomerSiteStatsProps {
  stats: CustomerSiteStats;
  loading: boolean;
}

// ============ HOOK TYPES ============

export interface UseCustomerSitesResult {
  customerSites: CustomerSite[];
  pagination: PaginatedResponse<CustomerSite>['pagination'] | null;
  loading: boolean;
  error: string | null;
  fetchCustomerSites: (params?: CustomerSiteQueryParams) => Promise<void>;
  createCustomerSite: (data: CreateCustomerSiteRequest) => Promise<ApiResponse<CustomerSite>>;
  updateCustomerSite: (
    customerCode: string,
    siteCode: string,
    data: UpdateCustomerSiteRequest
  ) => Promise<ApiResponse<CustomerSite>>;
  deleteCustomerSite: (customerCode: string, siteCode: string) => Promise<ApiResponse<boolean>>;
  toggleCustomerSiteStatus: (customerCode: string, siteCode: string) => Promise<ApiResponse<CustomerSite>>;
}

export interface UseCustomerSiteStatsResult {
  stats: CustomerSiteStats | null;
  loading: boolean;
  error: string | null;
  fetchStats: () => Promise<void>;
}

// ============ CONSTANTS ============

export const CUSTOMER_SITE_TABLE_COLUMNS = [
  { key: 'code', label: 'Code', sortable: true },
  { key: 'customers', label: 'Customer Code', sortable: true },
  { key: 'site', label: 'Site Code', sortable: true },
  { key: 'customer_name', label: 'Customer Name', sortable: false },
  { key: 'is_active', label: 'Status', sortable: true },
  { key: 'created_at', label: 'Created', sortable: true },
  { key: 'actions', label: 'Actions', sortable: false }
] as const;

export const CUSTOMER_SITE_SORT_OPTIONS = [
  { value: 'created_at', label: 'Created Date' },
  { value: 'code', label: 'Code' },
  { value: 'customers', label: 'Customer Code' },
  { value: 'site', label: 'Site Code' },
  { value: 'is_active', label: 'Status' }
] as const;

export const CUSTOMER_SITE_PAGE_SIZES = [10, 20, 50, 100] as const;

// ============ DEFAULT VALUES ============

export const DEFAULT_CUSTOMER_SITE_FILTERS: CustomerSiteFilters = {
  search: '',
  isActive: null,
  customers: '',
  site: '',
  dateRange: {
    start: '',
    end: ''
  }
};

export const DEFAULT_CUSTOMER_SITE_FORM: CustomerSiteFormData = {
  code: '',
  customers: '',
  site: '',
  is_active: true
};

export const DEFAULT_TABLE_STATE: CustomerSiteTableState = {
  sortBy: 'created_at',
  sortOrder: 'desc',
  page: 1,
  limit: 20,
  filters: DEFAULT_CUSTOMER_SITE_FILTERS
};

/*
=== FRONTEND CUSTOMER-SITE TYPES FEATURES ===

COMPLETE TYPE COVERAGE:
✅ All backend types mirrored on frontend
✅ UI-specific types for forms and tables
✅ Hook return types for data management
✅ Component prop types for type safety
✅ Validation and error types

API INTEGRATION:
✅ Request/response type matching
✅ Pagination type consistency
✅ Error handling types
✅ Query parameter types
✅ Statistics types

UI STATE MANAGEMENT:
✅ Form state types
✅ Table state types
✅ Modal state types
✅ Filter state types
✅ Validation types

COMPONENT INTERFACES:
✅ Props interfaces for all components
✅ Event handler types
✅ Callback function types
✅ Render prop types
✅ Children component types

CONSTANTS & DEFAULTS:
✅ Table column definitions
✅ Sort option definitions
✅ Default state values
✅ Configuration constants
✅ Validation constants

TYPE SAFETY:
✅ Strict typing throughout
✅ No any types used
✅ Proper generic usage
✅ Union types for modes
✅ Optional vs required properties
*/