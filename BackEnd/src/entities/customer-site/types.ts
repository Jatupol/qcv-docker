// server/src/entities/customer-site/types.ts
/**
 * FIXED: Customer-Site Entity Types with Entity Configuration
 * Manufacturing Quality Control System - SPECIAL Entity Pattern (Composite Primary Key)
 * 
 * ✅ RESOLVED: Added missing CUSTOMER_SITE_ENTITY_CONFIG constant
 * ✅ Implements complete SPECIAL entity type definitions
 * ✅ Supports composite primary key (customer_code + site_code)
 * ✅ Perfect integration with SPECIAL entity pattern
 */

// ==================== IMPORT EXISTING SPECIAL TYPES ====================

import {
  BaseSpecialEntity,
  CreateSpecialData,
  UpdateSpecialData,
  SpecialQueryOptions,
  SpecialPaginatedResponse,
  SpecialApiResponse,
  SpecialEntityRequest,
  SpecialServiceResult,
  ValidationResult,
  SpecialEntityConfig,
  PrimaryKeyConfig
} from '../../generic/entities/special-entity/generic-types';

// ==================== CUSTOMER-SITE ENTITY INTERFACE ====================

/**
 * Customer-Site Entity Interface - Extends SPECIAL Entity Pattern
 *
 * Represents the relationship between customers and sites in the manufacturing system.
 * Uses single primary key (code) with references to customers and sites.
 */
export interface CustomerSite extends BaseSpecialEntity {
  // Primary key field
  code: string;                   // VARCHAR(10) - Primary key

  // Reference fields
  customers: string;              // VARCHAR(5) - Reference to customer
  site: string;                   // VARCHAR(5) - Reference to site

  // Additional fields from JOINs (optional)
  customer_name?: string;         // From customers table
 
  
  // Note: BaseSpecialEntity provides:
  // - is_active: boolean
  // - created_at: Date
  // - updated_at: Date  
  // - created_by: number
  // - updated_by: number
}

// ==================== REQUEST/RESPONSE INTERFACES ====================

/**
 * Create Customer-Site Request - Extends SPECIAL Create Data
 */
export interface CreateCustomerSiteRequest extends CreateSpecialData {
  code: string;                   // Required: Customer-site code (max 10 chars)
  customers: string;              // Required: Customer code (max 5 chars)
  site: string;                   // Required: Site code (max 5 chars)

  // Generic fields inherited:
  // is_active?: boolean (Optional, defaults to true)
}

/**
 * Update Customer-Site Request - Extends SPECIAL Update Data
 */
export interface UpdateCustomerSiteRequest extends UpdateSpecialData {
  customers?: string;             // Optional: Update customer reference
  site?: string;                  // Optional: Update site reference

  // Generic fields inherited:
  // is_active?: boolean (Optional)
  // Note: code is not updatable (primary key)
}

// ==================== QUERY INTERFACES ====================

/**
 * Customer-Site Query Parameters - Extends SPECIAL Query Options
 */
export interface CustomerSiteQueryParams extends SpecialQueryOptions {
  // Customer-Site specific filters
  customerCode?: string;          // Filter by customer code
  siteCode?: string;              // Filter by site code
  
  // Generic fields inherited:
  // page?: number (default: 1)
  // limit?: number (default: 20, max: 100)
  // sortBy?: string (default: 'customer_code')
  // sortOrder?: 'ASC' | 'DESC' (default: 'ASC')
  // search?: string (searches across searchable fields)
  // isActive?: boolean (filter by active status)
  // filters?: Record<string, any> (additional filters)
}

// ==================== RESPONSE INTERFACES ====================

/**
 * Customer-Site with Lookup Data
 */
export interface CustomerSiteWithLookups extends CustomerSite {
  customer_name: string;          // Customer name from lookup
  customer_active: boolean;       // Customer active status
}

/**
 * Customer-Site Statistics Interface
 */
export interface CustomerSiteStats {
  total_relationships: number;
  active_relationships: number;
  inactive_relationships: number;
  unique_customers: number;
  unique_sites: number;
  recent_relationships: number;
  top_customers: Array<{
    customer_code: string;
    customer_name: string;
    site_count: number;
  }>;
  top_sites: Array<{
    site_code: string;
    customer_count: number;
  }>;
}

