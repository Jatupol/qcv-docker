// client/src/types/user.ts
// Complete User Types - All Type Definitions for User Entity
 
import type {ApiResponse, PaginatedApiResponse, BaseQueryParams, BaseEntity } from './base.ts';
import { toLocalDate } from '../utils';

 

// ==================== CORE USER TYPES ====================

/**
 * User Role Enumeration
 */
export type UserRole = 'admin' | 'manager' | 'user' | 'viewer';

export const UserRoles = {
  ADMIN: 'admin' as const,
  MANAGER: 'manager' as const,
  USER: 'user' as const,
  VIEWER: 'viewer' as const,
};

/**
 * Core User Entity Interface
 * Maps to database schema: users table
 * FIXED: Matches EntityData constraint for GenericEntityIdPage
 */
export interface User extends BaseEntity {
  id: number;                           // SERIAL PRIMARY KEY
  username: string;                     // VARCHAR(50) UNIQUE NOT NULL
  email?: string;                       // VARCHAR(255) UNIQUE
  password_hash?: string;               // VARCHAR(255) - hidden from frontend
  name: string;                         // VARCHAR(100) NOT NULL
  description?: string;                 // Optional description field for generic form compatibility
  position?: string | null;             // VARCHAR(100)
  role: UserRole;                       // ENUM: admin, manager, user, viewer
  is_active: boolean;                   // BOOLEAN DEFAULT true
  work_shift?: string;                  // Work shift (A, B, C, etc.)
  team?: string;                        // Team name
  linevi?: string;                      // FVI Line
  checkin?: Date;                       // Last check-in timestamp
  time_start_work?: string;             // Start time (HH:mm format)
  time_off_work?: string;               // End time (HH:mm format)
  created_by?: number;                  // INTEGER REFERENCES users(id)
  updated_by?: number;                  // INTEGER REFERENCES users(id)
  created_at: Date;                     // TIMESTAMP - Date object (required for EntityData)
  updated_at: Date;                     // TIMESTAMP - Date object (required for EntityData)
}

// ==================== REQUEST/RESPONSE INTERFACES ====================

/**
 * User Query Parameters for GET requests
 */
export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;                      // Search across username, email, name
  sortBy?: keyof User;
  sortOrder?: 'asc' | 'desc';
  isActive?: boolean;                   // Filter by active status
  role?: UserRole;                      // Filter by role
  created_after?: string;               // ISO date string
  created_before?: string;              // ISO date string
  updated_after?: string;               // ISO date string
  updated_before?: string;              // ISO date string
}

 
/**
 * Pagination Information
 */
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

/**
 * User Response - Single User API Response (FIXED: Made generic)
 */
export interface UserResponse<T = User> extends ApiResponse<T> {
  data?: T;
  pagination?: PaginationInfo; // Optional pagination for list responses
}

/**
 * User List Response - Multiple Users API Response
 */
export interface UserListResponse extends ApiResponse<User[]> {
  data: User[];
  pagination: PaginationInfo;
}

/**
 * User Statistics Response (FIXED: Made generic and consistent)
 */
export interface UserStatsResponse extends ApiResponse<UserStatistics> {
  data?: UserStatistics;
}

/**
 * User Statistics Data (FIXED: Made consistent with service expectations)
 */
export interface UserStatistics {
  total: number;
  active: number;
  inactive: number;
  total_users: number;
  active_users: number;
  inactive_users: number;
  users_by_role: {
    admin: number;
    manager: number;
    user: number;
    viewer: number;
  };
  recent_signups: number;
  users_created_today: number;
  users_created_this_week: number;
  users_created_this_month: number;
  last_updated: string;
}

/**
 * UserStats - Simplified interface for service compatibility
 */
export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  total_users: number;
  active_users: number;
  inactive_users: number;
}

// ==================== FORM INTERFACES ====================

/**
 * User Creation Form Data
 */
