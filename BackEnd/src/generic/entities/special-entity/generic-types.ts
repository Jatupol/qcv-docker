// server/src/generic/entities/special-entity/generic-types.ts
// Updated Generic SPECIAL Entity Types - Complete Separation Entity Architecture
// Sampling Inspection Control System - Enhanced with Health & Statistics

/**
 * Base interface for all SPECIAL entities
 * Provides common audit and lifecycle fields
 */
export interface BaseSpecialEntity {
  // Audit fields (standard across all entities)
  is_active?: boolean;
  created_by: number;
  updated_by: number;
  created_at: Date;
  updated_at: Date;
  
  // Additional fields will be specific to each entity
  [key: string]: any;
}

/**
 * Primary key configuration for flexible key patterns
 */
export interface PrimaryKeyConfig {
  fields: string[];           // Field names that make up the primary key
  routes?: string[];          // Route parameter patterns (e.g., [':serial'] or [':customerCode', ':siteCode'])
  routePattern: string;       // Route pattern for URL building
}

/**
 * Entity configuration for SPECIAL entities
 */
export interface SpecialEntityConfig {
  entityName: string;         // Display name for the entity
  tableName: string;          // Database table name
  primaryKey: PrimaryKeyConfig;  // Primary key configuration
  searchableFields: string[]; // Fields that can be searched
  requiredFields: string[];   // Fields required for validation
  defaultLimit: number;       // Default pagination limit
  maxLimit: number;           // Maximum pagination limit
  apiPath: string;            // API base path for the entity
}

/**
 * Health Check Result Interface
 */
export interface EntityHealthResult {
  entityName: string;
  tableName: string;
  status: 'healthy' | 'warning' | 'critical';
  checks: {
    tableExists: boolean;
    hasData: boolean;
    hasActiveRecords: boolean;
    recentActivity: boolean;
    indexHealth: boolean;
  };
  statistics: {
    total: number;
    active: number;
    inactive: number;
  };
  issues: string[];
  lastChecked: Date;
  responseTime: number; // milliseconds
}

/**
 * Entity Statistics Result Interface
 */
export interface EntityStatisticsResult {
  entityName: string;
  tableName: string;
  overview: {
    total: number;
    active: number;
    inactive: number;
  } 
}

/**
 * Data transfer objects for CRUD operations
 */
export interface CreateSpecialData {
  [key: string]: any;
}

export interface UpdateSpecialData {
  [key: string]: any;
}

/**
 * Query options for finding entities
 */
export interface SpecialQueryOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  isActive?: boolean;
  filters?: Record<string, any>;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Paginated response wrapper
 */
export interface SpecialPaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

/**
 * Service result wrapper with error handling
 */
export interface SpecialServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Generic model interface for SPECIAL entities
 * All SPECIAL entity models must implement these methods
 */
export interface ISpecialModel<T extends BaseSpecialEntity> {
  count(filters?: Record<string, any>): Promise<number>;
  health(): Promise<EntityHealthResult>;
  statistics(): Promise<EntityStatisticsResult>;
}

/**
 * Generic service interface for SPECIAL entities
 * All SPECIAL entity services must implement these methods
 */
export interface ISpecialService<T extends BaseSpecialEntity> {
  checkHealth(userId: number): Promise<SpecialServiceResult<EntityHealthResult>>;
  getStatistics(userId: number): Promise<SpecialServiceResult<EntityStatisticsResult>>;
}

/**
 * Generic controller interface for SPECIAL entities
 */
export interface ISpecialController {
  getHealth: (req: any, res: any, next: any) => Promise<void>;
  getStatistics: (req: any, res: any, next: any) => Promise<void>;

}

/**
 * Route parameter extraction function type
 */
export type RouteParameterExtractor = (req: any) => Record<string, any>;

/**
 * Entity factory configuration
 */
