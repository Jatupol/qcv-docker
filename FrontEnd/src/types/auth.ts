// client/src/types/auth.ts
// Simple Authentication Types - Lean and Clean

import type {ApiResponse, PaginatedApiResponse, BaseQueryParams, BaseEntity } from './base.ts';

 

// ==================== CORE TYPES ====================

export type UserRole = 'admin' | 'manager' | 'user';

export interface AuthUser extends BaseEntity  {
  id: number;
  username: string;
  email: string;
  name: string;
  position?: string;
  role: UserRole;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// ==================== REQUEST TYPES ====================

export interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  name: string;
  position?: string;
  role?: UserRole;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// ==================== RESPONSE TYPES ====================

// Simple response types - backend returns user directly in data
export type LoginResponse = ApiResponse<AuthUser>;
export type RegisterResponse = ApiResponse<AuthUser>;
export type AuthStatusResponse = ApiResponse<{ authenticated: boolean; user?: AuthUser }>;

// ==================== STATE TYPES ====================

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  error: string | null;
}

export interface AuthContextInterface extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  clearError: () => void;
}