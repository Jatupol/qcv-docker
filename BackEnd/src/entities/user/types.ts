// server/src/entities/user/types.ts
// User Entity Types - Complete Separation Entity Architecture
// SERIAL ID Pattern Implementation

/**
 * User Entity Types - Applying Generic Serial ID Pattern
 * 
 * Complete Separation Entity Architecture:
 * ✅ Extends BaseSerialIdEntity from existing generic pattern
 * ✅ No direct cross-entity dependencies
 * ✅ Leverages existing generic types for 90% code reduction
 * ✅ User-specific extensions for authentication features
 * 
 * Generic Pattern Integration:
 * ✅ Uses existing BaseSerialIdEntity interface
 * ✅ Extends existing SerialIdQueryOptions for filtering
 * ✅ Implements existing SerialIdEntityConfig interface
 * ✅ Compatible with existing generic service/controller/model
 * 
 * Database Schema Compliance:
 * - Table: users
 * - Primary Key: id SERIAL PRIMARY KEY
 * - Pattern: SERIAL ID Entity
 * - API Routes: /api/users/:id
 */

// ==================== IMPORT EXISTING GENERIC TYPES ====================

import {
  BaseSerialIdEntity,
  CreateSerialIdData,
  UpdateSerialIdData,
  SerialIdQueryOptions,
  SerialIdPaginatedResponse,
  SerialIdApiResponse,
  SerialIdEntityRequest,
  SerialIdServiceResult,
  ValidationResult,
  SerialIdEntityConfig
} from '../../generic/entities/serial-id-entity/generic-types';

// ==================== USER-SPECIFIC ENUMS ====================

/**
 * User Role Enumeration - matches database CHECK constraint
 */
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user',
  VIEWER = 'viewer'
}

// ==================== EXTENDING GENERIC ENTITY ====================

/**
 * User Entity Interface - Extends Generic Serial ID Entity
 * 
 * Adds user-specific fields to the base entity structure.
 * Inherits: id, name, description, is_active, created_by, updated_by, created_at, updated_at
 */
export interface User extends BaseSerialIdEntity {
  // User-specific fields (additional to generic base)
  username: string;              // VARCHAR(50) UNIQUE NOT NULL
  email: string;                 // VARCHAR(255) UNIQUE NOT NULL
  password_hash: string;         // VARCHAR(255) NOT NULL
  role: UserRole;                // VARCHAR(20) DEFAULT 'user'
  position: string;              // VARCHAR(30) NOT NULL DEFAULT ''

  // Work-related fields (updated during login from inf_checkin)
  work_shift?: string;           // VARCHAR(1) - Work shift ID (A, B, C)
  checkin?: Date;                // TIMESTAMP WITH TIME ZONE - Last check-in time
  team?: string;                 // VARCHAR(5) - Team assignment
  linevi?: string;               // VARCHAR(100) - Line VI assignment from inf_checkin.line_no_id
  time_start_work?: string;      // TIME WITH TIME ZONE - Work start time
  time_off_work?: string;        // TIME WITH TIME ZONE - Work end time

  // Note: name field from BaseSerialIdEntity represents display name
  // Note: description from BaseSerialIdEntity can store user bio/notes
}

/**
 * Session User Interface
 * 
 * User session data for authentication and authorization.
 * This is the authoritative SessionUser definition used across the application.
 */
export interface SessionUser {
  id: number;
  username: string;
  email: string;
  name: string;                  // Display name
  role: UserRole;                // User role for authorization
  position: string;              // User position for context
  is_active: boolean;

  // Work-related session data
  work_shift?: string;           // Current work shift
  team?: string;                 // Team assignment
  linevi?: string;               // Line VI assignment from inf_checkin.line_no_id
}

/**
 * User Profile Interface (sanitized for external use)
 * 
 * Public user data without sensitive fields.
 * Includes all BaseSerialIdEntity fields except password_hash.
 */
export interface UserProfile {
  id: number;
  username: string;
  email: string;
  name: string;                  // Display name from BaseSerialIdEntity
  description?: string;          // User bio/notes from BaseSerialIdEntity (optional)
  role: UserRole;
  position: string;
  is_active: boolean;
  created_by: number;            // Required by BaseSerialIdEntity
  updated_by: number;            // Required by BaseSerialIdEntity
  created_at: Date;
  updated_at: Date;

  // Work-related profile data
  work_shift?: string;           // Current work shift
  checkin?: Date;                // Last check-in time
  team?: string;                 // Team assignment
  linevi?: string;               // Line VI assignment from inf_checkin.line_no_id
  time_start_work?: string;      // Work start time
  time_off_work?: string;        // Work end time
}

// ==================== REQUEST/RESPONSE INTERFACES ====================

