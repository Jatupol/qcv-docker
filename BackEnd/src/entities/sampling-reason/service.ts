// server/src/entities/sampling-reason/service.ts
/* Sampling Reason Entity Service - Complete Separation Entity Architecture
 * SERIAL ID Pattern Implementation
 * Business Logic for Sampling Reason Entity
 * 
 * Complete Separation Entity Architecture:
 * ✅ Extends GenericSerialIdService from SERIAL ID pattern
 * ✅ No direct cross-entity dependencies
 * ✅ Self-contained business logic operations
 * ✅ Manufacturing domain-specific validation and rules
 * 
 * Business Logic Responsibilities:
 * - Validation and business rule enforcement
 * - Permission checking and access control
 * - Data transformation and formatting
 * - Manufacturing domain-specific operations
 */

import {
  ISerialIdService,
  SerialIdServiceResult,
  SerialIdPaginatedResponse,
  ValidationResult
} from '../../generic/entities/serial-id-entity/generic-types';
import { GenericSerialIdService } from '../../generic/entities/serial-id-entity/generic-service';
import {
  SamplingReason,
  CreateSamplingReasonData,
  UpdateSamplingReasonData,
  SamplingReasonQueryOptions,
  DEFAULT_SAMPLING_REASON_CONFIG,
  validateSamplingReasonData,
  isSamplingReason,
  isCreateSamplingReasonData,
  isUpdateSamplingReasonData
} from './types';
import type { SamplingReasonModel } from './model';

/**
 * Sampling Reason Service Implementation
 * 
 * Extends GenericSerialIdService with sampling reason-specific business logic.
 * Handles validation, permissions, and manufacturing domain rules.
 */
export class SamplingReasonService extends GenericSerialIdService<SamplingReason> implements ISerialIdService<SamplingReason> {
  
  protected samplingReasonModel: SamplingReasonModel;

  constructor(model: SamplingReasonModel) {
    super(model as any, DEFAULT_SAMPLING_REASON_CONFIG);
    this.samplingReasonModel = model;
  }

  // ==================== CRUD OPERATIONS ====================
  // Note: Base CRUD operations inherited from GenericSerialIdService
  // - getById(id: number, userId: number): Promise<SerialIdServiceResult<SamplingReason>>
  // - getAll(options: SerialIdQueryOptions, userId: number): Promise<SerialIdServiceResult<SerialIdPaginatedResponse<SamplingReason>>>
  // - create(data: CreateSerialIdData, userId: number): Promise<SerialIdServiceResult<SamplingReason>>
  // - update(id: number, data: UpdateSerialIdData, userId: number): Promise<SerialIdServiceResult<SamplingReason>>
  // - delete(id: number, userId: number): Promise<SerialIdServiceResult<boolean>>
  // - validate(data: any, operation: 'create' | 'update'): ValidationResult

  // ==================== ENHANCED OPERATIONS ====================

 /**
   * Enhanced validation with sampling reason-specific rules
   * 
   * Overrides generic validate to add manufacturing domain validation.
   */
  validate(data: any, operation: 'create' | 'update'): ValidationResult {
    return validateSamplingReasonData(data, operation);
  }

  // ==================== SAMPLING REASON SPECIFIC OPERATIONS ====================

   
  /**
   * Check if sampling reason name is unique
   * 
   * Manufacturing domain validation for uniqueness.
   */
  async checkNameUniqueness(name: string, excludeId?: number): Promise<SerialIdServiceResult<boolean>> {
    try {
      if (!name || name.trim().length === 0) {
        return {
          success: false,
          error: 'Name is required for uniqueness check'
        };
      }

      const isUnique = await this.samplingReasonModel.isNameUnique(name.trim(), excludeId);

      return {
        success: true,
        data: isUnique
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to check name uniqueness: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // ==================== PRIVATE HELPER METHODS ====================
  
}

/**
 * Factory function to create a sampling reason service instance
 * 
 * Factory pattern for dependency injection.
 */
export function createSamplingReasonService(model: SamplingReasonModel): SamplingReasonService {
  return new SamplingReasonService(model);
}

export default SamplingReasonService;

 