/**
 * Customer-Site Paginated Response
 */
export type CustomerSitePaginatedResponse = SpecialPaginatedResponse<CustomerSite>;

/**
 * Customer-Site Service Result
 */
export type CustomerSiteServiceResult<T = CustomerSite> = SpecialServiceResult<T>;

/**
 * Customer-Site API Response
 */
export type CustomerSiteApiResponse<T = CustomerSite> = SpecialApiResponse<T>;

/**
 * Customer-Site Request Interface
 */
export interface CustomerSiteEntityRequest<
  TParams = any,
  TBody = any,
  TQuery = CustomerSiteQueryParams
> extends SpecialEntityRequest<TParams, TBody, TQuery> {
  // Inherits user context and all SPECIAL request features
}

// ==================== VALIDATION INTERFACES ====================

/**
 * Customer-Site Validation Schema
 */
export interface CustomerSiteValidationSchema {
  customer_code: {
    required: true;
    type: 'string';
    minLength: 1;
    maxLength: 5;
    pattern: string;
  };
  site_code: {
    required: true;
    type: 'string';
    minLength: 1;
    maxLength: 5;
    pattern: string;
  };
  name: {
    required: true;
    type: 'string';
    minLength: 1;
    maxLength: 100;
  };
  description: {
    required: false;
    type: 'string';
    maxLength: 500;
  };
  is_active: {
    required: false;
    type: 'boolean';
    default: true;
  };
}

// ==================== CONSTANTS ====================

/**
 * Customer-Site entity constants
 */
export const CustomerSiteConstants = {
  // Database constraints
  CUSTOMER_CODE_MAX_LENGTH: 5,
  CUSTOMER_CODE_MIN_LENGTH: 1,
  SITE_CODE_MAX_LENGTH: 5,
  SITE_CODE_MIN_LENGTH: 1,
  NAME_MAX_LENGTH: 100,
  NAME_MIN_LENGTH: 1,
  DESCRIPTION_MAX_LENGTH: 500,
  
  // Default values
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  DEFAULT_SORT_BY: 'customer_code',
  DEFAULT_SORT_ORDER: 'ASC' as const,
  
  // Validation patterns
  CODE_PATTERN: /^[A-Z0-9_-]+$/,
  NAME_PATTERN: /^[a-zA-Z0-9\s\-_.,()&]+$/,
  
  // API paths
  API_PATH: '/api/customer-sites',
  ENTITY_NAME: 'customer-site',
  TABLE_NAME: 'customers_site'
};

// ==================== ENTITY CONFIGURATION ====================

/**
 * ✅ FIXED: Customer-Site Primary Key Configuration
 */
export const CUSTOMER_SITE_PRIMARY_KEY_CONFIG: PrimaryKeyConfig = {
  fields: ['code'],
  routes: [':code'],
  routePattern: '/:code'
};

/**
 * ✅ FIXED: Customer-Site Entity Configuration
 * 
 * Complete configuration for the SPECIAL entity pattern.
 */
export const CUSTOMER_SITE_ENTITY_CONFIG: SpecialEntityConfig = {
  entityName: CustomerSiteConstants.ENTITY_NAME,
  tableName: CustomerSiteConstants.TABLE_NAME,
  apiPath: CustomerSiteConstants.API_PATH,
  primaryKey: CUSTOMER_SITE_PRIMARY_KEY_CONFIG,
  searchableFields: [
    'code',
    'customers',
    'site'
  ],
  requiredFields: [
    'code',
    'customers',
    'site'
  ],
  defaultLimit: CustomerSiteConstants.DEFAULT_LIMIT,
  maxLimit: CustomerSiteConstants.MAX_LIMIT
};

// ==================== TYPE GUARDS ====================

/**
 * Type guard for Create Customer-Site Request
 */
