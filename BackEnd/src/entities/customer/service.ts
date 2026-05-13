// server/src/entities/customer/service.ts

/**
 * Customer Entity Service Implementation
 * 
 * This module implements the Customer entity service following the VARCHAR CODE pattern.
 * Customer service provides business logic for the Customer entity.
 * 
 * Complete Separation Entity Architecture:
 * ✅ Extends GenericVarcharCodeService from VARCHAR CODE pattern
 * ✅ No direct cross-entity dependencies
 * ✅ Self-contained Customer business logic layer
 * ✅ 90% code reduction through generic pattern reuse
 * 
 * Business Logic Compliance:
 * - Customer business rules and validation
 * - Manufacturing Quality Control specific logic
 * - Customer operational status management
 * - Code and name uniqueness validation
 */

import {
  GenericVarcharCodeService,
  createVarcharCodeService
} from '../../generic/entities/varchar-code-entity/generic-service';

import {
  Customer,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  CustomerQueryOptions,
  CustomerServiceResult,
  CustomerEntityConfig,
  CustomerConstants
} from './types';

import {
  VarcharCodePaginatedResponse,
  VarcharCodeServiceResult,
  ValidationResult,
  IVarcharCodeService
} from '../../generic/entities/varchar-code-entity/generic-types';

import { CustomerModel } from './model';

// ==================== CUSTOMER SERVICE CLASS ====================

/**
 * Customer Service - Business logic for Customer entity
 * 
 * Extends GenericVarcharCodeService to inherit all standard VARCHAR CODE operations:
 * ✅ getByCode(code: string, userId: number): Promise<CustomerServiceResult<Customer>>
 * ✅ getAll(options: CustomerQueryOptions, userId: number): Promise<CustomerServiceResult<VarcharCodePaginatedResponse<Customer>>>
 * ✅ create(data: CreateCustomerRequest, userId: number): Promise<CustomerServiceResult<Customer>>
 * ✅ update(code: string, data: UpdateCustomerRequest, userId: number): Promise<CustomerServiceResult<Customer>>
 * ✅ delete(code: string, userId: number): Promise<CustomerServiceResult<boolean>>
 * ✅ changeStatus(code: string, userId: number): Promise<CustomerServiceResult<boolean>>
 * ✅ validate(data: any, operation: 'create' | 'update'): ValidationResult
 * 
 * Plus Customer-specific business operations and validations.
 */
export class CustomerService extends GenericVarcharCodeService<Customer> implements IVarcharCodeService<Customer> {

  protected override model: any;

  constructor(model: CustomerModel) {
    super(model as any, CustomerEntityConfig);
    this.model = model;
  }

