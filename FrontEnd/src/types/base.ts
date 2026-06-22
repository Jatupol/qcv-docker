// client/src/types/base.ts
// Centralized Types - Single Source of Truth
// All entity types and shared interfaces in one place

// ============ SHARED/COMMON TYPES ============

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: string[];
}

export interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface BaseQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  createdAfter?: string;
  createdBefore?: string;
}

export interface BaseEntity {
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  created_by?: number;
  updated_by?: number;
}
