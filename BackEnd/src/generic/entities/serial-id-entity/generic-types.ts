// server/src/generic/entities/serial-id-entity/generic-types.ts
// Updated Generic Serial ID Types - Complete Separation Entity Architecture
// Sampling Inspection Control System - Enhanced with Health, Statistics, and Search Methods

import { Request } from 'express';
import type { SessionUser } from '../../../entities/user/types';

// ==================== BASE ENTITY INTERFACE ====================

/**
 * Base Serial ID Entity Interface
 * 
 * Common structure for all SERIAL ID entities:
 */
export interface BaseSerialIdEntity {
  id: number;                     // SERIAL PRIMARY KEY
  name: string;                   // VARCHAR(100) UNIQUE NOT NULL
  description?: string;           // TEXT
  is_active: boolean;             // BOOLEAN DEFAULT true
  created_by: number;             // INT DEFAULT 0
  updated_by: number;             // INT DEFAULT 0
  created_at: Date;              // TIMESTAMP WITH TIME ZONE
  updated_at: Date;              // TIMESTAMP WITH TIME ZONE
}

// ==================== CRUD DATA INTERFACES ====================

/**
 * Data for creating new Serial ID entities
 */
export interface CreateSerialIdData {
  name: string;
  description?: string;
  is_active?: boolean;
}

/**
 * Data for updating existing Serial ID entities
 */
export interface UpdateSerialIdData {
  name?: string;
  description?: string;
  is_active?: boolean;
}

// ==================== QUERY INTERFACES ====================

/**
 * Enhanced Query Options for Serial ID Entities
 * Includes new search and filter capabilities
 */
export interface SerialIdQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  isActive?: boolean;
  // New search options
  name?: string;           // For searchByName
  pattern?: string;        // For searchPattern
  status?: boolean;        // For filterByStatus
}

/**
 * Enhanced Paginated Response Interface
 */
export interface SerialIdPaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * API Response Interface
 */
export interface SerialIdApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// ==================== NEW INTERFACES FOR ENHANCED METHODS ====================

/**
 * Health Check Response Interface
 */
export interface SerialIdHealthResponse {
  status: 'healthy' | 'warning' | 'unhealthy';
  entity: string;
  timestamp: Date;
  checks: {
    database: 'connected' | 'disconnected';
    records: {
      total: number;
      active: number;
      inactive: number;
    };
    lastUpdated?: Date;
  };
  issues?: string[];
}

/**
 * Statistics Response Interface
 */
export interface SerialIdStatistics {
  entity: string;
  timestamp: Date;
  totals: {
    all: number;
    active: number;
    inactive: number;
  };
}

/**
 * Search Result Interface for name/pattern searches
 */
export interface SerialIdSearchResult<T> extends SerialIdPaginatedResponse<T> {
  searchInfo: {
    query: string;
    searchType: 'name' | 'pattern' | 'status';
    resultCount: number;
  };
}

// ==================== EXPRESS REQUEST INTERFACE ====================

/**
 * Extended Express Request Interface
 * Uses existing SessionUser type for compatibility.
 */
export interface SerialIdEntityRequest<
  TParams = any,
  TBody = any,
  TQuery = SerialIdQueryOptions
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
export interface SerialIdServiceResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// ==================== ENTITY CONFIGURATION ====================

/**
 * Simplified Entity Configuration
 * 
 * Essential configuration for Serial ID entities.
 */
export interface SerialIdEntityConfig {
  entityName: string;
  tableName: string;
  apiPath: string;
  searchableFields: string[];
  defaultLimit: number;
  maxLimit: number;
}

// ==================== ENHANCED GENERIC INTERFACES ====================

/**
 * Enhanced Generic Model Interface for Serial ID Entities
 * 
 * Updated interface with new health, statistics, and search methods.
 */
export interface ISerialIdModel<T extends BaseSerialIdEntity> {
  // Existing CRUD methods