export interface EntityFactoryConfig {
  entityType: string;
  pattern: 'serial-id' | 'varchar-code' | 'special';
  config: SpecialEntityConfig;
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Build WHERE clause for primary key lookup
 * Supports both single and composite primary keys
 */
export function buildPrimaryKeyWhereClause(
  keyValues: Record<string, any>, 
  primaryKey: PrimaryKeyConfig
): { clause: string; params: any[] } {
  const conditions: string[] = [];
  const params: any[] = [];

  primaryKey.fields.forEach((field, index) => {
    if (keyValues[field] !== undefined && keyValues[field] !== null) {
      conditions.push(`${field} = ${index + 1}`);
      params.push(keyValues[field]);
    } else {
      throw new Error(`Missing required primary key field: ${field}`);
    }
  });

  return {
    clause: conditions.join(' AND '),
    params
  };
}


/**
 * Validate entity data against configuration
 */
export function validateEntityData(
  data: any, 
  config: SpecialEntityConfig, 
  operation: 'create' | 'update'
): ValidationResult {
  const errors: string[] = [];

  // Check required fields for create operations
  if (operation === 'create') {
    config.requiredFields.forEach(field => {
      if (!data[field] || (typeof data[field] === 'string' && data[field].trim().length === 0)) {
        errors.push(`Field '${field}' is required`);
      }
    });
  }

  // Validate primary key fields
  config.primaryKey.fields.forEach(field => {
    if (data[field] !== undefined) {
      if (typeof data[field] === 'string' && data[field].length > 255) {
        errors.push(`Field '${field}' cannot exceed 255 characters`);
      }
    }
  });

  // Basic data type validation
  Object.keys(data).forEach(key => {
    const value = data[key];
    
    if (key === 'is_active' && typeof value !== 'boolean') {
      errors.push(`Field '${key}' must be a boolean`);
    }
    
    if (typeof value === 'string' && value.length > 500) {
      errors.push(`Field '${key}' is too long (max 500 characters)`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Sanitize search string for SQL LIKE operations
 */
export function sanitizeSearchString(search: string): string {
    return search.replace(/[%_\\]/g, '\\$&');
}

/**
 * Build sort clause with validation
 */
export function buildSortClause(
  sortBy: string = 'created_at', 
  sortOrder: 'ASC' | 'DESC' = 'DESC',
  allowedFields: string[] = []
): string {
  // Validate sort field (prevent SQL injection)
  const safeSortBy = allowedFields.length > 0 && !allowedFields.includes(sortBy) 
    ? 'created_at' 
    : sortBy;
  
  const safeSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) 
    ? sortOrder.toUpperCase() 
    : 'DESC';

  return `${safeSortBy} ${safeSortOrder}`;
}

/**
 * Calculate pagination metadata
 */
export function calculatePagination(
  totalCount: number, 
  page: number, 
  limit: number
): PaginationMeta {
  const totalPages = Math.ceil(totalCount / limit);
  
  return {
    currentPage: page,
    totalPages,
    totalCount,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1
  };
}

/**
 * Format entity response with metadata
 */
export function formatEntityResponse<T>(
  data: T[], 
  totalCount: number, 
  page: number, 
  limit: number
): SpecialPaginatedResponse<T> {
  return {
    data,
    pagination: calculatePagination(totalCount, page, limit)
  };
}

/**
 * Create success service result
 */
export function createSuccessResult<T>(data: T): SpecialServiceResult<T> {
  return {
    success: true,
    data
  };
}

/**
 * Create error service result
 */
export function createErrorResult<T>(error: string): SpecialServiceResult<T> {
  return {
    success: false,
    error
  };
}

// ==================== ENTITY CONFIGURATION TEMPLATES ====================

/**
 * Template for single VARCHAR primary key entities
 */
export function createVarcharSpecialConfig(
  entityName: string,
  tableName: string,
  primaryKeyField: string = 'code',
  routeParam: string = 'code'
): SpecialEntityConfig {
  return {
    entityName,
    tableName,
    primaryKey: {
      fields: [primaryKeyField],
      routes: [`:${routeParam}`],
      routePattern: `/:${routeParam}`
    },
    apiPath: `/${entityName}`,
    searchableFields: [primaryKeyField, 'name'],
    requiredFields: [primaryKeyField],
    defaultLimit: 50,
    maxLimit: 500
  };
}

/**
 * Template for composite primary key entities
 */
export function createCompositeSpecialConfig(
  entityName: string,
  tableName: string,
  primaryKeyFields: string[],
  routeParams: string[]
): SpecialEntityConfig {
  return {
    entityName,
    tableName,
    primaryKey: {
      fields: primaryKeyFields,
      routes: routeParams.map(param => `:${param}`),
      routePattern: '/' + routeParams.map(param => `:${param}`).join('/')
    },
    apiPath: `/${entityName}`,
    searchableFields: [...primaryKeyFields],
    requiredFields: [...primaryKeyFields],
    defaultLimit: 50,
    maxLimit: 500
  };
}

/**
 * Template for interface table entities (read-only)
 */
export function createInterfaceSpecialConfig(
  entityName: string,
  tableName: string,
  primaryKeyField: string = 'id',
  searchableFields: string[] = []
): SpecialEntityConfig {
  return {
    entityName,
    tableName,
    primaryKey: {
      fields: [primaryKeyField],
      routes: [`:${primaryKeyField}`],
      routePattern: `/:${primaryKeyField}`
    },
    apiPath: `/${entityName}`,
    searchableFields: [primaryKeyField, ...searchableFields],
    requiredFields: [], // Interface tables are read-only
    defaultLimit: 100,
    maxLimit: 1000
  };
}

// ==================== ERROR HANDLING ====================

/**
 * Standard error messages for SPECIAL entities
 */
export const SPECIAL_ERROR_MESSAGES = {
  ENTITY_NOT_FOUND: (entityName: string) => `${entityName} not found`,
  INVALID_PRIMARY_KEY: (fields: string[]) => `Invalid primary key: ${fields.join(', ')} required`,
  VALIDATION_FAILED: (errors: string[]) => `Validation failed: ${errors.join(', ')}`,
  DATABASE_ERROR: (entityName: string, operation: string) => `Database error during ${operation} for ${entityName}`,
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Insufficient permissions',
  INTERNAL_ERROR: 'Internal server error'
};

/**
 * HTTP status codes for different error types
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
} as const;

// ==================== ADDITIONAL TYPE EXPORTS ====================

/**
 * API Response wrapper for SPECIAL entities
 */
export interface SpecialApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
  pagination?: PaginationMeta;
}

/**
 * Request interface for SPECIAL entity operations
 */
export interface SpecialEntityRequest<
  TParams = any,
  TBody = any,
  TQuery = any
> {
  params: TParams;
  query: TQuery;
  body: TBody;
  user: {
    id: number;
    role: string;
  };
}

/**
 * Entity type enumeration
 */
export type SpecialEntityType = 'checkininf' | 'infLotinput' | 'inspectiondata' | 'parts';

/**
 * Primary key value type
 */
export type SpecialPrimaryKey = string | number | Record<string, string | number>;

/**
 * Route pattern type
 */
export type SpecialRoutePattern = string;

// ==================== DEFAULT CONFIGURATIONS ====================

/**
 * Default configuration template
 */
export const DEFAULT_SPECIAL_CONFIG: Partial<SpecialEntityConfig> = {
  searchableFields: ['name'],
  requiredFields: [],
  defaultLimit: 50,
  maxLimit: 500
};

/**
 * Default query options
 */
export const DEFAULT_QUERY_OPTIONS: SpecialQueryOptions = {
  page: 1,
  limit: 50,
  sortBy: 'created_at',
  sortOrder: 'DESC'
};

/**
 * Entity primary key configurations
 */
export const ENTITY_PRIMARY_KEY_CONFIGS: Record<SpecialEntityType, PrimaryKeyConfig> = {
  'checkininf': {
    fields: ['checkin_id', 'checkout_id'],
    routes: [':checkinId', ':checkoutId'],
    routePattern: '/:checkinId/:checkoutId'
  },
  'infLotinput': {
    fields: ['inf_id', 'lot_input_id'],
    routes: [':infId', ':lotInputId'],
    routePattern: '/:infId/:lotInputId'
  },
  'inspectiondata': {
    fields: ['inspection_id'],
    routes: [':inspectionId'],
    routePattern: '/:inspectionId'
  },
  'parts': {
    fields: ['partno'],
    routes: [':partno'],
    routePattern: '/:partno'
  }
};


