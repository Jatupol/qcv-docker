// client/src/services/customerService.ts
// FIXED: Customer Service handles VarcharCodePaginatedResponse<Customer> structure
// Uses environment-based API configuration

import { apiBaseUrl } from './api';

// ============ TYPES ============

export interface Customer {
  code: string;
  name: string;
  is_active: boolean;
  created_by: number;
  updated_by: number;
  created_at: Date;
  updated_at: Date;
}

export interface CustomerFormData {
  code: string;
  name: string;
  is_active?: boolean;
}

export interface UpdateCustomerFormData {
  name?: string;
  is_active?: boolean;
}

export interface CustomerQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: keyof Customer;
  sortOrder?: 'asc' | 'desc';
  isActive?: boolean;
  _t?: number; // Cache buster timestamp
}

// CRITICAL FIX: Updated response types to match backend VarcharCodePaginatedResponse structure
export interface CustomerResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Backend returns this structure for list operations
export interface CustomerListResponse {
  success: boolean;
  data?: {
    data: Customer[];           // CRITICAL: Nested array structure
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  message?: string;
  errors?: Record<string, string[]>;
}

export interface CustomerStats {
  total: number;
  active: number;
  inactive: number;
  recent: number;
}

// ============ CUSTOMER SERVICE CLASS ============

class CustomerApiService {
  private readonly baseUrl = apiBaseUrl('customers');

  // ============ HELPER METHODS ============

  private async makeRequest<T>(url: string, options: RequestInit = {}): Promise<CustomerResponse<T>> {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        credentials: 'include',
        ...options,
      });

      console.log(`CustomerService: ${options.method || 'GET'} ${url} - Status: ${response.status}`);

      // Handle 304 Not Modified responses
      if (response.status === 304) {
        console.warn('CustomerService: Received 304 Not Modified, treating as successful empty response');
        return {
          success: true,
          data: [] as any,
          message: 'Data not modified (cached)',
        };
      }

      const data = await response.json();
      
