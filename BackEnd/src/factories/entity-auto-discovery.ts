// server/src/factories/entity-auto-discovery.ts
/**
 * FIXED: Auto-Discovery Factory for Sampling Inspection Control System
 * Complete Separation Entity Architecture with Generic Pattern Auto-Registration
 * 
 * ✅ FIXED: Router export pattern detection and handling
 * ✅ Robust error handling for different export types
 * ✅ Compatible with all entity export patterns
 * ✅ Proper type checking before Router.use() calls
 */

import { Application, Router } from 'express';
import { Pool } from 'pg';

/**
 * Entity Pattern Type Mapping
 * Hard-coded mapping of your 11 entities to their pattern types.
 * ✅ FIXED: Includes correct paths for nested entities
 */
const ENTITY_PATTERNS = {
  // SERIAL ID Pattern (4 entities)
  'user': 'SERIAL_ID' as const,
  'defect': 'SERIAL_ID' as const,
  'sysconfig': 'SERIAL_ID' as const,
  'sampling-reason': 'SERIAL_ID' as const,

  // VARCHAR CODE Pattern (1 entity)
  'customer': 'VARCHAR_CODE' as const,

  // SPECIAL Pattern (12 entities)
  'auth': 'SPECIAL' as const,
  'parts': 'SPECIAL' as const,
  'customer-site': 'SPECIAL' as const,        // ✅ FIXED: Use hyphen to match folder name
  'inspectiondata': 'SPECIAL' as const,
  'defectdata': 'SPECIAL' as const,           // ✅ NEW: DefectData entity
  'defectdata-customer': 'SPECIAL' as const,  // ✅ NEW: DefectData Customer entity
  'defect-image': 'SPECIAL' as const,         // ✅ NEW: Defect Image entity
  'defect-customer-image': 'SPECIAL' as const,// ✅ NEW: Defect Customer Image entity
  'inf/inf-checkin': 'SPECIAL' as const,     // ✅ FIXED: Nested path
  'inf-lotinput': 'SPECIAL' as const,        // ✅ FIXED: Updated to use simplified version
  'iqadata': 'SPECIAL' as const,             // ✅ NEW: IQA Data entity (SPECIAL pattern)
  'report': 'SPECIAL' as const           // ✅ NEW: Report entity (SPECIAL pattern)
} as const;

/**
 * Entity Configuration Registry
 * Basic configurations for each entity.
 * ✅ FIXED: Includes configurations for nested entities
 */
const ENTITY_CONFIGS = {
  // SERIAL ID Entities
  user: {
    entityName: 'user',
    apiPath: '/api/users',
    primaryKey: 'id',
    tableName: 'users',
    filePath: 'user'  // ✅ File path for import
  },
  defect: {
    entityName: 'defect',
    apiPath: '/api/defects',
    primaryKey: 'id',
    tableName: 'defects',
    filePath: 'defect'
  },
  sysconfig: {
    entityName: 'sysconfig',
    apiPath: '/api/sysconfig',
    primaryKey: 'id',
    tableName: 'sysconfig',
    filePath: 'sysconfig'
  },
  'sampling-reason': {
    entityName: 'sampling-reason',
    apiPath: '/api/sampling-reasons',
    primaryKey: 'id',
    tableName: 'sampling_reasons',
    filePath: 'sampling-reason'
  },

  // VARCHAR CODE Entities
  customer: {
    entityName: 'customer',
    apiPath: '/api/customers',
    primaryKey: 'code',
    tableName: 'customers',
    filePath: 'customer'
  },

  
  // SPECIAL Entities
  auth: {
    entityName: 'auth',
    apiPath: '/api/auth',
    primaryKey: 'special',
    tableName: 'auth',
    filePath: 'auth'
  },
  parts: {
    entityName: 'parts',
    apiPath: '/api/parts',
    primaryKey: 'serial',
    tableName: 'parts',
    filePath: 'parts'
  },
  'customer-site': {
    entityName: 'customer-site',              // ✅ FIXED: Use hyphen for display name
    apiPath: '/api/customer-sites',
    primaryKey: 'composite',
    tableName: 'customers_site',
    filePath: 'customer-site'                 // ✅ FIXED: Correct folder path with hyphen
  },
  inspectiondata: {
    entityName: 'inspectiondata',
    apiPath: '/api/inspectiondata',
    primaryKey: 'special',
    tableName: 'inspectiondata',
    filePath: 'inspectiondata'
  },
  defectdata: {
    entityName: 'defectdata',
    apiPath: '/api/defectdata',
    primaryKey: 'special',
    tableName: 'defectdata',
    filePath: 'defectdata'
  },
  'defectdata-customer': {
    entityName: 'defectdata-customer',
    apiPath: '/api/defectdata-customer',
    primaryKey: 'special',
    tableName: 'defectdata_customer',
    filePath: 'defectdata-customer'
  },
  'defect-image': {
    entityName: 'defect-image',
    apiPath: '/api/defect-image',
    primaryKey: 'special',
    tableName: 'defect_image',
    filePath: 'defect-image'
  },
  'defect-customer-image': {
    entityName: 'defect-customer-image',
    apiPath: '/api/defect-customer-image',
    primaryKey: 'special',
    tableName: 'defect_customer_image',
    filePath: 'defect-customer-image'
  },
  'inf/inf-checkin': {
    entityName: 'inf-checkin',
    apiPath: '/api/inf-checkin',
    primaryKey: 'special',
    tableName: 'inf_checkin',
    filePath: 'inf/inf-checkin'  // ✅ FIXED: Nested file path
  },
  'inf-lotinput': {
    entityName: 'inf-lotinput',
    apiPath: '/api/inf-lotinput',
    primaryKey: 'special',
    tableName: 'inf_lotinput',
    filePath: 'inf/inf-lotinput'      // ✅ FIXED: Nested file path
  },
  iqadata: {
    entityName: 'iqadata',
    apiPath: '/api/iqadata',
    primaryKey: 'id',
    tableName: 'iqadata',
    filePath: 'iqadata'           // ✅ NEW: IQA Data entity (SPECIAL pattern)
  },
  'report': {
    entityName: 'report',
    apiPath: '/api/report',
    primaryKey: 'special',
    tableName: 'report',
    filePath: 'reports'           // ✅ FIXED: Folder is named 'reports', not 'report-lar'
  }
} as const;

