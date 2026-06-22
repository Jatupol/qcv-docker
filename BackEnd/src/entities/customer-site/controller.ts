// server/src/entities/customer-site/controller.ts
/**
 * SIMPLIFIED: Customer-Site Entity Controller - ISpecialController Implementation
 * Manufacturing Quality Control System - SPECIAL Entity Pattern (Single Primary Key)
 *
 * ✅ RESOLVED: Implements required ISpecialController interface
 * ✅ Uses direct response methods instead of private parent methods
 * ✅ Simplified implementation with clear, maintainable code
 * ✅ Perfect integration with SPECIAL entity pattern
 */

import { Response, NextFunction } from 'express';
import { GenericSpecialController } from '../../generic/entities/special-entity/generic-controller';
import {
  ISpecialController,
  SpecialEntityRequest,
  SpecialApiResponse
} from '../../generic/entities/special-entity/generic-types';

import {
  CustomerSite,
  CreateCustomerSiteRequest,
  UpdateCustomerSiteRequest,
  CustomerSiteQueryParams,
  CUSTOMER_SITE_ENTITY_CONFIG
} from './types';

import type { CustomerSiteService } from './service';

// ==================== SIMPLIFIED CUSTOMER-SITE CONTROLLER CLASS ====================

/**
 * SIMPLIFIED: Customer-Site Entity Controller
 *
 * ✅ Properly implements ISpecialController interface with all required methods
 * ✅ Uses direct JSON responses instead of private parent methods
 * ✅ Clear, maintainable code with single primary key support
 * ✅ Provides customer-site specific manufacturing endpoints
 */
export class CustomerSiteController extends GenericSpecialController<CustomerSite> implements ISpecialController {
  
  protected customerSiteService: CustomerSiteService;

  constructor(service: CustomerSiteService) {
    super(service, CUSTOMER_SITE_ENTITY_CONFIG);
    this.customerSiteService = service;
  }

  // ==================== REQUIRED ISPECIALCONTROLLER METHODS ====================

