// server/src/entities/customer/controller.ts

/**
 * Customer Entity Controller Implementation
 * 
 * This module implements the Customer controller following the VARCHAR CODE pattern.
 * Customer controller provides HTTP request/response handling for Customer entity.
 * 
 * Complete Separation Entity Architecture:
 * ✅ Extends GenericVarcharCodeController from VARCHAR CODE pattern
 * ✅ No direct cross-entity dependencies
 * ✅ Self-contained Customer HTTP handling layer
 * ✅ 90% code reduction through generic pattern reuse
 * ✅ Integrates seamlessly with existing middleware (auth, validation, logging)
 * 
 
 */

import { Response, NextFunction } from 'express';
import {
  GenericVarcharCodeController,
  createGenericVarcharCodeController
} from '../../generic/entities/varchar-code-entity/generic-controller';

import {
  VarcharCodeEntityRequest,
  VarcharCodeApiResponse,
  IVarcharCodeController
} from '../../generic/entities/varchar-code-entity/generic-types';

import {
  Customer,
  CustomerEntityConfig,
  CustomerApiResponse
} from './types';

import { CustomerService } from './service';

// ==================== CUSTOMER CONTROLLER CLASS ====================

/**
 * Customer Controller - HTTP request/response handling for Customer entity
 * 
 * Extends GenericVarcharCodeController to inherit all standard VARCHAR CODE endpoints:
 * ✅ create(req, res, next) - POST /api/customers
 * ✅ getByCode(req, res, next) - GET /api/customers/:code
 * ✅ update(req, res, next) - PUT /api/customers/:code
 * ✅ delete(req, res, next) - DELETE /api/customers/:code
 * ✅ changeStatus(req, res, next) - PATCH /api/customers/:code/status
 * ✅ getAll(req, res, next) - GET /api/customers
 * 
 * Plus Customer-specific endpoints for manufacturing operations.
 */
export class CustomerController extends GenericVarcharCodeController<Customer> implements IVarcharCodeController {
  
  protected service: CustomerService;

  constructor(service: CustomerService) {
    super(service, CustomerEntityConfig);
    this.service = service;
  }

  // ==================== CUSTOMER-SPECIFIC ENDPOINTS ====================
 

  /**
   * POST /api/customers/check-code
   * Check if Customer code is available for creation
   * Body: { code: string }
   * Returns availability status, validation reasons, and suggestions
   */
  checkCodeAvailability = async (req: VarcharCodeEntityRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // req.user is guaranteed by requireAuthentication middleware
      const userId = req.user!.id;
      const { code } = req.body;

      if (!code) {
        res.status(400).json({
          success: false,
          error: 'Code is required'
        });
        return;
      }

      const result = await this.service.checkCodeAvailability(code, userId);

      if (result.success && result.data) {
        res.status(200).json({
          success: true,
          data: result.data,
          message: 'Code availability checked successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error || 'Failed to check code availability'
        });
      }
    } catch (error) {
      next(error);
    }
  };

   

 
  /**
   * GET /api/customers/:code/operational-status
   * Check if Customer is operational for production use
   * Returns operational status with detailed reasons
   */
  checkOperationalStatus = async (req: VarcharCodeEntityRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // req.user is guaranteed by requireAuthentication middleware
      // req.params.code is guaranteed valid by validateVarcharCode middleware

      const code = req.params.code;

      const result = await this.service.isCustomerOperational(code);

      if (result.success && result.data) {
        res.status(200).json({
          success: true,
          data: result.data,
          message: 'Operational status checked successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error || 'Failed to check operational status'
        });
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/customers/:code/deletion-check
   * Check if Customer can be safely deleted
   * Returns deletion eligibility with relationship analysis
   */
  checkDeletionEligibility = async (req: VarcharCodeEntityRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // req.user is guaranteed by requireAuthentication middleware
      // req.params.code is guaranteed valid by validateVarcharCode middleware

      const code = req.params.code;

      const result = await this.service.canDelete(code);

      if (result.success && result.data) {
        res.status(200).json({
          success: true,
          data: result.data,
          message: 'Deletion eligibility checked successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error || 'Failed to check deletion eligibility'
        });
      }
    } catch (error) {
      next(error);
    }
  };
}

// ==================== FACTORY FUNCTIONS ====================

/**
 * Factory function to create Customer controller instance
 * Uses Customer-specific service with enhanced functionality
 */
export function createCustomerController(service: CustomerService): CustomerController {
  return new CustomerController(service);
}

/**
 * Alternative factory using generic pattern (for consistency)
 */
export function createCustomerControllerGeneric(service: CustomerService): IVarcharCodeController {
  return createGenericVarcharCodeController<Customer>(service, CustomerEntityConfig);
}

export default CustomerController;
 