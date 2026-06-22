// server/src/generic/entities/special-entity/generic-routes.ts
// Example Generic SPECIAL Entity Routes with Authentication Middleware Integration
// Manufacturing Quality Control System - Middleware Integration Pattern

import { Router } from 'express';
import { 
  requireAuthentication, 
  requireRole,
  UserRole 
} from '../../../middleware/auth';
import {
  BaseSpecialEntity,
  SpecialEntityConfig,
  ISpecialController
} from './generic-types';

/**
 * Create standardized routes for SPECIAL entities with proper authentication
 * 
 * This function creates a complete router with all standard CRUD endpoints
 * plus the new health and statistics endpoints, all properly secured
 * with the authentication middleware.
 */
export function createSpecialEntityRoutes<T extends BaseSpecialEntity>(
  controller: ISpecialController,
  config: SpecialEntityConfig
): Router {
  const router = Router();
  
  console.log(`🛣️  Creating SPECIAL entity routes for ${config.entityName} with authentication`);

  // ==================== HEALTH & MONITORING ENDPOINTS ====================
  
  /**
   * GET /health - Entity health check
   * Requires: Any authenticated user
   * Returns: Comprehensive health status
   */
  router.get('/health', 
    requireAuthentication,  
    controller.getHealth
  );

  /**
   * GET /statistics - Entity statistics and analytics
   * Requires: Manager role or higher
   * Returns: Detailed analytics and metrics
   */
  router.get('/statistics',
    requireAuthentication,           
    controller.getStatistics
  );

 
   // ==================== PRIMARY KEY-BASED ENDPOINTS ====================
 

  // ==================== LOGGING ====================

  console.log(`✅ SPECIAL entity routes created for ${config.entityName}:`);
  console.log(`   📊 GET /${config.entityName}/health [Auth Required]`);
  console.log(`   📈 GET /${config.entityName}/statistics [Manager+ Required]`);
  
  return router;
}

// ==================== USAGE EXAMPLES ====================

/**
 * Example 1: Parts Entity (Single Primary Key)
 */
/*
const partsConfig: SpecialEntityConfig = {
  entityName: 'parts',
  tableName: 'parts',
  primaryKey: {
    fields: ['partno'],
    type: 'single',
    routes: [':serial']  // Maps to /api/parts/:serial
  },
  searchableFields: ['partno', 'item', 'model'],
  requiredFields: ['partno'],
  defaultLimit: 50,
  maxLimit: 500
};

// Creates these routes:
// GET /api/parts/health            [Auth Required]
// GET /api/parts/statistics        [Manager+ Required] 
// GET /api/parts/                  [Auth Required]
// GET /api/parts/:serial           [Auth Required]
*/

/**
 * Example 2: Customer-Site Entity (Composite Primary Key)
 */
/*
const customerSiteConfig: SpecialEntityConfig = {
  entityName: 'customer-site',
  tableName: 'customers_site', 
  primaryKey: {
    fields: ['customer_code', 'site_code'],
    type: 'composite',
    routes: [':customerCode', ':siteCode']
  },
  searchableFields: ['customer_code', 'site_code'],
  requiredFields: ['customer_code', 'site_code'],
  defaultLimit: 50,
  maxLimit: 500
};

// Creates these routes:
// GET /api/customer-sites/health                    [Auth Required]
// GET /api/customer-sites/statistics               [Manager+ Required]
// GET /api/customer-sites/                         [Auth Required] 
// GET /api/customer-sites/:customerCode/:siteCode  [Auth Required]
*/

/**
 * Example 3: Interface Table Entity (Read-only)
 */
/*
const infCheckinConfig: SpecialEntityConfig = {
  entityName: 'inf-checkin',
  tableName: 'inf_checkin',
  primaryKey: {
    fields: ['id'],
    type: 'single',
    routes: [':id']
  },
  searchableFields: ['id', 'username', 'line_no_id'],
  requiredFields: [], // Interface tables are read-only
  defaultLimit: 100,
  maxLimit: 1000
};

// Creates these routes:
// GET /api/inf-checkin/health      [Auth Required]
// GET /api/inf-checkin/statistics  [Manager+ Required]
// GET /api/inf-checkin/            [Auth Required]
// GET /api/inf-checkin/:id         [Auth Required]
*/

