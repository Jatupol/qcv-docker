"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SysconfigController = void 0;
exports.createSysconfigController = createSysconfigController;
const generic_controller_1 = require("../../generic/entities/serial-id-entity/generic-controller");
const types_1 = require("./types");
class SysconfigController extends generic_controller_1.GenericSerialIdController {
    constructor(service) {
        super(service, types_1.SYSCONFIG_ENTITY_CONFIG);
        this.getByIdWithParsed = async (req, res, next) => {
            try {
                const qcReq = req;
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
                }
                else if (result.error?.includes('not found')) {
                    this.sendSysconfigErrorResponse(res, 404, result.error);
                }
                else {
                    this.sendSysconfigErrorResponse(res, 400, result.error || 'Failed to get system configuration with parsed values');
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.getAllWithParsed = async (req, res, next) => {
            try {
                const qcReq = req;
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
                }
                else {
                    this.sendSysconfigErrorResponse(res, 400, result.error || 'Failed to get system configurations with parsed values');
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.getActiveConfig = async (req, res, next) => {
            try {
                const qcReq = req;
                const userId = qcReq.user?.id || 0;
                const result = await this.sysconfigService.getActiveConfig(userId);
                if (result.success && result.data) {
                    this.sendSysconfigSuccessResponse(res, result.data, 'Active system configuration retrieved successfully');
                }
                else if (result.error?.includes('not found')) {
                    this.sendSysconfigErrorResponse(res, 404, result.error);
                }
                else {
                    this.sendSysconfigErrorResponse(res, 400, result.error || 'Failed to get active system configuration');
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.getActiveConfigWithParsed = async (req, res, next) => {
            try {
                const qcReq = req;
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
                }
                else if (result.error?.includes('not found')) {
                    this.sendSysconfigErrorResponse(res, 404, result.error);
                }
                else {
                    this.sendSysconfigErrorResponse(res, 400, result.error || 'Failed to get active system configuration with parsed values');
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.activateConfig = async (req, res, next) => {
            try {
                const qcReq = req;
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
                }
                else if (result.error?.includes('not found')) {
                    this.sendSysconfigErrorResponse(res, 404, result.error);
                }
                else {
                    this.sendSysconfigErrorResponse(res, 400, result.error || 'Failed to activate system configuration');
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.testMssqlConnection = async (req, res, next) => {
            try {
                console.log('📥 POST /api/sysconfig/test-mssql - Testing MSSQL connection');
                const qcReq = req;
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
                }
                else {
                    console.log('❌ MSSQL connection test failed:', result.error);
                    res.status(400).json({
                        success: false,
                        message: 'MSSQL connection test failed',
                        error: result.error
                    });
                }
            }
            catch (error) {
                console.error('❌ Error in testMssqlConnection controller:', error);
                res.status(500).json({
                    success: false,
                    message: 'Internal server error during MSSQL connection test',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        };
        this.testSmtpConnection = async (req, res, next) => {
            try {
                const method = req.method;
                console.log(`📥 ${method} /api/sysconfig/test-smtp - Testing SMTP connection`);
                const qcReq = req;
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
                const testEmail = method === 'GET'
                    ? req.query.testEmail
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
                }
                else {
                    console.log('❌ SMTP connection test failed:', result.error);
                    res.status(400).json({
                        success: false,
                        message: 'SMTP connection test failed',
                        error: result.error
                    });
                }
            }
            catch (error) {
                console.error('❌ Error in testSmtpConnection controller:', error);
                res.status(500).json({
                    success: false,
                    message: 'Internal server error during SMTP connection test',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        };
        this.getAll = async (req, res, next) => {
            try {
                const qcReq = req;
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
                }
                else {
                    this.sendSysconfigErrorResponse(res, 400, result.error || 'Failed to get system configurations');
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.update = async (req, res, next) => {
            try {
                console.log('🎯 Controller.update - PUT /api/sysconfig/:id');
                console.log('📥 Request params:', req.params);
                console.log('📥 Request body keys:', Object.keys(req.body));
                console.log('📥 Request body:', JSON.stringify(req.body, null, 2));
                const qcReq = req;
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
                const isValid = (0, types_1.isUpdateSysconfigRequest)(req.body);
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
                }
                else if (result.error?.includes('not found')) {
                    this.sendSysconfigErrorResponse(res, 404, result.error);
                }
                else {
                    this.sendSysconfigErrorResponse(res, 400, result.error || 'Failed to update system configuration');
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.create = async (req, res, next) => {
            try {
                const qcReq = req;
                if (!qcReq.user) {
                    res.status(401).json({
                        success: false,
                        error: 'Authentication required',
                        code: 'NO_USER'
                    });
                    return;
                }
                const userId = qcReq.user.id;
                if (!(0, types_1.isCreateSysconfigRequest)(req.body)) {
                    this.sendSysconfigErrorResponse(res, 400, 'Invalid system configuration creation data');
                    return;
                }
                const result = await this.sysconfigService.create(req.body, userId);
                if (result.success && result.data) {
                    this.sendSysconfigSuccessResponse(res, result.data, 'System configuration created successfully', 201);
                }
                else {
                    this.sendSysconfigErrorResponse(res, 400, result.error || 'Failed to create system configuration');
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.sysconfigService = service;
    }
    sendSysconfigSuccessResponse(res, data, message, statusCode = 200) {
        const response = {
            success: true,
            data,
            ...(message && { message })
        };
        res.status(statusCode).json(response);
    }
    sendSysconfigErrorResponse(res, statusCode, error) {
        const response = {
            success: false,
            error
        };
        res.status(statusCode).json(response);
    }
    parseSysconfigQueryOptions(query) {
        const options = {};
        if (query.page) {
            const page = parseInt(query.page);
            if (!isNaN(page) && page > 0) {
                options.page = page;
            }
        }
        if (query.limit) {
            const limit = parseInt(query.limit);
            if (!isNaN(limit) && limit > 0) {
                options.limit = Math.min(limit, this.config.maxLimit);
            }
        }
        if (query.sortBy && typeof query.sortBy === 'string') {
            options.sortBy = query.sortBy.trim();
        }
        if (query.sortOrder && typeof query.sortOrder === 'string') {
            const sortOrder = query.sortOrder.toUpperCase();
            if (sortOrder === 'ASC' || sortOrder === 'DESC') {
                options.sortOrder = sortOrder;
            }
        }
        if (query.search && typeof query.search === 'string') {
            const search = query.search.trim();
            if (search.length > 0) {
                options.search = search;
            }
        }
        if (query.isActive !== undefined) {
            if (query.isActive === 'true') {
                options.isActive = true;
            }
            else if (query.isActive === 'false') {
                options.isActive = false;
            }
        }
        if (query.config_name && typeof query.config_name === 'string') {
            const configName = query.config_name.trim();
            if (configName.length > 0) {
                options.config_name = configName;
            }
        }
        if (query.system_name && typeof query.system_name === 'string') {
            const systemName = query.system_name.trim();
            if (systemName.length > 0) {
                options.system_name = systemName;
            }
        }
        if (query.enable_auto_sync !== undefined) {
            if (query.enable_auto_sync === 'true') {
                options.enable_auto_sync = true;
            }
            else if (query.enable_auto_sync === 'false') {
                options.enable_auto_sync = false;
            }
        }
        if (query.enable_notifications !== undefined) {
            if (query.enable_notifications === 'true') {
                options.enable_notifications = true;
            }
            else if (query.enable_notifications === 'false') {
                options.enable_notifications = false;
            }
        }
        if (query.enable_audit_log !== undefined) {
            if (query.enable_audit_log === 'true') {
                options.enable_audit_log = true;
            }
            else if (query.enable_audit_log === 'false') {
                options.enable_audit_log = false;
            }
        }
        if (query.enable_advanced_search !== undefined) {
            if (query.enable_advanced_search === 'true') {
                options.enable_advanced_search = true;
            }
            else if (query.enable_advanced_search === 'false') {
                options.enable_advanced_search = false;
            }
        }
        if (query.has_inf_server !== undefined) {
            if (query.has_inf_server === 'true') {
                options.has_inf_server = true;
            }
            else if (query.has_inf_server === 'false') {
                options.has_inf_server = false;
            }
        }
        if (query.has_smtp_server !== undefined) {
            if (query.has_smtp_server === 'true') {
                options.has_smtp_server = true;
            }
            else if (query.has_smtp_server === 'false') {
                options.has_smtp_server = false;
            }
        }
        if (query.backup_enabled !== undefined) {
            if (query.backup_enabled === 'true') {
                options.backup_enabled = true;
            }
            else if (query.backup_enabled === 'false') {
                options.backup_enabled = false;
            }
        }
        return options;
    }
    validateConfigId(idParam) {
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
exports.SysconfigController = SysconfigController;
function createSysconfigController(service) {
    return new SysconfigController(service);
}
exports.default = SysconfigController;
