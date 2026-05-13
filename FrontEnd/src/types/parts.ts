// client/src/types/parts.ts

/**
 * Centralized Parts Types - Complete Separation Entity Architecture
 * 
 * This file contains all type definitions for the Parts entity
 * following the SPECIAL pattern (VARCHAR PRIMARY KEY).
 * 
 * Architecture Benefits:
 * ✅ Centralized type management
 * ✅ Consistent interfaces across components
 * ✅ Easy maintenance and updates
 * ✅ Type safety throughout the application
 */

import type {ApiResponse, PaginatedApiResponse, BaseQueryParams, BaseEntity } from './base.ts';

 

// ==================== CORE ENTITY TYPES ====================

/**
 * Parts entity interface - matches database schema exactly
 */
export interface Parts extends BaseEntity {
  partno: string;                    // VARCHAR(25) PRIMARY KEY
  partno_customer?: string;          // VARCHAR(50) Customer part number
  product_families?: string;         // VARCHAR(10) NULLABLE
  versions?: string;                 // VARCHAR(10) NULLABLE
  customers_site: string;            // VARCHAR(10) NOT NULL - FK to customers_site.code
  tab: string;                       // VARCHAR(5) NOT NULL
  product_type: string;              // VARCHAR(5) NOT NULL
  customer_driver: string;           // VARCHAR(200) NOT NULL

  // LAR Threshold Fields
  lar_achieve_threshold?: number;    // DECIMAL(5,2) DEFAULT 97.00
  lar_accept_min_threshold?: number; // DECIMAL(5,2) DEFAULT 88.00
  lar_accept_max_threshold?: number; // DECIMAL(5,2) DEFAULT 97.00
  lar_abnormal_threshold?: number;   // DECIMAL(5,2) DEFAULT 88.00

  // DPPM Threshold Fields
  dppm_achieve_threshold?: number;    // DECIMAL(8,2) DEFAULT 300.00
  dppm_accept_min_threshold?: number; // DECIMAL(8,2) DEFAULT 300.00
  dppm_accept_max_threshold?: number; // DECIMAL(8,2) DEFAULT 1000.00
  dppm_abnormal_threshold?: number;   // DECIMAL(8,2) DEFAULT 1000.00

  // Underkill Threshold Fields
  underkill_achieve_threshold?: number;    // DECIMAL(5,2) DEFAULT 0.02
  underkill_accept_min_threshold?: number; // DECIMAL(5,2) DEFAULT 0.02
  underkill_accept_max_threshold?: number; // DECIMAL(5,2) DEFAULT 0.01
  underkill_abnormal_threshold?: number;   // DECIMAL(5,2) DEFAULT 0.01

  is_active: boolean;                // BOOLEAN DEFAULT true
  created_by: number;                // INT DEFAULT 0
  updated_by: number;                // INT DEFAULT 0
  created_at: Date;                // TIMESTAMP WITH TIME ZONE
  updated_at: Date;                // TIMESTAMP WITH TIME ZONE

  // Additional fields from JOINs (optional)
  customer_site_code?: string;       // From customer-site relationship
  customer_name?: string;            // From customers table

  // Search highlighting (optional)
  highlight?: Record<string, string>; // Highlighted search results
}

// ==================== REQUEST/RESPONSE TYPES ====================

/**
 * Create parts request payload
 */
export interface CreatePartsRequest {
  partno: string;
  partno_customer?: string;          // Customer part number
  product_families?: string;
  versions?: string;
  customers_site: string;            // FK to customers_site.code
  tab: string;
  product_type: string;
  customer_driver: string;
  is_active?: boolean;

  // LAR Threshold Fields
  lar_achieve_threshold?: number;
  lar_accept_min_threshold?: number;
  lar_accept_max_threshold?: number;
  lar_abnormal_threshold?: number;

  // DPPM Threshold Fields
  dppm_achieve_threshold?: number;
  dppm_accept_min_threshold?: number;
  dppm_accept_max_threshold?: number;
  dppm_abnormal_threshold?: number;