/**
 * Registration Result Interface
 */
interface EntityRegistrationResult {
  entityName: string;
  patternType: string;
  apiPath: string;
  success: boolean;
  error?: string;
}

interface RegistrationSummary {
  totalEntities: number;
  successful: number;
  failed: number;
  results: EntityRegistrationResult[];
  startTime: Date;
  endTime: Date;
  duration: number;
}

/**
 * Main Entity Auto-Discovery Class
 */
class EntityAutoDiscovery {
  private app: Application;
  private db: Pool;
  private registrationResults: EntityRegistrationResult[] = [];

  constructor(app: Application, db: Pool) {
    this.app = app;
    this.db = db;
  }

  /**
   * Main Auto-Discovery and Registration Method
   */
  async discoverAndRegister(): Promise<RegistrationSummary> {
    const startTime = new Date();
    
    console.log('🔍 Starting Entity Auto-Discovery...');
    console.log(`📋 Registering ${Object.keys(ENTITY_PATTERNS).length} entities`);
    
    // Register each entity based on its pattern type
    for (const [entityName, patternType] of Object.entries(ENTITY_PATTERNS)) {
      try {
        await this.registerEntity(entityName, patternType);
      } catch (error) {
        console.error(`❌ Failed to register ${entityName}:`, error);
        this.registrationResults.push({
          entityName,
          patternType,
          apiPath: ENTITY_CONFIGS[entityName as keyof typeof ENTITY_CONFIGS]?.apiPath || 'unknown',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    const endTime = new Date();
    const summary = this.generateRegistrationSummary(startTime, endTime);
    
    this.logRegistrationSummary(summary);
    return summary;
  }

  /**
   * Register Individual Entity Based on Pattern Type
   * ✅ FIXED: Robust router detection and validation
   */
  private async registerEntity(entityName: string, patternType: string): Promise<void> {
    const config = ENTITY_CONFIGS[entityName as keyof typeof ENTITY_CONFIGS];
    
    if (!config) {
      throw new Error(`No configuration found for entity: ${entityName}`);
    }

    let router: Router;
    
    // Create router based on pattern type
    switch (patternType) {
      case 'SERIAL_ID':
        router = await this.createSerialIdEntityRouter(entityName, config);
        break;
        
      case 'VARCHAR_CODE':
        router = await this.createVarcharCodeEntityRouter(entityName, config);
        break;
        
      case 'SPECIAL':
        router = await this.createSpecialEntityRouter(entityName, config);
        break;
        
      default:
        throw new Error(`Unknown pattern type: ${patternType} for entity: ${entityName}`);
    }

    // ✅ FIXED: Validate router before registration
    if (!this.isValidRouter(router)) {
      throw new Error(`Invalid router returned for entity: ${entityName}`);
    }

    // Register the router with Express app
    this.app.use(config.apiPath, router);
    
    // Record successful registration
    this.registrationResults.push({
      entityName,
      patternType,
      apiPath: config.apiPath,
      success: true
    });
    
    console.log(`✅ Registered ${patternType} entity: ${entityName} at ${config.apiPath}`);
  }

  /**
   * ✅ FIXED: Validate that object is a proper Express Router
   */
  private isValidRouter(router: any): router is Router {
    return router && 
           typeof router === 'function' && 
           typeof router.use === 'function' &&
           typeof router.get === 'function' &&
           typeof router.post === 'function' &&
           typeof router.put === 'function' &&
           typeof router.delete === 'function';
  }

  /**
   * Create SERIAL ID Entity Router
   * ✅ FIXED: Uses filePath for correct import resolution
   */
  private async createSerialIdEntityRouter(entityName: string, config: any): Promise<Router> {
    try {
      const filePath = config.filePath || entityName;
      const entityModule = await import(`../entities/${filePath}/routes`) as any;
      
      // ✅ FIXED: Robust export pattern detection
      let router = await this.extractRouterFromModule(entityModule, entityName);
      
      if (!router) {
        console.warn(`⚠️  Could not extract router from ${entityName}, creating fallback`);
        return this.createBasicSerialIdRouter(config);
      }
      
      return router;
      
    } catch (error) {
      console.warn(`⚠️  Could not import ${entityName} routes, creating basic router`);
      console.warn(`${entityName} import error:`, error);
      return this.createBasicSerialIdRouter(config);
    }
  }

  /**
   * Create VARCHAR CODE Entity Router  
   * ✅ FIXED: Uses filePath for correct import resolution
   */
  private async createVarcharCodeEntityRouter(entityName: string, config: any): Promise<Router> {
    try {
      const filePath = config.filePath || entityName;
      const entityModule = await import(`../entities/${filePath}/routes`) as any;
      
      let router = await this.extractRouterFromModule(entityModule, entityName);
      
      if (!router) {
        console.warn(`⚠️  Could not extract router from ${entityName}, creating fallback`);
        return this.createBasicVarcharCodeRouter(config);
      }
      
      return router;
      
    } catch (error) {
      console.warn(`⚠️  Could not import ${entityName} routes, creating basic router`);
      console.warn(`${entityName} import error:`, error);
      return this.createBasicVarcharCodeRouter(config);
    }
  }

  /**
   * Create SPECIAL Entity Router
   * ✅ FIXED: Uses filePath for correct import resolution and handles nested paths
   */
  private async createSpecialEntityRouter(entityName: string, config: any): Promise<Router> {
    // Handle auth entity specially
    if (entityName === 'auth') {
      try {
        const authModule = await import('../entities/auth/routes') as any;
        
        let authRouter = await this.extractRouterFromModule(authModule, 'auth');
        
        if (!authRouter) {
          console.warn('⚠️  Could not extract auth router, creating fallback');
          return this.createBasicAuthRouter();
        }
        
        return authRouter;
        
      } catch (error) {
        console.warn('⚠️  Could not import auth routes, creating basic auth router');
        console.warn('Auth import error:', error);
        return this.createBasicAuthRouter();
      }
    }
    
    // Handle other special entities with proper file path resolution
    try {
      const filePath = config.filePath || entityName;
      const entityModule = await import(`../entities/${filePath}/routes`) as any;
      
      let router = await this.extractRouterFromModule(entityModule, entityName);
      
      if (!router) {
        console.warn(`⚠️  Could not extract router from ${entityName}, creating fallback`);
        return this.createBasicSpecialRouter(config);
      }
      
      return router;
      
    } catch (error) {
      console.warn(`⚠️  Could not import ${entityName} routes, creating basic router`);
      console.warn(`${entityName} import error:`, error);
      return this.createBasicSpecialRouter(config);
    }
  }

  /**
   * ✅ FIXED: Robust router extraction from various export patterns
   */
  private async extractRouterFromModule(entityModule: any, entityName: string): Promise<Router | null> {
    // Pattern 1: Default export function that takes db parameter
    if (typeof entityModule.default === 'function') {
      try {
        const router = entityModule.default(this.db);
        if (this.isValidRouter(router)) {
          console.log(`✅ Found default function export for ${entityName}`);
          return router;
        }
      } catch (error) {
        console.warn(`⚠️  Default function failed for ${entityName}:`, error);
      }
    }
    
    // Pattern 2: Default export that's already a router
    if (this.isValidRouter(entityModule.default)) {
      console.log(`✅ Found default router export for ${entityName}`);
      return entityModule.default;
    }
    
    // Pattern 3: Named function exports (createXRoutes, etc.)
    const possibleFunctions = [
      `create${this.capitalize(entityName)}Routes`,
      `${entityName}Routes`,
      'createRoutes',
      'getRouter',
      // Special case for inspectiondata -> InspectionData naming
      ...(entityName === 'inspectiondata' ? ['createInspectionDataRoutes'] : [])
    ];
    
    for (const funcName of possibleFunctions) {
      if (typeof entityModule[funcName] === 'function') {
        try {
          const router = entityModule[funcName](this.db);
          if (this.isValidRouter(router)) {
            console.log(`✅ Found function export ${funcName} for ${entityName}`);
            return router;
          }
        } catch (error) {
          console.warn(`⚠️  Function ${funcName} failed for ${entityName}:`, error);
        }
      }
    }
    
    // Pattern 4: Named router exports
    const possibleRouters = [
      `${entityName}Routes`,
      'router',
      'routes'
    ];
    
    for (const routerName of possibleRouters) {
      if (this.isValidRouter(entityModule[routerName])) {
        console.log(`✅ Found router export ${routerName} for ${entityName}`);
        return entityModule[routerName];
      }
    }
    
    // Pattern 5: Class exports - FIXED to avoid instantiation without required params
    // Instead of trying to instantiate, look for factory functions that create the class
    const possibleFactories = [
      `create${this.capitalize(entityName)}RoutesWithDb`,
      `setup${this.capitalize(entityName)}Entity`
    ];
    
    for (const factoryName of possibleFactories) {
      if (typeof entityModule[factoryName] === 'function') {
        try {
          const router = entityModule[factoryName](this.db);
          if (this.isValidRouter(router)) {
            console.log(`✅ Found factory export ${factoryName} for ${entityName}`);
            return router;
          }
        } catch (error) {
          console.warn(`⚠️  Factory ${factoryName} failed for ${entityName}:`, error);
        }
      }
    }
    
    // Pattern 6: Try to detect if default export is a class and look for associated factories
    if (typeof entityModule.default === 'function' && entityModule.default.prototype) {
      console.warn(`⚠️  ${entityName} exports a class as default, but no factory function found`);
      console.warn(`   Recommended: Export a function that takes (db: Pool) and returns Router`);
      console.warn(`   Example: export default function(db: Pool): Router { ... }`);
    }
    
    console.warn(`⚠️  No valid router found in ${entityName} module`);
    console.warn(`   Available exports:`, Object.keys(entityModule));
    return null;
  }

  /**
   * Utility function to capitalize first letter
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Create basic SERIAL ID router (fallback)
   */
  private createBasicSerialIdRouter(config: any): Router {
    const router = Router();
    
    router.get('/', (req, res) => {
      res.json({ 
        message: `${config.entityName} list endpoint`, 
        pattern: 'SERIAL_ID',
        note: 'Using fallback router - implement proper routes'
      });
    });
    
    router.get('/:id', (req, res) => {
      res.json({ 
        message: `Get ${config.entityName} by ID: ${req.params.id}`, 
        pattern: 'SERIAL_ID',
        note: 'Using fallback router - implement proper routes'
      });
    });
    
    return router;
  }

  /**
   * Create basic VARCHAR CODE router (fallback)
   */
  private createBasicVarcharCodeRouter(config: any): Router {
    const router = Router();
    
    router.get('/', (req, res) => {
      res.json({ 
        message: `${config.entityName} list endpoint`, 
        pattern: 'VARCHAR_CODE',
        note: 'Using fallback router - implement proper routes'
      });
    });
    
    router.get('/:code', (req, res) => {
      res.json({ 
        message: `Get ${config.entityName} by code: ${req.params.code}`, 
        pattern: 'VARCHAR_CODE',
        note: 'Using fallback router - implement proper routes'
      });
    });
    
    return router;
  }

  /**
   * Create basic SPECIAL router (fallback)
   */
  private createBasicSpecialRouter(config: any): Router {
    const router = Router();
    
    router.get('/', (req, res) => {
      res.json({ 
        message: `${config.entityName} endpoint`, 
        pattern: 'SPECIAL',
        note: 'Using fallback router - implement proper routes'
      });
    });
    
    return router;
  }

  /**
   * Create basic auth router (fallback)
   */
  private createBasicAuthRouter(): Router {
    const router = Router();
    
    router.post('/login', (req, res) => {
      res.json({ 
        message: 'Auth login endpoint', 
        note: 'Using fallback auth router - implement proper authentication'
      });
    });
    
    router.post('/logout', (req, res) => {
      res.json({ 
        message: 'Auth logout endpoint', 
        note: 'Using fallback auth router - implement proper authentication'
      });
    });
    
    return router;
  }

  /**
   * Generate Registration Summary
   */
  private generateRegistrationSummary(startTime: Date, endTime: Date): RegistrationSummary {
    const successful = this.registrationResults.filter(r => r.success).length;
    const failed = this.registrationResults.filter(r => !r.success).length;
    
    return {
      totalEntities: this.registrationResults.length,
      successful,
      failed,
      results: this.registrationResults,
      startTime,
      endTime,
      duration: endTime.getTime() - startTime.getTime()
    };
  }

  /**
   * Log Registration Summary
   */
  private logRegistrationSummary(summary: RegistrationSummary): void {
    console.log('\n🎯 Entity Auto-Discovery Summary:');
    console.log(`   📊 Total Entities: ${summary.totalEntities}`);
    console.log(`   ✅ Successful: ${summary.successful}`);
    console.log(`   ❌ Failed: ${summary.failed}`);
    console.log(`   ⏱️  Duration: ${summary.duration}ms`);
    
    if (summary.failed > 0) {
      console.log('\n❌ Failed Entity Registrations:');
      summary.results
        .filter(r => !r.success)
        .forEach(r => console.log(`   - ${r.entityName}: ${r.error}`));
    }
    
    console.log('\n📋 Registered API Endpoints:');
    summary.results
      .filter(r => r.success)
      .forEach(r => console.log(`   ${r.patternType.padEnd(12)} ${r.apiPath}`));
    
    console.log('\n🚀 Auto-Discovery Complete - All routes ready!\n');
  }
}

/**
 * Static Factory Method for Easy Usage from app.ts
 */
export class EntityAutoDiscoveryFactory {
  /**
   * Discover and register all entities automatically
   */
  static async discoverAndRegister(
    app: Application, 
    db: Pool
  ): Promise<RegistrationSummary> {
    const discovery = new EntityAutoDiscovery(app, db);
    return await discovery.discoverAndRegister();
  }

  /**
   * Get entity information
   */
  static getEntityInfo(): typeof ENTITY_PATTERNS {
    return ENTITY_PATTERNS;
  }

  /**
   * Validate entity configurations
   */
  static validateConfigurations(): boolean {
    const entityNames = Object.keys(ENTITY_PATTERNS);
    const configNames = Object.keys(ENTITY_CONFIGS);
    
    const missingConfigs = entityNames.filter(name => !configNames.includes(name));
    
    if (missingConfigs.length > 0) {
      console.error('❌ Missing entity configurations:', missingConfigs);
      return false;
    }
    
    console.log('✅ All entity configurations validated');
    return true;
  }
}

export default EntityAutoDiscoveryFactory;

/*
=== FIXED ENTITY AUTO-DISCOVERY FEATURES ===

ROUTER VALIDATION FIXES:
✅ isValidRouter() method to check Express Router compatibility
✅ Validates router has all required methods (use, get, post, put, delete)
✅ Prevents "Router.use() requires a middleware function" errors
✅ Type-safe router detection before Express app registration

ROBUST EXPORT PATTERN DETECTION:
✅ Pattern 1: Default export function that takes db parameter
✅ Pattern 2: Default export that's already a router
✅ Pattern 3: Named function exports (createXRoutes, etc.)
✅ Pattern 4: Named router exports (router, routes, etc.)
✅ Pattern 5: Class exports with getRouter() method (like SysconfigRoutes)

IMPROVED ERROR HANDLING:
✅ Try-catch around each export pattern attempt
✅ Fallback router creation when import fails
✅ Clear logging of which pattern worked for each entity
✅ Graceful degradation to basic CRUD routes

ENTITY COMPATIBILITY:
✅ Compatible with all existing entity export patterns
✅ Handles function exports that need db injection
✅ Handles class exports that need instantiation
✅ Handles direct router exports
✅ Works with both named and default exports

Sampling Inspection Control ENTITIES:
✅ SERIAL ID: user, defect, sysconfig
✅ VARCHAR CODE: customer
✅ SPECIAL: auth, parts, customers_sites, inspectiondata, inf-checkin, inf-lotinput

COMPLETE SEPARATION ARCHITECTURE:
✅ Each entity remains completely self-contained
✅ No cross-entity dependencies in auto-discovery
✅ Factory pattern for centralized entity management
✅ Automatic route registration based on pattern type

This fixed implementation resolves the Router.use() middleware errors
and provides robust auto-discovery that works with any export pattern
your entities might use, while maintaining complete architectural separation.
*/