export function isCreateCustomerSiteRequest(data: any): data is CreateCustomerSiteRequest {
  return (
    data &&
    typeof data.customer_code === 'string' &&
    typeof data.site_code === 'string' &&
    typeof data.name === 'string' &&
    data.customer_code.trim().length > 0 &&
    data.site_code.trim().length > 0 &&
    data.name.trim().length > 0 &&
    data.customer_code.length <= CustomerSiteConstants.CUSTOMER_CODE_MAX_LENGTH &&
    data.site_code.length <= CustomerSiteConstants.SITE_CODE_MAX_LENGTH &&
    data.name.length <= CustomerSiteConstants.NAME_MAX_LENGTH
  );
}

/**
 * Type guard for Update Customer-Site Request
 */
export function isUpdateCustomerSiteRequest(data: any): data is UpdateCustomerSiteRequest {
  return (
    data &&
    typeof data === 'object' &&
    (data.name === undefined || (typeof data.name === 'string' && data.name.length <= CustomerSiteConstants.NAME_MAX_LENGTH)) &&
    (data.description === undefined || (typeof data.description === 'string' && data.description.length <= CustomerSiteConstants.DESCRIPTION_MAX_LENGTH)) &&
    (data.is_active === undefined || typeof data.is_active === 'boolean')
  );
}

/**
 * Type guard for Customer-Site entity
 */
export function isCustomerSite(obj: any): obj is CustomerSite {
  return (
    obj &&
    typeof obj.customer_code === 'string' &&
    typeof obj.site_code === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.is_active === 'boolean' &&
    obj.created_at instanceof Date &&
    obj.updated_at instanceof Date &&
    typeof obj.created_by === 'number' &&
    typeof obj.updated_by === 'number'
  );
}

// ==================== UTILITY TYPES ====================

/**
 * Customer-Site Entity Keys - for type-safe field operations
 */
export type CustomerSiteKeys = keyof CustomerSite;

/**
 * Customer-Site Form Keys - for form field operations
 */
export type CustomerSiteFormKeys = keyof CreateCustomerSiteRequest;

/**
 * Customer-Site Filter Keys - for filtering operations
 */
export type CustomerSiteFilterKeys = keyof CustomerSiteQueryParams;

/**
 * Partial Customer-Site for Updates
 */
export type PartialCustomerSite = Partial<CustomerSite>;

/**
 * Customer-Site Without Timestamps - for creation
 */
export type CustomerSiteWithoutTimestamps = Omit<CustomerSite, 'created_at' | 'updated_at'>;

// ==================== HELPER FUNCTIONS ====================

/**
 * Create default Customer-Site query options
 */
export function createDefaultCustomerSiteQueryOptions(): CustomerSiteQueryParams {
  return {
    page: 1,
    limit: CustomerSiteConstants.DEFAULT_LIMIT,
    sortBy: CustomerSiteConstants.DEFAULT_SORT_BY,
    sortOrder: CustomerSiteConstants.DEFAULT_SORT_ORDER,
    isActive: true
  };
}

/**
 * Validate Customer-Site composite key
 */
export function validateCustomerSiteKey(customerCode: string, siteCode: string): ValidationResult {
  const errors: string[] = [];

  if (!customerCode || customerCode.trim().length === 0) {
    errors.push('Customer code is required');
  } else if (customerCode.length > CustomerSiteConstants.CUSTOMER_CODE_MAX_LENGTH) {
    errors.push(`Customer code cannot exceed ${CustomerSiteConstants.CUSTOMER_CODE_MAX_LENGTH} characters`);
  }

  if (!siteCode || siteCode.trim().length === 0) {
    errors.push('Site code is required');
  } else if (siteCode.length > CustomerSiteConstants.SITE_CODE_MAX_LENGTH) {
    errors.push(`Site code cannot exceed ${CustomerSiteConstants.SITE_CODE_MAX_LENGTH} characters`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Format Customer-Site composite key as string
 */
export function formatCustomerSiteKey(customerCode: string, siteCode: string): string {
  return `${customerCode}/${siteCode}`;
}

/**
 * Parse Customer-Site key string to components
 */
export function parseCustomerSiteKey(keyString: string): { customerCode: string; siteCode: string } {
  const parts = keyString.split('/');
  if (parts.length !== 2) {
    throw new Error('Invalid customer-site key format. Expected "CUSTOMER_CODE/SITE_CODE"');
  }
  
  return {
    customerCode: parts[0].trim(),
    siteCode: parts[1].trim()
  };
}

 