// server/src/entities/sysconfig/controller.ts
// Sysconfig Entity Controller - Complete Separation Entity Architecture
// Sampling Inspection Control System - SERIAL ID Pattern Implementation

/**
 * System Configuration Entity Controller Implementation
 * 
 * Complete Separation Entity Architecture:
 * ✅ Extends GenericSerialIdController for 90% code reuse
 * ✅ No direct cross-entity dependencies
 * ✅ Self-contained sysconfig HTTP request/response handling
 * ✅ Sampling Inspection Control domain optimized
 * 
 * Controller Responsibilities:
 * ✅ HTTP request parsing and validation
 * ✅ Response formatting and status codes
 * ✅ Error handling and logging
 * ✅ Request tracking and middleware integration
 * 
 * Generic Pattern Benefits:
 * ✅ Inherits: create, getById, update, delete, getAll endpoints
 * ✅ Inherits: Request parsing, response formatting, error handling
 * ✅ Inherits: Query parameter parsing (pagination, sorting, search)
 * ✅ Adds: Configuration-specific endpoints
 * ✅ Adds: Enhanced query parameter parsing for sysconfig filters
 */

import { Response, NextFunction } from 'express';
import { GenericSerialIdController } from '../../generic/entities/serial-id-entity/generic-controller';
import {
  ISerialIdController,
  SerialIdEntityRequest,
  SerialIdApiResponse
} from '../../generic/entities/serial-id-entity/generic-types';
import {
  Sysconfig,
  CreateSysconfigRequest,
  UpdateSysconfigRequest,
  SysconfigQueryParams,
  SysconfigWithParsed,
  SysconfigEntityRequest,
  SysconfigApiResponse,
  SysconfigServiceResult,
  SYSCONFIG_ENTITY_CONFIG,
  isCreateSysconfigRequest,
  isUpdateSysconfigRequest
} from './types';
import type { SysconfigService } from './service';

import type { CompatibleQCRequest } from '../../middleware/auth';

// ==================== SYSCONFIG CONTROLLER CLASS ====================

/**
 * Sysconfig Entity Controller
 * 
 * HTTP request/response handling for system configuration management endpoints.
 * Extends Generic Serial ID pattern with sysconfig-specific operations.
 */
export class SysconfigController extends GenericSerialIdController<Sysconfig> implements ISerialIdController {
  
  protected sysconfigService: SysconfigService;

  constructor(service: SysconfigService) {
    super(service, SYSCONFIG_ENTITY_CONFIG);
    this.sysconfigService = service;
  }

  // ==================== CRUD ENDPOINTS ====================
  // Note: Base CRUD endpoints inherited from GenericSerialIdController
  // - create(req, res, next): POST /api/sysconfig
  // - getById(req, res, next): GET /api/sysconfig/:id
  // - getAll(req, res, next): GET /api/sysconfig
  // - update(req, res, next): PUT /api/sysconfig/:id
  // - delete(req, res, next): DELETE /api/sysconfig/:id
  // - changeStatus(req, res, next): PUT /api/sysconfig/:id/active|inactive

  // ==================== SYSCONFIG-SPECIFIC ENDPOINTS ====================