  /**
   * POST /api/customer-sites
   * Create new customer-site relationship
   * ✅ SIMPLIFIED: Required by ISpecialController interface
   */
  create = async (req: SpecialEntityRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const createData = req.body as CreateCustomerSiteRequest;

      console.log(`🔧 Creating customer-site relationship:`, createData, `[User: ${userId}]`);

      const result = await this.customerSiteService.create(createData, userId);

      if (result.success && result.data) {
        res.status(201).json({
          success: true,
          data: result.data,
          message: 'Customer-site relationship created successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error || 'Failed to create customer-site relationship',
          error: 'CREATE_FAILED'
        });
      }
    } catch (error) {
      console.error('❌ Error creating customer-site relationship:', error);
      next(error);
    }
  };

  /**
   * PUT /api/customer-sites/:code
   * Update customer-site relationship by single primary key
   * ✅ SIMPLIFIED: Required by ISpecialController interface
   */
  update = async (req: SpecialEntityRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const keyValues = req.params;
      const updateData = req.body as UpdateCustomerSiteRequest;

      console.log(`🔧 Updating customer-site relationship:`, keyValues, updateData, `[User: ${userId}]`);

      const result = await this.customerSiteService.update(keyValues, updateData, userId);

      if (result.success && result.data) {
        res.status(200).json({
          success: true,
          data: result.data,
          message: 'Customer-site relationship updated successfully'
        });
      } else if (result.error === 'Customer-Site relationship not found') {
        res.status(404).json({
          success: false,
          message: 'Customer-site relationship not found',
          error: 'NOT_FOUND'
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error || 'Failed to update customer-site relationship',
          error: 'UPDATE_FAILED'
        });
      }
    } catch (error) {
      console.error('❌ Error updating customer-site relationship:', error);
      next(error);
    }
  };

  /**
   * DELETE /api/customer-sites/:code
   * Delete customer-site relationship by single primary key
   * ✅ SIMPLIFIED: Required by ISpecialController interface
   */
  delete = async (req: SpecialEntityRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const keyValues = req.params;

      console.log(`🗑️ Deleting customer-site relationship:`, keyValues, `[User: ${userId}]`);

      const result = await this.customerSiteService.delete(keyValues, userId, (req as any).user ?? null, req);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Customer-site relationship deleted successfully'
        });
      } else if (result.error === 'Customer-Site relationship not found') {
        res.status(404).json({
          success: false,
          message: 'Customer-site relationship not found',
          error: 'NOT_FOUND'
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error || 'Failed to delete customer-site relationship',
          error: 'DELETE_FAILED'
        });
      }
    } catch (error) {
      console.error('❌ Error deleting customer-site relationship:', error);
      next(error);
    }
  };

  /**
   * GET /api/customer-sites
   * Get all customer-site relationships with pagination and filtering
   * ✅ SIMPLIFIED: Required by ISpecialController interface
   */
  getAll = async (req: SpecialEntityRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;

      // Parse query parameters
      let sortBy = req.query.sortBy as string || 'created_at';

      // Map frontend composite_key to backend field
      if (sortBy === 'composite_key') {
        sortBy = 'code'; // Use the code field for sorting
      }

      const queryParams: CustomerSiteQueryParams = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        search: req.query.search as string,
        sortBy: sortBy,
        sortOrder: (req.query.sortOrder as 'ASC' | 'DESC') || 'ASC',
        isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
        customerCode: req.query.customerCode as string,
        siteCode: req.query.siteCode as string
      };

      console.log(`📋 Getting customer-site relationships:`, queryParams, `[User: ${userId}]`);

      const result = await this.customerSiteService.getAll();

      if (result.success && result.data) {
        res.status(200).json({
          success: true,
          data: result.data,
          message: 'Customer-site relationships retrieved successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error || 'Failed to get customer-site relationships',
          error: 'GET_ALL_FAILED'
        });
      }
    } catch (error) {
      console.error('❌ Error getting customer-site relationships:', error);
      next(error);
    }
  };

 

  // ==================== SINGLE PRIMARY KEY HANDLING ====================

  /**
   * Extract single primary key values from route parameters
   * Handles /:code parameter pattern
   */
  protected extractPrimaryKeyValues(params: Record<string, any>): Record<string, any> {
    return {
      code: params.code
    };
  }

  // ==================== SIMPLIFIED CUSTOMER-SITE SPECIFIC ENDPOINTS ====================
 
  /**
   * GET /api/customer-sites/customer/:customerCode
   * Get all sites for a specific customer
   */
  getByCustomer = async (req: SpecialEntityRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const customerCode = req.params.customerCode;

      if (!customerCode) {
        res.status(400).json({
          success: false,
          message: 'Customer code is required',
          error: 'MISSING_CUSTOMER_CODE'
        });
        return;
      }

      const result = await this.customerSiteService.getByCustomer(customerCode, userId);

      if (result.success && result.data) {
        res.status(200).json({
          success: true,
          data: result.data,
          message: `Sites for customer ${customerCode} retrieved successfully`
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error || 'Failed to get sites for customer',
          error: 'GET_BY_CUSTOMER_FAILED'
        });
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/customer-sites/site/:siteCode
   * Get all customers for a specific site
   */
  getBySite = async (req: SpecialEntityRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const siteCode = req.params.siteCode;

      if (!siteCode) {
        res.status(400).json({
          success: false,
          message: 'Site code is required',
          error: 'MISSING_SITE_CODE'
        });
        return;
      }

      const result = await this.customerSiteService.getBySite(siteCode, userId);

      if (result.success && result.data) {
        res.status(200).json({
          success: true,
          data: result.data,
          message: `Customers for site ${siteCode} retrieved successfully`
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error || 'Failed to get customers for site',
          error: 'GET_BY_SITE_FAILED'
        });
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/customer-sites/:code
   * Get customer-site relationship by primary key
   */
  getByKey = async (req: SpecialEntityRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const code = req.params.code;

      if (!code) {
        res.status(400).json({
          success: false,
          message: 'Code is required',
          error: 'MISSING_CODE'
        });
        return;
      }

      const keyValues = { code };
      const result = await this.customerSiteService.getByKey(keyValues, userId);

      if (result.success && result.data) {
        res.status(200).json({
          success: true,
          data: result.data,
          message: 'Customer-site relationship found'
        });
      } else if (result.error === 'Customer-Site relationship not found') {
        res.status(404).json({
          success: false,
          message: 'Customer-site relationship not found',
          error: 'NOT_FOUND'
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error || 'Failed to get customer-site relationship',
          error: 'LOOKUP_FAILED'
        });
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/customer-sites/check-relationship
   * Check if customer-site relationship exists by code
   */
  checkRelationshipExists = async (req: SpecialEntityRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { code } = req.body;

      if (!code) {
        res.status(400).json({
          success: false,
          message: 'Code is required',
          error: 'MISSING_CODE'
        });
        return;
      }

      const result = await this.customerSiteService.checkRelationshipExists(code, userId);

      if (result.success) {
        res.status(200).json({
          success: true,
          data: { exists: result.data },
          message: 'Relationship check completed'
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error || 'Failed to check relationship',
          error: 'CHECK_FAILED'
        });
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/customer-sites/generate-code
   * Generate suggested code for new customer-site relationship
   */
  generateSuggestedCode = async (req: SpecialEntityRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { customer_code, site_code } = req.body;

      if (!customer_code || !site_code) {
        res.status(400).json({
          success: false,
          message: 'Both customer_code and site_code are required',
          error: 'MISSING_PARAMETERS'
        });
        return;
      }

      const result = await this.customerSiteService.generateSuggestedCode(customer_code, site_code, userId);

      if (result.success && result.data) {
        res.status(200).json({
          success: true,
          data: { suggested_code: result.data },
          message: 'Code suggestion generated'
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error || 'Failed to generate code suggestion',
          error: 'GENERATION_FAILED'
        });
      }
    } catch (error) {
      next(error);
    }
  };

}

// ==================== SIMPLIFIED FACTORY FUNCTIONS ====================

/**
 * Factory function to create CustomerSite controller instance
 * ✅ SIMPLIFIED: Returns controller that implements ISpecialController
 */
export function createCustomerSiteController(service: CustomerSiteService): CustomerSiteController {
  return new CustomerSiteController(service);
}

/**
 * Alternative factory using base service (for consistency)
 * ✅ SIMPLIFIED: Proper interface implementation
 */
export function createCustomerSiteControllerGeneric(service: CustomerSiteService): ISpecialController {
  return new CustomerSiteController(service);
}

export default CustomerSiteController;
 