  // Underkill Threshold Fields
  underkill_achieve_threshold?: number;
  underkill_accept_min_threshold?: number;
  underkill_accept_max_threshold?: number;
  underkill_abnormal_threshold?: number;
}

/**
 * Update parts request payload
 */
export interface UpdatePartsRequest {
  partno_customer?: string;          // Customer part number
  product_families?: string;
  versions?: string;
  customers_site?: string;           // FK to customers_site.code
  tab?: string;
  product_type?: string;
  customer_driver?: string;
  is_active?: boolean;

  // LAR Threshold Fields
  lar_achieve_threshold?: number;
  lar_accept_min_threshold?: number;
  lar_accept_max_threshold?: number;
  lar_abnormal_threshold?: number;

  // DPPM Threshold Fields
  dppm_achieve_threshold?: number;
  dppm_accept_min_threshold?: number;
  dppm_accept_max_threshold?: number;
  dppm_abnormal_threshold?: number;

  // Underkill Threshold Fields
  underkill_achieve_threshold?: number;
  underkill_accept_min_threshold?: number;
  underkill_accept_max_threshold?: number;
  underkill_abnormal_threshold?: number;
}

/**
 * Parts query parameters for filtering and search
 */
export interface PartsQueryParams extends BaseQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  partno?: string;
  product_families?: string;
  versions?: string;
  customers_site?: string;
  tab?: string;
  product_type?: string;
  customer_driver?: string;
  is_active?: boolean;
  created_after?: string;
  created_before?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

/**
 * Parts filters for UI state management
 */
export interface PartsFilters {
  partno?: string;
  product_families?: string;
  versions?: string;
  customers_site?: string;
  tab?: string;
  product_type?: string;
  customer_driver?: string;
  is_active?: boolean;
  created_after?: Date;
  created_before?: Date;
}

// ==================== FORM DATA TYPES ====================

/**
 * Parts form data interface for UI components
 */
export interface PartsFormData {
  partno: string;
  product_families: string;
  versions: string;
  customers_site: string;            // FK to customers_site.code
  tab: string;
  product_type: string;
  customer_driver: string;
  is_active: boolean;

  // LAR Threshold Fields
  lar_achieve_threshold?: number;
  lar_accept_min_threshold?: number;
  lar_accept_max_threshold?: number;
  lar_abnormal_threshold?: number;

  // DPPM Threshold Fields
  dppm_achieve_threshold?: number;
  dppm_accept_min_threshold?: number;
  dppm_accept_max_threshold?: number;
  dppm_abnormal_threshold?: number;

  // Underkill Threshold Fields
  underkill_achieve_threshold?: number;
  underkill_accept_min_threshold?: number;
  underkill_accept_max_threshold?: number;
  underkill_abnormal_threshold?: number;

  // Display fields (from JOINs)
  customer_name?: string;            // For display only
}

/**
 * Parts form validation errors
 */
export interface PartsFormErrors {
  partno?: string;
  product_families?: string;
  versions?: string;
  customers_site?: string;           // FK to customers_site.code
  tab?: string;
  product_type?: string;
  customer_driver?: string;
  is_active?: string;
}

// ==================== CUSTOMER-SITE TYPES ====================

/**
 * Customer-site option for parts form
 */
export interface CustomerSiteOption {
  value: string;                     // Customer-site code
  label: string;                     // Display name (e.g., "ABC Manufacturing - Site01")
  customer: string;                  // Customer code
  site: string;                      // Site code
  customer_name: string;             // Customer name
}

/**
 * Customer-sites response
 */
export type CustomerSitesResponse = ApiResponse<CustomerSiteOption[]>;

// ==================== API RESPONSE TYPES ====================


/**
 * Paginated API response
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Parts API response types
 */
export type PartsResponse = ApiResponse<Parts>;
export type PartsListResponse = PaginatedResponse<Parts>;
export type PartsCreateResponse = ApiResponse<Parts>;
export type PartsUpdateResponse = ApiResponse<Parts>;
export type PartsDeleteResponse = ApiResponse<void>;

// ==================== UI STATE TYPES ====================

/**
 * Parts page state interface
 */
