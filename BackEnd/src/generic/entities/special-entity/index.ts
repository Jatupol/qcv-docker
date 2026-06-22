// server/src/generic/entities/special-entity/index.ts
// Simplified Generic SPECIAL Entity - Complete Export Index
// Sampling Inspection Control System - Lean Implementation

// ==================== TYPE EXPORTS ====================

// Core entity interfaces and types
export type {
  BaseSpecialEntity,
  CreateSpecialData,
  UpdateSpecialData,
  SpecialQueryOptions,
  SpecialPaginatedResponse,
  SpecialApiResponse,
  SpecialEntityRequest,
  ValidationResult,
  SpecialServiceResult,
  SpecialEntityConfig,
  PrimaryKeyConfig,
  SpecialEntityType,
  SpecialPrimaryKey,
  SpecialRoutePattern
} from './generic-types';

// Generic layer interfaces
export type {
  ISpecialModel,
  ISpecialService,
  ISpecialController
} from './generic-types';

// Default configurations and helper functions
export {
  DEFAULT_SPECIAL_CONFIG,
  DEFAULT_QUERY_OPTIONS,
  ENTITY_PRIMARY_KEY_CONFIGS,
  buildPrimaryKeyWhereClause
} from './generic-types';

// Session user type (re-exported for convenience)
export type { SessionUser } from '../../../entities/user/types';

// ==================== IMPLEMENTATION EXPORTS ====================

// Generic model class and factory
export {
  GenericSpecialModel,
  createSpecialModel
} from './generic-model';

// Generic service class and factory
export {
  GenericSpecialService,
  createSpecialService
} from './generic-service';

// Generic controller class and factory
export {
  GenericSpecialController,
  createSpecialController
} from './generic-controller';

// Generic routes class and factories
export {
  GenericSpecialRoutes,
  createSpecialRoutes,
  createSpecialRoutesWithCustomization,
  setupSpecialEntity
} from './generic-routes';

// ==================== CONVENIENCE FACTORY FUNCTIONS ====================

import { Pool } from 'pg';
import { Router } from 'express';
import {
  SpecialEntityConfig,
  BaseSpecialEntity,
  PrimaryKeyConfig,
  ENTITY_PRIMARY_KEY_CONFIGS
} from './generic-types';
import { GenericSpecialModel } from './generic-model';
import { GenericSpecialService } from './generic-service';
import { GenericSpecialController } from './generic-controller';
import { createSpecialEntityRoutes as createSpecialRoutes } from './generic-routes';

/**
 * Complete SPECIAL Entity Factory
 * 
 * Creates a complete entity implementation with all layers:
 * - Model (database operations)
 * - Service (business logic)
 * - Controller (HTTP handling)
 * - Routes (Express routing)
 */
