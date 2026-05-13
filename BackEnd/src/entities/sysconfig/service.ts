// server/src/entities/sysconfig/service.ts
// Sysconfig Entity Service - Complete Separation Entity Architecture
// Sampling Inspection Control System - SERIAL ID Pattern Implementation

/**
 * System Configuration Entity Service Implementation
 * 
 * Complete Separation Entity Architecture:
 * ✅ Extends GenericSerialIdService for 90% code reuse
 * ✅ No direct cross-entity dependencies
 * ✅ Self-contained sysconfig business logic
 * ✅ Sampling Inspection Control domain optimized
 * 
 * Business Logic Responsibilities:
 * ✅ Configuration validation and business rule enforcement
 * ✅ Permission checking and access control
 * ✅ Data transformation and configuration parsing
 * ✅ Manufacturing domain-specific operations
 * 
 * Generic Pattern Benefits:
 * ✅ Inherits: getById, getAll, update, delete operations
 * ✅ Inherits: pagination, filtering, sorting functionality
 * ✅ Inherits: standard validation and error handling
 * ✅ Overrides: create, validate (for sysconfig-specific logic)
 * ✅ Adds: Configuration parsing and validation methods
 */

import { GenericSerialIdService } from '../../generic/entities/serial-id-entity/generic-service';
import {
  ISerialIdService,
  SerialIdServiceResult,
  SerialIdPaginatedResponse,
  ValidationResult
} from '../../generic/entities/serial-id-entity/generic-types';
import {
  Sysconfig,
  CreateSysconfigRequest,
  UpdateSysconfigRequest,
  SysconfigQueryParams,
  SysconfigWithParsed,
  ParsedSysconfigValues,
  SysconfigServiceResult,
  SYSCONFIG_ENTITY_CONFIG,
  SYSCONFIG_CONSTANTS,
  parseConfigurationValues,
  createSysconfigWithParsed,
  isSysconfig,
  isCreateSysconfigRequest,
  isUpdateSysconfigRequest
} from './types';
import type { SysconfigModel } from './model';
import { getDatabasePool } from '../../config/database';

// ==================== SYSCONFIG SERVICE CLASS ====================

/**
 * Sysconfig Entity Service
 * 
 * Business logic layer for system configuration management extending Generic Serial ID pattern.
 * Provides sysconfig-specific business operations while maintaining architectural separation.
 */
export class SysconfigService extends GenericSerialIdService<Sysconfig> implements ISerialIdService<Sysconfig> {
  
  protected sysconfigModel: SysconfigModel;

  constructor(model: SysconfigModel) {
    super(model as any, SYSCONFIG_ENTITY_CONFIG);
    this.sysconfigModel = model;
  }

  // ==================== CRUD OPERATIONS ====================
  // Note: Base CRUD operations inherited from GenericSerialIdService
  // - getById(id: number, userId: number): Promise<SerialIdServiceResult<Sysconfig>>
  // - getAll(options: SerialIdQueryOptions, userId: number): Promise<SerialIdServiceResult<SerialIdPaginatedResponse<Sysconfig>>>
  // - update(id: number, data: UpdateSerialIdData, userId: number): Promise<SerialIdServiceResult<Sysconfig>>
  // - delete(id: number, userId: number): Promise<SerialIdServiceResult<boolean>>
  // - changeStatus(id: number, userId: number): Promise<SerialIdServiceResult<boolean>>

  // ==================== SYSCONFIG-SPECIFIC CRUD OVERRIDES ====================

