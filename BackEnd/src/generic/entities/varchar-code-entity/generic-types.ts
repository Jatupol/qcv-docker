// server/src/generic/entities/varchar-code-entity/generic-types.ts
// 🛠️ ENHANCED: Generic VARCHAR CODE Types with New Method Interfaces
// Complete Separation Entity Architecture - Sampling Inspection Control System

import { Request } from 'express';
import type { SessionUser } from '../../../entities/user/types';

// ==================== BASE ENTITY INTERFACES ====================

/**
 * Base interface for all VARCHAR CODE entities
 * 
 * Essential fields that all VARCHAR CODE entities must have.
 * Excludes description field as most entities don't have it.
 */
export interface BaseVarcharCodeEntity {
  code: string;                           // VARCHAR(n) PRIMARY KEY
  name: string;                          // Entity display name
  is_active: boolean;                    // Active status flag
  created_by: number;                    // User ID who created
  updated_by: number;                    // User ID who last updated
  created_at: Date;                      // Creation timestamp
  updated_at: Date;                      // Last update timestamp
}

// ==================== DATA TRANSFER OBJECTS ====================

/**
 * Data for creating new VARCHAR CODE entities
 */
export interface CreateVarcharCodeData {
  code: string;
  name: string;
  is_active?: boolean;                   // Optional, defaults to true
}

/**
 * Data for updating existing VARCHAR CODE entities
 */
export interface UpdateVarcharCodeData {
  name?: string;                         // Optional field updates
  is_active?: boolean;
}

// ==================== QUERY & PAGINATION ====================

/**
 * Query options for VARCHAR CODE entities
 * 
 * Supports pagination, sorting, filtering, and search.
 */
export interface VarcharCodeQueryOptions {
  // Pagination
  page?: number;                         // Page number (1-based)
  limit?: number;                        // Items per page
  
  // Sorting
  sortBy?: string;                       // Field to sort by
  sortOrder?: 'ASC' | 'DESC';           // Sort direction
  
  // Filtering
  search?: string;                       // General search term
  isActive?: boolean;                    // Filter by active status
  
  // Advanced filtering (optional)
  createdAfter?: Date;                  // Filter by creation date
  createdBefore?: Date;
  updatedAfter?: Date;                  // Filter by update date
  updatedBefore?: Date;
}

/**
 * Pagination metadata
 */
export interface PaginationInfo {
  page: number;                         // Current page
  limit: number;                        // Items per page
  total: number;                        // Total items
  totalPages: number;                   // Total pages
}

/**
 * Paginated response for VARCHAR CODE entities
 */
export interface VarcharCodePaginatedResponse<T> {
  data: T[];                           // Entity array
  pagination: PaginationInfo;          // Pagination info
}

// ==================== API RESPONSE FORMATS ====================

/**
 * Standard API response format
 */
export interface VarcharCodeApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Enhanced Request Interface
 * 
 * Express Request with user context for audit trails.
 * Uses existing SessionUser type for compatibility.
 */
export interface VarcharCodeEntityRequest<
  TParams = any,
  TBody = any,
  TQuery = VarcharCodeQueryOptions
> extends Request<TParams, any, TBody, TQuery> {
  user?: SessionUser;
}

// ==================== VALIDATION ====================

/**
 * Simplified Validation Result
 * 
 * Basic validation result structure.
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Service Result Interface
 * 
 * Simplified return format for service operations.
 */
export interface VarcharCodeServiceResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// ==================== ENTITY CONFIGURATION ====================

/**
 * Entity Configuration - configurable searchable fields
 * 
 * Essential configuration for VARCHAR CODE entities.
 * Allows entities to define their own searchable fields.
 */
export interface VarcharCodeEntityConfig {
  entityName: string;
  tableName: string;
  apiPath: string;
  codeLength: number;              // Maximum length for code field
  searchableFields: string[];      
  defaultLimit: number;
  maxLimit: number;
}

// ==================== NEW ENHANCED METHOD TYPES ====================

/**
 * Health Check Result Interface
 */
export interface VarcharCodeHealthResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    database: boolean;
    table: boolean;
    records: boolean;
  };
  metrics: {
    total: number;
    active: number;
    inactive: number;
    lastUpdated: Date | null;
  };
  timestamp: Date;
}

/**
 * Statistics Result Interface
 */
export interface VarcharCodeStatisticsResult {
  overview: {
    total: number;
    active: number;
    inactive: number;
  };
}

// ==================== GENERIC INTERFACES ====================

/**
 * 🛠️ ENHANCED: Generic Model Interface for VARCHAR CODE Entities
 * 
 * Enhanced interface with new methods for health, statistics, and advanced search.
 */