export interface CreateUserFormData {
  username: string;
  email?: string;
  password: string;
  confirmPassword: string;              // Frontend-only validation
  name: string;
  description?: string;                 // Optional description                     
  position?: string;                
  role: UserRole;
  is_active: boolean;
}

/**
 * User Update Form Data
 * Note: username cannot be changed after creation
 */
export interface UpdateUserFormData {
  email?: string;
  name?: string;
  description?: string;                 // Optional description
  position?: string;
  role?: UserRole;
  is_active?: boolean;
  work_shift?: string;                  // Work shift (A, B, C, etc.)
  team?: string;                        // Team name
  linevi?: string;                      // FVI Line
}

/**
 * Password Change Form Data
 */
export interface PasswordChangeFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * User Form Props Interface
 */
export interface UserFormProps {
  mode: 'create' | 'edit';
  user?: User;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserFormData | UpdateUserFormData) => Promise<{ 
    success: boolean; 
    errors?: UserFormErrors  // FIXED: Use UserFormErrors instead of Record
  }>;
  loading?: boolean;
}

/**
 * User Form Errors - Validation Error Structure
 */
export interface UserFormErrors {
  username?: string[];
  email?: string[];
  password?: string[];
  confirmPassword?: string[];
  name?: string[];                        
  description?: string[];
  position?: string[];                    
  role?: string[];
  is_active?: string[];
  general?: string[];                     // For non-field-specific errors
}

// ==================== VALIDATION INTERFACES ====================

/**
 * User Validation Rules
 */
export interface UserValidationRules {
  username: {
    minLength: number;
    maxLength: number;
    pattern: RegExp;
    required: boolean;
  };
  email: {
    pattern: RegExp;
    required: boolean;
  };
  password: {
    minLength: number;
    maxLength: number;
    pattern: RegExp;
    required: boolean;
  };
  name: {
    minLength: number;
    maxLength: number;
    pattern: RegExp;
    required: boolean;
  };
  position: {
    maxLength: number;
    required: boolean;
  };
}

// ==================== UTILITY TYPES ====================

/**
 * User Entity Keys - for type-safe field operations
 */
export type UserKeys = keyof User;

/**
 * User Form Keys - for form field operations
 */
export type UserFormKeys = keyof CreateUserFormData;

/**
 * User Filter Keys - for filtering operations
 */
export type UserFilterKeys = keyof UserQueryParams;

/**
 * Partial User for Updates
 */
export type PartialUser = Partial<User>;

/**
 * User Without Sensitive Data - for public display
 */
export type PublicUser = Omit<User, 'password_hash' | 'created_by' | 'updated_by'>;

// ==================== CONSTANTS ====================

/**
 * User Entity Constants
 */