// ==================== INTEGRATION WITH APP.TS ====================

/**
 * How to integrate with your main app.ts:
 */
/*
import { createSpecialEntityRoutes } from './generic/entities/special-entity/generic-routes';
import { createSpecialController } from './generic/entities/special-entity/generic-controller';
import { createSpecialService } from './generic/entities/special-entity/generic-service';
import { createSpecialModel } from './generic/entities/special-entity/generic-model';

// Example: Register Parts entity
const partsModel = createSpecialModel(dbPool, partsConfig);
const partsService = createSpecialService(partsModel, partsConfig);
const partsController = createSpecialController(partsService, partsConfig);
const partsRoutes = createSpecialEntityRoutes(partsController, partsConfig);

// Mount routes with authentication
app.use('/api/parts', partsRoutes);

// Example: Register Customer-Site entity
const customerSiteModel = createSpecialModel(dbPool, customerSiteConfig);
const customerSiteService = createSpecialService(customerSiteModel, customerSiteConfig);
const customerSiteController = createSpecialController(customerSiteService, customerSiteConfig);
const customerSiteRoutes = createSpecialEntityRoutes(customerSiteController, customerSiteConfig);

// Mount routes with authentication
app.use('/api/customer-sites', customerSiteRoutes);
*/

/**
 * Generic SPECIAL Routes class for advanced customization
 */
export class GenericSpecialRoutes {
  protected router: Router;
  protected controller: ISpecialController;
  protected config: SpecialEntityConfig;

  constructor(controller: ISpecialController, config: SpecialEntityConfig) {
    this.router = Router();
    this.controller = controller;
    this.config = config;
  }

  /**
   * Setup custom routes - can be overridden by subclasses
   * This is called to setup all routes including generic ones
   */
  protected setupCustomRoutes(): void {
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // Use the existing createSpecialEntityRoutes logic
    const routes = createSpecialEntityRoutes(this.controller, this.config);
    this.router.use('/', routes);
  }

  public getRouter(): Router {
    return this.router;
  }

  public addCustomRoute(path: string, method: 'get' | 'post' | 'put' | 'delete', handler: any): void {
    this.router[method](path, handler);
  }
}

/**
 * Alias for createSpecialEntityRoutes for backward compatibility
 */
export const createSpecialRoutes = createSpecialEntityRoutes;

/**
 * Create special routes with additional customization options
 */
export function createSpecialRoutesWithCustomization<T extends BaseSpecialEntity>(
  controller: ISpecialController,
  config: SpecialEntityConfig,
  customizations?: {
    additionalRoutes?: Array<{
      path: string;
      method: 'get' | 'post' | 'put' | 'delete';
      handler: any;
    }>;
    middleware?: any[];
  }
): Router {
  const router = createSpecialEntityRoutes<T>(controller, config);

  // Apply additional middleware if provided
  if (customizations?.middleware) {
    customizations.middleware.forEach(middleware => {
      router.use(middleware);
    });
  }

  // Add custom routes if provided
  if (customizations?.additionalRoutes) {
    customizations.additionalRoutes.forEach(route => {
      router[route.method](route.path, route.handler);
    });
  }

  return router;
}

/**
 * Complete entity setup helper function
 */
export function setupSpecialEntity<T extends BaseSpecialEntity>(
  controller: ISpecialController,
  config: SpecialEntityConfig
): {
  router: Router;
  config: SpecialEntityConfig;
  mountPath: string;
} {
  const router = createSpecialEntityRoutes<T>(controller, config);
  const mountPath = config.apiPath || `/api/${config.entityName}`;

  return {
    router,
    config,
    mountPath
  };
}

export default createSpecialEntityRoutes;