export interface IVarcharCodeModel<T extends BaseVarcharCodeEntity> {
  // ==================== EXISTING CRUD METHODS ==================== 
  create(data: CreateVarcharCodeData, userId: number): Promise<T>;
  update(code: string, data: UpdateVarcharCodeData, userId: number): Promise<T>;
  delete(code: string): Promise<boolean>;
  getAll(options?: VarcharCodeQueryOptions): Promise<VarcharCodePaginatedResponse<T>>;
  getByCode(code: string): Promise<T | null>;
  getByName(name: string, options?: VarcharCodeQueryOptions): Promise<VarcharCodePaginatedResponse<T>>;
  filterStatus(status: boolean, options?: VarcharCodeQueryOptions): Promise<VarcharCodePaginatedResponse<T>>;
  search(pattern: string, options?: VarcharCodeQueryOptions): Promise<VarcharCodePaginatedResponse<T>>;  
  changeStatus(code: string, userId: number): Promise<boolean>;
  count(options?: VarcharCodeQueryOptions): Promise<number>;
  exists(code: string): Promise<boolean>;
  statistics(): Promise<VarcharCodeStatisticsResult>;
  health(): Promise<VarcharCodeHealthResult>;
}

/**
 * 🛠️ ENHANCED: Generic Service Interface for VARCHAR CODE Entities
 * 
 * Enhanced interface with service-level methods for the new functionality.
 */
export interface IVarcharCodeService<T extends BaseVarcharCodeEntity> {
  // ==================== EXISTING SERVICE METHODS ====================  
  create(data: CreateVarcharCodeData, userId: number): Promise<VarcharCodeServiceResult<T>>;
  update(code: string, data: UpdateVarcharCodeData, userId: number): Promise<VarcharCodeServiceResult<T>>;
  delete(code: string): Promise<VarcharCodeServiceResult<boolean>>;
  getAll(options: VarcharCodeQueryOptions): Promise<VarcharCodeServiceResult<VarcharCodePaginatedResponse<T>>>;
  getByCode(code: string): Promise<VarcharCodeServiceResult<T>>;
  getByName(name: string, options: VarcharCodeQueryOptions): Promise<VarcharCodeServiceResult<VarcharCodePaginatedResponse<T>>>;
  filterStatus(status: boolean, options: VarcharCodeQueryOptions): Promise<VarcharCodeServiceResult<VarcharCodePaginatedResponse<T>>>;
  search(pattern: string, options: VarcharCodeQueryOptions): Promise<VarcharCodeServiceResult<VarcharCodePaginatedResponse<T>>>;  
  changeStatus(code: string, userId: number): Promise<VarcharCodeServiceResult<boolean>>;
  validate(data: any, operation: 'create' | 'update'): ValidationResult;
  getStatistics(): Promise<VarcharCodeServiceResult<VarcharCodeStatisticsResult>>;
  getHealth(): Promise<VarcharCodeServiceResult<VarcharCodeHealthResult>>;
}
/**
 * 🛠️ ENHANCED: Generic Controller Interface for VARCHAR CODE Entities
 * 
 * Enhanced interface with controller methods for the new endpoints.
 */
export interface IVarcharCodeController {
  // ==================== EXISTING CONTROLLER METHODS ====================
  create(req: any, res: any, next: any): Promise<void>;
  update(req: any, res: any, next: any): Promise<void>;
  delete(req: any, res: any, next: any): Promise<void>;
  getAll(req: any, res: any, next: any): Promise<void>;
  getByCode(req: any, res: any, next: any): Promise<void>;
  getByName(req: any, res: any, next: any): Promise<void>;  
  filterStatus(req: any, res: any, next: any): Promise<void>;
  search(req: any, res: any, next: any): Promise<void>;
  changeStatus(req: any, res: any, next: any): Promise<void>;  
  getStatistics(req: any, res: any, next: any): Promise<void>;
  getHealth(req: any, res: any, next: any): Promise<void>;  
}

// ==================== DEFAULT CONFIGURATIONS ====================

/**
 * Default Entity Configuration
 * 
 * Standard configuration values for VARCHAR CODE entities.
 */
export const DEFAULT_VARCHAR_CODE_CONFIG: Partial<VarcharCodeEntityConfig> = {
  searchableFields: ['code', 'name'],
  defaultLimit: 20,
  maxLimit: 100
};

/**
 * Default Query Options
 * 
 * Standard defaults for query operations.
 */
export const DEFAULT_QUERY_OPTIONS: VarcharCodeQueryOptions = {
  page: 1,
  limit: 20,
  sortBy: 'code',
  sortOrder: 'ASC',
  isActive: true
};

// ==================== UTILITY TYPES ====================

/**
 * Entity Type for Factory Pattern
 * 
 * VARCHAR CODE entities in the system.
 */
export type VarcharCodeEntityType = 'customer';

/**
 * Sort Direction Type
 */
export type SortDirection = 'ASC' | 'DESC';

/**
 * Health Status Type
 */
export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

/**
 * Operation Type for Validation
 */
export type ValidationOperation = 'create' | 'update';
 