  create(data: CreateSerialIdData, userId: number): Promise<T>;
  update(id: number, data: UpdateSerialIdData, userId: number): Promise<T>;
  delete(id: number, actor?: any, req?: any): Promise<boolean>;
  changeStatus(id: number, userId: number): Promise<boolean>;
  count(options?: SerialIdQueryOptions): Promise<number>;
  getById(id: number): Promise<T | null>;
  getAll(options?: SerialIdQueryOptions): Promise<SerialIdPaginatedResponse<T>>; 
  getByName(name: string, options?: SerialIdQueryOptions): Promise<SerialIdSearchResult<T>>;
  filterStatus(status: boolean, options?: SerialIdQueryOptions): Promise<SerialIdSearchResult<T>>;
  search(pattern: string, options?: SerialIdQueryOptions): Promise<SerialIdSearchResult<T>>;
  health(): Promise<SerialIdHealthResponse>;
  statistics(): Promise<SerialIdStatistics>;
}

/**
 * Enhanced Generic Service Interface for Serial ID Entities
 * 
 * Updated interface with new health, statistics, and search methods.
 */
export interface ISerialIdService<T extends BaseSerialIdEntity> {
  // Existing CRUD methods

  create(data: CreateSerialIdData, userId: number): Promise<SerialIdServiceResult<T>>;
  update(id: number, data: UpdateSerialIdData, userId: number): Promise<SerialIdServiceResult<T>>;
  delete(id: number, actor?: any, req?: any): Promise<SerialIdServiceResult<boolean>>;
  changeStatus(id: number, userId: number): Promise<SerialIdServiceResult<boolean>>;
  validate(data: any, operation: 'create' | 'update'): ValidationResult;
  getById(id: number): Promise<SerialIdServiceResult<T>>;
  getAll(options: SerialIdQueryOptions): Promise<SerialIdServiceResult<SerialIdPaginatedResponse<T>>>; 
  getByName(name: string, options: SerialIdQueryOptions): Promise<SerialIdServiceResult<SerialIdSearchResult<T>>>;
  filterStatus(status: boolean, options: SerialIdQueryOptions): Promise<SerialIdServiceResult<SerialIdSearchResult<T>>>;
  search(pattern: string, options: SerialIdQueryOptions): Promise<SerialIdServiceResult<SerialIdSearchResult<T>>>; 
  health(): Promise<SerialIdServiceResult<SerialIdHealthResponse>>;
  statistics(): Promise<SerialIdServiceResult<SerialIdStatistics>>;

}

/**
 * Enhanced Generic Controller Interface for Serial ID Entities
 * 
 * Updated interface with new health, statistics, and search methods.
 */
export interface ISerialIdController {
  // Existing CRUD methods
  create(req: any, res: any, next: any): Promise<void>;
  getById(req: any, res: any, next: any): Promise<void>;
  update(req: any, res: any, next: any): Promise<void>;
  delete(req: any, res: any, next: any): Promise<void>;
  changeStatus(req: any, res: any, next: any): Promise<void>;
  getAll(req: any, res: any, next: any): Promise<void>;
  getByName(req: any, res: any, next: any): Promise<void>;
  filterStatus(req: any, res: any, next: any): Promise<void>;
  search(req: any, res: any, next: any): Promise<void>;
  health(req: any, res: any, next: any): Promise<void>;
  statistics(req: any, res: any, next: any): Promise<void>;

}

// ==================== DEFAULT CONFIGURATIONS ====================

/**
 * Default Entity Configuration
 * 
 * Standard configuration values for Serial ID entities.
 */
export const DEFAULT_SERIAL_ID_CONFIG: Partial<SerialIdEntityConfig> = {
  searchableFields: ['name', 'description'],
  defaultLimit: 20,
  maxLimit: 100
};

/**
 * Default Query Options
 * 
 * Standard defaults for query operations.
 */
export const DEFAULT_QUERY_OPTIONS: SerialIdQueryOptions = {
  page: 1,
  limit: 20,
  sortBy: 'name',
  sortOrder: 'ASC',
  isActive: true
};

// ==================== UTILITY TYPES ====================

/**
 * Entity Type for Factory Pattern
 * 
 * Only the actual Serial ID entities in your system.
 */
export type SerialIdEntityType = 'user' | 'defect' | 'sysconfig' | 'sampling-reason';

/**
 * Primary Key Type for Serial ID Entities
 */
export type SerialIdPrimaryKey = number;

/**
 * API Route Pattern for Serial ID Entities
 */
export type SerialIdRoutePattern = '/:id';

 