// server/src/entities/customer/routes.ts

/**
 * Customer Entity Routes Implementation
 
 * 
 * This module implements Customer routes following the VARCHAR CODE pattern.
 * Customer routes provide HTTP endpoint definitions for Customer entity.
 
 */

import { Router, Request, Response, NextFunction } from 'express';


import validateVarcharCode, { createVarcharCodeRoutes } from '../../generic/entities/varchar-code-entity/generic-routes';

import {
  requireAuthentication,
  requireAdmin,
  requireManager,
  requireUser,
  requestTracking
} from '../../middleware/auth';
import {
  Customer,
  CustomerEntityConfig
} from './types';

import { CustomerController } from './controller';
import { CustomerService } from './service';
import { createCustomerModel } from './model';
import { getDrizzle } from '../../config/database';

// ==================== FACTORY FUNCTIONS ====================

/**
 * Main factory function for Customer routes with controller
 */
export function createCustomerRoutes(controller: CustomerController): Router {
  const customerRoutes = new CustomerRoutes(controller);
  return customerRoutes.getRouter();
}

/**
 * Default export for EntityAutoDiscovery compatibility
 * Auto-discovers and configures complete Customer entity stack
 */
export default function createCustomerRoutesWithDb(_db?: any): Router {
  const customerModel = createCustomerModel(getDrizzle());
  const customerService = new CustomerService(customerModel as any);
  const customerController = new CustomerController(customerService);

  return createCustomerRoutes(customerController);
}

// ==================== CUSTOMER ROUTES CLASS ====================

/**
 * Customer Routes Class - Express routing for Customer entity
 * ✅ FIXED: Uses proper route ordering to prevent conflicts
 * ✅ Uses composition approach with generic VARCHAR CODE factory functions
 * ✅ All route handlers use standard Express Request type
 */
export class CustomerRoutes {
  
  private router: Router;
  private controller: CustomerController;

  constructor(controller: CustomerController) {
    this.router = Router();
    this.controller = controller;
    this.setupRoutes();
  }

  /**
   * Get the configured router
   */
  getRouter(): Router {
    return this.router;
  }

  /**
   * Setup all routes using composition approach
   * ✅ FIXED: Critical route order - specific routes BEFORE generic routes
   */
  private setupRoutes(): void {
    // ✅ FIXED: Setup Customer specific routes FIRST
    this.setupCustomerSpecificRoutes();
    
    // ✅ FIXED: Setup generic VARCHAR CODE entity routes AFTER specific routes
    this.setupGenericRoutes();
  }

  /**
   * Setup Customer specific routes FIRST to prevent conflicts
   * ✅ FIXED: These routes must be registered before generic /:code routes
   */
  private setupCustomerSpecificRoutes(): void {
    this.router.use(requestTracking);

    /**
     * GET /api/customers/statistics  
     * Get customer statistics for manufacturing dashboard
     * ✅ FIXED: Registered BEFORE /:code route to prevent conflict
     */
    this.router.get('/statistics',
      requireAuthentication,
      requireUser,
      (req: Request, res: Response, next: NextFunction) => {
        this.controller.getStatistics(req as any, res, next);
      }
    );

 

    /**
     * POST /api/customers/check-code
     * Check if customer code is available
     * ✅ FIXED: Registered BEFORE /:code route to prevent conflict
     */
    this.router.post('/check-code',
      requireAuthentication,
      requireManager,
      (req: Request, res: Response, next: NextFunction) => {
        this.controller.checkCodeAvailability(req as any, res, next);
      }
    );

    /**
     * GET /api/customers/search/name/:pattern
     * Search customers by name pattern
     * ✅ FIXED: Registered BEFORE /:code route to prevent conflict
     */
    this.router.get('/search/name/:pattern',
      requireAuthentication,
      requireUser,
      (req: Request, res: Response, next: NextFunction) => {
        this.controller.search(req as any, res, next);
      }
    );

 
    // ==================== CUSTOMER-SPECIFIC ROUTES WITH :code PARAMETER ====================
    // These routes can come after generic routes since they have additional path segments

    /**
     * GET /api/customers/:code/operational-status
     * Check customer operational status
     */
    this.router.get('/:code/operational-status',
      requireAuthentication,
      requireUser,
      (req: Request, res: Response, next: NextFunction) => {
        this.controller.checkOperationalStatus(req as any, res, next);
      }
    );

    /**
     * GET /api/customers/:code/deletion-check
     * Check if Customer can be safely deleted
     */
    this.router.get('/:code/deletion-check',
      requireAuthentication,
      requireManager,
      (req: Request, res: Response, next: NextFunction) => {
        this.controller.checkDeletionEligibility(req as any, res, next);
      }
    );

    /**
     * GET /api/customers/:code/sites
     * Get all sites for a specific customer
     */
    /*
    this.router.get('/:code/sites',
      requireAuthentication,
      requireUser,
      (req: Request, res: Response, next: NextFunction) => {
        this.controller.getCustomerSites(req as any, res, next);
      }
    );
*/
 
 
  }

  /**
   * Setup generic VARCHAR CODE entity routes using factory function
   * ✅ FIXED: These are registered AFTER specific routes to prevent conflicts
   */
  private setupGenericRoutes(): void {
    const genericRouter = createVarcharCodeRoutes<Customer>(this.controller, CustomerEntityConfig);
    this.router.use('/', genericRouter);
  }
}

// ==================== ADDITIONAL FACTORY FUNCTIONS ====================

/**
 * Alternative factory using generic pattern only
 */
export function createCustomerRoutesGeneric(controller: CustomerController): Router {
  return createVarcharCodeRoutes<Customer>(controller, CustomerEntityConfig);
}

/**
 * Factory function to create Customer routes with custom role configuration
 */
export function createCustomerRoutesWithCustomRoles(
  controller: CustomerController,
  roleConfig?: {
    create?: typeof requireManager | typeof requireAdmin;
    read?: typeof requireUser | typeof requireManager | typeof requireAdmin;
    update?: typeof requireManager | typeof requireAdmin;
    delete?: typeof requireAdmin;
    statistics?: typeof requireUser | typeof requireManager | typeof requireAdmin;
    deletionCheck?: typeof requireManager | typeof requireAdmin;
    operationalStatus?: typeof requireUser | typeof requireManager | typeof requireAdmin;
  }
): Router {
  // Implementation would customize role requirements per operation
  return createCustomerRoutes(controller);
}
 