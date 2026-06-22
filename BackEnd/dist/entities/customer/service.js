"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerService = void 0;
exports.createCustomerService = createCustomerService;
exports.createCustomerServiceGeneric = createCustomerServiceGeneric;
const generic_service_1 = require("../../generic/entities/varchar-code-entity/generic-service");
const types_1 = require("./types");
class CustomerService extends generic_service_1.GenericVarcharCodeService {
    constructor(model) {
        super(model, types_1.CustomerEntityConfig);
        this.model = model;
    }
    async checkCodeAvailability(code, userId) {
        try {
            const reasons = [];
            const suggestions = [];
            if (!code || code.trim().length === 0) {
                reasons.push('Code cannot be empty');
                return {
                    success: true,
                    data: { available: false, reasons, suggestions }
                };
            }
            const trimmedCode = code.trim().toUpperCase();
            if (trimmedCode.length > types_1.CustomerConstants.CODE_MAX_LENGTH) {
                reasons.push(`Code cannot exceed ${types_1.CustomerConstants.CODE_MAX_LENGTH} characters`);
            }
            if (trimmedCode.length < types_1.CustomerConstants.CODE_MIN_LENGTH) {
                reasons.push(`Code must be at least ${types_1.CustomerConstants.CODE_MIN_LENGTH} character`);
            }
            if (!types_1.CustomerConstants.CODE_PATTERN.test(trimmedCode)) {
                reasons.push('Code can only contain letters and numbers');
            }
            if (reasons.length > 0) {
                return {
                    success: true,
                    data: { available: false, reasons, suggestions }
                };
            }
            const isAvailable = await this.model.isCodeAvailable(trimmedCode);
            if (!isAvailable) {
                reasons.push('Code is already in use');
                const similarCodes = await this.model.findSimilarCodes(trimmedCode);
                suggestions.push(...similarCodes);
            }
            return {
                success: true,
                data: {
                    available: isAvailable,
                    reasons,
                    suggestions
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to check code availability: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    async getByCodePrefix(codePrefix, userId, limit = 10) {
        try {
            if (!codePrefix || codePrefix.trim().length === 0) {
                return {
                    success: false,
                    error: 'Code prefix cannot be empty'
                };
            }
            if (limit < 1 || limit > 50) {
                return {
                    success: false,
                    error: 'Limit must be between 1 and 50'
                };
            }
            const customers = await this.model.findByCodePrefix(codePrefix.trim().toUpperCase(), limit);
            return {
                success: true,
                data: customers
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to search customers by code prefix: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    async canDelete(code) {
        try {
            const customerResult = await this.getByCode(code);
            if (!customerResult.success || !customerResult.data) {
                return {
                    success: false,
                    error: 'Customer not found'
                };
            }
            const relationshipCounts = await this.model.getRelationshipCounts?.(code) || { customerSites: 0, parts: 0, inspectionData: 0, defectData: 0 };
            const reasons = [];
            if (relationshipCounts.customerSites > 0) {
                reasons.push(`Customer has ${relationshipCounts.customerSites} customer-site relationships`);
            }
            if (relationshipCounts.parts > 0) {
                reasons.push(`Customer has ${relationshipCounts.parts} associated parts`);
            }
            const canDelete = reasons.length === 0;
            return {
                success: true,
                data: {
                    canDelete,
                    reasons,
                    relationshipCounts
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to check deletion eligibility: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    validate(data, operation) {
        const genericResult = super.validate(data, operation);
        const customerErrors = [...genericResult.errors];
        if (operation === 'create') {
            if (data.code) {
                const normalizedCode = data.code.trim().toUpperCase();
                if (!types_1.CustomerConstants.CODE_PATTERN.test(normalizedCode)) {
                    customerErrors.push('Code can only contain letters and numbers');
                }
                if (normalizedCode.length > types_1.CustomerConstants.CODE_MAX_LENGTH) {
                    customerErrors.push(`Code cannot exceed ${types_1.CustomerConstants.CODE_MAX_LENGTH} characters`);
                }
            }
        }
        if (data.name && data.name.trim().length > types_1.CustomerConstants.NAME_MAX_LENGTH) {
            customerErrors.push(`Name cannot exceed ${types_1.CustomerConstants.NAME_MAX_LENGTH} characters`);
        }
        return {
            isValid: customerErrors.length === 0,
            errors: customerErrors
        };
    }
    async isCustomerOperational(code) {
        try {
            const customerResult = await this.getByCode(code);
            if (!customerResult.success || !customerResult.data) {
                return {
                    success: true,
                    data: {
                        operational: false,
                        status: 'not_found',
                        reasons: ['Customer not found']
                    }
                };
            }
            const customer = customerResult.data;
            const reasons = [];
            if (!customer.is_active) {
                reasons.push('Customer is marked as inactive');
            }
            const operational = customer.is_active && reasons.length === 0;
            return {
                success: true,
                data: {
                    operational,
                    status: customer.is_active ? 'active' : 'inactive',
                    reasons
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to check customer operational status: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
}
exports.CustomerService = CustomerService;
function createCustomerService(model) {
    return new CustomerService(model);
}
function createCustomerServiceGeneric(model) {
    return (0, generic_service_1.createVarcharCodeService)(model, types_1.CustomerEntityConfig);
}
exports.default = CustomerService;