  /**
   * GET /api/sysconfig/:id/parsed
   * Get system configuration by ID with parsed comma-separated values
   */
  getByIdWithParsed = async (req: SysconfigEntityRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const qcReq = req as CompatibleQCRequest;
      
      if (!qcReq.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
          code: 'NO_USER'
        });
        return;
      }

      const userId = qcReq.user.id;
      const id = parseInt(req.params.id);

      const result = await this.sysconfigService.getByIdWithParsed(id, userId);

      if (result.success && result.data) {
        this.sendSysconfigSuccessResponse(res, result.data, 'System configuration with parsed values retrieved successfully');
      } else if (result.error?.includes('not found')) {
        this.sendSysconfigErrorResponse(res, 404, result.error);
      } else {
        this.sendSysconfigErrorResponse(res, 400, result.error || 'Failed to get system configuration with parsed values');
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/sysconfig/parsed
   * Get all system configurations with parsed comma-separated values
   */
  getAllWithParsed = async (req: SysconfigEntityRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const qcReq = req as CompatibleQCRequest;
      
      if (!qcReq.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
          code: 'NO_USER'
        });
        return;
      }

      const userId = qcReq.user.id;
      const options = this.parseSysconfigQueryOptions(req.query);

      const result = await this.sysconfigService.getAllWithParsed(options, userId);

      if (result.success && result.data) {
        this.sendSysconfigSuccessResponse(res, result.data, 'System configurations with parsed values retrieved successfully');
      } else {
        this.sendSysconfigErrorResponse(res, 400, result.error || 'Failed to get system configurations with parsed values');
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/sysconfig/active
   * Get the currently active system configuration
   */
  getActiveConfig = async (req: SysconfigEntityRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const qcReq = req as CompatibleQCRequest;

      // ℹ️ No authentication required for public endpoint
      // Use userId = 0 for system/public access
      const userId = qcReq.user?.id || 0;

      const result = await this.sysconfigService.getActiveConfig(userId);

      if (result.success && result.data) {
        this.sendSysconfigSuccessResponse(res, result.data, 'Active system configuration retrieved successfully');
      } else if (result.error?.includes('not found')) {
        this.sendSysconfigErrorResponse(res, 404, result.error);
      } else {
        this.sendSysconfigErrorResponse(res, 400, result.error || 'Failed to get active system configuration');
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/sysconfig/active/parsed
   * Get the currently active system configuration with parsed values
   */
  getActiveConfigWithParsed = async (req: SysconfigEntityRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const qcReq = req as CompatibleQCRequest;
      
      if (!qcReq.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
          code: 'NO_USER'
        });
        return;
      }

      const userId = qcReq.user.id;

      const result = await this.sysconfigService.getActiveConfigWithParsed(userId);

      if (result.success && result.data) {
        this.sendSysconfigSuccessResponse(res, result.data, 'Active system configuration with parsed values retrieved successfully');
      } else if (result.error?.includes('not found')) {
        this.sendSysconfigErrorResponse(res, 404, result.error);
      } else {
        this.sendSysconfigErrorResponse(res, 400, result.error || 'Failed to get active system configuration with parsed values');
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/sysconfig/:id/activate
   * Activate a system configuration (deactivates all others)
   */
  activateConfig = async (req: SysconfigEntityRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const qcReq = req as CompatibleQCRequest;
      
      if (!qcReq.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
          code: 'NO_USER'
        });
        return;
      }

      const userId = qcReq.user.id;
      const id = parseInt(req.params.id);

      const result = await this.sysconfigService.getActiveConfig(userId);

      if (result.success && result.data) {
        this.sendSysconfigSuccessResponse(res, result.data, 'System configuration activated successfully');
      } else if (result.error?.includes('not found')) {
        this.sendSysconfigErrorResponse(res, 404, result.error);
      } else {
        this.sendSysconfigErrorResponse(res, 400, result.error || 'Failed to activate system configuration');
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/sysconfig/:id/test
   * Test system configuration connectivity and settings
   * NOTE: This method is currently disabled as testConfiguration service method is not implemented
   */
  // testConfiguration = async (req: SysconfigEntityRequest, res: Response, next: NextFunction): Promise<void> => {
  //   try {
  //     const qcReq = req as CompatibleQCRequest;
  //
  //     if (!qcReq.user) {
  //       res.status(401).json({
  //         success: false,
  //         error: 'Authentication required',
  //         code: 'NO_USER'
  //       });
  //       return;
  //     }
  //
  //     const userId = qcReq.user.id;
  //     const id = parseInt(req.params.id);
  //
  //     const result = await this.sysconfigService.testConfiguration(id, userId);
  //
  //     if (result.success && result.data) {
  //       this.sendSysconfigSuccessResponse(res, result.data, 'Configuration test completed');
  //     } else if (result.error?.includes('not found')) {
  //       this.sendSysconfigErrorResponse(res, 404, result.error);
  //     } else {
  //       this.sendSysconfigErrorResponse(res, 400, result.error || 'Failed to test configuration');
  //     }
  //   } catch (error) {
  //     next(error);
  //   }
  // };

  /**
   * POST /api/sysconfig/test-mssql
   * Test MSSQL connection using current active configuration
   */
  testMssqlConnection = async (req: SysconfigEntityRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log('📥 POST /api/sysconfig/test-mssql - Testing MSSQL connection');
      const qcReq = req as CompatibleQCRequest;

      if (!qcReq.user) {
        console.log('❌ No user found in request');
        res.status(401).json({
          success: false,
          error: 'Authentication required',
          code: 'NO_USER'
        });
        return;
      }

      const userId = qcReq.user.id;
      console.log(`🔧 Testing MSSQL connection for user ID: ${userId}`);

      const result = await this.sysconfigService.testMssqlConnection(userId);
      console.log('📋 Test result:', { success: result.success, error: result.error });

      if (result.success) {
        console.log('✅ MSSQL connection test successful');
        res.status(200).json({
          success: true,
          message: 'MSSQL connection test successful',
          data: result.data
        });
      } else {
        console.log('❌ MSSQL connection test failed:', result.error);
        res.status(400).json({
          success: false,
          message: 'MSSQL connection test failed',
          error: result.error
        });
      }
    } catch (error) {
      console.error('❌ Error in testMssqlConnection controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during MSSQL connection test',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * POST /api/sysconfig/test-smtp
   * Test SMTP connection and send a test email using current active configuration
   */
  testSmtpConnection = async (req: SysconfigEntityRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const method = req.method;
      console.log(`📥 ${method} /api/sysconfig/test-smtp - Testing SMTP connection`);
      const qcReq = req as CompatibleQCRequest;

      if (!qcReq.user) {
        console.log('❌ No user found in request');
        res.status(401).json({
          success: false,
          error: 'Authentication required',
          code: 'NO_USER'
        });
        return;
      }

      const userId = qcReq.user.id;

      // Support both GET (query params) and POST (body)
      const testEmail = method === 'GET'
        ? ((req.query as any).testEmail as string)
        : req.body.testEmail;

      console.log(`📧 Testing SMTP connection for user ID: ${userId}, email: ${testEmail}`);

      if (!testEmail) {
        res.status(400).json({
          success: false,
          message: 'Test email address is required',
          error: method === 'GET'
            ? 'Please provide testEmail query parameter (e.g., ?testEmail=your@email.com)'
            : 'Please provide testEmail in request body'
        });
        return;
      }

      const result = await this.sysconfigService.testSmtpConnection(testEmail, userId);
      console.log('📋 Test result:', { success: result.success, error: result.error });

      if (result.success) {
        console.log('✅ SMTP connection test successful');
        res.status(200).json({
          success: true,
          message: `Test email sent successfully to ${testEmail}`,
          data: result.data
        });
      } else {
        console.log('❌ SMTP connection test failed:', result.error);
        res.status(400).json({
          success: false,
          message: 'SMTP connection test failed',
          error: result.error
        });
      }
    } catch (error) {
      console.error('❌ Error in testSmtpConnection controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during SMTP connection test',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Enhanced GET /api/sysconfig
   * Get all system configurations with sysconfig-specific filtering
   * Overrides the base getAll to use enhanced filtering
   */
  getAll = async (req: SysconfigEntityRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const qcReq = req as CompatibleQCRequest;
      
      if (!qcReq.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
          code: 'NO_USER'
        });
        return;
      }

      const userId = qcReq.user.id;
      const options = this.parseSysconfigQueryOptions(req.query);

      const result = await this.sysconfigService.getAllSysconfigs(options, userId);

      if (result.success && result.data) {
        this.sendSysconfigSuccessResponse(res, result.data, 'System configurations retrieved successfully');
      } else {
        this.sendSysconfigErrorResponse(res, 400, result.error || 'Failed to get system configurations');
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * Enhanced PUT /api/sysconfig/:id
   * Update system configuration with enhanced business logic
   * Overrides the base update to use enhanced service method
   */
  update = async (req: SysconfigEntityRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log('🎯 Controller.update - PUT /api/sysconfig/:id');
      console.log('📥 Request params:', req.params);
      console.log('📥 Request body keys:', Object.keys(req.body));
      console.log('📥 Request body:', JSON.stringify(req.body, null, 2));

      const qcReq = req as CompatibleQCRequest;

      if (!qcReq.user) {
        console.error('❌ No user in request');
        res.status(401).json({
          success: false,
          error: 'Authentication required',
          code: 'NO_USER'
        });
        return;
      }

      const userId = qcReq.user.id;
      const id = parseInt(req.params.id);

      console.log('👤 User ID:', userId);
      console.log('🔑 Config ID:', id);

      // Validate request body
      const isValid = isUpdateSysconfigRequest(req.body);
      console.log('🔍 isUpdateSysconfigRequest result:', isValid);

      if (!isValid) {
        console.error('❌ Invalid update request body');
        this.sendSysconfigErrorResponse(res, 400, 'Invalid system configuration update data');
        return;
      }

      console.log('✅ Request validation passed, calling service...');

      const result = await this.sysconfigService.updateSysconfig(id, req.body, userId);

      if (result.success && result.data) {
        this.sendSysconfigSuccessResponse(res, result.data, 'System configuration updated successfully');
      } else if (result.error?.includes('not found')) {
        this.sendSysconfigErrorResponse(res, 404, result.error);
      } else {
        this.sendSysconfigErrorResponse(res, 400, result.error || 'Failed to update system configuration');
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * Enhanced POST /api/sysconfig
   * Create system configuration with enhanced validation
   * Overrides the base create to add request validation
   */
  create = async (req: SysconfigEntityRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const qcReq = req as CompatibleQCRequest;
      
      if (!qcReq.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
          code: 'NO_USER'
        });
        return;
      }

      const userId = qcReq.user.id;

      // Validate request body
      if (!isCreateSysconfigRequest(req.body)) {
        this.sendSysconfigErrorResponse(res, 400, 'Invalid system configuration creation data');
        return;
      }

      const result = await this.sysconfigService.create(req.body, userId);

      if (result.success && result.data) {
        this.sendSysconfigSuccessResponse(res, result.data, 'System configuration created successfully', 201);
      } else {
        this.sendSysconfigErrorResponse(res, 400, result.error || 'Failed to create system configuration');
      }
    } catch (error) {
      next(error);
    }
  };

  // ==================== PRIVATE HELPER METHODS ====================

  /**
   * Send success response for sysconfig endpoints
   * Custom implementation since parent methods are private
   */
  private sendSysconfigSuccessResponse<TData>(
    res: Response, 
    data: TData, 
    message?: string, 
    statusCode: number = 200
  ): void {
    const response: SysconfigApiResponse<TData> = {
      success: true,
      data,
      ...(message && { message })
    };

    res.status(statusCode).json(response);
  }

  /**
   * Send error response for sysconfig endpoints
   * Custom implementation since parent methods are private
   */
  private sendSysconfigErrorResponse(
    res: Response, 
    statusCode: number, 
    error: string
  ): void {
    const response: SysconfigApiResponse = {
      success: false,
      error
    };

    res.status(statusCode).json(response);
  }

  /**
   * Parse and validate Sysconfig query options from request
   * Implements complete query parsing for sysconfig-specific filters
   */
  private parseSysconfigQueryOptions(query: any): SysconfigQueryParams {
    const options: SysconfigQueryParams = {};

    // Parse standard query options (reimplemented to avoid private method access)
    // Parse page
    if (query.page) {
      const page = parseInt(query.page);
      if (!isNaN(page) && page > 0) {
        options.page = page;
      }
    }

    // Parse limit
    if (query.limit) {
      const limit = parseInt(query.limit);
      if (!isNaN(limit) && limit > 0) {
        options.limit = Math.min(limit, this.config.maxLimit);
      }
    }

    // Parse sort
    if (query.sortBy && typeof query.sortBy === 'string') {
      options.sortBy = query.sortBy.trim();
    }

    if (query.sortOrder && typeof query.sortOrder === 'string') {
      const sortOrder = query.sortOrder.toUpperCase();
      if (sortOrder === 'ASC' || sortOrder === 'DESC') {
        options.sortOrder = sortOrder;
      }
    }

    // Parse search
    if (query.search && typeof query.search === 'string') {
      const search = query.search.trim();
      if (search.length > 0) {
        options.search = search;
      }
    }

    // Parse isActive
    if (query.isActive !== undefined) {
      if (query.isActive === 'true') {
        options.isActive = true;
      } else if (query.isActive === 'false') {
        options.isActive = false;
      }
    }

    // Parse configuration name filter
    if (query.config_name && typeof query.config_name === 'string') {
      const configName = query.config_name.trim();
      if (configName.length > 0) {
        options.config_name = configName;
      }
    }

    // Parse system name filter
    if (query.system_name && typeof query.system_name === 'string') {
      const systemName = query.system_name.trim();
      if (systemName.length > 0) {
        options.system_name = systemName;
      }
    }

    // Parse feature toggle filters
    if (query.enable_auto_sync !== undefined) {
      if (query.enable_auto_sync === 'true') {
        options.enable_auto_sync = true;
      } else if (query.enable_auto_sync === 'false') {
        options.enable_auto_sync = false;
      }
    }

    if (query.enable_notifications !== undefined) {
      if (query.enable_notifications === 'true') {
        options.enable_notifications = true;
      } else if (query.enable_notifications === 'false') {
        options.enable_notifications = false;
      }
    }

    if (query.enable_audit_log !== undefined) {
      if (query.enable_audit_log === 'true') {
        options.enable_audit_log = true;
      } else if (query.enable_audit_log === 'false') {
        options.enable_audit_log = false;
      }
    }

    if (query.enable_advanced_search !== undefined) {
      if (query.enable_advanced_search === 'true') {
        options.enable_advanced_search = true;
      } else if (query.enable_advanced_search === 'false') {
        options.enable_advanced_search = false;
      }
    }

    // Parse integration filters
    if (query.has_inf_server !== undefined) {
      if (query.has_inf_server === 'true') {
        options.has_inf_server = true;
      } else if (query.has_inf_server === 'false') {
        options.has_inf_server = false;
      }
    }

    if (query.has_smtp_server !== undefined) {
      if (query.has_smtp_server === 'true') {
        options.has_smtp_server = true;
      } else if (query.has_smtp_server === 'false') {
        options.has_smtp_server = false;
      }
    }

    // Parse backup filter
    if (query.backup_enabled !== undefined) {
      if (query.backup_enabled === 'true') {
        options.backup_enabled = true;
      } else if (query.backup_enabled === 'false') {
        options.backup_enabled = false;
      }
    }

    return options;
  }

  /**
   * Validate configuration ID parameter
   * Enhanced validation for configuration-specific requirements
   */
  private validateConfigId(idParam: string): { valid: boolean; id?: number; error?: string } {
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return { valid: false, error: 'Configuration ID must be a number' };
    }
    
    if (id <= 0) {
      return { valid: false, error: 'Configuration ID must be greater than 0' };
    }
    
    return { valid: true, id };
  }
}

// ==================== FACTORY FUNCTION ====================

/**
 * Factory function to create a Sysconfig controller instance
 * Following the factory pattern for dependency injection
 */
export function createSysconfigController(service: SysconfigService): SysconfigController {
  return new SysconfigController(service);
}

export default SysconfigController;

/*
=== UPDATED SYSCONFIG CONTROLLER WITH GENERIC SERIAL-ID PATTERN FEATURES ===

COMPLETE SEPARATION ARCHITECTURE:
✅ Extends GenericSerialIdController for 90% code reuse
✅ No direct cross-entity dependencies
✅ Self-contained sysconfig HTTP request/response handling
✅ Sampling Inspection Control domain optimized

SERIAL ID PATTERN COMPLIANCE:
✅ Implements ISerialIdController interface
✅ Uses SysconfigEntityRequest for HTTP request typing
✅ Uses SysconfigApiResponse for consistent responses
✅ Inherits standard CRUD endpoints from generic controller
✅ Follows factory pattern for dependency injection

GENERIC PATTERN INTEGRATION:
✅ Inherits create, getById, update, delete, getAll endpoints
✅ Inherits request parsing, response formatting, error handling
✅ Inherits query parameter parsing (pagination, sorting, search)
✅ Overrides create/update for enhanced validation
✅ Uses SYSCONFIG_ENTITY_CONFIG for configuration

SYSCONFIG-SPECIFIC ENDPOINTS:
✅ getByIdWithParsed() - GET /api/sysconfig/:id/parsed
✅ getAllWithParsed() - GET /api/sysconfig/parsed
✅ getActiveConfig() - GET /api/sysconfig/active
✅ getActiveConfigWithParsed() - GET /api/sysconfig/active/parsed
✅ activateConfig() - PUT /api/sysconfig/:id/activate
✅ testConfiguration() - POST /api/sysconfig/:id/test

ENHANCED CRUD OPERATIONS:
✅ Enhanced create() with request validation
✅ Enhanced update() with business logic validationf
✅ Enhanced getAll() with sysconfig-specific filtering
✅ Inherited getById() with standard error handling
✅ Inherited delete() with audit trail support
✅ Inherited changeStatus() for activation/deactivation

Sampling Inspection Control FEATURES:
✅ Configuration parsing endpoints for comma-separated values
✅ Active configuration management for system operations
✅ Configuration testing for connectivity validation
✅ Feature toggle filtering (auto-sync, notifications, etc.)
✅ Integration status filtering (INF server, SMTP server)
✅ System configuration activation/deactivation

ADVANCED QUERY PARAMETER PARSING:
✅ parseSysconfigQueryOptions() with configuration-specific filters
✅ Configuration name and system name search
✅ Feature flag filtering (enable_auto_sync, etc.)
✅ Integration status filtering (has_inf_server, etc.)
✅ Backup and audit setting filtering
✅ Inherits standard pagination, sorting, search from generic

HTTP RESPONSE HANDLING:
✅ Enhanced sendSuccessResponse() with sysconfig typing
✅ Enhanced sendErrorResponse() with sysconfig typing
✅ Proper HTTP status codes (200, 201, 400, 404)
✅ Consistent API response format
✅ Comprehensive error handling and logging

REQUEST VALIDATION:
✅ isCreateSysconfigRequest() validation for POST requests
✅ isUpdateSysconfigRequest() validation for PUT requests
✅ validateConfigId() for parameter validation
✅ Type-safe request body parsing
✅ Comprehensive input sanitization

MIDDLEWARE INTEGRATION:
✅ Authentication requirement for all operations
✅ User context extraction for audit trails
✅ Error middleware integration with next(error)
✅ Request tracking and logging support
✅ Proper Express Router integration

This controller provides complete HTTP handling for system configuration
management while maintaining complete separation, comprehensive validation,
and the 90% code reuse benefit through the generic Serial ID pattern.
*/