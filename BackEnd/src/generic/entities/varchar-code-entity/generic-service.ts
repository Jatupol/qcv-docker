// server/src/generic/entities/varchar-code-entity/generic-service.ts
// 🛠️ ENHANCED: Generic VARCHAR Code Service with New Methods
// Complete Separation Entity Architecture - Manufacturing Quality Control System

import {
  BaseVarcharCodeEntity,
  CreateVarcharCodeData,
  UpdateVarcharCodeData,
  VarcharCodeQueryOptions,
  VarcharCodePaginatedResponse,
  VarcharCodeServiceResult,
  VarcharCodeHealthResult,
  VarcharCodeStatisticsResult,
  ValidationResult,
  VarcharCodeEntityConfig,
  IVarcharCodeService,
  IVarcharCodeModel
} from './generic-types';

export class GenericVarcharCodeService<T extends BaseVarcharCodeEntity> implements IVarcharCodeService<T> {
  protected model: IVarcharCodeModel<T>;
  protected config: VarcharCodeEntityConfig;

  constructor(model: IVarcharCodeModel<T>, config: VarcharCodeEntityConfig) {
    this.model = model;
    this.config = config;
  }

  // ==================== EXISTING CRUD OPERATIONS ====================

  /**
   * Get entity by code
   */
  async getByCode(code: string): Promise<VarcharCodeServiceResult<T>> {
    try {
      // Basic code validation
      if (!this.isValidCode(code)) {
        return {
          success: false,
          error: 'Invalid code provided'
        };
      }

      const entity = await this.model.getByCode(code);
      
      if (!entity) {
        return {
          success: false,
          error: `${this.config.entityName} not found`
        };
      }

      return {
        success: true,
        data: entity
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get ${this.config.entityName}: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get all entities with pagination and filtering
   */
  async getAll(options: VarcharCodeQueryOptions): Promise<VarcharCodeServiceResult<VarcharCodePaginatedResponse<T>>> {
    try {
      // Apply default options
      const queryOptions = this.applyDefaultOptions(options);

      const result = await this.model.getAll(queryOptions);

      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get ${this.config.entityName} list: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Create new entity
   */
  async create(data: CreateVarcharCodeData, userId: number): Promise<VarcharCodeServiceResult<T>> {
    try {
      // Validate input data
      const validation = this.validate(data, 'create');
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }

      // Check if code already exists
      const exists = await this.model.exists(data.code);
      if (exists) {
        return {
          success: false,
          error: `${this.config.entityName} with code '${data.code}' already exists`
        };
      }

      const entity = await this.model.create(data, userId);

      return {
        success: true,
        data: entity
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to create ${this.config.entityName}: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Update existing entity
   */
  async update(code: string, data: UpdateVarcharCodeData, userId: number): Promise<VarcharCodeServiceResult<T>> {
    try {
      // Basic code validation
      if (!this.isValidCode(code)) {
        return {
          success: false,
          error: 'Invalid code provided'
        };
      }

      // Validate input data
      const validation = this.validate(data, 'update');
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }

      // Check if entity exists
      const exists = await this.model.exists(code);
      if (!exists) {
        return {
          success: false,
          error: `${this.config.entityName} not found`
        };
      }

      const entity = await this.model.update(code, data, userId);

      return {
        success: true,
        data: entity
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to update ${this.config.entityName}: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Soft delete entity (set is_active = false)
   */
  async delete(code: string): Promise<VarcharCodeServiceResult<boolean>> {
    try {
      // Basic code validation
      if (!this.isValidCode(code)) {
        return {
          success: false,
          error: 'Invalid code provided'
        };
      }

      const deleted = await this.model.delete(code);

      if (!deleted) {
        return {
          success: false,
          error: `${this.config.entityName} not found or already inactive`
        };
      }

      return {
        success: true,
        data: true
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to delete ${this.config.entityName}: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Toggle entity active status
   */
  async changeStatus(code: string, userId: number): Promise<VarcharCodeServiceResult<boolean>> {
    try {
      // Basic code validation
      if (!this.isValidCode(code)) {
        return {
          success: false,
          error: 'Invalid code provided'
        };
      }

      const changed = await this.model.changeStatus(code, userId);

      if (!changed) {
        return {
          success: false,
          error: `${this.config.entityName} not found`
        };
      }

      return {
        success: true,
        data: true
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to change ${this.config.entityName} status: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async getHealth(): Promise<VarcharCodeServiceResult<VarcharCodeHealthResult>> {
    try {
      const healthResult = await this.model.health();

      return {
        success: true,
        data: healthResult
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get ${this.config.entityName} health status: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async getStatistics(): Promise<VarcharCodeServiceResult<VarcharCodeStatisticsResult>> {
    try {
      const statisticsResult = await this.model.statistics();

      return {
        success: true,
        data: statisticsResult
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get ${this.config.entityName} statistics: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async getByName(name: string, options: VarcharCodeQueryOptions): Promise<VarcharCodeServiceResult<VarcharCodePaginatedResponse<T>>> {
    try {
      // Validate name parameter
      if (!name || name.trim().length === 0) {
        return {
          success: false,
          error: 'Name parameter is required'
        };
      }

      if (name.length > 255) {
        return {
          success: false,
          error: 'Name parameter is too long (max 255 characters)'
        };
      }

      // Apply default options
      const queryOptions = this.applyDefaultOptions(options);

      const result = await this.model.getByName(name.trim(), queryOptions);

      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to search ${this.config.entityName} by name: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async filterStatus(status: boolean, options: VarcharCodeQueryOptions): Promise<VarcharCodeServiceResult<VarcharCodePaginatedResponse<T>>> {
    try {
      // Apply default options
      const queryOptions = this.applyDefaultOptions(options);

      const result = await this.model.filterStatus(status, queryOptions);

      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to filter ${this.config.entityName} by status: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async search(pattern: string, options: VarcharCodeQueryOptions): Promise<VarcharCodeServiceResult<VarcharCodePaginatedResponse<T>>> {
    try {
      // Validate pattern parameter
      if (!pattern || pattern.trim().length === 0) {
        return {
          success: false,
          error: 'Pattern parameter is required'
        };
      }

      if (pattern.length > 255) {
        return {
          success: false,
          error: 'Pattern parameter is too long (max 255 characters)'
        };
      }

      // Apply default options
      const queryOptions = this.applyDefaultOptions(options);

      const result = await this.model.search(pattern.trim(), queryOptions);

      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to search ${this.config.entityName} by pattern: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // ==================== VALIDATION METHODS ====================

  /**
   * Validate entity data
   */
  validate(data: any, operation: 'create' | 'update'): ValidationResult {
    const errors: string[] = [];

    if (operation === 'create') {
      // Required fields for creation
      if (!data.code || typeof data.code !== 'string') {
        errors.push('Code is required and must be a string');
      } else {
        // Code validation
        if (data.code.length === 0 || data.code.length > this.config.codeLength) {
          errors.push(`Code must be 1-${this.config.codeLength} characters long`);
        }

        if (!/^[A-Z0-9_-]+$/i.test(data.code)) {
          errors.push('Code can only contain letters, numbers, underscores, and hyphens');
        }
      }

      if (!data.name || typeof data.name !== 'string') {
        errors.push('Name is required and must be a string');
      } else if (data.name.trim().length === 0 || data.name.length > 255) {
        errors.push('Name must be 1-255 characters long');
      }

      // Optional fields validation
      if (data.is_active !== undefined && typeof data.is_active !== 'boolean') {
        errors.push('is_active must be a boolean value');
      }
    } else {
      // Update operation - all fields are optional but must be valid if provided
      if (data.name !== undefined) {
        if (typeof data.name !== 'string') {
          errors.push('Name must be a string');
        } else if (data.name.trim().length === 0 || data.name.length > 255) {
          errors.push('Name must be 1-255 characters long');
        }
      }

      if (data.is_active !== undefined && typeof data.is_active !== 'boolean') {
        errors.push('is_active must be a boolean value');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // ==================== HELPER METHODS ====================

  /**
   * Apply default options to query parameters
   */
  private applyDefaultOptions(options: VarcharCodeQueryOptions): VarcharCodeQueryOptions {
    return {
      page: options.page ?? 1,
      limit: Math.min(options.limit ?? this.config.defaultLimit, this.config.maxLimit),
      sortBy: options.sortBy ?? 'code',
      sortOrder: options.sortOrder ?? 'ASC',
      search: options.search?.trim(),
      isActive: options.isActive,
      createdAfter: options.createdAfter,
      createdBefore: options.createdBefore,
      updatedAfter: options.updatedAfter,
      updatedBefore: options.updatedBefore
    };
  }

  /**
   * Validate code format
   */
  private isValidCode(code: string): boolean {
    if (!code || typeof code !== 'string') {
      return false;
    }

    if (code.length === 0 || code.length > this.config.codeLength) {
      return false;
    }

    // Basic alphanumeric validation with underscores and hyphens
    return /^[A-Z0-9_-]+$/i.test(code);
  }
}

/**
 * Factory function to create a generic VARCHAR CODE service
 */
export function createVarcharCodeService<T extends BaseVarcharCodeEntity>(
  model: IVarcharCodeModel<T>,
  config: VarcharCodeEntityConfig
): GenericVarcharCodeService<T> {
  return new GenericVarcharCodeService<T>(model, config);
}

export default GenericVarcharCodeService;

 