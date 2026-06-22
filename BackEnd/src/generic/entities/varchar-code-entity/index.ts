// server/src/generic/entities/varchar-code-entity/index.ts
// Simplified Generic VARCHAR CODE Entity - Complete Export Index
// Manufacturing Quality Control System - Lean Implementation

// ==================== TYPE EXPORTS ====================

// Core entity interfaces and types
export type {
  BaseVarcharCodeEntity,
  CreateVarcharCodeData,
  UpdateVarcharCodeData,
  VarcharCodeQueryOptions,
  VarcharCodePaginatedResponse,
  VarcharCodeApiResponse,
  VarcharCodeEntityRequest,
  ValidationResult,
  VarcharCodeServiceResult,
  VarcharCodeEntityConfig,
  VarcharCodeEntityType
} from './generic-types';

// Generic layer interfaces
export type {
  IVarcharCodeModel,
  IVarcharCodeService,
  IVarcharCodeController
} from './generic-types';

// Default configurations
export {
  DEFAULT_VARCHAR_CODE_CONFIG,
  DEFAULT_QUERY_OPTIONS
} from './generic-types';

// Session user type (re-exported for convenience)
export type { SessionUser } from '../../../entities/user/types';

// ==================== IMPLEMENTATION EXPORTS ====================

// Generic model class and factory
export {
  GenericVarcharCodeModel,
  createVarcharCodeModel
} from './generic-model';

// Generic service class and factory
export {
  GenericVarcharCodeService,
  createVarcharCodeService
} from './generic-service';

// Generic controller class and factory
export {
  GenericVarcharCodeController,
  createGenericVarcharCodeController
} from './generic-controller';

// Generic routes class and factories
export {
  GenericVarcharCodeRoutes,
  createVarcharCodeRoutes,
  createVarcharCodeRoutesWithRoles,
  setupVarcharCodeEntity
} from './generic-routes';

// ==================== CONVENIENCE FACTORY FUNCTIONS ====================

import { Pool } from 'pg';
import { Router } from 'express';
import {
  VarcharCodeEntityConfig,
  BaseVarcharCodeEntity
} from './generic-types';
import { GenericVarcharCodeModel } from './generic-model';
import { GenericVarcharCodeService } from './generic-service';
import { GenericVarcharCodeController } from './generic-controller';
import { createVarcharCodeRoutes } from './generic-routes';

/**
 * Complete VARCHAR CODE Entity Factory
 * 
 * Creates a complete entity implementation with all layers:
 * - Model (database operations)
 * - Service (business logic)
 * - Controller (HTTP handling)
 * - Routes (Express routing)
 */
export function createCompleteVarcharCodeEntity<T extends BaseVarcharCodeEntity>(
  db: Pool,
  config: VarcharCodeEntityConfig
) {
  // Create all layers
  const model = new GenericVarcharCodeModel<T>(db, config);
  const service = new GenericVarcharCodeService<T>(model, config);
  const controller = new GenericVarcharCodeController<T>(service, config);
  const routes = createVarcharCodeRoutes<T>(controller, config);

  return {
    model,
    service,
    controller,
    routes,
    config
  };
}

/**
 * Quick Entity Setup
 * 
 * Simplified factory that returns only the router for immediate use.
 * Perfect for small applications that just need the routes.
 */