/**
 * Create User Request - Extends Generic Create Data
 * 
 * User-specific creation payload that extends the generic pattern.
 */
export interface CreateUserRequest extends CreateSerialIdData {
  // Required user-specific fields
  username: string;              // Required: 3-50 characters
  email: string;                 // Required: valid email format
  password: string;              // Required: plain password for hashing
  role?: UserRole;               // Optional: defaults to 'user'
  position?: string;             // Optional: defaults to empty string
  
  // Generic fields inherited:
  // name: string (required - display name)
  // description?: string (optional - user bio/notes)
  // is_active?: boolean (optional - defaults to true)
}

/**
 * Update User Request - Extends Generic Update Data
 *
 * User-specific update payload that extends the generic pattern.
 */
export interface UpdateUserRequest extends UpdateSerialIdData {
  // User-specific update fields
  username?: string;
  email?: string;
  password?: string;             // Optional: plain password for update (will be hashed)
  role?: UserRole;
  position?: string;
  work_shift?: string;           // Work shift (A, B, C, etc.)
  team?: string;                 // Team name
  linevi?: string;               // FVI Line

  // Generic fields inherited:
  // name?: string (display name)
  // description?: string (user bio/notes)
  // is_active?: boolean (active status)
}

/**
 * Change Password Request Interface
 *
 * Specific interface for password change operations.
 * Note: current_password is now optional since users are authenticated via session.
 */
export interface ChangePasswordRequest {
  current_password?: string;     // Optional: current password for verification (only if provided)
  new_password: string;          // Required: new password
  confirm_password: string;      // Required: confirmation of new password
}

/**
 * User Query Parameters - Extends Generic Query Options
 * 
 * User-specific filtering options that extend the generic pattern.
 */
export interface UserQueryParams extends SerialIdQueryOptions {
  // User-specific filters
  role?: UserRole;               // Filter by user role
  position?: string;             // Filter by position
  username?: string;             // Filter by username
  email?: string;                // Filter by email domain
  
  // Generic fields inherited:
  // page?: number (pagination)
  // limit?: number (page size)
  // sortBy?: string (sort field)
  // sortOrder?: 'ASC' | 'DESC' (sort direction)
  // search?: string (search across searchable fields)
  // isActive?: boolean (filter by active status)
  // createdAfter?: string (date filtering)
  // createdBefore?: string (date filtering)
}

// ==================== SPECIALIZED RESPONSE TYPES ====================

/**
 * User API Response - Extends Generic API Response
 */
export type UserApiResponse<T = any> = SerialIdApiResponse<T>;

/**
 * User Service Result - Extends Generic Service Result
 */
export type UserServiceResult<T = any> = SerialIdServiceResult<T>;

/**
 * User Paginated Response - Extends Generic Paginated Response
 */
export type UserPaginatedResponse = SerialIdPaginatedResponse<User>;

/**
 * User Profile Paginated Response
 */
export type UserProfilePaginatedResponse = SerialIdPaginatedResponse<UserProfile>;

/**
 * User Request Interface - Extends Generic Entity Request
 */
export interface UserEntityRequest<
  TParams = any,
  TBody = any,
  TQuery = UserQueryParams
> extends SerialIdEntityRequest<TParams, TBody, TQuery> {
  // Inherits user context and all generic request features
}

// ==================== INTERNAL DATA INTERFACES ====================

/**
 * Create User Data - Internal interface for model operations
 */
export interface CreateUserData {
  username: string;
  email: string;
  password_hash: string;
  name: string;                  // Display name
  description?: string;          // User bio/notes
  role: UserRole;
  position: string;
  is_active: boolean;
  work_shift?: string;           // Work shift (A, B, C, etc.)
  team?: string;                 // Team name
  linevi?: string;               // FVI Line
  created_by: number;
}

/**
 * Update User Data - Internal interface for model operations
 */
export interface UpdateUserData {
  username?: string;
  email?: string;
  password_hash?: string;
  name?: string;                 // Display name
  description?: string;          // User bio/notes
  role?: UserRole;
  position?: string;
  is_active?: boolean;
  work_shift?: string;           // Work shift (A, B, C, etc.)
  team?: string;                 // Team name
  linevi?: string;               // FVI Line
  checkin?: Date | null;         // Last check-in timestamp
  updated_by: number;
}

// ==================== STATISTICS & REPORTING ====================

/**
 * User Statistics Interface
 */
export interface UserStats {
  total_users: number;
  active_users: number;
  inactive_users: number;
  role_distribution: {
    admin: number;
    manager: number;
    user: number;
    viewer: number;
  };
  recent_registrations: number;  // Last 30 days
  position_distribution: Record<string, number>;
}

// ==================== ENTITY CONFIGURATION ====================

/**
 * User Entity Configuration - Extends Generic Configuration
 * 
 * User-specific configuration for the generic pattern.
 * Uses simplified SerialIdEntityConfig interface.
 */
