"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SysconfigService = void 0;
exports.createSysconfigService = createSysconfigService;
const generic_service_1 = require("../../generic/entities/serial-id-entity/generic-service");
const types_1 = require("./types");
const database_1 = require("../../config/database");
class SysconfigService extends generic_service_1.GenericSerialIdService {
    constructor(model) {
        super(model, types_1.SYSCONFIG_ENTITY_CONFIG);
        this.sysconfigModel = model;
    }
    async create(data, userId) {
        try {
            const validation = this.validate(data, 'create');
            if (!validation.isValid) {
                return {
                    success: false,
                    error: `Validation failed: ${validation.errors.join(', ')}`
                };
            }
            const existingConfig = await this.sysconfigModel.getActiveConfig();
            if (existingConfig) {
                return {
                    success: false,
                    error: 'An active system configuration already exists. Please deactivate the existing one first.'
                };
            }
            const configValidation = await this.sysconfigModel.validateConfigurationValues?.(data) || { isValid: true, errors: [], warnings: [] };
            if (!configValidation.isValid) {
                return {
                    success: false,
                    error: `Configuration validation failed: ${configValidation.errors.join(', ')}`
                };
            }
            if (configValidation.warnings.length > 0) {
                console.warn(`Sysconfig creation warnings: ${configValidation.warnings.join(', ')}`);
            }
            const entity = await this.sysconfigModel.create(data, userId);
            return {
                success: true,
                data: entity
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to create system configuration: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    validate(data, operation) {
        const errors = [];
        const baseValidation = super.validate(data, operation);
        errors.push(...baseValidation.errors);
        if (operation === 'create') {
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
        if (data.config_name !== undefined) {
            if (typeof data.config_name !== 'string') {
                errors.push('Configuration name must be a string');
            }
            else if (data.config_name.length > types_1.SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.CONFIG_NAME_MAX_LENGTH) {
                errors.push(`Configuration name cannot exceed ${types_1.SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.CONFIG_NAME_MAX_LENGTH} characters`);
            }
        }
        if (data.config_description !== undefined && data.config_description !== null) {
            if (typeof data.config_description !== 'string') {
                errors.push('Configuration description must be a string');
            }
            else if (data.config_description.length > types_1.SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.CONFIG_DESCRIPTION_MAX_LENGTH) {
                errors.push(`Configuration description cannot exceed ${types_1.SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.CONFIG_DESCRIPTION_MAX_LENGTH} characters`);
            }
        }
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
        if (data.sync_interval_minutes !== undefined) {
            if (typeof data.sync_interval_minutes !== 'number' ||
                data.sync_interval_minutes < types_1.SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.MIN_SYNC_INTERVAL ||
                data.sync_interval_minutes > types_1.SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.MAX_SYNC_INTERVAL) {
                errors.push(`Sync interval must be between ${types_1.SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.MIN_SYNC_INTERVAL} and ${types_1.SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.MAX_SYNC_INTERVAL} minutes`);
            }
        }
        if (data.cache_timeout_minutes !== undefined) {
            if (typeof data.cache_timeout_minutes !== 'number' ||
                data.cache_timeout_minutes < types_1.SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.MIN_CACHE_TIMEOUT ||
                data.cache_timeout_minutes > types_1.SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.MAX_CACHE_TIMEOUT) {
                errors.push(`Cache timeout must be between ${types_1.SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.MIN_CACHE_TIMEOUT} and ${types_1.SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.MAX_CACHE_TIMEOUT} minutes`);
            }
        }
        if (data.max_records_per_page !== undefined) {
            if (typeof data.max_records_per_page !== 'number' ||
                data.max_records_per_page < types_1.SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.MIN_RECORDS_PER_PAGE ||
                data.max_records_per_page > types_1.SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.MAX_RECORDS_PER_PAGE) {
                errors.push(`Max records per page must be between ${types_1.SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.MIN_RECORDS_PER_PAGE} and ${types_1.SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.MAX_RECORDS_PER_PAGE}`);
            }
        }
        if (data.smtp_port !== undefined) {
            if (typeof data.smtp_port !== 'number' ||
                data.smtp_port < types_1.SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.MIN_SMTP_PORT ||
                data.smtp_port > types_1.SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.MAX_SMTP_PORT) {
                errors.push(`SMTP port must be between ${types_1.SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.MIN_SMTP_PORT} and ${types_1.SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.MAX_SMTP_PORT}`);
            }
        }
        const booleanFields = [
            'enable_auto_sync', 'enable_notifications', 'enable_audit_log',
            'enable_advanced_search', 'backup_enabled'
        ];
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
    async getAllSysconfigs(options, userId) {
        try {
            const result = await this.sysconfigModel.findAllSysconfigs(options);
            return {
                success: true,
                data: result
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to get system configurations: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    async getByIdWithParsed(id, userId) {
        try {
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
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to get system configuration with parsed values: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    async getAllWithParsed(options, userId) {
        try {
            const result = await this.sysconfigModel.findAllWithParsed(options);
            return {
                success: true,
                data: result
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to get system configurations with parsed values: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    async getActiveConfig(userId) {
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
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to get active system configuration: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    async getActiveConfigWithParsed(userId) {
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
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to get active system configuration with parsed values: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    async updateSysconfig(id, data, userId) {
        try {
            console.log('🔧 updateSysconfig called - ID:', id, 'userId:', userId);
            console.log('📦 Update data:', JSON.stringify(data, null, 2));
            const validation = this.validate(data, 'update');
            console.log('🔍 Validation result:', validation);
            if (!validation.isValid) {
                console.error('❌ Validation failed:', validation.errors);
                return {
                    success: false,
                    error: `Validation failed: ${validation.errors.join(', ')}`
                };
            }
            const configFields = [
                'fvi_lot_qty', 'general_oqa_qty', 'crack_oqa_qty',
                'general_siv_qty', 'crack_siv_qty',
                'defect_type', 'shift', 'site', 'tabs',
                'product_type', 'product_families'
            ];
            const hasConfigUpdates = configFields.some(field => data[field] !== undefined);
            if (hasConfigUpdates) {
                const configValidation = await this.sysconfigModel.validateConfigurationValues?.(data) || { isValid: true, errors: [], warnings: [] };
                if (!configValidation.isValid) {
                    return {
                        success: false,
                        error: `Configuration validation failed: ${configValidation.errors.join(', ')}`
                    };
                }
                if (configValidation.warnings.length > 0) {
                    console.warn(`Sysconfig update warnings: ${configValidation.warnings.join(', ')}`);
                }
            }
            const entity = await this.sysconfigModel.update(id, data, userId);
            return {
                success: true,
                data: entity
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to update system configuration: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    parseConfigurationValues(sysconfig) {
        return (0, types_1.parseConfigurationValues)(sysconfig);
    }
    async testMssqlConnection(userId) {
        try {
            console.log('🔧 Testing MSSQL connection...');
            const activeConfig = await this.sysconfigModel.getActiveConfig();
            if (!activeConfig) {
                return {
                    success: false,
                    error: 'No active system configuration found'
                };
            }
            if (!activeConfig.mssql_server || !activeConfig.mssql_database || !activeConfig.mssql_username) {
                return {
                    success: false,
                    error: 'MSSQL configuration is incomplete. Please configure server, database, and username.'
                };
            }
            const mssqlModule = require('../../config/mssql');
            const pgPool = (0, database_1.getDatabasePool)();
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
            }
            else {
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
        }
        catch (error) {
            console.error('❌ Error testing MSSQL connection:', error);
            return {
                success: false,
                error: `Failed to test MSSQL connection: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    async testSmtpConnection(testEmail, userId) {
        const startTime = Date.now();
        let smtpHost = '';
        let smtpPort = 0;
        try {
            console.log('📧 Testing SMTP connection...');
            console.log(`🕐 Start time: ${new Date().toISOString()}`);
            const activeConfig = await this.sysconfigModel.getActiveConfig();
            if (!activeConfig) {
                console.error('❌ No active configuration found in database');
                return {
                    success: false,
                    error: 'No active system configuration found'
                };
            }
            if (!activeConfig.smtp_server) {
                console.error('❌ SMTP server not configured');
                return {
                    success: false,
                    error: 'SMTP configuration is incomplete. Please configure SMTP server address.'
                };
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!testEmail || !emailRegex.test(testEmail)) {
                console.error(`❌ Invalid test email: ${testEmail}`);
                return {
                    success: false,
                    error: 'Please provide a valid email address for testing'
                };
            }
            smtpHost = activeConfig.smtp_server;
            smtpPort = activeConfig.smtp_port || 587;
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
            console.log('🔍 Step 1: Testing network connectivity...');
            try {
                const net = require('net');
                const connectionTimeout = 10000;
                await new Promise((resolve, reject) => {
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
                    socket.on('error', (err) => {
                        socket.destroy();
                        reject(new Error(`Network connection failed - ${err.message}`));
                    });
                });
            }
            catch (netError) {
                console.error('❌ Network connectivity test failed:', netError);
                return {
                    success: false,
                    error: `Cannot reach SMTP server ${smtpHost}:${smtpPort}. ${netError instanceof Error ? netError.message : 'Network error'}. Please check: 1) Server address is correct, 2) Port is not blocked by firewall, 3) Server is online and accessible from this network.`
                };
            }
            const nodemailer = require('nodemailer');
            const transportConfig = {
                host: smtpHost,
                port: smtpPort,
                secure: smtpPort === 465,
                connectionTimeout: 30000,
                greetingTimeout: 10000,
                socketTimeout: 30000,
                tls: {
                    rejectUnauthorized: false
                }
            };
            if (requiresAuth) {
                transportConfig.auth = {
                    user: activeConfig.smtp_username,
                    pass: activeConfig.smtp_password,
                };
                console.log(`🔐 Authentication configured for user: ${activeConfig.smtp_username}`);
            }
            else {
                console.log('🔓 No authentication configured');
            }
            const transporter = nodemailer.createTransport(transportConfig);
            console.log('🔍 Step 2: Verifying SMTP protocol handshake...');
            await transporter.verify();
            console.log('✅ SMTP connection verified successfully');
            console.log(`🔍 Step 3: Sending test email to ${testEmail}...`);
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
        }
        catch (error) {
            const elapsedTime = Date.now() - startTime;
            console.error('='.repeat(80));
            console.error('❌ SMTP Connection Test FAILED');
            console.error(`   Server: ${smtpHost}:${smtpPort}`);
            console.error(`   Error Type: ${error instanceof Error ? error.constructor.name : 'Unknown'}`);
            console.error(`   Error Message: ${error instanceof Error ? error.message : 'Unknown error'}`);
            console.error(`   Total time: ${elapsedTime}ms`);
            console.error('='.repeat(80));
            let errorMessage = 'Failed to test SMTP connection';
            let errorDetails = '';
            if (error instanceof Error) {
                errorDetails = error.message;
                if (error.message.includes('EAUTH')) {
                    errorMessage = `Authentication failed for ${smtpHost}:${smtpPort}. Please check your SMTP username and password.`;
                }
                else if (error.message.includes('ECONNREFUSED')) {
                    errorMessage = `Connection refused by ${smtpHost}:${smtpPort}. The server rejected the connection. Please verify: 1) Port number is correct, 2) SMTP service is running, 3) Firewall allows the connection.`;
                }
                else if (error.message.includes('ETIMEDOUT')) {
                    errorMessage = `Connection timeout to ${smtpHost}:${smtpPort}. The server did not respond in time. Please check: 1) Server address is correct, 2) Network firewall rules, 3) Server is online.`;
                }
                else if (error.message.includes('ENOTFOUND')) {
                    errorMessage = `SMTP server ${smtpHost} not found. DNS lookup failed. Please verify the server address is correct.`;
                }
                else if (error.message.includes('ESOCKET')) {
                    errorMessage = `Socket error connecting to ${smtpHost}:${smtpPort}. ${error.message}`;
                }
                else if (error.message.includes('Invalid login')) {
                    errorMessage = `Invalid SMTP credentials for ${smtpHost}:${smtpPort}. Please check username and password.`;
                }
                else {
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
    validateCommaSeparatedNumbers(value, fieldName) {
        const errors = [];
        try {
            if (typeof value !== 'string') {
                errors.push(`${fieldName} must be a string`);
                return { isValid: false, errors };
            }
            const values = value.split(',').map(v => v.trim());
            const numbers = values.map(v => parseInt(v));
            const invalidNumbers = numbers.filter(n => isNaN(n));
            if (invalidNumbers.length > 0) {
                errors.push(`${fieldName} contains invalid numeric values`);
            }
            const negativeNumbers = numbers.filter(n => !isNaN(n) && n < 0);
            if (negativeNumbers.length > 0) {
                errors.push(`${fieldName} cannot contain negative values`);
            }
            const largeNumbers = numbers.filter(n => !isNaN(n) && n > types_1.SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.MAX_QTY_VALUE);
            if (largeNumbers.length > 0) {
                errors.push(`${fieldName} contains values that are too large (max: ${types_1.SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.MAX_QTY_VALUE})`);
            }
        }
        catch (error) {
            errors.push(`${fieldName} validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    validateCommaSeparatedStrings(value, fieldName, maxLength = 100) {
        const errors = [];
        try {
            if (typeof value !== 'string') {
                errors.push(`${fieldName} must be a string`);
                return { isValid: false, errors };
            }
            const values = value.split(',').map(v => v.trim());
            const emptyValues = values.filter(v => v.length === 0);
            if (emptyValues.length > 0) {
                errors.push(`${fieldName} contains empty values`);
            }
            const longValues = values.filter(v => v.length > maxLength);
            if (longValues.length > 0) {
                errors.push(`${fieldName} contains values longer than ${maxLength} characters`);
            }
        }
        catch (error) {
            errors.push(`${fieldName} validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
}
exports.SysconfigService = SysconfigService;
function createSysconfigService(model) {
    return new SysconfigService(model);
}
exports.default = SysconfigService;
