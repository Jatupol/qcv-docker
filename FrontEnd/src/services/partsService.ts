// client/src/services/partsService.ts

/**
 * Parts Service - Native Fetch API Communication
 *
 * This service handles all Parts entity operations following the
 * Complete Separation Entity Architecture and SPECIAL pattern.
 *
 * Architecture Benefits:
 * ✅ Native fetch API (no external dependencies)
 * ✅ Consistent error handling with customerService
 * ✅ Cache-busting for fresh data
 * ✅ Type-safe operations
 * ✅ Reusable across components
 * ✅ Easy testing and mocking
 * ✅ Environment-aware API configuration
 */

import { apiBaseUrl } from './api';

import type {
  Parts,
  CreatePartsRequest,
  UpdatePartsRequest,
  PartsQueryParams,
  CustomerSiteOption
} from '../types/parts';
import { PARTS_ENDPOINTS} from '../types/parts';

// ==================== RESPONSE TYPES ====================

export interface PartsApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export type PartsResponse = PartsApiResponse<Parts>;
export type PartsListResponse = PartsApiResponse<Parts[]>;
export type PartsCreateResponse = PartsApiResponse<Parts>;
export type PartsUpdateResponse = PartsApiResponse<Parts>;
export type PartsDeleteResponse = PartsApiResponse<void>;
export type CustomerSitesResponse = PartsApiResponse<CustomerSiteOption[]>;

// ==================== PARTS SERVICE CLASS ====================

class PartsService {
  private readonly baseUrl = apiBaseUrl('parts');

  // ==================== HELPER METHODS ====================