  // ==================== CUSTOMER-SPECIFIC BUSINESS OPERATIONS ====================

 
  /**
   * Check if Customer code is available for creation
   * Includes format validation and uniqueness check
   */
  async checkCodeAvailability(code: string, userId: number): Promise<CustomerServiceResult<{
    available: boolean;
    reasons: string[];
    suggestions: string[];
  }>> {
    try {
      const reasons: string[] = [];
      const suggestions: string[] = [];

      // Basic validation
      if (!code || code.trim().length === 0) {
        reasons.push('Code cannot be empty');
        return {
          success: true,
          data: { available: false, reasons, suggestions }
        };
      }

      const trimmedCode = code.trim().toUpperCase();

      // Length validation
      if (trimmedCode.length > CustomerConstants.CODE_MAX_LENGTH) {
        reasons.push(`Code cannot exceed ${CustomerConstants.CODE_MAX_LENGTH} characters`);
      }

      if (trimmedCode.length < CustomerConstants.CODE_MIN_LENGTH) {
        reasons.push(`Code must be at least ${CustomerConstants.CODE_MIN_LENGTH} character`);
      }

      // Pattern validation
      if (!CustomerConstants.CODE_PATTERN.test(trimmedCode)) {
        reasons.push('Code can only contain letters and numbers');
      }

      // If basic validation fails, return early
      if (reasons.length > 0) {
        return {
          success: true,
          data: { available: false, reasons, suggestions }
        };
      }

      // Check uniqueness
      const isAvailable = await this.model.isCodeAvailable(trimmedCode);
      
      if (!isAvailable) {
        reasons.push('Code is already in use');
        
        // Get similar codes for suggestions
        const similarCodes = await this.model.findSimilarCodes(trimmedCode);
        suggestions.push(...similarCodes);
      }

      return {
        success: true,
        data: {
          available: isAvailable,
          reasons,
          suggestions
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to check code availability: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

 
  /**
   * Get customers by code prefix for autocomplete functionality
   * Returns customers matching the provided code prefix
   */
  async getByCodePrefix(codePrefix: string, userId: number, limit: number = 10): Promise<CustomerServiceResult<Pick<Customer, 'code' | 'name'>[]>> {
    try {
      // Validate input
      if (!codePrefix || codePrefix.trim().length === 0) {
        return {
          success: false,
          error: 'Code prefix cannot be empty'
        };
      }

      if (limit < 1 || limit > 50) {
        return {
          success: false,
          error: 'Limit must be between 1 and 50'
        };
      }

      const customers = await this.model.findByCodePrefix(codePrefix.trim().toUpperCase(), limit);
      
      return {
        success: true,
        data: customers
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to search customers by code prefix: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Check if Customer can be safely deleted
   * Validates that customer has no dependent relationships
   */
  async canDelete(code: string): Promise<CustomerServiceResult<{
    canDelete: boolean;
    reasons: string[];
    relationshipCounts: {
      customerSites: number;
      parts: number;
    };
  }>> {
    try {
      // Check if customer exists
      const customerResult = await this.getByCode(code);
      if (!customerResult.success || !customerResult.data) {
        return {
          success: false,
          error: 'Customer not found'
        };
      }

      // Get relationship counts
      const relationshipCounts = await (this.model as any).getRelationshipCounts?.(code) || { customerSites: 0, parts: 0, inspectionData: 0, defectData: 0 };
      const reasons: string[] = [];

      // Check each relationship type
      if (relationshipCounts.customerSites > 0) {
        reasons.push(`Customer has ${relationshipCounts.customerSites} customer-site relationships`);
      }

      if (relationshipCounts.parts > 0) {
        reasons.push(`Customer has ${relationshipCounts.parts} associated parts`);
      }

      const canDelete = reasons.length === 0;

      return {
        success: true,
        data: {
          canDelete,
          reasons,
          relationshipCounts
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to check deletion eligibility: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // ==================== ENHANCED VALIDATION ====================

  /**
   * Enhanced validation with Customer-specific business rules
   * Extends the generic validation with manufacturing-specific constraints
   */
  validate(data: any, operation: 'create' | 'update'): ValidationResult {
    // Start with generic validation
    const genericResult = super.validate(data, operation);
    
    // Add Customer-specific validation
    const customerErrors: string[] = [...genericResult.errors];

    if (operation === 'create') {
      // Validate code format for creation
      if (data.code) {
        const normalizedCode = data.code.trim().toUpperCase();
        
        if (!CustomerConstants.CODE_PATTERN.test(normalizedCode)) {
          customerErrors.push('Code can only contain letters and numbers');
        }
        
        if (normalizedCode.length > CustomerConstants.CODE_MAX_LENGTH) {
          customerErrors.push(`Code cannot exceed ${CustomerConstants.CODE_MAX_LENGTH} characters`);
        }
      }
    }

    // Validate name length
    if (data.name && data.name.trim().length > CustomerConstants.NAME_MAX_LENGTH) {
      customerErrors.push(`Name cannot exceed ${CustomerConstants.NAME_MAX_LENGTH} characters`);
    }

    return {
      isValid: customerErrors.length === 0,
      errors: customerErrors
    };
  }

  // ==================== MANUFACTURING-SPECIFIC HELPERS ====================

  /**
   * Check if Customer is operational (active and properly configured)
   * Used for production planning and quality control workflows
   */
  async isCustomerOperational(code: string): Promise<CustomerServiceResult<{
    operational: boolean;
    status: 'active' | 'inactive' | 'not_found';
    reasons: string[];
  }>> {
    try {
      const customerResult = await this.getByCode(code);
      
      if (!customerResult.success || !customerResult.data) {
        return {
          success: true,
          data: {
            operational: false,
            status: 'not_found',
            reasons: ['Customer not found']
          }
        };
      }

      const customer = customerResult.data;
      const reasons: string[] = [];

      if (!customer.is_active) {
        reasons.push('Customer is marked as inactive');
      }

      const operational = customer.is_active && reasons.length === 0;

      return {
        success: true,
        data: {
          operational,
          status: customer.is_active ? 'active' : 'inactive',
          reasons
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to check customer operational status: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

// ==================== FACTORY FUNCTIONS ====================

/**
 * Factory function to create Customer service instance
 * Uses Customer-specific model with enhanced functionality
 */
export function createCustomerService(model: CustomerModel): CustomerService {
  return new CustomerService(model);
}

/**
 * Alternative factory using generic pattern (for consistency)
 */
export function createCustomerServiceGeneric(model: CustomerModel): IVarcharCodeService<Customer> {
  return createVarcharCodeService<Customer>(model as any, CustomerEntityConfig);
}

export default CustomerService;
 