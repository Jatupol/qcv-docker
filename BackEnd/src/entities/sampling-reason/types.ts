// server/src/entities/sampling-reason/types.ts
/* Sampling Reason Entity Types - Complete Separation Entity Architecture
 * SERIAL ID Pattern Implementation
 * Sampling Reason Entity Type Definitions
 * 
 * Complete Separation Entity Architecture:
 * ✅ Extends BaseSerialIdEntity from SERIAL ID pattern
 * ✅ No direct cross-entity dependencies
 * ✅ Self-contained entity type definitions
 * ✅ Manufacturing domain-specific business rules
 * 
 * Database Schema Compliance:
 * - Table: sampling_reasons
 * - Primary Key: id SERIAL PRIMARY KEY
 * - Pattern: SERIAL ID Entity
 * - API Routes: /api/sampling-reasons/:id
 * 
 * Schema Fields:
 * - id: SERIAL PRIMARY KEY
 * - name: VARCHAR(100) UNIQUE NOT NULL
 * - description: TEXT
 * - is_active: BOOLEAN DEFAULT true
 * - created_by: INT DEFAULT 0
 * - updated_by: INT DEFAULT 0
 * - created_at: TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
 * - updated_at: TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
 */

import {
  BaseSerialIdEntity,
  CreateSerialIdData,
  UpdateSerialIdData,
  SerialIdQueryOptions,
  SerialIdEntityConfig,
  ValidationResult,
  DEFAULT_SERIAL_ID_CONFIG
} from '../../generic/entities/serial-id-entity/generic-types';

// ==================== CORE INTERFACES ====================

/**
 * Sampling Reason Entity Interface
 * 
 * Extends BaseSerialIdEntity with all standard SERIAL ID fields.
 * Matches sampling_reasons database table exactly.
 */
export interface SamplingReason extends BaseSerialIdEntity { }

/**
 * Create Sampling Reason Data Interface
 * 
 * Data required for creating new sampling reasons.
 * Excludes auto-generated fields (id, timestamps, audit fields).
 */
export interface CreateSamplingReasonData extends CreateSerialIdData { }

/**
 * Update Sampling Reason Data Interface
 * 
 * Data allowed for updating existing sampling reasons.
 * All fields optional for partial updates.
 */
export interface UpdateSamplingReasonData extends UpdateSerialIdData { }

// ==================== QUERY INTERFACES ====================

/**
 * Sampling Reason Query Options
 * 
 * Extends base query options with sampling reason-specific filters.
 */
export interface SamplingReasonQueryOptions extends SerialIdQueryOptions {
  // Manufacturing-specific filters for quality control
  nameContains?: string;
  hasDescription?: boolean;
  descriptionContains?: string;
  
  // Quality control specific filters
  isForInspection?: boolean;
  isForSampling?: boolean;
}

/**
 * Sampling Reason Summary Interface
 * 
 * Lightweight interface for lists and dropdowns.
 * Contains only essential fields for performance.
 */
export interface SamplingReasonSummary {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Sampling Reason Profile Interface
 * 
 * Complete sampling reason information for detailed views.
 * Same as SamplingReason but explicitly defined for clarity.
 */
export interface SamplingReasonProfile extends SamplingReason {}

// ==================== VALIDATION RULES ====================

/**
 * Sampling Reason Validation Rules
 * 
 * Manufacturing domain-specific validation for quality control.
 */
export interface SamplingReasonValidationRules {
  name: {
    required: true;
    maxLength: 100;
    pattern: RegExp;
    unique: true;
    noLeadingTrailingSpaces: true;
  };
  description: {
    maxLength: 5000;
    notEmptyIfProvided: true;
  };
}

/**
 * Sampling Reason Business Rules
 * 
 * Manufacturing-specific business logic rules.
 */
export interface SamplingReasonBusinessRules {
  validation: SamplingReasonValidationRules;
  audit: {
    trackCreation: true;
    trackUpdates: true;
    requireUserContext: true;
  };
  manufacturing: {
    allowInactiveForHistoricalData: true;
    preventDuplicationByName: true;
    requireDescriptionForCompliance: false;
  };
}

// ==================== CONFIGURATION ====================

/**
 * Sampling Reason Entity Configuration
 * 
 * Complete configuration for sampling reason entity behavior.
 */
export interface SamplingReasonEntityConfig extends SerialIdEntityConfig {
  businessRules: SamplingReasonBusinessRules;
  manufacturing: {
    qualityControlDomain: 'inspection_sampling';
    complianceRequired: boolean;
    auditTrailLevel: 'standard' | 'detailed';
  };
}

// ==================== DEFAULT CONFIGURATIONS ====================

/**
 * Default Sampling Reason Validation Rules
 */
export const DEFAULT_SAMPLING_REASON_VALIDATION: SamplingReasonValidationRules = {
  name: {
    required: true,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-_\.]+$/, // Allow alphanumeric, spaces, hyphens, underscores, dots
    unique: true,
    noLeadingTrailingSpaces: true
  },
  description: {
    maxLength: 5000,
    notEmptyIfProvided: true
  }
};