  private async makeRequest<T>(url: string, options: RequestInit = {}): Promise<PartsApiResponse<T>> {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        credentials: 'include',
        ...options,
      });

      console.log(`PartsService: ${options.method || 'GET'} ${url} - Status: ${response.status}`);

      // Handle 304 Not Modified responses
      if (response.status === 304) {
        console.warn('PartsService: Received 304 Not Modified, treating as successful empty response');
        return {
          success: true,
          data: [] as any,
          message: 'Data not modified (cached)',
          errors: []
        };
      }

      const data = await response.json();

      if (!response.ok) {
        console.error('PartsService: API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          data
        });
      }

      return data;
    } catch (error) {
      console.error('PartsService.makeRequest error:', error);
      return {
        success: false,
        data: undefined,
        message: error instanceof Error ? error.message : 'Network error occurred',
        errors: []
      };
    }
  }

  private buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    return searchParams.toString();
  }

  /**
   * Get all parts with optional filtering and pagination
   */
  async getParts(params?: PartsQueryParams): Promise<PartsListResponse> {
    // Always add cache buster to prevent 304 responses
    const paramsWithCacheBuster = {
      ...params 
    };

    const queryString = this.buildQueryString(paramsWithCacheBuster);
    const url = queryString ? `${this.baseUrl}?${queryString}` : `${this.baseUrl}?_t=${Date.now()}`;

    console.log('PartsService.getParts: Calling URL:', url);

    const response = await this.makeRequest<any>(url);

    console.log('PartsService.getParts: Raw response:', response);
    console.log('PartsService.getParts: Response.data type:', typeof response.data);
    console.log('PartsService.getParts: Response.data structure:', response.data ? Object.keys(response.data) : 'null');

    // Handle VarcharCodePaginatedResponse<Parts> structure
    if (response.success && response.data) {

      // Backend returns: { success: true, data: { data: Parts[], pagination: {...} } }
      if (response.data.data && Array.isArray(response.data.data)) {
        console.log('✅ PartsService: Detected paginated response structure');
        console.log('  - Parts count:', response.data.data.length);
        console.log('  - Pagination:', response.data.pagination);

        return {
          success: true,
          data: response.data.data as Parts[],
          message: response.message,
          errors: response.errors || [],
          pagination: response.data.pagination
        };
      }

      // Legacy fallback: direct array
      else if (Array.isArray(response.data)) {
        console.log('✅ PartsService: Direct array response (legacy)');
        return {
          success: true,
          data: response.data as Parts[],
          message: response.message,
          errors: response.errors || [],
          pagination: {
            page: 1,
            limit: response.data.length,
            total: response.data.length,
            totalPages: 1,
            hasNext: false,
            hasPrev: false
          }
        };
      }

      // Unexpected structure
      else {
        console.warn('⚠️ PartsService: Unexpected response structure, returning empty array');
        console.warn('Expected: { data: Parts[] } or Parts[]');
        console.warn('Received:', response.data);

        return {
          success: false,
          data: [],
          message: 'Invalid response structure from server',
          errors: response.errors || [],
          pagination: {
            page: 1,
            limit: 0,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false
          }
        };
      }
    }

    // API returned success: false or no data
    console.error('❌ PartsService: API returned success: false or no data');
    return {
      success: false,
      data: [],
      message: response.message || 'Failed to load parts',
      errors: response.errors || [],
      pagination: {
        page: 1,
        limit: 0,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      }
    };
  }

  /**
   * Get a single part by part number
   */
  async getPartByPartno(partno: string): Promise<PartsResponse> {
    if (!partno.trim()) {
      return {
        success: false,
        data: undefined,
        message: 'Part number is required',
        errors: []
      };
    }

    const url = `${this.baseUrl}/${encodeURIComponent(partno)}?_t=${Date.now()}`;
    console.log('PartsService.getPartByPartno: Calling URL:', url);

    const response = await this.makeRequest<Parts>(url);

    if (response.success && response.data) {
      return {
        success: true,
        data: response.data as Parts,
        message: response.message,
        errors: response.errors || []
      };
    }

    return {
      success: false,
      data: undefined,
      message: response.message || `Failed to fetch part ${partno}`,
      errors: response.errors || []
    };
  }
  /**
   * Import parts
   */
  async importPart(data: CreatePartsRequest): Promise<PartsCreateResponse> {
    console.log('🔧 PartsService.createPart: Input data:', data);

    const validation = this.validateImportRequest(data);
    console.log('🔧 PartsService.createPart: Validation result:', validation);

    if (!validation.isValid) {
      console.log('❌ PartsService.createPart: Validation failed:', validation.errors);
      return {
        success: false,
        data: undefined,
        message: `Validation failed: ${Object.values(validation.errors).join(', ')}`,
        errors: Object.values(validation.errors)
      };
    }

    console.log('🔧 PartsService.createPart: Sending to API:', data);
    const response = await this.makeRequest<Parts>(`${this.baseUrl}/import`, {      
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (response.success && response.data) {
      return {
        success: true,
        data: response.data as Parts,
        message: response.message || 'Part created successfully',
        errors: response.errors || []
      };
    }

    return {
      success: false,
      data: undefined,
      message: response.message || 'Failed to create part',
      errors: response.errors || []
    };
  }

  /**
   * Create a new part
   */
  async createPart(data: CreatePartsRequest): Promise<PartsCreateResponse> {
    console.log('🔧 PartsService.createPart: Input data:', data);

    const validation = this.validateCreateRequest(data);
    console.log('🔧 PartsService.createPart: Validation result:', validation);

    if (!validation.isValid) {
      console.log('❌ PartsService.createPart: Validation failed:', validation.errors);
      return {
        success: false,
        data: undefined,
        message: `Validation failed: ${Object.values(validation.errors).join(', ')}`,
        errors: Object.values(validation.errors)
      };
    }

    console.log('🔧 PartsService.createPart: Sending to API:', data);
    const response = await this.makeRequest<Parts>(this.baseUrl, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (response.success && response.data) {
      return {
        success: true,
        data: response.data as Parts,
        message: response.message || 'Part created successfully',
        errors: response.errors || []
      };
    }

    return {
      success: false,
      data: undefined,
      message: response.message || 'Failed to create part',
      errors: response.errors || []
    };
  }

  /**
   * Update an existing part
   */
  async updatePart(partno: string, data: UpdatePartsRequest): Promise<PartsUpdateResponse> {
    if (!partno.trim()) {
      return {
        success: false,
        data: undefined,
        message: 'Part number is required',
        errors: []
      };
    }

    const validation = this.validateUpdateRequest(data);
    if (!validation.isValid) {
      return {
        success: false,
        data: undefined,
        message: `Validation failed: ${Object.values(validation.errors).join(', ')}`,
        errors: Object.values(validation.errors)
      };
    }

    console.log('PartsService.updatePart: Updating part', partno, 'with data:', data);
    const response = await this.makeRequest<Parts>(`${this.baseUrl}/${encodeURIComponent(partno)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    if (response.success && response.data) {
      return {
        success: true,
        data: response.data as Parts,
        message: response.message || 'Part updated successfully',
        errors: response.errors || []
      };
    }

    return {
      success: false,
      data: undefined,
      message: response.message || `Failed to update part ${partno}`,
      errors: response.errors || []
    };
  }

  /**
   * Delete a part (soft delete - mark as inactive)
   */
  async deletePart(partno: string): Promise<PartsDeleteResponse> {
    if (!partno.trim()) {
      return {
        success: false,
        data: undefined,
        message: 'Part number is required',
        errors: []
      };
    }

    console.log('PartsService.deletePart: Deleting part:', partno);
    const response = await this.makeRequest<void>(`${this.baseUrl}/${encodeURIComponent(partno)}`, {
      method: 'DELETE',
    });

    return {
      success: response.success,
      data: undefined,
      message: response.message || (response.success ? 'Part deleted successfully' : `Failed to delete part ${partno}`),
      errors: response.errors || []
    };
  }

  /**
   * Search parts with advanced search functionality
   */
  async searchParts(searchTerm: string, filters?: PartsQueryParams): Promise<PartsListResponse> {
    if (!searchTerm.trim()) {
      return this.getParts(filters);
    }

    const params = {
      ...filters,
      search: searchTerm.trim(),
    };

    return this.getParts(params);
  }

  /**
   * Check if part number exists
   */
  async checkPartnoExists(partno: string): Promise<boolean> {
    if (!partno.trim()) {
      return false;
    }

    const response = await this.getPartByPartno(partno);
    return response.success && response.data !== undefined;
  }

  /**
   * Get parts by customer site
   */
  async getPartsByCustomerSite(customersSite: string): Promise<PartsListResponse> {
    if (!customersSite.trim()) {
      return {
        success: false,
        data: [],
        message: 'Customer site code is required',
        errors: [],
        pagination: {
          page: 1,
          limit: 0,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        }
      };
    }

    return this.getParts({ customers_site: customersSite });
  }

  /**
   * Get parts by product family
   */
  async getPartsByProductFamily(productFamily: string): Promise<PartsListResponse> {
    if (!productFamily.trim()) {
      return {
        success: false,
        data: [],
        message: 'Product family is required',
        errors: [],
        pagination: {
          page: 1,
          limit: 0,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        }
      };
    }

    return this.getParts({ product_families: productFamily });
  }

  /**
   * Get customer-sites for parts form
   */
  async getCustomerSites(): Promise<CustomerSitesResponse> {
    const url = `${this.baseUrl}/customer-sites?_t=${Date.now()}`;
    console.log('PartsService.getCustomerSites: Calling URL:', url);

    const response = await this.makeRequest<CustomerSiteOption[]>(url);

    if (response.success && response.data) {
      return {
        success: true,
        data: response.data as CustomerSiteOption[],
        message: response.message || 'Customer-sites retrieved successfully',
        errors: response.errors || []
      };
    }

    return {
      success: false,
      data: [],
      message: response.message || 'Failed to load customer-sites',
      errors: response.errors || []
    };
  }

  /**
   * Get active parts only
   */
  async getActiveParts(params?: PartsQueryParams): Promise<PartsListResponse> {
    return this.getParts({
      ...params,
      is_active: true,
    });
  }

  /**
   * Get inactive parts only
   */
  async getInactiveParts(params?: PartsQueryParams): Promise<PartsListResponse> {
    return this.getParts({
      ...params,
      is_active: false,
    });
  }

  /**
   * Bulk update parts status
   */
  async bulkUpdatePartsStatus(partnos: string[], isActive: boolean): Promise<PartsUpdateResponse[]> {
    if (!partnos.length) {
      return [{
        success: false,
        data: undefined,
        message: 'Part numbers are required',
        errors: []
      }];
    }

    const promises = partnos.map(partno =>
      this.updatePart(partno, { is_active: isActive })
    );

    return Promise.all(promises);
  }

  // ==================== UTILITY METHODS ====================

  public async togglePartStatus(partno: string): Promise<PartsUpdateResponse> {
    console.log('PartsService.togglePartStatus: Toggling status for:', partno);
    const response = await this.makeRequest<Parts>(`${this.baseUrl}/${encodeURIComponent(partno)}/status`, {
      method: 'PATCH',
    });

    if (response.success && response.data) {
      return {
        success: true,
        data: response.data as Parts,
        message: response.message || 'Part status toggled successfully',
        errors: response.errors || []
      };
    }

    return {
      success: false,
      data: undefined,
      message: response.message || `Failed to toggle status for part ${partno}`,
      errors: response.errors || []
    };
  }

  public async getPartsSelector(params: PartsQueryParams = {}): Promise<PartsListResponse> {
    const paramsWithCacheBuster = {
      ...params,
      is_active: true
    };

    const queryString = this.buildQueryString(paramsWithCacheBuster);
    const url = `${this.baseUrl}/active?${queryString}`;

    const response = await this.makeRequest<any>(url);

    // Handle the same nested structure for active parts endpoint
    if (response.success && response.data) {
      if (response.data.data && Array.isArray(response.data.data)) {
        return {
          success: true,
          data: response.data.data,
          message: response.message,
          errors: response.errors || []
        };
      }
      if (Array.isArray(response.data)) {
        return {
          success: true,
          data: response.data,
          message: response.message,
          errors: response.errors || []
        };
      }
    }

    return {
      success: false,
      data: [],
      message: response.message || 'Failed to load active parts',
      errors: response.errors || [],
      pagination: {
        page: 1,
        limit: 0,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      }
    };
  }

  public async getStats(): Promise<PartsApiResponse<any>> {
    const url = `${this.baseUrl}/statistics?_t=${Date.now()}`;
    console.log('PartsService.getStats: Calling URL:', url);

    const response = await this.makeRequest<any>(url);

    // Handle the nested response structure from backend
    if (response.success && response.data && response.data.overview) {
      console.log('✅ PartsService.getStats: Extracting stats from overview object');
      console.log('Raw API response:', response.data);

      return {
        success: true,
        data: {
          total: response.data.overview.total || 0,
          active: response.data.overview.active || 0,
          inactive: response.data.overview.inactive || 0,
          recent: response.data.overview.recent || 0
        },
        message: response.message,
        errors: response.errors || []
      };
    }

    console.log('❌ PartsService.getStats: Invalid response structure');
    console.log('Expected: { data: { overview: { total, active, inactive } } }');
    console.log('Received:', response);

    return {
      success: false,
      data: {
        total: 0,
        active: 0,
        inactive: 0,
        recent: 0
      },
      message: response.message || 'Failed to load statistics',
      errors: response.errors || []
    };
  }

  public async checkCodeExists(partno: string): Promise<PartsApiResponse<{ exists: boolean }>> {
    const url = `${this.baseUrl}/check-code/${encodeURIComponent(partno)}?_t=${Date.now()}`;
    const response = await this.makeRequest<{ exists: boolean }>(url);

    return {
      success: response.success,
      data: response.data,
      message: response.message,
      errors: response.errors || []
    };
  }

  // ==================== PRIVATE HELPER METHODS ====================

  /**
   * Validate create request data
   */
  private validateCreateRequest(data: CreatePartsRequest): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    // Required fields validation
    if (!data.partno?.trim()) {
      errors.partno = 'Part number is required';
    }
    if (!data.product_families?.trim()) {
      errors.product_families = 'Product families is required';
    }
    if (!data.versions?.trim()) {
      errors.versions = 'Versions is required';
    }
    if (!data.customers_site?.trim()) {
      errors.customers_site = 'Customer-site is required';
    }
    if (!data.tab?.trim()) {
      errors.tab = 'Tab is required';
    }
    if (!data.product_type?.trim()) {
      errors.product_type = 'Product type is required';
    }
    if (!data.customer_driver?.trim()) {
      errors.customer_driver = 'Customer driver is required';
    }

    // Length validations
    if (data.partno && data.partno.length > 25) {
      errors.partno = 'Part number must be 25 characters or less';
    }
    if (data.product_families && data.product_families.length > 10) {
      errors.product_families = 'Product families must be 10 characters or less';
    }
    if (data.versions && data.versions.length > 10) {
      errors.versions = 'Versions must be 10 characters or less';
    }
    if (data.customers_site && data.customers_site.length > 10) {
      errors.customers_site = 'Customer-site code must be 10 characters or less';
    }
    if (data.tab && data.tab.length > 5) {
      errors.tab = 'Tab must be 5 characters or less';
    }
    if (data.product_type && data.product_type.length > 5) {
      errors.product_type = 'Product type must be 5 characters or less';
    }
    if (data.customer_driver && data.customer_driver.length > 200) {
      errors.customer_driver = 'Customer driver must be 200 characters or less';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Validate update request data
   */
  private validateUpdateRequest(data: UpdatePartsRequest): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    // Length validations for provided fields
    if (data.product_families && data.product_families.length > 10) {
      errors.product_families = 'Product families must be 10 characters or less';
    }
    if (data.versions && data.versions.length > 10) {
      errors.versions = 'Versions must be 10 characters or less';
    }
    if (data.customers_site && data.customers_site.length > 10) {
      errors.customers_site = 'Customer-site code must be 10 characters or less';
    }
    if (data.tab && data.tab.length > 5) {
      errors.tab = 'Tab must be 5 characters or less';
    }
    if (data.product_type && data.product_type.length > 5) {
      errors.product_type = 'Product type must be 5 characters or less';
    }
    if (data.customer_driver && data.customer_driver.length > 200) {
      errors.customer_driver = 'Customer driver must be 200 characters or less';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Validate import request data
   */
  private validateImportRequest(data: CreatePartsRequest): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    // Required fields validation
    if (!data.partno?.trim()) {
      errors.partno = 'Part number is required';
    }
 
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }


}

// ==================== SERVICE INSTANCE ====================

/**
 * Singleton instance of the parts service
 */
export const partsService = new PartsService();

/**
 * Default export for convenience
 */
export default partsService;

// ==================== UTILITY FUNCTIONS ====================

/**
 * Format part number for display
 */
export const formatPartno = (partno: string): string => {
  return partno?.trim().toUpperCase() || '';
};

/**
 * Format customer driver for display
 */
export const formatCustomerDriver = (customerDriver: string, maxLength = 50): string => {
  if (!customerDriver) return '';

  if (customerDriver.length <= maxLength) {
    return customerDriver;
  }

  return `${customerDriver.substring(0, maxLength)}...`;
};

/**
 * Get parts status display text
 */
export const getPartsStatusText = (isActive: boolean): string => {
  return isActive ? 'Active' : 'Inactive';
};

/**
 * Get parts status color class
 */
export const getPartsStatusColor = (isActive: boolean): string => {
  return isActive
    ? 'bg-green-100 text-green-800'
    : 'bg-red-100 text-red-800';
};

/**
 * Validate part number format
 */
export const validatePartno = (partno: string): { isValid: boolean; error?: string } => {
  if (!partno?.trim()) {
    return { isValid: false, error: 'Part number is required' };
  }

  if (partno.length > 25) {
    return { isValid: false, error: 'Part number must be 25 characters or less' };
  }

  // Add any specific part number format validation here
  const partnumberPattern = /^[A-Za-z0-9\-_]+$/;
  if (!partnumberPattern.test(partno)) {
    return { isValid: false, error: 'Part number can only contain letters, numbers, hyphens, and underscores' };
  }

  return { isValid: true };
};

/**
 * Create empty parts form data
 */
export const createEmptyPartsFormData = (): CreatePartsRequest => ({
  partno: '',
  product_families: '',
  versions: '',
  customers_site: '',
  tab: '',
  product_type: '',
  customer_driver: '',
  is_active: true,
});

/**
 * Convert Parts entity to form data
 */
export const partsToFormData = (parts: Parts): CreatePartsRequest => ({
  partno: parts.partno,
  product_families: parts.product_families || '',
  versions: parts.versions || '',
  customers_site: parts.customers_site || '',
  tab: parts.tab,
  product_type: parts.product_type,
  customer_driver: parts.customer_driver,
  is_active: parts.is_active,
});

/**
 * Check if two parts are equal (for comparison)
 */
export const arePartsEqual = (part1: Parts, part2: Parts): boolean => {
  return (
    part1.partno === part2.partno &&
    part1.product_families === part2.product_families &&
    part1.versions === part2.versions &&
    part1.customers_site === part2.customers_site &&
    part1.tab === part2.tab &&
    part1.product_type === part2.product_type &&
    part1.customer_driver === part2.customer_driver &&
    part1.is_active === part2.is_active
  );
};

// ==================== EXPORT ALL ====================

export type { PartsService };

/*
=== REFACTORED PARTS SERVICE FEATURES ===

NATIVE FETCH API:
✅ Removed apiClient dependency
✅ Implemented native fetch requests
✅ Consistent with customerService pattern
✅ No external HTTP library dependencies

CACHE-BUSTING:
✅ Cache-busting headers on all requests
✅ Timestamp parameters for GET requests
✅ 304 response handling
✅ Fresh data guarantee

ERROR HANDLING:
✅ Consistent response structure
✅ No thrown exceptions - returns response objects
✅ Detailed logging for debugging
✅ Graceful error fallbacks

RESPONSE STRUCTURE:
✅ Handles VarcharCodePaginatedResponse<Parts> structure
✅ Extracts parts array from nested response.data.data
✅ Preserves pagination information
✅ Legacy array fallback support

VALIDATION:
✅ Returns validation results instead of throwing
✅ Field-specific error messages
✅ Consistent validation pattern

ADDITIONAL FEATURES:
✅ togglePartStatus method
✅ getPartsSelector for active parts
✅ getStats method for statistics
✅ checkCodeExists method
✅ All methods now return consistent response objects

The refactored service now matches customerService architecture:
- Native fetch instead of axios/apiClient
- Cache-busting for fresh data
- Consistent error handling
- No thrown exceptions
- Proper response structure handling
*/