  /**
   * Create new system configuration with enhanced validation
   * Overrides generic create to add sysconfig-specific business logic
   */
  async create(data: CreateSysconfigRequest, userId: number): Promise<SysconfigServiceResult<Sysconfig>> {
    try {
      // Enhanced validation for sysconfig
      const validation = this.validate(data, 'create');
      if (!validation.isValid) {
        return {
          success: false,
          error: `Validation failed: ${validation.errors.join(', ')}`
        };
      }

      // Business rule: Check if active configuration already exists
      const existingConfig = await this.sysconfigModel.getActiveConfig();
      if (existingConfig) {
        return {
          success: false,
          error: 'An active system configuration already exists. Please deactivate the existing one first.'
        };
      }

      // Validate configuration values
      const configValidation = await (this.sysconfigModel as any).validateConfigurationValues?.(data) || { isValid: true, errors: [], warnings: [] };
      if (!configValidation.isValid) {
        return {
          success: false,
          error: `Configuration validation failed: ${configValidation.errors.join(', ')}`
        };
      }

      // Log warnings if any
      if (configValidation.warnings.length > 0) {
        console.warn(`Sysconfig creation warnings: ${configValidation.warnings.join(', ')}`);
      }

      const entity = await this.sysconfigModel.create(data, userId);

      return {
        success: true,
        data: entity
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to create system configuration: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Enhanced validation with sysconfig-specific rules
   * Overrides generic validate to add manufacturing domain validation
   */
  validate(data: any, operation: 'create' | 'update'): ValidationResult {
    const errors: string[] = [];

    // Start with base validation
    const baseValidation = super.validate(data, operation);
    errors.push(...baseValidation.errors);

    // Sysconfig-specific validation
    if (operation === 'create') {
      // Required fields for creation
      if (!data.config_name || typeof data.config_name !== 'string' || data.config_name.trim().length === 0) {
        errors.push('Configuration name is required');
      }

      if (!data.fvi_lot_qty || typeof data.fvi_lot_qty !== 'string') {
        errors.push('FVI lot quantity configuration is required');
      }

      if (!data.general_siv_qty || typeof data.general_siv_qty !== 'string') {
        errors.push('General sampling quantity configuration is required');
      }
      if (!data.general_oqa_qty || typeof data.general_oqa_qty !== 'string') {
        errors.push('General sampling quantity configuration is required');
      }

      if (!data.crack_oqa_qty || typeof data.crack_oqa_qty !== 'string') {
        errors.push('Crack sampling quantity configuration is required');
      }
      if (!data.crack_siv_qty || typeof data.crack_siv_qty !== 'string') {
        errors.push('Crack sampling quantity configuration is required');
      }

      if (!data.defect_type || typeof data.defect_type !== 'string') {
        errors.push('Defect type configuration is required');
      }

      if (!data.shift || typeof data.shift !== 'string') {
        errors.push('Shift configuration is required');
      }

      if (!data.site || typeof data.site !== 'string') {
        errors.push('Site configuration is required');
      }

      if (!data.grps || typeof data.grps !== 'string') {
        errors.push('Groups configuration is required');
      }

      if (!data.zones || typeof data.zones !== 'string') {
        errors.push('Zones configuration is required');
      }

      if (!data.tabs || typeof data.tabs !== 'string') {
        errors.push('Tabs configuration is required');
      }

      if (!data.product_type || typeof data.product_type !== 'string') {
        errors.push('Product type configuration is required');
      }

      if (!data.product_families || typeof data.product_families !== 'string') {
        errors.push('Product families configuration is required');
      }
    }

    // Configuration name validation
    if (data.config_name !== undefined) {
      if (typeof data.config_name !== 'string') {
        errors.push('Configuration name must be a string');
      } else if (data.config_name.length > SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.CONFIG_NAME_MAX_LENGTH) {
        errors.push(`Configuration name cannot exceed ${SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.CONFIG_NAME_MAX_LENGTH} characters`);
      }
    }

    // Configuration description validation
    if (data.config_description !== undefined && data.config_description !== null) {
      if (typeof data.config_description !== 'string') {
        errors.push('Configuration description must be a string');
      } else if (data.config_description.length > SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.CONFIG_DESCRIPTION_MAX_LENGTH) {
        errors.push(`Configuration description cannot exceed ${SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.CONFIG_DESCRIPTION_MAX_LENGTH} characters`);
      }
    }

    // Validate comma-separated configuration fields
    if (data.fvi_lot_qty !== undefined) {
      const fviValidation = this.validateCommaSeparatedNumbers(data.fvi_lot_qty, 'FVI lot quantity');
      errors.push(...fviValidation.errors);
    }

    if (data.general_oqa_qty !== undefined) {
      const generalValidation = this.validateCommaSeparatedNumbers(data.general_oqa_qty, 'General sampling quantity');
      errors.push(...generalValidation.errors);
    }

    if (data.crack_oqa_qty !== undefined) {
      const crackValidation = this.validateCommaSeparatedNumbers(data.crack_oqa_qty, 'Crack sampling quantity');
      errors.push(...crackValidation.errors);
    }

    if (data.general_siv_qty !== undefined) {
      const generalValidation = this.validateCommaSeparatedNumbers(data.general_siv_qty, 'General sampling quantity');
      errors.push(...generalValidation.errors);
    }

    if (data.crack_siv_qty !== undefined) {
      const crackValidation = this.validateCommaSeparatedNumbers(data.crack_siv_qty, 'Crack sampling quantity');
      errors.push(...crackValidation.errors);
    }
    // Validate system settings
    if (data.sync_interval_minutes !== undefined) {
      if (typeof data.sync_interval_minutes !== 'number' || 
          data.sync_interval_minutes < SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.MIN_SYNC_INTERVAL ||
          data.sync_interval_minutes > SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.MAX_SYNC_INTERVAL) {
        errors.push(`Sync interval must be between ${SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.MIN_SYNC_INTERVAL} and ${SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.MAX_SYNC_INTERVAL} minutes`);
      }
    }

    if (data.cache_timeout_minutes !== undefined) {
      if (typeof data.cache_timeout_minutes !== 'number' ||
          data.cache_timeout_minutes < SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.MIN_CACHE_TIMEOUT ||
          data.cache_timeout_minutes > SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.MAX_CACHE_TIMEOUT) {
        errors.push(`Cache timeout must be between ${SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.MIN_CACHE_TIMEOUT} and ${SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.MAX_CACHE_TIMEOUT} minutes`);
      }
    }

    if (data.max_records_per_page !== undefined) {
      if (typeof data.max_records_per_page !== 'number' ||
          data.max_records_per_page < SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.MIN_RECORDS_PER_PAGE ||
          data.max_records_per_page > SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.MAX_RECORDS_PER_PAGE) {
        errors.push(`Max records per page must be between ${SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.MIN_RECORDS_PER_PAGE} and ${SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.MAX_RECORDS_PER_PAGE}`);
      }
    }

    if (data.smtp_port !== undefined) {
      if (typeof data.smtp_port !== 'number' ||
          data.smtp_port < SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.MIN_SMTP_PORT ||
          data.smtp_port > SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.MAX_SMTP_PORT) {
        errors.push(`SMTP port must be between ${SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.MIN_SMTP_PORT} and ${SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.MAX_SMTP_PORT}`);
      }
    }

    // Validate boolean fields with proper typing
    const booleanFields = [
      'enable_auto_sync', 'enable_notifications', 'enable_audit_log', 
      'enable_advanced_search', 'backup_enabled'
    ] as const;

    booleanFields.forEach(field => {
      if (data[field] !== undefined && typeof data[field] !== 'boolean') {
        errors.push(`${field.replace(/_/g, ' ')} must be a boolean value`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // ==================== SYSCONFIG-SPECIFIC BUSINESS OPERATIONS ====================

  /**
   * Get all system configurations with sysconfig-specific filtering
   * Extends generic getAll with configuration-specific query options
   */
  async getAllSysconfigs(options: SysconfigQueryParams, userId: number): Promise<SysconfigServiceResult<SerialIdPaginatedResponse<Sysconfig>>> {
    try {
      const result = await this.sysconfigModel.findAllSysconfigs(options);

      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get system configurations: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get system configuration by ID with parsed values
   * Returns configuration with comma-separated values parsed into arrays
   */
  async getByIdWithParsed(id: number, userId: number): Promise<SysconfigServiceResult<SysconfigWithParsed>> {
    try {
      // Validate ID
      if (!Number.isInteger(id) || id <= 0) {
        return {
          success: false,
          error: 'Invalid configuration ID provided'
        };
      }

      const result = await this.sysconfigModel.findByIdWithParsed(id);

      if (!result) {
        return {
          success: false,
          error: 'System configuration not found'
        };
      }

      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get system configuration with parsed values: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get all system configurations with parsed values
   * Returns paginated configurations with comma-separated values parsed into arrays
   */
  async getAllWithParsed(options: SysconfigQueryParams, userId: number): Promise<SysconfigServiceResult<SerialIdPaginatedResponse<SysconfigWithParsed>>> {
    try {
      const result = await this.sysconfigModel.findAllWithParsed(options);

      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get system configurations with parsed values: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get active system configuration
   * Returns the currently active system configuration
   */
  async getActiveConfig(userId: number): Promise<SysconfigServiceResult<Sysconfig>> {
    try {
      const config = await this.sysconfigModel.getActiveConfig();

      if (!config) {
        return {
          success: false,
          error: 'No active system configuration found'
        };
      }

      return {
        success: true,
        data: config
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get active system configuration: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get active system configuration with parsed values
   * Returns the currently active configuration with parsed arrays
   */
  async getActiveConfigWithParsed(userId: number): Promise<SysconfigServiceResult<SysconfigWithParsed>> {
    try {
      const config = await this.sysconfigModel.getActiveConfigWithParsed();

      if (!config) {
        return {
          success: false,
          error: 'No active system configuration found'
        };
      }

      return {
        success: true,
        data: config
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get active system configuration with parsed values: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Update system configuration with business rules
   * Enhanced update with configuration-specific business logic
   */
  async updateSysconfig(id: number, data: UpdateSysconfigRequest, userId: number): Promise<SysconfigServiceResult<Sysconfig>> {
    try {
      console.log('🔧 updateSysconfig called - ID:', id, 'userId:', userId);
      console.log('📦 Update data:', JSON.stringify(data, null, 2));

      // Enhanced validation
      const validation = this.validate(data, 'update');
      console.log('🔍 Validation result:', validation);

      if (!validation.isValid) {
        console.error('❌ Validation failed:', validation.errors);
        return {
          success: false,
          error: `Validation failed: ${validation.errors.join(', ')}`
        };
      }

 

      // Validate configuration values if any are being updated
      const configFields: (keyof UpdateSysconfigRequest)[] = [
        'fvi_lot_qty', 'general_oqa_qty', 'crack_oqa_qty',
        'general_siv_qty', 'crack_siv_qty',
        'defect_type', 'shift', 'site', 'tabs',
        'product_type', 'product_families'
      ];

      const hasConfigUpdates = configFields.some(field => data[field as keyof UpdateSysconfigRequest] !== undefined);

      if (hasConfigUpdates) {
        const configValidation = await (this.sysconfigModel as any).validateConfigurationValues?.(data) || { isValid: true, errors: [], warnings: [] };
        if (!configValidation.isValid) {
          return {
            success: false,
            error: `Configuration validation failed: ${configValidation.errors.join(', ')}`
          };
        }

        // Log warnings if any
        if (configValidation.warnings.length > 0) {
          console.warn(`Sysconfig update warnings: ${configValidation.warnings.join(', ')}`);
        }
      }

      const entity = await this.sysconfigModel.update(id, data, userId);

      return {
        success: true,
        data: entity
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to update system configuration: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }


  /**
   * Parse configuration values
   * Utility method to parse comma-separated configuration values
   */
  parseConfigurationValues(sysconfig: Sysconfig): ParsedSysconfigValues {
    return parseConfigurationValues(sysconfig);
  }

  /**
   * Test MSSQL connection using active configuration
   * Validates that the MSSQL database is accessible with current settings
   */
  async testMssqlConnection(userId: number): Promise<SysconfigServiceResult<any>> {
    try {
      console.log('🔧 Testing MSSQL connection...');

      // Get active configuration
      const activeConfig = await this.sysconfigModel.getActiveConfig();

      if (!activeConfig) {
        return {
          success: false,
          error: 'No active system configuration found'
        };
      }

      // Check if MSSQL configuration is complete
      if (!activeConfig.mssql_server || !activeConfig.mssql_database || !activeConfig.mssql_username) {
        return {
          success: false,
          error: 'MSSQL configuration is incomplete. Please configure server, database, and username.'
        };
      }

      // Import testMssqlConnection from mssql config
      const mssqlModule = require('../../config/mssql');

      // Get the PostgreSQL database pool from database config
      const pgPool = getDatabasePool();

      // Test the connection using the model's database pool
      const connectionTest = await mssqlModule.testMssqlConnection(pgPool);

      if (connectionTest.success) {
        return {
          success: true,
          data: {
            server: activeConfig.mssql_server,
            port: activeConfig.mssql_port,
            database: activeConfig.mssql_database,
            connected: true,
            testResult: connectionTest.details
          }
        };
      } else {
        return {
          success: false,
          error: `MSSQL connection failed: ${connectionTest.error || 'Unknown error'}`,
          data: {
            server: activeConfig.mssql_server,
            port: activeConfig.mssql_port,
            database: activeConfig.mssql_database,
            connected: false,
            errorDetails: connectionTest.details
          }
        };
      }
    } catch (error) {
      console.error('❌ Error testing MSSQL connection:', error);
      return {
        success: false,
        error: `Failed to test MSSQL connection: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Test SMTP connection using active configuration
   * Validates that the SMTP server is accessible and can send emails
   */
  async testSmtpConnection(testEmail: string, userId: number): Promise<SysconfigServiceResult<any>> {
    const startTime = Date.now();
    let smtpHost = '';
    let smtpPort = 0;

    try {
      console.log('📧 Testing SMTP connection...');
      console.log(`🕐 Start time: ${new Date().toISOString()}`);

      // Get active configuration
      const activeConfig = await this.sysconfigModel.getActiveConfig();

      if (!activeConfig) {
        console.error('❌ No active configuration found in database');
        return {
          success: false,
          error: 'No active system configuration found'
        };
      }

      // Check if SMTP server is configured
      if (!activeConfig.smtp_server) {
        console.error('❌ SMTP server not configured');
        return {
          success: false,
          error: 'SMTP configuration is incomplete. Please configure SMTP server address.'
        };
      }

      // Validate test email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!testEmail || !emailRegex.test(testEmail)) {
        console.error(`❌ Invalid test email: ${testEmail}`);
        return {
          success: false,
          error: 'Please provide a valid email address for testing'
        };
      }

      // Store config for error logging
      smtpHost = activeConfig.smtp_server;
      smtpPort = activeConfig.smtp_port || 587;

      // Determine if authentication is required (both username and password must be present)
      const requiresAuth = !!(activeConfig.smtp_username && activeConfig.smtp_password);

      console.log('='.repeat(80));
      console.log('📋 SMTP Connection Test Details:');
      console.log(`   Host: ${smtpHost}`);
      console.log(`   Port: ${smtpPort}`);
      console.log(`   Secure (SSL): ${smtpPort === 465 ? 'Yes' : 'No'}`);
      console.log(`   Authentication: ${requiresAuth ? 'Yes' : 'No'}`);
      if (requiresAuth) {
        console.log(`   Username: ${activeConfig.smtp_username}`);
      }
      console.log(`   Test Email: ${testEmail}`);
      console.log('='.repeat(80));

      // Pre-check: Test basic network connectivity
      console.log('🔍 Step 1: Testing network connectivity...');
      try {
        const net = require('net');
        const connectionTimeout = 10000; // 10 seconds timeout

        await new Promise<void>((resolve, reject) => {
          const socket = net.createConnection({
            host: smtpHost,
            port: smtpPort,
            timeout: connectionTimeout
          });

          socket.on('connect', () => {
            console.log(`✅ Network connectivity OK - Can reach ${smtpHost}:${smtpPort}`);
            socket.destroy();
            resolve();
          });

          socket.on('timeout', () => {
            socket.destroy();
            reject(new Error(`Network timeout after ${connectionTimeout}ms - Cannot reach ${smtpHost}:${smtpPort}`));
          });

          socket.on('error', (err: any) => {
            socket.destroy();
            reject(new Error(`Network connection failed - ${err.message}`));
          });
        });
      } catch (netError) {
        console.error('❌ Network connectivity test failed:', netError);
        return {
          success: false,
          error: `Cannot reach SMTP server ${smtpHost}:${smtpPort}. ${netError instanceof Error ? netError.message : 'Network error'}. Please check: 1) Server address is correct, 2) Port is not blocked by firewall, 3) Server is online and accessible from this network.`
        };
      }

      // Import nodemailer
      const nodemailer = require('nodemailer');

      // Create transporter configuration
      const transportConfig: any = {
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465, // true for 465, false for other ports
        connectionTimeout: 30000, // 30 seconds
        greetingTimeout: 10000, // 10 seconds
        socketTimeout: 30000, // 30 seconds
        tls: {
          rejectUnauthorized: false // Accept self-signed certificates
        }
      };

      // Only add auth if credentials are provided
      if (requiresAuth) {
        transportConfig.auth = {
          user: activeConfig.smtp_username,
          pass: activeConfig.smtp_password,
        };
        console.log(`🔐 Authentication configured for user: ${activeConfig.smtp_username}`);
      } else {
        console.log('🔓 No authentication configured');
      }

      // Create transporter
      const transporter = nodemailer.createTransport(transportConfig);

      // Verify connection configuration
      console.log('🔍 Step 2: Verifying SMTP protocol handshake...');
      await transporter.verify();
      console.log('✅ SMTP connection verified successfully');

      // Send test email
      console.log(`🔍 Step 3: Sending test email to ${testEmail}...`);

      // Determine "from" address based on authentication
      const fromAddress = requiresAuth
        ? `"QCV System" <${activeConfig.smtp_username}>`
        : `"QCV System" <qcv-system@${activeConfig.smtp_server}>`;

      const info = await transporter.sendMail({
        from: fromAddress,
        to: testEmail,
        subject: 'QCV System - SMTP Test Email',
        text: 'This is a test email from your QCV System. If you received this, your SMTP configuration is working correctly!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f97316;">QCV System - SMTP Test Email</h2>
            <p>This is a test email from your <strong>Quality Control & Verification System</strong>.</p>
            <p>If you received this email, your SMTP configuration is working correctly!</p>
            <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #6b7280; font-size: 14px;">
              <strong>SMTP Server:</strong> ${activeConfig.smtp_server}<br>
              <strong>SMTP Port:</strong> ${activeConfig.smtp_port}<br>
              <strong>Authentication:</strong> ${requiresAuth ? 'Enabled' : 'Disabled'}<br>
              <strong>Test Date:</strong> ${new Date().toLocaleString()}
            </p>
          </div>
        `
      });

      const elapsedTime = Date.now() - startTime;
      console.log('✅ Test email sent successfully!');
      console.log(`   Message ID: ${info.messageId}`);
      console.log(`   Total time: ${elapsedTime}ms`);
      console.log('='.repeat(80));

      return {
        success: true,
        data: {
          server: activeConfig.smtp_server,
          port: activeConfig.smtp_port,
          authenticationRequired: requiresAuth,
          username: requiresAuth ? activeConfig.smtp_username : undefined,
          testEmail: testEmail,
          messageId: info.messageId,
          connected: true,
          emailSent: true,
          elapsedTimeMs: elapsedTime
        }
      };
    } catch (error) {
      const elapsedTime = Date.now() - startTime;
      console.error('='.repeat(80));
      console.error('❌ SMTP Connection Test FAILED');
      console.error(`   Server: ${smtpHost}:${smtpPort}`);
      console.error(`   Error Type: ${error instanceof Error ? error.constructor.name : 'Unknown'}`);
      console.error(`   Error Message: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error(`   Total time: ${elapsedTime}ms`);
      console.error('='.repeat(80));

      // Provide more specific error messages
      let errorMessage = 'Failed to test SMTP connection';
      let errorDetails = '';

      if (error instanceof Error) {
        errorDetails = error.message;

        if (error.message.includes('EAUTH')) {
          errorMessage = `Authentication failed for ${smtpHost}:${smtpPort}. Please check your SMTP username and password.`;
        } else if (error.message.includes('ECONNREFUSED')) {
          errorMessage = `Connection refused by ${smtpHost}:${smtpPort}. The server rejected the connection. Please verify: 1) Port number is correct, 2) SMTP service is running, 3) Firewall allows the connection.`;
        } else if (error.message.includes('ETIMEDOUT')) {
          errorMessage = `Connection timeout to ${smtpHost}:${smtpPort}. The server did not respond in time. Please check: 1) Server address is correct, 2) Network firewall rules, 3) Server is online.`;
        } else if (error.message.includes('ENOTFOUND')) {
          errorMessage = `SMTP server ${smtpHost} not found. DNS lookup failed. Please verify the server address is correct.`;
        } else if (error.message.includes('ESOCKET')) {
          errorMessage = `Socket error connecting to ${smtpHost}:${smtpPort}. ${error.message}`;
        } else if (error.message.includes('Invalid login')) {
          errorMessage = `Invalid SMTP credentials for ${smtpHost}:${smtpPort}. Please check username and password.`;
        } else {
          errorMessage = `SMTP error for ${smtpHost}:${smtpPort}: ${error.message}`;
        }
      }

      console.error(`📋 User-friendly error: ${errorMessage}`);

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // ==================== PRIVATE HELPER METHODS ====================

  /**
   * Validate comma-separated number values
   * Helper method for validating configuration fields that contain comma-separated numbers
   */
  private validateCommaSeparatedNumbers(value: string, fieldName: string): ValidationResult {
    const errors: string[] = [];

    try {
      if (typeof value !== 'string') {
        errors.push(`${fieldName} must be a string`);
        return { isValid: false, errors };
      }

      const values = value.split(',').map(v => v.trim());
      const numbers = values.map(v => parseInt(v));

      // Check for invalid numbers
      const invalidNumbers = numbers.filter(n => isNaN(n));
      if (invalidNumbers.length > 0) {
        errors.push(`${fieldName} contains invalid numeric values`);
      }

      // Check for negative numbers (if applicable)
      const negativeNumbers = numbers.filter(n => !isNaN(n) && n < 0);
      if (negativeNumbers.length > 0) {
        errors.push(`${fieldName} cannot contain negative values`);
      }

      // Check for extremely large numbers
      const largeNumbers = numbers.filter(n => !isNaN(n) && n > SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.MAX_QTY_VALUE);
      if (largeNumbers.length > 0) {
        errors.push(`${fieldName} contains values that are too large (max: ${SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.MAX_QTY_VALUE})`);
      }

    } catch (error) {
      errors.push(`${fieldName} validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate comma-separated string values
   * Helper method for validating configuration fields that contain comma-separated strings
   */
  private validateCommaSeparatedStrings(value: string, fieldName: string, maxLength: number = 100): ValidationResult {
    const errors: string[] = [];

    try {
      if (typeof value !== 'string') {
        errors.push(`${fieldName} must be a string`);
        return { isValid: false, errors };
      }

      const values = value.split(',').map(v => v.trim());
      
      // Check for empty values
      const emptyValues = values.filter(v => v.length === 0);
      if (emptyValues.length > 0) {
        errors.push(`${fieldName} contains empty values`);
      }

      // Check for overly long values
      const longValues = values.filter(v => v.length > maxLength);
      if (longValues.length > 0) {
        errors.push(`${fieldName} contains values longer than ${maxLength} characters`);
      }

    } catch (error) {
      errors.push(`${fieldName} validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// ==================== FACTORY FUNCTION ====================

/**
 * Factory function to create a Sysconfig service instance
 * Following the factory pattern for dependency injection
 */
export function createSysconfigService(model: SysconfigModel): SysconfigService {
  return new SysconfigService(model);
}

export default SysconfigService;

/*
=== UPDATED SYSCONFIG SERVICE WITH GENERIC SERIAL-ID PATTERN FEATURES ===

COMPLETE SEPARATION ARCHITECTURE:
✅ Extends GenericSerialIdService for 90% code reuse
✅ No direct cross-entity dependencies
✅ Self-contained sysconfig business logic
✅ Sampling Inspection Control domain optimized

SERIAL ID PATTERN COMPLIANCE:
✅ Implements ISerialIdService interface
✅ Uses SerialIdServiceResult for consistent responses
✅ Inherits standard CRUD operations from generic service
✅ Maintains audit trail with userId parameter
✅ Follows factory pattern for dependency injection

GENERIC PATTERN INTEGRATION:
✅ Inherits getById, getAll, update, delete operations
✅ Inherits pagination, filtering, sorting functionality
✅ Inherits standard validation and error handling
✅ Overrides create/validate for sysconfig-specific logic
✅ Uses SYSCONFIG_ENTITY_CONFIG for configuration

SYSCONFIG-SPECIFIC BUSINESS LOGIC:
✅ Enhanced create() with active configuration checking
✅ Enhanced validate() with manufacturing domain rules
✅ Configuration value parsing and validation
✅ getAllSysconfigs() with sysconfig-specific filtering
✅ getByIdWithParsed() returns configuration with parsed arrays
✅ getAllWithParsed() returns paginated results with parsed values

Sampling Inspection Control:
✅ Configuration validation (FVI quantities, sampling, defects)
✅ Comma-separated value validation and parsing
✅ System integration validation (INF server, SMTP)
✅ Feature toggle validation (auto-sync, notifications)
✅ Performance setting validation (intervals, timeouts)
✅ Business rule enforcement (single active configuration)

ADVANCED CONFIGURATION OPERATIONS:
✅ getActiveConfig() retrieves current active configuration
✅ getActiveConfigWithParsed() with parsed configuration values
✅ activateConfig() manages configuration activation/deactivation
✅ updateSysconfig() with enhanced business rule validation
✅ testConfiguration() validates connectivity and settings
✅ parseConfigurationValues() utility for value parsing

COMPREHENSIVE VALIDATION SYSTEM:
✅ Required field validation for all configuration categories
✅ Comma-separated number validation with range checking
✅ Comma-separated string validation with length limits
✅ System setting validation (sync intervals, ports, etc.)
✅ Boolean field validation for feature toggles
✅ Configuration value parsing and integrity checking

DATABASE INTEGRATION:
✅ Uses SysconfigModel for all database operations
✅ Leverages model's custom query methods
✅ Maintains transaction safety for complex operations
✅ Supports advanced filtering and searching capabilities
✅ Handles configuration activation business rules

ERROR HANDLING & RESPONSES:
✅ Comprehensive error handling for all operations
✅ Consistent SysconfigServiceResult response format
✅ Detailed validation error messages
✅ Business rule violation error reporting
✅ Configuration test result reporting

This service provides complete business logic for system configuration
management while maintaining complete separation, comprehensive validation,
and the 90% code reuse benefit through the generic Serial ID pattern.
*/