/**
 * Default Sampling Reason Business Rules
 */
export const DEFAULT_SAMPLING_REASON_BUSINESS_RULES: SamplingReasonBusinessRules = {
  validation: DEFAULT_SAMPLING_REASON_VALIDATION,
  audit: {
    trackCreation: true,
    trackUpdates: true,
    requireUserContext: true
  },
  manufacturing: {
    allowInactiveForHistoricalData: true,
    preventDuplicationByName: true,
    requireDescriptionForCompliance: false
  }
};

/**
 * Default Sampling Reason Entity Configuration
 * 
 * Complete configuration for sampling reason entity behavior.
 */
export const DEFAULT_SAMPLING_REASON_CONFIG: SamplingReasonEntityConfig = {
  ...DEFAULT_SERIAL_ID_CONFIG,
  entityName: 'SamplingReason',
  tableName: 'sampling_reasons',
  apiPath: '/api/sampling-reasons',
  searchableFields: ['name', 'description'],
  defaultLimit: 20,
  maxLimit: 100,
  businessRules: DEFAULT_SAMPLING_REASON_BUSINESS_RULES,
  manufacturing: {
    qualityControlDomain: 'inspection_sampling',
    complianceRequired: false,
    auditTrailLevel: 'standard'
  }
};

// ==================== VALIDATION FUNCTIONS ====================

/**
 * Validate Sampling Reason Data
 * 
 * Manufacturing domain-specific validation logic.
 */
export function validateSamplingReasonData(
  data: CreateSamplingReasonData | UpdateSamplingReasonData,
  operation: 'create' | 'update'
): ValidationResult {
  const errors: string[] = [];
  const rules = DEFAULT_SAMPLING_REASON_VALIDATION;

  // Validate name (required for create, optional for update)
  if (operation === 'create' || data.name !== undefined) {
    if (!data.name) {
      if (operation === 'create') {
        errors.push('Sampling reason name is required');
      }
    } else {
      // Name length validation
      if (data.name.length > rules.name.maxLength) {
        errors.push(`Sampling reason name cannot exceed ${rules.name.maxLength} characters`);
      }

      // Name pattern validation
      if (!rules.name.pattern.test(data.name)) {
        errors.push('Sampling reason name contains invalid characters. Use only letters, numbers, spaces, hyphens, underscores, and dots');
      }

      // Leading/trailing spaces validation
      if (data.name.trim() !== data.name) {
        errors.push('Sampling reason name cannot have leading or trailing spaces');
      }

      // Empty string validation
      if (data.name.trim().length === 0) {
        errors.push('Sampling reason name cannot be empty');
      }
    }
  }

  // Validate description
  if (data.description !== undefined) {
    if (data.description !== null && data.description.length > rules.description.maxLength) {
      errors.push(`Sampling reason description cannot exceed ${rules.description.maxLength} characters`);
    }

    // Check for empty description if provided
    if (data.description === '') {
      errors.push('Sampling reason description cannot be empty if provided. Use null to remove description');
    }
  }

  // Validate is_active
  if (data.is_active !== undefined && typeof data.is_active !== 'boolean') {
    errors.push('Sampling reason active status must be a boolean value');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// ==================== TYPE GUARDS ====================

/**
 * Type guard to check if object is a valid SamplingReason
 */
export function isSamplingReason(obj: any): obj is SamplingReason {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'number' &&
    typeof obj.name === 'string' &&
    (obj.description === null || typeof obj.description === 'string') &&
    typeof obj.is_active === 'boolean' &&
    typeof obj.created_by === 'number' &&
    typeof obj.updated_by === 'number' &&
    obj.created_at instanceof Date &&
    obj.updated_at instanceof Date
  );
}

/**
 * Type guard to check if object is valid CreateSamplingReasonData
 */
export function isCreateSamplingReasonData(obj: any): obj is CreateSamplingReasonData {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.name === 'string' &&
    (obj.description === undefined || obj.description === null || typeof obj.description === 'string') &&
    (obj.is_active === undefined || typeof obj.is_active === 'boolean')
  );
}

/**
 * Type guard to check if object is valid UpdateSamplingReasonData
 */
export function isUpdateSamplingReasonData(obj: any): obj is UpdateSamplingReasonData {
  return (
    obj &&
    typeof obj === 'object' &&
    (obj.name === undefined || typeof obj.name === 'string') &&
    (obj.description === undefined || obj.description === null || typeof obj.description === 'string') &&
    (obj.is_active === undefined || typeof obj.is_active === 'boolean')
  );
}

 