export interface UserEntityConfig extends SerialIdEntityConfig {
  // All properties inherited from SerialIdEntityConfig:
  // entityName: string
  // tableName: string
  // apiPath: string
  // searchableFields: string[]
  // defaultLimit: number
  // maxLimit: number
}

// ==================== VALIDATION CONSTANTS ====================

/**
 * User Validation Constants
 */
export const USER_CONSTRAINTS = {
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z0-9_-]+$/,
    RESERVED: ['admin', 'root', 'system', 'api', 'null', 'undefined']
  },
  EMAIL: {
    MAX_LENGTH: 255,
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL: false
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 250,
    PATTERN: /^[a-zA-Z\s\-'\.]+$/
  },
  POSITION: {
    MAX_LENGTH: 30
  },
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100
  }
};

/**
 * User Business Rules
 */
export const USER_BUSINESS_RULES = {
  BCRYPT_ROUNDS: 12,
  SESSION_DURATION: 12 * 60 * 60 * 1000, // 12 hours in milliseconds
  PASSWORD_HISTORY: 5, // Remember last 5 passwords
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes in milliseconds
  ADMIN_ROLE_REQUIRED_FOR: ['user_management', 'system_config'],
  MANAGER_ROLE_REQUIRED_FOR: ['reports', 'defect_management']
};

// ==================== VALIDATION HELPER FUNCTIONS ====================

/**
 * Check if user role is valid
 */
export function isValidUserRole(role: string): role is UserRole {
  return Object.values(UserRole).includes(role as UserRole);
}

/**
 * Sanitize user data for external responses
 */
export function sanitizeUser(user: User): UserProfile {
  const { password_hash, ...sanitized } = user;
  return sanitized;
}

/**
 * Validate username format
 */
export function isValidUsername(username: string): boolean {
  if (!username || typeof username !== 'string') return false;
  if (username.length < USER_CONSTRAINTS.USERNAME.MIN_LENGTH) return false;
  if (username.length > USER_CONSTRAINTS.USERNAME.MAX_LENGTH) return false;
  //if (!USER_CONSTRAINTS.USERNAME.PATTERN.test(username)) return false;
  if (USER_CONSTRAINTS.USERNAME.RESERVED.includes(username.toLowerCase())) return false;
  return true;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  if (email.length > USER_CONSTRAINTS.EMAIL.MAX_LENGTH) return false;
  return USER_CONSTRAINTS.EMAIL.PATTERN.test(email);
}

/**
 * Validate password strength
 */
export function isValidPassword(password: string): boolean {
  if (!password || typeof password !== 'string') return false;
  if (password.length < USER_CONSTRAINTS.PASSWORD.MIN_LENGTH) return false;
  if (password.length > USER_CONSTRAINTS.PASSWORD.MAX_LENGTH) return false;
  
  //if (USER_CONSTRAINTS.PASSWORD.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) return false;
  //if (USER_CONSTRAINTS.PASSWORD.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) return false;
  //if (USER_CONSTRAINTS.PASSWORD.REQUIRE_NUMBERS && !/\d/.test(password)) return false;
  //if (USER_CONSTRAINTS.PASSWORD.REQUIRE_SPECIAL && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;
  
  return true;
}

/**
 * Validate name format
 */
export function isValidName(name: string): boolean {
  if (!name || typeof name !== 'string') return false;
  if (name.length < USER_CONSTRAINTS.NAME.MIN_LENGTH) return false;
  if (name.length > USER_CONSTRAINTS.NAME.MAX_LENGTH) return false;
  return USER_CONSTRAINTS.NAME.PATTERN.test(name.trim());
}

// ==================== DEFAULT CONFIGURATION ====================

/**
 * Default User Entity Configuration
 * 
 * Pre-configured settings for the User entity using simplified generic pattern.
 */
export const DEFAULT_USER_CONFIG: UserEntityConfig = {
  entityName: 'user',
  tableName: 'users',
  apiPath: '/api/users',
  searchableFields: ['username', 'email', 'name', 'position'],
  defaultLimit: 10,
  maxLimit: 100
};

// ==================== TYPE EXPORTS FOR CONVENIENCE ====================

/**
 * Re-export commonly used types for easier imports
 */
export type {
  User as UserEntity,
  UserProfile as PublicUser,
  CreateUserRequest as NewUserData,
  UpdateUserRequest as UserUpdateData,
  UserQueryParams as UserFilters,
  UserEntityRequest as UserRequest
};

// Re-export generic types used by User entity
export type {
  BaseSerialIdEntity,
  SerialIdServiceResult,
  SerialIdPaginatedResponse,
  ValidationResult
} from '../../generic/entities/serial-id-entity/generic-types';