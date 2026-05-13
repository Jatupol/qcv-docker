// server/src/entities/defect/service.ts
/**
 * FIXED: Defect Entity Service - Complete Separation Entity Architecture
 * Manufacturing Quality Control System - SERIAL ID Pattern
 * 
 * ✅ FIXED: Factory function now accepts DefectModel instead of Pool
 * ✅ Proper dependency injection pattern
 * ✅ Maintains complete SERIAL ID pattern functionality
 */

import { GenericSerialIdService } from '../../generic/entities/serial-id-entity/generic-service';
import {
  SerialIdServiceResult,
  SerialIdQueryOptions,
  SerialIdPaginatedResponse,
  ISerialIdService
} from '../../generic/entities/serial-id-entity/generic-types';

import { 
  Defect, 
  DefectQueryOptions,
  DefectSummary,
  DefectProfile,
  DEFAULT_DEFECT_CONFIG 
} from './types';

import { DefectModel } from './model';

// ==================== DEFECT SERVICE CLASS ====================

/**
 * Defect Service - Business logic layer for Defect entity
 * 
 */
export class DefectService extends GenericSerialIdService<Defect> implements ISerialIdService<Defect> {
  
  private defectModel: DefectModel;

  constructor(defectModel: DefectModel) {
    // Pass the model to the generic service
    super(defectModel, DEFAULT_DEFECT_CONFIG);
    this.defectModel = defectModel;
  }

  // ==================== INHERITED CRUD OPERATIONS ====================
  // The following methods are inherited from GenericSerialIdService:
  // - getById(id, userId) - Get defect by ID with validation
  // - getAll(options, userId) - Get all defects with filtering/pagination
  // - create(data, userId) - Create new defect with validation
  // - update(id, data, userId) - Update defect with validation
  // - delete(id, userId) - Delete defect (soft delete)
  // - validate(data, operation) - Basic validation

  // ==================== DEFECT-SPECIFIC OPERATIONS ====================

  /**
   * Get defects filtered by defect group
   * Supports additional filtering by status and search
   */
  async getByDefectGroup(
    defectGroup: string,
    options: DefectQueryOptions = {},
    userId?: number
  ): Promise<SerialIdServiceResult<SerialIdPaginatedResponse<Defect>>> {
    try {
      console.log('🔧 DefectService.getByDefectGroup - called with:', { defectGroup, options });

      // Validate defect group
      if (!defectGroup || typeof defectGroup !== 'string' || defectGroup.trim().length === 0) {
        return {
          success: false,
          error: 'Defect group is required'
        };
      }

      // Call model method
      const result = await this.defectModel.getByDefectGroup(defectGroup.trim(), options);

      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('❌ DefectService.getByDefectGroup - Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get defects by group'
      };
    }
  }

  /**
   * Validate defect name uniqueness
   *
   * Business rule enforcement for defect name uniqueness
   */
  async validateNameUnique(name: string, excludeId?: number, userId?: number): Promise<SerialIdServiceResult<boolean>> {
    try {
      // Validate inputs
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return {
          success: false,
          error: 'Defect name is required'
        };
      }

      if (name.trim().length > 100) {
        return {
          success: false,
          error: 'Defect name cannot exceed 100 characters'
        };
      }

      if (excludeId !== undefined && (!this.validateIdFormat(excludeId))) {
        return {
          success: false,
          error: 'Invalid exclude ID'
        };
      }

      const isUnique = await this.defectModel.isDefectNameUnique(name.trim(), excludeId);

      return {
        success: true,
        data: isUnique
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to validate defect name: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

   
  // ==================== ENHANCED VALIDATION ====================

  /**
   * Enhanced defect-specific validation
   * 
   * Validates defect data with business rules specific to Manufacturing Quality Control
   */
  protected validateDefectData(data: Partial<Defect>, operation: 'create' | 'update' = 'create'): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Name validation
    if (operation === 'create' || data.name !== undefined) {
      if (!data.name || typeof data.name !== 'string') {
        errors.push('Defect name is required');
      } else {
        const trimmedName = data.name.trim();
        if (trimmedName.length === 0) {
          errors.push('Defect name cannot be empty');
        } else if (trimmedName.length > 100) {
          errors.push('Defect name cannot exceed 100 characters');
        } else if (trimmedName.length < 2) {
          errors.push('Defect name must be at least 2 characters long');
        } else if (!/^[a-zA-Z0-9\s\-_.()]+$/.test(trimmedName)) {
          errors.push('Defect name contains invalid characters');
        } else if (trimmedName !== data.name.trim()) {
          errors.push('Defect name cannot have leading or trailing spaces');
        } else if (/\s{2,}/.test(trimmedName)) {
          errors.push('Defect name cannot contain multiple consecutive spaces');
        }
      }
    }

    // Description validation
    if (data.description !== undefined) {
      if (typeof data.description !== 'string') {
        errors.push('Description must be a string');
      } else if (data.description.length > 0 && data.description.trim().length === 0) {
        errors.push('Description cannot be empty if provided');
      } else if (data.description.length > 5000) {
        errors.push('Description cannot exceed 5000 characters');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // ==================== HELPER METHODS ====================
 

  /**
   * Validate ID format (renamed to avoid conflict with generic service)
   */
  private validateIdFormat(id: number): boolean {
    return Number.isInteger(id) && id > 0;
  }
}

// ==================== FIXED FACTORY FUNCTION ====================

/**
 * ✅ FIXED: Factory function to create a defect service instance
 * 
 * Now correctly accepts DefectModel instead of Pool
 * Provides proper dependency injection pattern for defect service creation
 */
export function createDefectService(defectModel: DefectModel): DefectService {
  return new DefectService(defectModel);
}

// ==================== DEFAULT EXPORT ====================

export default DefectService;

 