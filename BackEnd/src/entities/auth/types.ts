// server/src/entities/auth/types.ts
/**
 * Authentication Entity Types - Core Middleware Compatible
 * Manufacturing Quality Control System
 * 
 * Complete Separation Entity Architecture:
 * ✅ Reuses existing types from user entity
 * ✅ Compatible with core middleware
 * ✅ Simple focused auth-specific types only
 * ✅ No duplicate type definitions
 */

// ==================== REUSE EXISTING TYPES ====================

// Import and re-export user types
import { UserRole, SessionUser } from '../user/types';
export { UserRole, SessionUser };

// ==================== AUTH-SPECIFIC REQUEST/RESPONSE TYPES ====================

/**
 * Login Request Interface
 */
export interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Change Password Request Interface
 */
export interface ChangePasswordRequest {
  currentPassword?: string;  // Optional for admin password resets
  newPassword: string;
  confirmPassword?: string;  // For validation on frontend
}

/**
 * Authentication Result Interface
 */
export interface AuthResult {
  success: boolean;
  message: string;
  user?: SessionUser;
  error?: string;
}

/**
 * Auth Status Response Interface
 */
export interface AuthStatusResponse {
  authenticated: boolean;
  user?: SessionUser;
  sessionExpiry?: Date;
  permissions?: string[];
}

// ==================== VALIDATION CONSTANTS ====================

/**
 * Login validation rules
 */
export const LOGIN_VALIDATION = {
  username: {
    required: true,
    minLength: 1,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9_.-]+$/
  },
  password: {
    required: true,
    minLength: 6,
    maxLength: 128
  }
} as const;

/**
 * Password change validation rules
 */
export const PASSWORD_VALIDATION = {
  currentPassword: {
    minLength: 6,
    maxLength: 128
  },
  newPassword: {
    required: true,
    minLength: 6,
    maxLength: 128
  }
} as const;

// ==================== UTILITY FUNCTIONS ====================

/**
 * Validate login request data
 */
export function validateLoginRequest(data: any): data is LoginRequest {
  return (
    data &&
    typeof data.username === 'string' &&
    data.username.trim().length >= LOGIN_VALIDATION.username.minLength &&
    data.username.trim().length <= LOGIN_VALIDATION.username.maxLength &&
    typeof data.password === 'string' &&
    data.password.length >= LOGIN_VALIDATION.password.minLength &&
    data.password.length <= LOGIN_VALIDATION.password.maxLength
  );
}

/**
 * Validate password change request data
 */
export function validatePasswordChangeRequest(data: any): data is ChangePasswordRequest {
  return (
    data &&
    typeof data.newPassword === 'string' &&
    data.newPassword.length >= PASSWORD_VALIDATION.newPassword.minLength &&
    data.newPassword.length <= PASSWORD_VALIDATION.newPassword.maxLength &&
    (!data.currentPassword || (
      typeof data.currentPassword === 'string' &&
      data.currentPassword.length >= PASSWORD_VALIDATION.currentPassword.minLength &&
      data.currentPassword.length <= PASSWORD_VALIDATION.currentPassword.maxLength
    ))
  );
}

/**
 * Create session user from full user data
 */
export function createSessionUser(user: any): SessionUser {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
    role: user.role,
    position: user.position || '',
    is_active: user.is_active,

    // Work-related session data
    work_shift: user.work_shift,
    team: user.team,
    linevi: user.linevi
  };
}