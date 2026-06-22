// server/src/generic/entities/serial-id-entity/index.ts
// Simplified Generic Serial ID Entity - Complete Export Index
// Sampling Inspection Control System - Lean Implementation

// ==================== TYPE EXPORTS ====================

// Core entity interfaces and types
export type {
  BaseSerialIdEntity,
  CreateSerialIdData,
  UpdateSerialIdData,
  SerialIdQueryOptions,
  SerialIdPaginatedResponse,
  SerialIdApiResponse,
  SerialIdEntityRequest,
  ValidationResult,
  SerialIdServiceResult,
  SerialIdEntityConfig,
  SerialIdEntityType,
  SerialIdPrimaryKey,
  SerialIdRoutePattern
} from './generic-types';

// Generic layer interfaces
export type {
  ISerialIdModel,
  ISerialIdService,
  ISerialIdController
} from './generic-types';

// Default configurations
export {
  DEFAULT_SERIAL_ID_CONFIG,
  DEFAULT_QUERY_OPTIONS
} from './generic-types';

// Session user type (re-exported for convenience)
export type { SessionUser } from '../../../entities/user/types';

// ==================== IMPLEMENTATION EXPORTS ====================

// Generic model class and factory
export {
  GenericSerialIdModel,
  createSerialIdModel
} from './generic-model';

// Generic service class and factory
export {
  GenericSerialIdService,
  createSerialIdService
} from './generic-service';

// Generic controller class and factory
export {
  GenericSerialIdController,
  createSerialIdController
} from './generic-controller';

// Generic routes class and factories
export {
  GenericSerialIdRoutes,
  createSerialIdRoutes,
  setupSerialIdEntity
} from './generic-routes';

// ==================== CONVENIENCE FACTORY FUNCTIONS ====================

import { Pool } from 'pg';
import { Router } from 'express';
import {
  SerialIdEntityConfig,
  BaseSerialIdEntity
} from './generic-types';
import { GenericSerialIdModel } from './generic-model';
import { GenericSerialIdService } from './generic-service';
import { GenericSerialIdController } from './generic-controller';
import { createSerialIdRoutes } from './generic-routes';

/**
 * Complete Serial ID Entity Factory
 * 
 * Creates a complete entity implementation with all layers:
 * - Model (database operations)
 * - Service (business logic)
 * - Controller (HTTP handling)
 * - Routes (Express routing)
 */
export function createCompleteSerialIdEntity<T extends BaseSerialIdEntity>(
  db: Pool,
  config: SerialIdEntityConfig
) {
  // Create all layers
  const model = new GenericSerialIdModel<T>(db, config);
  const service = new GenericSerialIdService<T>(model, config);
  const controller = new GenericSerialIdController<T>(service, config);
  const routes = createSerialIdRoutes<T>(controller, config);

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
export function createSerialIdEntityRoutes<T extends BaseSerialIdEntity>(
  db: Pool,
  config: SerialIdEntityConfig
): Router {
  const { routes } = createCompleteSerialIdEntity<T>(db, config);
  return routes;
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Create entity configuration with defaults
 * 
 * Helper function to create configuration with sensible defaults.
 */
export function createSerialIdConfig(
  entityName: string,
  tableName: string,
  customConfig: Partial<SerialIdEntityConfig> = {}
): SerialIdEntityConfig {
  return {
    entityName,
    tableName,
    apiPath: `/api/${entityName}`,
    searchableFields: ['name', 'description'],
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
export function validateSerialIdConfig(config: SerialIdEntityConfig): {
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
 * Default configurations for common entities
 */
export const ENTITY_CONFIGS = {
  user: createSerialIdConfig('user', 'users', {
    searchableFields: ['name', 'username', 'email'],
    defaultLimit: 25
  }),
  
  defect: createSerialIdConfig('defect', 'defects', {
    searchableFields: ['name', 'description'],
    defaultLimit: 30
  }),
  
  sysconfig: createSerialIdConfig('sysconfig', 'sysconfig', {
    searchableFields: ['name', 'description'],
    defaultLimit: 50
  }),
  
  samplingReason: createSerialIdConfig('sampling-reason', 'sampling_reasons', {
    searchableFields: ['name', 'description'],
    defaultLimit: 20
  })
} as const;

// ==================== TYPE GUARDS ====================

/**
 * Type guard for Serial ID entities
 */
export function isSerialIdEntity(obj: any): obj is BaseSerialIdEntity {
  return obj &&
    typeof obj.id === 'number' &&
    typeof obj.name === 'string' &&
    typeof obj.is_active === 'boolean' &&
    obj.created_at instanceof Date &&
    obj.updated_at instanceof Date;
}

 
/*
=== SIMPLIFIED SERIAL ID GENERIC ENTITY INDEX FEATURES ===

COMPLETE EXPORT SYSTEM:
✅ All types exported from generic-types
✅ All implementation classes exported
✅ All factory functions exported
✅ Convenient re-exports for easy importing
✅ Session user type re-exported for convenience

FACTORY FUNCTIONS:
✅ createCompleteSerialIdEntity() - Full entity with all layers
✅ createSerialIdEntityRoutes() - Quick router creation
✅ createSerialIdConfig() - Configuration with defaults
✅ validateSerialIdConfig() - Configuration validation

DEFAULT CONFIGURATIONS:
✅ Pre-configured settings for all 4 entity types
✅ Customized search fields per entity type
✅ Appropriate default limits per entity
✅ Ready-to-use configurations

UTILITY FUNCTIONS:
✅ Type guards for runtime validation
✅ Configuration validation with error reporting
✅ Entity type validation
✅ Common pattern helpers

MANUFACTURING DOMAIN SUPPORT:
✅ Entity configurations for quality control system
✅ Appropriate search fields for manufacturing data
✅ Sensible pagination limits for production use
✅ Ready-to-use entity setups

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

This index file provides the complete simplified Serial ID generic pattern
as a cohesive, easy-to-use package while maintaining all architectural
principles and supporting efficient Sampling Inspection Control systems.
*/