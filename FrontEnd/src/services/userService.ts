// client/src/services/userService.ts
// Final Clean User Service - Complete Integration with types/user.ts
// FIXED: All type compatibility issues resolved

/**
 * User Service - Frontend API service for User entity
 *
 * FINAL VERSION: Complete integration with types/user.ts
 * - All types imported from centralized types file
 * - Consistent error handling with UserFormErrors
 * - Automatic date transformation for EntityData compatibility
 * - Complete separation architecture compliance
 * - Uses environment-based API configuration
 */

// ==================== IMPORTS ====================

import { apiBaseUrl } from './api';

import type {
  User,
  UserRole,
  CreateUserFormData,
  UpdateUserFormData,
  UserQueryParams,
  UserResponse,
  UserStats,
  PasswordChangeFormData,
  ErrorRecord,
  UserFormErrors
} from '../types/user';

// Import helper functions from types file
import { transformApiUser, validateUserForm } from '../types/user';

// ==================== RE-EXPORTS FOR CONVENIENCE ====================
export type { 
  User, 
  UserRole, 
  UserQueryParams, 
  UserStats,
  CreateUserFormData,
  UpdateUserFormData,
  UserFormErrors
};

// ==================== USER SERVICE CLASS ====================

class UserApiService {
  private readonly baseUrl = apiBaseUrl('users');

  // ============ HELPER METHODS ============

  /**
   * Make HTTP request with automatic error handling and date transformation
   */
  private async makeRequest<T>(url: string, options: RequestInit = {}): Promise<UserResponse<T>> {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        credentials: 'include',
        ...options,
      });

      const data = await response.json();

      // Log errors for debugging
      if (!response.ok) {
        console.error('❌ API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          url,
          method: options.method || 'GET',
          data
        });
      }

      // Transform User entities: convert date strings to Date objects
      if (data.success && data.data) {
        if (Array.isArray(data.data)) {
          // Transform array of users
          data.data = data.data.map((user: any) =>
            this.isUserEntity(user) ? transformApiUser(user) : user
          );
        } else if (this.isUserEntity(data.data)) {
          // Transform single user
          data.data = transformApiUser(data.data);
        }
      }

      // Transform error format from server to client
      // Server: [{ field: 'password', message: 'error text' }]
      // Client: { password: ['error text'] }
      if (!data.success && data.errors && Array.isArray(data.errors)) {
        const transformedErrors: Record<string, string[]> = {};
        data.errors.forEach((error: any) => {
          if (error.field && error.message) {
            if (!transformedErrors[error.field]) {
              transformedErrors[error.field] = [];
            }
            transformedErrors[error.field].push(error.message);
          }
        });
        data.errors = transformedErrors;
      }

      return data;
    } catch (error) {
      console.error('❌ Network Error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  /**
   * Check if an object is a User entity (has user-like properties)
   */
  private isUserEntity(obj: any): boolean {
    return obj && 
           typeof obj === 'object' && 
           typeof obj.id === 'number' && 
           typeof obj.username === 'string' &&
           typeof obj.name === 'string';
  }

/**
 * Build query string from parameters with proper boolean handling
 */
private buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    // Skip undefined and null values
    if (value === undefined || value === null) {
      console.log(`Skipping ${key}: ${value}`);
      return;
    }
    
    // Handle empty strings
    if (value === '') {
      console.log(`Skipping empty ${key}`);
      return;
    }
    
    // Convert boolean values to string explicitly
    if (typeof value === 'boolean') {
      searchParams.append(key, value.toString());
      console.log(`Added boolean ${key}: ${value.toString()}`);
    } else {
      searchParams.append(key, String(value));
      console.log(`Added ${key}: ${String(value)}`);
    }
  });
  
  const queryString = searchParams.toString();
  console.log('🔗 Built query string:', queryString);
  return queryString;
}

  /**
   * Validate form data before sending to API
   * FIXED: Returns UserFormErrors type consistently
   */
  private validateFormData(data: CreateUserFormData | UpdateUserFormData): { 
    isValid: boolean; 
    errors: UserFormErrors 
  } {
    const errors = validateUserForm(data);
    const hasErrors = Object.keys(errors).length > 0;
    
    return {
      isValid: !hasErrors,
      errors
    };
  }

  // ============ CRUD OPERATIONS ============

  /**
   * Get all users with optional filtering and pagination
   */