export const USER_CONSTANTS = {
  TABLE_NAME: 'users',
  PRIMARY_KEY: 'id',
  
  // Field limits
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 50,
  EMAIL_MAX_LENGTH: 255,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  POSITION_MAX_LENGTH: 100,
  PASSWORD_MIN_LENGTH: 8,
  
  // Validation patterns
  USERNAME_PATTERN: /^[a-zA-Z0-9_-]+$/,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  NAME_PATTERN: /^[a-zA-Z\s\-'.,]+$/,
  
  // Default values
  DEFAULT_ROLE: 'user' as UserRole,
  DEFAULT_ACTIVE: true,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

// ==================== TYPE GUARDS ====================

/**
 * Type guard to check if a value is a valid UserRole
 */
export function isValidUserRole(role: any): role is UserRole {
  return Object.values(UserRoles).includes(role);
}

/**
 * Type guard to check if an object is a User
 * FIXED: Updated to check for Date objects in created_at/updated_at
 */
export function isUser(obj: any): obj is User {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'number' &&
    typeof obj.username === 'string' &&
    typeof obj.name === 'string' &&
    isValidUserRole(obj.role) &&
    typeof obj.is_active === 'boolean' &&
    (obj.created_at instanceof Date || typeof obj.created_at === 'string') &&
    (obj.updated_at instanceof Date || typeof obj.updated_at === 'string')
  );
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Transform API user data to frontend User object
 */
export function transformApiUser(apiUser: any): User {
  return {
    ...apiUser,
    created_at: apiUser.created_at ? toLocalDate(apiUser.created_at) : new Date(),
    updated_at: apiUser.updated_at ? toLocalDate(apiUser.updated_at) : new Date(),
  };
}

/**
 * Get user display name (name or username fallback)
 */
export function getUserDisplayName(user: User): string {
  return user.name || user.username;
}

/**
 * Check if user has specific role
 */
export function userHasRole(user: User, role: UserRole): boolean {
  return user.role === role;
}

/**
 * Check if user has admin privileges
 */
export function isAdmin(user: User): boolean {
  return user.role === 'admin';
}

/**
 * Check if user has manager or admin privileges
 */
export function isManagerOrAdmin(user: User): boolean {
  return user.role === 'admin' || user.role === 'manager';
}

/**
 * Format user role for display
 */
export function formatUserRole(role: UserRole): string {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

/**
 * Validate user form data
 */
export function validateUserForm(data: CreateUserFormData | UpdateUserFormData): UserFormErrors {
  const errors: UserFormErrors = {};

  // Username validation
  if ('username' in data && data.username) {
    if (data.username.length < USER_CONSTANTS.USERNAME_MIN_LENGTH) {
      errors.username = [`Username must be at least ${USER_CONSTANTS.USERNAME_MIN_LENGTH} characters`];
    } else if (data.username.length > USER_CONSTANTS.USERNAME_MAX_LENGTH) {
      errors.username = [`Username must be no more than ${USER_CONSTANTS.USERNAME_MAX_LENGTH} characters`];
    } else if (!USER_CONSTANTS.USERNAME_PATTERN.test(data.username)) {
      errors.username = ['Username can only contain letters, numbers, hyphens, and underscores'];
    }
  }

  // Email validation
   /*
  if ('email' in data && data.email) {
    if (!USER_CONSTANTS.EMAIL_PATTERN.test(data.email)) {
      errors.email = ['Please enter a valid email address'];
    } else if (data.email.length > USER_CONSTANTS.EMAIL_MAX_LENGTH) {
      errors.email = [`Email must be no more than ${USER_CONSTANTS.EMAIL_MAX_LENGTH} characters`];
    }
  }
*/
  // Name validation
  if ('name' in data && data.name) {
    if (data.name.length < USER_CONSTANTS.NAME_MIN_LENGTH) {
      errors.name = [`Name must be at least ${USER_CONSTANTS.NAME_MIN_LENGTH} characters`];
    } else if (data.name.length > USER_CONSTANTS.NAME_MAX_LENGTH) {
      errors.name = [`Name must be no more than ${USER_CONSTANTS.NAME_MAX_LENGTH} characters`];
    } 
  }

  // Password validation (for create operations)
  if ('password' in data && data.password) {
    if (data.password.length < USER_CONSTANTS.PASSWORD_MIN_LENGTH) {
      errors.password = [`Password must be at least ${USER_CONSTANTS.PASSWORD_MIN_LENGTH} characters`];
    }
  }

  // Confirm password validation (for create operations)
  if ('confirmPassword' in data && 'password' in data) {
    if (data.confirmPassword !== data.password) {
      errors.confirmPassword = ['Passwords do not match'];
    }
  }

  // Position validation
  if ('position' in data && data.position && data.position.length > USER_CONSTANTS.POSITION_MAX_LENGTH) {
    errors.position = [`Position must be no more than ${USER_CONSTANTS.POSITION_MAX_LENGTH} characters`];
  }

  // Role validation
  if ('role' in data && data.role && !isValidUserRole(data.role)) {
    errors.role = ['Please select a valid role'];
  }

  return errors;
}

// ==================== EXPORT ALL TYPES ====================
// Explicit exports for better IDE support and clear API
export type ErrorRecord = Record<string, string[]>;
 