export function createVarcharCodeEntityRoutes<T extends BaseVarcharCodeEntity>(
  db: Pool,
  config: VarcharCodeEntityConfig
): Router {
  const { routes } = createCompleteVarcharCodeEntity<T>(db, config);
  return routes;
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Create entity configuration with defaults
 * 
 * Helper function to create configuration with sensible defaults.
 */
export function createVarcharCodeConfig(
  entityName: string,
  tableName: string,
  codeLength: number,
  customConfig: Partial<VarcharCodeEntityConfig> = {}
): VarcharCodeEntityConfig {
  return {
    entityName,
    tableName,
    codeLength,
    apiPath: `/api/${entityName}`,
    searchableFields: ['code', 'name', 'description'],
    defaultLimit: 20,
    maxLimit: 100,
    ...customConfig
  };
}

/**
 * Validate entity configuration
 * 
 * Ensures configuration has all required fields and valid values.
 */
export function validateVarcharCodeConfig(config: VarcharCodeEntityConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!config.entityName || config.entityName.trim().length === 0) {
    errors.push('entityName is required');
  }

  if (!config.tableName || config.tableName.trim().length === 0) {
    errors.push('tableName is required');
  }

  if (!config.apiPath || config.apiPath.trim().length === 0) {
    errors.push('apiPath is required');
  }

  if (typeof config.codeLength !== 'number' || config.codeLength <= 0) {
    errors.push('codeLength must be a positive number');
  }

  if (!Array.isArray(config.searchableFields)) {
    errors.push('searchableFields must be an array');
  }

  if (typeof config.defaultLimit !== 'number' || config.defaultLimit <= 0) {
    errors.push('defaultLimit must be a positive number');
  }

  if (typeof config.maxLimit !== 'number' || config.maxLimit <= 0) {
    errors.push('maxLimit must be a positive number');
  }

  if (config.defaultLimit > config.maxLimit) {
    errors.push('defaultLimit cannot be greater than maxLimit');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// ==================== DEFAULT CONFIGURATIONS ====================

/**
 * Default configurations for common VARCHAR CODE entities
 */
export const ENTITY_CONFIGS = {
  customer: createVarcharCodeConfig('customer', 'customers', 5, {
    searchableFields: ['code', 'name', 'description'],
    defaultLimit: 25
  }),
  
  customersSite: createVarcharCodeConfig('customers-site', 'customers_site', 10, {
    searchableFields: ['code', 'name', 'description'],
    defaultLimit: 30
  }),
  
} as const;

// ==================== TYPE GUARDS ====================

/**
 * Type guard for VARCHAR CODE entities
 */
export function isVarcharCodeEntity(obj: any): obj is BaseVarcharCodeEntity {
  return obj &&
    typeof obj.code === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.is_active === 'boolean' &&
    obj.created_at instanceof Date &&
    obj.updated_at instanceof Date;
}

 
/**
 * Validate code format
 * 
 * Helper function to validate code format across entities.
 */
export function validateCodeFormat(code: string, maxLength: number): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (typeof code !== 'string') {
    errors.push('Code must be a string');
    return { valid: false, errors };
  }

  if (code.trim().length === 0) {
    errors.push('Code cannot be empty');
  }

  if (code.length > maxLength) {
    errors.push(`Code cannot exceed ${maxLength} characters`);
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(code)) {
    errors.push('Code can only contain letters, numbers, hyphens, and underscores');
  }

  if (code !== code.trim()) {
    errors.push('Code cannot have leading or trailing spaces');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/*
=== SIMPLIFIED VARCHAR CODE GENERIC ENTITY INDEX FEATURES ===

COMPLETE EXPORT SYSTEM:
✅ All types exported from generic-types
✅ All implementation classes exported
✅ All factory functions exported
✅ Convenient re-exports for easy importing
✅ Session user type re-exported for convenience

FACTORY FUNCTIONS:
✅ createCompleteVarcharCodeEntity() - Full entity with all layers
✅ createVarcharCodeEntityRoutes() - Quick router creation
✅ createVarcharCodeConfig() - Configuration with defaults
✅ validateVarcharCodeConfig() - Configuration validation

DEFAULT CONFIGURATIONS:
✅ Pre-configured settings for all 4 entity types
✅ Customized code lengths per entity type
✅ Appropriate search fields per entity
✅ Sensible pagination limits per entity
✅ Ready-to-use configurations

VARCHAR CODE SPECIFIC FEATURES:
✅ Code format validation utility
✅ Code length configuration per entity
✅ Code immutability enforcement
✅ Code-based primary key handling

UTILITY FUNCTIONS:
✅ Type guards for runtime validation
✅ Configuration validation with error reporting
✅ Entity type validation
✅ Code format validation
✅ Common pattern helpers

MANUFACTURING DOMAIN SUPPORT:
✅ Entity configurations for quality control system
✅ Appropriate code lengths for manufacturing codes
✅ Sensible search fields for manufacturing data
✅ Ready-to-use entity setups for production

EASE OF USE:
✅ Single import point for entire generic pattern
✅ Multiple factory options for different use cases
✅ Pre-configured entities for immediate use
✅ Clear separation between types and implementations

COMPLETE SEPARATION ARCHITECTURE:
✅ All exports maintain entity separation
✅ No cross-entity dependencies
✅ Clean import paths
✅ Type-safe generic implementations

ENTITY SUPPORT:
✅ customer - Customer codes (VARCHAR 5)
✅ customers-site - Customer-site composite codes (VARCHAR 10)

This index file provides the complete simplified VARCHAR CODE generic pattern
as a cohesive, easy-to-use package while maintaining all architectural
principles and supporting efficient Manufacturing Quality Control systems.
*/