public async getUsers(params: UserQueryParams = {}): Promise<UserResponse<User[]>> {
  console.log('🔍 UserService.getUsers called with params:', params);
  
  // Clean the parameters - remove undefined values
  const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, any>);
  
  console.log('🧹 Cleaned params:', cleanParams);
  
  const queryString = this.buildQueryString(cleanParams);
  const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
  
  console.log('📡 Making request to:', url);
  
  return this.makeRequest<User[]>(url);
}

  /**
   * Get single user by ID
   */
  public async getUserById(id: number): Promise<UserResponse<User>> {
    if (!id || id <= 0) {
      return {
        success: false,
        message: 'Invalid user ID provided',
      };
    }
    return this.makeRequest<User>(`${this.baseUrl}/${id}`);
  }

  /**
   * Create new user
   */
  public async createUser(data: CreateUserFormData): Promise<UserResponse<User>> {
    // Validate form data
    const validation = this.validateFormData(data);
    if (!validation.isValid) {
      return {
        success: false,
        message: 'Validation failed' 
      };
    }

    // Prepare data for API (remove confirmPassword)
    const { confirmPassword, ...apiData } = data;
    
    return this.makeRequest<User>(`${this.baseUrl}`, {
      method: 'POST',
      body: JSON.stringify(apiData),
    });
  }

  /**
   * Update existing user
   */
  public async updateUser(id: number, data: UpdateUserFormData): Promise<UserResponse<User>> {
    if (!id || id <= 0) {
      return {
        success: false,
        message: 'Invalid user ID provided',
      };
    }

    console.log('🔄 Update User Request:', { id, data });

    // Validate form data
    const validation = this.validateFormData(data);
    if (!validation.isValid) {
      // Get the first error message from the validation errors
      const firstError = Object.values(validation.errors)[0];
      const errorMessage = Array.isArray(firstError) ? firstError[0] : 'Validation failed';

      console.error('❌ Validation errors:', validation.errors);

      return {
        success: false,
        message: errorMessage,
      };
    }

    console.log('✅ Validation passed, sending request...');

    // Clean the data - convert empty strings to null, remove undefined
    const cleanedData = Object.entries(data).reduce((acc, [key, value]) => {
      if (value === undefined) {
        // Skip undefined values
        return acc;
      } else if (value === '') {
        // Convert empty strings to null for proper database clearing
        acc[key] = null;
      } else {
        // Keep all other values including null, false, 0
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);

    console.log('🧹 Cleaned data being sent:', cleanedData);
    console.log('📦 JSON payload:', JSON.stringify(cleanedData, null, 2));
    console.log('🔑 is_active value:', cleanedData.is_active, 'type:', typeof cleanedData.is_active);

    const response = await this.makeRequest<User>(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(cleanedData),
    });

    console.log('📥 Update Response:', response);

    return response;
  }

  /**
   * Delete user
   */
  public async deleteUser(id: number): Promise<UserResponse<void>> {
    if (!id || id <= 0) {
      return {
        success: false,
        message: 'Invalid user ID provided',
      };
    }

    return this.makeRequest<void>(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });
  }

  // ============ USER-SPECIFIC OPERATIONS ============

  /**
   * Toggle user active status
   */
  public async toggleUserStatus(id: number): Promise<UserResponse<User>> {
    if (!id || id <= 0) {
      return {
        success: false,
        message: 'Invalid user ID provided',
      };
    }

    return this.makeRequest<User>(`${this.baseUrl}/${id}/toggle-status`, {
      method: 'PATCH',
    });
  }

  /**
   * Change user password
   */
  public async changePassword(id: number, data: PasswordChangeFormData): Promise<UserResponse<void>> {
    if (!id || id <= 0) {
      return {
        success: false,
        message: 'Invalid user ID provided',
      };
    }

    // Validate passwords match
    if (data.newPassword !== data.confirmPassword) {
      return {
        success: false,
        message: 'Passwords do not match'
      };
    }

    // Send only required fields to API in snake_case format (backend expects snake_case)
    const apiData = {
      current_password: data.currentPassword || '',  // Optional, can be empty string
      new_password: data.newPassword,
      confirm_password: data.confirmPassword
    };

    return this.makeRequest<void>(`${this.baseUrl}/${id}/password`, {
      method: 'PUT',
      body: JSON.stringify(apiData),
    });
  }

  /**
   * Reset user password (admin only)
   */
  public async resetPassword(id: number): Promise<UserResponse<{ temporaryPassword: string }>> {
    if (!id || id <= 0) {
      return {
        success: false,
        message: 'Invalid user ID provided',
      };
    }

    return this.makeRequest<{ temporaryPassword: string }>(`${this.baseUrl}/${id}/reset-password`, {
      method: 'PATCH',
    });
  }

  /**
   * Update user profile (self-service)
   */
  public async updateProfile(id: number, data: { name?: string; email?: string; position?: string }): Promise<UserResponse<User>> {
    if (!id || id <= 0) {
      return {
        success: false,
        message: 'Invalid user ID provided',
      };
    }

    return this.makeRequest<User>(`${this.baseUrl}/${id}/profile`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // ============ STATISTICS & REPORTING ============

  /**
   * Get user statistics for dashboard
   */
  public async getStats(): Promise<UserResponse<UserStats>> {
    try {
      const response = await this.makeRequest<UserStats>(`${this.baseUrl}/statistics`);
      return response;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get user statistics',
      };
    }
  }

  /**
   * Get users by role
   */
  public async getUsersByRole(role: UserRole): Promise<UserResponse<User[]>> {
    return this.getUsers({ role });
  }

  /**
   * Search users by term
   */
  public async searchUsers(searchTerm: string, limit: number = 20): Promise<UserResponse<User[]>> {
    return this.getUsers({ 
      search: searchTerm, 
      limit,
      isActive: true // Only search active users by default
    });
  }

  /**
   * Get recently created users
   */
  public async getRecentUsers(days: number = 7, limit: number = 10): Promise<UserResponse<User[]>> {
    const createdAfter = new Date();
    createdAfter.setDate(createdAfter.getDate() - days);
    
    return this.getUsers({
      created_after: createdAfter.toISOString(),
      limit,
      sortBy: 'created_at',
      sortOrder: 'desc'
    });
  }

  // ============ HEALTH & MONITORING ============

  /**
   * Health check endpoint
   */
  public async healthCheck(): Promise<UserResponse<{ status: string; timestamp: string }>> {
    return this.makeRequest<{ status: string; timestamp: string }>(`${this.baseUrl}/health`);
  }

  /**
   * Check if username is available
   */
  public async checkUsernameAvailability(username: string, excludeUserId?: number): Promise<UserResponse<{ available: boolean }>> {
    const params: Record<string, any> = { username };
    if (excludeUserId) {
      params.exclude_user_id = excludeUserId;
    }
    
    const queryString = this.buildQueryString(params);
    return this.makeRequest<{ available: boolean }>(`${this.baseUrl}/check-username?${queryString}`);
  }

  /**
   * Check if email is available
   */
  public async checkEmailAvailability(email: string, excludeUserId?: number): Promise<UserResponse<{ available: boolean }>> {
    const params: Record<string, any> = { email };
    if (excludeUserId) {
      params.exclude_user_id = excludeUserId;
    }
    
    const queryString = this.buildQueryString(params);
    return this.makeRequest<{ available: boolean }>(`${this.baseUrl}/check-email?${queryString}`);
  }

  // ============ BULK OPERATIONS ============

  /**
   * Bulk update user status
   */
  public async bulkUpdateStatus(userIds: number[], isActive: boolean): Promise<UserResponse<{ updated: number; failed: number }>> {
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return {
        success: false,
        message: 'No user IDs provided',
      };
    }

    return this.makeRequest<{ updated: number; failed: number }>(`${this.baseUrl}/bulk-update-status`, {
      method: 'PATCH',
      body: JSON.stringify({ userIds, isActive }),
    });
  }

  /**
   * Export users data
   */
  public async exportUsers(params: UserQueryParams = {}): Promise<UserResponse<{ downloadUrl: string }>> {
    const queryString = this.buildQueryString(params);
    const url = queryString ? `${this.baseUrl}/export?${queryString}` : `${this.baseUrl}/export`;
    
    return this.makeRequest<{ downloadUrl: string }>(url, {
      method: 'POST',
    });
  }
}

// ============ SINGLETON EXPORT ============
export const userService = new UserApiService();
export default userService;

// ============ SERVICE INSTANCE METHODS FOR EXTERNAL USE ============

/**
 * Quick access methods for common operations
 */
export const userServiceMethods = {
  // Quick user lookups
  findById: (id: number) => userService.getUserById(id),
  findByUsername: (username: string) => userService.searchUsers(username),
  
  // Quick status operations
  activate: (id: number) => userService.toggleUserStatus(id),
  deactivate: (id: number) => userService.toggleUserStatus(id),
  
  // Quick role-based queries
  getAdmins: () => userService.getUsersByRole('admin'),
  getManagers: () => userService.getUsersByRole('manager'),
  getRegularUsers: () => userService.getUsersByRole('user'),
  
  // Quick validation
  validateUsername: (username: string) => userService.checkUsernameAvailability(username),
  validateEmail: (email: string) => userService.checkEmailAvailability(email),
} as const;