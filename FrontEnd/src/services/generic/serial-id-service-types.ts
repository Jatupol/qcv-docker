// client/src/services/generic/serial-id-service-types.ts

/**
 * Generic Serial ID Service Types
 * 
 * Shared types and interfaces for all SERIAL ID entities:
 * - users, defects, defect_types, models, product_families, sampling_reasons
 * 
 * This eliminates duplicate type definitions while maintaining complete separation
 */

// ==================== BASE ENTITY INTERFACE ====================

export interface BaseSerialIdEntity {
  id: number;                     // SERIAL PRIMARY KEY
  name: string;                   // VARCHAR(100) UNIQUE NOT NULL
  description?: string;           // TEXT
  is_active: boolean;             // BOOLEAN DEFAULT true
  created_by: number;             // INT DEFAULT 0
  updated_by: number;             // INT DEFAULT 0
  created_at: Date;              // ISO timestamp string
  updated_at: Date;              // ISO timestamp string
}

// ==================== REQUEST/RESPONSE TYPES ====================

export interface CreateSerialIdRequest {
  name: string;
  description?: string;
  is_active?: boolean;
  created_by?: number;
  updated_by?: number;
}

export interface UpdateSerialIdRequest {
  name?: string;
  description?: string;
  is_active?: boolean;
  updated_by?: number;
}

export interface SerialIdFormData {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateSerialIdFormData {
  name: string;
  description?: string;
  is_active?: boolean;
}

// ==================== QUERY PARAMETERS ====================

export interface SerialIdQueryParams<T extends BaseSerialIdEntity = BaseSerialIdEntity> {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: keyof T;
  sortOrder?: 'asc' | 'desc';
  isActive?: boolean;
}

// ==================== API RESPONSE INTERFACE ====================

export interface SerialIdResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ==================== STATS INTERFACE ====================

export interface BaseSerialIdStats {
  total: number;
  active: number;
  inactive: number;
  recent: number;
}

// ==================== VALIDATION INTERFACE ====================

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

// ==================== DROPDOWN OPTION INTERFACE ====================

export interface DropdownOption {
  value: number;
  label: string;
}