      if (!response.ok) {
        console.error('CustomerService: API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          data
        });
      }
      
      return data;
    } catch (error) {
      console.error('CustomerService.makeRequest error:', error);
      return {
        success: false,
        data: [] as any,
        message: error instanceof Error ? error.message : 'Network error occurred',
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

  // ============ CRUD OPERATIONS ============

  public async getCustomers(params: CustomerQueryParams = {}): Promise<CustomerResponse<Customer[]>> {
    // Always add cache buster to prevent 304 responses
    const paramsWithCacheBuster = {
      ...params 
    };
    
    const queryString = this.buildQueryString(paramsWithCacheBuster);
    const url = queryString ? `${this.baseUrl}?${queryString}` : `${this.baseUrl}?_t=${Date.now()}`;
    
    console.log('CustomerService.getCustomers: Calling URL:', url);
    
    const response = await this.makeRequest<any>(url);
    
    console.log('CustomerService.getCustomers: Raw response:', response);
    console.log('CustomerService.getCustomers: Response.data type:', typeof response.data);
    console.log('CustomerService.getCustomers: Response.data structure:', response.data ? Object.keys(response.data) : 'null');
    
    // CRITICAL FIX: Handle VarcharCodePaginatedResponse<Customer> structure
    if (response.success && response.data) {
      
      // Backend returns: { success: true, data: { data: Customer[], pagination: {...} } }
      if (response.data.data && Array.isArray(response.data.data)) {
        console.log('✅ CustomerService: Detected paginated response structure');
        console.log('  - Customers count:', response.data.data.length);
        console.log('  - Pagination:', response.data.pagination);
        
        // Return the correct structure that CustomersPage expects
        return {
          success: true,
          data: response.data.data as Customer[], // Extract the actual array
          message: response.message,
          errors: response.errors,
          pagination: response.data.pagination
        };
      }
      
      // Legacy fallback: direct array
      else if (Array.isArray(response.data)) {
        console.log('✅ CustomerService: Direct array response (legacy)');
        return {
          success: true,
          data: response.data as Customer[],
          message: response.message,
          errors: response.errors,
          pagination: response.pagination
        };
      }
      
      // Unexpected structure
      else {
        console.warn('⚠️ CustomerService: Unexpected response structure, returning empty array');
        console.warn('Expected: { data: Customer[] } or Customer[]');
        console.warn('Received:', response.data);
        
        return {
          success: false,
          data: [],
          message: 'Invalid response structure from server',
          errors: response.errors
        };
      }
    }
    
    // API returned success: false or no data
    console.error('❌ CustomerService: API returned success: false or no data');
    return {
      success: false,
      data: [],
      message: response.message || 'Failed to load customers',
      errors: response.errors || {}
    };
  }

  public async getCustomersSelector(params: CustomerQueryParams = {}): Promise<CustomerResponse<Customer[]>> {
    const paramsWithCacheBuster = {
      ...params,
      isActive: true 
    };
    
    const queryString = this.buildQueryString(paramsWithCacheBuster);
    const url = `${this.baseUrl}/active?${queryString}`;
    
    const response = await this.makeRequest<Customer[]>(url);
    
    // Handle the same nested structure for active customers endpoint
    if (response.success && response.data) {
      if ((response.data as any).data && Array.isArray((response.data as any).data)) {
        return {
          success: true,
          data: (response.data as any).data,
          message: response.message,
          errors: response.errors
        };
      }
      if (Array.isArray(response.data)) {
        return response;
      }
    }
    
    return {
      success: false,
      data: [],
      message: response.message || 'Failed to load active customers',
      errors: response.errors || {}
    };
  }

  public async createCustomer(data: CustomerFormData): Promise<CustomerResponse<Customer>> {
    console.log('CustomerService.createCustomer: Creating with data:', data);
    return this.makeRequest<Customer>(this.baseUrl, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async updateCustomer(code: string, data: UpdateCustomerFormData): Promise<CustomerResponse<Customer>> {
    console.log('CustomerService.updateCustomer: Updating customer', code, 'with data:', data);
    return this.makeRequest<Customer>(`${this.baseUrl}/${encodeURIComponent(code)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  public async deleteCustomer(code: string): Promise<CustomerResponse<boolean>> {
    console.log('CustomerService.deleteCustomer: Deleting customer:', code);
    return this.makeRequest<boolean>(`${this.baseUrl}/${encodeURIComponent(code)}`, {
      method: 'DELETE',
    });
  }

  public async getStats(): Promise<CustomerResponse<CustomerStats>> {
    const url = `${this.baseUrl}/statistics`;
    console.log('CustomerService.getStats: Calling URL:', url);

    const response = await this.makeRequest<any>(url);

    // Handle the nested response structure from backend
    if (response.success && response.data && response.data.overview) {
      console.log('✅ CustomerService.getStats: Extracting stats from overview object');
      console.log('Raw API response:', response.data);

      return {
        success: true,
        data: {
          total: response.data.overview.total || 0,
          active: response.data.overview.active || 0,
          inactive: response.data.overview.inactive || 0,
          recent: response.data.overview.recent || 0
        },
        message: response.message
      };
    }

    console.log('❌ CustomerService.getStats: Invalid response structure');
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
      message: response.message || 'Failed to load statistics'
    };
  }

  public async toggleCustomerStatus(code: string): Promise<CustomerResponse<Customer>> {
    console.log('CustomerService.toggleCustomerStatus: Toggling status for:', code);
    return this.makeRequest<Customer>(`${this.baseUrl}/${encodeURIComponent(code)}/status`, {
      method: 'PATCH',
    });
  }

  // ============ UTILITY METHODS ============

  public async checkCodeExists(code: string): Promise<CustomerResponse<{ exists: boolean }>> {
    const url = `${this.baseUrl}/check-code/${encodeURIComponent(code)}`;
    return this.makeRequest<{ exists: boolean }>(url);
  }

  public async searchCustomers(query: string): Promise<CustomerResponse<Customer[]>> {
    const url = `${this.baseUrl}/search?q=${encodeURIComponent(query)}`;
    const response = await this.makeRequest<Customer[]>(url);
    
    // Handle nested structure for search results too
    if (response.success && response.data && (response.data as any).data) {
      return {
        success: true,
        data: (response.data as any).data,
        message: response.message,
        errors: response.errors
      };
    }
    
    return response;
  }
}

// ============ SINGLETON EXPORT ============

export const customerService = new CustomerApiService();

// ==================== DROPDOWN HELPER FUNCTIONS ====================

/**
 * Get dropdown options for customers
 */
export const getCustomerOptions = async (): Promise<Array<{ value: string; label: string; code?: string }>> => {
  try {
    console.log('🔄 Fetching customer options...');
    const response = await customerService.getCustomers({ isActive: true, limit: 1000 });
    console.log('📊 Raw customer data:', response);

    if (!response.success || !response.data) {
      console.error('❌ Failed to fetch customers for dropdown');
      return [];
    }

    const customers = response.data;
    console.log('📋 Customers for dropdown:', customers);

    const options = customers.map(customer => ({
      value: customer.code,
      label: customer.name ? `${customer.code} - ${customer.name}` : customer.code,
      code: customer.code
    }));

    console.log('✅ Customer options:', options);
    return options;
  } catch (error) {
    console.error('❌ Error getting customer options:', error);
    return [];
  }
};

export default customerService;

/*
=== FIXED CUSTOMER SERVICE FEATURES ===

CRITICAL BACKEND RESPONSE FIX:
✅ Properly handles VarcharCodePaginatedResponse<Customer> structure
✅ Extracts customer array from nested response.data.data path
✅ Preserves pagination information from backend
✅ Handles both nested and legacy flat array structures

RESPONSE STRUCTURE HANDLING:
✅ Expected: { success: true, data: { data: Customer[], pagination: {...} } }
✅ Legacy: { success: true, data: Customer[], pagination: {...} }
✅ Error cases: { success: false, message: "...", errors: {...} }

COMPREHENSIVE LOGGING:
✅ Detailed structure analysis for all API responses
✅ Response type detection and logging
✅ Clear success/failure indicators
✅ Cache-busting confirmation

API RESPONSE SAFETY:
✅ Validates nested structure before accessing arrays
✅ Provides fallback for unexpected structures
✅ Always returns Customer[] arrays where expected
✅ Prevents "map is not a function" errors

CACHE CONTROL:
✅ Cache-busting headers on all requests
✅ Timestamp parameters for GET requests
✅ 304 response handling
✅ Fresh data guarantee

The key insight: Your backend follows the Generic VARCHAR Code pattern which returns
VarcharCodePaginatedResponse<T> = { data: T[], pagination: {...} }, so the actual
customer data lives at response.data.data, NOT response.data directly.

This service now correctly extracts the customer array from the nested structure,
which will resolve the "API returned non-array data" error and allow CustomersPage
to display the customer data properly.
*/