"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerSiteService = void 0;
exports.createCustomerSiteService = createCustomerSiteService;
exports.createCustomerSiteServiceGeneric = createCustomerSiteServiceGeneric;
const generic_service_1 = require("../../generic/entities/special-entity/generic-service");
const types_1 = require("./types");
class CustomerSiteService extends generic_service_1.GenericSpecialService {
    constructor(model) {
        super(model, types_1.CUSTOMER_SITE_ENTITY_CONFIG);
        this.customerSiteModel = model;
    }
    async getByKey(keyValues, userId) {
        try {
            const validation = this.validateSingleKey(keyValues);
            if (!validation.isValid) {
                return {
                    success: false,
                    error: validation.errors.join(', ')
                };
            }
            const relationship = await this.customerSiteModel.getByKey(keyValues);
            if (!relationship) {
                return {
                    success: false,
                    error: 'Customer-Site relationship not found'
                };
            }
            return {
                success: true,
                data: relationship
            };
        }
        catch (error) {
            console.error('CustomerSite getByKey error:', error);
            return {
                success: false,
                error: error.message || 'Failed to get customer-site relationship'
            };
        }
    }
    parseKey(keyInput) {
        if (typeof keyInput === 'object' && keyInput !== null) {
            const { code } = keyInput;
            return { code };
        }
        if (typeof keyInput === 'string') {
            return {
                code: keyInput.trim()
            };
        }
        throw new Error('Invalid key format. Expected object with code, or string "CODE"');
    }
    formatKey(keyValues) {
        const { code } = keyValues;
        if (!code) {
            throw new Error('Code is required for formatting key');
        }
        return code.toString();
    }
    async create(data, userId) {
        try {
            console.log(`🔧 Creating new customer-site relationship...`);
            const validation = this.validateData(data, 'create');
            if (!validation.isValid) {
                return {
                    success: false,
                    error: `Validation failed: ${validation.errors.join(', ')}`
                };
            }
            const entityData = {
                ...data,
                created_by: userId,
                updated_by: userId,
                created_at: new Date(),
                updated_at: new Date(),
                is_active: true
            };
            const result = await this.customerSiteModel.create(entityData);
            if (result.success && result.data) {
                console.log(`✅ Customer-site relationship created successfully`);
                return {
                    success: true,
                    data: result.data
                };
            }
            else {
                return {
                    success: false,
                    error: result.error || 'Failed to create customer-site relationship'
                };
            }
        }
        catch (error) {
            console.error(`❌ Error creating customer-site relationship:`, error);
            return {
                success: false,
                error: `Failed to create customer-site relationship: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    async update(keyValues, data, userId) {
        try {
            console.log(`🔧 Updating customer-site relationship...`);
            const keyValidation = this.validatePrimaryKey(keyValues);
            if (!keyValidation.isValid) {
                return {
                    success: false,
                    error: `Invalid key provided: ${keyValidation.errors.join(', ')}`
                };
            }
            const validation = this.validateData(data, 'update');
            if (!validation.isValid) {
                return {
                    success: false,
                    error: `Validation failed: ${validation.errors.join(', ')}`
                };
            }
            const updateData = {
                ...data,
                updated_by: userId,
                updated_at: new Date()
            };
            const result = await this.customerSiteModel.update(keyValues, updateData);
            if (result.success && result.data) {
                console.log(`✅ Customer-site relationship updated successfully`);
                return {
                    success: true,
                    data: result.data
                };
            }
            else {
                return {
                    success: false,
                    error: result.error || 'Failed to update customer-site relationship'
                };
            }
        }
        catch (error) {
            console.error(`❌ Error updating customer-site relationship:`, error);
            return {
                success: false,
                error: `Failed to update customer-site relationship: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    async delete(keyValues, userId, actor, req) {
        try {
            console.log(`🗑️ Deleting customer-site relationship...`);
            const keyValidation = this.validatePrimaryKey(keyValues);
            if (!keyValidation.isValid) {
                return {
                    success: false,
                    error: `Invalid key provided: ${keyValidation.errors.join(', ')}`
                };
            }
            const result = await this.customerSiteModel.delete(keyValues, actor ?? null, req);
            if (result.success) {
                console.log(`✅ Customer-site relationship deleted successfully`);
                return {
                    success: true,
                    data: true
                };
            }
            else {
                return {
                    success: false,
                    error: result.error || 'Failed to delete customer-site relationship'
                };
            }
        }
        catch (error) {
            console.error(`❌ Error deleting customer-site relationship:`, error);
            return {
                success: false,
                error: `Failed to delete customer-site relationship: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    validateData(data, operation) {
        const errors = [];
        if (operation === 'create') {
            if (!data.code?.trim()) {
                errors.push('Code is required');
            }
            if (!data.customers?.trim()) {
                errors.push('Customer is required');
            }
            if (!data.site?.trim()) {
                errors.push('Site is required');
            }
        }
        const customValidation = this.validateEntitySpecific(data, operation);
        errors.push(...customValidation);
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    validatePrimaryKey(keyValues) {
        const errors = [];
        if (!keyValues.code?.trim()) {
            errors.push('Code is required');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    validateSingleKey(keyValues) {
        const errors = [];
        if (!keyValues.code) {
            errors.push('code is required');
        }
        else if (typeof keyValues.code !== 'string') {
            errors.push('code must be a string');
        }
        else if (keyValues.code.trim().length === 0) {
            errors.push('code cannot be empty');
        }
        else if (keyValues.code.length > 10) {
            errors.push('code cannot exceed 10 characters');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    async getAll() {
        try {
            const data = await this.customerSiteModel.getAll();
            return {
                success: true,
                data: data
            };
        }
        catch (error) {
            console.error('CustomerSite getByCustomer error:', error);
            return {
                success: false,
                error: error.message || 'Failed to get sites for customer'
            };
        }
    }
    async getByCustomer(customerCode, userId) {
        try {
            if (!customerCode || customerCode.trim().length === 0) {
                return {
                    success: false,
                    error: 'Customer code is required'
                };
            }
            const relationships = await this.customerSiteModel.getByCustomer(customerCode);
            return {
                success: true,
                data: relationships
            };
        }
        catch (error) {
            console.error('CustomerSite getByCustomer error:', error);
            return {
                success: false,
                error: error.message || 'Failed to get sites for customer'
            };
        }
    }
    async getBySite(siteCode, userId) {
        try {
            if (!siteCode || siteCode.trim().length === 0) {
                return {
                    success: false,
                    error: 'Site code is required'
                };
            }
            const relationships = await this.customerSiteModel.getBySite(siteCode);
            return {
                success: true,
                data: relationships
            };
        }
        catch (error) {
            console.error('CustomerSite getBySite error:', error);
            return {
                success: false,
                error: error.message || 'Failed to get customers for site'
            };
        }
    }
    async checkRelationshipExists(code, userId) {
        try {
            const keyValues = { code };
            const exists = await this.customerSiteModel.exists(keyValues);
            return {
                success: true,
                data: exists
            };
        }
        catch (error) {
            console.error('CustomerSite checkRelationshipExists error:', error);
            return {
                success: false,
                error: error.message || 'Failed to check relationship existence'
            };
        }
    }
    async generateSuggestedCode(customerCode, siteCode, userId) {
        try {
            const suggestedCode = `${customerCode}_${siteCode}`.toUpperCase();
            return {
                success: true,
                data: suggestedCode
            };
        }
        catch (error) {
            console.error('CustomerSite generateSuggestedCode error:', error);
            return {
                success: false,
                error: error.message || 'Failed to generate suggested code'
            };
        }
    }
    validateEntitySpecific(data, operation) {
        const errors = [];
        if (operation === 'create') {
            if (!data.code) {
                errors.push('code is required');
            }
            else if (typeof data.code !== 'string') {
                errors.push('code must be a string');
            }
            else if (data.code.length > 10) {
                errors.push('code cannot exceed 10 characters');
            }
            if (!data.customers) {
                errors.push('customers is required');
            }
            else if (typeof data.customers !== 'string') {
                errors.push('customers must be a string');
            }
            else if (data.customers.length > 5) {
                errors.push('customers cannot exceed 5 characters');
            }
            if (!data.site) {
                errors.push('site is required');
            }
            else if (typeof data.site !== 'string') {
                errors.push('site must be a string');
            }
            else if (data.site.length > 5) {
                errors.push('site cannot exceed 5 characters');
            }
        }
        return errors;
    }
}
exports.CustomerSiteService = CustomerSiteService;
function createCustomerSiteService(model) {
    return new CustomerSiteService(model);
}
function createCustomerSiteServiceGeneric(model) {
    return new CustomerSiteService(model);
}
exports.default = CustomerSiteService;
