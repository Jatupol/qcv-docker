"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerSiteController = void 0;
exports.createCustomerSiteController = createCustomerSiteController;
exports.createCustomerSiteControllerGeneric = createCustomerSiteControllerGeneric;
const generic_controller_1 = require("../../generic/entities/special-entity/generic-controller");
const types_1 = require("./types");
class CustomerSiteController extends generic_controller_1.GenericSpecialController {
    constructor(service) {
        super(service, types_1.CUSTOMER_SITE_ENTITY_CONFIG);
        this.create = async (req, res, next) => {
            try {
                const userId = req.user.id;
                const createData = req.body;
                console.log(`🔧 Creating customer-site relationship:`, createData, `[User: ${userId}]`);
                const result = await this.customerSiteService.create(createData, userId);
                if (result.success && result.data) {
                    res.status(201).json({
                        success: true,
                        data: result.data,
                        message: 'Customer-site relationship created successfully'
                    });
                }
                else {
                    res.status(400).json({
                        success: false,
                        message: result.error || 'Failed to create customer-site relationship',
                        error: 'CREATE_FAILED'
                    });
                }
            }
            catch (error) {
                console.error('❌ Error creating customer-site relationship:', error);
                next(error);
            }
        };
        this.update = async (req, res, next) => {
            try {
                const userId = req.user.id;
                const keyValues = req.params;
                const updateData = req.body;
                console.log(`🔧 Updating customer-site relationship:`, keyValues, updateData, `[User: ${userId}]`);
                const result = await this.customerSiteService.update(keyValues, updateData, userId);
                if (result.success && result.data) {
                    res.status(200).json({
                        success: true,
                        data: result.data,
                        message: 'Customer-site relationship updated successfully'
                    });
                }
                else if (result.error === 'Customer-Site relationship not found') {
                    res.status(404).json({
                        success: false,
                        message: 'Customer-site relationship not found',
                        error: 'NOT_FOUND'
                    });
                }
                else {
                    res.status(400).json({
                        success: false,
                        message: result.error || 'Failed to update customer-site relationship',
                        error: 'UPDATE_FAILED'
                    });
                }
            }
            catch (error) {
                console.error('❌ Error updating customer-site relationship:', error);
                next(error);
            }
        };
        this.delete = async (req, res, next) => {
            try {
                const userId = req.user.id;
                const keyValues = req.params;
                console.log(`🗑️ Deleting customer-site relationship:`, keyValues, `[User: ${userId}]`);
                const result = await this.customerSiteService.delete(keyValues, userId, req.user ?? null, req);
                if (result.success) {
                    res.status(200).json({
                        success: true,
                        message: 'Customer-site relationship deleted successfully'
                    });
                }
                else if (result.error === 'Customer-Site relationship not found') {
                    res.status(404).json({
                        success: false,
                        message: 'Customer-site relationship not found',
                        error: 'NOT_FOUND'
                    });
                }
                else {
                    res.status(400).json({
                        success: false,
                        message: result.error || 'Failed to delete customer-site relationship',
                        error: 'DELETE_FAILED'
                    });
                }
            }
            catch (error) {
                console.error('❌ Error deleting customer-site relationship:', error);
                next(error);
            }
        };
        this.getAll = async (req, res, next) => {
            try {
                const userId = req.user.id;
                let sortBy = req.query.sortBy || 'created_at';
                if (sortBy === 'composite_key') {
                    sortBy = 'code';
                }
                const queryParams = {
                    page: parseInt(req.query.page) || 1,
                    limit: parseInt(req.query.limit) || 20,
                    search: req.query.search,
                    sortBy: sortBy,
                    sortOrder: req.query.sortOrder || 'ASC',
                    isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
                    customerCode: req.query.customerCode,
                    siteCode: req.query.siteCode
                };
                console.log(`📋 Getting customer-site relationships:`, queryParams, `[User: ${userId}]`);
                const result = await this.customerSiteService.getAll();
                if (result.success && result.data) {
                    res.status(200).json({
                        success: true,
                        data: result.data,
                        message: 'Customer-site relationships retrieved successfully'
                    });
                }
                else {
                    res.status(400).json({
                        success: false,
                        message: result.error || 'Failed to get customer-site relationships',
                        error: 'GET_ALL_FAILED'
                    });
                }
            }
            catch (error) {
                console.error('❌ Error getting customer-site relationships:', error);
                next(error);
            }
        };
        this.getByCustomer = async (req, res, next) => {
            try {
                const userId = req.user.id;
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
                }
                else {
                    res.status(400).json({
                        success: false,
                        message: result.error || 'Failed to get sites for customer',
                        error: 'GET_BY_CUSTOMER_FAILED'
                    });
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.getBySite = async (req, res, next) => {
            try {
                const userId = req.user.id;
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
                }
                else {
                    res.status(400).json({
                        success: false,
                        message: result.error || 'Failed to get customers for site',
                        error: 'GET_BY_SITE_FAILED'
                    });
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.getByKey = async (req, res, next) => {
            try {
                const userId = req.user.id;
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
                }
                else if (result.error === 'Customer-Site relationship not found') {
                    res.status(404).json({
                        success: false,
                        message: 'Customer-site relationship not found',
                        error: 'NOT_FOUND'
                    });
                }
                else {
                    res.status(400).json({
                        success: false,
                        message: result.error || 'Failed to get customer-site relationship',
                        error: 'LOOKUP_FAILED'
                    });
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.checkRelationshipExists = async (req, res, next) => {
            try {
                const userId = req.user.id;
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
                }
                else {
                    res.status(400).json({
                        success: false,
                        message: result.error || 'Failed to check relationship',
                        error: 'CHECK_FAILED'
                    });
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.generateSuggestedCode = async (req, res, next) => {
            try {
                const userId = req.user.id;
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
                }
                else {
                    res.status(400).json({
                        success: false,
                        message: result.error || 'Failed to generate code suggestion',
                        error: 'GENERATION_FAILED'
                    });
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.customerSiteService = service;
    }
    extractPrimaryKeyValues(params) {
        return {
            code: params.code
        };
    }
}
exports.CustomerSiteController = CustomerSiteController;
function createCustomerSiteController(service) {
    return new CustomerSiteController(service);
}
function createCustomerSiteControllerGeneric(service) {
    return new CustomerSiteController(service);
}
exports.default = CustomerSiteController;