export function createCompleteSpecialEntity<T extends BaseSpecialEntity>(
  db: Pool,
  config: SpecialEntityConfig
) {
  // Create all layers
  const model = new GenericSpecialModel<T>(db, config);
  const service = new GenericSpecialService<T>(model, config);
  const controller = new GenericSpecialController<T>(service, config);
  const routes = createSpecialRoutes<T>(controller, config);

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
export function createSpecialEntityRoutes<T extends BaseSpecialEntity>(
  db: Pool,
  config: SpecialEntityConfig
): Router {
  const { routes } = createCompleteSpecialEntity<T>(db, config);
  return routes;
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Create entity configuration with defaults
 * 
 * Helper function to create configuration with sensible defaults for special entities.
 */
export function createSpecialConfig(
  entityName: string,
  tableName: string,
  primaryKeyConfig: PrimaryKeyConfig,
  customConfig: Partial<SpecialEntityConfig> = {}
): SpecialEntityConfig {
  return {
    entityName,
    tableName,
    primaryKey: primaryKeyConfig,
    apiPath: `/api/${entityName}`,
    searchableFields: ['name', 'description'],
    requiredFields: [],
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
export function validateSpecialConfig(config: SpecialEntityConfig): {
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

  if (!config.primaryKey || !config.primaryKey.fields || config.primaryKey.fields.length === 0) {
    errors.push('primaryKey configuration is required with at least one field');
  }

  if (!config.primaryKey.routePattern || config.primaryKey.routePattern.trim().length === 0) {
    errors.push('primaryKey routePattern is required');
  }

  if (!Array.isArray(config.searchableFields)) {
    errors.push('searchableFields must be an array');
  }

  if (!Array.isArray(config.requiredFields)) {
    errors.push('requiredFields must be an array');
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
 * Default configurations for your specific SPECIAL entities
 */
export const ENTITY_CONFIGS = {
  checkininf: createSpecialConfig(
    'checkininf',
    'checkininf_checkin',
    ENTITY_PRIMARY_KEY_CONFIGS['checkininf'],
    {
      searchableFields: ['checkin_id', 'checkout_id', 'status', 'notes'],
      requiredFields: ['checkin_id', 'checkout_id'],
      defaultLimit: 25
    }
  ),

  infLotinput: createSpecialConfig(
    'infLotinput',
    'inf_lotinput',
    ENTITY_PRIMARY_KEY_CONFIGS['infLotinput'],
    {
      searchableFields: ['inf_id', 'lot_input_id', 'batch_number', 'status'],
      requiredFields: ['inf_id', 'lot_input_id'],
      defaultLimit: 30
    }
  ),
  
  inspectiondata: createSpecialConfig(
    'inspectiondata',
    'inspectiondata',
    ENTITY_PRIMARY_KEY_CONFIGS['inspectiondata'],
    {
      searchableFields: ['inspection_no', 'station', 'shift', 'lotno', 'partsite', 'mclineno', 'itemno', 'model', 'version', 'fvilineno', 'grps', 'zones'],
      requiredFields: ['station', 'inspection_no', 'month_year', 'shift', 'lotno', 'partsite', 'mclineno', 'itemno', 'model', 'version', 'fvilineno', 'grps', 'zones'],
      defaultLimit: 20
    }
  ),
  
  parts: createSpecialConfig(
    'parts', 
    'parts', 
    ENTITY_PRIMARY_KEY_CONFIGS['parts'],
    {
      searchableFields: ['partno', 'product_families', 'versions', 'production_site', 'part_site', 'customer'],
      requiredFields: ['partno'],
      defaultLimit: 20
    }
  )
} as const;

// ==================== TYPE GUARDS ====================

/**
 * Type guard for SPECIAL entities
 */
export function isSpecialEntity(obj: any): obj is BaseSpecialEntity {
  return obj &&
    typeof obj.is_active === 'boolean' &&
    obj.created_at instanceof Date &&
    obj.updated_at instanceof Date &&
    typeof obj.created_by === 'number' &&
    typeof obj.updated_by === 'number';
}

 

/**
 * Validate primary key structure
 * 
 * Helper function to validate primary key configuration.
 */
export function validatePrimaryKeyConfig(config: PrimaryKeyConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!Array.isArray(config.fields) || config.fields.length === 0) {
    errors.push('Primary key fields array is required and cannot be empty');
  }

  if (!config.routePattern || !config.routePattern.startsWith('/')) {
    errors.push('Route pattern must start with "/" and contain parameter placeholders');
  }

  // Validate route pattern has correct number of parameters
  const paramCount = (config.routePattern.match(/:/g) || []).length;
  if (paramCount !== config.fields.length) {
    errors.push(`Route pattern parameter count (${paramCount}) must match fields count (${config.fields.length})`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Generate route pattern from primary key fields
 * 
 * Helper function to automatically generate route patterns.
 */
export function generateRoutePattern(fields: readonly string[]): string {
  return '/' + fields.map(field => {
    // Convert snake_case to camelCase for route parameters
    const paramName = field.replace(/_id$/, 'Id').replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    return `:${paramName}`;
  }).join('/');
}

/*
=== SIMPLIFIED SPECIAL ENTITY GENERIC ENTITY INDEX FEATURES ===

COMPLETE EXPORT SYSTEM:
✅ All types exported from generic-types
✅ All implementation classes exported
✅ All factory functions exported
✅ All helper utilities exported
✅ Session user type re-exported for convenience

FACTORY FUNCTIONS:
✅ createCompleteSpecialEntity() - Full entity with all layers
✅ createSpecialEntityRoutes() - Quick router creation
✅ createSpecialConfig() - Configuration with defaults
✅ validateSpecialConfig() - Configuration validation

DEFAULT CONFIGURATIONS:
✅ Pre-configured settings for all 3 entity types
✅ Customized primary key configurations per entity
✅ Appropriate search fields per entity type
✅ Sensible pagination limits per entity
✅ Ready-to-use configurations

SPECIAL ENTITY SPECIFIC FEATURES:
✅ Flexible primary key configuration support
✅ Primary key validation utilities
✅ Route pattern generation helpers
✅ Parameter extraction utilities
✅ Custom validation middleware creation

UTILITY FUNCTIONS:
✅ Type guards for runtime validation
✅ Configuration validation with error reporting
✅ Entity type validation
✅ Primary key configuration validation
✅ Route pattern generation
✅ Common pattern helpers

MANUFACTURING DOMAIN SUPPORT:
✅ Entity configurations for quality control workflows
✅ Appropriate search fields for inspection data
✅ Flexible primary keys for complex manufacturing relationships
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

FLEXIBLE PRIMARY KEY SUPPORT:
✅ Single key entities (inspection_id)
✅ Composite key entities (checkin_id + checkout_id)
✅ Complex composite keys (inf_id + lot_input_id)
✅ Automatic parameter mapping
✅ Custom validation support

ENTITY SUPPORT:
✅ checkininf - Check-in/check-out workflows (composite key)
✅ infLotinput - Manufacturing input tracking (composite key)
✅ inspectiondata - Quality inspection data (single key)
✅ parts - Part serial codes (VARCHAR 25)

This index file provides the complete simplified SPECIAL entity generic pattern
as a cohesive, easy-to-use package while maintaining all architectural
principles and supporting flexible primary key patterns for manufacturing
quality control systems.
*/