export interface PartsPageState {
  parts: Parts[];
  loading: boolean;
  error: string | null;
  success: string | null;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  searchTerm: string;
  filters: PartsFilters;
  showFilters: boolean;
  showCreateModal: boolean;
  showEditModal: boolean;
  showDeleteModal: boolean;
  selectedPart: Parts | null;
  formData: PartsFormData;
  formErrors: PartsFormErrors;
}

/**
 * Parts modal props
 */
export interface PartsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  loading: boolean;
  formData: PartsFormData;
  onFormDataChange: (data: Partial<PartsFormData>) => void;
  formErrors?: PartsFormErrors;
}

/**
 * Parts create modal specific props
 */
export interface PartsCreateModalProps extends PartsModalProps {
  title?: string;
}

/**
 * Parts edit modal specific props
 */
export interface PartsEditModalProps extends PartsModalProps {
  selectedPart: Parts;
  title?: string;
}

/**
 * Parts delete modal props
 */
export interface PartsDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  selectedPart: Parts;
}

// ==================== TABLE AND LIST TYPES ====================

/**
 * Parts table column definition
 */
export interface PartsTableColumn {
  key: keyof Parts | 'actions';
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, part: Parts) => React.ReactNode;
}

/**
 * Parts table props
 */
export interface PartsTableProps {
  parts: Parts[];
  loading: boolean;
  onEdit: (part: Parts) => void;
  onDelete: (part: Parts) => void;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
}

/**
 * Parts list item props
 */
export interface PartsListItemProps {
  part: Parts;
  onEdit: (part: Parts) => void;
  onDelete: (part: Parts) => void;
  onView?: (part: Parts) => void;
}

// ==================== SEARCH AND FILTER TYPES ====================

/**
 * Parts search configuration
 */
export interface PartsSearchConfig {
  searchableFields: (keyof Parts)[];
  defaultSearchField: keyof Parts;
  searchPlaceholder: string;
  debounceMs: number;
}

/**
 * Parts filter configuration
 */
export interface PartsFilterConfig {
  filterableFields: {
    field: keyof PartsFilters;
    type: 'text' | 'select' | 'date' | 'boolean';
    label: string;
    options?: Array<{ value: string; label: string }>;
    placeholder?: string;
  }[];
}

// ==================== VALIDATION TYPES ====================

/**
 * Parts validation rules
 */
export interface PartsValidationRules {
  partno: {
    required: boolean;
    maxLength: number;
    pattern?: RegExp;
  };
  product_families: {
    maxLength: number;
  };
  versions: {
    maxLength: number;
  };
  customers_site: {
    required: boolean;
    maxLength: number;
  };
  tab: {
    required: boolean;
    maxLength: number;
  };
  product_type: {
    required: boolean;
    maxLength: number;
  };
  customer_driver: {
    required: boolean;
    maxLength: number;
  };
}

/**
 * Parts validation result
 */
export interface PartsValidationResult {
  isValid: boolean;
  errors: PartsFormErrors;
}

// ==================== CONSTANTS ====================

/**
 * Parts field constraints
 */
export const PARTS_CONSTRAINTS = {
  PARTNO_MAX_LENGTH: 25,
  PRODUCT_FAMILIES_MAX_LENGTH: 10,
  VERSIONS_MAX_LENGTH: 10,
  CUSTOMERS_SITE_MAX_LENGTH: 10,
  TAB_MAX_LENGTH: 5,
  PRODUCT_TYPE_MAX_LENGTH: 5,
  CUSTOMER_DRIVER_MAX_LENGTH: 200,
} as const;

/**
 * Parts default values
 */
export const PARTS_DEFAULTS: PartsFormData = {
  partno: '',
  product_families: '',
  versions: '',
  customers_site: '',                 // FK to customers_site.code
  tab: '',
  product_type: '',
  customer_driver: '',
  is_active: true,
};

/**
 * Parts API endpoints 
 */
export const PARTS_ENDPOINTS = {
  BASE: '/api/parts',
  BY_ID: (partno: string) => `/api/parts/${partno}`,
  SEARCH: '/api/parts/search',
  EXPORT: '/api/parts/export',
  IMPORT: '/api/parts/import',
} as const;

 